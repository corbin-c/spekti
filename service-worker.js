let cacheName = "spekti-v1";
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
let fetchHandler = (request) => {
    if (request.url.indexOf("/spekti/online") < 0) {
      return caches.match(request).then((r) => {
        console.log("[SPEKTI SW] Fetching...: "+request.url);
        if ((r)
        && (request.url.indexOf("api.github.com") < 0)
        && (!request.headers.has("spekti-no-cache"))) {
          console.log("[SPEKTI SW] Serving cached resource...: "+request.url);
          return r;
        } else {
          return fetch(request).then((response) => {
            return caches.open(cacheName).then((cache) => {
              console.log("[SPEKTI SW] Caching newly fetched resource: "+request.url);
              cache.put(request, response.clone());
              return response;
            });
          }).catch(() => {
            return caches.match(request).then((r) => {
              if (r) {
                console.log("[SPEKTI SW] Serving offline cached resource: "+request.url);
                return r;
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
