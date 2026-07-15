# models/

Esta carpeta **no contiene archivos de modelo** (ningún `.onnx`, `.tflite`, etc.). Es solo un manifiesto: un lugar único para ver de un vistazo qué modelo de IA usa cada herramienta, de dónde se descarga en tiempo real, cuánto pesa y bajo qué licencia está.

Los modelos reales se siguen descargando desde CDNs públicos (Hugging Face, jsDelivr, Google Storage, Glitch) directamente en el navegador del usuario — ver la filosofía del proyecto en el `README.md` de la raíz. No se suben binarios de modelos a este repo:

- GitHub bloquea archivos >100MB sin Git LFS, y varios de estos modelos pesan más que eso.
- Git LFS tiene límite gratuito de ancho de banda (1GB/mes), que se agotaría rápido si cada visitante del sitio descargara el modelo desde ahí.
- Mantenerlos en Hugging Face / CDNs aprovecha su ancho de banda e infraestructura, gratis.

## ⚠️ Importante: esto es documentación, no configuración activa

Las URLs reales que usa cada herramienta están **hardcodeadas en su `assets/js/tools/<id>.js`** (buscá la constante `MODEL_URLS` o `MODEL_URL` al principio del archivo). Los `model.json` de acá abajo son un espejo pensado para que un humano (o Claude en una sesión futura) entienda el panorama rápido sin tener que abrir cada `.js`.

**Si cambiás la URL de un modelo, actualizala en los DOS lugares** (el `.js` de la tool y el `model.json` correspondiente) para que no queden desincronizados.

## Índice de modelos en uso

| Carpeta | Modelo | Usado por | Licencia |
|---|---|---|---|
| `realesrgan/` | Real-ESRGAN x4plus (fp16) | Mejorar Imagen | BSD-3-Clause ✅ |
| `gfpgan/` | GFPGAN v1.4 | Mejorar Imagen | Apache-2.0 ⚠️ (con partes derivadas de código no comercial) |
| `codeformer/` | CodeFormer (fp16) | Mejorar Imagen | NTU S-Lab 1.0 🚫 (uso no comercial) |
| `swin2sr/` | Swin2SR realworld-sr-x4 | Mejorar Imagen (paso opcional de reducción de ruido) | Apache-2.0 ✅ |
| `face-detector/` | MediaPipe BlazeFace (short range) | Mejorar Imagen (detección de rostros) | Apache-2.0 ✅ |
| `rmbg/` | RMBG-1.4 (briaai) | Quitar Fondo | No comercial (bria-rmbg-1.4) ⚠️ |
| `deoldify/` | DeOldify (cuantizado) | Colorear Fotos Antiguas | MIT ✅ |

⚠️/🚫 = revisar la nota de licencia dentro del `model.json` antes de asumir que es 100% seguro para uso comercial (el sitio tiene AdSense).
