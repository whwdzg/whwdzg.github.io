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
    title: '沧海水鱼 · 水鱼 Blog',
    shortTitle: '主页',
    description: '沧海水鱼的个人角落：Minecraft 数据包、哔哩哔哩影像归档、留言板与持续重构的前端实验。',
    load: () => import('../pages/HomePage'),
  },
  {
    path: '/bilibili/',
    title: '哔哩哔哩影像存档 · 水鱼 Blog',
    shortTitle: '哔哩哔哩',
    description: '沧海水鱼在哔哩哔哩发布的 249 条影像归档，支持搜索、筛选、网格 / 列表视图。',
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
    description: '沧海水鱼在 Modrinth 发布的六个数据包 / 模组项目，含下载量、版本与站内详情入口。',
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
    path: '/tools/mc-datapack/',
    title: 'MC 数据包解析 · 水鱼 Blog',
    shortTitle: '数据包解析',
    description: '解析 Minecraft 数据包 pack.mcmeta，查看支持版本与进度、配方、战利品表等内容。',
    prefetch: false,
    load: () => import('../pages/tools/DataPackPage'),
  },
  {
    path: '/tools/mc-resourcepack/',
    title: 'MC 资源包解析 · 水鱼 Blog',
    shortTitle: '资源包解析',
    description: '解析 Minecraft 资源包，查看支持版本、图标、命名空间与纹理、模型、语言等内容。',
    prefetch: false,
    load: () => import('../pages/tools/ResourcePackPage'),
  },
  {
    path: '/projects/asteria-player/',
    title: 'Asteria Player · 水鱼 Blog',
    shortTitle: 'Asteria Player',
    description: 'Fluent 音乐 / 视频播放器子站：逐字歌词、字幕、弹幕、移动端手势与 PWA。',
    prefetch: false,
    load: () => import('../pages/projects/AsteriaPlayerPage'),
  },
  {
    path: '/projects/life-simulation-wiki/',
    title: '来福 Simulation Wiki · 水鱼 Blog',
    shortTitle: 'Simulation Wiki',
    description: '来福 Simulation Wiki 全量静态镜像：451 个页面、195 个媒体文件、离线浏览与全文搜索。',
    prefetch: false,
    load: () => import('../pages/projects/LifeSimulationWikiPage'),
  },
  {
    path: '/projects/github/',
    title: 'GitHub 项目 · 水鱼 Blog',
    shortTitle: 'GitHub 项目',
    description: 'Asteria Player 与来福 Simulation Wiki 的详细项目页，以及其他仓库入口。',
    prefetch: false,
    load: () => import('../pages/projects/GitHubProjectsPage'),
  },
  {
    path: '/tools/',
    title: '站内工具 · 水鱼 Blog',
    shortTitle: '工具',
    description: 'Base64、BaseX、进制转换、Unicode、科学计算器与 Minecraft 投影查看器。',
    prefetch: false,
    load: () => import('../pages/tools/ToolsPage'),
  },
  {
    path: '/tools/base64/',
    title: 'Base64 编解码 · 水鱼 Blog',
    shortTitle: 'Base64',
    description: 'Unicode 文本与 Base64 / URL-safe Base64 互转。',
    prefetch: false,
    load: () => import('../pages/tools/Base64Page'),
  },
  {
    path: '/tools/basex/',
    title: 'BaseX 编解码 · 水鱼 Blog',
    shortTitle: 'BaseX',
    description: 'Base16 / Base32 / Base58 / Base64 / Base85 / Base91 与 UTF-8 文本互转。',
    prefetch: false,
    load: () => import('../pages/tools/BaseXPage'),
  },
  {
    path: '/tools/base-convert/',
    title: '进制转换 · 水鱼 Blog',
    shortTitle: '进制转换',
    description: '在 2–36 进制之间转换整数，查看常用进制结果。',
    prefetch: false,
    load: () => import('../pages/tools/BaseConvertPage'),
  },
  {
    path: '/tools/unicode/',
    title: 'Unicode 转换 · 水鱼 Blog',
    shortTitle: 'Unicode',
    description: '文本与 \\uXXXX / U+XXXX / HTML 实体互转，并查看码点表。',
    prefetch: false,
    load: () => import('../pages/tools/UnicodePage'),
  },
  {
    path: '/tools/calculator/',
    title: '科学计算器 · 水鱼 Blog',
    shortTitle: '计算器',
    description: '10 种模式的科学计算器，支持函数图像与 LaTeX 公式导入导出。',
    prefetch: false,
    load: () => import('../pages/tools/CalculatorPage'),
  },
  {
    path: '/tools/mc-projection/',
    title: 'MC 投影查看器 · 水鱼 Blog',
    shortTitle: 'MC 投影',
    description: '导入 litematic / schematic，查看带模型、朝向与不完整方块的 3D 投影。',
    prefetch: false,
    load: () => import('../pages/tools/ProjectionPage'),
  },
  {
    path: '/projects/occultation/',
    title: '掩星 · 水鱼 Blog',
    shortTitle: '掩星',
    description: '掩星：一个仍在设计中的世界观。尘埃尚未落定，时间仍在谱写。',
    prefetch: false,
    load: () => import('../pages/projects/OccultationPage'),
  },
  {
    path: '/user/hxhej/',
    title: 'hxhej · 用户 · 水鱼 Blog',
    shortTitle: 'hxhej',
    description: 'hxhej 的站内用户页：留言板参与者、站外链接与公开资料简述。',
    load: () => import('../pages/UserPage'),
  },
  {
    path: '/user/canghaishuiyu/',
    title: '沧海水鱼 · 用户 · 水鱼 Blog',
    shortTitle: '沧海水鱼',
    description: '沧海水鱼的站内用户页：Minecraft 数据包作者、B 站创作者与公开资料简述。',
    load: () => import('../pages/UserPage'),
  },
  {
    path: '/user/滄海水魚/',
    title: '沧海水鱼 · 用户 · 水鱼 Blog',
    shortTitle: '沧海水鱼',
    description: '沧海水鱼的站内用户页（2.0 旧地址兼容）。',
    load: () => import('../pages/UserPage'),
  },
  {
    path: '/columns/',
    title: '专栏 · 水鱼 Blog',
    shortTitle: '专栏',
    description: '沧海水鱼的长文与记录：B 站动态、项目说明与还没有写完的想法。',
    load: () => import('../pages/ColumnsPage'),
  },
  {
    path: '/columns/update-2026-11/',
    title: '关于更新&直播（26/11/8 更新版） · 专栏 · 水鱼 Blog',
    shortTitle: '关于更新与直播',
    description: '沧海水鱼 2026 年 11 月 8 日更新的 B 站动态原文：关于更新与直播。',
    prefetch: false,
    load: () => import('../pages/ColumnDetailPage'),
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
