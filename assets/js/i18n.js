/* ============================================
   i18n.js
   Detecta el idioma del sistema/navegador del
   usuario (navigator.language) y traduce todos
   los elementos con [data-i18n] / [data-i18n-attr].
   Idioma manual guardado en localStorage si el
   usuario usa el botón de idioma (#langToggle).
   ============================================ */
(function () {
    'use strict';

    var STORAGE_KEY = 'siteLang';
    var SUPPORTED = ['es', 'en'];
    var cache = {};

    function detectLang() {
        var saved = null;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            saved = null;
        }
        if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;

        var browserLang = (navigator.language || navigator.userLanguage || 'es').slice(0, 2).toLowerCase();
        return SUPPORTED.indexOf(browserLang) !== -1 ? browserLang : 'es';
    }

    function getDict(lang) {
        if (cache[lang]) return Promise.resolve(cache[lang]);
        return fetch('/assets/locales/' + lang + '.json')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                cache[lang] = data;
                return data;
            });
    }

    function resolveKey(dict, key) {
        return key.split('.').reduce(function (acc, part) {
            return acc && acc[part] !== undefined ? acc[part] : null;
        }, dict);
    }

    function applyTranslations(lang) {
        return getDict(lang).then(function (dict) {
            document.documentElement.setAttribute('lang', lang);

            document.querySelectorAll('[data-i18n]').forEach(function (el) {
                var value = resolveKey(dict, el.getAttribute('data-i18n'));
                if (value != null) el.textContent = value;
            });

            document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
                el.getAttribute('data-i18n-attr').split(';').forEach(function (rule) {
                    var parts = rule.split(':');
                    if (parts.length !== 2) return;
                    var attr = parts[0].trim();
                    var key = parts[1].trim();
                    var value = resolveKey(dict, key);
                    if (value != null) el.setAttribute(attr, value);
                });
            });

            var titleValue = resolveKey(dict, 'meta.title');
            if (titleValue) document.title = titleValue;

            // El texto va en un <span> interno (no en el botón entero) para
            // no borrar el icono de Font Awesome que vive junto a él.
            var toggleText = document.getElementById('langToggleText');
            if (toggleText) toggleText.textContent = lang === 'es' ? 'ES / EN' : 'EN / ES';

            document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: lang } }));
        });
    }

    function setLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) { /* almacenamiento no disponible, seguimos sin persistir */ }
        applyTranslations(lang);
    }

    function init() {
        var lang = detectLang();
        applyTranslations(lang);

        document.addEventListener('click', function (e) {
            var toggle = e.target.closest('#langToggle');
            if (!toggle) return;
            var current = document.documentElement.getAttribute('lang') || lang;
            setLang(current === 'es' ? 'en' : 'es');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // El header/footer se inyectan de forma asíncrona (include.js),
    // así que volvemos a traducir en cuanto estén listos.
    document.addEventListener('partials:loaded', function () {
        var current = document.documentElement.getAttribute('lang') || detectLang();
        applyTranslations(current);
    });
})();
