/** Markdown ↔ 思维导图工具 / Bidirectional Markdown mind map. */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import katex from 'katex';
import {
  ArrowDownloadRegular,
  CodeRegular,
  ImageRegular,
  MathFormulaRegular,
  ZoomInRegular,
  ZoomOutRegular,
} from '@fluentui/react-icons';
import 'katex/dist/katex.min.css';
import { ToolShell } from '../../components/tools/ToolShell';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { useToast } from '../../hooks/useToast';
import { copyText } from '../../lib/clipboard';
import {
  DEFAULT_MARKDOWN,
  layoutMindmap,
  nodeLabel,
  parseMarkdown,
  updateNodeTitle,
  type MindNode,
} from '../../lib/mindmap';
import '../../styles/tools.css';
import '../../styles/mindmap.css';

const THEMES = [
  {
    id: 'ocean',
    name: '深海',
    root: '#65e4f2',
    palette: ['#65e4f2', '#73a7ff', '#9d8cff', '#50cfa8', '#e6b55c'],
    canvas: '#08131c',
  },
  {
    id: 'aurora',
    name: '极光',
    root: '#8bf5d4',
    palette: ['#8bf5d4', '#72b7ff', '#c394ff', '#f2a5d8', '#f4d37b'],
    canvas: '#0a101f',
  },
  {
    id: 'ember',
    name: '熔岩',
    root: '#ffc26e',
    palette: ['#ffc26e', '#ff8f70', '#ef718f', '#c58dff', '#75c9d9'],
    canvas: '#170e0c',
  },
  {
    id: 'mono',
    name: '石墨',
    root: '#e8f2f4',
    palette: ['#e8f2f4', '#b7c8cf', '#8ea4ad', '#d3b98f', '#a5b89e'],
    canvas: '#0b1115',
  },
];

const SHAPE_OPTIONS = [
  { value: 'level', label: '分层图形' },
  { value: 'rounded', label: '统一圆角' },
  { value: 'square', label: '统一直角' },
  { value: 'hex', label: '六边形' },
];

const IMAGE_FORMATS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
  { value: 'svg', label: 'SVG' },
];

const SCALE_OPTIONS = [
  { value: 'auto', label: '自动（推荐）' },
  { value: '1', label: '1×' },
  { value: '2', label: '2×' },
  { value: '3', label: '3×' },
  { value: '4', label: '4×' },
];

const TOC = [
  { id: 'tool', label: '编辑器' },
  { id: 'style', label: '颜色与图形' },
  { id: 'export', label: '导出' },
  { id: 'help', label: '语法说明' },
];

function MathText({ children }: { children: string }) {
  const parts = children.split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => {
        const display = part.startsWith('$$') && part.endsWith('$$');
        const inline = part.startsWith('$') && part.endsWith('$');
        if (!display && !inline) return <span key={index}>{part}</span>;
        const expression = part.slice(display ? 2 : 1, display ? -2 : -1);
        try {
          return (
            <span
              key={index}
              className={display ? 'mindmap-math mindmap-math--block' : 'mindmap-math'}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(expression, {
                  throwOnError: false,
                  displayMode: display,
                  strict: false,
                  trust: false,
                }),
              }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      })}
    </>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

function safeFilename(extension: string) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `mindmap-${stamp}.${extension}`;
}

