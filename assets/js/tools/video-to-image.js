/* ============================================
   tools/video-to-image.js
   Lógica EXCLUSIVA de la herramienta "Video a Imagen".
   100% local: el video nunca sale del navegador.
   Depende de: JSZip (CDN), reward-gate.js (descarga
   con anuncio recompensado) y adsense.js (banners).
   ============================================ */

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const videoSection = document.getElementById('videoSection');
const videoPreview = document.getElementById('videoPreview');
const videoNameDisplay = document.getElementById('videoNameDisplay');
const videoSizeDisplay = document.getElementById('videoSizeDisplay');
const videoFpsEl = document.getElementById('videoFps');
const videoMemoryEl = document.getElementById('videoMemory');
const memoryWarningEl = document.getElementById('memoryWarning');
const extractBtn = document.getElementById('extractBtn');
const countField = document.getElementById('countField');
const intervalSlider = document.getElementById('intervalSlider');
const intervalDisplay = document.getElementById('intervalDisplay');
const countInput = document.getElementById('countInput');
const formatInput = document.getElementById('formatInput');
const qualityInput = document.getElementById('qualityInput');
const qualityDisplay = document.getElementById('qualityDisplay');
const startTimeInput = document.getElementById('startTimeInput');
const endTimeInput = document.getElementById('endTimeInput');
const setStartBtn = document.getElementById('setStartBtn');
const setEndBtn = document.getElementById('setEndBtn');
const rangeSlider = document.getElementById('rangeSlider');
const rangeStartLabel = document.getElementById('rangeStartLabel');
const rangeEndLabel = document.getElementById('rangeEndLabel');
const removeDuplicatesCheck = document.getElementById('removeDuplicatesCheck');
const duplicateThreshold = document.getElementById('duplicateThreshold');
const thresholdDisplay = document.getElementById('thresholdDisplay');
const duplicateThresholdGroup = document.getElementById('duplicateThresholdGroup');
const progressWrap = document.getElementById('progressWrap');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const progressCount = document.getElementById('progressCount');
const progressEta = document.getElementById('progressEta');
const progressSpeed = document.getElementById('progressSpeed');
const progressLabel = document.getElementById('progressLabel');
const cancelExtractBtn = document.getElementById('cancelExtractBtn');
const resultsPanel = document.getElementById('resultsPanel');
const frameGridContainer = document.getElementById('frameGridContainer');
const framesGrid = document.getElementById('framesGrid');
const frameCountEl = document.getElementById('frameCount');
const totalSizeEl = document.getElementById('totalSize');
const duplicatesRemovedEl = document.getElementById('duplicatesRemoved');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');
const downloadDirectBtn = document.getElementById('downloadDirectBtn');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const selectionCountEl = document.getElementById('selectionCount');
const visibleCountEl = document.getElementById('visibleCount');
const scrubSlider = document.getElementById('scrubSlider');
const scrubTime = document.getElementById('scrubTime');
const captureFrameBtn = document.getElementById('captureFrameBtn');
const toast = document.getElementById('toast');
const sortFramesBtn = document.getElementById('sortFramesBtn');
const clearFramesBtn = document.getElementById('clearFramesBtn');
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeModal = document.getElementById('closeModal');
const emptyState = document.getElementById('emptyState');
const zoomModal = document.getElementById('zoomModal');
const closeZoomModal = document.getElementById('closeZoomModal');
const zoomImage = document.getElementById('zoomImage');
const zoomLevel = document.getElementById('zoomLevel');
const zoomResolution = document.getElementById('zoomResolution');
const pagination = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');

// ============================================
// ESTADO
// ============================================
const state = {
    extracting: false,
    cancelled: false,
    frames: [],
    currentPage: 1,
    pageSize: 20,
    totalFrames: 0
};

let isSeekingFromSlider = false;
let currentVideoFile = null;
let toastTimeout = null;
let frameUrls = [];
let touchStartX = 0;
let touchStartY = 0;
let currentZoom = 1;
let currentZoomFrame = null;
let sharedCanvas = null;
let sharedCtx = null;

// ============================================
// CANVAS REUTILIZABLE
// ============================================
function getCanvas(width, height) {
    if (!sharedCanvas) {
        sharedCanvas = document.createElement('canvas');
        sharedCtx = sharedCanvas.getContext('2d');
    }
    if (sharedCanvas.width !== width || sharedCanvas.height !== height) {
        sharedCanvas.width = width;
        sharedCanvas.height = height;
    }
    return sharedCanvas;
}

