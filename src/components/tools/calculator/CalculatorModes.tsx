/** 计算器模式 / Scientific calculator app modes. */
import { useMemo, useState } from 'react';
import { FluentIcon } from '../../common/FluentIcon';
import type { AngleMode } from '../../../lib/tools/expression';
import { evaluateExpression } from '../../../lib/tools/expression';
import { convertBase } from '../../../lib/tools/codecs';

export type CalculatorMode =
  | 'calculate'
  | 'statistics'
  | 'table'
  | 'equation'
  | 'inequality'
  | 'complex'
  | 'base'
  | 'matrix'
  | 'vector'
  | 'ratio';

export interface ModeDefinition {
  id: CalculatorMode;
  name: string;
  en: string;
  description: string;
  icon: string;
}

export const CALCULATOR_MODES: ModeDefinition[] = [
  { id: 'calculate', name: '计算', en: 'Calculate', description: '基本运算、函数、分数与历史', icon: 'calculator' },
  { id: 'statistics', name: '统计', en: 'Statistics', description: '单变量统计量与数据列表', icon: 'grid' },
  { id: 'table', name: '函数表格', en: 'Table', description: '由 f(x) 生成数值表', icon: 'list' },
  { id: 'equation', name: '方程', en: 'Equation', description: '二次方程与二元一次方程组', icon: 'sparkle' },
  { id: 'inequality', name: '不等式', en: 'Inequality', description: '二次不等式的解集', icon: 'document' },
  { id: 'complex', name: '复数', en: 'Complex', description: '复数的四则运算与极坐标', icon: 'code' },
  { id: 'base', name: '进制', en: 'Base-N', description: '二 / 八 / 十 / 十六进制与位运算', icon: 'storage' },
  { id: 'matrix', name: '矩阵', en: 'Matrix', description: '2×2 / 3×3 行列式与逆矩阵', icon: 'grid' },
  { id: 'vector', name: '向量', en: 'Vector', description: '点积、叉积、模长与夹角', icon: 'cube' },
  { id: 'ratio', name: '比例', en: 'Ratio', description: '解 a : b = c : x', icon: 'branch' },
];

export function modeById(id: CalculatorMode): ModeDefinition {
  return CALCULATOR_MODES.find((mode) => mode.id === id) ?? CALCULATOR_MODES[0];
}

export function ModeMenu({
  open,
  current,
  onSelect,
  onClose,
}: {
  open: boolean;
  current: CalculatorMode;
  onSelect: (mode: CalculatorMode) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="calc-mode-overlay" onClick={onClose}>
    <div className="calc-mode-menu" role="dialog" aria-modal="true" aria-label="计算器模式" onClick={(event) => event.stopPropagation()}>
      <div className="calc-mode-menu__head">
        <div>
          <p className="eyebrow">HOME · MODE MENU</p>
          <strong>选择计算器应用</strong>
        </div>
        <button type="button" className="calc-key calc-key--small" onClick={onClose}>AC</button>
      </div>
      <div className="calc-mode-grid">
        {CALCULATOR_MODES.map((mode, index) => (
          <button
            key={mode.id}
            type="button"
            className={`calc-mode-card ${current === mode.id ? 'is-active' : ''}`}
            onClick={() => onSelect(mode.id)}
          >
            <span className="calc-mode-card__num">{index + 1}</span>
            <FluentIcon name={mode.icon} size={20} aria-hidden />
            <span>
              <strong>{mode.name}</strong>
              <small>{mode.en}</small>
              <em>{mode.description}</em>
            </span>
          </button>
        ))}
      </div>
    </div>
    </div>
  );
}

function NumberField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="calc-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} inputMode="decimal" placeholder={placeholder} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <label className="calc-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}
      </select>
    </label>
  );
}

function format(value: number, digits = 10): string {
  if (!Number.isFinite(value)) return '无定义';
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toPrecision(digits)));
}

