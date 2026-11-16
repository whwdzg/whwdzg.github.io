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
  /** 首屏空闲时是否预取；项目详情页默认关闭，避免一次下载所有数据 */
  prefetch?: boolean;
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
    path: '/projects/modrinth/',
    title: 'Modrinth 项目 · 水鱼 Blog',
    shortTitle: '项目',
    description: '滄海水魚在 Modrinth 发布的六个数据包 / 模组项目，含下载量、版本与站内详情入口。',
    load: () => import('../pages/projects/ModrinthPage'),
  },
  {
    path: '/projects/better-crafting-recipes/',
    title: '更好的合成配方 · 水鱼 Blog',
    shortTitle: '更好的合成配方',
    description: '111 个新配方、150 个进度，支持工作台、切石机与熔炉；完整配方与进度树可视化。',
    prefetch: false,
    load: () => import('../pages/projects/CraftingProjectPage'),
  },
  {
    path: '/projects/better-enchantments/',
    title: '更好附魔 · 水鱼 Blog',
    shortTitle: '更好附魔',
    description: '让保护与耐久附魔覆盖马铠、狼铠和全部护甲，含附魔清单与新目标展示。',
    prefetch: false,
    load: () => import('../pages/projects/EnchantmentsProjectPage'),
  },
  {
    path: '/projects/better-mob-drop/',
    title: '更好的生物掉落 · 水鱼 Blog',
    shortTitle: '更好的生物掉落',
    description: '重写 18 种生物的战利品表，含掉落清单、抢夺 / 熔炼标记与击杀进度。',
    prefetch: false,
    load: () => import('../pages/projects/MobDropProjectPage'),
  },
  {
    path: '/projects/magical-dye/',
    title: '魔法染料 · 水鱼 Blog',
    shortTitle: '魔法染料',
    description: '2025 愚人节数据包：17 个染料转换配方，把粉末与矿物块变成任意颜色。',
    prefetch: false,
    load: () => import('../pages/projects/MagicalDyeProjectPage'),
  },
  {
    path: '/projects/only-survival-mode/',
    title: 'Only Survival Mode · 水鱼 Blog',
    shortTitle: 'Only Survival Mode',
    description: '只允许生存模式的极简数据包：每 tick 把全体玩家切回生存。',
    prefetch: false,
    load: () => import('../pages/projects/SimplePackPage'),
  },
  {
    path: '/projects/glowing-players/',
    title: 'Glowing Players · 水鱼 Blog',
    shortTitle: 'Glowing Players',
    description: '给全体玩家无限发光效果的极简数据包，适合 PVP、捉迷藏与服务器管理。',
    prefetch: false,
    load: () => import('../pages/projects/SimplePackPage'),
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
