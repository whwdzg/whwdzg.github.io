/** 配方浏览器 / Searchable and filterable recipe browser. */
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { SearchRegular } from '@fluentui/react-icons';
import type { Recipe, RecipeKind } from '../../data/projects/types';
import { minecraftItem } from '../../data/projects/minecraft';
import { cn } from '../../lib/cn';
import { RecipeCard } from './RecipeCard';

type Filter = 'all' | RecipeKind;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'crafting_shaped', label: '有序' },
  { value: 'crafting_shapeless', label: '无序' },
  { value: 'stonecutting', label: '切石机' },
  { value: 'smelting', label: '熔炉' },
];

const PAGE_SIZE = 18;

export function RecipeBrowser({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [deferredQuery, filter]);

  const filtered = useMemo(() => {
    return recipes.filter((recipe) => {
      if (filter !== 'all' && recipe.kind !== filter) return false;
      if (!deferredQuery) return true;
      const ids = [
        recipe.result.item,
        ...(recipe.ingredients ?? []).flatMap((ingredient) => ingredient.items),
        ...(recipe.ingredient?.items ?? []),
        ...Object.values(recipe.key ?? {}).flatMap((ingredient) => ingredient.items),
      ];
      const labels = [
        ...(recipe.ingredients ?? []).map((ingredient) => ingredient.label),
        ...(recipe.ingredient ? [recipe.ingredient.label] : []),
        ...Object.values(recipe.key ?? {}).map((ingredient) => ingredient.label),
      ].join(' ');
      const haystack = `${ids.map((id) => `${id} ${minecraftItem(id).nameZh} ${minecraftItem(id).nameEn}`).join(' ')} ${
        recipe.id
      } ${labels}`.toLowerCase();
      return haystack.includes(deferredQuery);
    });
  }, [recipes, filter, deferredQuery]);

  const shown = filtered.slice(0, visible);
  const counts = useMemo(() => {
    const result: Record<Filter, number> = {
      all: recipes.length,
      crafting_shaped: 0,
      crafting_shapeless: 0,
      stonecutting: 0,
      smelting: 0,
    };
    for (const recipe of recipes) result[recipe.kind] += 1;
    return result;
  }, [recipes]);

  return (
    <div className="recipe-browser">
      <div className="recipe-toolbar">
        <label className="recipe-search">
          <SearchRegular aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索结果、材料或物品 ID…"
            aria-label="搜索配方"
          />
        </label>
        <div className="recipe-filters" role="group" aria-label="配方类型">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={cn('recipe-filter', filter === item.value && 'is-active')}
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
              <span>{counts[item.value]}</span>
            </button>
          ))}
        </div>
        <p className="recipe-toolbar__count" aria-live="polite">
          {filtered.length} / {recipes.length} 个配方
        </p>
      </div>

      {shown.length > 0 ? (
        <div className="recipe-grid">
          {shown.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="recipe-empty">
          <SearchRegular aria-hidden />
          <strong>没有匹配的配方</strong>
          <p>换一个关键词，或切换配方类型。</p>
        </div>
      )}

      {visible < filtered.length && (
        <div className="recipe-more">
          <button type="button" className="btn btn--ghost btn--md" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
            加载更多（还有 {filtered.length - visible} 个）
          </button>
        </div>
      )}
    </div>
  );
}
