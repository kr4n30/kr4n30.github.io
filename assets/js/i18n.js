// ============================================
// KR4N30 v13.0 - SISTEMA MULTILINGÜE (VERSIÓN FINAL)
// ============================================

const I18N_CONFIG = {
    TRANSLATIONS_PATH: 'assets/data/translations/',
    SUPPORTED_LANGUAGES: ['es', 'en']
};

let currentLanguage = 'es';
let translations = {};
const languageCache = {};

// ============================================
// HELPER DE TRADUCCIÓN
// ============================================

function t(key) {
    if (!key) return '';

    const parts = key.split('.');
    let value = translations;

    for (const part of parts) {
        if (!value) return key;
        value = value[part];
    }

    // Usar ?? solo si existe, si no devolver key
    return (value !== undefined && value !== null) ? value : key;
}

// ============================================
// ESCAPE HTML
// ============================================

function escapeHtml(str) {
    if (!str) return '';
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(str).replace(/[&<>"']/g, match => htmlEscapes[match]);
}

// ============================================
// META TAGS
// ============================================

function updateMetaAndTitle() {
    const title = t('meta.title');
    if (title && title !== 'meta.title') document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        const desc = t('meta.description');
        if (desc !== 'meta.description') metaDescription.content = desc;
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        const value = t('meta.og_title');
        if (value !== 'meta.og_title') ogTitle.content = value;
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        const value = t('meta.og_description');
        if (value !== 'meta.og_description') ogDescription.content = value;
    }
}

// ============================================
// SERVICIOS
// ============================================

function renderServicesDynamic() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    const services = t('services.items');
    if (!Array.isArray(services)) return;

    servicesGrid.innerHTML = '';

    for (const service of services) {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <div class="service-icon">${escapeHtml(service.icon)}</div>
            <h3>${escapeHtml(service.title)}</h3>
            <p>${escapeHtml(service.desc)}</p>
        `;
        servicesGrid.appendChild(card);
    }
}

// ============================================
// ACTUALIZAR CONTENIDO
// ============================================

function updatePageContent() {
    const elements = document.querySelectorAll('[data-i18n]');

    for (const element of elements) {
        const key = element.dataset.i18n;
        const value = t(key);
        if (value === key) continue;

        if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
            element.placeholder = value;
            continue;
        }

        if (element.tagName === 'BUTTON') {
            const btnText = element.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = value;
            } else {
                element.textContent = value;
            }
            continue;
        }

        element.textContent = value;
    }

    renderServicesDynamic();

    const event = new CustomEvent('languageChanged', {
        detail: { language: currentLanguage }
    });
    document.dispatchEvent(event);
}

// ============================================
// BUSCADOR
// ============================================

function updateSearchPlaceholder() {
    const searchInput = document.getElementById('projectSearch');
    if (!searchInput) return;
    const placeholder = t('portfolio.search_placeholder');
    if (placeholder !== 'portfolio.search_placeholder') {
        searchInput.placeholder = placeholder;
    }
}

// ============================================
// FILTROS
// ============================================

function updateFilterButtonsText() {
    const filterAllBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (!filterAllBtn) return;
    const text = t('portfolio.filter_all');
    if (text !== 'portfolio.filter_all') {
        filterAllBtn.textContent = text;
    }
}

// ============================================
// DETECTAR IDIOMA
// ============================================

function detectBrowserLanguage() {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.indexOf('es') === 0) return 'es';
    if (browserLang.indexOf('en') === 0) return 'en';
    return 'es';
}

// ============================================
// PROYECTOS
// ============================================

function getProjectTranslation(project, field) {
    if (!project) return '';
    if (project.translationKey) {
        const key = `projects.${project.translationKey}.${field}`;
        const value = t(key);
        if (value !== key) return value;
    }
    return project[field] || '';
}

// ============================================
// CARGAR IDIOMA
// ============================================

async function loadTranslations(lang) {
    if (I18N_CONFIG.SUPPORTED_LANGUAGES.indexOf(lang) === -1) lang = 'es';

    try {
        const cached = languageCache[lang];
        if (cached) {
            translations = cached;
        } else {
            const response = await fetch(I18N_CONFIG.TRANSLATIONS_PATH + lang + '.json');
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
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');
    const currentFlag = document.getElementById('currentFlag');
    const currentLangText = document.getElementById('currentLangText');
    const langOptions = document.querySelectorAll('.lang-option');
    const switcher = document.getElementById('languageSwitcher');

    if (!langBtn || !langDropdown) return;

    langBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        langDropdown.classList.toggle('show');
        langBtn.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
        if (langBtn && langDropdown && !langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
            langDropdown.classList.remove('show');
            langBtn.classList.remove('active');
        }
    });

    langOptions.forEach(function (option) {
        option.addEventListener('click', function () {
            const lang = this.dataset.lang;
            const flagSrc = this.querySelector('.lang-flag').src;
            const shortLang = lang === 'es' ? 'ES' : 'EN';

            if (currentFlag) currentFlag.src = flagSrc;
            if (currentLangText) currentLangText.textContent = shortLang;

            if (switcher) {
                switcher.value = lang;
                const event = new Event('change');
                switcher.dispatchEvent(event);
            }

            if (langDropdown) langDropdown.classList.remove('show');
            if (langBtn) langBtn.classList.remove('active');
        });
    });
}

// ============================================
// NAMESPACE GLOBAL SEGURO
// ============================================

window.KR4N30 = window.KR4N30 || {};
window.KR4N30.i18n = {
    t: t,
    loadTranslations: loadTranslations,
    currentLanguage: function () { return currentLanguage; },
    getProjectTranslation: getProjectTranslation
};

window.t = t;
window.loadTranslations = loadTranslations;
window.currentLanguage = function () { return currentLanguage; };
window.getProjectTranslation = getProjectTranslation;

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', async function () {
    const savedLanguage = localStorage.getItem('language');
    const browserLanguage = detectBrowserLanguage();
    let initialLanguage = 'es';

    if (savedLanguage && I18N_CONFIG.SUPPORTED_LANGUAGES.indexOf(savedLanguage) !== -1) {
        initialLanguage = savedLanguage;
    } else {
        initialLanguage = browserLanguage;
    }

    await loadTranslations(initialLanguage);
    initLanguageSelector();

    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
        switcher.value = initialLanguage;
        switcher.addEventListener('change', async function (e) {
            await loadTranslations(e.target.value);
            if (typeof window.renderProjects === 'function') window.renderProjects();
            if (typeof window.setupFilters === 'function') window.setupFilters();
        });
    }
});