/* ============================================
   tools/background-remover.js
   Lógica EXCLUSIVA de la herramienta "Quitar Fondo".
   El trabajo pesado (IA en el navegador) lo hace el
   componente <background-remover> (CDN, ver el <head>
   de background-remover.html). Este script solo:
     - conecta el componente con el idioma del sitio
     - muestra toasts con el progreso del modelo
     - añade NUESTRO propio botón de descarga, gateado
       por el anuncio recompensado (reward-gate.js),
       igual que en Video a Imagen.

   NOTA: la forma exacta del evento "image-processed"
   (blob / dataURL / File) no está documentada en detalle
   públicamente, así que el manejador de abajo prueba las
   formas más habituales de forma defensiva. Si el
   componente cambia su API, revisa la consola: se avisa
   con un console.warn si no se reconoce el detalle.
   ============================================ */

const bgRemover = document.getElementById('bgRemover');
const bgResultActions = document.getElementById('bgResultActions');
const bgDownloadBtn = document.getElementById('bgDownloadBtn');
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeModal = document.getElementById('closeModal');
const toast = document.getElementById('toast');

let toastTimeout = null;
let lastProcessedResult = null; // guarda lo último que nos dio el componente

// ============================================
// TOAST
// ============================================
function showToast(message, duration = 3000) {
    if (!toast) return;
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================
// MODAL DE INFO
// ============================================
function openInfoModal() {
    if (!infoModal) return;
    infoModal.classList.remove('hidden');
    if (window.ToolboxA11y) window.ToolboxA11y.trapFocus(infoModal);
}
function closeInfoModal() {
    if (!infoModal) return;
    infoModal.classList.add('hidden');
    if (window.ToolboxA11y) window.ToolboxA11y.releaseFocus(infoModal);
}
if (infoBtn && infoModal) infoBtn.addEventListener('click', openInfoModal);
if (closeModal && infoModal) {
    closeModal.addEventListener('click', closeInfoModal);
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) closeInfoModal();
    });
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && infoModal && !infoModal.classList.contains('hidden')) {
        closeInfoModal();
    }
});

// ============================================
// IDIOMA: mantenemos el componente sincronizado
// con el idioma elegido en el sitio (ES/EN)
// ============================================
function syncLocale(lang) {
    // NOTA: la versión actual de @ligrila/background-remover (0.3.8) tiene un bug
    // al cargar su locale "es" (dynamic import roto: "./locales/es.ts"), lo que
    // tira un error en consola y deja el widget sin textos. Hasta que se
    // corrija upstream, evitamos pedirle el locale "es" y dejamos que use su
    // default (inglés) en vez de romperse. El resto de la página sigue en español.
    if (bgRemover && lang && lang !== 'es') bgRemover.setAttribute('data-locale', lang);
}
document.addEventListener('i18n:applied', (e) => {
    syncLocale(e.detail && e.detail.lang);
});
syncLocale(document.documentElement.getAttribute('lang'));

// ============================================
// EVENTOS DEL COMPONENTE <background-remover>
// (namespace "@ligrila/background-remover/...", ver README)
// ============================================
if (bgRemover) {
    bgRemover.addEventListener('@ligrila/background-remover/model-status', (e) => {
        const status = e.detail && e.detail.status;
        if (status === 'loading' || status === 'downloading') {
            showToast('🤖 Cargando el modelo de IA (solo la primera vez)...', 4000);
        } else if (status === 'ready') {
            showToast('✅ Modelo listo', 1500);
        }
    });

    bgRemover.addEventListener('@ligrila/background-remover/model-progress', (e) => {
        const pct = e.detail && (e.detail.progress || e.detail.percentage);
        if (typeof pct === 'number') {
            showToast('⬇️ Descargando modelo... ' + Math.round(pct) + '%', 1500);
        }
    });

    bgRemover.addEventListener('@ligrila/background-remover/error', (e) => {
        console.error('background-remover error:', e.detail);
        showToast('⚠️ Hubo un problema al procesar la imagen. Prueba con otra imagen o revisa tu conexión.', 4000);
    });

    bgRemover.addEventListener('@ligrila/background-remover/image-processed', (e) => {
        lastProcessedResult = extractResult(e.detail);
        if (!lastProcessedResult) {
            console.warn('background-remover: no se reconoció el formato del resultado en event.detail:', e.detail);
            return;
        }
        if (bgResultActions) bgResultActions.classList.remove('hidden');
        showToast('✅ ¡Fondo eliminado!', 2000);
        if (bgResultActions) bgResultActions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

// Intenta obtener una URL descargable a partir de las formas más
// habituales en las que un componente de este tipo suele exponer
// el resultado (blob, dataURL, File, o ya una URL).
function extractResult(detail) {
    if (!detail) return null;
    const candidate = detail.blob || detail.file || detail.image || detail.result || detail;

    if (candidate instanceof Blob) {
        return { type: 'blob', value: candidate };
    }
    if (typeof candidate === 'string' && (candidate.startsWith('data:') || candidate.startsWith('blob:') || candidate.startsWith('http'))) {
        return { type: 'url', value: candidate };
    }
    if (detail.url && typeof detail.url === 'string') {
        return { type: 'url', value: detail.url };
    }
    if (detail.dataUrl && typeof detail.dataUrl === 'string') {
        return { type: 'url', value: detail.dataUrl };
    }
    return null;
}

// ============================================
// DESCARGA (gateada por anuncio recompensado)
// ============================================
function doDownload() {
    if (!lastProcessedResult) {
        showToast('⚠️ Todavía no hay ninguna imagen procesada.', 2500);
        return;
    }

    let url = lastProcessedResult.value;
    let isTemporaryUrl = false;
    if (lastProcessedResult.type === 'blob') {
        url = URL.createObjectURL(lastProcessedResult.value);
        isTemporaryUrl = true;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = 'sin-fondo.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (isTemporaryUrl) setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast('⬇️ Descargando imagen...', 2000);
}

if (bgDownloadBtn) {
    bgDownloadBtn.addEventListener('click', () => {
        window.requestReward(doDownload);
    });
}
