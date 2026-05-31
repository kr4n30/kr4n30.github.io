// ============================================
// KR4N30 v12.0 - SISTEMA MULTILINGÜE
// ============================================

var I18N_CONFIG = {
    TRANSLATIONS_PATH: 'assets/data/translations/',
    SUPPORTED_LANGUAGES: ['es', 'en']
};

var currentLanguage = 'es';
var translations = {};
var languageCache = {};

// ============================================
// HELPER DE TRADUCCIÓN
// ============================================

function t(key) {
    if (!key) return '';
    var parts = key.split('.');
    var value = translations;
    for (var i = 0; i < parts.length; i++) {
        if (value === null || value === undefined) break;
        value = value[parts[i]];
    }
    return value !== undefined && value !== null ? value : key;
}

// ============================================
// META TAGS
// ============================================

function updateMetaAndTitle() {
    var title = t('meta.title');
    if (title && title !== 'meta.title') document.title = title;

    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        var desc = t('meta.description');
        if (desc !== 'meta.description') metaDescription.content = desc;
    }

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        var value = t('meta.og_title');
        if (value !== 'meta.og_title') ogTitle.content = value;
    }

    var ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        var value = t('meta.og_description');
        if (value !== 'meta.og_description') ogDescription.content = value;
    }
}

// ============================================
// SERVICIOS
// ============================================

function renderServicesDynamic() {
    var servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    var services = t('services.items');
    if (Array.isArray(services)) {
        var html = '';
        for (var i = 0; i < services.length; i++) {
            var service = services[i];
            html += '<div class="service-card">' +
                '<div class="service-icon">' + service.icon + '</div>' +
                '<h3>' + service.title + '</h3>' +
                '<p>' + service.desc + '</p>' +
                '</div>';
        }
        servicesGrid.innerHTML = html;
    }
}

// ============================================
// ACTUALIZAR CONTENIDO
// ============================================

function updatePageContent() {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var key = element.dataset.i18n;
        var value = t(key);
        if (value === key) continue;

        if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
            element.placeholder = value;
            continue;
        }

        if (element.tagName === 'BUTTON') {
            var btnText = element.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = value;
            } else {
                element.textContent = value;
            }
            continue;
        }

        element.innerHTML = value;
    }

    renderServicesDynamic();

    var event = new CustomEvent('languageChanged', {
        detail: { language: currentLanguage }
    });
    document.dispatchEvent(event);
}

// ============================================
// BUSCADOR
// ============================================

function updateSearchPlaceholder() {
    var searchInput = document.getElementById('projectSearch');
    if (!searchInput) return;
    var placeholder = t('portfolio.search_placeholder');
    if (placeholder !== 'portfolio.search_placeholder') {
        searchInput.placeholder = placeholder;
    }
}

// ============================================
// FILTROS
// ============================================

function updateFilterButtonsText() {
    var filterAllBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (!filterAllBtn) return;
    var text = t('portfolio.filter_all');
    if (text !== 'portfolio.filter_all') {
        filterAllBtn.textContent = text;
    }
}

// ============================================
// DETECTAR IDIOMA
// ============================================

function detectBrowserLanguage() {
    var browserLang = navigator.language.toLowerCase();
    if (browserLang.indexOf('es') === 0) return 'es';
    if (browserLang.indexOf('en') === 0) return 'en';
    return 'es';
}

// ============================================
// PROYECTOS
// ============================================

function getProjectTranslation(project, field) {
    if (!project || !project.translationKey) {
        return project && project[field] ? project[field] : '';
    }
    var key = 'projects.' + project.translationKey + '.' + field;
    var value = t(key);
    return value !== key ? value : (project[field] || '');
}

// ============================================
// CARGAR IDIOMA
// ============================================

async function loadTranslations(lang) {
    if (I18N_CONFIG.SUPPORTED_LANGUAGES.indexOf(lang) === -1) lang = 'es';

    try {
        if (languageCache[lang]) {
            translations = languageCache[lang];
        } else {
            var response = await fetch(I18N_CONFIG.TRANSLATIONS_PATH + lang + '.json');
            if (!response.ok) throw new Error('HTTP ' + response.status);
            translations = await response.json();
            languageCache[lang] = translations;
        }

        currentLanguage = lang;
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        updateMetaAndTitle();
        updatePageContent();
        updateSearchPlaceholder();
        updateFilterButtonsText();
        return true;
    } catch (error) {
        console.error('Translation error:', error);
        return false;
    }
}

// ============================================
// SELECTOR DE IDIOMA PERSONALIZADO
// ============================================

function initLanguageSelector() {
    var langBtn = document.getElementById('langBtn');
    var langDropdown = document.getElementById('langDropdown');
    var currentFlag = document.getElementById('currentFlag');
    var currentLangText = document.getElementById('currentLangText');
    var langOptions = document.querySelectorAll('.lang-option');
    var switcher = document.getElementById('languageSwitcher');

    if (!langBtn || !langDropdown) return;

    // Abrir/cerrar dropdown
    langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        langDropdown.classList.toggle('show');
        langBtn.classList.toggle('active');
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
            langDropdown.classList.remove('show');
            langBtn.classList.remove('active');
        }
    });

    // Manejar selección de idioma
    for (var i = 0; i < langOptions.length; i++) {
        (function(option) {
            option.addEventListener('click', function() {
                var lang = this.dataset.lang;
                var flagSrc = this.querySelector('.lang-flag').src;
                var shortLang = lang === 'es' ? 'ES' : 'EN';

                // Actualizar bandera y texto del botón
                currentFlag.src = flagSrc;
                currentLangText.textContent = shortLang;

                // Actualizar el select oculto y cambiar idioma
                if (switcher) {
                    switcher.value = lang;
                    var event = new Event('change');
                    switcher.dispatchEvent(event);
                }

                // Cerrar dropdown
                langDropdown.classList.remove('show');
                langBtn.classList.remove('active');
            });
        })(langOptions[i]);
    }
}

// ============================================
// EXPORT GLOBAL
// ============================================

window.t = t;
window.loadTranslations = loadTranslations;
window.currentLanguage = function() { return currentLanguage; };
window.getProjectTranslation = getProjectTranslation;

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    var savedLanguage = localStorage.getItem('language');
    var browserLanguage = detectBrowserLanguage();
    var initialLanguage = (savedLanguage && I18N_CONFIG.SUPPORTED_LANGUAGES.indexOf(savedLanguage) !== -1) ?
        savedLanguage :
        browserLanguage;

    await loadTranslations(initialLanguage);
    initLanguageSelector();

    var switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = initialLanguage;
        switcher.addEventListener('change', async function(e) {
            await loadTranslations(e.target.value);
            if (typeof window.renderProjects === 'function') window.renderProjects();
            if (typeof window.setupFilters === 'function') window.setupFilters();
        });
    }
});