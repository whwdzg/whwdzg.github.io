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
  name: '滄海水魚',
  handle: 'whwdzg',
  latin: 'Canghai Waterfish',
  tagline: 'Minecraft 数据包作者 / 影像搬运 / 前端折腾',
  description:
    '滄海水魚的个人角落：Minecraft 数据包、哔哩哔哩影像归档、留言板，以及一个持续重构中的前端实验场。',
  avatar: '/media/avatars/shuiyu.webp',
  avatarAlt: '滄海水魚的头像',
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
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: string;
  tags: string[];
  links: SiteLink[];
}

export const PROJECTS: Project[] = [
  {
    id: 'better-crafting-recipes',
    title: '更好的合成配方',
    subtitle: 'Better Crafting Recipes',
    description: '为原版补齐缺失的合成配方，在不破坏难度的前提下让流程更顺手，支持 1.13+。',
    icon: '/media/projects/better-crafting-recipes.webp',
    accent: '#4f9d69',
    tags: ['数据包', '模组', '1.13+'],
    links: [
      { label: 'Modrinth', href: 'https://modrinth.com/datapack/better-crafting-recipes', external: true },
      { label: 'GitHub', href: 'https://github.com/whwdzg/better-crafting-recipes', external: true },
      { label: 'MCMOD', href: 'https://www.mcmod.cn/class/17614.html', external: true },
    ],
  },
  {
    id: 'better-enchantment',
    title: '更好附魔',
    subtitle: 'Better Enchantments',
    description: '让更多物品可以被附魔，扩展原版附魔的适用对象，同时保持属性平衡。',
    icon: '/media/projects/better-enchantment.webp',
    accent: '#8b5cf6',
    tags: ['数据包', '附魔'],
    links: [
      { label: 'Modrinth', href: 'https://modrinth.com/datapack/better-enchantment', external: true },
      { label: 'GitHub', href: 'https://github.com/whwdzg/better-enchantments', external: true },
      { label: 'MCMOD', href: 'https://www.mcmod.cn/class/22543.html', external: true },
    ],
  },
  {
    id: 'better-mob-drop',
    title: '更好的生物掉落',
    subtitle: 'Better Mob Drop',
    description: '重新整理生物掉落，让收益更合理，减少无意义的重复刷取。',
    icon: '/media/projects/better-mob-drop.webp',
    accent: '#e0833b',
    tags: ['数据包', '掉落'],
    links: [
      { label: 'Modrinth', href: 'https://modrinth.com/datapack/better-mob-drop', external: true },
      { label: 'GitHub', href: 'https://github.com/whwdzg/better-mob-drop', external: true },
      { label: 'MCMOD', href: 'https://www.mcmod.cn/class/17769.html', external: true },
    ],
  },
  {
    id: 'magical_dye',
    title: '魔法染料',
    subtitle: 'Magical Dye',
    description: '用染料转化矿物块与粉末的愚人节限定数据包，配方轻巧，想法很认真。',
    icon: '/media/projects/magical_dye.webp',
    accent: '#d9467a',
    tags: ['数据包', '愚人节'],
    links: [
      { label: 'Modrinth', href: 'https://modrinth.com/datapack/magical_dye', external: true },
      { label: 'GitHub', href: 'https://github.com/whwdzg/Magical_Dye', external: true },
    ],
  },
];

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
    label: '现在',
    title: '3.0 重构',
    text: '从 0 重写：Fluent Sun Valley 与液态玻璃、矩形悬浮侧栏、全屏自动收起页眉，性能优先。',
    tone: 'd',
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
    text: 'Mica / Acrylic 表面、8px 圆角、Segoe UI Variable 字体与 Fluent 图标体系。',
  },
  {
    icon: 'glass',
    title: '液态玻璃（可选）',
    text: '高光边框与背景模糊叠加，关闭后立即退回实色表面，兼顾观感与 GPU 占用。',
  },
  {
    icon: 'panel',
    title: '悬浮矩形侧栏',
    text: '彻底收起，不留窄条；展开时以浮层覆盖内容，方角、轻阴影、点击外部即收起。',
  },
  {
    icon: 'fullscreen',
    title: '全屏自动收起页眉',
    text: '默认展开；全屏或滚动时按设置自动隐藏，鼠标移向顶部立刻恢复。',
  },
  {
    icon: 'image',
    title: '本地 WebP 资源',
    text: '封面统一 640×360 WebP，壁纸最大 1920px，全部懒加载并按需解码。',
  },
  {
    icon: 'rocket',
    title: '快，但留有余地',
    text: '多入口、路由级代码分割、系统字体、Service Worker 缓存与空闲预取。',
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
 * 首页不 import 完整的 43 条 videos.ts，否则 25KB 数据会进入首屏 chunk；
 * 这里只保留 6 条精选，完整数据在哔哩哔哩页按需加载。
 */
export const FEATURED_VIDEOS = [
  { id: 2, title: '当你在BW遇见了浑元Rysn', date: '2025-07-13', duration: '0:13', cover: '/media/bilibili/v02.webp' },
  { id: 4, title: '【愚人节限定数据包】当MC的染料可以转化矿物块和粉末？！', date: '2025-03-30', duration: '38:12', cover: '/media/bilibili/v04.webp' },
  { id: 12, title: '【cc字幕】微软把Windows11娘化了', date: '2024-10-20', duration: '0:20', cover: '/media/bilibili/v12.webp' },
  { id: 10, title: "【数据包/模组】是时候试试 whwdzg's Recipe 了", date: '2024-11-09', duration: '0:29', cover: '/media/bilibili/v10.webp' },
  { id: 13, title: '【Minecraft Live 2024】村民新闻：林中之怪', date: '2024-10-02', duration: '4:26', cover: '/media/bilibili/v13.webp' },
  { id: 15, title: '[cc字幕] Hypixel 服务器宣传片（2024）', date: '2024-09-15', duration: '2:28', cover: '/media/bilibili/v15.webp' },
] as const;


export interface NavItem {
  label: string;
  to: string;
  icon: string;
  description?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: '主页', to: '/', icon: 'home', description: '站点概览与最新动态' },
  { label: '哔哩哔哩', to: '/bilibili/', icon: 'tv', description: '43 条影像归档' },
  { label: '留言板', to: '/comments/', icon: 'comment', description: '留言摘录与写作入口' },
  { label: 'GitHub 评论', to: '/comments/github/', icon: 'github', description: 'Issue 驱动的评论区' },
  { label: '关于', to: '/about/', icon: 'info', description: '版本、提交历史与技术说明' },
];

export const ARCHIVE_LINKS: SiteLink[] = [
  { label: '2.0 源码分支', href: LINKS.repo2, description: '2.0-final 完整静态站', external: true },
  { label: 'Legacy 1.0', href: LINKS.legacy, description: '最初的静态页面', external: true },
  { label: '本站源码', href: LINKS.repo, description: '3.0 的 React + Vite 源码', external: true },
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
