const cacheName = "spekti-v9";
const path = "/spekti/";
const contentToCache = [
path+"",
path+"index.html",
path+"manifest.json",
path+"spekti.css",
path+"logo/192.png",
path+"logo/512.png",
path+"logo/favicon.ico",
path+"logo/logo.svg",
path+"logo/maskable.png",
"/octicons-sprite/octicons-sprite.svg",
"https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",
];
console.log = () => {};
let messages = [];

let clearCache = (force=false) => {
  console.log("Clearing cache...");
  if (!force) {
    console.log("Cache to keep:",cacheName);
  }
  caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if ((cacheName.indexOf(key) < 0) || (force)) {
        return caches.delete(key);
      }
    }));
  });
}

let Message = class {
  constructor(content) {
    this.content = content;
    this.id = (messages.sort((a,b) => b.id - a.id)[0] || {id:0}).id+1;
    this.content.id = this.id;
    this.responseReceived = {};
    this.response = new Promise((resolve,reject) => {
      this.responseReceived = resolve;
    });
    messages.push(this);
  }
  async send() {
    console.log("sending message",this.content);
    self.clients.matchAll().then((clients) => {
      if (clients && clients.length) {
        clients.map(client => {
          client.postMessage(JSON.stringify(this.content));
        })
      }
    });
    let response = await this.response;
    messages = messages.filter(e => e.id !== this.id);
    return response;
  }
}

let localStorage = async (method,key=false,body=false) => {
  let message = new Message({method,key,body});
  message = await message.send();
  return message.body;
}

let fetchHandler = (request) => {
  if ((request.method == "PATCH") //intercept PATCH requests to save body before sending them
  && (request.url.indexOf("api.github.com/gists/") > 0)) {
    console.log("Intercepting patch request");
    request.clone().text().then(json => {
      json = JSON.parse(json);
      Object.keys(json.files).map(key => {
        localStorage("SET",key,json.files[key].content);
      });
    });
  }
  return caches.match(request).then((r) => {
    if ((r)
    && (request.url.indexOf("api.github.com") < 0)
    && (request.url.indexOf(path+"online") < 0)
    && (!request.headers.has("spekti-no-cache"))) { //serve cached resources except RSS feeds & github api responses
      console.log("Serving cached resource",request.url);
      return r;
    } else { //when resource not in cache
      return fetch(request).then((response) => {
        console.log("trying to fetch",request.url);
        if ((response.status >= 200) && (response.status < 300)) {
          return caches.open(cacheName).then((cache) => {
            if (request.url.indexOf(path+"online") >= 0) {
              console.log("intercepting connectivity request");
              return response.clone().text().then(text => {
                return new Response("true",response);
              });
            }
            if ((request.url.indexOf("api.github.com/gists/") > 0)
            && (request.method == "GET")) {
              console.log("intercepting gist request to fill localstorage");
              response.clone().json().then(json => {
                Object.keys(json.files).map(key => {
                  localStorage("SET",key,json.files[key].content);
                })
              });
            }
            if (request.method != "PATCH") {
              console.log("Caching newly fetched resource:",request.url);
              cache.put(request, response.clone());
            }
            return response;
          });
        } else {
          return response;
        }
      }).catch(() => {
        return caches.match(request,{ignoreVary:true}).then((r) => { //when offline, always try to serve cached resource
          console.log("offline fallback");
          if (request.url.indexOf(path+"online") >= 0) {
            console.log("intercepting connectivity request / offline");
            return new Response("false",r);
          }
          if (r) {
            if (request.url.indexOf("api.github.com/gists/") > 0) {
              if (request.method == "GET") {
                console.log("serving localStorage to mimic gist API");
                return localStorage("GET").then(storage => {
                  return r.json().then(json => {
                    Object.keys(json.files).map(key => {
                      json.files[key].content = storage[key];
                    });
                    return new Response(JSON.stringify(json),r);
                  });
                });
              }
            } else {
              console.log("Serving cached resource",request.url);
              return r;
            }
          }
          return new Response("Not found", { status: 404 });
        });
      });
    }
  });
};

let syncGistStorage = () => {
  console.log("sync now !");
  return new Promise((resolve,reject) => {
    localStorage("GET").then(storage => {
      if ((storage.login === "") || (storage.gist === "")) {
        reject(true);
      } else {
        let gist = {};
        ["notes","rss","tags"].map(key => {
          if (storage[key] !== "") {
            gist[key] = { content:storage[key] }
          }
        });
        if (Object.keys(gist).length > 0) {
          let headers = {
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "Authorization": "token "+storage.login
          };
          fetch("https://api.github.com/gists/"+storage.gist, {
            headers: headers,
            method: "PATCH",
            body: JSON.stringify({files:gist})
          }).then(response => {
            resolve(response);
          });
        } else {
          reject(true);
        }
      }
    });
  });
};

let checkCache = async () => {
  let cacheSize = await (async () => {
    const cacheNames = await caches.keys();
    let total = 0;
    const sizePromises = cacheNames.map(async cacheName => {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      let cacheSize = 0;

      await Promise.all(keys.map(async key => {
        const response = await cache.match(key);
        const blob = await response.blob();
        total += blob.size;
        cacheSize += blob.size;
      }));
    });
    await Promise.all(sizePromises);
    return total;
  })();
  console.log("Cache Size is:",cacheSize);
  if (cacheSize > 100000000) {
    clearCache(true);
  }
}

self.addEventListener("install", (e) => {
  console.log("Installation");
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("Global caching");
      return cache.addAll(contentToCache);
    })
  );
});
self.addEventListener("fetch", (e) => {
  e.respondWith(fetchHandler(e.request));
});
self.addEventListener("sync", (e) => {
  if (e.tag == "gistSync") {
    e.waitUntil(syncGistStorage());
  }
});
self.addEventListener("activate", (e) => {
  console.log("Activated !");
  clearCache();
});
self.addEventListener("message", async (e) => {
  console.log("message received",e.data);
  let data = JSON.parse(e.data)
  if (typeof data.online !== "undefined") {
    if (data.online) {
      let wasOnline = (await localStorage("GET")).status;
      if (wasOnline === "false") {
        console.log("back online! let's sync");
        await syncGistStorage();
      }
    }
    console.log("setting online status",data.online);
    localStorage("SET","status",data.online);
  } else {
    messages.find(e => e.id == data.id).responseReceived(data);
  }
});
