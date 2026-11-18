/** 科学计算器 / Site-native scientific calculator. */
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
import { ModeMenu, ModeWorkspace, modeById, type CalculatorMode } from '../../components/tools/calculator/CalculatorModes';
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

function GraphCanvas({ expression, angleMode }: { expression: string; angleMode: AngleMode }) {
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
        y = evaluateExpression(expression || 'sin(x)', { variables: { x }, angleMode });
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
  }, [expression, angleMode]);

  return <canvas ref={canvasRef} className="calc-graph" aria-label={`函数图像：${expression}`} />;
}

type KeyKind = 'number' | 'op' | 'fn' | 'action' | 'equals';

interface KeyDef {
  label: string;
  value: string;
  kind: KeyKind;
  shift?: string;
  shiftLabel?: string;
}

const FUNCTION_ROWS: KeyDef[][] = [
  [
    { label: 'x', value: 'x', kind: 'fn' },
    { label: 'a/b', value: '/', kind: 'fn', shift: '!', shiftLabel: '!' },
    { label: '√', value: 'sqrt(', kind: 'fn', shift: 'cbrt(', shiftLabel: '∛' },
    { label: 'x²', value: '^2', kind: 'fn', shift: '^3', shiftLabel: 'x³' },
    { label: 'x⁻¹', value: '^-1', kind: 'fn', shift: 'abs(', shiftLabel: '|x|' },
  ],
  [
    { label: 'log', value: 'log(', kind: 'fn', shift: '10^(', shiftLabel: '10ˣ' },
    { label: 'ln', value: 'ln(', kind: 'fn', shift: 'e^(', shiftLabel: 'eˣ' },
    { label: '(-)', value: 'neg', kind: 'fn' },
    { label: '(', value: '(', kind: 'op', shift: '%', shiftLabel: '%' },
    { label: ')', value: ')', kind: 'op' },
  ],
  [
    { label: 'sin', value: 'sin(', kind: 'fn', shift: 'asin(', shiftLabel: 'sin⁻¹' },
    { label: 'cos', value: 'cos(', kind: 'fn', shift: 'acos(', shiftLabel: 'cos⁻¹' },
    { label: 'tan', value: 'tan(', kind: 'fn', shift: 'atan(', shiftLabel: 'tan⁻¹' },
    { label: 'π', value: 'pi', kind: 'fn' },
    { label: 'e', value: 'e', kind: 'fn' },
  ],
];

const NUMBER_ROWS: KeyDef[][] = [
  [
    { label: '7', value: '7', kind: 'number' },
    { label: '8', value: '8', kind: 'number' },
    { label: '9', value: '9', kind: 'number' },
    { label: 'DEL', value: 'del', kind: 'action' },
    { label: 'AC', value: 'clear', kind: 'action' },
  ],
  [
    { label: '4', value: '4', kind: 'number' },
    { label: '5', value: '5', kind: 'number' },
    { label: '6', value: '6', kind: 'number' },
    { label: '×', value: '*', kind: 'op' },
    { label: '÷', value: '/', kind: 'op' },
  ],
  [
    { label: '1', value: '1', kind: 'number' },
    { label: '2', value: '2', kind: 'number' },
    { label: '3', value: '3', kind: 'number' },
    { label: '+', value: '+', kind: 'op' },
    { label: '−', value: '-', kind: 'op' },
  ],
  [
    { label: '0', value: '0', kind: 'number' },
    { label: '.', value: '.', kind: 'number' },
    { label: '×10ˣ', value: '*10^(', kind: 'fn', shift: 'pi', shiftLabel: 'π' },
    { label: '转换', value: 'toggle', kind: 'fn' },
    { label: 'EXE', value: 'equals', kind: 'equals', shift: 'ans', shiftLabel: 'Ans' },
  ],
];

const CATALOG = [
  { group: '三角 / 反三角', items: [['sin(', 'sin'], ['cos(', 'cos'], ['tan(', 'tan'], ['asin(', 'sin⁻¹'], ['acos(', 'cos⁻¹'], ['atan(', 'tan⁻¹']] },
  { group: '对数 / 指数', items: [['log(', 'log'], ['ln(', 'ln'], ['10^(', '10ˣ'], ['e^(', 'eˣ'], ['sqrt(', '√'], ['cbrt(', '∛']] },
  { group: '数值', items: [['abs(', 'Abs'], ['floor(', 'Intg'], ['ceil(', 'Ceil'], ['round(', 'Rnd'], ['gcd(', 'GCD'], ['lcm(', 'LCM'], ['sign(', 'Sign']] },
  { group: '概率 / 常量', items: [['nPr(', 'nPr'], ['nCr(', 'nCr'], ['rand()', 'Ran#'], ['ranint(', 'RanInt'], ['pi', 'π'], ['e', 'e']] },
];

