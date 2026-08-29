/* ============================================
   tools/image-enhancer.js
   Pipeline completo de "Mejorar Imagen", 100% en el
   navegador:

     Imagen original
        │
        ▼
   (opcional) Swin2SR  → reduce ruido/artefactos JPEG
        │
        ▼
   Real-ESRGAN x4plus  → escala x4 y mejora nitidez/texturas
        │
        ▼
   MediaPipe FaceDetector → detecta rostros en la imagen ya escalada
        │
        ▼
   GFPGAN o CodeFormer → restaura SOLO esos rostros
        │
        ▼
   Imagen final (recorte de rostro pegado con feather blend)

   Librerías usadas (todas cargadas por CDN, sin build step):
     - onnxruntime-web  → corre Real-ESRGAN / GFPGAN / CodeFormer (.onnx)
     - @huggingface/transformers → corre Swin2SR (pipeline "image-to-image")
     - @mediapipe/tasks-vision   → detector de rostros

   NOTA IMPORTANTE SOBRE PRECISIÓN:
   Los modelos ONNX de GFPGAN/CodeFormer usados acá vienen de exports de la
   comunidad (ReActor / Face-Upscalers-onnx), pensados originalmente para
   pipelines en Python con OpenCV (que lee imágenes en BGR). Por eso el
   preprocesamiento de esos dos modelos asume orden de canales BGR y rango
   [-1, 1]. Real-ESRGAN, en cambio, espera RGB en rango [0, 1] (así lo
   entrena el repo oficial). Si al probar en el navegador los colores de los
   rostros restaurados salen invertidos (azules por rojos), cambiar
   `bgr: true` a `bgr: false` en FACE_MODEL_TENSOR_OPTS más abajo.
   No se pudo verificar pixel a pixel en un navegador real desde este
   entorno de desarrollo, así que conviene probar con una foto real antes
   de confiar 100% en el resultado.
   ============================================ */

// ============================================
// CONFIGURACIÓN: CDNs y modelos
// ============================================
const ORT_VERSION = '1.20.1';
const CDN = {
    ortJs: `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/ort.min.js`,
    ortWasmDir: `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`,
    transformers: 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.6.3',
    mediapipeVision: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',
    mediapipeWasm: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
};

const MODEL_URLS = {
    realesrgan: 'https://huggingface.co/OwlMaster/AllFilesRope/resolve/main/RealESRGAN_x4plus.fp16.onnx',
    gfpgan: 'https://huggingface.co/datasets/Gourieff/ReActor/resolve/main/models/facerestore_models/GFPGANv1.4.onnx',
    codeformer: 'https://huggingface.co/netrunner-exe/Face-Upscalers-onnx/resolve/main/codeformer.fp16.onnx',
    faceDetector: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
};

const SWIN2SR_MODEL_ID = 'Xenova/swin2SR-realworld-sr-x4-64-bsrgan-psnr';

const ESRGAN_SCALE = 4;
const TILE_SIZE = 192;      // tamaño del "core" de cada tile (antes de escalar)
const TILE_OVERLAP = 16;    // contexto extra que se descarta al pegar (evita costuras)
const MAX_INPUT_DIM = 800;  // redimensionamos imágenes de entrada muy grandes por rendimiento
const FACE_SIZE = 512;      // tamaño de entrada de GFPGAN/CodeFormer
const FACE_MARGIN = 0.4;    // margen extra alrededor del bbox detectado (40%)

// Ver nota de canales de color al inicio del archivo.
const FACE_MODEL_TENSOR_OPTS = { signed: true, bgr: true };

// ============================================
// ESTADO
// ============================================
const state = {
    sourceCanvas: null,
    resultCanvas: null,
    originalName: 'imagen',
    sessions: {},
    ortReadyPromise: null,
    denoisePipelinePromise: null,
    faceDetectorPromise: null,
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
const denoiseToggle = document.getElementById('denoiseToggle');
const faceRestoreToggle = document.getElementById('faceRestoreToggle');
const restorerModelGroup = document.getElementById('restorerModelGroup');
const fidelityGroup = document.getElementById('fidelityGroup');
const fidelitySlider = document.getElementById('fidelitySlider');
const fidelityDisplay = document.getElementById('fidelityDisplay');
const enhanceBtn = document.getElementById('enhanceBtn');
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
const ieCompare = document.getElementById('ieCompare');
const ieCompareBefore = document.getElementById('ieCompareBefore');
const compareSlider = document.getElementById('compareSlider');
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeModal = document.getElementById('closeModal');
const toast = document.getElementById('toast');

// ============================================
// UTILIDADES DE UI (toast, modal, progreso)
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
    if (enhanceBtn) enhanceBtn.disabled = busy;
    if (resetBtn) resetBtn.disabled = busy;
}

