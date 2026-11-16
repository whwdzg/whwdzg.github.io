/** 简单数据包项目页 / Simple one-function data packs (Only Survival Mode, Glowing Players). */
import { useMemo } from 'react';
import { ArrowRightRegular, CodeRegular, OpenRegular, ShieldRegular, SparkleRegular } from '@fluentui/react-icons';
import { Link, useRouter } from '../../lib/router';
import { PROJECTS, projectById } from '../../data/site';
import { formatViews } from '../../lib/format';
import { ProjectShell } from '../../components/projects/ProjectShell';
import { CodeBlock } from '../../components/common/CodeBlock';
import { Reveal } from '../../components/common/Reveal';
import '../../styles/projects.css';

interface SimplePackInfo {
  projectId: string;
  code: string;
  file: string;
  behavior: string[];
  useCases: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  notice: string;
}

const PACKS: Record<string, SimplePackInfo> = {
  'only-survival-mode': {
    projectId: 'only-survival-mode',
    file: 'data/only-survival-mode/function/survival.mcfunction',
    code: 'gamemode survival @a',
    behavior: [
      '每个游戏 tick 对全体玩家执行一次 gamemode survival。',
      '即使玩家拥有 OP 或开启命令权限，也会被立即切回生存。',
      '不修改死亡、难度、作弊开关或任何其他游戏规则。',
    ],
    useCases: [
      { title: '生存服务器', text: '防止管理员或命令方块误把玩家切成创造，保持生存服的经济与进度公平。' },
      { title: '挑战整合包', text: '配合硬核任务线，禁止玩家用命令逃避生存限制。' },
      { title: '单人存档', text: '管住自己想切创造的手；需要建造时暂时卸下数据包即可。' },
    ],
    faq: [
      { q: '会影响旁观者模式吗？', a: '会。@a 包含所有玩家，因此旁观者也会被切回生存；如果需要保留旁观，请修改 mcfunction 中的选择器。' },
      { q: '为什么一进游戏就被切回生存？', a: '这是预期行为。数据包每 tick 执行，任何模式切换都会在下一 tick 被覆盖。' },
      { q: '支持哪些版本？', a: '当前支持 1.21 – 26.3。旧版本请从 Modrinth 下载 1.0.1.1 或更早文件。' },
    ],
    notice: '这是一个“强制规则”型数据包。确认你真的想禁止所有模式切换后再安装。',
  },
  'glowing-players': {
    projectId: 'glowing-players',
    file: 'data/glowing-players/function/glow.mcfunction',
    code: 'effect give @a glowing infinite 0 true',
    behavior: [
      '每个 tick 给全体玩家施加无限时长的发光效果。',
      '隐藏粒子（true），只保留轮廓高亮，不会满屏粒子。',
      '效果等级为 0（发光 I），与夜视 / 其他状态效果并存。',
    ],
    useCases: [
      { title: 'PVP 服务器', text: '让所有玩家在远处也能被看见，减少伏击与“消失”争议。' },
      { title: '捉迷藏 / 小游戏', text: '作为“全员暴露”模式的基础规则，或配合队伍系统使用。' },
      { title: '服务器管理', text: '快速定位玩家，尤其是在大型建筑或地下洞穴中。' },
    ],
    faq: [
      { q: '为什么 1.20 及以下不能用？', a: '自 1.0.1 起项目只支持 1.21+。旧版本请使用 Modrinth 上的 1.0.0.1 文件。' },
      { q: '发光效果会被 /effect clear 清除吗？', a: '会，但下一 tick 会重新施加。若要临时关闭，请先卸下数据包。' },
      { q: '有粒子吗？', a: '没有。效果使用 hideParticles=true，只显示实体轮廓。' },
    ],
    notice: '发光效果对全体玩家生效，包括隐身玩家；这是 PVP 与捉迷藏场景的核心设计。',
  },
};

const TOC = [
  { id: 'overview', label: '总览' },
  { id: 'how', label: '工作原理' },
  { id: 'install', label: '安装' },
  { id: 'compatibility', label: '兼容性' },
  { id: 'faq', label: '常见问题' },
  { id: 'links', label: '下载与链接' },
];

