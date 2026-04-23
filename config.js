// ============================================================
//  SITE CONFIG — Edit everything here
// ============================================================

const CONFIG = {

    // ---------- PROFILE ----------
    name: "kR4N30",
    avatarUrl: "https://i1.sndcdn.com/artworks-000218816095-1y0cjt-t240x240.jpg",

    // ---------- SOCIALS ----------
    socials: {
        instagram: "prince_bisht_1",
        discord: "https://discord.gg/beastshub",
        snapchat: "",
        facebook: "",
        threads: "",
        x: "",
    },

    // ---------- EXTRA LINKS ----------
    links: [],

    // ---------- BACKGROUND VIDEO ----------
    youtubeVideoId: "zQGQLEE1nQs",
    videoStartSeconds: 0,
    videoSound: true,
    videoVolume: 40,

    // ---------- THEME ----------
    accentColor: "#a78bfa",
    glowColor: "rgba(167, 139, 250, 0.6)",

    // ---------- TRANSLATIONS ----------
    defaultLanguage: "es",

    translations: {
        es: {
            // Home page
            home: {
                welcome: "✨ GRACIAS POR VISITAR MI PÁGINA WEB ✨",
                description: "Aquí podrás encontrar más sobre mí y sobre mi trayectoria profesional.",
                highlight: "💫 Desarrollo web • Creatividad • Innovación 💫"
            },
            // About page
            about: {
                title: "📖 Sobre Mí",
                greeting: "👋 ¡Hola! Soy",
                name: "BEAST",
                description1: "desarrollador creativo apasionado por la tecnología y el diseño.",
                description2: "🚀 Este portfolio es una Single Page Application modular construida con JavaScript vanilla, sin frameworks.",
                description3: "💡 Me especializo en crear experiencias web inmersivas con fondos animados, efectos visuales y arquitectura limpia.",
                availability: "⚡ Disponible para colaboraciones"
            },
            // Skills Sections
            skills: {
                title: "💻 Mis Habilidades",
                web: {
                    name: "🌐 Desarrollo Web",
                    title: "Desarrollo Web Full Stack",
                    description: "Especialista en crear aplicaciones web modernas, responsivas y de alto rendimiento.",
                    fullDescription: "Como desarrollador web full stack, tengo experiencia en todo el ciclo de vida del desarrollo de aplicaciones web. Desde la planificación y diseño hasta la implementación y mantenimiento. Me especializo en crear experiencias de usuario fluidas con arquitecturas limpias y escalables.",
                    technologies: ["HTML5", "CSS3", "JavaScript", "React", "Vue.js", "Node.js", "Express", "MongoDB", "SQL"],
                    experience: "3+ años de experiencia",
                    projects: "15+ proyectos completados"
                },
                java: {
                    name: "☕ Desarrollo Java",
                    title: "Desarrollo Java Enterprise",
                    description: "Experto en aplicaciones empresariales robustas y escalables con Java.",
                    fullDescription: "Con Java he desarrollado desde aplicaciones desktop hasta sistemas empresariales complejos. Mi experiencia incluye el uso de frameworks modernos como Spring Boot, Hibernate y Maven. Me enfoco en crear código limpio, mantenible y con altos estándares de seguridad.",
                    technologies: ["Java 8/11/17", "Spring Boot", "Spring MVC", "Hibernate", "JPA", "Maven", "Gradle", "JUnit", "Mockito"],
                    experience: "4+ años de experiencia",
                    projects: "10+ proyectos completados"
                },
                python: {
                    name: "🐍 Desarrollo Python",
                    title: "Desarrollo Python Multiplataforma",
                    description: "Versátil en desarrollo backend, análisis de datos y automatización con Python.",
                    fullDescription: "Python es mi herramienta para soluciones rápidas y eficientes. Desarrollo desde APIs REST con Django/Flask hasta scripts de automatización y análisis de datos con Pandas y NumPy. Me encanta la versatilidad y la legibilidad que Python ofrece.",
                    technologies: ["Python 3", "Django", "Flask", "FastAPI", "Pandas", "NumPy", "SQLAlchemy", "Docker", "Celery"],
                    experience: "3+ años de experiencia",
                    projects: "12+ proyectos completados"
                }
            },
            // Projects page (mantenemos los proyectos existentes)
            projects: {
                title: "🚀 Mis Proyectos",
                projects: [{
                        name: "🎨 Creative Portfolio",
                        description: "SPA modular con fondo YouTube",
                        fullDescription: "Un portfolio personal moderno con video de fondo de YouTube, efectos de glassmorphism, sistema de traducción integrado y navegación SPA sin frameworks. Totalmente responsive y optimizado para móviles.",
                        technologies: ["HTML5", "CSS3", "JavaScript", "YouTube API"],
                        link: "#",
                        github: "https://github.com/"
                    },
                    {
                        name: "🎮 Discord Bot",
                        description: "Bot de música y moderación",
                        fullDescription: "Bot completo para Discord con comandos de música (reproducción desde YouTube/Spotify), sistema de moderación automática, logs de auditoría y comandos personalizables. Soporta más de 1000 servidores simultáneamente.",
                        technologies: ["Node.js", "Discord.js", "Lavalink", "MongoDB"],
                        link: "#",
                        github: "https://github.com/"
                    },
                    {
                        name: "📱 Mobile App",
                        description: "React Native + Firebase",
                        fullDescription: "Aplicación móvil multiplataforma para iOS y Android con autenticación en tiempo real, notificaciones push, almacenamiento en la nube y sincronización de datos entre dispositivos.",
                        technologies: ["React Native", "Firebase", "Redux", "Expo"],
                        link: "#",
                        github: "https://github.com/"
                    }
                ],
                backButton: "Volver al inicio"
            },
            // Navigation
            nav: {
                home: "Inicio",
                about: "Sobre Mí",
                skills: "Habilidades",
                projects: "Proyectos"
            },
            // Language
            language: {
                es: "ESPAÑOL",
                en: "ENGLISH"
            }
        },
        en: {
            // Home page
            home: {
                welcome: "✨ THANK YOU FOR VISITING MY WEBSITE ✨",
                description: "Here you can find more about me and my professional journey.",
                highlight: "💫 Web Development • Creativity • Innovation 💫"
            },
            // About page
            about: {
                title: "📖 About Me",
                greeting: "👋 Hello! I'm",
                name: "BEAST",
                description1: "a creative developer passionate about technology and design.",
                description2: "🚀 This portfolio is a modular Single Page Application built with vanilla JavaScript, no frameworks.",
                description3: "💡 I specialize in creating immersive web experiences with animated backgrounds, visual effects, and clean architecture.",
                availability: "⚡ Available for collaborations"
            },
            // Skills Sections
            skills: {
                title: "💻 My Skills",
                web: {
                    name: "🌐 Web Development",
                    title: "Full Stack Web Development",
                    description: "Specialist in creating modern, responsive, high-performance web applications.",
                    fullDescription: "As a full stack web developer, I have experience in the entire lifecycle of web application development. From planning and design to implementation and maintenance. I specialize in creating smooth user experiences with clean and scalable architectures.",
                    technologies: ["HTML5", "CSS3", "JavaScript", "React", "Vue.js", "Node.js", "Express", "MongoDB", "SQL"],
                    experience: "3+ years experience",
                    projects: "15+ completed projects"
                },
                java: {
                    name: "☕ Java Development",
                    title: "Enterprise Java Development",
                    description: "Expert in robust and scalable enterprise applications with Java.",
                    fullDescription: "With Java I have developed from desktop applications to complex enterprise systems. My experience includes using modern frameworks like Spring Boot, Hibernate, and Maven. I focus on creating clean, maintainable code with high security standards.",
                    technologies: ["Java 8/11/17", "Spring Boot", "Spring MVC", "Hibernate", "JPA", "Maven", "Gradle", "JUnit", "Mockito"],
                    experience: "4+ years experience",
                    projects: "10+ completed projects"
                },
                python: {
                    name: "🐍 Python Development",
                    title: "Multiplatform Python Development",
                    description: "Versatile in backend development, data analysis, and automation with Python.",
                    fullDescription: "Python is my tool for fast and efficient solutions. I develop from REST APIs with Django/Flask to automation scripts and data analysis with Pandas and NumPy. I love the versatility and readability that Python offers.",
                    technologies: ["Python 3", "Django", "Flask", "FastAPI", "Pandas", "NumPy", "SQLAlchemy", "Docker", "Celery"],
                    experience: "3+ years experience",
                    projects: "12+ completed projects"
                }
            },
            // Projects page
            projects: {
                title: "🚀 My Projects",
                projects: [{
                        name: "🎨 Creative Portfolio",
                        description: "Modular SPA with YouTube background",
                        fullDescription: "A modern personal portfolio with YouTube background video, glassmorphism effects, integrated translation system, and framework-free SPA navigation. Fully responsive and mobile-optimized.",
                        technologies: ["HTML5", "CSS3", "JavaScript", "YouTube API"],
                        link: "#",
                        github: "https://github.com/"
                    },
                    {
                        name: "🎮 Discord Bot",
                        description: "Music & moderation bot",
                        fullDescription: "Complete Discord bot with music commands (YouTube/Spotify playback), automatic moderation system, audit logs, and customizable commands. Supports over 1000 servers simultaneously.",
                        technologies: ["Node.js", "Discord.js", "Lavalink", "MongoDB"],
                        link: "#",
                        github: "https://github.com/"
                    },
                    {
                        name: "📱 Mobile App",
                        description: "React Native + Firebase",
                        fullDescription: "Cross-platform mobile application for iOS and Android with real-time authentication, push notifications, cloud storage, and data synchronization across devices.",
                        technologies: ["React Native", "Firebase", "Redux", "Expo"],
                        link: "#",
                        github: "https://github.com/"
                    }
                ],
                backButton: "Back to home"
            },
            // Navigation
            nav: {
                home: "Home",
                about: "About",
                skills: "Skills",
                projects: "Projects"
            },
            // Language
            language: {
                es: "SPANISH",
                en: "ENGLISH"
            }
        }
    }
};