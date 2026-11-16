/** 文章目录 / Sticky table of contents. */
import { useCallback } from 'react';
import { cn } from '../../lib/cn';

export interface TocItem {
  id: string;
  label: string;
  level?: 2 | 3;
}

interface TableOfContentsProps {
  items: TocItem[];
  active: string;
  title?: string;
  className?: string;
}

export function TableOfContents({ items, active, title = '本页目录', className }: TableOfContentsProps) {
  const jump = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(window.history.state, '', `#${id}`);
  }, []);

  return (
    <aside className={cn('toc', className)} aria-label={title}>
      <p className="toc__title">{title}</p>
      <nav>
        <ol className="toc__list">
          {items.map((item) => (
            <li key={item.id} className={cn('toc__item', item.level === 3 && 'toc__item--sub')}>
              <a
                href={`#${item.id}`}
                className={cn(active === item.id && 'is-active')}
                aria-current={active === item.id ? 'location' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  jump(item.id);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
