/**
 * B 站视频合集数据 / Bilibili UGC season snapshot.
 *
 * 由 scripts/sync-bilibili-seasons.mjs 通过 B 站公开 view 接口生成。
 * 封面已下载到 public/media/bilibili/collections/<seasonId>/。
 * 重新生成：node --dns-result-order=ipv4first scripts/sync-bilibili-seasons.mjs
 */
export interface BilibiliCollectionEpisode {
  bvid: string;
  title: string;
  cover: string | null;
  coverAlt: string;
  date: string | null;
  durationSeconds: number | null;
  views: number | null;
  section: string;
  url: string;
}

export interface BilibiliCollectionSection {
  title: string;
  episodes: BilibiliCollectionEpisode[];
}

export interface BilibiliCollection {
  id: number;
  seasonId: number;
  videoBvid: string;
  title: string;
  description: string;
  cover: string | null;
  coverAlt: string;
  count: number;
  fetchedAt: string;
  sections: BilibiliCollectionSection[];
}

export const BILIBILI_COLLECTIONS: BilibiliCollection[] = [
  {
    "id": 1,
    "seasonId": 3513313,
    "videoBvid": "BV1tWvKe5E8p",
    "title": "Minecraft 官方短视频",
    "description": "长期搬运的Minecraft官方视频，搬运周期大约为半个月，新更新的视频暂时没有字幕翻译",
    "cover": "/media/bilibili/v01.webp",
    "coverAlt": "Minecraft 官方短视频",
    "count": 161,
    "fetchedAt": "2026-11-18T14:36:26.105Z",
    "sections": [
      {
        "title": "村民新闻联动",
        "episodes": [
          {
            "bvid": "BV1bk4MehEnz",
            "title": "【Minecraft x 村民新闻】重大新闻！危险的新生物",
            "cover": "/media/bilibili/collections/3513313/BV1bk4MehEnz.webp",
            "coverAlt": "【Minecraft x 村民新闻】重大新闻！危险的新生物",
            "date": "2024-10-02",
            "durationSeconds": 20,
            "views": 3390,
            "section": "村民新闻联动",
            "url": "https://www.bilibili.com/video/BV1bk4MehEnz/"
          },
          {
            "bvid": "BV1JE2FY9EdE",
            "title": "【Minecraft x 村民新闻】你看到那个新生物了吗？👀",
            "cover": "/media/bilibili/collections/3513313/BV1JE2FY9EdE.webp",
            "coverAlt": "【Minecraft x 村民新闻】你看到那个新生物了吗？👀",
            "date": "2024-10-06",
            "durationSeconds": 35,
            "views": 2403,
            "section": "村民新闻联动",
            "url": "https://www.bilibili.com/video/BV1JE2FY9EdE/"
          },
          {
            "bvid": "BV1hh5szuEgQ",
            "title": "【Minecraft x 村民新闻】在你身边是不是也发生这些事？",
            "cover": "/media/bilibili/collections/3513313/BV1hh5szuEgQ.webp",
            "coverAlt": "【Minecraft x 村民新闻】在你身边是不是也发生这些事？",
            "date": "2025-04-19",
            "durationSeconds": 52,
            "views": 4785,
            "section": "村民新闻联动",
            "url": "https://www.bilibili.com/video/BV1hh5szuEgQ/"
          }
        ]
      },
      {
        "title": "联动 DLC",
        "episodes": [
          {
            "bvid": "BV1zLfJY6Eiu",
            "title": "【Minecraft x Hello Kitty Friends】Minecraft x Hello Kitty® Friends 联动 DLC",
            "cover": "/media/bilibili/collections/3513313/BV1zLfJY6Eiu.webp",
            "coverAlt": "【Minecraft x Hello Kitty Friends】Minecraft x Hello Kitty® Friends 联动 DLC",
            "date": "2025-01-24",
            "durationSeconds": 21,
            "views": 1747,
            "section": "联动 DLC",
            "url": "https://www.bilibili.com/video/BV1zLfJY6Eiu/"
          }
        ]
      },
      {
        "title": "官方短视频",
        "episodes": [
          {
            "bvid": "BV17uiNefEQz",
            "title": "【Minecraft官方短视频】当你正学习如何使用重锤",
            "cover": "/media/bilibili/collections/3513313/BV17uiNefEQz.webp",
            "coverAlt": "【Minecraft官方短视频】当你正学习如何使用重锤",
            "date": "2024-08-02",
            "durationSeconds": 9,
            "views": 5791,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV17uiNefEQz/"
          },
          {
            "bvid": "BV1CEvaeCESm",
            "title": "【Minecraft官方短视频】15周年活动回顾",
            "cover": "/media/bilibili/collections/3513313/BV1CEvaeCESm.webp",
            "coverAlt": "【Minecraft官方短视频】15周年活动回顾",
            "date": "2024-08-01",
            "durationSeconds": 51,
            "views": 3126,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1CEvaeCESm/"
          },
          {
            "bvid": "BV1ievaeYE4N",
            "title": "【Minecraft官方短视频】你知道这些棘巧试炼更新中的音效吗？",
            "cover": "/media/bilibili/collections/3513313/BV1ievaeYE4N.webp",
            "coverAlt": "【Minecraft官方短视频】你知道这些棘巧试炼更新中的音效吗？",
            "date": "2024-08-01",
            "durationSeconds": 52,
            "views": 5195,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1ievaeYE4N/"
          },
          {
            "bvid": "BV171vbebEDW",
            "title": "【Minecraft官方短视频】你准备好了吗？",
            "cover": "/media/bilibili/collections/3513313/BV171vbebEDW.webp",
            "coverAlt": "【Minecraft官方短视频】你准备好了吗？",
            "date": "2024-08-01",
            "durationSeconds": 24,
            "views": 7819,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV171vbebEDW/"
          },
          {
            "bvid": "BV1o2vbeoE2F",
            "title": "【Minecraft官方短视频】你能猜到这是什么生物吗？",
            "cover": "/media/bilibili/collections/3513313/BV1o2vbeoE2F.webp",
            "coverAlt": "【Minecraft官方短视频】你能猜到这是什么生物吗？",
            "date": "2024-08-01",
            "durationSeconds": 31,
            "views": 2609,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1o2vbeoE2F/"
          },
          {
            "bvid": "BV1KVvCemE6n",
            "title": "【Minecraft官方短视频】你在棘巧试炼更新中踩了多少坑？",
            "cover": "/media/bilibili/collections/3513313/BV1KVvCemE6n.webp",
            "coverAlt": "【Minecraft官方短视频】你在棘巧试炼更新中踩了多少坑？",
            "date": "2024-07-30",
            "durationSeconds": 30,
            "views": 6745,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1KVvCemE6n/"
          },
          {
            "bvid": "BV19zvCeZEFL",
            "title": "【Minecraft官方短视频】你是Minecraft专家吗？",
            "cover": "/media/bilibili/collections/3513313/BV19zvCeZEFL.webp",
            "coverAlt": "【Minecraft官方短视频】你是Minecraft专家吗？",
            "date": "2024-07-30",
            "durationSeconds": 37,
            "views": 19128,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV19zvCeZEFL/"
          },
          {
            "bvid": "BV1gmvCeWES2",
            "title": "【Minecraft官方短视频】当你第一次来到深暗之域",
            "cover": "/media/bilibili/collections/3513313/BV1gmvCeWES2.webp",
            "coverAlt": "【Minecraft官方短视频】当你第一次来到深暗之域",
            "date": "2024-07-30",
            "durationSeconds": 12,
            "views": 39387,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1gmvCeWES2/"
          },
          {
            "bvid": "BV17avCeeE7f",
            "title": "【Minecraft官方短视频】Jeb竞猜",
            "cover": "/media/bilibili/collections/3513313/BV17avCeeE7f.webp",
            "coverAlt": "【Minecraft官方短视频】Jeb竞猜",
            "date": "2024-07-30",
            "durationSeconds": 28,
            "views": 7523,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV17avCeeE7f/"
          },
          {
            "bvid": "BV13fv6eEERz",
            "title": "【Minecraft官方短视频】为你的朋友命名",
            "cover": "/media/bilibili/collections/3513313/BV13fv6eEERz.webp",
            "coverAlt": "【Minecraft官方短视频】为你的朋友命名",
            "date": "2024-07-30",
            "durationSeconds": 28,
            "views": 6392,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV13fv6eEERz/"
          },
          {
            "bvid": "BV1Vdv6enEU5",
            "title": "【Minecraft官方短视频】相信我这是真的",
            "cover": "/media/bilibili/collections/3513313/BV1Vdv6enEU5.webp",
            "coverAlt": "【Minecraft官方短视频】相信我这是真的",
            "date": "2024-07-30",
            "durationSeconds": 9,
            "views": 8436,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1Vdv6enEU5/"
          },
          {
            "bvid": "BV1Aiv6eNEg8",
            "title": "【Minecraft官方短视频】当你错过了最后",
            "cover": "/media/bilibili/collections/3513313/BV1Aiv6eNEg8.webp",
            "coverAlt": "【Minecraft官方短视频】当你错过了最后",
            "date": "2024-07-30",
            "durationSeconds": 15,
            "views": 166417,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1Aiv6eNEg8/"
          },
          {
            "bvid": "BV172v6e4EgB",
            "title": "【Minecraft官方短视频】测试一下你的合成技术？",
            "cover": "/media/bilibili/collections/3513313/BV172v6e4EgB.webp",
            "coverAlt": "【Minecraft官方短视频】测试一下你的合成技术？",
            "date": "2024-07-30",
            "durationSeconds": 25,
            "views": 35072,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV172v6e4EgB/"
          },
          {
            "bvid": "BV1TsvKeyEJR",
            "title": "【Minecraft官方短视频】你是怎么玩Minecraft的?",
            "cover": "/media/bilibili/collections/3513313/BV1TsvKeyEJR.webp",
            "coverAlt": "【Minecraft官方短视频】你是怎么玩Minecraft的?",
            "date": "2024-07-29",
            "durationSeconds": 31,
            "views": 33511,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1TsvKeyEJR/"
          },
          {
            "bvid": "BV1tWvKe5E8p",
            "title": "【Minecraft官方短视频】是敌是友?",
            "cover": "/media/bilibili/collections/3513313/BV1tWvKe5E8p.webp",
            "coverAlt": "【Minecraft官方短视频】是敌是友?",
            "date": "2024-07-29",
            "durationSeconds": 24,
            "views": 229794,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1tWvKe5E8p/"
          },
          {
            "bvid": "BV1ZMiNebErN",
            "title": "【Minecraft官方短视频】你认识这种生物吗？",
            "cover": "/media/bilibili/collections/3513313/BV1ZMiNebErN.webp",
            "coverAlt": "【Minecraft官方短视频】你认识这种生物吗？",
            "date": "2024-08-02",
            "durationSeconds": 30,
            "views": 78809,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1ZMiNebErN/"
          },
          {
            "bvid": "BV1dtY4e5EZs",
            "title": "【Minecraft官方短视频】鸡的一天！",
            "cover": "/media/bilibili/collections/3513313/BV1dtY4e5EZs.webp",
            "coverAlt": "【Minecraft官方短视频】鸡的一天！",
            "date": "2024-08-08",
            "durationSeconds": 35,
            "views": 2952,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1dtY4e5EZs/"
          },
          {
            "bvid": "BV1ZpY4emEfA",
            "title": "【Minecraft官方短视频】这你怎么解释？",
            "cover": "/media/bilibili/collections/3513313/BV1ZpY4emEfA.webp",
            "coverAlt": "【Minecraft官方短视频】这你怎么解释？",
            "date": "2024-08-08",
            "durationSeconds": 21,
            "views": 2737,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1ZpY4emEfA/"
          },
          {
            "bvid": "BV1TbYzeAE6s",
            "title": "【Minecraft官方短视频】我们都有一个这样的朋友......",
            "cover": "/media/bilibili/collections/3513313/BV1TbYzeAE6s.webp",
            "coverAlt": "【Minecraft官方短视频】我们都有一个这样的朋友......",
            "date": "2024-08-13",
            "durationSeconds": 16,
            "views": 86003,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1TbYzeAE6s/"
          },
          {
            "bvid": "BV19npRe4EbQ",
            "title": "【Minecraft官方短视频】新物品：收纳袋！",
            "cover": "/media/bilibili/collections/3513313/BV19npRe4EbQ.webp",
            "coverAlt": "【Minecraft官方短视频】新物品：收纳袋！",
            "date": "2024-08-17",
            "durationSeconds": 27,
            "views": 4774,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV19npRe4EbQ/"
          },
          {
            "bvid": "BV1sypmeZEeV",
            "title": "【Minecraft官方短视频】这是谁的视角？",
            "cover": "/media/bilibili/collections/3513313/BV1sypmeZEeV.webp",
            "coverAlt": "【Minecraft官方短视频】这是谁的视角？",
            "date": "2024-08-19",
            "durationSeconds": 30,
            "views": 2040,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1sypmeZEeV/"
          },
          {
            "bvid": "BV16PWSeoEac",
            "title": "【Minecraft官方短视频】你是试炼密室中的哪一个？",
            "cover": "/media/bilibili/collections/3513313/BV16PWSeoEac.webp",
            "coverAlt": "【Minecraft官方短视频】你是试炼密室中的哪一个？",
            "date": "2024-08-23",
            "durationSeconds": 42,
            "views": 21605,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV16PWSeoEac/"
          },
          {
            "bvid": "BV1LdWBepExy",
            "title": "【Minecraft官方短视频】这些Minecraft音效是如何制作的",
            "cover": "/media/bilibili/collections/3513313/BV1LdWBepExy.webp",
            "coverAlt": "【Minecraft官方短视频】这些Minecraft音效是如何制作的",
            "date": "2024-08-25",
            "durationSeconds": 35,
            "views": 2657,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1LdWBepExy/"
          },
          {
            "bvid": "BV1ASsNeGEWu",
            "title": "【Minecraft官方短视频】你还记得这种感觉吗？",
            "cover": "/media/bilibili/collections/3513313/BV1ASsNeGEWu.webp",
            "coverAlt": "【Minecraft官方短视频】你还记得这种感觉吗？",
            "date": "2024-08-28",
            "durationSeconds": 13,
            "views": 11458,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1ASsNeGEWu/"
          },
          {
            "bvid": "BV1NwndekErW",
            "title": "【Minecraft官方短视频】最令人紧张的时刻",
            "cover": "/media/bilibili/collections/3513313/BV1NwndekErW.webp",
            "coverAlt": "【Minecraft官方短视频】最令人紧张的时刻",
            "date": "2024-08-31",
            "durationSeconds": 34,
            "views": 8554,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1NwndekErW/"
          },
          {
            "bvid": "BV19rpgeNEL9",
            "title": "【Minecraft官方短视频】哪个武器是你的最爱？",
            "cover": "/media/bilibili/collections/3513313/BV19rpgeNEL9.webp",
            "coverAlt": "【Minecraft官方短视频】哪个武器是你的最爱？",
            "date": "2024-09-05",
            "durationSeconds": 42,
            "views": 48786,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV19rpgeNEL9/"
          },
          {
            "bvid": "BV1W8pteiEvb",
            "title": "【Minecraft官方短视频】你还会继续吗？",
            "cover": "/media/bilibili/collections/3513313/BV1W8pteiEvb.webp",
            "coverAlt": "【Minecraft官方短视频】你还会继续吗？",
            "date": "2024-09-07",
            "durationSeconds": 23,
            "views": 29165,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1W8pteiEvb/"
          },
          {
            "bvid": "BV1nepqeREr8",
            "title": "【Minecraft官方短视频】获取钻石的最好方法",
            "cover": "/media/bilibili/collections/3513313/BV1nepqeREr8.webp",
            "coverAlt": "【Minecraft官方短视频】获取钻石的最好方法",
            "date": "2024-09-08",
            "durationSeconds": 6,
            "views": 2646,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1nepqeREr8/"
          },
          {
            "bvid": "BV1dF4ze8EeH",
            "title": "【Minecraft官方短视频】我会记住你的",
            "cover": "/media/bilibili/collections/3513313/BV1dF4ze8EeH.webp",
            "coverAlt": "【Minecraft官方短视频】我会记住你的",
            "date": "2024-09-11",
            "durationSeconds": 12,
            "views": 7254,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1dF4ze8EeH/"
          },
          {
            "bvid": "BV1LcteeEEqM",
            "title": "【Minecraft官方短视频】你能找出10个不合理之处吗？",
            "cover": "/media/bilibili/collections/3513313/BV1LcteeEEqM.webp",
            "coverAlt": "【Minecraft官方短视频】你能找出10个不合理之处吗？",
            "date": "2024-09-17",
            "durationSeconds": 25,
            "views": 73861,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1LcteeEEqM/"
          },
          {
            "bvid": "BV1c7bFeYEiL",
            "title": "【Minecraft官方短视频】别忘了Minecraft Live的日子",
            "cover": "/media/bilibili/collections/3513313/BV1c7bFeYEiL.webp",
            "coverAlt": "【Minecraft官方短视频】别忘了Minecraft Live的日子",
            "date": "2024-09-20",
            "durationSeconds": 16,
            "views": 1816,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1c7bFeYEiL/"
          },
          {
            "bvid": "BV1pqtBegEAB",
            "title": "【Minecraft官方短视频】染色收纳袋现已推出！",
            "cover": "/media/bilibili/collections/3513313/BV1pqtBegEAB.webp",
            "coverAlt": "【Minecraft官方短视频】染色收纳袋现已推出！",
            "date": "2024-09-21",
            "durationSeconds": 44,
            "views": 4155,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1pqtBegEAB/"
          },
          {
            "bvid": "BV1pSsUecE6m",
            "title": "【Minecraft官方短视频】真或假？",
            "cover": "/media/bilibili/collections/3513313/BV1pSsUecE6m.webp",
            "coverAlt": "【Minecraft官方短视频】真或假？",
            "date": "2024-09-23",
            "durationSeconds": 60,
            "views": 7484,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1pSsUecE6m/"
          },
          {
            "bvid": "BV1uBxFeMErm",
            "title": "【Minecraft官方短视频】人都去哪了？",
            "cover": "/media/bilibili/collections/3513313/BV1uBxFeMErm.webp",
            "coverAlt": "【Minecraft官方短视频】人都去哪了？",
            "date": "2024-09-27",
            "durationSeconds": 20,
            "views": 16148,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1uBxFeMErm/"
          },
          {
            "bvid": "BV1bBxFeMES1",
            "title": "【Minecraft官方短视频】你准备好迎接Minecraft Live了吗？",
            "cover": "/media/bilibili/collections/3513313/BV1bBxFeMES1.webp",
            "coverAlt": "【Minecraft官方短视频】你准备好迎接Minecraft Live了吗？",
            "date": "2024-09-27",
            "durationSeconds": 23,
            "views": 3270,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1bBxFeMES1/"
          },
          {
            "bvid": "BV1VExNe4Era",
            "title": "【Minecraft官方短视频】我猜你不知道",
            "cover": "/media/bilibili/collections/3513313/BV1VExNe4Era.webp",
            "coverAlt": "【Minecraft官方短视频】我猜你不知道",
            "date": "2024-09-28",
            "durationSeconds": 14,
            "views": 5709,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1VExNe4Era/"
          },
          {
            "bvid": "BV1GWxDeDEwP",
            "title": "【Minecraft官方短视频】现在就去看看新的苍白园林吧！",
            "cover": "/media/bilibili/collections/3513313/BV1GWxDeDEwP.webp",
            "coverAlt": "【Minecraft官方短视频】现在就去看看新的苍白园林吧！",
            "date": "2024-10-03",
            "durationSeconds": 33,
            "views": 3343,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1GWxDeDEwP/"
          },
          {
            "bvid": "BV1Vj2AYXEby",
            "title": "【Minecraft官方短视频】我真不是这个意思！🤦",
            "cover": "/media/bilibili/collections/3513313/BV1Vj2AYXEby.webp",
            "coverAlt": "【Minecraft官方短视频】我真不是这个意思！🤦",
            "date": "2024-10-09",
            "durationSeconds": 12,
            "views": 33593,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1Vj2AYXEby/"
          },
          {
            "bvid": "BV1qAC2YzEnM",
            "title": "【Minecraft官方短视频】你认识这些Minecraft音效吗？#4",
            "cover": "/media/bilibili/collections/3513313/BV1qAC2YzEnM.webp",
            "coverAlt": "【Minecraft官方短视频】你认识这些Minecraft音效吗？#4",
            "date": "2024-10-18",
            "durationSeconds": 59,
            "views": 4329,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1qAC2YzEnM/"
          },
          {
            "bvid": "BV1DeC1YbEEw",
            "title": "【Minecraft官方短视频】找出10个错误",
            "cover": "/media/bilibili/collections/3513313/BV1DeC1YbEEw.webp",
            "coverAlt": "【Minecraft官方短视频】找出10个错误",
            "date": "2024-10-18",
            "durationSeconds": 16,
            "views": 80734,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1DeC1YbEEw/"
          },
          {
            "bvid": "BV1hYC1YcEfq",
            "title": "【Minecraft官方短视频】你会得到哪种药水？",
            "cover": "/media/bilibili/collections/3513313/BV1hYC1YcEfq.webp",
            "coverAlt": "【Minecraft官方短视频】你会得到哪种药水？",
            "date": "2024-10-18",
            "durationSeconds": 55,
            "views": 14911,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1hYC1YcEfq/"
          },
          {
            "bvid": "BV1EcyaYBEHj",
            "title": "【Minecraft官方短视频】我做了哪些Minecraft音效？",
            "cover": "/media/bilibili/collections/3513313/BV1EcyaYBEHj.webp",
            "coverAlt": "【Minecraft官方短视频】我做了哪些Minecraft音效？",
            "date": "2024-10-20",
            "durationSeconds": 58,
            "views": 13271,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1EcyaYBEHj/"
          },
          {
            "bvid": "BV1oByUY7EcS",
            "title": "【Minecraft官方短视频】新花朵！",
            "cover": "/media/bilibili/collections/3513313/BV1oByUY7EcS.webp",
            "coverAlt": "【Minecraft官方短视频】新花朵！",
            "date": "2024-10-25",
            "durationSeconds": 22,
            "views": 11800,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1oByUY7EcS/"
          },
          {
            "bvid": "BV1zz1LYhEaF",
            "title": "【Minecraft官方短视频】Minecraft新方块！现在就去试试吧！",
            "cover": "/media/bilibili/collections/3513313/BV1zz1LYhEaF.webp",
            "coverAlt": "【Minecraft官方短视频】Minecraft新方块！现在就去试试吧！",
            "date": "2024-10-28",
            "durationSeconds": 26,
            "views": 10168,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1zz1LYhEaF/"
          },
          {
            "bvid": "BV1RYSRYkE1X",
            "title": "【Minecraft官方短视频】15秒内你能猜到这个生物吗？",
            "cover": "/media/bilibili/collections/3513313/BV1RYSRYkE1X.webp",
            "coverAlt": "【Minecraft官方短视频】15秒内你能猜到这个生物吗？",
            "date": "2024-11-01",
            "durationSeconds": 21,
            "views": 3575,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1RYSRYkE1X/"
          },
          {
            "bvid": "BV135DqYdE6k",
            "title": "【Minecraft官方短视频】当你在Minecraft里迷路了",
            "cover": "/media/bilibili/collections/3513313/BV135DqYdE6k.webp",
            "coverAlt": "【Minecraft官方短视频】当你在Minecraft里迷路了",
            "date": "2024-11-09",
            "durationSeconds": 28,
            "views": 14703,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV135DqYdE6k/"
          },
          {
            "bvid": "BV1VZDzYNEF4",
            "title": "【Minecraft官方短视频】这是谁的视角？",
            "cover": "/media/bilibili/collections/3513313/BV1VZDzYNEF4.webp",
            "coverAlt": "【Minecraft官方短视频】这是谁的视角？",
            "date": "2024-11-09",
            "durationSeconds": 31,
            "views": 41422,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1VZDzYNEF4/"
          },
          {
            "bvid": "BV19dDzYvELo",
            "title": "【Minecraft官方短视频】你的小金库里都有啥？",
            "cover": "/media/bilibili/collections/3513313/BV19dDzYvELo.webp",
            "coverAlt": "【Minecraft官方短视频】你的小金库里都有啥？",
            "date": "2024-11-09",
            "durationSeconds": 23,
            "views": 13291,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV19dDzYvELo/"
          },
          {
            "bvid": "BV1vmBiYcEY4",
            "title": "【Minecraft官方短视频】极限生存之旅完结！",
            "cover": "/media/bilibili/collections/3513313/BV1vmBiYcEY4.webp",
            "coverAlt": "【Minecraft官方短视频】极限生存之旅完结！",
            "date": "2024-11-22",
            "durationSeconds": 13,
            "views": 99981,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1vmBiYcEY4/"
          },
          {
            "bvid": "BV1YSBiYfEvs",
            "title": "【Minecraft官方短视频】你的第一天是什么样的",
            "cover": "/media/bilibili/collections/3513313/BV1YSBiYfEvs.webp",
            "coverAlt": "【Minecraft官方短视频】你的第一天是什么样的",
            "date": "2024-11-22",
            "durationSeconds": 30,
            "views": 6411,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1YSBiYfEvs/"
          },
          {
            "bvid": "BV19gBiY4E3R",
            "title": "【Minecraft官方短视频】你能猜出这是Minecraft中的什么音效吗？ #5",
            "cover": "/media/bilibili/collections/3513313/BV19gBiY4E3R.webp",
            "coverAlt": "【Minecraft官方短视频】你能猜出这是Minecraft中的什么音效吗？ #5",
            "date": "2024-11-22",
            "durationSeconds": 49,
            "views": 5052,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV19gBiY4E3R/"
          },
          {
            "bvid": "BV19tB2YREkp",
            "title": "【Minecraft官方短视频】能赢吗？",
            "cover": "/media/bilibili/collections/3513313/BV19tB2YREkp.webp",
            "coverAlt": "【Minecraft官方短视频】能赢吗？",
            "date": "2024-11-23",
            "durationSeconds": 61,
            "views": 3738,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV19tB2YREkp/"
          },
          {
            "bvid": "BV1F7znY8EPY",
            "title": "【Minecraft官方短视频】新版本名称与更新日期！",
            "cover": "/media/bilibili/collections/3513313/BV1F7znY8EPY.webp",
            "coverAlt": "【Minecraft官方短视频】新版本名称与更新日期！",
            "date": "2024-11-30",
            "durationSeconds": 31,
            "views": 1869,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1F7znY8EPY/"
          },
          {
            "bvid": "BV1LCzJYXEXY",
            "title": "【Minecraft官方短视频】你见过这些Minecraft中的方块吗？",
            "cover": "/media/bilibili/collections/3513313/BV1LCzJYXEXY.webp",
            "coverAlt": "【Minecraft官方短视频】你见过这些Minecraft中的方块吗？",
            "date": "2024-11-30",
            "durationSeconds": 60,
            "views": 10672,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1LCzJYXEXY/"
          },
          {
            "bvid": "BV1QcqdYgEez",
            "title": "【Minecraft官方短视频】友谊守护者？",
            "cover": "/media/bilibili/collections/3513313/BV1QcqdYgEez.webp",
            "coverAlt": "【Minecraft官方短视频】友谊守护者？",
            "date": "2024-12-15",
            "durationSeconds": 20,
            "views": 8800,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1QcqdYgEez/"
          },
          {
            "bvid": "BV1DPqdYMEut",
            "title": "【Minecraft官方短视频】别在Minecraft里这么做！",
            "cover": "/media/bilibili/collections/3513313/BV1DPqdYMEut.webp",
            "coverAlt": "【Minecraft官方短视频】别在Minecraft里这么做！",
            "date": "2024-12-15",
            "durationSeconds": 44,
            "views": 39406,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1DPqdYMEut/"
          },
          {
            "bvid": "BV1bDqZYyEU9",
            "title": "【Minecraft官方短视频】你是怎么玩Minecraft的？",
            "cover": "/media/bilibili/collections/3513313/BV1bDqZYyEU9.webp",
            "coverAlt": "【Minecraft官方短视频】你是怎么玩Minecraft的？",
            "date": "2024-12-15",
            "durationSeconds": 25,
            "views": 9414,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1bDqZYyEU9/"
          },
          {
            "bvid": "BV1ZDkdYeEZX",
            "title": "【Minecraft官方短视频】阵亡之歌",
            "cover": "/media/bilibili/collections/3513313/BV1ZDkdYeEZX.webp",
            "coverAlt": "【Minecraft官方短视频】阵亡之歌",
            "date": "2024-12-24",
            "durationSeconds": 46,
            "views": 8911,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1ZDkdYeEZX/"
          },
          {
            "bvid": "BV1RFChYxETn",
            "title": "【Minecraft官方短视频】你自认为对生物很了解吗？来猜猜试试",
            "cover": "/media/bilibili/collections/3513313/BV1RFChYxETn.webp",
            "coverAlt": "【Minecraft官方短视频】你自认为对生物很了解吗？来猜猜试试",
            "date": "2024-12-28",
            "durationSeconds": 30,
            "views": 58009,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1RFChYxETn/"
          },
          {
            "bvid": "BV1RZC8YoEUg",
            "title": "【Minecraft官方短视频】准备好烹饪了吗？快来试试熔岩烤鸡AddOn！",
            "cover": "/media/bilibili/collections/3513313/BV1RZC8YoEUg.webp",
            "coverAlt": "【Minecraft官方短视频】准备好烹饪了吗？快来试试熔岩烤鸡AddOn！",
            "date": "2024-12-28",
            "durationSeconds": 16,
            "views": 10746,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1RZC8YoEUg/"
          },
          {
            "bvid": "BV1Hb6WYkExt",
            "title": "【Minecraft官方短视频】当你的朋友太闲",
            "cover": "/media/bilibili/collections/3513313/BV1Hb6WYkExt.webp",
            "coverAlt": "【Minecraft官方短视频】当你的朋友太闲",
            "date": "2024-12-28",
            "durationSeconds": 17,
            "views": 7334,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1Hb6WYkExt/"
          },
          {
            "bvid": "BV1pt6WYVEGE",
            "title": "【Minecraft官方短视频】关于Minecraft里的那些彩蛋",
            "cover": "/media/bilibili/collections/3513313/BV1pt6WYVEGE.webp",
            "coverAlt": "【Minecraft官方短视频】关于Minecraft里的那些彩蛋",
            "date": "2024-12-28",
            "durationSeconds": 24,
            "views": 10192,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1pt6WYVEGE/"
          },
          {
            "bvid": "BV1Z6rnYhEnS",
            "title": "【Minecraft官方短视频】你还记得你的第一晚吗？",
            "cover": "/media/bilibili/collections/3513313/BV1Z6rnYhEnS.webp",
            "coverAlt": "【Minecraft官方短视频】你还记得你的第一晚吗？",
            "date": "2025-01-04",
            "durationSeconds": 29,
            "views": 4008,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1Z6rnYhEnS/"
          },
          {
            "bvid": "BV1bdruYQEdo",
            "title": "【Minecraft官方短视频】你能找出10个错误吗？",
            "cover": "/media/bilibili/collections/3513313/BV1bdruYQEdo.webp",
            "coverAlt": "【Minecraft官方短视频】你能找出10个错误吗？",
            "date": "2025-01-06",
            "durationSeconds": 20,
            "views": 74795,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1bdruYQEdo/"
          },
          {
            "bvid": "BV15ArrY7EhT",
            "title": "【Minecraft官方短视频】新的生物变种！🐽",
            "cover": "/media/bilibili/collections/3513313/BV15ArrY7EhT.webp",
            "coverAlt": "【Minecraft官方短视频】新的生物变种！🐽",
            "date": "2025-01-09",
            "durationSeconds": 26,
            "views": 16470,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV15ArrY7EhT/"
          },
          {
            "bvid": "BV1mNcieuEVF",
            "title": "【Minecraft官方短视频】你是Minecraft音效大师吗？",
            "cover": "/media/bilibili/collections/3513313/BV1mNcieuEVF.webp",
            "coverAlt": "【Minecraft官方短视频】你是Minecraft音效大师吗？",
            "date": "2025-01-15",
            "durationSeconds": 43,
            "views": 39553,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1mNcieuEVF/"
          },
          {
            "bvid": "BV1TywJeaEyA",
            "title": "【Minecraft官方短视频】准备，开始！哼🐷",
            "cover": "/media/bilibili/collections/3513313/BV1TywJeaEyA.webp",
            "coverAlt": "【Minecraft官方短视频】准备，开始！哼🐷",
            "date": "2025-01-17",
            "durationSeconds": 18,
            "views": 11973,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1TywJeaEyA/"
          },
          {
            "bvid": "BV1m8wpeBEqT",
            "title": "【Minecraft官方短视频】你记得这些bug吗？",
            "cover": "/media/bilibili/collections/3513313/BV1m8wpeBEqT.webp",
            "coverAlt": "【Minecraft官方短视频】你记得这些bug吗？",
            "date": "2025-01-20",
            "durationSeconds": 38,
            "views": 30804,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1m8wpeBEqT/"
          },
          {
            "bvid": "BV15LFhePEGV",
            "title": "【Minecraft官方短视频】Minecraft合成知识挑战！",
            "cover": "/media/bilibili/collections/3513313/BV15LFhePEGV.webp",
            "coverAlt": "【Minecraft官方短视频】Minecraft合成知识挑战！",
            "date": "2025-01-29",
            "durationSeconds": 24,
            "views": 35293,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV15LFhePEGV/"
          },
          {
            "bvid": "BV17TFhezENP",
            "title": "【Minecraft官方短视频】睡不着？",
            "cover": "/media/bilibili/collections/3513313/BV17TFhezENP.webp",
            "coverAlt": "【Minecraft官方短视频】睡不着？",
            "date": "2025-01-29",
            "durationSeconds": 18,
            "views": 17762,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV17TFhezENP/"
          },
          {
            "bvid": "BV1ayPfeQEMy",
            "title": "【Minecraft官方短视频】新的牛变种堂堂到来！",
            "cover": "/media/bilibili/collections/3513313/BV1ayPfeQEMy.webp",
            "coverAlt": "【Minecraft官方短视频】新的牛变种堂堂到来！",
            "date": "2025-02-04",
            "durationSeconds": 34,
            "views": 9936,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1ayPfeQEMy/"
          },
          {
            "bvid": "BV1vqPfe4Ev6",
            "title": "【Minecraft官方短视频】这你还用问？",
            "cover": "/media/bilibili/collections/3513313/BV1vqPfe4Ev6.webp",
            "coverAlt": "【Minecraft官方短视频】这你还用问？",
            "date": "2025-02-04",
            "durationSeconds": 44,
            "views": 39218,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1vqPfe4Ev6/"
          },
          {
            "bvid": "BV1eBPfedEEq",
            "title": "【Minecraft官方短视频】就差一点你就得到了！👀",
            "cover": "/media/bilibili/collections/3513313/BV1eBPfedEEq.webp",
            "coverAlt": "【Minecraft官方短视频】就差一点你就得到了！👀",
            "date": "2025-02-04",
            "durationSeconds": 11,
            "views": 6235,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1eBPfedEEq/"
          },
          {
            "bvid": "BV1QrNJe5EQM",
            "title": "【Minecraft官方短视频】两种新的鸡变种已加入Minecraft！",
            "cover": "/media/bilibili/collections/3513313/BV1QrNJe5EQM.webp",
            "coverAlt": "【Minecraft官方短视频】两种新的鸡变种已加入Minecraft！",
            "date": "2025-02-06",
            "durationSeconds": 13,
            "views": 6646,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1QrNJe5EQM/"
          },
          {
            "bvid": "BV1anKPeqEJ4",
            "title": "【Minecraft官方短视频】你猜？",
            "cover": "/media/bilibili/collections/3513313/BV1anKPeqEJ4.webp",
            "coverAlt": "【Minecraft官方短视频】你猜？",
            "date": "2025-02-14",
            "durationSeconds": 8,
            "views": 3185,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1anKPeqEJ4/"
          },
          {
            "bvid": "BV1i3KPeCEMj",
            "title": "【Minecraft官方短视频】新版Minecraft音效测验！",
            "cover": "/media/bilibili/collections/3513313/BV1i3KPeCEMj.webp",
            "coverAlt": "【Minecraft官方短视频】新版Minecraft音效测验！",
            "date": "2025-02-14",
            "durationSeconds": 47,
            "views": 17772,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1i3KPeCEMj/"
          },
          {
            "bvid": "BV1L3KPeCE2b",
            "title": "【Minecraft官方短视频】快速抽查！",
            "cover": "/media/bilibili/collections/3513313/BV1L3KPeCE2b.webp",
            "coverAlt": "【Minecraft官方短视频】快速抽查！",
            "date": "2025-02-14",
            "durationSeconds": 25,
            "views": 11002,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1L3KPeCE2b/"
          },
          {
            "bvid": "BV1TpXSYdEzn",
            "title": "【Minecraft官方短视频】猪灵的一天！",
            "cover": "/media/bilibili/collections/3513313/BV1TpXSYdEzn.webp",
            "coverAlt": "【Minecraft官方短视频】猪灵的一天！",
            "date": "2025-03-01",
            "durationSeconds": 34,
            "views": 22211,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1TpXSYdEzn/"
          },
          {
            "bvid": "BV1NxXSY9ESG",
            "title": "【Minecraft官方短视频】新版刷怪蛋现已来到Minecraft！",
            "cover": "/media/bilibili/collections/3513313/BV1NxXSY9ESG.webp",
            "coverAlt": "【Minecraft官方短视频】新版刷怪蛋现已来到Minecraft！",
            "date": "2025-03-01",
            "durationSeconds": 33,
            "views": 16267,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1NxXSY9ESG/"
          },
          {
            "bvid": "BV1ZrXSYkEBE",
            "title": "【Minecraft官方短视频】你是怎么度过夜晚的？",
            "cover": "/media/bilibili/collections/3513313/BV1ZrXSYkEBE.webp",
            "coverAlt": "【Minecraft官方短视频】你是怎么度过夜晚的？",
            "date": "2025-03-01",
            "durationSeconds": 19,
            "views": 70823,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1ZrXSYkEBE/"
          },
          {
            "bvid": "BV1d2XSYuEbH",
            "title": "【Minecraft官方短视频】你就没有对村民好一点过吗？",
            "cover": "/media/bilibili/collections/3513313/BV1d2XSYuEbH.webp",
            "coverAlt": "【Minecraft官方短视频】你就没有对村民好一点过吗？",
            "date": "2025-03-01",
            "durationSeconds": 27,
            "views": 17039,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1d2XSYuEbH/"
          },
          {
            "bvid": "BV1oyXSY6Egs",
            "title": "【Minecraft官方短视频】准备好与猪灵战斗吧！| Minecraft大电影Add-on",
            "cover": "/media/bilibili/collections/3513313/BV1oyXSY6Egs.webp",
            "coverAlt": "【Minecraft官方短视频】准备好与猪灵战斗吧！| Minecraft大电影Add-on",
            "date": "2025-03-01",
            "durationSeconds": 26,
            "views": 4348,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1oyXSY6Egs/"
          },
          {
            "bvid": "BV1vtRbYUEMs",
            "title": "【Minecraft官方短视频】你认识这些生物吗？",
            "cover": "/media/bilibili/collections/3513313/BV1vtRbYUEMs.webp",
            "coverAlt": "【Minecraft官方短视频】你认识这些生物吗？",
            "date": "2025-03-09",
            "durationSeconds": 30,
            "views": 20616,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1vtRbYUEMs/"
          },
          {
            "bvid": "BV1v4RbYJEsG",
            "title": "【Minecraft官方短视频】那种食物是对应生物的最爱？",
            "cover": "/media/bilibili/collections/3513313/BV1v4RbYJEsG.webp",
            "coverAlt": "【Minecraft官方短视频】那种食物是对应生物的最爱？",
            "date": "2025-03-09",
            "durationSeconds": 31,
            "views": 3540,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1v4RbYJEsG/"
          },
          {
            "bvid": "BV1JkQ1YYERa",
            "title": "【Minecraft官方短视频】你能找出10个错误吗？",
            "cover": "/media/bilibili/collections/3513313/BV1JkQ1YYERa.webp",
            "coverAlt": "【Minecraft官方短视频】你能找出10个错误吗？",
            "date": "2025-03-15",
            "durationSeconds": 22,
            "views": 15682,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1JkQ1YYERa/"
          },
          {
            "bvid": "BV1crQ1YPEV8",
            "title": "【Minecraft官方短视频】现在就去试试新的定位栏吧！",
            "cover": "/media/bilibili/collections/3513313/BV1crQ1YPEV8.webp",
            "coverAlt": "【Minecraft官方短视频】现在就去试试新的定位栏吧！",
            "date": "2025-03-15",
            "durationSeconds": 29,
            "views": 4350,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1crQ1YPEV8/"
          },
          {
            "bvid": "BV1YZQ1YpEt8",
            "title": "【Minecraft官方短视频】贪婪致穷",
            "cover": "/media/bilibili/collections/3513313/BV1YZQ1YpEt8.webp",
            "coverAlt": "【Minecraft官方短视频】贪婪致穷",
            "date": "2025-03-15",
            "durationSeconds": 26,
            "views": 372892,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1YZQ1YpEt8/"
          },
          {
            "bvid": "BV1aFXaYmE6D",
            "title": "【Minecraft官方短视频】Minecraft摇篮曲",
            "cover": "/media/bilibili/collections/3513313/BV1aFXaYmE6D.webp",
            "coverAlt": "【Minecraft官方短视频】Minecraft摇篮曲",
            "date": "2025-03-23",
            "durationSeconds": 34,
            "views": 5638,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1aFXaYmE6D/"
          },
          {
            "bvid": "BV1SNXaY5Eoa",
            "title": "【Minecraft官方短视频】即将来到Minecraft的新方块？",
            "cover": "/media/bilibili/collections/3513313/BV1SNXaY5Eoa.webp",
            "coverAlt": "【Minecraft官方短视频】即将来到Minecraft的新方块？",
            "date": "2025-03-23",
            "durationSeconds": 20,
            "views": 4493,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1SNXaY5Eoa/"
          },
          {
            "bvid": "BV12hXhYqEGz",
            "title": "【Minecraft官方短视频】Minecraft大电影：英雄玩法包",
            "cover": "/media/bilibili/collections/3513313/BV12hXhYqEGz.webp",
            "coverAlt": "【Minecraft官方短视频】Minecraft大电影：英雄玩法包",
            "date": "2025-03-23",
            "durationSeconds": 16,
            "views": 1901,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV12hXhYqEGz/"
          },
          {
            "bvid": "BV1m8XhYMEEF",
            "title": "【Minecraft官方短视频】准备好迎接Minecraft Live 2025了吗？",
            "cover": "/media/bilibili/collections/3513313/BV1m8XhYMEEF.webp",
            "coverAlt": "【Minecraft官方短视频】准备好迎接Minecraft Live 2025了吗？",
            "date": "2025-03-23",
            "durationSeconds": 16,
            "views": 1464,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1m8XhYMEEF/"
          },
          {
            "bvid": "BV1Y35tzSEGh",
            "title": "【Minecraft官方短视频】很容易分神？",
            "cover": "/media/bilibili/collections/3513313/BV1Y35tzSEGh.webp",
            "coverAlt": "【Minecraft官方短视频】很容易分神？",
            "date": "2025-04-19",
            "durationSeconds": 25,
            "views": 9516,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1Y35tzSEGh/"
          },
          {
            "bvid": "BV1eT5tzpEZ8",
            "title": "【Minecraft官方短视频】看看苦力怕是怎么毁了EMMA MYERS的一天",
            "cover": "/media/bilibili/collections/3513313/BV1eT5tzpEZ8.webp",
            "coverAlt": "【Minecraft官方短视频】看看苦力怕是怎么毁了EMMA MYERS的一天",
            "date": "2025-04-19",
            "durationSeconds": 15,
            "views": 1528,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1eT5tzpEZ8/"
          },
          {
            "bvid": "BV1vT5tzpE3i",
            "title": "【Minecraft官方短视频】栓绳新玩法！",
            "cover": "/media/bilibili/collections/3513313/BV1vT5tzpE3i.webp",
            "coverAlt": "【Minecraft官方短视频】栓绳新玩法！",
            "date": "2025-04-19",
            "durationSeconds": 27,
            "views": 4725,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1vT5tzpE3i/"
          },
          {
            "bvid": "BV1RT5tzpEhi",
            "title": "【Minecraft官方短视频】你去过你的村庄了吗？",
            "cover": "/media/bilibili/collections/3513313/BV1RT5tzpEhi.webp",
            "coverAlt": "【Minecraft官方短视频】你去过你的村庄了吗？",
            "date": "2025-04-19",
            "durationSeconds": 57,
            "views": 1127,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1RT5tzpEhi/"
          },
          {
            "bvid": "BV15T5tzpEp8",
            "title": "【Minecraft官方短视频】你在下界是怎么样的？",
            "cover": "/media/bilibili/collections/3513313/BV15T5tzpEp8.webp",
            "coverAlt": "【Minecraft官方短视频】你在下界是怎么样的？",
            "date": "2025-04-19",
            "durationSeconds": 28,
            "views": 8737,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV15T5tzpEp8/"
          },
          {
            "bvid": "BV1JqEuz9EBi",
            "title": "【Minecraft官方短视频】I... AM STEVE!",
            "cover": "/media/bilibili/collections/3513313/BV1JqEuz9EBi.webp",
            "coverAlt": "【Minecraft官方短视频】I... AM STEVE!",
            "date": "2025-05-11",
            "durationSeconds": 30,
            "views": 28966,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1JqEuz9EBi/"
          },
          {
            "bvid": "BV1E6EuzQEEy",
            "title": "【Minecraft官方短视频】你都认识这些生物吗",
            "cover": "/media/bilibili/collections/3513313/BV1E6EuzQEEy.webp",
            "coverAlt": "【Minecraft官方短视频】你都认识这些生物吗",
            "date": "2025-05-11",
            "durationSeconds": 29,
            "views": 5778,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1E6EuzQEEy/"
          },
          {
            "bvid": "BV1eTEuz5Eo9",
            "title": "【Minecraft官方短视频】2011 vs 2025",
            "cover": "/media/bilibili/collections/3513313/BV1eTEuz5Eo9.webp",
            "coverAlt": "【Minecraft官方短视频】2011 vs 2025",
            "date": "2025-05-11",
            "durationSeconds": 28,
            "views": 24446,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1eTEuz5Eo9/"
          },
          {
            "bvid": "BV1YgEuzGEy5",
            "title": "【Minecraft官方短视频】你的朋友有必要听到这个吗。。。",
            "cover": "/media/bilibili/collections/3513313/BV1YgEuzGEy5.webp",
            "coverAlt": "【Minecraft官方短视频】你的朋友有必要听到这个吗。。。",
            "date": "2025-05-11",
            "durationSeconds": 33,
            "views": 1681,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1YgEuzGEy5/"
          },
          {
            "bvid": "BV1YMEuzCEYy",
            "title": "【Minecraft官方短视频】Minecraft PRO?",
            "cover": "/media/bilibili/collections/3513313/BV1YMEuzCEYy.webp",
            "coverAlt": "【Minecraft官方短视频】Minecraft PRO?",
            "date": "2025-05-11",
            "durationSeconds": 41,
            "views": 2173,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1YMEuzCEYy/"
          },
          {
            "bvid": "BV1qfEMzSERy",
            "title": "【Minecraft官方短视频】当它真的发生了",
            "cover": "/media/bilibili/collections/3513313/BV1qfEMzSERy.webp",
            "coverAlt": "【Minecraft官方短视频】当它真的发生了",
            "date": "2025-05-11",
            "durationSeconds": 10,
            "views": 8225,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1qfEMzSERy/"
          },
          {
            "bvid": "BV1BfEMzSEVL",
            "title": "【Minecraft官方短视频】你犯过这些错吗",
            "cover": "/media/bilibili/collections/3513313/BV1BfEMzSEVL.webp",
            "coverAlt": "【Minecraft官方短视频】你犯过这些错吗",
            "date": "2025-05-11",
            "durationSeconds": 36,
            "views": 3225,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1BfEMzSEVL/"
          },
          {
            "bvid": "BV1BfEMzSEko",
            "title": "【Minecraft官方短视频】这是Minecraft的？",
            "cover": "/media/bilibili/collections/3513313/BV1BfEMzSEko.webp",
            "coverAlt": "【Minecraft官方短视频】这是Minecraft的？",
            "date": "2025-05-11",
            "durationSeconds": 22,
            "views": 2066,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1BfEMzSEko/"
          },
          {
            "bvid": "BV1iTMmzaEdd",
            "title": "【Minecraft官方短视频】现在鞍可以被制作了！",
            "cover": "/media/bilibili/collections/3513313/BV1iTMmzaEdd.webp",
            "coverAlt": "【Minecraft官方短视频】现在鞍可以被制作了！",
            "date": "2025-06-14",
            "durationSeconds": 33,
            "views": 1080,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1iTMmzaEdd/"
          },
          {
            "bvid": "BV1GvM2zsE1u",
            "title": "【Minecraft官方短视频】你会选择往时间胶囊里放什么？",
            "cover": "/media/bilibili/collections/3513313/BV1GvM2zsE1u.webp",
            "coverAlt": "【Minecraft官方短视频】你会选择往时间胶囊里放什么？",
            "date": "2025-06-14",
            "durationSeconds": 42,
            "views": 1106,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1GvM2zsE1u/"
          },
          {
            "bvid": "BV1GvM2zsELs",
            "title": "【Minecraft官方短视频】Minecraft 16年！",
            "cover": "/media/bilibili/collections/3513313/BV1GvM2zsELs.webp",
            "coverAlt": "【Minecraft官方短视频】Minecraft 16年！",
            "date": "2025-06-14",
            "durationSeconds": 18,
            "views": 7122,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1GvM2zsELs/"
          },
          {
            "bvid": "BV1GvM2zsExH",
            "title": "【Minecraft官方短视频】找出10个错误！",
            "cover": "/media/bilibili/collections/3513313/BV1GvM2zsExH.webp",
            "coverAlt": "【Minecraft官方短视频】找出10个错误！",
            "date": "2025-06-14",
            "durationSeconds": 19,
            "views": 21560,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1GvM2zsExH/"
          },
          {
            "bvid": "BV1XYM2zREdj",
            "title": "【Minecraft官方短视频】被遗忘的盔甲",
            "cover": "/media/bilibili/collections/3513313/BV1XYM2zREdj.webp",
            "coverAlt": "【Minecraft官方短视频】被遗忘的盔甲",
            "date": "2025-06-14",
            "durationSeconds": 53,
            "views": 5011,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1XYM2zREdj/"
          },
          {
            "bvid": "BV19YM2zREFc",
            "title": "【Minecraft官方短视频】准备好！决斗！",
            "cover": "/media/bilibili/collections/3513313/BV19YM2zREFc.webp",
            "coverAlt": "【Minecraft官方短视频】准备好！决斗！",
            "date": "2025-06-14",
            "durationSeconds": 29,
            "views": 5241,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV19YM2zREFc/"
          },
          {
            "bvid": "BV1XYM2zREXR",
            "title": "【Minecraft官方短视频】别往身后看！",
            "cover": "/media/bilibili/collections/3513313/BV1XYM2zREXR.webp",
            "coverAlt": "【Minecraft官方短视频】别往身后看！",
            "date": "2025-06-14",
            "durationSeconds": 17,
            "views": 1420,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1XYM2zREXR/"
          },
          {
            "bvid": "BV1YYM2zdEbF",
            "title": "【Minecraft官方短视频】追逐天空！即将到来......",
            "cover": "/media/bilibili/collections/3513313/BV1YYM2zdEbF.webp",
            "coverAlt": "【Minecraft官方短视频】追逐天空！即将到来......",
            "date": "2025-06-14",
            "durationSeconds": 12,
            "views": 1056,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1YYM2zdEbF/"
          },
          {
            "bvid": "BV1XYM2zREBs",
            "title": "【Minecraft官方短视频】你都见过他们吗？",
            "cover": "/media/bilibili/collections/3513313/BV1XYM2zREBs.webp",
            "coverAlt": "【Minecraft官方短视频】你都见过他们吗？",
            "date": "2025-06-14",
            "durationSeconds": 33,
            "views": 2042,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1XYM2zREBs/"
          },
          {
            "bvid": "BV1DBM2zHEvr",
            "title": "【Minecraft官方短视频】来测试一下你的Minecraft音效水平吧",
            "cover": "/media/bilibili/collections/3513313/BV1DBM2zHEvr.webp",
            "coverAlt": "【Minecraft官方短视频】来测试一下你的Minecraft音效水平吧",
            "date": "2025-06-14",
            "durationSeconds": 40,
            "views": 5208,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1DBM2zHEvr/"
          },
          {
            "bvid": "BV1hBM2zpE68",
            "title": "【Minecraft官方短视频】你试过这些新的小更新玩法了吗",
            "cover": "/media/bilibili/collections/3513313/BV1hBM2zpE68.webp",
            "coverAlt": "【Minecraft官方短视频】你试过这些新的小更新玩法了吗",
            "date": "2025-06-14",
            "durationSeconds": 25,
            "views": 1646,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1hBM2zpE68/"
          },
          {
            "bvid": "BV1QiM2zXEew",
            "title": "【Minecraft官方短视频】即将到来......",
            "cover": "/media/bilibili/collections/3513313/BV1QiM2zXEew.webp",
            "coverAlt": "【Minecraft官方短视频】即将到来......",
            "date": "2025-06-14",
            "durationSeconds": 45,
            "views": 3578,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1QiM2zXEew/"
          },
          {
            "bvid": "BV1JF3FzCEhN",
            "title": "【Minecraft官方短视频】当你看到...",
            "cover": "/media/bilibili/collections/3513313/BV1JF3FzCEhN.webp",
            "coverAlt": "【Minecraft官方短视频】当你看到...",
            "date": "2025-06-29",
            "durationSeconds": 16,
            "views": 1536,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1JF3FzCEhN/"
          },
          {
            "bvid": "BV1ZA3Fz6Eoc",
            "title": "【Minecraft官方短视频】感受一下灵动视效吧！",
            "cover": "/media/bilibili/collections/3513313/BV1ZA3Fz6Eoc.webp",
            "coverAlt": "【Minecraft官方短视频】感受一下灵动视效吧！",
            "date": "2025-06-29",
            "durationSeconds": 27,
            "views": 1305,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1ZA3Fz6Eoc/"
          },
          {
            "bvid": "BV1fw3Fz3Eyz",
            "title": "【Minecraft官方短视频】快去追逐天空吧！",
            "cover": "/media/bilibili/collections/3513313/BV1fw3Fz3Eyz.webp",
            "coverAlt": "【Minecraft官方短视频】快去追逐天空吧！",
            "date": "2025-06-29",
            "durationSeconds": 33,
            "views": 1244,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1fw3Fz3Eyz/"
          },
          {
            "bvid": "BV1k9gfz2Ed7",
            "title": "【Minecraft官方短视频】你能都猜出来吗？",
            "cover": "/media/bilibili/collections/3513313/BV1k9gfz2Ed7.webp",
            "coverAlt": "【Minecraft官方短视频】你能都猜出来吗？",
            "date": "2025-06-29",
            "durationSeconds": 46,
            "views": 5721,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1k9gfz2Ed7/"
          },
          {
            "bvid": "BV1WXgfzEEg2",
            "title": "【Minecraft官方短视频】新唱片！",
            "cover": "/media/bilibili/collections/3513313/BV1WXgfzEEg2.webp",
            "coverAlt": "【Minecraft官方短视频】新唱片！",
            "date": "2025-06-29",
            "durationSeconds": 12,
            "views": 3222,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1WXgfzEEg2/"
          },
          {
            "bvid": "BV1CXgfz7ENu",
            "title": "【Minecraft官方短视频】你在服务器上是怎么样的？",
            "cover": "/media/bilibili/collections/3513313/BV1CXgfz7ENu.webp",
            "coverAlt": "【Minecraft官方短视频】你在服务器上是怎么样的？",
            "date": "2025-06-29",
            "durationSeconds": 25,
            "views": 2043,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1CXgfz7ENu/"
          },
          {
            "bvid": "BV1rogfzyEgi",
            "title": "【Minecraft官方短视频】听君一席话胜似一席话",
            "cover": "/media/bilibili/collections/3513313/BV1rogfzyEgi.webp",
            "coverAlt": "【Minecraft官方短视频】听君一席话胜似一席话",
            "date": "2025-06-29",
            "durationSeconds": 29,
            "views": 2608,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1rogfzyEgi/"
          },
          {
            "bvid": "BV1aLuJzjERW",
            "title": "【Minecraft官方短视频】当你不在玩Minecraft的时候，你在干什么？",
            "cover": "/media/bilibili/collections/3513313/BV1aLuJzjERW.webp",
            "coverAlt": "【Minecraft官方短视频】当你不在玩Minecraft的时候，你在干什么？",
            "date": "2025-07-15",
            "durationSeconds": 9,
            "views": 1240,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1aLuJzjERW/"
          },
          {
            "bvid": "BV1bJuJzCEZh",
            "title": "【Minecraft官方短视频】铜傀儡！",
            "cover": "/media/bilibili/collections/3513313/BV1bJuJzCEZh.webp",
            "coverAlt": "【Minecraft官方短视频】铜傀儡！",
            "date": "2025-07-15",
            "durationSeconds": 53,
            "views": 5426,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1bJuJzCEZh/"
          },
          {
            "bvid": "BV18JuJzCEJ4",
            "title": "【Minecraft官方短视频】让铜傀儡帮你整理箱子？",
            "cover": "/media/bilibili/collections/3513313/BV18JuJzCEJ4.webp",
            "coverAlt": "【Minecraft官方短视频】让铜傀儡帮你整理箱子？",
            "date": "2025-07-15",
            "durationSeconds": 9,
            "views": 2090,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV18JuJzCEJ4/"
          },
          {
            "bvid": "BV1SJuJzCEj2",
            "title": "【Minecraft官方短视频】你能找出全部的错误吗？",
            "cover": "/media/bilibili/collections/3513313/BV1SJuJzCEj2.webp",
            "coverAlt": "【Minecraft官方短视频】你能找出全部的错误吗？",
            "date": "2025-07-15",
            "durationSeconds": 22,
            "views": 6695,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1SJuJzCEj2/"
          },
          {
            "bvid": "BV1bJuJzCE2o",
            "title": "【Minecraft官方短视频】你玩Minecraft吗？当然！",
            "cover": "/media/bilibili/collections/3513313/BV1bJuJzCE2o.webp",
            "coverAlt": "【Minecraft官方短视频】你玩Minecraft吗？当然！",
            "date": "2025-07-15",
            "durationSeconds": 37,
            "views": 2241,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1bJuJzCE2o/"
          },
          {
            "bvid": "BV18EuJz5Ead",
            "title": "【Minecraft官方短视频】你最喜欢的结构是？",
            "cover": "/media/bilibili/collections/3513313/BV18EuJz5Ead.webp",
            "coverAlt": "【Minecraft官方短视频】你最喜欢的结构是？",
            "date": "2025-07-15",
            "durationSeconds": 33,
            "views": 6132,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV18EuJz5Ead/"
          },
          {
            "bvid": "BV11nvWBfEuR",
            "title": "【Minecraft官方短视频】他们的命运改变了！",
            "cover": "/media/bilibili/collections/3513313/BV11nvWBfEuR.webp",
            "coverAlt": "【Minecraft官方短视频】他们的命运改变了！",
            "date": "2025-12-29",
            "durationSeconds": 15,
            "views": 8253,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV11nvWBfEuR/"
          },
          {
            "bvid": "BV11JvWB8Ea6",
            "title": "【Minecraft官方短视频】你觉得他们真的有机会吗",
            "cover": "/media/bilibili/collections/3513313/BV11JvWB8Ea6.webp",
            "coverAlt": "【Minecraft官方短视频】你觉得他们真的有机会吗",
            "date": "2025-12-29",
            "durationSeconds": 7,
            "views": 1880,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV11JvWB8Ea6/"
          },
          {
            "bvid": "BV1CWvWBoEmv",
            "title": "【Minecraft官方短视频】猜音效？",
            "cover": "/media/bilibili/collections/3513313/BV1CWvWBoEmv.webp",
            "coverAlt": "【Minecraft官方短视频】猜音效？",
            "date": "2025-12-29",
            "durationSeconds": 36,
            "views": 3013,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1CWvWBoEmv/"
          },
          {
            "bvid": "BV1yWvWBoEP6",
            "title": "【Minecraft官方短视频】联机时候的你是咋样的？",
            "cover": "/media/bilibili/collections/3513313/BV1yWvWBoEP6.webp",
            "coverAlt": "【Minecraft官方短视频】联机时候的你是咋样的？",
            "date": "2025-12-29",
            "durationSeconds": 39,
            "views": 2193,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1yWvWBoEP6/"
          },
          {
            "bvid": "BV1CWvWBZEU1",
            "title": "【Minecraft官方短视频】就再一个！",
            "cover": "/media/bilibili/collections/3513313/BV1CWvWBZEU1.webp",
            "coverAlt": "【Minecraft官方短视频】就再一个！",
            "date": "2025-12-29",
            "durationSeconds": 16,
            "views": 2858,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1CWvWBZEU1/"
          },
          {
            "bvid": "BV1PKbL6xEpK",
            "title": "【Minecraft官方短视频】THAT ONE LUCKY FRIEND",
            "cover": "/media/bilibili/collections/3513313/BV1PKbL6xEpK.webp",
            "coverAlt": "【Minecraft官方短视频】THAT ONE LUCKY FRIEND",
            "date": "2026-09-06",
            "durationSeconds": 24,
            "views": 1168,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1PKbL6xEpK/"
          },
          {
            "bvid": "BV1wgbL6XE2J",
            "title": "【Minecraft官方短视频】NEVER LET THEM KNOW YOUR NEXT MOVE",
            "cover": "/media/bilibili/collections/3513313/BV1wgbL6XE2J.webp",
            "coverAlt": "【Minecraft官方短视频】NEVER LET THEM KNOW YOUR NEXT MOVE",
            "date": "2026-09-06",
            "durationSeconds": 24,
            "views": 1436,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1wgbL6XE2J/"
          },
          {
            "bvid": "BV1WubL6WEA8",
            "title": "【Minecraft官方短视频】MINECRAFT ELYTRA SONG",
            "cover": "/media/bilibili/collections/3513313/BV1WubL6WEA8.webp",
            "coverAlt": "【Minecraft官方短视频】MINECRAFT ELYTRA SONG",
            "date": "2026-09-06",
            "durationSeconds": 35,
            "views": 563,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1WubL6WEA8/"
          },
          {
            "bvid": "BV1CQb76aEa4",
            "title": "【Minecraft官方短视频】IF MINECRAFT HAD RADIO...",
            "cover": "/media/bilibili/collections/3513313/BV1CQb76aEa4.webp",
            "coverAlt": "【Minecraft官方短视频】IF MINECRAFT HAD RADIO...",
            "date": "2026-09-06",
            "durationSeconds": 29,
            "views": 271,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1CQb76aEa4/"
          },
          {
            "bvid": "BV1CRb768EPj",
            "title": "【Minecraft官方短视频】PROBLEM SOLVED",
            "cover": "/media/bilibili/collections/3513313/BV1CRb768EPj.webp",
            "coverAlt": "【Minecraft官方短视频】PROBLEM SOLVED",
            "date": "2026-09-06",
            "durationSeconds": 14,
            "views": 925,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1CRb768EPj/"
          },
          {
            "bvid": "BV1ARb76hEbz",
            "title": "【Minecraft官方短视频】IN YOUR REVENGE ERA?",
            "cover": "/media/bilibili/collections/3513313/BV1ARb76hEbz.webp",
            "coverAlt": "【Minecraft官方短视频】IN YOUR REVENGE ERA?",
            "date": "2026-09-06",
            "durationSeconds": 20,
            "views": 1151,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1ARb76hEbz/"
          },
          {
            "bvid": "BV1Tmb76KEwn",
            "title": "【Minecraft官方短视频】20 MILLION VILLAGER SONG",
            "cover": "/media/bilibili/collections/3513313/BV1Tmb76KEwn.webp",
            "coverAlt": "【Minecraft官方短视频】20 MILLION VILLAGER SONG",
            "date": "2026-09-06",
            "durationSeconds": 30,
            "views": 568,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1Tmb76KEwn/"
          },
          {
            "bvid": "BV121b76iEXr",
            "title": "【Minecraft官方短视频】SKILL ISSUE?",
            "cover": "/media/bilibili/collections/3513313/BV121b76iEXr.webp",
            "coverAlt": "【Minecraft官方短视频】SKILL ISSUE?",
            "date": "2026-09-06",
            "durationSeconds": 30,
            "views": 1255,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV121b76iEXr/"
          },
          {
            "bvid": "BV1NDb76PEhF",
            "title": "【Minecraft官方短视频】IS THIS YOU?",
            "cover": "/media/bilibili/collections/3513313/BV1NDb76PEhF.webp",
            "coverAlt": "【Minecraft官方短视频】IS THIS YOU?",
            "date": "2026-09-06",
            "durationSeconds": 24,
            "views": 470,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1NDb76PEhF/"
          },
          {
            "bvid": "BV11Ub76eE5z",
            "title": "【Minecraft官方短视频】SAVE YOUR FRIEND OR GET DIAMONDS?",
            "cover": "/media/bilibili/collections/3513313/BV11Ub76eE5z.webp",
            "coverAlt": "【Minecraft官方短视频】SAVE YOUR FRIEND OR GET DIAMONDS?",
            "date": "2026-09-06",
            "durationSeconds": 13,
            "views": 492,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV11Ub76eE5z/"
          },
          {
            "bvid": "BV17NbE69EYE",
            "title": "【Minecraft官方短视频】I DON'T HOLD GRUDGES...",
            "cover": "/media/bilibili/collections/3513313/BV17NbE69EYE.webp",
            "coverAlt": "【Minecraft官方短视频】I DON'T HOLD GRUDGES...",
            "date": "2026-09-06",
            "durationSeconds": 17,
            "views": 445,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV17NbE69EYE/"
          },
          {
            "bvid": "BV1BPbE6WEij",
            "title": "【Minecraft官方短视频】MINECRAFT DIGGING SONG",
            "cover": "/media/bilibili/collections/3513313/BV1BPbE6WEij.webp",
            "coverAlt": "【Minecraft官方短视频】MINECRAFT DIGGING SONG",
            "date": "2026-09-06",
            "durationSeconds": 29,
            "views": 1478,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1BPbE6WEij/"
          },
          {
            "bvid": "BV1umY26YEru",
            "title": "【Minecraft官方短视频】为我们的新更新命名！",
            "cover": "/media/bilibili/collections/3513313/BV1umY26YEru.webp",
            "coverAlt": "【Minecraft官方短视频】为我们的新更新命名！",
            "date": "2026-09-11",
            "durationSeconds": 21,
            "views": 680,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1umY26YEru/"
          },
          {
            "bvid": "BV1S2Y26AE2n",
            "title": "【Minecraft官方短视频】背包怎么又满了（哭",
            "cover": "/media/bilibili/collections/3513313/BV1S2Y26AE2n.webp",
            "coverAlt": "【Minecraft官方短视频】背包怎么又满了（哭",
            "date": "2026-09-11",
            "durationSeconds": 16,
            "views": 1196,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1S2Y26AE2n/"
          },
          {
            "bvid": "BV1S2Y26AESQ",
            "title": "【Minecraft官方短视频】又做梦了，梦见经验自由了",
            "cover": "/media/bilibili/collections/3513313/BV1S2Y26AESQ.webp",
            "coverAlt": "【Minecraft官方短视频】又做梦了，梦见经验自由了",
            "date": "2026-09-11",
            "durationSeconds": 18,
            "views": 2085,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1S2Y26AESQ/"
          },
          {
            "bvid": "BV1b2Y26PEZc",
            "title": "【Minecraft官方短视频】奔赴荒野即将到来……",
            "cover": "/media/bilibili/collections/3513313/BV1b2Y26PEZc.webp",
            "coverAlt": "【Minecraft官方短视频】奔赴荒野即将到来……",
            "date": "2026-09-11",
            "durationSeconds": 19,
            "views": 2276,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1b2Y26PEZc/"
          },
          {
            "bvid": "BV1sieh6UE7d",
            "title": "【Minecraft官方短视频】你那个“小贴士助手”朋友",
            "cover": "/media/bilibili/collections/3513313/BV1sieh6UE7d.webp",
            "coverAlt": "【Minecraft官方短视频】你那个“小贴士助手”朋友",
            "date": "2026-09-19",
            "durationSeconds": 24,
            "views": 324,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1sieh6UE7d/"
          },
          {
            "bvid": "BV1Pieh6UE4s",
            "title": "【Minecraft官方短视频】你能别在坐垫上转了吗",
            "cover": "/media/bilibili/collections/3513313/BV1Pieh6UE4s.webp",
            "coverAlt": "【Minecraft官方短视频】你能别在坐垫上转了吗",
            "date": "2026-09-19",
            "durationSeconds": 7,
            "views": 442,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1Pieh6UE4s/"
          },
          {
            "bvid": "BV1Hreh6LEkT",
            "title": "【Minecraft官方短视频】悬浮树的视角",
            "cover": "/media/bilibili/collections/3513313/BV1Hreh6LEkT.webp",
            "coverAlt": "【Minecraft官方短视频】悬浮树的视角",
            "date": "2026-09-19",
            "durationSeconds": 19,
            "views": 1716,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1Hreh6LEkT/"
          },
          {
            "bvid": "BV1Behm6VEj4",
            "title": "【Minecraft官方短视频】你能找出10个错误吗？",
            "cover": "/media/bilibili/collections/3513313/BV1Behm6VEj4.webp",
            "coverAlt": "【Minecraft官方短视频】你能找出10个错误吗？",
            "date": "2026-09-26",
            "durationSeconds": 25,
            "views": 4440,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1Behm6VEj4/"
          },
          {
            "bvid": "BV1eChm6TExS",
            "title": "【Minecraft官方短视频】你会加入他们吗?",
            "cover": "/media/bilibili/collections/3513313/BV1eChm6TExS.webp",
            "coverAlt": "【Minecraft官方短视频】你会加入他们吗?",
            "date": "2026-09-26",
            "durationSeconds": 37,
            "views": 1420,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1eChm6TExS/"
          },
          {
            "bvid": "BV1iBhm66EPR",
            "title": "【Minecraft官方短视频】曾经有过一只鸡……",
            "cover": "/media/bilibili/collections/3513313/BV1iBhm66EPR.webp",
            "coverAlt": "【Minecraft官方短视频】曾经有过一只鸡……",
            "date": "2026-09-26",
            "durationSeconds": 29,
            "views": 607,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1iBhm66EPR/"
          },
          {
            "bvid": "BV1v6hm6gEzd",
            "title": "【Minecraft官方短视频】来雪球大战？",
            "cover": "/media/bilibili/collections/3513313/BV1v6hm6gEzd.webp",
            "coverAlt": "【Minecraft官方短视频】来雪球大战？",
            "date": "2026-09-26",
            "durationSeconds": 18,
            "views": 643,
            "section": "官方短视频",
            "url": "https://www.bilibili.com/video/BV1v6hm6gEzd/"
          }
        ]
      }
    ]
  },
  {
    "id": 5,
    "seasonId": 3832038,
    "videoBvid": "BV1SD4ZeMEjM",
    "title": "Hypixel 官方短视频",
    "description": "搬运的Hypixel官方短视频（目前暂时暂停搬运Hypixel短视频），可能不及时，如没有字幕，可稍等半小时后便会补上字幕",
    "cover": "/media/bilibili/v05.webp",
    "coverAlt": "Hypixel 官方短视频",
    "count": 46,
    "fetchedAt": "2026-11-18T14:36:26.178Z",
    "sections": [
      {
        "title": "正片",
        "episodes": [
          {
            "bvid": "BV1SD4ZeMEjM",
            "title": "【Hypixel官方短视频】在密室杀手中被轻易击败了🙂‍↕️💔",
            "cover": "/media/bilibili/collections/3832038/BV1SD4ZeMEjM.webp",
            "coverAlt": "【Hypixel官方短视频】在密室杀手中被轻易击败了🙂‍↕️💔",
            "date": "2024-09-13",
            "durationSeconds": 8,
            "views": 2733,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1SD4ZeMEjM/"
          },
          {
            "bvid": "BV1Dm4ZegEka",
            "title": "【Hypixel官方短视频】请为这个空岛引导打分",
            "cover": "/media/bilibili/collections/3832038/BV1Dm4ZegEka.webp",
            "coverAlt": "【Hypixel官方短视频】请为这个空岛引导打分",
            "date": "2024-09-13",
            "durationSeconds": 29,
            "views": 2650,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1Dm4ZegEka/"
          },
          {
            "bvid": "BV1D441eTEu3",
            "title": "【Hypixel官方短视频】可爱的僵尸才不恐怖呢！",
            "cover": "/media/bilibili/collections/3832038/BV1D441eTEu3.webp",
            "coverAlt": "【Hypixel官方短视频】可爱的僵尸才不恐怖呢！",
            "date": "2024-09-15",
            "durationSeconds": 31,
            "views": 2124,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1D441eTEu3/"
          },
          {
            "bvid": "BV1bosfeKE1C",
            "title": "【Hypixel官方短视频】现代化挖矿体验现已在空岛生存中推出！",
            "cover": "/media/bilibili/collections/3832038/BV1bosfeKE1C.webp",
            "coverAlt": "【Hypixel官方短视频】现代化挖矿体验现已在空岛生存中推出！",
            "date": "2024-09-27",
            "durationSeconds": 38,
            "views": 467,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1bosfeKE1C/"
          },
          {
            "bvid": "BV11psfebEvL",
            "title": "【Hypixel官方短视频】粉红治疗羊赢了🐏",
            "cover": "/media/bilibili/collections/3832038/BV11psfebEvL.webp",
            "coverAlt": "【Hypixel官方短视频】粉红治疗羊赢了🐏",
            "date": "2024-09-27",
            "durationSeconds": 10,
            "views": 15805,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV11psfebEvL/"
          },
          {
            "bvid": "BV11psfebEau",
            "title": "【Hypixel官方短视频】起床战争的气氛🫡🔥",
            "cover": "/media/bilibili/collections/3832038/BV11psfebEau.webp",
            "coverAlt": "【Hypixel官方短视频】起床战争的气氛🫡🔥",
            "date": "2024-09-27",
            "durationSeconds": 13,
            "views": 4801,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV11psfebEau/"
          },
          {
            "bvid": "BV12HsfeFEiy",
            "title": "【Hypixel官方短视频】南瓜季！你喜欢哪一个？",
            "cover": "/media/bilibili/collections/3832038/BV12HsfeFEiy.webp",
            "coverAlt": "【Hypixel官方短视频】南瓜季！你喜欢哪一个？",
            "date": "2024-09-27",
            "durationSeconds": 30,
            "views": 8206,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV12HsfeFEiy/"
          },
          {
            "bvid": "BV1MjsfeeEdw",
            "title": "【Hypixel官方短视频】他们是对的",
            "cover": "/media/bilibili/collections/3832038/BV1MjsfeeEdw.webp",
            "coverAlt": "【Hypixel官方短视频】他们是对的",
            "date": "2024-09-27",
            "durationSeconds": 12,
            "views": 512,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1MjsfeeEdw/"
          },
          {
            "bvid": "BV1mQxSerE45",
            "title": "【Hypixel官方短视频】在Hypixel参与我们的万圣节庆典，并与朋友分享你喜欢的装扮👻",
            "cover": "/media/bilibili/collections/3832038/BV1mQxSerE45.webp",
            "coverAlt": "【Hypixel官方短视频】在Hypixel参与我们的万圣节庆典，并与朋友分享你喜欢的装扮👻",
            "date": "2024-10-03",
            "durationSeconds": 43,
            "views": 729,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1mQxSerE45/"
          },
          {
            "bvid": "BV1VQ1fYGENR",
            "title": "【Hypixel官方短视频】我“眼”想知道你喜欢哪一个👀",
            "cover": "/media/bilibili/collections/3832038/BV1VQ1fYGENR.webp",
            "coverAlt": "【Hypixel官方短视频】我“眼”想知道你喜欢哪一个👀",
            "date": "2024-10-06",
            "durationSeconds": 30,
            "views": 1776,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1VQ1fYGENR/"
          },
          {
            "bvid": "BV1QJ2AYSE6c",
            "title": "【Hypixel官方短视频】密室杀手现已更新！堕入疯狂吧！⚔️",
            "cover": "/media/bilibili/collections/3832038/BV1QJ2AYSE6c.webp",
            "coverAlt": "【Hypixel官方短视频】密室杀手现已更新！堕入疯狂吧！⚔️",
            "date": "2024-10-09",
            "durationSeconds": 45,
            "views": 1694,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1QJ2AYSE6c/"
          },
          {
            "bvid": "BV194C1YPEde",
            "title": "【Hypixel官方短视频】国际甜点节快乐！奖励自己点甜点岛吧！🍫🍬🍭",
            "cover": "/media/bilibili/collections/3832038/BV194C1YPEde.webp",
            "coverAlt": "【Hypixel官方短视频】国际甜点节快乐！奖励自己点甜点岛吧！🍫🍬🍭",
            "date": "2024-10-18",
            "durationSeconds": 11,
            "views": 555,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV194C1YPEde/"
          },
          {
            "bvid": "BV11CC1YpE9F",
            "title": "【Hypixel官方短视频】观战视角：我以为你应该在绵羊战争能赢",
            "cover": "/media/bilibili/collections/3832038/BV11CC1YpE9F.webp",
            "coverAlt": "【Hypixel官方短视频】观战视角：我以为你应该在绵羊战争能赢",
            "date": "2024-10-18",
            "durationSeconds": 20,
            "views": 636,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV11CC1YpE9F/"
          },
          {
            "bvid": "BV1x1CoYDEWx",
            "title": "【Hypixel官方短视频】弹跳猪：世界上最可爱的河马🦛🥹",
            "cover": "/media/bilibili/collections/3832038/BV1x1CoYDEWx.webp",
            "coverAlt": "【Hypixel官方短视频】弹跳猪：世界上最可爱的河马🦛🥹",
            "date": "2024-10-19",
            "durationSeconds": 15,
            "views": 763,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1x1CoYDEWx/"
          },
          {
            "bvid": "BV1wQy6YiEjb",
            "title": "【Hypixel官方短视频】来和我的宝贝们玩玩👻哪只惊悚的幽灵是你的最爱？🫣",
            "cover": "/media/bilibili/collections/3832038/BV1wQy6YiEjb.webp",
            "coverAlt": "【Hypixel官方短视频】来和我的宝贝们玩玩👻哪只惊悚的幽灵是你的最爱？🫣",
            "date": "2024-10-24",
            "durationSeconds": 24,
            "views": 1142,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1wQy6YiEjb/"
          },
          {
            "bvid": "BV1qJy6YtEfi",
            "title": "【Hypixel官方短视频】绵羊战争更新🐑 快去看看新的8张地图吧！",
            "cover": "/media/bilibili/collections/3832038/BV1qJy6YtEfi.webp",
            "coverAlt": "【Hypixel官方短视频】绵羊战争更新🐑 快去看看新的8张地图吧！",
            "date": "2024-10-24",
            "durationSeconds": 31,
            "views": 759,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1qJy6YtEfi/"
          },
          {
            "bvid": "BV1UmSRYAEJ9",
            "title": "【Hypixel官方短视频】建筑家们，准备好迎接新的建筑大师模式——速搭模式！",
            "cover": "/media/bilibili/collections/3832038/BV1UmSRYAEJ9.webp",
            "coverAlt": "【Hypixel官方短视频】建筑家们，准备好迎接新的建筑大师模式——速搭模式！",
            "date": "2024-11-01",
            "durationSeconds": 28,
            "views": 819,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1UmSRYAEJ9/"
          },
          {
            "bvid": "BV1xQSRYbEMR",
            "title": "【Hypixel官方短视频】警匪大战更新！快去看看新的等级系统以及更多新东西！",
            "cover": "/media/bilibili/collections/3832038/BV1xQSRYbEMR.webp",
            "coverAlt": "【Hypixel官方短视频】警匪大战更新！快去看看新的等级系统以及更多新东西！",
            "date": "2024-11-01",
            "durationSeconds": 40,
            "views": 920,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1xQSRYbEMR/"
          },
          {
            "bvid": "BV19MBiYoE4R",
            "title": "【Hypixel官方短视频】有只狐狸好像看起来有点好笑——在评论区留下你最喜欢的那只吧",
            "cover": "/media/bilibili/collections/3832038/BV19MBiYoE4R.webp",
            "coverAlt": "【Hypixel官方短视频】有只狐狸好像看起来有点好笑——在评论区留下你最喜欢的那只吧",
            "date": "2024-11-22",
            "durationSeconds": 29,
            "views": 1650,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV19MBiYoE4R/"
          },
          {
            "bvid": "BV15TBiYbEBc",
            "title": "【Hypixel官方短视频】建筑大师更新！速搭，绿宝石，岛屿......还有更多",
            "cover": "/media/bilibili/collections/3832038/BV15TBiYbEBc.webp",
            "coverAlt": "【Hypixel官方短视频】建筑大师更新！速搭，绿宝石，岛屿......还有更多",
            "date": "2024-11-22",
            "durationSeconds": 38,
            "views": 630,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV15TBiYbEBc/"
          },
          {
            "bvid": "BV15TBiYbEu1",
            "title": "【Hypixel官方短视频】相信我，我们都曾经是这样的",
            "cover": "/media/bilibili/collections/3832038/BV15TBiYbEu1.webp",
            "coverAlt": "【Hypixel官方短视频】相信我，我们都曾经是这样的",
            "date": "2024-11-22",
            "durationSeconds": 9,
            "views": 1841,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV15TBiYbEu1/"
          },
          {
            "bvid": "BV12WBiYmEj5",
            "title": "【Hypixel官方短视频】逗僵尸玩是你的任务！🧟",
            "cover": "/media/bilibili/collections/3832038/BV12WBiYmEj5.webp",
            "coverAlt": "【Hypixel官方短视频】逗僵尸玩是你的任务！🧟",
            "date": "2024-11-22",
            "durationSeconds": 11,
            "views": 758,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV12WBiYmEj5/"
          },
          {
            "bvid": "BV1KxBiYjEcS",
            "title": "【Hypixel官方短视频】战争领主现已更新！探索新的地图，特殊加成以及更多吧！",
            "cover": "/media/bilibili/collections/3832038/BV1KxBiYjEcS.webp",
            "coverAlt": "【Hypixel官方短视频】战争领主现已更新！探索新的地图，特殊加成以及更多吧！",
            "date": "2024-11-22",
            "durationSeconds": 33,
            "views": 759,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1KxBiYjEcS/"
          },
          {
            "bvid": "BV1b7BiYSEGE",
            "title": "【Hypixel官方短视频】我明明只是只小田鼠，为什么他们都说我有害💔",
            "cover": "/media/bilibili/collections/3832038/BV1b7BiYSEGE.webp",
            "coverAlt": "【Hypixel官方短视频】我明明只是只小田鼠，为什么他们都说我有害💔",
            "date": "2024-11-22",
            "durationSeconds": 14,
            "views": 891,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1b7BiYSEGE/"
          },
          {
            "bvid": "BV1gjBiYpExk",
            "title": "【Hypixel官方短视频】当你建出这个雕像时，一段神秘的故事便会开启",
            "cover": "/media/bilibili/collections/3832038/BV1gjBiYpExk.webp",
            "coverAlt": "【Hypixel官方短视频】当你建出这个雕像时，一段神秘的故事便会开启",
            "date": "2024-11-22",
            "durationSeconds": 8,
            "views": 5297,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1gjBiYpExk/"
          },
          {
            "bvid": "BV1SjBiYHEsM",
            "title": "【Hypixel官方短视频】你能多快猜到建筑的主题？别错过最后的谜底！",
            "cover": "/media/bilibili/collections/3832038/BV1SjBiYHEsM.webp",
            "coverAlt": "【Hypixel官方短视频】你能多快猜到建筑的主题？别错过最后的谜底！",
            "date": "2024-11-22",
            "durationSeconds": 35,
            "views": 2346,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1SjBiYHEsM/"
          },
          {
            "bvid": "BV1MABzYoEqL",
            "title": "【Hypixel官方短视频】空岛生存0.20.8现已更新，害虫，巧克力工厂还有更多！",
            "cover": "/media/bilibili/collections/3832038/BV1MABzYoEqL.webp",
            "coverAlt": "【Hypixel官方短视频】空岛生存0.20.8现已更新，害虫，巧克力工厂还有更多！",
            "date": "2024-11-22",
            "durationSeconds": 33,
            "views": 820,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1MABzYoEqL/"
          },
          {
            "bvid": "BV1SwBzYbEJd",
            "title": "【Hypixel官方短视频】妈妈，你背后有个女孩！💜",
            "cover": "/media/bilibili/collections/3832038/BV1SwBzYbEJd.webp",
            "coverAlt": "【Hypixel官方短视频】妈妈，你背后有个女孩！💜",
            "date": "2024-11-22",
            "durationSeconds": 10,
            "views": 871,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1SwBzYbEJd/"
          },
          {
            "bvid": "BV18SqZYLEvS",
            "title": "【Hypixel官方短视频】你肯定猜不到...难道你可以吗？如果你的直觉是对的那就快去评论区评论吧！🪄",
            "cover": "/media/bilibili/collections/3832038/BV18SqZYLEvS.webp",
            "coverAlt": "【Hypixel官方短视频】你肯定猜不到...难道你可以吗？如果你的直觉是对的那就快去评论区评论吧！🪄",
            "date": "2024-12-15",
            "durationSeconds": 35,
            "views": 1345,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV18SqZYLEvS/"
          },
          {
            "bvid": "BV1v6qZYHEwA",
            "title": "【Hypixel官方短视频】你能活下去吗？灾难模式现已在测试大厅推出！",
            "cover": "/media/bilibili/collections/3832038/BV1v6qZYHEwA.webp",
            "coverAlt": "【Hypixel官方短视频】你能活下去吗？灾难模式现已在测试大厅推出！",
            "date": "2024-12-15",
            "durationSeconds": 48,
            "views": 1497,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1v6qZYHEwA/"
          },
          {
            "bvid": "BV1aCqZYJEtt",
            "title": "【Hypixel官方短视频】节日快乐！你试过新的季节性小游戏了吗？",
            "cover": "/media/bilibili/collections/3832038/BV1aCqZYJEtt.webp",
            "coverAlt": "【Hypixel官方短视频】节日快乐！你试过新的季节性小游戏了吗？",
            "date": "2024-12-15",
            "durationSeconds": 39,
            "views": 962,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1aCqZYJEtt/"
          },
          {
            "bvid": "BV1yFqfYBE9C",
            "title": "【Hypixel官方短视频】Hypixel空岛生存山顶现已推出！准备好加入巫师之旅了吗？",
            "cover": "/media/bilibili/collections/3832038/BV1yFqfYBE9C.webp",
            "coverAlt": "【Hypixel官方短视频】Hypixel空岛生存山顶现已推出！准备好加入巫师之旅了吗？",
            "date": "2024-12-15",
            "durationSeconds": 40,
            "views": 1017,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1yFqfYBE9C/"
          },
          {
            "bvid": "BV12crgY7ED3",
            "title": "【Hypixel官方短视频】作为巫师，你喜欢哪座塔？",
            "cover": "/media/bilibili/collections/3832038/BV12crgY7ED3.webp",
            "coverAlt": "【Hypixel官方短视频】作为巫师，你喜欢哪座塔？",
            "date": "2025-01-06",
            "durationSeconds": 32,
            "views": 850,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV12crgY7ED3/"
          },
          {
            "bvid": "BV1mfruYUEYd",
            "title": "【Hypixel官方短视频】年末将近，来看看空岛生存全年回顾吧！",
            "cover": "/media/bilibili/collections/3832038/BV1mfruYUEYd.webp",
            "coverAlt": "【Hypixel官方短视频】年末将近，来看看空岛生存全年回顾吧！",
            "date": "2025-01-06",
            "durationSeconds": 47,
            "views": 788,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1mfruYUEYd/"
          },
          {
            "bvid": "BV1B7rgYiESs",
            "title": "【Hypixel官方短视频】雪季之美！来选取你喜爱的水晶球吧！",
            "cover": "/media/bilibili/collections/3832038/BV1B7rgYiESs.webp",
            "coverAlt": "【Hypixel官方短视频】雪季之美！来选取你喜爱的水晶球吧！",
            "date": "2025-01-06",
            "durationSeconds": 28,
            "views": 949,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1B7rgYiESs/"
          },
          {
            "bvid": "BV1wgrgYGERo",
            "title": "【Minecraft官方短视频】Hypixel为你献上的节日快乐！享受这个温馨的延时摄影吧！",
            "cover": "/media/bilibili/collections/3832038/BV1wgrgYGERo.webp",
            "coverAlt": "【Minecraft官方短视频】Hypixel为你献上的节日快乐！享受这个温馨的延时摄影吧！",
            "date": "2025-01-06",
            "durationSeconds": 55,
            "views": 1041,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1wgrgYGERo/"
          },
          {
            "bvid": "BV1CMrgYkEwA",
            "title": "【Hypixel官方短视频】来看看这个完全基于Hypixel家园的UNO吧！",
            "cover": "/media/bilibili/collections/3832038/BV1CMrgYkEwA.webp",
            "coverAlt": "【Hypixel官方短视频】来看看这个完全基于Hypixel家园的UNO吧！",
            "date": "2025-01-06",
            "durationSeconds": 26,
            "views": 1177,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1CMrgYkEwA/"
          },
          {
            "bvid": "BV16VrgYuEQM",
            "title": "【Hypixel官方短视频】新年快乐！🎆",
            "cover": "/media/bilibili/collections/3832038/BV16VrgYuEQM.webp",
            "coverAlt": "【Hypixel官方短视频】新年快乐！🎆",
            "date": "2025-01-06",
            "durationSeconds": 8,
            "views": 915,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV16VrgYuEQM/"
          },
          {
            "bvid": "BV1MCwJeAEeq",
            "title": "【Hypixel官方短视频】我觉得你们有些人可以做些笔记🤨",
            "cover": "/media/bilibili/collections/3832038/BV1MCwJeAEeq.webp",
            "coverAlt": "【Hypixel官方短视频】我觉得你们有些人可以做些笔记🤨",
            "date": "2025-01-17",
            "durationSeconds": 9,
            "views": 1590,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1MCwJeAEeq/"
          },
          {
            "bvid": "BV17uFheMENc",
            "title": "【Hypixel官方短视频】新年新版本！空岛生存0.21.0现已更新！",
            "cover": "/media/bilibili/collections/3832038/BV17uFheMENc.webp",
            "coverAlt": "【Hypixel官方短视频】新年新版本！空岛生存0.21.0现已更新！",
            "date": "2025-01-29",
            "durationSeconds": 21,
            "views": 1080,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV17uFheMENc/"
          },
          {
            "bvid": "BV1uWFheZERR",
            "title": "【Hypixel官方短视频】真是精彩的一年！哪个小游戏是你的最爱？",
            "cover": "/media/bilibili/collections/3832038/BV1uWFheZERR.webp",
            "coverAlt": "【Hypixel官方短视频】真是精彩的一年！哪个小游戏是你的最爱？",
            "date": "2025-01-29",
            "durationSeconds": 54,
            "views": 1281,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1uWFheZERR/"
          },
          {
            "bvid": "BV1uWFheZEkX",
            "title": "【Hypixel官方短视频】空岛生存周年庆只有一周了！",
            "cover": "/media/bilibili/collections/3832038/BV1uWFheZEkX.webp",
            "coverAlt": "【Hypixel官方短视频】空岛生存周年庆只有一周了！",
            "date": "2025-01-29",
            "durationSeconds": 17,
            "views": 991,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1uWFheZEkX/"
          },
          {
            "bvid": "BV1vpNweeEDE",
            "title": "【Hypixel官方短视频】你不这样守家，你就是错的知道吗！",
            "cover": "/media/bilibili/collections/3832038/BV1vpNweeEDE.webp",
            "coverAlt": "【Hypixel官方短视频】你不这样守家，你就是错的知道吗！",
            "date": "2025-02-04",
            "durationSeconds": 8,
            "views": 3755,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1vpNweeEDE/"
          },
          {
            "bvid": "BV1LHNweNEy8",
            "title": "【Hypixel官方短视频】是时候纪念Hypixel空岛生存400周年了！",
            "cover": "/media/bilibili/collections/3832038/BV1LHNweNEy8.webp",
            "coverAlt": "【Hypixel官方短视频】是时候纪念Hypixel空岛生存400周年了！",
            "date": "2025-02-04",
            "durationSeconds": 44,
            "views": 1187,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1LHNweNEy8/"
          },
          {
            "bvid": "BV1VxNweaEr5",
            "title": "【Hypixel官方短视频】你收取了你的世纪蛋糕了吗？🎂",
            "cover": "/media/bilibili/collections/3832038/BV1VxNweaEr5.webp",
            "coverAlt": "【Hypixel官方短视频】你收取了你的世纪蛋糕了吗？🎂",
            "date": "2025-02-04",
            "durationSeconds": 15,
            "views": 1117,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1VxNweaEr5/"
          },
          {
            "bvid": "BV1xGNJeNE2a",
            "title": "【Hypixel官方短视频】记得领取空岛生存400年免费奖励（求求你了）",
            "cover": "/media/bilibili/collections/3832038/BV1xGNJeNE2a.webp",
            "coverAlt": "【Hypixel官方短视频】记得领取空岛生存400年免费奖励（求求你了）",
            "date": "2025-02-06",
            "durationSeconds": 10,
            "views": 1331,
            "section": "正片",
            "url": "https://www.bilibili.com/video/BV1xGNJeNE2a/"
          }
        ]
      }
    ]
  }
];

export function collectionForBvid(bvid: string): BilibiliCollection | undefined {
  return BILIBILI_COLLECTIONS.find((collection) => collection.videoBvid === bvid);
}
