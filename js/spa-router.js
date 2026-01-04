// SPA router: load shell once, keep shared assets, swap only <main>.
// Flow: render shell, inject shared CSS/JS once, preload setting.html, then PJAX fetch for page mains.

(function(){
  if (window.location.protocol === 'file:') {
    console.warn('[spa-router] Disabled on file:// to avoid fetch/CORS issues');
    return;
  }

  const SCRIPT_ROOT = (() => {
    const src = (document.currentScript && document.currentScript.src) || window.location.href;
    // use full href (with origin) so URL() base is always valid
    return new URL('..', src);
  })();

  const resolve = (p) => new URL(p, SCRIPT_ROOT).href;

  const SHELL_URL = resolve('includes/shell.html');
  const SETTINGS_URL = resolve('includes/setting.html');
  const ROOT_CONTAINER_ID = 'app-root';
  const CONTENT_CONTAINER_ID = 'page-root';
  const CACHE_BUST = () => Date.now().toString();

  const sharedCss = [
    resolve('css/variables.css'),
    resolve('css/input.css'),
    resolve('css/header.css'),
    resolve('css/sidebar.css'),
    resolve('css/main-content.css'),
    resolve('css/footer.css'),
    resolve('css/lightbox.css'),
    resolve('css/settings-modal.css'),
    resolve('css/scroll-to-top.css'),
    resolve('css/videoplay.css'),
    resolve('font/FluentSystemIcons-Regular.css')
  ];

  const sharedJs = [
    resolve('js/i18n-loader.js'),
    resolve('js/theme.js'),
    resolve('js/language.js'),
    resolve('js/sidebar.js'),
    resolve('js/lightbox.js'),
    resolve('js/avatar.js'),
    resolve('js/scroll-to-top.js'),
    resolve('js/search.js'),
    resolve('js/settings-modal.js')
  ];

  let shellLoaded = false;
  let isNavigating = false;
  const pageCache = new Map();

  async function loadDocument(url){
    let html = pageCache.get(url);
    if (!html) {
      html = await fetchText(url, true);
      pageCache.set(url, html);
    }
    const { doc } = extractMain(html);
    return doc;
  }

  function ensureRootContainers(){
    let root = document.getElementById(ROOT_CONTAINER_ID) || document.body;
    if (root === document.body && !document.body.id) {
      document.body.id = ROOT_CONTAINER_ID;
    }

    let contentHost = document.getElementById(CONTENT_CONTAINER_ID);
    if (!contentHost) {
      const existingMain = document.querySelector('main');
      if (existingMain) {
        contentHost = existingMain;
        contentHost.id = CONTENT_CONTAINER_ID;
      } else {
        contentHost = document.createElement('main');
        contentHost.id = CONTENT_CONTAINER_ID;
        root.appendChild(contentHost);
      }
    }
  }

  function appendOnce(tagName, url, parent){
    const attr = tagName === 'link' ? 'href' : 'src';
    const existing = Array.from(document.querySelectorAll(tagName)).find(el => {
      const val = el.getAttribute(attr);
      if (!val) return false;
      try {
        return new URL(val, window.location.href).href === new URL(url, window.location.href).href;
      } catch (_) {
        return false;
      }
    });
    if (existing) return existing;
    const el = document.createElement(tagName);
    el.setAttribute('data-spa-shared', '1');
    if (tagName === 'link') {
      el.rel = 'stylesheet';
      el.href = url;
    } else {
      el.src = url;
      el.defer = true;
    }
    (parent || document.head).appendChild(el);
    return el;
  }

  function loadSharedAssets(){
    sharedCss.forEach(href => appendOnce('link', href, document.head));
    sharedJs.forEach(src => appendOnce('script', src, document.body));
  }

  async function fetchText(url, bust=false){
    const target = bust ? `${url}${url.includes('?') ? '&' : '?'}v=${CACHE_BUST()}` : url;
    const resp = await fetch(target, { credentials: 'same-origin', cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.text();
  }

  function ensurePageAssets(doc, baseUrl){
    const base = new URL(baseUrl, window.location.origin);
    const links = Array.from(doc.querySelectorAll('link[rel~="stylesheet"][href]'));
    const scripts = Array.from(doc.querySelectorAll('script[src]'));
    links.forEach(l => {
      const href = new URL(l.getAttribute('href'), base).href;
      appendOnce('link', href, document.head);
    });
    scripts.forEach(s => {
      const src = new URL(s.getAttribute('src'), base).href;
      appendOnce('script', src, document.body);
    });
  }

  function extractMain(html){
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let main = doc.querySelector('main');
    if (!main) {
      // fallback: wrap entire body into a synthetic <main> so SPA swap still works
      main = document.createElement('main');
      if (doc.body) {
        Array.from(doc.body.childNodes).forEach(n => main.appendChild(n.cloneNode(true)));
      }
      doc.body.innerHTML = '';
      doc.body.appendChild(main);
    }
    return { doc, main };
  }

  function swapContent(fragmentDoc){
    const contentHost = document.getElementById(CONTENT_CONTAINER_ID);
    const main = fragmentDoc.querySelector('main');
    if (!contentHost || !main) return false;
    const preserved = Array.from(contentHost.querySelectorAll('[data-shell-preserve="1"]'));
    preserved.forEach(node => node.remove());

    contentHost.innerHTML = '';
    Array.from(main.childNodes).forEach(node => contentHost.appendChild(node));
    preserved.forEach(node => contentHost.appendChild(node));
    reorderShellLayout();
    if (window.refreshAsideStack) {
      try { window.refreshAsideStack(); } catch (_) {}
    }
    return true;
  }

  function reorderShellLayout(){
    const main = document.getElementById(CONTENT_CONTAINER_ID);
    if (!main) return;
    const header = document.querySelector('header');
    const sidebar = document.querySelector('nav.sidebar');
    const aside = document.querySelector('aside');
    const footer = document.querySelector('footer');

    // Ensure header then sidebar appear before main for layout CSS expectations
    if (header && header.parentNode && header.parentNode !== main.parentNode) {
      main.parentNode.insertBefore(header, main);
    }
    if (sidebar && sidebar.parentNode && sidebar.parentNode !== main.parentNode) {
      main.parentNode.insertBefore(sidebar, main);
    }

    // Place aside inside main so grid rules apply
    if (aside) {
      aside.setAttribute('data-shell-preserve', '1');
      if (aside.parentNode !== main) {
        aside.remove();
        main.appendChild(aside);
      }
    }

    // Keep footer after aside/main
    if (footer && footer.parentNode) {
      const target = aside || main;
      if (target && footer.previousElementSibling !== target) {
        target.insertAdjacentElement('afterend', footer);
      }
    }
  }

  async function runInlineScripts(fragmentDoc){
    const scripts = Array.from(fragmentDoc.querySelectorAll('main script'));
    for (const s of scripts) {
      if (s.src) continue;
      const code = s.textContent;
      if (!code || !code.trim()) continue;
      const exec = document.createElement('script');
      exec.textContent = code;
      document.body.appendChild(exec);
      exec.remove();
    }
  }

  async function renderShell(){
    if (shellLoaded) return;
    ensureRootContainers();
    loadSharedAssets();
    // If shell already exists (header/nav) skip re-insert
    if (document.querySelector('header') && document.querySelector('nav.sidebar')) {
      reorderShellLayout();
      if (window.refreshAsideStack) { try { window.refreshAsideStack(); } catch (_) {} }
      shellLoaded = true;
      return;
    }
    const root = document.getElementById(ROOT_CONTAINER_ID);
    const shellHtml = await fetchText(SHELL_URL, true);
    const shellFrag = document.createElement('div');
    shellFrag.innerHTML = shellHtml;
    root.insertBefore(shellFrag, document.getElementById(CONTENT_CONTAINER_ID));
    reorderShellLayout();
    if (window.refreshAsideStack) { try { window.refreshAsideStack(); } catch (_) {} }
    shellLoaded = true;
  }

  async function preloadSettingsTemplate(){
    try { await fetchText(SETTINGS_URL, true); }
    catch (err) { console.warn('[spa-router] preload setting.html failed', err); }
  }

  function updateTitle(fragmentDoc){
    const t = fragmentDoc.querySelector('title');
    if (t) document.title = t.textContent;
  }

  function buildUrl(target){
    try {
      const url = new URL(target, window.location.href);
      return url.pathname + url.search;
    } catch (_) { return null; }
  }

  async function navigate(target, push=true){
    if (isNavigating) return;
    const url = buildUrl(target);
    if (!url) return;
    isNavigating = true;
    try {
      const doc = await loadDocument(url);
      ensurePageAssets(doc, url);
      if (!swapContent(doc)) throw new Error('No <main> in target');
      if (window.lazySizes && window.lazySizes.loader && window.lazySizes.loader.checkElems) {
        // kick lazySizes to observe newly injected images
        try { window.lazySizes.loader.checkElems(); } catch (_) {}
      }
      updateTitle(doc);
      try {
        await runInlineScripts(doc);
      } catch (scriptErr) {
        console.warn('[spa-router] inline script error (page stays SPA)', scriptErr);
      }
      if (push) window.history.pushState({ page: url }, '', url);
      window.scrollTo(0, 0);
      window.dispatchEvent(new CustomEvent('spa:page:loaded', { detail: { url } }));
    } catch (err) {
      console.error('[spa-router] navigation failed, full load fallback', err);
      window.location.assign(target);
    } finally {
      isNavigating = false;
    }
  }

  function attachLinkHandler(){
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
      const url = buildUrl(href);
      if (!url) return;
      const sameOrigin = new URL(href, window.location.href).origin === window.location.origin;
      if (!sameOrigin) return;
      e.preventDefault();
      navigate(url, true);
    }, true);
  }

  function attachPopstate(){
    window.addEventListener('popstate', (e) => {
      const page = e.state?.page || window.location.pathname;
      navigate(page, false);
    });
    window.history.replaceState({ page: window.location.pathname }, '', window.location.pathname);
  }

  async function boot(){
    await renderShell();
    await preloadSettingsTemplate();
    attachLinkHandler();
    attachPopstate();
    const current = window.location.pathname + window.location.search;
    await navigate(current, false);
  }

  document.addEventListener('DOMContentLoaded', boot);
})();

