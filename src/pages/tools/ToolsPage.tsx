/** 工具索引 / Tools index. */
import { ArrowRightRegular, CodeRegular, OpenRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { TOOLS } from '../../data/tools';
import { PageIntro } from '../../components/layout/PageIntro';
import { FluentIcon } from '../../components/common/FluentIcon';
import { Reveal } from '../../components/common/Reveal';
import '../../styles/tools.css';

export default function ToolsPage() {
  return (
    <div className="page page--tools">
      <PageIntro
        eyebrow="SITE · TOOLS"
        title="站内工具"
        lead="编码、进制、Unicode、科学计算器、Markdown 思维导图、AI 内容痕迹检查与 Minecraft 投影。全部在浏览器本地运行，不上传输入内容。"
        meta={[
          { icon: 'code', label: `${TOOLS.length} 个工具` },
          { icon: 'shield', label: '本地处理' },
          { icon: 'install', label: '可离线使用' },
        ]}
        actions={
          <>
            <Link className="btn btn--primary btn--md" to="/tools/calculator/">
              打开计算器 <ArrowRightRegular aria-hidden />
            </Link>
            <Link className="btn btn--ghost btn--md" to="/tools/mc-projection/">
              MC 投影 <ArrowRightRegular aria-hidden />
            </Link>
          </>
        }
        aside={
          <div className="modrinth-summary">
            <p className="eyebrow">LOCAL FIRST</p>
            <div className="modrinth-summary__stats">
              <div>
                <strong>{TOOLS.length}</strong>
                <span>工具</span>
              </div>
              <div>
                <strong>0</strong>
                <span>上传</span>
              </div>
              <div>
                <strong>PWA</strong>
                <span>可离线</span>
              </div>
            </div>
            <p>编解码与计算全部在浏览器完成；投影文件只在本地解析，不会上传到服务器。</p>
          </div>
        }
      />

      <div className="container tools-page">
        <div className="tool-grid">
          {TOOLS.map((tool, index) => (
            <Reveal as="article" className="tool-card" key={tool.id} delay={index * 45}>
              <div className="tool-card__head">
                <span className="tool-card__icon" style={{ background: `color-mix(in srgb, ${tool.accent} 14%, transparent)`, color: tool.accent }}>
                  <FluentIcon name={tool.icon} size={22} aria-hidden />
                </span>
                <span className="badge">{tool.tag}</span>
              </div>
              <p className="eyebrow">{tool.subtitle}</p>
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
              <Link className="text-link" to={tool.path}>
                打开工具 <ArrowRightRegular aria-hidden />
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal as="section" className="article-card" id="notes">
          <p className="eyebrow">NOTES</p>
          <h2>使用说明</h2>
          <ul className="project-list">
            <li>所有数据都在当前标签页内处理；刷新后不会保留输入（除非使用浏览器/系统剪贴板）。</li>
            <li>计算器支持键盘输入；投影查看器支持鼠标、触摸与 WASD / 方向键移动。</li>
            <li>工具页面按路由懒加载，不影响主页首屏。</li>
          </ul>
          <p className="project-note">
            <CodeRegular aria-hidden /> 工具源码与 2.0 版本归档在 <a href="https://github.com/whwdzg/whwdzg.github.io" target="_blank" rel="noopener noreferrer">GitHub <OpenRegular aria-hidden /></a>。
          </p>
        </Reveal>
      </div>
    </div>
  );
}
