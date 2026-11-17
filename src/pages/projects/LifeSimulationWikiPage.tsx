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
      description="来福 Simulation Wiki 的静态镜像：通过 MediaWiki API 定时同步主命名空间条目与媒体，生成可离线浏览、可搜索的 VitePress 站点。"
      icon={project.icon}
      url={project.url}
      github={project.github}
      accent={project.accent}
      meta={[
        { icon: 'document', label: '68 篇条目' },
        { icon: 'history', label: '2,213 次编辑' },
        { icon: 'refresh', label: '每小时同步' },
        { icon: 'install', label: 'PWA 离线' },
      ]}
      toc={toc}
    >
      <Reveal as="section" className="article-card project-overview" id="overview">
        <p className="eyebrow">OVERVIEW</p>
        <h2>把一个 Wiki，镜像成可离线浏览的静态站</h2>
        <p>
          这个子站不是简单的网页抓取：脚本通过 MediaWiki API 同步条目、图片、音频与视频，重写站内链接，再用 VitePress 生成静态页面。
          运行时使用哈希路由加载 JSON 数据，Service Worker 提供离线缓存。
        </p>
        <div className="project-stat-grid">
          <div>
            <strong>68</strong>
            <span>迁移条目</span>
          </div>
          <div>
            <strong>2,213</strong>
            <span>次编辑记录</span>
          </div>
          <div>
            <strong>3</strong>
            <span>贡献者</span>
          </div>
          <div>
            <strong>1h</strong>
            <span>同步周期</span>
          </div>
        </div>
        <div className="project-feature-grid">
          <div>
            <CheckmarkCircleRegular aria-hidden />
            <strong>完整镜像</strong>
            <p>主命名空间条目、媒体文件、站内链接重写与本地资源路径。</p>
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
            <strong>条目数据</strong>
            <p>生成 <code>index.json</code> 与逐页 JSON，包含标题、正文、目录与元数据。</p>
          </div>
          <div>
            <DocumentRegular aria-hidden />
            <strong>媒体本地化</strong>
            <p>图片、音频、视频落到 <code>wiki-assets</code>，避免依赖源站跨域与外链。</p>
          </div>
          <div>
            <DocumentRegular aria-hidden />
            <strong>直链兜底</strong>
            <p>每个条目生成独立 Markdown 入口，刷新与分享不会 404。</p>
          </div>
          <div>
            <DocumentRegular aria-hidden />
            <strong>站内搜索</strong>
            <p>基于同步后的 JSON 索引，不依赖外部搜索服务。</p>
          </div>
          <div>
            <DocumentRegular aria-hidden />
            <strong>主题与移动端</strong>
            <p>保留 Wiki 的绿色视觉，同时适配窄屏与触摸导航。</p>
          </div>
          <div>
            <DocumentRegular aria-hidden />
            <strong>CC BY-SA</strong>
            <p>迁移页面保留原 Wiki 的署名链接；发布前确认媒体再发布权利。</p>
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
              <tr><td>生成器</td><td>VitePress 1.6 + 自定义主题</td></tr>
              <tr><td>数据源</td><td>MediaWiki API（每小时同步）</td></tr>
              <tr><td>数据</td><td><code>index.json</code> + <code>pages/*.json</code> + 本地媒体</td></tr>
              <tr><td>运行</td><td>哈希路由 <code>#/wiki/</code>、站内搜索、PWA / Service Worker</td></tr>
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
            <span>68 篇条目 · 可离线浏览</span>
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
        <p className="project-note">迁移内容来自来福 Simulation Wiki，遵循原站 CC BY-SA 署名要求。</p>
      </Reveal>
    </SubsiteShell>
  );
}
