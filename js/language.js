// 模块：语言切换 / Language switching and translation sync.
document.addEventListener('DOMContentLoaded', function () {
	try {
		console.debug('[language.js] init');
		const languageSelectorBtn = document.querySelector('.language-selector-btn');
	const languageSelectorMenu = document.querySelector('.language-selector-menu');
	const LANGUAGE_KEY = 'language';
		const FALLBACK_LOCALE = { page: { title: '主页', aboutTitle: '关于' }, header: {}, avatar: {}, sidebar: {}, buttons: {}, main: {}, aside: {}, footer: { version: '当前版本：<strong>2.0.2.5-20260106</strong>' }, theme: {}, language: {} };

		async function ensureI18nReady() {
			if (typeof loadLocale === 'function' && typeof getCachedLocale === 'function') return;
			if (window.__i18nReadyPromise) return window.__i18nReadyPromise;
			window.__i18nReadyPromise = import('./i18n.js')
				.then(mod => {
					window.loadLocale = mod.loadLocale;
					window.getCachedLocale = mod.getCachedLocale;
				})
				.catch(err => {
					console.warn('[language.js] init i18n fallback', err);
					window.loadLocale = async () => FALLBACK_LOCALE;
					window.getCachedLocale = () => null;
				});
			return window.__i18nReadyPromise;
		}

	function getLanguageRadios() {
		return document.querySelectorAll('input[name="language"]');
	}

	function setLanguage(lang) {
		document.documentElement.lang = lang;
		localStorage.setItem(LANGUAGE_KEY, lang);
		updateLanguageRadioState(lang);
		// 异步加载并应用翻译
		(async () => {
			try {
				await ensureI18nReady();
				const langData = await loadLocale(lang);
				if (langData) updatePageWithTranslations(langData);
			} catch (e) {
				console.warn('Failed to load locale', lang, e);
			}
		})();
		// notify other modules (e.g., lightbox) to re-apply labels
		document.dispatchEvent(new Event('languagechange'));
	}

	async function applyTranslations(lang) {
		// 使用新的按需加载器
		try {
			await ensureI18nReady();
			const langData = await loadLocale(lang);
			if (langData) updatePageWithTranslations(langData);
		} catch (e) {
			console.warn('applyTranslations failed', e);
		}
	}

	function updatePageWithTranslations(translations) {
		// 更新页面标题，根据当前页面选择对应标题
		if (translations.page) {
			const hasHomeSection = !!document.querySelector('#home');
			const hasAboutSection = !!document.querySelector('#about');
			let targetTitle = null;
			if (!hasHomeSection && hasAboutSection && translations.page.aboutTitle) {
				targetTitle = translations.page.aboutTitle;
			} else if (hasHomeSection && translations.page.title) {
				targetTitle = translations.page.title;
			}
			if (targetTitle) document.title = targetTitle;
		}
		
		// 更新头部链接和按钮
		// 仅更新文字节点，避免覆盖链接内的图标结构
		const homeLinkText = document.querySelector('.header-title a .title-text');
		if (homeLinkText) {
			homeLinkText.textContent = translations.header.homeLink;
		} else {
			const homeLink = document.querySelector('header a[href="index.html"]');
			if (homeLink) homeLink.textContent = translations.header.homeLink;
		}

		// 更新按钮 title 属性
		const searchBtn = document.querySelector('.header-search-btn');
		if (searchBtn) {
			searchBtn.title = translations.header.searchBtn;
			searchBtn.setAttribute('aria-label', translations.header.searchBtn);
		}

		// 更新头像菜单链接文本
		const avatarLinks = document.querySelectorAll('.avatar-link');
		avatarLinks.forEach(link => {
			const span = link.querySelector('span');
			if (span) {
				const href = link.getAttribute('href');
				if (href && href.includes('github.com')) {
					span.textContent = translations.avatar.github;
				} else if (href && href.includes('bilibili.com')) {
					span.textContent = translations.avatar.bilibili;
				}
			}
		});

		// 更新侧边栏文本
		const sidebarHome = document.querySelector('nav a[href="index.html"] .label');
		if (sidebarHome) sidebarHome.textContent = translations.sidebar.home;

		const sidebarAbout = document.querySelector('nav a[href="about.html"] .label');
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

		const readmeLink = document.querySelector('nav a[href="readme.html"] .label') || document.querySelector('nav a[href="README.md"] .label');
		if (readmeLink) readmeLink.textContent = translations.sidebar.readme;

		// 更新返回顶部按钮
		const scrollToTopBtn = document.querySelector('#scroll-to-top');
		if (scrollToTopBtn && translations.buttons) {
			scrollToTopBtn.title = translations.buttons.scrollToTop;
			scrollToTopBtn.setAttribute('aria-label', translations.buttons.scrollToTop);
		}

		// 更新主内容区
		const homeSection = document.querySelector('#home');
		if (homeSection) {
			const homeTitle = homeSection.querySelector('h2');
			const homeContent = homeSection.querySelector('p');
			if (homeTitle) homeTitle.textContent = translations.main.homeTitle;
			if (homeContent) homeContent.innerHTML = translations.main.homeContent;
		}

		// 更新 about 部分（仅在 about.html 中）
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
					noticeTitle.textContent = translations.aside.noticeTitle;
				}
				if (noticeContent) {
					noticeContent.innerHTML = translations.aside.noticeContent;
				}
			} else if (index === 1) {
				// 返回1.0主页卡片
				const legacyCardTitle = section.querySelector('h3');
				const legacyCardContent = section.querySelector('p');
				if (legacyCardTitle) {
					legacyCardTitle.textContent = translations.aside.legacyTitle;
				}
				if (legacyCardContent) {
					// 重新构建内容（需要保持原有的HTML结构）
					const legacyLinkText = translations.aside.legacyLink || translations.aside.legacyTitle || translations.sidebar.home1_0 || '返回1.0主页';
					let content = `<abbr title="1.3.12.2025.8.7-New_MusicPlayer">${translations.aside.versionLabel}</abbr>`;
					content += translations.aside.legacyStopped || '';
					content += `<br><a href="Legacy-1.0/index.html" title="返回1.0版本主页">${legacyLinkText}</a>`;
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

		// 更新语言选择菜单（使用通用映射：radio.value -> translations.language.<key>）
		const languageSelectorMenu = document.querySelector('.language-selector-menu');
		if (languageSelectorMenu) {
			const languageLabels = languageSelectorMenu.querySelectorAll('label.language-option');
			function mapRadioValueToLangKey(value) {
				// 简单规则：'xx-yy' -> 'xxYY'，'xx' -> 'xx'
				if (!value) return null;
				const parts = value.split('-');
				if (parts.length === 1) return parts[0];
				const prefix = parts[0].toLowerCase();
				const suffix = parts.slice(1).join('-');
				// 将后段首字母大写，其余保持原状（例如 en-GB -> enGB, zh-CN -> zhCN）
				const camel = suffix.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
				return prefix + camel;
			}
			const defaultLabelMap = {
				'zh-CN': '中文（简体）',
				'zh-TW': '中文（繁体）',
				'en-US': 'English (US)',
				'ru-RU': 'Русский',
				'fr-FR': 'Français',
				'de-DE': 'Deutsch',
				'ja-JP': '日本語'
			};
			languageLabels.forEach(label => {
				const radio = label.querySelector('input[type="radio"]');
				const span = label.querySelector('span');
				if (radio && span) {
					const key = mapRadioValueToLangKey(radio.value);
					if (key && translations.language && translations.language[key]) {
						span.textContent = translations.language[key];
					} else {
						span.textContent = defaultLabelMap[radio.value] || radio.value || '';
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

		// 更新搜索框
		const searchInput = document.querySelector('#header-search-overlay .search-input');
		const searchSubmit = document.querySelector('#header-search-overlay .search-submit');
		if (searchInput && translations.search) {
			searchInput.placeholder = translations.search.placeholder;
			searchInput.setAttribute('aria-label', translations.search.ariaLabel);
		}
		if (searchSubmit && translations.search) {
			searchSubmit.textContent = translations.search.button;

		// 更新搜索结果中的图片标签
		if (translations.search && translations.search.imageTag) {
			const imageTags = document.querySelectorAll('#header-search-overlay .result-tag');
			imageTags.forEach(tag => {
				tag.textContent = translations.search.imageTag;
			});
		}
		}

		// 更新图片放大遮罩的辅助文本
		const lightboxStrings = translations.lightbox;
		if (lightboxStrings) {
			const closeBtn = document.querySelector('#image-lightbox .lightbox-close');
			const zoomInBtn = document.querySelector('#image-lightbox .lightbox-zoom-in');
			const zoomOutBtn = document.querySelector('#image-lightbox .lightbox-zoom-out');
			const prevBtn = document.querySelector('#image-lightbox .lightbox-prev');
			const nextBtn = document.querySelector('#image-lightbox .lightbox-next');
			const fullscreenBtn = document.querySelector('#image-lightbox .lightbox-fullscreen');
			if (closeBtn) { closeBtn.setAttribute('aria-label', lightboxStrings.close); closeBtn.setAttribute('title', lightboxStrings.close); }
			if (zoomInBtn) zoomInBtn.setAttribute('aria-label', lightboxStrings.zoomIn);
			if (zoomOutBtn) zoomOutBtn.setAttribute('aria-label', lightboxStrings.zoomOut);
			if (prevBtn && lightboxStrings.prev) { prevBtn.setAttribute('aria-label', lightboxStrings.prev); prevBtn.setAttribute('title', lightboxStrings.prev); }
			if (nextBtn && lightboxStrings.next) { nextBtn.setAttribute('aria-label', lightboxStrings.next); nextBtn.setAttribute('title', lightboxStrings.next); }
			if (fullscreenBtn && lightboxStrings.fullscreen) { fullscreenBtn.setAttribute('aria-label', lightboxStrings.fullscreen); fullscreenBtn.setAttribute('title', lightboxStrings.fullscreen); }
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
			if (!languageSelectorMenu) return; // defensive
			console.debug('[language.js] language button clicked');
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
			if (languageSelectorMenu) languageSelectorMenu.classList.remove('active');
		}
	});

	// 菜单选项处理 - 使用label的click事件
	const languageLabels = document.querySelectorAll('label.language-option');
	
	languageLabels.forEach(label => {
		label.addEventListener('click', function(e) {
			const radio = this.querySelector('input[name="language"]');
			if (radio) {
				setLanguage(radio.value);
				if (languageSelectorMenu) languageSelectorMenu.classList.remove('active');
				// 选择后关闭其他菜单以避免重叠
				const settingsMenu = document.querySelector('.theme-settings-menu');
				const avatarMenu = document.getElementById('avatar-links-menu');
				[settingsMenu, avatarMenu].forEach(m => m && m.classList.remove('active'));
			}
		});
	});

	// 当 SPA 完成页面切换后，重新对新注入的内容应用当前语言
	window.addEventListener('spa:page:loaded', () => {
		const current = localStorage.getItem(LANGUAGE_KEY) || document.documentElement.lang || 'zh-CN';
		applyTranslations(current);
	});

	} catch (err) {
		console.error('[language.js] init error', err);
	}
});
