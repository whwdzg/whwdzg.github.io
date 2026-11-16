/** 子页面头部 / Shared page intro. */
import type { ReactNode } from 'react';
import { FluentIcon } from '../common/FluentIcon';

interface PageIntroMeta {
  icon: string;
  label: string;
}

interface PageIntroProps {
  eyebrow: string;
  title: string;
  lead: string;
  meta?: PageIntroMeta[];
  actions?: ReactNode;
  aside?: ReactNode;
  id?: string;
}

export function PageIntro({ eyebrow, title, lead, meta, actions, aside, id }: PageIntroProps) {
  return (
    <header className="page-intro" id={id}>
      <div className="container page-intro__inner">
        <div className="page-intro__main">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="page-intro__title">{title}</h1>
          <p className="page-intro__lead">{lead}</p>
          {meta && meta.length > 0 && (
            <ul className="page-intro__meta" aria-label="页面信息">
              {meta.map((item) => (
                <li key={item.label}>
                  <FluentIcon name={item.icon} size={16} aria-hidden />
                  {item.label}
                </li>
              ))}
            </ul>
          )}
          {actions && <div className="page-intro__actions">{actions}</div>}
        </div>
        {aside && <div className="page-intro__aside">{aside}</div>}
      </div>
    </header>
  );
}
