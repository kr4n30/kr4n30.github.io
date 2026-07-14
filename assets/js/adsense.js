/* ============================================
   adsense.js
   Módulo COMPARTIDO por cualquier página que use
   Google AdSense (banners + Ad Placement API para
   el anuncio recompensado). Sin scripts inline: todo
   vive aquí para poder mantener una CSP estricta
   (script-src 'self' ...).

   Requiere que en el <head> de la página ya se haya
   cargado:
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX"></script>
   ============================================ */
(function () {
    'use strict';

    // Cola de comandos de AdSense. adBreak/adConfig quedan disponibles
    // globalmente para que reward-gate.js (o cualquier script de una
    // herramienta) pueda pedir un anuncio recompensado.
    window.adsbygoogle = window.adsbygoogle || [];
    window.adBreak = window.adConfig = function (o) {
        window.adsbygoogle.push(o);
    };

    function fillDisplayAds() {
        var slots = document.querySelectorAll('ins.adsbygoogle');
        slots.forEach(function () {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                // AdSense no cargó (bloqueador de anuncios, sin conexión, etc).
                // No es un error fatal para el resto de la herramienta.
                console.warn('AdSense: no se pudo solicitar un anuncio.', e);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fillDisplayAds);
    } else {
        fillDisplayAds();
    }
})();
