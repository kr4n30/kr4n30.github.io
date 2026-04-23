// ============================================================
// ROUTER SPA — ULTRA PRO (FINAL CLEAN)
// ============================================================

const ROUTES = {
    home: { file: 'sections/home.html', title: 'Inicio' },
    about: { file: 'sections/about.html', title: 'Acerca de' },
    skills: { file: 'sections/skills.html', title: 'Habilidades' },
    projects: { file: 'sections/projects.html', title: 'Proyectos' }
};

let sectionCache = {};
let currentController = null;
let currentSection = null;

const idle = window.requestIdleCallback || function(cb) { return setTimeout(cb, 1); };

function loadSection(sectionName) {
    if (!ROUTES[sectionName]) sectionName = 'home';
    if (sectionName === currentSection) return;

    const route = ROUTES[sectionName];
    const container = document.getElementById('app-content');
    if (!container) return;

    currentSection = sectionName;

    if (currentController) currentController.abort();
    currentController = new AbortController();

    if (typeof window.cleanupSection === 'function') {
        try { window.cleanupSection(); } catch (_) {}
    }

    container.style.willChange = 'transform, opacity';
    container.style.transition = 'opacity .25s ease, transform .25s ease';
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px) scale(.98)';

    function render(html) {
        container.innerHTML = html;
        document.title = `${CONFIG.name} | ${route.title}`;
        initNavigationLinks();
        updateActiveNav(sectionName);
        if (window.initProfile) window.initProfile();
        if (window.initLanguageSwitcher) window.initLanguageSwitcher();
        requestAnimationFrame(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0) scale(1)';
        });
        try { localStorage.setItem('lastSection', sectionName); } catch (_) {}
        idle(() => prefetchRoutes(sectionName));
    }

    if (sectionCache[sectionName]) {
        render(sectionCache[sectionName]);
        return;
    }

    fetch(route.file, { signal: currentController.signal })
        .then(res => { if (!res.ok) throw new Error(res.status); return res.text(); })
        .then(html => { sectionCache[sectionName] = html;
            render(html); })
        .catch(err => {
            if (err.name === 'AbortError') return;
            render(`<div class="error"><div class="name">Error</div><div class="tagline">No se pudo cargar</div><button class="link-btn" data-nav="home">🏠 Volver</button></div>`);
        });
}

function navigateTo(sectionName, pushState = true) {
    if (!ROUTES[sectionName]) sectionName = 'home';
    if (pushState) history.pushState({ section: sectionName }, '', '#' + sectionName);
    loadSection(sectionName);
}

function initNavigationLinks() {
    document.querySelectorAll('[data-nav]').forEach(el => { el.onclick = handleNavClick; });
}

function handleNavClick(e) {
    e.preventDefault();
    const section = this.dataset.nav;
    if (!section) return;
    navigateTo(section);
    if ('vibrate' in navigator) navigator.vibrate(20);
}

function updateActiveNav(sectionName) {
    document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.toggleAttribute('data-active', btn.dataset.nav === sectionName);
    });
}

function prefetchRoutes(current) {
    Object.keys(ROUTES).forEach(key => {
        if (key === current || sectionCache[key]) return;
        fetch(ROUTES[key].file).then(r => r.ok ? r.text() : null).then(html => { if (html) sectionCache[key] = html; }).catch(() => {});
    });
}

function handlePopState() {
    const section = location.hash.replace('#', '') || 'home';
    navigateTo(section, false);
}

function initRouter() {
    window.addEventListener('popstate', handlePopState);
    let saved = null;
    try { saved = localStorage.getItem('lastSection'); } catch (_) {}
    const initial = location.hash.replace('#', '') || saved || 'home';
    navigateTo(initial, false);
}

window.navigateTo = navigateTo;
window.initRouter = initRouter;