/**
 * 构建信息 / Build metadata.
 *
 * `site-meta.json` 由 scripts/generate-meta.mjs 在 dev/build 前生成，
 * GitHub Actions 中 checkout 使用完整历史即可获得提交列表。
 */
import rawMeta from '../generated/site-meta.json';
import type { SiteMetaShape } from '../data/site';

export const siteMeta = rawMeta as SiteMetaShape;
export const appVersion = __APP_VERSION__;
