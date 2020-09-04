let cacheName = "spekti-v1";
let contentToCache = [
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
"/spekti/logo/maskable.png"
];
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
  e.respondWith(
    caches.match(e.request).then((r) => {
      console.log("[SPEKTI SW] Fetching...: "+e.request.url);
      if ((r)
      && (e.request.url.indexOf("api.github.com") < 0)
      && (!e.request.headers.has("spekti-no-cache"))) {
        console.log("[SPEKTI SW] Serving cached resource...: "+e.request.url);
        return r;
      } else {
        return fetch(e.request).then((response) => {
          return caches.open(cacheName).then((cache) => {
            console.log("[SPEKTI SW] Caching newly fetched resource: "+e.request.url);
            cache.put(e.request, response.clone());
            return response;
          });
        }).catch(() => {
          return caches.match(e.request).then((r) => {
            if (r) {
              console.log("[SPEKTI SW] Serving offline cached resource: "+e.request.url);
              return r;
            }
          })
        });
      }
    })
  );
});
