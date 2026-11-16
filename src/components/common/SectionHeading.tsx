/** 区块标题 / Section heading with optional actions. */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('section-heading', `section-heading--${align}`, className)}>
      <div className="section-heading__text">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-heading__title">{title}</h2>
        {description && <p className="section-heading__description">{description}</p>}
      </div>
      {actions && <div className="section-heading__actions">{actions}</div>}
    </div>
  );
}
