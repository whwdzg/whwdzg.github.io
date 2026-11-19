/**
 * GitHub 仓库快照 / GitHub repository snapshot.
 *
 * 由 scripts/sync-github.mjs 通过 GitHub API 生成；
 * 每天由 GitHub Actions 同步，页面不直接依赖匿名 API。
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

export interface GithubContributionDay {
  date: string;
  count: number;
  color: string;
}

export interface GithubContributionWeek {
  days: GithubContributionDay[];
}

export interface GithubProfileSnapshot {
  avatar: string;
  name: string;
  login: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  joined: string;
  location: string;
  blog: string;
  contributions: {
    total: number;
    weeks: GithubContributionWeek[];
  };
}

export const GITHUB_SYNCED_AT = "2026-11-19T16:51:20.614Z";

export const GITHUB_PROFILE: GithubProfileSnapshot = {
  "avatar": "https://avatars.githubusercontent.com/u/91038761?v=4",
  "name": "Alex Yang",
  "login": "whwdzg",
  "bio": "Just nobody.",
  "followers": 5,
  "following": 13,
  "publicRepos": 20,
  "totalStars": 16,
  "joined": "2021-09-20T01:30:29Z",
  "location": "Shanghai",
  "blog": "whwdzg.github.io",
  "contributions": {
    "total": 345,
    "weeks": [
      {
        "days": [
          {
            "date": "2025-11-16",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-17",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-18",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-19",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-20",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-21",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-22",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2025-11-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-24",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-25",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-27",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-28",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-11-29",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2025-11-30",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-02",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-03",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-04",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-05",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-06",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2025-12-07",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-08",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-09",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-10",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-11",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-12",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-13",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2025-12-14",
            "count": 16,
            "color": "#40c463"
          },
          {
            "date": "2025-12-15",
            "count": 13,
            "color": "#40c463"
          },
          {
            "date": "2025-12-16",
            "count": 3,
            "color": "#9be9a8"
          },
          {
            "date": "2025-12-17",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-18",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-19",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-20",
            "count": 4,
            "color": "#9be9a8"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2025-12-21",
            "count": 1,
            "color": "#9be9a8"
          },
          {
            "date": "2025-12-22",
            "count": 5,
            "color": "#9be9a8"
          },
          {
            "date": "2025-12-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-24",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-25",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-27",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2025-12-28",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-29",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-30",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2025-12-31",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-02",
            "count": 1,
            "color": "#9be9a8"
          },
          {
            "date": "2026-01-03",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-01-04",
            "count": 3,
            "color": "#9be9a8"
          },
          {
            "date": "2026-01-05",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-06",
            "count": 3,
            "color": "#9be9a8"
          },
          {
            "date": "2026-01-07",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-08",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-09",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-10",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-01-11",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-12",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-13",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-14",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-15",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-16",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-17",
            "count": 3,
            "color": "#9be9a8"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-01-18",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-19",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-20",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-21",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-22",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-24",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-01-25",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-27",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-28",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-29",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-30",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-01-31",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-02-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-02",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-03",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-04",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-05",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-06",
            "count": 1,
            "color": "#9be9a8"
          },
          {
            "date": "2026-02-07",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-02-08",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-09",
            "count": 3,
            "color": "#9be9a8"
          },
          {
            "date": "2026-02-10",
            "count": 1,
            "color": "#9be9a8"
          },
          {
            "date": "2026-02-11",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-12",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-13",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-14",
            "count": 3,
            "color": "#9be9a8"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-02-15",
            "count": 2,
            "color": "#9be9a8"
          },
          {
            "date": "2026-02-16",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-17",
            "count": 3,
            "color": "#9be9a8"
          },
          {
            "date": "2026-02-18",
            "count": 4,
            "color": "#9be9a8"
          },
          {
            "date": "2026-02-19",
            "count": 4,
            "color": "#9be9a8"
          },
          {
            "date": "2026-02-20",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-21",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-02-22",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-24",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-25",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-27",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-02-28",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-03-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-02",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-03",
            "count": 2,
            "color": "#9be9a8"
          },
          {
            "date": "2026-03-04",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-05",
            "count": 4,
            "color": "#9be9a8"
          },
          {
            "date": "2026-03-06",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-07",
            "count": 3,
            "color": "#9be9a8"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-03-08",
            "count": 3,
            "color": "#9be9a8"
          },
          {
            "date": "2026-03-09",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-10",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-11",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-12",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-13",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-14",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-03-15",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-16",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-17",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-18",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-19",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-20",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-21",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-03-22",
            "count": 2,
            "color": "#9be9a8"
          },
          {
            "date": "2026-03-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-24",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-25",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-27",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-28",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-03-29",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-30",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-03-31",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-02",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-03",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-04",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-04-05",
            "count": 5,
            "color": "#9be9a8"
          },
          {
            "date": "2026-04-06",
            "count": 3,
            "color": "#9be9a8"
          },
          {
            "date": "2026-04-07",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-08",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-09",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-10",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-11",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-04-12",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-13",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-14",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-15",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-16",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-17",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-18",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-04-19",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-20",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-21",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-22",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-24",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-25",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-04-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-27",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-04-28",
            "count": 1,
            "color": "#9be9a8"
          },
          {
            "date": "2026-04-29",
            "count": 4,
            "color": "#9be9a8"
          },
          {
            "date": "2026-04-30",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-02",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-05-03",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-04",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-05",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-06",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-07",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-08",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-09",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-05-10",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-11",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-12",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-13",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-14",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-15",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-16",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-05-17",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-18",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-19",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-20",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-21",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-22",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-23",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-05-24",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-25",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-27",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-28",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-29",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-05-30",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-05-31",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-02",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-03",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-04",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-05",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-06",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-06-07",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-08",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-09",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-10",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-11",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-12",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-13",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-06-14",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-15",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-16",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-17",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-18",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-19",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-20",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-06-21",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-22",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-24",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-25",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-27",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-06-28",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-29",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-06-30",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-02",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-03",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-04",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-07-05",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-06",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-07",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-08",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-09",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-10",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-11",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-07-12",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-13",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-14",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-15",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-16",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-17",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-18",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-07-19",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-20",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-21",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-22",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-24",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-25",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-07-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-27",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-28",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-29",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-30",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-07-31",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-01",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-08-02",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-03",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-04",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-05",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-06",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-07",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-08",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-08-09",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-10",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-11",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-12",
            "count": 14,
            "color": "#40c463"
          },
          {
            "date": "2026-08-13",
            "count": 33,
            "color": "#216e39"
          },
          {
            "date": "2026-08-14",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-15",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-08-16",
            "count": 1,
            "color": "#9be9a8"
          },
          {
            "date": "2026-08-17",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-18",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-19",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-20",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-21",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-22",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-08-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-24",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-25",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-27",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-28",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-29",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-08-30",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-08-31",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-02",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-03",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-04",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-05",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-09-06",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-07",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-08",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-09",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-10",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-11",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-12",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-09-13",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-14",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-15",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-16",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-17",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-18",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-19",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-09-20",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-21",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-22",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-24",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-25",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-26",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-09-27",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-28",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-29",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-09-30",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-02",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-03",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-10-04",
            "count": 1,
            "color": "#9be9a8"
          },
          {
            "date": "2026-10-05",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-06",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-07",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-08",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-09",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-10",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-10-11",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-12",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-13",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-14",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-15",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-16",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-17",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-10-18",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-19",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-20",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-21",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-22",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-23",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-24",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-10-25",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-26",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-27",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-28",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-29",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-30",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-10-31",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-11-01",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-11-02",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-11-03",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-11-04",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-11-05",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-11-06",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-11-07",
            "count": 0,
            "color": "#ebedf0"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-11-08",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-11-09",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-11-10",
            "count": 2,
            "color": "#9be9a8"
          },
          {
            "date": "2026-11-11",
            "count": 9,
            "color": "#9be9a8"
          },
          {
            "date": "2026-11-12",
            "count": 15,
            "color": "#40c463"
          },
          {
            "date": "2026-11-13",
            "count": 43,
            "color": "#216e39"
          },
          {
            "date": "2026-11-14",
            "count": 11,
            "color": "#40c463"
          }
        ]
      },
      {
        "days": [
          {
            "date": "2026-11-15",
            "count": 23,
            "color": "#30a14e"
          },
          {
            "date": "2026-11-16",
            "count": 0,
            "color": "#ebedf0"
          },
          {
            "date": "2026-11-17",
            "count": 10,
            "color": "#9be9a8"
          },
          {
            "date": "2026-11-18",
            "count": 37,
            "color": "#216e39"
          },
          {
            "date": "2026-11-19",
            "count": 40,
            "color": "#216e39"
          },
          {
            "date": "2026-11-20",
            "count": 6,
            "color": "#9be9a8"
          }
        ]
      }
    ]
  }
};

export const GITHUB_REPOS: GithubRepoSnapshot[] = [
  {
    "name": "whwdzg.github.io",
    "title": "本站源码",
    "role": "site",
    "url": "https://github.com/whwdzg/whwdzg.github.io",
    "description": "whwdzg's personal website ",
    "stars": 2,
    "forks": 0,
    "openIssues": 1,
    "language": "TypeScript",
    "updatedAt": "2026-11-16T17:14:31Z",
    "pushedAt": "2026-11-19T16:46:21Z",
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
    "pushedAt": "2026-11-18T16:16:53Z",
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
    "pushedAt": "2026-11-19T14:37:04Z",
    "archived": false
  },
  {
    "name": "Paligraph-Canvas",
    "title": "Paligraph Canvas",
    "role": "subsite",
    "url": "https://github.com/whwdzg/Paligraph-Canvas",
    "description": "A local-first Fluent Design notebook for ink, Markdown and Obsidian vaults.",
    "stars": 0,
    "forks": 0,
    "openIssues": 0,
    "language": "TypeScript",
    "updatedAt": "2026-11-19T15:58:37Z",
    "pushedAt": "2026-11-19T16:29:33Z",
    "archived": false
  }
];

export function githubRepo(name: string): GithubRepoSnapshot | undefined {
  return GITHUB_REPOS.find((repo) => repo.name.toLowerCase() === name.toLowerCase());
}
