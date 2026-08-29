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

    // Refresh cada 30s si el usuario está inactivo (sin scroll) y tiene consent
    var lastScrollAt = Date.now();
    var refreshInterval = null;
    window.addEventListener('scroll', function(){ lastScrollAt = Date.now(); }, {passive:true});
    function startRefresh(){
        if(refreshInterval) return;
        refreshInterval = setInterval(function(){
            // solo refresca si lleva 30s sin scroll y hay consent
            if(Date.now() - lastScrollAt < 30000) return;
            var hasConsent = false;
            try{ hasConsent = localStorage.getItem('consentMode')==='granted'; }catch(e){}
            if(!hasConsent) return;
            // refresca solo slots visibles y ya llenos (re-push seguro: AdSense ignora si ya está lleno, pero evitamos duplicar)
            document.querySelectorAll('ins.adsbygoogle[data-ad-fill-requested="true"]').forEach(function(el){
                // marcamos para permitir re-push: quitar flag y volver a pedir (solo para anchor/visit slots)
                if(el.closest('#anchorAdSlot') || el.closest('#visitAdSlot')){
                    el.removeAttribute('data-ad-fill-requested');
                    fillSlot(el);
                }
            });
        }, 30000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function(){ fillDisplayAds(); startRefresh(); });
    } else {
        fillDisplayAds(); startRefresh();
    }

    // Detección AdBlock amigable: si adsbygoogle.js fue bloqueado, mostramos aviso suave
    setTimeout(function(){
        var blocked = false;
        try{ blocked = typeof window.adsbygoogle === 'undefined' || document.querySelector('script[src*="adsbygoogle.js"]') && window.adsbygoogle && window.adsbygoogle.loaded!==true; }catch(e){}
        // check sencillo: si no hay ins con data-ad-status
        var anyFilled = document.querySelector('ins.adsbygoogle[data-ad-status]');
        if(!anyFilled){
            // no es 100% fiable, pero si hay bloqueador, todos los ins quedan vacíos
            var test = document.createElement('div');
            test.className = 'adsbygoogle';
            test.style.cssText='height:1px;width:1px;position:absolute;left:-9999px';
            document.body.appendChild(test);
            var isHidden = window.getComputedStyle(test).display==='none' || test.offsetHeight===0;
            // si está oculto por bloqueador, mostrar toast suave
            if(isHidden || !anyFilled){
                window.dispatchEvent(new CustomEvent('adblock:detected'));
            }
            test.remove();
        }
    }, 2500);
})();
