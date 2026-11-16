/**
 * GitHub Markdown 渲染 / Render issue bodies and comments safely.
 *
 * marked + DOMPurify 只在真正出现 issue 内容时动态加载，不进入站点首屏。
 * 渲染前统一 sanitize，避免 issue / 评论中的 HTML 注入。
 */
import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

let hooksInstalled = false;

type Purifier = typeof import('dompurify').default;

function installHooks(purifier: Purifier) {
  if (hooksInstalled) return;
  hooksInstalled = true;
  purifier.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const href = node.getAttribute('href') ?? '';
      if (href && !href.startsWith('#')) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
    if (node.tagName === 'IMG') {
      node.setAttribute('loading', 'lazy');
      node.setAttribute('decoding', 'async');
      node.setAttribute('referrerpolicy', 'no-referrer');
    }
  });
}

interface MarkdownProps {
  text: string | null | undefined;
  className?: string;
  emptyText?: string;
}

export function GitHubMarkdown({ text, className, emptyText = '暂无内容' }: MarkdownProps) {
  const [html, setHtml] = useState('');
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    if (!text || !text.trim()) {
      setHtml('');
      setReady(true);
      return;
    }

    setReady(false);
    void (async () => {
      try {
        const [{ marked }, dompurifyModule] = await Promise.all([import('marked'), import('dompurify')]);
        if (cancelled) return;
        const purifier = dompurifyModule.default;
        installHooks(purifier);
        const parsed = await marked.parse(text, { gfm: true, breaks: true });
        if (cancelled) return;
        setHtml(
          purifier.sanitize(parsed, {
            USE_PROFILES: { html: true },
            ADD_ATTR: ['target', 'rel'],
            FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
          }),
        );
        setReady(true);
      } catch (error) {
        console.warn('[markdown] 渲染失败，退回纯文本', error);
        if (!cancelled) {
          setHtml('');
          setFailed(true);
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!text || !text.trim()) {
    return <p className={cn('markdown-body', 'markdown-body--empty', className)}>{emptyText}</p>;
  }

  if (failed) {
    return <div className={cn('markdown-body', 'markdown-body--plain', className)}>{text}</div>;
  }

  if (!ready) {
    return (
      <div className={cn('markdown-body', 'markdown-body--plain', className)} aria-busy="true">
        {text}
      </div>
    );
  }

  return (
    <div
      className={cn('markdown-body', className)}
      dangerouslySetInnerHTML={{ __html: html || '<p>暂无内容</p>' }}
    />
  );
}
