/** 主页 / Home page. */
import { HeroCarousel } from '../components/home/HeroCarousel';
import { Marquee } from '../components/home/Marquee';
import {
  HomeCTA,
  LatestVideos,
  NowSection,
  ProjectGrid,
  SubsitesAndTools,
  TimelineSection,
} from '../components/home/HomeSections';

export default function HomePage() {
  return (
    <div className="page page--home">
      {/* 整页唯一的 h1；轮播里的视觉标题用 h2，避免出现 4 个 h1。 */}
      <h1 className="sr-only">沧海水鱼 · 水鱼 Blog —— 数据包、影像档案、笔记与前端工具</h1>
      <HeroCarousel />
      <Marquee />
      <NowSection />
      <ProjectGrid />
      <SubsitesAndTools />
      <LatestVideos />
      <TimelineSection />
      <HomeCTA />
    </div>
  );
}
