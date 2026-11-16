/** Minecraft item texture / Minecraft 物品图标。 */
import { cn } from '../../lib/cn';
import { minecraftItem } from '../../data/projects/minecraft';

interface ItemIconProps {
  id: string;
  size?: number;
  className?: string;
  alt?: string;
  eager?: boolean;
}

export function ItemIcon({ id, size = 32, className, alt, eager = false }: ItemIconProps) {
  const item = minecraftItem(id);
  return (
    <img
      className={cn('mc-item-icon', className)}
      src={item.texture}
      alt={alt ?? item.nameZh}
      width={size}
      height={size}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      style={{ width: size, height: size }}
    />
  );
}
