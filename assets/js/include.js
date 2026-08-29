/* ============================================
   include.js
   Inyecta header.html y footer.html en cualquier
   página que tenga los contenedores #header-placeholder
   y #footer-placeholder. Usa rutas absolutas ("/...")
   para funcionar igual desde la raíz o desde subcarpetas
   como /tools/algo.html
   ============================================ */
(function () {
    'use strict';

    function loadPartial(url, targetId) {
        var target = document.getElementById(targetId);
        if (!target) return Promise.resolve();

        return fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error('No se pudo cargar ' + url);
                return res.text();
            })
            .then(function (html) {
                target.innerHTML = html;
            })
            .catch(function (err) {
                console.error(err);
            });
    }

    // Agrupa los listeners de scroll en un único rAF por frame en vez de
    // ejecutar cada callback de inmediato en cada evento "scroll" (que
    // puede dispararse decenas de veces por segundo).
    function onScrollThrottled(callback) {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                callback();
                ticking = false;
            });
        }, { passive: true });
    }

    function initHeaderBehavior() {
        var header = document.getElementById('header');
        var menuToggle = document.getElementById('menuToggle');
        var nav = document.getElementById('nav');

        if (header) {
            onScrollThrottled(function () {
                header.classList.toggle('scrolled', window.scrollY > 50);
            });
        }

        if (menuToggle && nav) {
            menuToggle.addEventListener('click', function () {
                var isOpen = nav.classList.toggle('open');
                menuToggle.setAttribute('aria-expanded', String(isOpen));
                var icon = menuToggle.querySelector('i');
                if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
            });

            nav.querySelectorAll('.nav-link').forEach(function (link) {
                link.addEventListener('click', function () {
                    nav.classList.remove('open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    var icon = menuToggle.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                });
            });
        }

        var sections = document.querySelectorAll('main section[id]');
        var navLinks = document.querySelectorAll('.nav-link[href*="#"]');
        if (sections.length && navLinks.length) {
            onScrollThrottled(function () {
                var current = '';
                sections.forEach(function (section) {
                    if (window.scrollY >= section.offsetTop - 120) current = section.id;
                });
                navLinks.forEach(function (link) {
                    var href = link.getAttribute('href') || '';
                    link.classList.toggle('active', current !== '' && href.endsWith('#' + current));
                });
            });
        }
    }

    // ============================================
    // ACCESIBILIDAD DE MODALES (compartido)
    // Cualquier página con .modal puede usar:
    //   window.ToolboxA11y.trapFocus(modalEl)
    //   window.ToolboxA11y.releaseFocus(modalEl)
    // para bloquear el scroll de fondo, mover el foco
    // dentro del modal y devolverlo al cerrar.
    // ============================================
    (function initModalA11y() {
        var openModals = [];
        var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

        function getFocusable(modalEl) {
            return Array.prototype.slice.call(modalEl.querySelectorAll(FOCUSABLE))
                .filter(function (el) { return el.offsetParent !== null; });
        }

        function handleKeydown(e) {
            if (e.key !== 'Tab' || !openModals.length) return;
            var modalEl = openModals[openModals.length - 1];
            var focusable = getFocusable(modalEl);
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }

        function trapFocus(modalEl) {
            if (!modalEl || openModals.indexOf(modalEl) !== -1) return;
            modalEl.dataset.previousFocus = '';
            modalEl._previousActiveElement = document.activeElement;
            openModals.push(modalEl);
            document.body.classList.add('no-scroll');
            document.addEventListener('keydown', handleKeydown, true);
            var focusable = getFocusable(modalEl);
            if (focusable.length) focusable[0].focus();
        }

        function releaseFocus(modalEl) {
            var idx = openModals.indexOf(modalEl);
            if (idx !== -1) openModals.splice(idx, 1);
            if (!openModals.length) {
                document.body.classList.remove('no-scroll');
                document.removeEventListener('keydown', handleKeydown, true);
            }
            if (modalEl && modalEl._previousActiveElement && typeof modalEl._previousActiveElement.focus === 'function') {
                modalEl._previousActiveElement.focus();
                modalEl._previousActiveElement = null;
            }
        }

        window.ToolboxA11y = { trapFocus: trapFocus, releaseFocus: releaseFocus };
    })();

    function initFooterBehavior() {
        var yearEl = document.getElementById('currentYear');
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    }

    // FOUC fix: oculta fallback noscript cuando el header real ya cargó
    function markHeaderLoaded(){
        document.body.classList.add('header-loaded');
        // anchor ad: mostrar solo si hay consent y no hay adblock
        var anchor = document.getElementById('anchorAd');
        var closeBtn = document.getElementById('anchorClose');
        if(anchor){
            var hasConsent=false; try{hasConsent=localStorage.getItem('consentMode')==='granted';}catch(e){}
            // mostrar anchor si hay consent o si no hay elección aún (para medir)
            if(hasConsent || !localStorage.getItem('consentMode')) {
                // esperar un poco para no tapar LCP
                setTimeout(function(){
                    anchor.classList.remove('hidden');
                    anchor.removeAttribute('aria-hidden');
                    document.body.classList.add('has-anchor-ad');
                    var slot=document.getElementById('anchorAdSlot');
                    if(slot && window.ToolboxAds) window.ToolboxAds.fillSlot(slot);
                }, 1200);
            }
            if(closeBtn) closeBtn.addEventListener('click', function(){
                anchor.classList.add('hidden');
                document.body.classList.remove('has-anchor-ad');
                try{ sessionStorage.setItem('anchorClosed','1'); }catch(e){}
            });
            try{ if(sessionStorage.getItem('anchorClosed')==='1'){ anchor.classList.add('hidden'); } }catch(e){}
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var headerReady = loadPartial('/partials/header.html', 'header-placeholder').then(initHeaderBehavior).then(markHeaderLoaded);
        var footerReady = loadPartial('/partials/footer.html', 'footer-placeholder').then(initFooterBehavior);

        Promise.all([headerReady, footerReady]).then(function () {
            document.dispatchEvent(new CustomEvent('partials:loaded'));
        });

        // adblock friendly: si se detecta bloqueador, mostrar modal suave
        window.addEventListener('adblock:detected', function(){
            // no molestar cada visita: 1 vez por sesión
            try{ if(sessionStorage.getItem('adblockShown')) return; sessionStorage.setItem('adblockShown','1'); }catch(e){}
            var existing=document.getElementById('adblockModal');
            if(existing) return;
            var html='<div class="modal" id="adblockModal" role="dialog" aria-modal="true"><div class="modal-content" style="max-width:480px;text-align:center"><div class="modal-header"><h3>💙 Apoya kR4N30 Toolbox</h3><button class="modal-close" id="adblockClose" type="button">✕</button></div><div class="modal-body"><p style="color:var(--color-gray)">Detectamos bloqueador de anuncios. Entendemos — pero los anuncios mantienen las herramientas <strong>gratis y privadas</strong> (todo corre en tu navegador).</p><p style="color:var(--color-gray)">Si te es útil, considera desactivarlo solo aquí o <a href="https://github.com/sponsors/kr4n30" target="_blank" rel="noopener" style="color:var(--color-blue-electric)">invitarnos un café</a>.</p><div style="display:flex;gap:10px;justify-content:center;margin-top:16px"><button class="btn btn-secondary btn-small" id="adblockContinue" type="button">Seguir con bloqueador</button><button class="btn btn-primary btn-small" id="adblockDisable" type="button">Entendido</button></div></div></div></div>';
            var w=document.createElement('div'); w.innerHTML=html; var m=w.firstElementChild; document.body.appendChild(m);
            function close(){ m.classList.add('hidden'); if(window.ToolboxA11y) window.ToolboxA11y.releaseFocus(m); document.body.classList.remove('no-scroll'); }
            document.getElementById('adblockClose').addEventListener('click', close);
            document.getElementById('adblockContinue').addEventListener('click', close);
            document.getElementById('adblockDisable').addEventListener('click', close);
            m.addEventListener('click', function(e){ if(e.target===m) close(); });
            if(window.ToolboxA11y) window.ToolboxA11y.trapFocus(m);
        });
    });
})();
