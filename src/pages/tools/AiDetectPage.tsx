/** AI 内容痕迹检查 / Heuristic AI image & text inspection. */
import { useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import {
  ArrowUploadRegular,
  DocumentRegular,
  ImageRegular,
  ShieldRegular,
  WarningRegular,
} from '@fluentui/react-icons';
import { ToolShell } from '../../components/tools/ToolShell';
import { Button } from '../../components/common/Button';
import { analyzeImage, analyzeText, formatBytes, type Finding, type ImageAnalysis, type TextAnalysis } from '../../lib/ai-detect';
import '../../styles/tools.css';
import '../../styles/ai-detect.css';

const TOC = [
  { id: 'image', label: '图像检查' },
  { id: 'text', label: '文字检查' },
  { id: 'method', label: '方法与限制' },
];

const DEFAULT_TEXT = `在当今数字化时代，人工智能正在深刻改变我们的工作方式。首先，它能够提升效率；其次，它可以降低重复劳动；最后，它也为创作带来了新的可能。

值得注意的是，任何技术都不是万能的。我们需要在效率、隐私与责任之间找到平衡。综上所述，只有持续迭代、深度融合，才能真正发挥技术的价值。

希望这些内容对你有所帮助。`;

const RESULT_LABEL: Record<Finding['result'], string> = {
  ai: 'AI 线索',
  human: '人工线索',
  neutral: '中性',
};

function ScoreCard({ score, label, confidence, summary }: { score: number; label: string; confidence: string; summary: string }) {
  return (
    <div className={`ai-score ai-score--${score >= 60 ? 'high' : score >= 40 ? 'mid' : score >= 20 ? 'low' : 'none'}`}>
      <div className="ai-score__ring" style={{ '--score': `${score * 3.6}deg` } as CSSProperties}>
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
      <div className="ai-score__copy">
        <p className="eyebrow">FINAL ASSESSMENT</p>
        <h3>{label}</h3>
        <p>{summary}</p>
        <span className="ai-score__confidence">置信度：{confidence} · 启发式结果，不是鉴定结论</span>
      </div>
    </div>
  );
}

function FindingsTable({ findings }: { findings: Finding[] }) {
  return (
    <div className="ai-table-wrap">
      <table className="ai-table">
        <thead>
          <tr>
            <th>类别</th>
            <th>条目</th>
            <th>评判</th>
            <th>权重</th>
            <th>依据 / 证据</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((finding) => (
            <tr key={finding.id}>
              <td><span className="ai-category">{finding.category}</span></td>
              <td>
                <strong>{finding.title}</strong>
                <small>{finding.detail}</small>
              </td>
              <td><span className={`ai-badge ai-badge--${finding.result}`}>{RESULT_LABEL[finding.result]}</span></td>
              <td className="ai-weight">{finding.weight > 0 ? `+${finding.weight}` : finding.weight}</td>
              <td><code>{finding.evidence || '—'}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImageReport({ report }: { report: ImageAnalysis }) {
  return (
    <div className="ai-report">
      <ScoreCard score={report.score} label={report.label} confidence={report.confidence} summary={report.summary} />
      <FindingsTable findings={report.findings} />
      <div className="ai-info-grid">
        <div>
          <p className="ai-info-grid__title">文件信息</p>
          <dl>
            <div><dt>文件名</dt><dd>{report.fileInfo.name}</dd></div>
            <div><dt>类型</dt><dd>{report.fileInfo.type}</dd></div>
            <div><dt>大小</dt><dd>{formatBytes(report.fileInfo.size)}</dd></div>
            <div><dt>尺寸</dt><dd>{report.fileInfo.width && report.fileInfo.height ? `${report.fileInfo.width} × ${report.fileInfo.height}` : '无法解码'}</dd></div>
            <div><dt>修改时间</dt><dd>{report.fileInfo.lastModified ? new Date(report.fileInfo.lastModified).toLocaleString() : '未知'}</dd></div>
          </dl>
        </div>
        <div>
          <p className="ai-info-grid__title">可读元数据 <span>{report.metadata.length}</span></p>
          {report.metadata.length ? (
            <details className="ai-metadata">
              <summary>展开元数据字段</summary>
              <dl>
                {report.metadata.map((entry, index) => (
                  <div key={`${entry.key}-${index}`}>
                    <dt>{entry.key}</dt>
                    <dd>{entry.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ) : (
            <p className="ai-empty-note">没有解析到 EXIF / XMP / PNG 文本块。</p>
          )}
          {report.extractedText && <pre className="ai-extracted">{report.extractedText.slice(0, 1400)}</pre>}
        </div>
      </div>
    </div>
  );
}

function TextReport({ report }: { report: TextAnalysis }) {
  return (
    <div className="ai-report">
      <ScoreCard score={report.score} label={report.label} confidence={report.confidence} summary={report.summary} />
      <FindingsTable findings={report.findings} />
      <div className="ai-stat-grid">
        <div><strong>{report.stats.characters}</strong><span>字符</span></div>
        <div><strong>{report.stats.sentences}</strong><span>句子</span></div>
        <div><strong>{report.stats.paragraphs}</strong><span>段落</span></div>
        <div><strong>{report.stats.averageSentenceLength}</strong><span>平均句长</span></div>
        <div><strong>{report.invisibleCount}</strong><span>不可见字符</span></div>
        <div><strong>{report.matchedPhrases.length}</strong><span>惯用表达</span></div>
      </div>
    </div>
  );
}

export default function AiDetectPage() {
  const [tab, setTab] = useState<'image' | 'text'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [visibleText, setVisibleText] = useState('');
  const [imageReport, setImageReport] = useState<ImageAnalysis | null>(null);
  const [imageError, setImageError] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);
  const report = useMemo(() => (deferredText.trim() ? analyzeText(deferredText) : null), [deferredText]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const inspectFile = async (nextFile: File, hint = visibleText) => {
    if (!nextFile.type.startsWith('image/')) {
      setImageError('请选择图片文件（PNG、JPEG、WebP、AVIF 等）。');
      return;
    }
    setImageError('');
    setImageLoading(true);
    if (preview) URL.revokeObjectURL(preview);
    const nextPreview = URL.createObjectURL(nextFile);
    setPreview(nextPreview);
    setFile(nextFile);
    try {
      setImageReport(await analyzeImage(nextFile, hint));
    } catch (error) {
      setImageReport(null);
      setImageError(error instanceof Error ? error.message : '图片解析失败');
    } finally {
      setImageLoading(false);
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    dragRef.current = false;
    const next = event.dataTransfer.files?.[0];
    if (next) void inspectFile(next);
  };

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview('');
    setFile(null);
    setImageReport(null);
    setImageError('');
    setVisibleText('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <ToolShell
      eyebrow="TOOL · AI TRACE"
      title="AI 内容痕迹检查"
      lead="从文件信息、生成参数、文字 / 隐形水印、C2PA 内容凭证和写作惯用词中整理可解释线索，逐项列出判断并给出保守的最终结果。全程在浏览器本地完成。"
      meta={[
        { icon: 'image', label: '图像检查' },
        { icon: 'document', label: '文字检查' },
        { icon: 'shield', label: '纯本地' },
      ]}
      toc={TOC}
    >
      <div className="ai-tabs" role="tablist" aria-label="检查类型">
        <button type="button" role="tab" aria-selected={tab === 'image'} className={tab === 'image' ? 'is-active' : ''} onClick={() => setTab('image')}>
          <ImageRegular aria-hidden /> 图像
        </button>
        <button type="button" role="tab" aria-selected={tab === 'text'} className={tab === 'text' ? 'is-active' : ''} onClick={() => setTab('text')}>
          <DocumentRegular aria-hidden /> 文字
        </button>
      </div>

      {tab === 'image' ? (
        <section className="tool-panel ai-section" id="image">
          <div className="ai-panel-head">
            <div>
              <p className="eyebrow">IMAGE INSPECTION</p>
              <h2>图像文件</h2>
            </div>
            {file && <Button size="sm" variant="ghost" onClick={clear}>清除</Button>}
          </div>

          <div
            className={`ai-dropzone${dragging ? ' is-dragging' : ''}${file ? ' has-file' : ''}`}
            onDragEnter={(event) => { event.preventDefault(); dragRef.current = true; setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => { if (dragRef.current) { dragRef.current = false; setDragging(false); } }}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.webp,.avif"
              onChange={(event) => {
                const next = event.target.files?.[0];
                if (next) void inspectFile(next);
              }}
            />
            {preview ? (
              <img src={preview} alt="待检查图片预览" />
            ) : (
              <div className="ai-dropzone__empty">
                <ArrowUploadRegular aria-hidden />
                <strong>拖入图片，或点击选择</strong>
                <span>支持 PNG / JPEG / WebP / AVIF；不会上传到服务器</span>
              </div>
            )}
          </div>

          <label className="ai-hint-field">
            <span>画面文字 / OCR 结果（可选）</span>
            <input
              value={visibleText}
              onChange={(event) => setVisibleText(event.target.value)}
              placeholder="如果画面中有可见水印或署名，可粘贴到这里参与文字水印分析"
            />
          </label>
          {file && (
            <div className="ai-actions">
              <Button size="sm" variant="secondary" onClick={() => void inspectFile(file, visibleText)} disabled={imageLoading}>
                {imageLoading ? '分析中…' : '重新分析'}
              </Button>
              <span className="ai-field-note">图像内容不会离开浏览器。</span>
            </div>
          )}

          {imageError && <p className="ai-error"><WarningRegular aria-hidden /> {imageError}</p>}
          {imageLoading && <div className="ai-loading"><span />正在读取文件信息与元数据…</div>}
          {!imageLoading && imageReport && <ImageReport report={imageReport} />}
          {!imageLoading && !imageReport && !imageError && (
            <p className="ai-empty-note ai-empty-note--large">选择图片后会自动检查文件信息、EXIF / XMP、PNG 文本块、C2PA 标记与生成参数。</p>
          )}
        </section>
      ) : (
        <section className="tool-panel ai-section" id="text">
          <div className="ai-panel-head">
            <div>
              <p className="eyebrow">TEXT INSPECTION</p>
              <h2>文字内容</h2>
            </div>
            <div className="ai-actions">
              <Button size="sm" variant="ghost" onClick={() => setText(DEFAULT_TEXT)}>填入示例</Button>
              {text && <Button size="sm" variant="ghost" onClick={() => setText('')}>清空</Button>}
            </div>
          </div>
          <label className="ai-text-field">
            <span>粘贴待检查文本</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="粘贴一段文字，工具会实时检查显式 AI 标注、零宽字符、惯用表达与结构特征…"
              spellCheck={false}
            />
          </label>
          <div className="ai-live-row">
            <span className="ai-sync-dot">实时分析</span>
            <span>{text.length} 字符</span>
            {report && <span>已检查 {report.findings.length} 项</span>}
            <span className="ai-field-note">结果仅基于文字表面特征，不读取来源或作者信息。</span>
          </div>
          {report ? <TextReport report={report} /> : (
            <p className="ai-empty-note ai-empty-note--large">输入文字后会实时给出逐项判断。建议至少输入若干段，以便观察句式和结构特征。</p>
          )}
        </section>
      )}

      <section className="tool-panel ai-section" id="method">
        <div className="ai-panel-head">
          <div>
            <p className="eyebrow">METHOD & LIMITS</p>
            <h2>方法与限制</h2>
          </div>
          <ShieldRegular aria-hidden className="ai-method-icon" />
        </div>
        <div className="ai-method-grid">
          <div>
            <h3>检查的线索</h3>
            <ul>
              <li>文件信息：格式、尺寸、EXIF / XMP、PNG 文本块、软件字段</li>
              <li>文字水印：AI 生成标注、生成平台署名、文件名 / 画面 OCR 文本</li>
              <li>隐形水印：C2PA / JUMBF、零宽字符、Unicode 标签与格式字符</li>
              <li>生成参数：prompt、negative prompt、Steps、Sampler、ComfyUI 工作流</li>
              <li>文字特征：惯用词、段落规律、列表密度、标准三段式</li>
            </ul>
          </div>
          <div>
            <h3>不能做什么</h3>
            <ul>
              <li>不能可靠识别所有隐形水印；像素级水印通常需要对应的密钥或官方检测器。</li>
              <li>不能替代 C2PA 验证、模型指纹或专业取证。</li>
              <li>元数据可以被删除或伪造；文字风格也可能被模仿。</li>
              <li>“未发现线索”不等于内容一定由人工完成。</li>
            </ul>
          </div>
        </div>
        <p className="ai-caveat">
          <WarningRegular aria-hidden />
          这是启发式检查工具，输出的是“可能程度”和证据列表，不是确定性的鉴定结论。涉及版权、学术或法律判断时，请结合原始文件、生成记录与人工复核。
        </p>
      </section>
    </ToolShell>
  );
}
