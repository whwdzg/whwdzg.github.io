/** URL 规整 / Clean URL helpers. */

/**
 * 把 `/foo/index.html`、`/foo.html` 统一成站内使用的无扩展名路径。
 * 保留根路径与尾斜杠，方便多入口 HTML 与 History 路由直链。
 */
export function stripHtmlExtension(pathname: string): string {
  let path = pathname;
  if (/\/index\.html$/i.test(path)) {
    path = path.replace(/\/index\.html$/i, '/');
  } else if (/\.html$/i.test(path)) {
    path = path.replace(/\.html$/i, '/');
  }
  if (!path.startsWith('/')) path = `/${path}`;
  if (path !== '/' && !path.endsWith('/')) path = `${path}/`;
  return path;
}

/** 返回需要写入地址栏的干净 URL；无需变化时返回 null。 */
export function cleanHtmlLocation(location: Pick<Location, 'pathname' | 'search' | 'hash'>): string | null {
  const cleanPath = stripHtmlExtension(location.pathname);
  if (cleanPath === location.pathname) return null;
  return `${cleanPath}${location.search}${location.hash}`;
}
