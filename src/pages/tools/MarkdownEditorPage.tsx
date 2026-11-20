/** Obsidian-like local Markdown workbench. */
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  AddRegular,
  ArrowDownloadRegular,
  ArrowUploadRegular,
  CodeRegular,
  DeleteRegular,
  EyeRegular,
  LinkRegular,
  MathFormulaRegular,
  TextBulletListRegular,
  TextQuoteRegular,
} from '@fluentui/react-icons';
import 'katex/dist/katex.min.css';
import { PageIntro } from '../../components/layout/PageIntro';
import { Button } from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { copyText } from '../../lib/clipboard';
import {
  createNote,
  loadActiveNoteId,
  loadNotes,
  noteTitle,
  renderMarkdown,
  saveActiveNoteId,
  saveNotes,
  type Note,
} from '../../lib/markdown-editor';
import '../../styles/markdown-editor.css';

type PaneMode = 'split' | 'edit' | 'preview';

const TOOLBAR = [
  { label: 'H1', title: '一级标题', before: '# ', after: '', placeholder: '标题' },
  { label: 'H2', title: '二级标题', before: '## ', after: '', placeholder: '标题' },
  { label: 'B', title: '加粗', before: '**', after: '**', placeholder: '粗体' },
  { label: 'I', title: '斜体', before: '*', after: '*', placeholder: '斜体' },
  { label: '`', title: '行内代码', before: '`', after: '`', placeholder: 'code' },
  { label: '“”', title: '引用', before: '> ', after: '', placeholder: '引用' },
  { label: '•', title: '列表', before: '- ', after: '', placeholder: '列表项' },
  { label: '☑', title: '任务', before: '- [ ] ', after: '', placeholder: '任务' },
  { label: '🔗', title: '链接', before: '[', after: '](https://)', placeholder: '链接文字' },
  { label: '$', title: 'LaTeX', before: '$', after: '$', placeholder: 'E = mc^2' },
  { label: '▦', title: '表格', before: '\n| 列 1 | 列 2 |\n| --- | --- |\n| 内容 | 内容 |\n', after: '', placeholder: '' },
];

