/** 更好的生物掉落项目页 / Better Mob Drop project page. */
import { useMemo, useState } from 'react';
import { ArrowRightRegular, CheckmarkCircleRegular, OpenRegular, SearchRegular, WarningRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { PROJECTS, projectById } from '../../data/site';
import {
  MOB_ADVANCEMENTS,
  MOB_CATEGORY_LABELS,
  MOB_DROPS,
  MOB_STATS,
  type MobCategory,
  type MobDropEntry,
} from '../../data/projects/mob-drops';
import { formatViews } from '../../lib/format';
import { minecraftItem } from '../../data/projects/minecraft';
import { cn } from '../../lib/cn';
import { ProjectShell } from '../../components/projects/ProjectShell';
import { AdvancementTree } from '../../components/projects/AdvancementTree';
import { ItemIcon } from '../../components/projects/ItemIcon';
import { Reveal } from '../../components/common/Reveal';
import '../../styles/projects.css';

const TOC = [
  { id: 'overview', label: '总览' },
  { id: 'drops', label: '掉落清单' },
  { id: 'advancements', label: '进度' },
  { id: 'install', label: '安装' },
  { id: 'compatibility', label: '兼容性' },
  { id: 'faq', label: '常见问题' },
  { id: 'links', label: '下载与链接' },
];

const CATEGORIES: (MobCategory | 'all')[] = ['all', 'friendly', 'neutral', 'hostile'];

function dropCount(drop: MobDropEntry): string {
  return drop.min === drop.max ? `×${drop.min}` : `${drop.min}–${drop.max}`;
}

export default function MobDropProjectPage() {
  const project = projectById('better-mob-drop');
  const toc = useMemo(() => TOC, []);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MobCategory | 'all'>('all');
  if (!project) return null;

  const filtered = MOB_DROPS.filter((mob) => {
    if (category !== 'all' && mob.category !== category) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return `${mob.nameZh} ${mob.nameEn} ${mob.id} ${mob.drops
      .map((drop) => `${drop.item} ${minecraftItem(drop.item).nameZh}`)
      .join(' ')}`
      .toLowerCase()
      .includes(needle);
  });

  return (
    <ProjectShell project={project} toc={toc}>
      <Reveal as="section" className="article-card project-overview" id="overview">
        <p className="eyebrow">OVERVIEW</p>
        <h2>让每一种生物，都掉点合理的东西</h2>
        <p>
          更好的生物掉落重写了 {MOB_STATS.total} 种生物的战利品表：悦灵掉紫水晶、犰狳掉鳞甲、骆驼掉皮革、末影龙掉龙首与鞘翅……
          友好生物不再只是“杀着玩”，中立与敌对生物也有了更清晰的收益。
        </p>
        <div className="project-stat-grid">
          <div>
            <strong>{MOB_STATS.total}</strong>
            <span>生物</span>
          </div>
          <div>
            <strong>{MOB_STATS.drops}</strong>
            <span>掉落条目</span>
          </div>
          <div>
            <strong>{MOB_STATS.advancements}</strong>
            <span>进度</span>
          </div>
          <div>
            <strong>{MOB_STATS.friendly}</strong>
            <span>友好生物</span>
          </div>
        </div>
        <div className="project-feature-grid">
          <div>
            <CheckmarkCircleRegular aria-hidden />
            <strong>掠夺加成</strong>
            <p>大部分掉落支持抢夺附魔，每级提高数量上限。</p>
          </div>
          <div>
            <CheckmarkCircleRegular aria-hidden />
            <strong>着火熔炼</strong>
            <p>鸡肉、鳕鱼、鲑鱼、羊肉等掉落会在着火时直接变成熟食。</p>
          </div>
          <div>
            <CheckmarkCircleRegular aria-hidden />
            <strong>进度记录</strong>
            <p>{MOB_STATS.advancements} 个击杀进度，记录每一次“魔鬼行为”。</p>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="drops">
        <div className="article-card__head">
          <div>
            <p className="eyebrow">DROP TABLE</p>
            <h2>掉落清单</h2>
          </div>
          <span className="badge badge--accent">{formatViews(project.downloads)} 下载</span>
        </div>
        <div className="mob-toolbar">
          <label className="recipe-search">
            <SearchRegular aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索生物或掉落物…"
              aria-label="搜索生物掉落"
            />
          </label>
          <div className="recipe-filters" role="group" aria-label="生物类型">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                className={cn('recipe-filter', category === item && 'is-active')}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item === 'all' ? '全部' : MOB_CATEGORY_LABELS[item]}
              </button>
            ))}
          </div>
          <p className="recipe-toolbar__count" aria-live="polite">
            {filtered.length} / {MOB_STATS.total} 种生物
          </p>
        </div>

        <div className="mob-grid">
          {filtered.map((mob) => (
            <article className="mob-card" key={mob.id}>
              <header>
                <span className="mob-card__icon">
                  <ItemIcon id={mob.iconItem} size={38} />
                </span>
                <div>
                  <h3>{mob.nameZh}</h3>
                  <p>{mob.nameEn}</p>
                </div>
                <span className={`mob-card__category mob-card__category--${mob.category}`}>
                  {MOB_CATEGORY_LABELS[mob.category]}
                </span>
              </header>
              <ul className="mob-card__drops">
                {mob.drops.map((drop) => (
                  <li key={`${mob.id}-${drop.item}-${drop.min}-${drop.max}`}>
                    <span className="mc-slot mc-slot--mini">
                      <ItemIcon id={drop.item} size={26} />
                    </span>
                    <span>{minecraftItem(drop.item).nameZh}</span>
                    <strong>{dropCount(drop)}</strong>
                    <span className="mob-card__flags">
                      {drop.looting && <em>抢夺</em>}
                      {drop.smelt && <em>熔炼</em>}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="recipe-empty">
            <SearchRegular aria-hidden />
            <strong>没有匹配的生物</strong>
            <p>换个关键词，或切换生物类型。</p>
          </div>
        )}
      </Reveal>

      <Reveal as="section" className="article-card" id="advancements">
        <div className="article-card__head">
          <div>
            <p className="eyebrow">ADVANCEMENTS</p>
            <h2>击杀进度</h2>
          </div>
          <span className="badge">{MOB_STATS.advancements} 个</span>
        </div>
        <p className="project-section-lead">从“你个魔鬼！”到“勇士对恶龙实行的斩首”，每一次击杀都有记录。</p>
        <AdvancementTree nodes={MOB_ADVANCEMENTS} />
      </Reveal>

      <Reveal as="section" className="article-card" id="install">
        <p className="eyebrow">INSTALL</p>
        <h2>安装</h2>
        <div className="project-steps">
          <div>
            <span>01</span>
            <div>
              <strong>选择版本分支</strong>
              <p>26.3 → .4，26.2 → .3，1.21.5–26.1.2 → .2，1.21.2–1.21.4 → .1，1.13–1.20.4 → .0；数据包与模组版都可按此选择。</p>
            </div>
          </div>
          <div>
            <span>02</span>
            <div>
              <strong>放入 datapacks</strong>
              <p>数据包 zip 放进存档的 <code>datapacks/</code>，执行 <code>/reload</code> 或重进世界。</p>
            </div>
          </div>
          <div>
            <span>03</span>
            <div>
              <strong>开始击杀</strong>
              <p>击杀生物后掉落会立即按新战利品表结算；已生成的生物也适用。</p>
            </div>
          </div>
        </div>
        <div className="project-callout">
          <WarningRegular aria-hidden />
          <p>
            如果不想看到进度提示，可以使用 Modrinth 上的“无进度版”（Better Mob Drop Nav）。两个版本不要同时安装。
          </p>
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
              <tr><td>26.3</td><td>x.x.x.4</td><td>当前主分支，26.3 战利品表格式。</td></tr>
              <tr><td>26.2</td><td>x.x.x.3</td><td>26.2 战利品表格式。</td></tr>
              <tr><td>1.21.5 – 26.1.2</td><td>x.x.x.2</td><td>26.1 与 1.21.5–1.21.11 分支。</td></tr>
              <tr><td>1.21.2 – 1.21.4</td><td>x.x.x.1</td><td>1.21.2–1.21.4 战利品表格式。</td></tr>
              <tr><td>1.13 – 1.20.4</td><td>x.x.x.0</td><td>旧版战利品表谓词格式。</td></tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="faq">
        <p className="eyebrow">FAQ</p>
        <h2>常见问题</h2>
        <div className="project-faq">
          <details>
            <summary>为什么击杀悦灵会掉紫水晶？</summary>
            <p>悦灵与紫水晶有主题关联；数据包给友好生物增加了与设定匹配的掉落，同时保留抢夺加成。</p>
          </details>
          <details>
            <summary>末影龙会掉什么？</summary>
            <p>鞘翅、龙首与龙蛋。适合不想重复打龙、但想收集全部战利品的玩家。</p>
          </details>
          <details>
            <summary>会破坏平衡吗？</summary>
            <p>掉落数量与概率按生物稀有度调整；友好生物收益较低，Boss 与稀有生物更高。可以在配置中自行修改战利品表。</p>
          </details>
        </div>
      </Reveal>

      <Reveal as="section" className="article-card" id="links">
        <p className="eyebrow">LINKS</p>
        <h2>下载与链接</h2>
        <div className="project-link-grid">
          <a href={project.modrinth} target="_blank" rel="noopener noreferrer">
            <strong>Modrinth</strong>
            <span>数据包 / 模组 / 无进度版</span>
            <OpenRegular aria-hidden />
          </a>
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            <strong>GitHub</strong>
            <span>战利品表源码与 Issue</span>
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
        <p className="project-note">本项目使用 GPL-3.0 许可。生物名称与物品图标来自 Minecraft 26.3 资源。</p>
        <Link className="text-link" to="/projects/modrinth/">
          查看全部 {PROJECTS.length} 个项目 <ArrowRightRegular aria-hidden />
        </Link>
      </Reveal>
    </ProjectShell>
  );
}
