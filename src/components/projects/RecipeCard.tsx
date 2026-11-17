/** 单个配方卡片 / A single crafting recipe card. */
import { ArrowRightRegular } from '@fluentui/react-icons';
import type { Ingredient, Recipe } from '../../data/projects/types';
import { minecraftItem, minecraftTag } from '../../data/projects/minecraft';
import { cn } from '../../lib/cn';
import { ItemIcon } from './ItemIcon';

const KIND_META: Record<Recipe['kind'], { label: string; short: string; station: string }> = {
  crafting_shaped: { label: '工作台 · 有序合成', short: '有序', station: '/media/minecraft/stations/crafting_table.png' },
  crafting_shapeless: { label: '工作台 · 无序合成', short: '无序', station: '/media/minecraft/stations/crafting_table.png' },
  stonecutting: { label: '切石机', short: '切石', station: '/media/minecraft/stations/stonecutter.png' },
  smelting: { label: '熔炉', short: '熔炼', station: '/media/minecraft/stations/furnace.png' },
};

function slotLabel(ingredient: Ingredient | undefined): string {
  if (!ingredient) return '空槽位';
  if (ingredient.label) return ingredient.label;
  return ingredient.items.map((item) => minecraftItem(item).nameZh).join(' / ') || '空槽位';
}

export function IngredientSlot({
  ingredient,
  size = 40,
  empty = false,
}: {
  ingredient?: Ingredient;
  size?: number;
  empty?: boolean;
}) {
  const first = ingredient?.items[0];
  const extra = (ingredient?.items.length ?? 0) - 1;
  return (
    <span
      className={cn('mc-slot', empty && 'mc-slot--empty', first && 'mc-slot--filled')}
      style={{ width: size, height: size }}
      title={slotLabel(ingredient)}
      aria-label={slotLabel(ingredient)}
      role="img"
    >
      {first ? (
        <>
          <ItemIcon id={first} size={Math.round(size * 0.72)} />
          {extra > 0 && <span className="mc-slot__extra">+{extra}</span>}
          {ingredient?.tag && <span className="mc-slot__tag">#</span>}
        </>
      ) : null}
    </span>
  );
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const meta = KIND_META[recipe.kind];
  const result = minecraftItem(recipe.result.item);
  const cells =
    recipe.kind === 'crafting_shaped'
      ? Array.from({ length: 9 }, (_, index) => {
          const row = recipe.pattern?.[Math.floor(index / 3)] ?? '';
          const character = row[index % 3] ?? ' ';
          return recipe.key?.[character];
        })
      : recipe.kind === 'crafting_shapeless'
        ? (recipe.ingredients ?? [])
        : [recipe.ingredient];
  const isShaped = recipe.kind === 'crafting_shaped';

  const tags = new Set<string>();
  for (const ingredient of cells) {
    if (ingredient?.tag) tags.add(ingredient.tag);
  }

  return (
    <article className={cn('recipe-card', `recipe-card--${recipe.kind}`)}>
      <header className="recipe-card__head">
        <span className="recipe-card__station">
          <img src={meta.station} alt="" width={28} height={28} loading="lazy" />
          <span>{meta.label}</span>
        </span>
        <span className="recipe-card__kind">{meta.short}</span>
      </header>

      <div className="recipe-card__visual">
        <div
          className={cn(
            'recipe-card__grid',
            (recipe.kind === 'smelting' || recipe.kind === 'stonecutting') && 'recipe-card__grid--single',
            recipe.kind === 'crafting_shapeless' && 'recipe-card__grid--shapeless',
          )}
        >
          {cells.map((ingredient, index) =>
            ingredient ? (
              <IngredientSlot key={index} ingredient={ingredient} />
            ) : isShaped ? (
              <IngredientSlot key={index} empty />
            ) : null,
          )}
        </div>

        <div className="recipe-card__arrow" aria-hidden>
          <ArrowRightRegular />
          {recipe.kind === 'smelting' && <span>{recipe.cookingTime ? `${(recipe.cookingTime / 20).toFixed(1)}s` : '熔炼'}</span>}
        </div>

        <div className="recipe-card__result">
          <span className="mc-slot mc-slot--result" title={result.nameZh}>
            <ItemIcon id={recipe.result.item} size={38} />
            {recipe.result.count > 1 && <span className="mc-slot__count">×{recipe.result.count}</span>}
          </span>
          <div>
            <strong>{result.nameZh}</strong>
            <span>
              {recipe.kind === 'smelting'
                ? `熔炼 · ${recipe.experience ?? 0} 经验`
                : recipe.result.count > 1
                  ? `每次 ${recipe.result.count} 个`
                  : '每次 1 个'}
            </span>
          </div>
        </div>
      </div>

      {tags.size > 0 && (
        <div className="recipe-tags">
          {[...tags].map((tag) => {
            const info = minecraftTag(tag);
            return (
              <details className="recipe-tag-expansion" key={tag} open>
                <summary>
                  标签材料 · {info?.label ?? tag}（{info?.items.length ?? 0} 种，全部展开）
                </summary>
                <ul>
                  {(info?.items ?? []).map((item) => (
                    <li key={item}>
                      <span className="mc-slot">
                        <ItemIcon id={item} size={20} />
                      </span>
                      {minecraftItem(item).nameZh}
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      )}

      {recipe.kind === 'smelting' && recipe.cookingTime != null && (
        <footer className="recipe-card__foot">
          <span className="recipe-card__note">熔炼 {recipe.cookingTime} tick</span>
        </footer>
      )}
    </article>
  );
}
