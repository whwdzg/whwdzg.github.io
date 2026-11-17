/** 来福 Simulation Wiki 项目页 / Static wiki mirror sub-site. */
import { useMemo } from 'react';
import { ArrowRightRegular, CheckmarkCircleRegular, DocumentRegular, OpenRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { subsiteById } from '../../data/site';
import { SubsiteShell } from '../../components/projects/SubsiteShell';
import { Reveal } from '../../components/common/Reveal';
import '../../styles/projects.css';

const TOC = [
  { id: 'overview', label: '总览' },
  { id: 'features', label: '能力' },
  { id: 'screens', label: '界面' },
  { id: 'tech', label: '技术' },
  { id: 'links', label: '链接' },
];

export default function LifeSimulationWikiPage() {
  const project = subsiteById('life-simulation-wiki');
  const toc = useMemo(() => TOC, []);
  if (!project) return null;

  return (
    <SubsiteShell
      title={project.title}
      subtitle={project.subtitle}
      description="来福 Simulation Wiki 的全量静态镜像：通过 MediaWiki API 每小时同步页面、模板与媒体，生成可离线浏览、可搜索的静态站点。"
      icon={project.icon}
      url={project.url}
      github={project.github}
      accent={project.accent}
      meta={[
        { icon: 'document', label: '451 个页面' },
        { icon: 'image', label: '195 个媒体文件' },
        { icon: 'refresh', label: '每小时同步' },
        { icon: 'install', label: '可离线浏览' },
      ]}
      toc={toc}
    >
      <Reveal as="section" className="article-card project-overview" id="overview">
        <p className="eyebrow">OVERVIEW</p>
        <h2>把一个 Wiki，镜像成可离线浏览的静态站</h2>
        <p>
          现在覆盖 9 个命名空间：条目、用户、项目、文件、模板、分类、博客、模块与地图。MediaWiki 在构建时展开模板与解析器函数，图片、音频和视频全部落到本地，页面不依赖 Fandom 外链。
          镜像还保留 MediaWiki / Fandom 组件样式与深色主题；运行时使用静态搜索索引和 PWA 离线缓存。
        </p>
        <div className="project-stat-grid">
          <div>
            <strong>451</strong>
            <span>页面</span>
          </div>
          <div>
            <strong>195</strong>
            <span>媒体文件</span>
          </div>
          <div>
            <strong>68</strong>
            <span>条目</span>
          </div>
          <div>
            <strong>1h</strong>
            <span>同步周期</span>
          </div>
        </div>
        <div className="project-feature-grid">
          <div>
            <CheckmarkCircleRegular aria-hidden />
            <strong>全量命名空间</strong>
            <p>条目、用户、项目、文件、模板、分类、博客、模块与地图共 451 个页面。</p>
          </div>
          <div>
            <CheckmarkCircleRegular aria-hidden />
            <strong>离线浏览</strong>
            <p>PWA + Service Worker 缓存，断网后仍可查看已同步条目。</p>
          </div>
          <div>
            <CheckmarkCircleRegular aria-hidden />
            <strong>自动部署</strong>
            <p>GitHub Actions 定时同步、构建并发布到 Pages。</p>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="features">
        <p className="eyebrow">CAPABILITIES</p>
        <h2>镜像能力</h2>
        <div className="project-feature-grid">
          <div>
            <DocumentRegular aria-hidden />
            <strong>模板预展开</strong>
            <p>MediaWiki 在构建时解析模板、信息框、导航框与标签页，静态 HTML 无需 JavaScript。</p>
          </div>
          <div>
            <DocumentRegular aria-hidden />
            <strong>媒体本地化</strong>
            <p>195 个原文件、缩略图、音频与视频保存到 <code>dist/media/</code>，不依赖 Fandom CDN。</p>
          </div>
          <div>
            <DocumentRegular aria-hidden />
            <strong>静态搜索</strong>
            <p>生成 <code>data/search.json</code>，在本地搜索标题、摘要与正文。</p>
          </div>
          <div>
            <DocumentRegular aria-hidden />
            <strong>增量媒体缓存</strong>
            <p>用媒体清单签名作为 GitHub Actions 缓存键，无变更时跳过重复下载。</p>
          </div>
          <div>
            <DocumentRegular aria-hidden />
            <strong>主题与移动端</strong>
            <p>保留 MediaWiki / Fandom 组件样式，支持深色主题、窄屏与触摸导航。</p>
          </div>
          <div>
            <DocumentRegular aria-hidden />
            <strong>失败回退</strong>
            <p>单页或媒体失败不会中断整次构建；页面保留提示，下一小时重试。</p>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="screens">
        <p className="eyebrow">SCREENS</p>
        <h2>界面截图</h2>
        <p className="project-section-lead">以下截图来自线上镜像站，点击可查看大图。</p>
        <div className="subsite-gallery">
          <figure>
            <img src="/media/projects/life-simulation-wiki-desktop.webp" alt="来福 Simulation Wiki 桌面端" loading="lazy" data-lightbox="on" />
            <figcaption>桌面端 · 首页与目录</figcaption>
          </figure>
          <figure>
            <img src="/media/projects/life-simulation-wiki-mobile.webp" alt="来福 Simulation Wiki 移动端" loading="lazy" data-lightbox="on" />
            <figcaption>移动端 · 条目阅读</figcaption>
          </figure>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="tech">
        <p className="eyebrow">STACK</p>
        <h2>技术栈</h2>
        <div className="project-table-wrap">
          <table className="project-table">
            <tbody>
              <tr><td>生成器</td><td>Node.js 20 + 自定义静态站点生成器</td></tr>
              <tr><td>数据源</td><td>MediaWiki API（action=parse，每小时同步）</td></tr>
              <tr><td>范围</td><td>9 个命名空间 · 451 个页面 · 195 个媒体文件</td></tr>
              <tr><td>数据</td><td><code>data/search.json</code> + 页面 HTML + <code>dist/media/</code></td></tr>
              <tr><td>运行</td><td>静态 HTML、本地搜索、PWA / Service Worker</td></tr>
              <tr><td>部署</td><td>GitHub Actions → GitHub Pages 子路径 <code>/Life-Simulation-Wiki/</code></td></tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="links">
        <p className="eyebrow">LINKS</p>
        <h2>入口</h2>
        <div className="project-link-grid">
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <strong>打开 Wiki 镜像</strong>
            <span>451 个页面 · 195 个媒体文件 · 可离线浏览</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            <strong>GitHub</strong>
            <span>同步脚本、主题与部署工作流</span>
            <OpenRegular aria-hidden />
          </a>
        </div>
        <Link className="text-link" to="/projects/github/">
          查看 GitHub 项目页 <ArrowRightRegular aria-hidden />
        </Link>
        <p className="project-note">迁移内容来自来福 Simulation Wiki，遵循原站 CC BY-SA 3.0 署名要求。</p>
      </Reveal>
    </SubsiteShell>
  );
}
