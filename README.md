# 水鱼 Blog · 3.0

滄海水魚（whwdzg）的个人网站，2026 年从零重写。

线上地址：<https://whwdzg.github.io> · 2.0 原站点完整保留在 [`2.0-final`](https://github.com/whwdzg/whwdzg.github.io/tree/2.0-final) 分支。

---

## 这一版做了什么

3.0 不是给 2.0 换皮，而是把页面、样式、脚本和资源全部重新组织：

- **设计语言**：Fluent Design Sun Valley（Mica / Acrylic、8px 圆角、Segoe UI Variable、Fluent 图标）+ 可选的苹果液态玻璃表面。
- **页眉**：固定顶部、玻璃 / 实色可切换；默认展开，全屏闲置时自动收起，鼠标移向顶部立即恢复。设置里可关闭，或扩展为“全屏与滚动”都收起。
- **侧边栏**：直角矩形，不是圆角卡片；收起时彻底移出视口，不保留窄条；展开时以浮层覆盖内容，点击遮罩或 `Esc` 收起。桌面默认收起，避免遮挡首屏。
- **主页**：全幅影像轮播、大字号标题、滚动揭示、数字滚动、悬停高光、时间线与 CTA。轮播只渲染当前与下一张图。
- **哔哩哔哩页**：43 条影像归档，支持标题 / 简介 / BV 号搜索、状态与年份筛选、最新 / 最早 / 标题 / 播放量排序、网格 / 列表视图、详情弹窗、上一条 / 下一条、随机一条。
- **留言板**：保留人工整理的留言与回复，新增本地草稿编辑器（自动保存、预览、复制、跳转 B 站私信）、留言锚点与目录。
- **关于页**：版本号、构建时间、当前提交、最近提交时间线（构建时快照，可手动从 GitHub API 刷新）、设计 / 技术 / 性能说明、目录结构与本地开发命令。
- **设置面板**：主题、强调色（含自定义）、液态玻璃、8 张壁纸与每日轮换、页眉进度条、粒子动画（樱花 / 梧桐 / 银杏 / 雪花）、动效偏好、页眉自动收起、性能模式、PWA 安装、缓存清理、设置导入导出、UA 与版本信息。
- **PWA**：manifest、Service Worker（导航 network-first，静态资源 cache-first）、离线页与安装入口。
- **部署**：Vite 多入口构建，GitHub Actions 构建并发布到 GitHub Pages。

### 还没搬过来的部分

2.0 的工具页（Base64 / BaseX / Unicode / 进制 / 计算器 / MC 投影）与项目详情页尚未在 3.0 中重做，旧内容仍在 `2.0-final` 分支。侧边栏的项目区直接指向 Modrinth / GitHub，归档区提供 2.0 源码与 Legacy 1.0 的入口。后续可以按同一套设计系统继续迁移。

---

## 快速开始

需要 Node.js 20.19+（CI 使用 Node 22）。

```bash
npm install
npm run dev        # http://localhost:4173
npm run build      # tsc -b && vite build
npm run preview    # 预览 dist
npm test           # 纯函数 / 数据单元测试（25 项）
npm run typecheck  # 只跑 TypeScript
```

`predev` / `prebuild` 会自动运行 `scripts/generate-meta.mjs`，生成 `src/generated/site-meta.json`（版本、提交、构建时间、最近 30 条 `git log`）。

### 更新哔哩哔哩封面

```bash
npm run fetch:covers
```

脚本会：

1. 读取 `scripts/bilibili-source.json`（2.0 人工整理的 43 条记录）；
2. 调用 B 站公开接口获取标题、发布日期、时长、播放量与封面；
3. 直接下载 `@640w_360h.webp`，写入 `public/media/bilibili/vNN.webp`；
4. 更新 `scripts/bilibili-cache.json`；
5. 自动运行 `node scripts/build-videos-data.mjs` 生成 `src/data/videos.ts`。

已私密 / 已失效的视频会返回 `62002` / `62012`，脚本保留本地封面与旧数据，不会破坏归档。封面抓取是开发期手动步骤，CI 只使用已经提交的本地资源。

### 目录结构

```
├─ index.html                  # 主页入口
├─ bilibili/index.html         # 影像归档入口
├─ comments/index.html         # 留言板入口
├─ about/index.html            # 关于入口
├─ src/
│  ├─ components/
│  │  ├─ layout/               # Header、Sidebar、Footer、Wallpaper、ParticleField
│  │  ├─ common/               # Button、Modal、Sheet、Reveal、TOC、Switch…
│  │  ├─ home/                 # 轮播、主页区块、跑马灯
│  │  ├─ bilibili/             # 视频卡片、详情弹窗
│  │  ├─ settings/             # 设置面板
│  │  └─ search/               # 命令面板搜索
│  ├─ pages/                   # 4 个路由级页面（懒加载）
│  ├─ hooks/                   # 设置、搜索、页眉自动收起、计数、全屏…
│  ├─ lib/                     # 路由、设置、壁纸、格式化、搜索、PWA
│  ├─ data/                    # 站点内容、留言、视频数据（生成）
│  ├─ generated/               # 构建期 site-meta.json
│  └─ styles/                  # tokens / base / shell / components / home / pages / responsive
├─ scripts/
│  ├─ generate-meta.mjs
│  ├─ build-videos-data.mjs
│  ├─ fetch-covers.mjs
│  ├─ bilibili-source.json
│  └─ bilibili-cache.json
├─ public/
│  ├─ media/bilibili/          # 43 张 640×360 WebP 封面
│  ├─ media/hero/              # 1440×810 WebP 首屏图
│  ├─ media/wallpapers/        # 1920px WebP 壁纸
│  ├─ media/avatars/           # 头像 WebP
│  ├─ media/projects/          # Modrinth 项目图标 WebP
│  ├─ icons/                   # logo / favicon
│  ├─ manifest.webmanifest
│  ├─ sw.js
│  ├─ 404.html
│  └─ offline.html
└─ .github/workflows/deploy.yml
```

