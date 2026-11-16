/** GitHub 头像 / Avatar with a graceful fallback. */
import { PersonRegular } from '@fluentui/react-icons';
import type { GitHubUser } from '../../lib/github';
import { cn } from '../../lib/cn';

interface GitHubAvatarProps {
  user: GitHubUser | null;
  size?: number;
  className?: string;
}

export function GitHubAvatar({ user, size = 32, className }: GitHubAvatarProps) {
  if (!user) {
    return (
      <span className={cn('gh-avatar', 'gh-avatar--fallback', className)} style={{ width: size, height: size }} aria-hidden>
        <PersonRegular />
      </span>
    );
  }

  const separator = user.avatar_url.includes('?') ? '&' : '?';
  const src = `${user.avatar_url}${separator}s=${Math.max(64, size * 2)}`;

  return (
    <img
      className={cn('gh-avatar', className)}
      src={src}
      alt={`${user.login} 的头像`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      style={{ width: size, height: size }}
    />
  );
}
