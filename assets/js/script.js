// ============================================
// KR4N30 v13.0 - SCRIPT PRINCIPAL PROFESIONAL
// ============================================

const APP_CONFIG = {
    SCROLL_TOP_OFFSET: 80
};

const state = {
    theme: 'light',
    menuOpen: false,
    sendingForm: false
};

function setupScrollOptimized() {
    const scrollTop = document.getElementById('scrollTop');
    if (!scrollTop) return;

    const onScroll = () => {
        scrollTop.classList.toggle('show', window.scrollY > 500);
    };

    window.addEventListener('scroll', () => requestAnimationFrame(onScroll));

    scrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function setupTheme() {
    const saved = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = saved || (systemDark ? 'dark' : 'light');

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        state.theme = theme;
    };

    applyTheme(initialTheme);

    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }
}

function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const btn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (state.sendingForm) return;
        state.sendingForm = true;

        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            await new Promise(r => setTimeout(r, 1000));
            const status = document.getElementById('formStatus');
            if (status) {
                status.innerHTML = '✓ Mensaje enviado correctamente';
                status.style.color = '#007BFF';
            }
            form.reset();
            setTimeout(() => {
                if (status) status.innerHTML = '';
            }, 3000);
        } catch (err) {
            console.error('Error formulario:', err);
            const status = document.getElementById('formStatus');
            if (status) {
                status.innerHTML = '✗ Error al enviar. Intenta de nuevo.';
                status.style.color = '#ff4444';
                setTimeout(() => {
                    if (status) status.innerHTML = '';
                }, 3000);
            }
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            state.sendingForm = false;
        }
    });
}

function setupSmoothScroll() {
    const smoothScroll = (target) => {
        const element = document.querySelector(target);
        if (!element) return;
        const y = element.getBoundingClientRect().top + window.pageYOffset - APP_CONFIG.SCROLL_TOP_OFFSET;
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const exploreBtn = document.getElementById('exploreBtn');
    const contactBtn = document.getElementById('contactBtn');

    if (exploreBtn) exploreBtn.addEventListener('click', () => smoothScroll('#servicios'));
    if (contactBtn) contactBtn.addEventListener('click', () => smoothScroll('#contacto'));

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScroll(link.getAttribute('href'));
        });
    });
}

function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (!menuToggle || !navLinks) return;

    menuToggle.setAttribute('aria-controls', 'navLinks');

    menuToggle.addEventListener('click', () => {
        state.menuOpen = !state.menuOpen;
        navLinks.classList.toggle('active', state.menuOpen);
        menuToggle.setAttribute('aria-expanded', state.menuOpen);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            state.menuOpen = false;
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

function setupEmail() {
    const emailLink = document.getElementById('emailLink');
    if (!emailLink) return;
    emailLink.href = 'mailto:info@kr4n30.com';
    emailLink.textContent = 'info@kr4n30.com';
}
// ============================================
// EFECTO MAGNÉTICO EN BOTONES
// ============================================

function setupMagneticEffect() {
    const magneticBtns = document.querySelectorAll('.magnetic');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Efecto magnético (desplazamiento)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const moveX = (x - centerX) * 0.15;
            const moveY = (y - centerY) * 0.15;

            this.style.transform = `translate(${moveX}px, ${moveY}px)`;

            // Actualizar posición del glow
            const glow = this.querySelector('.btn-glow');
            if (glow) {
                glow.style.setProperty('--x', `${(x / rect.width) * 100}%`);
                glow.style.setProperty('--y', `${(y / rect.height) * 100}%`);
            }
        });

        btn.addEventListener('mouseleave', function () {
            this.style.transform = 'translate(0, 0)';
        });
    });
}

// Efecto de brillo en badge
function setupBadgeGlow() {
    const badge = document.querySelector('.hero-badge');
    if (badge) {
        badge.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const glow = this.querySelector('.badge-glow');
            if (glow) {
                glow.style.setProperty('--x', `${(x / rect.width) * 100}%`);
                glow.style.setProperty('--y', `${(y / rect.height) * 100}%`);
            }
        });
    }
}

// Contador animado con easing
function animateCounterEasing(element, target, duration = 2000) {
    if (!element) return;
    const start = performance.now();
    const startValue = parseInt(element.textContent) || 0;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = Math.floor(startValue + (target - startValue) * eased);
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function init() {
    setupScrollOptimized();
    setupTheme();
    setupContactForm();
    setupSmoothScroll();
    setupMobileMenu();
    setupEmail();
    setupPremiumEffects(); // <-- NUEVA LÍNEA
    console.log('🚀 KR4N30 v13.0 Inicializado correctamente');
}

// Integrar con la inicialización existente
// Agrega esta línea dentro de tu función init() existente:
// setupPremiumEffects();

// Actualizar stats observer para usar el nuevo easing
function setupStatsObserver() {
    const statsSection = document.getElementById('heroStats');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && PROJECTS_DATA) {
                const projectsCount = getProjectsArray().length;
                animateCounterEasing(document.getElementById('stat-projects'), projectsCount);
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });
    observer.observe(statsSection);
}
const KR4N30 = (() => {
    function init() {
        setupScrollOptimized();
        setupTheme();
        setupContactForm();
        setupSmoothScroll();
        setupMobileMenu();
        setupEmail();
        console.log('🚀 KR4N30 v13.0 Inicializado correctamente');
    }
    return { init };
})();

KR4N30.init();