// 翻译数据 - 直接在JavaScript中定义，避免fetch问题
const translations = {
	'zh-CN': {
		page: {
			title: "主页",
			description: "whwdzg's personal page"
		},
		header: {
			homeLink: "主页",
			searchBtn: "搜索",
			themeToggleBtn: "切换深色/浅色模式",
			themeSettingsBtn: "主题设置",
			languageSelectorBtn: "选择语言",
			avatarAlt: "头像"
		},
		avatar: {
			github: "GitHub",
			bilibili: "bilibili"
		},
		theme: {
			followSystem: "跟随系统",
			manual: "手动设置"
		},
		language: {
			zhCN: "中文（简体）",
			enUS: "English (US)"
		},
			zhTW: "中文（繁體）",
		sidebar: {
			home: "主页",
			about: "关于",
			legacy: "返回 1.0",
			home1_0: "主页（1.0）",
			about1_0: "关于（1.0）",
			readme1_0: "README（1.0）",
			readme: "README",
			collapseBtn: "折叠/展开侧边栏"
		},
		search: {
			placeholder: "搜索内容",
			button: "搜索",
			ariaLabel: "开始搜索",
			noResults: "未找到相关内容",
			resultCount: "找到 {count} 个结果",
			imageTag: "[图片]"
		},
		main: {
			homeTitle: "主页",
			homeContent: "这里是2.0版本的主页，当前正在构建中，尚处于<strong>极早期阶段</strong>，供实验学习使用",
			aboutTitle: "关于",
			aboutContent: "这里是2.0版本的主页，当前正在构建中，尚处于<strong>极早期阶段</strong>",
			testTitle: "test"
		},
		aside: {
			noticeTitle: "注意",
			noticeContent: "<strong>当前为早期测试版本，可能出现bug</strong>",
			legacyTitle: "返回1.0主页",
			versionLabel: "1.0版本",
			legacyLink: "返回1.0主页",
			legacyStopped: "已终止更新"
		},
		footer: {
			copyright: "&copy; 2022-2025 whwdzg. 保留所有权利。",
			version: "当前版本：<strong>2.0.2.1-20251216</strong>"
		},
		settings: {
			title: "设置",
			lightdark: { title: "浅色/深色模式切换", subtitle: "切换浅色模式/深色模式的行为", follow: "跟随系统", manual: "手动设置" },
			color: { title: "切换主题色", subtitle: "选择主题色标" },
			pageProgress: { title: "页面进度条", subtitle: "在页眉底部显示当前页面滚动进度", off: "关闭", on: "开启" }
		},
		buttons: {
			scrollToTop: "返回顶部"
		},
		lightbox: {
			close: "关闭图片",
			zoomIn: "放大",
			zoomOut: "缩小",
			download: "下载图片",
			locate: "定位到原文",
			zoomInputPlaceholder: "60-250%",
			zoomInputLabel: "缩放百分比"
		}
	},
	'zh-TW': {
		page: { title: "主頁", description: "whwdzg's personal page" },
		header: {
			homeLink: "主頁", searchBtn: "搜尋", themeToggleBtn: "切換深色/淺色模式", themeSettingsBtn: "主題設定", languageSelectorBtn: "選擇語言", avatarAlt: "頭像"
		},
		avatar: { github: "GitHub", bilibili: "bilibili" },
		theme: { followSystem: "跟隨系統", manual: "手動設定" },
			language: { zhCN: "中文（簡體）", zhTW: "中文（繁體）", enUS: "English (US)" },
		sidebar: { home: "主頁", about: "關於", legacy: "返回 1.0", home1_0: "主頁（1.0）", about1_0: "關於（1.0）", readme1_0: "README（1.0）", readme: "README", collapseBtn: "收合/展開側邊欄" },
		search: { placeholder: "搜尋內容", button: "搜尋", ariaLabel: "開始搜尋", noResults: "未找到相關內容", resultCount: "找到 {count} 個結果", imageTag: "[圖片]" },
		main: { homeTitle: "主頁", homeContent: "這裡是 2.0 版本的主頁，當前正在構建中，尚處於<strong>極早期階段</strong>，供實驗學習使用", aboutTitle: "關於", aboutContent: "這裡是 2.0 版本的主頁，當前正在構建中，尚處於<strong>極早期階段</strong>", testTitle: "test" },
		aside: { noticeTitle: "注意", noticeContent: "<strong>目前為早期測試版本，可能出現 bug</strong>", legacyTitle: "返回 1.0 主頁", versionLabel: "1.0 版本", legacyLink: "返回 1.0 主頁", legacyStopped: "已終止更新" },
		footer: { copyright: "&copy; 2022-2025 whwdzg. 保留所有權利。", version: "當前版本：<strong>2.0.2.1-20251216</strong>" },
		settings: {
			title: "設定",
			lightdark: { title: "淺色/深色模式切換", subtitle: "切換淺色/深色模式的行為", follow: "跟隨系統", manual: "手動設定" },
			color: { title: "切換主題色", subtitle: "選擇主題色標" },
			pageProgress: { title: "頁面進度條", subtitle: "在頁眉底部顯示滾動進度", off: "關閉", on: "開啟" }
		},
		buttons: { scrollToTop: "返回頂部" },
		lightbox: { close: "關閉圖片", zoomIn: "放大", zoomOut: "縮小", download: "下載圖片", locate: "定位到原文", zoomInputPlaceholder: "60-250%", zoomInputLabel: "縮放百分比" }
	},
	'ru-RU': {
		page: { title: "Главная", description: "whwdzg's personal page" },
		header: { homeLink: "Главная", searchBtn: "Поиск", themeToggleBtn: "Переключить тёмную/светлую тему", themeSettingsBtn: "Настройки темы", languageSelectorBtn: "Выбор языка", avatarAlt: "Аватар" },
		avatar: { github: "GitHub", bilibili: "bilibili" },
		theme: { followSystem: "Следовать системе", manual: "Ручные настройки" },
			language: { zhCN: "中文（简体）", zhTW: "中文（繁體）", enUS: "English (US)", ruRU: "Русский" },
		sidebar: { home: "Главная", about: "О сайте", legacy: "Назад к 1.0", home1_0: "Главная (1.0)", about1_0: "О сайте (1.0)", readme1_0: "README (1.0)", readme: "README", collapseBtn: "Свернуть/развернуть боковую панель" },
		search: { placeholder: "Поисковый запрос", button: "Искать", ariaLabel: "Начать поиск", noResults: "Ничего не найдено", resultCount: "Найдено результатов: {count}", imageTag: "[Изображение]" },
		main: { homeTitle: "Главная", homeContent: "Это главная страница версии 2.0, сейчас в разработке и на <strong>самой ранней стадии</strong>, для учебных целей", aboutTitle: "О сайте", aboutContent: "Это главная страница версии 2.0, сейчас в разработке и на <strong>самой ранней стадии</strong>", testTitle: "test" },
		aside: { noticeTitle: "Примечание", noticeContent: "<strong>Ранняя тестовая версия, возможны ошибки</strong>", legacyTitle: "Вернуться на главную 1.0", versionLabel: "Версия 1.0", legacyLink: "К главной 1.0", legacyStopped: "Больше не обновляется" },
		footer: { copyright: "&copy; 2022-2025 whwdzg. Все права защищены.", version: "Текущая версия: <strong>2.0.2.1-20251216</strong>" },
		settings: {
			title: "Настройки",
			lightdark: { title: "Переключение светлой/тёмной темы", subtitle: "Как переключать светлую/тёмную тему", follow: "Следовать системе", manual: "Ручные настройки" },
			color: { title: "Выбор цвета темы", subtitle: "Выберите основной цвет" },
			pageProgress: { title: "Индикатор прогресса", subtitle: "Показывать прогресс прокрутки под шапкой", off: "Выкл", on: "Вкл" }
		},
		buttons: { scrollToTop: "Наверх" },
		lightbox: { close: "Закрыть изображение", zoomIn: "Увеличить", zoomOut: "Уменьшить", download: "Скачать изображение", locate: "Найти в документе", zoomInputPlaceholder: "60-250%", zoomInputLabel: "Процент масштабирования" }
	},
	'fr-FR': {
		page: { title: "Accueil", description: "whwdzg's personal page" },
		header: { homeLink: "Accueil", searchBtn: "Recherche", themeToggleBtn: "Basculer sombre/clair", themeSettingsBtn: "Paramètres du thème", languageSelectorBtn: "Choisir la langue", avatarAlt: "Avatar" },
		avatar: { github: "GitHub", bilibili: "bilibili" },
		theme: { followSystem: "Suivre le système", manual: "Réglages manuels" },
		language: { zhCN: "中文（简体）", zhTW: "中文（繁體）", enUS: "English (US)", ruRU: "Русский", frFR: "Français", deDE: "Deutsch", jaJP: "日本語" },
		sidebar: { home: "Accueil", about: "À propos", legacy: "Retour à 1.0", home1_0: "Accueil (1.0)", about1_0: "À propos (1.0)", readme1_0: "README (1.0)", readme: "README", collapseBtn: "Réduire/Agrandir la barre latérale" },
		search: { placeholder: "Contenu de recherche", button: "Rechercher", ariaLabel: "Commencer la recherche", noResults: "Aucun résultat", resultCount: "{count} résultats trouvés", imageTag: "[Image]" },
		main: { homeTitle: "Accueil", homeContent: "Ceci est la page d'accueil de la version 2.0, actuellement en construction et à un <strong>stade très précoce</strong>, pour l'apprentissage expérimental", aboutTitle: "À propos", aboutContent: "Ceci est la page d'accueil de la version 2.0, actuellement en construction et à un <strong>stade très précoce</strong>", testTitle: "test" },
		aside: { noticeTitle: "Remarque", noticeContent: "<strong>Version de test précoce, des bugs peuvent survenir</strong>", legacyTitle: "Retour à l'accueil 1.0", versionLabel: "Version 1.0", legacyLink: "Retour à l'accueil 1.0", legacyStopped: "Plus de mises à jour" },
		footer: { copyright: "&copy; 2022-2025 whwdzg. Tous droits réservés.", version: "Version actuelle : <strong>2.0.2.1-20251216</strong>" },
		settings: {
			title: "Paramètres",
			lightdark: { title: "Mode clair/sombre", subtitle: "Choisir le comportement clair/sombre", follow: "Suivre le système", manual: "Réglage manuel" },
			color: { title: "Couleur du thème", subtitle: "Choisir la couleur principale" },
			pageProgress: { title: "Barre de progression", subtitle: "Afficher la progression de défilement sous l'en-tête", off: "Désactivé", on: "Activé" }
		},
		buttons: { scrollToTop: "Haut de page" },
		lightbox: { close: "Fermer l'image", zoomIn: "Agrandir", zoomOut: "Réduire", download: "Télécharger l'image", locate: "Aller au texte", zoomInputPlaceholder: "60-250%", zoomInputLabel: "Pourcentage de zoom" }
	},
	'de-DE': {
		page: { title: "Startseite", description: "whwdzg's personal page" },
		header: { homeLink: "Startseite", searchBtn: "Suche", themeToggleBtn: "Dunkel/Hell umschalten", themeSettingsBtn: "Theme-Einstellungen", languageSelectorBtn: "Sprache wählen", avatarAlt: "Avatar" },
		avatar: { github: "GitHub", bilibili: "bilibili" },
		theme: { followSystem: "System folgen", manual: "Manuelle Einstellungen" },
		language: { zhCN: "中文（简体）", zhTW: "中文（繁體）", enUS: "English (US)", ruRU: "Русский", frFR: "Français", deDE: "Deutsch", jaJP: "日本語" },
		sidebar: { home: "Startseite", about: "Über", legacy: "Zurück zu 1.0", home1_0: "Startseite (1.0)", about1_0: "Über (1.0)", readme1_0: "README (1.0)", readme: "README", collapseBtn: "Seitenleiste ein-/ausblenden" },
		search: { placeholder: "Suchinhalt", button: "Suchen", ariaLabel: "Suche starten", noResults: "Keine Ergebnisse", resultCount: "{count} Ergebnisse gefunden", imageTag: "[Bild]" },
		main: { homeTitle: "Startseite", homeContent: "Dies ist die Startseite der Version 2.0, derzeit im Aufbau und in einer <strong>sehr frühen Phase</strong>, für Lernzwecke", aboutTitle: "Über", aboutContent: "Dies ist die Startseite der Version 2.0, derzeit im Aufbau und in einer <strong>sehr frühen Phase</strong>", testTitle: "test" },
		aside: { noticeTitle: "Hinweis", noticeContent: "<strong>Frühe Testversion, Fehler möglich</strong>", legacyTitle: "Zur 1.0-Startseite", versionLabel: "Version 1.0", legacyLink: "Zur 1.0-Startseite", legacyStopped: "Nicht mehr aktualisiert" },
		footer: { copyright: "&copy; 2022-2025 whwdzg. Alle Rechte vorbehalten.", version: "Aktuelle Version: <strong>2.0.2.1-20251216</strong>" },
		settings: {
			title: "Einstellungen",
			lightdark: { title: "Hell/Dunkel umschalten", subtitle: "Verhalten für hell/dunkel", follow: "System folgen", manual: "Manuell" },
			color: { title: "Themenfarbe wechseln", subtitle: "Wähle die Akzentfarbe" },
			pageProgress: { title: "Seitenfortschritt", subtitle: "Fortschritt unter der Kopfzeile anzeigen", off: "Aus", on: "An" }
		},
		buttons: { scrollToTop: "Nach oben" },
		lightbox: { close: "Bild schließen", zoomIn: "Vergrößern", zoomOut: "Verkleinern", download: "Bild herunterladen", locate: "Zum Text", zoomInputPlaceholder: "60-250%", zoomInputLabel: "Zoom-Prozentsatz" }
	},
	'ja-JP': {
		page: { title: "ホーム", description: "whwdzg's personal page" },
		header: { homeLink: "ホーム", searchBtn: "検索", themeToggleBtn: "ダーク/ライト切替", themeSettingsBtn: "テーマ設定", languageSelectorBtn: "言語を選択", avatarAlt: "アバター" },
		avatar: { github: "GitHub", bilibili: "bilibili" },
		theme: { followSystem: "システムに従う", manual: "手動設定" },
			language: { zhCN: "中文（简体）", zhTW: "中文（繁體）", enUS: "English (US)", ruRU: "Русский", jaJP: "日本語" },
		sidebar: { home: "ホーム", about: "概要", legacy: "1.0へ戻る", home1_0: "ホーム（1.0）", about1_0: "概要（1.0）", readme1_0: "README（1.0）", readme: "README", collapseBtn: "サイドバーを開閉" },
		search: { placeholder: "検索内容", button: "検索", ariaLabel: "検索開始", noResults: "該当なし", resultCount: "{count} 件の結果", imageTag: "[画像]" },
		main: { homeTitle: "ホーム", homeContent: "これは 2.0 バージョンのホームページです。現在構築中で、<strong>非常に初期段階</strong>のため、学習用です", aboutTitle: "概要", aboutContent: "これは 2.0 バージョンのホームページです。現在構築中で、<strong>非常に初期段階</strong>", testTitle: "test" },
		aside: { noticeTitle: "注意", noticeContent: "<strong>初期テスト版のため、不具合が発生する可能性があります</strong>", legacyTitle: "1.0 ホームへ戻る", versionLabel: "1.0 バージョン", legacyLink: "1.0 ホームへ戻る", legacyStopped: "更新停止" },
		footer: { copyright: "&copy; 2022-2025 whwdzg. All rights reserved.", version: "現在のバージョン：<strong>2.0.2.1-20251216</strong>" },
		settings: {
			title: "設定",
			lightdark: { title: "ライト/ダーク切替", subtitle: "ライト/ダーク切替の挙動", follow: "システムに従う", manual: "手動設定" },
			color: { title: "テーマカラー", subtitle: "アクセントカラーを選択" },
			pageProgress: { title: "ページ進捗バー", subtitle: "ヘッダー下にスクロール進捗を表示", off: "オフ", on: "オン" }
		},
		buttons: { scrollToTop: "トップへ" },
		lightbox: { close: "画像を閉じる", zoomIn: "拡大", zoomOut: "縮小", download: "画像をダウンロード", locate: "本文へ移動", zoomInputPlaceholder: "60-250%", zoomInputLabel: "拡大率" }
	},
	'en-US': {
		page: {
			title: "Home",
			description: "whwdzg's personal page"
		},
		header: {
			homeLink: "Home",
			searchBtn: "Search",
			themeToggleBtn: "Toggle dark/light mode",
			themeSettingsBtn: "Theme Settings",
			languageSelectorBtn: "Select Language",
			avatarAlt: "Avatar"
		},
		avatar: {
			github: "GitHub",
			bilibili: "bilibili"
		},
		theme: {
			followSystem: "Follow System",
			manual: "Manual Settings"
		},
		language: {
			zhCN: "中文（简体）",
			enUS: "English (US)"
		},
		sidebar: {
			home: "Home",
			about: "About",
			legacy: "Back to 1.0",
			home1_0: "Home (1.0)",
			about1_0: "About (1.0)",
			readme1_0: "README (1.0)",
			readme: "README",
			collapseBtn: "Collapse/Expand Sidebar"
		},
		search: {
			placeholder: "Search content",
			button: "Search",
			ariaLabel: "Start search",
			noResults: "No results found",
			resultCount: "Found {count} results",
			imageTag: "[Image]"
		},
		main: {
			homeTitle: "Home",
			homeContent: "This is the home page of version 2.0, currently under construction and in <strong>very early stages</strong>, for experimental learning purposes",
			aboutTitle: "About",
			aboutContent: "This is the home page of version 2.0, currently under construction and in <strong>very early stages</strong>",
			testTitle: "test"
		},
		aside: {
			noticeTitle: "Notice",
			noticeContent: "<strong>Current version is in early beta testing, bugs may occur</strong>",
			legacyTitle: "Back to 1.0 Home",
			versionLabel: "Version 1.0",
			legacyLink: "Back to 1.0 Home",
			legacyStopped: "No longer updated"
		},
		footer: {
			copyright: "&copy; 2022-2025 whwdzg. All rights reserved.",
			version: "Current version: <strong>2.0.2.1-20251216</strong>"
		},
		settings: {
			title: "Settings",
			lightdark: { title: "Light/Dark Mode", subtitle: "How to toggle light/dark", follow: "Follow system", manual: "Manual" },
			color: { title: "Theme Color", subtitle: "Choose your accent color" },
			pageProgress: { title: "Page Progress", subtitle: "Show scroll progress under header", off: "Off", on: "On" }
		},
		buttons: {
			scrollToTop: "Back to Top"
		},
		lightbox: {
			close: "Close image",
			zoomIn: "Zoom in",
			zoomOut: "Zoom out",
			download: "Download image",
			locate: "Locate in document",
			zoomInputPlaceholder: "60-250%",
			zoomInputLabel: "Zoom percentage"
		}
	}
};
