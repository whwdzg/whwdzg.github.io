// PJAX-style router: swap only <main> for index.html/about.html
// 模块：简易 SPA 路由 / PJAX-style loader with shell preservation.

// Disable PJAX when opened via file:// to avoid fetch CORS/denied issues
if (window.location.protocol === 'file:') {
	console.warn('[PJAX] Disabled on file:// protocol');
} else (function () {
	// When true, external scripts found in the fetched <main> will be reloaded
	// on every SPA swap. This removes any existing <script src=...> tags with
	// the same URL and inserts a cache-busted copy so modules and init code
	// run fresh on each navigation.
	const FORCE_RELOAD_SCRIPTS_ON_SWAP = true;
	let isLoading = false;

	const normalizeForFetch = (href) => {
		try {
			const url = new URL(href, window.location.href);
			// Only same-origin HTML/MD or directory
			if (url.origin !== location.origin) return null;
			if (url.hash && url.pathname === location.pathname) return null; // anchor
			return url.pathname + (url.search || '');
		} catch (_) { return null; }
	};

	const cleanupBeforeReinit = () => {
		const overlay = document.getElementById('image-lightbox');
		if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
		const asideStack = document.getElementById('aside-stack');
		if (asideStack && asideStack.parentNode) asideStack.parentNode.removeChild(asideStack);
	};

	const executeScriptsInMain = async (doc) => {
		const newMain = doc.querySelector('main');
		if (!newMain) return;
		// Collect scripts inside <main>
		let scripts = Array.from(newMain.querySelectorAll('script'));
		// Also collect scripts that appear after <main> in the fetched document body
		const body = doc.querySelector('body');
		if (body) {
			let afterMain = false;
			for (const node of Array.from(body.children)) {
				if (node === newMain) { afterMain = true; continue; }
				if (!afterMain) continue;
				if (node.tagName && node.tagName.toLowerCase() === 'script') scripts.push(node);
			}
		}
		// remove collected scripts from the fragment to avoid double execution when inserted
		scripts.forEach(s => s.parentNode && s.parentNode.removeChild(s));
		for (const s of scripts) {
			try {
				if (s.src) {
					const absolute = new URL(s.src, location.href).href;
					const exists = Array.from(document.querySelectorAll('script[src]')).some(ss => {
						try { return new URL(ss.src).href === absolute; } catch(e){ return false; }
					});
					// If configured to force-reload, remove existing tags for this src
					if (FORCE_RELOAD_SCRIPTS_ON_SWAP) {
						Array.from(document.querySelectorAll('script[src]')).forEach(ss => {
							try {
								if (new URL(ss.src).href === absolute) ss.parentNode && ss.parentNode.removeChild(ss);
							} catch (e) {}
						});
					} else {
						const exists = Array.from(document.querySelectorAll('script[src]')).some(ss => {
							try { return new URL(ss.src).href === absolute; } catch(e){ return false; }
						});
						if (exists) { await new Promise(r=>setTimeout(r,8)); continue; }
					}

					await new Promise((resolve) => {
						const el = document.createElement('script');
						// append cache-buster when forcing reload to avoid cached copy
						const srcToUse = FORCE_RELOAD_SCRIPTS_ON_SWAP ? (absolute + (absolute.includes('?') ? '&' : '?') + '_=' + Date.now()) : absolute;
						el.src = srcToUse;
						el.async = false;
						el.onload = resolve;
						el.onerror = () => { console.warn('[spa-router] script load failed', absolute); resolve(); };
						document.body.appendChild(el);
					});
				} else if (s.textContent && s.textContent.trim()) {
					// inline script: append to body so it executes in the same context
					const el = document.createElement('script');
					el.textContent = s.textContent;
					document.body.appendChild(el);
				}
			} catch (e) { console.warn('[spa-router] exec script failed', e); }
		}
	};

	// Force-reload a list of external scripts by removing existing tags and
	// inserting cache-busted copies. Returns a promise that resolves when all loaded.
	const reloadExternalScripts = async (paths) => {
		for (const p of paths) {
			try {
				const absolute = new URL(p, location.href).href;
				// remove existing tags
				Array.from(document.querySelectorAll('script[src]')).forEach(ss => {
					try { if (new URL(ss.src).href === absolute) ss.parentNode && ss.parentNode.removeChild(ss); } catch(e){}
				});
				await new Promise((resolve) => {
					const el = document.createElement('script');
					el.src = absolute + (absolute.includes('?') ? '&' : '?') + '_=' + Date.now();
					el.async = false;
					el.onload = resolve;
					el.onerror = () => { console.warn('[spa-router] reload script failed', absolute); resolve(); };
					document.body.appendChild(el);
				});
			} catch (e) { console.warn('[spa-router] reloadExternalScripts error', e); }
		}
	};

	const swapMain = (doc) => {
		const newMain = doc.querySelector('main');
		const main = document.querySelector('main');
		if (!newMain || !main) return false;
		const movedShellNodes = [];
		document.querySelectorAll('[data-shell-moved]').forEach(n => {
			movedShellNodes.push({ parent: n.parentNode, node: n });
			if (n.parentNode) n.parentNode.removeChild(n);
		});
		main.innerHTML = newMain.innerHTML;
		movedShellNodes.forEach(item => {
			try {
				if (item.node.tagName.toLowerCase() === 'aside') {
					const existingAside = document.querySelector('main aside');
					if (!existingAside) document.querySelector('main').appendChild(item.node);
				} else if (item.node.tagName.toLowerCase() === 'footer') {
					const mainEl = document.querySelector('main');
					if (mainEl && (!mainEl.nextElementSibling || mainEl.nextElementSibling.tagName.toLowerCase() !== 'footer')) {
						mainEl.insertAdjacentElement('afterend', item.node);
					}
				} else {
					(item.parent || document.body).appendChild(item.node);
				}
			} catch (e) {}
		});
		return true;
	};

	const updateTitle = (doc) => {
		const t = doc.querySelector('title'); if (t) document.title = t.textContent;
	};

	const spaCache = new Map();

	const fetchAndSwap = async (targetHref, push = true) => {
		if (isLoading) return;
		const target = normalizeForFetch(targetHref);
		if (!target) return false;
		isLoading = true;
		try {
			let html = null;
			if (spaCache.has(target)) html = spaCache.get(target);
			else {
				const resp = await fetch(target, { credentials: 'same-origin', cache: 'no-cache' });
				if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
				html = await resp.text();
			}
			const doc = new DOMParser().parseFromString(html, 'text/html');
			// cleanup artifacts from the previous page before inserting new content
			cleanupBeforeReinit();
			if (!swapMain(doc)) throw new Error('No <main> to swap');
			updateTitle(doc);
			// execute scripts found within new main (external and inline), skip duplicates
			await executeScriptsInMain(doc);
			// notify modules that the new page has been loaded and scripts executed
			console.log('[spa-router] dispatching spa:page:loaded');
			window.dispatchEvent(new Event('spa:page:loaded'));
			try {
				document.documentElement.dataset.lastSpa = Date.now().toString();
				if (typeof window.loadReadme === 'function') {
					console.log('[spa-router] calling loadReadme() automatically');
					try { window.loadReadme(); } catch (e) { console.warn('[spa-router] loadReadme failed', e); }
				}
				if (typeof window.initLightbox === 'function') {
					console.log('[spa-router] calling initLightbox() automatically');
					try { window.initLightbox(); } catch (e) { console.warn('[spa-router] initLightbox failed', e); }
				}

				// retry shortly to avoid timing issues when scripts execute slightly later
				setTimeout(() => {
					try {
						if (typeof window.loadReadme === 'function') window.loadReadme();
						if (typeof window.initLightbox === 'function') window.initLightbox();
						if (window.siteLightbox && typeof window.siteLightbox.refresh === 'function') window.siteLightbox.refresh();
					} catch (e) { /* ignore */ }
				}, 50);
				if (window.siteLightbox && typeof window.siteLightbox.refresh === 'function') {
					console.log('[spa-router] calling siteLightbox.refresh() automatically');
					try { window.siteLightbox.refresh(); } catch (e) { console.warn('[spa-router] siteLightbox.refresh failed', e); }
				}
			} catch (e) { /* ignore */ }
			if (push) window.history.pushState({ page: target }, '', target);
			window.scrollTo(0, 0);
			console.log('[spa-router] swapped main for', target);
			return true;
		} catch (err) {
			console.error('[spa-router] navigation failed, fallback to full load:', err);
			window.location.href = targetHref;
			return false;
		} finally {
			isLoading = false;
		}
	};

	// click handler for same-origin HTML links
	document.addEventListener('click', (e) => {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		const link = e.target.closest('a[href]'); if (!link) return;
		const href = link.getAttribute('href'); const target = normalizeForFetch(href); if (!target) return;
		e.preventDefault(); fetchAndSwap(target, true);
	}, true);

	// popstate handling
	window.addEventListener('popstate', (e) => {
		const page = e.state?.page || normalizeForFetch(window.location.href) || window.location.pathname;
		fetchAndSwap(page, false);
	});

	// initial history state
	window.history.replaceState({ page: window.location.pathname + window.location.search }, '', window.location.pathname + window.location.search);

	// prefetch on hover for sidebar links
	document.addEventListener('mouseover', (e) => {
		const a = e.target.closest('.sidebar a'); if (!a) return;
		const href = a.getAttribute('href'); const target = normalizeForFetch(href); if (!target) return;
		if (spaCache.has(target)) return;
		fetch(target, { cache: 'no-store' }).then(r => r.ok ? r.text() : null).then(t => { if (t) spaCache.set(target, t); }).catch(()=>{});
	});

	// expose cache for debugging
	window.__spaCache = spaCache;
})();

