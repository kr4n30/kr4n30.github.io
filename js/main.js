// ============================================================
// MAIN APP — CON EFECTO DE ENTRADA
// ============================================================

let player = null;
let playerReady = false;
let isMuted = !CONFIG.videoSound;
let videoStarted = false;

const $ = id => document.getElementById(id);
const canVibrate = 'vibrate' in navigator;

function vibrate(pattern = 20) { if (canVibrate) navigator.vibrate(pattern); }

// Social definitions
const SOCIAL_DEFS = {
    instagram: {
        label: 'Instagram',
        url: u => `https://instagram.com/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`
    },
    discord: {
        label: 'Discord',
        url: u => u.startsWith('http') ? u : `https://discord.com/users/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`
    }
};

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function initProfile() {
    const root = document.documentElement;
    if (!root.dataset.themeLoaded) {
        root.style.setProperty('--accent', CONFIG.accentColor);
        root.style.setProperty('--glow', CONFIG.glowColor);
        root.dataset.themeLoaded = 'true';
    }

    initAvatar();
    initName();
    initSocials();
    initLinks();

    if (typeof initLanguageSwitcher === 'function') {
        initLanguageSwitcher();
    }

    // Añadir efecto de entrada al contenido inicial
    setTimeout(() => {
        const container = document.getElementById('app-content');
        if (container) {
            container.style.opacity = '1';
            container.style.transform = 'scale(1) translateY(0)';
            container.style.filter = 'blur(0)';
        }
    }, 100);
}

function initAvatar() {
    const el = $('avatar-el');
    if (!el) return;
    el.innerHTML = '';
    if (CONFIG.avatarUrl) {
        const img = document.createElement('img');
        img.src = CONFIG.avatarUrl;
        img.alt = CONFIG.name;
        img.loading = "lazy";
        img.onerror = () => { el.textContent = getInitials(CONFIG.name); };
        el.appendChild(img);
    } else {
        el.textContent = getInitials(CONFIG.name);
    }
}

function initName() {
    const el = $('name-el');
    if (el) el.textContent = CONFIG.name;
}

function initSocials() {
    const container = $('socials-el');
    if (!container) return;
    const fragment = document.createDocumentFragment();
    Object.entries(CONFIG.socials || {}).forEach(([key, val]) => {
        const def = SOCIAL_DEFS[key];
        if (!val || !def) return;
        const a = document.createElement('a');
        a.className = 'social-btn';
        a.href = def.url(val);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.dataset.tip = `@${val}`;
        a.innerHTML = def.svg;
        a.addEventListener('click', () => vibrate([10, 30, 10]));
        fragment.appendChild(a);
    });
    container.replaceChildren(fragment);
}

function initLinks() {
    const container = $('links-el');
    if (!container || !CONFIG.links) return;
    const fragment = document.createDocumentFragment();
    CONFIG.links.forEach(item => {
        const a = document.createElement('a');
        a.className = 'link-btn';
        a.href = item.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = `<span class="icon">${item.icon || '🔗'}</span><span class="lbl">${item.label}</span>`;
        a.addEventListener('click', () => vibrate([10, 30, 10]));
        fragment.appendChild(a);
    });
    container.replaceChildren(fragment);
}

// YouTube Player
function onYouTubeIframeAPIReady() {
    if (!window.YT || !YT.Player) return;
    player = new YT.Player('yt-player', {
        videoId: CONFIG.youtubeVideoId,
        playerVars: {
            autoplay: 0,
            loop: 1,
            playlist: CONFIG.youtubeVideoId,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            start: CONFIG.videoStartSeconds,
            enablejsapi: 1,
            playsinline: 1,
        },
        events: {
            onReady: () => { playerReady = true; },
            onStateChange: e => { if (e.data === YT.PlayerState.ENDED) player.playVideo(); }
        }
    });
}

function toggleSound() {
    if (!player || !playerReady) return;
    isMuted = !isMuted;
    if (isMuted) { player.mute(); } else { player.unMute();
        player.setVolume(CONFIG.videoVolume); }
    updateSoundIcon();
    vibrate();
}

function updateSoundIcon() {
    const on = $('icon-sound-on');
    const off = $('icon-sound-off');
    if (!on || !off) return;
    on.style.display = isMuted ? 'none' : '';
    off.style.display = isMuted ? '' : 'none';
}

// Overlay
function initEnterOverlay() {
    const overlay = $('enter-overlay');
    if (!overlay) return;
    overlay.addEventListener('click', () => {
        overlay.classList.add('hidden');
        vibrate([10, 40, 10]);
        startVideoSafe();
    }, { once: true });
}

function startVideoSafe() {
    if (videoStarted) return;
    const tryPlay = () => {
        if (!playerReady || !player) { requestAnimationFrame(tryPlay); return; }
        videoStarted = true;
        player.setVolume(CONFIG.videoVolume);
        isMuted ? player.mute() : player.unMute();
        player.playVideo();
        updateSoundIcon();
    };
    tryPlay();
}

// Init App
function initApp() {
    initEnterOverlay();
    const soundBtn = $('sound-btn');
    if (soundBtn) soundBtn.addEventListener('click', toggleSound);
    if (typeof initRouter === 'function') initRouter();
}

// Global exports
window.toggleSound = toggleSound;
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.initProfile = initProfile;

// Start
document.addEventListener('DOMContentLoaded', initApp);