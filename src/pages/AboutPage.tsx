/**
 * 关于页 / About.
 *
 * 除了介绍，这个页面承担两个实际功能：
 * - 展示版本号、构建时间、当前提交与最近提交历史（构建期快照，可手动刷新）；
 * - 说明 3.0 的设计与性能策略，方便以后维护时对照。
 */
import { useCallback, useMemo, useState } from 'react';
import {
  ArrowClockwiseRegular,
  BranchRegular,
  CheckmarkCircleRegular,
  CodeRegular,
  CopyRegular,
  DocumentRegular,
  HistoryRegular,
  OpenRegular,
  SettingsRegular,
  ShieldRegular,
  SparkleRegular,
} from '@fluentui/react-icons';
import { PageIntro } from '../components/layout/PageIntro';
import { TableOfContents } from '../components/common/TableOfContents';
import { Reveal } from '../components/common/Reveal';
import { CodeBlock } from '../components/common/CodeBlock';
import { Button } from '../components/common/Button';
import { FluentIcon } from '../components/common/FluentIcon';
import { useActiveSection } from '../hooks/useActiveSection';
import { useUi } from '../hooks/useUi';
import { useToast } from '../hooks/useToast';
import { copyText } from '../lib/clipboard';
import { formatDateTime, relativeTime } from '../lib/format';
import { siteMeta } from '../lib/meta';
import { LINKS, SITE } from '../data/site';
import { SYNC_STATUS, SYNC_SOURCES } from '../data/sync-status';

interface CommitEntry {
  hash: string;
  short: string;
  time: string;
  author: string;
  subject: string;
  url: string;
}

const TOC_ITEMS = [
  { id: 'version', label: '版本与构建' },
  { id: 'sync', label: '数据同步' },
  { id: 'commits', label: '最近提交' },
  { id: 'design', label: '设计理念' },
  { id: 'tech', label: '技术栈' },
  { id: 'performance', label: '性能与加载' },
  { id: 'structure', label: '目录结构' },
  { id: 'develop', label: '本地开发' },
  { id: 'license', label: '许可与致谢' },
];

const TECH_STACK = [
  { name: 'React 19', note: '并发渲染、Suspense、按需加载页面' },
  { name: 'Vite 7', note: '多入口构建、代码分割、极速 HMR' },
  { name: 'TypeScript 5.8', note: '严格模式、可维护的数据类型' },
  { name: 'Fluent UI Icons', note: '微软 Fluent System Icons，按需 tree-shake' },
  { name: '原生 CSS', note: 'CSS 变量、color-mix、容器查询、无 UI 框架' },
  { name: 'Service Worker', note: '静态资源缓存与离线回退' },
  { name: 'GitHub Actions', note: '构建、测试、每天数据同步、Pages 部署' },
  { name: 'WebP / AVIF', note: '全部本地封面与壁纸，懒加载' },
];

const LOAD_STEPS = [
  { step: '01', title: 'HTML + 预绘制脚本', text: '在 CSS/JS 之前读取本地主题，避免深浅色闪烁；首屏只有内联的十几行脚本。' },
  { step: '02', title: 'React + 图标 chunk', text: '公共运行时单独拆包，颜色主题与布局先渲染，页面内容随后进入。' },
  { step: '03', title: '当前页面 chunk', text: '首页不加载哔哩哔哩数据与详情弹窗；页面切换时按需 import。' },
  { step: '04', title: '空闲预取', text: '首屏稳定后预取其他页面 chunk；悬停 / 聚焦导航时也会提前加载。' },
  { step: '05', title: '壁纸与封面', text: '壁纸在 requestIdleCallback 中解码；封面 loading="lazy" 并固定宽高。' },
  { step: '06', title: 'Service Worker', text: '安装后缓存静态资源，HTML network-first，重复访问接近瞬时。' },
];

