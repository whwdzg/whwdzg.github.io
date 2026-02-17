// 模块：头像点击行为 / Avatar click handling and drag protection.
document.addEventListener('DOMContentLoaded', function () {
    try {
        console.debug('[avatar.js] init');
        const avatarBtn = document.getElementById('avatar-btn');
        const headerImages = document.querySelectorAll('header .logo, header .header-avatar');

        // 禁用页眉 logo 与头像的拖拽与右键保存
        headerImages.forEach(img => {
            img.draggable = false;
            img.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
            }, { passive: false });
            img.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        });

        if (avatarBtn) {
            const fallback = '/user/滄海水魚.html';
            const target = avatarBtn.dataset.userPage || avatarBtn.getAttribute('data-user-page') || fallback;
            avatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!target) return;
                if (typeof window.spaRouterNavigate === 'function') {
                    window.spaRouterNavigate(target);
                } else {
                    window.location.assign(target);
                }
            });
        }
    } catch (err) {
        console.error('[avatar.js] init error', err);
    }
});
