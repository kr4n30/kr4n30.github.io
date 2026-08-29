/* ============================================
   tools/colorize-image.js
   Colorea fotos en blanco y negro con DeOldify
   (modelo "artistic"), 100% en el navegador.

     Imagen original (B&N)
        │
        ▼
   Redimensionar a MODEL_SIZE×MODEL_SIZE (ver nota de INCERTIDUMBRE abajo)
        │
        ▼
   DeOldify (onnxruntime-web) → predice el color
        │
        ▼
   Fusión de luminancia: tomamos el BRILLO de la foto ORIGINAL a
   resolución completa + el COLOR (croma) que predijo la IA, y las
   combinamos en espacio YCbCr. Así el resultado no sale borroso
   por simplemente estirar la salida (más chica) del modelo.
        │
        ▼
   Imagen final coloreada, a la resolución original

   ⚠️ NOTA DE INCERTIDUMBRE (leer antes de tocar este archivo):
   La primera versión de esta tool usaba el modelo "quantized" (~61MB)
   alojado en cdn.glitch.me, con preprocesamiento verificado contra una
   demo pública funcionando (github.com/am9zZWY/deoldify). Ese host
   resultó NO mandar headers CORS, así que no se puede usar desde fetch().
   Se cambió a alojar el modelo "artistic" en Hugging Face (thookham/DeOldify,
   que sí soporta CORS — mismo host que ya usan los modelos de Mejorar
   Imagen), pero es una conversión ONNX distinta a la validada antes, así
   que el preprocesamiento de acá abajo es un PORT de la convención oficial
   de DeOldify (normalización estilo ImageNet, la misma que usa fastai en
   el entrenamiento original), NO algo verificado contra una demo en vivo.
   No se pudo probar en un navegador real desde el entorno donde se escribió
   este código. Puntos concretos que pueden necesitar ajuste si el resultado
   sale mal (gris, negro, ruido, o tira un error de "shape mismatch"):
     - MODEL_SIZE: si tira error de dimensiones, el mensaje de error de
       onnxruntime-web suele decir el tamaño esperado exacto — poner ese
       valor acá.
     - EXTERNAL_DATA_FILENAME: el nombre que el modelo espera para su
       archivo de pesos externo puede no coincidir exactamente con lo que
       está seteado; si tira un error de "external data" ese es el lugar.
     - Normalización: si los colores salen muy desaturados/planos, probar
       sin dividir por 255 antes de restar la media (algunas conversiones
       hornean esa parte distinto).
   ============================================ */

