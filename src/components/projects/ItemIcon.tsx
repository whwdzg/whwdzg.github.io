/** Minecraft item texture / Minecraft 物品图标。 */
import { cn } from '../../lib/cn';
import { minecraftItem } from '../../data/projects/minecraft';

interface ItemIconProps {
  id: string;
  size?: number;
  className?: string;
  alt?: string;
  eager?: boolean;
  /** 是否链接到中文 Minecraft Wiki；图标本身默认是链接。 */
  link?: boolean;
}

/** 中文 Minecraft Wiki 使用中文条目名，直接按物品名编码即可。 */
export function minecraftWikiUrl(name: string): string {
  return `https://zh.minecraft.wiki/w/${encodeURIComponent(name)}`;
}

export function ItemIcon({ id, size = 32, className, alt, eager = false, link = true }: ItemIconProps) {
  const item = minecraftItem(id);
  const image = (
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
  if (!link) return image;
  return (
    <a
      className="mc-item-link"
      href={minecraftWikiUrl(item.nameZh)}
      target="_blank"
      rel="noopener noreferrer"
      title={`在中文 Minecraft Wiki 查看「${item.nameZh}」`}
      aria-label={`在中文 Minecraft Wiki 查看 ${item.nameZh}`}
      onClick={(event) => event.stopPropagation()}
      style={{ width: size, height: size }}
    >
      {image}
    </a>
  );
}
