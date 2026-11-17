/** 掩星 / Occultation — an experimental star-rise page. */
import { useEffect, useRef, useState } from 'react';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import '../../styles/occultation.css';

const PHRASE = '尘埃尚未落定，时间仍在谱写';
const GLYPHS = '01<>/\\|{}[]#%&*+-=~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function ScrambleLine() {
  const [display, setDisplay] = useState(PHRASE);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDisplay(PHRASE);
      return;
    }
    let stopped = false;
    let timer = 0;
    let restart = 0;

    const cycle = () => {
      let frame = 0;
      const characters = [...PHRASE];
      timer = window.setInterval(() => {
        if (stopped) return;
        const revealed = Math.min(characters.length, Math.floor(frame / 2));
        setDisplay(
          characters
            .map((character, index) => (index < revealed ? character : randomGlyph()))
            .join(''),
        );
        frame += 1;
        if (revealed >= characters.length) {
          window.clearInterval(timer);
          restart = window.setTimeout(() => {
            if (!stopped) cycle();
          }, 5600);
        }
      }, 46);
    };

    cycle();
    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.clearTimeout(restart);
    };
  }, []);

  return (
    <p className="occultation-phrase" data-text={PHRASE} aria-label={PHRASE}>
      <span aria-hidden>{display}</span>
    </p>
  );
}

function Hud() {
  const [readout, setReadout] = useState({
    time: '00:00:00',
    signal: '0x7F3A',
    drift: '+0.000',
    phase: '00',
  });

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const timer = window.setInterval(() => {
      setReadout({
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        signal: `0x${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0')}`,
        drift: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 0.09).toFixed(3)}`,
        phase: String(Math.floor(Math.random() * 99)).padStart(2, '0'),
      });
    }, 140);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <div className="occultation-hud occultation-hud--tl" aria-hidden>
        <span>SYS / OCCULTATION</span>
        <span>NODE 00-A · {readout.time}</span>
      </div>
      <div className="occultation-hud occultation-hud--tr" aria-hidden>
        <span>RA 05h 35m 17.3s</span>
        <span>DEC −05° 23′ 28″</span>
      </div>
      <div className="occultation-hud occultation-hud--bl" aria-hidden>
        <span>SIGNAL {readout.signal}</span>
        <span>DRIFT {readout.drift}</span>
      </div>
      <div className="occultation-hud occultation-hud--br" aria-hidden>
        <span>PHASE {readout.phase}</span>
        <span>DUST / UNRESOLVED</span>
      </div>
    </>
  );
}

export default function OccultationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let animation = 0;
    let stars: Array<{ x: number; y: number; size: number; phase: number; speed: number }> = [];
    let trail: Array<{ x: number; y: number; life: number }> = [];

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(320, bounds.width);
      height = Math.max(480, bounds.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      stars = Array.from({ length: 130 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.35 + Math.random() * 1.25,
        phase: Math.random() * Math.PI * 2,
        speed: 0.25 + Math.random() * 0.9,
      }));
      if (reduced) draw(6200);
    };

    const drawStar = (x: number, y: number, alpha: number) => {
      const glow = context.createRadialGradient(x, y, 0, x, y, 150);
      glow.addColorStop(0, `rgba(205, 236, 255, ${0.5 * alpha})`);
      glow.addColorStop(0.12, `rgba(120, 198, 255, ${0.35 * alpha})`);
      glow.addColorStop(0.42, `rgba(85, 120, 255, ${0.13 * alpha})`);
      glow.addColorStop(1, 'rgba(13, 18, 40, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(x, y, 150, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = `rgba(196, 235, 255, ${0.5 * alpha})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x - 90, y);
      context.lineTo(x + 90, y);
      context.moveTo(x, y - 76);
      context.lineTo(x, y + 76);
      context.stroke();

      context.fillStyle = `rgba(245, 252, 255, ${alpha})`;
      context.beginPath();
      context.arc(x, y, 2.6, 0, Math.PI * 2);
      context.fill();
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      // star field
      for (const star of stars) {
        const twinkle = 0.35 + Math.abs(Math.sin(time * 0.0004 * star.speed + star.phase)) * 0.65;
        context.fillStyle = `rgba(185, 219, 255, ${twinkle * 0.7})`;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      }

      const progress = reduced ? 0.58 : (time % 16000) / 16000;
      const eased = 1 - (1 - progress) ** 3;
      const starX = width * 0.5 + Math.sin(time * 0.00022) * width * 0.075;
      const starY = height * (0.84 - eased * 0.5);
      const fade = Math.min(1, progress * 5) * Math.min(1, (1 - progress) * 8);
      const alpha = Math.max(0.15, fade);

      if (!reduced) {
        trail.push({ x: starX + (Math.random() - 0.5) * 5, y: starY + (Math.random() - 0.5) * 5, life: 1 });
        trail = trail
          .map((particle) => ({ ...particle, life: particle.life - 0.018, y: particle.y + 0.65 }))
          .filter((particle) => particle.life > 0)
          .slice(-110);
        for (const particle of trail) {
          context.fillStyle = `rgba(118, 184, 255, ${particle.life * 0.42})`;
          context.beginPath();
          context.arc(particle.x, particle.y, particle.life * 2.2, 0, Math.PI * 2);
          context.fill();
        }
      }

      // orbit rings
      context.strokeStyle = `rgba(114, 190, 255, ${0.19 * alpha})`;
      context.lineWidth = 0.8;
      for (let ring = 0; ring < 3; ring += 1) {
        context.beginPath();
        context.ellipse(
          starX,
          starY,
          52 + ring * 31,
          15 + ring * 9,
          -0.38 + Math.sin(time * 0.00015 + ring) * 0.08,
          0,
          Math.PI * 2,
        );
        context.stroke();
      }

      drawStar(starX, starY, alpha);

      // horizontal signal glitch
      if (!reduced && Math.sin(time * 0.0017) > 0.97) {
        const y = Math.random() * height;
        context.fillStyle = 'rgba(140, 208, 255, 0.16)';
        context.fillRect(0, y, width, 1);
      }

      if (!reduced) animation = window.requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (!reduced) animation = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animation);
    };
  }, []);

  return (
    <div className="occultation-page" aria-labelledby="occultation-title">
      <canvas ref={canvasRef} className="occultation-canvas" aria-hidden />
      <div className="occultation-grid" aria-hidden />
      <div className="occultation-scan" aria-hidden />
      <div className="occultation-vignette" aria-hidden />
      <Hud />

      <Link className="occultation-back" to="/projects/modrinth/">
        <ArrowLeftRegular aria-hidden /> PROJECTS
      </Link>

      <div className="occultation-core">
        <p className="occultation-kicker">PROJECT · OCCULTATION · 00</p>
        <h1 id="occultation-title" className="occultation-title">
          <span className="occultation-title__cn" data-text="掩星">掩星</span>
          <span className="occultation-title__en">OCCULTATION</span>
        </h1>
        <ScrambleLine />
        <p className="occultation-coordinates" aria-hidden>
          05 35 17.3 / −05 23 28 / DUST NOT SETTLED / TIME STILL WRITING
        </p>
      </div>

      <div className="occultation-corner occultation-corner--bottom" aria-hidden>
        <span>SCROLL / NONE</span>
        <span>STAR RISE / 16.0S</span>
      </div>
    </div>
  );
}
