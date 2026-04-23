// ============================================================
// INTERNATIONALIZATION (i18n) MODULE - STABLE VERSION
// ============================================================

var SUPPORTED_LANGS = ['es', 'en'];
var currentLanguage = getInitialLanguage();

function getInitialLanguage() {
    var saved = localStorage.getItem('preferredLanguage');
    if (SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    if (SUPPORTED_LANGS.indexOf(CONFIG.defaultLanguage) !== -1) return CONFIG.defaultLanguage;
    return 'es';
}

function t(page, key) {
    try {
        var value = CONFIG.translations[currentLanguage][page][key];
        if (!value) {
            console.warn('[i18n] Missing: ' + currentLanguage + '.' + page + '.' + key);
            return key;
        }
        return value;
    } catch (e) { console.error('[i18n] Error:', e); return key; }
}

function tObject(page) {
    try {
        var value = CONFIG.translations[currentLanguage][page];
        if (!value) { console.warn('[i18n] Missing object: ' + currentLanguage + '.' + page); return {}; }
        return value;
    } catch (e) { console.error('[i18n] Error:', e); return {}; }
}

function setLanguage(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1 || lang === currentLanguage) return;
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    syncLangButtons();
    updateAllTranslations();
    if (navigator.vibrate) navigator.vibrate(15);
}

function syncLangButtons() {
    var buttons = document.querySelectorAll('.lang-btn-top, .lang-btn');
    buttons.forEach(function(btn) {
        if (btn.dataset.lang === currentLanguage) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function updateAllTranslations() {
    var section = window.location.hash.replace('#', '') || 'home';
    var map = { home: updateHomeTranslations, about: updateAboutTranslations, skills: updateSkillsTranslations, projects: updateProjectsTranslations };
    if (map[section]) map[section]();
    updateNavTranslations();
}

function updateHomeTranslations() {
    var el = document.getElementById('tagline-el');
    if (!el) return;
    var data = tObject('home');
    el.innerHTML = '<div class="tagline-main">' + data.welcome + '</div><div class="tagline-text">' + data.description + '</div><div class="tagline-highlight">' + data.highlight + '</div>';
}

// ============================================
// ABOUT - RENDER ELEGANTE CON ÍCONOS Y TÍTULOS
// ============================================
function updateAboutTranslations() {
    var container = document.getElementById('about-content');
    if (!container) return;
    var data = tObject('about');
    var title = document.getElementById('about-title');
    if (title) title.textContent = data.title;

    container.innerHTML = `
        <div class="about-grid">
            <div class="about-card">
                <div class="about-icon">👋</div>
                <div class="about-content">
                    <div class="about-title">PRESENTACIÓN</div>
                    <p>${data.greeting} <strong style="color: var(--accent);">${data.name}</strong>, ${data.description1}</p>
                </div>
            </div>
            <div class="about-card">
                <div class="about-icon">🚀</div>
                <div class="about-content">
                    <div class="about-title">TECNOLOGÍA</div>
                    <p>${data.description2}</p>
                </div>
            </div>
            <div class="about-card">
                <div class="about-icon">💡</div>
                <div class="about-content">
                    <div class="about-title">ESPECIALIDAD</div>
                    <p>${data.description3}</p>
                </div>
            </div>
            <div class="about-card highlight">
                <div class="about-icon">⚡</div>
                <div class="about-content">
                    <div class="about-title">DISPONIBILIDAD</div>
                    <p>${data.availability}</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SKILLS - RENDER ELEGANTE
// ============================================
function updateSkillsTranslations() {
    var container = document.getElementById('skills-content');
    if (!container) return;
    var data = tObject('skills');
    var title = document.getElementById('skills-title');
    if (title) title.textContent = data.title;

    var fragment = document.createDocumentFragment();
    var icons = { web: '🌐', java: '☕', python: '🐍' };

    ['web', 'java', 'python'].forEach(function(key) {
        var skill = data[key];
        if (!skill) return;
        var card = document.createElement('div');
        card.className = 'skill-card';
        card.dataset.skill = key;
        card.innerHTML = `
            <div class="skill-card-header">
                <div class="skill-icon-wrapper">${icons[key]}</div>
                <div class="skill-title">${skill.title}</div>
            </div>
            <div class="skill-description">${skill.description}</div>
            <div class="skill-tech">
                ${skill.technologies.slice(0,5).map(function(t) { return '<span class="tech-badge">' + t + '</span>'; }).join('')}
                ${skill.technologies.length > 5 ? '<span class="tech-badge">+' + (skill.technologies.length-5) + ' más</span>' : ''}
            </div>
            <div class="skill-hint">🔍 ${currentLanguage === 'es' ? 'Haz clic para explorar' : 'Click to explore'}</div>
        `;
        card.addEventListener('click', function() { if (typeof openSkillModal === 'function') openSkillModal(skill); });
        fragment.appendChild(card);
    });
    container.innerHTML = '';
    container.appendChild(fragment);
}

// ============================================
// PROJECTS - RENDER ELEGANTE
// ============================================
function updateProjectsTranslations() {
    var container = document.getElementById('projects-content');
    if (!container) return;
    var data = tObject('projects');
    var title = document.getElementById('projects-title');
    if (title) title.textContent = data.title;

    var backBtn = document.getElementById('back-button');
    if (backBtn) { var span = backBtn.querySelector('.lbl'); if (span) span.textContent = data.backButton; }

    var fragment = document.createDocumentFragment();
    var icons = ['🎨', '🤖', '📱'];

    (data.projects || []).forEach(function(project, i) {
        var card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.projectIndex = i;
        card.innerHTML = `
            <div class="project-card-header">
                <div class="project-icon">${icons[i] || '🚀'}</div>
                <div class="project-name">${project.name}</div>
            </div>
            <div class="project-description">${project.description}</div>
            <div class="project-tech">
                ${project.technologies.slice(0,3).map(function(t) { return '<span class="project-tech-tag">' + t + '</span>'; }).join('')}
            </div>
            <div class="project-hint">${currentLanguage === 'es' ? 'Ver detalles' : 'View details'}</div>
        `;
        card.addEventListener('click', function() { if (typeof openModal === 'function') openModal(project); });
        fragment.appendChild(card);
    });
    container.innerHTML = '';
    container.appendChild(fragment);
}

function updateNavTranslations() {
    var nav = tObject('nav');
    document.querySelectorAll('.nav-btn').forEach(function(btn) {
        var key = btn.dataset.nav;
        var span = btn.querySelector('span');
        if (span && nav[key]) span.textContent = nav[key];
    });
}

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

window.t = t;
window.tObject = tObject;
window.setLanguage = setLanguage;
window.initLanguageSwitcher = initLanguageSwitcher;
window.updateAllTranslations = updateAllTranslations;