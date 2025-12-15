// 主题切换逻辑
document.addEventListener('DOMContentLoaded', function () {
	const themeBtn = document.querySelector('.theme-toggle-btn');
	const settingsBtn = document.querySelector('.theme-settings-btn');
	const settingsMenu = document.querySelector('.theme-settings-menu');
    const languageSelectorMenu = document.querySelector('.language-selector-menu');
    const avatarMenu = document.getElementById('avatar-links-menu');
	const followSystemRadios = document.querySelectorAll('input[name="theme-follow"]');
	const THEME_KEY = 'theme';
	const FOLLOW_SYSTEM_KEY = 'follow-system';
	let followSystem = localStorage.getItem(FOLLOW_SYSTEM_KEY) !== 'false';

	function setTheme(isDark) {
		if (isDark) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
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

	// 更新按钮状态
	updateRadioState();

	function closeAllMenus(except) {
		const menus = [settingsMenu, languageSelectorMenu, avatarMenu].filter(Boolean);
		menus.forEach(m => { if (m && m !== except) m.classList.remove('active'); });
	}

	// 主题设置按钮开及关沉菜单
	if (settingsBtn) {
		settingsBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			const isOpen = settingsMenu.classList.contains('active');
			closeAllMenus();
			if (!isOpen) {
				settingsMenu.classList.add('active');
			}
		});
	}

	// 点击沉菜单外关沉菜单
	document.addEventListener('click', (e) => {
		if (!e.target.closest('.theme-settings-container') && !e.target.closest('.language-selector-container') && !e.target.closest('#avatar-btn') && !e.target.closest('#avatar-links-menu')) {
			closeAllMenus();
		}
	});

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
			settingsMenu.classList.remove('active');
		});
	});

	// 监听系统主题变化（仅在跟随系统模式下）
	const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
	darkModeQuery.addListener((e) => {
		if (followSystem) {
			setTheme(e.matches);
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
			}
			const isDark = !document.body.classList.contains('dark-mode');
			setTheme(isDark);
		});
	}
});
