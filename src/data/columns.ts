/** 专栏 / Long-form columns. */
export interface ColumnEmoji {
  src: string;
  alt: string;
  href: string;
}

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
  emoji?: ColumnEmoji;
  source: string;
  sourceLabel: string;
}

export const COLUMNS: ColumnEntry[] = [
  {
    slug: 'update-2026-11',
    number: '001',
    title: '关于更新&直播（26/11/8 更新版）',
    subtitle: 'B 站动态 · 编辑于 2026-11-08 14:22',
    date: '2026-11-08',
    readTime: '2 分钟',
    excerpt: '首先给不太认识的朋友介绍一下，这里是沧海水鱼（原 滄海水魚）……',
    quote: '关于更新&直播（26/11/8 更新版）',
    body: [
      '首先给不太认识的朋友介绍一下，这里是沧海水鱼（原 滄海水魚），主要搬运Minecraft官方账号的短视频内容，同时制作一些实用向数据包，并且在剪辑新系列（来福simulation系列）',
      '鉴于一些现生问题，接下来一年内本账号和数据包会进入缓慢维持状态，不保证更新时间和频率、不保证视频翻译、不保证自制内容发布、不保证数据包更新',
      '预计周六晚上会直播（但看具体情况）',
      '一年内的话主要就是偶尔搬运短视频内容，但不会进行翻译工作，总之就是更新会缓慢，短期内我会尽量每周末搬运一波，但这也得看情况了。如果你关注我了，也许，我是说也许也没必要取关，毕竟不定期更新，关注能第一时间看到，而且等我复活也是第一时间',
    ],
    emoji: {
      src: '/media/misc/chitao.png',
      alt: '吃桃',
      href: 'https://www.bilibili.com/h5/mall/digital-card/home?act_id=105435&hybrid_set_header=2&anchor_task=1&lottery_id=105438&navhide=1&f_source=garb&from=emoji&window_params=%7B%22type%22%3A5%2C%22id%22%3A%22105472%22%2C%22sub_id%22%3A%22%5B%E4%B8%9C%E6%96%B9%E6%94%B6%E8%97%8F%E9%9B%86%C2%B7%E6%B5%AE%E7%94%9F%E8%8B%A5%E6%A2%A6_%E5%90%83%E6%A1%83%5D%22%7D',
    },
    source: 'https://www.bilibili.com/opus/1248714561144487970',
    sourceLabel: 'B 站动态 · 1248714561144487970',
  },
];

export function columnBySlug(slug: string): ColumnEntry | null {
  return COLUMNS.find((column) => column.slug === slug) ?? null;
}
