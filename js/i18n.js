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
			footer: { version: '当前版本：<strong>2.0.2.5-20260106</strong>' }
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

export { loadLocale, getCachedLocale };
