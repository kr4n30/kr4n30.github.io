/* ============================================
   reward-gate.js
   Módulo COMPARTIDO: "pantalla de espera para tu
   recompensa" antes de una descarga. Cualquier
   herramienta puede usarlo llamando a:

       window.requestReward(function () {
           // código que descarga el archivo
       });

   Requiere en el HTML de la página (mismos IDs en
   todas las herramientas):
     #rewardModal, #rewardCancelBtn, #rewardContinueBtn,
     #rewardTimer, #rewardCountdownLabel, #rewardStatusText

   Requiere que adsense.js se cargue ANTES que este
   archivo (define window.adBreak / window.adConfig).

   Si hay un anuncio recompensado real disponible via
   la Ad Placement API de Google, se usa. Si no (por
   ejemplo, mientras no tengas los data-ad-slot reales,
   o el usuario tiene un bloqueador de anuncios), cae
   a una cuenta regresiva propia para que la herramienta
   siga siendo usable durante las pruebas.

   NOTA DE POLÍTICAS: el formato "reward" de la Ad
   Placement API de Google está pensado oficialmente
   para juegos HTML5 (ver "Policies for ad units that
   offer rewards" en la ayuda de AdSense). Úsalo bajo
   tu propio criterio: revisa la elegibilidad de tu
   cuenta antes de depender de él en producción.
   ============================================ */
(function () {
    'use strict';

    var REWARD_VALID_MS = 10 * 60 * 1000; // el "desbloqueo" dura 10 minutos
    var FALLBACK_SECONDS = 15; // cuenta regresiva simulada si no hay anuncio real
    var PROBE_TIMEOUT_MS = 1200; // cuánto esperamos a que Google confirme que hay anuncio

    var rewardExpiresAt = 0;
    var countdownInterval = null;
    var pendingUnlock = null;

    var modal, cancelBtn, continueBtn, timerEl, countdownLabel, statusText;

    function cacheElements() {
        modal = document.getElementById('rewardModal');
        cancelBtn = document.getElementById('rewardCancelBtn');
        continueBtn = document.getElementById('rewardContinueBtn');
        timerEl = document.getElementById('rewardTimer');
        countdownLabel = document.getElementById('rewardCountdownLabel');
        statusText = document.getElementById('rewardStatusText');
    }

    function hasValidReward() {
        return Date.now() < rewardExpiresAt;
    }

    function grantReward() {
        rewardExpiresAt = Date.now() + REWARD_VALID_MS;
    }

    function setTimerProgress(pct, label) {
        if (timerEl) timerEl.style.setProperty('--progress', String(pct));
        if (countdownLabel) countdownLabel.textContent = label;
    }

    function setStatus(text) {
        if (statusText) statusText.textContent = text;
    }

    function openModal() {
        if (modal) modal.classList.remove('hidden');
    }

    function closeModal() {
        if (modal) modal.classList.add('hidden');
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        if (continueBtn) {
            continueBtn.disabled = true;
            continueBtn.classList.add('hidden');
        }
    }

    function unlockNow() {
        grantReward();
        closeModal();
        if (typeof pendingUnlock === 'function') {
            var fn = pendingUnlock;
            pendingUnlock = null;
            fn();
        }
    }

    function startFallbackCountdown() {
        setStatus('No encontramos un anuncio disponible todavía. Espera unos segundos para desbloquear tu descarga.');
        var remaining = FALLBACK_SECONDS;
        setTimerProgress(0, String(remaining));

        countdownInterval = setInterval(function () {
            remaining -= 1;
            var pct = Math.round(((FALLBACK_SECONDS - remaining) / FALLBACK_SECONDS) * 100);
            setTimerProgress(pct, String(Math.max(remaining, 0)));

            if (remaining <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                setStatus('¡Listo! Ya puedes descargar.');
                setTimerProgress(100, '✓');
                if (continueBtn) {
                    continueBtn.disabled = false;
                    continueBtn.classList.remove('hidden');
                }
            }
        }, 1000);
    }

    function tryRealRewardedAd() {
        var adFound = false;

        if (typeof window.adBreak !== 'function') {
            startFallbackCountdown();
            return;
        }

        setStatus('Buscando un anuncio disponible...');
        setTimerProgress(0, '···');

        window.adBreak({
            type: 'reward',
            name: 'download-unlock',
            beforeReward: function (showAdFn) {
                adFound = true;
                setStatus('Anuncio listo. Pulsa "Ver anuncio" para desbloquear tu descarga.');
                if (continueBtn) {
                    continueBtn.disabled = false;
                    continueBtn.textContent = '▶️ Ver anuncio';
                    continueBtn.classList.remove('hidden');
                    continueBtn.onclick = function () {
                        continueBtn.disabled = true;
                        showAdFn();
                    };
                }
            },
            adDismissed: function () {
                setStatus('Cerraste el anuncio antes de tiempo. Inténtalo de nuevo para desbloquear la descarga.');
                if (continueBtn) {
                    continueBtn.disabled = false;
                    continueBtn.textContent = '▶️ Ver anuncio';
                }
            },
            adViewed: function () {
                setStatus('¡Gracias! Desbloqueando tu descarga...');
                setTimerProgress(100, '✓');
                unlockNow();
            },
            afterAd: function () {
                // el flujo nativo de Google ya terminó; si no hubo
                // adViewed, dejamos el botón de reintento visible.
            },
        });

        // Si Google no confirma un anuncio disponible en poco tiempo,
        // usamos la cuenta regresiva propia como respaldo.
        setTimeout(function () {
            if (!adFound) startFallbackCountdown();
        }, PROBE_TIMEOUT_MS);
    }

    function requestReward(onUnlocked) {
        if (!modal) cacheElements();
        if (!modal) {
            // La página no tiene el modal de recompensa: no bloqueamos la acción.
            onUnlocked();
            return;
        }

        if (hasValidReward()) {
            onUnlocked();
            return;
        }

        pendingUnlock = onUnlocked;
        if (continueBtn) {
            continueBtn.textContent = '✅ Descargar ahora';
            continueBtn.disabled = true;
            continueBtn.classList.add('hidden');
            continueBtn.onclick = unlockNow;
        }

        openModal();
        tryRealRewardedAd();
    }

    function init() {
        cacheElements();
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                pendingUnlock = null;
                closeModal();
            });
        }
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    pendingUnlock = null;
                    closeModal();
                }
            });
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
                pendingUnlock = null;
                closeModal();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.requestReward = requestReward;
})();
