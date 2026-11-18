/** 更好的合成配方项目页 / Better Crafting Recipes project page. */
import { useMemo } from 'react';
import {
  ArrowRightRegular,
  CheckmarkCircleRegular,
  CubeRegular,
  DocumentRegular,
  OpenRegular,
  WrenchRegular,
} from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { PROJECTS, projectById } from '../../data/site';
import { CRAFTING_ADVANCEMENTS, CRAFTING_RECIPES, CRAFTING_STATS } from '../../data/projects/crafting';
import { formatViews } from '../../lib/format';
import { ProjectShell } from '../../components/projects/ProjectShell';
import { RecipeBrowser } from '../../components/projects/RecipeBrowser';
import { AdvancementTree } from '../../components/projects/AdvancementTree';
import { Reveal } from '../../components/common/Reveal';
import { McmodComments } from '../../components/projects/McmodComments';
import { BilibiliEmbed } from '../../components/common/BilibiliEmbed';
import '../../styles/projects.css';

const TOC = [
  { id: 'overview', label: '总览' },
  { id: 'video', label: '视频' },
  { id: 'recipes', label: '配方清单' },
  { id: 'advancements', label: '进度树' },
  { id: 'install', label: '安装' },
  { id: 'compatibility', label: '兼容性' },
  { id: 'faq', label: '常见问题' },
  { id: 'links', label: '下载与链接' },
  { id: 'mcmod-comments', label: 'MC百科评论' },
];