---

## 性能与加载策略

3.0 的取舍是“首屏只加载首屏需要的东西”。

| 项目 | 体积（构建报告，gzip） | 说明 |
| --- | ---: | --- |
| React 运行时 chunk | ~69 KB | React 19 + ReactDOM + scheduler，长期缓存 |
| 入口 / 壳层 | ~26 KB | 路由、设置、页眉、侧栏、弹窗、搜索 |
| Fluent 图标 chunk | ~10 KB | 只打包实际使用的图标 |
| 全局 CSS | ~17 KB | 变量、基础、壳层与常用组件 |
| 首页 chunk | ~6.4 KB | 轮播与主页区块 |
| 影像页 chunk + 数据 | ~11 KB | 43 条数据 + 卡片与详情 |
| 关于页 chunk | ~6.8 KB | 版本、提交、说明 |

其余策略：

- **多入口**：`/`、`/bilibili/`、`/comments/`、`/about/` 各自是真实 HTML，直链与刷新无需 404 重写。
- **路由级懒加载**：首屏不加载影像数据、详情弹窗和关于页。
- **空闲预取**：首屏稳定后用 `requestIdleCallback` 预取其他页 chunk；导航悬停 / 聚焦也会提前加载。
- **图片**：封面统一 640×360 WebP，43 张合计约 649 KB，单张平均约 15 KB；全部 `loading="lazy"`、固定宽高、`decoding="async"`。首屏图单独生成 1440×810 WebP。
- **壁纸**：在 `requestIdleCallback` 中解码，图片加载完成后再淡入，不参与 LCP 竞争；`prefers-reduced-motion` / 节省流量时跳过。
- **字体**：只使用系统字体（Segoe UI Variable / Microsoft YaHei UI 等），不下载几 MB 的中文字体。
- **玻璃**：只在页眉、侧栏、弹窗、搜索等关键表面使用 `backdrop-filter`；关闭后回到实色表面。不支持 `backdrop-filter` 的浏览器自动降级。
- **粒子**：Canvas，最多 28 个粒子，DPR 上限 1.5，页面隐藏或减少动画时停止 rAF。
- **Service Worker**：导航 network-first，带 hash 的静态资源 cache-first；每次部署用构建 ID 生成新缓存名，activate 时清理旧缓存。
- **动效**：只用 CSS transform / opacity；滚动揭示用 IntersectionObserver；视差只写一个 CSS 变量；减少动画时自动关闭。

---

## 设置与兼容

- 设置保存在 `localStorage` 的 `whwdzg-site-settings-v3`。
- 首次打开会尝试迁移 2.0 的 `theme-color`、`setting-lightdarktoggle`、`setting-wallpaperselection`、`setting-particleanimation`、`show-page-progress` 等旧键。
- 主题 / 强调色 / 玻璃在 HTML 内联脚本中先于 CSS 应用，避免首屏闪烁。
- 侧栏展开时使用焦点陷阱与滚动锁；`Esc`、点击遮罩、点击导航都会收起。
- 搜索：`Ctrl / Cmd + K` 或 `/` 打开，`↑ / ↓` 选择，`Enter` 打开，`Esc` 关闭。
- 浏览器：最近两年的 Edge / Chrome / Firefox / Safari。`color-mix()`、`backdrop-filter`、`content-visibility` 缺失时均有降级；高对比度模式保留边框。

---

## 版本与部署

当前版本 **3.0.0**（`package.json`）。版本号遵循语义化版本：完整重写递增 major，功能新增递增 minor，修复递增 patch。

关于页展示：

- `package.json` 版本；
- 构建时的提交 hash / 提交时间 / 分支；
- 最近 30 条提交（`git log`）；
- 构建时间；
- 可手动从 GitHub API 刷新最近提交。

部署流程（`.github/workflows/deploy.yml`）：

1. `actions/checkout@v4`，`fetch-depth: 0`（完整历史用于提交列表）。
2. Node 22 + `npm ci`。
3. `npm test`。
4. `npm run build`（自动生成版本 / 提交元数据）。
5. 写入 `.nojekyll`，上传 `dist` 并发布到 GitHub Pages。

仓库名为 `whwdzg.github.io`，站点部署在根路径，因此 Vite `base` 为 `/`。如果以后改成项目页路径，需要同步修改 `base`、canonical、manifest 的 `start_url` / `scope` 与 Service Worker 的缓存路径。

---

## 许可

- 代码：[GNU GPL v3.0](LICENSE)。
- 文字与影像归档：CC BY-NC-SA 4.0。
- Fluent 图标：Microsoft Fluent System Icons，MIT，通过 `@fluentui/react-icons` 按需引入。
- Minecraft 相关素材版权归 Mojang / Microsoft；B 站封面来自公开视频页，仅用于归档展示。

留言摘录保留原话并标注作者；如果内容涉及你的权利，请通过 B 站私信联系。