// ============================================
// MODAL DE INFO
// ============================================
function openInfoModal() {
    infoModal.classList.remove('hidden');
    if (window.ToolboxA11y) window.ToolboxA11y.trapFocus(infoModal);
}
function closeInfoModal() {
    infoModal.classList.add('hidden');
    if (window.ToolboxA11y) window.ToolboxA11y.releaseFocus(infoModal);
}
if (infoBtn && infoModal) {
    infoBtn.addEventListener('click', openInfoModal);
}
if (closeModal && infoModal) {
    closeModal.addEventListener('click', closeInfoModal);
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) closeInfoModal();
    });
}

// ============================================
// ZOOM
// ============================================
function openZoom(frame) {
    currentZoomFrame = frame;
    currentZoom = 1;
    zoomImage.src = URL.createObjectURL(frame.blob);
    zoomLevel.textContent = '100%';
    zoomResolution.textContent = frame.blob.size ? formatFileSize(frame.blob.size) : '-';
    zoomModal.classList.remove('hidden');
    if (window.ToolboxA11y) window.ToolboxA11y.trapFocus(zoomModal);
    applyZoom(1);
}

function closeZoom() {
    zoomModal.classList.add('hidden');
    if (window.ToolboxA11y) window.ToolboxA11y.releaseFocus(zoomModal);
    if (zoomImage.src) {
        URL.revokeObjectURL(zoomImage.src);
        zoomImage.src = '';
    }
}

function applyZoom(zoom) {
    currentZoom = zoom;
    const img = zoomImage;
    if (zoom === 'fit') {
        img.style.transform = 'scale(1)';
        img.style.width = '100%';
        img.style.height = 'auto';
        zoomLevel.textContent = 'Ajustar';
        return;
    }
    img.style.width = 'auto';
    img.style.height = 'auto';
    const scale = parseFloat(zoom);
    img.style.transform = 'scale(' + scale + ')';
    zoomLevel.textContent = Math.round(scale * 100) + '%';
}

closeZoomModal.addEventListener('click', closeZoom);
zoomModal.addEventListener('click', (e) => {
    if (e.target === zoomModal) closeZoom();
});

document.querySelectorAll('.zoom-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.zoom-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyZoom(btn.dataset.zoom);
    });
});

// ============================================
// CALIDAD
// ============================================
if (qualityInput) {
    qualityInput.addEventListener('input', () => {
        if (qualityDisplay) qualityDisplay.textContent = qualityInput.value + '%';
    });
}

// ============================================
// DUPLICADOS
// ============================================
removeDuplicatesCheck.addEventListener('change', (e) => {
    duplicateThresholdGroup.classList.toggle('hidden', !e.target.checked);
});

if (duplicateThreshold) {
    duplicateThreshold.addEventListener('input', () => {
        if (thresholdDisplay) thresholdDisplay.textContent = duplicateThreshold.value + '%';
    });
}

// ============================================
// INTERVALO VISUAL
// ============================================
intervalSlider.addEventListener('input', () => {
    const val = parseFloat(intervalSlider.value);
    intervalDisplay.textContent = val.toFixed(2);
    document.querySelectorAll('.preset-buttons .preset-btn').forEach(btn => {
        btn.classList.toggle('active', Math.abs(parseFloat(btn.dataset.value) - val) < 0.01);
    });
});

document.querySelectorAll('.preset-buttons .preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const val = parseFloat(btn.dataset.value);
        intervalSlider.value = val;
        intervalDisplay.textContent = val.toFixed(2);
        document.querySelectorAll('.preset-buttons .preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ============================================
// RANGO DE EXTRACCIÓN
// ============================================
function updateRangeUI() {
    const duration = videoPreview.duration || 0;
    const start = Math.min(parseFloat(startTimeInput.value) || 0, duration);
    const end = Math.min(parseFloat(endTimeInput.value) || duration, duration);

    const startPct = duration > 0 ? (start / duration) * 100 : 0;
    const endPct = duration > 0 ? (end / duration) * 100 : 100;
    rangeSlider.value = startPct + ',' + endPct;

    rangeStartLabel.textContent = fmtTime(start);
    rangeEndLabel.textContent = fmtTime(end);
}

startTimeInput.addEventListener('change', updateRangeUI);
endTimeInput.addEventListener('change', updateRangeUI);

setStartBtn.addEventListener('click', () => {
    startTimeInput.value = videoPreview.currentTime.toFixed(2);
    updateRangeUI();
    showToast('📌 Inicio fijado en ' + fmtTime(videoPreview.currentTime), 1500);
});

setEndBtn.addEventListener('click', () => {
    endTimeInput.value = videoPreview.currentTime.toFixed(2);
    updateRangeUI();
    showToast('📌 Fin fijado en ' + fmtTime(videoPreview.currentTime), 1500);
});

rangeSlider.addEventListener('input', function () {
    const duration = videoPreview.duration || 0;
    const values = this.value.split(',').map(Number);
    const startPct = Math.min(values[0], values[1]);
    const endPct = Math.max(values[0], values[1]);
    const start = (startPct / 100) * duration;
    const end = (endPct / 100) * duration;
    startTimeInput.value = start.toFixed(2);
    endTimeInput.value = end.toFixed(2);
    rangeStartLabel.textContent = fmtTime(start);
    rangeEndLabel.textContent = fmtTime(end);
});

// ============================================
// FUNCIONES UTILITARIAS
// ============================================
function showToast(message, duration = 3000) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}

function fmtTime(t) {
    return (isFinite(t) ? t : 0).toFixed(2) + 's';
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + units[i];
}

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) return mins + ':' + String(secs).padStart(2, '0');
    return secs + 's';
}

