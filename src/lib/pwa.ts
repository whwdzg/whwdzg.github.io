/**
 * Service Worker 注册 / PWA registration.
 *
 * 使用构建 ID 作为查询参数：每次部署都会得到新的脚本 URL，浏览器因此会安装
 * 新版本 SW，并在 activate 阶段清掉旧缓存。开发环境不注册，避免缓存干扰 HMR。
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  const register = () => {
    navigator.serviceWorker
      .register(`/sw.js?v=${encodeURIComponent(__BUILD_ID__)}`, { scope: '/' })
      .catch((error) => {
        console.warn('[pwa] Service Worker 注册失败：', error);
      });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari 的非标准属性
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
