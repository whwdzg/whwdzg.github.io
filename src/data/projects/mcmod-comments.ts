/* 由 scripts/sync-mcmod-comments.mjs 生成，请勿手动编辑。 */
export interface McmodReply {
  id: string;
  author: string;
  avatar: string;
  replyTo: string;
  date: string;
  relative: string;
  likes: number;
  text: string;
}

export interface McmodComment {
  id: string;
  author: string;
  avatar: string;
  floor: string;
  date: string;
  relative: string;
  channel: number;
  replyCount: number;
  likes: number;
  text: string;
  replies: McmodReply[];
}

export type McmodComments = Record<string, McmodComment[]>;

export const MCMOD_COMMENTS_SYNCED_AT = "2026-11-19T15:12:48.547Z";

export const MCMOD_COMMENTS: McmodComments = {
  "better-crafting-recipes": [
    {
      "id": "2389199",
      "author": "Sha_you",
      "avatar": "https://i.mcmod.cn/user/avatar/129/1293544/1293544_1765545130_EFok.png@60x60.jpg",
      "floor": "8楼",
      "date": "2026-10-25 10:50:21",
      "relative": "25天前",
      "channel": 1,
      "replyCount": 2,
      "likes": 0,
      "text": "这个跟更多配方哪个更好用",
      "replies": [
        {
          "id": "2416550",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2026-11-16 22:59:54",
          "relative": "3天前",
          "likes": 0,
          "text": "这个没有模组联动内容awa"
        },
        {
          "id": "2416553",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2026-11-16 23:01:46",
          "relative": "3天前",
          "likes": 0,
          "text": "但是因为是采用数据包，兼容性最好且轻量"
        }
      ]
    },
    {
      "id": "2201598",
      "author": "xiuqiu",
      "avatar": "https://www.mcmod.cn/static/public/images/identicons/30.jpg",
      "floor": "7楼",
      "date": "2026-07-09 16:50:11",
      "relative": "4月前",
      "channel": 1,
      "replyCount": 0,
      "likes": 0,
      "text": "非常好模组",
      "replies": []
    },
    {
      "id": "2054163",
      "author": "自闭头患者",
      "avatar": "https://i.mcmod.cn/user/avatar/80/802040/802040_1770797500_ArWV.png@60x60.jpg",
      "floor": "6楼",
      "date": "2026-03-22 09:31:49",
      "relative": "8月前",
      "channel": 1,
      "replyCount": 0,
      "likes": 0,
      "text": "伟大，无需多言",
      "replies": []
    },
    {
      "id": "1978253",
      "author": "dy毁飞",
      "avatar": "https://i.mcmod.cn/user/avatar/18/183558/183558_1752639852_WzAm.png@60x60.jpg",
      "floor": "5楼",
      "date": "2026-01-28 16:22:37",
      "relative": "9月前",
      "channel": 1,
      "replyCount": 4,
      "likes": 0,
      "text": "具体都有什么配方我去GitHub或者modrinth里面翻更新日志也没有希望作者能展示出来",
      "replies": [
        {
          "id": "2003072",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2026-02-14 14:18:59",
          "relative": "9月前",
          "likes": 0,
          "text": "最近在写网页，准备自己做个展示网站"
        },
        {
          "id": "2003074",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2026-02-14 14:19:40",
          "relative": "9月前",
          "likes": 0,
          "text": "估计一周后会做好"
        },
        {
          "id": "2008516",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2026-02-17 23:54:00",
          "relative": "9月前",
          "likes": 3,
          "text": "https://whwdzg.github.io/projects/better-crafting-recipes.html"
        },
        {
          "id": "2050201",
          "author": "350524",
          "avatar": "https://www.mcmod.cn/static/public/images/identicons/d7.jpg",
          "replyTo": "whwdzg",
          "date": "2026-03-19 14:09:09",
          "relative": "8月前",
          "likes": 0,
          "text": "谢谢"
        }
      ]
    },
    {
      "id": "1906224",
      "author": "画的末路",
      "avatar": "https://www.mcmod.cn/static/public/images/identicons/68.jpg",
      "floor": "4楼",
      "date": "2025-12-03 14:48:45",
      "relative": "11月前",
      "channel": 1,
      "replyCount": 7,
      "likes": 2,
      "text": "在1.21.1的neoforge版本中，模组提供的将任意头颅烧炼成骷髅头颅的配方，对骷髅头颅本体也生效，导致可以无限的重复烧制，大量刷取经验，这应该是bug吧",
      "replies": [
        {
          "id": "1906226",
          "author": "画的末路",
          "avatar": "https://www.mcmod.cn/static/public/images/identicons/68.jpg",
          "replyTo": "",
          "date": "2025-12-03 14:50:44",
          "relative": "11月前",
          "likes": 0,
          "text": "烧一次给50经验，一个煤炭能烧400经验，如果不是bug的话，最好还是调低经验收益吧"
        },
        {
          "id": "1923215",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-12-17 18:34:41",
          "relative": "11月前",
          "likes": 2,
          "text": "收到！是bug，有空我会修复"
        },
        {
          "id": "1923246",
          "author": "画的末路",
          "avatar": "https://www.mcmod.cn/static/public/images/identicons/68.jpg",
          "replyTo": "whwdzg",
          "date": "2025-12-17 19:07:25",
          "relative": "11月前",
          "likes": 0,
          "text": "好勤奋的模组作者"
        },
        {
          "id": "1947542",
          "author": "画的末路",
          "avatar": "https://www.mcmod.cn/static/public/images/identicons/68.jpg",
          "replyTo": "whwdzg",
          "date": "2026-01-04 18:47:09",
          "relative": "10月前",
          "likes": 0,
          "text": "模组作者，你还记得这个bug吗"
        },
        {
          "id": "1963898",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "画的末路",
          "date": "2026-01-17 11:31:27",
          "relative": "10月前",
          "likes": 0,
          "text": "最近比较忙😭月底和别的bug一起修"
        },
        {
          "id": "1965618",
          "author": "画的末路",
          "avatar": "https://www.mcmod.cn/static/public/images/identicons/68.jpg",
          "replyTo": "whwdzg",
          "date": "2026-01-18 14:16:03",
          "relative": "10月前",
          "likes": 0,
          "text": "辛苦了"
        },
        {
          "id": "2003073",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "画的末路",
          "date": "2026-02-14 14:19:12",
          "relative": "9月前",
          "likes": 0,
          "text": "1.9.2已修复"
        }
      ]
    },
    {
      "id": "1812602",
      "author": "Xiuming_xm",
      "avatar": "https://i.mcmod.cn/user/avatar/90/904720/904720_1783835533_ogLq.png@60x60.jpg",
      "floor": "3楼",
      "date": "2025-09-17 12:19:21",
      "relative": "1年前",
      "channel": 1,
      "replyCount": 1,
      "likes": 0,
      "text": "mdr链接没了",
      "replies": [
        {
          "id": "1814155",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-09-18 20:35:58",
          "relative": "1年前",
          "likes": 2,
          "text": "当前更名为更好的合成配方，对应链接变更为https://modrinth.com/datapack/better-crafting-recipes，百科编辑审核尚未通过"
        }
      ]
    },
    {
      "id": "1435228",
      "author": "涅槃",
      "avatar": "https://i.mcmod.cn/user/avatar/63/633045/633045_1684741245_akvW.png@60x60.jpg",
      "floor": "2楼",
      "date": "2025-01-02 07:21:07",
      "relative": "1年前",
      "channel": 1,
      "replyCount": 13,
      "likes": 0,
      "text": "1.20.1没有这个进度树啊，是不是因为模组数量太多导致的？（模组数量300个左右）",
      "replies": [
        {
          "id": "1436086",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-01-02 23:51:50",
          "relative": "1年前",
          "likes": 0,
          "text": "进度树只做了1.21+的新版本，1.20-以后可能下放"
        },
        {
          "id": "1436094",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-01-03 00:01:52",
          "relative": "1年前",
          "likes": 0,
          "text": "这周末就出个版本下放进度树"
        },
        {
          "id": "1436147",
          "author": "涅槃",
          "avatar": "https://i.mcmod.cn/user/avatar/63/633045/633045_1684741245_akvW.png@60x60.jpg",
          "replyTo": "whwdzg",
          "date": "2025-01-03 01:30:39",
          "relative": "1年前",
          "likes": 0,
          "text": "哦，原来如此，我还以为是我这边卡bug了（毕竟模组太多）"
        },
        {
          "id": "1437145",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-01-04 00:04:22",
          "relative": "1年前",
          "likes": 2,
          "text": "已更新1.7.0.0，为1.20.4-版本下放了进度树"
        },
        {
          "id": "1438078",
          "author": "涅槃",
          "avatar": "https://i.mcmod.cn/user/avatar/63/633045/633045_1684741245_akvW.png@60x60.jpg",
          "replyTo": "whwdzg",
          "date": "2025-01-04 19:06:45",
          "relative": "1年前",
          "likes": 0,
          "text": "经过测试，1.7.0.0在客户端上貌似没啥问题，但在服务端上会导致服务端产生报错。\n服务端启动日志（初次启动）：https://mclo.gs/1cahZmE"
        },
        {
          "id": "1438245",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "涅槃",
          "date": "2025-01-04 20:07:44",
          "relative": "1年前",
          "likes": 0,
          "text": "报错是因为里面模组里包含了一些函数，但是本身功能没有调用函数，所以报错没关系"
        },
        {
          "id": "1438600",
          "author": "涅槃",
          "avatar": "https://i.mcmod.cn/user/avatar/63/633045/633045_1684741245_akvW.png@60x60.jpg",
          "replyTo": "whwdzg",
          "date": "2025-01-04 21:52:56",
          "relative": "1年前",
          "likes": 0,
          "text": "嗯，不过要是能解决那再好不过了。毕竟看着报错心里膈应总担心出问题"
        },
        {
          "id": "1439510",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "涅槃",
          "date": "2025-01-05 15:04:11",
          "relative": "1年前",
          "likes": 0,
          "text": "下个版本有空解决"
        },
        {
          "id": "1439686",
          "author": "涅槃",
          "avatar": "https://i.mcmod.cn/user/avatar/63/633045/633045_1684741245_akvW.png@60x60.jpg",
          "replyTo": "whwdzg",
          "date": "2025-01-05 16:59:59",
          "relative": "1年前",
          "likes": 0,
          "text": "好的，感激不尽"
        },
        {
          "id": "1441986",
          "author": "我是一只虫单QAQ",
          "avatar": "https://i.mcmod.cn/user/avatar/73/730107/730107_1723906575_acwJ.png@60x60.jpg",
          "replyTo": "whwdzg",
          "date": "2025-01-07 12:18:39",
          "relative": "1年前",
          "likes": 0,
          "text": "头骨移植成就怎么做呀QWQ"
        },
        {
          "id": "1446129",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "我是一只虫单QAQ",
          "date": "2025-01-10 20:51:35",
          "relative": "1年前",
          "likes": 0,
          "text": "目前有bug，无法触发，请忽略"
        },
        {
          "id": "1446641",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "whwdzg",
          "date": "2025-01-11 09:52:41",
          "relative": "1年前",
          "likes": 0,
          "text": "1.7.1已解决"
        },
        {
          "id": "1446642",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "我是一只虫单QAQ",
          "date": "2025-01-11 09:53:02",
          "relative": "1年前",
          "likes": 0,
          "text": "1.7.1暂时隐藏"
        }
      ]
    },
    {
      "id": "1434162",
      "author": "hxhej",
      "avatar": "/media/avatars/hxhej.webp",
      "floor": "1楼",
      "date": "2025-01-01 14:37:59",
      "relative": "1年前",
      "channel": 1,
      "replyCount": 0,
      "likes": 0,
      "text": "666长本事了",
      "replies": []
    },
    {
      "id": "1430978",
      "author": "BunnimimiTotem",
      "avatar": "https://i.mcmod.cn/user/avatar/27/276896/276896_1674991907_dGkj.png@60x60.jpg",
      "floor": "1楼",
      "date": "2024-12-30 00:25:31",
      "relative": "1年前",
      "channel": 2,
      "replyCount": 0,
      "likes": 0,
      "text": "国创\nMRID：aCXZzFav",
      "replies": []
    }
  ],
  "better-enchantments": [],
  "better-mob-drop": [
    {
      "id": "2413886",
      "author": "QQ酱1072807",
      "avatar": "https://www.mcmod.cn/static/public/images/identicons/df.jpg",
      "floor": "9楼",
      "date": "2026-11-14 20:42:28",
      "relative": "5天前",
      "channel": 1,
      "replyCount": 1,
      "likes": 0,
      "text": "作者大大会更新26的fabric版本的吗，",
      "replies": [
        {
          "id": "2418976",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2026-11-18 23:37:20",
          "relative": "23时前",
          "likes": 0,
          "text": "已更新"
        }
      ]
    },
    {
      "id": "2216025",
      "author": "JimmyRen520",
      "avatar": "https://i.mcmod.cn/user/avatar/31/319169/319169_1777618017_IsCS.png@60x60.jpg",
      "floor": "8楼",
      "date": "2026-07-18 17:25:40",
      "relative": "4月前",
      "channel": 1,
      "replyCount": 0,
      "likes": 2,
      "text": "能让蛮兵掉合金挺强的，尽管我的蛮兵还能拿金盾冲击",
      "replies": []
    },
    {
      "id": "2042181",
      "author": "0721",
      "avatar": "https://i.mcmod.cn/user/avatar/17/174991/174991_1771249160_WULm.png@60x60.jpg",
      "floor": "7楼",
      "date": "2026-03-12 21:23:45",
      "relative": "8月前",
      "channel": 1,
      "replyCount": 2,
      "likes": 0,
      "text": "挺强的mod，就是有点太强了（比如说屠村得绿宝石，然后直接再找一个村庄交易即可，甚至繁殖机刷绿宝石（）",
      "replies": [
        {
          "id": "2206721",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2026-07-12 19:51:24",
          "relative": "4月前",
          "likes": 0,
          "text": "其实能繁殖机的话就不太缺绿宝石了吧"
        },
        {
          "id": "2219921",
          "author": "0721",
          "avatar": "https://i.mcmod.cn/user/avatar/17/174991/174991_1771249160_WULm.png@60x60.jpg",
          "replyTo": "whwdzg",
          "date": "2026-07-20 21:16:35",
          "relative": "4月前",
          "likes": 0,
          "text": "也是"
        }
      ]
    },
    {
      "id": "1891281",
      "author": "Bobbychina32747",
      "avatar": "https://i.mcmod.cn/user/avatar/71/718785/718785_1792039425_hZZa.png@60x60.jpg",
      "floor": "6楼",
      "date": "2025-11-20 18:14:34",
      "relative": "12月前",
      "channel": 1,
      "replyCount": 1,
      "likes": 1,
      "text": "纠错纠错\n“最新版本的Minecraft中，Mojang为了所谓保护生物，很多生物都没有对应的凋落物，而这个数据包/模组就是为了解决这个问题的！”https://modrinth.com/datapack/better-mob-drop\n“掉落物”写成了“调落物”\n$(\"#link_KsiECKgmrUTKfoAD\").webuiPopover({title:\"这是一个站外链接\",content:\"此链接会跳转到:\nhttps://modrinth.com/datapack/better-mob-drop\n\n前往链接不要再提示我\n\",trigger:\"click\",closeable:true,delay:0});",
      "replies": [
        {
          "id": "1901857",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-11-29 18:15:47",
          "relative": "11月前",
          "likes": 0,
          "text": "感谢！已修改"
        }
      ]
    },
    {
      "id": "1866561",
      "author": "Sixbpm",
      "avatar": "https://i.mcmod.cn/user/avatar/108/1088012/1088012_1787246000_cXQs.png@60x60.jpg",
      "floor": "5楼",
      "date": "2025-10-29 20:28:41",
      "relative": "1年前",
      "channel": 1,
      "replyCount": 0,
      "likes": 0,
      "text": "封面看成坤坤中分了我还有救吗",
      "replies": []
    },
    {
      "id": "1522309",
      "author": "俺是耕田滴",
      "avatar": "https://i.mcmod.cn/user/avatar/47/479730/479730_1743224768_WqZe.png@60x60.jpg",
      "floor": "4楼",
      "date": "2025-03-04 16:15:45",
      "relative": "1年前",
      "channel": 1,
      "replyCount": 6,
      "likes": 2,
      "text": "有没有办法删掉这个包加入的进度",
      "replies": [
        {
          "id": "1531838",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-03-11 16:51:49",
          "relative": "1年前",
          "likes": 0,
          "text": "你有需要的话我可以额外删除后提供给你"
        },
        {
          "id": "1531846",
          "author": "俺是耕田滴",
          "avatar": "https://i.mcmod.cn/user/avatar/47/479730/479730_1743224768_WqZe.png@60x60.jpg",
          "replyTo": "whwdzg",
          "date": "2025-03-11 16:54:55",
          "relative": "1年前",
          "likes": 0,
          "text": "天哪，谢谢你，我确实需要一个数据包格式的"
        },
        {
          "id": "1531915",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "俺是耕田滴",
          "date": "2025-03-11 17:58:44",
          "relative": "1年前",
          "likes": 0,
          "text": "你需要1.21以上的还是1.20及以下的"
        },
        {
          "id": "1531933",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-03-11 18:19:58",
          "relative": "1年前",
          "likes": 5,
          "text": "Better_Mob_Drop无进度版：https://wwan.lanzn.com/b007tfxhdg\n密码:byk9"
        },
        {
          "id": "1547800",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-03-23 15:32:51",
          "relative": "1年前",
          "likes": 2,
          "text": "Modrinth无进度版本下载链接（如果看不了说明还在审核，审核过了就可以下载了）：https://modrinth.com/datapack/better_mob_drop-nav"
        },
        {
          "id": "1548089",
          "author": "俺是耕田滴",
          "avatar": "https://i.mcmod.cn/user/avatar/47/479730/479730_1743224768_WqZe.png@60x60.jpg",
          "replyTo": "whwdzg",
          "date": "2025-03-23 18:26:23",
          "relative": "1年前",
          "likes": 0,
          "text": "我努力升级就是为了给你投一个红票"
        }
      ]
    },
    {
      "id": "1498417",
      "author": "Little_Rei",
      "avatar": "https://i.mcmod.cn/user/avatar/102/1028344/1028344_1739439050_rwCg.png@60x60.jpg",
      "floor": "3楼",
      "date": "2025-02-14 13:22:23",
      "relative": "1年前",
      "channel": 1,
      "replyCount": 1,
      "likes": 0,
      "text": "再也不用到处找远古残骸了！本模组默认使猪灵蛮兵掉落下界合金矿",
      "replies": [
        {
          "id": "2069691",
          "author": "QQ酱727233",
          "avatar": "https://www.mcmod.cn/static/public/images/identicons/48.jpg",
          "replyTo": "",
          "date": "2026-04-03 11:39:59",
          "relative": "7月前",
          "likes": 0,
          "text": "但是猪灵蛮兵是有限的，除非加mod让它可以原地刷新"
        }
      ]
    },
    {
      "id": "1493584",
      "author": "QQ酱993352",
      "avatar": "https://www.mcmod.cn/static/public/images/identicons/a9.jpg",
      "floor": "2楼",
      "date": "2025-02-11 17:33:08",
      "relative": "1年前",
      "channel": 1,
      "replyCount": 1,
      "likes": 0,
      "text": "为什么正好没有1.12.2",
      "replies": [
        {
          "id": "1517570",
          "author": "whwdzg",
          "avatar": "https://i.mcmod.cn/user/avatar/21/216083/216083_1735461919_nOaW.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-03-01 11:04:14",
          "relative": "1年前",
          "likes": 0,
          "text": "这个主要是数据包写的，数据包是1.13之后才有的，所以1.12.2很遗憾没法支持"
        }
      ]
    },
    {
      "id": "1450425",
      "author": "淡雅丶流年",
      "avatar": "https://i.mcmod.cn/user/avatar/73/735083/735083_1695187549_HkJn.png@60x60.jpg",
      "floor": "1楼",
      "date": "2025-01-14 13:47:54",
      "relative": "1年前",
      "channel": 1,
      "replyCount": 3,
      "likes": 0,
      "text": "我怎么没看懂这个MOD的实际作用？在1.13-1.16.5这些版本中也有作用吗？",
      "replies": [
        {
          "id": "1451786",
          "author": "神隐太郎",
          "avatar": "https://i.mcmod.cn/user/avatar/24/248688/248688_1623314162_UyGo.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-01-15 15:34:05",
          "relative": "1年前",
          "likes": 3,
          "text": "给部分生物增加了掉落物"
        },
        {
          "id": "1462540",
          "author": "蝶儿",
          "avatar": "https://i.mcmod.cn/user/avatar/3/30689/30689_1616510784_WsFU.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-01-21 23:05:19",
          "relative": "1年前",
          "likes": 0,
          "text": "乌龟壳和穿山甲的鳞片"
        },
        {
          "id": "1462542",
          "author": "蝶儿",
          "avatar": "https://i.mcmod.cn/user/avatar/3/30689/30689_1616510784_WsFU.png@60x60.jpg",
          "replyTo": "",
          "date": "2025-01-21 23:06:27",
          "relative": "1年前",
          "likes": 0,
          "text": "高版本点山羊角是等他自己撞，现在击杀可以获得"
        }
      ]
    }
  ]
};

export function mcmodComments(slug: string): McmodComment[] {
  return MCMOD_COMMENTS[slug] ?? [];
}