function sanitizeFileName(name) {
    return name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
}

function revokeAllUrls() {
    for (let i = 0; i < frameUrls.length; i++) {
        URL.revokeObjectURL(frameUrls[i]);
    }
    frameUrls = [];
}

function updateTotalSize() {
    let total = 0;
    for (let i = 0; i < state.frames.length; i++) {
        total += state.frames[i].blob.size;
    }
    totalSizeEl.textContent = formatFileSize(total);
}

function updateSelectionCount() {
    const selected = state.frames.filter(f => f.selected).length;
    selectionCountEl.textContent = selected + '/' + state.frames.length + ' seleccionados';
}

function estimateMemoryUsage() {
    if (!videoPreview.videoWidth || !videoPreview.videoHeight) return null;
    const width = videoPreview.videoWidth;
    const height = videoPreview.videoHeight;
    const format = formatInput.value;
    const quality = parseInt(qualityInput?.value || 92) / 100;

    let bytesPerPixel = 3;
    if (format === 'image/png') bytesPerPixel = 4;
    else if (format === 'image/webp') bytesPerPixel = 3;

    const frameBytes = width * height * bytesPerPixel * (0.5 + quality * 0.5);
    const estimatedTotal = frameBytes * state.frames.length;

    return {
        perFrame: formatFileSize(frameBytes),
        total: formatFileSize(estimatedTotal),
        frames: state.frames.length,
        isHigh: estimatedTotal > 100 * 1024 * 1024
    };
}

// ============================================
// FPS REAL DEL VIDEO
// ============================================
function detectFps(video) {
    return new Promise((resolve) => {
        const wasMuted = video.muted;
        const wasPaused = video.paused;
        let settled = false;
        let timerId = null;

        function finish(fps) {
            if (settled) return;
            settled = true;
            if (timerId) cancelAnimationFrame(timerId);
            video.muted = wasMuted;
            if (wasPaused) video.pause();
            resolve(fps);
        }

        // La detección necesita que el video reproduzca frames de verdad.
        // Lo silenciamos temporalmente para evitar que las políticas de
        // autoplay-con-sonido del navegador bloqueen el play().
        video.muted = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => { /* autoplay bloqueado: seguimos con el timeout de seguridad */ });
        }

        // Red de seguridad: si por lo que sea nunca llegan frames (video
        // pausado, callback que no se dispara, etc.), no nos quedamos
        // colgados en "Detectando..." para siempre.
        const safetyTimeout = setTimeout(() => finish(null), 2500);

        if (video.requestVideoFrameCallback) {
            let count = 0;
            const start = performance.now();
            function frameCallback() {
                if (settled) return;
                count++;
                const elapsed = (performance.now() - start) / 1000;
                if (elapsed >= 1) {
                    clearTimeout(safetyTimeout);
                    finish(Math.round(count / elapsed));
                } else {
                    video.requestVideoFrameCallback(frameCallback);
                }
            }
            video.requestVideoFrameCallback(frameCallback);
        } else {
            let frameCount = 0;
            const startTime = performance.now();
            function countFrame() {
                if (settled) return;
                frameCount++;
                const elapsed = (performance.now() - startTime) / 1000;
                if (elapsed >= 1) {
                    clearTimeout(safetyTimeout);
                    finish(frameCount > 0 ? Math.round(frameCount / elapsed) : null);
                } else {
                    timerId = requestAnimationFrame(countFrame);
                }
            }
            timerId = requestAnimationFrame(countFrame);
        }
    });
}

