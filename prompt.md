# kR4N30 Toolbox — Resumen del proyecto

Documento de referencia rápida sobre qué es este sitio, qué contiene y cómo está pensado. Para el detalle técnico de "cómo tocar el código" ver `README.md` en la raíz; para el detalle de qué modelo de IA usa cada herramienta ver `models/README.md`. Este archivo es la foto general.

## Qué es

**kR4N30 Toolbox** es un sitio de herramientas online gratuitas (`https://kr4n30.github.io/`) que corren **100% en el navegador del usuario**, sin backend propio, sin subir archivos a ningún servidor. Se monetiza con Google AdSense (banners + un anuncio "recompensado" opcional antes de descargar el resultado).

Público objetivo: cualquier persona que necesite procesar una imagen o video rápido (extraer frames, quitar fondo, mejorar resolución, colorear una foto vieja) sin instalar software ni crear una cuenta.

Idiomas: español e inglés, con detección automática + toggle manual.

## Por qué existe (la propuesta de valor)

- **Privacidad real**: como el procesamiento ocurre en el navegador (WebAssembly / WebGPU), el archivo del usuario nunca sale de su dispositivo. Esto no es solo marketing — es literal, y es la razón por la que cada herramienta se elige/diseña así.
- **Cero fricción**: sin registro, sin instalar nada, funciona en PC y celular.
- **Gratis**, sostenido por publicidad.

## Cómo está construido (resumen técnico)

- Sitio 100% estático: HTML/CSS/JS plano, sin framework, sin build step. Se edita y se pushea directo.
- Hosteado en **GitHub Pages**, repo `kr4n30/kr4n30.github.io`. Un cambio solo se ve en vivo después de `git push` (no hay deploy automático más allá de eso).
- Cada herramienta ("tool") es una página independiente en `tools/*.html` + su propio CSS/JS. No comparten estado entre sí.
- La IA de cada herramienta se descarga **perezosamente** (recién al pulsar "procesar"), desde CDNs públicos (Hugging Face, jsDelivr, Google Storage) — nunca se sube nada propio a un servidor, y el modelo queda cacheado en el navegador del usuario tras la primera vez.
- Sistema de traducciones (`i18n.js` + `assets/locales/es.json` / `en.json`), sistema de ads (`adsense.js`) y de "anuncio recompensado antes de descargar" (`reward-gate.js`) compartidos por todas las tools.

## Las 4 herramientas actuales

### 1. Video a Imagen (`tools/video-to-image.html`)
Extrae fotogramas de un video subido y los descarga como imágenes (por intervalo de tiempo o cantidad de frames), con detección de duplicados, zoom, selección múltiple y descarga en ZIP. No usa IA — es procesamiento directo de video/canvas en el navegador.

### 2. Quitar Fondo (`tools/background-remover.html`)
Elimina el fondo de una imagen con IA. Usa el componente de terceros `@ligrila/background-remover`, que corre el modelo **RMBG-1.4** (briaai) en el navegador vía `@huggingface/transformers`.
⚠️ Nota de licencia: RMBG-1.4 es de uso **no comercial** salvo que se pague una licencia a BRIA — es la licencia más restrictiva de todo el sitio (más que las de Mejorar Imagen). El sitio tiene ads. Ver `models/rmbg/model.json` para el detalle.

### 3. Mejorar Imagen (`tools/image-enhancer.html`)
Pipeline de varios pasos, todo en el navegador:
1. *(Opcional)* **Swin2SR** reduce ruido/artefactos JPEG.
2. **Real-ESRGAN x4plus** escala la imagen completa x4 y mejora nitidez/texturas (con tiling para no colgar el navegador).
3. **MediaPipe** detecta los rostros en la imagen ya escalada.
4. **GFPGAN o CodeFormer** (a elección del usuario, con slider de fidelidad en CodeFormer) restauran específicamente esos rostros, que se vuelven a pegar con un feather blend.

⚠️ Nota de licencia: CodeFormer es explícitamente no comercial (NTU S-Lab 1.0); GFPGAN es Apache-2.0 pero con partes derivadas de código no comercial. Riesgo asumido a pedido del dueño del sitio. Real-ESRGAN, Swin2SR y MediaPipe son permisivos sin restricciones.

### 4. Colorear Fotos Antiguas (`tools/colorize-image.html`)
Coloriza fotos en blanco y negro con **DeOldify** (modelo cuantizado, ONNX, licencia MIT — sin restricciones). El modelo predice el color sobre una versión reducida (256×256) de la foto; el resultado se combina con el brillo/detalle de la foto ORIGINAL a resolución completa (fusión en espacio YCbCr) para que no salga borroso.

## Modelos de IA usados (resumen — detalle completo en `models/`)

| Herramienta | Modelo(s) | Dónde corre | Licencia |
|---|---|---|---|
| Quitar Fondo | RMBG-1.4 | `@huggingface/transformers` (vía componente de terceros) | ⚠️ No comercial sin pagar |
| Mejorar Imagen | Real-ESRGAN x4plus | onnxruntime-web | ✅ BSD-3-Clause |
| Mejorar Imagen | GFPGAN v1.4 | onnxruntime-web | ⚠️ Apache-2.0 con zona gris |
| Mejorar Imagen | CodeFormer | onnxruntime-web | 🚫 No comercial explícito |
| Mejorar Imagen | Swin2SR (opcional) | `@huggingface/transformers` | ✅ Apache-2.0 |
| Mejorar Imagen | MediaPipe Face Detector | `@mediapipe/tasks-vision` | ✅ Apache-2.0 |
| Colorear Fotos | DeOldify (cuantizado) | onnxruntime-web | ✅ MIT |

## Cosas a tener en mente para el futuro

- **Licencias**: de las 4 herramientas, 3 modelos (RMBG-1.4, GFPGAN, CodeFormer) tienen algún grado de restricción de uso comercial y el sitio corre ads. Es una decisión ya tomada y asumida, pero cualquier tool nueva con IA debería chequear la licencia del modelo ANTES de integrarlo si se quiere evitar sumar más riesgo.
- **CSP (Content-Security-Policy)**: cada tool tiene la suya en un `<meta>` propio. El error más común al sumar una librería nueva es olvidar agregar su dominio ahí (ver sección 4 del `README.md`).
- **No hay deploy automático**: todo cambio necesita `git add -A && git commit -m "..." && git push` para reflejarse en `https://kr4n30.github.io/`. A veces además hay que esperar la purga de caché del navegador/CDN (hard refresh si algo no parece haberse actualizado).
- **`android-video-to-image/`** en la raíz del repo es un proyecto Android aparte (Kotlin/Gradle), no forma parte de este sitio web.
