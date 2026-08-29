/* interstitial.js — anuncio intersticial antes de mostrar resultado
   Uso desde cualquier tool:
     window.showInterstitial(function(){ // mostrar resultado real
       showResult(...)
     });

   - Reutiliza la cola de AdSense (window.adsbygoogle) como reward-gate.js
   - Si hay adBreak interstitial disponible lo intenta, si no cae a countdown 5s
   - Una vez visto (o timeout), ejecuta el callback y no vuelve a pedir hasta 8 min
*/
(function () {
  'use strict';
  var INTERSTITIAL_VALID_MS = 8 * 60 * 1000; // no repetir interstitial 8 min
  var COUNTDOWN_SECONDS = 5;
  var PROBE_TIMEOUT_MS = 2000;

  var interstitialExpiresAt = 0;
  var countdownInterval = null;
  var pendingCallback = null;
  var usingFallback = false;

  function hasValid() {
    return Date.now() < interstitialExpiresAt;
  }
  function grant() {
    interstitialExpiresAt = Date.now() + INTERSTITIAL_VALID_MS;
  }

  function ensureModal() {
    var existing = document.getElementById('interstitialModal');
    if (existing) return existing;

    var html = ''
      + '<div class="modal hidden" id="interstitialModal" role="dialog" aria-modal="true" aria-labelledby="interstitialTitle">'
      + '  <div class="modal-content interstitial-modal-content">'
      + '    <div class="modal-header">'
      + '      <h3 id="interstitialTitle">✨ Tu resultado está listo</h3>'
      + '      <button class="modal-close" id="interstitialCloseBtn" type="button" aria-label="Cerrar">✕</button>'
      + '    </div>'
      + '    <div class="modal-body">'
      + '      <div class="reward-visual">'
      + '        <div class="reward-timer" id="interstitialTimer"><span id="interstitialCountdownLabel">--</span></div>'
      + '      </div>'
      + '      <p class="reward-status" id="interstitialStatusText" aria-live="polite">Cargando anuncio...</p>'
      + '      <div class="ad-slot interstitial-ad-slot" id="interstitialAdSlot">'
      + '        <span class="ad-label">Publicidad — gracias por apoyar kR4N30 Toolbox</span>'
      + '        <ins class="adsbygoogle" data-ad-lazy="true" data-ad-client="ca-pub-6818233483684146" data-ad-slot="0000000099" data-ad-format="auto" data-full-width-responsive="true"></ins>'
      + '      </div>'
      + '      <div class="reward-actions">'
      + '        <button id="interstitialContinueBtn" class="btn btn-primary btn-small" type="button" disabled>Ver resultado</button>'
      + '      </div>'
      + '      <p style="color:var(--color-gray);font-size:0.75rem;margin-top:10px">El anuncio nos permite mantener las herramientas gratis y privadas.</p>'
      + '    </div>'
      + '  </div>'
      + '</div>';
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    var modal = wrapper.firstElementChild;
    document.body.appendChild(modal);

    // wiring close
    var closeBtn = document.getElementById('interstitialCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', function(){ closeModal(false); });
    modal.addEventListener('click', function(e){ if(e.target===modal) closeModal(false); });
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && modal && !modal.classList.contains('hidden')) closeModal(false);
    });
    var contBtn = document.getElementById('interstitialContinueBtn');
    if (contBtn) contBtn.addEventListener('click', function(){ unlock(); });

    return modal;
  }

  function setTimer(pct, label){
    var timer=document.getElementById('interstitialTimer');
    var lbl=document.getElementById('interstitialCountdownLabel');
    if(timer) timer.style.setProperty('--progress', String(pct));
    if(lbl) lbl.textContent = label;
  }
  function setStatus(t){
    var el=document.getElementById('interstitialStatusText');
    if(el) el.textContent=t;
  }

  function openModal(){
    var modal=ensureModal();
    modal.classList.remove('hidden');
    var ins = document.querySelector('#interstitialAdSlot ins.adsbygoogle');
    if(ins && window.ToolboxAds) window.ToolboxAds.fillSlot(ins);
    if(window.ToolboxA11y) window.ToolboxA11y.trapFocus(modal);
    document.body.classList.add('no-scroll');
  }
  function closeModal(calledFromUnlock){
    var modal=document.getElementById('interstitialModal');
    if(!modal) return;
    modal.classList.add('hidden');
    if(countdownInterval){ clearInterval(countdownInterval); countdownInterval=null; }
    var btn=document.getElementById('interstitialContinueBtn');
    if(btn){ btn.disabled=true; btn.textContent='Ver resultado'; }
    usingFallback=false;
    if(window.ToolboxA11y) window.ToolboxA11y.releaseFocus(modal);
    if(!calledFromUnlock) document.body.classList.remove('no-scroll');
    // si cierra sin ver, no ejecutamos callback
  }
  function unlock(){
    grant();
    var modal=document.getElementById('interstitialModal');
    if(modal) modal.classList.add('hidden');
    if(countdownInterval){ clearInterval(countdownInterval); countdownInterval=null; }
    document.body.classList.remove('no-scroll');
    if(window.ToolboxA11y && modal) window.ToolboxA11y.releaseFocus(modal);
    setTimer(100,'✓');
    var cb=pendingCallback; pendingCallback=null;
    if(typeof cb==='function') cb();
  }

  function startFallback(){
    if(usingFallback) return;
    usingFallback=true;
    setStatus('Mostrando anuncio — tu resultado aparecerá en unos segundos.');
    var remaining=COUNTDOWN_SECONDS;
    setTimer(0, String(remaining));
    var btn=document.getElementById('interstitialContinueBtn');
    if(btn) btn.disabled=true;
    countdownInterval=setInterval(function(){
      remaining-=1;
      var pct=Math.round(((COUNTDOWN_SECONDS-remaining)/COUNTDOWN_SECONDS)*100);
      setTimer(pct, String(Math.max(remaining,0)));
      if(remaining<=0){
        clearInterval(countdownInterval); countdownInterval=null;
        setStatus('¡Listo! Ya puedes ver tu resultado.');
        setTimer(100,'✓');
        if(btn){ btn.disabled=false; btn.textContent='✨ Ver resultado ahora'; }
      }
    },1000);
  }

  function tryRealInterstitial(){
    var adFound=false;
    if(typeof window.adBreak!=='function'){ startFallback(); return; }
    setStatus('Cargando anuncio...');
    setTimer(0,'···');
    try{
      window.adBreak({
        type: 'next',
        name: 'result-interstitial',
        beforeAd: function(){ adFound=true; },
        afterAd: function(){
          // interstitial visto — desbloquear
          setStatus('¡Gracias! Mostrando tu resultado...');
          unlock();
        },
        adBreakDone: function(placementInfo){
          // si no hubo anuncio, placementInfo.breakStatus puede ser 'notReady'/'viewed' etc.
          if(!adFound && placementInfo && placementInfo.breakStatus!=='viewed'){
            startFallback();
          }
        }
      });
    }catch(e){ startFallback(); return; }
    setTimeout(function(){ if(!adFound) startFallback(); }, PROBE_TIMEOUT_MS);
  }

  window.showInterstitial = function(callback){
    if(hasValid()){
      // ya visto hace poco, no repetir
      if(typeof callback==='function') callback();
      return;
    }
    pendingCallback=callback;
    var btn=document.getElementById('interstitialContinueBtn');
    if(btn){ btn.disabled=true; btn.textContent='Ver resultado'; }
    openModal();
    // intentar anuncio real, si no fallback
    tryRealInterstitial();
  };
})();