// ============================================
// DETECCIÓN DE DUPLICADOS
// ============================================
function areFramesSimilar(frame1, frame2, threshold) {
    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    const size = 32;
    canvas1.width = size;
    canvas1.height = size;
    canvas2.width = size;
    canvas2.height = size;

    return new Promise((resolve) => {
        const img1 = new Image();
        const img2 = new Image();
        let loaded1 = false;
        let loaded2 = false;
        let settled = false;

        // Red de seguridad: si una imagen falla en cargar (blob corrupto,
        // memoria agotada, etc.) no queremos que la extracción entera se
        // quede colgada esperando un "onload" que nunca llega.
        const safetyTimeout = setTimeout(() => finish(false), 3000);

        function finish(result) {
            if (settled) return;
            settled = true;
            clearTimeout(safetyTimeout);
            resolve(result);
            if (img1.src) URL.revokeObjectURL(img1.src);
            if (img2.src) URL.revokeObjectURL(img2.src);
        }

        function checkDone() {
            if (!loaded1 || !loaded2) return;
            try {
                ctx1.drawImage(img1, 0, 0, size, size);
                ctx2.drawImage(img2, 0, 0, size, size);
                const data1 = ctx1.getImageData(0, 0, size, size).data;
                const data2 = ctx2.getImageData(0, 0, size, size).data;
                let diff = 0;
                const total = data1.length;
                for (let i = 0; i < total; i += 4) {
                    diff += Math.abs(data1[i] - data2[i]);
                    diff += Math.abs(data1[i + 1] - data2[i + 1]);
                    diff += Math.abs(data1[i + 2] - data2[i + 2]);
                }
                const similarity = 1 - (diff / (total * 255));
                finish(similarity >= threshold);
            } catch (e) {
                finish(false);
            }
        }

        img1.onload = () => { loaded1 = true; checkDone(); };
        img2.onload = () => { loaded2 = true; checkDone(); };
        img1.onerror = () => finish(false);
        img2.onerror = () => finish(false);
        img1.src = URL.createObjectURL(frame1.blob);
        img2.src = URL.createObjectURL(frame2.blob);
    });
}

// ============================================
// EVENTOS DE CARGA DE VIDEO
// ============================================
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) loadVideo(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => {
    if (fileInput.files.length) loadVideo(fileInput.files[0]);
});

function loadVideo(file) {
    if (!file.type.startsWith('video/')) {
        showToast('⚠️ Selecciona un archivo de video válido.', 2500);
        return;
    }
    currentVideoFile = file;
    const url = URL.createObjectURL(file);
    videoPreview.src = url;
    videoNameDisplay.textContent = sanitizeFileName(file.name);
    videoSizeDisplay.textContent = formatFileSize(file.size);
    videoSection.classList.remove('hidden');
    resultsPanel.classList.add('hidden');
    revokeAllUrls();
    framesGrid.innerHTML = '';
    state.frames = [];
    state.totalFrames = 0;
    state.currentPage = 1;
    showToast('📹 Video cargado: ' + file.name, 2000);
}

// ============================================
// CONTROLES DEL VIDEO
// ============================================
videoPreview.addEventListener('loadedmetadata', async () => {
    scrubSlider.max = videoPreview.duration;
    scrubSlider.value = 0;
    scrubTime.textContent = fmtTime(0) + ' / ' + fmtTime(videoPreview.duration);
    document.getElementById('videoResolution').textContent = videoPreview.videoWidth + 'x' + videoPreview.videoHeight;
    document.getElementById('videoDuration').textContent = fmtTime(videoPreview.duration);

    videoFpsEl.textContent = 'Detectando...';
    try {
        const fps = await detectFps(videoPreview);
        videoFpsEl.textContent = fps ? fps + ' fps' : 'Desconocido';
    } catch (e) {
        videoFpsEl.textContent = 'Desconocido';
    }

    if (currentVideoFile) {
        document.getElementById('videoFileSize').textContent = formatFileSize(currentVideoFile.size);
    }
    endTimeInput.value = videoPreview.duration.toFixed(2);
    updateRangeUI();
});

videoPreview.addEventListener('timeupdate', () => {
    if (isSeekingFromSlider) return;
    scrubSlider.value = videoPreview.currentTime;
    scrubTime.textContent = fmtTime(videoPreview.currentTime) + ' / ' + fmtTime(videoPreview.duration);
});

scrubSlider.addEventListener('input', () => {
    isSeekingFromSlider = true;
    videoPreview.pause();
    videoPreview.currentTime = parseFloat(scrubSlider.value);
    scrubTime.textContent = fmtTime(scrubSlider.value) + ' / ' + fmtTime(videoPreview.duration);
});
scrubSlider.addEventListener('change', () => { isSeekingFromSlider = false; });

// ============================================
// GESTOS TÁCTILES
// ============================================
videoPreview.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: true });

