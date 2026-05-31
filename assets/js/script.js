// ============================================
// KR4N30 v12.0 - SCRIPT PRINCIPAL
// SOLO funciones de UI general (tema, scroll, formulario)
// ============================================

var APP_CONFIG = {
    SCROLL_TOP_OFFSET: 80
};

// ============================================
// SCROLL OPTIMIZADO
// ============================================

function setupScrollOptimized() {
    var scrollTop = document.getElementById('scrollTop');
    if (!scrollTop) return;
    var ticking = false;
    window.addEventListener('scroll', function() {
        if (ticking) return;
        requestAnimationFrame(function() {
            if (window.scrollY > 500) {
                scrollTop.classList.add('show');
            } else {
                scrollTop.classList.remove('show');
            }
            ticking = false;
        });
        ticking = true;
    });
    scrollTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// TEMA OSCURO/CLARO
// ============================================

function setupTheme() {
    var getPreferredTheme = function() {
        var saved = localStorage.getItem('theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    document.documentElement.setAttribute('data-theme', getPreferredTheme());
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            var newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// ============================================
// FORMULARIO DE CONTACTO
// ============================================

function setupContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var orig = btn.innerHTML;
        var sendingText = (window.t && window.t('contact.sending')) || 'Enviando...';
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + sendingText;
        setTimeout(function() {
            var successText = (window.t && window.t('contact.success')) || '✓ Mensaje enviado correctamente';
            var formStatus = document.getElementById('formStatus');
            if (formStatus) {
                formStatus.innerHTML = '<span style="color:#007BFF">' + successText + '</span>';
            }
            form.reset();
            btn.innerHTML = orig;
            setTimeout(function() {
                if (formStatus) formStatus.innerHTML = '';
            }, 3000);
        }, 1000);
    });
}

// ============================================
// SCROLL SUAVE
// ============================================

function setupSmoothScroll() {
    function smoothScroll(target) {
        var element = document.querySelector(target);
        if (element) {
            window.scrollTo({ top: element.offsetTop - APP_CONFIG.SCROLL_TOP_OFFSET, behavior: 'smooth' });
        }
    }
    var exploreBtn = document.getElementById('exploreBtn');
    if (exploreBtn) exploreBtn.addEventListener('click', function() { smoothScroll('#servicios'); });
    var contactBtn = document.getElementById('contactBtn');
    if (contactBtn) contactBtn.addEventListener('click', function() { smoothScroll('#contacto'); });
    var navLinks = document.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
        var link = navLinks[i];
        link.addEventListener('click', function(e) {
            e.preventDefault();
            smoothScroll(this.getAttribute('href'));
        });
    }
}

// ============================================
// MENÚ HAMBURGUESA
// ============================================

function setupMobileMenu() {
    var menuToggle = document.getElementById('menuToggle');
    var navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        });
        var links = document.querySelectorAll('.nav-link');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        }
    }
}

// ============================================
// EMAIL PROTEGIDO
// ============================================

function setupEmail() {
    var emailLink = document.getElementById('emailLink');
    if (emailLink) {
        emailLink.href = 'mailto:info@kr4n30.com';
        emailLink.textContent = 'info@kr4n30.com';
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

function init() {
    setupScrollOptimized();
    setupTheme();
    setupContactForm();
    setupSmoothScroll();
    setupMobileMenu();
    setupEmail();
    console.log('🚀 KR4N30 - Script Principal Inicializado');
}

init();