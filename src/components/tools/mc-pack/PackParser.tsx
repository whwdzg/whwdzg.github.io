/** MC 数据包 / 资源包解析器 / Pack analyzer UI. */
import { useEffect, useRef, useState } from 'react';
import { ArrowClockwiseRegular, CheckmarkCircleRegular, DismissRegular, OpenRegular } from '@fluentui/react-icons';
import { Button } from '../../common/Button';
import { analyzePack, type PackAnalysis } from '../../../lib/mc/pack-analyzer';
import type { PackKind } from '../../../lib/mc/pack-formats';
import '../../../styles/tools.css';

interface PackParserProps {
  kind: PackKind;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function PackParser({ kind }: PackParserProps) {
  const [analysis, setAnalysis] = useState<PackAnalysis | null>(null);
  const [iconUrl, setIconUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!analysis?.icon) {
      setIconUrl('');
      return;
    }
    const url = URL.createObjectURL(analysis.icon);
    setIconUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [analysis]);

  const readFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('请选择 .zip 格式的数据包 / 资源包。');
      return;
    }
    setLoading(true);
    setError('');
    setAnalysis(null);
    try {
      setAnalysis(await analyzePack(file, kind));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '解析失败');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="article-card pack-parser" id="parser">
      <div
        className={`pack-drop ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) void readFile(file);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void readFile(file);
            event.target.value = '';
          }}
        />
        <OpenRegular aria-hidden />
        <strong>{kind === 'data' ? '拖入 MC 数据包' : '拖入 MC 资源包'}</strong>
        <span>.zip · 文件只在浏览器本地解析</span>
      </div>

      {loading && <p className="pack-status">正在读取 ZIP 与 pack.mcmeta…</p>}
      {error && (
        <div className="pack-error" role="alert">
          <DismissRegular aria-hidden />
          <span>{error}</span>
          <button type="button" onClick={reset}>重选</button>
        </div>
      )}

      {analysis && (
        <div className="pack-result">
          <div className="pack-result__head">
            {iconUrl ? <img src={iconUrl} alt="pack.png" width={64} height={64} /> : <span className="pack-result__icon"><OpenRegular aria-hidden /></span>}
            <div>
              <p className="eyebrow">{analysis.kind === 'data' ? 'DATA PACK' : 'RESOURCE PACK'} · {kind === analysis.actualKind ? '解析完成' : '内容检测'}</p>
              <h2>{analysis.fileName}</h2>
              <p>{analysis.description} · {formatBytes(analysis.size)}</p>
            </div>
            <Button variant="secondary" size="sm" icon={<ArrowClockwiseRegular aria-hidden />} onClick={reset}>换一个</Button>
          </div>

          {analysis.warning && <p className="pack-warning">{analysis.warning}</p>}

          <div className="pack-stat-grid">
            <div><span>格式声明</span><strong>{analysis.formatLabel}</strong></div>
            <div><span>文件总数</span><strong>{analysis.files}</strong></div>
            <div><span>命名空间</span><strong>{analysis.namespaces.length}</strong></div>
            <div><span>内容分类</span><strong>{analysis.categories.length}</strong></div>
          </div>

          <div className="pack-section">
            <div className="pack-section__head">
              <h3>支持版本</h3>
              <span>{analysis.supported.range ? `${analysis.supported.range.source} · ${analysis.supported.formats.join(' / ')}` : '未识别'}</span>
            </div>
            {analysis.supported.labels.length ? (
              <div className="pack-version-list">
                {analysis.supported.labels.map((version) => (
                  <span key={version} className="pack-version"><CheckmarkCircleRegular aria-hidden /> {version}</span>
                ))}
              </div>
            ) : (
              <p className="pack-empty">{analysis.supported.note}</p>
            )}
            <p className="pack-note">支持版本根据 pack.mcmeta 的 pack_format / supported_formats / min_format / max_format 与 Java 版格式表匹配。</p>
          </div>

          <div className="pack-section">
            <div className="pack-section__head">
              <h3>包含内容</h3>
              <span>{analysis.namespaces.join(' · ') || '无命名空间'}</span>
            </div>
            {analysis.categories.length ? (
              <div className="pack-categories">
                {analysis.categories.map((category) => (
                  <details className="pack-category" key={category.id} open={category.files.length <= 12}>
                    <summary>
                      <span>{category.label}</span>
                      <code>{category.id}</code>
                      <strong>{category.files.length}</strong>
                    </summary>
                    <ul>
                      {category.files.slice(0, 200).map((file) => <li key={file}><code>{file}</code></li>)}
                    </ul>
                    {category.files.length > 200 && <p className="pack-note">仅展示前 200 个文件，共 {category.files.length} 个。</p>}
                  </details>
                ))}
              </div>
            ) : (
              <p className="pack-empty">没有找到 data/ 或 assets/ 内容目录。</p>
            )}
            {analysis.rootFiles.length > 0 && (
              <p className="pack-note">根目录文件：{analysis.rootFiles.join(' · ')}</p>
            )}
          </div>

          <div className="pack-section">
            <div className="pack-section__head">
              <h3>pack.mcmeta</h3>
              <span>{analysis.meta.pack?.pack_format !== undefined ? `pack_format ${analysis.meta.pack.pack_format}` : '现代格式声明'}</span>
            </div>
            <pre className="pack-json">{analysis.metaText}</pre>
          </div>
        </div>
      )}
    </section>
  );
}
