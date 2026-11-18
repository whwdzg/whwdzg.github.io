/** 专栏 / Long-form columns. */
export interface ColumnEntry {
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  excerpt: string;
  quote: string;
  body: string[];
  source: string;
  sourceLabel: string;
}

export const COLUMNS: ColumnEntry[] = [
  {
    slug: 'three-years',
    number: '001',
    title: '给自己三年时间',
    subtitle: 'B 站置顶动态 · 2025-07-31',
    date: '2025-07-31',
    readTime: '1 分钟',
    excerpt: '打算给自己三年时间搞一个项目，随时告吹的那种（',
    quote: '打算给自己三年时间搞一个项目，随时告吹的那种（',
    body: [
      '这是沧海水鱼在 2025 年 7 月 31 日发布、并置顶在 B 站空间的一条动态。全文只有一句话，括号没有闭合。',
      '没有项目名，没有路线图，也没有承诺。它更像一张留给未来的便条：先把三年交出去，再让项目自己长出形状。三年是很具体的期限，而“随时告吹”又把这个期限说得很轻。',
      '这篇专栏不替它补完括号里的内容。先把原话留在这里，等时间给出下文。',
    ],
    source: 'https://www.bilibili.com/opus/1095767533003210785',
    sourceLabel: 'B 站置顶动态 · 1095767533003210785',
  },
];

export function columnBySlug(slug: string): ColumnEntry | null {
  return COLUMNS.find((column) => column.slug === slug) ?? null;
}
