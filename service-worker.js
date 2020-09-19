let cacheName = "spekti-cache";
let contentToCache = [
"/spekti/",
"/spekti/online",
"/spekti/spekti.js",
"/spekti/rss.js",
"/spekti/reader.js",
"/spekti/article.vue.js",
"/spekti/hello.all.min.js",
"/spekti/home.vue.js",
"/spekti/index.html",
"/spekti/main.vue.js",
"/spekti/manifest.json",
"/spekti/modal.vue.js",
"/spekti/notesabout.vue.js",
"/spekti/notes.vue.js",
"/spekti/sources.vue.js",
"/spekti/spekti.css",
"/spekti/tagbar.vue.js",
"/spekti/tagsabout.vue.js",
"/spekti/tags.vue.js",
"/spekti/tag.vue.js",
"/spekti/logo/192.png",
"/spekti/logo/512.png",
"/spekti/logo/favicon.ico",
"/spekti/logo/logo.svg",
"/spekti/logo/maskable.png",
"https://corbin-c.github.io/datagists/DataGists.js",
"https://corbin-c.github.io/readability/Readability.js",
"https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",
"https://cdn.jsdelivr.net/npm/vue/dist/vue.js"
];

let messages = [];

let clearCache = (force=false) => {
  console.log("[SPEKTI SW] Clearing cache...");
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

let localStorage = async (method,key=false,body=false,init=false) => {
  let message = new Message({method,key,body,init});
  message = await message.send();
  return message.body;
}

let fetchHandler = (request) => {
  if ((request.method == "PATCH") //intercept PATCH requests to save body before sending them
  && (request.url.indexOf("api.github.com/gists/") > 0)) {
    request.clone().text().then(json => {
      json = JSON.parse(json);
      Object.keys(json.files).map(key => {
        localStorage("SET",key,json.files[key].content);
      });
    });
  }
  if (request.url.indexOf("/spekti/online") < 0) { //all requests except special "online" request, used to test connectivty
    return caches.match(request).then((r) => {
      //~ console.log("[SPEKTI SW] Fetching...: "+request.url);
      if ((r)
      && (request.url.indexOf("api.github.com") < 0)
      && (!request.headers.has("spekti-no-cache"))) { //serve cached resources except RSS feeds & github api responses
        //~ console.log("[SPEKTI SW] Serving cached resource...: "+request.url);
        return r;
      } else { //when resource not in cache
        return fetch(request).then((response) => {
          if ((response.status >= 200) && (response.status < 300)) {
            return caches.open(cacheName).then((cache) => {
              //~ console.log("[SPEKTI SW] Caching newly fetched resource: "+request.url);
              if ((request.url.indexOf("api.github.com/gists/") > 0)
              && (request.method == "GET")) {
                response.clone().json().then(json => {
                  Object.keys(json.files).map(key => {
                    localStorage("SET",key,json.files[key].content,true);
                  })
                  return localStorage("GET").then(storage => {
                    Object.keys(json.files).map(key => {
                      json.files[key].content = storage[key];
                    });
                    return new Response(JSON.stringify(json),response);
                  });
                });
              }
              if (request.method != "PATCH") {
                cache.put(request, response.clone());
              }
              return response;
            });
          } else {
            return response;
          }
        }).catch(() => {
          return caches.match(request,{ignoreVary:true}).then((r) => { //when offline, always try to serve cached resource
            if (r) {
              if (request.url.indexOf("api.github.com/gists/") > 0) {
                if (request.method == "GET") {
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
                return r;
              }
            }
          })
        });
      }
    });
  } else {
    return fetch(request).then((response) => {
      console.log("[SPEKTI SW] Working online !");
      return response;
    }).catch(() => {
      return caches.match(request).then((r) => {
        if (r) {
          console.log("[SPEKTI SW] Working offline :/");
          return new Response("false", r);
        }
      })
    })
  }
};

let syncGistStorage = (forced=false) => {
  console.log("[SPEKTI SW] sync now !",forced);
  return new Promise((resolve,reject) => {
    localStorage("SYNC").then(gist => {
      if ((typeof gist.token === "boolean")
      || (typeof gist.gistId === "undefined")) {
        reject(true);
      } else {
        localStorage("GET").then(storage => {
          Object.keys(storage).map(key => {
            storage[key] = { content:storage[key] }
          });
          if (Object.keys(storage).length > 0) {
            let headers = {
              "Accept": "application/vnd.github.v3+json",
              "Content-Type": "application/json",
              "Authorization": "token "+gist.token
            };
            fetch("https://api.github.com/gists/"+gist.gistId, {
              headers: headers,
              method: "PATCH",
              body: JSON.stringify({files:storage})
            }).then(response => {
              resolve(response);
              localStorage("CLEAR");
            });
          } else {
            reject(true);
          }
        });
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
  console.log("[SPEKTI SW] Cache Size is:",cacheSize);
  if (cacheSize > 100000000) {
    clearCache(true);
  }
}

self.addEventListener("install", (e) => {
  console.log("[SPEKTI SW] Installation");
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("[SPEKTI SW] Global caching");
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
  console.log("[SPEKTI SW] Activated !");
  clearCache();
});
self.addEventListener("message", (e) => {
  if (e.data == "FORCE SYNC") {
    syncGistStorage(true);
    checkCache();
  } else {
    let data = JSON.parse(e.data)
    messages.find(e => e.id == data.id).responseReceived(data);
  }
});
