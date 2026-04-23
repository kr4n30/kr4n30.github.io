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
                description: "Soy kR4N30, desarrollador Full Stack especializado en crear experiencias digitales únicas y memorables.",
                highlight: "💫 Transformando ideas en código • Calidad • Innovación 💫",
                stats: {
                    projects: "35+",
                    experience: "4+",
                    clients: "25+"
                }
            },
            about: {
                title: "📖 Sobre Mí",
                stats: {
                    years: "4",
                    yearsLabel: "Años de experiencia",
                    projects: "35",
                    projectsLabel: "Proyectos completados",
                    clients: "25",
                    clientsLabel: "Clientes satisfechos"
                },
                cards: {
                    who: {
                        title: "¿QUIÉN SOY?",
                        text: "👋 ¡Hola! Soy kR4N30, un desarrollador creativo apasionado por la tecnología y el diseño. Mi objetivo es crear experiencias digitales que inspiren y conecten con las personas."
                    },
                    mission: {
                        title: "MI MISIÓN",
                        text: "🚀 Este portfolio es una Single Page Application modular construida con JavaScript vanilla, sin frameworks. Demuestra que se puede crear experiencias modernas y fluidas con tecnologías puras."
                    },
                    specialty: {
                        title: "ESPECIALIDAD",
                        text: "💡 Me especializo en crear experiencias web inmersivas con fondos animados, efectos visuales, arquitectura limpia y código mantenible. También desarrollo bots de Discord y aplicaciones móviles."
                    },
                    availability: {
                        title: "DISPONIBILIDAD",
                        text: "⚡ Actualmente disponible para colaboraciones, proyectos freelance y oportunidades laborales. Si tienes una idea, ¡hablemos!"
                    }
                }
            },
            skills: {
                title: "💻 Stack Tecnológico",
                web: {
                    name: "🌐 Desarrollo Web",
                    title: "Full Stack Developer",
                    description: "Creación de aplicaciones web modernas, responsivas y de alto rendimiento con las últimas tecnologías del mercado.",
                    fullDescription: "Como desarrollador Full Stack, construyo aplicaciones web completas desde el frontend hasta el backend. Utilizo las últimas tecnologías para crear experiencias rápidas, escalables y con excelente UX/UI. Tengo experiencia en arquitecturas modernas, optimización de rendimiento y mejores prácticas de seguridad.",
                    technologies: ["HTML5", "CSS3", "JavaScript", "React", "Vue.js", "Node.js", "Express", "MongoDB", "PostgreSQL", "TypeScript", "Next.js", "TailwindCSS"],
                    experience: "3+ años",
                    projects: "15+ proyectos"
                },
                java: {
                    name: "☕ Java",
                    title: "Java Enterprise Developer",
                    description: "Aplicaciones empresariales robustas, escalables y seguras con Java y Spring Boot.",
                    fullDescription: "Con Java desarrollo soluciones empresariales de alta calidad. Especializado en Spring Boot, microservicios y arquitecturas orientadas a objetos. Construyo sistemas backend robustos, APIs RESTful y aplicaciones con alta concurrencia y seguridad.",
                    technologies: ["Java 8/11/17", "Spring Boot", "Spring Cloud", "Hibernate", "JPA", "Maven", "Gradle", "JUnit", "Mockito", "Microservices", "Docker", "Kubernetes"],
                    experience: "4+ años",
                    projects: "10+ proyectos"
                },
                python: {
                    name: "🐍 Python",
                    title: "Python Developer",
                    description: "Backend, automatización, análisis de datos e inteligencia artificial.",
                    fullDescription: "Python es mi herramienta para soluciones versátiles y rápidas. Desarrollo APIs REST, sistemas de automatización, scripts de procesamiento de datos, web scraping y aplicaciones backend escalables. También tengo experiencia en análisis de datos con Pandas y visualización.",
                    technologies: ["Python 3", "Django", "Flask", "FastAPI", "Pandas", "NumPy", "SQLAlchemy", "Docker", "Celery", "Redis", "Scrapy", "Matplotlib"],
                    experience: "3+ años",
                    projects: "12+ proyectos"
                }
            },
            projects: {
                title: "🚀 Proyectos Destacados",
                projects: [{
                        name: "Creative Portfolio",
                        description: "Portfolio personal con efecto glassmorphism y video de fondo interactivo",
                        fullDescription: "Un portfolio moderno y elegante con video de fondo de YouTube, sistema de traducción integrado (ES/EN), navegación SPA sin frameworks, diseño totalmente responsive, efectos de glassmorphism, animaciones suaves y modales interactivos. Incluye secciones de habilidades, proyectos y sobre mí con un diseño profesional y optimizado para rendimiento.",
                        technologies: ["HTML5", "CSS3", "JavaScript", "YouTube API", "SPA", "Glassmorphism"]
                    },
                    {
                        name: "Discord Music Bot",
                        description: "Bot multipropósito con sistema de música, economía y moderación",
                        fullDescription: "Bot completo para Discord con comandos de música (YouTube/Spotify/SoundCloud), sistema de reproducción en cola, filtros de audio, moderación automática, sistema de niveles por actividad, economía virtual con moneda propia, comandos personalizables y dashboard web para administración. Soporta más de 1000 servidores simultáneamente con alta disponibilidad.",
                        technologies: ["Node.js", "Discord.js", "MongoDB", "Lavalink", "Express", "Redis", "Docker"]
                    },
                    {
                        name: "TaskFlow Mobile",
                        description: "Aplicación de gestión de tareas multiplataforma con sincronización en tiempo real",
                        fullDescription: "Aplicación móvil para gestión de tareas personales y empresariales con sincronización en tiempo real entre dispositivos, notificaciones push personalizadas, autenticación biométrica (huella/rostro), modo oscuro, widgets interactivos en pantalla de inicio, integración con calendarios externos y estadísticas de productividad.",
                        technologies: ["React Native", "Firebase", "Redux Toolkit", "Expo", "TypeScript", "Jest"]
                    },
                    {
                        name: "E-Commerce API",
                        description: "API RESTful para comercio electrónico con microservicios",
                        fullDescription: "API robusta y escalable para plataforma de comercio electrónico construida con microservicios. Incluye autenticación JWT, gestión de usuarios, catálogo de productos, carrito de compras, pasarela de pagos integrada (Stripe/PayPal), sistema de pedidos, panel de administración, caché con Redis y documentación Swagger.",
                        technologies: ["Java", "Spring Boot", "MySQL", "Redis", "JWT", "Docker", "Kubernetes", "Swagger"]
                    },
                    {
                        name: "Data Analytics Dashboard",
                        description: "Dashboard interactivo para análisis de datos en tiempo real",
                        fullDescription: "Dashboard web para visualización de datos empresariales en tiempo real con gráficos interactivos, filtros dinámicos, exportación de reportes en múltiples formatos (PDF, Excel, CSV), alertas personalizables, y sistema de roles para diferentes niveles de acceso. Optimizado para grandes volúmenes de datos.",
                        technologies: ["Python", "Django", "Pandas", "Plotly", "Chart.js", "PostgreSQL", "Celery", "WebSockets"]
                    }
                ],
                backButton: "Volver al inicio"
            },
            nav: { home: "Inicio", about: "Sobre Mí", skills: "Skills", projects: "Proyectos" }
        },
        en: {
            home: {
                welcome: "✨ WELCOME TO MY PORTFOLIO ✨",
                description: "I'm kR4N30, a Full Stack developer specialized in creating unique and memorable digital experiences.",
                highlight: "💫 Turning ideas into code • Quality • Innovation 💫",
                stats: {
                    projects: "35+",
                    experience: "4+",
                    clients: "25+"
                }
            },
            about: {
                title: "📖 About Me",
                stats: {
                    years: "4",
                    yearsLabel: "Years experience",
                    projects: "35",
                    projectsLabel: "Projects completed",
                    clients: "25",
                    clientsLabel: "Happy clients"
                },
                cards: {
                    who: {
                        title: "WHO AM I?",
                        text: "👋 Hello! I'm kR4N30, a creative developer passionate about technology and design. My goal is to create digital experiences that inspire and connect with people."
                    },
                    mission: {
                        title: "MY MISSION",
                        text: "🚀 This portfolio is a modular Single Page Application built with vanilla JavaScript, no frameworks. It proves that modern and smooth experiences can be created with pure technologies."
                    },
                    specialty: {
                        title: "SPECIALTY",
                        text: "💡 I specialize in creating immersive web experiences with animated backgrounds, visual effects, clean architecture, and maintainable code. I also develop Discord bots and mobile applications."
                    },
                    availability: {
                        title: "AVAILABILITY",
                        text: "⚡ Currently available for collaborations, freelance projects, and job opportunities. If you have an idea, let's talk!"
                    }
                }
            },
            skills: {
                title: "💻 Tech Stack",
                web: {
                    name: "🌐 Web Development",
                    title: "Full Stack Developer",
                    description: "Building modern, responsive, high-performance web applications with the latest technologies.",
                    fullDescription: "As a Full Stack developer, I build complete web applications from frontend to backend using the latest technologies. I create fast, scalable experiences with excellent UX/UI. I have experience in modern architectures, performance optimization, and security best practices.",
                    technologies: ["HTML5", "CSS3", "JavaScript", "React", "Vue.js", "Node.js", "Express", "MongoDB", "PostgreSQL", "TypeScript", "Next.js", "TailwindCSS"],
                    experience: "3+ years",
                    projects: "15+ projects"
                },
                java: {
                    name: "☕ Java",
                    title: "Java Enterprise Developer",
                    description: "Robust, scalable, and secure enterprise applications with Java and Spring Boot.",
                    fullDescription: "With Java I develop high-quality enterprise solutions. Specialized in Spring Boot, microservices, and object-oriented architectures. I build robust backend systems, RESTful APIs, and applications with high concurrency and security.",
                    technologies: ["Java 8/11/17", "Spring Boot", "Spring Cloud", "Hibernate", "JPA", "Maven", "Gradle", "JUnit", "Mockito", "Microservices", "Docker", "Kubernetes"],
                    experience: "4+ years",
                    projects: "10+ projects"
                },
                python: {
                    name: "🐍 Python",
                    title: "Python Developer",
                    description: "Backend, automation, data analysis, and artificial intelligence.",
                    fullDescription: "Python is my tool for versatile and fast solutions. I develop REST APIs, automation systems, data processing scripts, web scraping, and scalable backend applications. I also have experience in data analysis with Pandas and visualization.",
                    technologies: ["Python 3", "Django", "Flask", "FastAPI", "Pandas", "NumPy", "SQLAlchemy", "Docker", "Celery", "Redis", "Scrapy", "Matplotlib"],
                    experience: "3+ years",
                    projects: "12+ projects"
                }
            },
            projects: {
                title: "🚀 Featured Projects",
                projects: [{
                        name: "Creative Portfolio",
                        description: "Personal portfolio with glassmorphism effect and interactive video background",
                        fullDescription: "A modern and elegant portfolio with YouTube background video, integrated translation system (ES/EN), framework-free SPA navigation, fully responsive design, glassmorphism effects, smooth animations, and interactive modals. Includes skills, projects, and about sections with professional design and performance optimization.",
                        technologies: ["HTML5", "CSS3", "JavaScript", "YouTube API", "SPA", "Glassmorphism"]
                    },
                    {
                        name: "Discord Music Bot",
                        description: "Multi-purpose bot with music, economy, and moderation system",
                        fullDescription: "Complete Discord bot with music commands (YouTube/Spotify/SoundCloud), queue playback system, audio filters, automatic moderation, activity-based leveling system, virtual economy with custom currency, customizable commands, and web dashboard for administration. Supports over 1000 concurrent servers with high availability.",
                        technologies: ["Node.js", "Discord.js", "MongoDB", "Lavalink", "Express", "Redis", "Docker"]
                    },
                    {
                        name: "TaskFlow Mobile",
                        description: "Cross-platform task management app with real-time synchronization",
                        fullDescription: "Mobile app for personal and business task management with real-time sync across devices, custom push notifications, biometric authentication (fingerprint/face), dark mode, home screen interactive widgets, external calendar integration, and productivity statistics.",
                        technologies: ["React Native", "Firebase", "Redux Toolkit", "Expo", "TypeScript", "Jest"]
                    },
                    {
                        name: "E-Commerce API",
                        description: "RESTful API for e-commerce with microservices architecture",
                        fullDescription: "Robust and scalable API for e-commerce platform built with microservices. Includes JWT authentication, user management, product catalog, shopping cart, integrated payment gateway (Stripe/PayPal), order system, admin panel, Redis caching, and Swagger documentation.",
                        technologies: ["Java", "Spring Boot", "MySQL", "Redis", "JWT", "Docker", "Kubernetes", "Swagger"]
                    },
                    {
                        name: "Data Analytics Dashboard",
                        description: "Interactive dashboard for real-time data analysis",
                        fullDescription: "Web dashboard for real-time business data visualization with interactive charts, dynamic filters, multi-format report export (PDF, Excel, CSV), customizable alerts, and role-based access system. Optimized for large data volumes.",
                        technologies: ["Python", "Django", "Pandas", "Plotly", "Chart.js", "PostgreSQL", "Celery", "WebSockets"]
                    }
                ],
                backButton: "Back to home"
            },
            nav: { home: "Home", about: "About", skills: "Skills", projects: "Projects" }
        }
    }
};