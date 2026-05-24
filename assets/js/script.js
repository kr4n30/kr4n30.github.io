// ========== KR4N30 MORADO - SCRIPT PRINCIPAL ==========

document.addEventListener('DOMContentLoaded', () => {

    // Inicializar Swiper
    const swiper = new Swiper('#heroSwiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        speed: 600,
        effect: 'slide',
        grabCursor: true,
        touchRatio: 1.2,
    });

    // Header scroll effect
    const header = document.getElementById('siteHeader');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.background = 'rgba(10, 10, 15, 0.98)';
                header.style.backdropFilter = 'blur(12px)';
            } else {
                header.style.background = 'rgba(10, 10, 15, 0.95)';
                header.style.backdropFilter = 'blur(12px)';
            }
        });
    }

    // Menú móvil
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    function closeNav() {
        if (navLinks) navLinks.classList.remove('open');
    }

    function openNav(e) {
        if (e) e.stopPropagation();
        if (navLinks) navLinks.classList.add('open');
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', openNav);
        menuToggle.addEventListener('touchstart', openNav);
    }

    if (navLinks) {
        document.querySelectorAll('#navLinks a').forEach(link => {
            link.addEventListener('click', closeNav);
        });
    }

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function (event) {
        if (navLinks && navLinks.classList.contains('open')) {
            if (menuToggle && !navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
                closeNav();
            }
        }
    });

    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            if (!btn) return;

            const originalText = btn.innerText;
            btn.innerText = '⟡ ENVIANDO... ⟡';
            btn.disabled = true;

            setTimeout(() => {
                showFormNotification('✅ Mensaje enviado correctamente. Te contactaremos pronto.', 'success');
                contactForm.reset();
                btn.innerText = originalText;
                btn.disabled = false;
            }, 800);
        });
    }

    function showFormNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#a855f7'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-family: monospace;
            font-weight: bold;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Estilos de animación
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Animación al scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .feature-item, .project-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});