videoPreview.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    if (absDeltaX > absDeltaY && absDeltaX > 20) {
        e.preventDefault();
        const duration = videoPreview.duration;
        const current = videoPreview.currentTime;
        const step = duration * 0.02;
        const newTime = Math.max(0, Math.min(duration, current + (deltaX > 0 ? step : -step)));
        videoPreview.currentTime = newTime;
        scrubSlider.value = newTime;
        scrubTime.textContent = fmtTime(newTime) + ' / ' + fmtTime(duration);
        touchStartX = touch.clientX;
    }
}, { passive: false });

// ============================================
// CAPTURAR FRAME MANUAL
// ============================================
captureFrameBtn.addEventListener('click', async () => {
    if (!videoPreview.duration || isNaN(videoPreview.duration)) return;
    const format = formatInput.value;
    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    const quality = parseInt(qualityInput?.value || 92) / 100;
    const canvas = getCanvas(videoPreview.videoWidth, videoPreview.videoHeight);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(res => canvas.toBlob(res, format, quality));
    const t = videoPreview.currentTime;
    const name = 'frame_manual_' + String(state.frames.length + 1).padStart(3, '0') + '_' + t.toFixed(2) + 's.' + ext;
    state.frames.push({ blob, name, time: t, selected: true });
    state.totalFrames = state.frames.length;
    renderFrames();
    showToast('📸 Frame capturado: ' + name, 1500);
});

// ============================================
// CAMBIO DE MODO
// ============================================
document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        countField.classList.toggle('hidden', e.target.value === 'interval');
    });
});

// ============================================
// CANCELAR EXTRACCIÓN
// ============================================
cancelExtractBtn.addEventListener('click', () => {
    state.cancelled = true;
    showToast('⛔ Cancelando extracción...', 2000);
    progressLabel.textContent = '⛔ Cancelando...';
    cancelExtractBtn.disabled = true;
});

// ============================================
// SEEK TO CON TIMEOUT
// ============================================
function seekTo(video, time) {
    return new Promise((resolve) => {
        let resolved = false;

        function onSeeked() {
            if (!resolved) {
                resolved = true;
                video.removeEventListener('seeked', onSeeked);
                resolve();
            }
        }

        video.addEventListener('seeked', onSeeked);
        video.currentTime = time;

        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                video.removeEventListener('seeked', onSeeked);
                resolve();
            }
        }, 3000);
    });
}