export default function CraftingProjectPage() {
  const project = projectById('better-crafting-recipes');
  const toc = useMemo(() => TOC, []);
  if (!project) return null;

  return (
    <ProjectShell project={project} toc={toc}>
      <Reveal as="section" className="article-card project-overview" id="overview">
        <p className="eyebrow">OVERVIEW</p>
        <h2>把“本该能合成”的东西补回来</h2>
        <p>
          更好的合成配方为原版补充了 {CRAFTING_STATS.total} 个配方：从锁链盔甲、马铠、鞍，到切石机加工、腐肉烧皮革与
          头颅回收。设计目标是让生存流程更顺，而不是把难度直接抹平。
        </p>

        <div className="project-stat-grid">
          <div>
            <strong>{CRAFTING_STATS.total}</strong>
            <span>新配方</span>
          </div>
          <div>
            <strong>{CRAFTING_STATS.stonecutting}</strong>
            <span>切石机配方</span>
          </div>
          <div>
            <strong>{CRAFTING_STATS.shaped + CRAFTING_STATS.shapeless}</strong>
            <span>工作台配方</span>
          </div>
          <div>
            <strong>{CRAFTING_STATS.advancements}</strong>
            <span>进度</span>
          </div>
        </div>

        <div className="project-feature-grid">
          <div>
            <CheckmarkCircleRegular aria-hidden />
            <strong>生存友好</strong>
            <p>配方材料全部来自原版可获取资源，不添加新物品，也不需要额外模组。</p>
          </div>
          <div>
            <CubeRegular aria-hidden />
            <strong>四种工作方块</strong>
            <p>工作台有序 / 无序合成、切石机与熔炉，全部在页面里可视化。</p>
          </div>
          <div>
            <WrenchRegular aria-hidden />
            <strong>进度可追踪</strong>
            <p>配套 {CRAFTING_STATS.advancements} 个进度，拿到工作台后就能在进度菜单里查看。</p>
          </div>
        </div>

        <div className="station-row" aria-label="涉及的工作方块">
          <div>
            <img src="/media/minecraft/stations/crafting_table.png" alt="" width={36} height={36} loading="lazy" />
            <span>
              <strong>工作台</strong>
              <small>{CRAFTING_STATS.shaped} 有序 + {CRAFTING_STATS.shapeless} 无序</small>
            </span>
          </div>
          <div>
            <img src="/media/minecraft/stations/stonecutter.png" alt="" width={36} height={36} loading="lazy" />
            <span>
              <strong>切石机</strong>
              <small>{CRAFTING_STATS.stonecutting} 个加工配方</small>
            </span>
          </div>
          <div>
            <img src="/media/minecraft/stations/furnace.png" alt="" width={36} height={36} loading="lazy" />
            <span>
              <strong>熔炉</strong>
              <small>{CRAFTING_STATS.smelting} 个熔炼配方</small>
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="video">
        <p className="eyebrow">VIDEO</p>
        <h2>视频演示</h2>
        <p className="project-section-lead">来自哔哩哔哩的配方介绍视频，点击封面即可在正文内播放。</p>
        <BilibiliEmbed
          bvid="BV1gJDqYpEHS"
          title="【数据包/模组】缺少合适的配方对相应物品进行合成？是时候试试whwdzg's Recipe了"
          cover="/media/bilibili/v10.webp"
          duration="0:29"
          url="https://www.bilibili.com/video/BV1gJDqYpEHS/"
        />
      </Reveal>

      <Reveal as="section" className="article-card" id="recipes">
        <div className="article-card__head">
          <div>
            <p className="eyebrow">RECIPES</p>
            <h2>配方清单</h2>
          </div>
          <span className="badge badge--accent">{formatViews(project.downloads)} 下载</span>
        </div>
        <p className="project-section-lead">
          搜索物品名称或 ID，或按工作方块筛选。每个卡片都使用 Minecraft 26.3 的物品贴图；标签材料会显示首个代表物品与候选数量。
        </p>
        <RecipeBrowser recipes={CRAFTING_RECIPES} />
      </Reveal>

      <Reveal as="section" className="article-card" id="advancements">
        <div className="article-card__head">
          <div>
            <p className="eyebrow">ADVANCEMENTS</p>
            <h2>进度树</h2>
          </div>
          <span className="badge">{CRAFTING_STATS.displayedAdvancements} 个展示节点</span>
        </div>
        <p className="project-section-lead">
          共 {CRAFTING_STATS.advancements} 个进度文件，其中 {CRAFTING_STATS.displayedAdvancements} 个带展示信息。点击节点可以展开子进度。
        </p>
        <AdvancementTree nodes={CRAFTING_ADVANCEMENTS} />
      </Reveal>

      <Reveal as="section" className="article-card" id="install">
        <p className="eyebrow">INSTALL</p>
        <h2>安装</h2>
        <div className="project-steps">
          <div>
            <span>01</span>
            <div>
              <strong>选择对应版本</strong>
              <p>按下方兼容表选择对应分支：26.3 → x.x.x.6，26.1–26.2 → x.x.x.5，1.21.9–1.21.11 → x.x.x.4，1.21.5–1.21.8 → x.x.x.3，1.21.2–1.21.4 → x.x.x.2，1.21–1.21.1 → x.x.x.1，1.13–1.20.4 → x.x.x.0。</p>
            </div>
          </div>
          <div>
            <span>02</span>
            <div>
              <strong>放进 datapacks</strong>
              <p>把 zip 放进存档的 <code>datapacks/</code> 目录，或服务器的同名目录，然后执行 <code>/reload</code>。</p>
            </div>
          </div>
          <div>
            <span>03</span>
            <div>
              <strong>查看配方</strong>
              <p>获得材料后配方会自动解锁；也可以安装 JEI / REI / EMI 直接浏览。</p>
            </div>
          </div>
        </div>
        <div className="project-callout">
          <DocumentRegular aria-hidden />
          <p>
            模组加载器版本可直接从 Modrinth 下载。Forge / NeoForge 需要把数据包放进世界，Fabric / Quilt 也可以使用
            <code> /datapack </code> 命令加载。
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="compatibility">
        <p className="eyebrow">COMPATIBILITY</p>
        <h2>版本与兼容性</h2>
        <div className="project-table-wrap">
          <table className="project-table">
            <thead>
              <tr>
                <th>Minecraft</th>
                <th>版本号分支</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>26.3</td><td>x.x.x.6</td><td>当前主分支，26.3 配方格式与全部进度。</td></tr>
              <tr><td>26.1 – 26.2</td><td>x.x.x.5</td><td>26.x 早期格式，包含对应版本配方。</td></tr>
              <tr><td>1.21.9 – 1.21.11</td><td>x.x.x.4</td><td>1.21.9+ 配方格式。</td></tr>
              <tr><td>1.21.5 – 1.21.8</td><td>x.x.x.3</td><td>1.21.5–1.21.8 配方格式。</td></tr>
              <tr><td>1.21.2 – 1.21.4</td><td>x.x.x.2</td><td>使用 1.21 配方格式与物品组件。</td></tr>
              <tr><td>1.21 – 1.21.1</td><td>x.x.x.1</td><td>1.21 初期配方格式。</td></tr>
              <tr><td>1.13 – 1.20.4</td><td>x.x.x.0</td><td>根进度图标替换为箱子，部分新配方不可用。</td></tr>
            </tbody>
          </table>
        </div>
        <p className="project-note">
          当前仓库 <code>pack.mcmeta</code> 的目标格式为 26.3。版本号前三位是内容版本，最后一位是 Minecraft 分支；旧版本请从 Modrinth 选择对应 x.x.x.N 文件。
        </p>
      </Reveal>

      <Reveal as="section" className="article-card" id="faq">
        <p className="eyebrow">FAQ</p>
        <h2>常见问题</h2>
        <div className="project-faq">
          <details>
            <summary>为什么配方没有出现在配方书里？</summary>
            <p>配方需要先获得对应材料才会解锁；确认数据包已加载，并用 <code>/reload</code> 或重进世界刷新。</p>
          </details>
          <details>
            <summary>支持服务器吗？</summary>
            <p>支持。把数据包放进世界存档的 <code>datapacks/</code>，或者用模组加载器安装；客户端不需要装。</p>
          </details>
          <details>
            <summary>和别的配方数据包冲突吗？</summary>
            <p>如果两个数据包修改同一个配方 ID，后加载的会覆盖先加载的。可以用 <code>/datapack list</code> 调整顺序。</p>
          </details>
          <details>
            <summary>为什么有 150 个进度但只显示了 39 个？</summary>
            <p>其余 111 个是配方解锁进度，没有展示标题与图标，只在后台用于追踪；页面只渲染可读的进度节点。</p>
          </details>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="links">
        <p className="eyebrow">LINKS</p>
        <h2>下载与链接</h2>
        <div className="project-link-grid">
          <a href={project.modrinth} target="_blank" rel="noopener noreferrer">
            <strong>Modrinth</strong>
            <span>下载数据包 / 模组版本</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            <strong>GitHub</strong>
            <span>源码、Issue 与版本记录</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.i18n} target="_blank" rel="noopener noreferrer">
            <strong>语言包</strong>
            <span>简体中文 / English</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.mcmod} target="_blank" rel="noopener noreferrer">
            <strong>MCMOD</strong>
            <span>中文百科条目</span>
            <OpenRegular aria-hidden />
          </a>
        </div>
        <p className="project-note">
          本项目使用 GPL-3.0 许可。页面数据来自本地仓库与 Minecraft 26.3 资源，物品名称与贴图仅用于展示配方。
        </p>
        <Link className="text-link" to="/projects/modrinth/">
          查看全部 {PROJECTS.length} 个项目 <ArrowRightRegular aria-hidden />
        </Link>
      </Reveal>
      <McmodComments slug="better-crafting-recipes" />
    </ProjectShell>
  );
}
