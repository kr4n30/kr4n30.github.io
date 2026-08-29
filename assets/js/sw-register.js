/* sw-register.js — registro del Service Worker (externo para respetar CSP) */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
