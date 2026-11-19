/** 正文媒体 / Inline audio & video players in the Asteria visual language. */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  FullScreenMaximizeRegular,
  OpenRegular,
  PauseRegular,
  PlayRegular,
  Speaker2Regular,
  SpeakerMuteRegular,
} from '@fluentui/react-icons';
import '../../styles/inline-media.css';

const ASTERIA_BASE = 'https://whwdzg.github.io/Asteria-Player/';

function MediaRange({
  value,
  min = 0,
  max,
  step,
  onChange,
  label,
  className = '',
}: {
  value: number;
  min?: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
  className?: string;
}) {
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      className={`media-range ${className}`.trim()}
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      onChange={(event) => onChange(Number(event.currentTarget.value))}
      style={{ '--range-fill': `${Math.min(100, Math.max(0, percent))}%` } as CSSProperties}
    />
  );
}

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const total = Math.floor(value);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function asteriaLink(src: string, kind: 'audio' | 'video'): string {
  const url = new URL(ASTERIA_BASE);
  url.searchParams.set('url', new URL(src, window.location.href).toString());
  url.searchParams.set('kind', kind);
  return url.toString();
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface InlineMusicProps {
  src: string;
  title: string;
  artist: string;
  cover?: string;
  lyrics?: LyricLine[];
}

export function InlineMusicPlayer({ src, title, artist, cover, lyrics = [] }: InlineMusicProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.78);
  const [muted, setMuted] = useState(false);
  const [failed, setFailed] = useState(false);

  const activeLine = useMemo(() => {
    let index = -1;
    for (let line = 0; line < lyrics.length; line += 1) {
      if (lyrics[line].time <= current + 0.05) index = line;
    }
    return index >= 0 ? lyrics[index] : null;
  }, [current, lyrics]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || failed) return;
    if (audio.paused) void audio.play().catch(() => setFailed(true));
    else audio.pause();
  }, [failed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  return (
    <div className="inline-media inline-media--audio">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onError={() => setFailed(true)}
      />
      <div className="inline-media__cover">
        {cover ? <img src={cover} alt="" loading="lazy" /> : <span aria-hidden>♪</span>}
      </div>
      <div className="inline-media__main">
        <p className="inline-media__eyebrow">INLINE AUDIO · ASTERIA STYLE</p>
        <div className="inline-media__title-row">
          <strong>{title}</strong>
          <span>{artist}</span>
        </div>
        <p className={`inline-media__lyric ${activeLine ? 'is-active' : ''}`} key={activeLine?.text ?? 'empty'}>
          {failed ? '音频加载失败' : activeLine?.text ?? '等待歌词…'}
        </p>
        <div className="inline-media__progress">
          <span>{formatTime(current)}</span>
          <MediaRange
            value={Math.min(current, duration || 0.1)}
            min={0}
            max={Math.max(duration, 0.1)}
            step={0.05}
            label="播放进度"
            onChange={(next) => {
              setCurrent(next);
              if (audioRef.current) audioRef.current.currentTime = next;
            }}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="inline-media__controls">
        <button type="button" className="inline-media__play" aria-label={playing ? '暂停' : '播放'} onClick={toggle}>
          {playing ? <PauseRegular aria-hidden /> : <PlayRegular aria-hidden />}
        </button>
        <div className="inline-media__volume">
          <button type="button" aria-label={muted ? '取消静音' : '静音'} onClick={() => setMuted((value) => !value)}>
            {muted ? <SpeakerMuteRegular aria-hidden /> : <Speaker2Regular aria-hidden />}
          </button>
          <MediaRange value={volume} min={0} max={1} step={0.01} label="音量" onChange={setVolume} />
        </div>
        <a className="inline-media__asteria" href={asteriaLink(src, 'audio')} target="_blank" rel="noopener noreferrer">
          <OpenRegular aria-hidden /> Asteria Player
        </a>
      </div>
    </div>
  );
}

export interface InlineSubtitle {
  src: string;
  label: string;
  lang: string;
  default?: boolean;
}

export interface InlineVideoProps {
  src: string;
  poster?: string;
  title: string;
  subtitles?: InlineSubtitle[];
}

export function InlineVideoPlayer({ src, poster, title, subtitles = [] }: InlineVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.78);
  const [muted, setMuted] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [subtitle, setSubtitle] = useState(subtitles.length ? 0 : -1);
  const [fullscreen, setFullscreen] = useState(false);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    for (let index = 0; index < video.textTracks.length; index += 1) {
      video.textTracks[index].mode = index === subtitle ? 'showing' : 'disabled';
    }
  }, [subtitle]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const cycleSubtitle = () => {
    if (!subtitles.length) return;
    setSubtitle((currentIndex) => (currentIndex >= subtitles.length - 1 ? -1 : currentIndex + 1));
  };

  const toggleFullscreen = async () => {
    if (!shellRef.current) return;
    if (!document.fullscreenElement) await shellRef.current.requestFullscreen().catch(() => undefined);
    else await document.exitFullscreen().catch(() => undefined);
  };

  return (
    <div className="inline-media inline-media--video" ref={shellRef}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        style={{ filter: `brightness(${brightness})` }}
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      >
        {subtitles.map((track) => (
          <track key={track.src} kind="subtitles" src={track.src} label={track.label} srcLang={track.lang} default={track.default} />
        ))}
      </video>
      <div className="inline-media__video-head">
        <span>INLINE VIDEO</span>
        <strong>{title}</strong>
      </div>
      <div className="inline-media__video-controls">
        <div className="inline-media__video-progress">
          <span>{formatTime(current)}</span>
          <MediaRange
            value={Math.min(current, duration || 0.1)}
            min={0}
            max={Math.max(duration, 0.1)}
            step={0.05}
            label="视频进度"
            onChange={(next) => {
              setCurrent(next);
              if (videoRef.current) videoRef.current.currentTime = next;
            }}
          />
          <span>{formatTime(duration)}</span>
        </div>
        <div className="inline-media__video-row">
          <button type="button" className="inline-media__play" aria-label={playing ? '暂停' : '播放'} onClick={toggle}>
            {playing ? <PauseRegular aria-hidden /> : <PlayRegular aria-hidden />}
          </button>
          <div className="inline-media__volume">
            <button type="button" aria-label={muted ? '取消静音' : '静音'} onClick={() => setMuted((value) => !value)}>
              {muted ? <SpeakerMuteRegular aria-hidden /> : <Speaker2Regular aria-hidden />}
            </button>
            <MediaRange value={volume} min={0} max={1} step={0.01} label="音量" onChange={setVolume} />
          </div>
          <div className="inline-media__brightness">
            <span aria-hidden>☀</span>
            <MediaRange
              value={brightness}
              min={0.45}
              max={1.5}
              step={0.01}
              label="亮度"
              className="media-range--warm"
              onChange={setBrightness}
            />
          </div>
          {subtitles.length > 0 && (
            <button
              type="button"
              className={`inline-media__cc ${subtitle >= 0 ? 'is-on' : ''}`}
              aria-label="切换字幕"
              aria-pressed={subtitle >= 0}
              onClick={cycleSubtitle}
            >
              CC
            </button>
          )}
          <button type="button" className="inline-media__icon" aria-label={fullscreen ? '退出全屏' : '全屏'} onClick={toggleFullscreen}>
            <FullScreenMaximizeRegular aria-hidden />
          </button>
          <a className="inline-media__asteria" href={asteriaLink(src, 'video')} target="_blank" rel="noopener noreferrer">
            <OpenRegular aria-hidden /> Asteria
          </a>
        </div>
      </div>
    </div>
  );
}
