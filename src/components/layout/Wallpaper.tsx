/**
 * 站点壁纸 / Background wallpaper.
 *
 * 首屏先用 CSS 渐变占位，等浏览器空闲后再解码图片，避免壁纸抢走 LCP。
 * 图片加载完成后淡入；切主题时重新解析对应壁纸。
 */
import { useEffect, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function Wallpaper() {
  const { wallpaper } = useSettings();
  const [loaded, setLoaded] = useState<string | null>(null);

  useEffect(() => {
    if (!wallpaper) {
      setLoaded(null);
      return;
    }

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    const saveData = connection?.saveData === true;
    if (saveData) return;

    let cancelled = false;
    let idleHandle: number | null = null;
    const run = () => {
      const image = new Image();
      image.decoding = 'async';
      image.src = wallpaper.src;
      const commit = () => {
        if (!cancelled) setLoaded(wallpaper.src);
      };
      if (typeof image.decode === 'function') {
        image
          .decode()
          .then(commit)
          .catch(commit);
      } else {
        image.onload = commit;
        image.onerror = commit;
      }
    };

    const idle = window as IdleWindow;
    if (idle.requestIdleCallback) {
      idleHandle = idle.requestIdleCallback(run, { timeout: 1800 });
    } else {
      idleHandle = window.setTimeout(run, 260);
    }

    return () => {
      cancelled = true;
      if (idleHandle != null) {
        if (idle.cancelIdleCallback) idle.cancelIdleCallback(idleHandle);
        else window.clearTimeout(idleHandle);
      }
    };
  }, [wallpaper]);

  return (
    <div className="wallpaper" aria-hidden data-loaded={loaded ? 'true' : 'false'}>
      <div
        className="wallpaper__image"
        style={loaded ? { backgroundImage: `url("${loaded}")` } : undefined}
      />
      <div className="wallpaper__wash" />
      <div className="wallpaper__grain" />
    </div>
  );
}
