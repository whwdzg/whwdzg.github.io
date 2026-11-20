/** Markdown editor helpers: parsing, preview, outline, local notes. */
import DOMPurify from 'dompurify';
import katex from 'katex';
import { Marked } from 'marked';

export interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface OutlineItem {
  id: string;
  level: number;
  text: string;
}

export interface RenderedMarkdown {
  html: string;
  outline: OutlineItem[];
  words: number;
  readingMinutes: number;
}

const NOTES_KEY = 'whwdzg-markdown-notes-v1';
const ACTIVE_KEY = 'whwdzg-markdown-active-note-v1';

const marked = new Marked({
  gfm: true,
  breaks: false,
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mathHtml(expression: string, block: boolean): string {
  try {
    return katex.renderToString(expression, {
      displayMode: block,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  } catch {
    return `<span class="md-math-error">${escapeHtml(block ? `$$${expression}$$` : `$${expression}$`)}</span>`;
  }
}

/**
 * Protect math segments before marked parses the document.
 * Code fences and inline code are intentionally skipped so `$` inside code is literal.
 */
function protectMath(source: string): { source: string; expressions: Array<{ token: string; html: string; block: boolean }> } {
  const expressions: Array<{ token: string; html: string; block: boolean }> = [];
  let counter = 0;
  const chunks = source.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g);

  const processed = chunks.map((chunk) => {
    if (/^(```|~~~|`)/.test(chunk)) return chunk;
    let next = chunk.replace(/\$\$([\s\S]+?)\$\$/g, (_match, expression: string) => {
      const token = `MATHPLACEHOLDER${counter}TOKEN`;
      counter += 1;
      expressions.push({ token, html: mathHtml(expression.trim(), true), block: true });
      return token;
    });
    next = next.replace(/\$([^$\n]+?)\$/g, (_match, expression: string) => {
      const token = `MATHPLACEHOLDER${counter}TOKEN`;
      counter += 1;
      expressions.push({ token, html: mathHtml(expression.trim(), false), block: false });
      return token;
    });
    return next;
  });

  return { source: processed.join(''), expressions };
}

function linkWikiNotes(source: string): string {
  return source.replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, (_match, target: string, label?: string) => {
    const cleanTarget = target.trim();
    const cleanLabel = (label ?? target).trim();
    return `<a class="md-wiki-link" data-wiki="${escapeHtml(cleanTarget)}" href="#">${escapeHtml(cleanLabel)}</a>`;
  });
}

export function renderMarkdown(source: string): RenderedMarkdown {
  const withWiki = linkWikiNotes(source);
  const protectedMath = protectMath(withWiki);
  const rawHtml = marked.parse(protectedMath.source, { async: false }) as string;
  // DOMPurify needs a DOM. In the browser it is always available; in a
  // non-DOM unit-test environment keep the raw, already-local render.
  let html = typeof DOMPurify.sanitize === 'function'
    ? DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ['target', 'rel', 'data-wiki', 'data-lang', 'checked', 'disabled', 'type'],
      FORBID_TAGS: ['style', 'script', 'iframe', 'form'],
    })
    : rawHtml;

  for (const expression of protectedMath.expressions) {
    const tokenPattern = new RegExp(`<p>\\s*${expression.token}\\s*</p>`, 'g');
    html = html.replace(tokenPattern, expression.html);
    html = html.split(expression.token).join(expression.html);
  }

  const outline: OutlineItem[] = [];
  let inFence = false;
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const text = match[2]
        .replace(/\$[^$]+\$/g, '')
        .replace(/[*_`~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();
      outline.push({
        id: `heading-${outline.length}`,
        level: match[1].length,
        text: text || '未命名标题',
      });
    }
  }

  const plain = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\$[^$]*\$/g, ' ')
    .replace(/[#>*_~\-[\]()!]/g, ' ');
  const chinese = (plain.match(/[\u3400-\u9fff]/g) ?? []).length;
  const latin = (plain.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g) ?? []).length;
  const words = chinese + latin;

  return {
    html,
    outline,
    words,
    readingMinutes: Math.max(1, Math.ceil(words / 300)),
  };
}

export function noteTitle(content: string, fallback = '未命名笔记'): string {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  for (const line of lines) {
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) return heading[1].replace(/[*_`~]/g, '').replace(/\$[^$]+\$/g, '').trim() || fallback;
  }
  const first = lines.find((line) => line.trim());
  if (!first) return fallback;
  return first.replace(/^[-*+>\s]+/, '').replace(/[*_`~]/g, '').trim().slice(0, 42) || fallback;
}

export function createNote(content = '# 未命名笔记\n\n'): Note {
  const now = Date.now();
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `note-${now}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    createdAt: now,
    updatedAt: now,
  };
}

export const DEFAULT_NOTE_CONTENT = `# 欢迎来到水鱼 Markdown

这是一个类似 Obsidian 的本地 Markdown 工作台。所有笔记只保存在当前浏览器。

## 快速开始

- [x] 在左侧新建或切换笔记
- [x] 使用工具栏插入标题、列表、代码和公式
- [ ] 试试把这篇笔记导出为 \`.md\`

> 提示：编辑器与预览区会同步滚动，预览中的任务列表、表格和代码都会保留格式。

## LaTeX

行内公式：$E = mc^2$

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}
$$

矩阵：

$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
$$

## 代码与表格

\`\`\`ts
type Note = {
  title: string;
  content: string;
};

const note: Note = {
  title: '水鱼 Markdown',
  content: '# Hello',
};
\`\`\`

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| Markdown | 支持 | GFM 表格、任务列表 |
| LaTeX | 支持 | KaTeX 行内与块级公式 |
| 本地保存 | 支持 | localStorage |
| 双向链接 | 支持 | 点击 [[项目清单]] 可以新建 |

## 双向链接

在笔记里写 \`[[项目清单]]\`，预览中会出现可点击的内部链接；如果目标笔记不存在，会自动创建。

## 引用

> 把复杂的事情做简单，把简单的事情做扎实。

---

最后，打开左侧的「项目清单」看看，或者新建一篇自己的笔记。
`;

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [createNote(DEFAULT_NOTE_CONTENT)];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [createNote(DEFAULT_NOTE_CONTENT)];
    const notes = parsed
      .filter((entry): entry is Note => Boolean(entry && typeof entry === 'object' && typeof (entry as Note).content === 'string'))
      .map((entry) => ({
        id: String(entry.id || `note-${Date.now()}`),
        content: String(entry.content),
        createdAt: Number(entry.createdAt) || Date.now(),
        updatedAt: Number(entry.updatedAt) || Date.now(),
      }));
    return notes.length ? notes : [createNote(DEFAULT_NOTE_CONTENT)];
  } catch {
    return [createNote(DEFAULT_NOTE_CONTENT)];
  }
}

export function saveNotes(notes: Note[]): boolean {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
}

export function loadActiveNoteId(notes: Note[]): string {
  try {
    const stored = localStorage.getItem(ACTIVE_KEY);
    if (stored && notes.some((note) => note.id === stored)) return stored;
  } catch {
    // ignore
  }
  return notes[0]?.id ?? '';
}

export function saveActiveNoteId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    // ignore
  }
}
