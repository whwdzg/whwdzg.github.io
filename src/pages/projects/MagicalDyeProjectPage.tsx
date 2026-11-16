/** 魔法染料项目页 / Magical Dye project page. */
import { useMemo } from 'react';
import { ArrowRightRegular, ColorRegular, OpenRegular, SparkleRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { PROJECTS, projectById } from '../../data/site';
import { MAGICAL_DYE_ADVANCEMENTS, MAGICAL_DYE_RECIPES, MAGICAL_DYE_STATS } from '../../data/projects/magical-dye';
import { ProjectShell } from '../../components/projects/ProjectShell';
import { RecipeBrowser } from '../../components/projects/RecipeBrowser';
import { AdvancementTree } from '../../components/projects/AdvancementTree';
import { Reveal } from '../../components/common/Reveal';
import '../../styles/projects.css';

const TOC = [
  { id: 'overview', label: '总览' },
  { id: 'recipes', label: '转换配方' },
  { id: 'advancements', label: '进度' },
  { id: 'install', label: '安装' },
  { id: 'compatibility', label: '兼容性' },
  { id: 'faq', label: '常见问题' },
  { id: 'links', label: '下载与链接' },
];

export default function MagicalDyeProjectPage() {
  const project = projectById('magical-dye');
  const toc = useMemo(() => TOC, []);
  if (!project) return null;

  return (
    <ProjectShell project={project} toc={toc}>
      <Reveal as="section" className="article-card project-overview" id="overview">
        <p className="eyebrow">OVERVIEW</p>
        <h2>染料，是物质的转换魔法</h2>
        <p>
          魔法染料是 2025 年愚人节数据包：把任意染料与粉末、矿物块组合，就能改变它们的颜色。听起来像玩笑，但它确实是一套完整的
          无序合成逻辑。
        </p>
        <div className="project-stat-grid">
          <div>
            <strong>{MAGICAL_DYE_STATS.total}</strong>
            <span>转换配方</span>
          </div>
          <div>
            <strong>2</strong>
            <span>配方类别</span>
          </div>
          <div>
            <strong>{MAGICAL_DYE_STATS.displayedAdvancements}</strong>
            <span>进度节点</span>
          </div>
          <div>
            <strong>1.21.4</strong>
            <span>最后支持版本</span>
          </div>
        </div>
        <div className="project-feature-grid">
          <div>
            <ColorRegular aria-hidden />
            <strong>粉末染色</strong>
            <p>火药、糖、红石、萤石粉、烈焰粉与骨粉都能被染料转换。</p>
          </div>
          <div>
            <SparkleRegular aria-hidden />
            <strong>矿物块染色</strong>
            <p>煤炭、铜、钻石、绿宝石、金、青金石、铁、红石、石英、紫水晶与下界合金块。</p>
          </div>
          <div>
            <ArrowRightRegular aria-hidden />
            <strong>无序合成</strong>
            <p>不需要摆形状，把染料和材料放进工作台即可；配方书同样可以解锁。</p>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="recipes">
        <div className="article-card__head">
          <div>
            <p className="eyebrow">RECIPES</p>
            <h2>转换配方</h2>
          </div>
          <span className="badge badge--accent">{MAGICAL_DYE_STATS.total} 个</span>
        </div>
        <p className="project-section-lead">
          每个配方由一个粉末 / 矿物块标签与一种染料组成。标签材料在卡片中显示候选物品数量。
        </p>
        <RecipeBrowser recipes={MAGICAL_DYE_RECIPES} />
      </Reveal>

      <Reveal as="section" className="article-card" id="advancements">
        <p className="eyebrow">ADVANCEMENTS</p>
        <h2>进度</h2>
        <p className="project-section-lead">
          收集粉末与矿物块，完成两条分支后解锁“染料魔法”。共 {MAGICAL_DYE_STATS.advancements} 个进度文件，其中{' '}
          {MAGICAL_DYE_STATS.displayedAdvancements} 个带展示信息。
        </p>
        <AdvancementTree nodes={MAGICAL_DYE_ADVANCEMENTS} />
      </Reveal>

      <Reveal as="section" className="article-card" id="install">
        <p className="eyebrow">INSTALL</p>
        <h2>安装</h2>
        <div className="project-steps">
          <div>
            <span>01</span>
            <div>
              <strong>下载 1.21.2–1.21.4 版本</strong>
              <p>这是愚人节版本，后续 Minecraft 版本没有继续更新。</p>
            </div>
          </div>
          <div>
            <span>02</span>
            <div>
              <strong>放入 datapacks</strong>
              <p>把 zip 放进存档的 <code>datapacks/</code>，执行 <code>/reload</code> 或重进世界。</p>
            </div>
          </div>
          <div>
            <span>03</span>
            <div>
              <strong>开始染色</strong>
              <p>把任意染料与目标材料放进工作台，无序合成即可。</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="compatibility">
        <p className="eyebrow">COMPATIBILITY</p>
        <h2>兼容性</h2>
        <div className="project-table-wrap">
          <table className="project-table">
            <thead>
              <tr>
                <th>Minecraft</th>
                <th>状态</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1.21.2 – 1.21.4</td>
                <td><span className="status-dot" /> 支持</td>
                <td>愚人节版本，配方与进度完整可用。</td>
              </tr>
              <tr>
                <td>1.21.5+ / 26.x</td>
                <td>未更新</td>
                <td>物品组件与配方格式有变化，不保证兼容。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="faq">
        <p className="eyebrow">FAQ</p>
        <h2>常见问题</h2>
        <div className="project-faq">
          <details>
            <summary>为什么叫“魔法”染料？</summary>
            <p>因为它让染料不再只是给羊毛上色，而是直接转换粉末与矿物块——像一种物质转换魔法。</p>
          </details>
          <details>
            <summary>会更新到 26.3 吗？</summary>
            <p>这是 2025 年愚人节限定项目，目前没有更新计划；页面保留完整配方供 1.21.2–1.21.4 使用。</p>
          </details>
          <details>
            <summary>染料标签里为什么有拼写错误？</summary>
            <p>旧版数据包的染料标签存在 <code>miencraft:</code> 拼写问题；页面生成时已做归一化，但游戏内仍以原数据包为准。</p>
          </details>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="links">
        <p className="eyebrow">LINKS</p>
        <h2>下载与链接</h2>
        <div className="project-link-grid">
          <a href={project.modrinth} target="_blank" rel="noopener noreferrer">
            <strong>Modrinth</strong>
            <span>下载 1.21.2–1.21.4 版本</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            <strong>GitHub</strong>
            <span>源码与历史版本</span>
            <OpenRegular aria-hidden />
          </a>
        </div>
        <p className="project-note">本项目使用 GPL-3.0 许可。配方数据来自 2.0 分支保留的愚人节版本。</p>
        <Link className="text-link" to="/projects/modrinth/">
          查看全部 {PROJECTS.length} 个项目 <ArrowRightRegular aria-hidden />
        </Link>
      </Reveal>
    </ProjectShell>
  );
}
