/** MC 数据包解析 / Minecraft data pack analyzer. */
import { useMemo } from 'react';
import { ToolShell } from '../../components/tools/ToolShell';
import { PackParser } from '../../components/tools/mc-pack/PackParser';
import '../../styles/tools.css';

const TOC = [
  { id: 'parser', label: '解析数据包' },
  { id: 'formats', label: '版本格式' },
  { id: 'contents', label: '内容分类' },
];

export default function DataPackPage() {
  const toc = useMemo(() => TOC, []);
  return (
    <ToolShell
      title="MC 数据包解析"
      lead="拖入一个 Minecraft Java 版数据包 .zip，读取 pack.mcmeta，展示支持的 MC 版本、命名空间与配方 / 进度 / 战利品表 / 函数 / 标签等内容。文件只在浏览器本地解析。"
      meta={[
        { icon: 'storage', label: '数据包 .zip' },
        { icon: 'shield', label: '本地解析' },
        { icon: 'commit', label: '格式 4 – 121.0' },
      ]}
      toc={toc}
    >
      <PackParser kind="data" />

      <section className="article-card" id="formats">
        <p className="eyebrow">FORMAT</p>
        <h2>版本格式</h2>
        <p>
          解析器读取 <code>pack.mcmeta</code> 中的 <code>pack_format</code>、<code>supported_formats</code>、
          <code>min_format</code> 与 <code>max_format</code>。旧版格式是单个整数；1.21.9 之后使用
          <code>[major, minor]</code> 形式，例如 26.3 数据包格式为 <code>121.0</code>。
        </p>
        <div className="project-table-wrap">
          <table className="project-table">
            <thead><tr><th>数据包格式</th><th>Minecraft</th></tr></thead>
            <tbody>
              <tr><td>121.0</td><td>26.3</td></tr>
              <tr><td>101.1</td><td>26.1 – 26.1.2</td></tr>
              <tr><td>81</td><td>1.21.7 – 1.21.8</td></tr>
              <tr><td>71</td><td>1.21.5</td></tr>
              <tr><td>48</td><td>1.21 – 1.21.1</td></tr>
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
          <li><strong>进度 / 配方 / 战利品表</strong>：advancements、recipes、loot_tables。</li>
          <li><strong>函数 / 标签 / 谓词</strong>：functions、tags、predicates、item_modifiers。</li>
          <li><strong>世界生成</strong>：worldgen、dimension、dimension_type、structure。</li>
          <li><strong>其他</strong>：damage_type、enchantment、painting_variant、jukebox_song 等。</li>
        </ul>
        <p className="project-note">解析器只读取 ZIP 目录与 pack.mcmeta，不会执行数据包内任何函数或脚本。</p>
      </section>
    </ToolShell>
  );
}
