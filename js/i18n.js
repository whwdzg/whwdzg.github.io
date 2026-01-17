// i18n loader module
// 提供按需加载 `js/i18n/<lang>.json` 的简单工具，并在内存中缓存结果。
const localeCache = new Map();

function normalizeLang(lang) {
	if (!lang) return 'zh-CN';
	lang = String(lang).replace('_', '-');
	const map = {
		'zh': 'zh-CN',
		'zh-cn': 'zh-CN',
		'zh-tw': 'zh-TW',
		'en': 'en-US',
		'en-us': 'en-US',
		'ru': 'ru-RU',
		'fr': 'fr-FR',
		'de': 'de-DE',
		'ja': 'ja-JP'
	};
	const key = lang.toLowerCase();
	return map[key] || lang;
}

async function loadLocale(lang) {
	lang = normalizeLang(lang);
	if (localeCache.has(lang)) return localeCache.get(lang);
	const path = `js/i18n/${lang}.json`;
	try {
		const res = await fetch(path, { cache: 'no-cache' });
		if (!res.ok) throw new Error(`Failed to load ${path}`);
		const json = await res.json();
		localeCache.set(lang, json);
		// keep a global translations map for consumers that rely on window.__translations
		window.__translations = window.__translations || {};
		window.__translations[lang] = json;
		return json;
	} catch (e) {
		console.warn('i18n load failed for', lang, e);
		if (lang !== 'zh-CN') return loadLocale('zh-CN');
		const fallback = {
			page: { title: '主页', aboutTitle: '关于', description: "whwdzg's personal page" },
			footer: { version: '当前版本：<strong>2.0.2.6-20260117</strong>' }
		};
		localeCache.set('zh-CN', fallback);
		window.__translations = window.__translations || {};
		window.__translations['zh-CN'] = fallback;
		return fallback;
	}
}

function getCachedLocale(lang) {
	lang = normalizeLang(lang);
	return localeCache.get(lang) || null;
}


/**
 * 遍历页面所有可翻译元素并用当前语言包内容替换
 * 依赖页面已加载、window.loadLocale、window.getCachedLocale、window.__translations
 * 可在页面切换语言后调用
 */
