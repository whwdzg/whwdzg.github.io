/** 工具索引 / Tool catalog. */
export interface ToolItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  path: string;
  icon: string;
  accent: string;
  tag: string;
}

export const TOOLS: ToolItem[] = [
  {
    id: 'base64',
    title: 'Base64 编解码',
    subtitle: 'Base64',
    description: 'Unicode 文本与 Base64 互转，支持 URL-safe。',
    path: '/tools/base64/',
    icon: 'code',
    accent: '#4f8cff',
    tag: '编码',
  },
  {
    id: 'basex',
    title: 'BaseX 编解码',
    subtitle: 'BaseX',
    description: 'Base16 / Base32 / Base58 / Base64 / Base85 / Base91 六种方案。',
    path: '/tools/basex/',
    icon: 'code',
    accent: '#8b5cf6',
    tag: '编码',
  },
  {
    id: 'base-convert',
    title: '进制转换',
    subtitle: 'Base Convert',
    description: '二进制、八进制、十进制、十六进制与任意 2–36 进制互转。',
    path: '/tools/base-convert/',
    icon: 'code',
    accent: '#0ea5e9',
    tag: '编码',
  },
  {
    id: 'unicode',
    title: 'Unicode 转换',
    subtitle: 'Unicode',
    description: '\\uXXXX / U+XXXX / HTML 实体与文本互转，查看码点表。',
    path: '/tools/unicode/',
    icon: 'document',
    accent: '#14b8a6',
    tag: '文本',
  },
  {
    id: 'calculator',
    title: '科学计算器',
    subtitle: '科学计算',
    description: '10 种模式、函数图像与 LaTeX，按键布局按本站习惯整理。',
    path: '/tools/calculator/',
    icon: 'sparkle',
    accent: '#f59e0b',
    tag: '计算',
  },
  {
    id: 'mc-datapack',
    title: 'MC 数据包解析',
    subtitle: 'Data Pack',
    description: '读取 pack.mcmeta，展示支持版本、命名空间与进度 / 配方 / 战利品表等内容。',
    path: '/tools/mc-datapack/',
    icon: 'storage',
    accent: '#4f9d69',
    tag: 'Minecraft',
  },
  {
    id: 'mc-resourcepack',
    title: 'MC 资源包解析',
    subtitle: 'Resource Pack',
    description: '读取资源包，展示支持版本、pack.png、命名空间与纹理 / 模型 / 语言等内容。',
    path: '/tools/mc-resourcepack/',
    icon: 'image',
    accent: '#3b82f6',
    tag: 'Minecraft',
  },
  {
    id: 'mc-projection',
    title: 'MC 投影查看器',
    subtitle: 'Projection',
    description: '导入 litematic / schematic，带方块模型、朝向与移动端控制。',
    path: '/tools/mc-projection/',
    icon: 'cube',
    accent: '#4f9d69',
    tag: 'Minecraft',
  },
  {
    id: 'markdown-mindmap',
    title: 'Markdown 思维导图',
    subtitle: 'Mindmap',
    description: 'Markdown 与思维导图双向实时同步，支持层级图形、分支配色、LaTeX 与高清导出。',
    path: '/tools/markdown-mindmap/',
    icon: 'sparkle',
    accent: '#8b5cf6',
    tag: '文本',
  },
  {
    id: 'ai-detect',
    title: 'AI 内容痕迹检查',
    subtitle: 'AI Trace',
    description: '检查文件元数据、文字 / 隐形水印、生成参数与写作惯用词，逐项给出 AI 线索判断。',
    path: '/tools/ai-detect/',
    icon: 'shield',
    accent: '#d16a4f',
    tag: '分析',
  },
  {
    id: 'markdown-editor',
    title: 'Markdown 编辑器',
    subtitle: 'Markdown Notes',
    description: '类似 Obsidian 的本地笔记工作台：分栏实时预览、KaTeX、表格、任务列表、双向链接与导入导出。',
    path: '/tools/markdown-editor/',
    icon: 'document',
    accent: '#5b8def',
    tag: '文本',
  },
];

export function toolById(idOrPath: string): ToolItem | undefined {
  return TOOLS.find((tool) => tool.id === idOrPath || tool.path === idOrPath);
}
