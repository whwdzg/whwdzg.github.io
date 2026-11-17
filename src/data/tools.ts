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
    subtitle: 'ClassWiz',
    description: '类 CASIO CN CW991 II 的操作逻辑，附函数图像与 LaTeX 导入导出。',
    path: '/tools/calculator/',
    icon: 'sparkle',
    accent: '#f59e0b',
    tag: '计算',
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
];

export function toolById(idOrPath: string): ToolItem | undefined {
  return TOOLS.find((tool) => tool.id === idOrPath || tool.path === idOrPath);
}
