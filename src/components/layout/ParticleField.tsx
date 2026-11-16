/**
 * 粒子背景 / Lightweight canvas particles.
 *
 * 设计目标：只做背景氛围，不抢 CPU。
 * - 粒子数量按视口面积计算，最多 28 个；
 * - DPR 上限 1.5，避免 4K 屏把 fill 成本放大 4 倍；
 * - 页面隐藏、设置关闭、系统减少动画时立即停掉 rAF。
 */
import { useEffect, useRef } from 'react';
import { useSettings } from '../../hooks/useSettings';
import type { ParticleKind } from '../../lib/settings';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  sway: number;
  phase: number;
  alpha: number;
}

interface Palette {
  colors: string[];
  shape: 'petal' | 'leaf' | 'ginkgo' | 'snow';
}

const PALETTES: Record<Exclude<ParticleKind, 'off'>, Palette> = {
  sakura: { colors: ['#ffb7c9', '#ff9fb8', '#ffd6e2', '#f78fb0'], shape: 'petal' },
  wutong: { colors: ['#c98b4b', '#b9743a', '#e0a35e', '#9c5c32'], shape: 'leaf' },
  ginkgo: { colors: ['#f2c14e', '#e8b23a', '#f7d46b', '#d99b27'], shape: 'ginkgo' },
  snow: { colors: ['#ffffff', '#e8f2ff', '#d8e8ff'], shape: 'snow' },
};

function createParticle(width: number, height: number, kind: Exclude<ParticleKind, 'off'>): Particle {
  const size = kind === 'snow' ? 1.2 + Math.random() * 2.4 : 5 + Math.random() * 8;
  return {
    x: Math.random() * width,
    y: Math.random() * height - height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: kind === 'snow' ? 0.35 + Math.random() * 0.8 : 0.25 + Math.random() * 0.55,
    size,
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.02,
    sway: 0.4 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.25 + Math.random() * 0.5,
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle, kind: Exclude<ParticleKind, 'off'>) {
  const palette = PALETTES[kind];
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  ctx.globalAlpha = particle.alpha;
  ctx.fillStyle = palette.colors[Math.floor(particle.size * 7) % palette.colors.length];

  if (kind === 'snow') {
    ctx.beginPath();
    ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'sakura') {
    ctx.beginPath();
    ctx.ellipse(0, 0, particle.size * 0.9, particle.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = particle.alpha * 0.5;
    ctx.beginPath();
    ctx.ellipse(particle.size * 0.25, 0, particle.size * 0.35, particle.size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'ginkgo') {
    // 扇形银杏叶
    ctx.beginPath();
    ctx.moveTo(0, particle.size * 0.6);
    ctx.quadraticCurveTo(-particle.size, -particle.size * 0.4, 0, -particle.size * 0.8);
    ctx.quadraticCurveTo(particle.size, -particle.size * 0.4, 0, particle.size * 0.6);
    ctx.fill();
  } else {
    // 梧桐叶：两段贝塞尔构成椭圆叶形
    ctx.beginPath();
    ctx.moveTo(0, -particle.size);
    ctx.bezierCurveTo(particle.size, -particle.size * 0.2, particle.size * 0.7, particle.size, 0, particle.size);
    ctx.bezierCurveTo(-particle.size * 0.7, particle.size, -particle.size, -particle.size * 0.2, 0, -particle.size);
    ctx.fill();
    ctx.globalAlpha = particle.alpha * 0.6;
    ctx.strokeStyle = 'rgba(60, 30, 10, 0.5)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, -particle.size);
    ctx.lineTo(0, particle.size);
    ctx.stroke();
  }
  ctx.restore();
}

export function ParticleField() {
  const { settings } = useSettings();
  const ref = useRef<HTMLCanvasElement>(null);
  const kind = settings.particles;

  useEffect(() => {
    if (kind === 'off') return;
    if (settings.motion === 'reduced') return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches && settings.motion === 'system') {
      return;
    }

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let frame = 0;
    let last = performance.now();
    let running = true;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(28, Math.max(12, Math.round((width * height) / 70000)));
      particles = Array.from({ length: count }, () => createParticle(width, height, kind));
    };

    const tick = (now: number) => {
      if (!running) return;
      const delta = Math.min(48, now - last) / 16.67;
      last = now;
      ctx.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.phase += 0.01 * delta;
        particle.x += (particle.vx + Math.sin(particle.phase) * particle.sway * 0.25) * delta;
        particle.y += particle.vy * delta;
        particle.rotation += particle.spin * delta;
        if (particle.y > height + 30) {
          particle.y = -30;
          particle.x = Math.random() * width;
        }
        if (particle.x < -30) particle.x = width + 30;
        if (particle.x > width + 30) particle.x = -30;
        drawParticle(ctx, particle, kind);
      }
      frame = window.requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        window.cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        last = performance.now();
        frame = window.requestAnimationFrame(tick);
      }
    };

    resize();
    frame = window.requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      ctx.clearRect(0, 0, width, height);
    };
  }, [kind, settings.motion]);

  if (kind === 'off') return null;
  return <canvas ref={ref} className="particle-field" aria-hidden />;
}

