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
                welcome: "✨ GRACIAS POR VISITAR MI PÁGINA WEB ✨",
                description: "Aquí podrás encontrar más sobre mí y sobre mi trayectoria profesional.",
                highlight: "💫 Desarrollo web • Creatividad • Innovación 💫"
            },
            about: {
                title: "📖 Sobre Mí",
                greeting: "👋 ¡Hola! Soy",
                name: "BEAST",
                description1: "desarrollador creativo apasionado por la tecnología y el diseño.",
                description2: "🚀 Este portfolio es una Single Page Application modular construida con JavaScript vanilla, sin frameworks.",
                description3: "💡 Me especializo en crear experiencias web inmersivas con fondos animados, efectos visuales y arquitectura limpia.",
                availability: "⚡ Disponible para colaboraciones"
            },
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
            nav: {
                home: "Inicio",
                about: "Sobre Mí",
                projects: "Proyectos"
            },
            language: {
                es: "ESPAÑOL",
                en: "ENGLISH"
            }
        },
        en: {
            home: {
                welcome: "✨ THANK YOU FOR VISITING MY WEBSITE ✨",
                description: "Here you can find more about me and my professional journey.",
                highlight: "💫 Web Development • Creativity • Innovation 💫"
            },
            about: {
                title: "📖 About Me",
                greeting: "👋 Hello! I'm",
                name: "BEAST",
                description1: "a creative developer passionate about technology and design.",
                description2: "🚀 This portfolio is a modular Single Page Application built with vanilla JavaScript, no frameworks.",
                description3: "💡 I specialize in creating immersive web experiences with animated backgrounds, visual effects, and clean architecture.",
                availability: "⚡ Available for collaborations"
            },
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
            nav: {
                home: "Home",
                about: "About",
                projects: "Projects"
            },
            language: {
                es: "SPANISH",
                en: "ENGLISH"
            }
        }
    }
};