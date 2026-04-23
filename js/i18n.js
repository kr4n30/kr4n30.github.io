// ============================================================
//  INTERNATIONALIZATION (i18n) MODULE
// ============================================================

let currentLanguage = CONFIG.defaultLanguage || 'es';

/**
 * Obtiene una traducción específica
 */
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

/**
 * Obtiene un array de traducciones
 */
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

/**
 * Cambia el idioma actual
 */
function setLanguage(lang) {
    if (lang === 'es' || lang === 'en') {
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);

        // Actualizar toda la interfaz
        updateAllTranslations();

        // Actualizar estado activo de los botones de idioma
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Feedback háptico
        if (navigator.vibrate) navigator.vibrate(20);
    }
}

/**
 * Actualiza todas las traducciones en la página actual
 */
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

    // Actualizar navegación
    updateNavTranslations();
}

/**
 * Actualiza traducciones de la página Home
 */
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

/**
 * Actualiza traducciones de la página About
 */
function updateAboutTranslations() {
    const aboutContent = document.getElementById('about-content');
    if (!aboutContent) return;

    const aboutTexts = CONFIG.translations[currentLanguage].about;

    // Actualizar título
    const titleEl = document.getElementById('about-title');
    if (titleEl) titleEl.textContent = aboutTexts.title;

    // Actualizar contenido
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

/**
 * Actualiza traducciones de la página Projects
 */
function updateProjectsTranslations() {
    const projectsContent = document.getElementById('projects-content');
    if (!projectsContent) return;

    const projectsTexts = CONFIG.translations[currentLanguage].projects;
    const projectsList = tArray('projects', 'projects');

    // Actualizar título
    const titleEl = document.getElementById('projects-title');
    if (titleEl) titleEl.textContent = projectsTexts.title;

    // Actualizar botón de volver
    const backButton = document.getElementById('back-button');
    if (backButton) {
        const span = backButton.querySelector('.lbl');
        if (span) span.textContent = projectsTexts.backButton;
    }

    // Actualizar lista de proyectos
    let projectsHtml = '';
    projectsList.forEach(project => {
        projectsHtml += `
            <div style="background: rgba(255,255,255,0.03); border-radius: 16px; padding: 15px; border-left: 3px solid var(--accent);">
                <div style="font-weight: bold; margin-bottom: 5px;">${project.name}</div>
                <div style="font-size: 0.85rem; color: var(--sub);">${project.description}</div>
            </div>
        `;
    });

    projectsContent.innerHTML = projectsHtml;
}

/**
 * Actualiza traducciones de la navegación
 */
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

/**
 * Inicializa los botones de idioma
 */
function initLanguageSwitcher() {
    // Cargar idioma guardado
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
        currentLanguage = savedLang;
    }

    // Configurar botones
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.removeEventListener('click', handleLangClick);
        btn.addEventListener('click', handleLangClick);

        // Marcar botón activo
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
    const lang = this.dataset.lang;
    setLanguage(lang);
}

// Exponer funciones globalmente
window.t = t;
window.tArray = tArray;
window.setLanguage = setLanguage;
window.initLanguageSwitcher = initLanguageSwitcher;
window.updateAllTranslations = updateAllTranslations;