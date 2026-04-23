/**
 * Main - Inicialización de la aplicación SPA
 * Controla el video de YouTube, overlay, sonido y perfil dinámico
 */

// Variables globales del video
let player;
let playerReady = false;
let isMuted = !CONFIG.videoSound;

// Definición de íconos sociales (igual que el original)
const SOCIAL_DEFS = {
    facebook: {
        label: 'Facebook',
        url: u => `https://facebook.com/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>`
    },
    threads: {
        label: 'Threads',
        url: u => `https://threads.net/@${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.001 2C6.483 2 2 6.479 2 12c0 5.517 4.484 10 9.999 10C17.52 22 22 17.523 22 12c0-5.523-4.48-10-9.999-10zM12 4c4.408 0 8 3.592 8 8s-3.592 8-8 8-8-3.592-8-8 3.592-8 8-8z"/>
    </svg>`
    },
    x: {
        label: 'X',
        url: u => `https://x.com/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.974 6.807H2.882l7.684-8.793-8.38-11.707h6.638l4.702 6.217 5.853-6.217zM17.45 19.38h1.827L6.281 5.152H4.25l13.2 14.228z"/>
    </svg>`
    },
    instagram: {
        label: 'Instagram',
        url: u => `https://instagram.com/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>`
    },
    discord: {
        label: 'Discord',
        url: u => u.startsWith('http') ? u : `https://discord.com/users/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>`
    },
    snapchat: {
        label: 'Snapchat',
        url: u => `https://snapchat.com/add/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.017 0C8.396 0 7.92.015 6.702.072 5.487.129 4.657.306 3.934.58a5.89 5.89 0 0 0-2.129 1.386A5.895 5.895 0 0 0 .42 4.096C.145 4.82-.032 5.651.01 6.866-.032 8.085 0 8.562 0 12.018c0 3.456.015 3.932.072 5.15.057 1.215.234 2.046.508 2.77a5.892 5.892 0 0 0 1.386 2.13 5.89 5.89 0 0 0 2.13 1.384c.723.275 1.554.452 2.769.509C8.083 23.985 8.56 24 12.016 24s3.932-.015 5.15-.072c1.215-.057 2.046-.234 2.77-.509a5.9 5.9 0 0 0 2.13-1.385 5.9 5.9 0 0 0 1.384-2.13c.275-.723.452-1.554.509-2.769.057-1.218.072-1.695.072-5.15 0-3.456-.015-3.933-.072-5.151-.057-1.215-.234-2.046-.509-2.77a5.9 5.9 0 0 0-1.384-2.129A5.9 5.9 0 0 0 19.936.58C19.213.306 18.382.13 17.167.072 15.949.015 15.472 0 12.017 0zm0 2.162c3.395 0 3.798.013 5.14.074 1.238.056 1.912.263 2.36.436.593.23 1.016.507 1.46.95.445.445.72.868.951 1.46.173.449.38 1.122.437 2.36.06 1.342.074 1.745.074 5.14 0 3.395-.013 3.798-.074 5.14-.056 1.238-.263 1.912-.437 2.36a3.934 3.934 0 0 1-.95 1.46 3.934 3.934 0 0 1-1.46.95c-.449.173-1.122.38-2.36.437-1.342.06-1.745.074-5.14.074-3.396 0-3.8-.013-5.14-.074-1.24-.056-1.913-.263-2.362-.436a3.93 3.93 0 0 1-1.46-.951 3.934 3.934 0 0 1-.95-1.46c-.173-.449-.38-1.122-.437-2.36-.06-1.342-.073-1.745-.073-5.14 0-3.396.013-3.799.073-5.14.056-1.24.264-1.913.437-2.362a3.928 3.928 0 0 1 .95-1.46 3.928 3.928 0 0 1 1.46-.95c.449-.174 1.122-.38 2.36-.437 1.342-.06 1.745-.074 5.14-.074zm-.001 3.676a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12.016 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.846-10.405a1.44 1.44 0 1 1-2.881 0 1.44 1.44 0 0 1 2.881 0z"/>
    </svg>`
    }
};

/**
 * Inicializa el contenido dinámico del perfil (avatar, nombre, socials, links)
 * Se ejecuta después de cargar cada sección
 */
