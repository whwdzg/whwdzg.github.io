/** Base64 编解码工具 / Base64 encoder & decoder. */
import { useMemo, useState } from 'react';
import { ArrowDownRegular, ArrowUpRegular, ArrowSwapRegular, CopyRegular, DeleteRegular } from '@fluentui/react-icons';
import { ToolShell } from '../../components/tools/ToolShell';
import { CodeBlock } from '../../components/common/CodeBlock';
import { useToast } from '../../hooks/useToast';
import { copyText } from '../../lib/clipboard';
import { base64ToBytes, bytesToBase64, fromBytes, toBytes, toBase64Url, fromBase64Url } from '../../lib/tools/codecs';
import '../../styles/tools.css';

const TOC = [
  { id: 'tool', label: '编解码' },
  { id: 'format', label: '格式说明' },
  { id: 'examples', label: '示例' },
];

export default function Base64Page() {
  const [input, setInput] = useState('沧海水鱼 · waterfish');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const toc = useMemo(() => TOC, []);

  const encode = () => {
    try {
      setError('');
      const bytes = toBytes(input);
      setOutput(urlSafe ? toBase64Url(input) : bytesToBase64(bytes));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '编码失败');
      setOutput('');
    }
  };

  const decode = () => {
    try {
      setError('');
      setOutput(urlSafe ? fromBase64Url(input) : fromBytes(base64ToBytes(input)));
    } catch {
      setError('输入不是合法的 Base64 / URL-safe Base64');
      setOutput('');
    }
  };

  const copy = async () => {
    if (await copyText(output)) toast('已复制输出', 'success');
  };

  return (
    <ToolShell
      title="Base64 编解码"
      lead="在浏览器中把 Unicode 文本与 Base64 / URL-safe Base64 互转。适合调试 API、配置文件和嵌入式数据。"
      meta={[
        { icon: 'code', label: '实时转换' },
        { icon: 'shield', label: '纯本地' },
        { icon: 'globe', label: 'UTF-8' },
      ]}
      toc={toc}
    >
      <section className="article-card tool-panel" id="tool">
        <div className="tool-actions">
          <button type="button" className="btn btn--primary btn--md" onClick={encode}>
            <ArrowUpRegular aria-hidden /> 编码
          </button>
          <button type="button" className="btn btn--ghost btn--md" onClick={decode}>
            <ArrowDownRegular aria-hidden /> 解码
          </button>
          <button type="button" className="btn btn--ghost btn--md" onClick={() => {
            setInput(output);
            setOutput('');
          }}>
            <ArrowSwapRegular aria-hidden /> 交换
          </button>
          <button type="button" className="btn btn--ghost btn--md" onClick={() => {
            setInput('');
            setOutput('');
            setError('');
          }}>
            <DeleteRegular aria-hidden /> 清空
          </button>
          <label className="tool-check">
            <input type="checkbox" checked={urlSafe} onChange={(event) => setUrlSafe(event.target.checked)} />
            URL-safe（- _ 无填充）
          </label>
        </div>

        <div className="tool-io">
          <label>
            <span>输入</span>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={8} placeholder="输入文本或 Base64…" />
          </label>
          <label>
            <span>输出</span>
            <textarea value={output} readOnly rows={8} placeholder="结果会显示在这里…" />
          </label>
        </div>

        {error ? <p className="tool-error">{error}</p> : null}
        <div className="tool-actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={copy} disabled={!output}>
            <CopyRegular aria-hidden /> 复制输出
          </button>
          <span className="tool-meta">{input.length} 字符输入 · {output.length} 字符输出</span>
        </div>
      </section>

      <section className="article-card" id="format">
        <p className="eyebrow">FORMAT</p>
        <h2>格式说明</h2>
        <p>
          Base64 用 64 个可打印字符表示二进制；标准实现使用 <code>+ /</code> 与 <code>=</code> 填充，URL-safe 实现改用
          <code>- _</code> 并省略填充。解码前会自动忽略空白。
        </p>
        <CodeBlock title="示例" language="text" code={'文本 → 沧海水鱼\nUTF-8 → e6b29be6b5b7e6b0b4e9b1bc\nBase64 → 5rKb5rW35rC06bG8'} />
      </section>

      <section className="article-card" id="examples">
        <p className="eyebrow">EXAMPLES</p>
        <h2>常见用途</h2>
        <ul className="project-list">
          <li>把 JSON / 文本放进 URL 参数或 data URL。</li>
          <li>检查 JWT 的 header / payload（仅解码，不验证签名）。</li>
          <li>调试需要 Base64 的 API、配置文件和着色器参数。</li>
        </ul>
      </section>
    </ToolShell>
  );
}
