/** 数据包页面共享类型 / Shared data-pack types. */
export interface Ingredient {
  /** 原始标签（如果这个槽位是一个标签） */
  tag?: string;
  /** 展开后的候选物品 */
  items: string[];
  /** 面向读者的说明，例如“木板（任意）”“石头类方块” */
  label: string;
}

export type RecipeKind = 'crafting_shaped' | 'crafting_shapeless' | 'stonecutting' | 'smelting';

export interface Recipe {
  id: string;
  kind: RecipeKind;
  result: { item: string; count: number };
  pattern?: string[];
  key?: Record<string, Ingredient>;
  ingredients?: Ingredient[];
  ingredient?: Ingredient;
  experience?: number;
  cookingTime?: number;
}

export interface AdvancementNode {
  id: string;
  title: string;
  description: string;
  icon: string;
  frame: 'task' | 'goal' | 'challenge' | 'unknown';
  children: AdvancementNode[];
  /** 生成器保留的原始关系字段，页面不使用。 */
  parent?: string;
  hidden?: boolean;
  hasDisplay?: boolean;
}
