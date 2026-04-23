// ============================================================
// INTERNATIONALIZATION (i18n) MODULE - PRO VERSION
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

// ============================================
// HOME - REDISEÑADO CON TYPING Y ESTADÍSTICAS
// ============================================
function updateHomeTranslations() {
    var taglineEl = document.getElementById('tagline-el');
    if (taglineEl) {
        var data = tObject('home');
        taglineEl.innerHTML = '<div class="tagline-main">' + data.welcome + '</div><div class="tagline-text">' + data.description + '</div><div class="tagline-highlight">' + data.highlight + '</div>';
    }

    // Greeting dinámico según hora
    var greetingEl = document.getElementById('greeting-el');
    if (greetingEl) {
        var hour = new Date().getHours();
        var greeting = '';
        if (currentLanguage === 'es') {
            if (hour < 12) greeting = '🌅 Buenos días';
            else if (hour < 19) greeting = '🌞 Buenas tardes';
            else greeting = '🌙 Buenas noches';
        } else {
            if (hour < 12) greeting = '🌅 Good morning';
            else if (hour < 19) greeting = '🌞 Good afternoon';
            else greeting = '🌙 Good evening';
        }
        greetingEl.textContent = greeting;
    }

    // Typing effect
    var typingText = document.getElementById('typing-text');
    if (typingText && !typingText.dataset.typed) {
        var phrases = currentLanguage === 'es' ?
            ['Desarrollador Full Stack', 'Creador de experiencias', 'Apasionado por la tecnología'] :
            ['Full Stack Developer', 'Experience creator', 'Tech passionate'];
        var phraseIndex = 0;
        var charIndex = 0;
        var isDeleting = false;

        function typeEffect() {
            var currentPhrase = phrases[phraseIndex];
            if (isDeleting) {
                typingText.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                isDeleting = true;
                setTimeout(typeEffect, 2000);
                return;
            }

            if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(typeEffect, 500);
                return;
            }

            var speed = isDeleting ? 50 : 100;
            setTimeout(typeEffect, speed);
        }

        typingText.dataset.typed = 'true';
        setTimeout(typeEffect, 500);
    }

    // Estadísticas
    var stats = tObject('home').stats;
    if (stats) {
        var projectsEl = document.getElementById('stat-projects');
        var experienceEl = document.getElementById('stat-experience');
        var clientsEl = document.getElementById('stat-clients');
        if (projectsEl) projectsEl.textContent = stats.projects;
        if (experienceEl) experienceEl.textContent = stats.experience;
        if (clientsEl) clientsEl.textContent = stats.clients;
    }
}

// ============================================
// ABOUT - CON ESTADÍSTICAS Y MÁS CONTENIDO
// ============================================
function updateAboutTranslations() {
    var container = document.getElementById('about-content');
    if (!container) return;
    var data = tObject('about');
    var title = document.getElementById('about-title');
    if (title) title.textContent = data.title;

    container.innerHTML = `
        <div class="about-stats">
            <div class="stat-card"><div class="stat-number">${data.stats.years}+</div><div class="stat-label">${data.stats.yearsLabel}</div></div>
            <div class="stat-card"><div class="stat-number">${data.stats.projects}+</div><div class="stat-label">${data.stats.projectsLabel}</div></div>
            <div class="stat-card"><div class="stat-number">${data.stats.clients}+</div><div class="stat-label">${data.stats.clientsLabel}</div></div>
        </div>
        <div class="about-grid">
            <div class="about-card">
                <div class="about-icon">👋</div>
                <div class="about-content">
                    <div class="about-title">${data.cards.who.title}</div>
                    <p>${data.cards.who.text}</p>
                </div>
            </div>
            <div class="about-card">
                <div class="about-icon">🚀</div>
                <div class="about-content">
                    <div class="about-title">${data.cards.mission.title}</div>
                    <p>${data.cards.mission.text}</p>
                </div>
            </div>
            <div class="about-card">
                <div class="about-icon">💡</div>
                <div class="about-content">
                    <div class="about-title">${data.cards.specialty.title}</div>
                    <p>${data.cards.specialty.text}</p>
                </div>
            </div>
            <div class="about-card highlight">
                <div class="about-icon">⚡</div>
                <div class="about-content">
                    <div class="about-title">${data.cards.availability.title}</div>
                    <p>${data.cards.availability.text}</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SKILLS - CON BARRAS DE PROGRESO
// ============================================
function updateSkillsTranslations() {
    var container = document.getElementById('skills-content');
    if (!container) return;
    var data = tObject('skills');
    var title = document.getElementById('skills-title');
    if (title) title.textContent = data.title;

    var fragment = document.createDocumentFragment();
    var icons = { web: '🌐', java: '☕', python: '🐍' };
    var progress = { web: 90, java: 85, python: 88 };

    ['web', 'java', 'python'].forEach(function(key) {
        var skill = data[key];
        if (!skill) return;
        var card = document.createElement('div');
        card.className = 'skill-card';
        card.dataset.skill = key;
        card.style.setProperty('--progress', progress[key] + '%');
        card.innerHTML = `
            <div class="skill-card-header">
                <div class="skill-icon-wrapper">${icons[key]}</div>
                <div class="skill-title">${skill.title}</div>
            </div>
            <div class="skill-description">${skill.description}</div>
            <div class="skill-progress">
                <div class="progress-bar"><div class="progress-fill" style="width: ${progress[key]}%"></div></div>
            </div>
            <div class="skill-tech">
                ${skill.technologies.slice(0,6).map(function(t) { return '<span class="tech-badge">' + t + '</span>'; }).join('')}
                ${skill.technologies.length > 6 ? '<span class="tech-badge">+' + (skill.technologies.length-6) + ' más</span>' : ''}
            </div>
            <div class="skill-hint">🔍 ${currentLanguage === 'es' ? 'Explorar especialidad' : 'Explore specialty'}</div>
        `;
        card.addEventListener('click', function() { if (typeof openSkillModal === 'function') openSkillModal(skill); });
        fragment.appendChild(card);
    });
    container.innerHTML = '';
    container.appendChild(fragment);
}

// ============================================
// PROJECTS - CON MÁS DETALLE
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
    var icons = ['🎨', '🤖', '📱', '☕', '🐍'];

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
                ${project.technologies.slice(0,4).map(function(t) { return '<span class="project-tech-tag">' + t + '</span>'; }).join('')}
                ${project.technologies.length > 4 ? '<span class="project-tech-tag">+' + (project.technologies.length-4) + '</span>' : ''}
            </div>
            <div class="project-hint">${currentLanguage === 'es' ? 'Ver detalles del proyecto' : 'View project details'}</div>
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
        btn.onclick = function(e) { e.preventDefault();
            setLanguage(btn.dataset.lang); };
    });
    updateAllTranslations();
}

window.t = t;
window.tObject = tObject;
window.setLanguage = setLanguage;
window.initLanguageSwitcher = initLanguageSwitcher;
window.updateAllTranslations = updateAllTranslations;