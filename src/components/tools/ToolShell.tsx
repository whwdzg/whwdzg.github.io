/** 工具页外壳 / Shared tool page shell. */
import { useMemo, type ReactNode } from 'react';
import { ArrowRightRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { useActiveSection } from '../../hooks/useActiveSection';
import { TOOLS } from '../../data/tools';
import { PageIntro } from '../layout/PageIntro';
import { TableOfContents, type TocItem } from '../common/TableOfContents';
import { FluentIcon } from '../common/FluentIcon';

interface ToolShellProps {
  title: string;
  lead: string;
  eyebrow?: string;
  meta: { icon: string; label: string }[];
  toc: TocItem[];
  children: ReactNode;
}

export function ToolShell({ title, lead, eyebrow = 'TOOL', meta, toc, children }: ToolShellProps) {
  const ids = useMemo(() => toc.map((item) => item.id), [toc]);
  const active = useActiveSection(ids);

  return (
    <div className="page page--tool">
      <PageIntro eyebrow={eyebrow} title={title} lead={lead} meta={meta} />
      <div className="container tool-layout">
        <div className="tool-main">{children}</div>
        <aside className="tool-side">
          <TableOfContents items={toc} active={active} title="工具目录" className="project-toc" />
          <section className="project-related" aria-label="其他工具">
            <p className="eyebrow">TOOLS</p>
            <h2>其他工具</h2>
            <ul>
              {TOOLS.map((tool) => (
                <li key={tool.id}>
                  <Link to={tool.path}>
                    <span className="tool-nav-icon" style={{ background: `color-mix(in srgb, ${tool.accent} 14%, transparent)` }}>
                      <FluentIcon name={tool.icon} size={16} aria-hidden />
                    </span>
                    <span>
                      <strong>{tool.title}</strong>
                      <small>{tool.tag}</small>
                    </span>
                    <FluentIcon name="right" size={13} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="text-link" to="/tools/">
              工具索引 <ArrowRightRegular aria-hidden />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
