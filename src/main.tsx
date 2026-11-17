/**
 * 入口 / Entry point.
 *
 * CSS 顺序有意义：
 * tokens（变量）→ base（重置 / 排版）→ shell（页眉侧栏页脚）→ components（通用组件）
 * → pages（页面级样式）。页面样式也在各自 chunk 中按需加载。
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ROUTE_MAP } from './lib/routes';
import { normalizePath } from './lib/router';
import { cleanHtmlLocation } from './lib/url';
import './styles/tokens.css';
import './styles/base.css';
import './styles/shell.css';
import './styles/components.css';
import './styles/home.css';
import './styles/pages.css';
import './styles/responsive.css';
import { registerServiceWorker } from './lib/pwa';

// 旧链接 / 直链可能带 .html；在挂载 React 前改写成站内干净路径。
const cleanedLocation = cleanHtmlLocation(window.location);
if (cleanedLocation) {
  window.history.replaceState(window.history.state, '', cleanedLocation);
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-ready');
}

// 多入口 HTML 已经确定了首屏路径；在 React 树挂载前就开始下载对应页面 chunk，
// 避免 Suspense 先渲染骨架、再等待 chunk 的往返。Rollup 会与 React.lazy 去重。
void ROUTE_MAP.get(normalizePath(window.location.pathname))?.load();

const container = document.getElementById('root');
if (!container) throw new Error('找不到 #root 容器');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
