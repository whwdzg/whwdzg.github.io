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
