/** 右侧设置抽屉 / Settings sheet. */
import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DismissRegular } from '@fluentui/react-icons';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Sheet({ open, onClose, title, subtitle, children, footer, className }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);
  useLockBodyScroll(open);

  if (!open) return null;

  return createPortal(
    <div className="sheet-layer" role="presentation">
      <div className="sheet-scrim" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        className={`sheet ${className ?? ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="sheet__header">
          <div>
            <p className="sheet__eyebrow">Settings</p>
            <h2 className="sheet__title">{title}</h2>
            {subtitle && <p className="sheet__subtitle">{subtitle}</p>}
          </div>
          <button className="icon-btn" type="button" aria-label="关闭设置" onClick={onClose}>
            <DismissRegular aria-hidden />
          </button>
        </header>
        <div className="sheet__body">{children}</div>
        {footer && <footer className="sheet__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
