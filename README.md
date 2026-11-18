# 水鱼 Blog · 3.6

沧海水鱼（whwdzg）的个人网站，2026 年从零重写。

线上地址：<https://whwdzg.github.io> · 2.0 原站点完整保留在 [`2.0-final`](https://github.com/whwdzg/whwdzg.github.io/tree/2.0-final) 分支。

---

## 这一版做了什么

3.x 不是给 2.0 换皮，而是把页面、样式、脚本和资源全部重新组织：

- **设计语言**：Fluent Design Sun Valley（Mica / Acrylic、8px 圆角、Segoe UI Variable、Fluent 图标）+ 可选的苹果液态玻璃表面。
- **页眉**：固定顶部、玻璃 / 实色可切换；默认展开，全屏闲置时自动收起，鼠标移向顶部立即恢复。设置里可关闭，或扩展为“全屏与滚动”都收起。
- **侧边栏**：直角矩形，不是圆角卡片；收起时彻底移出视口，不保留窄条；展开时以浮层覆盖内容，点击遮罩或 `Esc` 收起。桌面默认收起，避免遮挡首屏。
- **主页**：全幅影像轮播、大字号标题、滚动揭示、数字滚动、悬停高光、时间线与 CTA。轮播只渲染当前与下一张图。
- **哔哩哔哩页**：251 条影像归档，支持标题 / 简介 / BV 号搜索、状态与年份筛选、最新 / 最早 / 标题 / 播放量排序、网格 / 列表视图、详情弹窗、上一条 / 下一条、随机一条。
- **留言板**：保留人工整理的留言与回复，新增本地草稿编辑器（自动保存、预览、复制、跳转 B 站私信）、留言锚点与目录。
- **GitHub 评论区**：新增 `/comments/github/`，直接读取仓库公开 Issue：头像、正文、标签、reactions、回复与时间线；支持筛选 / 搜索 / 深链接 / 引用回复，写入操作统一跳转 GitHub。
- **项目页**：6 个数据包详情页、`/projects/modrinth/` 索引与「掩星」世界观页；合成、附魔、掉落、染料配方与进度树全部可视化。
- **子站**：Asteria Player 与来福 Simulation Wiki 的独立项目页；GitHub 项目页只详细展开这两个子站。
- **工具**：Base64、BaseX、进制转换、Unicode、ClassWiz 风格计算器（函数图像 + LaTeX）、Minecraft 投影查看器，以及 MC 数据包 / 资源包解析器。
- **B 站合集**：通过公开 view 接口同步合集全部成员视频，站内可查看封面、标题、发布日期与时长；GitHub Actions 每周一自动刷新，也可手动触发。
- **链接**：访问带 `.html` 的地址会自动改写成无扩展名的站内路径。
- **体验**：正文图片大图、正文内嵌音乐 / 视频播放器、季节粒子（春夏秋冬）、页眉收起补位、轮播倒计时、中文 Minecraft Wiki 物品链接。
- **关于页**：版本号、构建时间、当前提交、最近提交时间线（构建时快照，可手动从 GitHub API 刷新）、设计 / 技术 / 性能说明、目录结构与本地开发命令。
- **设置面板**：主题、强调色（含自定义）、液态玻璃、8 张壁纸与每日轮换、页眉进度条、粒子动画（樱花 / 梧桐 / 银杏 / 雪花）、动效偏好、页眉自动收起、性能模式、PWA 安装、缓存清理、设置导入导出、UA 与版本信息。
- **PWA**：manifest、Service Worker（导航 network-first，静态资源 cache-first）、离线页与安装入口。
- **部署**：Vite 多入口构建，GitHub Actions 构建并发布到 GitHub Pages。

### 还没搬过来的部分

2.0 的工具页（Base64 / BaseX / Unicode / 进制 / 计算器 / MC 投影）尚未重做，旧内容仍在 `2.0-final` 分支。侧边栏的项目区现在指向站内项目详情页，归档区保留 2.0 源码与 Legacy 1.0 的入口。

---

## 快速开始

需要 Node.js 20.19+（CI 使用 Node 22）。

```bash
npm install
npm run dev        # http://localhost:4173
npm run build      # tsc -b && vite build
npm run preview    # 预览 dist
npm test           # 纯函数 / 数据单元测试（47 项）
npm run typecheck  # 只跑 TypeScript
```

`predev` / `prebuild` 会自动运行 `scripts/generate-meta.mjs`，生成 `src/generated/site-meta.json`（版本、提交、构建时间、最近 30 条 `git log`）。

### 更新哔哩哔哩封面

```bash
npm run fetch:covers
```

脚本会：

1. 读取 `scripts/bilibili-source.json`（2.0 人工记录 + B 站空间同步的新视频）；
2. 调用 B 站公开接口获取标题、发布日期、时长、播放量与封面；
3. 直接下载 `@640w_360h.webp`，写入 `public/media/bilibili/vNN.webp`；
4. 更新 `scripts/bilibili-cache.json`；
5. 自动运行 `node scripts/build-videos-data.mjs` 生成 `src/data/videos.ts`。

