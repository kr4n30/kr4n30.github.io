// ============================================================
// MAIN APP — FINAL PRO (STABLE & CLEAN)
// ============================================================

// ==========================
// STATE
// ==========================
let player = null;
let playerReady = false;
let isMuted = !CONFIG.videoSound;
let videoStarted = false;

// ==========================
// HELPERS
// ==========================
const $ = id => document.getElementById(id);

const canVibrate = 'vibrate' in navigator;

function vibrate(pattern = 20) {
    if (canVibrate) navigator.vibrate(pattern);
}

// ==========================
// PROFILE INIT
// ==========================
function initProfile() {
    const root = document.documentElement;

    // 🔥 solo aplicar 1 vez (evita recalculo innecesario)
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
}

// ==========================
// AVATAR
// ==========================
function initAvatar() {
    const el = $('avatar-el');
    if (!el) return;

    el.innerHTML = '';

    if (CONFIG.avatarUrl) {
        const img = document.createElement('img');
        img.src = CONFIG.avatarUrl;
        img.alt = CONFIG.name;
        img.loading = "lazy";

        img.onerror = () => {
            el.textContent = getInitials(CONFIG.name);
        };

        el.appendChild(img);
    } else {
        el.textContent = getInitials(CONFIG.name);
    }
}

function getInitials(name) {
    return name
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

// ==========================
// NAME
// ==========================
function initName() {
    const el = $('name-el');
    if (el) el.textContent = CONFIG.name;
}

// ==========================
// SOCIALS
// ==========================
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

// ==========================
// LINKS
// ==========================
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

        a.innerHTML = `
            <span class="icon">${item.icon || '🔗'}</span>
            <span class="lbl">${item.label}</span>
        `;

        a.addEventListener('click', () => vibrate([10, 30, 10]));

        fragment.appendChild(a);
    });

    container.replaceChildren(fragment);
}

// ==========================
// YOUTUBE PLAYER
// ==========================
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
            onReady: () => {
                playerReady = true;
            },
            onStateChange: e => {
                if (e.data === YT.PlayerState.ENDED) {
                    player.playVideo();
                }
            }
        }
    });
}

// ==========================
// SOUND
// ==========================
function toggleSound() {
    if (!player || !playerReady) return;

    isMuted = !isMuted;

    if (isMuted) {
        player.mute();
    } else {
        player.unMute();
        player.setVolume(CONFIG.videoVolume);
    }

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

// ==========================
// OVERLAY
// ==========================
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
        if (!playerReady || !player) {
            requestAnimationFrame(tryPlay);
            return;
        }

        videoStarted = true;

        player.setVolume(CONFIG.videoVolume);
        isMuted ? player.mute() : player.unMute();
        player.playVideo();

        updateSoundIcon();
    };

    tryPlay();
}

// ==========================
// INIT APP (FINAL)
// ==========================
function initApp() {

    initEnterOverlay();

    const soundBtn = $('sound-btn');
    if (soundBtn) {
        soundBtn.addEventListener('click', toggleSound);
    }

    // 🔥 SOLO router controla render
    if (typeof initRouter === 'function') {
        initRouter();
    }
}

// ==========================
// GLOBAL EXPORTS
// ==========================
window.toggleSound = toggleSound;
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// ==========================
// START
// ==========================
document.addEventListener('DOMContentLoaded', initApp);