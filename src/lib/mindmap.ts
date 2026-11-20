/** Markdown → mind map parsing and layout. */

export type MindNodeKind = 'root' | 'heading' | 'list';

export interface MindNode {
  id: string;
  title: string;
  kind: MindNodeKind;
  /** Original markdown line, used when editing a node. */
  line: number;
  /** Ordered-list marker such as "1." — shown but kept out of the editable title. */
  marker: string;
  /** Absolute heading/list depth from markdown. */
  depth: number;
  /** Visual depth from the root. */
  level: number;
  /** Top-level branch index, used for branch colours. */
  branch: number;
  children: MindNode[];
  width: number;
  height: number;
  x: number;
  y: number;
  subtreeHeight: number;
}

export interface MindEdge {
  from: MindNode;
  to: MindNode;
}

export interface MindLayout {
  root: MindNode;
  nodes: MindNode[];
  edges: MindEdge[];
  width: number;
  height: number;
  maxLevel: number;
}

const HEADING_RE = /^(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/;
const LIST_RE = /^([ \t]*)([-*+]|(\d+)[.)])[ \t]+(.*?)[ \t]*$/;
const NODE_GAP = 16;
const COLUMN_GAP = 58;
const PAD = 52;

function cleanTitle(value: string): string {
  return value
    .replace(/\s+#+\s*$/, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

export function nodeLabel(node: MindNode): string {
  if (node.marker && /^\d/.test(node.marker)) return `${node.marker} ${node.title}`;
  return node.title;
}

export function parseMarkdown(source: string): MindNode {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const root: MindNode = {
    id: 'root',
    title: '思维导图',
    kind: 'root',
    line: -1,
    marker: '',
    depth: 0,
    level: 0,
    branch: -1,
    children: [],
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    subtreeHeight: 0,
  };
  const stack: MindNode[] = [root];
  let headingDepth = 0;
  let rootHeadingChosen = false;
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    if (/^\s*(```|~~~)/.test(raw)) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !raw.trim()) continue;

    const heading = raw.match(HEADING_RE);
    if (heading) {
      const level = heading[1].length;
      const title = cleanTitle(heading[2]);
      if (!title) continue;
      if (!rootHeadingChosen && level === 1) {
        root.title = title;
        root.kind = 'root';
        root.line = index;
        rootHeadingChosen = true;
        headingDepth = 1;
        stack.length = 1;
        continue;
      }
      while (stack.length > 1 && stack[stack.length - 1].depth >= level) stack.pop();
      const node: MindNode = {
        id: `n${index}`,
        title,
        kind: 'heading',
        line: index,
        marker: '',
        depth: level,
        level: 0,
        branch: 0,
        children: [],
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        subtreeHeight: 0,
      };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
      headingDepth = level;
      continue;
    }

    const list = raw.match(LIST_RE);
    if (list) {
      const indent = list[1].replace(/\t/g, '  ').length;
      const marker = list[2];
      const title = cleanTitle(list[4]);
      if (!title) continue;
      const depth = (headingDepth || 1) + 1 + Math.floor(indent / 2);
      while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop();
      const node: MindNode = {
        id: `n${index}`,
        title,
        kind: 'list',
        line: index,
        marker,
        depth,
        level: 0,
        branch: 0,
        children: [],
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        subtreeHeight: 0,
      };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    }
  }

  assignStructure(root, 0, -1);
  return root;
}

function assignStructure(node: MindNode, level: number, branch: number): void {
  node.level = level;
  node.branch = branch;
  node.children.forEach((child, index) => {
    assignStructure(child, level + 1, level === 0 ? index : branch);
  });
}

function textLength(node: MindNode): number {
  const label = nodeLabel(node)
    .replace(/\$\$?([^$]+)\$\$?/g, '$1')
    .replace(/\s+/g, ' ');
  return Math.max(4, label.length);
}

function nodeWidth(level: number): number {
  return [286, 224, 198, 184, 172, 164][Math.min(level, 5)];
}

function nodeHeight(node: MindNode, width: number): number {
  const charsPerLine = Math.max(7, Math.floor((width - 28) / 13));
  const lines = Math.min(5, Math.max(1, Math.ceil(textLength(node) / charsPerLine)));
  return Math.max(40, lines * 19 + 17);
}

function measure(node: MindNode): number {
  node.width = nodeWidth(node.level);
  node.height = nodeHeight(node, node.width);
  if (!node.children.length) {
    node.subtreeHeight = node.height;
    return node.subtreeHeight;
  }
  const childrenHeight = node.children.reduce((sum, child) => sum + measure(child), 0) + NODE_GAP * (node.children.length - 1);
  node.subtreeHeight = Math.max(node.height, childrenHeight);
  return node.subtreeHeight;
}

function place(node: MindNode, x: number, top: number): void {
  node.x = x;
  node.y = top + node.subtreeHeight / 2 - node.height / 2;
  if (!node.children.length) return;
  const childrenHeight = node.children.reduce((sum, child) => sum + child.subtreeHeight, 0) + NODE_GAP * (node.children.length - 1);
  let childTop = top + (node.subtreeHeight - childrenHeight) / 2;
  for (const child of node.children) {
    place(child, x + node.width + COLUMN_GAP, childTop);
    childTop += child.subtreeHeight + NODE_GAP;
  }
}

export function layoutMindmap(root: MindNode): MindLayout {
  measure(root);
  place(root, PAD, PAD);
  const nodes: MindNode[] = [];
  const edges: MindEdge[] = [];
  let maxX = 0;
  let maxY = 0;
  const walk = (node: MindNode) => {
    nodes.push(node);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
    for (const child of node.children) {
      edges.push({ from: node, to: child });
      walk(child);
    }
  };
  walk(root);
  return {
    root,
    nodes,
    edges,
    width: Math.ceil(maxX + PAD),
    height: Math.ceil(maxY + PAD),
    maxLevel: nodes.reduce((max, node) => Math.max(max, node.level), 0),
  };
}

export function updateNodeTitle(markdown: string, node: MindNode, title: string): string {
  if (node.line < 0) return markdown;
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  if (node.line >= lines.length) return markdown;
  const next = title.trim();
  if (!next) return markdown;
  lines[node.line] = lines[node.line].replace(
    /^(\s*(?:#{1,6}|[-*+]|\d+[.)])\s+).*$/,
    (_match, prefix: string) => prefix + next,
  );
  return lines.join('\n');
}

export const DEFAULT_MARKDOWN = `# 站内工具路线图

## 1. 输入

### Markdown
- 支持标题与列表层级
- 数字编号会原样保留
- 双击节点可以反向编辑

### LaTeX
- 行内公式 $E = mc^2$
- 分式 $\\frac{a}{b}$
- 矩阵 $\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$

## 2. 样式

### 颜色
- 每个一级分支独立配色
- 可以切换整体主题

### 图形
- 根节点：胶囊
- 一级：圆角卡片
- 二级：切角
- 三级：下划线

## 3. 导出

### 图片
- PNG / JPEG / WebP / SVG
- 自动推荐分辨率

### PDF
- 横向或纵向自动排版
- 基于高清 PNG
`;
