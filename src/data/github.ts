/**
 * GitHub 仓库快照 / GitHub repository snapshot.
 *
 * 由 scripts/sync-github.mjs 通过 GitHub API 生成；
 * 每小时由 GitHub Actions 同步，页面不直接依赖匿名 API。
 */
export interface GithubRepoSnapshot {
  name: string;
  title: string;
  role: 'site' | 'datapack' | 'subsite';
  url: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  updatedAt: string;
  pushedAt: string;
  archived: boolean;
}

export const GITHUB_SYNCED_AT = "2026-11-18T00:59:25.948Z";

export const GITHUB_REPOS: GithubRepoSnapshot[] = [
  {
    "name": "whwdzg.github.io",
    "title": "本站源码",
    "role": "site",
    "url": "https://github.com/whwdzg/whwdzg.github.io",
    "description": "whwdzg's personal website ",
    "stars": 2,
    "forks": 0,
    "openIssues": 0,
    "language": "TypeScript",
    "updatedAt": "2026-11-16T17:14:31Z",
    "pushedAt": "2026-11-17T17:34:54Z",
    "archived": false
  },
  {
    "name": "better-crafting-recipes",
    "title": "更好的合成配方",
    "role": "datapack",
    "url": "https://github.com/whwdzg/better-crafting-recipes",
    "description": "Formerly named whwdzg's Recipe Add some recipes to Minecraft",
    "stars": 2,
    "forks": 0,
    "openIssues": 1,
    "language": "mcfunction",
    "updatedAt": "2026-02-10T12:47:58Z",
    "pushedAt": "2026-11-16T14:23:59Z",
    "archived": false
  },
  {
    "name": "better-enchantments",
    "title": "更好附魔",
    "role": "datapack",
    "url": "https://github.com/whwdzg/better-enchantments",
    "description": "provide better vanilla enchantment effects to minecraft  ",
    "stars": 1,
    "forks": 0,
    "openIssues": 0,
    "language": "mcfunction",
    "updatedAt": "2025-10-15T11:26:08Z",
    "pushedAt": "2026-11-16T13:58:41Z",
    "archived": false
  },
  {
    "name": "better-mob-drop",
    "title": "更好的生物掉落",
    "role": "datapack",
    "url": "https://github.com/whwdzg/better-mob-drop",
    "description": "A Minecraft mod/data pack which provide more reasonable mob drop",
    "stars": 1,
    "forks": 0,
    "openIssues": 1,
    "language": "mcfunction",
    "updatedAt": "2025-10-06T12:10:08Z",
    "pushedAt": "2026-11-16T14:47:13Z",
    "archived": false
  },
  {
    "name": "Magical_Dye",
    "title": "魔法染料",
    "role": "datapack",
    "url": "https://github.com/whwdzg/Magical_Dye",
    "description": "Magical dye for dusts and mineral blocks. April Fools special present",
    "stars": 1,
    "forks": 0,
    "openIssues": 0,
    "language": "mcfunction",
    "updatedAt": "2025-03-02T09:04:37Z",
    "pushedAt": "2025-03-02T09:04:06Z",
    "archived": false
  },
  {
    "name": "only-survival-mode",
    "title": "Only Survival Mode",
    "role": "datapack",
    "url": "https://github.com/whwdzg/only-survival-mode",
    "description": "A Minecraft mod/datapack which only allow survival mode",
    "stars": 1,
    "forks": 0,
    "openIssues": 2,
    "language": "mcfunction",
    "updatedAt": "2026-11-15T14:11:26Z",
    "pushedAt": "2026-11-15T14:16:14Z",
    "archived": false
  },
  {
    "name": "glowing-players",
    "title": "Glowing Players",
    "role": "datapack",
    "url": "https://github.com/whwdzg/glowing-players",
    "description": "A Minecraft mod/datapack which will provide glowing effect to players.",
    "stars": 3,
    "forks": 0,
    "openIssues": 0,
    "language": "mcfunction",
    "updatedAt": "2026-11-15T14:11:07Z",
    "pushedAt": "2026-11-15T14:24:18Z",
    "archived": false
  },
  {
    "name": "Asteria-Player",
    "title": "Asteria Player",
    "role": "subsite",
    "url": "https://github.com/whwdzg/Asteria-Player",
    "description": "A web base music & video player",
    "stars": 1,
    "forks": 0,
    "openIssues": 0,
    "language": "TypeScript",
    "updatedAt": "2026-11-12T17:07:41Z",
    "pushedAt": "2026-11-15T14:04:40Z",
    "archived": false
  },
  {
    "name": "Life-Simulation-Wiki",
    "title": "来福 Simulation Wiki",
    "role": "subsite",
    "url": "https://github.com/whwdzg/Life-Simulation-Wiki",
    "description": "",
    "stars": 0,
    "forks": 0,
    "openIssues": 0,
    "language": "JavaScript",
    "updatedAt": "2026-08-15T16:11:57Z",
    "pushedAt": "2026-11-17T17:03:51Z",
    "archived": false
  }
];

export function githubRepo(name: string): GithubRepoSnapshot | undefined {
  return GITHUB_REPOS.find((repo) => repo.name.toLowerCase() === name.toLowerCase());
}
