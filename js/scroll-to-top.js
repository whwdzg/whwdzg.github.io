// 模块：返回顶部按钮 / Scroll-to-top interactions.
document.addEventListener('DOMContentLoaded', function () {
	const scrollToTopBtn = document.getElementById('scroll-to-top');
	if (!scrollToTopBtn) return;

	// 监听滚动事件，显示/隐藏按钮
	window.addEventListener('scroll', () => {
		// 当滚动距离大于 300px 时显示按钮
		if (window.scrollY > 300) {
			scrollToTopBtn.classList.add('show');
		} else {
			scrollToTopBtn.classList.remove('show');
		}
	});

	// 点击按钮返回顶部
	scrollToTopBtn.addEventListener('click', (e) => {
		e.preventDefault();
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	});
});
