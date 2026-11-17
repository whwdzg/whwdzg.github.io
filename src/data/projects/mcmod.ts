/* 由 scripts/sync-mcmod.mjs 生成，请勿手动编辑。 */
export interface McmodEntry {
  slug: string;
  url: string;
  title: string;
  subtitle: string;
  status: string;
  views: number;
  viewsLabel: string;
  edits: number;
  lastEdit: string;
  tags: string;
  fetchedAt: string;
}

export const MCMOD_PROJECTS: McmodEntry[] = [
  {
    "slug": "better-crafting-recipes",
    "url": "https://www.mcmod.cn/class/17614.html",
    "title": "更好的合成配方",
    "subtitle": "Better Crafting Recipes",
    "status": "活跃 · 开源",
    "views": 21200,
    "viewsLabel": "2.12万",
    "edits": 10,
    "lastEdit": "8月前",
    "tags": "配方 合成辅助 合成 配方书",
    "fetchedAt": "2026-11-17T14:38:58.381Z"
  },
  {
    "slug": "better-enchantments",
    "url": "https://www.mcmod.cn/class/22543.html",
    "title": "更好附魔",
    "subtitle": "Better Enchantments",
    "status": "半弃坑 · 开源",
    "views": 8367,
    "viewsLabel": "8367",
    "edits": 6,
    "lastEdit": "5月前",
    "tags": "附魔",
    "fetchedAt": "2026-11-17T14:38:58.776Z"
  },
  {
    "slug": "better-mob-drop",
    "url": "https://www.mcmod.cn/class/17769.html",
    "title": "更好的生物掉落",
    "subtitle": "Better Mob Drop",
    "status": "停更 · 开源",
    "views": 36100,
    "viewsLabel": "3.61万",
    "edits": 10,
    "lastEdit": "1月前",
    "tags": "掉落物 掉落",
    "fetchedAt": "2026-11-17T14:38:59.157Z"
  }
];

export function mcmodProject(slug: string): McmodEntry | undefined {
  return MCMOD_PROJECTS.find((project) => project.slug === slug);
}
