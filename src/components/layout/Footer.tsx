/** 页脚 / Footer with sitemap, license and build metadata. */
import { Link } from '../../lib/router';
import { useUi } from '../../hooks/useUi';
import { ARCHIVE_LINKS, LINKS, PRIMARY_NAV, PROJECTS, SITE, SUBSITES } from '../../data/site';
import { siteMeta } from '../../lib/meta';
import { FluentIcon } from '../common/FluentIcon';

export function Footer() {
  const { openSettings, openSearch } = useUi();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <div className="site-footer__mark">
            <img src="/icons/logo-192.png" alt="" width={40} height={40} />
            <div>
              <p className="site-footer__name">水鱼 Blog</p>
              <p className="site-footer__tagline">{SITE.tagline}</p>
            </div>
          </div>
          <p className="site-footer__desc">
            一个由 Minecraft、代码与影像构成的内容站点。3.18.0 使用 Fluent Design Sun Valley、可选的液态玻璃表面，集中展示数据包、影像归档、独立子站与前端工具。
          </p>
          <div className="site-footer__badges">
            <span className="badge badge--muted">Fluent Design</span>
            <span className="badge badge--muted">WebP</span>
            <span className="badge badge--muted">PWA</span>
            <span className="badge badge--muted">v{siteMeta.version}</span>
          </div>
        </div>

        <nav className="site-footer__column" aria-label="站点页面">
          <p className="site-footer__heading">站点</p>
          {PRIMARY_NAV.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
          <button type="button" className="site-footer__link" onClick={openSearch}>
            搜索
          </button>
          <button type="button" className="site-footer__link" onClick={openSettings}>
            个性化设置
          </button>
        </nav>

        <nav className="site-footer__column" aria-label="项目">
          <p className="site-footer__heading">项目</p>
          {PROJECTS.map((project) => (
            <Link key={project.id} to={project.path}>
              {project.title}
            </Link>
          ))}
          <Link to="/projects/modrinth/">Modrinth 项目</Link>
        </nav>

        <nav className="site-footer__column" aria-label="更多链接">
          <p className="site-footer__heading">更多</p>
          <Link to="/tools/">站内工具</Link>
          {SUBSITES.map((site) => (
            <Link key={site.id} to={site.path}>{site.title}</Link>
          ))}
          <Link to="/projects/github/">GitHub 项目</Link>
          <a href={LINKS.bilibili} target="_blank" rel="noopener noreferrer">
            哔哩哔哩
          </a>
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {ARCHIVE_LINKS.slice(0, 2).map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="site-footer__bottom">
        <p>
          Copyright © {SITE.startYear}–{new Date().getFullYear()} {SITE.name}
        </p>
        <div className="site-footer__legal">
          <a href={LINKS.license} target="_blank" rel="noopener noreferrer">
            <FluentIcon name="shield" size={15} aria-hidden />
            GPL-3.0
          </a>
          <a href={SITE.contentLicenseUrl} target="_blank" rel="noopener noreferrer">
            <FluentIcon name="document" size={15} aria-hidden />
            CC BY-NC-SA 4.0
          </a>
          <a href={LINKS.repo} target="_blank" rel="noopener noreferrer">
            <FluentIcon name="github" size={15} aria-hidden />
            源码
          </a>
        </div>
        <p className="site-footer__version">
          v{siteMeta.version}
          {siteMeta.commitShort && (
            <>
              <span className="dot-sep" aria-hidden /> build {siteMeta.commitShort}
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
