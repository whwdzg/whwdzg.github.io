/** 代码块与复制 / Code block with copy feedback. */
import { CopyRegular, CheckmarkRegular } from '@fluentui/react-icons';
import { useState } from 'react';
import { copyText } from '../../lib/clipboard';
import { useToast } from '../../hooks/useToast';

interface CodeBlockProps {
  code: string;
  title?: string;
  language?: string;
}

export function CodeBlock({ code, title, language = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span className="code-block__title">{title ?? language}</span>
        <button
          type="button"
          className="code-block__copy"
          onClick={async () => {
            const ok = await copyText(code);
            if (ok) {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
              toast('已复制到剪贴板', 'success');
            } else {
              toast('复制失败，请手动选择文本', 'error');
            }
          }}
        >
          {copied ? <CheckmarkRegular aria-hidden /> : <CopyRegular aria-hidden />}
          <span>{copied ? '已复制' : '复制'}</span>
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
