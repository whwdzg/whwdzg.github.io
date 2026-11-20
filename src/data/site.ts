/**
 * 站点身份与静态内容 / Site identity and static content.
 *
 * 所有文案、外链集中在这里，页面组件只负责呈现。
 * 修改项目、时间线或社交链接时通常只需要动这个文件。
 */
import type { ComponentProps } from 'react';

export interface SiteLink {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
}

export const SITE = {
  name: '沧海水鱼',
  handle: 'whwdzg',
  latin: 'Canghai Waterfish',
  tagline: 'Minecraft 数据包作者 / 哔哩哔哩 视频创作/搬运者 / 爱好热爱者',
  description:
    '沧海水鱼：Minecraft 数据包作者 / 哔哩哔哩 视频创作/搬运者 / 爱好热爱者。站点收录数据包、影像归档、留言板、独立子站与前端工具。',
  avatar: '/media/avatars/shuiyu.webp',
  avatarAlt: '沧海水鱼的头像',
  startYear: 2022,
  license: 'GPL-3.0-or-later',
  licenseUrl: 'https://www.gnu.org/licenses/gpl-3.0.html',
  contentLicense: 'CC BY-NC-SA 4.0',
  contentLicenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
} as const;

export const LINKS = {
  bilibili: 'https://space.bilibili.com/588003657',
  bilibiliMessage: 'https://message.bilibili.com/#/whisper/mid588003657',
  github: 'https://github.com/whwdzg',
  repo: 'https://github.com/whwdzg/whwdzg.github.io',
  repo2: 'https://github.com/whwdzg/whwdzg.github.io/tree/2.0-final',
  legacy: 'https://github.com/whwdzg/whwdzg.github.io/tree/2.0-final/Legacy-1.0',
  modrinth: 'https://modrinth.com/user/whwdzg',
  mcmod: 'https://center.mcmod.cn/216083/',
  wiki: 'https://github.com/whwdzg/Life-Simulation-Wiki',
  license: 'https://www.gnu.org/licenses/gpl-3.0.html',
} as const;

