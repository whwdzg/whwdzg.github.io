/**
 * 数字滚动 / Count-up when the element enters the viewport.
 *
 * 只用于首屏下方的统计数字；减少动画时直接显示终值。
 */
import { useEffect, useRef, useState } from 'react';
import { useSettings } from './useSettings';

export function useCountUp<T extends HTMLElement = HTMLElement>(target: number, duration = 1100) {
  const { settings } = useSettings();
  const [value, setValue] = useState(0);
  const ref = useRef<T | null>(null);
  const done = useRef(false);

  const reduced =
    settings.motion === 'reduced' ||
    (settings.motion === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      done.current = true;
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = (now: number) => {
      if (frame) window.cancelAnimationFrame(frame);
      const started = now;
      const tick = (time: number) => {
        const progress = Math.min(1, (time - started) / duration);
        const eased = 1 - (1 - progress) ** 3;
        setValue(target * eased);
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || done.current) return;
        done.current = true;
        start(performance.now());
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [target, duration, reduced]);

  return { value, ref };
}
