/**
 * Router SPA - Maneja la navegación y carga de secciones
 */

// Configuración de rutas disponibles
const ROUTES = {
    home: { file: 'sections/home.html', title: 'Inicio' },
    about: { file: 'sections/about.html', title: 'Acerca de' },
    skills: { file: 'sections/skills.html', title: 'Habilidades' },
    projects: { file: 'sections/projects.html', title: 'Proyectos' }
};

// Variable para controlar animación
let isTransitioning = false;

/**
 * Carga una sección HTML desde el servidor y la inyecta en el contenedor
 */
async function loadSection(sectionName) {
    if (isTransitioning) return;

    if (!ROUTES[sectionName]) {
        console.error(`Sección "${sectionName}" no encontrada`);
        sectionName = 'home';
    }

    const route = ROUTES[sectionName];
    const container = document.getElementById('app-content');

    if (!container) return;

    isTransitioning = true;

    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';

    try {
        const response = await fetch(route.file);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        setTimeout(() => {
            container.innerHTML = html;

            document.title = `${CONFIG.name} | ${route.title}`;

            if (typeof initProfile === 'function') {
                initProfile();
            }

            initNavigationLinks();

            // Reinicializar el selector de idioma después de cargar la sección
            if (typeof initLanguageSwitcher === 'function') {
                initLanguageSwitcher();
            }

            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';

            isTransitioning = false;
        }, 200);

    } catch (error) {
        console.error('Error cargando sección:', error);
        container.innerHTML = `
            <div class="card">
                <div class="name">Error</div>
                <div class="tagline">No se pudo cargar esta sección</div>
                <div class="links">
                    <a href="#" class="link-btn" data-nav="home">
                        <span class="icon">🏠</span>
                        <span class="lbl">Volver al inicio</span>
                    </a>
                </div>
            </div>
        `;
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        isTransitioning = false;
        initNavigationLinks();
    }
}

/**
 * Navega a una sección actualizando la URL y cargando el contenido
 */
function navigateTo(sectionName, pushState = true) {
    if (!ROUTES[sectionName]) {
        sectionName = 'home';
    }

    if (pushState) {
        const newUrl = `${window.location.pathname}#${sectionName}`;
        window.history.pushState({ section: sectionName }, '', newUrl);
    }

    loadSection(sectionName);
}

/**
 * Inicializa los links de navegación dentro del contenido dinámico
 */
function initNavigationLinks() {
    const navLinks = document.querySelectorAll('[data-nav]');

    navLinks.forEach(link => {
        link.removeEventListener('click', handleNavClick);
        link.addEventListener('click', handleNavClick);
    });
}

function handleNavClick(e) {
    e.preventDefault();
    const section = this.getAttribute('data-nav');

    if (section && ROUTES[section]) {
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.removeAttribute('data-active');
        });
        this.setAttribute('data-active', 'true');

        navigateTo(section);
    }

    if (navigator.vibrate) navigator.vibrate(20);
}

/**
 * Maneja el evento popstate
 */
function handlePopState() {
    const hash = window.location.hash.slice(1);
    const section = hash && ROUTES[hash] ? hash : 'home';
    navigateTo(section, false);
}

// Exponer funciones globalmente
window.navigateTo = navigateTo;
window.handlePopState = handlePopState;
window.initNavigationLinks = initNavigationLinks;