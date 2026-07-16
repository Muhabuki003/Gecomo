/* ==========================================================================
   GECOMO — bulletproof video autoplay
   Guarantees every <video autoplay> starts on load, on desktop AND mobile,
   with no visible play button:
   - Forces the exact attribute set iOS/Android require (muted + playsinline
     set BEFORE play), strips controls, blocks PiP/remote-playback overlays.
   - Retries play() on every signal that can unlock playback: metadata load,
     page show (back/forward cache), tab becoming visible, and the first
     touch/scroll/click/keypress (covers iOS Low Power Mode, which blocks
     autoplay until any user gesture).
   - IntersectionObserver re-kicks any video that enters the viewport, and a
     MutationObserver hardens videos injected after load (e.g. UGC carousel).
   A video a visitor intentionally paused (data-user-paused="1") is left alone.
   ========================================================================== */
(function(){
  "use strict";

  function tryPlay(v){
    if (v.dataset.userPaused === '1') return;
    var p = v.play();
    if (p && p.catch) p.catch(function(){ /* retried on the next unlock signal */ });
  }

  function harden(v){
    // Order matters on iOS: muted + playsinline must be set before play().
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.autoplay = true;
    v.loop = true;
    v.controls = false;
    v.removeAttribute('controls');
    v.setAttribute('preload', 'auto');
    v.disablePictureInPicture = true;
    v.setAttribute('disablepictureinpicture', '');
    v.setAttribute('disableremoteplayback', '');
    if (!v.hasAttribute('aria-hidden')) v.setAttribute('aria-hidden', 'true');
    if (v.readyState === 0) v.load();
    v.addEventListener('loadedmetadata', function(){ tryPlay(v); });
    v.addEventListener('canplay', function(){ if (v.paused) tryPlay(v); });
    tryPlay(v);
    if (io) io.observe(v);
  }

  var seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
  function hardenAll(root){
    (root || document).querySelectorAll('video').forEach(function(v){
      if (seen){ if (seen.has(v)) { tryPlay(v); return; } seen.add(v); }
      harden(v);
    });
  }

  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if (en.isIntersecting && en.target.paused) tryPlay(en.target); });
      }, { threshold: 0.1 })
    : null;

  function playAll(){ document.querySelectorAll('video').forEach(tryPlay); }

  // Initial pass + late-injected videos (UGC carousel builds after load)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ hardenAll(); });
  else hardenAll();
  window.addEventListener('load', playAll);
  window.addEventListener('pageshow', playAll); // back/forward cache restore
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) playAll(); });

  // iOS Low Power Mode / strict autoplay: ANY first gesture unlocks playback.
  ['touchstart', 'touchend', 'pointerdown', 'click', 'scroll', 'keydown'].forEach(function(evt){
    window.addEventListener(evt, playAll, { once: true, passive: true, capture: true });
  });

  if ('MutationObserver' in window){
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        m.addedNodes.forEach(function(n){
          if (n.nodeType !== 1) return;
          if (n.tagName === 'VIDEO') hardenAll(n.parentNode || document);
          else if (n.querySelector && n.querySelector('video')) hardenAll(n);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
