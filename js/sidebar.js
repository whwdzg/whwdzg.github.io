// 左侧导航折叠/展开逻辑
document.addEventListener('DOMContentLoaded', function () {
	// 将文档中的 aside 收集到右下角浮动栈容器，避免重叠纵向排列
	(function setupAsideStack() {
		const asides = Array.from(document.querySelectorAll('main aside, body > aside'));
		if (!asides.length) return;
		let stack = document.getElementById('aside-stack');
		if (!stack) {
			stack = document.createElement('div');
			stack.id = 'aside-stack';
			document.body.appendChild(stack);
		}
		// 将现有 aside 的内容按 section 拆分成多个卡片，避免在一个卡里堆叠
		asides.forEach(a => {
			const sections = Array.from(a.querySelectorAll(':scope > section'));
			if (sections.length > 0) {
				sections.forEach(sec => {
					const card = document.createElement('aside');
					// 迁移该 section 的内容到新卡片中
					card.appendChild(sec);
					stack.appendChild(card);
				});
				// 清空原 aside，避免重复展示
				a.remove();
			} else {
				// 没有子 section，则直接作为一个卡片移入栈
				stack.appendChild(a);
			}
		});
	})();

	// 为浮动栈卡片添加关闭按钮
	(function addAsideCloseButtons() {
		const stack = document.getElementById('aside-stack');
		if (!stack) return;
		stack.querySelectorAll('aside').forEach(card => {
			if (card.querySelector('.aside-close')) return;
			const btn = document.createElement('button');
			btn.className = 'aside-close';
			btn.setAttribute('aria-label', 'Close');
			btn.innerHTML = '<i class="fluent-font" aria-hidden="true">&#xF369;</i>';
			btn.addEventListener('click', () => {
				card.classList.add('closing');
				setTimeout(() => {
					card.remove();
				}, 240);
			});
			card.appendChild(btn);
		});
	})();

	// 找到所有有子菜单的项
	const parents = document.querySelectorAll('.sidebar .has-children');

	parents.forEach(parent => {
		const btn = parent.querySelector('.toggle');
		const submenu = parent.querySelector('.submenu');

		if (!btn || !submenu) return;

		// 为无障碍可访问性初始化 aria-expanded
		btn.setAttribute('aria-expanded', 'false');

		btn.addEventListener('click', function () {
			const isOpen = parent.classList.toggle('open');
			btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

			// 动态设置 max-height 以获得平滑动画（使用 scrollHeight）
			if (isOpen) {
				// 将 max-height 先设置为子元素真实高度
				submenu.style.maxHeight = submenu.scrollHeight + 'px';
			} else {
				// 折叠时设置为 0
				submenu.style.maxHeight = '0px';
			}
		});

		// 如果窗口大小改变，且子菜单打开，刷新 max-height
		window.addEventListener('resize', function () {
			if (parent.classList.contains('open')) {
				submenu.style.maxHeight = submenu.scrollHeight + 'px';
			}
		});
    
		// 侧边栏整体折叠/展开逻辑
		const collapseBtns = document.querySelectorAll('.sidebar-collapse-btn');
		const body = document.body;
		const SIDEBAR_KEY = 'sidebarCollapsed';

		function setCollapsed(collapsed, save = true) {
			if (collapsed) {
				body.classList.add('sidebar-collapsed');
				collapseBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
				// 关闭所有打开的子菜单，避免折叠后显示溢出
				document.querySelectorAll('.sidebar .has-children.open').forEach(p => {
					p.classList.remove('open');
					const sm = p.querySelector('.submenu');
					if (sm) sm.style.maxHeight = '0px';
				});
			} else {
				body.classList.remove('sidebar-collapsed');
				collapseBtns.forEach(btn => btn.setAttribute('aria-expanded', 'true'));
			}
			if (save) localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
			// After collapsing state change, update sidebar offset variable so button repositions
			adjustSidebarPosition();
		}

		// 恢复上次状态
		const saved = localStorage.getItem(SIDEBAR_KEY);
		if (saved === '1') setCollapsed(true, false);

		collapseBtns.forEach(btn => {
			btn.addEventListener('click', function () {
				const isCollapsed = body.classList.toggle('sidebar-collapsed');
				setCollapsed(isCollapsed);
			});
		});
		// 在折叠/展开或窗口大小改变时，调整侧边栏位置以避免遮挡页眉
		function adjustSidebarPosition() {
			const header = document.querySelector('header');
			const footer = document.querySelector('footer');
			const sidebar = document.getElementById('sidebar');
			const scrollToTopBtn = document.getElementById('scroll-to-top');
			if (!header || !sidebar) return;

			// 先计算 header 高度（无论窄屏或宽屏都需要），用于调整 body padding-top
			const headerHeight = Math.ceil(header.getBoundingClientRect().height);

			// 把 header 高度同步到 CSS 变量，便于 CSS 使用
			document.documentElement.style.setProperty('--header-height', headerHeight + 'px');

			// 把侧边栏当前宽度写入 CSS 变量 --sidebar-offset，供 collapse button 用来定位
			const sidebarWidth = sidebar.getBoundingClientRect().width;
			document.documentElement.style.setProperty('--sidebar-offset', sidebarWidth + 'px');

			// 小屏幕下侧边栏为静态，但仍需为固定 header 留出空间：设置 body padding-top
			if (window.innerWidth <= 760) {
				sidebar.style.top = '';
				sidebar.style.height = '';
				document.body.style.paddingTop = headerHeight + 'px';
				// 窄屏下也需要让按钮避让页尾
				const footerRect = footer ? footer.getBoundingClientRect() : null;
				if (scrollToTopBtn && footerRect) {
					const footerHeight = Math.ceil(footerRect.height);
					const visibleTop = Math.max(0, footerRect.top);
					const visibleBottom = Math.min(window.innerHeight, footerRect.bottom);
					const visibleHeight = Math.max(0, visibleBottom - visibleTop);
					let bottomGap = Math.min(visibleHeight, footerHeight);
					if (visibleHeight >= footerHeight) bottomGap = footerHeight + 4;
					if (bottomGap > 0) {
						scrollToTopBtn.style.bottom = `${bottomGap + 16}px`;
					} else {
						scrollToTopBtn.style.bottom = '';
					}
				} else if (scrollToTopBtn) {
					scrollToTopBtn.style.bottom = '';
				}
				return;
			}

			// 计算页尾高度（如有），用于让侧栏不盖住页尾
			const footerRect = footer ? footer.getBoundingClientRect() : null;
			const footerHeight = footerRect ? Math.ceil(footerRect.height) : 0;
			// 精确计算页尾与视口的可见重叠高度：
			// 不可见时（完全在视口上方或下方）应为 0；部分可见时按交集计算
			let bottomGap = 0;
			if (footerRect) {
				const visibleTop = Math.max(0, footerRect.top);
				const visibleBottom = Math.min(window.innerHeight, footerRect.bottom);
				const visibleHeight = Math.max(0, visibleBottom - visibleTop);
				bottomGap = Math.min(visibleHeight, footerHeight);
				// 当页尾完全显示时，增加一个微小安全间隙，避免侧栏盖住页尾边线
				if (visibleHeight >= footerHeight) bottomGap = footerHeight + 4; // 4px 安全边距
			}

			// 宽屏：侧边栏固定在 header 下面；根据页尾当前可见高度动态留出底部间隙
			sidebar.style.top = headerHeight + 'px';
			sidebar.style.height = 'auto';
			sidebar.style.bottom = `${bottomGap}px`;
			document.body.style.paddingTop = headerHeight + 'px';

			// 同时调整返回顶部按钮的位置
			if (scrollToTopBtn && bottomGap > 0) {
				scrollToTopBtn.style.bottom = `${bottomGap + 16}px`; // 16px = 1rem 基准底部间距
			} else if (scrollToTopBtn) {
				scrollToTopBtn.style.bottom = '';
			}
		}

		// 使用 IntersectionObserver 动态根据页尾可见性调整侧栏和按钮 bottom
		(function observeFooter() {
			const footer = document.querySelector('footer');
			const sidebar = document.getElementById('sidebar');
			const scrollToTopBtn = document.getElementById('scroll-to-top');
			if (!footer || !sidebar) return;
			try {
				const io = new IntersectionObserver((entries) => {
					for (const entry of entries) {
						const rect = footer.getBoundingClientRect();
						const footerHeight = Math.ceil(rect.height);
						const visibleTop = Math.max(0, rect.top);
						const visibleBottom = Math.min(window.innerHeight, rect.bottom);
						const visibleHeight = Math.max(0, visibleBottom - visibleTop);
						let bottomGap = Math.min(visibleHeight, footerHeight);
						if (visibleHeight >= footerHeight) bottomGap = footerHeight + 4; // 4px 安全边距
						
						// 宽屏时调整侧边栏
						if (window.innerWidth > 760) {
							const headerHeight = Math.ceil(document.querySelector('header').getBoundingClientRect().height);
							sidebar.style.top = headerHeight + 'px';
							sidebar.style.height = 'auto';
							sidebar.style.bottom = `${bottomGap}px`;
						}
						
						// 所有屏幕尺寸都调整返回顶部按钮
						if (scrollToTopBtn && bottomGap > 0) {
							scrollToTopBtn.style.bottom = `${bottomGap + 16}px`;
						} else if (scrollToTopBtn) {
							scrollToTopBtn.style.bottom = '';
						}
					}
				}, { root: null, threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1] });
				io.observe(footer);
			} catch (e) {
				// 兼容性兜底：监听滚动与调整大小并调用 adjustSidebarPosition
				window.addEventListener('scroll', adjustSidebarPosition, { passive: true });
				window.addEventListener('resize', adjustSidebarPosition);
			}
		})();

		// 初始与窗口调整时都运行
		window.addEventListener('resize', adjustSidebarPosition);
		window.addEventListener('load', adjustSidebarPosition);

		// 在窄屏或者 unload 时移除 body padding-top，以防止影响页面外观
		window.addEventListener('unload', function () { document.body.style.paddingTop = ''; });

		// 在折叠状态变化时也重算位置（延迟以配合过渡）
		const observer = new MutationObserver(() => { setTimeout(adjustSidebarPosition, 220); });
		observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

		// 立即调整一次
		adjustSidebarPosition();
	});
});

// 可选：在页面载入后把所有 submenu 的内联 maxHeight 归零（确保一致）
window.addEventListener('load', function () {
	document.querySelectorAll('.sidebar .submenu').forEach(s => s.style.maxHeight = '0px');
});
