/** Unicode 转换 / Unicode escape & code point table. */
import { useMemo, useState } from 'react';
import { ArrowDownRegular, ArrowUpRegular, CopyRegular } from '@fluentui/react-icons';
import { ToolShell } from '../../components/tools/ToolShell';
import { useToast } from '../../hooks/useToast';
import { copyText } from '../../lib/clipboard';
import { decodeUnicode, formatUnicode } from '../../lib/tools/codecs';
import '../../styles/tools.css';

const TOC = [
  { id: 'tool', label: '转换' },
  { id: 'table', label: '码点表' },
  { id: 'notes', label: '格式' },
];

type Mode = 'escape' | 'codepoint' | 'html';

export default function UnicodePage() {
  const [input, setInput] = useState('沧海水鱼 · 水鱼 Blog');
  const [encodedInput, setEncodedInput] = useState('');
  const [mode, setMode] = useState<Mode>('escape');
  const [output, setOutput] = useState('');
  const toc = useMemo(() => TOC, []);
  const { toast } = useToast();

  const rows = [...input].slice(0, 120).map((char, index) => ({
    index: index + 1,
    char: char === ' ' ? '[空格]' : char === '\n' ? '[换行]' : char,
    code: `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`,
    escape: formatUnicode(char, 'escape'),
  }));

  return (
    <ToolShell
      title="Unicode 转换"
      lead="在文本与 \\uXXXX / U+XXXX / HTML 实体之间互转，并查看每个字符的码点。适合调试 JSON、前端文案和接口日志。"
      meta={[
        { icon: 'document', label: '3 种格式' },
        { icon: 'shield', label: '纯本地' },
        { icon: 'globe', label: '完整 Unicode' },
      ]}
      toc={toc}
    >
      <section className="article-card tool-panel" id="tool">
        <div className="tool-actions">
          <div className="tool-check-group" role="group" aria-label="输出格式">
            {([
              ['escape', '\\uXXXX'],
              ['codepoint', 'U+XXXX'],
              ['html', '&#xXXXX;'],
            ] as [Mode, string][]).map(([value, label]) => (
              <button key={value} type="button" className={mode === value ? 'is-active' : ''} onClick={() => setMode(value)}>
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn--primary btn--md" onClick={() => setOutput(formatUnicode(input, mode))}>
            <ArrowUpRegular aria-hidden /> 编码
          </button>
        </div>
        <div className="tool-io">
          <label>
            <span>文本</span>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={6} />
          </label>
          <label>
            <span>Unicode 字符串</span>
            <textarea value={output} readOnly rows={6} />
          </label>
        </div>
        <div className="tool-actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={!output}
            onClick={async () => {
              if (await copyText(output)) toast('已复制输出', 'success');
            }}
          >
            <CopyRegular aria-hidden /> 复制输出
          </button>
        </div>

        <div className="tool-divider" />
        <div className="tool-io">
          <label>
            <span>粘贴 Unicode 字符串</span>
            <textarea
              value={encodedInput}
              onChange={(event) => setEncodedInput(event.target.value)}
              rows={4}
              placeholder="\\u6CA7\\u6D77\\u6C34\\u9C7C 或 U+6CA7..."
            />
          </label>
          <label>
            <span>解码结果</span>
            <textarea
              value={encodedInput ? (() => { try { return decodeUnicode(encodedInput); } catch { return '无法解码：' + encodedInput; } })() : ''}
              readOnly
              rows={4}
            />
          </label>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEncodedInput(output)}>
          <ArrowDownRegular aria-hidden /> 把上面的输出填入解码
        </button>
      </section>

      <section className="article-card" id="table">
        <p className="eyebrow">CODE POINTS</p>
        <h2>码点表</h2>
        <div className="tool-table-wrap">
          <table className="project-table">
            <thead><tr><th>#</th><th>字符</th><th>码点</th><th>转义</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.index}-${row.code}`}>
                  <td>{row.index}</td>
                  <td className="tool-char">{row.char}</td>
                  <td><code>{row.code}</code></td>
                  <td><code>{row.escape}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="article-card" id="notes">
        <p className="eyebrow">NOTES</p>
        <h2>格式</h2>
        <ul className="project-list">
          <li><code>\uXXXX</code>：JavaScript / JSON 常用转义；emoji 会拆成代理对。</li>
          <li><code>U+XXXX</code>：Unicode 码点写法，超过 U+FFFF 时使用 5–6 位。</li>
          <li><code>&#xXXXX;</code> / <code>&#NNNN;</code>：HTML 十六进制 / 十进制实体。</li>
        </ul>
      </section>
    </ToolShell>
  );
}
