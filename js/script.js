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
			const willOpen = !settingsMenu.classList.contains('active');
			closeAllMenus(willOpen ? settingsMenu : null);
			settingsMenu.classList.toggle('active');
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

// 语言切换逻辑
document.addEventListener('DOMContentLoaded', function () {
	const languageSelectorBtn = document.querySelector('.language-selector-btn');
	const languageSelectorMenu = document.querySelector('.language-selector-menu');
	const LANGUAGE_KEY = 'language';

	function getLanguageRadios() {
		return document.querySelectorAll('input[name="language"]');
	}

	function setLanguage(lang) {
		document.documentElement.lang = lang;
		localStorage.setItem(LANGUAGE_KEY, lang);
		updateLanguageRadioState(lang);
		applyTranslations(lang);
	}

	function applyTranslations(lang) {
		// 从全局translations对象获取翻译数据（已在i18n.js中定义）
		if (typeof translations === 'undefined') {
			return;
		}
		
		const langData = translations[lang];
		if (!langData) {
			return;
		}
		
		updatePageWithTranslations(langData);
	}

	function updatePageWithTranslations(translations) {
		// 更新页面标题
		if (translations.page.title) {
			document.title = translations.page.title;
		}
		
		// 更新头部链接和按钮
		const homeLink = document.querySelector('header a[href="index.html"]');
		if (homeLink) homeLink.textContent = translations.header.homeLink;

		// 更新侧边栏文本
		const sidebarAbout = document.querySelector('nav a[href="#about"] .label');
		if (sidebarAbout) sidebarAbout.textContent = translations.sidebar.about;

		const legacyBtn = document.querySelector('nav button.toggle .toggle-label');
		if (legacyBtn) legacyBtn.textContent = translations.sidebar.legacy;

		const collapseBtn = document.querySelector('.sidebar-collapse-btn');
		if (collapseBtn) collapseBtn.title = translations.sidebar.collapseBtn;

		const home1_0 = document.querySelector('nav a[href="Legacy-1.0/index.html"] .label');
		if (home1_0) home1_0.textContent = translations.sidebar.home1_0;

		const about1_0 = document.querySelector('nav a[href="Legacy-1.0/about.html"] .label');
		if (about1_0) about1_0.textContent = translations.sidebar.about1_0;

		const readme1_0 = document.querySelector('nav a[href="Legacy-1.0/README.md"] .label');
		if (readme1_0) readme1_0.textContent = translations.sidebar.readme1_0;

		const readmeLink = document.querySelector('nav a[href="README.md"] .label');
		if (readmeLink) readmeLink.textContent = translations.sidebar.readme;

		// 更新主内容区
		const aboutSection = document.querySelector('#about');
		if (aboutSection) {
			const aboutTitle = aboutSection.querySelector('h2');
			const aboutContent = aboutSection.querySelector('p');
			if (aboutTitle) aboutTitle.textContent = translations.main.aboutTitle;
			if (aboutContent) aboutContent.innerHTML = translations.main.aboutContent;
		}

		const testSection = document.querySelector('#test');
		if (testSection) {
			const testTitle = testSection.querySelector('h2');
			if (testTitle) testTitle.textContent = translations.main.testTitle;
		}

		// 更新 Aside 卡片内容
		const asideSections = document.querySelectorAll('aside section');
		asideSections.forEach((section, index) => {
			if (index === 0) {
				// 注意卡片
				const noticeTitle = section.querySelector('h3');
				const noticeContent = section.querySelector('p');
				if (noticeTitle) {
					noticeTitle.innerHTML = `<i class="icon-ic_fluent_info_24_regular item-icon" aria-hidden="true"></i>${translations.aside.noticeTitle}`;
				}
				if (noticeContent) {
					noticeContent.innerHTML = translations.aside.noticeContent;
				}
			} else if (index === 1) {
				// 返回1.0主页卡片
				const legacyCardTitle = section.querySelector('h3');
				const legacyCardContent = section.querySelector('p');
				if (legacyCardTitle) {
					legacyCardTitle.innerHTML = `<i class="icon-ic_fluent_history_24_regular item-icon" aria-hidden="true"></i>${translations.aside.legacyTitle}`;
				}
				if (legacyCardContent) {
					// 重新构建内容（需要保持原有的HTML结构）
					let content = `<abbr title="1.3.12.2025.8.7-New_MusicPlayer">${translations.aside.versionLabel}</abbr>`;
					content += translations.aside.legacyStopped;
					content += `<br><a href="Legacy-1.0/index.html" title="返回1.0版本主页">${translations.aside.legacyLink}</a>`;
					legacyCardContent.innerHTML = content;
				}
			}
		});

		// 更新页脚
		const footer = document.querySelector('footer');
		if (footer) {
			const copyrightP = footer.querySelector('p:first-child');
			const versionP = footer.querySelector('p:last-child');
			if (copyrightP) copyrightP.innerHTML = translations.footer.copyright;
			if (versionP) versionP.innerHTML = translations.footer.version;
		}

		// 更新主题设置菜单
		const themeSettingsMenu = document.querySelector('.theme-settings-menu');
		if (themeSettingsMenu) {
			const themeLabels = themeSettingsMenu.querySelectorAll('label.settings-option');
			themeLabels.forEach(label => {
				const radio = label.querySelector('input[type="radio"]');
				const span = label.querySelector('span');
				if (radio && span) {
					if (radio.value === 'follow') {
						span.textContent = translations.theme.followSystem;
					} else if (radio.value === 'manual') {
						span.textContent = translations.theme.manual;
					}
				}
			});
		}

		// 更新语言选择菜单
		const languageSelectorMenu = document.querySelector('.language-selector-menu');
		if (languageSelectorMenu) {
			const languageLabels = languageSelectorMenu.querySelectorAll('label.language-option');
			languageLabels.forEach(label => {
				const radio = label.querySelector('input[type="radio"]');
				const span = label.querySelector('span');
				if (radio && span) {
					if (radio.value === 'zh-CN') {
						span.textContent = translations.language.zhCN;
					} else if (radio.value === 'en-US') {
						span.textContent = translations.language.enUS;
					}
				}
			});
		}

		// 更新按钮标题和ARIA标签
		const themeToggleBtn = document.querySelector('.theme-toggle-btn');
		if (themeToggleBtn) {
			themeToggleBtn.title = translations.header.themeToggleBtn;
			themeToggleBtn.setAttribute('aria-label', translations.header.themeToggleBtn);
		}

		const themeSettingsBtn = document.querySelector('.theme-settings-btn');
		if (themeSettingsBtn) {
			themeSettingsBtn.title = translations.header.themeSettingsBtn;
			themeSettingsBtn.setAttribute('aria-label', translations.header.themeSettingsBtn);
		}

		const languageSelectorBtn = document.querySelector('.language-selector-btn');
		if (languageSelectorBtn) {
			languageSelectorBtn.title = translations.header.languageSelectorBtn;
			languageSelectorBtn.setAttribute('aria-label', translations.header.languageSelectorBtn);
		}

		// 更新图片放大遮罩的辅助文本
		const lightboxStrings = translations.lightbox;
		if (lightboxStrings) {
			const closeBtn = document.querySelector('#image-lightbox .lightbox-close');
			const zoomInBtn = document.querySelector('#image-lightbox .lightbox-zoom-in');
			const zoomOutBtn = document.querySelector('#image-lightbox .lightbox-zoom-out');
			if (closeBtn) closeBtn.setAttribute('aria-label', lightboxStrings.close);
			if (zoomInBtn) zoomInBtn.setAttribute('aria-label', lightboxStrings.zoomIn);
			if (zoomOutBtn) zoomOutBtn.setAttribute('aria-label', lightboxStrings.zoomOut);
		}
	}

	function updateLanguageRadioState(lang) {
		const radios = getLanguageRadios();
		radios.forEach(radio => {
			radio.checked = (radio.value === lang);
		});
	}

	// 初始化语言
	const savedLanguage = localStorage.getItem(LANGUAGE_KEY) || 'zh-CN';
	setLanguage(savedLanguage);

	// 语言选择按钮开及关菜单
	if (languageSelectorBtn) {
		languageSelectorBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			const willOpen = !languageSelectorMenu.classList.contains('active');
			// 关闭其他菜单
			const settingsMenu = document.querySelector('.theme-settings-menu');
			const avatarMenu = document.getElementById('avatar-links-menu');
			[settingsMenu, avatarMenu].forEach(m => m && m.classList.remove('active'));
			languageSelectorMenu.classList.toggle('active');
		});
	}

	// 点击菜单外关菜单
	document.addEventListener('click', (e) => {
		if (!e.target.closest('.language-selector-container') && !e.target.closest('.theme-settings-container') && !e.target.closest('#avatar-btn') && !e.target.closest('#avatar-links-menu')) {
			languageSelectorMenu.classList.remove('active');
		}
	});

	// 菜单选项处理 - 使用label的click事件
	const languageLabels = document.querySelectorAll('label.language-option');
	
	languageLabels.forEach(label => {
		label.addEventListener('click', function(e) {
			const radio = this.querySelector('input[name="language"]');
			if (radio) {
				setLanguage(radio.value);
				languageSelectorMenu.classList.remove('active');
				// 选择后关闭其他菜单以避免重叠
				const settingsMenu = document.querySelector('.theme-settings-menu');
				const avatarMenu = document.getElementById('avatar-links-menu');
				[settingsMenu, avatarMenu].forEach(m => m && m.classList.remove('active'));
			}
		});
	});
});