function initProfile() {
    // Aplicar variables CSS desde config
    document.documentElement.style.setProperty('--accent', CONFIG.accentColor);
    document.documentElement.style.setProperty('--glow', CONFIG.glowColor);

    // ── Avatar ──
    const avatarEl = document.getElementById('avatar-el');
    if (avatarEl) {
        if (CONFIG.avatarUrl) {
            avatarEl.innerHTML = `<img src="${CONFIG.avatarUrl}" alt="${CONFIG.name}" />`;
        } else {
            avatarEl.textContent = CONFIG.name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        }
    }

    // ── Name ──
    const nameEl = document.getElementById('name-el');
    if (nameEl) nameEl.textContent = CONFIG.name;

    // ── Tagline con efecto máquina de escribir ──
    const taglineEl = document.getElementById('tagline-el');
    if (taglineEl) {
        taglineEl.textContent = '';
        const taglineText = CONFIG.tagline;
        let tagPos = 0;

        function typeTagline() {
            if (tagPos <= taglineText.length && taglineEl) {
                taglineEl.textContent = taglineText.slice(0, tagPos);
                tagPos += 1;
                setTimeout(typeTagline, 60);
            }
        }
        setTimeout(typeTagline, 250);
    }

    // ── Social icons ──
    const socialsEl = document.getElementById('socials-el');
    if (socialsEl) {
        socialsEl.innerHTML = '';
        Object.entries(CONFIG.socials).forEach(([key, val]) => {
            if (!val || !SOCIAL_DEFS[key]) return;
            const def = SOCIAL_DEFS[key];
            const a = document.createElement('a');
            a.className = 'social-btn';
            a.href = def.url(val);
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.dataset.tip = `@${val}`;
            a.innerHTML = def.svg;

            a.addEventListener('click', () => {
                if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
            });

            socialsEl.appendChild(a);
        });
    }

    // ── Extra links ──
    const linksEl = document.getElementById('links-el');
    if (linksEl && CONFIG.links) {
        linksEl.innerHTML = '';
        CONFIG.links.forEach(item => {
            const a = document.createElement('a');
            a.className = 'link-btn';
            a.href = item.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.innerHTML = `<span class="icon">${item.icon || '🔗'}</span><span class="lbl">${item.label}</span>`;
            a.addEventListener('click', () => {
                if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
            });
            linksEl.appendChild(a);
        });
    }
}

/**
 * Inicializa el reproductor de YouTube
 */
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        videoId: CONFIG.youtubeVideoId,
        playerVars: {
            autoplay: 0,
            loop: 1,
            playlist: CONFIG.youtubeVideoId,
            controls: 0,
            showinfo: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            rel: 0,
            start: CONFIG.videoStartSeconds,
            mute: 0,
            enablejsapi: 1,
            playsinline: 1,
        },
        events: {
            onReady: () => {
                playerReady = true;
            },
            onStateChange: e => {
                if (e.data === YT.PlayerState.ENDED) player.playVideo();
            }
        }
    });
}

/**
 * Control de sonido del video
 */
function toggleSound() {
    if (!player) return;
    isMuted = !isMuted;
    if (isMuted) {
        player.mute();
    } else {
        player.unMute();
        player.setVolume(CONFIG.videoVolume);
    }
    updateSoundIcon();
    if (navigator.vibrate) navigator.vibrate(20);
}

function updateSoundIcon() {
    const iconOn = document.getElementById('icon-sound-on');
    const iconOff = document.getElementById('icon-sound-off');
    if (iconOn && iconOff) {
        iconOn.style.display = isMuted ? 'none' : '';
        iconOff.style.display = isMuted ? '' : 'none';
    }
}

// Exponer funciones globalmente
window.toggleSound = toggleSound;
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

/**
 * Inicialización del overlay de entrada
 */
function initEnterOverlay() {
    const overlay = document.getElementById('enter-overlay');
    if (!overlay) return;

    overlay.addEventListener('click', () => {
        overlay.classList.add('hidden');
        if (navigator.vibrate) navigator.vibrate([10, 40, 10]);

        if (player && player.playVideo) {
            player.playVideo();
            player.setVolume(CONFIG.videoVolume);
            if (isMuted) {
                player.mute();
            } else {
                player.unMute();
            }
            updateSoundIcon();
        } else {
            const tryPlay = setInterval(() => {
                if (!playerReady || !player) return;
                clearInterval(tryPlay);
                player.setVolume(CONFIG.videoVolume);
                if (isMuted) {
                    player.mute();
                } else {
                    player.unMute();
                }
                player.playVideo();
                updateSoundIcon();
            }, 100);
        }
    });
}

/**
 * Inicialización de la aplicación
 */
function initApp() {
    // Configurar CSS variables
    document.documentElement.style.setProperty('--accent', CONFIG.accentColor);
    document.documentElement.style.setProperty('--glow', CONFIG.glowColor);

    // Inicializar overlay
    initEnterOverlay();

    // Configurar evento de sonido
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
        soundBtn.addEventListener('click', toggleSound);
    }

    // Manejar navegación con hash
    window.addEventListener('popstate', handlePopState);

    // Cargar sección inicial (desde hash o home)
    const initialSection = window.location.hash.slice(1) || 'home';
    navigateTo(initialSection, false);
}

// Iniciar la app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);