export default function MarkdownEditorPage() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [activeId, setActiveId] = useState('');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<PaneMode>('split');
  const [saveState, setSaveState] = useState<'saved' | 'error'>('saved');
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const scrollLock = useRef(false);

  const active = notes.find((note) => note.id === activeId) ?? notes[0];
  const content = active?.content ?? '';
  const deferredContent = useDeferredValue(content);
  const rendered = useMemo(() => renderMarkdown(deferredContent), [deferredContent]);

  const filteredNotes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!needle) return sorted;
    return sorted.filter((note) => {
      const title = noteTitle(note.content).toLowerCase();
      return title.includes(needle) || note.content.toLowerCase().includes(needle);
    });
  }, [notes, query]);

  useEffect(() => {
    if (!activeId) setActiveId(loadActiveNoteId(notes));
  }, [activeId, notes]);

  useEffect(() => {
    if (activeId) saveActiveNoteId(activeId);
  }, [activeId]);

  useEffect(() => {
    const ok = saveNotes(notes);
    setSaveState(ok ? 'saved' : 'error');
  }, [notes]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    preview.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
      heading.id = `md-heading-${index}`;
    });
    preview.querySelectorAll<HTMLPreElement>('pre').forEach((pre) => {
      if (pre.querySelector('.md-code-copy')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'md-code-copy';
      button.textContent = '复制';
      button.addEventListener('click', () => {
        void copyText(pre.querySelector('code')?.textContent ?? pre.textContent ?? '').then((ok) => {
          button.textContent = ok ? '已复制' : '失败';
          window.setTimeout(() => { button.textContent = '复制'; }, 1300);
        });
      });
      pre.appendChild(button);
    });
    preview.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((anchor) => {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    });
  }, [rendered.html]);

  const updateContent = (next: string) => {
    if (!active) return;
    setNotes((current) => current.map((note) => (
      note.id === active.id ? { ...note, content: next, updatedAt: Date.now() } : note
    )));
  };

  const newNote = () => {
    const note = createNote('# 未命名笔记\n\n');
    setNotes((current) => [note, ...current]);
    setActiveId(note.id);
    window.requestAnimationFrame(() => editorRef.current?.focus());
  };

  const deleteNote = (id: string) => {
    if (!window.confirm('删除这篇笔记？此操作不可撤销。')) return;
    setNotes((current) => {
      const remaining = current.filter((note) => note.id !== id);
      if (!remaining.length) {
        const empty = createNote('# 未命名笔记\n\n');
        setActiveId(empty.id);
        return [empty];
      }
      if (id === activeId) setActiveId(remaining[0].id);
      return remaining;
    });
  };

  const openWiki = (target: string) => {
    const existing = notes.find((note) => noteTitle(note.content) === target);
    if (existing) {
      setActiveId(existing.id);
      return;
    }
    const note = createNote(`# ${target}\n\n`);
    setNotes((current) => [note, ...current]);
    setActiveId(note.id);
    toast(`已创建「${target}」`, 'success');
  };

  const onPreviewClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const wiki = target.closest<HTMLElement>('.md-wiki-link');
    if (wiki) {
      event.preventDefault();
      openWiki(wiki.dataset.wiki ?? wiki.textContent ?? '未命名笔记');
    }
  };

  const applyFormat = (before: string, after: string, placeholder: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;
    updateContent(next);
    window.requestAnimationFrame(() => {
      editor.focus();
      const cursor = start + before.length + selected.length;
      editor.setSelectionRange(cursor, cursor);
    });
  };

  const onEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const editor = event.currentTarget;
      const start = editor.selectionStart;
      const next = `${content.slice(0, start)}  ${content.slice(editor.selectionEnd)}`;
      updateContent(next);
      window.requestAnimationFrame(() => editor.setSelectionRange(start + 2, start + 2));
      return;
    }
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === 'b') { event.preventDefault(); applyFormat('**', '**', '粗体'); }
    if (key === 'i') { event.preventDefault(); applyFormat('*', '*', '斜体'); }
    if (key === 'k') { event.preventDefault(); applyFormat('[', '](https://)', '链接文字'); }
  };

  const syncScroll = (source: 'editor' | 'preview') => {
    if (mode !== 'split' || scrollLock.current) return;
    const from = source === 'editor' ? editorRef.current : previewRef.current;
    const to = source === 'editor' ? previewRef.current : editorRef.current;
    if (!from || !to) return;
    const fromMax = from.scrollHeight - from.clientHeight;
    const toMax = to.scrollHeight - to.clientHeight;
    if (fromMax <= 0 || toMax <= 0) return;
    scrollLock.current = true;
    to.scrollTop = (from.scrollTop / fromMax) * toMax;
    window.requestAnimationFrame(() => { scrollLock.current = false; });
  };

  const exportNote = () => {
    if (!active) return;
    const title = noteTitle(active.content).replace(/[\\/:*?"<>|]/g, '-').slice(0, 80) || 'note';
    const blob = new Blob([active.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${title}.md`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('已导出 Markdown 文件', 'success');
  };

  const importNote = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const note = createNote(text || `# ${file.name.replace(/\.md$/i, '')}\n\n`);
      setNotes((current) => [note, ...current]);
      setActiveId(note.id);
      toast(`已导入 ${file.name}`, 'success');
    } catch {
      toast('导入失败', 'error');
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = '';
    }
  };

  const scrollToOutline = (index: number) => {
    const heading = previewRef.current?.querySelector<HTMLElement>(`#md-heading-${index}`);
    heading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page page--markdown-editor">
      <PageIntro
        eyebrow="TOOL · MARKDOWN"
        title="Markdown 编辑器"
        lead="类似 Obsidian 的本地笔记工作台：分栏编辑、实时预览、Markdown 表格与任务列表、KaTeX 公式、双向链接、导入导出。所有内容只保存在当前浏览器。"
        meta={[
          { icon: 'document', label: '本地笔记' },
          { icon: 'sparkle', label: 'LaTeX' },
          { icon: 'shield', label: '纯本地' },
        ]}
        actions={
          <>
            <Button variant="primary" icon={<AddRegular aria-hidden />} onClick={newNote}>新建笔记</Button>
            <Button variant="secondary" icon={<ArrowUploadRegular aria-hidden />} onClick={() => importRef.current?.click()} disabled={importing}>
              导入 .md
            </Button>
          </>
        }
      />

      <div className="container markdown-editor-shell">
        <input
          ref={importRef}
          className="md-import-input"
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importNote(file);
          }}
        />

        <aside className="md-notes" aria-label="笔记列表">
          <div className="md-notes__head">
            <div>
              <span className="eyebrow">NOTES</span>
              <strong>{notes.length} 篇</strong>
            </div>
            <button type="button" className="md-icon-button" aria-label="新建笔记" onClick={newNote}><AddRegular aria-hidden /></button>
          </div>
          <label className="md-search">
            <span className="sr-only">搜索笔记</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索笔记…" />
          </label>
          <div className="md-notes__list">
            {filteredNotes.map((note) => {
              const title = noteTitle(note.content);
              const excerpt = note.content
                .replace(/^#{1,6}\s+/gm, '')
                .replace(/[*_`>#]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 75);
              return (
                <div key={note.id} className={`md-note-item${note.id === active?.id ? ' is-active' : ''}`}>
                  <button type="button" className="md-note-item__open" onClick={() => setActiveId(note.id)}>
                    <strong>{title}</strong>
                    <span>{excerpt || '空白笔记'}</span>
                    <small>{new Date(note.updatedAt).toLocaleDateString()} · {note.content.length} 字符</small>
                  </button>
                  <button
                    type="button"
                    className="md-note-item__delete"
                    aria-label={`删除 ${title}`}
                    onClick={() => deleteNote(note.id)}
                  ><DeleteRegular aria-hidden /></button>
                </div>
              );
            })}
            {!filteredNotes.length && <p className="md-notes__empty">没有匹配的笔记</p>}
          </div>
          {rendered.outline.length > 0 && (
            <details className="md-outline">
              <summary>大纲 · {rendered.outline.length}</summary>
              <div>
                {rendered.outline.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    style={{ paddingLeft: 8 + (item.level - 1) * 10 }}
                    onClick={() => scrollToOutline(index)}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </details>
          )}
          <div className="md-notes__foot">
            <span className={saveState === 'error' ? 'is-error' : ''}>
              {saveState === 'error' ? '保存失败，存储空间可能已满' : '已自动保存到本地'}
            </span>
            <button type="button" className="text-button" onClick={exportNote} disabled={!active}>
              <ArrowDownloadRegular aria-hidden /> 导出
            </button>
          </div>
        </aside>

        <section className="md-workbench">
          <div className="md-workbench__bar">
            <div className="md-mode-toggle" role="group" aria-label="视图模式">
              <button type="button" className={mode === 'edit' ? 'is-active' : ''} onClick={() => setMode('edit')}><CodeRegular aria-hidden /> 编辑</button>
              <button type="button" className={mode === 'split' ? 'is-active' : ''} onClick={() => setMode('split')}>分栏</button>
              <button type="button" className={mode === 'preview' ? 'is-active' : ''} onClick={() => setMode('preview')}><EyeRegular aria-hidden /> 预览</button>
            </div>
            <div className="md-workbench__stats">
              <span>{rendered.words} 字</span>
              <span>{rendered.readingMinutes} 分钟阅读</span>
              <span>{content.split('\n').length} 行</span>
            </div>
          </div>

          <div className={`md-panes md-panes--${mode}`}>
            <div className="md-editor-pane">
              <div className="md-toolbar" role="toolbar" aria-label="Markdown 格式">
                {TOOLBAR.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    title={item.title}
                    aria-label={item.title}
                    onClick={() => applyFormat(item.before, item.after, item.placeholder)}
                  >
                    {item.label}
                  </button>
                ))}
                <span className="md-toolbar__divider" />
                <button type="button" title="引用块" aria-label="引用块" onClick={() => applyFormat('> ', '', '引用内容')}><TextQuoteRegular aria-hidden /></button>
                <button type="button" title="列表" aria-label="列表" onClick={() => applyFormat('- ', '', '列表项')}><TextBulletListRegular aria-hidden /></button>
                <button type="button" title="行内公式" aria-label="行内公式" onClick={() => applyFormat('$', '$', 'E = mc^2')}><MathFormulaRegular aria-hidden /></button>
                <button type="button" title="链接" aria-label="链接" onClick={() => applyFormat('[', '](https://)', '链接文字')}><LinkRegular aria-hidden /></button>
              </div>
              <textarea
                ref={editorRef}
                value={content}
                onChange={(event) => updateContent(event.target.value)}
                onKeyDown={onEditorKeyDown}
                onScroll={() => syncScroll('editor')}
                spellCheck={false}
                aria-label="Markdown 编辑器"
              />
              <div className="md-editor-pane__foot">
                <span>Tab 缩进 · Ctrl/⌘ B 加粗 · I 斜体 · K 链接</span>
                <span>{active ? noteTitle(active.content) : ''}</span>
              </div>
            </div>

            <div className="md-preview-pane">
              <div className="md-preview-pane__head">
                <span><EyeRegular aria-hidden /> 实时预览</span>
                <span>Markdown + KaTeX</span>
              </div>
              <div
                ref={previewRef}
                className="md-preview"
                onClick={onPreviewClick}
                onScroll={() => syncScroll('preview')}
                dangerouslySetInnerHTML={{ __html: rendered.html }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
