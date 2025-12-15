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

		const readmeLink = document.querySelector('nav a[href="README.md"] .label');
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
						span.textContent = translations.language.zhCN || '中文（简体）';
					} else if (radio.value === 'zh-TW') {
						span.textContent = translations.language.zhTW || '中文（繁體）';
					} else if (radio.value === 'en-US') {
						span.textContent = translations.language.enUS || 'English (US)';
					} else if (radio.value === 'ru-RU') {
						span.textContent = translations.language.ruRU || 'Русский';
					} else if (radio.value === 'fr-FR') {
						span.textContent = translations.language.frFR || 'Français';
					} else if (radio.value === 'de-DE') {
						span.textContent = translations.language.deDE || 'Deutsch';
					} else if (radio.value === 'ja-JP') {
						span.textContent = translations.language.jaJP || '日本語';
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
