/** Paligraph Canvas 项目页 / Local-first ink & Markdown notebook. */
import { useMemo } from 'react';
import { ArrowDownloadRegular, ArrowRightRegular, CheckmarkCircleRegular, DocumentRegular, OpenRegular } from '@fluentui/react-icons';
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

const FEATURES = [
  ['无限画布与压感笔', '钢笔、铅笔、蜡笔、毛笔四种笔触；压感改变线条粗细，平移缩放不破坏绘制精度。'],
  ['图形纠正与手写数学', '画完直线、矩形、圆形或三角形后停顿即可吸附；长按笔迹可识别简单方程与四则运算。'],
  ['Markdown / Obsidian', '导入单篇 Markdown 或整个 Obsidian 库，保留相对路径与图片附件，生成可批注的阅读卡片。'],
  ['导出 PDF / Markdown', 'Markdown 原样保留，笔迹以快照附加；PDF 按 A4 排版并栅格化，避免中文字体缺失。'],
  ['本地优先', '笔记与笔迹保存在 IndexedDB，不连接账号、不上传文件，也没有遥测与云同步。'],
  ['Fluent / 液态玻璃', 'Sun Valley 材质、可选液态玻璃、浅色 / 深色主题，以及网格、圆点、横线背景。'],
];

export default function PaligraphCanvasPage() {
  const project = subsiteById('paligraph-canvas');
  const toc = useMemo(() => TOC, []);
  if (!project) return null;

  return (
    <SubsiteShell
      title={project.title}
      subtitle={project.subtitle}
      description="Paligraph Canvas 是一个本地优先的网页笔记绘图软件：无限画布、压感笔迹、Markdown 与 Obsidian 库导入，以及 PDF 导出。数据只保存在当前设备。"
      icon={project.icon}
      url={project.url}
      github={project.github}
      accent={project.accent}
      meta={[
        { icon: 'document', label: 'v1.1.0' },
        { icon: 'sparkle', label: '无限画布 · 压感笔' },
        { icon: 'image', label: 'Markdown / Obsidian' },
        { icon: 'install', label: '本地优先' },
      ]}
      toc={toc}
      pwa={false}
    >
      <Reveal as="section" className="article-card project-overview" id="overview">
        <p className="eyebrow">OVERVIEW</p>
        <h2>灵感，落于笔尖</h2>
        <p>
          Paligraph Canvas 把无限画布、手写笔迹和 Markdown 阅读卡片放在同一张画布上。它适合整理灵感、批注 Obsidian 笔记、
          画草图或做手写推演；所有内容留在浏览器本地，不依赖账号或云端。
        </p>
        <div className="project-stat-grid">
          <div><strong>4</strong><span>笔触</span></div>
          <div><strong>4</strong><span>背景模式</span></div>
          <div><strong>4</strong><span>内置语言</span></div>
          <div><strong>0</strong><span>云端依赖</span></div>
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
        <h2>笔记与绘图能力</h2>
        <div className="project-feature-grid">
          {FEATURES.map(([title, text]) => (
            <div key={title}>
              <DocumentRegular aria-hidden />
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="project-callout">
          <ArrowDownloadRegular aria-hidden />
          <p>Markdown、PDF 与设置 JSON 都可以从应用内导出；笔记本体保存在浏览器 IndexedDB，清理站点数据会同时删除本地笔记。</p>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="screens">
        <p className="eyebrow">SCREENS</p>
        <h2>界面截图</h2>
        <p className="project-section-lead">以下截图来自 Paligraph Canvas 仓库，点击可查看大图。</p>
        <div className="subsite-gallery">
          <figure>
            <img src="/media/projects/paligraph-hero-light.webp" alt="Paligraph Canvas 浅色界面" loading="lazy" data-lightbox="on" />
            <figcaption>浅色 · 无限画布与笔记卡片</figcaption>
          </figure>
          <figure>
            <img src="/media/projects/paligraph-tool-options.webp" alt="Paligraph Canvas 笔刷选项" loading="lazy" data-lightbox="on" />
            <figcaption>笔刷选项 · 颜色与尺寸</figcaption>
          </figure>
          <figure>
            <img src="/media/projects/paligraph-shape-recognition.webp" alt="Paligraph Canvas 图形纠正" loading="lazy" data-lightbox="on" />
            <figcaption>图形纠正 · 手绘吸附</figcaption>
          </figure>
          <figure>
            <img src="/media/projects/paligraph-mobile.webp" alt="Paligraph Canvas 移动端" loading="lazy" data-lightbox="on" />
            <figcaption>移动端 · 触控与手写笔</figcaption>
          </figure>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="tech">
        <p className="eyebrow">STACK</p>
        <h2>技术栈</h2>
        <div className="project-table-wrap">
          <table className="project-table">
            <tbody>
              <tr><td>框架</td><td>React 19 + Vite + TypeScript</td></tr>
              <tr><td>画布</td><td>四层 Canvas：背景 / 已提交笔迹 / 实时笔迹 / 选择覆盖层</td></tr>
              <tr><td>数据</td><td>IndexedDB 笔记库 + localStorage 设置；无服务端</td></tr>
              <tr><td>导入</td><td>Markdown / Obsidian vault、图片附件、语言包与设置 JSON</td></tr>
              <tr><td>导出</td><td>Markdown、A4 PDF（按需加载 jsPDF）</td></tr>
              <tr><td>部署</td><td>GitHub Pages 子路径 <code>/Paligraph-Canvas/</code></td></tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="links">
        <p className="eyebrow">LINKS</p>
        <h2>入口</h2>
        <div className="project-link-grid">
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <strong>打开 Paligraph Canvas</strong>
            <span>独立子站 · 本地优先 · 无需账号</span>
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
        <p className="project-note">具体版本与限制以 Paligraph Canvas 子站的关于页为准。</p>
      </Reveal>
    </SubsiteShell>
  );
}
