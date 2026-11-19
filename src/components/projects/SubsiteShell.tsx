/** 子站项目页外壳 / Shared shell for Asteria Player and Life Simulation Wiki. */
import { useMemo, type ReactNode } from 'react';
import { ArrowDownloadRegular, CodeRegular, OpenRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { useActiveSection } from '../../hooks/useActiveSection';
import { SUBSITES } from '../../data/site';
import { PageIntro } from '../layout/PageIntro';
import { TableOfContents, type TocItem } from '../common/TableOfContents';
import { FluentIcon } from '../common/FluentIcon';

interface SubsiteShellProps {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  url: string;
  github: string;
  accent: string;
  meta: { icon: string; label: string }[];
  toc: TocItem[];
  pwa?: boolean;
  children: ReactNode;
}

export function SubsiteShell({
  title,
  subtitle,
  description,
  icon,
  url,
  github,
  accent,
  meta,
  toc,
  pwa = true,
  children,
}: SubsiteShellProps) {
  const ids = useMemo(() => toc.map((item) => item.id), [toc]);
  const active = useActiveSection(ids);

  return (
    <div className="page page--project" style={{ '--accent': accent } as React.CSSProperties}>
      <PageIntro
        eyebrow={`SUB-SITE · ${subtitle.toUpperCase()}`}
        title={title}
        lead={description}
        meta={meta}
        actions={
          <>
            <a className="btn btn--primary btn--md" href={url} target="_blank" rel="noopener noreferrer">
              <OpenRegular aria-hidden /> 打开子站
            </a>
            <a className="btn btn--ghost btn--md" href={github} target="_blank" rel="noopener noreferrer">
              <CodeRegular aria-hidden /> GitHub
            </a>
          </>
        }
        aside={
          <div className="project-summary">
            <div className="project-summary__head">
              <img src={icon} alt={`${title}图标`} width={72} height={72} loading="lazy" />
              <div>
                <p>{subtitle}</p>
                <strong>{title}</strong>
                <span>独立子站</span>
              </div>
            </div>
            <div className="project-summary__stats">
              <div>
                <strong>独立</strong>
                <span>部署</span>
              </div>
              <div>
                <strong>GitHub</strong>
                <span>开源</span>
              </div>
              <div>
                <strong>{pwa ? 'PWA' : '本地'}</strong>
                <span>{pwa ? '可安装' : '优先'}</span>
              </div>
            </div>
            <div className="project-summary__links">
              <a className="btn btn--primary btn--sm" href={url} target="_blank" rel="noopener noreferrer">
                <ArrowDownloadRegular aria-hidden /> 打开
              </a>
              <a className="btn btn--ghost btn--sm" href={github} target="_blank" rel="noopener noreferrer">
                <CodeRegular aria-hidden /> 源码
              </a>
            </div>
            <p className="project-summary__date">本项目作为独立子站运行，主站只负责导览与项目介绍。</p>
          </div>
        }
      />

      <div className="container project-layout">
        <div className="project-content">{children}</div>
        <aside className="project-side">
          <TableOfContents items={toc} active={active} title="子站目录" className="project-toc" />
          <section className="project-related" aria-label="其他子站">
            <p className="eyebrow">SUB-SITES</p>
            <h2>其他子站</h2>
            <ul>
              {SUBSITES.filter((site) => site.title !== title).map((site) => (
                <li key={site.id}>
                  <Link to={site.path}>
                    <img src={site.icon} alt="" width={30} height={30} loading="lazy" />
                    <span>
                      <strong>{site.title}</strong>
                      <small>{site.subtitle}</small>
                    </span>
                    <FluentIcon name="right" size={14} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="text-link" to="/projects/github/">
              GitHub 项目页 <FluentIcon name="arrow" size={13} aria-hidden />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