已私密 / 已失效的视频会返回 `62002` / `62012`，脚本保留本地封面与旧数据，不会破坏归档。封面抓取与元数据更新由每小时 GitHub Actions 自动完成；本地也可用 `npm run data:sync` 手动执行。

### 更新项目数据

项目页数据由本地数据包仓库和 Minecraft 26.3 客户端资源生成，生成结果全部提交到仓库，CI 不需要这些本地目录：

```bash
npm run data:projects   # 读取数据包仓库 + D:\Documents\assets，生成 src/data/projects/* 与物品贴图
npm run data:sync       # 按顺序同步 Modrinth / MC百科 / GitHub / B站并写状态
npm run data:modrinth   # 同步 Modrinth 项目数字与最新版本快照
npm run data:mcmod      # 抓取 MC百科项目浏览 / 编辑 / 标签数据
npm run data:bilibili   # 同步 B 站空间当前公开视频（仅追加新 BV）
npm run data:collections # 同步 B 站合集全部成员视频、封面与时间
```

### 每小时自动同步

`.github/workflows/sync-data.yml` 每小时运行 `scripts/sync-all.mjs`，更新 `src/data/` 下的快照、B 站封面和 `sync-status.ts`，随后提交并触发 Pages 部署。About 页会显示每个来源最近一次成功获取的时间。

`data:projects` 需要同级目录下存在 `better-crafting-recipes`、`better-enchantments`、`better-mob-drop`、`only-survival-mode`、`glowing-players`，以及 `D:\Documents\assets` 的 Minecraft 资源。脚本会保留所有配方 / 掉落 / 附魔 / 进度关系，并把用到的物品贴图复制到 `public/media/minecraft/items/`。

### 目录结构

```
├─ index.html                  # 主页入口
├─ bilibili/index.html         # 影像归档入口
├─ comments/index.html         # 留言板入口
├─ comments/github/index.html  # GitHub Issue 评论区入口
├─ projects/modrinth/index.html
├─ projects/better-crafting-recipes/index.html
├─ projects/better-enchantments/index.html
├─ projects/better-mob-drop/index.html
├─ projects/magical-dye/index.html
├─ projects/only-survival-mode/index.html
├─ projects/glowing-players/index.html
├─ projects/asteria-player/index.html
├─ projects/life-simulation-wiki/index.html
├─ projects/github/index.html
├─ tools/index.html
├─ tools/base64/index.html
├─ tools/basex/index.html
├─ tools/base-convert/index.html
├─ tools/unicode/index.html
├─ tools/calculator/index.html
├─ tools/mc-projection/index.html
├─ tools/mc-datapack/index.html
├─ tools/mc-resourcepack/index.html
├─ about/index.html            # 关于入口
├─ src/
│  ├─ components/
│  │  ├─ layout/               # Header、Sidebar、Footer、Wallpaper、ParticleField
│  │  ├─ common/               # Button、Modal、Sheet、Reveal、TOC、Switch…
│  │  ├─ home/                 # 轮播、主页区块、跑马灯
│  │  ├─ bilibili/             # 视频卡片、详情弹窗
│  │  ├─ comments/             # GitHub issue 列表、回复时间线、Markdown
│  │  ├─ projects/             # 配方卡、物品槽、进度树、子站外壳
│  │  ├─ tools/                # 工具页外壳
│  │  ├─ settings/             # 设置面板
│  │  └─ search/               # 命令面板搜索
│  ├─ pages/                   # 28 个路由级页面（懒加载），含 projects/ 与 tools/
│  ├─ hooks/                   # 设置、搜索、页眉自动收起、计数、全屏…
│  ├─ lib/                     # 路由、设置、壁纸、搜索、GitHub API、tools/、mc/、PWA
│  ├─ data/                    # 站点内容、留言、视频数据、projects/（生成）
│  ├─ generated/               # 构建期 site-meta.json
│  └─ styles/                  # tokens / base / shell / components / home / pages / github-comments / projects / tools / responsive
├─ scripts/
│  ├─ generate-meta.mjs
│  ├─ build-videos-data.mjs
│  ├─ fetch-covers.mjs
│  ├─ build-project-data.mjs
│  ├─ sync-modrinth.mjs
│  ├─ sync-mcmod.mjs
│  ├─ sync-bilibili-space.mjs
│  ├─ magical-dye-source/      # 愚人节数据包原始 JSON
│  ├─ minecraft-lang-zh_cn.json
│  ├─ minecraft-heads/         # 头颅裁切贴图
│  ├─ bilibili-source.json
│  └─ bilibili-cache.json
├─ public/
│  ├─ media/bilibili/          # 251 张 640×360 WebP 封面
│  ├─ media/hero/              # 1440×810 WebP 首屏图
│  ├─ media/wallpapers/        # 1920px WebP 壁纸
│  ├─ media/avatars/           # 头像 WebP
│  ├─ media/projects/          # Modrinth 项目图标 WebP
│  ├─ media/minecraft/items/   # 329 个 16×16 物品贴图 PNG
│  ├─ mc-assets/               # Minecraft 26.3 blockstates / models / textures
│  ├─ media/minecraft/stations/ # 工作台 / 切石机 / 熔炉图标
│  ├─ icons/                   # logo / favicon
│  ├─ manifest.webmanifest
│  ├─ sw.js
│  ├─ 404.html
│  └─ offline.html
└─ .github/workflows/deploy.yml
```