export interface Project {
  id: string;
  path: string;
  modrinthSlug: string;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  icon: string;
  accent: string;
  tags: string[];
  gameVersions: string;
  loaders: string;
  version: string;
  downloads: number;
  followers: number;
  updated: string;
  links: SiteLink[];
  modrinth: string;
  github: string;
  i18n?: string;
  mcmod?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'better-crafting-recipes',
    path: '/projects/better-crafting-recipes/',
    modrinthSlug: 'better-crafting-recipes',
    title: '更好的合成配方',
    subtitle: 'Better Crafting Recipes',
    description: '为原版补齐缺失的合成配方，在不破坏难度的前提下让流程更顺手。',
    detail:
      '111 个新配方、150 个进度，覆盖工作台有序 / 无序合成、切石机与熔炉。把“本该能合成”的东西补回来，同时保留原版的获取节奏。',
    icon: '/media/projects/better-crafting-recipes.webp',
    accent: '#4f9d69',
    tags: ['数据包', '合成', '1.13 – 26.3'],
    gameVersions: '1.13 – 26.3',
    loaders: '数据包 / Fabric / Forge / NeoForge / Quilt',
    version: '1.9.3.6',
    downloads: 12392,
    followers: 5,
    updated: '2026-11-16',
    links: [
      { label: 'Modrinth', href: 'https://modrinth.com/datapack/better-crafting-recipes', external: true },
      { label: 'GitHub', href: 'https://github.com/whwdzg/better-crafting-recipes', external: true },
      { label: 'MCMOD', href: 'https://www.mcmod.cn/class/17614.html', external: true },
    ],
    modrinth: 'https://modrinth.com/datapack/better-crafting-recipes',
    github: 'https://github.com/whwdzg/better-crafting-recipes',
    i18n: 'https://github.com/whwdzg/better-crafting-recipes-i18n',
    mcmod: 'https://www.mcmod.cn/class/17614.html',
  },
  {
    id: 'better-enchantments',
    path: '/projects/better-enchantments/',
    modrinthSlug: 'better-enchantment',
    title: '更好附魔',
    subtitle: 'Better Enchantments',
    description: '让马铠、狼铠与更多装备接受原版保护 / 耐久附魔，同时保持附魔台与铁砧的规则。',
    detail:
      '扩展 protection、fire_protection、blast_protection、projectile_protection 与 unbreaking 的适用对象，把护甲附魔真正扩展到坐骑与宠物装备上。',
    icon: '/media/projects/better-enchantment.webp',
    accent: '#8b5cf6',
    tags: ['数据包', '附魔', '1.21.5 – 26.3'],
    gameVersions: '1.21.5 – 26.3',
    loaders: '数据包 / Fabric / Forge / NeoForge / Quilt',
    version: '1.0.1.3',
    downloads: 2287,
    followers: 2,
    updated: '2026-11-16',
    links: [
      { label: 'Modrinth', href: 'https://modrinth.com/datapack/better-enchantment', external: true },
      { label: 'GitHub', href: 'https://github.com/whwdzg/better-enchantments', external: true },
      { label: 'MCMOD', href: 'https://www.mcmod.cn/class/22543.html', external: true },
    ],
    modrinth: 'https://modrinth.com/datapack/better-enchantment',
    github: 'https://github.com/whwdzg/better-enchantments',
    i18n: 'https://github.com/whwdzg/better-enchantments-i18n',
    mcmod: 'https://www.mcmod.cn/class/22543.html',
  },
  {
    id: 'better-mob-drop',
    path: '/projects/better-mob-drop/',
    modrinthSlug: 'better-mob-drop',
    title: '更好的生物掉落',
    subtitle: 'Better Mob Drop',
    description: '重新整理 18 种生物的掉落，让友好生物也有值得击杀的理由，收益更合理。',
    detail:
      '从悦灵的紫水晶到末影龙的鞘翅，重新编排生物战利品表，并加入抢夺加成、着火熔炼与 18 个击杀进度。',
    icon: '/media/projects/better-mob-drop.webp',
    accent: '#e0833b',
    tags: ['数据包', '掉落', '1.13 – 26.3'],
    gameVersions: '1.13 – 26.3',
    loaders: '数据包 / Fabric / Forge / NeoForge / Quilt',
    version: '1.2.6.4',
    downloads: 91118,
    followers: 31,
    updated: '2026-11-16',
    links: [
      { label: 'Modrinth', href: 'https://modrinth.com/datapack/better-mob-drop', external: true },
      { label: 'GitHub', href: 'https://github.com/whwdzg/better-mob-drop', external: true },
      { label: 'MCMOD', href: 'https://www.mcmod.cn/class/17769.html', external: true },
    ],
    modrinth: 'https://modrinth.com/datapack/better-mob-drop',
    github: 'https://github.com/whwdzg/better-mob-drop',
    i18n: 'https://github.com/whwdzg/better-mob-drop-i18n',
    mcmod: 'https://www.mcmod.cn/class/17769.html',
  },
  {
    id: 'magical-dye',
    path: '/projects/magical-dye/',
    modrinthSlug: 'magical_dye',
    title: '魔法染料',
    subtitle: 'Magical Dye',
    description: '用染料转化矿物块与粉末的愚人节限定数据包，配方轻巧，想法很认真。',
    detail:
      '17 个无序合成配方，让任意染料与粉末 / 矿物块互相转化。一个 2025 年愚人节玩笑，也是一套完整的染色逻辑演示。',
    icon: '/media/projects/magical-dye.webp',
    accent: '#d9467a',
    tags: ['数据包', '愚人节', '1.21.2 – 1.21.4'],
    gameVersions: '1.21.2 – 1.21.4',
    loaders: '数据包 / Fabric / Forge / NeoForge / Quilt',
    version: '1.0.0',
    downloads: 174,
    followers: 2,
    updated: '2025-03-02',
    links: [
      { label: 'Modrinth', href: 'https://modrinth.com/datapack/magical_dye', external: true },
      { label: 'GitHub', href: 'https://github.com/whwdzg/Magical_Dye', external: true },
    ],
    modrinth: 'https://modrinth.com/datapack/magical_dye',
    github: 'https://github.com/whwdzg/Magical_Dye',
  },
  {
    id: 'only-survival-mode',
    path: '/projects/only-survival-mode/',
    modrinthSlug: 'only-survival-mode',
    title: 'Only Survival Mode',
    subtitle: 'Only Survival Mode',
    description: '一个只允许生存模式的数据包。开启命令权限后，也不让任何人偷偷切创造。',
    detail:
      '每个 tick 对全体玩家执行 gamemode survival。适合生存服、挑战整合包，或者只是想管住自己手的单人存档。',
    icon: '/media/projects/only-survival-mode.webp',
    accent: '#3b82f6',
    tags: ['数据包', '生存', '1.21 – 26.3'],
    gameVersions: '1.21 – 26.3',
    loaders: '数据包 / Fabric / Forge / NeoForge / Quilt',
    version: '1.1.0',
    downloads: 1407,
    followers: 3,
    updated: '2026-11-15',
    links: [
      { label: 'Modrinth', href: 'https://modrinth.com/datapack/only-survival-mode', external: true },
      { label: 'GitHub', href: 'https://github.com/whwdzg/only-survival-mode', external: true },
    ],
    modrinth: 'https://modrinth.com/datapack/only-survival-mode',
    github: 'https://github.com/whwdzg/only-survival-mode',
  },
  {
    id: 'glowing-players',
    path: '/projects/glowing-players/',
    modrinthSlug: 'glowing_players',
    title: 'Glowing Players',
    subtitle: 'Glowing Players',
    description: '让所有玩家持续发光。PVP、捉迷藏与服务器管理都能一眼找到人。',
    detail:
      '每个 tick 给全体玩家施加无限发光效果。自 1.0.1 起只支持 1.21+，并通过数据包 / 模组两种形式发布。',
    icon: '/media/projects/glowing-players.webp',
    accent: '#22c55e',
    tags: ['数据包', '社交', '1.21 – 26.3'],
    gameVersions: '1.21 – 26.3',
    loaders: '数据包 / Fabric / Forge / NeoForge / Quilt',
    version: '1.1.0',
    downloads: 72132,
    followers: 68,
    updated: '2026-11-15',
    links: [
      { label: 'Modrinth', href: 'https://modrinth.com/datapack/glowing_players', external: true },
      { label: 'GitHub', href: 'https://github.com/whwdzg/glowing-players', external: true },
    ],
    modrinth: 'https://modrinth.com/datapack/glowing_players',
    github: 'https://github.com/whwdzg/glowing-players',
  },
];

