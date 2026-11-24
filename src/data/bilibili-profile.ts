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

export interface BilibiliDynamicCommentEmoji {
  token: string;
  url: string;
  animated: boolean;
}

export interface BilibiliDynamicCommentImage {
  url: string;
  width: number;
  height: number;
  animated: boolean;
}

export interface BilibiliDynamicCommentReply {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  date: string;
  emojis: BilibiliDynamicCommentEmoji[];
  images: BilibiliDynamicCommentImage[];
}

export interface BilibiliDynamicComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  replyCount?: number;
  date: string;
  emojis: BilibiliDynamicCommentEmoji[];
  images: BilibiliDynamicCommentImage[];
  replies: BilibiliDynamicCommentReply[];
}

export interface BilibiliDynamic {
  id: string;
  url: string;
  text: string;
  likes: number;
  cover: string;
  date: string;
  emojis: Array<{ token: string; icon: string; jump: string }>;
  images: Array<{ url: string; width: number; height: number }>;
  stats: {
    like: number;
    coin: number;
    favorite: number;
    share: number;
    comment: number;
  };
  comments: BilibiliDynamicComment[];
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

export const BILIBILI_PROFILE_SYNCED_AT = "2026-11-24T04:18:23.818Z";

export interface BilibiliDynamicCommentProgress {
  covered: number;
  total: number;
  cycle: number;
  updatedAt: string;
  failed?: string[];
}

export const BILIBILI_DYNAMIC_COMMENT_PROGRESS: BilibiliDynamicCommentProgress = {
  "covered": 20,
  "total": 20,
  "cycle": 3,
  "updatedAt": "2026-11-24T04:18:23.223Z",
  "failed": []
};

export const BILIBILI_PROFILE: BilibiliProfile = {
  "name": "沧海水鱼",
  "uid": "588003657",
  "avatar": "/media/bilibili/avatar.webp",
  "sign": "自信去尝试\n不定期更新，一咕咕很久的那种",
  "level": 6,
  "fans": 2163,
  "following": 480,
  "likes": 182930,
  "videos": 178,
  "articles": 1,
  "opus": 48,
  "live": {
    "active": false,
    "roomStatus": 1,
    "title": "来福日常~~",
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
    "cover": "",
    "date": "2026-09-16T16:50:15.000Z",
    "emojis": [
      {
        "token": "[东方收藏集·浮生若梦_吃桃]",
        "icon": "/media/bilibili/dynamic-emoji-1248714561144487970-0.png",
        "jump": ""
      }
    ],
    "images": [],
    "stats": {
      "like": 6,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 2
    },
    "comments": [
      {
        "id": "316681401105",
        "author": "hxhej",
        "avatar": "/media/avatars/hxhej.webp",
        "text": "扣一发住址",
        "likes": 0,
        "replyCount": 1,
        "date": "2026-10-10T15:37:51.000Z",
        "emojis": [],
        "images": [],
        "replies": [
          {
            "id": "316683149617",
            "author": "沧海水鱼",
            "avatar": "/media/avatars/shuiyu.webp",
            "text": "已拉黑（不是",
            "likes": 0,
            "date": "2026-10-10T15:56:18.000Z",
            "emojis": [],
            "images": []
          }
        ]
      }
    ]
  },
  {
    "id": "1244622432271073304",
    "url": "https://www.bilibili.com/opus/1244622432271073304",
    "text": "来福视频一时半会是剪不出来了，重操旧业搬一下视频",
    "likes": 2,
    "cover": "",
    "date": "2026-09-05T16:10:42.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 2,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
  },
  {
    "id": "1241883016241872899",
    "url": "https://www.bilibili.com/opus/1241883016241872899",
    "text": "视频什么的。。。我咕咕咕咕咕咕咕咕咕咕咕咕咕",
    "likes": 1,
    "cover": "",
    "date": "2026-08-29T07:00:22.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 1,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
  },
  {
    "id": "1235324708551917589",
    "url": "https://www.bilibili.com/opus/1235324708551917589",
    "text": "如果顺利的话。。应该这周会把来福S3EP2的视频剪出来\n不顺利的话。。那就很不顺利了\n顺带一提，更新模组后，我ep5又没有录上语音[微笑]",
    "likes": 3,
    "cover": "",
    "date": "2026-08-11T14:50:47.000Z",
    "emojis": [
      {
        "token": "[微笑]",
        "icon": "/media/bilibili/dynamic-emoji-1235324708551917589-0.png",
        "jump": ""
      }
    ],
    "images": [
      {
        "url": "/media/bilibili/dynamic-1235324708551917589-0.png",
        "width": 600,
        "height": 600
      }
    ],
    "stats": {
      "like": 3,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 3
    },
    "comments": [
      {
        "id": "309920516689",
        "author": "沧海水鱼",
        "avatar": "/media/avatars/shuiyu.webp",
        "text": "那理论来说，联投了那我这期不用剪了对吧，所以素材录费了也没关系对吧（对的吧",
        "likes": 0,
        "replyCount": 0,
        "date": "2026-08-12T04:39:00.000Z",
        "emojis": [],
        "images": [],
        "replies": []
      },
      {
        "id": "309865630929",
        "author": "Allay还活着",
        "avatar": "https://i1.hdslb.com/bfs/face/4a92555d07c4cd2beec19e8645ba86c141df6161.jpg",
        "text": "哇还有安卓猫咪\n陪一张我的【超级拉面猫】",
        "likes": 0,
        "replyCount": 1,
        "date": "2026-08-11T15:20:25.000Z",
        "emojis": [],
        "images": [
          {
            "url": "https://i0.hdslb.com/bfs/new_dyn/3c0a01a88962e6b383d73364bed99f5d456938890.png",
            "width": 360,
            "height": 360,
            "animated": false
          }
        ],
        "replies": [
          {
            "id": "309919592529",
            "author": "沧海水鱼",
            "avatar": "/media/avatars/shuiyu.webp",
            "text": "没招了[笑哭]成这样了",
            "likes": 0,
            "date": "2026-08-12T04:33:02.000Z",
            "emojis": [
              {
                "token": "[笑哭]",
                "url": "https://i0.hdslb.com/bfs/emote/c3043ba94babf824dea03ce500d0e73763bf4f40.png",
                "animated": false
              }
            ],
            "images": []
          }
        ]
      }
    ]
  },
  {
    "id": "1229001597567107081",
    "url": "https://www.bilibili.com/opus/1229001597567107081",
    "text": "原谅我咕咕，感觉8月能剪出来第一期视频就不错了[笑哭]",
    "likes": 1,
    "cover": "",
    "date": "2026-07-25T13:53:53.000Z",
    "emojis": [
      {
        "token": "[笑哭]",
        "icon": "/media/bilibili/dynamic-emoji-1229001597567107081-0.png",
        "jump": ""
      }
    ],
    "images": [],
    "stats": {
      "like": 1,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
  },
  {
    "id": "1223826406774931492",
    "url": "https://www.bilibili.com/opus/1223826406774931492",
    "text": "新视频录上了，新视频路上了",
    "likes": 4,
    "cover": "",
    "date": "2026-07-11T15:11:30.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 4,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 2
    },
    "comments": [
      {
        "id": "305957815137",
        "author": "沧海水鱼",
        "avatar": "/media/avatars/shuiyu.webp",
        "text": "坏消息，录上了但没完全（",
        "likes": 0,
        "replyCount": 1,
        "date": "2026-07-13T09:29:10.000Z",
        "emojis": [],
        "images": [],
        "replies": [
          {
            "id": "306207108337",
            "author": "沧海水鱼",
            "avatar": "/media/avatars/shuiyu.webp",
            "text": "没事了其实录全了",
            "likes": 0,
            "date": "2026-07-15T07:54:05.000Z",
            "emojis": [],
            "images": []
          }
        ]
      }
    ]
  },
  {
    "id": "1221599895689887760",
    "url": "https://www.bilibili.com/opus/1221599895689887760",
    "text": "坏消息：素材录废了\n不是也没人告诉我flashback录制还有去设置里打开svc录制啊！\n什么叫你适配了但是需要我手动打开啊[藏狐]",
    "likes": 5,
    "cover": "",
    "date": "2026-07-05T15:11:30.000Z",
    "emojis": [
      {
        "token": "[藏狐]",
        "icon": "/media/bilibili/dynamic-emoji-1221599895689887760-0.png",
        "jump": ""
      }
    ],
    "images": [],
    "stats": {
      "like": 5,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 2
    },
    "comments": [
      {
        "id": "304986106081",
        "author": "hxhej",
        "avatar": "/media/avatars/hxhej.webp",
        "text": "who care？",
        "likes": 2,
        "replyCount": 0,
        "date": "2026-07-05T15:15:17.000Z",
        "emojis": [],
        "images": [],
        "replies": []
      },
      {
        "id": "304985694401",
        "author": "沧海水鱼",
        "avatar": "/media/avatars/shuiyu.webp",
        "text": "所以视频又要延期了\n下一期一定剪出来（应该一定可以了吧",
        "likes": 2,
        "replyCount": 0,
        "date": "2026-07-05T15:12:13.000Z",
        "emojis": [],
        "images": [],
        "replies": []
      }
    ]
  },
  {
    "id": "1208526681013223432",
    "url": "https://www.bilibili.com/opus/1208526681013223432",
    "text": "好消息：新视频素材已经录完了\n坏消息：没时间剪\n\n如果这期效果还可以的话，以后应该会做成系列\n也是正式转向自制稿件了",
    "likes": 4,
    "cover": "",
    "date": "2026-05-31T09:40:45.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 4,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 4
    },
    "comments": [
      {
        "id": "304254475824",
        "author": "LimitedShadow",
        "avatar": "https://i1.hdslb.com/bfs/face/947c04ad8c1e73cb38ae98642f9c0039e9b87a21.jpg",
        "text": "剪",
        "likes": 0,
        "replyCount": 1,
        "date": "2026-05-31T11:10:22.000Z",
        "emojis": [],
        "images": [],
        "replies": [
          {
            "id": "304254524272",
            "author": "LimitedShadow",
            "avatar": "https://i1.hdslb.com/bfs/face/947c04ad8c1e73cb38ae98642f9c0039e9b87a21.jpg",
            "text": "以及小知识：来福的所有相关稿件流量都很糟糕，希望你能打破这个魔咒[委屈][委屈]",
            "likes": 0,
            "date": "2026-05-31T11:11:00.000Z",
            "emojis": [
              {
                "token": "[委屈]",
                "url": "https://i0.hdslb.com/bfs/emote/d2f26cbdd6c96960320af03f5514c5b524990840.png",
                "animated": false
              }
            ],
            "images": []
          }
        ]
      },
      {
        "id": "301630929329",
        "author": "风-BEK",
        "avatar": "https://i1.hdslb.com/bfs/face/0b8d6f638deb8dc2252748f14bc32b9ca09c242a.jpg",
        "text": "挖",
        "likes": 0,
        "replyCount": 0,
        "date": "2026-06-04T14:44:07.000Z",
        "emojis": [],
        "images": [],
        "replies": []
      },
      {
        "id": "301220619297",
        "author": "影湛Viro",
        "avatar": "https://i0.hdslb.com/bfs/face/1660b31b37136288cb84307869f52d07e72c2346.jpg",
        "text": "快剪，然后把所有人引来来福simulation陪我们打麦块。",
        "likes": 0,
        "replyCount": 0,
        "date": "2026-05-31T11:10:01.000Z",
        "emojis": [],
        "images": [],
        "replies": []
      }
    ]
  },
  {
    "id": "1172575768907087880",
    "url": "https://www.bilibili.com/opus/1172575768907087880",
    "text": "更好的合成配方，更好的生物掉落，更好附魔等数据包已上线官网，支持查看数据包具体内容\nwhwdzg.github.io/projects/modrinth",
    "likes": 2,
    "cover": "",
    "date": "2026-02-23T12:32:51.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 2,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
  },
  {
    "id": "1170000334748123174",
    "url": "https://www.bilibili.com/opus/1170000334748123174",
    "text": "[Phigros_phi]",
    "likes": 3,
    "cover": "",
    "date": "2026-02-16T13:58:51.000Z",
    "emojis": [
      {
        "token": "[Phigros_phi]",
        "icon": "/media/bilibili/dynamic-emoji-1170000334748123174-0.png",
        "jump": ""
      }
    ],
    "images": [],
    "stats": {
      "like": 3,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
  },
  {
    "id": "1152751724581093395",
    "url": "https://www.bilibili.com/opus/1152751724581093395",
    "text": "新年快乐啊各位！[Phigros_诶嘿]",
    "likes": 5,
    "cover": "",
    "date": "2026-01-01T02:25:26.000Z",
    "emojis": [
      {
        "token": "[Phigros_诶嘿]",
        "icon": "/media/bilibili/dynamic-emoji-1152751724581093395-0.png",
        "jump": ""
      }
    ],
    "images": [],
    "stats": {
      "like": 5,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
  },
  {
    "id": "1123954050467889159",
    "url": "https://www.bilibili.com/opus/1123954050467889159",
    "text": "更改一些原版附魔的效果和适用范围\nMCMOD：https://www.mcmod.cn/class/22543.html\nModrinth：https://modrinth.com/datapack/better-enchantment",
    "likes": 2,
    "cover": "",
    "date": "2025-10-15T11:55:45.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 2,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 2
    },
    "comments": [
      {
        "id": "277930498625",
        "author": "DFT219",
        "avatar": "https://i1.hdslb.com/bfs/face/9e1bbfbf552f26d42295eed9f4d4d1b38fdf1e3c.jpg",
        "text": "已安装，很期待，支持[doge_金箍]",
        "likes": 0,
        "replyCount": 0,
        "date": "2025-10-17T14:04:07.000Z",
        "emojis": [
          {
            "token": "[doge_金箍]",
            "url": "https://i0.hdslb.com/bfs/emote/aadaca1895e09c5596fc6365192ec93a23718cf0.png",
            "animated": false
          }
        ],
        "images": [],
        "replies": []
      },
      {
        "id": "277737838705",
        "author": "影湛Viro",
        "avatar": "https://i0.hdslb.com/bfs/face/1660b31b37136288cb84307869f52d07e72c2346.jpg",
        "text": "支持",
        "likes": 0,
        "replyCount": 0,
        "date": "2025-10-15T13:40:16.000Z",
        "emojis": [],
        "images": [],
        "replies": []
      }
    ]
  },
  {
    "id": "1119905330807963656",
    "url": "https://www.bilibili.com/opus/1119905330807963656",
    "text": "更好的生物掉落1.2.4\n更好的合成配方1.9.1\n\n适配了1.21.9+版本的pack.mcmeta格式",
    "likes": 2,
    "cover": "",
    "date": "2025-10-04T14:04:39.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 2,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 1
    },
    "comments": [
      {
        "id": "276592448513",
        "author": "沧海水鱼",
        "avatar": "/media/avatars/shuiyu.webp",
        "text": "逃课失败，这波还是得适配，顺便把全部的资源包和数据包版本号都适配了各个版本的语法",
        "likes": 1,
        "replyCount": 0,
        "date": "2025-10-04T14:07:02.000Z",
        "emojis": [],
        "images": [],
        "replies": []
      }
    ]
  },
  {
    "id": "1119380807974125593",
    "url": "https://www.bilibili.com/opus/1119380807974125593",
    "text": "这几天看看有没有空，如果1.21.9/1.21.10需要重新适配的话会做一下适配（不需要适配直接可以用那我直接逃课）",
    "likes": 0,
    "cover": "",
    "date": "2025-10-03T04:09:14.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 0,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
  },
  {
    "id": "1117615082447044630",
    "url": "https://www.bilibili.com/opus/1117615082447044630",
    "text": "我发起了一个投票​关于是否要加入生物蛋配方\n另外各位觉得有没有必要加切石机加工木板的配方",
    "likes": 0,
    "cover": "",
    "date": "2025-09-28T09:57:19.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 0,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
  },
  {
    "id": "1112041164127600663",
    "url": "https://www.bilibili.com/opus/1112041164127600663",
    "text": "whwdzg的配方（whwdzg' Recipe)现已在1.9.0版本已更名为更好的合成配方（Better Crafting Recipes）",
    "likes": 2,
    "cover": "",
    "date": "2025-09-13T09:27:40.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 2,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 4
    },
    "comments": [
      {
        "id": "274547605057",
        "author": "hxhej",
        "avatar": "/media/avatars/hxhej.webp",
        "text": "删我评论LLL",
        "likes": 0,
        "replyCount": 1,
        "date": "2025-09-13T10:07:53.000Z",
        "emojis": [],
        "images": [],
        "replies": [
          {
            "id": "274551013233",
            "author": "沧海水鱼",
            "avatar": "/media/avatars/shuiyu.webp",
            "text": "谁没事删你评论",
            "likes": 0,
            "date": "2025-09-13T10:43:04.000Z",
            "emojis": [],
            "images": []
          }
        ]
      },
      {
        "id": "274545472529",
        "author": "影湛Viro",
        "avatar": "https://i0.hdslb.com/bfs/face/1660b31b37136288cb84307869f52d07e72c2346.jpg",
        "text": "大师级更新",
        "likes": 0,
        "replyCount": 1,
        "date": "2025-09-13T09:46:53.000Z",
        "emojis": [],
        "images": [],
        "replies": [
          {
            "id": "274551144609",
            "author": "沧海水鱼",
            "avatar": "/media/avatars/shuiyu.webp",
            "text": "战略性更名[doge]",
            "likes": 0,
            "date": "2025-09-13T10:43:30.000Z",
            "emojis": [
              {
                "token": "[doge]",
                "url": "https://i0.hdslb.com/bfs/emote/3087d273a78ccaff4bb1e9972e2ba2a7583c9f11.png",
                "animated": false
              }
            ],
            "images": []
          }
        ]
      }
    ]
  },
  {
    "id": "1099386828942737410",
    "url": "https://www.bilibili.com/opus/1099386828942737410",
    "text": "欢迎回来，京阿尼",
    "likes": 5,
    "cover": "",
    "date": "2025-08-10T07:02:23.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 5,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
  },
  {
    "id": "1095767533003210785",
    "url": "https://www.bilibili.com/opus/1095767533003210785",
    "text": "打算给自己三年时间搞一个项目，随时告吹的那种（",
    "likes": 7,
    "cover": "",
    "date": "2025-07-31T12:57:40.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 7,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 4
    },
    "comments": [
      {
        "id": "269582097265",
        "author": "hxhej",
        "avatar": "/media/avatars/hxhej.webp",
        "text": "招。。。笑",
        "likes": 1,
        "replyCount": 2,
        "date": "2025-07-31T13:06:49.000Z",
        "emojis": [],
        "images": [],
        "replies": [
          {
            "id": "269582951409",
            "author": "沧海水鱼",
            "avatar": "/media/avatars/shuiyu.webp",
            "text": "别笑，如果这个项目有戏的话，以后可能找你",
            "likes": 1,
            "date": "2025-07-31T13:14:06.000Z",
            "emojis": [],
            "images": []
          },
          {
            "id": "269588644369",
            "author": "hxhej",
            "avatar": "/media/avatars/hxhej.webp",
            "text": "回复 @滄海水魚 :好的，不笑了",
            "likes": 1,
            "date": "2025-07-31T13:59:09.000Z",
            "emojis": [],
            "images": []
          }
        ]
      },
      {
        "id": "269657529937",
        "author": "影湛Viro",
        "avatar": "https://i0.hdslb.com/bfs/face/1660b31b37136288cb84307869f52d07e72c2346.jpg",
        "text": "[支持]",
        "likes": 0,
        "replyCount": 0,
        "date": "2025-08-01T05:35:14.000Z",
        "emojis": [
          {
            "token": "[支持]",
            "url": "https://i0.hdslb.com/bfs/emote/3c210366a5585706c09d4c686a9d942b39feeb50.png",
            "animated": false
          }
        ],
        "images": [],
        "replies": []
      }
    ]
  },
  {
    "id": "1093953420446924801",
    "url": "https://www.bilibili.com/opus/1093953420446924801",
    "text": "马上就是搬运视频一周年了\n很遗憾的是由于个人原因将暂停搬运工作\n感谢一年来各位的支持！",
    "likes": 11,
    "cover": "",
    "date": "2025-07-26T15:37:59.000Z",
    "emojis": [],
    "images": [],
    "stats": {
      "like": 11,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
  },
  {
    "id": "1088506779148484614",
    "url": "https://www.bilibili.com/opus/1088506779148484614",
    "text": "不是？这是哪？谁这么大早把我hou过来了？\n[脱单doge]",
    "likes": 4,
    "cover": "",
    "date": "2025-07-11T23:22:14.000Z",
    "emojis": [
      {
        "token": "[脱单doge]",
        "icon": "/media/bilibili/dynamic-emoji-1088506779148484614-0.png",
        "jump": ""
      }
    ],
    "images": [],
    "stats": {
      "like": 4,
      "coin": 0,
      "favorite": 0,
      "share": 0,
      "comment": 0
    },
    "comments": []
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
    "views": 267,
    "likes": 4,
    "words": 730
  }
];