// 左侧导航折叠/展开逻辑
document.addEventListener('DOMContentLoaded', function () {
	// 将文档中的 aside 收集到右下角浮动栈容器，避免重叠纵向排列
	(function setupAsideStack() {
		const asides = Array.from(document.querySelectorAll('main aside, body > aside'));
		if (!asides.length) return;
		let stack = document.getElementById('aside-stack');
		if (!stack) {
			stack = document.createElement('div');
			stack.id = 'aside-stack';
			document.body.appendChild(stack);
		}
		// 将现有 aside 的内容按 section 拆分成多个卡片，避免在一个卡里堆叠
		asides.forEach(a => {
			const sections = Array.from(a.querySelectorAll(':scope > section'));
			if (sections.length > 0) {
				sections.forEach(sec => {
					const card = document.createElement('aside');
					// 迁移该 section 的内容到新卡片中
					card.appendChild(sec);
					stack.appendChild(card);
				});
				// 清空原 aside，避免重复展示
				a.remove();
			} else {
				// 没有子 section，则直接作为一个卡片移入栈
				stack.appendChild(a);
			}
		});
	})();

	// 为浮动栈卡片添加关闭按钮
	(function addAsideCloseButtons() {
		const stack = document.getElementById('aside-stack');
		if (!stack) return;
		stack.querySelectorAll('aside').forEach(card => {
			if (card.querySelector('.aside-close')) return;
			const btn = document.createElement('button');
			btn.className = 'aside-close';
			btn.setAttribute('aria-label', 'Close');
			btn.innerHTML = '<i class="fluent-font" aria-hidden="true">&#xF369;</i>';
			btn.addEventListener('click', () => {
				card.classList.add('closing');
				setTimeout(() => {
					card.remove();
				}, 240);
			});
			card.appendChild(btn);
		});
	})();

	// 找到所有有子菜单的项
	const parents = document.querySelectorAll('.sidebar .has-children');

	parents.forEach(parent => {
		const btn = parent.querySelector('.toggle');
		const submenu = parent.querySelector('.submenu');

		if (!btn || !submenu) return;

		// 为无障碍可访问性初始化 aria-expanded
		btn.setAttribute('aria-expanded', 'false');

		btn.addEventListener('click', function () {
			const isOpen = parent.classList.toggle('open');
			btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

			// 动态设置 max-height 以获得平滑动画（使用 scrollHeight）
			if (isOpen) {
				// 将 max-height 先设置为子元素真实高度
				submenu.style.maxHeight = submenu.scrollHeight + 'px';
			} else {
				// 折叠时设置为 0
				submenu.style.maxHeight = '0px';
			}
		});

		// 如果窗口大小改变，且子菜单打开，刷新 max-height
		window.addEventListener('resize', function () {
			if (parent.classList.contains('open')) {
				submenu.style.maxHeight = submenu.scrollHeight + 'px';
			}
		});
    
		// 侧边栏整体折叠/展开逻辑
		const collapseBtns = document.querySelectorAll('.sidebar-collapse-btn');
		const body = document.body;
		const SIDEBAR_KEY = 'sidebarCollapsed';

		function setCollapsed(collapsed, save = true) {
			if (collapsed) {
				body.classList.add('sidebar-collapsed');
				collapseBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
				// 关闭所有打开的子菜单，避免折叠后显示溢出
				document.querySelectorAll('.sidebar .has-children.open').forEach(p => {
					p.classList.remove('open');
					const sm = p.querySelector('.submenu');
					if (sm) sm.style.maxHeight = '0px';
				});
			} else {
				body.classList.remove('sidebar-collapsed');
				collapseBtns.forEach(btn => btn.setAttribute('aria-expanded', 'true'));
			}
			if (save) localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
			// After collapsing state change, update sidebar offset variable so button repositions
			adjustSidebarPosition();
		}

		// 恢复上次状态
		const saved = localStorage.getItem(SIDEBAR_KEY);
		if (saved === '1') setCollapsed(true, false);

		collapseBtns.forEach(btn => {
			btn.addEventListener('click', function () {
				const isCollapsed = body.classList.toggle('sidebar-collapsed');
				setCollapsed(isCollapsed);
			});
		});
		// 在折叠/展开或窗口大小改变时，调整侧边栏位置以避免遮挡页眉
		function adjustSidebarPosition() {
			const header = document.querySelector('header');
			const footer = document.querySelector('footer');
			const sidebar = document.getElementById('sidebar');
			if (!header || !sidebar) return;

			// 先计算 header 高度（无论窄屏或宽屏都需要），用于调整 body padding-top
			const headerHeight = Math.ceil(header.getBoundingClientRect().height);

			// 把 header 高度同步到 CSS 变量，便于 CSS 使用
			document.documentElement.style.setProperty('--header-height', headerHeight + 'px');

			// 把侧边栏当前宽度写入 CSS 变量 --sidebar-offset，供 collapse button 用来定位
			const sidebarWidth = sidebar.getBoundingClientRect().width;
			document.documentElement.style.setProperty('--sidebar-offset', sidebarWidth + 'px');

			// 小屏幕下侧边栏为静态，但仍需为固定 header 留出空间：设置 body padding-top
			if (window.innerWidth <= 760) {
				sidebar.style.top = '';
				sidebar.style.height = '';
				document.body.style.paddingTop = headerHeight + 'px';
				return;
			}

			// 计算页尾高度（如有），用于让侧栏不盖住页尾
			const footerRect = footer ? footer.getBoundingClientRect() : null;
			const footerHeight = footerRect ? Math.ceil(footerRect.height) : 0;
			// 精确计算页尾与视口的可见重叠高度：
			// 不可见时（完全在视口上方或下方）应为 0；部分可见时按交集计算
			let bottomGap = 0;
			if (footerRect) {
				const visibleTop = Math.max(0, footerRect.top);
				const visibleBottom = Math.min(window.innerHeight, footerRect.bottom);
				const visibleHeight = Math.max(0, visibleBottom - visibleTop);
				bottomGap = Math.min(visibleHeight, footerHeight);
				// 当页尾完全显示时，增加一个微小安全间隙，避免侧栏盖住页尾边线
				if (visibleHeight >= footerHeight) bottomGap = footerHeight + 4; // 4px 安全边距
			}

			// 宽屏：侧边栏固定在 header 下面；根据页尾当前可见高度动态留出底部间隙
			sidebar.style.top = headerHeight + 'px';
			sidebar.style.height = 'auto';
			sidebar.style.bottom = `${bottomGap}px`;
			document.body.style.paddingTop = headerHeight + 'px';
		}

		// 使用 IntersectionObserver 动态根据页尾可见性调整侧栏 bottom
		(function observeFooter() {
			const footer = document.querySelector('footer');
			const sidebar = document.getElementById('sidebar');
			if (!footer || !sidebar) return;
			try {
				const io = new IntersectionObserver((entries) => {
					for (const entry of entries) {
						if (window.innerWidth <= 760) return; // 仅桌面执行
						const headerHeight = Math.ceil(document.querySelector('header').getBoundingClientRect().height);
						const rect = footer.getBoundingClientRect();
						const footerHeight = Math.ceil(rect.height);
						const visibleTop = Math.max(0, rect.top);
						const visibleBottom = Math.min(window.innerHeight, rect.bottom);
						const visibleHeight = Math.max(0, visibleBottom - visibleTop);
						let bottomGap = Math.min(visibleHeight, footerHeight);
						if (visibleHeight >= footerHeight) bottomGap = footerHeight + 4; // 4px 安全边距
						sidebar.style.top = headerHeight + 'px';
						sidebar.style.height = 'auto';
						sidebar.style.bottom = `${bottomGap}px`;
					}
				}, { root: null, threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1] });
				io.observe(footer);
			} catch (e) {
				// 兼容性兜底：监听滚动与调整大小并调用 adjustSidebarPosition
				window.addEventListener('scroll', adjustSidebarPosition, { passive: true });
				window.addEventListener('resize', adjustSidebarPosition);
			}
		})();

		// 初始与窗口调整时都运行
		window.addEventListener('resize', adjustSidebarPosition);
		window.addEventListener('load', adjustSidebarPosition);

		// 在窄屏或者 unload 时移除 body padding-top，以防止影响页面外观
		window.addEventListener('unload', function () { document.body.style.paddingTop = ''; });

		// 在折叠状态变化时也重算位置（延迟以配合过渡）
		const observer = new MutationObserver(() => { setTimeout(adjustSidebarPosition, 220); });
		observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

		// 立即调整一次
		adjustSidebarPosition();
	});
});

