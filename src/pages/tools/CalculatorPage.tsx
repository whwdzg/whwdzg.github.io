/** 科学计算器 / CASIO ClassWiz-style calculator with graph and LaTeX. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownloadRegular,
  ArrowUploadRegular,
  CalculatorRegular,
  DismissRegular,
  HistoryRegular,
  MathFormulaRegular,
} from '@fluentui/react-icons';
import { ToolShell } from '../../components/tools/ToolShell';
import { useToast } from '../../hooks/useToast';
import {
  evaluateExpression,
  expressionToLatex,
  latexToExpression,
  type AngleMode,
} from '../../lib/tools/expression';
import '../../styles/tools.css';

const TOC = [
  { id: 'calculator', label: '计算器' },
  { id: 'graph', label: '函数图像' },
  { id: 'latex', label: 'LaTeX' },
  { id: 'history', label: '历史记录' },
  { id: 'keys', label: '按键说明' },
];

function GraphCanvas({ expression }: { expression: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = 820;
    const height = 380;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const xMin = -10;
    const xMax = 10;
    const yMin = -6;
    const yMax = 6;
    const toX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(xMin); x <= xMax; x += 1) {
      ctx.beginPath();
      ctx.moveTo(toX(x), 0);
      ctx.lineTo(toX(x), height);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin); y <= yMax; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, toY(y));
      ctx.lineTo(width, toY(y));
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, toY(0));
    ctx.lineTo(width, toY(0));
    ctx.moveTo(toX(0), 0);
    ctx.lineTo(toX(0), height);
    ctx.stroke();

    ctx.strokeStyle = '#4cc2ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let pixel = 0; pixel <= width; pixel += 1) {
      const x = xMin + (pixel / width) * (xMax - xMin);
      let y: number;
      try {
        y = evaluateExpression(expression || 'sin(x)', { variables: { x }, angleMode: 'rad' });
      } catch {
        started = false;
        continue;
      }
      if (!Number.isFinite(y) || y < yMin - 10 || y > yMax + 10) {
        started = false;
        continue;
      }
      const py = toY(y);
      if (!started) {
        ctx.moveTo(pixel, py);
        started = true;
      } else {
        ctx.lineTo(pixel, py);
      }
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px ui-monospace, monospace';
    ctx.fillText('x', width - 16, toY(0) - 8);
    ctx.fillText('y', toX(0) + 8, 14);
  }, [expression]);

  return <canvas ref={canvasRef} className="calc-graph" aria-label={`函数图像：${expression}`} />;
}

const KEYS: Array<Array<{ label: string; value: string; kind?: 'op' | 'fn' | 'action' | 'equals' | 'number'; shift?: string }>> = [
  [
    { label: 'SHIFT', value: 'shift', kind: 'action' },
    { label: 'ALPHA', value: 'alpha', kind: 'action' },
    { label: 'DEG/RAD', value: 'angle', kind: 'action' },
    { label: 'AC', value: 'clear', kind: 'action' },
    { label: 'DEL', value: 'del', kind: 'action' },
  ],
  [
    { label: 'sin', value: 'sin(', kind: 'fn', shift: 'asin(' },
    { label: 'cos', value: 'cos(', kind: 'fn', shift: 'acos(' },
    { label: 'tan', value: 'tan(', kind: 'fn', shift: 'atan(' },
    { label: '(', value: '(', kind: 'op' },
    { label: ')', value: ')', kind: 'op' },
    { label: '÷', value: '/', kind: 'op' },
  ],
  [
    { label: 'x²', value: '^2', kind: 'fn' },
    { label: 'xʸ', value: '^', kind: 'op' },
    { label: '√', value: 'sqrt(', kind: 'fn' },
    { label: '7', value: '7', kind: 'number' },
    { label: '8', value: '8', kind: 'number' },
    { label: '9', value: '9', kind: 'number' },
    { label: '×', value: '*', kind: 'op' },
  ],
  [
    { label: 'log', value: 'log(', kind: 'fn' },
    { label: 'ln', value: 'ln(', kind: 'fn' },
    { label: 'π', value: 'pi', kind: 'fn' },
    { label: '4', value: '4', kind: 'number' },
    { label: '5', value: '5', kind: 'number' },
    { label: '6', value: '6', kind: 'number' },
    { label: '−', value: '-', kind: 'op' },
  ],
  [
    { label: 'Ans', value: 'ans', kind: 'fn' },
    { label: '%', value: '%', kind: 'fn' },
    { label: '!', value: '!', kind: 'fn' },
    { label: '1', value: '1', kind: 'number' },
    { label: '2', value: '2', kind: 'number' },
    { label: '3', value: '3', kind: 'number' },
    { label: '+', value: '+', kind: 'op' },
  ],
  [
    { label: 'M+', value: 'mplus', kind: 'action' },
    { label: 'M−', value: 'mminus', kind: 'action' },
    { label: 'MR', value: 'mr', kind: 'action' },
    { label: '0', value: '0', kind: 'number' },
    { label: '.', value: '.', kind: 'number' },
    { label: '=', value: 'equals', kind: 'equals' },
  ],
];

export default function CalculatorPage() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [error, setError] = useState('');
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [ans, setAns] = useState(0);
  const [memory, setMemory] = useState(0);
  const [shift, setShift] = useState(false);
  const [history, setHistory] = useState<Array<{ expression: string; result: string }>>([]);
  const [graphExpression, setGraphExpression] = useState('sin(x)');
  const [latexOpen, setLatexOpen] = useState(false);
  const [latexText, setLatexText] = useState('');
  const { toast } = useToast();
  const toc = useMemo(() => TOC, []);
  const expressionRef = useRef(expression);
  expressionRef.current = expression;

  const run = useCallback((source = expression, mode = angleMode) => {
    try {
      const value = evaluateExpression(source, { angleMode: mode, ans, variables: { m: memory } });
      const text = Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(12)));
      setResult(text);
      setAns(value);
      setError('');
      setHistory((items) => [{ expression: source, result: text }, ...items].slice(0, 12));
      return value;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '计算失败');
      setResult('');
      return null;
    }
  }, [ans, memory, angleMode]);

  const press = useCallback((value: string) => {
    if (value === 'clear') {
      setExpression('');
      setResult('0');
      setError('');
      setShift(false);
      return;
    }
    if (value === 'del') {
      setExpression((current) => current.slice(0, -1));
      return;
    }
    if (value === 'equals') {
      run(expressionRef.current);
      setShift(false);
      return;
    }
    if (value === 'angle') {
      setAngleMode((mode) => (mode === 'deg' ? 'rad' : 'deg'));
      return;
    }
    if (value === 'shift') {
      setShift((current) => !current);
      return;
    }
    if (value === 'alpha') return;
    if (value === 'mplus') {
      const parsed = Number(result);
      if (Number.isFinite(parsed)) setMemory((current) => current + parsed);
      return;
    }
    if (value === 'mminus') {
      const parsed = Number(result);
      if (Number.isFinite(parsed)) setMemory((current) => current - parsed);
      return;
    }
    if (value === 'mr') {
      setExpression((current) => `${current}${memory}`);
      return;
    }
    let token = value;
    if (shift && ['sin(', 'cos(', 'tan('].includes(value)) {
      token = value === 'sin(' ? 'asin(' : value === 'cos(' ? 'acos(' : 'atan(';
    }
    setExpression((current) => `${current}${token}`);
    setShift(false);
  }, [run, result, memory, shift]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (/^[0-9.+\-*/^()!%]$/.test(event.key)) {
        press(event.key);
        return;
      }
      if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        press('equals');
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        press('del');
      } else if (event.key === 'Escape') {
        press('clear');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [press]);

  const exportLatex = () => {
    try {
      const latex = expressionToLatex(expression || '0');
      setLatexText(`$${latex}$`);
      setLatexOpen(true);
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : '无法转换为 LaTeX', 'error');
    }
  };

  const importLatex = () => {
    try {
      setExpression(latexToExpression(latexText));
      setLatexOpen(false);
      setError('');
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : '无法解析 LaTeX', 'error');
    }
  };

  return (
    <ToolShell
      title="科学计算器"
      lead="参考 CASIO CN CW991 II 的操作逻辑：输入表达式、显示结果、记录历史，并支持函数图像与 LaTeX 公式导入 / 导出。"
      meta={[
        { icon: 'sparkle', label: 'ClassWiz 风格' },
        { icon: 'image', label: '函数图像' },
        { icon: 'document', label: 'LaTeX' },
      ]}
      toc={toc}
    >
      <section className="article-card calc-panel" id="calculator">
        <div className="calc-body">
          <div className="calc-chrome">
            <div className="calc-brand">
              <span>CASIO</span>
              <strong>CLASSWIZ</strong>
              <em>CN CW991 II</em>
            </div>
            <div className="calc-solar" aria-hidden />
          </div>
          <div className="calc-screen">
            <div className="calc-screen__status">
              <span className={angleMode === 'deg' ? 'is-on' : ''}>DEG</span>
              <span className={angleMode === 'rad' ? 'is-on' : ''}>RAD</span>
              <span className={shift ? 'is-on' : ''}>SHIFT</span>
              <span>M {memory}</span>
            </div>
            <div className="calc-screen__expression">{expression || '0'}</div>
            <div className="calc-screen__result">{result || '—'}</div>
            {error ? <div className="calc-screen__error">{error}</div> : null}
          </div>
          <div className="calc-keys">
            {KEYS.map((row, rowIndex) => (
              <div className="calc-key-row" key={rowIndex}>
                {row.map((key) => (
                  <button
                    key={key.label}
                    type="button"
                    className={`calc-key calc-key--${key.kind ?? 'number'} ${shift && key.shift ? 'is-shift' : ''}`}
                    onClick={() => press(shift && key.shift ? key.shift : key.value)}
                  >
                    {shift && key.shift ? key.shift.replace('(', '') : key.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="calc-tools">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => run(expression)}>
              <CalculatorRegular aria-hidden /> 计算
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={exportLatex}>
              <MathFormulaRegular aria-hidden /> 导出 LaTeX
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => {
              setLatexText('');
              setLatexOpen(true);
            }}>
              <ArrowUploadRegular aria-hidden /> 导入 LaTeX
            </button>
          </div>
        </div>
      </section>

      <section className="article-card" id="graph">
        <p className="eyebrow">GRAPH</p>
        <h2>函数图像</h2>
        <p className="project-section-lead">输入 f(x)，使用弧度计算；默认显示 x ∈ [-10, 10]、y ∈ [-6, 6]。</p>
        <label className="tool-select tool-select--wide">
          <span>f(x) =</span>
          <input value={graphExpression} onChange={(event) => setGraphExpression(event.target.value)} />
        </label>
        <GraphCanvas expression={graphExpression} />
      </section>

      <section className="article-card" id="latex">
        <p className="eyebrow">LATEX</p>
        <h2>LaTeX 公式</h2>
        <p>导出当前表达式为 LaTeX；也可以粘贴 LaTeX（支持 \frac、\sqrt、^、\pi 与常用函数）导入。</p>
        <div className="tool-actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={exportLatex}>
            <ArrowDownloadRegular aria-hidden /> 导出当前表达式
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setLatexText(''); setLatexOpen(true); }}>
            <ArrowUploadRegular aria-hidden /> 打开导入框
          </button>
        </div>
        <div className="calc-latex-preview">
          {latexText || '\\frac{-b + \\sqrt{b^2 - 4ac}}{2a}'}
        </div>
      </section>

      <section className="article-card" id="history">
        <div className="article-card__head">
          <div>
            <p className="eyebrow">HISTORY</p>
            <h2>历史记录</h2>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setHistory([])}>
            <HistoryRegular aria-hidden /> 清空
          </button>
        </div>
        {history.length ? (
          <ul className="calc-history">
            {history.map((item, index) => (
              <li key={`${item.expression}-${index}`}>
                <button type="button" onClick={() => setExpression(item.expression)}>
                  <span>{item.expression}</span>
                  <strong>= {item.result}</strong>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="project-note">还没有计算记录。</p>}
      </section>

      <section className="article-card" id="keys">
        <p className="eyebrow">KEYS</p>
        <h2>按键说明</h2>
        <ul className="project-list">
          <li><strong>SHIFT</strong>：临时切换反三角函数（sin⁻¹ / cos⁻¹ / tan⁻¹）。</li>
          <li><strong>DEG/RAD</strong>：切换角度制与弧度制；屏幕顶部显示当前模式。</li>
          <li><strong>M+ / M− / MR</strong>：读取当前结果到记忆，或把记忆插入表达式。</li>
          <li><strong>Ans</strong>：上一次计算结果；<strong>%</strong> 表示除以 100，<strong>!</strong> 表示阶乘。</li>
          <li>键盘支持数字、运算符、括号、Enter 计算、Backspace 删除、Esc 清空。</li>
        </ul>
      </section>

      {latexOpen && (
        <div className="calc-modal" role="dialog" aria-modal="true" aria-label="LaTeX 公式">
          <div className="calc-modal__panel">
            <div className="calc-modal__head">
              <strong>LaTeX 公式</strong>
              <button type="button" className="icon-btn icon-btn--sm" aria-label="关闭" onClick={() => setLatexOpen(false)}>
                <DismissRegular aria-hidden />
              </button>
            </div>
            <textarea value={latexText} onChange={(event) => setLatexText(event.target.value)} rows={7} placeholder="\frac{1}{2} + \sqrt{3}" />
            <div className="tool-actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={importLatex}>
                <ArrowUploadRegular aria-hidden /> 导入到表达式
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={exportLatex}>
                <ArrowDownloadRegular aria-hidden /> 用当前表达式覆盖
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
