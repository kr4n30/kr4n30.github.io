/* ============================================
   app.js
   Lógica específica de la página de inicio:
   renderiza el grid de herramientas y el buscador.
   Para agregar una herramienta nueva basta con sumar
   una entrada al array `tools` (y crear su propio
   assets/js/tools/<id>.js + assets/css/tools/<id>.css).
   ============================================ */
(function () {
    'use strict';

    var tools = [
        {
            id: 'video-to-image',
            icon: 'fa-film',
            href: '/tools/video-to-image.html',
            comingSoon: false,
            i18n: {
                name: 'tools.videoToImage.name',
                desc: 'tools.videoToImage.desc'
            }
        }
    ];

    function resolveKey(dict, key) {
        return key.split('.').reduce(function (acc, part) {
            return acc && acc[part] !== undefined ? acc[part] : null;
        }, dict);
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderTools(dict, searchTerm) {
        var grid = document.getElementById('toolsGrid');
        if (!grid) return;

        var term = (searchTerm || '').trim().toLowerCase();
        var filtered = tools.filter(function (tool) {
            if (!term) return true;
            var name = (resolveKey(dict, tool.i18n.name) || '').toLowerCase();
            var desc = (resolveKey(dict, tool.i18n.desc) || '').toLowerCase();
            return name.indexOf(term) !== -1 || desc.indexOf(term) !== -1;
        });

        if (!filtered.length) {
            grid.innerHTML = '<p class="no-results">' + escapeHtml(resolveKey(dict, 'tools.noResults') || 'No results') + '</p>';
            return;
        }

        grid.innerHTML = filtered.map(function (tool) {
            var name = escapeHtml(resolveKey(dict, tool.i18n.name) || tool.id);
            var desc = escapeHtml(resolveKey(dict, tool.i18n.desc) || '');
            var badge = tool.comingSoon
                ? '<span class="tool-category">' + escapeHtml(resolveKey(dict, 'tools.comingSoon') || 'Soon') + '</span>'
                : '';
            var action = tool.comingSoon
                ? '<span class="tool-btn tool-btn-disabled">' + escapeHtml(resolveKey(dict, 'tools.comingSoonAction') || 'Coming soon') + '</span>'
                : '<a class="tool-btn" href="' + tool.href + '">' + escapeHtml(resolveKey(dict, 'tools.open') || 'Open') + ' <i class="fas fa-arrow-right" aria-hidden="true"></i></a>';

            return (
                '<div class="tool-card' + (tool.comingSoon ? ' tool-card-soon' : '') + '">' +
                badge +
                '<div class="tool-icon"><i class="fas ' + tool.icon + '" aria-hidden="true"></i></div>' +
                '<div class="tool-name">' + name + '</div>' +
                '<div class="tool-desc">' + desc + '</div>' +
                action +
                '</div>'
            );
        }).join('');
    }

    var currentDict = null;

    function loadDictAndRender(lang) {
        fetch('/assets/locales/' + lang + '.json')
            .then(function (res) { return res.json(); })
            .then(function (dict) {
                currentDict = dict;
                var searchInput = document.getElementById('searchInput');
                renderTools(dict, searchInput ? searchInput.value : '');
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                if (currentDict) renderTools(currentDict, searchInput.value);
            });
        }
    });

    document.addEventListener('i18n:applied', function (e) {
        loadDictAndRender(e.detail.lang);
    });
})();
