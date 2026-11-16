/** 浮层打开时锁定页面滚动；支持多个浮层叠加。 */
import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';
let originalPadding = '';

export function useLockBodyScroll(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      originalPadding = document.body.style.paddingRight;
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
      document.documentElement.classList.add('is-scroll-locked');
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPadding;
        document.documentElement.classList.remove('is-scroll-locked');
      }
    };
  }, [active]);
}