async function translatePage(lang) {
	lang = normalizeLang(lang);
	let translations = getCachedLocale(lang);
	if (!translations) {
		translations = await loadLocale(lang);
	}
	if (!translations) return;

	// 标题
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

	// header
	const homeLinkText = document.querySelector('.header-title a .title-text');
	if (homeLinkText && translations.header?.homeLink) homeLinkText.textContent = translations.header.homeLink;
	const searchBtn = document.querySelector('.header-search-btn');
	if (searchBtn && translations.header?.searchBtn) {
		searchBtn.title = translations.header.searchBtn;
		searchBtn.setAttribute('aria-label', translations.header.searchBtn);
	}
	const themeToggleBtn = document.querySelector('.theme-toggle-btn');
	if (themeToggleBtn && translations.header?.themeToggleBtn) {
		themeToggleBtn.title = translations.header.themeToggleBtn;
		themeToggleBtn.setAttribute('aria-label', translations.header.themeToggleBtn);
	}
	const themeSettingsBtn = document.querySelector('.theme-settings-btn');
	if (themeSettingsBtn && translations.header?.themeSettingsBtn) {
		themeSettingsBtn.title = translations.header.themeSettingsBtn;
		themeSettingsBtn.setAttribute('aria-label', translations.header.themeSettingsBtn);
	}
	const languageSelectorBtn = document.querySelector('.language-selector-btn');
	if (languageSelectorBtn && translations.header?.languageSelectorBtn) {
		languageSelectorBtn.title = translations.header.languageSelectorBtn;
		languageSelectorBtn.setAttribute('aria-label', translations.header.languageSelectorBtn);
	}

	// 头像菜单
	const avatarLinks = document.querySelectorAll('.avatar-link');
	avatarLinks.forEach(link => {
		const span = link.querySelector('span');
		if (span) {
			const href = link.getAttribute('href');
			if (href && href.includes('github.com') && translations.avatar?.github) {
				span.textContent = translations.avatar.github;
			} else if (href && href.includes('bilibili.com') && translations.avatar?.bilibili) {
				span.textContent = translations.avatar.bilibili;
			}
		}
	});


	// sidebar 全量自动映射
	if (translations.sidebar) {
		const sidebarMap = {
			home: 'a[href="/"],a[href="index.html"]',
			about: 'a[href="/about.html"]',
			legacy: 'button.toggle .toggle-label',
			home1_0: 'a[href="/Legacy-1.0/index.html"]',
			about1_0: 'a[href="/Legacy-1.0/about.html"]',
			readme1_0: 'a[href="/Legacy-1.0/README.md"]',
			readme: 'a[href="/readme.html"],a[href="/README.md"]',
			column: 'button.toggle + ul.submenu a[href*="column"]',
			gallery: 'a[href*="psn-img-legacy"]',
			comments: 'a[href*="comments"]',
			videoArchive: 'button.toggle + ul.submenu a[href*="video-archive"]',
			bilibili: 'a[href*="bili"]',
			collapseBtn: '.sidebar-collapse-btn'
		};
		for (const key in sidebarMap) {
			const selector = sidebarMap[key];
			if (!selector) continue;
			const nodes = document.querySelectorAll('nav ' + selector + ' .label, nav ' + selector + ', ' + selector);
			nodes.forEach(node => {
				if (translations.sidebar[key]) {
					if (node.classList.contains('label') || node.tagName === 'SPAN' || node.tagName === 'BUTTON') {
						node.textContent = translations.sidebar[key];
					} else if (key === 'collapseBtn') {
						node.title = translations.sidebar[key];
					}
				}
			});
		}
	}

	// 返回顶部按钮
	const scrollToTopBtn = document.querySelector('#scroll-to-top');
	if (scrollToTopBtn && translations.buttons?.scrollToTop) {
		scrollToTopBtn.title = translations.buttons.scrollToTop;
		scrollToTopBtn.setAttribute('aria-label', translations.buttons.scrollToTop);
	}

	// 主内容区
	const homeSection = document.querySelector('#home');
	if (homeSection && translations.main) {
		const homeTitle = homeSection.querySelector('h2');
		const homeContent = homeSection.querySelector('p');
		if (homeTitle && translations.main.homeTitle) homeTitle.textContent = translations.main.homeTitle;
		if (homeContent && translations.main.homeContent) homeContent.innerHTML = translations.main.homeContent;
	}
	const aboutSection = document.querySelector('#about');
	if (aboutSection && translations.main) {
		const aboutTitle = aboutSection.querySelector('h2');
		const aboutContent = aboutSection.querySelector('p');
		if (aboutTitle && translations.main.aboutTitle) aboutTitle.textContent = translations.main.aboutTitle;
		if (aboutContent && translations.main.aboutContent) aboutContent.innerHTML = translations.main.aboutContent;
	}
	const testSection = document.querySelector('#test');
	if (testSection && translations.main?.testTitle) {
		const testTitle = testSection.querySelector('h2');
		if (testTitle) testTitle.textContent = translations.main.testTitle;
	}

	// aside 全量自动映射
	if (translations.aside) {
		const asideSections = document.querySelectorAll('aside section');
		asideSections.forEach(section => {
			const id = section.id || '';
			// shell beta/archives
			if (id === 'beta' && translations.aside.shell?.betaTitle) {
				const h3 = section.querySelector('h3');
				const p = section.querySelector('p');
				if (h3) h3.textContent = translations.aside.shell.betaTitle;
				if (p) p.innerHTML = translations.aside.shell.betaContent;
			} else if (id === 'archives' && translations.aside.shell?.archivesTitle) {
				const h3 = section.querySelector('h3');
				const p = section.querySelector('p');
				if (h3) h3.textContent = translations.aside.shell.archivesTitle;
				if (p) {
					let content = '';
					if (translations.aside.shell.archivesDesc) content += translations.aside.shell.archivesDesc;
					if (translations.aside.shell.archivesLink) content += `<br><a href="/Legacy-1.0/index.html">${translations.aside.shell.archivesLink}</a>`;
					p.innerHTML = content;
				}
			} else {
				// 兼容原有 notice/legacy
				const h3 = section.querySelector('h3');
				const p = section.querySelector('p');
				if (h3 && translations.aside.noticeTitle) h3.textContent = translations.aside.noticeTitle;
				if (p && translations.aside.noticeContent) p.innerHTML = translations.aside.noticeContent;
			}
		});
	}

	// footer
	const footer = document.querySelector('footer');
	if (footer && translations.footer) {
		const copyrightP = footer.querySelector('p:first-child');
		const versionP = footer.querySelector('p:last-child');
		if (copyrightP && translations.footer.copyright) copyrightP.innerHTML = translations.footer.copyright + (translations.footer.allRights ? ' ' + translations.footer.allRights : '');
		if (versionP && translations.footer.version) versionP.innerHTML = translations.footer.version;
	}

	// 主题设置菜单
	const themeSettingsMenu = document.querySelector('.theme-settings-menu');
	if (themeSettingsMenu && translations.theme) {
		const themeLabels = themeSettingsMenu.querySelectorAll('label.settings-option');
		themeLabels.forEach(label => {
			const radio = label.querySelector('input[type="radio"]');
			const span = label.querySelector('span');
			if (radio && span) {
				if (radio.value === 'follow' && translations.theme.followSystem) {
					span.textContent = translations.theme.followSystem;
				} else if (radio.value === 'manual' && translations.theme.manual) {
					span.textContent = translations.theme.manual;
				}
			}
		});
	}

	// 语言选择菜单
	const languageSelectorMenu = document.querySelector('.language-selector-menu');
	if (languageSelectorMenu && translations.language) {
		const languageLabels = languageSelectorMenu.querySelectorAll('label.language-option');
		function mapRadioValueToLangKey(value) {
			if (!value) return null;
			const parts = value.split('-');
			if (parts.length === 1) return parts[0];
			const prefix = parts[0].toLowerCase();
			const suffix = parts.slice(1).join('-');
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
				if (key && translations.language[key]) {
					span.textContent = translations.language[key];
				} else {
					span.textContent = defaultLabelMap[radio.value] || radio.value || '';
				}
			}
		});
	}

	// 搜索框
	const searchInput = document.querySelector('#header-search-overlay .search-input');
	const searchSubmit = document.querySelector('#header-search-overlay .search-submit');
	if (searchInput && translations.search) {
		searchInput.placeholder = translations.search.placeholder;
		searchInput.setAttribute('aria-label', translations.search.ariaLabel);
	}
	if (searchSubmit && translations.search) {
		searchSubmit.textContent = translations.search.button;
		if (translations.search.imageTag) {
			const imageTags = document.querySelectorAll('#header-search-overlay .result-tag');
			imageTags.forEach(tag => {
				tag.textContent = translations.search.imageTag;
			});
		}
	}

	// 图片放大遮罩
	const lightboxStrings = translations.lightbox;
	if (lightboxStrings) {
		const closeBtn = document.querySelector('#image-lightbox .lightbox-close');
		const zoomInBtn = document.querySelector('#image-lightbox .lightbox-zoom-in');
		const zoomOutBtn = document.querySelector('#image-lightbox .lightbox-zoom-out');
		const prevBtn = document.querySelector('#image-lightbox .lightbox-prev');
		const nextBtn = document.querySelector('#image-lightbox .lightbox-next');
		const fullscreenBtn = document.querySelector('#image-lightbox .lightbox-fullscreen');
		if (closeBtn && lightboxStrings.close) { closeBtn.setAttribute('aria-label', lightboxStrings.close); closeBtn.setAttribute('title', lightboxStrings.close); }
		if (zoomInBtn && lightboxStrings.zoomIn) zoomInBtn.setAttribute('aria-label', lightboxStrings.zoomIn);
		if (zoomOutBtn && lightboxStrings.zoomOut) zoomOutBtn.setAttribute('aria-label', lightboxStrings.zoomOut);
		if (prevBtn && lightboxStrings.prev) { prevBtn.setAttribute('aria-label', lightboxStrings.prev); prevBtn.setAttribute('title', lightboxStrings.prev); }
		if (nextBtn && lightboxStrings.next) { nextBtn.setAttribute('aria-label', lightboxStrings.next); nextBtn.setAttribute('title', lightboxStrings.next); }
		if (fullscreenBtn && lightboxStrings.fullscreen) { fullscreenBtn.setAttribute('aria-label', lightboxStrings.fullscreen); fullscreenBtn.setAttribute('title', lightboxStrings.fullscreen); }
	}
}

export { loadLocale, getCachedLocale, translatePage };
