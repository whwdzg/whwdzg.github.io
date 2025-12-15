// 图片放大预览与遮罩
document.addEventListener('DOMContentLoaded', function () {
	const candidates = Array.from(document.querySelectorAll('main img, #aside-stack img'));
	if (!candidates.length) return;

	// 检测并处理图片标题：img 后面紧跟的 p 标签（中间没有 br）视为标题
	const imageCaptions = new Map();
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

	let overlay = document.getElementById('image-lightbox');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.id = 'image-lightbox';
		overlay.setAttribute('aria-hidden', 'true');
		overlay.innerHTML = `
			<button class="lightbox-close" aria-label="Close image">×</button>
			<button class="lightbox-download-btn" aria-label="Download image" title="Download image"><i class="icon-ic_fluent_arrow_download_24_regular" aria-hidden="true"></i></button>
			<button class="lightbox-locate-btn" aria-label="Locate in document" title="Locate in document"><i class="icon-ic_fluent_location_24_regular" aria-hidden="true"></i></button>
			<div class="lightbox-title" style="display: none;"></div>
			<div class="lightbox-content">
				<div class="lightbox-controls" aria-hidden="true">
					<button class="lightbox-zoom-in" aria-label="Zoom in">+</button>
					<button class="lightbox-zoom-out" aria-label="Zoom out">−</button>
				</div>
				<div class="lightbox-image-wrapper">
					<img alt="" />
				</div>
			</div>
		`;
		document.body.appendChild(overlay);
	}

	let filmstrip = overlay.querySelector('.lightbox-filmstrip');
	if (!filmstrip) {
		filmstrip = document.createElement('div');
		filmstrip.className = 'lightbox-filmstrip';
		filmstrip.setAttribute('role', 'list');
		overlay.appendChild(filmstrip);
	}

	const overlayImg = overlay.querySelector('img');
	const imageWrapper = overlay.querySelector('.lightbox-image-wrapper');
	const closeBtn = overlay.querySelector('.lightbox-close');
	const downloadBtn = overlay.querySelector('.lightbox-download-btn');
	const locateBtn = overlay.querySelector('.lightbox-locate-btn');
	const zoomInBtn = overlay.querySelector('.lightbox-zoom-in');
	const zoomOutBtn = overlay.querySelector('.lightbox-zoom-out');
	let zoomBox = overlay.querySelector('.lightbox-zoom-indicator');
	if (!zoomBox) {
		zoomBox = document.createElement('div');
		zoomBox.className = 'lightbox-zoom-indicator';
		zoomBox.innerHTML = `<input class="zoom-input styled-input" type="text" inputmode="numeric" placeholder="100%" aria-label="Zoom percentage">`;
		overlay.appendChild(zoomBox);
	}
	const zoomInput = zoomBox.querySelector('.zoom-input');
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
	};

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

	const clampScale = (val) => Math.min(2.5, Math.max(0.6, val));

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
		try {
			overlayImg.setPointerCapture(e.pointerId);
		} catch (_) {
			/* ignore */
		}
		updateCursor();
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
			overlayImg.releasePointerCapture(e.pointerId);
		} catch (_) {
			/* ignore */
		}
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

	candidates.forEach((img, index) => {
		img.classList.add('zoomable-img');
		img.addEventListener('click', () => {
			openOverlay(index);
		});
	});

	// 构建缩略图胶片条
	filmstrip.innerHTML = '';
	candidates.forEach((img, index) => {
		const btn = document.createElement('button');
		btn.className = 'filmstrip-thumb';
		btn.setAttribute('role', 'listitem');
		btn.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}">`;
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			openOverlay(index);
		});
		filmstrip.appendChild(btn);
	});

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) closeOverlay();
	});

	if (locateBtn) {
		locateBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			locateInDocument();
		});
	}

	if (downloadBtn) {
		downloadBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			downloadImage();
		});
	}

	if (closeBtn) {
		closeBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			closeOverlay();
		});
	}

	if (zoomInBtn) {
		zoomInBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			currentScale = clampScale(currentScale + 0.15);
			applyTransform();
		});
	}

	if (zoomOutBtn) {
		zoomOutBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			currentScale = clampScale(currentScale - 0.15);
			applyTransform();
		});
	}

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

	if (overlayImg) {
		overlayImg.style.touchAction = 'none';
		overlayImg.draggable = false;
		overlayImg.addEventListener('pointerdown', onPointerDown);
		overlayImg.addEventListener('pointermove', onPointerMove);
		overlayImg.addEventListener('pointerup', onPointerUp);
		overlayImg.addEventListener('pointercancel', onPointerUp);
		overlayImg.addEventListener('pointerleave', onPointerUp);
		// 禁用图片拖拽保存
		overlayImg.addEventListener('dragstart', (e) => {
			e.preventDefault();
			return false;
		});
		// 禁用右键菜单以防通过菜单保存
		overlayImg.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			return false;
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

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && overlay.classList.contains('active')) {
			closeOverlay();
		}
	});
});
