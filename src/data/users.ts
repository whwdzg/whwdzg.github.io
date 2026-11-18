/** 用户资料 / Site user profiles mirrored from the 2.0 pages. */
export type UserSlug = 'canghaishuiyu' | 'hxhej';

export interface UserStat {
  label: string;
  value: string;
}

export interface UserProfile {
  slug: UserSlug;
  name: string;
  legacyName?: string;
  uid: number;
  joined: string;
  updated: string;
  avatar: string;
  tagline: string;
  summary: string;
  accent: string;
  bilibili: string;
  github?: string;
  stats: UserStat[];
  note: string;
}

export const USERS: Record<UserSlug, UserProfile> = {
  canghaishuiyu: {
    slug: 'canghaishuiyu',
    name: '沧海水鱼',
    legacyName: '滄海水魚',
    uid: 1,
    joined: '2022-08-06',
    updated: '2026-02-15',
    avatar: '/media/avatars/shuiyu.webp',
    tagline: '自信去尝试。不定期更新，一咕咕很久的那种。',
    summary:
      '沧海水鱼是本站作者，长期制作 Minecraft 数据包与 B 站影像。站外主页的签名是“自信去尝试”，简介写着“不定期更新，一咕咕很久的那种”；公开数据约有 233 个投稿、2,164 位粉丝和 18.3 万次获赞。站内的更好的合成配方、更好附魔、更好的生物掉落、魔法染料、Only Survival Mode 与 Glowing Players 都来自他的 Modrinth 项目。',
    accent: '#0078d4',
    bilibili: 'https://space.bilibili.com/588003657',
    github: 'https://github.com/whwdzg',
    stats: [
      { label: 'B 站投稿', value: '233' },
      { label: '粉丝', value: '2,164' },
      { label: '获赞', value: '18.3 万' },
      { label: 'Modrinth 项目', value: '6' },
    ],
    note: '站外资料来自哔哩哔哩公开主页，数据为整理时的快照。',
  },
  hxhej: {
    slug: 'hxhej',
    name: 'hxhej',
    uid: 2,
    joined: '2024-03-07',
    updated: '2026-02-15',
    avatar: '/media/avatars/hxhej.webp',
    tagline: "You can do anything you set your mind to' man",
    summary:
      'hxhej 是留言板最早出现的访客之一，站外 B 站账号的签名是“You can do anything you set your mind to\' man”。公开主页目前显示 1 个投稿、10 位粉丝和 55 次获赞，资料不多；在站内，他留下了几条早期留言，也是这个留言板最早的参与者之一。',
    accent: '#5b8cff',
    bilibili: 'https://space.bilibili.com/1642399671',
    stats: [
      { label: 'B 站投稿', value: '1' },
      { label: '粉丝', value: '10' },
      { label: '获赞', value: '55' },
      { label: '站内身份', value: 'UID 2' },
    ],
    note: '站外资料来自哔哩哔哩公开主页，数据为整理时的快照。',
  },
};

export function userBySlug(slug: string): UserProfile | null {
  return USERS[slug as UserSlug] ?? null;
}

export function userPath(slug: UserSlug): string {
  return `/user/${slug}/`;
}
