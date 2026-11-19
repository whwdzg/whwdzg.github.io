/* 由 scripts/sync-bilibili-profile.mjs 生成，请勿手动编辑。 */
export interface BilibiliProfile {
  name: string;
  uid: string;
  avatar: string;
  sign: string;
  level: number;
  fans: number;
  following: number;
  likes: number;
  videos: number;
  articles: number;
  opus: number;
  live: {
    active: boolean;
    roomStatus: number;
    title: string;
    cover: string;
    online: number;
    roomId: number;
    url: string;
  };
}

export interface BilibiliDynamic {
  id: string;
  url: string;
  text: string;
  likes: number;
  cover: string;
}

export interface BilibiliArticle {
  id: number;
  title: string;
  summary: string;
  url: string;
  cover: string;
  date: string;
  views: number;
  likes: number;
  words: number;
}

export const BILIBILI_PROFILE_SYNCED_AT = "2026-11-19T15:06:20.052Z";

export const BILIBILI_PROFILE: BilibiliProfile = {
  "name": "沧海水鱼",
  "uid": "588003657",
  "avatar": "/media/bilibili/avatar.webp",
  "sign": "自信去尝试\n不定期更新，一咕咕很久的那种",
  "level": 6,
  "fans": 2164,
  "following": 476,
  "likes": 182892,
  "videos": 177,
  "articles": 1,
  "opus": 48,
  "live": {
    "active": false,
    "roomStatus": 1,
    "title": "来福日常~~玩bingo",
    "cover": "/media/bilibili/live-cover.jpg",
    "online": 0,
    "roomId": 23655191,
    "url": "https://live.bilibili.com/23655191"
  }
};

