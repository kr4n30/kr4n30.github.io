// ============================================
// KR4N30 v13.0 - SCRIPT PRINCIPAL PROFESIONAL
// UI GENERAL + STATE SYSTEM + OPTIMIZACIÓN
// ============================================

const APP_CONFIG = {
    SCROLL_TOP_OFFSET: 80
};

// ============================================
// STATE SYSTEM (BASE PARA ESCALAR)
// ============================================

const state = {
    theme: 'light',
    menuOpen: false,
    sendingForm: false
};

// ============================================
// SCROLL OPTIMIZADO
// ============================================

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

// ============================================
// TEMA OSCURO/CLARO (ROBUSTO CON PERSISTENCIA)
// ============================================

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

// ============================================
// FORMULARIO (UX MEJORADO + ANTI SPAM BÁSICO)
// ============================================

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
            // Simulación (aquí luego conectas API real)
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

// ============================================
// SMOOTH SCROLL CORREGIDO (CON getBoundingClientRect)
// ============================================

function setupSmoothScroll() {
    const smoothScroll = (target) => {
        const element = document.querySelector(target);
        if (!element) return;

        const y = element.getBoundingClientRect().top +
            window.pageYOffset -
            APP_CONFIG.SCROLL_TOP_OFFSET;

        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const exploreBtn = document.getElementById('exploreBtn');
    const contactBtn = document.getElementById('contactBtn');

    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => smoothScroll('#servicios'));
    }

    if (contactBtn) {
        contactBtn.addEventListener('click', () => smoothScroll('#contacto'));
    }

    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScroll(link.getAttribute('href'));
        });
    });
}

// ============================================
// MENÚ HAMBURGUESA (ACCESIBLE)
// ============================================

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

// ============================================
// EMAIL PROTEGIDO (ANTI-SCRAPING)
// ============================================

function setupEmail() {
    const emailLink = document.getElementById('emailLink');
    if (!emailLink) return;

    const user = 'info';
    const domain = 'kr4n30.com';

    const email = `${user}@${domain}`;

    emailLink.href = `mailto:${email}`;
    emailLink.textContent = email;
}

// ============================================
// INICIALIZACIÓN (MÓDULO PRINCIPAL)
// ============================================

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

// Iniciar aplicación
KR4N30.init();