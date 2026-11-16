/**
 * 页眉自动收起 / Auto-hiding header.
 *
 * 行为约定（对应设置项“页眉自动收起”）：
 * - off：始终展开；
 * - fullscreen：仅在浏览器全屏时，闲置 2.6s 后收起；鼠标移动 / 键盘操作立即恢复；
 * - scroll：全屏闲置收起，同时在向下滚动超过 140px 时收起、向上滚动时恢复。
 *
 * 默认值 fullscreen，保证普通浏览时页眉默认展开。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { HeaderAutoHide } from '../lib/settings';

interface Options {
  mode: HeaderAutoHide;
  isFullscreen: boolean;
  blocked?: boolean;
}

const IDLE_MS = 2600;

export function useHeaderAutoHide({ mode, isFullscreen, blocked = false }: Options) {
  const [hidden, setHidden] = useState(false);
  const timer = useRef<number | null>(null);
  const lastScroll = useRef(0);
  /** 只有键盘操作时才因为“焦点在页眉内”而阻止收起；鼠标点击不应阻止。 */
  const keyboardActive = useRef(false);
  const state = useRef({ mode, isFullscreen, blocked });
  state.current = { mode, isFullscreen, blocked };

  const clearTimer = useCallback(() => {
    if (timer.current != null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const reveal = useCallback(() => {
    setHidden(false);
  }, []);

  const scheduleIdleHide = useCallback(() => {
    clearTimer();
    if (state.current.mode === 'off' || state.current.blocked) return;
    if (!(state.current.mode === 'fullscreen' && state.current.isFullscreen)) {
      // scroll 模式的收起由滚动方向决定，这里只处理全屏闲置。
      if (!state.current.isFullscreen) return;
    }
    timer.current = window.setTimeout(() => {
      if (state.current.blocked) {
        scheduleIdleHide();
        return;
      }
      const active = document.activeElement;
      if (keyboardActive.current && active instanceof HTMLElement && active.closest('header')) {
        scheduleIdleHide();
        return;
      }
      setHidden(true);
    }, IDLE_MS);
  }, [clearTimer]);

  const wake = useCallback(() => {
    setHidden(false);
    scheduleIdleHide();
  }, [scheduleIdleHide]);

  useEffect(() => {
    const shouldAuto = mode !== 'off' && !blocked && (isFullscreen || mode === 'scroll');
    if (!shouldAuto) {
      clearTimer();
      setHidden(false);
      return;
    }

    lastScroll.current = window.scrollY;

    const onPointerMove = (event: PointerEvent) => {
      if (isFullscreen) {
        setHidden(false);
        scheduleIdleHide();
        return;
      }
      if (event.clientY <= 80) {
        setHidden(false);
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (y < 32) {
        setHidden(false);
        scheduleIdleHide();
      } else if (mode === 'scroll') {
        const delta = y - lastScroll.current;
        if (delta > 6) setHidden(true);
        else if (delta < -6) {
          setHidden(false);
          scheduleIdleHide();
        }
      }
      lastScroll.current = y;
    };

    const onKey = () => {
      keyboardActive.current = true;
      setHidden(false);
      scheduleIdleHide();
    };

    const onPointerDown = () => {
      keyboardActive.current = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('focusin', onKey);
    window.addEventListener('touchstart', onKey, { passive: true });
    scheduleIdleHide();

    return () => {
      clearTimer();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('focusin', onKey);
      window.removeEventListener('touchstart', onKey);
    };
  }, [mode, isFullscreen, blocked, clearTimer, scheduleIdleHide]);

  return { hidden, reveal, wake };
}
