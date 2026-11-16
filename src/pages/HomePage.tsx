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
