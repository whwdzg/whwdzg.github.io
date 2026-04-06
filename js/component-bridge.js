/**
 * Auto-apply component classes to common controls on main-site pages.
 * Excludes Legacy pages, media pages, and sidebar controls.
 */
(() => {
  const BRIDGE_MARK = 'componentBridgeBound';
  const BRIDGE_STYLE_ID = 'component-bridge-style';
  const EXCLUDED_PATH_PREFIXES = ['/legacy-1.0/', '/media/'];
  const AREA_SKIP_SELECTOR = '#sidebar, .sidebar, [data-component-bridge-skip]';
  let observeTimer = null;

  function normalizePath(pathname) {
    const raw = String(pathname || '/').trim();
    if (!raw) return '/';
    const lower = raw.toLowerCase();
    return lower.endsWith('/') ? lower : lower + '/';
  }

  function shouldRunForPath(pathname) {
    const path = normalizePath(pathname);
    return !EXCLUDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
  }

  function ensureBridgeStyle() {
    if (!document.head) return;
    if (document.getElementById(BRIDGE_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = BRIDGE_STYLE_ID;
    style.textContent = [
      '.component-dialog__input.component-bridge-field {',
      '  width: 100%;',
      '  box-sizing: border-box;',
      '}',
      'select.component-dialog__input.component-bridge-field {',
      '  min-height: 40px;',
      '}',
      'textarea.component-dialog__input.component-bridge-field {',
      '  min-height: 96px;',
      '  resize: vertical;',
      '}'
    ].join('\\n');
    document.head.appendChild(style);
  }

  function isInsideSkippedArea(el) {
    return !!(el && el.closest && el.closest(AREA_SKIP_SELECTOR));
  }

  function isVisibleControl(el) {
    if (!el || el.disabled) return false;
    if (el.hidden) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    return true;
  }

  function applyButtonClass(btn) {
    if (!isVisibleControl(btn) || isInsideSkippedArea(btn)) return;
    if (btn.classList.contains('component-filter-chip')) return;
    if (!btn.classList.contains('component-btn')) {
      btn.classList.add('component-btn', 'component-btn--flat');
    }
    const text = (btn.textContent || '').trim();
    const hasIcon = !!btn.querySelector('i, svg');
    if (!text && hasIcon) {
      btn.classList.add('component-icon-btn');
    }
  }

  function applyAnchorButtonClass(link) {
    if (!isVisibleControl(link) || isInsideSkippedArea(link)) return;
    if (!link.classList || link.classList.contains('component-btn')) return;
    const className = String(link.className || '').toLowerCase();
    const hint = ['btn', 'button', 'action', 'hero-btn', 'settings-action-btn'];
    const shouldTreatAsButton = hint.some((k) => className.indexOf(k) !== -1);
    if (!shouldTreatAsButton) return;
    link.classList.add('component-btn', 'component-btn--flat');
  }

  function applyTextFieldClass(field) {
    if (!isVisibleControl(field) || isInsideSkippedArea(field)) return;
    if (field.classList.contains('component-switch__input')) return;
    if (field.matches('input[type="checkbox"], input[type="radio"], input[type="file"], input[type="color"]')) return;
    if (field.matches('input[type="range"]')) {
      field.classList.add('component-slider');
      return;
    }
    field.classList.add('component-dialog__input', 'component-bridge-field');
  }

  function applyScope(scope) {
    if (!scope || !shouldRunForPath(window.location.pathname)) return;
    ensureBridgeStyle();

    const root = scope.nodeType === Node.ELEMENT_NODE ? scope : document;
    root.querySelectorAll('button').forEach(applyButtonClass);
    root.querySelectorAll('a').forEach(applyAnchorButtonClass);
    root.querySelectorAll('input, select, textarea').forEach(applyTextFieldClass);

    if (window.componentUi && typeof window.componentUi.init === 'function') {
      window.componentUi.init(root);
    }
  }

  function scheduleApply(scope) {
    if (observeTimer) window.clearTimeout(observeTimer);
    observeTimer = window.setTimeout(() => {
      observeTimer = null;
      applyScope(scope || document);
    }, 40);
  }

  function bindObservers() {
    if (document.documentElement.dataset[BRIDGE_MARK] === 'true') return;
    document.documentElement.dataset[BRIDGE_MARK] = 'true';

    const observer = new MutationObserver((mutations) => {
      if (!shouldRunForPath(window.location.pathname)) return;
      for (let i = 0; i < mutations.length; i += 1) {
        const m = mutations[i];
        if (!m.addedNodes || !m.addedNodes.length) continue;
        for (let j = 0; j < m.addedNodes.length; j += 1) {
          const node = m.addedNodes[j];
          if (node && node.nodeType === Node.ELEMENT_NODE) {
            scheduleApply(node);
            return;
          }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener('spa:page:loaded', () => applyScope(document));
    window.addEventListener('pageshow', () => applyScope(document));
  }

  function boot() {
    bindObservers();
    applyScope(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();