// ============================================
// CARGA PEREZOSA DE LIBRERÍAS
// ============================================
function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-ie-src="' + src + '"]');
        if (existing) {
            if (existing.dataset.loaded === 'true') resolve();
            else existing.addEventListener('load', () => resolve());
            return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.dataset.ieSrc = src;
        s.onload = () => { s.dataset.loaded = 'true'; resolve(); };
        s.onerror = () => reject(new Error('No se pudo cargar ' + src));
        document.head.appendChild(s);
    });
}

function ensureOrt() {
    if (!state.ortReadyPromise) {
        state.ortReadyPromise = loadScriptOnce(CDN.ortJs).then(() => {
            if (!window.ort) throw new Error('onnxruntime-web no se cargó correctamente');
            window.ort.env.wasm.wasmPaths = CDN.ortWasmDir;
            return window.ort;
        });
    }
    return state.ortReadyPromise;
}

async function pickExecutionProviders() {
    // WebGPU es mucho más rápido para estos modelos; si el navegador no lo
    // soporta, onnxruntime-web cae a WASM (más lento pero funciona en todos lados).
    return navigator.gpu ? ['webgpu', 'wasm'] : ['wasm'];
}

async function getSession(key, url, onProgress) {
    if (state.sessions[key]) return state.sessions[key];
    await ensureOrt();
    if (onProgress) onProgress(0, '⬇️ Descargando modelo de IA (puede tardar la primera vez)...');
    const executionProviders = await pickExecutionProviders();
    const session = await window.ort.InferenceSession.create(url, { executionProviders });
    state.sessions[key] = session;
    return session;
}

async function ensureFaceDetector() {
    if (!state.faceDetectorPromise) {
        state.faceDetectorPromise = (async () => {
            const vision = await import(/* webpackIgnore: true */ CDN.mediapipeVision);
            const filesetResolver = await vision.FilesetResolver.forVisionTasks(CDN.mediapipeWasm);
            return vision.FaceDetector.createFromOptions(filesetResolver, {
                baseOptions: { modelAssetPath: MODEL_URLS.faceDetector },
                runningMode: 'IMAGE',
                minDetectionConfidence: 0.5,
            });
        })();
    }
    return state.faceDetectorPromise;
}

async function ensureDenoisePipeline(onProgress) {
    if (!state.denoisePipelinePromise) {
        state.denoisePipelinePromise = (async () => {
            const { pipeline } = await import(/* webpackIgnore: true */ CDN.transformers);
            return pipeline('image-to-image', SWIN2SR_MODEL_ID, {
                progress_callback: (p) => {
                    if (p && typeof p.progress === 'number' && onProgress) {
                        onProgress(p.progress / 100, '⬇️ Descargando modelo de reducción de ruido... ' + Math.round(p.progress) + '%');
                    }
                },
            });
        })();
    }
    return state.denoisePipelinePromise;
}

// ============================================
// UTILIDADES DE IMAGEN / TENSORES
// ============================================
function clamp255(v) { return v < 0 ? 0 : (v > 255 ? 255 : v); }

function imageDataToTensor(imgData, opts) {
    opts = opts || {};
    const { width, height, data } = imgData;
    const plane = width * height;
    const out = new Float32Array(3 * plane);
    for (let i = 0; i < plane; i++) {
        let r = data[i * 4] / 255;
        let g = data[i * 4 + 1] / 255;
        let b = data[i * 4 + 2] / 255;
        if (opts.signed) { r = (r - 0.5) / 0.5; g = (g - 0.5) / 0.5; b = (b - 0.5) / 0.5; }
        if (opts.bgr) { out[i] = b; out[plane + i] = g; out[2 * plane + i] = r; }
        else { out[i] = r; out[plane + i] = g; out[2 * plane + i] = b; }
    }
    return new window.ort.Tensor('float32', out, [1, 3, height, width]);
}

