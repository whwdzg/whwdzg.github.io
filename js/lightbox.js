// 模块：图片放大预览 / Lightbox overlay with zoom, captions, and filmstrip.
document.addEventListener('DOMContentLoaded', function () {
	let candidates = [];

	// Determine whether an image should be included in the lightbox (skip avatars/comment heads)
	const isEligibleForLightbox = (img) => {
		if (!img) return false;
		const lbAttr = (img.getAttribute('data-lightbox') || '').toLowerCase();
		if (lbAttr === 'false' || lbAttr === 'off') return false;
		if (img.classList.contains('no-lightbox')) return false;
		if (img.closest('.comment-card') || img.closest('.comment-list')) return false;
		return true;
	};

	// create/init lightbox so it can be called after SPA swaps
	function initLightbox() {
		console.log('[lightbox] initLightbox: scanning candidates');
		candidates = Array.from(document.querySelectorAll('main img, #aside-stack img')).filter(isEligibleForLightbox);
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
	let debugPanel = null;
	let debugCounters = { down: 0, move: 0, up: 0 };
	const isLbDebug = () => {
		try { return /(^|[?&])lbdebug=1($|&)/.test(location.search) || localStorage.getItem('debug-lightbox') === '1'; } catch(e) { return false; }
	};
	function ensureDebugPanel(){
		if (!isLbDebug()) return;
		ensureOverlay();
		overlay.classList.add('debug');
		debugPanel = overlay.querySelector('.lightbox-debug');
		if (!debugPanel) {
			debugPanel = document.createElement('div');
			debugPanel.className = 'lightbox-debug';
			debugPanel.style.position = 'fixed';
			debugPanel.style.left = '8px';
			debugPanel.style.top = '8px';
			debugPanel.style.zIndex = '2000';
			debugPanel.style.maxWidth = 'calc(100vw - 16px)';
			debugPanel.style.font = '12px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
			debugPanel.style.padding = '8px 10px';
			debugPanel.style.borderRadius = '10px';
			debugPanel.style.background = 'rgba(0,0,0,0.60)';
			debugPanel.style.color = '#fff';
			debugPanel.style.pointerEvents = 'none';
			overlay.appendChild(debugPanel);
		}
		updateDebugPanel('init');
	}

	// Global pointer event snooper for debug mode to verify event delivery
	function enableGlobalPointerDebug(){
		if (!isLbDebug()) return;
		const dbg = (ev) => {
			try {
				const img = document.querySelector('#image-lightbox img');
				const wrap = document.querySelector('#image-lightbox .lightbox-image-wrapper');
				console.log('[lightbox-debug] evt', ev.type, 'target=', ev.target && ev.target.tagName, 'coords=', ev.clientX + ',' + ev.clientY,
					' hitsImg=', img && (img === ev.target || img.contains(ev.target)), ' hitsWrap=', wrap && (wrap === ev.target || wrap.contains(ev.target)));
			} catch (e) { console.warn('[lightbox-debug] snooper error', e); }
		};
		document.addEventListener('pointerdown', dbg, true);
		document.addEventListener('pointermove', dbg, true);
		document.addEventListener('pointerup', dbg, true);
	}
	function updateDebugPanel(reason){
		if (!debugPanel || !isLbDebug()) return;
		const inFs = !!document.fullscreenElement || !!document.webkitFullscreenElement;
		debugPanel.textContent =
			`lbdebug (${reason})\n` +
			`active=${overlay && overlay.classList.contains('active')} fs=${inFs}\n` +
			`scale=${currentScale.toFixed(2)} pan=(${Math.round(panX)},${Math.round(panY)})\n` +
			`pointers=${activePointers.size} down/move/up=${debugCounters.down}/${debugCounters.move}/${debugCounters.up}`;
	}

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
	let gestureSurfaceBound = null;
	const onOverlayClickCapture = (e) => {
		if (!overlay) return;
		const inFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement;
		const isControl = e.target.closest && e.target.closest('button, .lightbox-controls, .lightbox-nav');
		if (inFullscreen && !isControl) {
			e.stopPropagation();
			if (document.exitFullscreen) document.exitFullscreen();
			else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
			return;
		}
		// outside fullscreen: click background closes
		if (!inFullscreen && e.target === overlay) {
			closeOverlay();
		}
	};

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
		// keep overlay interactive
		overlay.style.pointerEvents = 'auto';
		if (overlayImg) {
			overlayImg.style.touchAction = 'none';
			overlayImg.style.pointerEvents = 'auto';
		}
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
	let swipeStartX = 0, swipeStartY = 0, swipeEndX = 0, swipeEndY = 0, isSwipePossible = false;
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

	// Allow zoom range from 10% to 500%
	const clampScale = (val) => Math.min(5.0, Math.max(0.1, val));

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

	// Gestures: pan / pinch + swipe fallback (restore swipe detection)
	const onPointerDown = (e) => {
	    debugCounters.down++; ensureDebugPanel();
	    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
	    try { if (overlayImg && overlayImg.setPointerCapture) overlayImg.setPointerCapture(e.pointerId); } catch (_) { }
	    updateCursor();
		// swipe start for single-pointer when not zoomed
		if (activePointers.size === 1 && currentScale <= 1) {
			swipeStartX = e.clientX; swipeStartY = e.clientY; swipeEndX = e.clientX; swipeEndY = e.clientY; isSwipePossible = true;
		}
		markPointerEventSeen();
	};

	const onPointerMove = (e) => {
	    debugCounters.move++; ensureDebugPanel();
	    if (!activePointers.has(e.pointerId)) return;
	    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

	    // Pinch handling when two pointers active
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

	    // Single-pointer pan when zoomed
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
		// track swipe while not zoomed (decide on pointerup)
		if (activePointers.size === 1 && currentScale <= 1 && isSwipePossible) {
			swipeEndX = e.clientX; swipeEndY = e.clientY;
			const dx = swipeEndX - swipeStartX;
			const dy = swipeEndY - swipeStartY;
			if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
				e.preventDefault();
			}
		}
	};

	const onPointerUp = (e) => {
	    debugCounters.up++; ensureDebugPanel();
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
	    try { if (overlayImg && overlayImg.releasePointerCapture) overlayImg.releasePointerCapture(e.pointerId); } catch (_) { }
	    updateCursor();
		// swipe decision on last pointer up (only when not zoomed)
		if (isSwipePossible && activePointers.size === 0 && currentScale <= 1) {
			const dx = swipeEndX - swipeStartX;
			const dy = swipeEndY - swipeStartY;
			if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
				if (dx < 0) {
					const next = Math.min(candidates.length - 1, currentIndex + 1);
					if (next !== currentIndex) openOverlay(next);
				} else {
					const prev = Math.max(0, currentIndex - 1);
					if (prev !== currentIndex) openOverlay(prev);
				}
			}
		}
		isSwipePossible = false;
	};

	// Fallback: mouse drag handlers (older-style) — emulate pointer-based pan/pinch for mouse
	let lastPointerWasPointer = false;
	function markPointerEventSeen(){
		lastPointerWasPointer = true;
		setTimeout(() => { lastPointerWasPointer = false; }, 200);
	}

	const onMouseDown = (e) => {
		if (lastPointerWasPointer) return;
		debugCounters.down++; ensureDebugPanel();
		activePointers.set('mouse', { x: e.clientX, y: e.clientY });
		// start pan if zoomed
		if (currentScale > 1) {
			isPanning = true;
			isPinching = false;
			startPointerX = e.clientX;
			startPointerY = e.clientY;
			startPanX = panX;
			startPanY = panY;
		}
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		e.preventDefault();
	};

	const onMouseMove = (e) => {
		if (!activePointers.has('mouse')) return;
		debugCounters.move++; ensureDebugPanel();
		activePointers.set('mouse', { x: e.clientX, y: e.clientY });
		// pan when zoomed
		if (currentScale > 1 && isPanning) {
			const dx = e.clientX - startPointerX;
			const dy = e.clientY - startPointerY;
			panX = startPanX + dx;
			panY = startPanY + dy;
			applyTransform({ clamp: false });
		}
	};

	const onMouseUp = (e) => {
		if (!activePointers.has('mouse')) return;
		debugCounters.up++; ensureDebugPanel();
		activePointers.delete('mouse');
		isPanning = false;
		applyTransform();
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
		updateCursor();
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
		// show debug panel ASAP when enabled (even if pointer events never fire)
		try { ensureDebugPanel(); } catch (e) { /* ignore */ }
		refreshOverlayRefs();
		candidates = Array.from(document.querySelectorAll('main img, #aside-stack img')).filter(isEligibleForLightbox);
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
		const imageWrapperLocal = overlay.querySelector('.lightbox-image-wrapper');

		// keep module-level refs in sync (transform math uses these)
		if (overlayImgLocal) overlayImg = overlayImgLocal;
		if (imageWrapperLocal) imageWrapper = imageWrapperLocal;

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
		if (fullscreenBtn) {
			fullscreenBtn.removeEventListener('click', fullscreenToggleHandler);
			fullscreenBtn.addEventListener('click', fullscreenToggleHandler);
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
			// dragstart/contextmenu
			overlayImgLocal.removeEventListener('dragstart', preventDefaultFalse);
			overlayImgLocal.addEventListener('dragstart', preventDefaultFalse);
			overlayImgLocal.removeEventListener('contextmenu', preventDefaultFalse);
			overlayImgLocal.addEventListener('contextmenu', preventDefaultFalse);
		}

		// Bind gestures to the CURRENT wrapper as primary surface (avoid stale refs)
		const gestureSurface = imageWrapperLocal || overlayImgLocal;
		if (gestureSurface && gestureSurfaceBound !== gestureSurface) {
			// unbind from previous surface (if any)
			if (gestureSurfaceBound) {
				gestureSurfaceBound.removeEventListener('pointerdown', onPointerDown);
				gestureSurfaceBound.removeEventListener('pointermove', onPointerMove);
				gestureSurfaceBound.removeEventListener('pointerup', onPointerUp);
				gestureSurfaceBound.removeEventListener('pointercancel', onPointerUp);
				gestureSurfaceBound.removeEventListener('pointerleave', onPointerUp);
	            // remove mouse fallbacks
	            gestureSurfaceBound.removeEventListener('mousedown', onMouseDown);
			}
			gestureSurfaceBound = gestureSurface;
			gestureSurfaceBound.style.touchAction = 'none';
			gestureSurfaceBound.style.pointerEvents = 'auto';
			// Use non-passive listeners so preventDefault() in handlers works
			gestureSurfaceBound.addEventListener('pointerdown', onPointerDown, { passive: false });
			gestureSurfaceBound.addEventListener('pointermove', onPointerMove, { passive: false });
			gestureSurfaceBound.addEventListener('pointerup', onPointerUp, { passive: false });
			gestureSurfaceBound.addEventListener('pointercancel', onPointerUp, { passive: false });
			gestureSurfaceBound.addEventListener('pointerleave', onPointerUp, { passive: false });

			// mouse fallback for environments where pointer events aren't used
			gestureSurfaceBound.addEventListener('mousedown', onMouseDown);

			// mark when a pointer event occurs so mouse fallback is ignored immediately after
			gestureSurfaceBound.addEventListener('pointerdown', function _mark(){ markPointerEventSeen(); }, { once: true });
		}

		// stable overlay click handler (capture phase)
		overlay.removeEventListener('click', onOverlayClickCapture, true);
		overlay.addEventListener('click', onOverlayClickCapture, true);
	}

	function preventDefaultFalse(e){ e.preventDefault(); return false; }

	function prevClickHandler(e){ e.stopPropagation(); const prev = Math.max(0, currentIndex - 1); if (prev !== currentIndex) openOverlay(prev); }
	function nextClickHandler(e){ e.stopPropagation(); const next = Math.min(candidates.length - 1, currentIndex + 1); if (next !== currentIndex) openOverlay(next); }
	function zoomInHandler(e){ e.stopPropagation(); currentScale = clampScale(currentScale + 0.15); applyTransform(); }
	function zoomOutHandler(e){ e.stopPropagation(); currentScale = clampScale(currentScale - 0.15); applyTransform(); }
	function zoomInputKeyHandler(e){ if (e.key === 'Enter') { e.preventDefault(); applyZoomFromInput(); } if (e.key === 'Escape') { e.preventDefault(); updateZoomDisplay(); e.target.blur(); } }
	function zoomInputChangeHandler(e){ let val = e.target.value.trim(); if (val && /^\d+(\.\d+)?$/.test(val)) { e.target.value = `${val}%`; applyZoomFromInput(); } }

	// fullscreen toggle handler (support standard and webkit prefixed API)
	function fullscreenToggleHandler(e){
		e.stopPropagation();
		try {
			if (!document.fullscreenElement && !document.webkitFullscreenElement) {
				if (overlay && overlay.requestFullscreen) overlay.requestFullscreen();
				else if (overlay && overlay.webkitRequestFullscreen) overlay.webkitRequestFullscreen();
			} else {
				if (document.exitFullscreen) document.exitFullscreen();
				else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
			}
		} catch (err) { console.warn('[lightbox] fullscreen toggle failed', err); }
	}

	// initial attach via refreshAll to ensure overlay and controls are bound
	refreshAll();

	// Controls are bound in bindOverlayControls() to support recreation after SPA swaps

	// handle fullscreen change in both standard and webkit-prefixed events
	function handleFullscreenChange() {
		const ov = document.getElementById('image-lightbox');
		if (!ov) return;
		const inFs = !!document.fullscreenElement || !!document.webkitFullscreenElement;
		ov.classList.toggle('fullscreen-mode', inFs);
		const fb = ov.querySelector('.lightbox-fullscreen');
		if (fb) {
			const ic = fb.querySelector('i');
			if (ic) {
				if (inFs) {
					ic.className = 'icon-ic_fluent_full_screen_minimize_24_regular';
					fb.setAttribute('title', '退出全屏');
				} else {
					ic.className = 'icon-ic_fluent_full_screen_maximize_24_regular';
					fb.setAttribute('title', '全屏');
				}
			}
		}
		// Ensure pointer/touch bindings are active for the overlay image in fullscreen
		try {
			refreshOverlayRefs();
			if (overlayImg) {
				overlayImg.style.touchAction = 'none';
				overlayImg.style.pointerEvents = 'auto';
			}
			// ensure overlay itself allows pointer events while full-screen
			if (overlay) overlay.style.pointerEvents = 'auto';
			// add a force-hide class to cover stubborn browser styles
			if (inFs) overlay.classList.add('force-hide-controls'); else overlay.classList.remove('force-hide-controls');
			// rebind controls so pointer handlers are attached to the current img element
			bindOverlayControls();
		} catch (e) {
			console.warn('[lightbox] fullscreenchange rebind failed', e);
		}
	}
	document.addEventListener('fullscreenchange', handleFullscreenChange);
	document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    

	function applyZoomFromInput() {
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
	}

    

	// overlay click behavior is handled inside bindOverlayControls() to ensure
	// the handler identity is stable and can be added/removed when overlay is
	// recreated. (See bindOverlayControls for implementation.)

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
