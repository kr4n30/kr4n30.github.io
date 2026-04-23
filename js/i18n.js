// ============================================================
//  INTERNATIONALIZATION (i18n) MODULE - STABLE VERSION
// ============================================================

var SUPPORTED_LANGS = ['es', 'en'];

var currentLanguage = getInitialLanguage();

/**
 * Idioma inicial
 */
function getInitialLanguage() {
    var saved = localStorage.getItem('preferredLanguage');
    if (SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    if (SUPPORTED_LANGS.indexOf(CONFIG.defaultLanguage) !== -1) return CONFIG.defaultLanguage;
    return 'es';
}

/**
 * Traducción string
 */
function t(page, key) {
    try {
        var value = CONFIG.translations[currentLanguage][page][key];
        if (!value) {
            console.warn('[i18n] Missing: ' + currentLanguage + '.' + page + '.' + key);
            return key;
        }
        return value;
    } catch (e) {
        console.error('[i18n] Error:', e);
        return key;
    }
}

/**
 * Traducción objeto
 */
function tObject(page) {
    try {
        var value = CONFIG.translations[currentLanguage][page];
        if (!value) {
            console.warn('[i18n] Missing object: ' + currentLanguage + '.' + page);
            return {};
        }
        return value;
    } catch (e) {
        console.error('[i18n] Error:', e);
        return {};
    }
}

/**
 * Cambiar idioma
 */
function setLanguage(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1 || lang === currentLanguage) return;

    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);

    syncLangButtons();
    updateAllTranslations();

    if (navigator.vibrate) navigator.vibrate(15);
}

/**
 * Botones activos
 */
function syncLangButtons() {
    var buttons = document.querySelectorAll('.lang-btn-top, .lang-btn');

    buttons.forEach(function(btn) {
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Render principal
 */
function updateAllTranslations() {
    var section = window.location.hash.replace('#', '') || 'home';

    var map = {
        home: updateHomeTranslations,
        about: updateAboutTranslations,
        skills: updateSkillsTranslations,
        projects: updateProjectsTranslations
    };

    if (map[section]) map[section]();

    updateNavTranslations();
}

/**
 * HOME
 */
function updateHomeTranslations() {
    var el = document.getElementById('tagline-el');
    if (!el) return;

    var data = tObject('home');

    el.innerHTML =
        '<div class="tagline-main">' + data.welcome + '</div>' +
        '<div class="tagline-text">' + data.description + '</div>' +
        '<div class="tagline-highlight">' + data.highlight + '</div>';
}

/**
 * ABOUT
 */
function updateAboutTranslations() {
    var container = document.getElementById('about-content');
    if (!container) return;

    var data = tObject('about');

    var title = document.getElementById('about-title');
    if (title) title.textContent = data.title;

    container.innerHTML =
        '<p>' + data.greeting + ' <strong>' + data.name + '</strong>, ' + data.description1 + '</p>' +
        '<p>' + data.description2 + '</p>' +
        '<p>' + data.description3 + '</p>' +
        '<div class="divider"></div>' +
        '<p class="availability">' + data.availability + '</p>';
}

/**
 * SKILLS
 */
function updateSkillsTranslations() {
    var container = document.getElementById('skills-content');
    if (!container) return;

    var data = tObject('skills');

    var title = document.getElementById('skills-title');
    if (title) title.textContent = data.title;

    var fragment = document.createDocumentFragment();

    ['web', 'java', 'python'].forEach(function(key) {
        var skill = data[key];
        if (!skill) return;

        var card = document.createElement('div');
        card.className = 'skill-card';
        card.dataset.skill = key;

        card.innerHTML =
            '<div class="skill-header">' +
            '<span class="emoji">' + skill.name.split(' ')[0] + '</span>' +
            '<div class="title">' + skill.title + '</div>' +
            '</div>' +
            '<div class="desc">' + skill.description + '</div>' +
            '<div class="tech">' +
            skill.technologies.slice(0, 4).map(function(t) {
                return '<span>' + t + '</span>';
            }).join('') +
            '</div>' +
            '<div class="hint">🔗 ' +
            (currentLanguage === 'es' ?
                'Haz clic para más detalles' :
                'Click for more details') +
            '</div>';

        card.addEventListener('click', function() {
            if (typeof openSkillModal === 'function') openSkillModal(skill);
        });

        fragment.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

/**
 * PROJECTS
 */
function updateProjectsTranslations() {
    var container = document.getElementById('projects-content');
    if (!container) return;

    var data = tObject('projects');

    var title = document.getElementById('projects-title');
    if (title) title.textContent = data.title;

    var fragment = document.createDocumentFragment();

    (data.projects || []).forEach(function(project) {
        var card = document.createElement('div');
        card.className = 'project-card';

        card.innerHTML =
            '<div class="title">' + project.name + '</div>' +
            '<div class="desc">' + project.description + '</div>' +
            '<div class="hint">🔗 ' +
            (currentLanguage === 'es' ?
                'Haz clic para más detalles' :
                'Click for more details') +
            '</div>';

        card.addEventListener('click', function() {
            if (typeof openModal === 'function') openModal(project);
        });

        fragment.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

/**
 * NAV
 */
function updateNavTranslations() {
    var nav = tObject('nav');

    document.querySelectorAll('.nav-btn').forEach(function(btn) {
        var key = btn.dataset.nav;
        var span = btn.querySelector('span');
        if (span && nav[key]) span.textContent = nav[key];
    });
}

/**
 * INIT
 */
function initLanguageSwitcher() {
    syncLangButtons();

    document.querySelectorAll('.lang-btn-top, .lang-btn').forEach(function(btn) {
        btn.onclick = function(e) {
            e.preventDefault();
            setLanguage(btn.dataset.lang);
        };
    });

    updateAllTranslations();
}

// Global
window.t = t;
window.tObject = tObject;
window.setLanguage = setLanguage;
window.initLanguageSwitcher = initLanguageSwitcher;
window.updateAllTranslations = updateAllTranslations;