function tensorToCanvas(tensor, opts) {
    opts = opts || {};
    const dims = tensor.dims;
    const height = dims[2], width = dims[3];
    const data = tensor.data;
    const plane = width * height;
    const imgData = new ImageData(width, height);
    for (let i = 0; i < plane; i++) {
        const c0 = data[i], c1 = data[plane + i], c2 = data[2 * plane + i];
        let r, g, b;
        if (opts.bgr) { b = c0; g = c1; r = c2; } else { r = c0; g = c1; b = c2; }
        if (opts.signed) { r = r * 0.5 + 0.5; g = g * 0.5 + 0.5; b = b * 0.5 + 0.5; }
        const idx = i * 4;
        imgData.data[idx] = clamp255(r * 255);
        imgData.data[idx + 1] = clamp255(g * 255);
        imgData.data[idx + 2] = clamp255(b * 255);
        imgData.data[idx + 3] = 255;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').putImageData(imgData, 0, 0);
    return canvas;
}

function canvasToBlob(canvas, type = 'image/png', quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function rawImageToCanvas(raw) {
    const canvas = document.createElement('canvas');
    canvas.width = raw.width; canvas.height = raw.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(raw.width, raw.height);
    const channels = raw.channels || 3;
    for (let i = 0, p = 0; i < raw.width * raw.height; i++, p += channels) {
        imgData.data[i * 4] = raw.data[p];
        imgData.data[i * 4 + 1] = raw.data[p + 1];
        imgData.data[i * 4 + 2] = raw.data[p + 2];
        imgData.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

// ============================================
// PASO 1 (opcional): REDUCCIÓN DE RUIDO (Swin2SR)
// Corremos el modelo (que hace super-resolución x4 mientras limpia ruido/
// artefactos JPEG) y volvemos a bajar el resultado al tamaño original: nos
// quedamos con el efecto de "limpieza", y dejamos el escalado real para
// Real-ESRGAN en el paso siguiente.
// ============================================
async function runDenoise(sourceCanvas, onProgress) {
    const upscaler = await ensureDenoisePipeline(onProgress);
    const blob = await canvasToBlob(sourceCanvas);
    const url = URL.createObjectURL(blob);
    try {
        onProgress(0.5, '🧹 Reduciendo ruido...');
        const output = await upscaler(url);
        const rawCanvas = rawImageToCanvas(output);
        const denoised = document.createElement('canvas');
        denoised.width = sourceCanvas.width;
        denoised.height = sourceCanvas.height;
        denoised.getContext('2d').drawImage(rawCanvas, 0, 0, denoised.width, denoised.height);
        onProgress(1, '🧹 Ruido reducido');
        return denoised;
    } finally {
        URL.revokeObjectURL(url);
    }
}

// ============================================
// PASO 2: ESCALADO x4 (Real-ESRGAN, con tiling)
// ============================================
async function runRealESRGAN(sourceCanvas, onProgress) {
    const session = await getSession('realesrgan', MODEL_URLS.realesrgan, onProgress);

    const srcW = sourceCanvas.width, srcH = sourceCanvas.height;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = srcW * ESRGAN_SCALE;
    outCanvas.height = srcH * ESRGAN_SCALE;
    const outCtx = outCanvas.getContext('2d');
    const srcCtx = sourceCanvas.getContext('2d');

    const tilesX = Math.ceil(srcW / TILE_SIZE);
    const tilesY = Math.ceil(srcH / TILE_SIZE);
    const total = tilesX * tilesY;
    let done = 0;

    for (let ty = 0; ty < tilesY; ty++) {
        for (let tx = 0; tx < tilesX; tx++) {
            const coreX0 = tx * TILE_SIZE, coreY0 = ty * TILE_SIZE;
            const coreX1 = Math.min(srcW, coreX0 + TILE_SIZE);
            const coreY1 = Math.min(srcH, coreY0 + TILE_SIZE);

            const x0 = Math.max(0, coreX0 - TILE_OVERLAP);
            const y0 = Math.max(0, coreY0 - TILE_OVERLAP);
            const x1 = Math.min(srcW, coreX1 + TILE_OVERLAP);
            const y1 = Math.min(srcH, coreY1 + TILE_OVERLAP);
            const tileW = x1 - x0, tileH = y1 - y0;

            const imgData = srcCtx.getImageData(x0, y0, tileW, tileH);
            const inputTensor = imageDataToTensor(imgData, {});
            const feeds = {};
            feeds[session.inputNames[0]] = inputTensor;
            const results = await session.run(feeds);
            const outTensor = results[session.outputNames[0]];
            const tileCanvas = tensorToCanvas(outTensor, {});

            const cropX = (coreX0 - x0) * ESRGAN_SCALE;
            const cropY = (coreY0 - y0) * ESRGAN_SCALE;
            const cropW = (coreX1 - coreX0) * ESRGAN_SCALE;
            const cropH = (coreY1 - coreY0) * ESRGAN_SCALE;

            outCtx.drawImage(
                tileCanvas,
                cropX, cropY, cropW, cropH,
                coreX0 * ESRGAN_SCALE, coreY0 * ESRGAN_SCALE, cropW, cropH
            );

            done++;
            onProgress(done / total, `🔍 Escalando imagen (tile ${done}/${total})...`);
            await new Promise((r) => setTimeout(r, 0)); // cede el hilo principal
        }
    }
    return outCanvas;
}

// ============================================
// PASO 3 + 4: DETECCIÓN Y RESTAURACIÓN DE ROSTROS
// ============================================
async function detectFaces(canvas) {
    const detector = await ensureFaceDetector();
    const result = detector.detect(canvas);
    return (result.detections || []).map((d) => d.boundingBox);
}

function squareBoxWithMargin(box, imgW, imgH, margin) {
    const cx = box.originX + box.width / 2;
    const cy = box.originY + box.height / 2;
    let s = Math.round(Math.max(box.width, box.height) * (1 + margin));
    s = Math.min(s, imgW, imgH);
    let x = Math.round(cx - s / 2);
    let y = Math.round(cy - s / 2);
    x = Math.max(0, Math.min(x, imgW - s));
    y = Math.max(0, Math.min(y, imgH - s));
    return { x, y, size: s };
}

function applyFeatherMask(ctx, size) {
    const imgData = ctx.getImageData(0, 0, size, size);
    const cx = size / 2, cy = size / 2;
    const rOuter = size / 2;
    const rInner = rOuter * 0.75;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
            const alpha = d > rInner ? Math.max(0, 1 - (d - rInner) / (rOuter - rInner)) : 1;
            const idx = (y * size + x) * 4 + 3;
            imgData.data[idx] = Math.round(imgData.data[idx] * alpha);
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

async function runFaceRestoreSession(session, restorer, tensor, fidelity) {
    if (restorer === 'codeformer') {
        const feeds = {};
        feeds[session.inputNames[0]] = tensor;
        if (session.inputNames.length > 1) {
            const wName = session.inputNames.find((n) => n.toLowerCase() === 'w') || session.inputNames[1];
            feeds[wName] = new window.ort.Tensor('float32', Float32Array.from([fidelity]), [1]);
        }
        const results = await session.run(feeds);
        return results[session.outputNames[0]];
    }
    const feeds = {};
    feeds[session.inputNames[0]] = tensor;
    const results = await session.run(feeds);
    return results[session.outputNames[0]];
}

async function restoreFaces(canvas, restorer, fidelity, onProgress) {
    onProgress(0, '🧑 Detectando rostros...');
    const faces = await detectFaces(canvas);
    if (!faces.length) {
        onProgress(1, '🧑 No se detectaron rostros');
        return { canvas, facesFound: 0 };
    }

    const modelUrl = restorer === 'codeformer' ? MODEL_URLS.codeformer : MODEL_URLS.gfpgan;
    const session = await getSession(restorer, modelUrl, (p, label) => onProgress(p * 0.3, label));

    const outCanvas = document.createElement('canvas');
    outCanvas.width = canvas.width; outCanvas.height = canvas.height;
    const outCtx = outCanvas.getContext('2d');
    outCtx.drawImage(canvas, 0, 0);
    const srcCtx = canvas.getContext('2d');

    for (let i = 0; i < faces.length; i++) {
        const box = squareBoxWithMargin(faces[i], canvas.width, canvas.height, FACE_MARGIN);

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = box.size; cropCanvas.height = box.size;
        cropCanvas.getContext('2d').putImageData(srcCtx.getImageData(box.x, box.y, box.size, box.size), 0, 0);

        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = FACE_SIZE; resizedCanvas.height = FACE_SIZE;
        resizedCanvas.getContext('2d').drawImage(cropCanvas, 0, 0, FACE_SIZE, FACE_SIZE);
        const inputData = resizedCanvas.getContext('2d').getImageData(0, 0, FACE_SIZE, FACE_SIZE);

        const tensor = imageDataToTensor(inputData, FACE_MODEL_TENSOR_OPTS);
        const outTensor = await runFaceRestoreSession(session, restorer, tensor, fidelity);
        const restoredCanvas = tensorToCanvas(outTensor, FACE_MODEL_TENSOR_OPTS);

        const backCanvas = document.createElement('canvas');
        backCanvas.width = box.size; backCanvas.height = box.size;
        const backCtx = backCanvas.getContext('2d');
        backCtx.drawImage(restoredCanvas, 0, 0, box.size, box.size);
        applyFeatherMask(backCtx, box.size);

        outCtx.drawImage(backCanvas, box.x, box.y);

        onProgress(0.3 + ((i + 1) / faces.length) * 0.7, `🙂 Restaurando rostro ${i + 1}/${faces.length}...`);
        await new Promise((r) => setTimeout(r, 0));
    }

    return { canvas: outCanvas, facesFound: faces.length };
}

// ============================================
// ORQUESTACIÓN DEL PIPELINE COMPLETO
// ============================================
async function runPipeline() {
    if (!state.sourceCanvas || state.busy) return;
    setBusy(true);
    showProgress(true);
    try {
        let working = state.sourceCanvas;

        if (denoiseToggle.checked) {
            working = await runDenoise(working, (p, label) => updateProgress(p * 0.2, label));
        } else {
            updateProgress(0.2, 'Preparando...');
        }

        working = await runRealESRGAN(working, (p, label) => updateProgress(0.2 + p * 0.5, label));

        let facesFound = 0;
        if (faceRestoreToggle.checked) {
            const restorer = document.querySelector('input[name="restorer"]:checked').value;
            const fidelity = parseInt(fidelitySlider.value, 10) / 100;
            const result = await restoreFaces(working, restorer, fidelity, (p, label) => updateProgress(0.7 + p * 0.3, label));
            working = result.canvas;
            facesFound = result.facesFound;
        }

        updateProgress(1, '✅ ¡Listo!');
        var doShow = function(){ showResult(working, facesFound); };
        if (window.showInterstitial) window.showInterstitial(doShow); else doShow();
    } catch (err) {
        console.error('image-enhancer pipeline error:', err);
        showToast('⚠️ Hubo un problema procesando la imagen: ' + (err && err.message ? err.message : 'error desconocido'), 5000);
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
        sourceMeta.textContent = `${canvas.width}×${canvas.height}px → resultado final hasta ${canvas.width * ESRGAN_SCALE}×${canvas.height * ESRGAN_SCALE}px`;

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
function showResult(canvas, facesFound) {
    state.resultCanvas = canvas;
    resultAfter.src = canvas.toDataURL('image/png');
    resultBefore.src = state.sourceCanvas.toDataURL('image/png');

    resultMeta.textContent = `${state.sourceCanvas.width}×${state.sourceCanvas.height}px → ${canvas.width}×${canvas.height}px` +
        (faceRestoreToggle.checked ? ` · ${facesFound} rostro(s) restaurado(s)` : '');

    resultPanel.classList.remove('hidden');
    updateCompareWidth();
    compareSlider.value = 50;
    updateCompareSlider();
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('✅ ¡Imagen mejorada!', 2000);
}

function updateCompareWidth() {
    if (ieCompare) ieCompare.style.setProperty('--ie-compare-img-width', ieCompare.offsetWidth + 'px');
}
function updateCompareSlider() {
    const pct = compareSlider.value;
    ieCompareBefore.style.width = pct + '%';
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
    a.download = state.originalName + '-mejorada.png';
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
if (faceRestoreToggle) {
    faceRestoreToggle.addEventListener('change', () => {
        restorerModelGroup.classList.toggle('hidden', !faceRestoreToggle.checked);
        const isCodeformer = document.querySelector('input[name="restorer"]:checked').value === 'codeformer';
        fidelityGroup.classList.toggle('hidden', !(faceRestoreToggle.checked && isCodeformer));
    });
}
document.querySelectorAll('input[name="restorer"]').forEach((radio) => {
    radio.addEventListener('change', () => {
        const isCodeformer = radio.value === 'codeformer' && radio.checked;
        fidelityGroup.classList.toggle('hidden', !(faceRestoreToggle.checked && isCodeformer));
    });
});
if (fidelitySlider) {
    fidelitySlider.addEventListener('input', () => {
        fidelityDisplay.textContent = (parseInt(fidelitySlider.value, 10) / 100).toFixed(2);
    });
}
if (enhanceBtn) enhanceBtn.addEventListener('click', runPipeline);
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
