/** 主页 / Home page. */
import { HeroCarousel } from '../components/home/HeroCarousel';
import { Marquee } from '../components/home/Marquee';
import {
  HomeCTA,
  LatestVideos,
  NowSection,
  ProjectGrid,
  TimelineSection,
} from '../components/home/HomeSections';

export default function HomePage() {
  return (
    <div className="page page--home">
      {/* 整页唯一的 h1；轮播里的视觉标题用 h2，避免出现 4 个 h1。 */}
      <h1 className="sr-only">滄海水魚 · 水鱼 Blog —— 个人主页与影像归档</h1>
      <HeroCarousel />
      <Marquee />
      <NowSection />
      <ProjectGrid />
      <LatestVideos />
      <TimelineSection />
      <HomeCTA />
    </div>
  );
}
