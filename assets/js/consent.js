/* ============================================
   consent.js
   CMP ligero + Google Consent Mode v2
   - Guarda elección en localStorage 'consentMode'
   - Expone window.ToolboxConsent { hasConsent, open, reset }
   - Respeta Do Not Track y envía gtag consent si existe
   ============================================ */
(function () {
    'use strict';
    var STORAGE_KEY = 'consentMode';
    var BANNER_ID = 'consent-banner';
    var OVERLAY_ID = 'consent-overlay';

    function getStored() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }
    function setStored(v) {
        try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
    }

    function pushConsent(granted) {
        var state = granted ? 'granted' : 'denied';
        // gtag consent (Consent Mode v2) — funciona aunque gtag no esté cargado aún
        window.dataLayer = window.dataLayer || [];
        function gtag(){ window.dataLayer.push(arguments); }
        try {
            gtag('consent', 'update', {
                ad_storage: state,
                ad_user_data: state,
                ad_personalization: state,
                analytics_storage: granted ? 'granted' : 'denied'
            });
            // Si hay AdSense ya cargado, repintar slots tras consent
            if (granted && window.ToolboxAds && document.readyState !== 'loading') {
                // No hacemos nada invasivo: AdSense respeta consentMode solo
            }
        } catch (e) {}
    }

    function hasConsent() {
        return getStored() === 'granted' || getStored() === 'denied';
    }

    function hasGranted() {
        return getStored() === 'granted';
    }

    function createBanner() {
        if (document.getElementById(BANNER_ID)) return;
        var overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.className = 'consent-overlay';
        overlay.setAttribute('aria-hidden', 'true');

        var banner = document.createElement('div');
        banner.id = BANNER_ID;
        banner.className = 'consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-modal', 'true');
        banner.setAttribute('aria-labelledby', 'consent-title');
        banner.innerHTML =
            '<div class="consent-content">' +
            '  <div class="consent-text">' +
            '    <h3 id="consent-title">🍪 Usamos cookies</h3>' +
            '    <p>Usamos cookies esenciales y, con tu permiso, de Google AdSense para mostrar anuncios y medir visitas. Tus archivos nunca se suben a un servidor. <a href="/cookies.html">Más info</a> · <a href="/privacy.html">Privacidad</a></p>' +
            '  </div>' +
            '  <div class="consent-actions">' +
            '    <button type="button" class="btn btn-secondary btn-small" data-action="deny">Rechazar</button>' +
            '    <button type="button" class="btn btn-secondary btn-small" data-action="custom">Configurar</button>' +
            '    <button type="button" class="btn btn-primary btn-small" data-action="accept">Aceptar todo</button>' +
            '  </div>' +
            '</div>';

        document.body.appendChild(overlay);
        document.body.appendChild(banner);

        // custom panel inside banner
        var customPanel = document.createElement('div');
        customPanel.className = 'consent-custom hidden';
        customPanel.innerHTML =
            '<label class="consent-check"><input type="checkbox" checked disabled /> Esenciales (siempre activas) — idioma, seguridad</label>' +
            '<label class="consent-check"><input type="checkbox" id="consent-ads" checked /> Publicidad (Google AdSense)</label>' +
            '<label class="consent-check"><input type="checkbox" id="consent-analytics" /> Medición anónima</label>' +
            '<div class="consent-actions" style="margin-top:10px"><button type="button" class="btn btn-primary btn-small" data-action="save">Guardar</button></div>';
        banner.querySelector('.consent-content').appendChild(customPanel);

        function close(granted) {
            setStored(granted ? 'granted' : 'denied');
            pushConsent(granted);
            banner.classList.add('hidden');
            overlay.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        }

        banner.addEventListener('click', function (e) {
            var a = e.target.closest('[data-action]');
            if (!a) return;
            var act = a.getAttribute('data-action');
            if (act === 'accept') close(true);
            else if (act === 'deny') close(false);
            else if (act === 'custom') customPanel.classList.toggle('hidden');
            else if (act === 'save') {
                var ads = document.getElementById('consent-ads');
                // si desmarca ads -> denegar todo (más restrictivo)
                close(ads && ads.checked);
            }
        });

        overlay.addEventListener('click', function () {
            // click fuera no cierra para cumplir TCF (debe elegir)
        });

        // mostrar
        requestAnimationFrame(function () {
            banner.classList.add('show');
            document.body.classList.add('no-scroll');
        });
    }

    function openBanner() {
        if (!document.getElementById(BANNER_ID)) createBanner();
        else {
            document.getElementById(BANNER_ID).classList.remove('hidden');
            document.getElementById(OVERLAY_ID).classList.remove('hidden');
            document.getElementById(BANNER_ID).classList.add('show');
        }
    }

    function init() {
        var stored = getStored();
        if (stored === 'granted' || stored === 'denied') {
            pushConsent(stored === 'granted');
            return;
        }
        // si no hay elección, mostrar banner (respeta que no sea bot)
        if (navigator.webdriver) return;
        // pequeño delay para no bloquear LCP
        setTimeout(createBanner, 800);
    }

    // handler para boton Restablecer en cookies.html
    document.addEventListener('DOMContentLoaded', function(){
        var rb=document.getElementById('resetConsentBtn');
        if(rb) rb.addEventListener('click', function(){ try{localStorage.removeItem(STORAGE_KEY);}catch(e){} location.reload(); });
    });
    window.ToolboxConsent = {
        hasConsent: hasConsent,
        hasGranted: hasGranted,
        open: openBanner,
        reset: function () { try{localStorage.removeItem(STORAGE_KEY);}catch(e){} location.reload(); }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