export default function SimplePackPage() {
  const { path } = useRouter();
  const project = projectById(path);
  const toc = useMemo(() => TOC, []);
  const info = project ? PACKS[project.id] : undefined;
  if (!project || !info) return null;

  return (
    <ProjectShell project={project} toc={toc}>
      <Reveal as="section" className="article-card project-overview" id="overview">
        <p className="eyebrow">OVERVIEW</p>
        <h2>{project.id === 'only-survival-mode' ? '只做一件事：不许切模式' : '只做一件事：让所有人发光'}</h2>
        <p>{project.detail}</p>
        <div className="project-stat-grid">
          <div>
            <strong>1</strong>
            <span>个 mcfunction</span>
          </div>
          <div>
            <strong>{project.id === 'only-survival-mode' ? '每 tick' : '∞'}</strong>
            <span>{project.id === 'only-survival-mode' ? '执行频率' : '效果时长'}</span>
          </div>
          <div>
            <strong>{formatViews(project.downloads)}</strong>
            <span>Modrinth 下载</span>
          </div>
          <div>
            <strong>26.3</strong>
            <span>当前支持</span>
          </div>
        </div>
        <div className="project-feature-grid">
          <div>
            {project.id === 'only-survival-mode' ? <ShieldRegular aria-hidden /> : <SparkleRegular aria-hidden />}
            <strong>{project.id === 'only-survival-mode' ? '规则明确' : '零粒子'}</strong>
            <p>{project.id === 'only-survival-mode' ? '没有配置项、没有依赖，只保留一条不可绕过的规则。' : '只显示轮廓，不影响视野与帧率。'}</p>
          </div>
          <div>
            <CodeRegular aria-hidden />
            <strong>两个命令</strong>
            <p>加载与 tick 标签各一行，安装后立即生效，不需要重新开档。</p>
          </div>
          <div>
            <ArrowRightRegular aria-hidden />
            <strong>可随时移除</strong>
            <p>卸下数据包并执行 <code>/reload</code>，服务器立即恢复原版行为。</p>
          </div>
        </div>
        <div className="project-callout">
          <CodeRegular aria-hidden />
          <p>{info.notice}</p>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="how">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>工作原理</h2>
        <p className="project-section-lead">
          逻辑全部在一个 mcfunction 里，由 <code>minecraft:tick</code> 函数标签每 tick 调用：
        </p>
        <CodeBlock code={info.code} title={info.file} language="mcfunction" />
        <ul className="project-list">
          {info.behavior.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="project-feature-grid">
          {info.useCases.map((useCase) => (
            <div key={useCase.title}>
              <strong>{useCase.title}</strong>
              <p>{useCase.text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="install">
        <p className="eyebrow">INSTALL</p>
        <h2>安装</h2>
        <div className="project-steps">
          <div>
            <span>01</span>
            <div>
              <strong>下载对应版本</strong>
              <p>从 Modrinth 选择数据包或模组版本；数据包版本是 zip，模组版本是 jar。</p>
            </div>
          </div>
          <div>
            <span>02</span>
            <div>
              <strong>放入目录</strong>
              <p>数据包放进存档的 <code>datapacks/</code>，模组放进 <code>mods/</code>；服务器同理。</p>
            </div>
          </div>
          <div>
            <span>03</span>
            <div>
              <strong>重载</strong>
              <p>执行 <code>/reload</code> 或重启服务器，规则会在下一 tick 生效。</p>
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
                <td>1.21 – 26.3</td>
                <td><span className="status-dot" /> 支持</td>
                <td>当前主分支，支持数据包与模组加载器。</td>
              </tr>
              <tr>
                <td>1.13 – 1.20.4</td>
                <td>旧版本</td>
                <td>{project.id === 'only-survival-mode' ? '1.0.1.1 及更早版本可用。' : '自 1.0.1 起不再支持；旧版本请使用 1.0.0.1。'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="faq">
        <p className="eyebrow">FAQ</p>
        <h2>常见问题</h2>
        <div className="project-faq">
          {info.faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="links">
        <p className="eyebrow">LINKS</p>
        <h2>下载与链接</h2>
        <div className="project-link-grid">
          <a href={project.modrinth} target="_blank" rel="noopener noreferrer">
            <strong>Modrinth</strong>
            <span>数据包与模组下载</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            <strong>GitHub</strong>
            <span>源码与版本记录</span>
            <OpenRegular aria-hidden />
          </a>
        </div>
        <p className="project-note">本项目使用 GPL-3.0 许可。函数代码可在 GitHub 仓库中直接查看。</p>
        <Link className="text-link" to="/projects/modrinth/">
          查看全部 {PROJECTS.length} 个项目 <ArrowRightRegular aria-hidden />
        </Link>
      </Reveal>
    </ProjectShell>
  );
}
