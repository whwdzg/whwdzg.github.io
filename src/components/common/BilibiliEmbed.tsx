/** Bilibili 正文视频 / Inline Bilibili embed with Asteria-style chrome. */
import { useRef, useState } from 'react';
import { FullScreenMaximizeRegular, OpenRegular, PlayRegular } from '@fluentui/react-icons';
import '../../styles/bilibili-embed.css';

interface BilibiliEmbedProps {
  bvid: string;
  title: string;
  cover: string;
  duration?: string;
  url: string;
}

function asteriaLink(url: string): string {
  const target = new URL('https://whwdzg.github.io/Asteria-Player/');
  target.searchParams.set('url', new URL(url, window.location.href).toString());
  target.searchParams.set('kind', 'video');
  return target.toString();
}

export function BilibiliEmbed({ bvid, title, cover, duration, url }: BilibiliEmbedProps) {
  const [active, setActive] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (!shellRef.current) return;
    if (!document.fullscreenElement) {
      await shellRef.current.requestFullscreen().catch(() => undefined);
      setFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => undefined);
      setFullscreen(false);
    }
  };

  return (
    <div className="bili-embed" ref={shellRef}>
      <div className="bili-embed__head">
        <span>BILIBILI · VIDEO</span>
        <strong>{title}</strong>
        {duration ? <small>{duration}</small> : null}
      </div>
      <div className={`bili-embed__frame ${active ? 'is-active' : ''}`}>
        {active ? (
          <iframe
            title={title}
            src={`https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=1&autoplay=1`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            style={{ filter: `brightness(${brightness})` }}
          />
        ) : (
          <button type="button" className="bili-embed__poster" onClick={() => setActive(true)} aria-label={`播放：${title}`}>
            <img src={cover} alt="" loading="lazy" />
            <span className="bili-embed__play"><PlayRegular aria-hidden /></span>
            <span className="bili-embed__badge">BILIBILI</span>
          </button>
        )}
      </div>
      <div className="bili-embed__bar">
        <span>{duration ? `时长 ${duration}` : 'B 站播放器'}</span>
        <label className="bili-embed__brightness">
          <span aria-hidden>☀</span>
          <input
            type="range"
            min={0.45}
            max={1.5}
            step="0.01"
            value={brightness}
            aria-label="亮度"
            onChange={(event) => setBrightness(Number(event.currentTarget.value))}
          />
        </label>
        <button type="button" className="bili-embed__icon" aria-label={fullscreen ? '退出全屏' : '全屏'} onClick={toggleFullscreen}>
          <FullScreenMaximizeRegular aria-hidden />
        </button>
        <a className="bili-embed__link" href={url} target="_blank" rel="noopener noreferrer">
          哔哩哔哩 <OpenRegular aria-hidden />
        </a>
        <a className="bili-embed__link" href={asteriaLink(url)} target="_blank" rel="noopener noreferrer">
          Asteria Player <OpenRegular aria-hidden />
        </a>
      </div>
    </div>
  );
}
