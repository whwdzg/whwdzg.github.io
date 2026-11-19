/** GitHub 项目页 / Curated GitHub repository index. */
import { ArrowRightRegular, CodeRegular, OpenRegular, StarRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { LINKS, SUBSITES } from '../../data/site';
import { GITHUB_PROFILE, GITHUB_REPOS, GITHUB_SYNCED_AT, githubRepo } from '../../data/github';
import { formatDate, formatViews } from '../../lib/format';
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
        lead="展示 GitHub 个人资料、Star / 关注数据、徽章与贡献图；下方详细展开 Asteria Player 与来福 Simulation Wiki 两个独立子站，其他仓库保持简单入口。"
        meta={[
          { icon: 'github', label: '2 个详细项目' },
          { icon: 'code', label: `${OTHER_REPOS.length} 个其他仓库` },
          { icon: 'globe', label: 'GitHub Pages 子站' },
          { icon: 'refresh', label: "同步 " + formatDate(GITHUB_SYNCED_AT) },
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
        <Reveal as="section" className="article-card github-profile-card" id="profile">
          <div className="github-profile-head">
            <img src={GITHUB_PROFILE.avatar} alt={`${GITHUB_PROFILE.name} 的 GitHub 头像`} width={92} height={92} loading="lazy" />
            <div className="github-profile-head__body">
              <p className="eyebrow">GITHUB · @{GITHUB_PROFILE.login}</p>
              <h2>{GITHUB_PROFILE.name}</h2>
              <p className="github-profile-bio">{GITHUB_PROFILE.bio || '这个账号还没有填写个人简介。'}</p>
              <div className="github-profile-badges" aria-label="徽章">
                <em>徽章</em>
                <span><FluentIcon name="calendar" size={13} aria-hidden /> 加入 GitHub {GITHUB_PROFILE.joined ? Math.max(1, new Date().getFullYear() - new Date(GITHUB_PROFILE.joined).getFullYear()) : '—'} 年</span>
                <span><FluentIcon name="cube" size={13} aria-hidden /> Minecraft 数据包</span>
                <span><FluentIcon name="code" size={13} aria-hidden /> 前端 / 子站</span>
                <span><FluentIcon name="github" size={13} aria-hidden /> {GITHUB_PROFILE.publicRepos} 个公开仓库</span>
              </div>
            </div>
            <a className="btn btn--primary btn--md" href={LINKS.github} target="_blank" rel="noopener noreferrer">
              打开 GitHub <OpenRegular aria-hidden />
            </a>
          </div>
          <div className="github-profile-stats">
            <div><strong>{formatViews(GITHUB_PROFILE.totalStars)}</strong><span>Star</span></div>
            <div><strong>{formatViews(GITHUB_PROFILE.followers)}</strong><span>关注者</span></div>
            <div><strong>{formatViews(GITHUB_PROFILE.following)}</strong><span>关注中</span></div>
            <div><strong>{formatViews(GITHUB_PROFILE.publicRepos)}</strong><span>公开仓库</span></div>
            <div><strong>{formatViews(GITHUB_PROFILE.contributions.total)}</strong><span>年度贡献</span></div>
          </div>
        </Reveal>

        <Reveal as="section" className="article-card github-contrib-card" id="contributions">
          <div className="article-card__head">
            <div>
              <p className="eyebrow">CONTRIBUTIONS</p>
              <h2>贡献图</h2>
            </div>
            <span className="badge">{GITHUB_PROFILE.contributions.total} 次贡献</span>
          </div>
          {GITHUB_PROFILE.contributions.weeks.length ? (
            <>
              <div className="github-contrib-scroll">
                <div className="github-contrib-graph" role="img" aria-label="GitHub 最近一年的贡献图">
                  {GITHUB_PROFILE.contributions.weeks.map((week, weekIndex) => (
                    <div className="github-contrib-week" key={weekIndex}>
                      {week.days.map((day) => (
                        <span
                          key={day.date}
                          className="github-contrib-day"
                          style={{ backgroundColor: day.count ? day.color : undefined }}
                          title={`${day.date} · ${day.count} 次贡献`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="github-contrib-legend">
                <span>少</span>
                {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map((color) => <i key={color} style={{ backgroundColor: color }} />)}
                <span>多</span>
              </div>
            </>
          ) : (
            <p className="project-note">贡献图需要 GitHub Token 才能通过 GraphQL 获取；下一次 Actions 同步后显示。</p>
          )}
        </Reveal>

        <Reveal as="section" className="article-card" id="detailed">
          <SectionHeading
            eyebrow="DETAILED"
            title="两个独立子站"
            description="它们有独立的代码、构建与 GitHub Pages 部署，主站只做导览。"
          />
          <div className="github-project-grid">
            {SUBSITES.map((site, index) => {
              const snapshot = githubRepo(site.github.split('/').pop() ?? '');
              return (
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
                {snapshot && (
                  <p className="github-project-card__snapshot">{'★ '}{snapshot.stars}{' · fork '}{snapshot.forks}{' · 更新 '}{formatDate(snapshot.updatedAt)}</p>
                )}
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
              );
            })}
          </div>
          <p className="project-note">
            GitHub 数据来自公开仓库 API，最近同步 {formatDate(GITHUB_SYNCED_AT)}；共 {GITHUB_REPOS.length} 个仓库。
          </p>
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
            {OTHER_REPOS.map((repo) => {
              const snapshot = githubRepo(repo.name);
              return (
              <a key={repo.href} href={repo.href} target="_blank" rel="noopener noreferrer">
                <FluentIcon name="github" size={16} aria-hidden />
                <span>
                  <strong>{repo.name}</strong>
                  <small>{repo.description}{snapshot ? [' · ★ ', snapshot.stars, ' · ', formatDate(snapshot.updatedAt)] : ''}</small>
                </span>
                <OpenRegular aria-hidden />
              </a>
              );
            })}
          </div>
          <p className="project-note">
            <StarRegular aria-hidden /> 仅列出精选仓库，未列出的仓库仍可在 GitHub 主页找到。
          </p>
        </Reveal>
      </div>
    </div>
  );
}