// ============================================
// EXTRACCIÓN DE FRAMES
// ============================================
extractBtn.addEventListener('click', async () => {
    if (state.extracting) {
        showToast('⚠️ Ya hay una extracción en curso', 2000);
        return;
    }

    if (!videoPreview.duration || isNaN(videoPreview.duration)) {
        showToast('⚠️ El video aún no ha cargado completamente.', 2500);
        return;
    }

    const mode = document.querySelector('input[name="mode"]:checked').value;
    const duration = videoPreview.duration;

    const startTime = Math.max(0, parseFloat(startTimeInput.value) || 0);
    const endTime = Math.min(duration, parseFloat(endTimeInput.value) || duration);
    const rangeDuration = endTime - startTime;

    if (rangeDuration <= 0) {
        showToast('⚠️ El rango no es válido: Inicio debe ser menor que Fin.', 3000);
        return;
    }

    let timestamps = [];

    if (mode === 'interval') {
        const interval = parseFloat(intervalSlider.value) || 0.5;
        for (let t = startTime; t < endTime; t += interval) {
            timestamps.push(t);
        }
        if (timestamps.length > 0 && timestamps[timestamps.length - 1] < endTime - 0.01) {
            timestamps.push(endTime);
        }
        if (timestamps.length === 0) timestamps.push(startTime);
    } else {
        const count = Math.max(1, parseInt(countInput.value) || 1);
        if (count === 1) {
            timestamps = [startTime];
        } else {
            for (let i = 0; i < count; i++) {
                timestamps.push(startTime + (rangeDuration * i) / (count - 1));
            }
            timestamps[timestamps.length - 1] = Math.max(startTime, endTime - 0.01);
        }
    }

    const format = formatInput.value;
    const quality = parseInt(qualityInput?.value || 92) / 100;
    const bytesPerPixel = format === 'image/png' ? 4 : 3;
    const frameBytes = videoPreview.videoWidth * videoPreview.videoHeight * bytesPerPixel * (0.5 + quality * 0.5);
    const estimatedTotal = frameBytes * timestamps.length;

    if (estimatedTotal > 100 * 1024 * 1024) {
        const proceed = confirm(
            '⚠️ ADVERTENCIA DE MEMORIA\n\n' +
            'Esta extracción generará aproximadamente ' + formatFileSize(estimatedTotal) +
            ' en memoria RAM.\n\n' +
            'Número de frames: ' + timestamps.length + '\n' +
            'Tamaño estimado por frame: ' + formatFileSize(frameBytes) + '\n\n' +
            '¿Continuar de todos modos?'
        );
        if (!proceed) return;
    }

    if (timestamps.length > 1000) {
        const proceed = confirm(
            '⚠️ Muchos frames\n\n' +
            'Vas a extraer ' + timestamps.length + ' frames.\n' +
            'Esto puede tomar varios minutos y consumir mucha memoria.\n\n' +
            '¿Continuar?'
        );
        if (!proceed) return;
    }

    state.cancelled = false;
    state.extracting = true;
    extractBtn.disabled = true;
    cancelExtractBtn.disabled = false;
    progressWrap.classList.remove('hidden');
    resultsPanel.classList.add('hidden');
    revokeAllUrls();
    framesGrid.innerHTML = '';
    state.frames = [];
    state.totalFrames = 0;

    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    const canvas = getCanvas(videoPreview.videoWidth, videoPreview.videoHeight);
    const ctx = canvas.getContext('2d');

    const wasMuted = videoPreview.muted;
    videoPreview.muted = true;

    const total = timestamps.length;
    let startTimeExtract = Date.now();
    let processed = 0;
    let duplicatesRemoved = 0;
    let lastFrame = null;

    for (let i = 0; i < total; i++) {
        if (state.cancelled) {
            progressLabel.textContent = '⛔ Extracción cancelada';
            cancelExtractBtn.disabled = true;
            break;
        }

        const t = timestamps[i];
        await seekTo(videoPreview, t);
        ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise(res => canvas.toBlob(res, format, quality));
        const name = 'frame_' + String(i + 1).padStart(3, '0') + '_' + t.toFixed(2) + 's.' + ext;

        let isDuplicate = false;
        if (removeDuplicatesCheck.checked && lastFrame) {
            const threshold = parseFloat(duplicateThreshold?.value || 99) / 100;
            isDuplicate = await areFramesSimilar({ blob }, lastFrame, threshold);
            if (isDuplicate) {
                duplicatesRemoved++;
                continue;
            }
        }

        const frame = { blob, name, time: t, selected: true };
        state.frames.push(frame);
        lastFrame = frame;
        processed = i + 1;

        const elapsed = (Date.now() - startTimeExtract) / 1000;
        const fps = elapsed > 0 ? processed / elapsed : 0;
        const remaining = fps > 0 ? (total - processed) / fps : 0;

        const percent = Math.round((processed / total) * 100);
        progressFill.style.width = percent + '%';
        progressPercent.textContent = percent + '%';
        progressCount.textContent = processed + ' / ' + total;
        progressEta.textContent = '⏱️ Tiempo restante: ' + formatTime(remaining);
        progressSpeed.textContent = '🚀 Velocidad: ' + fps.toFixed(1) + ' fps';
        progressLabel.textContent = 'Extrayendo frame ' + processed + ' de ' + total + '...';
    }

    videoPreview.muted = wasMuted;
    state.extracting = false;
    extractBtn.disabled = false;
    cancelExtractBtn.disabled = true;

    if (state.cancelled) {
        progressWrap.classList.add('hidden');
        state.frames = [];
        state.totalFrames = 0;
        showToast('⛔ Extracción cancelada', 2000);
        state.cancelled = false;
        return;
    }

    state.totalFrames = state.frames.length;
    progressWrap.classList.add('hidden');

    if (duplicatesRemoved > 0) {
        duplicatesRemovedEl.textContent = '🗑️ ' + duplicatesRemoved + ' duplicados eliminados';
        duplicatesRemovedEl.classList.remove('hidden');
    } else {
        duplicatesRemovedEl.classList.add('hidden');
    }

    const memEstimate = estimateMemoryUsage();
    if (memEstimate && memEstimate.isHigh) {
        memoryWarningEl.textContent = '⚠️ ' + memEstimate.total + ' estimado';
        memoryWarningEl.classList.remove('hidden');
        memoryWarningEl.title = 'Memoria estimada: ' + memEstimate.total + ' en ' + memEstimate.frames + ' frames';
    } else {
        memoryWarningEl.classList.add('hidden');
    }

    state.currentPage = 1;
    renderFrames();
    showToast('✅ Extracción completada! ' + state.frames.length + ' frames', 3000);
});

