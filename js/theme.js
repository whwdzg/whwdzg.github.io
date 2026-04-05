/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\theme.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
// 模块：主题切换 / Theme detection, persistence, and toggle UI.
document.addEventListener('DOMContentLoaded', function () {
	try {
		console.debug('[theme.js] init');

		// 如果用户未访问过（关键键不存在），尝试从 config/defaults.json 加载默认配置
		(async function loadDefaultsIfMissing(){
			try {
				const hasThemeColor = localStorage.getItem('theme-color') !== null;
				const hasFollow = localStorage.getItem('follow-system') !== null;
				const hasPageProgress = localStorage.getItem('show-page-progress') !== null;
				if (hasThemeColor && hasFollow && hasPageProgress) return;
				const resp = await fetch('config/defaults.json', { cache: 'no-store' });
				if (!resp.ok) return;
				const defs = await resp.json();
				try { if (!hasFollow && typeof defs['follow-system'] !== 'undefined') localStorage.setItem('follow-system', defs['follow-system'] ? 'true' : 'false'); } catch(e){}
				try { if (!hasThemeColor && typeof defs['theme-color'] !== 'undefined') localStorage.setItem('theme-color', defs['theme-color']); } catch(e){}
				try { if (!hasPageProgress && typeof defs['show-page-progress'] !== 'undefined') localStorage.setItem('show-page-progress', defs['show-page-progress'] ? 'true' : 'false'); } catch(e){}
				// particle animation default (index stored as number)
				try { if (typeof defs['setting-particleanimation'] !== 'undefined') localStorage.setItem('setting-particleanimation', String(defs['setting-particleanimation'])); } catch(e){}
			} catch (err) {
				console.warn('[theme.js] load defaults failed', err);
			}
		})();
		const themeBtn = document.querySelector('.theme-toggle-btn');
		const settingsBtn = document.querySelector('.theme-settings-btn');
		const settingsMenu = document.querySelector('.theme-settings-menu');

		function closeAllMenus() {
			if (settingsMenu) settingsMenu.classList.remove('active');
		}
		const THEME_KEY = 'theme';
		const FOLLOW_SYSTEM_KEY = 'follow-system';
		const THEME_MODE_KEY = 'setting-lightdarktoggle'; // 0:follow system, 1:light, 2:dark
		const THEME_COLOR_KEY = 'theme-color';
		const DEFAULT_THEME_COLOR = '#33CC99';
		let followSystem = localStorage.getItem(FOLLOW_SYSTEM_KEY) !== 'false';

		const WALLPAPER_POOLS = {
			light: [
				'/resource/img/shell/bg/bg-light-1.png',
				'/resource/img/shell/bg/bg-light-2.png',
				'/resource/img/shell/bg/bg-light-3.png',
				'/resource/img/shell/bg/bg-light-4.png',
				'/resource/img/shell/bg/bg-light-5.png',
				'/resource/img/shell/bg/bg-light-6.png'
			],
			dark: [
				'/resource/img/shell/bg/bg-dark-1.png',
				'/resource/img/shell/bg/bg-dark-2.png'
			]
		};

		const WALLPAPER_SELECTION_KEY = 'setting-wallpaperselection';
		const WALLPAPER_ROTATION_KEY = 'setting-wallpaperrotation';
		const WALLPAPER_DAILY_STATE_KEY = 'wallpaper-daily-state-v1';
		const WALLPAPER_LOCKED_INDEX_KEY = 'wallpaper-locked-index-v1';
		const WALLPAPER_CACHE_HINT_KEY = 'wallpaper-cache-hint-v1';
		const WALLPAPER_FIXED_MAX_SELECTION = (WALLPAPER_POOLS.light.length || 0) + (WALLPAPER_POOLS.dark.length || 0);

		let wallpaperTheme = null;
		let wallpaperLoadId = 0;

		function loadWallpaperCacheHints() {
			try {
				const raw = localStorage.getItem(WALLPAPER_CACHE_HINT_KEY);
				if (!raw) return new Set();
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return new Set();
				return new Set(parsed.filter((v) => typeof v === 'string' && v));
			} catch (_) {
				return new Set();
			}
		}

		let wallpaperCacheHints = loadWallpaperCacheHints();

		function saveWallpaperCacheHints() {
			try {
				const arr = Array.from(wallpaperCacheHints);
				localStorage.setItem(WALLPAPER_CACHE_HINT_KEY, JSON.stringify(arr.slice(-24)));
			} catch (_) {}
		}

		function rememberWallpaperCached(src) {
			if (!src) return;
			if (!wallpaperCacheHints.has(src)) {
				wallpaperCacheHints.add(src);
				saveWallpaperCacheHints();
			}
		}

		function buildWallpaperPairs() {
			const lightPool = Array.isArray(WALLPAPER_POOLS.light) ? WALLPAPER_POOLS.light : [];
			const darkPool = Array.isArray(WALLPAPER_POOLS.dark) ? WALLPAPER_POOLS.dark : [];
			const pairCount = Math.max(lightPool.length, darkPool.length);
			const pairs = [];
			for (let i = 0; i < pairCount; i += 1) {
				pairs.push({
					light: lightPool.length ? lightPool[i % lightPool.length] : null,
					dark: darkPool.length ? darkPool[i % darkPool.length] : null
				});
			}
			return pairs.filter((p) => !!(p.light || p.dark));
		}

		const WALLPAPER_PAIRS = buildWallpaperPairs();

		function parseStoredInt(value) {
			const n = parseInt(value, 10);
			return Number.isNaN(n) ? null : n;
		}

		function isValidPairIndex(idx) {
			return typeof idx === 'number' && idx >= 0 && idx < WALLPAPER_PAIRS.length;
		}

		function getTodayKey() {
			const now = new Date();
			const y = now.getFullYear();
			const m = String(now.getMonth() + 1).padStart(2, '0');
			const d = String(now.getDate()).padStart(2, '0');
			return `${y}-${m}-${d}`;
		}

		function ensureWallpaperSettingsDefaults() {
			if (localStorage.getItem(THEME_MODE_KEY) === null) {
				const legacyFollow = localStorage.getItem(FOLLOW_SYSTEM_KEY) !== 'false';
				const legacyTheme = localStorage.getItem(THEME_KEY);
				let modeIndex = 0;
				if (!legacyFollow) {
					modeIndex = legacyTheme === 'dark' ? 2 : 1;
				}
				localStorage.setItem(THEME_MODE_KEY, String(modeIndex));
			}
			if (localStorage.getItem(WALLPAPER_SELECTION_KEY) === null) {
				localStorage.setItem(WALLPAPER_SELECTION_KEY, '0');
			}
			if (localStorage.getItem(WALLPAPER_ROTATION_KEY) === null) {
				localStorage.setItem(WALLPAPER_ROTATION_KEY, 'true');
			}
		}

		function getThemeMode() {
			const idx = parseStoredInt(localStorage.getItem(THEME_MODE_KEY));
			if (idx === 1 || idx === 2) return idx;
			return 0;
		}

		function setThemeMode(modeIndex) {
			const mode = modeIndex === 1 || modeIndex === 2 ? modeIndex : 0;
			localStorage.setItem(THEME_MODE_KEY, String(mode));
			followSystem = mode === 0;
			localStorage.setItem(FOLLOW_SYSTEM_KEY, followSystem ? 'true' : 'false');
			document.dispatchEvent(new CustomEvent('theme-mode-changed', { detail: { mode } }));
		}

		function getSelectedWallpaperOption() {
			const idx = parseStoredInt(localStorage.getItem(WALLPAPER_SELECTION_KEY));
			if (idx === null || idx < 0 || idx > WALLPAPER_FIXED_MAX_SELECTION) return 0;
			return idx;
		}

		function getFixedWallpaperBySelection(selectedOption) {
			if (!selectedOption || selectedOption <= 0) return null;
			const lightPool = WALLPAPER_POOLS.light || [];
			const darkPool = WALLPAPER_POOLS.dark || [];
			if (selectedOption <= lightPool.length) {
				return lightPool[selectedOption - 1] || null;
			}
			const darkIndex = selectedOption - lightPool.length - 1;
			if (darkIndex >= 0 && darkIndex < darkPool.length) {
				return darkPool[darkIndex] || null;
			}
			return null;
		}

		function getWallpaperRotationEnabled() {
			return localStorage.getItem(WALLPAPER_ROTATION_KEY) !== 'false';
		}

		function readDailyWallpaperState() {
			try {
				const raw = localStorage.getItem(WALLPAPER_DAILY_STATE_KEY);
				if (!raw) return null;
				const parsed = JSON.parse(raw);
				if (!parsed || typeof parsed.date !== 'string') return null;
				if (!isValidPairIndex(parsed.index)) return null;
				return parsed;
			} catch (_) {
				return null;
			}
		}

		function writeDailyWallpaperState(date, index) {
			if (!isValidPairIndex(index)) return;
			try {
				localStorage.setItem(WALLPAPER_DAILY_STATE_KEY, JSON.stringify({ date, index }));
			} catch (_) {}
		}

		function clearWallpaperRotationState() {
			localStorage.removeItem(WALLPAPER_DAILY_STATE_KEY);
			localStorage.removeItem(WALLPAPER_LOCKED_INDEX_KEY);
		}

		function randomWallpaperPairIndex(options) {
			const opts = options || {};
			if (!WALLPAPER_PAIRS.length) return null;

			const allIndexes = WALLPAPER_PAIRS.map((_, i) => i);
			if (!opts.preferCached) {
				return allIndexes[Math.floor(Math.random() * allIndexes.length)] || 0;
			}

			const scored = allIndexes.map((i) => {
				const pair = WALLPAPER_PAIRS[i] || {};
				let score = 0;
				if (pair.light && wallpaperCacheHints.has(pair.light)) score += 1;
				if (pair.dark && wallpaperCacheHints.has(pair.dark)) score += 1;
				return { i, score };
			});

			const maxScore = scored.reduce((m, s) => Math.max(m, s.score), 0);
			if (maxScore <= 0) {
				return allIndexes[Math.floor(Math.random() * allIndexes.length)] || 0;
			}

			const preferred = scored.filter((s) => s.score === maxScore).map((s) => s.i);
			return preferred[Math.floor(Math.random() * preferred.length)] || allIndexes[0] || 0;
		}

		function resolveWallpaperPairIndex(options) {
			const opts = options || {};
			const selected = getSelectedWallpaperOption();
			if (selected > 0) return null;

			if (!WALLPAPER_PAIRS.length) return null;

			const rotationEnabled = getWallpaperRotationEnabled();
			const today = getTodayKey();

			if (rotationEnabled) {
				const daily = readDailyWallpaperState();
				if (!opts.forceNewDaily && daily && daily.date === today) return daily.index;
				const nextIndex = randomWallpaperPairIndex({ preferCached: true });
				if (!isValidPairIndex(nextIndex)) return null;
				writeDailyWallpaperState(today, nextIndex);
				localStorage.removeItem(WALLPAPER_LOCKED_INDEX_KEY);
				return nextIndex;
			}

			const locked = parseStoredInt(localStorage.getItem(WALLPAPER_LOCKED_INDEX_KEY));
			if (isValidPairIndex(locked)) return locked;

			const daily = readDailyWallpaperState();
			const nextIndex = daily && isValidPairIndex(daily.index) ? daily.index : randomWallpaperPairIndex({ preferCached: true });
			if (!isValidPairIndex(nextIndex)) return null;
			localStorage.setItem(WALLPAPER_LOCKED_INDEX_KEY, String(nextIndex));
			return nextIndex;
		}

		function getWallpaperForTheme(isDark, options) {
			const selected = getSelectedWallpaperOption();
			const fixed = getFixedWallpaperBySelection(selected);
			if (fixed) return fixed;
			const idx = resolveWallpaperPairIndex(options);
			if (!isValidPairIndex(idx)) return null;
			const pair = WALLPAPER_PAIRS[idx];
			if (!pair) return null;
			return isDark ? (pair.dark || pair.light) : (pair.light || pair.dark);
		}

		function setWallpaperLoading(active) {
			document.body.classList.toggle('wallpaper-loading', !!active);
		}

		function preloadImage(src) {
			return new Promise((resolve) => {
				if (!src) return resolve(false);
				const img = new Image();
				let done = false;
				const finish = (ok) => {
					if (done) return;
					done = true;
					resolve(ok);
				};
				img.onload = () => finish(true);
				img.onerror = () => finish(false);
				img.src = src;
				if (img.complete) finish(true);
				setTimeout(() => finish(false), 5000);
			});
		}

		function applyWallpaper(isDark, options) {
			const opts = options || {};
			const key = isDark ? 'dark' : 'light';
			const current = document.documentElement.style.getPropertyValue('--wallpaper-image');
			if (!opts.force && wallpaperTheme === key && current) return;
			const picked = getWallpaperForTheme(isDark, { forceNewDaily: !!opts.forceNewDaily });
			if (!picked) return;
			const loadId = ++wallpaperLoadId;
			setWallpaperLoading(true);
			preloadImage(picked).then((ok) => {
				if (loadId !== wallpaperLoadId) return;
				if (ok) rememberWallpaperCached(picked);
				document.documentElement.style.setProperty('--wallpaper-image', `url('${picked}')`);
				wallpaperTheme = key;
				setWallpaperLoading(false);
			}).catch(() => {
				if (loadId !== wallpaperLoadId) return;
				setWallpaperLoading(false);
			});
		}

	function applyThemeColor(color) {
		document.documentElement.style.setProperty('--primary-color', color);
		try {
			const hex = (color || '').replace('#', '').trim();
			if (hex.length === 3) {
				const r = parseInt(hex[0] + hex[0], 16);
				const g = parseInt(hex[1] + hex[1], 16);
				const b = parseInt(hex[2] + hex[2], 16);
				document.documentElement.style.setProperty('--primary-color-rgb', `${r},${g},${b}`);
			} else if (hex.length === 6) {
				const r = parseInt(hex.substring(0,2), 16);
				const g = parseInt(hex.substring(2,4), 16);
				const b = parseInt(hex.substring(4,6), 16);
				document.documentElement.style.setProperty('--primary-color-rgb', `${r},${g},${b}`);
			}
		} catch (_) {}
	}
	// defaults
	if (localStorage.getItem(FOLLOW_SYSTEM_KEY) === null) {
		localStorage.setItem(FOLLOW_SYSTEM_KEY, 'true');
		followSystem = true;
	}
	ensureWallpaperSettingsDefaults();
	const initialColor = localStorage.getItem(THEME_COLOR_KEY) || DEFAULT_THEME_COLOR;
	localStorage.setItem(THEME_COLOR_KEY, initialColor);
	applyThemeColor(initialColor);

	function setTheme(isDark) {
		if (isDark) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
		applyWallpaper(isDark);
		localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
	}

	function getSystemTheme() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	// 初始化主题三态：0 跟随系统，1 浅色，2 深色
	const initialThemeMode = getThemeMode();
	followSystem = initialThemeMode === 0;
	localStorage.setItem(FOLLOW_SYSTEM_KEY, followSystem ? 'true' : 'false');
	if (initialThemeMode === 0) {
		setTheme(getSystemTheme());
	} else if (initialThemeMode === 1) {
		setTheme(false);
	} else {
		setTheme(true);
	}

	// 主题设置按钮：打开设置弹窗（事件委托，兼容后续动态注入的页眉按钮）
	document.addEventListener('click', (e) => {
		const btn = e.target && e.target.closest ? e.target.closest('.theme-settings-btn') : null;
		if (!btn) return;
		e.stopPropagation();
		closeAllMenus();
		const modal = document.getElementById('settings-modal');
		if (modal && modal.classList.contains('show')) {
			document.dispatchEvent(new CustomEvent('close-settings-modal'));
		} else {
			document.dispatchEvent(new CustomEvent('open-settings-modal'));
		}
	});

	// 监听系统主题变化（仅在跟随系统模式下）
	const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
	darkModeQuery.addListener((e) => {
		if (getThemeMode() === 0) {
			setTheme(e.matches);
		}
	});

	// 页面进度条逻辑

	let pageProgressEl = null;
	let pageProgressBg = null;
	let pageProgressHandler = null;

	function createPageProgress() {
		if (pageProgressEl) return;
		const header = document.querySelector('header');
		if (!header) return;
		pageProgressBg = document.createElement('div');
		pageProgressBg.className = 'header-progress-bg';
		pageProgressEl = document.createElement('div');
		pageProgressEl.className = 'header-progress';
		header.appendChild(pageProgressBg);
		header.appendChild(pageProgressEl);
		pageProgressHandler = () => {
			const h = document.documentElement.scrollHeight - window.innerHeight;
			const scrolled = h > 0 ? (window.scrollY / h) : 0;
			pageProgressEl.style.transform = `scaleX(${Math.max(0, Math.min(1, scrolled))})`;
		};
		window.addEventListener('scroll', pageProgressHandler, { passive: true });
		// sync immediately
		pageProgressHandler();
	}

	function removePageProgress() {
		if (!pageProgressEl) return;
		window.removeEventListener('scroll', pageProgressHandler);
		pageProgressHandler = null;
		pageProgressEl.remove();
		pageProgressBg.remove();
		pageProgressEl = null;
		pageProgressBg = null;
	}

	// 初始化：默认开启进度条（未设置时写入 true）
	const storedProgress = localStorage.getItem('show-page-progress');
	if (storedProgress === null) {
		localStorage.setItem('show-page-progress', 'true');
	}
	if (storedProgress === null || storedProgress === 'true') {
		createPageProgress();
	}

	// 监听设置切换事件
	document.addEventListener('page-progress-toggled', (e) => {
		if (e.detail && e.detail.enabled) {
			createPageProgress();
		} else {
			removePageProgress();
		}
	});

	// 月亮序列切换按钮
	if (themeBtn) {
		themeBtn.addEventListener('click', function () {
			const isDark = !document.body.classList.contains('dark-mode');
			setThemeMode(isDark ? 2 : 1);
			setTheme(isDark);
		});
	}

	function applyWallpaperForCurrentTheme(options) {
		const isDark = document.body.classList.contains('dark-mode');
		applyWallpaper(isDark, options || {});
	}

	document.addEventListener('setting-changed', (e) => {
		const detail = e && e.detail ? e.detail : null;
		if (!detail) return;

		if (detail.id === 'lightdarktoggle') {
			const idx = Number(detail.index);
			if (idx === 0) {
				setThemeMode(0);
				setTheme(getSystemTheme());
			} else if (idx === 1) {
				setThemeMode(1);
				setTheme(false);
			} else if (idx === 2) {
				setThemeMode(2);
				setTheme(true);
			}
			if (settingsMenu) settingsMenu.classList.remove('active');
		}

		if (detail.id === 'wallpaperselection') {
			const idx = parseStoredInt(detail.index);
			if (idx !== null) {
				localStorage.setItem(WALLPAPER_SELECTION_KEY, String(idx));
				if (idx > 0) {
					localStorage.setItem(WALLPAPER_ROTATION_KEY, 'false');
					localStorage.removeItem(WALLPAPER_LOCKED_INDEX_KEY);
				}
				if (idx === 0) {
					localStorage.removeItem(WALLPAPER_LOCKED_INDEX_KEY);
				}
				wallpaperTheme = null;
				applyWallpaperForCurrentTheme({ force: true });
				document.dispatchEvent(new CustomEvent('wallpaper-settings-synced', {
					detail: { fromModal: true, id: 'wallpaperselection' }
				}));
			}
		}

		if (detail.id === 'wallpaperrotation') {
			const enabled = Number(detail.index) === 1;
			localStorage.setItem(WALLPAPER_ROTATION_KEY, enabled ? 'true' : 'false');
			if (enabled) {
				localStorage.setItem(WALLPAPER_SELECTION_KEY, '0');
				localStorage.removeItem(WALLPAPER_LOCKED_INDEX_KEY);
			} else {
				const currentIndex = resolveWallpaperPairIndex({ forceNewDaily: false });
				if (isValidPairIndex(currentIndex)) {
					localStorage.setItem(WALLPAPER_LOCKED_INDEX_KEY, String(currentIndex));
				}
			}
			wallpaperTheme = null;
			applyWallpaperForCurrentTheme({ force: true });
			document.dispatchEvent(new CustomEvent('wallpaper-settings-synced', {
				detail: { fromModal: true, id: 'wallpaperrotation' }
			}));
		}
	});

	document.addEventListener('wallpaper-rotation-reset', () => {
		clearWallpaperRotationState();
		wallpaperTheme = null;
		applyWallpaperForCurrentTheme({ force: true, forceNewDaily: true });
	});
	} catch (err) {
		console.error('[theme.js] init error', err);
	}
});
