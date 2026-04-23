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
            home: {
                welcome: "✨ BIENVENIDO A MI PORTAFOLIO ✨",
                description: "Explora mi trabajo, habilidades y trayectoria en el mundo del desarrollo.",
                highlight: "💫 Código • Creatividad • Innovación 💫"
            },
            about: {
                title: "📖 Sobre Mí",
                greeting: "👋 ¡Hola! Soy",
                name: "kR4N30",
                description1: "desarrollador creativo apasionado por la tecnología y el diseño.",
                description2: "🚀 Este portfolio es una Single Page Application modular construida con JavaScript vanilla, sin frameworks.",
                description3: "💡 Me especializo en crear experiencias web inmersivas con fondos animados, efectos visuales y arquitectura limpia.",
                availability: "⚡ Disponible para colaboraciones y proyectos freelance"
            },
            skills: {
                title: "💻 Stack Tecnológico",
                web: {
                    name: "🌐 Desarrollo Web",
                    title: "Full Stack Developer",
                    description: "Creación de aplicaciones web modernas, responsivas y de alto rendimiento.",
                    fullDescription: "Como desarrollador Full Stack, construyo aplicaciones web completas desde el frontend hasta el backend. Utilizo las últimas tecnologías para crear experiencias rápidas, escalables y con excelente UX/UI.",
                    technologies: ["HTML5", "CSS3", "JavaScript", "React", "Vue.js", "Node.js", "Express", "MongoDB", "PostgreSQL"],
                    experience: "3+ años",
                    projects: "15+ proyectos"
                },
                java: {
                    name: "☕ Java",
                    title: "Java Enterprise Developer",
                    description: "Aplicaciones empresariales robustas y escalables.",
                    fullDescription: "Con Java desarrollo soluciones empresariales de alta calidad. Especializado en Spring Boot, microservicios y arquitecturas orientadas a objetos.",
                    technologies: ["Java 8/11/17", "Spring Boot", "Spring Cloud", "Hibernate", "JPA", "Maven", "Gradle", "JUnit", "Mockito", "Microservices"],
                    experience: "4+ años",
                    projects: "10+ proyectos"
                },
                python: {
                    name: "🐍 Python",
                    title: "Python Developer",
                    description: "Backend, automatización y análisis de datos.",
                    fullDescription: "Python es mi herramienta para soluciones versátiles. Desarrollo APIs REST, sistemas de automatización y aplicaciones backend escalables.",
                    technologies: ["Python 3", "Django", "Flask", "FastAPI", "Pandas", "NumPy", "SQLAlchemy", "Docker", "Celery", "Redis"],
                    experience: "3+ años",
                    projects: "12+ proyectos"
                }
            },
            projects: {
                title: "🚀 Proyectos Destacados",
                projects: [
                    { name: "🎨 Portfolio SPA", description: "Portfolio personal con efecto glassmorphism", fullDescription: "Un portfolio moderno con video de fondo, sistema de traducción integrado, navegación SPA y diseño totalmente responsive.", technologies: ["HTML5", "CSS3", "JavaScript", "YouTube API"] },
                    { name: "🤖 Discord Bot", description: "Bot multipropósito con sistema de música", fullDescription: "Bot completo para Discord con comandos de música, moderación automática, sistema de niveles y economía.", technologies: ["Node.js", "Discord.js", "MongoDB", "Lavalink"] },
                    { name: "📱 TaskFlow App", description: "Aplicación de gestión de tareas multiplataforma", fullDescription: "Aplicación móvil para gestión de tareas con sincronización en tiempo real, notificaciones push y modo oscuro.", technologies: ["React Native", "Firebase", "Redux", "Expo"] }
                ],
                backButton: "Volver al inicio"
            },
            nav: { home: "Inicio", about: "Sobre Mí", skills: "Skills", projects: "Proyectos" }
        },
        en: {
            home: {
                welcome: "✨ WELCOME TO MY PORTFOLIO ✨",
                description: "Explore my work, skills, and journey in the development world.",
                highlight: "💫 Code • Creativity • Innovation 💫"
            },
            about: {
                title: "📖 About Me",
                greeting: "👋 Hello! I'm",
                name: "kR4N30",
                description1: "a creative developer passionate about technology and design.",
                description2: "🚀 This portfolio is a modular Single Page Application built with vanilla JavaScript, no frameworks.",
                description3: "💡 I specialize in creating immersive web experiences with animated backgrounds, visual effects, and clean architecture.",
                availability: "⚡ Available for collaborations and freelance projects"
            },
            skills: {
                title: "💻 Tech Stack",
                web: {
                    name: "🌐 Web Development",
                    title: "Full Stack Developer",
                    description: "Building modern, responsive, high-performance web applications.",
                    fullDescription: "As a Full Stack developer, I build complete web applications from frontend to backend using the latest technologies.",
                    technologies: ["HTML5", "CSS3", "JavaScript", "React", "Vue.js", "Node.js", "Express", "MongoDB", "PostgreSQL"],
                    experience: "3+ years",
                    projects: "15+ projects"
                },
                java: {
                    name: "☕ Java",
                    title: "Java Enterprise Developer",
                    description: "Robust and scalable enterprise applications.",
                    fullDescription: "With Java I develop high-quality enterprise solutions specialized in Spring Boot, microservices, and object-oriented architectures.",
                    technologies: ["Java 8/11/17", "Spring Boot", "Spring Cloud", "Hibernate", "JPA", "Maven", "Gradle", "JUnit", "Mockito", "Microservices"],
                    experience: "4+ years",
                    projects: "10+ projects"
                },
                python: {
                    name: "🐍 Python",
                    title: "Python Developer",
                    description: "Backend, automation, and data analysis.",
                    fullDescription: "Python is my tool for versatile solutions. I develop REST APIs, automation systems, and scalable backend applications.",
                    technologies: ["Python 3", "Django", "Flask", "FastAPI", "Pandas", "NumPy", "SQLAlchemy", "Docker", "Celery", "Redis"],
                    experience: "3+ years",
                    projects: "12+ projects"
                }
            },
            projects: {
                title: "🚀 Featured Projects",
                projects: [
                    { name: "🎨 Portfolio SPA", description: "Personal portfolio with glassmorphism effect", fullDescription: "A modern portfolio with background video, integrated translation system, SPA navigation, and fully responsive design.", technologies: ["HTML5", "CSS3", "JavaScript", "YouTube API"] },
                    { name: "🤖 Discord Bot", description: "Multi-purpose bot with music system", fullDescription: "Complete Discord bot with music commands, automatic moderation, leveling system, and economy.", technologies: ["Node.js", "Discord.js", "MongoDB", "Lavalink"] },
                    { name: "📱 TaskFlow App", description: "Cross-platform task management app", fullDescription: "Mobile app for task management with real-time sync, push notifications, and dark mode.", technologies: ["React Native", "Firebase", "Redux", "Expo"] }
                ],
                backButton: "Back to home"
            },
            nav: { home: "Home", about: "About", skills: "Skills", projects: "Projects" }
        }
    }
};