/** Modrinth 项目索引 / All Modrinth projects in one place. */
import { ArrowDownloadRegular, ArrowRightRegular, OpenRegular, PersonRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { LINKS, PROJECTS } from '../../data/site';
import { MODRINTH_PROJECTS, MODRINTH_SYNCED_AT, MODRINTH_TOTALS } from '../../data/projects/modrinth';
import { MODRINTH_HISTORY } from '../../data/projects/modrinth-history';
import { ModrinthTrendChart } from '../../components/projects/ModrinthTrendChart';
import { formatDate, formatViews } from '../../lib/format';
import { PageIntro } from '../../components/layout/PageIntro';
import { FluentIcon } from '../../components/common/FluentIcon';
import { Reveal } from '../../components/common/Reveal';
import { SectionHeading } from '../../components/common/SectionHeading';
import '../../styles/projects.css';

export default function ModrinthPage() {
  return (
    <div className="page page--modrinth">
      <PageIntro
        eyebrow="PROJECTS · MODRINTH"
        title="Modrinth 项目"
        lead="六个数据包 / 模组项目，全部开源，全部可以在 Modrinth 下载。这里集中展示它们的最新版本、下载量、支持版本与站内详情页。"
        meta={[
          { icon: 'rocket', label: `${PROJECTS.length} 个项目` },
          { icon: 'download', label: `${formatViews(MODRINTH_TOTALS.downloads)} 总下载` },
          { icon: 'person', label: `${MODRINTH_TOTALS.followers} 关注` },
          { icon: 'calendar', label: `快照 ${formatDate(MODRINTH_SYNCED_AT)}` },
        ]}
        actions={
          <>
            <a className="btn btn--primary btn--md" href={LINKS.modrinth} target="_blank" rel="noopener noreferrer">
              <OpenRegular aria-hidden /> Modrinth 主页
            </a>
            <a className="btn btn--ghost btn--md" href={LINKS.github} target="_blank" rel="noopener noreferrer">
              <FluentIcon name="github" size={17} aria-hidden /> GitHub
            </a>
          </>
        }
        aside={
          <div className="modrinth-summary">
            <p className="eyebrow">AT A GLANCE</p>
            <div className="modrinth-summary__stats">
              <div>
                <strong>{PROJECTS.length}</strong>
                <span>项目</span>
              </div>
              <div>
                <strong>{formatViews(MODRINTH_TOTALS.downloads)}</strong>
                <span>下载</span>
              </div>
              <div>
                <strong>{MODRINTH_TOTALS.followers}</strong>
                <span>关注</span>
              </div>
            </div>
            <p>
              数据来自 Modrinth API 快照，页面内显示的是最近一次同步结果。实时数字以 Modrinth 项目页为准。
            </p>
            <a className="text-link" href={LINKS.modrinth} target="_blank" rel="noopener noreferrer">
              打开 Modrinth 主页 <OpenRegular aria-hidden />
            </a>
          </div>
        }
      />

      <div className="container modrinth-page">
        <Reveal as="section" className="article-card" id="projects">
          <SectionHeading
            eyebrow="ALL PROJECTS"
            title="六个数据包项目"
            description="从合成、附魔、掉落，到两条极简规则数据包，以及一个愚人节限定项目。"
          />
          <div className="modrinth-grid">
            {PROJECTS.map((project, index) => {
              const snapshot = MODRINTH_PROJECTS.find((entry) => entry.localSlug === project.id);
              return (
                <Reveal as="article" className="modrinth-card" key={project.id} delay={index * 45}>
                  <div className="modrinth-card__head">
                    <img src={project.icon} alt={`${project.title}图标`} width={56} height={56} loading="lazy" />
                    <div>
                      <p>{project.subtitle}</p>
                      <h3>{project.title}</h3>
                    </div>
                    <span className="badge">v{project.version}</span>
                  </div>
                  <p className="modrinth-card__desc">{project.description}</p>
                  <div className="modrinth-card__tags">
                    {project.tags.map((tag) => (
                      <span className="badge" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="modrinth-card__stats">
                    <span>
                      <ArrowDownloadRegular aria-hidden /> {formatViews(snapshot?.downloads ?? project.downloads)}
                    </span>
                    <span>
                      <PersonRegular aria-hidden /> {snapshot?.followers ?? project.followers}
                    </span>
                    <span>{project.gameVersions}</span>
                  </div>
                  <div className="modrinth-card__links">
                    <Link to={project.path}>
                      项目详情 <ArrowRightRegular aria-hidden />
                    </Link>
                    <a href={project.modrinth} target="_blank" rel="noopener noreferrer">
                      Modrinth <OpenRegular aria-hidden />
                    </a>
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      GitHub <OpenRegular aria-hidden />
                    </a>
                  </div>
                  {snapshot && (
                    <p className="modrinth-card__sync">
                      最新 {snapshot.latestVersion} · {formatDate(snapshot.latestVersionDate)}
                    </p>
                  )}
                </Reveal>
              );
            })}
          </div>
        </Reveal>

        <Reveal as="section" className="article-card" id="trends">
          <SectionHeading
            eyebrow="TRENDS"
            title="下载与关注趋势"
            description="按仓库历史快照绘制的折线图；Modrinth 公开 API 不提供浏览量，因此第二张图使用公开关注量。"
          />
          <div className="modrinth-trend-grid">
            {MODRINTH_PROJECTS.map((project) => {
              const points = MODRINTH_HISTORY[project.localSlug] ?? [];
              return (
                <article className="modrinth-trend-card" key={project.localSlug}>
                  <div className="modrinth-trend-card__head">
                    <img src={project.icon} alt="" width={28} height={28} loading="lazy" />
                    <div>
                      <strong>{project.title}</strong>
                      <small>{points.length ? `${points.length} 个快照` : '等待下一次快照'}</small>
                    </div>
                  </div>
                  {points.length > 0 ? (
                    <div className="modrinth-trend-card__charts">
                      <ModrinthTrendChart points={points} metric="downloads" label="下载量" />
                      <ModrinthTrendChart points={points} metric="followers" label="关注量" />
                    </div>
                  ) : (
                    <p className="project-note">趋势数据将在下一次同步后出现。</p>
                  )}
                </article>
              );
            })}
          </div>
          <p className="project-note">
            趋势数据来自仓库内的 Modrinth 快照，最近同步 {formatDate(MODRINTH_SYNCED_AT)}；浏览量无法通过公开 API 获取。
          </p>
        </Reveal>

        <Reveal as="section" className="article-card" id="about">
          <p className="eyebrow">WHY MODRINTH</p>
          <h2>为什么是 Modrinth</h2>
          <div className="project-feature-grid">
            <div>
              <ArrowDownloadRegular aria-hidden />
              <strong>版本齐全</strong>
              <p>每个项目保留数据包与 Fabric / Forge / NeoForge / Quilt 版本，旧版本也能找到。</p>
            </div>
            <div>
              <OpenRegular aria-hidden />
              <strong>开源可审计</strong>
              <p>源码在 GitHub，Modrinth 页面提供下载统计、更新记录与许可证信息。</p>
            </div>
            <div>
              <FluentIcon name="shield" size={20} aria-hidden />
              <strong>GPL-3.0</strong>
              <p>全部项目使用 GPL-3.0 许可；转载、修改与整合包分发请遵守许可证。</p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
