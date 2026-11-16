/**
 * 返回顶部 / Scroll-to-top with position recall.
 *
 * 保留 2.0 的交互：第一次点击回到顶部，按钮切换为“返回之前位置”；
 * 再次点击回到原处。手动滚回原处附近时状态自动复位。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from '../lib/router';
import { useSettings } from './useSettings';

export function useScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [returning, setReturning] = useState(false);
  const saved = useRef<number | null>(null);
  const autoScrolling = useRef(false);
  const autoTimer = useRef<number | null>(null);
  const { path } = useRouter();
  const { settings } = useSettings();

  const reset = useCallback(() => {
    saved.current = null;
    setReturning(false);
  }, []);

  useEffect(() => {
    const update = () => {
      setVisible(window.scrollY > 320 || saved.current != null);
      if (returning && saved.current != null && Math.abs(window.scrollY - saved.current) < 16) {
        reset();
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [returning, reset]);

  // 切换页面时复位
  useEffect(() => {
    reset();
    setVisible(false);
  }, [path, reset]);

  const reduced =
    settings.motion === 'reduced' ||
    (settings.motion === 'system' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const onClick = useCallback(() => {
    if (saved.current != null && returning) {
      const target = saved.current;
      saved.current = null;
      setReturning(false);
      window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
      return;
    }
    if (window.scrollY <= 0) return;
    saved.current = window.scrollY;
    setReturning(true);
    autoScrolling.current = true;
    if (autoTimer.current) window.clearTimeout(autoTimer.current);
    autoTimer.current = window.setTimeout(() => {
      autoScrolling.current = false;
      autoTimer.current = null;
    }, 650);
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, [returning, reduced]);

  useEffect(
    () => () => {
      if (autoTimer.current) window.clearTimeout(autoTimer.current);
    },
    [],
  );

  return { visible, returning, onClick };
}
