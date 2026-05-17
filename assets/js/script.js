// Aplicar colores del tema
document.documentElement.style.setProperty('--accent', CONFIG.accentColor);
document.documentElement.style.setProperty('--glow', CONFIG.glowColor);

// Avatar
const avatarEl = document.getElementById('avatar-el');
if (CONFIG.avatarUrl) {
    avatarEl.innerHTML = `<img src="${CONFIG.avatarUrl}" alt="${CONFIG.name}" />`;
} else {
    const initials = CONFIG.name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    avatarEl.textContent = initials;
}

// Nombre
document.getElementById('name-el').textContent = CONFIG.name;
document.title = CONFIG.name;

// Typewriter para tagline
const taglineText = CONFIG.tagline;
const taglineEl = document.getElementById('tagline-el');
let tagPos = 0;

function typeTagline() {
    if (tagPos <= taglineText.length) {
        taglineEl.textContent = taglineText.slice(0, tagPos);
        tagPos++;
        setTimeout(typeTagline, 60);
    }
}
setTimeout(typeTagline, 250);

// Definición de iconos sociales
const SOCIAL_DEFS = {
    instagram: {
        label: 'Instagram',
        url: u => `https://instagram.com/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>`
    },
    x: {
        label: 'X',
        url: u => `https://x.com/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.974 6.807H2.882l7.684-8.793-8.38-11.707h6.638l4.702 6.217 5.853-6.217z"/>
        </svg>`
    },
    discord: {
        label: 'Discord',
        url: u => u.startsWith('http') ? u : `https://discord.com/users/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
        </svg>`
    },
    facebook: {
        label: 'Facebook',
        url: u => `https://facebook.com/${u}`,
        svg: `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>`
    }
};

// Renderizar redes sociales
const socialsEl = document.getElementById('socials-el');
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

// Renderizar enlaces
const linksEl = document.getElementById('links-el');
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

// YouTube Player
let player;
let playerReady = false;
let isMuted = !CONFIG.videoSound;

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

// Enter overlay
const overlay = document.getElementById('enter-overlay');
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

// Control de sonido
const soundBtn = document.getElementById('sound-btn');
soundBtn.addEventListener('click', toggleSound);

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
    if (isMuted) {
        iconOn.style.display = 'none';
        iconOff.style.display = '';
    } else {
        iconOn.style.display = '';
        iconOff.style.display = 'none';
    }
}