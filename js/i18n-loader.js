// 兼容性包装器：从模块导入 loadLocale/getCachedLocale 并暴露在 window 上
(async function () {
    // 动态导入模块（支持旧的 script 引用）
    try {
        const mod = await import('./i18n.js');
        window.loadLocale = mod.loadLocale;
        window.getCachedLocale = mod.getCachedLocale;
    } catch (e) {
        console.error('Failed to load i18n module', e);
        // 提供简单回退
        window.loadLocale = async (lang) => ({ page: { title: '主页' }, footer: { version: '当前版本：<strong>2.0.2.6-20260117</strong>' } });
        window.getCachedLocale = (lang) => null;
    }
})();
