/** 页眉头像菜单 / Avatar popover with identity and quick links. */
import { useEffect, useRef, useState } from 'react';
import { DismissRegular, OpenRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { useClickOutside } from '../../hooks/useClickOutside';
import { LINKS, SITE } from '../../data/site';
import { siteMeta } from '../../lib/meta';
import { FluentIcon } from '../common/FluentIcon';
import { useUi } from '../../hooks/useUi';

export function UserMenu({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { closeAll } = useUi();
  useClickOutside(ref, () => setOpen(false), open);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const external = [
    { label: '哔哩哔哩', href: LINKS.bilibili, icon: 'tv' },
    { label: 'GitHub', href: LINKS.github, icon: 'github' },
    { label: 'Modrinth', href: LINKS.modrinth, icon: 'globe' },
  ];

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="header-avatar"
        aria-label="打开个人菜单"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <img src={SITE.avatar} alt={SITE.avatarAlt} width={32} height={32} />
        <span className="header-avatar__dot" aria-hidden />
      </button>

      {open && (
        <div className="user-menu__popover" role="menu" aria-label="个人菜单">
          <div className="user-menu__head">
            <img src={SITE.avatar} alt="" width={44} height={44} />
            <div>
              <p className="user-menu__name">{SITE.name}</p>
              <p className="user-menu__handle">@{SITE.handle}</p>
            </div>
            <button className="icon-btn icon-btn--sm" type="button" aria-label="关闭菜单" onClick={() => setOpen(false)}>
              <DismissRegular aria-hidden />
            </button>
          </div>
          <p className="user-menu__tagline">{SITE.tagline}</p>
          <div className="user-menu__links">
            {external.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <FluentIcon name={item.icon} size={18} aria-hidden />
                <span>{item.label}</span>
                <OpenRegular className="user-menu__external" aria-hidden />
              </a>
            ))}
            <Link
              to="/comments/"
              role="menuitem"
              onClick={() => setOpen(false)}
              onNavigate={() => {
                setOpen(false);
                closeAll();
              }}
            >
              <FluentIcon name="comment" size={18} aria-hidden />
              <span>去留言板</span>
              <FluentIcon name="right" size={16} aria-hidden />
            </Link>
            <Link
              to="/about/"
              role="menuitem"
              onClick={() => setOpen(false)}
              onNavigate={() => {
                setOpen(false);
                closeAll();
              }}
            >
              <FluentIcon name="info" size={18} aria-hidden />
              <span>关于本站</span>
              <FluentIcon name="right" size={16} aria-hidden />
            </Link>
          </div>
          <div className="user-menu__foot">
            <span>版本 {siteMeta.version}</span>
            <span className="dot-sep" aria-hidden />
            <span>{siteMeta.commitShort || 'dev'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
