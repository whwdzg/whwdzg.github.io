/**
 * 路由元信息 / Route metadata and lazy page loaders.
 *
 * 页面用 React.lazy 拆成独立 chunk；Header 的 hover / focus 预取与 App 的
 * 空闲预取都复用这里的 loader，Rollup 会自动去重。
 */
export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  /** 用于 <title> 的后缀 */
  shortTitle: string;
  load: () => Promise<{ default: React.ComponentType }>;
}

export const ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: '滄海水魚 · 水鱼 Blog',
    shortTitle: '主页',
    description: '滄海水魚的个人角落：Minecraft 数据包、哔哩哔哩影像归档、留言板与持续重构的前端实验。',
    load: () => import('../pages/HomePage'),
  },
  {
    path: '/bilibili/',
    title: '哔哩哔哩影像存档 · 水鱼 Blog',
    shortTitle: '哔哩哔哩',
    description: '滄海水魚在哔哩哔哩发布的 43 条影像归档，支持搜索、筛选、网格 / 列表视图。',
    load: () => import('../pages/BilibiliPage'),
  },
  {
    path: '/comments/',
    title: '留言板 · 水鱼 Blog',
    shortTitle: '留言板',
    description: '静态站的留言板：留言摘录、写作入口与 B 站私信方式。',
    load: () => import('../pages/CommentsPage'),
  },
  {
    path: '/comments/github/',
    title: 'GitHub 评论区 · 水鱼 Blog',
    shortTitle: 'GitHub 评论',
    description: '由 GitHub Issue 驱动的评论区：头像、正文、回复、标签与 reactions 都来自公开仓库。',
    load: () => import('../pages/GitHubCommentsPage'),
  },
  {
    path: '/about/',
    title: '关于本站 · 水鱼 Blog',
    shortTitle: '关于',
    description: '站点版本、最近提交时间、技术栈、性能策略与许可说明。',
    load: () => import('../pages/AboutPage'),
  },
];

export const ROUTE_MAP = new Map(ROUTES.map((route) => [route.path, route]));

export function routeMeta(path: string): RouteMeta | undefined {
  return ROUTE_MAP.get(path);
}

export function prefetchRoute(path: string): void {
  void ROUTE_MAP.get(path)?.load();
}
