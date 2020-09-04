let cacheName = "spekti-v1";
let contentToCache = [
"/spekti/spekti.js",
"/spekti/rss.js",
"/spekti/reader.js",
"/spekti/vue/article.vue.js",
"/spekti/vue/hello.all.min.js",
"/spekti/vue/home.vue.js",
"/spekti/vue/index.html",
"/spekti/vue/main.vue.js",
"/spekti/vue/manifest.json",
"/spekti/vue/modal.vue.js",
"/spekti/vue/notesabout.vue.js",
"/spekti/vue/notes.vue.js",
"/spekti/vue/sources.vue.js",
"/spekti/vue/spekti.css",
"/spekti/vue/tagbar.vue.js",
"/spekti/vue/tagsabout.vue.js",
"/spekti/vue/tags.vue.js",
"/spekti/vue/tag.vue.js",
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
      return r || fetch(e.request).then((response) => {
        return caches.open(cacheName).then((cache) => {
          if (e.request.url.indexOf("api.github.com") < 0 {
            console.log("[SPEKTI SW] Caching newly fetched resource: "+e.request.url);
            cache.put(e.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});
