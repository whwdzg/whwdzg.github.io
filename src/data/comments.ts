/**
 * 留言板摘录 / Curated guestbook entries.
 *
 * 静态站没有服务端，留言通过 B 站私信收集后人工整理到这里。
 * 保留原话与回复关系；新增留言时在数组末尾追加即可。
 */
export interface CommentReply {
  author: string;
  avatar: string;
  date: string;
  text: string;
}

export interface CommentEntry {
  id: number;
  author: string;
  avatar: string;
  date: string;
  text: string;
  pinned?: boolean;
  reply?: CommentReply;
}

export const COMMENTS: CommentEntry[] = [
  {
    id: 1,
    author: '沧海水鱼',
    avatar: '/media/avatars/shuiyu.webp',
    date: '2024-03-07',
    text: '遣返提示！下面不只是人类！可能出现不明生物！',
    pinned: true,
  },
  {
    id: 2,
    author: 'hx_hej',
    avatar: '/media/avatars/hxhej.webp',
    date: '2024-03-07',
    text: '张小龙没妈。',
  },
  {
    id: 3,
    author: 'hx_hej',
    avatar: '/media/avatars/hxhej.webp',
    date: '2024-03-07',
    text: '傻逼冈易。',
    reply: {
      author: '沧海水鱼',
      avatar: '/media/avatars/shuiyu.webp',
      date: '2026-01-06',
      text: '按你要求修正你的留言了',
    },
  },
];

export const GUESTBOOK_META = {
  startedAt: '2024-03-07',
  updatedAt: '2026-01-06',
  nextArticle: {
    label: '下一篇：海绵宝宝 add-on',
    href: 'https://www.bilibili.com/opus/968748900391321609/',
  },
} as const;
