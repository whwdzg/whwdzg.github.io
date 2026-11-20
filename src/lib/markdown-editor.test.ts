import { describe, expect, it } from 'vitest';
import { noteTitle, renderMarkdown } from './markdown-editor';

describe('Markdown editor rendering', () => {
  it('renders inline and block LaTeX with KaTeX', () => {
    const result = renderMarkdown('# 公式\n\n$E=mc^2$\n\n$$\n\\frac{a}{b}\n$$');
    expect(result.html).toContain('katex');
    expect(result.html).not.toContain('MATHPLACEHOLDER');
  });

  it('converts wiki links into note links', () => {
    const result = renderMarkdown('查看 [[项目清单|清单]]');
    expect(result.html).toContain('data-wiki="项目清单"');
    expect(result.html).toContain('清单');
  });

  it('keeps GFM tables and task checkboxes', () => {
    const result = renderMarkdown('- [x] 完成\n\n| A | B |\n| - | - |\n| 1 | 2 |');
    expect(result.html).toContain('<table>');
    expect(result.html).toContain('type="checkbox"');
  });

  it('extracts outline headings and a title', () => {
    const source = '# 总标题\n\n## 小节\n\n内容';
    expect(noteTitle(source)).toBe('总标题');
    expect(renderMarkdown(source).outline.map((item) => item.text)).toEqual(['总标题', '小节']);
  });
});