const ORT_VERSION = '1.20.1';
const ORT_JS = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/ort.min.js`;
const ORT_WASM_DIR = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;

// Modelo "artistic" de DeOldify, alojado en Hugging Face (CORS OK).
// Formato "external data": el grafo (.onnx) es chico, los pesos reales
// viven en un archivo .onnx.data aparte que hay que cargar junto.
const MODEL_BASE_URL = 'https://huggingface.co/thookham/DeOldify/resolve/main/';
const MODEL_URL = MODEL_BASE_URL + 'deoldify-artistic.onnx';
const EXTERNAL_DATA_FILENAME = 'deoldify-artistic.onnx.data'; // ver nota de incertidumbre arriba
const EXTERNAL_DATA_URL = MODEL_BASE_URL + EXTERNAL_DATA_FILENAME;

// Tamaño de entrada asumido (múltiplo de 16, como espera la arquitectura
// U-Net de DeOldify). Es un valor razonable típico, NO confirmado contra
// este export puntual — ver nota de incertidumbre arriba.
const MODEL_SIZE = 512;
const MAX_INPUT_DIM = 2000; // tope razonable para no colgar el navegador con fotos enormes

// Normalización estilo ImageNet (la que usa fastai/DeOldify en el
// entrenamiento original), aplicada sobre valores en [0,1].
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

const state = {
    sourceCanvas: null,
    resultCanvas: null,
    originalName: 'imagen',
    session: null,
    ortReadyPromise: null,
    busy: false,
};

// ============================================
// REFERENCIAS DOM
// ============================================
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const setupPanel = document.getElementById('setupPanel');
const sourcePreview = document.getElementById('sourcePreview');
const sourceMeta = document.getElementById('sourceMeta');
const colorizeBtn = document.getElementById('colorizeBtn');
const resetBtn = document.getElementById('resetBtn');
const progressWrap = document.getElementById('progressWrap');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const progressLabel = document.getElementById('progressLabel');
const resultPanel = document.getElementById('resultPanel');
const resultAfter = document.getElementById('resultAfter');
const resultBefore = document.getElementById('resultBefore');
const resultMeta = document.getElementById('resultMeta');
const downloadBtn = document.getElementById('downloadBtn');
const colCompare = document.getElementById('colCompare');
const colCompareBefore = document.getElementById('colCompareBefore');
const compareSlider = document.getElementById('compareSlider');
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeModal = document.getElementById('closeModal');
const toast = document.getElementById('toast');

// ============================================
// UTILIDADES DE UI (idénticas al resto de las tools)
// ============================================
let toastTimeout = null;
function showToast(message, duration = 3000) {
    if (!toast) return;
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}

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
if (infoBtn) infoBtn.addEventListener('click', openInfoModal);
if (closeModal) {
    closeModal.addEventListener('click', closeInfoModal);
    infoModal.addEventListener('click', (e) => { if (e.target === infoModal) closeInfoModal(); });
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && infoModal && !infoModal.classList.contains('hidden')) closeInfoModal();
});

function showProgress(visible) {
    if (!progressWrap) return;
    progressWrap.classList.toggle('hidden', !visible);
    if (visible) { progressFill.style.width = '0%'; progressPercent.textContent = '0%'; }
}
function updateProgress(fraction, label) {
    const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressPercent) progressPercent.textContent = pct + '%';
    if (label && progressLabel) progressLabel.textContent = label;
}
function setBusy(busy) {
    state.busy = busy;
    if (colorizeBtn) colorizeBtn.disabled = busy;
    if (resetBtn) resetBtn.disabled = busy;
}

// ============================================
// CARGA PEREZOSA DE onnxruntime-web
// ============================================
function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-col-src="' + src + '"]');
        if (existing) {
            if (existing.dataset.loaded === 'true') resolve();
            else existing.addEventListener('load', () => resolve());
            return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.dataset.colSrc = src;
        s.onload = () => { s.dataset.loaded = 'true'; resolve(); };
        s.onerror = () => reject(new Error('No se pudo cargar ' + src));
        document.head.appendChild(s);
    });
}

function ensureOrt() {
    if (!state.ortReadyPromise) {
        state.ortReadyPromise = loadScriptOnce(ORT_JS).then(() => {
            if (!window.ort) throw new Error('onnxruntime-web no se cargó correctamente');
            window.ort.env.wasm.wasmPaths = ORT_WASM_DIR;
            return window.ort;
        });
    }
    return state.ortReadyPromise;
}

async function getSession(onProgress) {
    if (state.session) return state.session;
    await ensureOrt();
    if (onProgress) onProgress(0, '⬇️ Descargando el modelo de IA (~250MB, solo la primera vez)...');
    const executionProviders = navigator.gpu ? ['webgpu', 'wasm'] : ['wasm'];
    try {
        state.session = await window.ort.InferenceSession.create(MODEL_URL, {
            executionProviders,
            externalData: [{ path: EXTERNAL_DATA_FILENAME, data: EXTERNAL_DATA_URL }],
        });
    } catch (err) {
        console.error('No se pudo crear la sesión de ONNX (revisar EXTERNAL_DATA_FILENAME / MODEL_SIZE, ver nota al principio del archivo):', err);
        throw err;
    }
    return state.session;
}

// ============================================
// PRE / POST PROCESAMIENTO DEL MODELO
// ⚠️ Puerto de la convención OFICIAL de DeOldify/fastai (normalización
// ImageNet), NO verificado contra este export puntual. Ver nota de
// incertidumbre al principio del archivo si el resultado sale mal.
// Asume tensor de entrada/salida en RGB, NCHW, nombres por defecto del
// grafo (se usan session.inputNames/outputNames en vez de hardcodear
// "input"/"out" porque este export puede nombrarlos distinto).
// ============================================
function clamp255(v) { return v < 0 ? 0 : (v > 255 ? 255 : v); }

function preprocess(imgData) {
    const size = MODEL_SIZE;
    const plane = size * size;
    const out = new Float32Array(3 * plane);
    for (let i = 0; i < plane; i++) {
        const r = imgData.data[i * 4] / 255;
        const g = imgData.data[i * 4 + 1] / 255;
        const b = imgData.data[i * 4 + 2] / 255;
        out[i] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
        out[plane + i] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
        out[2 * plane + i] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
    }
    return new window.ort.Tensor('float32', out, [1, 3, size, size]);
}

function postprocessToCanvas(tensor) {
    const dims = tensor.dims; // [1, 3, H, W]
    const h = dims[2], w = dims[3];
    const data = tensor.data;
    const plane = h * w;
    const imgData = new ImageData(w, h);
    for (let i = 0; i < plane; i++) {
        const r = (data[i] * IMAGENET_STD[0] + IMAGENET_MEAN[0]) * 255;
        const g = (data[plane + i] * IMAGENET_STD[1] + IMAGENET_MEAN[1]) * 255;
        const b = (data[2 * plane + i] * IMAGENET_STD[2] + IMAGENET_MEAN[2]) * 255;
        imgData.data[i * 4] = clamp255(Math.round(r));
        imgData.data[i * 4 + 1] = clamp255(Math.round(g));
        imgData.data[i * 4 + 2] = clamp255(Math.round(b));
        imgData.data[i * 4 + 3] = 255;
    }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').putImageData(imgData, 0, 0);
    return canvas;
}

// Combina el BRILLO de la foto original a resolución completa con el COLOR
// que predijo la IA (a MODEL_SIZE×MODEL_SIZE, estirado), usando el espacio
// YCbCr (BT.601). Esto evita que el resultado se vea borroso, que es lo que
// pasaría si simplemente estirásemos la salida (más chica) del modelo.
function blendLuminance(originalCanvas, colorCanvas256) {
    const w = originalCanvas.width, h = originalCanvas.height;

    const colorFullCanvas = document.createElement('canvas');
    colorFullCanvas.width = w; colorFullCanvas.height = h;
    const colorCtx = colorFullCanvas.getContext('2d');
    colorCtx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in colorCtx) colorCtx.imageSmoothingQuality = 'high';
    colorCtx.drawImage(colorCanvas256, 0, 0, w, h);
    const colorData = colorCtx.getImageData(0, 0, w, h);

    const origData = originalCanvas.getContext('2d').getImageData(0, 0, w, h);
    const outData = new ImageData(w, h);

    const total = w * h;
    for (let i = 0; i < total; i++) {
        const idx = i * 4;

        const rO = origData.data[idx], gO = origData.data[idx + 1], bO = origData.data[idx + 2];
        const y = 0.299 * rO + 0.587 * gO + 0.114 * bO;

        const rC = colorData.data[idx], gC = colorData.data[idx + 1], bC = colorData.data[idx + 2];
        const cb = -0.168736 * rC - 0.331264 * gC + 0.5 * bC + 128;
        const cr = 0.5 * rC - 0.418688 * gC - 0.081312 * bC + 128;

        const r = y + 1.402 * (cr - 128);
        const g = y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128);
        const b = y + 1.772 * (cb - 128);

        outData.data[idx] = clamp255(r);
        outData.data[idx + 1] = clamp255(g);
        outData.data[idx + 2] = clamp255(b);
        outData.data[idx + 3] = 255;
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = w; finalCanvas.height = h;
    finalCanvas.getContext('2d').putImageData(outData, 0, 0);
    return finalCanvas;
}

// ============================================
// PIPELINE PRINCIPAL
// ============================================
async function runPipeline() {
    if (!state.sourceCanvas || state.busy) return;
    setBusy(true);
    showProgress(true);
    try {
        updateProgress(0.05, 'Preparando...');
        const session = await getSession((p, label) => updateProgress(0.05 + p * 0.4, label));

        updateProgress(0.5, '🎨 Coloreando (analizando la imagen)...');
        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = MODEL_SIZE; smallCanvas.height = MODEL_SIZE;
        smallCanvas.getContext('2d').drawImage(state.sourceCanvas, 0, 0, MODEL_SIZE, MODEL_SIZE);
        const inputData = smallCanvas.getContext('2d').getImageData(0, 0, MODEL_SIZE, MODEL_SIZE);

        const inputTensor = preprocess(inputData);
        const feeds = {};
        feeds[session.inputNames[0]] = inputTensor; // nombre real del grafo, no asumimos "input"
        const results = await session.run(feeds);
        const outputTensor = results[session.outputNames[0]]; // ídem para la salida
        const colorCanvas256 = postprocessToCanvas(outputTensor);

        updateProgress(0.85, '🖼️ Combinando color con el detalle original...');
        const finalCanvas = blendLuminance(state.sourceCanvas, colorCanvas256);
        await new Promise((r) => setTimeout(r, 0));

        updateProgress(1, '✅ ¡Listo!');
        var doShow = function(){ showResult(finalCanvas); };
        if (window.showInterstitial) window.showInterstitial(doShow); else doShow();
    } catch (err) {
        console.error('colorize-image pipeline error:', err);
        showToast('⚠️ Hubo un problema coloreando la imagen: ' + (err && err.message ? err.message : 'error desconocido'), 5000);
    } finally {
        setBusy(false);
        setTimeout(() => showProgress(false), 600);
    }
}

// ============================================
// CARGA DE LA IMAGEN ORIGINAL
// ============================================
function loadImageFile(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            let { width, height } = img;
            if (width > MAX_INPUT_DIM || height > MAX_INPUT_DIM) {
                const scale = MAX_INPUT_DIM / Math.max(width, height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            resolve(canvas);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')); };
        img.src = url;
    });
}

async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('⚠️ Selecciona un archivo de imagen válido.', 3000);
        return;
    }
    try {
        const canvas = await loadImageFile(file);
        state.sourceCanvas = canvas;
        state.originalName = (file.name || 'imagen').replace(/\.[^.]+$/, '');

        sourcePreview.src = canvas.toDataURL('image/png');
        sourceMeta.textContent = `${canvas.width}×${canvas.height}px`;

        dropZone.classList.add('hidden');
        setupPanel.classList.remove('hidden');
        resultPanel.classList.add('hidden');
    } catch (err) {
        console.error(err);
        showToast('⚠️ No se pudo cargar la imagen.', 3000);
    }
}

// ============================================
// RESULTADO + COMPARADOR ANTES/DESPUÉS
// ============================================
function canvasToBlob(canvas, type = 'image/png', quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function showResult(canvas) {
    state.resultCanvas = canvas;
    resultAfter.src = canvas.toDataURL('image/png');
    resultBefore.src = state.sourceCanvas.toDataURL('image/png');
    resultMeta.textContent = `${canvas.width}×${canvas.height}px`;

    resultPanel.classList.remove('hidden');
    updateCompareWidth();
    compareSlider.value = 50;
    updateCompareSlider();
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('✅ ¡Imagen coloreada!', 2000);
}

function updateCompareWidth() {
    if (colCompare) colCompare.style.setProperty('--col-compare-img-width', colCompare.offsetWidth + 'px');
}
function updateCompareSlider() {
    colCompareBefore.style.width = compareSlider.value + '%';
}
window.addEventListener('resize', updateCompareWidth);
if (compareSlider) compareSlider.addEventListener('input', updateCompareSlider);

// ============================================
// DESCARGA (gateada por anuncio recompensado)
// ============================================
async function doDownload() {
    if (!state.resultCanvas) return;
    const blob = await canvasToBlob(state.resultCanvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.originalName + '-coloreada.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('⬇️ Descargando imagen...', 2000);
}
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        if (window.requestReward) window.requestReward(doDownload);
        else doDownload();
    });
}

// ============================================
// WIRING DE LA UI
// ============================================
if (dropZone) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
}
if (fileInput) {
    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
    });
}
if (colorizeBtn) colorizeBtn.addEventListener('click', runPipeline);
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        state.sourceCanvas = null;
        state.resultCanvas = null;
        fileInput.value = '';
        setupPanel.classList.add('hidden');
        resultPanel.classList.add('hidden');
        dropZone.classList.remove('hidden');
    });
}
