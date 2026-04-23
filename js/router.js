// ============================================================
// ROUTER SPA — FINAL VERSION (PRO)
// ============================================================

var ROUTES = {
    home: { file: 'sections/home.html', title: 'Inicio' },
    about: { file: 'sections/about.html', title: 'Acerca de' },
    skills: { file: 'sections/skills.html', title: 'Habilidades' },
    projects: { file: 'sections/projects.html', title: 'Proyectos' }
};

var sectionCache = {};
var currentRequestId = 0;

// ============================================================
// LOAD SECTION
// ============================================================
function loadSection(sectionName) {

    if (!ROUTES[sectionName]) {
        console.warn('Ruta no válida:', sectionName);
        sectionName = 'home';
    }

    var route = ROUTES[sectionName];
    var container = document.getElementById('app-content');

    if (!container) return;

    currentRequestId++;
    var requestId = currentRequestId;

    // 🔥 limpiar sección anterior (si existe)
    if (typeof window.cleanupSection === 'function') {
        try {
            window.cleanupSection();
        } catch (e) {
            console.warn('Error en cleanup:', e);
        }
    }

    // animación salida
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';

    function render(html) {

        if (requestId !== currentRequestId) return;

        container.innerHTML = html;

        document.title = CONFIG.name + ' | ' + route.title;

        initNavigationLinks();
        updateActiveNav(sectionName);

        if (typeof initLanguageSwitcher === 'function') {
            initLanguageSwitcher();
        }

        // animación entrada
        requestAnimationFrame(function() {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        });

        // 🔥 guardar última sección
        try {
            localStorage.setItem('lastSection', sectionName);
        } catch (e) {}

        // 🔥 prefetch silencioso
        prefetchRoutes(sectionName);
    }

    // ========================================================
    // CACHE
    // ========================================================
    if (sectionCache[sectionName]) {
        render(sectionCache[sectionName]);
        return;
    }

    // ========================================================
    // FETCH
    // ========================================================
    fetch(route.file)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.text();
        })
        .then(function(html) {
            sectionCache[sectionName] = html;
            render(html);
        })
        .catch(function(error) {
            console.error('Error cargando sección:', error);

            render(
                '<div class="error">' +
                '<div class="name">Error</div>' +
                '<div class="tagline">No se pudo cargar esta sección</div>' +
                '<button class="link-btn" data-nav="home">🏠 Volver</button>' +
                '</div>'
            );
        });
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(sectionName, pushState) {

    if (pushState === undefined) pushState = true;

    if (!ROUTES[sectionName]) {
        sectionName = 'home';
    }

    if (pushState) {
        var newUrl = window.location.pathname + '#' + sectionName;
        window.history.pushState({ section: sectionName }, '', newUrl);
    }

    loadSection(sectionName);
}

// ============================================================
// NAV LINKS
// ============================================================
function initNavigationLinks() {
    var links = document.querySelectorAll('[data-nav]');

    links.forEach(function(link) {
        link.removeEventListener('click', handleNavClick);
        link.addEventListener('click', handleNavClick);
    });
}

function handleNavClick(e) {
    e.preventDefault();

    var section = this.getAttribute('data-nav');

    if (section && ROUTES[section]) {
        navigateTo(section);
    }

    if (navigator.vibrate) navigator.vibrate(20);
}

// ============================================================
// ACTIVE NAV UI
// ============================================================
function updateActiveNav(sectionName) {
    document.querySelectorAll('[data-nav]').forEach(function(btn) {
        btn.removeAttribute('data-active');

        if (btn.getAttribute('data-nav') === sectionName) {
            btn.setAttribute('data-active', 'true');
        }
    });
}

// ============================================================
// PREFETCH (UX PRO)
// ============================================================
function prefetchRoutes(current) {

    Object.keys(ROUTES).forEach(function(key) {

        if (key === current) return;
        if (sectionCache[key]) return;

        fetch(ROUTES[key].file)
            .then(function(res) {
                if (!res.ok) return;
                return res.text();
            })
            .then(function(html) {
                if (html) sectionCache[key] = html;
            })
            .catch(function() {});
    });
}

// ============================================================
// BACK / FORWARD
// ============================================================
function handlePopState() {
    var hash = window.location.hash.replace('#', '');
    var section = hash && ROUTES[hash] ? hash : 'home';
    navigateTo(section, false);
}

// ============================================================
// INIT ROUTER
// ============================================================
function initRouter() {

    window.addEventListener('popstate', handlePopState);

    var saved = null;

    try {
        saved = localStorage.getItem('lastSection');
    } catch (e) {}

    var initial =
        saved ||
        window.location.hash.replace('#', '') ||
        'home';

    navigateTo(initial, false);
}

// ============================================================
// EXPORTS
// ============================================================
window.navigateTo = navigateTo;
window.initNavigationLinks = initNavigationLinks;
window.handlePopState = handlePopState;
window.initRouter = initRouter;