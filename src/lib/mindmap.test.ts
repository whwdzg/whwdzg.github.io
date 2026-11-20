import { describe, expect, it } from 'vitest';
import { layoutMindmap, parseMarkdown, updateNodeTitle } from './mindmap';

describe('mindmap markdown parser', () => {
  it('uses the first H1 as root and preserves numbered headings', () => {
    const root = parseMarkdown('# 总览\n## 1. 输入\n### 细节\n- 节点');
    expect(root.title).toBe('总览');
    expect(root.children[0].title).toBe('1. 输入');
    expect(root.children[0].children[0].title).toBe('细节');
    expect(root.children[0].children[0].children[0].title).toBe('节点');
  });

  it('keeps ordered-list numbers in the display label', () => {
    const root = parseMarkdown('# 根\n## 分支\n1. 第一条\n2. 第二条');
    const branch = root.children[0];
    expect(branch.children[0].marker).toBe('1.');
    expect(branch.children[1].marker).toBe('2.');
  });

  it('lays out every node with positive dimensions', () => {
    const root = parseMarkdown('# 根\n## 一\n- A\n  - B\n## 二\n- C');
    const layout = layoutMindmap(root);
    expect(layout.nodes).toHaveLength(6);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
    expect(layout.nodes.every((node) => node.width > 0 && node.height > 0)).toBe(true);
  });

  it('updates only the corresponding markdown line', () => {
    const source = '# 根\n## 1. 分支\n- 节点';
    const root = parseMarkdown(source);
    const node = root.children[0].children[0];
    expect(updateNodeTitle(source, node, '改名')).toBe('# 根\n## 1. 分支\n- 改名');
  });
});