const VARIABLES = ['A', 'B', 'C', 'D', 'E', 'F', 'x', 'y', 'z', 'Ans', 'M'];

function modeStatus(mode: CalculatorMode): string {
  return modeById(mode).name;
}

export default function CalculatorPage() {
  const [expression, setExpression] = useState('');
  const [cursor, setCursor] = useState(0);
  const [result, setResult] = useState('0');
  const [rawResult, setRawResult] = useState('0');
  const [error, setError] = useState('');
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [ans, setAns] = useState(0);
  const [memory, setMemory] = useState(0);
  const [shift, setShift] = useState(false);
  const [history, setHistory] = useState<Array<{ expression: string; result: string }>>([]);
  const [graphExpression, setGraphExpression] = useState('sin(x)');
  const [latexOpen, setLatexOpen] = useState(false);
  const [latexText, setLatexText] = useState('');
  const [mode, setMode] = useState<CalculatorMode>('calculate');
  const [modeOpen, setModeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [variablesOpen, setVariablesOpen] = useState(false);
  const { toast } = useToast();
  const toc = useMemo(() => TOC, []);
  const expressionRef = useRef(expression);
  expressionRef.current = expression;

  const insert = useCallback((token: string) => {
    setExpression((current) => `${current.slice(0, cursor)}${token}${current.slice(cursor)}`);
    setCursor((current) => current + token.length);
    setShift(false);
  }, [cursor]);

  const run = useCallback((source = expression) => {
    try {
      const variables: Record<string, number> = { m: memory };
      const value = evaluateExpression(source, { angleMode, ans, variables });
      const text = Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(12)));
      setResult(text);
      setRawResult(text);
      setAns(value);
      setError('');
      setHistory((items) => [{ expression: source, result: text }, ...items].slice(0, 12));
      return value;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '计算失败');
      setResult('');
      setRawResult('');
      return null;
    }
  }, [ans, memory, angleMode, expression]);

  const press = useCallback((value: string) => {
    if (value === 'clear' || value === 'on') {
      setExpression('');
      setCursor(0);
      setResult('0');
      setRawResult('0');
      setError('');
      setShift(false);
      return;
    }
    if (value === 'del') {
      setExpression((current) => current.slice(0, Math.max(0, cursor - 1)) + current.slice(cursor));
      setCursor((current) => Math.max(0, current - 1));
      return;
    }
    if (value === 'equals') {
      run(expressionRef.current);
      setShift(false);
      return;
    }
    if (value === 'shift') {
      setShift((current) => !current);
      return;
    }
    if (value === 'home') {
      setModeOpen(true);
      return;
    }
    if (value === 'settings' || value === 'tools') {
      setSettingsOpen(true);
      return;
    }
    if (value === 'catalog') {
      setCatalogOpen(true);
      return;
    }
    if (value === 'variable') {
      setVariablesOpen(true);
      return;
    }
    if (value === 'left') {
      setCursor((current) => Math.max(0, current - 1));
      return;
    }
    if (value === 'right') {
      setCursor((current) => Math.min(expression.length, current + 1));
      return;
    }
    if (value === 'undo') {
      const last = history[0];
      if (last) {
        setExpression(last.expression);
        setCursor(last.expression.length);
      }
      return;
    }
    if (value === 'up' || value === 'down') {
      const target = history[value === 'up' ? 0 : Math.min(1, history.length - 1)];
      if (target) {
        setExpression(target.expression);
        setCursor(target.expression.length);
      }
      return;
    }
    if (value === 'mplus' || value === 'mminus' || value === 'mr') {
      const parsed = Number(rawResult);
      if (value === 'mplus' && Number.isFinite(parsed)) setMemory((current) => current + parsed);
      if (value === 'mminus' && Number.isFinite(parsed)) setMemory((current) => current - parsed);
      if (value === 'mr') insert(String(memory));
      return;
    }
    if (value === 'toggle') {
      if (!rawResult) return;
      const parsed = Number(rawResult);
      setResult((current) => (current.includes('e') ? rawResult : Number.isFinite(parsed) ? parsed.toExponential(6) : current));
      return;
    }
    if (value === 'neg') {
      insert('-');
      return;
    }
    insert(value);
  }, [cursor, expression.length, history, insert, memory, rawResult, run]);

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
      } else if (event.key === 'ArrowLeft') {
        press('left');
      } else if (event.key === 'ArrowRight') {
        press('right');
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
      const converted = latexToExpression(latexText);
      setExpression(converted);
      setCursor(converted.length);
      setLatexOpen(false);
      setError('');
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : '无法解析 LaTeX', 'error');
    }
  };

  const selectMode = (next: CalculatorMode) => {
    setMode(next);
    setModeOpen(false);
    setExpression('');
    setCursor(0);
    setResult('0');
    setError('');
    if (next === 'calculate') setShift(false);
  };

  const topButton = (label: string, value: string, className = '') => (
    <button type="button" className={`calc-topkey ${className}`} onClick={() => press(value)}>{label}</button>
  );

  return (
    <ToolShell
      title="科学计算器"
      lead="按模式切换计算、统计、函数表格、方程、不等式、复数、进制、矩阵、向量与比例；保留函数图像和 LaTeX 导入导出。"
      meta={[
        { icon: 'sparkle', label: '10 个模式' },
        { icon: 'image', label: '函数图像' },
        { icon: 'document', label: 'LaTeX' },
      ]}
      toc={toc}
    >
      <section className="article-card calc-panel" id="calculator">
        <div className="calc-body">
          <div className="calc-chrome">
            <div className="calc-brand">
              <span className="calc-brand__mark" aria-hidden>∑</span>
              <div>
                <strong>科学计算器</strong>
                <em>SCIENTIFIC · WEB</em>
              </div>
            </div>
            <span className="calc-chrome__screen-label">10 MODES · 2.0</span>
          </div>

          <div className="calc-top">
            {topButton('模式', 'home', 'is-home')}
            {topButton('变量', 'variable', 'is-wide')}
            {topButton('目录', 'catalog', 'is-wide')}
            {topButton('工具', 'tools', 'is-wide')}
            <span className="calc-top__spacer" />
            {topButton('↶', 'undo', 'is-icon')}
            {topButton('SHIFT', 'shift', `is-shift ${shift ? 'is-active' : ''}`)}
          </div>
          <div className="calc-toprow">
            {topButton('‹', 'left', 'is-icon')}
            {topButton('OK', 'equals', 'is-ok')}
            {topButton('›', 'right', 'is-icon')}
            {topButton('AC', 'clear', 'is-wide')}
            {topButton('DEL', 'del', 'is-wide')}
          </div>

          <div className="calc-screen" data-mode={mode}>
            <div className="calc-screen__status">
              <span className={angleMode === 'deg' ? 'is-on' : ''}>D</span>
              <span className={angleMode === 'rad' ? 'is-on' : ''}>R</span>
              <span className={angleMode === 'grad' ? 'is-on' : ''}>G</span>
              <span className={shift ? 'is-on' : ''}>SHIFT</span>
              <span>{modeStatus(mode)}</span>
              <span>M {memory}</span>
            </div>
            <div className="calc-screen__mode">{modeById(mode).en.toUpperCase()} · {modeById(mode).description}</div>
            {mode === 'calculate' ? (
              <>
                <div className="calc-screen__expression">
                  {expression ? expression.slice(0, cursor) : ''}
                  <span className="calc-caret" aria-hidden />
                  {expression.slice(cursor)}
                </div>
                <div className="calc-screen__result">{result || '—'}</div>
              </>
            ) : (
              <div className="calc-screen__mode-message">在下方输入数据，结果会实时计算。</div>
            )}
            {error ? <div className="calc-screen__error">{error}</div> : null}
          </div>

          {mode === 'calculate' ? (
            <div className="calc-keys">
              {[...FUNCTION_ROWS, ...NUMBER_ROWS].map((row, rowIndex) => (
                <div className={`calc-key-row ${rowIndex >= FUNCTION_ROWS.length ? 'calc-key-row--number' : ''}`} key={rowIndex}>
                  {row.map((key) => {
                    const shifted = shift && key.shift;
                    return (
                      <button
                        key={key.label}
                        type="button"
                        className={`calc-key calc-key--${key.kind} ${shifted ? 'is-shift' : ''} ${key.value === 'equals' ? 'calc-key--exe' : ''}`}
                        onClick={() => press(shifted ? key.shift! : key.value)}
                        title={shifted ? key.shiftLabel : key.label}
                      >
                        {shifted ? key.shiftLabel : key.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <ModeWorkspace mode={mode} angleMode={angleMode} />
          )}

          <div className="calc-tools">
            {mode === 'calculate' ? (
              <>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => run(expression)}>
                  <CalculatorRegular aria-hidden /> 计算
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => press('mplus')}>M+</button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => press('mminus')}>M−</button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => press('mr')}>MR</button>
              </>
            ) : (
              <span className="calc-mode-tools-note">模式内结果实时更新</span>
            )}
            <button type="button" className="btn btn--ghost btn--sm" onClick={exportLatex}>
              <MathFormulaRegular aria-hidden /> LaTeX
            </button>
          </div>
        </div>
      </section>

      <section className="article-card" id="graph">
        <p className="eyebrow">GRAPH</p>
        <h2>函数图像</h2>
        <p className="project-section-lead">输入 f(x)，使用当前角度单位计算；默认显示 x ∈ [-10, 10]、y ∈ [-6, 6]。</p>
        <label className="tool-select tool-select--wide">
          <span>f(x) =</span>
          <input value={graphExpression} onChange={(event) => setGraphExpression(event.target.value)} />
        </label>
        <GraphCanvas expression={graphExpression} angleMode={angleMode} />
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
                <button type="button" onClick={() => { setExpression(item.expression); setCursor(item.expression.length); }}>
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
          <li><strong>模式 / 菜单</strong>：切换计算、统计、表格、方程、不等式、复数、进制、矩阵、向量与比例。</li>
          <li><strong>SHIFT</strong>：切换第二功能，例如 sin⁻¹、∛、x³、10ˣ、eˣ、π、Ans。</li>
          <li><strong>变量 / 函数 / 目录</strong>：打开变量列表、函数目录；<strong>V</strong> 同样打开变量列表。</li>
          <li><strong>方向键 / OK</strong>：移动输入光标；OK 与 EXE 执行计算，左右键编辑表达式。</li>
          <li><strong>AC / DEL / 转换</strong>：清空、删除光标前字符、在小数与科学记数法之间切换。</li>
          <li><strong>M+ / M− / MR</strong>：记忆当前结果或把记忆插入表达式。</li>
          <li>键盘支持数字、运算符、括号、Enter 计算、Backspace 删除、← → 移动光标、Esc 清空。</li>
        </ul>
        <p className="project-note">
          按键布局按常用科学计算器习惯整理：代数在第一行，对数与括号在第二行，三角与常量在第三行；输入内容只在本地计算。
        </p>
      </section>

      <ModeMenu open={modeOpen} current={mode} onSelect={selectMode} onClose={() => setModeOpen(false)} />

      {settingsOpen && (
        <div className="calc-modal" role="dialog" aria-modal="true" aria-label="计算设置">
          <div className="calc-modal__panel">
            <div className="calc-modal__head">
              <strong>计算设置</strong>
              <button type="button" className="icon-btn icon-btn--sm" aria-label="关闭" onClick={() => setSettingsOpen(false)}>
                <DismissRegular aria-hidden />
              </button>
            </div>
            <div className="calc-setting-row">
              <span>角度单位</span>
              <div className="calc-setting-options">
                {([['deg', '度 D'], ['rad', '弧度 R'], ['grad', '百分度 G']] as Array<[AngleMode, string]>).map(([value, label]) => (
                  <button key={value} type="button" className={angleMode === value ? 'is-active' : ''} onClick={() => setAngleMode(value)}>{label}</button>
                ))}
              </div>
            </div>
            <p className="calc-setting-note">这里保留与本站计算最相关的角度单位；显示格式与结果格式会随表达式自动处理。</p>
          </div>
        </div>
      )}

      {catalogOpen && (
        <div className="calc-modal" role="dialog" aria-modal="true" aria-label="函数目录">
          <div className="calc-modal__panel calc-catalog">
            <div className="calc-modal__head">
              <strong>函数目录</strong>
              <button type="button" className="icon-btn icon-btn--sm" aria-label="关闭" onClick={() => setCatalogOpen(false)}>
                <DismissRegular aria-hidden />
              </button>
            </div>
            {CATALOG.map((group) => (
              <section key={group.group}>
                <p className="calc-catalog__group">{group.group}</p>
                <div className="calc-catalog__grid">
                  {group.items.map(([value, label]) => (
                    <button key={label} type="button" onClick={() => { insert(value); setCatalogOpen(false); }}>{label}</button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {variablesOpen && (
        <div className="calc-modal" role="dialog" aria-modal="true" aria-label="变量">
          <div className="calc-modal__panel">
            <div className="calc-modal__head">
              <strong>变量</strong>
              <button type="button" className="icon-btn icon-btn--sm" aria-label="关闭" onClick={() => setVariablesOpen(false)}>
                <DismissRegular aria-hidden />
              </button>
            </div>
            <div className="calc-variable-grid">
              {VARIABLES.map((variable) => (
                <button key={variable} type="button" onClick={() => { insert(variable === 'M' ? String(memory) : variable === 'Ans' ? 'ans' : variable.toLowerCase()); setVariablesOpen(false); }}>{variable}</button>
              ))}
            </div>
            <p className="calc-setting-note">变量 A–F、x、y、z 与 Ans、M 可用于表达式；当前版本不保存变量赋值。</p>
          </div>
        </div>
      )}

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
