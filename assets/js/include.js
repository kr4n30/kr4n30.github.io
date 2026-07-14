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

    function initHeaderBehavior() {
        var header = document.getElementById('header');
        var menuToggle = document.getElementById('menuToggle');
        var nav = document.getElementById('nav');

        if (header) {
            window.addEventListener('scroll', function () {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }, { passive: true });
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
            window.addEventListener('scroll', function () {
                var current = '';
                sections.forEach(function (section) {
                    if (window.scrollY >= section.offsetTop - 120) current = section.id;
                });
                navLinks.forEach(function (link) {
                    var href = link.getAttribute('href') || '';
                    link.classList.toggle('active', current !== '' && href.endsWith('#' + current));
                });
            }, { passive: true });
        }
    }

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
