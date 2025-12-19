// 模块：图片放大预览 / Lightbox overlay with zoom, captions, and filmstrip.
document.addEventListener('DOMContentLoaded', function () {
	let candidates = [];

	// create/init lightbox so it can be called after SPA swaps
	function initLightbox() {
		console.log('[lightbox] initLightbox: scanning candidates');
		candidates = Array.from(document.querySelectorAll('main img, #aside-stack img'));
		// rebuild captions for the new candidates
		buildCaptions();
		// if overlay was removed by SPA cleanup, re-create by re-running the init block
		const existingOverlay = document.getElementById('image-lightbox');
		if (!existingOverlay) {
			// re-run minimal init by recreating the overlay element and re-applying labels
			// (the rest of initialization flow will re-bind handlers via refreshAll)
			const evt = new Event('lightbox:recreate');
			document.dispatchEvent(evt);
		}
	}

	// 检测并处理图片标题：img 后面紧跟的 p 标签（中间没有 br）视为标题
	let imageCaptions = new Map();
	function buildCaptions(){
		imageCaptions = new Map();
		candidates.forEach((img, index) => {
			// 获取下一个元素节点
			let nextElement = img.nextElementSibling;

			// 如果下一个元素是 P 标签
			if (nextElement && nextElement.tagName === 'P') {
				// 检查中间是否有 BR 标签
				let hasBrBetween = false;
				let node = img.nextSibling;

				while (node && node !== nextElement) {
					// 检查是否是 BR 元素
					if (node.nodeType === 1 && node.tagName === 'BR') {
						hasBrBetween = true;
						break;
					}
					node = node.nextSibling;
				}

				// 如果中间没有 BR，则视为图片标题
				if (!hasBrBetween) {
					const captionText = nextElement.textContent.trim();
					if (captionText) {
						imageCaptions.set(index, captionText);
						// 隐藏这个段落
						nextElement.classList.add('image-caption-hidden');
					}
				}
			}
		});
	}

	let overlay = null;
	let filmstrip = null;

	function ensureOverlay() {
		overlay = document.getElementById('image-lightbox');
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.id = 'image-lightbox';
			overlay.setAttribute('aria-hidden', 'true');
			overlay.innerHTML = `
			<button class="lightbox-fullscreen" aria-label="Fullscreen" title="全屏"><i class="icon-ic_fluent_full_screen_maximize_24_regular" aria-hidden="true"></i></button>
			<button class="lightbox-close" aria-label="Close image"><i class="icon-ic_fluent_dismiss_24_regular" aria-hidden="true"></i></button>
			<button class="lightbox-prev lightbox-nav" aria-label="上一张图片" title="上一张">
				<i class="icon-ic_fluent_chevron_left_24_regular" aria-hidden="true"></i>
			</button>
			<button class="lightbox-next lightbox-nav" aria-label="下一张图片" title="下一张">
				<i class="icon-ic_fluent_chevron_right_24_regular" aria-hidden="true"></i>
			</button>
			<button class="lightbox-download-btn" aria-label="Download image" title="Download image"><i class="icon-ic_fluent_arrow_download_24_regular" aria-hidden="true"></i></button>
			<button class="lightbox-locate-btn" aria-label="Locate in document" title="Locate in document"><i class="icon-ic_fluent_location_24_regular" aria-hidden="true"></i></button>
			<div class="lightbox-title" style="display: none;"></div>
			<div class="lightbox-content">
				<div class="lightbox-controls" aria-hidden="true">
                    
				</div>
				<div class="lightbox-image-wrapper">
					<img alt="" />
				</div>
			</div>
		`;
			document.body.appendChild(overlay);
		}

		filmstrip = overlay.querySelector('.lightbox-filmstrip');
		if (!filmstrip) {
			filmstrip = document.createElement('div');
			filmstrip.className = 'lightbox-filmstrip';
			filmstrip.setAttribute('role', 'list');
			overlay.appendChild(filmstrip);
		}
		return overlay;
	}

	// overlay element references (mutable so they can be refreshed after SPA swaps)
	let overlayImg = null;
	let imageWrapper = null;
	let closeBtn = null;
	let downloadBtn = null;
	let locateBtn = null;
	let fullscreenBtn = null;
	let zoomBox = null;
	let zoomInBtn = null;
	let zoomOutBtn = null;
	let zoomInput = null;

	// ensure overlay exists and refresh references
	ensureOverlay();
	overlayImg = overlay.querySelector('img');
	imageWrapper = overlay.querySelector('.lightbox-image-wrapper');
	closeBtn = overlay.querySelector('.lightbox-close');
	function refreshOverlayRefs() {
		// ensure overlay exists
		ensureOverlay();
		// refresh commonly used inner references
		overlayImg = overlay.querySelector('img');
		imageWrapper = overlay.querySelector('.lightbox-image-wrapper');
		closeBtn = overlay.querySelector('.lightbox-close');
		downloadBtn = overlay.querySelector('.lightbox-download-btn');
		locateBtn = overlay.querySelector('.lightbox-locate-btn');
		fullscreenBtn = overlay.querySelector('.lightbox-fullscreen');
		zoomBox = overlay.querySelector('.lightbox-zoom-indicator');
		zoomInBtn = overlay.querySelector('.lightbox-zoom-in');
		zoomOutBtn = overlay.querySelector('.lightbox-zoom-out');
		zoomInput = overlay.querySelector('.zoom-input');
		filmstrip = overlay.querySelector('.lightbox-filmstrip') || filmstrip;
	}
	downloadBtn = overlay.querySelector('.lightbox-download-btn');
	locateBtn = overlay.querySelector('.lightbox-locate-btn');
	fullscreenBtn = overlay.querySelector('.lightbox-fullscreen');
	zoomBox = overlay.querySelector('.lightbox-zoom-indicator');
	zoomInBtn = overlay.querySelector('.lightbox-zoom-in');
	zoomOutBtn = overlay.querySelector('.lightbox-zoom-out');
	if (!zoomBox) {
		zoomBox = document.createElement('div');
		zoomBox.className = 'lightbox-zoom-indicator';
		zoomBox.innerHTML = `
			<button class="lightbox-zoom-out" aria-label="Zoom out"><i class="icon-ic_fluent_zoom_out_24_regular" aria-hidden="true"></i></button>
			<input class="zoom-input styled-input" type="text" inputmode="numeric" placeholder="100%" aria-label="Zoom percentage">
			<button class="lightbox-zoom-in" aria-label="Zoom in"><i class="icon-ic_fluent_zoom_in_24_regular" aria-hidden="true"></i></button>
		`;
		overlay.appendChild(zoomBox);
		// re-query buttons now they exist inside zoomBox
		zoomInBtn = zoomBox.querySelector('.lightbox-zoom-in');
		zoomOutBtn = zoomBox.querySelector('.lightbox-zoom-out');
	}
	zoomInput = zoomBox.querySelector('.zoom-input');
	let currentIndex = 0;
	let currentScale = 1;
	let panX = 0;
	let panY = 0;
	let isPanning = false;
	let startPointerX = 0;
	let startPointerY = 0;
	let startPanX = 0;
	let startPanY = 0;
	let isPinching = false;
	let pinchStartDistance = 0;
	let pinchStartScale = 1;
	let pinchStartPanX = 0;
	let pinchStartPanY = 0;
	let pinchStartMidX = 0;
	let pinchStartMidY = 0;
	const activePointers = new Map();
	const getLang = () => document.documentElement.lang || localStorage.getItem('language') || 'zh-CN';
	const applyLightboxLabels = () => {
		if (typeof translations === 'undefined') return;
		const strings = translations[getLang()] && translations[getLang()].lightbox;
		if (!strings) return;
		if (closeBtn) closeBtn.setAttribute('aria-label', strings.close);
		if (zoomInBtn) zoomInBtn.setAttribute('aria-label', strings.zoomIn);
		if (zoomOutBtn) zoomOutBtn.setAttribute('aria-label', strings.zoomOut);
		if (downloadBtn) {
			downloadBtn.setAttribute('aria-label', strings.download);
			downloadBtn.setAttribute('title', strings.download);
		}
		if (locateBtn) {
			locateBtn.setAttribute('aria-label', strings.locate);
			locateBtn.setAttribute('title', strings.locate);
		}
		if (zoomInput) {
			zoomInput.setAttribute('aria-label', strings.zoomInputLabel || strings.zoomIn);
			if (strings.zoomInputPlaceholder) {
				zoomInput.placeholder = strings.zoomInputPlaceholder;
			}
		}
		// prev/next/fullscreen labels
		const prevBtn = overlay.querySelector('.lightbox-prev');
		const nextBtn = overlay.querySelector('.lightbox-next');
		if (prevBtn && strings.prev) { prevBtn.setAttribute('aria-label', strings.prev); prevBtn.setAttribute('title', strings.prev); }
		if (nextBtn && strings.next) { nextBtn.setAttribute('aria-label', strings.next); nextBtn.setAttribute('title', strings.next); }
		if (fullscreenBtn && strings.fullscreen) { fullscreenBtn.setAttribute('aria-label', strings.fullscreen); fullscreenBtn.setAttribute('title', strings.fullscreen); }
		// ensure close has title as well
		if (closeBtn && strings.close) closeBtn.setAttribute('title', strings.close);
	};

	// apply labels now and when language changes
	applyLightboxLabels();
	document.addEventListener('languagechange', applyLightboxLabels);

	const updateCursor = () => {
		const dragging = isPanning || isPinching;
		overlayImg.style.cursor = currentScale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default';
	};

	const clampPan = () => {
		const wrapperRect = imageWrapper.getBoundingClientRect();
		const naturalWidth = overlayImg.naturalWidth || overlayImg.width;
		const naturalHeight = overlayImg.naturalHeight || overlayImg.height;
		if (!naturalWidth || !naturalHeight || !wrapperRect.width || !wrapperRect.height) return;
		const fitScale = Math.min(wrapperRect.width / naturalWidth, wrapperRect.height / naturalHeight, 1);
		const baseWidth = naturalWidth * fitScale;
		const baseHeight = naturalHeight * fitScale;
		const scaledWidth = baseWidth * currentScale;
		const scaledHeight = baseHeight * currentScale;
		const limitX = Math.max(0, (scaledWidth - wrapperRect.width) / 2);
		const limitY = Math.max(0, (scaledHeight - wrapperRect.height) / 2);
		panX = Math.min(limitX, Math.max(-limitX, panX));
		panY = Math.min(limitY, Math.max(-limitY, panY));
	};

	const applyTransform = (options = {}) => {
		const { clamp = true } = options;
		if (clamp) clampPan();
		overlayImg.style.transform = `translate(${panX}px, ${panY}px) scale(${currentScale})`;
		updateZoomDisplay();
		updateCursor();
	};

	const resetTransform = () => {
		currentScale = 1;
		panX = 0;
		panY = 0;
		overlayImg.style.transform = 'translate(0px, 0px) scale(1)';
		updateZoomDisplay();
		updateCursor();
	};

	// Allow zoom range from 40% to 400%
	const clampScale = (val) => Math.min(4.0, Math.max(0.4, val));

	const updateZoomDisplay = () => {
		const pct = Math.round(currentScale * 100);
		if (zoomInput) {
			zoomInput.value = `${pct}%`;
		}
	};

	const getPinchMetrics = () => {
		if (activePointers.size < 2) return null;
		const pts = Array.from(activePointers.values()).slice(0, 2);
		const dx = pts[0].x - pts[1].x;
		const dy = pts[0].y - pts[1].y;
		const distance = Math.hypot(dx, dy);
		const midX = (pts[0].x + pts[1].x) / 2;
		const midY = (pts[0].y + pts[1].y) / 2;
		return { distance, midX, midY };
	};

	const onPointerDown = (e) => {
		activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		// only capture pointer on the image element to avoid stealing clicks from controls
		if (e.target === overlayImg) {
			try {
				overlayImg.setPointerCapture(e.pointerId);
			} catch (_) {
				/* ignore */
			}
		}
		updateCursor();

		// start potential swipe when not zoomed
		if (activePointers.size === 1 && currentScale <= 1) {
			startPointerX = e.clientX;
			startPointerY = e.clientY;
		}


	};

	const onPointerMove = (e) => {
		if (!activePointers.has(e.pointerId)) return;
		activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });



		// 两个指针或以上：捏合缩放
		if (activePointers.size >= 2) {
			if (!isPinching) {
				isPinching = true;
				isPanning = false;
				const metrics = getPinchMetrics();
				if (!metrics) return;
				pinchStartDistance = metrics.distance || 1;
				pinchStartScale = currentScale;
				pinchStartPanX = panX;
				pinchStartPanY = panY;
				pinchStartMidX = metrics.midX;
				pinchStartMidY = metrics.midY;
			}
			e.preventDefault();
			const metrics = getPinchMetrics();
			if (!metrics || !metrics.distance) return;
			const scaleRatio = metrics.distance / pinchStartDistance;
			currentScale = clampScale(pinchStartScale * scaleRatio);
			const appliedRatio = currentScale / pinchStartScale;
			const dx = metrics.midX - pinchStartMidX;
			const dy = metrics.midY - pinchStartMidY;
			panX = pinchStartPanX * appliedRatio + dx;
			panY = pinchStartPanY * appliedRatio + dy;
			applyTransform({ clamp: false });
			return;
		}

		// 单个指针且图片已放大：拖拽平移
		if (activePointers.size === 1 && currentScale > 1) {
			if (!isPanning) {
				isPanning = true;
				isPinching = false;
				const ptr = Array.from(activePointers.values())[0];
				startPointerX = ptr.x;
				startPointerY = ptr.y;
				startPanX = panX;
				startPanY = panY;
			}
			e.preventDefault();
			const dx = e.clientX - startPointerX;
			const dy = e.clientY - startPointerY;
			panX = startPanX + dx;
			panY = startPanY + dy;
			applyTransform({ clamp: false });
		}

		// 单指且未放大：检测水平滑动以切换图片（防止在垂直滚动时误触）
		if (activePointers.size === 1 && currentScale <= 1 && !isPanning && !isPinching) {
			const ptr = Array.from(activePointers.values())[0];
			const dx = ptr.x - startPointerX;
			const dy = ptr.y - startPointerY;
			// 判定为水平滑动且水平位移明显大于垂直位移
			if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
				// trigger swipe
				if (dx < 0) {
					const next = Math.min(candidates.length - 1, currentIndex + 1);
					if (next !== currentIndex) openOverlay(next);
				} else {
					const prev = Math.max(0, currentIndex - 1);
					if (prev !== currentIndex) openOverlay(prev);
				}
			}
		}
	};

	const onPointerUp = (e) => {
		activePointers.delete(e.pointerId);
		if (isPinching && activePointers.size < 2) {
			isPinching = false;
		}
		if (activePointers.size === 0) {
			isPanning = false;
			applyTransform();
		} else if (!isPinching) {
			applyTransform();
		}
		try {
			if (overlayImg && overlayImg.hasPointerCapture && overlayImg.hasPointerCapture(e.pointerId)) {
				overlayImg.releasePointerCapture(e.pointerId);
			}
		} catch (_) {
			/* ignore */
		}
		updateCursor();

		// clear swipe start coords when all pointers up
		if (activePointers.size === 0) {
			startPointerX = 0;
			startPointerY = 0;
		}


	};

	// 鼠标滚轮缩放
	const onWheel = (e) => {
		if (!overlay.classList.contains('active')) return;
		e.preventDefault();
		const delta = Math.sign(e.deltaY);
		const step = 0.08;
		const prevScale = currentScale;
		currentScale = clampScale(prevScale + (delta < 0 ? step : -step));
		// 以光标为中心微调平移，增强缩放体验
		const rect = imageWrapper.getBoundingClientRect();
		const cx = e.clientX - rect.left - rect.width / 2;
		const cy = e.clientY - rect.top - rect.height / 2;
		const ratio = currentScale / prevScale;
		panX = panX * ratio + cx * (1 - ratio);
		panY = panY * ratio + cy * (1 - ratio);
		applyTransform({ clamp: true });
	};

	// 键盘左右/上下切换图片
	const onKeyDown = (e) => {
		if (!overlay.classList.contains('active')) return;
		const code = e.key;
		if (code === 'ArrowRight' || code === 'ArrowDown') {
			// 下一张
			const next = Math.min(candidates.length - 1, currentIndex + 1);
			if (next !== currentIndex) openOverlay(next);
			e.preventDefault();
		} else if (code === 'ArrowLeft' || code === 'ArrowUp') {
			// 上一张
			const prev = Math.max(0, currentIndex - 1);
			if (prev !== currentIndex) openOverlay(prev);
			e.preventDefault();
		} else if (code === 'Escape') {
			closeOverlay();
		}
	};

	const setActiveThumb = () => {
		const thumbs = filmstrip.querySelectorAll('.filmstrip-thumb');
		thumbs.forEach((btn, idx) => {
			btn.classList.toggle('active', idx === currentIndex);
		});
		// 确保当前缩略图可见
		const active = thumbs[currentIndex];
		if (active && active.scrollIntoView) {
			active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
		}
	};

	const openOverlay = (index) => {
		if (!candidates.length) return;
		if (typeof index !== 'number' || index < 0 || index >= candidates.length) return;
		const isAlreadyOpen = overlay.classList.contains('active');
		const titleEl = overlay.querySelector('.lightbox-title');
		
		// 如果点击的是同一张图片，不执行任何操作
		if (isAlreadyOpen && index === currentIndex) {
			return;
		}
		
		// 如果已经打开，添加滑动效果
		if (isAlreadyOpen && imageWrapper) {
			// 根据索引关系确定滑动方向
			// index > currentIndex：点击后面的图片，旧图片向左走，新图片从右边来
			// index < currentIndex：点击前面的图片，旧图片向右走，新图片从左边来
			const clickingNext = index > currentIndex;
			
			// 旧图片包装器滑出
			imageWrapper.classList.add(clickingNext ? 'slide-out-left' : 'slide-out-right');
			if (titleEl) titleEl.classList.remove('show');
			
			// 等待滑出动画完成后再切换图片
			setTimeout(() => {
				currentIndex = index;
				currentScale = 1;
				panX = 0;
				panY = 0;
				const target = candidates[currentIndex];
				if (target) {
					overlayImg.src = target.src;
					overlayImg.alt = target.alt || '';
				}
				
				// 移除滑出类，准备新图片从相应方向滑入
				imageWrapper.classList.remove('slide-out-left', 'slide-out-right');
				
				// 新图片从相反方向来：点击下一张从右边来，点击上一张从左边来
				const slideInClass = clickingNext ? 'slide-in-from-right' : 'slide-in-from-left';
				imageWrapper.classList.add(slideInClass);
				
				// 触发重排以确保瞬间移动生效
				void imageWrapper.offsetWidth;
				
				// 移除 slide-in 类并重新启用过渡，让包装器滑入到正常位置
				imageWrapper.classList.remove(slideInClass);
				
				// 重置缩放
				overlayImg.style.transform = 'translate(0px, 0px) scale(1)';
				updateCursor();
				
				// 更新标题
				if (titleEl) {
					const caption = imageCaptions.get(index);
					if (caption) {
						titleEl.textContent = caption;
						titleEl.style.display = 'block';
						setTimeout(() => titleEl.classList.add('show'), 10);
					} else {
						titleEl.style.display = 'none';
						titleEl.classList.remove('show');
					}
				}
				
				setActiveThumb();
				updateZoomDisplay();
				if (zoomInput) {
					zoomInput.value = '100%';
				}
			}, 300);
		} else {
			// 首次打开
			currentIndex = index;
			currentScale = 1;
			panX = 0;
			panY = 0;
			const target = candidates[currentIndex];
			if (target) {
				overlayImg.src = target.src;
				overlayImg.alt = target.alt || '';
			}
			overlayImg.style.transform = 'translate(0px, 0px) scale(1)';
			updateCursor();
			
			// 显示或隐藏标题
			if (titleEl) {
				const caption = imageCaptions.get(index);
				if (caption) {
					titleEl.textContent = caption;
					titleEl.style.display = 'block';
					setTimeout(() => titleEl.classList.add('show'), 10);
				} else {
					titleEl.style.display = 'none';
					titleEl.classList.remove('show');
				}
			}
			
			overlay.classList.add('active');
			overlay.setAttribute('aria-hidden', 'false');
			document.body.classList.add('no-scroll-lightbox');
			// 绑定滚轮与键盘事件
			overlay.addEventListener('wheel', onWheel, { passive: false });
			document.addEventListener('keydown', onKeyDown);
			setActiveThumb();
			updateZoomDisplay();
			if (zoomInput) {
				zoomInput.value = '100%';
			}
		}
	};

	const closeOverlay = () => {
		resetTransform();
		isPanning = false;
		isPinching = false;
		activePointers.clear();
		overlay.classList.remove('active');
		overlay.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('no-scroll-lightbox');
		// 解绑滚轮与键盘事件
		overlay.removeEventListener('wheel', onWheel);
		document.removeEventListener('keydown', onKeyDown);
	};

	const locateInDocument = () => {
		const img = candidates[currentIndex];
		if (img) {
			closeOverlay();
			
			// 滚动到图片位置
			img.scrollIntoView({ behavior: 'smooth', block: 'center' });
			
			// 高亮图片 3 秒
			img.classList.add('highlighted');
			
			// 3 秒后移除高亮
			setTimeout(() => {
				img.classList.remove('highlighted');
			}, 3000);
		}
	};

	const downloadImage = () => {
		if (!candidates.length) return;
		const img = candidates[currentIndex];
		if (!img) return;

		// 获取图片标题或使用原始文件名
		const caption = imageCaptions.get(currentIndex);
		const originalSrc = img.src;
		const urlObj = new URL(originalSrc, window.location.href);
		const pathname = urlObj.pathname;
		const originalFileName = pathname.split('/').pop();
		const fileName = caption || originalFileName;

		// 创建 a 标签并触发下载
		const link = document.createElement('a');
		link.href = originalSrc;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Attach click handlers to candidates and mark as zoomable
	function attachCandidates(){
		candidates.forEach((img, index) => {
			// prevent attaching twice
			if (img.dataset.lightboxAttached) return;
			img.dataset.lightboxAttached = '1';
			img.classList.add('zoomable-img');
			img.addEventListener('click', () => {
				openOverlay(index);
			});
		});
	}

	// Build filmstrip thumbnails
	function buildFilmstrip(){
		filmstrip.innerHTML = '';
		candidates.forEach((img, index) => {
			const btn = document.createElement('button');
			btn.className = 'filmstrip-thumb';
			btn.setAttribute('role', 'listitem');
			btn.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}">`;
			btn.dataset.index = index;
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				openOverlay(Number(btn.dataset.index));
			});
			filmstrip.appendChild(btn);
		});
		console.log('[lightbox] buildFilmstrip done, thumbs=', filmstrip.children.length);
	}

	function refreshAll(){
		console.log('[lightbox] refreshAll called');
		console.log('[lightbox] candidates before refresh: ' + document.querySelectorAll('main img, #aside-stack img').length);
		ensureOverlay();
		refreshOverlayRefs();
		candidates = Array.from(document.querySelectorAll('main img, #aside-stack img'));
		// clear previous attachment markers so we rebind cleanly after SPA swaps
		document.querySelectorAll('img[data-lightbox-attached]').forEach(i => delete i.dataset.lightboxAttached);
		console.log('[lightbox] candidates after query: ' + candidates.length);
		buildCaptions();
		attachCandidates();
		buildFilmstrip();
		// rebind controls in case overlay was recreated
		bindOverlayControls();
		console.log('[lightbox] refreshAll finished, filmstrip children: ' + (filmstrip ? filmstrip.children.length : 0));
	}

	function bindOverlayControls() {
		if (!overlay) return;
		// query controls fresh
		const closeBtn = overlay.querySelector('.lightbox-close');
		const downloadBtn = overlay.querySelector('.lightbox-download-btn');
		const locateBtn = overlay.querySelector('.lightbox-locate-btn');
		const fullscreenBtn = overlay.querySelector('.lightbox-fullscreen');
		const prevBtn = overlay.querySelector('.lightbox-prev');
		const nextBtn = overlay.querySelector('.lightbox-next');
		const zoomBoxLocal = overlay.querySelector('.lightbox-zoom-indicator');
		const zoomInBtnLocal = zoomBoxLocal && zoomBoxLocal.querySelector('.lightbox-zoom-in');
		const zoomOutBtnLocal = zoomBoxLocal && zoomBoxLocal.querySelector('.lightbox-zoom-out');
		const zoomInputLocal = zoomBoxLocal && zoomBoxLocal.querySelector('.zoom-input');
		const overlayImgLocal = overlay.querySelector('img');

		if (closeBtn) {
			closeBtn.removeEventListener('click', closeOverlay);
			closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeOverlay(); });
		}
		if (downloadBtn) {
			downloadBtn.removeEventListener('click', downloadImage);
			downloadBtn.addEventListener('click', (e) => { e.stopPropagation(); downloadImage(); });
		}
		if (locateBtn) {
			locateBtn.removeEventListener('click', locateInDocument);
			locateBtn.addEventListener('click', (e) => { e.stopPropagation(); locateInDocument(); });
		}
		if (prevBtn) {
			prevBtn.removeEventListener('click', prevClickHandler);
			prevBtn.addEventListener('click', prevClickHandler);
		}
		if (nextBtn) {
			nextBtn.removeEventListener('click', nextClickHandler);
			nextBtn.addEventListener('click', nextClickHandler);
		}
		if (zoomInBtnLocal) {
			zoomInBtnLocal.removeEventListener('click', zoomInHandler);
			zoomInBtnLocal.addEventListener('click', zoomInHandler);
		}
		if (zoomOutBtnLocal) {
			zoomOutBtnLocal.removeEventListener('click', zoomOutHandler);
			zoomOutBtnLocal.addEventListener('click', zoomOutHandler);
		}
		if (zoomInputLocal) {
			zoomInputLocal.removeEventListener('keydown', zoomInputKeyHandler);
			zoomInputLocal.addEventListener('keydown', zoomInputKeyHandler);
			zoomInputLocal.removeEventListener('change', zoomInputChangeHandler);
			zoomInputLocal.addEventListener('change', zoomInputChangeHandler);
			zoomInputLocal.removeEventListener('blur', applyZoomFromInput);
			zoomInputLocal.addEventListener('blur', applyZoomFromInput);
		}
		if (overlayImgLocal) {
			overlayImgLocal.style.touchAction = 'none';
			overlayImgLocal.draggable = false;
			overlayImgLocal.removeEventListener('pointerdown', onPointerDown);
			overlayImgLocal.addEventListener('pointerdown', onPointerDown);
			overlayImgLocal.removeEventListener('pointermove', onPointerMove);
			overlayImgLocal.addEventListener('pointermove', onPointerMove);
			overlayImgLocal.removeEventListener('pointerup', onPointerUp);
			overlayImgLocal.addEventListener('pointerup', onPointerUp);
			overlayImgLocal.removeEventListener('pointercancel', onPointerUp);
			overlayImgLocal.addEventListener('pointercancel', onPointerUp);
			overlayImgLocal.removeEventListener('pointerleave', onPointerUp);
			overlayImgLocal.addEventListener('pointerleave', onPointerUp);
			// dragstart/contextmenu
			overlayImgLocal.removeEventListener('dragstart', preventDefaultFalse);
			overlayImgLocal.addEventListener('dragstart', preventDefaultFalse);
			overlayImgLocal.removeEventListener('contextmenu', preventDefaultFalse);
			overlayImgLocal.addEventListener('contextmenu', preventDefaultFalse);
		}

		// overlay click behavior (closing when clicking background, exit fullscreen on non-control click)
		const overlayClickHandler = (e) => {
			if (e.target === overlay) {
				closeOverlay();
				return;
			}
			if (document.fullscreenElement) {
				const isControl = e.target.closest && e.target.closest('button, .lightbox-controls, .lightbox-nav');
				if (!isControl) {
					if (document.exitFullscreen) document.exitFullscreen();
					else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
				}
			}
		};
		overlay.removeEventListener('click', overlayClickHandler);
		overlay.addEventListener('click', overlayClickHandler);
	}

	function preventDefaultFalse(e){ e.preventDefault(); return false; }

	function prevClickHandler(e){ e.stopPropagation(); const prev = Math.max(0, currentIndex - 1); if (prev !== currentIndex) openOverlay(prev); }
	function nextClickHandler(e){ e.stopPropagation(); const next = Math.min(candidates.length - 1, currentIndex + 1); if (next !== currentIndex) openOverlay(next); }
	function zoomInHandler(e){ e.stopPropagation(); currentScale = clampScale(currentScale + 0.15); applyTransform(); }
	function zoomOutHandler(e){ e.stopPropagation(); currentScale = clampScale(currentScale - 0.15); applyTransform(); }
	function zoomInputKeyHandler(e){ if (e.key === 'Enter') { e.preventDefault(); applyZoomFromInput(); } if (e.key === 'Escape') { e.preventDefault(); updateZoomDisplay(); e.target.blur(); } }
	function zoomInputChangeHandler(e){ let val = e.target.value.trim(); if (val && /^\d+(\.\d+)?$/.test(val)) { e.target.value = `${val}%`; applyZoomFromInput(); } }

	// initial attach via refreshAll to ensure overlay and controls are bound
	refreshAll();

	// Controls are bound in bindOverlayControls() to support recreation after SPA swaps

	// track fullscreenchange to toggle a class on overlay for styling and swap icon (dynamic)
	document.addEventListener('fullscreenchange', () => {
		const ov = document.getElementById('image-lightbox');
		if (!ov) return;
		ov.classList.toggle('fullscreen-mode', !!document.fullscreenElement);
		const fb = ov.querySelector('.lightbox-fullscreen');
		if (fb) {
			const ic = fb.querySelector('i');
			if (ic) {
				if (document.fullscreenElement) {
					ic.className = 'icon-ic_fluent_full_screen_minimize_24_regular';
					fb.setAttribute('title', '退出全屏');
				} else {
					ic.className = 'icon-ic_fluent_full_screen_maximize_24_regular';
					fb.setAttribute('title', '全屏');
				}
			}
		}
	});

    

	const applyZoomFromInput = () => {
		if (!zoomInput) return;
		const raw = zoomInput.value.trim();
		if (!raw) {
			updateZoomDisplay();
			return;
		}
		// 移除百分号并解析
		const numStr = raw.replace('%', '').trim();
		const pct = parseFloat(numStr);
		if (!isNaN(pct)) {
			currentScale = clampScale(pct / 100);
			applyTransform();
		}
		updateZoomDisplay();
	};

    

	// Note: avoid binding overlay pointer handlers (they can interfere with button clicks).
	// We'll use overlay click to handle exiting fullscreen when appropriate.
	if (overlay) {
		overlay.addEventListener('click', (e) => {
			// existing close-on-empty-area behavior
			if (e.target === overlay) {
				closeOverlay();
				return;
			}
			// If in fullscreen and user clicked non-control area, exit fullscreen
			if (document.fullscreenElement) {
				const isControl = e.target.closest && e.target.closest('button, .lightbox-controls, .lightbox-nav');
				if (!isControl) {
					if (document.exitFullscreen) document.exitFullscreen();
					else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
				}
			}
		});
	}

	if (zoomInput) {
		zoomInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				applyZoomFromInput();
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				updateZoomDisplay();
				zoomInput.blur();
			}
		});
		zoomInput.addEventListener('change', (e) => {
			let val = e.target.value.trim();
			// 如果只输入了数字，自动加上%
			if (val && /^\d+(\.\d+)?$/.test(val)) {
				e.target.value = `${val}%`;
				applyZoomFromInput();
			}
		});
		zoomInput.addEventListener('blur', applyZoomFromInput);
	}

	// 初始化遮罩按钮的本地化标签
	applyLightboxLabels();

	// 监听外部刷新事件（例如 README 渲染完成后）
	document.addEventListener('lightbox:refresh', () => {
		try { refreshAll(); applyLightboxLabels(); } catch (e) { /* ignore */ }
	});

	// SPA 页面切换或侧边栏触发的 locationchange 时也需要刷新候选图片
	const refreshOnSpa = () => { try { initLightbox(); refreshAll(); applyLightboxLabels(); } catch (e) { /* ignore */ } };
	document.addEventListener('spa:page:loaded', refreshOnSpa);
	window.addEventListener('locationchange', refreshOnSpa);

	// If SPA router cleaned up overlay before swap, recreate on demand
	document.addEventListener('lightbox:recreate', () => {
		// recreate overlay node by reinjecting HTML and re-binding basic references
		if (!document.getElementById('image-lightbox')) {
			const el = document.createElement('div');
			el.id = 'image-lightbox';
			el.setAttribute('aria-hidden', 'true');
			// minimal structure: buttons and img wrapper; full markup will be rebuilt by this file's logic
			el.innerHTML = overlay.innerHTML || '';
			document.body.appendChild(el);
			// allow rest of script to refresh references
		}
	});

	// Expose a small API so other scripts (like readme.html) can control/open/refresh the lightbox
	window.siteLightbox = {
		open: function(index){
			if (typeof index === 'number' && index >= 0 && index < candidates.length) {
				openOverlay(index);
			}
		},
		refresh: function(){
			refreshAll();
		}
	};

	// expose init so SPA router or other modules can reinitialize after DOM swaps
	window.initLightbox = function(){
		try {
			ensureOverlay();
			refreshOverlayRefs();
			initLightbox();
			refreshAll();
			applyLightboxLabels();
			bindOverlayControls();
		} catch (e) { console.warn('[lightbox] initLightbox failed', e); }
	};

	// call once to initialize candidates and labels
	try { window.initLightbox(); } catch (e) { /* ignore */ }

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && overlay.classList.contains('active')) {
			closeOverlay();
		}
	});
});
