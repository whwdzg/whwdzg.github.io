/** B 站动态正文：把表情 token 渲染成图片。 */
import type { BilibiliDynamic } from '../../data/bilibili-profile';

export function BilibiliDynamicText({ dynamic, className }: { dynamic: Pick<BilibiliDynamic, 'text' | 'emojis'>; className?: string }) {
  const emojis = new Map((dynamic.emojis ?? []).map((emoji) => [emoji.token, emoji]));
  const parts = dynamic.text.split(/(\[[^\]]+\])/g);
  return (
    <p className={className}>
      {parts.map((part, index) => {
        const emoji = emojis.get(part);
        if (!emoji) return <span key={index}>{part}</span>;
        const icon = <img className="bili-dynamic-emoji" src={emoji.icon} alt={emoji.token} title={emoji.token} width={22} height={22} loading="lazy" referrerPolicy="no-referrer" />;
        return emoji.jump
          ? <a key={index} href={emoji.jump} target="_blank" rel="noopener noreferrer">{icon}</a>
          : <span key={index}>{icon}</span>;
      })}
    </p>
  );
}
