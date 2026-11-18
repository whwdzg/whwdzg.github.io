/** 正文图片查看器 / Content image lightbox. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownloadRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  DismissRegular,
  LocationRegular,
} from '@fluentui/react-icons';
import { cn } from '../../lib/cn';
import './lightbox.css';

interface LightboxItem {
  src: string;
  alt: string;
  caption: string;
  element: HTMLImageElement;
}

const ELIGIBLE = 'img[data-lightbox]:not([data-lightbox="false"]):not([data-lightbox="off"])';
const MIN_SCALE = 0.25;
const MAX_SCALE = 6;

function clampScale(value: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

function collect(start: HTMLImageElement): LightboxItem[] {
  const scope = start.closest('main') ?? document;
  return [...scope.querySelectorAll<HTMLImageElement>(ELIGIBLE)].map((img) => {
    const figure = img.closest('figure');
    return {
      src: img.currentSrc || img.src,
      alt: img.alt,
      caption: figure?.querySelector('figcaption')?.textContent?.trim() || img.alt,
      element: img,
    };
  });
}

function downloadName(item: LightboxItem, index: number): string {
  const name = item.src.split('/').pop()?.split('?')[0];
  return name || `image-${index + 1}.webp`;
}

export function ImageLightbox() {
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [filmstripOpen, setFilmstripOpen] = useState(true);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const filmstrip = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    drag.current = null;
    pointers.current.clear();
    pinch.current = null;
  }, []);

  const go = useCallback((direction: number) => {
    setIndex((current) => {
      if (!items.length) return 0;
      return (current + direction + items.length) % items.length;
    });
    setScale(1);
    setPosition({ x: 0, y: 0 });
    pinch.current = null;
  }, [items.length]);

  const goTo = useCallback((next: number) => {
    setIndex(next);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    pinch.current = null;
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const image = target?.closest<HTMLImageElement>(ELIGIBLE);
      if (!image) return;
      const list = collect(image);
      const start = list.findIndex((item) => item.src === (image.currentSrc || image.src));
      if (start < 0) return;
      event.preventDefault();
      setItems(list);
      setIndex(start);
      setOpen(true);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') go(-1);
      if (event.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, go]);

  useEffect(() => {
    if (!open) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setScale((value) => clampScale(value - event.deltaY * 0.001));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [open]);

  useEffect(() => {
    if (!open || !filmstripOpen) return;
    const active = filmstrip.current?.querySelector('[aria-current="true"]');
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index, open, filmstripOpen]);

  const current = items[index];
  const zoomPercent = useMemo(() => Math.round(scale * 100), [scale]);

  if (!open || !current) return null;

  const locateSource = () => {
    const source = current.element;
    close();
    window.requestAnimationFrame(() => {
      source.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      source.classList.add('is-lightbox-target');
      window.setTimeout(() => source.classList.remove('is-lightbox-target'), 1600);
    });
  };

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="图片查看器"
      onClick={close}
      onDragStartCapture={(event) => event.preventDefault()}
    >
      <div className="image-lightbox__top" onClick={(event) => event.stopPropagation()}>
        <span className="image-lightbox__count">{index + 1} / {items.length}</span>
        <p className="image-lightbox__title" title={current.caption || current.alt}>{current.caption || current.alt}</p>
        <span className="image-lightbox__hint">滚轮 / 双指缩放 · 拖动查看</span>
      </div>

      <button ref={closeButton} type="button" className="image-lightbox__close" aria-label="关闭" onClick={close}>
        <DismissRegular aria-hidden />
      </button>

      <div className="image-lightbox__rail" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="image-lightbox__rail-btn" onClick={locateSource} title="关闭查看器并定位到原文位置">
          <LocationRegular aria-hidden />
          <span>定位原文</span>
        </button>
        <a
          className="image-lightbox__rail-btn"
          href={current.src}
          download={downloadName(current, index)}
          title="下载当前图片"
          onClick={(event) => event.stopPropagation()}
        >
          <ArrowDownloadRegular aria-hidden />
          <span>下载</span>
        </a>
        <div className="image-lightbox__zoom" aria-label="缩放">
          <button type="button" aria-label="缩小" onClick={() => setScale((value) => clampScale(value - 0.1))}>−</button>
          <input
            type="number"
            min={Math.round(MIN_SCALE * 100)}
            max={Math.round(MAX_SCALE * 100)}
            step="10"
            value={zoomPercent}
            aria-label="缩放百分比"
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) setScale(clampScale(next / 100));
            }}
          />
          <span>%</span>
          <button type="button" aria-label="放大" onClick={() => setScale((value) => clampScale(value + 0.1))}>+</button>
        </div>
        <button
          type="button"
          className={cn("image-lightbox__rail-btn", filmstripOpen && "is-on")}
          aria-expanded={filmstripOpen}
          onClick={() => setFilmstripOpen((value) => !value)}
        >
          <span className="image-lightbox__filmstrip-icon" aria-hidden>▦</span>
          <span>胶片条</span>
        </button>
      </div>
      <div
        className="image-lightbox__stage"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        onDoubleClick={() => {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }}
        onPointerDown={(event) => {
          pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // 合成事件或已释放的触点无需捕获。
          }
          if (pointers.current.size === 1) {
            drag.current = { x: event.clientX, y: event.clientY, px: position.x, py: position.y };
            pinch.current = null;
          } else {
            drag.current = null;
            pinch.current = null;
          }
        }}
        onPointerMove={(event) => {
          if (!pointers.current.has(event.pointerId)) return;
          pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
          if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            const distance = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinch.current) {
              setScale(clampScale(pinch.current.scale * (distance / Math.max(1, pinch.current.distance))));
            } else {
              pinch.current = { distance, scale };
            }
            return;
          }
          if (drag.current) {
            setPosition({
              x: drag.current.px + event.clientX - drag.current.x,
              y: drag.current.py + event.clientY - drag.current.y,
            });
          }
        }}
        onPointerUp={(event) => {
          pointers.current.delete(event.pointerId);
          pinch.current = null;
          if (pointers.current.size === 1) {
            const remaining = [...pointers.current.values()][0];
            drag.current = { x: remaining.x, y: remaining.y, px: position.x, py: position.y };
          } else {
            drag.current = null;
          }
        }}
        onPointerCancel={(event) => {
          pointers.current.delete(event.pointerId);
          pinch.current = null;
          drag.current = null;
        }}
      >
        <img
          key={current.src}
          className={cn('image-lightbox__image', scale > 1 && 'is-zoomed')}
          src={current.src}
          alt={current.alt}
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
        />
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            className="image-lightbox__nav image-lightbox__nav--prev"
            aria-label="上一张"
            onClick={(event) => {
              event.stopPropagation();
              go(-1);
            }}
          >
            <ChevronLeftRegular aria-hidden />
          </button>
          <button
            type="button"
            className="image-lightbox__nav image-lightbox__nav--next"
            aria-label="下一张"
            onClick={(event) => {
              event.stopPropagation();
              go(1);
            }}
          >
            <ChevronRightRegular aria-hidden />
          </button>
        </>
      )}

      <div className="image-lightbox__filmstrip" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="image-lightbox__filmstrip-toggle"
          aria-expanded={filmstripOpen}
          onClick={() => setFilmstripOpen((value) => !value)}
        >
          胶片条 · {items.length} 张 {filmstripOpen ? '收起' : '展开'}
        </button>
        {filmstripOpen && (
          <div className="image-lightbox__filmstrip-scroll" ref={filmstrip}>
            {items.map((item, itemIndex) => (
              <button
                key={`${item.src}-${itemIndex}`}
                type="button"
                className={cn('image-lightbox__thumb', itemIndex === index && 'is-active')}
                aria-label={`查看第 ${itemIndex + 1} 张：${item.alt || item.caption}`}
                aria-current={itemIndex === index ? 'true' : undefined}
                onClick={() => goTo(itemIndex)}
              >
                <img src={item.src} alt="" loading="lazy" draggable={false} />
                <span>{itemIndex + 1}</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
