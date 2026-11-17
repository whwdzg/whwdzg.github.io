/** 正文图片查看器 / Content image lightbox. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeftRegular, ChevronRightRegular, DismissRegular } from '@fluentui/react-icons';
import { cn } from '../../lib/cn';
import './lightbox.css';

interface LightboxItem {
  src: string;
  alt: string;
  caption: string;
}

const ELIGIBLE = 'img[data-lightbox]:not([data-lightbox="false"]):not([data-lightbox="off"])';

function collect(start: HTMLImageElement): LightboxItem[] {
  const scope = start.closest('main') ?? document;
  return [...scope.querySelectorAll<HTMLImageElement>(ELIGIBLE)].map((img) => {
    const figure = img.closest('figure');
    return {
      src: img.currentSrc || img.src,
      alt: img.alt,
      caption: figure?.querySelector('figcaption')?.textContent?.trim() || img.alt,
    };
  });
}

export function ImageLightbox() {
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const go = useCallback((direction: number) => {
    setIndex((current) => {
      if (!items.length) return 0;
      return (current + direction + items.length) % items.length;
    });
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [items.length]);

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
      setScale((value) => Math.min(4, Math.max(0.5, value - event.deltaY * 0.001)));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [open]);

  if (!open || !items[index]) return null;
  const current = items[index];

  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="图片查看器" onClick={close}>
      <div className="image-lightbox__bar" onClick={(event) => event.stopPropagation()}>
        <span>
          {index + 1} / {items.length}
        </span>
        <span className="image-lightbox__hint">滚轮缩放 · 拖动查看 · Esc 关闭</span>
        <button ref={closeButton} type="button" className="image-lightbox__btn" aria-label="关闭" onClick={close}>
          <DismissRegular aria-hidden />
        </button>
      </div>

      <div
        className="image-lightbox__stage"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={() => {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }}
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, y: event.clientY, px: position.x, py: position.y };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          setPosition({
            x: drag.current.px + event.clientX - drag.current.x,
            y: drag.current.py + event.clientY - drag.current.y,
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <img
          className={cn('image-lightbox__image', scale > 1 && 'is-zoomed')}
          src={current.src}
          alt={current.alt}
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
          draggable={false}
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

      <p className="image-lightbox__caption" onClick={(event) => event.stopPropagation()}>
        {current.caption}
      </p>
    </div>
  );
}