---

## 性能与加载策略

3.x 的取舍是“首屏只加载首屏需要的东西”。

| 项目 | 体积（构建报告，gzip） | 说明 |
| --- | ---: | --- |
| React 运行时 chunk | ~69 KB | React 19 + ReactDOM + scheduler，长期缓存 |
| 入口 / 壳层 | ~32 KB | 路由、设置、页眉、侧栏、弹窗、搜索 |
| Fluent 图标 chunk | ~10.5 KB | 只打包实际使用的图标 |
| 全局 CSS | ~17.1 KB | 变量、基础、壳层与常用组件 |
| 首页 chunk | ~7.1 KB | 轮播与主页区块 |
| 影像页 chunk + 数据 | ~21 KB | 251 条数据 + 卡片与详情 |
| GitHub 评论区 chunk | ~7.7 KB | Issue 列表、回复时间线、API 封装 |
| Markdown 渲染（按需） | ~27 KB | marked + DOMPurify，只在有 issue 内容时加载 |
| 数据包详情页 | ~4.8–8.4 KB | 配方 / 附魔 / 掉落 / 简单规则页 |
| 进度树与物品注册（共享） | ~9.7 KB | 329 个物品名与贴图路径、进度组件 |
| Three.js（仅投影页） | ~181 KB | 动态 import，只有打开 MC 投影查看器时加载 |
| 关于页 chunk | ~7.1 KB |
| 子站 / 工具页 | ~1.2–7.3 KB | 按路由懒加载；计算器与投影页最重 | 版本、提交、说明 |

其余策略：

- **多入口**：`/`、`/bilibili/`、`/comments/`、`/comments/github/`、`/projects/modrinth/`、6 个 `/projects/<slug>/`、3 个子站 / GitHub 项目页、掩星世界观页、9 个 `/tools/` 页面与 `/about/` 各自是真实 HTML，直链与刷新无需 404 重写。
- **路由级懒加载**：首屏不加载影像数据、GitHub Issue 数据、Markdown 渲染器、数据包配方与关于页；项目详情页不参与空闲预取，避免一次下载全部数据。
- **GitHub API 缓存**：Issue 列表 5 分钟、评论 2 分钟本地缓存；失败时回退旧缓存，并给出速率限制提示。
- **项目数据**：Modrinth 数字为构建前快照，页面不依赖运行时 API；配方 / 掉落表在构建时生成，运行时只加载当前项目的数据 chunk。
- **空闲预取**：首屏稳定后用 `requestIdleCallback` 预取其他页 chunk；导航悬停 / 聚焦也会提前加载。
- **图片**：封面统一 640×360 WebP，251 张合计约 3.0 MB；项目图标为 256×256 WebP；Minecraft 物品图标保留 16×16 PNG（像素画，PNG 比 WebP 更小，329 张合计约 65 KB），全部 `image-rendering: pixelated`、`loading="lazy"`、固定宽高。正文图片只在标记 `data-lightbox` 时进入大图查看器。
- **壁纸**：在 `requestIdleCallback` 中解码，图片加载完成后再淡入，不参与 LCP 竞争；`prefers-reduced-motion` / 节省流量时跳过。
- **字体**：只使用系统字体（Segoe UI Variable / Microsoft YaHei UI 等），不下载几 MB 的中文字体。
- **玻璃**：只在页眉、侧栏、弹窗、搜索等关键表面使用 `backdrop-filter`；关闭后回到实色表面。不支持 `backdrop-filter` 的浏览器自动降级。
- **粒子**：Canvas，最多 28 个粒子；默认跟随春夏秋冬切换（樱花 / 萤火 / 银杏 / 雪花），可手动关闭或指定季节，页面隐藏或减少动画时停止 rAF。
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

当前版本 **3.6.0**（`package.json`）。版本号遵循语义化版本：完整重写递增 major，功能新增递增 minor，修复递增 patch。

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
- Markdown：`marked`（MIT）与 `DOMPurify`（MPL-2.0 / Apache-2.0），仅在 GitHub 评论区按需加载。
- Minecraft 物品贴图与名称来自 Minecraft 26.3 客户端资源，仅用于项目页配方 / 掉落展示；B 站封面来自公开视频页，仅用于归档展示。相关版权归 Mojang / Microsoft 与原作者所有。

留言摘录保留原话并标注作者；如果内容涉及你的权利，请通过 B 站私信联系。

