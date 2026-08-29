/* visits.js — contador de visitas + hueco publicidad
   - Local: localStorage 'visitCount'
   - Global (opcional): CountAPI + fallback a local si falla
   - Expone el número en #visitCount y anima
*/
(function () {
  'use strict';
  var STORAGE_LOCAL = 'visitCountLocal';
  var STORAGE_GLOBAL = 'visitCountGlobal';
  var EL_ID = 'visitCount';
  var API_URL = 'https://api.countapi.xyz/hit/kr4n30.github.io/visits';

  function getLocal() {
    try { return parseInt(localStorage.getItem(STORAGE_LOCAL) || '0', 10) || 0; } catch (e) { return 0; }
  }
  function setLocal(n) {
    try { localStorage.setItem(STORAGE_LOCAL, String(n)); } catch (e) {}
  }
  function animateCount(el, target) {
    if (!el) return;
    var start = 0;
    var duration = 900;
    var startTime = performance.now();
    function step(now) {
      var p = Math.min(1, (now - startTime) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString('es-ES');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function render(n, isGlobal) {
    var el = document.getElementById(EL_ID);
    if (!el) return;
    animateCount(el, n);
    var label = document.getElementById('visitCountLabel');
    if (label) label.textContent = isGlobal ? 'visitas totales' : 'visitas (en este navegador)';
    el.title = isGlobal ? 'Contador global' : 'Contador local — se guarda solo en tu navegador';
  }

  function incLocal() {
    var n = getLocal() + 1;
    setLocal(n);
    return n;
  }

  async function fetchGlobal() {
    try {
      var ctrl = new AbortController();
      var t = setTimeout(function(){ ctrl.abort(); }, 3000);
      var res = await fetch(API_URL, { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(t);
      if (!res.ok) throw new Error('bad status');
      var data = await res.json();
      if (data && typeof data.value === 'number') {
        try { localStorage.setItem(STORAGE_GLOBAL, String(data.value)); } catch(e){}
        return data.value;
      }
    } catch (e) {
      // offline, adblock o API caída — usamos cache
      try {
        var cached = localStorage.getItem(STORAGE_GLOBAL);
        if (cached) return parseInt(cached, 10);
      } catch (e2) {}
    }
    return null;
  }

  async function init() {
    var local = incLocal();
    // mostrar local inmediato mientras intenta global
    render(local, false);
    var global = await fetchGlobal();
    if (typeof global === 'number' && global > local) {
      render(global, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