// ============================================
// RENDERIZAR FRAMES
// ============================================
function renderFrames() {
    const total = state.frames.length;
    frameCountEl.textContent = total;
    updateTotalSize();
    updateSelectionCount();

    if (total === 0) {
        emptyState.classList.remove('hidden');
        resultsPanel.classList.add('hidden');
        pagination.classList.add('hidden');
        return;
    }
    emptyState.classList.add('hidden');
    resultsPanel.classList.remove('hidden');

    const pageSize = state.pageSize;
    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.min(state.currentPage, totalPages);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, total);
    const pageFrames = state.frames.slice(startIdx, endIdx);

    if (totalPages > 1) {
        pagination.classList.remove('hidden');
        pageInfo.textContent = 'Página ' + currentPage + ' de ' + totalPages;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    } else {
        pagination.classList.add('hidden');
    }

    visibleCountEl.textContent = 'Mostrando ' + pageFrames.length + ' de ' + total;

    framesGrid.innerHTML = '';
    const allSelected = state.frames.every(f => f.selected);
    selectAllCheckbox.checked = allSelected;

    const fragment = document.createDocumentFragment();

    pageFrames.forEach((frame, index) => {
        const globalIndex = startIdx + index;
        const url = URL.createObjectURL(frame.blob);
        frameUrls.push(url);

        const card = document.createElement('div');
        card.className = 'frame-card';
        if (frame.selected) card.classList.add('selected');

        const checkboxWrap = document.createElement('div');
        checkboxWrap.className = 'checkbox-wrap';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'frame-checkbox';
        checkbox.checked = frame.selected;
        checkbox.dataset.index = globalIndex;
        checkboxWrap.appendChild(checkbox);

        const img = document.createElement('img');
        img.src = url;
        img.alt = frame.name;
        img.loading = 'lazy';
        img.decoding = 'async';

        const meta = document.createElement('div');
        meta.className = 'meta';
        const timeSpan = document.createElement('span');
        timeSpan.textContent = '⏱️ ' + frame.time.toFixed(2) + 's';

        const zoomBtn = document.createElement('span');
        zoomBtn.className = 'zoom-btn-small';
        zoomBtn.textContent = '🔍';
        zoomBtn.title = 'Zoom en este frame';
        zoomBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openZoom(frame);
        });

        const link = document.createElement('a');
        link.href = url;
        link.download = frame.name;
        link.textContent = '⬇️';

        meta.appendChild(timeSpan);
        meta.appendChild(zoomBtn);
        meta.appendChild(link);
        card.appendChild(checkboxWrap);
        card.appendChild(img);
        card.appendChild(meta);
        fragment.appendChild(card);

        checkbox.addEventListener('change', function (e) {
            const idx = parseInt(this.dataset.index);
            if (!isNaN(idx) && idx < state.frames.length) {
                state.frames[idx].selected = this.checked;
                const parentCard = this.closest('.frame-card');
                if (parentCard) parentCard.classList.toggle('selected', this.checked);
                updateSelectAllState();
                updateSelectionCount();
                updateTotalSize();
            }
        });
    });

    framesGrid.appendChild(fragment);
    updateSelectAllState();
    updateSelectionCount();
    updateTotalSize();
}

// ============================================
// ACTUALIZAR ESTADO DE SELECCIÓN
// ============================================
function updateSelectAllState() {
    if (state.frames.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }
    const allSelected = state.frames.every(f => f.selected);
    const someSelected = state.frames.some(f => f.selected);
    selectAllCheckbox.checked = allSelected;
    selectAllCheckbox.indeterminate = !allSelected && someSelected;
}

