// ========== KR4N30 MORADO - SCRIPT PRINCIPAL MEJORADO ==========

document.addEventListener('DOMContentLoaded', () => {

    // ==========================
    // Inicializar Swiper
    // ==========================

    if (typeof Swiper !== 'undefined') {
        new Swiper('#heroSwiper', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            speed: 600,
            effect: 'slide',
            grabCursor: true,
            touchRatio: 1.2
        });
    }

    // ==========================
    // Header scroll effect optimizado
    // ==========================

    const header = document.getElementById('siteHeader');

    if (header) {

        let ticking = false;

        const updateHeader = () => {

            header.classList.toggle(
                'header-scrolled',
                window.scrollY > 50
            );

            ticking = false;
        };

        window.addEventListener('scroll', () => {

            if (!ticking) {

                requestAnimationFrame(updateHeader);

                ticking = true;
            }

        });

    }

    // ==========================
    // Menú móvil
    // ==========================

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    function closeNav() {

        if (!navLinks) return;

        navLinks.classList.remove('open');

        if (menuToggle) {
            menuToggle.setAttribute(
                'aria-expanded',
                'false'
            );
        }

    }

    function openNav(e) {

        e?.stopPropagation();

        if (!navLinks) return;

        navLinks.classList.toggle('open');

        if (menuToggle) {

            menuToggle.setAttribute(
                'aria-expanded',
                navLinks.classList.contains('open')
            );

        }

    }

    if (menuToggle) {

        menuToggle.setAttribute(
            'aria-expanded',
            'false'
        );

        menuToggle.addEventListener(
            'pointerup',
            openNav
        );

    }

    if (navLinks) {

        document
            .querySelectorAll('#navLinks a')
            .forEach(link => {

                link.addEventListener(
                    'click',
                    closeNav
                );

            });

    }

    // Cerrar menú fuera

    document.addEventListener(
        'click',
        event => {

            if (
                navLinks?.classList.contains('open')
            ) {

                if (
                    !navLinks.contains(event.target)
                    &&
                    !menuToggle?.contains(event.target)
                ) {

                    closeNav();

                }

            }

        }
    );

    // ==========================
    // Formulario
    // ==========================

    const contactForm =
        document.getElementById(
            'contactForm'
        );

    if (contactForm) {

        contactForm.addEventListener(
            'submit',
            e => {

                e.preventDefault();

                const btn =
                    contactForm.querySelector(
                        'button[type="submit"]'
                    );

                if (!btn) return;

                const originalText =
                    btn.innerText;

                btn.innerText =
                    '⟡ ENVIANDO... ⟡';

                btn.disabled = true;

                setTimeout(() => {

                    showFormNotification(
                        '✅ Mensaje enviado correctamente. Te contactaremos pronto.',
                        'success'
                    );

                    contactForm.reset();

                    btn.innerText =
                        originalText;

                    btn.disabled =
                        false;

                }, 800);

            }
        );

    }

    // ==========================
    // Notificaciones
    // ==========================

    function showFormNotification(
        message,
        type = 'info'
    ) {

        const notification =
            document.createElement(
                'div'
            );

        notification.className =
            `notification notification-${type}`;

        notification.textContent =
            message;

        document.body.appendChild(
            notification
        );

        setTimeout(() => {

            notification.classList.add(
                'hide'
            );

            setTimeout(() => {

                notification.remove();

            }, 300);

        }, 3000);

    }

    // ==========================
    // Smooth Scroll
    // ==========================

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(anchor => {

            anchor.addEventListener(
                'click',
                function (e) {

                    const targetId =
                        this.getAttribute(
                            'href'
                        );

                    if (
                        targetId === "#"
                    ) return;

                    const target =
                        document.querySelector(
                            targetId
                        );

                    if (target) {

                        e.preventDefault();

                        const offset = 80;

                        const position =

                            target
                                .getBoundingClientRect()
                                .top

                            +

                            window.pageYOffset

                            -

                            offset;

                        window.scrollTo({

                            top: position,
                            behavior: 'smooth'

                        });

                    }

                }
            );

        });

    // ==========================
    // Animaciones scroll
    // ==========================

    const reduceMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

    if (!reduceMotion) {

        const observer =
            new IntersectionObserver(

                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    'visible'
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        });

                },

                {

                    threshold: .1,
                    rootMargin:
                        '0px 0px -50px 0px'

                }

            );

        document
            .querySelectorAll(
                '.service-card,.feature-item,.project-card'
            )
            .forEach(el => {

                el.classList.add(
                    'animate-on-scroll'
                );

                observer.observe(
                    el
                );

            });

    }

});