const CHANGELOG = [
  {
    version: '3.25.0',
    date: '2026-11-21',
    items: [
      '新增类似 Obsidian 的本地 Markdown 编辑器：笔记列表、搜索、自动保存、导入导出。',
      '支持分栏实时预览、KaTeX、表格、任务列表、代码块、双向链接与滚动同步。',
    ],
  },
  {
    version: '3.24.0',
    date: '2026-11-21',
    items: [
      '新增 AI 内容痕迹检查工具：分析图片元数据、生成参数、C2PA / 隐形水印、文字水印与写作惯用词。',
      '图像与文字均输出逐项评判、分数与保守的最终结论，并明确标注启发式限制。',
    ],
  },
  {
    version: '3.23.0',
    date: '2026-11-21',
    items: [
      '安装版 PWA 启用 Window Controls Overlay 沉浸标题栏，页眉与系统窗口控制区合并。',
      '页眉空白区域支持拖动窗口，按钮、链接与输入框保持可点击。',
    ],
  },
  {
    version: '3.22.0',
    date: '2026-11-21',
    items: [
      '新增 Markdown 思维导图工具：Markdown ↔ 节点双向实时同步。',
      '支持标题 / 列表层级、数字编号、KaTeX LaTeX、分支配色与分层节点图形。',
      '支持 PNG / JPEG / WebP / SVG 与 PDF 导出，分辨率自动推荐或手动选择。',
    ],
  },
  {
    version: '3.21.2',
    date: '2026-11-20',
    items: [
      '图片查看器改为挂载到 body，确保从 B 站视频详情弹窗打开评论图时始终显示在弹窗上方。',
    ],
  },
  {
    version: '3.21.1',
    date: '2026-11-20',
    items: [
      '图标改为更克制的金属像素水鱼：去掉卡通眼睛与圆润造型，使用尖锐轮廓、暗色金属渐变、电路刻线与边缘高光。',
    ],
  },
  {
    version: '3.21.0',
    date: '2026-11-20',
    items: [
      'B 站评论改为每页 10 条一级评论、每条楼中楼最多 10 条。',
      '评论支持静态图片与 GIF / WebP 动图，楼中楼同样支持表情和图片。',
      '重新全量抓取 218 个视频与 20 条动态的评论快照。',
    ],
  },
  {
    version: '3.20.2',
    date: '2026-11-20',
    items: [
      '修正「折叠合集」语义：折叠时隐藏合集内所有成员视频，只保留合集入口和非合集视频。',
    ],
  },
  {
    version: '3.20.1',
    date: '2026-11-20',
    items: [
      'B 站视频页新增「折叠合集」选项，可隐藏合集条目并保留合集筛选；偏好保存在本地。',
    ],
  },
  {
    version: '3.20.0',
    date: '2026-11-20',
    items: [
      '站点图标改为像素水鱼与科技界面融合：像素块主体、3D 光泽、高光与阴影、电路角标。',
      '重新生成 SVG / PNG / Apple Touch / Maskable / favicon，继续应用到全站页面、PWA、侧边栏、页脚和离线页。',
    ],
  },
  {
    version: '3.19.0',
    date: '2026-11-20',
    items: [
      'B 站视频与动态评论支持表情和楼中楼；评论快照包含一级评论、表情与接口返回的回复预览。',
      '视频与动态评论改为每天各 15 条轮换更新；首次已全量抓取 218 个视频与 20 条动态的评论。',
      '修复视频详情窗口上一条 / 下一条按钮在窄屏隐藏图标和文字的问题。',
    ],
  },
  {
    version: '3.18.0',
    date: '2026-11-20',
    items: [
      '重新设计站点图标：深蓝渐变圆角方块、水鱼与波纹，作为新的品牌标识。',
      '生成 SVG、16 / 32 / 192 / 512 PNG、Apple Touch、Maskable 与 favicon.ico，并应用到全部页面、PWA、侧边栏、页脚和离线页。',
    ],
  },
  {
    version: '3.17.1',
    date: '2026-11-20',
    items: [
      '首页按当前内容更新：B 站个人主页 / 视频 / 动态 / 专栏、Paligraph Canvas、三个子站、34 个路由与评论轮换。',
    ],
  },
  {
    version: '3.17.0',
    date: '2026-11-20',
    items: [
      'B 站视频评论改为轮换抓取：每次同步最多 12 条视频，全部覆盖后从最新视频重新开始。',
      '抓取失败的视频不标记为完成，会在后续轮换中重试。',
      '评论只抓一级内容；有回复时仅显示回复条数，不抓取回复正文。',
    ],
  },
  {
    version: '3.16.0',
    date: '2026-11-20',
    items: [
      '新增 Paligraph Canvas 子站页面：无限画布、压感笔迹、Markdown / Obsidian 导入与本地存储介绍。',
      '补充首页子站卡片、侧边栏、GitHub 项目页、搜索与 sitemap 入口。',
    ],
  },
  {
    version: '3.15.0',
    date: '2026-11-20',
    items: [
      'B 站动态支持表情图片、动态配图与评论区展开，显示发布日期和评论条数。',
      '配图与表情在同步时缓存到本地，动态图片可点击查看大图。',
    ],
  },
  {
    version: '3.14.1',
    date: '2026-11-20',
    items: [
      '正文轻量播放器的进度、音量与亮度滑块改为 Asteria Player 风格：细轨道、白色圆形滑块与强调色填充。',
      '放大播放、音量、字幕、全屏等控件按钮与图标尺寸。',
    ],
  },
  {
    version: '3.14.0',
    date: '2026-11-20',
    items: [
      '掩星页改为档案式主界面：轨道/掩星视觉、右侧档案读数面板与主标题并列。',
      '只重组页面已有文案与视觉层级，不新增任何设定信息或隐藏内容。',
    ],
  },
  {
    version: '3.13.0',
    date: '2026-11-20',
    items: [
      '在线数据同步失败时保留上一次可用快照，并在相关页面以黄色「数据已过期」标记。',
      '悬浮或点击过期标记会显示最后更新日期、失败说明与原始站点提示。',
      '同步状态文件现在记录失败来源；失败不再被静默当作成功。',
    ],
  },
  {
    version: '3.12.1',
    date: '2026-11-20',
    items: [
      '全站 hxhej 与沧海水鱼头像更新为各自 B 站空间头像。',
      '用户页、留言板、侧边栏、评论与个人主页统一使用本地 WebP 头像。',
    ],
  },
  {
    version: '3.12.0',
    date: '2026-11-20',
    items: [
      'B 站视频详情新增点赞 / 投币 / 收藏 / 分享 / 评论数据与评论快照；最近 24 条有评论的视频可站内查看。',
      'B 站动态新增三连 / 分享数据、发布时间与评论区展开，评论按 opus 的实际评论类型抓取。',
      '评论与互动数据纳入每日同步；数据来自 B 站公开接口。',
    ],
  },
  {
    version: '3.11.0',
    date: '2026-11-20',
    items: [
      'Modrinth 项目页新增每个数据包的下载量 / 关注量折线图；趋势来自仓库历史快照，随每日同步增长。',
      'GitHub 项目页新增个人资料、总 Star、关注者 / 关注中、公开仓库、徽章与最近一年贡献图。',
      '贡献图通过 GitHub GraphQL contributionsCollection 在同步阶段生成；个人简介与计数来自 GitHub 用户 API。',
    ],
  },
  {
    version: '3.10.1',
    date: '2026-11-20',
    items: [
      '外部数据同步从每小时改为每天一次：北京时间 03:17 运行，降低 B 站 / MC百科 / GitHub 请求与自动提交频率。',
      'B 站封面缓存保留上一次成功数据，接口失败时不再清空播放量；恢复归档播放统计。',
    ],
  },
  {
    version: '3.10.0',
    date: '2026-11-20',
    items: [
      '哔哩哔哩拆分为个人主页、视频、动态、专栏四个页面；个人主页展示粉丝、关注、获赞、视频 / 动态 / 专栏、归档播放与直播状态，数据由每天 B 站快照更新。',
      '新增 B 站动态与专栏子页，动态保留原文和点赞，专栏展示标题、摘要、阅读与点赞。',
      'MC百科评论支持展开楼中楼，同步抓取每条评论的全部分页回复。',
    ],
  },
  {
    version: '3.9.7',
    date: '2026-11-20',
    items: [
      '第一篇专栏替换为沧海水鱼 2026-11-08 的 B 站动态原文「关于更新&直播（26/11/8 更新版）」。',
      '专栏链接改为 /columns/update-2026-11/，标题、摘要、来源链接与动态末尾表情同步更新。',
    ],
  },
  {
    version: '3.9.6',
    date: '2026-11-19',
    items: [
      '移除关于页、首页和侧栏中没有数据依据的“在线”状态与绿色在线点。',
      '保留影像归档、在线 API 快照、在线链接导入等有实际含义的技术表述。',
    ],
  },
  {
    version: '3.9.5',
    date: '2026-11-19',
    items: [
      '科学计算器移除所有 CASIO 品牌、型号与系列名称，改为本站自己的科学计算器界面。',
      '键盘统一为五列：代数、对数/括号、三角/常量分组，数字与操作键保持同一列宽。',
      '顶部工具栏精简为模式、变量、目录、工具、撤销与 SHIFT，光标键与 AC/DEL 单独一行。',
    ],
  },
  {
    version: '3.9.4',
    date: '2026-11-19',
    items: [
      '掩星档案终端去掉 Windows 标题栏、路径与窗口按钮，改成站内设计的圆角终端面板。',
      '保留传统终端的黑色屏幕、等宽字体与命令行提示符，提示符改为 observer@occultation:~$。',
    ],
  },
  {
    version: '3.9.3',
    date: '2026-11-19',
    items: [
      '查看大图改为 2.0 风格布局：顶部悬浮标题、右侧竖排工具、窄高翻页按钮、底部胶片条。',
      '图片拖动只触发站内平移，不再启动浏览器原生图片拖拽；缩放、下载、定位原文与移动端双指缩放保持不变。',
    ],
  },
  {
    version: '3.9.2',
    date: '2026-11-19',
    items: [
      '重做影像归档的年份 / 排序下拉菜单：站内 Fluent 面板、选中态、计数、键盘导航与点击外部关闭。',
    ],
  },
  {
    version: '3.9.1',
    date: '2026-11-19',
    items: [
      '哔哩哔哩影像页支持滚动自动加载：加载更多按钮出现后继续下滑，自动载入下一批 12 条。',
      '保留手动「加载更多」按钮；筛选、排序、搜索变化时回到首批。',
    ],
  },
  {
    version: '3.9.0',
    date: '2026-11-19',
    items: [
      '更好的合成配方、更好附魔、更好的生物掉落页面底部展示 MC百科条目短评。',
      '新增 MC百科短评快照与同步脚本，保留作者、头像、楼层、日期、频道与回复数。',
      '每天外部数据同步现在同时更新 MC百科短评。',
    ],
  },
  {
    version: '3.8.0',
    date: '2026-11-19',
    items: [
      '留言板改为静态摘录 + GitHub「留言板」Issue 双驱动，实时显示 Issue 评论。',
      '新增 GitHub 留言区、刷新、Issue 入口与 Markdown 渲染；保留原有站内摘录和 B 站私信方式。',
    ],
  },
  {
    version: '3.7.0',
    date: '2026-11-19',
    items: [
      '新增侧边栏「专栏」板块、专栏索引与文章详情页。',
      '第一篇专栏整理自沧海水鱼 B 站动态。',
      '专栏支持搜索、侧栏直达、Service Worker 缓存与独立 HTML 入口。',
    ],
  },
  {
    version: '3.6.0',
    date: '2026-11-19',
    items: [
      '新增 /user/hxhej/ 与 /user/canghaishuiyu/ 用户页，兼容 2.0 的 /user/滄海水魚/ 地址。',
      '留言板头像可点击进入对应用户页。',
      '用户页根据哔哩哔哩公开资料补充简述、公开数据与站内留言摘录。',
    ],
  },
  {
    version: '3.5.1',
    date: '2026-11-18',
    items: [
      '更好的合成配方 / 魔法染料项目页新增 B 站视频，正文内即可播放。',
      '新增 BilibiliEmbed：封面播放、B 站原生进度 / 全屏 / 音量、亮度调节与 Asteria Player 入口。',
    ],
  },
  {
    version: '3.5.0',
    date: '2026-11-18',
    items: [
      '新增正文内嵌音乐 / 视频播放器：音乐支持封面、单行滚动歌词、进度、音量；视频支持全屏、字幕、音量、亮度。',
      '播放器沿用 Asteria 视觉语言，并提供「在 Asteria Player 打开」深链。',
      'Asteria Player 新增 ?url= 与 ?kind= 查询参数，可直接从正文打开对应媒体。',
      'Asteria 项目页新增正文媒体演示区。',
    ],
  },
  {
    version: '3.4.1',
    date: '2026-11-18',
    items: [
      '正文图片查看器新增定位原文、下载当前图片、桌面缩放按钮与百分比输入、移动端双指缩放。',
      '图片查看器底部新增可收起的胶片条，展示当前页面全部图片并高亮当前项。',
    ],
  },
  {
    version: '3.4.0',
    date: '2026-11-18',
    items: [
      '外部数据改为每天 GitHub Actions 同步，仓库内保存 Modrinth / MC百科 / B站 / GitHub 快照，关于页显示最近获取时间。',
      'GitHub 项目页展示 Star、Fork 与最近更新时间；GitHub 快照进入仓库。',
      '掩星新增 CMD 风格档案终端与世界观描述，侧栏选中态改为短竖线，工具分组默认展开。',
      'MC 投影改用 InstancedMesh 批量绘制并按状态缓存材质；支持六面不同纹理、结构 NBT、中文本地化方块名与空格 / Shift 升降。',
      '科学计算器保留 CW 布局与功能，视觉改回本站 Fluent 表面。',
      '来福 Wiki 图标替换为仓库主页图片；修复 MC 物品居中与 Wiki 图标显示。',
    ],
  },
  {
    version: '3.3.0',
    date: '2026-11-17',
    items: [
      '新增 Asteria Player / 来福 Simulation Wiki 子站、GitHub 项目页与「掩星」世界观页。',
      '带 .html 的旧链接自动重定向到无扩展名路径。',
      '重做 Base64 / BaseX / 进制 / Unicode / 计算器 / MC 投影 6 个工具。',
      '新增 MC 数据包 / 资源包解析器。',
      '计算器重做按键与 10 种模式。',
      'B 站归档同步到 251 条，含 3 条直播回放；合集可展开全部成员视频；侧栏、主页与页脚更新。',
      '数据包版本分支表、来福 Wiki 451 页镜像信息与首页内容同步更新。',
      '数据包物品/进度贴图、标签展开、MCMOD 与版本矩阵；物品可跳转中文 Wiki。',
      '季节粒子、正文大图、页眉补位、轮播倒计时与 PWA 名称调整。',
    ],
  },
  {
    version: '3.2.0',
    date: '2026-11-17',
    items: [
      '新增 6 个数据包详情页与 Modrinth 项目索引。',
      '合成 / 附魔 / 掉落 / 染料配方与进度树使用 Minecraft 26.3 资源可视化。',
      '329 个物品贴图与中文名本地化，配方数据由仓库脚本生成。',
      '侧栏项目组、首页项目卡、页脚、搜索、manifest、sitemap 与 Actions 校验同步更新。',
    ],
  },
  {
    version: '3.1.0',
    date: '2026-11-17',
    items: [
      '新增 GitHub 评论区：用公开 Issue 展示头像、正文、标签、reactions 与回复。',
      'Issue 筛选 / 搜索 / 刷新 / 深链接，评论支持引用回复并跳转 GitHub。',
      'marked + DOMPurify 按需加载；Issue 列表 5 分钟、评论 2 分钟缓存。',
      '侧栏、页眉、页脚、搜索、manifest、sitemap 与 Actions 产物校验同步更新。',
    ],
  },
  {
    version: '3.0.0',
    date: '2026-11-17',
    items: [
      '从 0 重写为 React + Vite + TypeScript 多入口站点。',
      'Fluent Design Sun Valley + 可选液态玻璃；矩形悬浮侧栏。',
      '全屏自动收起页眉、阅读进度、命令面板搜索、PWA。',
      '哔哩哔哩归档、留言板、关于页与设置面板全部重做。',
      '封面本地 WebP 化，壁纸重压缩，路由级代码分割。',
    ],
  },
  {
    version: '2.1.0.0',
    date: '2026-07-26',
    items: ['重写音乐与视频控件样式', '优化歌词识别与弹幕 / 字幕', '重写设置页、页尾与全站样式'],
  },
  {
    version: '2.0.3.9',
    date: '2026-04-06',
    items: ['2.0 壳层与 SPA 路由稳定版', '多语言 JSON、主题与 PWA 实验'],
  },
  {
    version: '2.0.0',
    date: '2025',
    items: ['单页壳层、共享 header/sidebar/footer', '内容归档与工具页整理'],
  },
  {
    version: '1.0.0',
    date: '2022',
    items: ['传统静态页面', '最初的个人主页、作品索引与留言板'],
  },
];

