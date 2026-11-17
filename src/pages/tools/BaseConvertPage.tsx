/** 进制转换 / Base converter for 2–36. */
import { useMemo, useState } from 'react';
import { CopyRegular } from '@fluentui/react-icons';
import { ToolShell } from '../../components/tools/ToolShell';
import { useToast } from '../../hooks/useToast';
import { copyText } from '../../lib/clipboard';
import { convertBase } from '../../lib/tools/codecs';
import '../../styles/tools.css';

const TOC = [
  { id: 'tool', label: '转换' },
  { id: 'common', label: '常用进制' },
];

const BASES = [2, 8, 10, 16, 32, 36];

export default function BaseConvertPage() {
  const [value, setValue] = useState('2026');
  const [from, setFrom] = useState(10);
  const [to, setTo] = useState(16);
  const [error, setError] = useState('');
  const toc = useMemo(() => TOC, []);
  const { toast } = useToast();

  let converted = '';
  let conversionError = '';
  try {
    converted = convertBase(value, from, to);
  } catch (reason) {
    conversionError = reason instanceof Error ? reason.message : '转换失败';
  }

  const rows = BASES.map((base) => {
    try {
      return { base, value: convertBase(value, from, base) };
    } catch {
      return { base, value: '—' };
    }
  });

  return (
    <ToolShell
      title="进制转换"
      lead="在 2–36 进制之间转换整数。输入十进制、十六进制或任意自定义进制，立即得到常用进制结果。"
      meta={[
        { icon: 'code', label: '2–36 进制' },
        { icon: 'shield', label: 'BigInt 精确' },
        { icon: 'globe', label: '本地处理' },
      ]}
      toc={toc}
    >
      <section className="article-card tool-panel" id="tool">
        <div className="tool-actions">
          <label className="tool-select">
            <span>源进制</span>
            <select value={from} onChange={(event) => setFrom(Number(event.target.value))}>
              {Array.from({ length: 35 }, (_, index) => index + 2).map((base) => <option key={base} value={base}>{base}</option>)}
            </select>
          </label>
          <label className="tool-select">
            <span>目标进制</span>
            <select value={to} onChange={(event) => setTo(Number(event.target.value))}>
              {Array.from({ length: 35 }, (_, index) => index + 2).map((base) => <option key={base} value={base}>{base}</option>)}
            </select>
          </label>
        </div>
        <div className="tool-io">
          <label>
            <span>输入（{from} 进制）</span>
            <input value={value} onChange={(event) => { setValue(event.target.value); setError(''); }} />
          </label>
          <label>
            <span>结果（{to} 进制）</span>
            <input value={converted} readOnly />
          </label>
        </div>
        {conversionError || error ? <p className="tool-error">{conversionError || error}</p> : null}
        <div className="tool-actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={!converted}
            onClick={async () => {
              if (await copyText(converted)) toast('已复制结果', 'success');
            }}
          >
            <CopyRegular aria-hidden /> 复制结果
          </button>
          <span className="tool-meta">支持 0–9、a–z（不区分大小写）</span>
        </div>
      </section>

      <section className="article-card" id="common">
        <p className="eyebrow">COMMON BASES</p>
        <h2>常用进制</h2>
        <div className="tool-table">
          {rows.map((row) => (
            <button
              type="button"
              key={row.base}
              onClick={async () => {
                if (row.value !== '—' && (await copyText(row.value))) toast(`已复制 ${row.base} 进制结果`, 'success');
              }}
            >
              <strong>{row.base} 进制</strong>
              <span>{row.value}</span>
            </button>
          ))}
        </div>
      </section>
    </ToolShell>
  );
}
