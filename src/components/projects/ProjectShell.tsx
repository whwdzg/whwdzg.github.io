/** 项目页外壳 / Shared project detail shell. */
import { useMemo, type ReactNode } from 'react';
import { ArrowDownloadRegular, CodeRegular, DocumentRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { useActiveSection } from '../../hooks/useActiveSection';
import { formatDate, formatViews } from '../../lib/format';
import { PROJECTS, type Project } from '../../data/site';
import { PageIntro } from '../layout/PageIntro';
import { TableOfContents, type TocItem } from '../common/TableOfContents';
import { FluentIcon } from '../common/FluentIcon';

export function ProjectSummary({ project }: { project: Project }) {
  return (
    <div className="project-summary">
      <div className="project-summary__head">
        <img src={project.icon} alt={`${project.title}图标`} width={72} height={72} loading="lazy" />
        <div>
          <p>{project.subtitle}</p>
          <strong>{project.title}</strong>
          <span>v{project.version}</span>
        </div>
      </div>
      <div className="project-summary__stats">
        <div>
          <strong>{formatViews(project.downloads)}</strong>
          <span>Modrinth 下载</span>
        </div>
        <div>
          <strong>{formatViews(project.followers)}</strong>
          <span>关注</span>
        </div>
        <div>
          <strong>{project.gameVersions}</strong>
          <span>支持版本</span>
        </div>
      </div>
      <div className="project-summary__tags">
        {project.tags.map((tag) => (
          <span className="badge" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="project-summary__links">
        <a className="btn btn--primary btn--sm" href={project.modrinth} target="_blank" rel="noopener noreferrer">
          <ArrowDownloadRegular aria-hidden /> Modrinth
        </a>
        <a className="btn btn--ghost btn--sm" href={project.github} target="_blank" rel="noopener noreferrer">
          <CodeRegular aria-hidden /> GitHub
        </a>
        {project.i18n && (
          <a className="btn btn--ghost btn--sm" href={project.i18n} target="_blank" rel="noopener noreferrer">
            <DocumentRegular aria-hidden /> 语言包
          </a>
        )}
      </div>
      <p className="project-summary__date">最近更新 {formatDate(project.updated)}</p>
    </div>
  );
}

function RelatedProjects({ current }: { current: Project }) {
  return (
    <section className="project-related" aria-label="其他项目">
      <p className="eyebrow">MORE PROJECTS</p>
      <h2>其他数据包</h2>
      <ul>
        {PROJECTS.filter((project) => project.id !== current.id)
          .slice(0, 4)
          .map((project) => (
            <li key={project.id}>
              <Link to={project.path}>
                <img src={project.icon} alt="" width={30} height={30} loading="lazy" />
                <span>
                  <strong>{project.title}</strong>
                  <small>{project.subtitle}</small>
                </span>
                <FluentIcon name="right" size={14} aria-hidden />
              </Link>
            </li>
          ))}
      </ul>
      <Link className="text-link" to="/projects/modrinth/">
        全部项目 <FluentIcon name="arrow" size={13} aria-hidden />
      </Link>
    </section>
  );
}

interface ProjectShellProps {
  project: Project;
  toc: TocItem[];
  children: ReactNode;
}

export function ProjectShell({ project, toc, children }: ProjectShellProps) {
  const ids = useMemo(() => toc.map((item) => item.id), [toc]);
  const active = useActiveSection(ids);

  return (
    <div className="page page--project">
      <PageIntro
        eyebrow={`PROJECT · ${project.subtitle.toUpperCase()}`}
        title={project.title}
        lead={project.detail}
        meta={[
          { icon: 'commit', label: `v${project.version}` },
          { icon: 'storage', label: project.gameVersions },
          { icon: 'download', label: `${formatViews(project.downloads)} 下载` },
          { icon: 'calendar', label: `更新 ${formatDate(project.updated)}` },
        ]}
        actions={
          <>
            <a className="btn btn--primary btn--md" href={project.modrinth} target="_blank" rel="noopener noreferrer">
              <ArrowDownloadRegular aria-hidden /> 在 Modrinth 下载
            </a>
            <a className="btn btn--ghost btn--md" href={project.github} target="_blank" rel="noopener noreferrer">
              <CodeRegular aria-hidden /> 查看源码
            </a>
            {project.i18n && (
              <a className="btn btn--ghost btn--md" href={project.i18n} target="_blank" rel="noopener noreferrer">
                <DocumentRegular aria-hidden /> 多语言支持
              </a>
            )}
          </>
        }
        aside={<ProjectSummary project={project} />}
      />

      <div className="container project-layout">
        <div className="project-content">{children}</div>
        <aside className="project-side">
          <TableOfContents items={toc} active={active} title="项目目录" className="project-toc" />
          <RelatedProjects current={project} />
        </aside>
      </div>
    </div>
  );
}
