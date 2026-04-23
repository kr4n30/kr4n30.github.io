// ============================================================
// ROUTER SPA — CON EFECTOS DE TRANSICIÓN PREMIUM
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
let isTransitioning = false;

const idle = window.requestIdleCallback || function(cb) { return setTimeout(cb, 1); };

// ============================================
// EFECTOS VISUALES
// ============================================

function createRippleEffect(element, event) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

function createWaveEffect() {
    const wave = document.createElement('div');
    wave.className = 'section-wave';
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 600);
}

function createParticleEffect(x, y) {
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'section-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
        particle.style.setProperty('--ty', (Math.random() - 0.5) * 150 - 50 + 'px');
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }
}

function addSectionGlow() {
    const card = document.querySelector('.card');
    if (card) {
        card.classList.add('section-changing');
        setTimeout(() => card.classList.remove('section-changing'), 500);
    }
}

// ============================================
// LOAD SECTION CON EFECTOS
// ============================================
async function loadSection(sectionName, clickEvent = null) {
    if (isTransitioning) return;
    if (!ROUTES[sectionName]) sectionName = 'home';
    if (sectionName === currentSection) return;

    const route = ROUTES[sectionName];
    const container = document.getElementById('app-content');
    if (!container) return;

    isTransitioning = true;
    currentSection = sectionName;

    // Efectos visuales al cambiar sección
    addSectionGlow();
    createWaveEffect();

    if (clickEvent) {
        createParticleEffect(clickEvent.clientX, clickEvent.clientY);
    }

    if (currentController) currentController.abort();
    currentController = new AbortController();

    if (typeof window.cleanupSection === 'function') {
        try { window.cleanupSection(); } catch (_) {}
    }

    // Animación de salida
    container.style.willChange = 'transform, opacity, filter';
    container.style.transition = 'all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
    container.style.opacity = '0';
    container.style.transform = 'scale(0.96) translateY(10px)';
    container.style.filter = 'blur(3px)';

    // Mostrar skeleton loader
    const skeletonHtml = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
        </div>
    `;

    function render(html) {
        // Pequeño delay para que la animación de salida se note
        setTimeout(() => {
            container.innerHTML = html;
            document.title = `${CONFIG.name} | ${route.title}`;

            initNavigationLinks();
            updateActiveNav(sectionName);

            if (window.initProfile) window.initProfile();
            if (window.initLanguageSwitcher) window.initLanguageSwitcher();

            // Animación de entrada
            requestAnimationFrame(() => {
                container.style.opacity = '1';
                container.style.transform = 'scale(1) translateY(0)';
                container.style.filter = 'blur(0)';

                // Añadir clase de animación a los nuevos elementos
                document.querySelectorAll('.about-card, .skill-card, .project-card, .stat-card, .hero-section, .quick-stats, .cta-section')
                    .forEach((el, index) => {
                        el.style.animation = 'none';
                        el.offsetHeight;
                        el.style.animation = `fadeInUp 0.5s ease forwards`;
                        el.style.animationDelay = `${index * 0.05}s`;
                    });
            });

            try { localStorage.setItem('lastSection', sectionName); } catch (_) {}
            idle(() => prefetchRoutes(sectionName));
            isTransitioning = false;
        }, 280);
    }

    if (sectionCache[sectionName]) {
        render(sectionCache[sectionName]);
        return;
    }

    try {
        const response = await fetch(route.file, { signal: currentController.signal });
        if (!response.ok) throw new Error(response.status);
        const html = await response.text();
        sectionCache[sectionName] = html;
        render(html);
    } catch (err) {
        if (err.name === 'AbortError') {
            isTransitioning = false;
            return;
        }
        render(`<div class="error"><div class="name">Error</div><div class="tagline">No se pudo cargar la sección</div><button class="link-btn" data-nav="home">🏠 Volver</button></div>`);
        isTransitioning = false;
    }
}

// ============================================
// NAVIGATION CON EFECTOS
// ============================================
function navigateTo(sectionName, pushState = true, event = null) {
    if (!ROUTES[sectionName]) sectionName = 'home';
    if (pushState) history.pushState({ section: sectionName }, '', '#' + sectionName);
    loadSection(sectionName, event);
}

function initNavigationLinks() {
    document.querySelectorAll('[data-nav]').forEach(el => {
        el.removeEventListener('click', handleNavClick);
        el.addEventListener('click', handleNavClick);
    });
}

function handleNavClick(e) {
    e.preventDefault();
    const section = this.dataset.nav;
    if (!section) return;

    // Efecto ripple en el botón clickeado
    createRippleEffect(this, e);

    navigateTo(section, true, e);

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

function handlePopState(e) {
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
window.createRippleEffect = createRippleEffect;