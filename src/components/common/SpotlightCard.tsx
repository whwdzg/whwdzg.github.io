/** 带跟随高光的卡片 / Card with a pointer-follow spotlight. */
import { useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  as?: 'article' | 'div' | 'li';
  accent?: string;
}

export function SpotlightCard({ children, className, as = 'article', accent }: SpotlightCardProps) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={cn('spotlight-card', className)}
      style={accent ? ({ '--spotlight-accent': accent } as React.CSSProperties) : undefined}
      onPointerMove={(event) => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        node.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        node.style.setProperty('--my', `${event.clientY - rect.top}px`);
      }}
    >
      {children}
    </Tag>
  );
}
