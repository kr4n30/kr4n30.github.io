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

    // Rellena un <ins class="adsbygoogle"> concreto, evitando pedir un
    // anuncio dos veces para el mismo slot (Google lanza un TagError si
    // se hace push({}) sobre un <ins> que ya tiene anuncio).
    function fillSlot(el) {
        if (!el || el.dataset.adFillRequested === 'true') return;
        el.dataset.adFillRequested = 'true';
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            // AdSense no cargó (bloqueador de anuncios, sin conexión, etc).
            // No es un error fatal para el resto de la herramienta.
            console.warn('AdSense: no se pudo solicitar un anuncio.', e);
        }
    }

    function fillDisplayAds() {
        // Los slots marcados como data-ad-lazy viven dentro de contenedores
        // ocultos al cargar la página (ej. el modal de recompensa). AdSense
        // no puede medir un <ins> con display:none, así que esos se rellenan
        // bajo demanda (ver reward-gate.js) en lugar de aquí.
        var slots = document.querySelectorAll('ins.adsbygoogle:not([data-ad-lazy])');
        slots.forEach(fillSlot);
    }

    window.ToolboxAds = { fillSlot: fillSlot };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fillDisplayAds);
    } else {
        fillDisplayAds();
    }
})();
