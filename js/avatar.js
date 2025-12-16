// 头部头像菜单事件
document.addEventListener('DOMContentLoaded', function () {
	try {
		console.debug('[avatar.js] init');
		const avatarBtn = document.getElementById('avatar-btn');
		const avatarMenu = document.getElementById('avatar-links-menu');

	// 禁用头像和 logo 的拖拽保存
	const headerImages = document.querySelectorAll('header .logo, header .header-avatar');
	headerImages.forEach(img => {
		img.draggable = false;
		img.addEventListener('dragstart', (e) => {
			e.preventDefault();
			return false;
		});
		img.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			return false;
		});
	});

	// 点击头像开/关菜单
	if (avatarBtn) {
		avatarBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			if (!avatarMenu) return; // defensive
			console.debug('[avatar.js] avatar button clicked');
			const willOpen = !avatarMenu.classList.contains('active');
			// 关闭其他菜单
			const settingsMenu = document.querySelector('.theme-settings-menu');
			const languageSelectorMenu = document.querySelector('.language-selector-menu');
			[settingsMenu, languageSelectorMenu].forEach(m => m && m.classList.remove('active'));
			avatarMenu.classList.toggle('active');
		});
	}

	// 头部菜单相关事件
	document.addEventListener('click', (e) => {
		if (!e.target.closest('#avatar-btn') && !e.target.closest('#avatar-links-menu') && !e.target.closest('.theme-settings-container') && !e.target.closest('.language-selector-container')) {
			if (avatarMenu) avatarMenu.classList.remove('active');
		}
	});

    } catch (err) {
        console.error('[avatar.js] init error', err);
    }
});
