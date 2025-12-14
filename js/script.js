// 左侧导航折叠/展开逻辑
document.addEventListener('DOMContentLoaded', function () {
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
			const sidebar = document.getElementById('sidebar');
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
				return;
			}

			// 宽屏：侧边栏固定在 header 下面，并设置 body padding-top 避免内容被 header 遮挡
			sidebar.style.top = headerHeight + 'px';
			sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
			document.body.style.paddingTop = headerHeight + 'px';
		}

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

