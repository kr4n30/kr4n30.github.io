# kR4N30 Toolbox

Herramientas online gratis que corren **100% en el navegador** (WASM/WebGPU, sin backend). Todo el sitio es HTML/CSS/JS estático, servido por **GitHub Pages** desde este mismo repo — no hay build step, no hay servidor propio, no hay base de datos.

Sitio en vivo: https://kr4n30.github.io/

---

## 1. Cómo está armado el proyecto

```
index.html                     → Home (hero, grid de herramientas, features)
sitemap.xml                    → Listado de URLs para buscadores (hay que sumar cada tool nueva)
robots.txt

partials/
  header.html                  → Navbar, se inyecta por JS en todas las páginas
  footer.html                  → Footer, ídem

tools/
  video-to-image.html          → Cada herramienta es su propio .html standalone
  background-remover.html
  image-enhancer.html

assets/
  css/
    style.css                  → Base del sitio (variables de color, layout, home)
    tools-common.css           → Estilos COMPARTIDOS por todas las tools (paneles, botones,
                                  modales, ad-slots, barra de progreso, toast...)
    tools/<nombre>.css         → Estilos EXCLUSIVOS de cada herramienta
  js/
    app.js                     → Renderiza el grid de herramientas del home (array `tools`)
    include.js                 → Inyecta header/footer + utilidades de accesibilidad de modales
    i18n.js                    → Sistema de traducción ES/EN
    adsense.js                 → Wrapper de Google AdSense (banners + cola de anuncios)
    reward-gate.js             → Modal "mirá un anuncio para desbloquear la descarga"
    tools/<nombre>.js          → Lógica EXCLUSIVA de cada herramienta
  locales/
    es.json / en.json          → Diccionarios de traducción
  icons/, fonts, etc.

android-video-to-image/        → Proyecto Android aparte (Kotlin/Gradle), NO forma parte
                                  del sitio web. Vive en el mismo repo pero es independiente.
```

### Filosofía del proyecto (no romper esto al agregar cosas)

- **Todo corre en el navegador del usuario.** Ninguna herramienta sube archivos a un servidor propio. Si un modelo de IA necesita descargarse, se hace desde un CDN público (jsDelivr, Hugging Face, Google Storage) y se cachea en el navegador.
- **Sin build step.** No hay webpack/vite/npm run build. Se edita el HTML/CSS/JS directo y se commitea. Las librerías externas se cargan por `<script>`/`import()` desde CDN.
- **Cada tool es independiente.** Un archivo `.html` en `tools/`, su propio `.css` en `assets/css/tools/`, su propio `.js` en `assets/js/tools/`. No comparten estado entre sí.

---

## 2. Cómo agregar una herramienta nueva (checklist)

Usá `tools/image-enhancer.html` + `assets/js/tools/image-enhancer.js` + `assets/css/tools/image-enhancer.css` como plantilla; es la más completa de las tres. Pasos:

1. **`tools/<id>.html`** — copiá la estructura de una tool existente:
   - `<meta>` de SEO (title, description, canonical, Open Graph) apuntando a `https://kr4n30.github.io/tools/<id>.html`.
   - **CSP en el `<meta http-equiv="Content-Security-Policy">`**: si tu herramienta carga algo de un dominio nuevo (un CDN, un modelo de IA, una API), tenés que agregar ese dominio a `script-src` / `connect-src` / `worker-src` / `img-src` según corresponda, o el navegador lo bloquea en silencio (revisar la consola). Ver la sección 4.
   - Enlazá `assets/css/style.css`, `assets/css/tools-common.css` y tu propio `assets/css/tools/<id>.css`.
   - Al final del `<body>`: `include.js`, `i18n.js`, `adsense.js`, `reward-gate.js` (con `defer`), y tu script de la tool (`type="module"` si usás `import()`).
   - Reusá las clases ya existentes en vez de inventar nuevas: `.panel`, `.drop-zone-panel`, `.controls-grid`, `.control-group`, `.progress-wrap`, `.modal`, `.ad-slot`, `.toast` (todas viven en `tools-common.css`).
   - Copiá el bloque de **modal de recompensa** (`#rewardModal` + sus IDs internos) tal cual de otra tool si tu descarga va a estar gateada por anuncio — `reward-gate.js` depende de esos IDs exactos.

2. **`assets/css/tools/<id>.css`** — solo lo que sea específico de esta tool (lo genérico ya está en `tools-common.css`).