// ============================================
// PAGINACIÓN
// ============================================
prevPageBtn.addEventListener('click', () => {
    if (state.currentPage > 1) {
        state.currentPage--;
        renderFrames();
        frameGridContainer.scrollTop = 0;
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(state.frames.length / state.pageSize);
    if (state.currentPage < totalPages) {
        state.currentPage++;
        renderFrames();
        frameGridContainer.scrollTop = 0;
    }
});

// ============================================
// SELECCIONAR TODOS
// ============================================
selectAllCheckbox.addEventListener('change', (e) => {
    const checked = e.target.checked;
    state.frames.forEach(frame => frame.selected = checked);
    document.querySelectorAll('.frame-checkbox').forEach(cb => {
        cb.checked = checked;
        const card = cb.closest('.frame-card');
        if (card) card.classList.toggle('selected', checked);
    });
    updateSelectionCount();
    updateTotalSize();
});

// ============================================
// ORDENAR FRAMES
// ============================================
sortFramesBtn.addEventListener('click', () => {
    if (state.frames.length === 0) {
        showToast('⚠️ No hay frames para ordenar', 2000);
        return;
    }
    state.frames.sort((a, b) => a.time - b.time);
    revokeAllUrls();
    renderFrames();
    showToast('🔄 Frames ordenados por tiempo', 1500);
});

// ============================================
// LIMPIAR FRAMES
// ============================================
clearFramesBtn.addEventListener('click', () => {
    if (state.frames.length === 0) {
        showToast('⚠️ No hay frames para limpiar', 2000);
        return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar todos los frames?')) {
        revokeAllUrls();
        state.frames = [];
        state.totalFrames = 0;
        state.currentPage = 1;
        framesGrid.innerHTML = '';
        resultsPanel.classList.add('hidden');
        emptyState.classList.remove('hidden');
        duplicatesRemovedEl.classList.add('hidden');
        memoryWarningEl.classList.add('hidden');
        pagination.classList.add('hidden');
        showToast('🗑️ Todos los frames eliminados', 2000);
    }
});

// ============================================
// DESCARGA DIRECTA (gateada por anuncio recompensado)
// ============================================
function doDirectDownload() {
    const selectedFrames = state.frames.filter(f => f.selected);
    if (!selectedFrames.length) {
        showToast('⚠️ No hay frames seleccionados para descargar.', 2500);
        return;
    }

    const baseName = currentVideoFile ? sanitizeFileName(currentVideoFile.name.replace(/\.[^.]+$/, '')) : 'frames';

    selectedFrames.forEach((frame, index) => {
        setTimeout(() => {
            const url = URL.createObjectURL(frame.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = baseName + '_' + frame.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, index * 200);
    });

    showToast('⬇️ Descargando ' + selectedFrames.length + ' frames (directo)', 3000);
}

downloadDirectBtn.addEventListener('click', () => {
    if (!state.frames.some(f => f.selected)) {
        showToast('⚠️ No hay frames seleccionados para descargar.', 2500);
        return;
    }
    window.requestReward(doDirectDownload);
});

// ============================================
// DESCARGAS EN ZIP (gateadas por anuncio recompensado)
// ============================================
async function downloadFramesZip(frames, filename, folderName) {
    const btn = frames === state.frames ? downloadAllBtn : downloadSelectedBtn;
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = '📦...';

    try {
        const zip = new JSZip();
        const folder = zip.folder(folderName);
        frames.forEach(frame => { folder.file(frame.name, frame.blob); });
        const content = await zip.generateAsync({ type: 'blob' });

        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        showToast('📦 Descargado: ' + filename + ' (' + frames.length + ' frames)', 3000);
    } catch (error) {
        console.error('Error:', error);
        showToast('⚠️ Hubo un error al crear el ZIP.', 3000);
    }

    btn.disabled = false;
    btn.textContent = originalText;
}

downloadSelectedBtn.addEventListener('click', () => {
    const selectedFrames = state.frames.filter(f => f.selected);
    if (!selectedFrames.length) {
        showToast('⚠️ No hay frames seleccionados.', 2500);
        return;
    }
    window.requestReward(() => {
        const baseName = currentVideoFile ? sanitizeFileName(currentVideoFile.name.replace(/\.[^.]+$/, '')) : 'frames';
        downloadFramesZip(selectedFrames, baseName + '_seleccionados.zip', baseName);
    });
});

downloadAllBtn.addEventListener('click', () => {
    if (!state.frames.length) {
        showToast('⚠️ No hay frames para descargar.', 2500);
        return;
    }
    window.requestReward(() => {
        const baseName = currentVideoFile ? sanitizeFileName(currentVideoFile.name.replace(/\.[^.]+$/, '')) : 'frames';
        downloadFramesZip(state.frames, baseName + '.zip', baseName);
    });
});

// ============================================
// TECLAS RÁPIDAS
// ============================================
document.addEventListener('keydown', (e) => {
    const inField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable;
    // Ctrl+D es el atajo nativo de "guardar marcador" del navegador y Ctrl+E
    // también se usa en varios navegadores/extensiones: solo los capturamos
    // cuando el foco NO está en un campo de texto, para no interferir con
    // la escritura normal ni sorprender al usuario.
    if (!inField && e.ctrlKey && e.key === 'e') { e.preventDefault(); extractBtn.click(); }
    if (!inField && e.ctrlKey && e.key === 'd') { e.preventDefault(); downloadAllBtn.click(); }
    if (!inField && e.key === ' ') {
        e.preventDefault();
        videoPreview.paused ? videoPreview.play() : videoPreview.pause();
    }
    if (e.key === 'Escape') {
        if (!zoomModal.classList.contains('hidden')) closeZoom();
        if (infoModal && !infoModal.classList.contains('hidden')) closeInfoModal();
    }
});

// ============================================
// INICIALIZACIÓN
// ============================================
console.log('🎬 Video a Imagen (Toolbox) cargado');
console.log('📖 Atajos: Ctrl+E | Ctrl+D | Espacio | Esc');
