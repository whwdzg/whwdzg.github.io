import { describe, expect, it } from 'vitest';
import { MINECRAFT_ITEMS, minecraftItem } from './projects/minecraft';
import { CRAFTING_ADVANCEMENTS, CRAFTING_RECIPES, CRAFTING_STATS } from './projects/crafting';
import { ENCHANTMENTS, ENCHANTMENT_STATS } from './projects/enchantments';
import { MOB_DROPS, MOB_STATS } from './projects/mob-drops';
import { MAGICAL_DYE_RECIPES, MAGICAL_DYE_STATS } from './projects/magical-dye';
import { MODRINTH_PROJECTS, MODRINTH_TOTALS } from './projects/modrinth';

describe('data-pack project data', () => {
  it('keeps the crafting dataset complete', () => {
    expect(CRAFTING_STATS.total).toBe(111);
    expect(CRAFTING_STATS.stonecutting).toBe(48);
    expect(CRAFTING_STATS.smelting).toBe(3);
    expect(CRAFTING_RECIPES).toHaveLength(CRAFTING_STATS.total);
    expect(CRAFTING_STATS.advancements).toBe(150);
    expect(CRAFTING_ADVANCEMENTS.length).toBeGreaterThan(0);
  });

  it('resolves every recipe and drop item to a texture record', () => {
    const ids = new Set<string>();
    for (const recipe of CRAFTING_RECIPES) {
      ids.add(recipe.result.item);
      for (const ingredient of recipe.ingredients ?? []) ingredient.items.forEach((item) => ids.add(item));
      for (const ingredient of Object.values(recipe.key ?? {})) ingredient.items.forEach((item) => ids.add(item));
      recipe.ingredient?.items.forEach((item) => ids.add(item));
    }
    for (const mob of MOB_DROPS) {
      ids.add(mob.iconItem);
      mob.drops.forEach((drop) => ids.add(drop.item));
    }
    for (const enchantment of ENCHANTMENTS) enchantment.targetItems.forEach((item) => ids.add(item));
    for (const recipe of MAGICAL_DYE_RECIPES) {
      ids.add(recipe.result.item);
      for (const ingredient of recipe.ingredients ?? []) ingredient.items.forEach((item) => ids.add(item));
    }
    for (const id of ids) {
      expect(MINECRAFT_ITEMS[id], `${id} missing from item registry`).toBeDefined();
      expect(minecraftItem(id).texture).toMatch(/^\/media\/minecraft\/items\/.+\.png$/);
    }
  });

  it('keeps enchantment and mob datasets consistent', () => {
    expect(ENCHANTMENTS).toHaveLength(5);
    expect(ENCHANTMENT_STATS.advancements).toBeGreaterThanOrEqual(3);
    for (const enchantment of ENCHANTMENTS) {
      expect(enchantment.targetItems.length).toBeGreaterThan(0);
      expect(enchantment.maxLevel).toBeGreaterThan(0);
    }
    expect(MOB_STATS.total).toBe(18);
    expect(MOB_STATS.drops).toBe(33);
    expect(MOB_STATS.advancements).toBe(19);
    for (const mob of MOB_DROPS) {
      expect(mob.drops.length).toBeGreaterThan(0);
      for (const drop of mob.drops) expect(drop.min).toBeLessThanOrEqual(drop.max);
    }
  });

  it('keeps the magical dye and Modrinth snapshots valid', () => {
    expect(MAGICAL_DYE_STATS.total).toBe(17);
    expect(MAGICAL_DYE_RECIPES).toHaveLength(17);
    expect(MODRINTH_PROJECTS).toHaveLength(6);
    expect(MODRINTH_TOTALS.downloads).toBeGreaterThan(100_000);
    for (const project of MODRINTH_PROJECTS) {
      expect(project.icon).toMatch(/^\/media\/projects\/.+\.webp$/);
      expect(project.latestVersion.length).toBeGreaterThan(0);
    }
  });
});