3. **`assets/js/tools/<id>.js`** — lógica de la tool. Patrones que ya usan las otras:
   - `showToast(msg)` / modal de info (`#infoModal`) — copiá el mismo código de otra tool, es igual en las tres.
   - Si necesitás una librería pesada (IA, etc.), cargala **perezosamente** (recién cuando el usuario aprieta el botón de procesar), no en el `<head>` — así el home y la carga inicial de la tool no se ven afectados.
   - Descarga final: `window.requestReward(function () { ...descargar... })` (definido por `reward-gate.js`).

4. **Registrar la tool en el home** — `assets/js/app.js`, array `tools`: agregar `{ id, icon (clase de Font Awesome), href, comingSoon: false, i18n: { name, desc } }`.

5. **Traducciones** — en `assets/locales/es.json` Y `assets/locales/en.json`, dentro de `"tools"`, agregar la clave que referenciaste en `i18n.name` / `i18n.desc` del paso anterior. También actualizar `highlights.item1.value` (contador de "Herramientas disponibles") si querés que refleje el número real.

6. **`sitemap.xml`** — sumar un `<url>` nuevo con la URL de la tool.

7. **Si la tool usa modelos de IA / librerías de terceros**: revisar licencias antes de sumarlas si el modelo no es MIT/Apache/BSD — el sitio tiene AdSense (uso comercial), así que licencias "solo no comercial" (ej. CodeFormer) son una zona de riesgo legal, no un bloqueo técnico. Ver nota en `tools/image-enhancer.html` (modal de info) como ejemplo de cómo dejar los créditos visibles.

8. **Probar en local** abriendo el HTML con un servidor estático (`python -m http.server` o la extensión Live Server), NO con `file://` directo — el CSP y los `fetch()` a `/partials/...` necesitan `http://`.

9. **Deploy**: no existe deploy automático más allá de GitHub Pages sirviendo la rama del repo. Hay que:
   ```
   git add -A
   git commit -m "..."
   git push
   ```
   GitHub Pages tarda ~1 minuto en reflejar los cambios después del push.

---

## 3. Sistema de idiomas (i18n)

- `assets/js/i18n.js` detecta el idioma (guardado en `localStorage` o el del navegador, con fallback a español) y traduce cualquier elemento con `data-i18n="clave.anidada"` (textContent) o `data-i18n-attr="atributo:clave"` (para atributos como `placeholder`).
- Los diccionarios están en `assets/locales/es.json` / `en.json` — misma forma en los dos, si agregás una clave en uno agregala en el otro.
- El botón de idioma (`#langToggle`, vive en `partials/header.html`) dispara el cambio; el evento `i18n:applied` se dispara cada vez que se aplica una traducción (útil si tu tool necesita reaccionar al cambio de idioma, ver `background-remover.js` → `syncLocale`).
- Las páginas de `tools/*.html` traen textos fijos en español en el propio HTML (no están 100% integradas al sistema de `data-i18n`); el home (`index.html`) sí usa `data-i18n` en todos sus textos.

---

## 4. CSP (Content-Security-Policy) — el error más común

Cada `tools/*.html` tiene su propio `<meta http-equiv="Content-Security-Policy">` (no hay uno global). Si algo no carga y en la consola aparece algo como:

```
Refused to load/connect because it violates the following Content Security Policy directive...
```

hay que agregar el dominio (o `blob:`, o `'unsafe-inline'`, etc.) a la directiva correspondiente **en ese HTML puntual**:

- `script-src` → de dónde se cargan archivos `.js`. Si usás `onnxruntime-web` o `@huggingface/transformers`, no alcanza con `'wasm-unsafe-eval'` (que solo cubre WebAssembly): esas librerías usan `new Function()` en JS puro para generar código optimizado en tiempo de ejecución, así que también hace falta `'unsafe-eval'` en `script-src`, si no Chrome tira el warning "Content Security Policy of your site blocks the use of 'eval'" y algunas rutas de esas librerías fallan en silencio. Es un trade-off de seguridad conocido y aceptado para estas tools (el resto del CSP sigue restringiendo bastante qué puede correr).
- `connect-src` → a dónde puede hacer `fetch()`/`XHR`/WebSocket el JS (incluye `blob:` si algo lee un Blob URL internamente — pasó tanto en el componente de background-remover como en el paso de Swin2SR de image-enhancer, los dos usan `@huggingface/transformers` por debajo y esa librería siempre lee la imagen de entrada vía un `blob:` URL. **Cualquier tool nueva que use `@huggingface/transformers` va a necesitar `blob:` en `connect-src` desde el día uno.**)
- `worker-src` → si algo corre en Web Workers (ONNX, modelos de IA)
- `img-src` → de dónde pueden venir `<img>`/`background-image`
- `style-src` → si un componente de terceros mete estilos inline por JS, necesita `'unsafe-inline'` ahí (no hay forma más segura sin parchear el componente)