export interface Subsite {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  path: string;
  url: string;
  github: string;
  accent: string;
  pwa?: boolean;
}

export const SUBSITES: Subsite[] = [
  {
    id: 'asteria-player',
    title: 'Asteria Player',
    subtitle: 'Fluent 音乐 / 视频播放器',
    description: '本地音乐与视频播放器：逐字歌词、字幕、弹幕、移动端手势、PWA 离线库。',
    icon: '/media/projects/asteria-player.webp',
    path: '/projects/asteria-player/',
    url: 'https://whwdzg.github.io/Asteria-Player/',
    github: 'https://github.com/whwdzg/Asteria-Player',
    accent: '#5b8cff',
  },
  {
    id: 'paligraph-canvas',
    title: 'Paligraph Canvas',
    subtitle: 'Fluent 笔记 / 无限画布',
    description: '无限画布笔记：压感笔迹、Markdown / Obsidian 导入、PDF 导出，数据只保存在本地。',
    icon: '/media/projects/paligraph-icon.webp',
    path: '/projects/paligraph-canvas/',
    url: 'https://whwdzg.github.io/Paligraph-Canvas/',
    github: 'https://github.com/whwdzg/Paligraph-Canvas',
    accent: '#c98b3a',
    pwa: false,
  },
  {
    id: 'life-simulation-wiki',
    title: '来福 Simulation Wiki',
    subtitle: 'Life Simulation Wiki 镜像',
    description: '来福 Simulation 的全量静态 Wiki 镜像：451 个页面、195 个媒体文件、离线浏览与全文搜索。',
    icon: '/media/projects/life-simulation-wiki.webp',
    path: '/projects/life-simulation-wiki/',
    url: 'https://whwdzg.github.io/Life-Simulation-Wiki/',
    github: 'https://github.com/whwdzg/Life-Simulation-Wiki',
    accent: '#1f8a70',
  },
];

export function subsiteById(idOrPath: string): Subsite | undefined {
  return SUBSITES.find((site) => site.id === idOrPath || site.path === idOrPath);
}

