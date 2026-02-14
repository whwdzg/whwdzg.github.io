// 模块：站内搜索 / Header search overlay and highlighting across pages.
document.addEventListener('DOMContentLoaded', () => {
	const searchBtn = document.getElementById('header-search-btn');
	if (!searchBtn) return;

	// 规范化文本：转小写 + 统一中英文标点
	const normalizeText = (text) => {
		return text.toLowerCase()
			.replace(/，/g, ',')
			.replace(/。/g, '.')
			.replace(/！/g, '!')
			.replace(/？/g, '?')
			.replace(/；/g, ';')
			.replace(/：/g, ':')
			.replace(/"/g, '"')
			.replace(/"/g, '"')
			.replace(/'/g, "'")
			.replace(/'/g, "'")
			.replace(/（/g, '(')
			.replace(/）/g, ')')
			.replace(/【/g, '[')
			.replace(/】/g, ']')
			.replace(/、/g, ',');
	};

	// Build overlay
	let overlay = document.getElementById('header-search-overlay');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.id = 'header-search-overlay';
		
		// 获取翻译文本，如果没有则使用默认值
		const getSearchText = (key, defaultValue) => {
			if (typeof translations !== 'undefined' && translations[document.documentElement.lang] && translations[document.documentElement.lang].search) {
				return translations[document.documentElement.lang].search[key] || defaultValue;
			}
			return defaultValue;
		};
		
		const placeholder = getSearchText('placeholder', '搜索内容');
		const buttonText = getSearchText('button', '搜索');
		const ariaLabel = getSearchText('ariaLabel', '搜索内容');
		
		overlay.innerHTML = `
			<div class="search-box">
				<input type="text" class="search-input styled-input" placeholder="${placeholder}" aria-label="${ariaLabel}">
				<button class="search-submit" aria-label="开始搜索">${buttonText}</button>
			</div>
			<div class="search-results" style="display: none;"></div>
		`;
		document.body.appendChild(overlay);
	}

	const input = overlay.querySelector('.search-input');
	const submit = overlay.querySelector('.search-submit');
	const resultsContainer = overlay.querySelector('.search-results');

	const hideOverlay = () => {
		overlay.classList.remove('show');
		resultsContainer.classList.remove('visible');
		// 等待动画完成后清空内容
		setTimeout(() => {
			resultsContainer.style.display = 'none';
			resultsContainer.innerHTML = '';
		}, 200);
	};

	const showOverlay = () => {
		overlay.classList.add('show');
		setTimeout(() => input && input.focus(), 0);
	};

	// Collect candidate pages (same-origin .html links)
	const collectPages = () => {
		const pages = new Set();
		document.querySelectorAll('a[href$=".html"]').forEach((a) => {
			try {
				const url = new URL(a.getAttribute('href'), window.location.href);
				if (url.origin === window.location.origin) {
					const name = url.pathname.split('/').pop();
					if (name) pages.add(name);
				}
			} catch (_) { /* ignore */ }
		});
		// Ensure current page in set
		const currentName = window.location.pathname.split('/').pop() || 'index.html';
		pages.add(currentName);
		return Array.from(pages);
	};

	// 查找所有匹配的元素
	const findAllElementsInDoc = (doc, queryNormalized) => {
		const main = doc.querySelector('main');
		if (!main) return [];
		const results = [];
		
		// 先检查图片标题
		const images = main.querySelectorAll('img');
		for (const img of images) {
			let nextElement = img.nextElementSibling;
			if (nextElement && nextElement.tagName === 'P') {
				let hasBrBetween = false;
				let node = img.nextSibling;
				while (node && node !== nextElement) {
					if (node.nodeType === 1 && node.tagName === 'BR') {
						hasBrBetween = true;
						break;
					}
					node = node.nextSibling;
				}
				if (!hasBrBetween) {
					const captionText = nextElement.textContent.trim();
					if (captionText && normalizeText(captionText).includes(queryNormalized)) {
						results.push({ element: img, type: 'image', caption: captionText });
					}
				}
			}
		}
		
		// 查找文本元素，将 <br> 分隔的文本作为独立片段处理
		const nodes = main.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li');
		for (const node of nodes) {
			// 避免重复添加已经作为图片标题的元素
			const isCaption = node.tagName === 'P' && 
				node.previousElementSibling && 
				node.previousElementSibling.tagName === 'IMG';
			if (isCaption) continue;
			
			// 检查是否包含 <br> 标签
			const brs = node.querySelectorAll('br');
			if (brs.length > 0) {
				// 将节点内容按 <br> 分段
				let currentText = '';
				let segmentIndex = 0;
				const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
				let currentNode;
				
				while (currentNode = walker.nextNode()) {
					if (currentNode.nodeType === Node.TEXT_NODE) {
						currentText += currentNode.textContent;
					} else if (currentNode.nodeName === 'BR') {
						// 遇到 <br>，检查当前积累的文本
						const trimmed = currentText.trim();
						if (trimmed && normalizeText(trimmed).includes(queryNormalized)) {
							results.push({ element: node, type: 'text', text: trimmed, segmentIndex: segmentIndex });
						}
						currentText = ''; // 重置
						segmentIndex++;
					}
				}
				// 处理最后一段
				const trimmed = currentText.trim();
				if (trimmed && normalizeText(trimmed).includes(queryNormalized)) {
					results.push({ element: node, type: 'text', text: trimmed, segmentIndex: segmentIndex });
				}
			} else {
				// 没有 <br>，整体处理
				const text = node.textContent || '';
				if (normalizeText(text).includes(queryNormalized)) {
					results.push({ element: node, type: 'text', text: text.trim(), segmentIndex: 0 });
				}
			}
		}
		
		return results;
	};

	// 生成上下文预览，高亮匹配部分
	const generatePreview = (text, queryNormalized) => {
		const maxLen = 80;
		const normalizedText = normalizeText(text);
		const index = normalizedText.indexOf(queryNormalized);
		
		if (index === -1) return text.substring(0, maxLen);
		
		// 计算上下文范围
		const start = Math.max(0, index - 20);
		const end = Math.min(text.length, index + queryNormalized.length + 40);
		let preview = text.substring(start, end);
		
		if (start > 0) preview = '...' + preview;
		if (end < text.length) preview = preview + '...';
		
		// 高亮匹配部分（使用规范化后的文本查找位置，但显示原始文本）
		const previewNormalized = normalizeText(preview);
		const matchStart = previewNormalized.indexOf(queryNormalized);
		if (matchStart !== -1) {
			const before = preview.substring(0, matchStart);
			const match = preview.substring(matchStart, matchStart + queryNormalized.length);
			const after = preview.substring(matchStart + queryNormalized.length);
			return `<span class="preview-context">${before}</span><strong class="preview-match">${match}</strong><span class="preview-context">${after}</span>`;
		}
		
		return `<span class="preview-context">${preview}</span>`;
	};

	// 高亮图片标题中的搜索词
	const highlightImageCaption = (caption, queryNormalized) => {
		const normalizedCaption = normalizeText(caption);
		const index = normalizedCaption.indexOf(queryNormalized);
		
		if (index === -1) {
			return `<span class="preview-context">${caption}</span>`;
		}
		
		const before = caption.substring(0, index);
		const match = caption.substring(index, index + queryNormalized.length);
		const after = caption.substring(index + queryNormalized.length);
		
		return `<span class="preview-context">${before}</span><strong class="preview-match">${match}</strong><span class="preview-context">${after}</span>`;
	};

	const highlightAndScroll = (el, matchedText, segmentIndex) => {
		if (!el) return;
		
		// 图片直接高亮整个元素
		if (el.tagName === 'IMG') {
			el.classList.add('highlighted');
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			setTimeout(() => el.classList.remove('highlighted'), 3600);
			return;
		}
		
		// 文本元素：如果提供了匹配文本和段索引，尝试精确高亮该片段
		if (matchedText !== null && matchedText !== undefined && segmentIndex !== undefined) {
			// 遍历文本节点，跳过前面的段，找到目标段
			const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
			let currentNode;
			let currentSegment = 0;
			let currentText = '';
			let targetTextNodes = [];
			
			while (currentNode = walker.nextNode()) {
				if (currentNode.nodeType === Node.TEXT_NODE) {
					currentText += currentNode.textContent;
					targetTextNodes.push(currentNode);
				} else if (currentNode.nodeName === 'BR') {
					// 遇到 <br>，检查是否是目标段
					if (currentSegment === segmentIndex) {
						// 找到目标段，高亮这些文本节点
						if (currentText.trim() === matchedText && targetTextNodes.length > 0) {
							// 创建高亮 span
							const span = document.createElement('span');
							span.className = 'search-highlight';
							
							// 将所有目标文本节点的内容合并到 span 中
							const combinedText = currentText;
							span.textContent = combinedText;
							
							// 替换第一个文本节点为 span，删除其他节点
							const firstNode = targetTextNodes[0];
							const parent = firstNode.parentNode;
							parent.insertBefore(span, firstNode);
							
							targetTextNodes.forEach(node => {
								if (node.parentNode) {
									node.parentNode.removeChild(node);
								}
							});
							
							// 滚动到高亮位置
							span.scrollIntoView({ behavior: 'smooth', block: 'center' });
							
							setTimeout(() => {
								// 恢复原始文本节点
								const textNode = document.createTextNode(combinedText);
								parent.insertBefore(textNode, span);
								parent.removeChild(span);
							}, 3600);
							
							return;
						}
					}
					
					// 重置并移到下一段
					currentText = '';
					targetTextNodes = [];
					currentSegment++;
				}
			}
			
			// 处理最后一段（没有 <br> 结尾的情况）
			if (currentSegment === segmentIndex && currentText.trim() === matchedText && targetTextNodes.length > 0) {
				const span = document.createElement('span');
				span.className = 'search-highlight';
				const combinedText = currentText;
				span.textContent = combinedText;
				
				const firstNode = targetTextNodes[0];
				const parent = firstNode.parentNode;
				parent.insertBefore(span, firstNode);
				
				targetTextNodes.forEach(node => {
					if (node.parentNode) {
						node.parentNode.removeChild(node);
					}
				});
				
				span.scrollIntoView({ behavior: 'smooth', block: 'center' });
				
				setTimeout(() => {
					const textNode = document.createTextNode(combinedText);
					parent.insertBefore(textNode, span);
					parent.removeChild(span);
				}, 3600);
				
				return;
			}
		}
		
		// 没有找到匹配文本或未提供匹配文本，高亮整个元素
		el.classList.add('search-highlight');
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		setTimeout(() => el.classList.remove('search-highlight'), 3600);
	};

	const applyHashSearch = () => {
		if (!location.hash.startsWith('#search=')) return;
		const q = decodeURIComponent(location.hash.replace('#search=', '') || '').trim();
		if (!q) return;
		const qNormalized = normalizeText(q);
		const results = findAllElementsInDoc(document, qNormalized);
		if (results.length > 0) {
			const firstResult = results[0];
			const matchedText = firstResult.type === 'text' ? firstResult.text : null;
			const segmentIndex = firstResult.type === 'text' ? firstResult.segmentIndex : undefined;
			highlightAndScroll(firstResult.element, matchedText, segmentIndex);
			history.replaceState(history.state, document.title, location.pathname + location.search);
		}
	};

	const searchAndShowResults = async () => {
		const query = (input?.value || '').trim();
		if (!query) return;
		const queryNormalized = normalizeText(query);
		const pages = collectPages();
		const allResults = [];

		// Search current page
		const currentResults = findAllElementsInDoc(document, queryNormalized);
		currentResults.forEach(r => {
			allResults.push({ ...r, page: null }); // null means current page
		});

		// Search other pages
		for (const page of pages) {
			const currentName = window.location.pathname.split('/').pop() || 'index.html';
			if (page === currentName) continue;
			try {
				const resp = await fetch(page, { credentials: 'same-origin', cache: 'no-cache' });
				if (!resp.ok) continue;
				const html = await resp.text();
				const doc = new DOMParser().parseFromString(html, 'text/html');
				const results = findAllElementsInDoc(doc, queryNormalized);
				results.forEach(r => {
					allResults.push({ ...r, page });
				});
			} catch (_) {
				/* ignore and continue */
			}
		}

		// Display results
		if (allResults.length === 0) {
			resultsContainer.innerHTML = '<div class="search-no-results">未找到匹配内容</div>';
			resultsContainer.style.display = 'block';
			setTimeout(() => resultsContainer.classList.add('visible'), 10);
			return;
		}

		resultsContainer.innerHTML = '';
		allResults.forEach((result, idx) => {
			const item = document.createElement('div');
			item.className = 'search-result-item';
			item.dataset.index = idx;

			const textWrapper = document.createElement('span');
			textWrapper.className = 'search-result-text';

			if (result.type === 'image') {
				const imageTag = (typeof translations !== 'undefined' && translations[document.documentElement.lang] && translations[document.documentElement.lang].search) ? translations[document.documentElement.lang].search.imageTag : '[图片]';
				textWrapper.innerHTML = `<span class="result-tag">${imageTag}</span> ${highlightImageCaption(result.caption, queryNormalized)}`;
			} else {
				textWrapper.innerHTML = generatePreview(result.text, queryNormalized);
			}

			item.appendChild(textWrapper);

			if (result.page) {
				item.classList.add('search-result-external');
				const indicator = document.createElement('span');
				indicator.className = 'search-result-indicator';
				indicator.setAttribute('role', 'img');
				indicator.setAttribute('aria-label', '来自其他页面');
				indicator.setAttribute('title', '在其他页面查看');
				indicator.textContent = '↗';
				item.appendChild(indicator);
			}

			item.addEventListener('click', () => {
				// 关闭设置弹窗（如果已打开）
				document.dispatchEvent(new CustomEvent('close-settings-modal'));
				if (result.page) {
					// Navigate to other page
					window.location.href = `${result.page}#search=${encodeURIComponent(query)}`;
				} else {
					// Close lightbox if open
					const lightbox = document.getElementById('image-lightbox');
					if (lightbox && lightbox.classList.contains('active')) {
						lightbox.classList.remove('active');
						document.body.classList.remove('no-scroll-lightbox');
					}
					// Highlight in current page
					const matchedText = result.type === 'text' ? result.text : null;
					const segmentIndex = result.type === 'text' ? result.segmentIndex : undefined;
					highlightAndScroll(result.element, matchedText, segmentIndex);
					hideOverlay();
				}
			});
			
			resultsContainer.appendChild(item);
		});
		
		resultsContainer.style.display = 'block';
		setTimeout(() => resultsContainer.classList.add('visible'), 10);
	};

	// Button interactions
	searchBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		if (overlay.classList.contains('show')) {
			hideOverlay();
		} else {
			showOverlay();
		}
	});

	if (submit) {
		submit.addEventListener('click', (e) => {
			e.preventDefault();
			searchAndShowResults();
		});
	}

	if (input) {
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				searchAndShowResults();
			}
			if (e.key === 'Escape') {
				hideOverlay();
			}
		});
	}

	// Click outside to close
	document.addEventListener('click', (e) => {
		if (!overlay.contains(e.target) && e.target !== searchBtn) {
			hideOverlay();
		}
	});

	// On page load, process hash search if present
	applyHashSearch();
});
