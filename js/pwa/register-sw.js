/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\pwa\register-sw.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
(function() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  var swUrl = '/service-worker.js';

  window.addEventListener('load', function() {
    navigator.serviceWorker.register(swUrl).then(function(registration) {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', function() {
        var installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', function() {
          if (installing.state === 'installed' && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch(function(error) {
      console.warn('[pwa] Service worker registration failed', error);
    });
  });
})();
