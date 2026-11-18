/** 更好附魔项目页 / Better Enchantments project page. */
import { useMemo, useState } from 'react';
import { ArrowRightRegular, BookRegular, OpenRegular, ShieldRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { PROJECTS, projectById } from '../../data/site';
import { ENCHANTMENT_ADVANCEMENTS, ENCHANTMENT_STATS, ENCHANTMENTS } from '../../data/projects/enchantments';
import { formatViews } from '../../lib/format';
import { minecraftItem } from '../../data/projects/minecraft';
import { cn } from '../../lib/cn';
import { ProjectShell } from '../../components/projects/ProjectShell';
import { AdvancementTree } from '../../components/projects/AdvancementTree';
import { ItemIcon } from '../../components/projects/ItemIcon';
import { Reveal } from '../../components/common/Reveal';
import { McmodComments } from '../../components/projects/McmodComments';
import '../../styles/projects.css';

const TOC = [
  { id: 'overview', label: '总览' },
  { id: 'enchantments', label: '附魔清单' },
  { id: 'targets', label: '新增目标' },
  { id: 'advancements', label: '进度' },
  { id: 'install', label: '安装' },
  { id: 'compatibility', label: '兼容性' },
  { id: 'faq', label: '常见问题' },
  { id: 'links', label: '下载与链接' },
  { id: 'mcmod-comments', label: 'MC百科评论' },
];

const SUMMARIES: Record<string, string> = {
  'minecraft:protection': '每级 +1 伤害保护，最高 IV；对不绕过无敌帧的伤害生效。',
  'minecraft:fire_protection': '每级 +2 火焰伤害保护，并缩短燃烧时间；最高 IV。',
  'minecraft:blast_protection': '每级 +2 爆炸伤害保护，并提高爆炸击退抗性；最高 IV。',
  'minecraft:projectile_protection': '每级 +2 弹射物伤害保护；最高 IV。',
  'minecraft:unbreaking': '重写耐久消耗公式：护甲按 2/(10+5×(等级-1)) 概率减免耐久，其他可耐久物品沿用更高概率。',
};

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'armor', label: '护甲' },
  { id: 'durability', label: '耐久' },
] as const;

type Filter = (typeof FILTERS)[number]['id'];