export function projectById(idOrPath: string): Project | undefined {
  return PROJECTS.find((project) => project.id === idOrPath || project.path === idOrPath || project.modrinthSlug === idOrPath);
}

export const PROJECT_TOTALS = {
  downloads: PROJECTS.reduce((sum, project) => sum + project.downloads, 0),
  followers: PROJECTS.reduce((sum, project) => sum + project.followers, 0),
} as const;

export interface TimelineEntry {
  year: string;
  label: string;
  title: string;
  text: string;
  tone: 'a' | 'b' | 'c' | 'd';
}

export const TIMELINE: TimelineEntry[] = [
  {
    year: '2022',
    label: '起点',
    title: 'Legacy 1.0',
    text: '以传统静态页面打底，建立最初的个人主页、作品索引与留言板。',
    tone: 'a',
  },
  {
    year: '2025',
    label: '架构',
    title: '2.0 单页壳层',
    text: '共享页眉与侧栏、轻量 SPA 路由、多语言与 PWA 实验，开始系统化整理内容。',
    tone: 'b',
  },
  {
    year: '2026.07',
    label: '打磨',
    title: '2.0.4 / 2.1',
    text: '重写音乐与视频控件、设置页与全站样式，修复长期积累的细节问题。',
    tone: 'c',
  },
  {
    year: '2026.11',
    label: '重构',
    title: '3.0 重构',
    text: '从 0 重写：Fluent Sun Valley 与液态玻璃、矩形悬浮侧栏、全屏自动收起页眉，性能优先。',
    tone: 'd',
  },
  {
    year: '2026.11',
    label: '现在',
    title: '3.17 档案、评论与笔记',
    text: 'B 站拆分为个人主页、视频、动态与专栏；Paligraph Canvas 加入子站；评论轮换、互动数据、Modrinth 趋势与 GitHub 贡献图同步上线。',
    tone: 'a',
  },
];

export interface Highlight {
  icon: string;
  title: string;
  text: string;
}

export const HIGHLIGHTS: Highlight[] = [
  {
    icon: 'sparkle',
    title: 'Fluent Sun Valley',
    text: 'Mica / Acrylic 表面、圆角系统、Segoe UI Variable 字体与 Fluent 图标体系。',
  },
  {
    icon: 'glass',
    title: '液态玻璃（可选）',
    text: '高光边框与背景模糊叠加，关闭后立即退回实色表面，兼顾观感与 GPU 占用。',
  },
  {
    icon: 'panel',
    title: '悬浮矩形侧栏',
    text: '彻底收起，不留窄条；展开时以圆角浮层覆盖内容，轻阴影、点击外部即收起。',
  },
  {
    icon: 'fullscreen',
    title: '全屏自动收起页眉',
    text: '默认展开；全屏或滚动时按设置自动隐藏，收起后内容立即补位，鼠标移向顶部恢复。',
  },
  {
    icon: 'image',
    title: '本地 WebP 资源',
    text: '封面统一 640×360 WebP，壁纸最大 1920px，全部懒加载并按需解码。',
  },
  {
    icon: 'rocket',
    title: '34 个路由与 251 条归档',
    text: '34 个真实 HTML 页面、路由级代码分割、B 站个人主页 / 视频 / 动态 / 专栏、PWA 缓存与空闲预取。',
  },
];

export const QUICK_LINKS: SiteLink[] = [
  { label: '哔哩哔哩空间', href: LINKS.bilibili, external: true },
  { label: 'GitHub', href: LINKS.github, external: true },
  { label: 'Modrinth', href: LINKS.modrinth, external: true },
  { label: 'MCMOD', href: LINKS.mcmod, external: true },
];

/**
 * 首页“最近影像”的轻量切片。
 *
 * 首页不 import 完整的 251 条 videos.ts，否则数据会进入首屏 chunk；
 * 这里只保留 6 条精选，完整数据在哔哩哔哩页按需加载。
 */
