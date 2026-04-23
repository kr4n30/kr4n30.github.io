/**
 * Router SPA - Maneja la navegación y carga de secciones
 */

// Configuración de rutas disponibles
const ROUTES = {
    home: { file: 'sections/home.html', title: 'Inicio' },
    about: { file: 'sections/about.html', title: 'Acerca de' },
    projects: { file: 'sections/projects.html', title: 'Proyectos' }
};

// Variable para controlar animación
let isTransitioning = false;

/**
 * Carga una sección HTML desde el servidor y la inyecta en el contenedor
 * @param {string} sectionName - Nombre de la sección (home, about, projects)
 */
async function loadSection(sectionName) {
    // Prevenir múltiples cargas simultáneas
    if (isTransitioning) return;

    // Validar que la sección existe
    if (!ROUTES[sectionName]) {
        console.error(`Sección "${sectionName}" no encontrada`);
        sectionName = 'home';
    }

    const route = ROUTES[sectionName];
    const container = document.getElementById('app-content');

    if (!container) return;

    isTransitioning = true;

    // Animación de salida suave
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';

    try {
        // Fetch del HTML de la sección
        const response = await fetch(route.file);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        // Pequeño delay para la animación
        setTimeout(() => {
            // Inyectar el HTML
            container.innerHTML = html;

            // Actualizar título de la página
            document.title = `${CONFIG.name} | ${route.title}`;

            // Ejecutar la función de inicialización del perfil
            if (typeof initProfile === 'function') {
                initProfile();
            }

            // Re-inicializar navegación dentro de la sección (para links con data-nav)
            initNavigationLinks();

            // Animación de entrada
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
 * @param {string} sectionName - Nombre de la sección
 * @param {boolean} pushState - Si debe agregar al historial (default true)
 */
function navigateTo(sectionName, pushState = true) {
    if (!ROUTES[sectionName]) {
        sectionName = 'home';
    }

    if (pushState) {
        // Actualizar URL sin recargar la página
        const newUrl = `${window.location.pathname}#${sectionName}`;
        window.history.pushState({ section: sectionName }, '', newUrl);
    }

    loadSection(sectionName);
}

/**
 * Inicializa los links de navegación dentro del contenido dinámico
 */
function initNavigationLinks() {
    // Buscar todos los elementos con data-nav
    const navLinks = document.querySelectorAll('[data-nav]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-nav');
            if (section && ROUTES[section]) {
                navigateTo(section);
            }
        });
    });
}

/**
 * Maneja el evento popstate (botón atrás/adelante del navegador)
 */
function handlePopState() {
    const hash = window.location.hash.slice(1); // Remover el '#'
    const section = hash && ROUTES[hash] ? hash : 'home';
    navigateTo(section, false);
}