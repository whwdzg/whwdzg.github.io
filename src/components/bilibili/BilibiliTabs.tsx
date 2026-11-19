/** 哔哩哔哩分页导航 / Bilibili sub-page tabs. */
import { CommentRegular, DocumentRegular, PersonRegular, PlayRegular } from '@fluentui/react-icons';
import { Link } from '../../lib/router';
import { cn } from '../../lib/cn';

const TABS = [
  { id: 'profile', label: '个人主页', to: '/bilibili/', icon: PersonRegular },
  { id: 'videos', label: '视频', to: '/bilibili/videos/', icon: PlayRegular },
  { id: 'dynamics', label: '动态', to: '/bilibili/dynamics/', icon: CommentRegular },
  { id: 'columns', label: '专栏', to: '/bilibili/columns/', icon: DocumentRegular },
] as const;

export function BilibiliTabs({ active }: { active: (typeof TABS)[number]['id'] }) {
  return (
    <nav className="bili-tabs" aria-label="哔哩哔哩页面">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link key={tab.id} to={tab.to} className={cn('bili-tab', tab.id === active && 'is-active')} aria-current={tab.id === active ? 'page' : undefined}>
            <Icon aria-hidden />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
