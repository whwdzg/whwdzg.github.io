// 模块：返回顶部按钮 / Scroll-to-top interactions with previous-position recall.
document.addEventListener('DOMContentLoaded', function () {
	const scrollToTopBtn = document.getElementById('scroll-to-top');
	if (!scrollToTopBtn) return;

	const icon = scrollToTopBtn.querySelector('.scroll-to-top-icon');
	const LABEL_TOP = '返回顶部';
	const LABEL_RETURN = '返回之前位置';
	let state = 'top';
	let savedPosition = null;

	const updateIcon = (mode) => {
		if (!icon) return;
		icon.classList.toggle('icon-ic_fluent_arrow_up_24_regular', mode === 'top');
		icon.classList.toggle('icon-ic_fluent_arrow_down_24_regular', mode === 'return');
	};

	const setState = (nextState) => {
		state = nextState;
		scrollToTopBtn.dataset.state = nextState;
		const label = nextState === 'return' ? LABEL_RETURN : LABEL_TOP;
		scrollToTopBtn.setAttribute('aria-label', label);
		scrollToTopBtn.setAttribute('title', label);
		updateIcon(nextState);
	};

	const updateVisibility = () => {
		if (window.scrollY > 300 || state === 'return') {
			scrollToTopBtn.classList.add('show');
		} else {
			scrollToTopBtn.classList.remove('show');
		}
	};

	const resetState = () => {
		savedPosition = null;
		setState('top');
		updateVisibility();
	};

	let autoScrollTimer = null;
	let autoScrolling = false;
	const markAutoScroll = (duration = 500) => {
		autoScrolling = true;
		if (autoScrollTimer) clearTimeout(autoScrollTimer);
		autoScrollTimer = setTimeout(() => {
			autoScrolling = false;
			autoScrollTimer = null;
		}, duration);
	};

	window.addEventListener('scroll', updateVisibility, { passive: true });
	window.addEventListener('spa:page:loaded', resetState);
	window.addEventListener('beforeunload', resetState);
	window.addEventListener('scroll', () => {
		if (state === 'return' && !autoScrolling && savedPosition !== null) {
			const delta = Math.abs(window.scrollY - savedPosition);
			if (delta < 12) {
				resetState();
			}
		}
	}, { passive: true });

	setState('top');
	updateVisibility();

	scrollToTopBtn.addEventListener('click', function (event) {
		event.preventDefault();
		if (state === 'return' && savedPosition !== null) {
			const targetPosition = savedPosition;
			savedPosition = null;
			setState('top');
			window.scrollTo({ top: targetPosition, behavior: 'smooth' });
			return;
		}
		if (window.scrollY === 0) return;
		savedPosition = window.scrollY;
		setState('return');
		markAutoScroll();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});
});