export const BILIBILI_DYNAMICS: BilibiliDynamic[] = [
  {
    "id": "1248714561144487970",
    "url": "https://www.bilibili.com/opus/1248714561144487970",
    "text": "关于更新&直播（26/11/8 更新版）\n\n首先给不太认识的朋友介绍一下，这里是沧海水鱼（原 滄海水魚），主要搬运Minecraft官方账号的短视频内容，同时制作一些实用向数据包，并且在剪辑新系列（来福simulation系列）\n\n鉴于一些现生问题，接下来一年内本账号和数据包会进入缓慢维持状态，不保证更新时间和频率、不保证视频翻译、不保证自制内容发布、不保证数据包更新\n\n预计周六晚上会直播（但看具体情况）\n\n一年内的话主要就是偶尔搬运短视频内容，但不会进行翻译工作，总之就是更新会缓慢，短期内我会尽量每周末搬运一波，但这也得看情况了。如果你关注我了，也许，我是说也许也没必要取关，毕竟不定期更新，关注能第一时间看到，而且等我复活也是第一时间\n[东方收藏集·浮生若梦_吃桃]",
    "likes": 6,
    "cover": ""
  },
  {
    "id": "1244622432271073304",
    "url": "https://www.bilibili.com/opus/1244622432271073304",
    "text": "来福视频一时半会是剪不出来了，重操旧业搬一下视频",
    "likes": 2,
    "cover": ""
  },
  {
    "id": "1241883016241872899",
    "url": "https://www.bilibili.com/opus/1241883016241872899",
    "text": "视频什么的。。。我咕咕咕咕咕咕咕咕咕咕咕咕咕",
    "likes": 1,
    "cover": ""
  },
  {
    "id": "1235324708551917589",
    "url": "https://www.bilibili.com/opus/1235324708551917589",
    "text": "如果顺利的话。。应该这周会把来福S3EP2的视频剪出来\n不顺利的话。。那就很不顺利了\n顺带一提，更新模组后，我ep5又没有录上语音[微笑]",
    "likes": 3,
    "cover": ""
  },
  {
    "id": "1229001597567107081",
    "url": "https://www.bilibili.com/opus/1229001597567107081",
    "text": "原谅我咕咕，感觉8月能剪出来第一期视频就不错了[笑哭]",
    "likes": 1,
    "cover": ""
  },
  {
    "id": "1223826406774931492",
    "url": "https://www.bilibili.com/opus/1223826406774931492",
    "text": "新视频录上了，新视频路上了",
    "likes": 4,
    "cover": ""
  },
  {
    "id": "1221599895689887760",
    "url": "https://www.bilibili.com/opus/1221599895689887760",
    "text": "坏消息：素材录废了\n不是也没人告诉我flashback录制还有去设置里打开svc录制啊！\n什么叫你适配了但是需要我手动打开啊[藏狐]",
    "likes": 5,
    "cover": ""
  },
  {
    "id": "1208526681013223432",
    "url": "https://www.bilibili.com/opus/1208526681013223432",
    "text": "好消息：新视频素材已经录完了\n坏消息：没时间剪\n\n如果这期效果还可以的话，以后应该会做成系列\n也是正式转向自制稿件了",
    "likes": 4,
    "cover": ""
  },
  {
    "id": "1172575768907087880",
    "url": "https://www.bilibili.com/opus/1172575768907087880",
    "text": "数据包官网上线了",
    "likes": 2,
    "cover": ""
  },
  {
    "id": "1170000334748123174",
    "url": "https://www.bilibili.com/opus/1170000334748123174",
    "text": "各位除夕快乐！",
    "likes": 3,
    "cover": ""
  },
  {
    "id": "1152751724581093395",
    "url": "https://www.bilibili.com/opus/1152751724581093395",
    "text": "新年快乐啊各位！[Phigros_诶嘿]",
    "likes": 5,
    "cover": ""
  },
  {
    "id": "1123954050467889159",
    "url": "https://www.bilibili.com/opus/1123954050467889159",
    "text": "新数据包！更好附魔",
    "likes": 2,
    "cover": ""
  },
  {
    "id": "1119905330807963656",
    "url": "https://www.bilibili.com/opus/1119905330807963656",
    "text": "数据包更新快报",
    "likes": 2,
    "cover": ""
  },
  {
    "id": "1119380807974125593",
    "url": "https://www.bilibili.com/opus/1119380807974125593",
    "text": "这几天看看有没有空，如果1.21.9/1.21.10需要重新适配的话会做一下适配（不需要适配直接可以用那我直接逃课）",
    "likes": 0,
    "cover": ""
  },
  {
    "id": "1117615082447044630",
    "url": "https://www.bilibili.com/opus/1117615082447044630",
    "text": "关于更好的合成配方数据包的更新",
    "likes": 0,
    "cover": ""
  },
  {
    "id": "1112041164127600663",
    "url": "https://www.bilibili.com/opus/1112041164127600663",
    "text": "数据包更新快报",
    "likes": 2,
    "cover": ""
  },
  {
    "id": "1099386828942737410",
    "url": "https://www.bilibili.com/opus/1099386828942737410",
    "text": "欢迎回来，京阿尼",
    "likes": 5,
    "cover": ""
  },
  {
    "id": "1095767533003210785",
    "url": "https://www.bilibili.com/opus/1095767533003210785",
    "text": "打算给自己三年时间搞一个项目，随时告吹的那种（",
    "likes": 7,
    "cover": ""
  },
  {
    "id": "1093953420446924801",
    "url": "https://www.bilibili.com/opus/1093953420446924801",
    "text": "停更通知",
    "likes": 11,
    "cover": ""
  },
  {
    "id": "1088506779148484614",
    "url": "https://www.bilibili.com/opus/1088506779148484614",
    "text": "不是？这是哪？谁这么大早把我hou过来了？\n[脱单doge]",
    "likes": 4,
    "cover": ""
  }
];

export const BILIBILI_ARTICLES: BilibiliArticle[] = [
  {
    "id": 37503252,
    "title": "海绵宝宝add-on现已到来！",
    "summary": "是谁住在你Minecraft世界海底的大菠萝里呢？ 好像有人在 \"Minecraft 中的海绵宝宝 \"？ 好吧，其实是在你的Minecraft世界里。 由 Spark Universe 和 Nickelodeon 联合推出的新的海绵宝宝add-on*已于今日发布，这意味着我们终于可以回答这个迫在眉睫的问题了： 海绵宝宝的裤子在主世界里会更方正吗？ 只有一个办法可以知道！   此add-on将为您的游戏添加一些海绵般的元素：迷人的角色、奇怪的任务、比基尼海滩建筑以及一堆有意思的东西。 在您自己的Min",
    "url": "https://www.bilibili.com/read/cv37503252",
    "cover": "/media/bilibili/article-37503252.jpg",
    "date": "2024-08-23T06:00:29.000Z",
    "views": 264,
    "likes": 4,
    "words": 730
  }
];