export default function EnchantmentsProjectPage() {
  const project = projectById('better-enchantments');
  const toc = useMemo(() => TOC, []);
  const [filter, setFilter] = useState<Filter>('all');
  if (!project) return null;

  const visible = ENCHANTMENTS.filter((enchantment) => {
    if (filter === 'armor') return enchantment.supportedItems.includes('armor');
    if (filter === 'durability') return enchantment.supportedItems.includes('durability');
    return true;
  });

  const horseArmors = [
    'minecraft:leather_horse_armor',
    'minecraft:copper_horse_armor',
    'minecraft:iron_horse_armor',
    'minecraft:golden_horse_armor',
    'minecraft:diamond_horse_armor',
  ];

  return (
    <ProjectShell project={project} toc={toc}>
      <Reveal as="section" className="article-card project-overview" id="overview">
        <p className="eyebrow">OVERVIEW</p>
        <h2>让护甲附魔，真正覆盖所有护甲</h2>
        <p>
          更好附魔重新定义了 protection、fire_protection、blast_protection、projectile_protection 与 unbreaking
          的适用对象。马铠和狼铠现在也能在附魔台 / 铁砧中获得保护与耐久，不再只是“有护甲值、没有附魔”的装饰品。
        </p>
        <div className="project-stat-grid">
          <div>
            <strong>{ENCHANTMENT_STATS.total}</strong>
            <span>重写附魔</span>
          </div>
          <div>
            <strong>6</strong>
            <span>新增可附魔装备</span>
          </div>
          <div>
            <strong>{ENCHANTMENT_STATS.advancements}</strong>
            <span>进度</span>
          </div>
          <div>
            <strong>26.3</strong>
            <span>当前支持</span>
          </div>
        </div>

        <div className="ench-compare">
          <div className="ench-compare__side">
            <p className="eyebrow">VANILLA</p>
            <h3>原版</h3>
            <ul>
              <li>保护类附魔只作用于玩家护甲</li>
              <li>马铠无法在附魔台获得保护 / 耐久</li>
              <li>狼铠同样被排除在护甲附魔之外</li>
            </ul>
            <div className="ench-compare__icons">
              <span><ItemIcon id="minecraft:iron_chestplate" size={30} /></span>
              <span><ItemIcon id="minecraft:diamond_helmet" size={30} /></span>
              <span><ItemIcon id="minecraft:netherite_boots" size={30} /></span>
            </div>
          </div>
          <ArrowRightRegular className="ench-compare__arrow" aria-hidden />
          <div className="ench-compare__side ench-compare__side--after">
            <p className="eyebrow">BETTER ENCHANTMENTS</p>
            <h3>现在</h3>
            <ul>
              <li>全部护甲 + 马铠 + 狼铠共享保护类附魔</li>
              <li>unbreaking 对护甲与其他耐久物品分别计算</li>
              <li>附魔台、铁砧与附魔书规则保持不变</li>
            </ul>
            <div className="ench-compare__icons">
              <span><ItemIcon id="minecraft:diamond_horse_armor" size={30} /></span>
              <span><ItemIcon id="minecraft:wolf_armor" size={30} /></span>
              <span><ItemIcon id="minecraft:enchanted_book" size={30} /></span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="enchantments">
        <div className="article-card__head">
          <div>
            <p className="eyebrow">ENCHANTMENTS</p>
            <h2>附魔清单</h2>
          </div>
          <span className="badge badge--accent">{formatViews(project.downloads)} 下载</span>
        </div>
        <div className="ench-toolbar">
          <div className="recipe-filters" role="group" aria-label="附魔类型">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn('recipe-filter', filter === item.id && 'is-active')}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="recipe-toolbar__count">{visible.length} 个附魔</p>
        </div>

        <div className="ench-grid">
          {visible.map((enchantment) => (
            <article className="ench-card" key={enchantment.id}>
              <header>
                <span className="ench-card__icon">
                  <ItemIcon id="minecraft:enchanted_book" size={34} />
                </span>
                <div>
                  <h3>{enchantment.nameZh}</h3>
                  <p>{enchantment.nameEn}</p>
                </div>
                <span className="ench-card__level">最高 {toRoman(enchantment.maxLevel)}</span>
              </header>
              <p className="ench-card__summary">{SUMMARIES[enchantment.id] ?? '扩展该附魔的适用装备。'}</p>
              <div className="ench-card__targets">
                {enchantment.targetItems.slice(0, 7).map((item) => (
                  <span className="mc-slot mc-slot--mini" key={item} title={item}>
                    <ItemIcon id={item} size={26} />
                  </span>
                ))}
                {enchantment.targetItems.length > 7 && (
                  <span className="ench-card__more">+{enchantment.targetItems.length - 7}</span>
                )}
              </div>
              <dl className="ench-card__meta">
                <div>
                  <dt>适用</dt>
                  <dd title={enchantment.supportedLabel}>
                    {enchantment.supportedLabel.replace('（含马铠与狼铠）', '')}
                  </dd>
                </div>
                <div>
                  <dt>权重</dt>
                  <dd>{enchantment.weight}</dd>
                </div>
                <div>
                  <dt>铁砧花费</dt>
                  <dd>{enchantment.anvilCost}</dd>
                </div>
                <div>
                  <dt>槽位</dt>
                  <dd>{enchantment.slots.join(' / ')}</dd>
                </div>
              </dl>
              {enchantment.exclusiveSet && (
                <p className="ench-card__exclusive">
                  <ShieldRegular aria-hidden /> 与同组保护附魔互斥
                </p>
              )}
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="targets">
        <p className="eyebrow">TARGETS</p>
        <h2>新增附魔目标</h2>
        <p className="project-section-lead">
          5 种马铠与狼铠现在都进入 <code>#minecraft:enchantable/armor</code> 标签，同时保留原有的护甲值。
        </p>
        <div className="ench-targets">
          {horseArmors.map((item) => (
            <div className="ench-target" key={item}>
              <span className="mc-slot">
                <ItemIcon id={item} size={40} />
              </span>
              <span>{minecraftItem(item).nameZh}</span>
            </div>
          ))}
          <div className="ench-target ench-target--wolf">
            <span className="mc-slot">
              <ItemIcon id="minecraft:wolf_armor" size={40} />
            </span>
            <span>{minecraftItem('minecraft:wolf_armor').nameZh}</span>
          </div>
        </div>
        <div className="project-callout">
          <BookRegular aria-hidden />
          <p>
            附魔仍然通过附魔台、铁砧与附魔书进行；数据包没有新增附魔类型，只改变原版附魔的可用装备与数值规则。
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="advancements">
        <p className="eyebrow">ADVANCEMENTS</p>
        <h2>进度</h2>
        <p className="project-section-lead">为马铠与狼铠分别附魔，可以解锁两个新进度。</p>
        <AdvancementTree nodes={ENCHANTMENT_ADVANCEMENTS} />
      </Reveal>

      <Reveal as="section" className="article-card" id="install">
        <p className="eyebrow">INSTALL</p>
        <h2>安装</h2>
        <div className="project-steps">
          <div>
            <span>01</span>
            <div>
              <strong>选择对应版本分支</strong>
              <p>26.3 → .3，1.21.11–26.2 → .2，1.21.9–1.21.10 → .1，1.21.5–1.21.8 → .0；旧版本请查看 Modrinth 的历史文件。</p>
            </div>
          </div>
          <div>
            <span>02</span>
            <div>
              <strong>放入数据包目录</strong>
              <p>把 zip 放进存档的 <code>datapacks/</code>，执行 <code>/reload</code> 或重进世界。</p>
            </div>
          </div>
          <div>
            <span>03</span>
            <div>
              <strong>给马铠附魔</strong>
              <p>把马铠放进附魔台，或与附魔书一起放进铁砧；保护 / 耐久会正常出现。</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="compatibility">
        <p className="eyebrow">COMPATIBILITY</p>
        <h2>兼容性</h2>
        <div className="project-table-wrap">
          <table className="project-table">
            <thead>
              <tr>
                <th>Minecraft</th>
                <th>版本号分支</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>26.3</td><td>x.x.x.3</td><td>当前主分支，包含马铠 / 狼铠标签与 26.3 格式。</td></tr>
              <tr><td>1.21.11 – 26.2</td><td>x.x.x.2</td><td>26.x 早期与 1.21.11 分支。</td></tr>
              <tr><td>1.21.9 – 1.21.10</td><td>x.x.x.1</td><td>1.21.9 / 1.21.10 附魔格式。</td></tr>
              <tr><td>1.21.5 – 1.21.8</td><td>x.x.x.0</td><td>1.21.5–1.21.8 附魔格式。</td></tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="faq">
        <p className="eyebrow">FAQ</p>
        <h2>常见问题</h2>
        <div className="project-faq">
          <details>
            <summary>马铠 / 狼铠还能保留原来的护甲值吗？</summary>
            <p>可以。数据包只扩展附魔适用标签，不修改装备本身的护甲属性。</p>
          </details>
          <details>
            <summary>为什么附魔台里还是刷不出保护？</summary>
            <p>附魔台结果受等级、随机数与物品可附魔标签影响。确认数据包已加载，并至少使用 1.21.5+ 对应文件。</p>
          </details>
          <details>
            <summary>和别的附魔数据包冲突吗？</summary>
            <p>会。多个数据包同时修改 <code>minecraft:enchantment</code> 下的同名文件时，后加载者覆盖前者。</p>
          </details>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="links">
        <p className="eyebrow">LINKS</p>
        <h2>下载与链接</h2>
        <div className="project-link-grid">
          <a href={project.modrinth} target="_blank" rel="noopener noreferrer">
            <strong>Modrinth</strong>
            <span>下载数据包 / 模组版本</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            <strong>GitHub</strong>
            <span>源码、Issue 与版本记录</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.i18n} target="_blank" rel="noopener noreferrer">
            <strong>语言包</strong>
            <span>简体中文 / English</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.mcmod} target="_blank" rel="noopener noreferrer">
            <strong>MCMOD</strong>
            <span>中文百科条目</span>
            <OpenRegular aria-hidden />
          </a>
        </div>
        <p className="project-note">本项目使用 GPL-3.0 许可。附魔名称与图标来自 Minecraft 26.3 资源。</p>
        <Link className="text-link" to="/projects/modrinth/">
          查看全部 {PROJECTS.length} 个项目 <ArrowRightRegular aria-hidden />
        </Link>
      </Reveal>
      <McmodComments slug="better-enchantments" />
    </ProjectShell>
  );
}

function toRoman(value: number): string {
  const numerals: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let left = value;
  let result = '';
  for (const [amount, numeral] of numerals) {
    while (left >= amount) {
      result += numeral;
      left -= amount;
    }
  }
  return result || String(value);
}
