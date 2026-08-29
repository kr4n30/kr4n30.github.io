/* kR4N30 Toolbox — Service Worker ligero
   - Cachea shell (html/css/js/icons)
   - Cachea modelos de IA tras primera descarga (stale-while-revalidate)
   - No intercepta AdSense ni googlesyndication
*/
var SHELL_CACHE = 'toolbox-shell-v2';
var MODEL_CACHE = 'toolbox-models-v1';
var SHELL_URLS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/assets/css/style.css',
  '/assets/css/tools-common.css',
  '/assets/js/include.js',
  '/assets/js/i18n.js',
  '/assets/js/consent.js',
  '/assets/js/adsense.js',
  '/assets/icons/favicon.svg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(function (c) { return c.addAll(SHELL_URLS); }).catch(function(){})
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function(k){ return k!==SHELL_CACHE && k!==MODEL_CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

function isModelRequest(url) {
  return /huggingface\.co|\.hf\.co|cdn\.jsdelivr\.net|storage\.googleapis\.com/.test(url.hostname + url.pathname) && (url.pathname.endsWith('.onnx') || url.pathname.endsWith('.onnx.data') || url.pathname.endsWith('.bin') || url.pathname.includes('resolve'));
}

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  // no tocar ads ni analytics
  if (/googlesyndication|doubleclick|google\.com\/pagead|googletagmanager/.test(url.hostname)) return;
  if (e.request.method !== 'GET') return;

  // modelos -> cache-first con revalidación
  if (isModelRequest(url)) {
    e.respondWith(
      caches.open(MODEL_CACHE).then(function(cache){
        return cache.match(e.request).then(function(cached){
          var fetchPromise = fetch(e.request).then(function(resp){
            if (resp && resp.ok) cache.put(e.request, resp.clone());
            return resp;
          }).catch(function(){ return cached; });
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // shell -> stale-while-revalidate
  if (SHELL_URLS.indexOf(url.pathname)!==-1 || url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.png')) {
    e.respondWith(
      caches.match(e.request).then(function(cached){
        var fetched = fetch(e.request).then(function(resp){
          if (resp && resp.ok) {
            var clone = resp.clone();
            caches.open(SHELL_CACHE).then(function(c){ c.put(e.request, clone); });
          }
          return resp;
        }).catch(function(){ return cached; });
        return cached || fetched;
      })
    );
  }
});
