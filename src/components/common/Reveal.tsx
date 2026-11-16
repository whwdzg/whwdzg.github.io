/** 滚动进入视口时揭示内容 / Reveal on intersection. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useSettings } from '../../hooks/useSettings';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'li' | 'header' | 'footer';
  id?: string;
}

export function Reveal({ children, className, delay = 0, as = 'div', id }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { settings } = useSettings();
  const reduced =
    settings.motion === 'reduced' ||
    (settings.motion === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [revealed, setRevealed] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setRevealed(true);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      id={id}
      className={cn('reveal', revealed && 'is-revealed', className)}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
