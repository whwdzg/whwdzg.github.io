/** Toast 通知 / Lightweight toast system. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CheckmarkCircleRegular, DismissRegular, InfoRegular, WarningRegular } from '@fluentui/react-icons';

type ToastKind = 'success' | 'info' | 'error';

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: CheckmarkCircleRegular,
  info: InfoRegular,
  error: WarningRegular,
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef(new Map<number, number>());

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      idRef.current += 1;
      const id = idRef.current;
      setItems((current) => [...current.slice(-2), { id, message, kind }]);
      const timer = window.setTimeout(() => remove(id), kind === 'error' ? 5200 : 3400);
      timers.current.set(id, timer);
    },
    [remove],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => window.clearTimeout(timer));
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="toast-viewport" role="status" aria-live="polite">
          {items.map((item) => {
            const Icon = ICONS[item.kind];
            return (
              <div className={`toast toast--${item.kind}`} key={item.id}>
                <Icon className="toast__icon" aria-hidden />
                <span className="toast__message">{item.message}</span>
                <button className="toast__close" type="button" aria-label="关闭提示" onClick={() => remove(item.id)}>
                  <DismissRegular aria-hidden />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside <ToastProvider>');
  return value;
}