export const FEATURED_VIDEOS = [
  { id: 44, title: '【1v6猎人游戏全程（追杀视角）】水鱼拉完了！', date: '2026-10-29', duration: '4:52:46', cover: '/media/bilibili/v44.webp' },
  { id: 45, title: '【Minecraft官方短视频】你能找出10个错误吗？', date: '2026-09-26', duration: '0:25', cover: '/media/bilibili/v45.webp' },
  { id: 46, title: '【Minecraft官方短视频】你会加入他们吗?', date: '2026-09-26', duration: '0:37', cover: '/media/bilibili/v46.webp' },
  { id: 47, title: '【Minecraft官方短视频】曾经有过一只鸡……', date: '2026-09-26', duration: '0:29', cover: '/media/bilibili/v47.webp' },
  { id: 48, title: '【Minecraft官方短视频】来雪球大战？', date: '2026-09-26', duration: '0:18', cover: '/media/bilibili/v48.webp' },
  { id: 49, title: '【Minecraft官方短视频】悬浮树的视角', date: '2026-09-19', duration: '0:19', cover: '/media/bilibili/v49.webp' },
] as const;


export interface NavItem {
  label: string;
  to: string;
  icon: string;
  description?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: '主页', to: '/', icon: 'home', description: '站点概览与最新动态' },
  { label: '哔哩哔哩', to: '/bilibili/', icon: 'tv', description: '个人主页 · 视频 / 动态 / 专栏' },
  { label: '留言板', to: '/comments/', icon: 'comment', description: '留言摘录与写作入口' },
  { label: 'GitHub 评论', to: '/comments/github/', icon: 'github', description: 'Issue 驱动的评论区' },
  { label: '关于', to: '/about/', icon: 'info', description: '版本、提交历史与技术说明' },
];

export const ARCHIVE_LINKS: SiteLink[] = [
  { label: '2.0 源码分支', href: LINKS.repo2, description: '2.0-final 完整静态站', external: true },
  { label: 'Legacy 1.0', href: LINKS.legacy, description: '最初的静态页面', external: true },
  { label: '本站源码', href: LINKS.repo, description: '3.21.2 的 React + Vite 源码', external: true },
];

export type FluentIconName = keyof typeof FLUENT_ICON_NAMES;

/**
 * 图标名到 Fluent 图标的映射在组件层完成，这里只保留稳定的字符串 key。
 * 这样数据文件不依赖 React 组件，便于测试与序列化。
 */
export const FLUENT_ICON_NAMES = {
  home: 'Home',
  tv: 'Tv',
  comment: 'Comment',
  info: 'Info',
  sparkle: 'Sparkle',
  glass: 'Layer',
  panel: 'PanelLeft',
  fullscreen: 'FullScreenMaximize',
  image: 'Image',
  rocket: 'Rocket',
  arrow: 'ArrowRight',
  external: 'Open',
  search: 'Search',
  settings: 'Settings',
  sun: 'WeatherSunny',
  moon: 'WeatherMoon',
  menu: 'Navigation',
  close: 'Dismiss',
  chevron: 'ChevronDown',
  github: 'Code',
  bilibili: 'Tv',
  copy: 'Copy',
  check: 'Checkmark',
  filter: 'Filter',
  grid: 'Grid',
  list: 'List',
  calendar: 'CalendarLtr',
  clock: 'Clock',
  eye: 'Eye',
  link: 'Link',
  mail: 'Mail',
  pin: 'Pin',
  heart: 'Heart',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ChevronLeft',
  right: 'ChevronRight',
  play: 'Play',
  pause: 'Pause',
  refresh: 'ArrowClockwise',
  delete: 'Delete',
  download: 'ArrowDownload',
  code: 'Code',
  globe: 'Globe',
  shield: 'Shield',
  document: 'Document',
  person: 'Person',
  sparkles: 'Sparkle',
  color: 'Color',
  wallpaper: 'Image',
  motion: 'Motion',
  storage: 'Database',
  install: 'ArrowDownload',
  warning: 'Warning',
  history: 'History',
  branch: 'Branch',
  commit: 'CheckmarkCircle',
} as const;

export type SiteMetaShape = {
  name: string;
  version: string;
  description: string;
  license: string;
  repoUrl: string;
  branch: string;
  commit: string;
  commitShort: string;
  commitTime: string;
  buildTime: string;
  commits: Array<{
    hash: string;
    short: string;
    time: string;
    author: string;
    subject: string;
    url: string;
  }>;
};

export type IconProps = ComponentProps<'svg'>;
