/** BaseX 编解码 / Base16, Base32, Base58, Base64, Base85, Base91. */
import { useMemo, useState } from 'react';
import { ArrowDownRegular, ArrowUpRegular, CopyRegular } from '@fluentui/react-icons';
import { ToolShell } from '../../components/tools/ToolShell';
import { useToast } from '../../hooks/useToast';
import { copyText } from '../../lib/clipboard';
import { BASE_SCHEMES, fromBytes, toBytes, type BaseSchemeId } from '../../lib/tools/codecs';
import '../../styles/tools.css';

const TOC = [
  { id: 'tool', label: '编解码' },
  { id: 'schemes', label: '六种方案' },
  { id: 'notes', label: '注意' },
];

export default function BaseXPage() {
  const [input, setInput] = useState('Hello, Minecraft!');
  const [output, setOutput] = useState('');
  const [scheme, setScheme] = useState<BaseSchemeId>('base64');
  const [error, setError] = useState('');
  const toc = useMemo(() => TOC, []);
  const { toast } = useToast();
  const current = BASE_SCHEMES.find((item) => item.id === scheme) ?? BASE_SCHEMES[3];

  const encode = () => {
    try {
      setError('');
      setOutput(current.encode(toBytes(input)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '编码失败');
      setOutput('');
    }
  };

  const decode = () => {
    try {
      setError('');
      setOutput(fromBytes(current.decode(input)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '解码失败');
      setOutput('');
    }
  };

  return (
    <ToolShell
      title="BaseX 编解码"
      lead="在同一面板完成 Base16 / Base32 / Base58 / Base64 / Base85 / Base91 与 UTF-8 文本互转。选择方案后输入内容即可转换。"
      meta={[
        { icon: 'code', label: '6 种方案' },
        { icon: 'shield', label: '纯本地' },
        { icon: 'globe', label: 'UTF-8' },
      ]}
      toc={toc}
    >
      <section className="article-card tool-panel" id="tool">
        <div className="tool-actions">
          <label className="tool-select">
            <span>编码方案</span>
            <select value={scheme} onChange={(event) => setScheme(event.target.value as BaseSchemeId)}>
              {BASE_SCHEMES.map((item) => (
                <option value={item.id} key={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn--primary btn--md" onClick={encode}>
            <ArrowUpRegular aria-hidden /> 编码
          </button>
          <button type="button" className="btn btn--ghost btn--md" onClick={decode}>
            <ArrowDownRegular aria-hidden /> 解码
          </button>
        </div>
        <div className="tool-io">
          <label>
            <span>输入</span>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={7} />
          </label>
          <label>
            <span>输出</span>
            <textarea value={output} readOnly rows={7} />
          </label>
        </div>
        {error ? <p className="tool-error">{error}</p> : null}
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
          <span className="tool-meta">{current.label} · {input.length} 字符输入</span>
        </div>
      </section>

      <section className="article-card" id="schemes">
        <p className="eyebrow">SCHEMES</p>
        <h2>六种方案</h2>
        <div className="tool-table">
          {BASE_SCHEMES.map((item) => (
            <button key={item.id} type="button" className={item.id === scheme ? 'is-active' : ''} onClick={() => setScheme(item.id)}>
              <strong>{item.label}</strong>
              <span>{item.id === 'base16' ? '十六进制' : item.id === 'base32' ? 'RFC 4648' : item.id === 'base58' ? 'Bitcoin 字母表' : item.id === 'base64' ? '标准 / URL-safe' : item.id === 'base85' ? 'ASCII85' : 'basE91'}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="article-card" id="notes">
        <p className="eyebrow">NOTES</p>
        <h2>注意</h2>
        <ul className="project-list">
          <li>Base58 / Base85 / Base91 不是标准 MIME 编码，解码时必须使用同一套字母表。</li>
          <li>输入中的空白会被忽略；解码失败会提示具体原因。</li>
          <li>所有转换在浏览器本地完成，不会上传输入。</li>
        </ul>
      </section>
    </ToolShell>
  );
}