function formatComplex(real: number, imag: number): string {
  if (Math.abs(imag) < 1e-12) return format(real);
  const sign = imag >= 0 ? '+' : '−';
  return `${format(real)} ${sign} ${format(Math.abs(imag))}i`;
}

function parseList(value: string): number[] {
  return value
    .split(/[\s,;]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

function StatisticsMode() {
  const [raw, setRaw] = useState('1 2 3 4 5');
  const stats = useMemo(() => {
    const values = parseList(raw);
    if (!values.length) return null;
    const n = values.length;
    const sum = values.reduce((total, value) => total + value, 0);
    const mean = sum / n;
    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0);
    return {
      n, sum, mean, median,
      min: sorted[0],
      max: sorted[n - 1],
      sample: Math.sqrt(variance / Math.max(1, n - 1)),
      population: Math.sqrt(variance / n),
      values,
    };
  }, [raw]);

  return (
    <div className="calc-mode-workspace">
      <div className="calc-mode-title"><strong>统计</strong><span>STATISTICS · 1-VAR</span></div>
      <label className="calc-field calc-field--wide">
        <span>数据（空格、逗号或换行分隔）</span>
        <textarea value={raw} onChange={(event) => setRaw(event.target.value)} rows={4} />
      </label>
      {stats ? (
        <div className="calc-result-grid">
          <div><span>n</span><strong>{stats.n}</strong></div>
          <div><span>Σx</span><strong>{format(stats.sum)}</strong></div>
          <div><span>x̄</span><strong>{format(stats.mean)}</strong></div>
          <div><span>中位数</span><strong>{format(stats.median)}</strong></div>
          <div><span>样本 σ</span><strong>{format(stats.sample)}</strong></div>
          <div><span>总体 σ</span><strong>{format(stats.population)}</strong></div>
          <div><span>min</span><strong>{format(stats.min)}</strong></div>
          <div><span>max</span><strong>{format(stats.max)}</strong></div>
        </div>
      ) : <p className="calc-mode-empty">输入至少一个数字。</p>}
    </div>
  );
}

function TableMode({ angleMode }: { angleMode: AngleMode }) {
  const [expression, setExpression] = useState('x^2');
  const [start, setStart] = useState('1');
  const [end, setEnd] = useState('5');
  const [step, setStep] = useState('1');
  const rows = useMemo(() => {
    const from = Number(start);
    const to = Number(end);
    const gap = Number(step);
    if (!Number.isFinite(from) || !Number.isFinite(to) || !Number.isFinite(gap) || gap === 0) return [];
    const result: Array<{ x: number; y: string }> = [];
    const direction = gap > 0 ? 1 : -1;
    for (let x = from; direction > 0 ? x <= to + 1e-9 : x >= to - 1e-9; x += gap) {
      if (result.length >= 60) break;
      try {
        result.push({ x, y: format(evaluateExpression(expression || 'x', { variables: { x }, angleMode })) });
      } catch {
        result.push({ x, y: '错误' });
      }
    }
    return result;
  }, [expression, start, end, step, angleMode]);

  return (
    <div className="calc-mode-workspace">
      <div className="calc-mode-title"><strong>函数表格</strong><span>TABLE</span></div>
      <div className="calc-mode-fields">
        <label className="calc-field calc-field--wide"><span>f(x) =</span><input value={expression} onChange={(event) => setExpression(event.target.value)} /></label>
        <NumberField label="起始 x" value={start} onChange={setStart} />
        <NumberField label="结束 x" value={end} onChange={setEnd} />
        <NumberField label="步长" value={step} onChange={setStep} />
      </div>
      <div className="calc-table-wrap">
        <table className="calc-table"><thead><tr><th>x</th><th>f(x)</th></tr></thead><tbody>
          {rows.map((row) => <tr key={row.x}><td>{format(row.x)}</td><td>{row.y}</td></tr>)}
        </tbody></table>
      </div>
      {!rows.length && <p className="calc-mode-empty">检查起始、结束与步长。</p>}
    </div>
  );
}

function EquationMode() {
  const [type, setType] = useState<'quadratic' | 'system'>('quadratic');
  const [a, setA] = useState('1');
  const [b, setB] = useState('-3');
  const [c, setC] = useState('2');
  const [a2, setA2] = useState('2');
  const [b2, setB2] = useState('1');
  const [c2, setC2] = useState('5');
  const [d2, setD2] = useState('1');
  const [e2, setE2] = useState('-1');
  const [f2, setF2] = useState('1');

  type QuadraticResult = { linear: true; x: number } | { disc: number; roots: [number, number] } | { disc: number; complex: [number, number] } | null;
  const quadratic = useMemo<QuadraticResult>(() => {
    const av = Number(a), bv = Number(b), cv = Number(c);
    if (![av, bv, cv].every(Number.isFinite)) return null;
    if (av === 0) return bv === 0 ? null : { linear: true as const, x: -cv / bv };
    const disc = bv * bv - 4 * av * cv;
    if (disc >= 0) {
      const root = Math.sqrt(disc);
      return { disc, roots: [(-bv + root) / (2 * av), (-bv - root) / (2 * av)] as [number, number] };
    }
    const root = Math.sqrt(-disc);
    return { disc, complex: [(-bv / (2 * av)), root / (2 * av)] as [number, number] };
  }, [a, b, c]);

  const system = useMemo(() => {
    const values = [a2, b2, c2, d2, e2, f2].map(Number);
    if (!values.every(Number.isFinite)) return null;
    const [a1, b1, c1, a3, b3, c3] = values;
    const det = a1 * b3 - a3 * b1;
    if (det === 0) return null;
    return {
      x: (c1 * b3 - c3 * b1) / det,
      y: (a1 * c3 - a3 * c1) / det,
    };
  }, [a2, b2, c2, d2, e2, f2]);

  return (
    <div className="calc-mode-workspace">
      <div className="calc-mode-title"><strong>方程</strong><span>EQUATION</span></div>
      <div className="calc-mode-tabs">
        <button type="button" className={type === 'quadratic' ? 'is-active' : ''} onClick={() => setType('quadratic')}>二次方程</button>
        <button type="button" className={type === 'system' ? 'is-active' : ''} onClick={() => setType('system')}>二元一次方程组</button>
      </div>
      {type === 'quadratic' ? (
        <>
          <p className="calc-mode-formula">ax² + bx + c = 0</p>
          <div className="calc-mode-fields">
            <NumberField label="a" value={a} onChange={setA} />
            <NumberField label="b" value={b} onChange={setB} />
            <NumberField label="c" value={c} onChange={setC} />
          </div>
          <div className="calc-mode-output">
            {quadratic && 'linear' in quadratic ? `x = ${format(quadratic.x)}` : quadratic && 'roots' in quadratic
              ? `x₁ = ${format(quadratic.roots[0])}　x₂ = ${format(quadratic.roots[1])}`
              : quadratic && 'complex' in quadratic
                ? `x = ${formatComplex(quadratic.complex[0], quadratic.complex[1])}　/　${formatComplex(quadratic.complex[0], -quadratic.complex[1])}`
                : '无解或输入无效'}
          </div>
        </>
      ) : (
        <>
          <p className="calc-mode-formula">a₁x + b₁y = c₁　/　a₂x + b₂y = c₂</p>
          <div className="calc-mode-fields calc-mode-fields--three">
            <NumberField label="a₁" value={a2} onChange={setA2} /><NumberField label="b₁" value={b2} onChange={setB2} /><NumberField label="c₁" value={c2} onChange={setC2} />
            <NumberField label="a₂" value={d2} onChange={setD2} /><NumberField label="b₂" value={e2} onChange={setE2} /><NumberField label="c₂" value={f2} onChange={setF2} />
          </div>
          <div className="calc-mode-output">{system ? `x = ${format(system.x)}　y = ${format(system.y)}` : '无唯一解'}</div>
        </>
      )}
    </div>
  );
}

function InequalityMode() {
  const [a, setA] = useState('1');
  const [b, setB] = useState('0');
  const [c, setC] = useState('-1');
  const [sign, setSign] = useState('>');
  const result = useMemo(() => {
    const av = Number(a), bv = Number(b), cv = Number(c);
    if (![av, bv, cv].every(Number.isFinite)) return '输入无效';
    if (av === 0) return bv === 0 ? (sign.startsWith('>') ? (cv < 0 ? '全体实数' : '无解') : (cv <= 0 ? '全体实数' : '无解')) : `x ${sign} ${format(-cv / bv)}`;
    const disc = bv * bv - 4 * av * cv;
    if (disc < 0) return av > 0 ? (sign.includes('>') ? '全体实数' : '无解') : (sign.includes('<') ? '全体实数' : '无解');
    const root = Math.sqrt(disc);
    const x1 = (-bv - root) / (2 * av);
    const x2 = (-bv + root) / (2 * av);
    const low = Math.min(x1, x2), high = Math.max(x1, x2);
    if (disc === 0) return av > 0 ? (sign === '>' || sign === '≥' ? `x ≠ ${format(low)}` : '无解') : (sign === '<' || sign === '≤' ? `x ≠ ${format(low)}` : '无解');
    if (av > 0) {
      if (sign === '>') return `x < ${format(low)} 或 x > ${format(high)}`;
      if (sign === '≥') return `x ≤ ${format(low)} 或 x ≥ ${format(high)}`;
      if (sign === '<') return `${format(low)} < x < ${format(high)}`;
      return `${format(low)} ≤ x ≤ ${format(high)}`;
    }
    return '开口向下时请结合图像判断';
  }, [a, b, c, sign]);
  return (
    <div className="calc-mode-workspace">
      <div className="calc-mode-title"><strong>不等式</strong><span>INEQUALITY</span></div>
      <p className="calc-mode-formula">ax² + bx + c {sign} 0</p>
      <div className="calc-mode-fields calc-mode-fields--three">
        <NumberField label="a" value={a} onChange={setA} /><NumberField label="b" value={b} onChange={setB} /><NumberField label="c" value={c} onChange={setC} />
        <SelectField label="符号" value={sign} onChange={setSign} options={[['>', '>'], ['≥', '≥'], ['<', '<'], ['≤', '≤']]} />
      </div>
      <div className="calc-mode-output">{result}</div>
    </div>
  );
}

function ComplexMode() {
  const [ar, setAr] = useState('1');
  const [ai, setAi] = useState('2');
  const [br, setBr] = useState('3');
  const [bi, setBi] = useState('-1');
  const [op, setOp] = useState('+');
  const result = useMemo(() => {
    const a = Number(ar), b = Number(ai), c = Number(br), d = Number(bi);
    if (![a, b, c, d].every(Number.isFinite)) return '输入无效';
    let real = 0, imag = 0;
    if (op === '+') { real = a + c; imag = b + d; }
    else if (op === '−') { real = a - c; imag = b - d; }
    else if (op === '×') { real = a * c - b * d; imag = a * d + b * c; }
    else { const den = c * c + d * d; if (!den) return '除数不能为 0'; real = (a * c + b * d) / den; imag = (b * c - a * d) / den; }
    const radius = Math.hypot(real, imag);
    const angle = (Math.atan2(imag, real) * 180) / Math.PI;
    return `${formatComplex(real, imag)}　|z|=${format(radius)}　arg=${format(angle)}°`;
  }, [ar, ai, br, bi, op]);
  return (
    <div className="calc-mode-workspace">
      <div className="calc-mode-title"><strong>复数</strong><span>COMPLEX</span></div>
      <div className="calc-mode-fields">
        <NumberField label="a（实部）" value={ar} onChange={setAr} /><NumberField label="b（虚部）" value={ai} onChange={setAi} />
        <NumberField label="c（实部）" value={br} onChange={setBr} /><NumberField label="d（虚部）" value={bi} onChange={setBi} />
        <SelectField label="运算" value={op} onChange={setOp} options={[['+', 'z₁ + z₂'], ['−', 'z₁ − z₂'], ['×', 'z₁ × z₂'], ['÷', 'z₁ ÷ z₂']]} />
      </div>
      <div className="calc-mode-output">{result}</div>
    </div>
  );
}

function BaseMode() {
  const [value, setValue] = useState('255');
  const [from, setFrom] = useState('10');
  const [operand, setOperand] = useState('15');
  const [op, setOp] = useState('&');
  const result = useMemo(() => {
    try {
      const a = BigInt(convertBase(value, Number(from), 10));
      const b = BigInt(convertBase(operand, Number(from), 10));
      let out: bigint;
      if (op === '&') out = a & b;
      else if (op === '|') out = a | b;
      else if (op === '^') out = a ^ b;
      else if (op === '<<') out = a << b;
      else out = a >> b;
      return { value: out.toString(2), bin: out.toString(2), oct: out.toString(8), dec: out.toString(10), hex: out.toString(16).toUpperCase() };
    } catch {
      return null;
    }
  }, [value, from, operand, op]);
  return (
    <div className="calc-mode-workspace">
      <div className="calc-mode-title"><strong>进制</strong><span>BASE-N</span></div>
      <div className="calc-mode-fields calc-mode-fields--three">
        <NumberField label="数值" value={value} onChange={setValue} />
        <SelectField label="输入进制" value={from} onChange={setFrom} options={[['2', 'BIN 2'], ['8', 'OCT 8'], ['10', 'DEC 10'], ['16', 'HEX 16']]} />
        <NumberField label="操作数" value={operand} onChange={setOperand} />
        <SelectField label="位运算" value={op} onChange={setOp} options={[['&', 'AND &'], ['|', 'OR |'], ['^', 'XOR ^'], ['<<', '左移 <<'], ['>>', '右移 >>']]} />
      </div>
      <div className="calc-result-grid">
        <div><span>BIN</span><strong>{result?.bin ?? '错误'}</strong></div>
        <div><span>OCT</span><strong>{result?.oct ?? '错误'}</strong></div>
        <div><span>DEC</span><strong>{result?.dec ?? '错误'}</strong></div>
        <div><span>HEX</span><strong>{result?.hex ?? '错误'}</strong></div>
      </div>
    </div>
  );
}

function MatrixMode() {
  const [size, setSize] = useState<2 | 3>(2);
  const [values, setValues] = useState(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  const result = useMemo(() => {
    const nums = values.map(Number);
    if (!nums.every(Number.isFinite)) return '输入无效';
    if (size === 2) {
      const [a, b, c, d] = nums;
      const det = a * d - b * c;
      return { det, inverse: det ? `${format(d / det)} ${format(-b / det)} / ${format(-c / det)} ${format(a / det)}` : '不可逆' };
    }
    const [a, b, c, d, e, f, g, h, i] = nums;
    return { det: a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g), inverse: '仅支持 2×2 逆矩阵' };
  }, [size, values]);
  return (
    <div className="calc-mode-workspace">
      <div className="calc-mode-title"><strong>矩阵</strong><span>MATRIX</span></div>
      <div className="calc-mode-tabs">
        <button type="button" className={size === 2 ? 'is-active' : ''} onClick={() => setSize(2)}>2×2</button>
        <button type="button" className={size === 3 ? 'is-active' : ''} onClick={() => setSize(3)}>3×3</button>
      </div>
      <div className={`calc-matrix-grid calc-matrix-grid--${size}`}>
        {Array.from({ length: size * size }, (_, index) => (
          <input key={index} value={values[index] ?? ''} onChange={(event) => setValues((current) => current.map((item, i) => (i === index ? event.target.value : item)))} inputMode="decimal" aria-label={`矩阵元素 ${index + 1}`} />
        ))}
      </div>
      <div className="calc-mode-output">det(A) = {typeof result === 'string' ? result : format(result.det)}<br />{typeof result !== 'string' && result.inverse !== '不可逆' ? `A⁻¹ = ${result.inverse}` : ''}</div>
    </div>
  );
}

function VectorMode() {
  const [a, setA] = useState(['1', '2', '3']);
  const [b, setB] = useState(['4', '5', '6']);
  const [op, setOp] = useState('dot');
  const result = useMemo(() => {
    const av = a.map(Number), bv = b.map(Number);
    if (![...av, ...bv].every(Number.isFinite)) return '输入无效';
    const dot = av.reduce((total, value, index) => total + value * bv[index], 0);
    const cross = [av[1] * bv[2] - av[2] * bv[1], av[2] * bv[0] - av[0] * bv[2], av[0] * bv[1] - av[1] * bv[0]];
    const magA = Math.hypot(...av), magB = Math.hypot(...bv);
    if (op === 'dot') return `a · b = ${format(dot)}`;
    if (op === 'cross') return `a × b = (${cross.map((value) => format(value)).join(', ')})`;
    if (op === 'mag') return `|a| = ${format(magA)}　|b| = ${format(magB)}`;
    return `θ = ${format((Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB)))) * 180) / Math.PI)}°`;
  }, [a, b, op]);
  const update = (setter: typeof setA, index: number, value: string) => setter((current) => current.map((item, i) => (i === index ? value : item)));
  return (
    <div className="calc-mode-workspace">
      <div className="calc-mode-title"><strong>向量</strong><span>VECTOR</span></div>
      <div className="calc-mode-fields calc-mode-fields--three">
        <NumberField label="a₁" value={a[0]} onChange={(value) => update(setA, 0, value)} /><NumberField label="a₂" value={a[1]} onChange={(value) => update(setA, 1, value)} /><NumberField label="a₃" value={a[2]} onChange={(value) => update(setA, 2, value)} />
        <NumberField label="b₁" value={b[0]} onChange={(value) => update(setB, 0, value)} /><NumberField label="b₂" value={b[1]} onChange={(value) => update(setB, 1, value)} /><NumberField label="b₃" value={b[2]} onChange={(value) => update(setB, 2, value)} />
        <SelectField label="运算" value={op} onChange={setOp} options={[['dot', '点积 a·b'], ['cross', '叉积 a×b'], ['mag', '模长 |a|, |b|'], ['angle', '夹角 θ']]} />
      </div>
      <div className="calc-mode-output">{result}</div>
    </div>
  );
}

function RatioMode() {
  const [a, setA] = useState('2');
  const [b, setB] = useState('3');
  const [c, setC] = useState('8');
  const result = useMemo(() => {
    const av = Number(a), bv = Number(b), cv = Number(c);
    if (![av, bv, cv].every(Number.isFinite) || av === 0) return '无解';
    return `x = ${format((bv * cv) / av)}`;
  }, [a, b, c]);
  return (
    <div className="calc-mode-workspace">
      <div className="calc-mode-title"><strong>比例</strong><span>RATIO</span></div>
      <p className="calc-mode-formula">a : b = c : x</p>
      <div className="calc-mode-fields calc-mode-fields--three">
        <NumberField label="a" value={a} onChange={setA} /><NumberField label="b" value={b} onChange={setB} /><NumberField label="c" value={c} onChange={setC} />
      </div>
      <div className="calc-mode-output">{result}</div>
    </div>
  );
}

export function ModeWorkspace({ mode, angleMode }: { mode: CalculatorMode; angleMode: AngleMode }) {
  switch (mode) {
    case 'statistics': return <StatisticsMode />;
    case 'table': return <TableMode angleMode={angleMode} />;
    case 'equation': return <EquationMode />;
    case 'inequality': return <InequalityMode />;
    case 'complex': return <ComplexMode />;
    case 'base': return <BaseMode />;
    case 'matrix': return <MatrixMode />;
    case 'vector': return <VectorMode />;
    case 'ratio': return <RatioMode />;
    default: return null;
  }
}