export default function MarkdownMindmapPage() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [themeId, setThemeId] = useState('ocean');
  const [perBranch, setPerBranch] = useState(true);
  const [shape, setShape] = useState('level');
  const [customColor, setCustomColor] = useState('');
  const [zoom, setZoom] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [format, setFormat] = useState('png');
  const [scaleMode, setScaleMode] = useState('auto');
  const [exporting, setExporting] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const fittedRef = useRef(false);
  const { toast } = useToast();

  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0];
  const tree = useMemo(() => parseMarkdown(markdown), [markdown]);
  const layout = useMemo(() => layoutMindmap(tree), [tree]);
  const recommendedScale = Math.min(4, Math.max(2, Math.ceil(2400 / Math.max(1, layout.width))));
  const effectiveScale = scaleMode === 'auto' ? recommendedScale : Number(scaleMode);
  const safeScale = Math.min(effectiveScale, Math.sqrt(30_000_000 / Math.max(1, layout.width * layout.height)));
  const nodeCount = layout.nodes.length;
  const lineCount = markdown.split('\n').length;

  const colorOf = useCallback((node: MindNode) => {
    if (customColor && (node.level === 0 || !perBranch || node.branch === 0)) return customColor;
    if (node.level === 0) return theme.root;
    if (!perBranch) return theme.palette[0];
    return theme.palette[node.branch % theme.palette.length];
  }, [customColor, perBranch, theme]);

  const fit = useCallback((readable = false) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const widthFit = (viewport.clientWidth - 32) / layout.width;
    const readableFloor = viewport.clientWidth > 560 ? 0.62 : 0.35;
    const next = Math.min(1.2, Math.max(0.35, readable ? Math.max(readableFloor, widthFit) : widthFit));
    setZoom(Number(next.toFixed(2)));
    window.requestAnimationFrame(() => {
      viewport.scrollTop = Math.max(0, (layout.height * next - viewport.clientHeight) / 2);
    });
  }, [layout.width]);

  useEffect(() => {
    if (fittedRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      fit(true);
      fittedRef.current = true;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [fit]);

  useEffect(() => {
    if (editingId) window.requestAnimationFrame(() => editRef.current?.focus());
  }, [editingId]);

  const beginEdit = (node: MindNode) => {
    setEditingId(node.id);
    setDraft(node.title);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const node = layout.nodes.find((item) => item.id === editingId);
    if (node && draft.trim() && draft.trim() !== node.title) {
      setMarkdown((current) => updateNodeTitle(current, node, draft));
    }
    setEditingId(null);
  };

  const reset = () => {
    setMarkdown(DEFAULT_MARKDOWN);
    setEditingId(null);
    fittedRef.current = false;
    setZoom(1);
    toast('已恢复示例内容', 'success');
  };

  const copyMarkdown = async () => {
    if (await copyText(markdown)) toast('Markdown 已复制', 'success');
    else toast('复制失败', 'error');
  };

  const exportImage = async () => {
    const node = canvasRef.current;
    if (!node || exporting) return;
    setExporting(true);
    try {
      const mod = await import('html-to-image');
      const backgroundColor = theme.canvas;
      const options = {
        cacheBust: true,
        backgroundColor,
        pixelRatio: Math.max(1, safeScale),
        width: layout.width,
        height: layout.height,
        style: { transform: 'none' },
      };
      let dataUrl: string;
      if (format === 'svg') {
        dataUrl = await mod.toSvg(node, { ...options, pixelRatio: 1 });
      } else if (format === 'jpeg') {
        dataUrl = await mod.toJpeg(node, { ...options, quality: 0.94 });
      } else if (format === 'webp') {
        const canvas = await mod.toCanvas(node, options);
        dataUrl = canvas.toDataURL('image/webp', 0.94);
      } else {
        dataUrl = await mod.toPng(node, options);
      }
      downloadDataUrl(dataUrl, safeFilename(format === 'jpeg' ? 'jpg' : format));
      toast(`已导出 ${format.toUpperCase()} · ${safeScale.toFixed(1)}×`, 'success');
    } catch (error) {
      console.error(error);
      toast('图片导出失败，请重试', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportPdf = async () => {
    const node = canvasRef.current;
    if (!node || exporting) return;
    setExporting(true);
    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);
      const dataUrl = await toPng(node, {
        cacheBust: true,
        backgroundColor: theme.canvas,
        pixelRatio: Math.max(2, safeScale),
        width: layout.width,
        height: layout.height,
        style: { transform: 'none' },
      });
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      const landscape = image.width >= image.height;
      const pdf = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const ratio = Math.min(
        (pageWidth - margin * 2) / image.width,
        (pageHeight - margin * 2) / image.height,
      );
      const drawWidth = image.width * ratio;
      const drawHeight = image.height * ratio;
      pdf.addImage(
        dataUrl,
        'PNG',
        (pageWidth - drawWidth) / 2,
        (pageHeight - drawHeight) / 2,
        drawWidth,
        drawHeight,
        undefined,
        'FAST',
      );
      pdf.save(safeFilename('pdf'));
      toast('PDF 已导出', 'success');
    } catch (error) {
      console.error(error);
      toast('PDF 导出失败，请重试', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ToolShell
      eyebrow="TOOL · MINDMAP"
      title="Markdown 思维导图"
      lead="左侧写 Markdown，右侧实时生成思维导图；双击节点可以反向修改 Markdown。支持标题层级、编号、LaTeX、分支配色、分层图形与高清导出。"
      meta={[
        { icon: 'document', label: '双向同步' },
        { icon: 'sparkle', label: 'LaTeX' },
        { icon: 'image', label: 'PNG / PDF' },
      ]}
      toc={TOC}
    >
      <section className="tool-panel mindmap-section" id="tool">
        <div className="mindmap-panel-head">
          <div>
            <p className="eyebrow">LIVE WORKBENCH</p>
            <h2>Markdown ↔ 导图</h2>
          </div>
          <div className="mindmap-panel-stats">
            <span>{nodeCount} 个节点</span>
            <span>{lineCount} 行</span>
            <span>{layout.maxLevel + 1} 层</span>
          </div>
        </div>

        <div className="mindmap-workbench">
          <div className="mindmap-editor">
            <div className="mindmap-pane-head">
              <span><CodeRegular aria-hidden /> Markdown</span>
              <span className="mindmap-sync-dot">实时</span>
            </div>
            <textarea
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              spellCheck={false}
              aria-label="Markdown 输入"
              placeholder="# 主题&#10;## 分支&#10;- 节点"
            />
            <div className="mindmap-editor-foot">
              <span>标题 / 列表决定层级；数字原样保留</span>
              <Button size="sm" variant="ghost" onClick={reset}>恢复示例</Button>
            </div>
          </div>

          <div className="mindmap-preview">
            <div className="mindmap-pane-head">
              <span><ImageRegular aria-hidden /> 思维导图</span>
              <div className="mindmap-zoom">
                <button type="button" aria-label="缩小" onClick={() => setZoom((value) => Math.max(0.35, Number((value - 0.1).toFixed(2))))}><ZoomOutRegular aria-hidden /></button>
                <button type="button" className="mindmap-zoom__value" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
                <button type="button" aria-label="放大" onClick={() => setZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(2))))}><ZoomInRegular aria-hidden /></button>
                <button type="button" onClick={() => fit()}>适应</button>
              </div>
            </div>
            <div className="mindmap-viewport" ref={viewportRef}>
              <div
                className="mindmap-space"
                style={{ width: layout.width * zoom, height: layout.height * zoom }}
              >
                <div className="mindmap-zoom-layer" style={{ transform: `scale(${zoom})`, transformOrigin: '0 0' }}>
                  <div
                    ref={canvasRef}
                    className="mindmap-canvas"
                    style={{ width: layout.width, height: layout.height, background: theme.canvas }}
                  >
                    <svg width={layout.width} height={layout.height} className="mindmap-edges" aria-hidden>
                      {layout.edges.map(({ from, to }) => {
                        const x1 = from.x + from.width;
                        const y1 = from.y + from.height / 2;
                        const x2 = to.x;
                        const y2 = to.y + to.height / 2;
                        const mid = (x1 + x2) / 2;
                        return (
                          <path
                            key={`${from.id}-${to.id}`}
                            d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                            fill="none"
                            stroke={colorOf(to)}
                            strokeWidth={1.8}
                            strokeOpacity={0.48}
                          />
                        );
                      })}
                    </svg>
                    {layout.nodes.map((node) => {
                      const color = colorOf(node);
                      return (
                        <div
                          key={node.id}
                          className={`mindmap-node mindmap-node--level-${Math.min(node.level, 4)} mindmap-node--shape-${shape}${node.level === 0 ? ' is-root' : ''}`}
                          style={{
                            left: node.x,
                            top: node.y,
                            width: node.width,
                            height: node.height,
                            '--node-color': color,
                          } as CSSProperties}
                          title={nodeLabel(node)}
                          role="button"
                          tabIndex={0}
                          onDoubleClick={() => beginEdit(node)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              beginEdit(node);
                            }
                          }}
                        >
                          {editingId === node.id ? (
                            <input
                              ref={editRef}
                              className="mindmap-node__editor"
                              value={draft}
                              onChange={(event) => {
                                const next = event.target.value;
                                setDraft(next);
                                if (next.trim()) setMarkdown((current) => updateNodeTitle(current, node, next));
                              }}
                              onBlur={commitEdit}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  commitEdit();
                                } else if (event.key === 'Escape') {
                                  setEditingId(null);
                                }
                              }}
                            />
                          ) : (
                            <span className="mindmap-node__title"><MathText>{nodeLabel(node)}</MathText></span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="mindmap-preview-foot">
              <span>双击节点编辑 · 拖动画布滚动 · 滚轮缩放</span>
              <button type="button" className="text-button" onClick={copyMarkdown}>复制 Markdown</button>
            </div>
          </div>
        </div>
      </section>

      <section className="tool-panel mindmap-section" id="style">
        <div className="mindmap-panel-head">
          <div>
            <p className="eyebrow">APPEARANCE</p>
            <h2>颜色与图形</h2>
          </div>
        </div>
        <div className="mindmap-style-grid">
          <div className="mindmap-field">
            <span className="mindmap-field__label">配色主题</span>
            <div className="mindmap-themes">
              {THEMES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`mindmap-theme${theme.id === item.id ? ' is-active' : ''}`}
                  aria-pressed={theme.id === item.id}
                  onClick={() => { setThemeId(item.id); setCustomColor(''); }}
                >
                  <span className="mindmap-theme__swatches">
                    {item.palette.slice(0, 3).map((color) => <i key={color} style={{ background: color }} />)}
                  </span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mindmap-field">
            <span className="mindmap-field__label">分支颜色</span>
            <label className="mindmap-switch">
              <input type="checkbox" checked={perBranch} onChange={(event) => setPerBranch(event.target.checked)} />
              <span>每个一级分支使用不同颜色</span>
            </label>
            <label className="mindmap-color-field">
              <span>主色</span>
              <input type="color" value={customColor || theme.palette[0]} onChange={(event) => setCustomColor(event.target.value)} />
              <code>{customColor || theme.palette[0]}</code>
              {customColor && <button type="button" className="text-button" onClick={() => setCustomColor('')}>重置</button>}
            </label>
          </div>

          <div className="mindmap-field">
            <span className="mindmap-field__label">层级图形</span>
            <Select value={shape} options={SHAPE_OPTIONS} onChange={setShape} ariaLabel="层级图形" />
            <p className="mindmap-field__hint">根节点胶囊，一级圆角卡片，二级切角，三级下划线；也可以统一为圆角、直角或六边形。</p>
          </div>
        </div>
      </section>

      <section className="tool-panel mindmap-section" id="export">
        <div className="mindmap-panel-head">
          <div>
            <p className="eyebrow">EXPORT</p>
            <h2>导出</h2>
          </div>
          <span className="mindmap-export-size">{layout.width} × {layout.height}</span>
        </div>
        <div className="mindmap-export-grid">
          <label className="mindmap-field">
            <span className="mindmap-field__label">图片格式</span>
            <Select value={format} options={IMAGE_FORMATS} onChange={setFormat} ariaLabel="图片格式" />
          </label>
          <label className="mindmap-field">
            <span className="mindmap-field__label">分辨率</span>
            <Select value={scaleMode} options={SCALE_OPTIONS.map((option) => ({
              ...option,
              label: option.value === 'auto' ? `${option.label} · ${recommendedScale}×` : option.label,
            }))} onChange={setScaleMode} ariaLabel="导出分辨率" />
            <span className="mindmap-field__hint">自动按当前画布宽度推荐，确保文字可读。</span>
          </label>
          <div className="mindmap-export-actions">
            <Button variant="primary" icon={<ArrowDownloadRegular aria-hidden />} onClick={exportImage} disabled={exporting}>
              {exporting ? '导出中…' : '导出图片'}
            </Button>
            <Button variant="secondary" icon={<ArrowDownloadRegular aria-hidden />} onClick={exportPdf} disabled={exporting}>
              导出 PDF
            </Button>
          </div>
        </div>
        <p className="mindmap-export-note">
          PNG / JPEG / WebP 使用浏览器端高清渲染；SVG 保留矢量边线。PDF 自动按 A4 横向或纵向居中排版。
        </p>
      </section>

      <section className="tool-panel mindmap-section" id="help">
        <div className="mindmap-panel-head">
          <div>
            <p className="eyebrow">SYNTAX</p>
            <h2>写法说明</h2>
          </div>
        </div>
        <div className="mindmap-help">
          <div>
            <h3><CodeRegular aria-hidden /> 标题与层级</h3>
            <pre>{`# 根主题\n## 一级分支\n### 二级分支\n- 列表节点\n  - 嵌套节点\n1. 编号会保留`}</pre>
          </div>
          <div>
            <h3><MathFormulaRegular aria-hidden /> LaTeX</h3>
            <pre>{`行内：$E = mc^2$\n分式：$\\frac{a}{b}$\n矩阵：$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$`}</pre>
          </div>
        </div>
        <p className="mindmap-field__hint">
          导出前会自动使用当前 Markdown 重新排版；节点标题修改后立即回写对应 Markdown 行。
        </p>
      </section>
    </ToolShell>
  );
}