export default function AboutPage() {
  const { openSettings } = useUi();
  const { toast } = useToast();
  const [commits, setCommits] = useState<CommitEntry[]>(siteMeta.commits);
  const [head, setHead] = useState(() => ({
    hash: siteMeta.commit,
    short: siteMeta.commitShort || 'local',
    time: siteMeta.commitTime,
  }));
  const [refreshing, setRefreshing] = useState(false);
  const active = useActiveSection(useMemo(() => TOC_ITEMS.map((item) => item.id), []));

  const refreshCommits = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch('https://api.github.com/repos/whwdzg/whwdzg.github.io/commits?per_page=15', {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as Array<{
        sha: string;
        html_url: string;
        commit: { message: string; author: { name: string; date: string } };
      }>;
      setCommits(
        data.map((item) => ({
          hash: item.sha,
          short: item.sha.slice(0, 7),
          time: item.commit.author.date,
          author: item.commit.author.name,
          subject: item.commit.message.split('\n')[0].replace(/CASIO/gi, '').replace(/fx-991CN(?:\s+CW\s+II)?/gi, '科学计算器').replace(/ClassWiz/gi, '').trim(),
          url: item.html_url,
        })),
      );
      if (data[0]) {
        setHead({ hash: data[0].sha, short: data[0].sha.slice(0, 7), time: data[0].commit.author.date });
      }
      toast('已从 GitHub 获取最新提交', 'success');
    } catch (error) {
      console.warn(error);
      toast('获取失败，继续显示构建时快照', 'error');
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

  const copyVersion = async () => {
    const ok = await copyText(`whwdzg.github.io v${siteMeta.version} (${head.short})`);
    toast(ok ? '版本信息已复制' : '复制失败', ok ? 'success' : 'error');
  };

  return (
    <div className="page page--about">
      <PageIntro
        eyebrow="ABOUT · 3.25.0"
        title="关于本站"
        lead="一个个人向导览与存档站点，也是一次从零开始的前端练习。这里记录版本、提交、技术选择，以及为什么每一个视觉决定都要为性能让路。"
        meta={[
          { icon: 'commit', label: `v${siteMeta.version}` },
          { icon: 'branch', label: siteMeta.branch || 'main' },
          { icon: 'clock', label: `构建 ${formatDateTime(siteMeta.buildTime)}` },
          { icon: 'shield', label: 'GPL-3.0' },
        ]}
        actions={
          <>
            <Button variant="primary" icon={<HistoryRegular aria-hidden />} onClick={refreshCommits} disabled={refreshing}>
              {refreshing ? '正在获取…' : '刷新最新提交'}
            </Button>
            <Button variant="secondary" icon={<SettingsRegular aria-hidden />} onClick={openSettings}>
              打开设置
            </Button>
            <a className="btn btn--ghost btn--md" href={LINKS.repo} target="_blank" rel="noopener noreferrer">
              查看源码
              <OpenRegular aria-hidden />
            </a>
          </>
        }
        aside={
          <div className="about-identity">
            <img src={SITE.avatar} alt={SITE.avatarAlt} width={72} height={72} loading="lazy" />
            <div>
              <p className="about-identity__name">{SITE.name}</p>
              <p className="about-identity__handle">@{SITE.handle}</p>
              <p className="about-identity__tagline">{SITE.tagline}</p>
            </div>
          </div>
        }
      />

      <div className="container about-layout">
        <div className="about-main">
          <Reveal as="section" className="article-card" id="version">
            <p className="eyebrow">VERSION</p>
            <h2>版本与构建</h2>
            <div className="version-hero">
              <div>
                <p className="version-hero__number">v{siteMeta.version}</p>
                <p className="version-hero__label">3.25.0 · Fluent Sun Valley rebuild</p>
              </div>
              <div className="version-hero__actions">
                <Button variant="secondary" icon={<CopyRegular aria-hidden />} onClick={copyVersion}>
                  复制版本
                </Button>
                <a className="btn btn--ghost btn--md" href={`${LINKS.repo}/commit/${head.hash}`} target="_blank" rel="noopener noreferrer">
                  {head.short} <OpenRegular aria-hidden />
                </a>
              </div>
            </div>
            <dl className="fact-grid">
              <div>
                <dt>当前提交</dt>
                <dd>{head.short}</dd>
              </div>
              <div>
                <dt>提交时间</dt>
                <dd>{formatDateTime(head.time)}</dd>
              </div>
              <div>
                <dt>构建时间</dt>
                <dd>{formatDateTime(siteMeta.buildTime)} <span>{relativeTime(siteMeta.buildTime)}</span></dd>
              </div>
              <div>
                <dt>分支</dt>
                <dd>{siteMeta.branch || 'main'}</dd>
              </div>
              <div>
                <dt>版本来源</dt>
                <dd>package.json</dd>
              </div>
              <div>
                <dt>部署</dt>
                <dd>GitHub Pages · Actions</dd>
              </div>
            </dl>
            <p className="settings-hint">
              版本号遵循语义化版本：3.0.0 表示一次完整重写；后续修补递增 patch，功能新增递增 minor。
              每次构建都会把版本、提交与构建时间注入页面。
            </p>
          </Reveal>

          <Reveal as="section" className="article-card" id="sync">
            <div className="article-card__head">
              <div>
                <p className="eyebrow">SYNC STATUS</p>
                <h2>外部数据同步</h2>
              </div>
              <span className="badge">每天</span>
            </div>
            <p>
              GitHub Actions 每天抓取 Modrinth、MC百科、GitHub 与哔哩哔哩，更新仓库快照后自动提交并重新部署。
              页面显示的是最近一次成功同步的时间。
            </p>
            <div className="sync-status-grid">
              {SYNC_SOURCES.map(([key, source]) => (
                <div className="sync-source" key={key}>
                  <span>{source.label}</span>
                  <strong>{source.count}</strong>
                  <small>{source.at ? `${formatDateTime(source.at)} · ${relativeTime(source.at)}` : '尚未同步'}</small>
                </div>
              ))}
            </div>
            <p className="settings-hint">
              数据文件位于 <code>src/data/</code>，B 站封面位于 <code>public/media/bilibili/</code>；
              最近整体同步：{SYNC_STATUS.updatedAt ? formatDateTime(SYNC_STATUS.updatedAt) : '未知'}。
            </p>
          </Reveal>

          <Reveal as="section" className="article-card" id="commits">
            <div className="article-card__head">
              <div>
                <p className="eyebrow">COMMITS</p>
                <h2>最近提交</h2>
              </div>
              <button type="button" className="text-btn" onClick={refreshCommits} disabled={refreshing}>
                <ArrowClockwiseRegular aria-hidden />
                {refreshing ? '获取中…' : '刷新'}
              </button>
            </div>
            <p>
              构建时读取 <code>git log</code> 生成快照；也可以点击刷新从 GitHub API 获取最新记录。
              每一条都包含提交时间、作者与说明。
            </p>
            <div className="article-callout">
              <strong>主分支从 3.0 开始</strong>
              <p>
                3.0 是一次从零开始的重写，<code>main</code> 的提交历史从本次重构开始；
                2.0 的完整提交记录仍保留在{' '}
                <a href={`${LINKS.repo}/commits/2.0-final`} target="_blank" rel="noopener noreferrer">
                  2.0-final 分支
                </a>
                。随着后续开发，这里会自动积累更多提交。
              </p>
            </div>
            {commits.length === 0 ? (
              <div className="empty-inline">
                <HistoryRegular aria-hidden />
                <p>当前构建没有嵌入提交历史（可能是浅克隆）。</p>
                <a href={`${LINKS.repo}/commits/main`} target="_blank" rel="noopener noreferrer">
                  在 GitHub 查看提交历史 <OpenRegular aria-hidden />
                </a>
              </div>
            ) : (
              <ol className="commit-list">
                {commits.map((commit) => (
                  <li key={commit.hash}>
                    <a href={commit.url} target="_blank" rel="noopener noreferrer" className="commit-item">
                      <span className="commit-item__hash">{commit.short}</span>
                      <span className="commit-item__main">
                        <strong>{commit.subject}</strong>
                        <span>
                          {commit.author} · {formatDateTime(commit.time)} · {relativeTime(commit.time)}
                        </span>
                      </span>
                      <OpenRegular className="commit-item__open" aria-hidden />
                    </a>
                  </li>
                ))}
              </ol>
            )}
            <a className="text-link" href={`${LINKS.repo}/commits/main`} target="_blank" rel="noopener noreferrer">
              在 GitHub 查看全部提交 <OpenRegular aria-hidden />
            </a>
          </Reveal>

          <Reveal as="section" className="article-card" id="design">
            <p className="eyebrow">DESIGN</p>
            <h2>设计理念</h2>
            <p>
              目标不是复刻某个产品，而是把 Fluent Design Sun Valley 的“安静、分层、可读”与
              苹果液态玻璃的“悬浮、折射、高光”放在一起，同时保证关掉玻璃后仍然成立。
            </p>
            <div className="design-grid">
              <div className="design-card">
                <span className="design-card__icon"><SparkleRegular aria-hidden /></span>
                <h3>Fluent 的秩序</h3>
                <p>8px 圆角、Segoe UI Variable、Mica / Acrylic 表面、克制的阴影与强调色。</p>
              </div>
              <div className="design-card">
                <span className="design-card__icon"><FluentIcon name="glass" size={22} aria-hidden /></span>
                <h3>液态玻璃的悬浮</h3>
                <p>背景模糊 + 饱和度 + 顶部高光。可在设置中关闭，关闭后回到实色表面。</p>
              </div>
              <div className="design-card">
                <span className="design-card__icon"><FluentIcon name="motion" size={22} aria-hidden /></span>
                <h3>动效有边界</h3>
                <p>只为状态变化服务；减少动画时关闭揭示、视差与粒子，不做无意义循环。</p>
              </div>
            </div>
            <div className="article-callout">
              <strong>侧边栏与页眉</strong>
              <p>
                侧栏是直角矩形，收起时完全移出视口；展开时以浮层覆盖内容。页眉默认展开，
                全屏闲置后自动收起，鼠标移向顶部立即恢复，并且可以在设置里关闭或扩展为滚动收起。
              </p>
            </div>
          </Reveal>

          <Reveal as="section" className="article-card" id="tech">
            <p className="eyebrow">STACK</p>
            <h2>技术栈</h2>
            <div className="tech-grid">
              {TECH_STACK.map((tech) => (
                <div className="tech-card" key={tech.name}>
                  <CheckmarkCircleRegular aria-hidden />
                  <div>
                    <strong>{tech.name}</strong>
                    <span>{tech.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal as="section" className="article-card" id="performance">
            <p className="eyebrow">PERFORMANCE</p>
            <h2>性能与加载</h2>
            <p>
              页面不是一次性全部加载。下面是从输入 URL 到可以交互的顺序，以及每一步刻意做的取舍。
            </p>
            <ol className="load-steps">
              {LOAD_STEPS.map((step) => (
                <li key={step.step}>
                  <span className="load-steps__index">{step.step}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="perf-grid">
              <div>
                <strong>首屏 JS</strong>
                <span>只含 React、图标与首页；哔哩哔哩数据在路由 chunk 中。</span>
              </div>
              <div>
                <strong>图片</strong>
                <span>251 张封面共约 3.0MB，单张平均 12KB，进入视口才加载。</span>
              </div>
              <div>
                <strong>字体</strong>
                <span>使用系统字体，不下载 8MB 的中文字体。</span>
              </div>
              <div>
                <strong>重复访问</strong>
                <span>Service Worker 缓存静态资源，HTML 走网络优先。</span>
              </div>
            </div>
          </Reveal>

          <Reveal as="section" className="article-card" id="structure">
            <p className="eyebrow">STRUCTURE</p>
            <h2>目录结构</h2>
            <CodeBlock
              title="src/"
              code={`src/
├─ components/     # 布局、通用组件、首页 / 视频 / 设置
├─ pages/          # 34 个路由级页面（懒加载）
├─ hooks/          # 设置、搜索、页眉自动收起、计数等
├─ lib/            # 路由、设置、格式化、搜索、PWA
├─ data/           # 站点内容、留言、视频、GitHub / 同步状态
├─ generated/      # 构建期生成的 site-meta.json
└─ styles/         # tokens / base / shell / components / pages

scripts/
├─ generate-meta.mjs       # 版本 + git log → site-meta.json
├─ sync-all.mjs            # 每天外部数据同步编排
├─ build-videos-data.mjs   # B 站缓存 → videos.ts
└─ fetch-covers.mjs        # 抓取封面与元数据（Actions 每天）

public/
├─ media/bilibili/  # 251 张 640×360 WebP
├─ media/wallpapers/# 8 张 1920px WebP
├─ icons/           # logo / favicon
├─ manifest.webmanifest
└─ sw.js`}
            />
          </Reveal>

          <Reveal as="section" className="article-card" id="develop">
            <p className="eyebrow">DEVELOP</p>
            <h2>本地开发</h2>
            <p>需要 Node.js 20+。首次安装后，开发和构建都会自动生成版本 / 提交元数据。</p>
            <CodeBlock
              title="终端"
              code={`npm install
npm run dev        # http://localhost:4173
npm run build      # tsc -b && vite build
npm run preview    # 预览 dist
npm test           # 纯函数单元测试

# 手动执行完整外部数据同步（可选）：
npm run data:sync`}
            />
            <p className="settings-hint">
              哔哩哔哩数据由 <code>scripts/bilibili-source.json</code>（人工整理 + 自动追加）与
              <code>scripts/bilibili-cache.json</code>（B 站公开接口）合并生成；修改后运行
              <code>node scripts/build-videos-data.mjs</code>。
            </p>
          </Reveal>

          <Reveal as="section" className="article-card" id="license">
            <p className="eyebrow">LICENSE</p>
            <h2>许可与致谢</h2>
            <div className="license-grid">
              <div>
                <ShieldRegular aria-hidden />
                <strong>代码：GPL-3.0</strong>
                <p>可自由使用、修改与分发，衍生作品需以相同协议开源。</p>
                <a href={LINKS.license} target="_blank" rel="noopener noreferrer">
                  查看许可证 <OpenRegular aria-hidden />
                </a>
              </div>
              <div>
                <DocumentRegular aria-hidden />
                <strong>内容：CC BY-NC-SA 4.0</strong>
                <p>文字与影像归档保留署名、非商业与相同方式共享要求。</p>
                <a href={SITE.contentLicenseUrl} target="_blank" rel="noopener noreferrer">
                  查看协议 <OpenRegular aria-hidden />
                </a>
              </div>
              <div>
                <CodeRegular aria-hidden />
                <strong>图标：Fluent UI</strong>
                <p>图标来自 Microsoft Fluent System Icons（MIT），通过 @fluentui/react-icons 按需引入。</p>
                <a href="https://github.com/microsoft/fluentui-system-icons" target="_blank" rel="noopener noreferrer">
                  图标仓库 <OpenRegular aria-hidden />
                </a>
              </div>
            </div>
            <p className="settings-hint">
              壁纸与影像封面来自作者本人的游戏截图 / B 站公开封面；Minecraft 相关内容版权归 Mojang / Microsoft 所有。
              留言摘录保留原话，已尽力标注作者。
            </p>
          </Reveal>

          <Reveal as="section" className="article-card" id="changelog">
            <p className="eyebrow">CHANGELOG</p>
            <h2>更新日志</h2>
            <ol className="changelog">
              {CHANGELOG.map((entry) => (
                <li key={entry.version}>
                  <div className="changelog__head">
                    <strong>v{entry.version}</strong>
                    <span>{entry.date}</span>
                  </div>
                  <ul>
                    {entry.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <div className="about-sidebar">
          <TableOfContents items={TOC_ITEMS} active={active} />
          <div className="about-side-card">
            <p className="eyebrow">SHORTCUT</p>
            <h3>个性化这台站点</h3>
            <p>主题色、壁纸、液态玻璃、粒子和页眉行为都在设置里。</p>
            <Button variant="primary" icon={<SettingsRegular aria-hidden />} onClick={openSettings}>
              打开设置
            </Button>
          </div>
          <div className="about-side-card">
            <p className="eyebrow">LINKS</p>
            <a href={LINKS.repo} target="_blank" rel="noopener noreferrer">
              <FluentIcon name="github" size={16} aria-hidden /> 源码仓库
            </a>
            <a href={LINKS.repo2} target="_blank" rel="noopener noreferrer">
              <BranchRegular aria-hidden /> 2.0-final 分支
            </a>
            <a href={LINKS.bilibili} target="_blank" rel="noopener noreferrer">
              <FluentIcon name="tv" size={16} aria-hidden /> 哔哩哔哩
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