`frame-ancestors` en una etiqueta `<meta>` **no sirve** (el navegador lo ignora ahí, solo funciona como header HTTP real) — no hace falta agregarlo, y si aparece un warning al respecto en consola es inofensivo.

---

## 5. Ads / anuncio recompensado

- `adsense.js` inicializa la cola de AdSense y expone `window.ToolboxAds.fillSlot(el)` para rellenar un `<ins class="adsbygoogle">` puntual (usado por los slots que empiezan ocultos, como el del modal de recompensa).
- `reward-gate.js` expone `window.requestReward(callback)`: abre el modal `#rewardModal`, intenta un anuncio recompensado real vía la Ad Placement API de Google y, si no hay uno disponible (o hay adblocker), cae a una cuenta regresiva de 15s para no bloquear al usuario. Cualquier tool que quiera gatear su descarga solo necesita llamar a esa función.
- Los `data-ad-slot="0000000XXX"` son placeholders — hay que reemplazarlos por los IDs reales de bloques de AdSense cuando la cuenta esté aprobada y esos bloques creados.

---

## 6. Sistema de diseño (variables CSS)

Definidas en `assets/css/style.css`, se usan en todo el sitio:

```css
--color-bg, --color-dark          /* fondos */
--color-blue-electric, --color-purple   /* acentos */
--color-white, --color-gray       /* texto */
--color-glass, --color-glass-border     /* paneles "glassmorphism" */
--radius, --radius-full           /* border-radius */
--shadow-glow                     /* sombra de acento */
--transition                      /* easing estándar de animaciones */
```

Usarlas siempre en vez de hardcodear colores nuevos, para que una tool nueva se sienta parte del mismo sitio.

---

## 7. Cosas que ya se rompieron una vez (para no repetir)

- **`@ligrila/background-remover` (el widget de Quitar Fondo)** rompe si `data-locale` es cualquier variante de `"es"` (bug de la librería, no nuestro: `Unknown variable dynamic import: ./locales/es.ts`). Por eso `tools/background-remover.html` fuerza `data-locale="en"` explícito — dejarlo vacío NO alcanza, porque el componente detecta el idioma del navegador solo.
- Ese mismo componente mete estilos inline por JS → necesita `'unsafe-inline'` en `style-src` de su CSP.
- Y lee la imagen subida vía un `blob:` URL interno → necesita `blob:` en `connect-src` de su CSP, si no tira "Failed to fetch" y la herramienta no procesa nada.
- **`image-enhancer.html`** usa GFPGAN y CodeFormer, que tienen licencias con restricciones de uso no comercial (CodeFormer: NTU S-Lab 1.0, explícitamente no comercial; GFPGAN: Apache-2.0 pero con partes derivadas de código no comercial). Se mantienen a pedido tuyo asumiendo ese riesgo — créditos y licencias quedan visibles en el modal de info de esa tool. Cualquier modelo nuevo que sumes a futuro: chequeá la licencia ANTES de integrarlo si el sitio sigue teniendo ads.
- Los modelos ONNX de `image-enhancer.js` (Real-ESRGAN/GFPGAN/CodeFormer) no se pudieron probar pixel a pixel en un navegador real durante el desarrollo (se armó en un entorno sin browser/GPU) — si al usarlo los colores de los rostros restaurados salen invertidos, es la constante `FACE_MODEL_TENSOR_OPTS` en `assets/js/tools/image-enhancer.js` (cambiar `bgr: true` a `bgr: false`).

---

## 8. Deploy

No hay CI/CD. El flujo es:

```bash
git add -A
git commit -m "mensaje"
git push
```

GitHub Pages sirve directo desde la rama configurada del repo `kr4n30/kr4n30.github.io` — cualquier cambio sin pushear NO se ve en el sitio en vivo, aunque esté guardado en tu carpeta local.