// 可选：在页面载入后把所有 submenu 的内联 maxHeight 归零（确保一致）
window.addEventListener('load', function () {
	document.querySelectorAll('.sidebar .submenu').forEach(s => s.style.maxHeight = '0px');
});


// 图片放大预览与遮罩
document.addEventListener('DOMContentLoaded', function () {
	const candidates = Array.from(document.querySelectorAll('main img, #aside-stack img'));
	if (!candidates.length) return;

	let overlay = document.getElementById('image-lightbox');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.id = 'image-lightbox';
		overlay.setAttribute('aria-hidden', 'true');
		overlay.innerHTML = `
			<button class="lightbox-close" aria-label="Close image">×</button>
			<div class="lightbox-content">
				<div class="lightbox-controls" aria-hidden="true">
					<button class="lightbox-zoom-in" aria-label="Zoom in">+</button>
					<button class="lightbox-zoom-out" aria-label="Zoom out">−</button>
				</div>
				<img alt="" />
			</div>
		`;
		document.body.appendChild(overlay);
	}

	let filmstrip = overlay.querySelector('.lightbox-filmstrip');
	if (!filmstrip) {
		filmstrip = document.createElement('div');
		filmstrip.className = 'lightbox-filmstrip';
		filmstrip.setAttribute('role', 'list');
		overlay.appendChild(filmstrip);
	}

	const overlayImg = overlay.querySelector('img');
	const closeBtn = overlay.querySelector('.lightbox-close');
	const zoomInBtn = overlay.querySelector('.lightbox-zoom-in');
	const zoomOutBtn = overlay.querySelector('.lightbox-zoom-out');
	let currentIndex = 0;
	let currentScale = 1;
	const getLang = () => document.documentElement.lang || localStorage.getItem('language') || 'zh-CN';
	const applyLightboxLabels = () => {
		if (typeof translations === 'undefined') return;
		const strings = translations[getLang()] && translations[getLang()].lightbox;
		if (!strings) return;
		if (closeBtn) closeBtn.setAttribute('aria-label', strings.close);
		if (zoomInBtn) zoomInBtn.setAttribute('aria-label', strings.zoomIn);
		if (zoomOutBtn) zoomOutBtn.setAttribute('aria-label', strings.zoomOut);
	};

	const applyScale = () => {
		overlayImg.style.transform = `scale(${currentScale})`;
	};

	const clampScale = (val) => Math.min(2.5, Math.max(0.6, val));

	const setActiveThumb = () => {
		const thumbs = filmstrip.querySelectorAll('.filmstrip-thumb');
		thumbs.forEach((btn, idx) => {
			btn.classList.toggle('active', idx === currentIndex);
		});
		// 确保当前缩略图可见
		const active = thumbs[currentIndex];
		if (active && active.scrollIntoView) {
			active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
		}
	};

	const openOverlay = (index) => {
		currentIndex = index;
		currentScale = 1;
		applyScale();
		const target = candidates[currentIndex];
		if (target) {
			overlayImg.src = target.src;
			overlayImg.alt = target.alt || '';
		}
		overlay.classList.add('active');
		overlay.setAttribute('aria-hidden', 'false');
		document.body.classList.add('no-scroll-lightbox');
		setActiveThumb();
	};

	const closeOverlay = () => {
		overlay.classList.remove('active');
		overlay.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('no-scroll-lightbox');
	};

	candidates.forEach((img, index) => {
		img.classList.add('zoomable-img');
		img.addEventListener('click', () => {
			openOverlay(index);
		});
	});

	// 构建缩略图胶片条
	filmstrip.innerHTML = '';
	candidates.forEach((img, index) => {
		const btn = document.createElement('button');
		btn.className = 'filmstrip-thumb';
		btn.setAttribute('role', 'listitem');
		btn.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}">`;
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			openOverlay(index);
		});
		filmstrip.appendChild(btn);
	});

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) closeOverlay();
	});

	if (closeBtn) {
		closeBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			closeOverlay();
		});
	}

	if (zoomInBtn) {
		zoomInBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			currentScale = clampScale(currentScale + 0.15);
			applyScale();
		});
	}

	if (zoomOutBtn) {
		zoomOutBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			currentScale = clampScale(currentScale - 0.15);
			applyScale();
		});
	}

	// 初始化遮罩按钮的本地化标签
	applyLightboxLabels();

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && overlay.classList.contains('active')) {
			closeOverlay();
		}
	});
});


// ͷ��˵�����¼�
document.addEventListener('DOMContentLoaded', function () {
const avatarBtn = document.getElementById('avatar-btn');
const avatarMenu = document.getElementById('avatar-links-menu');

// ���ͷ��/�ز˵�
if (avatarBtn) {
avatarBtn.addEventListener('click', (e) => {
e.stopPropagation();
	const willOpen = !avatarMenu.classList.contains('active');
	// 关闭其他菜单
	const settingsMenu = document.querySelector('.theme-settings-menu');
	const languageSelectorMenu = document.querySelector('.language-selector-menu');
	[settingsMenu, languageSelectorMenu].forEach(m => m && m.classList.remove('active'));
	avatarMenu.classList.toggle('active');
});
}

// ����˵���ز˵�
document.addEventListener('click', (e) => {
if (!e.target.closest('#avatar-btn') && !e.target.closest('#avatar-links-menu') && !e.target.closest('.theme-settings-container') && !e.target.closest('.language-selector-container')) {
avatarMenu.classList.remove('active');
}
});
});
