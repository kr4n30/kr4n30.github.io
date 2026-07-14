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

    document.addEventListener('DOMContentLoaded', function () {
        var headerReady = loadPartial('/partials/header.html', 'header-placeholder').then(initHeaderBehavior);
        var footerReady = loadPartial('/partials/footer.html', 'footer-placeholder').then(initFooterBehavior);

        Promise.all([headerReady, footerReady]).then(function () {
            document.dispatchEvent(new CustomEvent('partials:loaded'));
        });
    });
})();
