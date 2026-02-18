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
		const followSystemRadios = document.querySelectorAll('input[name="theme-follow"]');
		const THEME_KEY = 'theme';
		const FOLLOW_SYSTEM_KEY = 'follow-system';
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

		let wallpaperTheme = null;
		let wallpaperLoadId = 0;

		function setWallpaperLoading(active) {
			document.body.classList.toggle('wallpaper-loading', !!active);
		}

		function pickWallpaper(isDark) {
			const key = isDark ? 'dark' : 'light';
			const pool = WALLPAPER_POOLS[key];
			if (!Array.isArray(pool) || pool.length === 0) return null;
			const idx = Math.floor(Math.random() * pool.length);
			return pool[idx] || null;
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

		function applyWallpaper(isDark) {
			const key = isDark ? 'dark' : 'light';
			const current = document.documentElement.style.getPropertyValue('--wallpaper-image');
			if (wallpaperTheme === key && current) return;
			const picked = pickWallpaper(isDark);
			if (!picked) return;
			const loadId = ++wallpaperLoadId;
			setWallpaperLoading(true);
			preloadImage(picked).then(() => {
				if (loadId !== wallpaperLoadId) return;
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

	function updateRadioState() {
		followSystemRadios.forEach(radio => {
			if (followSystem && radio.value === 'follow') {
				radio.checked = true;
			} else if (!followSystem && radio.value === 'manual') {
				radio.checked = true;
			}
		});
	}

	// 初始化主题：优先使用保存的偏好，否则检测系统主题
	const savedTheme = localStorage.getItem(THEME_KEY);
	if (followSystem) {
		// 跟随系统模式
		setTheme(getSystemTheme());
	} else {
		// 手动模式：使用保存的主题
		if (savedTheme) {
			setTheme(savedTheme === 'dark');
		} else {
			// 正常不会垫到这一步，但为了安全起见
			setTheme(getSystemTheme());
		}
	}

	// 主题设置按钮：打开设置弹窗
	if (settingsBtn) {
		settingsBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			closeAllMenus();
			// Toggle settings modal: if open, close; otherwise open
			const modal = document.getElementById('settings-modal');
			if (modal && modal.classList.contains('show')) {
				document.dispatchEvent(new CustomEvent('close-settings-modal'));
			} else {
				document.dispatchEvent(new CustomEvent('open-settings-modal'));
			}
		});
	}

	// 沉菜单选项处理
	followSystemRadios.forEach(radio => {
		radio.addEventListener('change', () => {
			if (radio.value === 'follow') {
				followSystem = true;
				localStorage.setItem(FOLLOW_SYSTEM_KEY, 'true');
				// 立即应用系统主题
				setTheme(getSystemTheme());
			} else {
				followSystem = false;
				localStorage.setItem(FOLLOW_SYSTEM_KEY, 'false');
				// 保持当前主题
			}
			// 通知设置弹窗更新
			document.dispatchEvent(new CustomEvent('follow-system-changed'));
			if (settingsMenu) settingsMenu.classList.remove('active');
		});
	});

	// 监听系统主题变化（仅在跟随系统模式下）
	const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
	darkModeQuery.addListener((e) => {
		if (followSystem) {
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
			// 当用户手动一次月亮序列开关时，也转换为manual模式
			if (followSystem) {
				followSystem = false;
				localStorage.setItem(FOLLOW_SYSTEM_KEY, 'false');
				updateRadioState();
				// 通知设置弹窗更新
				document.dispatchEvent(new CustomEvent('follow-system-changed'));
			}
			const isDark = !document.body.classList.contains('dark-mode');
			setTheme(isDark);
		});
	}

	// 监听来自设置弹窗的 follow-system 变化
	document.addEventListener('follow-system-changed', () => {
		// 同步 followSystem 变量
		const newValue = localStorage.getItem(FOLLOW_SYSTEM_KEY);
		followSystem = newValue !== 'false';
		updateRadioState();
		// 如果切换到跟随系统，立即应用系统主题
		if (followSystem) {
			setTheme(getSystemTheme());
		}
	});
	} catch (err) {
		console.error('[theme.js] init error', err);
	}
});
