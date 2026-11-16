/** 通用对话框 / Accessible modal. */
import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DismissRegular } from '@fluentui/react-icons';
import { cn } from '../../lib/cn';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** 隐藏默认的大标题区，由内容自行排版（例如视频详情）。 */
  bare?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
  bare = false,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useFocusTrap(ref, open, onClose);
  useLockBodyScroll(open);

  if (!open) return null;

  return createPortal(
    <div className="modal-layer" role="presentation">
      <div className="modal-scrim" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        className={cn('modal', `modal--${size}`, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <div className={cn('modal__header', bare && 'modal__header--bare')}>
          <div>
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="modal__description">
                {description}
              </p>
            )}
          </div>
          <button className="modal__close icon-btn" type="button" aria-label="关闭" onClick={onClose}>
            <DismissRegular aria-hidden />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
