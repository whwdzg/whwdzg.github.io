/**
 * Loads the shared site shell once per document and reuses it across pages.
 */
(function () {
  if (window.__shellLoaderManaged) return;
  window.__shellLoaderManaged = true;

  var SHELL_CACHE_KEY = 'shell-html:2.1.0.0-20260726';
  var container = document.getElementById('shell-root');
  if (!container) return;

  function normalize(pathname) {
    var path = pathname.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '').replace(/\/+$/, '');
    return path === '' ? '/' : path;
  }

  function markCurrentNav() {
    var current = normalize(location.pathname);
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.querySelectorAll('.current, .selected').forEach(function (element) {
      element.classList.remove('current', 'selected');
      if (element.tagName === 'A') element.removeAttribute('aria-current');
    });
    sidebar.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      if (normalize(new URL(href, location.origin).pathname) !== current) return;
      var parent = link.closest('.has-children');
      var toggle = parent ? parent.querySelector('.toggle') : null;
      var submenu = parent ? parent.querySelector('.submenu') : null;
      if (parent && !parent.classList.contains('open')) {
        parent.classList.add('current');
        if (toggle) toggle.classList.add('current');
        return;
      }
      link.classList.add('current', 'selected');
      link.setAttribute('aria-current', 'page');
      if (toggle) {
        toggle.classList.add('current');
        toggle.setAttribute('aria-expanded', 'true');
      }
      if (submenu) submenu.style.maxHeight = submenu.scrollHeight + 'px';
    });
  }

  function attachShell(html) {
    if (!html || container.firstElementChild) return;
    container.innerHTML = html;
    var move = function () {
      var main = document.querySelector('main');
      var footer = container.querySelector('footer');
      if (main && footer && footer.parentNode !== main.parentNode) {
        footer.setAttribute('data-shell-moved', '1');
        main.insertAdjacentElement('afterend', footer);
      }
      markCurrentNav();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', move, { once: true });
    } else {
      move();
    }
  }

  var cachedShell = '';
  try { cachedShell = sessionStorage.getItem(SHELL_CACHE_KEY) || ''; } catch (error) {}
  attachShell(cachedShell);

  fetch('/includes/shell.html', { credentials: 'same-origin' })
    .then(function (response) { return response.ok ? response.text() : Promise.reject(new Error('shell request failed')); })
    .then(function (html) {
      try { sessionStorage.setItem(SHELL_CACHE_KEY, html); } catch (error) {}
      attachShell(html);
    })
    .catch(function () {});
})();