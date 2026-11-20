import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * 站点构建配置 / Site build configuration.
 *
 * 设计要点：
 * - 多入口（index / bilibili / comments / about）保证直接访问与刷新任意页面都能命中
 *   真实的 HTML，无需 GitHub Pages 的 404 重写魔法。
 * - 手动拆包把 React 与 Fluent 图标拆成可长期缓存的 chunk。
 * - `__APP_VERSION__` 等常量在构建期注入，关于页可以在不请求接口的情况下展示版本信息。
 */
const pkg = JSON.parse(readFileSync(path.resolve('package.json'), 'utf8')) as {
  version?: string;
};

function walk(directory: string, base = ''): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = base ? `${base}/${entry.name}` : entry.name;
    return entry.isDirectory() ? walk(path.join(directory, entry.name), relative) : [relative];
  });
}

/**
 * 生成 Service Worker 的预缓存清单。
 *
 * 只预缓存“代码 + 首屏关键图片”，不把 43 张封面、8 张壁纸全部塞进安装包；
 * 它们会在访问时由 cache-first 运行时缓存。这样 PWA 首次安装的体积可控，
 * 同时离线刷新首页、影像页、留言板、关于页都能正常渲染。
 */
function serviceWorkerManifest(): Plugin {
  return {
    name: 'whwdzg-sw-manifest',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve('dist');
      const featuredCovers = new Set([
        'media/bilibili/v02.webp',
        'media/bilibili/v04.webp',
        'media/bilibili/v10.webp',
        'media/bilibili/v12.webp',
        'media/bilibili/v13.webp',
        'media/bilibili/v15.webp',
      ]);
      const assets = walk(dist)
        .filter((file) => {
          if (file === 'sw.js' || file === 'sw-assets.json' || file.endsWith('.map')) return false;
          if (file === 'index.html' || file === 'manifest.webmanifest' || file === 'offline.html') return true;
          if (/^(bilibili|comments|comments\/github|projects\/[^/]+|user\/[^/]+|columns|columns\/[^/]+|tools|tools\/[^/]+|about)\/index\.html$/.test(file)) return true;
          if (file.startsWith('assets/') && /\.(js|css)$/.test(file)) return true;
          if (file.startsWith('icons/')) return true;
          if (file.startsWith('media/avatars/') || file.startsWith('media/projects/')) return true;
          if (featuredCovers.has(file) || file === 'media/hero/light-4.webp' || file === 'media/hero/dark-1.webp') return true;
          return false;
        })
        .map((file) => `/${file.replace(/\\/g, '/')}`);

      writeFileSync(
        path.join(dist, 'sw-assets.json'),
        `${JSON.stringify({ version: pkg.version ?? '0.0.0', assets }, null, 2)}\n`,
        'utf8',
      );
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), serviceWorkerManifest()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version ?? '0.0.0'),
    // 每次构建都不同，用作 Service Worker 的缓存版本。
    __BUILD_ID__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 10) ?? `local-${Date.now()}`),
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      input: {
        main: path.resolve('index.html'),
        bilibili: path.resolve('bilibili/index.html'),
        bilibiliVideos: path.resolve('bilibili/videos/index.html'),
        bilibiliDynamics: path.resolve('bilibili/dynamics/index.html'),
        bilibiliColumns: path.resolve('bilibili/columns/index.html'),
        comments: path.resolve('comments/index.html'),
        commentsGithub: path.resolve('comments/github/index.html'),
        projects: path.resolve('projects/modrinth/index.html'),
        betterCrafting: path.resolve('projects/better-crafting-recipes/index.html'),
        betterEnchantments: path.resolve('projects/better-enchantments/index.html'),
        betterMobDrop: path.resolve('projects/better-mob-drop/index.html'),
        magicalDye: path.resolve('projects/magical-dye/index.html'),
        onlySurvival: path.resolve('projects/only-survival-mode/index.html'),
        glowingPlayers: path.resolve('projects/glowing-players/index.html'),
        asteriaPlayer: path.resolve('projects/asteria-player/index.html'),
        paligraphCanvas: path.resolve('projects/paligraph-canvas/index.html'),
        lifeWiki: path.resolve('projects/life-simulation-wiki/index.html'),
        githubProjects: path.resolve('projects/github/index.html'),
        occultation: path.resolve('projects/occultation/index.html'),
        userHxhej: path.resolve('user/hxhej/index.html'),
        userCang: path.resolve('user/canghaishuiyu/index.html'),
        userCangLegacy: path.resolve('user/滄海水魚/index.html'),
        columns: path.resolve('columns/index.html'),
        columnUpdate2026: path.resolve('columns/update-2026-11/index.html'),
        tools: path.resolve('tools/index.html'),
        base64: path.resolve('tools/base64/index.html'),
        basex: path.resolve('tools/basex/index.html'),
        baseConvert: path.resolve('tools/base-convert/index.html'),
        unicode: path.resolve('tools/unicode/index.html'),
        calculator: path.resolve('tools/calculator/index.html'),
        mcProjection: path.resolve('tools/mc-projection/index.html'),
        mcDatapack: path.resolve('tools/mc-datapack/index.html'),
        mcResourcepack: path.resolve('tools/mc-resourcepack/index.html'),
        markdownMindmap: path.resolve('tools/markdown-mindmap/index.html'),
        aiDetect: path.resolve('tools/ai-detect/index.html'),
        markdownEditor: path.resolve('tools/markdown-editor/index.html'),
        about: path.resolve('about/index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'react';
          }
          if (id.includes('node_modules/@fluentui/react-icons/')) return 'fluent-icons';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 4173,
    strictPort: true,
    watch: {
      // 编辑器的原子写入会在源目录留下临时目录；Windows 下监视它们会 EBUSY。
      ignored: ['**/dist/**', '**/.tmp/**', '**/*.tmpdir/**', '**/.git/**'],
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
