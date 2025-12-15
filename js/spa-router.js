// PJAX-style router: swap only <main> for index.html/about.html

// Disable PJAX when opened via file:// to avoid fetch CORS/denied issues
if (window.location.protocol === 'file:') {
	console.warn('[PJAX] Disabled on file:// protocol');
} else (function () {
	let isLoading = false;
	const PAGE_SET = new Set(['', '/', 'index.html', 'about.html']);

	const normalizePage = (href) => {
		try {
			const url = new URL(href, window.location.href);
			const name = url.pathname.split('/').pop();
			if (PAGE_SET.has(name)) return name || 'index.html';
			return null;
		} catch (_) {
			return null;
		}
	};

	const cleanupBeforeReinit = () => {
		const overlay = document.getElementById('image-lightbox');
		if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
		const asideStack = document.getElementById('aside-stack');
		if (asideStack && asideStack.parentNode) asideStack.parentNode.removeChild(asideStack);
	};

	const reinitModules = () => {
		const evt = new Event('DOMContentLoaded');
		document.dispatchEvent(evt);
	};

	const swapMain = (doc) => {
		const newMain = doc.querySelector('main');
		const main = document.querySelector('main');
		if (!newMain || !main) return false;
		main.innerHTML = newMain.innerHTML;
		return true;
	};

	const updateTitle = (doc) => {
		const t = doc.querySelector('title');
		if (t) document.title = t.textContent;
	};

	const fetchAndSwap = async (targetPage, push = true) => {
		if (isLoading) return;
		isLoading = true;
		try {
			const resp = await fetch(targetPage, { credentials: 'same-origin', cache: 'no-cache' });
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const html = await resp.text();
			const doc = new DOMParser().parseFromString(html, 'text/html');
			if (!swapMain(doc)) throw new Error('No <main> to swap');
			updateTitle(doc);
			cleanupBeforeReinit();
			reinitModules();
			if (push) window.history.pushState({ page: targetPage }, '', targetPage);
			window.scrollTo(0, 0);
			console.log('[PJAX] swapped main for', targetPage);
		} catch (err) {
			console.error('[PJAX] navigation failed, fallback to full load:', err);
			window.location.href = targetPage;
		} finally {
			isLoading = false;
		}
	};

	document.addEventListener('click', (e) => {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		const link = e.target.closest('a[href]');
		if (!link) return;
		const page = normalizePage(link.getAttribute('href'));
		if (!page) return;
		e.preventDefault();
		fetchAndSwap(page, true);
	}, true);

	window.addEventListener('popstate', (e) => {
		const page = e.state?.page || normalizePage(window.location.pathname) || 'index.html';
		fetchAndSwap(page, false);
	});

	const current = normalizePage(window.location.pathname) || 'index.html';
	window.history.replaceState({ page: current }, '', current);
})();

