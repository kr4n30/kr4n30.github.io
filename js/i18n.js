// ============================================================
//  INTERNATIONALIZATION (i18n) MODULE
// ============================================================

let currentLanguage = CONFIG.defaultLanguage || 'es';

function t(page, key) {
    try {
        const translation = CONFIG.translations[currentLanguage][page][key];
        if (!translation) {
            console.warn(`Translation missing: ${currentLanguage}.${page}.${key}`);
            return key;
        }
        return translation;
    } catch (error) {
        console.error('Translation error:', error);
        return key;
    }
}

function tArray(page, key) {
    try {
        const translation = CONFIG.translations[currentLanguage][page][key];
        if (!Array.isArray(translation)) {
            console.warn(`Translation array missing: ${currentLanguage}.${page}.${key}`);
            return [];
        }
        return translation;
    } catch (error) {
        console.error('Translation error:', error);
        return [];
    }
}

function setLanguage(lang) {
    if (lang === 'es' || lang === 'en') {
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);

        updateAllTranslations();

        // Actualizar estado activo de los botones de idioma (ambos tipos)
        document.querySelectorAll('.lang-btn-top, .lang-btn').forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Feedback háptico
        if (navigator.vibrate) navigator.vibrate(20);

        // Efecto visual adicional
        const activeBtn = document.querySelector(`.lang-btn-top[data-lang="${lang}"]`);
        if (activeBtn) {
            activeBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                if (activeBtn) activeBtn.style.transform = '';
            }, 150);
        }
    }
}

function updateAllTranslations() {
    const currentSection = window.location.hash.slice(1) || 'home';

    switch (currentSection) {
        case 'home':
            updateHomeTranslations();
            break;
        case 'about':
            updateAboutTranslations();
            break;
        case 'projects':
            updateProjectsTranslations();
            break;
    }

    updateNavTranslations();
}

function updateHomeTranslations() {
    const taglineEl = document.getElementById('tagline-el');
    if (!taglineEl) return;

    const homeTexts = CONFIG.translations[currentLanguage].home;

    taglineEl.innerHTML = `
        <div class="tagline-main">${homeTexts.welcome}</div>
        <div class="tagline-text">${homeTexts.description}</div>
        <div class="tagline-highlight">${homeTexts.highlight}</div>
    `;
}

function updateAboutTranslations() {
    const aboutContent = document.getElementById('about-content');
    if (!aboutContent) return;

    const aboutTexts = CONFIG.translations[currentLanguage].about;

    const titleEl = document.getElementById('about-title');
    if (titleEl) titleEl.textContent = aboutTexts.title;

    aboutContent.innerHTML = `
        <p style="margin-bottom: 15px; line-height: 1.6;">
            ${aboutTexts.greeting} <strong>${aboutTexts.name}</strong>, ${aboutTexts.description1}
        </p>
        <p style="margin-bottom: 15px; line-height: 1.6;">
            ${aboutTexts.description2}
        </p>
        <p style="margin-bottom: 15px; line-height: 1.6;">
            ${aboutTexts.description3}
        </p>
        <div class="divider"></div>
        <p style="font-size: 0.9rem; color: var(--accent);">
            ${aboutTexts.availability}
        </p>
    `;
}

function updateProjectsTranslations() {
    const projectsContent = document.getElementById('projects-content');
    if (!projectsContent) return;

    const projectsTexts = CONFIG.translations[currentLanguage].projects;
    const projectsList = tArray('projects', 'projects');

    const titleEl = document.getElementById('projects-title');
    if (titleEl) titleEl.textContent = projectsTexts.title;

    const backButton = document.getElementById('back-button');
    if (backButton) {
        const span = backButton.querySelector('.lbl');
        if (span) span.textContent = projectsTexts.backButton;
    }

    let projectsHtml = '';
    projectsList.forEach((project, index) => {
        projectsHtml += `
            <div class="project-card" data-project-index="${index}" style="background: rgba(255,255,255,0.03); border-radius: 16px; padding: 15px; border-left: 3px solid var(--accent); cursor: pointer; transition: all 0.25s ease;">
                <div style="font-weight: bold; margin-bottom: 5px;">${project.name}</div>
                <div style="font-size: 0.85rem; color: var(--sub);">${project.description}</div>
                <div style="margin-top: 10px; font-size: 0.7rem; color: var(--accent);">🔗 ${currentLanguage === 'es' ? 'Haz clic para más detalles' : 'Click for more details'}</div>
            </div>
        `;
    });

    projectsContent.innerHTML = projectsHtml;

    // Añadir event listeners a los proyectos
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.projectIndex);
            const project = projectsList[index];
            if (project && typeof openModal === 'function') {
                openModal(project);
            }
        });

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateX(5px)';
            card.style.background = 'rgba(167, 139, 250, 0.1)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateX(0)';
            card.style.background = 'rgba(255,255,255,0.03)';
        });
    });
}

function updateNavTranslations() {
    const navTexts = CONFIG.translations[currentLanguage].nav;

    document.querySelectorAll('.nav-btn').forEach(btn => {
        const navSection = btn.dataset.nav;
        const span = btn.querySelector('span');
        if (span && navTexts[navSection]) {
            span.textContent = navTexts[navSection];
        }
    });
}

function initLanguageSwitcher() {
    // Cargar idioma guardado
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
        currentLanguage = savedLang;
    }

    // Configurar botones de idioma (ambos tipos)
    const langBtns = document.querySelectorAll('.lang-btn-top, .lang-btn');
    langBtns.forEach(btn => {
        btn.removeEventListener('click', handleLangClick);
        btn.addEventListener('click', handleLangClick);

        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        }
    });

    // Actualizar contenido inicial
    setTimeout(() => {
        updateAllTranslations();
    }, 100);
}

function handleLangClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const lang = this.dataset.lang;
    setLanguage(lang);
}

// Exponer funciones globalmente
window.t = t;
window.tArray = tArray;
window.setLanguage = setLanguage;
window.initLanguageSwitcher = initLanguageSwitcher;
window.updateAllTranslations = updateAllTranslations;