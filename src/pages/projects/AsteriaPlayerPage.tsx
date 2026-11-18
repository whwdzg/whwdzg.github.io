/** Asteria Player 项目页 / Sub-site project page. */
import { useMemo } from 'react';
import { ArrowRightRegular, CheckmarkCircleRegular, OpenRegular, PlayRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { subsiteById } from '../../data/site';
import { SubsiteShell } from '../../components/projects/SubsiteShell';
import { Reveal } from '../../components/common/Reveal';
import { InlineMusicPlayer, InlineVideoPlayer } from '../../components/common/InlineMedia';
import '../../styles/projects.css';

const TOC = [
  { id: 'overview', label: '总览' },
  { id: 'features', label: '能力' },
  { id: 'media', label: '正文媒体' },
  { id: 'screens', label: '界面' },
  { id: 'tech', label: '技术' },
  { id: 'links', label: '链接' },
];

const FEATURES = [
  ['音乐与视频', '同一套播放器处理本地音视频，支持媒体库、队列、作者 / 专辑页与在线链接导入。'],
  ['逐字歌词', 'LRC、SPL、增强 LRC 逐字标记、翻译配对与内嵌歌词，接近 Apple Music 的滚动高亮。'],
  ['视频弹幕', 'B 站风格滚动 / 顶部 / 底部弹幕，SRT / VTT 字幕，ASS / XML / JSON 弹幕导入。'],
  ['移动端手势', '亮度、音量、进度、长按倍速、双击播放、横屏沉浸全屏与四向滑动页面。'],
  ['Fluent / 玻璃', 'Sun Valley 表面、可选 Liquid Glass、封面提取主题色与动态环境背景。'],
  ['PWA 离线', '安装后保留媒体库、队列与播放进度；Service Worker 缓存外壳和资源。'],
];

export default function AsteriaPlayerPage() {
  const project = subsiteById('asteria-player');
  const toc = useMemo(() => TOC, []);
  if (!project) return null;

  return (
    <SubsiteShell
      title={project.title}
      subtitle={project.subtitle}
      description="Asteria Player 是一个以 Microsoft Fluent Design 为视觉基底、融合可选 Apple Liquid Glass 的网页音乐 / 视频播放器。主站不重复实现播放器；需要播放本地媒体时，直接打开这个子站。"
      icon={project.icon}
      url={project.url}
      github={project.github}
      accent={project.accent}
      meta={[
        { icon: 'play', label: '音乐 / 视频' },
        { icon: 'sparkle', label: '逐字歌词 · 弹幕' },
        { icon: 'install', label: 'PWA 离线库' },
        { icon: 'code', label: 'React + Vite' },
      ]}
      toc={toc}
    >
      <Reveal as="section" className="article-card project-overview" id="overview">
        <p className="eyebrow">OVERVIEW</p>
        <h2>把播放器，做成一个独立子站</h2>
        <p>
          Asteria Player 负责音乐、视频、歌词、字幕、弹幕与移动端手势；主站只保留项目介绍和入口。这样播放器可以独立迭代、独立部署，
          也不会把媒体解析逻辑塞进主站首屏。
        </p>
        <div className="project-stat-grid">
          <div>
            <strong>2</strong>
            <span>音乐 / 视频</span>
          </div>
          <div>
            <strong>4</strong>
            <span>播放模式</span>
          </div>
          <div>
            <strong>14</strong>
            <span>可自定义快捷键</span>
          </div>
          <div>
            <strong>PWA</strong>
            <span>离线媒体库</span>
          </div>
        </div>
        <div className="project-feature-grid">
          {FEATURES.slice(0, 3).map(([title, text]) => (
            <div key={title}>
              <CheckmarkCircleRegular aria-hidden />
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="features">
        <p className="eyebrow">CAPABILITIES</p>
        <h2>播放器能力</h2>
        <div className="project-feature-grid">
          {FEATURES.map(([title, text]) => (
            <div key={title}>
              <PlayRegular aria-hidden />
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="project-callout">
          <PlayRegular aria-hidden />
          <p>
            正文需要嵌入音乐或视频时，使用下方的轻量播放器；完整媒体库、队列与歌词编辑仍然在 Asteria Player 中完成。
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="media">
        <p className="eyebrow">INLINE MEDIA</p>
        <h2>正文里的轻量播放器</h2>
        <p className="project-section-lead">
          固定在正文内，不跳出当前页面。音乐保留封面、单行歌词、进度与音量；视频支持全屏、字幕、音量与亮度。
          需要完整播放器时，点右侧入口到 Asteria Player。
        </p>
        <div className="inline-media-demo">
          <InlineMusicPlayer
            src="/media/samples/asteria-session.mp3"
            title="Asteria Session"
            artist="沧海水鱼 · demo"
            cover="/media/samples/asteria-session.webp"
            lyrics={[
              { time: 0, text: '在星尘落下的地方' },
              { time: 8, text: '我们仍抬头仰望' },
              { time: 16, text: '让光和风穿过指缝' },
              { time: 24, text: '把这一刻留在声场' },
              { time: 32, text: '尘埃尚未落定' },
              { time: 40, text: '时间仍在谱写' },
            ]}
          />
          <InlineVideoPlayer
            src="/media/samples/asteria-flower.mp4"
            poster="/media/samples/asteria-flower-poster.webp"
            title="花与风 · inline video"
            subtitles={[{ src: '/media/samples/asteria-flower.vtt', label: '中文', lang: 'zh-CN', default: true }]}
          />
        </div>
        <p className="project-note">示例媒体为正文播放器演示，不进入 Asteria Player 的媒体库。</p>
      </Reveal>

      <Reveal as="section" className="article-card" id="screens">
        <p className="eyebrow">SCREENS</p>
        <h2>界面截图</h2>
        <p className="project-section-lead">以下截图来自 Asteria Player 仓库，点击可查看大图。</p>
        <div className="subsite-gallery">
          <figure>
            <img src="/media/projects/asteria-desktop.webp" alt="Asteria Player 桌面端" loading="lazy" data-lightbox="on" />
            <figcaption>桌面端 · 播放页与歌词</figcaption>
          </figure>
          <figure>
            <img src="/media/projects/asteria-mobile.webp" alt="Asteria Player 移动端" loading="lazy" data-lightbox="on" />
            <figcaption>移动端 · 沉浸式播放</figcaption>
          </figure>
          <figure>
            <img src="/media/projects/asteria-video.webp" alt="Asteria Player 视频全屏" loading="lazy" data-lightbox="on" />
            <figcaption>视频 · 全屏与弹幕</figcaption>
          </figure>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="tech">
        <p className="eyebrow">STACK</p>
        <h2>技术栈</h2>
        <div className="project-table-wrap">
          <table className="project-table">
            <tbody>
              <tr><td>框架</td><td>React 19 + Vite 7 + TypeScript</td></tr>
              <tr><td>状态 / 列表</td><td>Zustand + TanStack Virtual</td></tr>
              <tr><td>媒体</td><td>双媒体元素 + Web Audio 图；本地文件 / 直链 / B 站单视频</td></tr>
              <tr><td>歌词 / 字幕</td><td>LRC / SPL / 增强 LRC；SRT / VTT；XML / JSON / ASS 弹幕</td></tr>
              <tr><td>部署</td><td>GitHub Pages 子路径 <code>/Asteria-Player/</code>，相对 base，PWA</td></tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="links">
        <p className="eyebrow">LINKS</p>
        <h2>入口</h2>
        <div className="project-link-grid">
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <strong>打开 Asteria Player</strong>
            <span>独立子站 · 支持安装为 PWA</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            <strong>GitHub</strong>
            <span>源码、Issue 与版本记录</span>
            <OpenRegular aria-hidden />
          </a>
        </div>
        <Link className="text-link" to="/projects/github/">
          查看 GitHub 项目页 <ArrowRightRegular aria-hidden />
        </Link>
        <p className="project-note">具体版本以 Asteria Player 子站的关于页为准。</p>
      </Reveal>
    </SubsiteShell>
  );
}
