/** MC 资源包解析 / Minecraft resource pack analyzer. */
import { useMemo } from 'react';
import { ToolShell } from '../../components/tools/ToolShell';
import { PackParser } from '../../components/tools/mc-pack/PackParser';
import '../../styles/tools.css';

const TOC = [
  { id: 'parser', label: '解析资源包' },
  { id: 'formats', label: '版本格式' },
  { id: 'contents', label: '内容分类' },
];

export default function ResourcePackPage() {
  const toc = useMemo(() => TOC, []);
  return (
    <ToolShell
      title="MC 资源包解析"
      lead="拖入一个 Minecraft Java 版资源包 .zip，读取 pack.mcmeta，展示支持的 MC 版本、pack.png 图标、命名空间以及纹理 / 模型 / 方块状态 / 语言 / 字体 / 声音等内容。文件只在浏览器本地解析。"
      meta={[
        { icon: 'image', label: '资源包 .zip' },
        { icon: 'shield', label: '本地解析' },
        { icon: 'commit', label: '格式 4 – 97.1' },
      ]}
      toc={toc}
    >
      <PackParser kind="resource" />

      <section className="article-card" id="formats">
        <p className="eyebrow">FORMAT</p>
        <h2>版本格式</h2>
        <p>
          资源包与数据包使用不同的格式编号。1.21.9 之后同样使用 <code>[major, minor]</code> 形式，
          例如 26.3 资源包格式为 <code>97.1</code>，数据包则是 <code>121.0</code>。
        </p>
        <div className="project-table-wrap">
          <table className="project-table">
            <thead><tr><th>资源包格式</th><th>Minecraft</th></tr></thead>
            <tbody>
              <tr><td>97.1</td><td>26.3</td></tr>
              <tr><td>84.0</td><td>26.1 – 26.1.2</td></tr>
              <tr><td>64</td><td>1.21.7 – 1.21.8</td></tr>
              <tr><td>55</td><td>1.21.5</td></tr>
              <tr><td>34</td><td>1.21 – 1.21.1</td></tr>
              <tr><td>15</td><td>1.20 – 1.20.1</td></tr>
              <tr><td>4</td><td>1.13 – 1.14.4</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="article-card" id="contents">
        <p className="eyebrow">CONTENTS</p>
        <h2>内容分类</h2>
        <ul className="project-list">
          <li><strong>视觉</strong>：textures、models、blockstates、particles、atlases。</li>
          <li><strong>界面 / 文本</strong>：lang、font、font_providers。</li>
          <li><strong>声音 / 着色器</strong>：sounds、shaders、post_effect。</li>
          <li><strong>其他</strong>：equipment、items、overlays 等。</li>
        </ul>
        <p className="project-note">pack.png 只作为本地预览显示，不会上传；解析器不会执行资源包内任何脚本或着色器。</p>
      </section>
    </ToolShell>
  );
}
