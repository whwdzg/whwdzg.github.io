/** GitHub 项目页 / Curated GitHub repository index. */
import { ArrowRightRegular, CodeRegular, OpenRegular, StarRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { LINKS, SUBSITES } from '../../data/site';
import { PageIntro } from '../../components/layout/PageIntro';
import { FluentIcon } from '../../components/common/FluentIcon';
import { Reveal } from '../../components/common/Reveal';
import { SectionHeading } from '../../components/common/SectionHeading';
import '../../styles/projects.css';

const OTHER_REPOS = [
  { name: 'whwdzg.github.io', description: '本站源码', href: LINKS.repo },
  { name: 'better-crafting-recipes', description: '更好的合成配方', href: 'https://github.com/whwdzg/better-crafting-recipes' },
  { name: 'better-enchantments', description: '更好附魔', href: 'https://github.com/whwdzg/better-enchantments' },
  { name: 'better-mob-drop', description: '更好的生物掉落', href: 'https://github.com/whwdzg/better-mob-drop' },
  { name: 'only-survival-mode', description: '只允许生存模式', href: 'https://github.com/whwdzg/only-survival-mode' },
  { name: 'glowing-players', description: '玩家持续发光', href: 'https://github.com/whwdzg/glowing-players' },
  { name: 'Magical_Dye', description: '魔法染料（愚人节）', href: 'https://github.com/whwdzg/Magical_Dye' },
];

export default function GitHubProjectsPage() {
  return (
    <div className="page page--modrinth">
      <PageIntro
        eyebrow="PROJECTS · GITHUB"
        title="GitHub 项目"
        lead="这里只详细展开两个独立子站：Asteria Player 与来福 Simulation Wiki。其他仓库保持简单列表，方便找到源码，但不在主站重复介绍。"
        meta={[
          { icon: 'github', label: '2 个详细项目' },
          { icon: 'code', label: `${OTHER_REPOS.length} 个其他仓库` },
          { icon: 'globe', label: 'GitHub Pages 子站' },
        ]}
        actions={
          <>
            <a className="btn btn--primary btn--md" href={LINKS.github} target="_blank" rel="noopener noreferrer">
              <CodeRegular aria-hidden /> GitHub 主页
            </a>
            <Link className="btn btn--ghost btn--md" to="/projects/modrinth/">
              Modrinth 项目 <ArrowRightRegular aria-hidden />
            </Link>
          </>
        }
        aside={
          <div className="modrinth-summary">
            <p className="eyebrow">CURATED</p>
            <div className="modrinth-summary__stats">
              <div>
                <strong>2</strong>
                <span>详细项目</span>
              </div>
              <div>
                <strong>{OTHER_REPOS.length}</strong>
                <span>其他仓库</span>
              </div>
              <div>
                <strong>GPL</strong>
                <span>开源许可</span>
              </div>
            </div>
            <p>详细页包含能力、截图、技术栈与独立入口；其他仓库只列名称与一句话说明。</p>
            <a className="text-link" href={LINKS.github} target="_blank" rel="noopener noreferrer">
              打开 GitHub 主页 <OpenRegular aria-hidden />
            </a>
          </div>
        }
      />

      <div className="container modrinth-page">
        <Reveal as="section" className="article-card" id="detailed">
          <SectionHeading
            eyebrow="DETAILED"
            title="两个独立子站"
            description="它们有独立的代码、构建与 GitHub Pages 部署，主站只做导览。"
          />
          <div className="github-project-grid">
            {SUBSITES.map((site, index) => (
              <Reveal as="article" className="github-project-card" key={site.id} delay={index * 60}>
                <div className="github-project-card__head">
                  <img src={site.icon} alt={`${site.title}图标`} width={56} height={56} loading="lazy" />
                  <div>
                    <p>{site.subtitle}</p>
                    <h3>{site.title}</h3>
                  </div>
                  <span className="badge">子站</span>
                </div>
                <p className="github-project-card__desc">{site.description}</p>
                <div className="github-project-card__links">
                  <Link to={site.path}>
                    项目详情 <ArrowRightRegular aria-hidden />
                  </Link>
                  <a href={site.url} target="_blank" rel="noopener noreferrer">
                    打开子站 <OpenRegular aria-hidden />
                  </a>
                  <a href={site.github} target="_blank" rel="noopener noreferrer">
                    GitHub <OpenRegular aria-hidden />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" className="article-card" id="other">
          <div className="article-card__head">
            <div>
              <p className="eyebrow">OTHER REPOS</p>
              <h2>其他仓库</h2>
            </div>
            <span className="badge">只列入口</span>
          </div>
          <p className="project-section-lead">数据包项目在 Modrinth 项目页有完整介绍；这里仅保留 GitHub 源码入口。</p>
          <div className="github-repo-list">
            {OTHER_REPOS.map((repo) => (
              <a key={repo.href} href={repo.href} target="_blank" rel="noopener noreferrer">
                <FluentIcon name="github" size={16} aria-hidden />
                <span>
                  <strong>{repo.name}</strong>
                  <small>{repo.description}</small>
                </span>
                <OpenRegular aria-hidden />
              </a>
            ))}
          </div>
          <p className="project-note">
            <StarRegular aria-hidden /> 仅列出精选仓库，未列出的仓库仍可在 GitHub 主页找到。
          </p>
        </Reveal>
      </div>
    </div>
  );
}
