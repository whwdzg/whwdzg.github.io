/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\tool\unicode.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
(() => {
    const toastApi = {
        show(message, variant, iconClass) {
            const tone = variant || 'info';
            if (window.componentToast && typeof window.componentToast.show === 'function') {
                window.componentToast.show(message, tone, iconClass);
                return;
            }
            const toastEl = document.querySelector('[data-component-toast]');
            if (toastEl) {
                const iconEl = toastEl.querySelector('.component-toast__icon');
                const messageEl = toastEl.querySelector('.component-toast__message');
                if (messageEl) messageEl.textContent = message || '';
                toastEl.classList.remove('component-toast--success', 'component-toast--warning', 'component-toast--error', 'component-toast--info');
                toastEl.classList.add('component-toast--' + tone);
                if (iconEl) {
                    iconEl.className = 'component-toast__icon fluent-icon ' + (iconClass || 'icon-ic_fluent_info_24_regular');
                }
                toastEl.classList.add('show');
                if (window.__toolComponentToastTimer) clearTimeout(window.__toolComponentToastTimer);
                window.__toolComponentToastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
                return;
            }
            if (window.globalCopyToast && typeof window.globalCopyToast.show === 'function') {
                window.globalCopyToast.show(message, tone === 'info' ? 'success' : tone, iconClass);
            }
        }
    };

    let inputEl = null;
    let decodeInputEl = null;
    let outputHeadEl = null;
    let outputBodyEl = null;
    let feedbackEl = null;
    let modeEl = null;
    let modeDropdown = null;
    let modeListEl = null;
    let modePortalEl = null;
    let modePortalListEl = null;
    let modeToggleEl = null;
    let modeLabelEl = null;
    let outputTextCache = '';

    const actionButtons = new WeakMap();
    const copyButtons = new WeakMap();
    const copyTimeouts = new WeakMap();
    let delegatedBound = false;

    const modeMap = {
        escape: { label: '\\uXXXX（转义）' },
        codepoint: { label: 'U+XXXX（码点）' },
        html: { label: '&#xXXXX;（HTML 实体）' }
    };

    function setFeedback(message, state) {
        if (!feedbackEl) return;
        feedbackEl.textContent = message;
        feedbackEl.dataset.state = state || 'info';
    }

    function captureElements() {
        inputEl = document.getElementById('unicode-input');
        decodeInputEl = document.getElementById('unicode-decode-input');
        outputHeadEl = document.getElementById('unicode-output-head');
        outputBodyEl = document.getElementById('unicode-output-body');
        feedbackEl = document.getElementById('unicode-feedback');
        modeEl = document.getElementById('unicode-mode');
        modeDropdown = document.querySelector('.basex-dropdown');
        modeListEl = document.getElementById('unicode-mode-list');
        modeToggleEl = document.getElementById('unicode-mode-toggle');
        modeLabelEl = document.getElementById('unicode-mode-label');
    }

    function renderTable(headers, rows) {
        if (!outputHeadEl || !outputBodyEl) return;
        outputHeadEl.innerHTML = '';
        outputBodyEl.innerHTML = '';

        const headerRow = document.createElement('tr');
        headers.forEach((title) => {
            const th = document.createElement('th');
            th.textContent = title;
            headerRow.appendChild(th);
        });
        outputHeadEl.appendChild(headerRow);

        if (!rows.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = headers.length;
            td.textContent = '暂无结果';
            tr.appendChild(td);
            outputBodyEl.appendChild(tr);
            outputTextCache = '';
            return;
        }

        rows.forEach((cells) => {
            const tr = document.createElement('tr');
            cells.forEach((value) => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            outputBodyEl.appendChild(tr);
        });

        outputTextCache = [headers.join('\t')]
            .concat(rows.map((cells) => cells.join('\t')))
            .join('\n');
    }

    function codePointToEscape(cp) {
        if (cp <= 0xFFFF) {
            return '\\u' + cp.toString(16).toUpperCase().padStart(4, '0');
        }
        const adjusted = cp - 0x10000;
        const high = 0xD800 + (adjusted >> 10);
        const low = 0xDC00 + (adjusted & 0x3FF);
        return '\\u' + high.toString(16).toUpperCase().padStart(4, '0') + '\\u' + low.toString(16).toUpperCase().padStart(4, '0');
    }

    function formatCodePoint(cp, mode) {
        const hex = cp.toString(16).toUpperCase();
        if (mode === 'codepoint') {
            return 'U+' + hex.padStart(4, '0');
        }
        if (mode === 'html') {
            return '&#x' + hex + ';';
        }
        return codePointToEscape(cp);
    }

    function displayChar(ch) {
        if (ch === ' ') return '[空格]';
        if (ch === '\n') return '[换行]';
        if (ch === '\t') return '[Tab]';
        return ch;
    }

    function encodeUnicodeRows(text, mode) {
        const rows = [];
        let index = 1;
        for (const ch of text) {
            const cp = ch.codePointAt(0);
            const encoded = formatCodePoint(cp, mode);
            rows.push([String(index), displayChar(ch), encoded]);
            index += 1;
        }
        return rows;
    }

    function fromCodePointSafe(hexValue) {
        const cp = parseInt(hexValue, 16);
        if (!Number.isFinite(cp) || cp < 0 || cp > 0x10FFFF) {
            throw new Error('包含超出 Unicode 范围的码点');
        }
        return String.fromCodePoint(cp);
    }

    function decodeUnicode(value) {
        let decoded = value;

        decoded = decoded.replace(/\\u\{([0-9A-Fa-f]{1,6})\}/g, (_, hex) => fromCodePointSafe(hex));
        decoded = decoded.replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        decoded = decoded.replace(/U\+([0-9A-Fa-f]{4,6})/g, (_, hex) => fromCodePointSafe(hex));
        decoded = decoded.replace(/&#x([0-9A-Fa-f]{1,6});?/g, (_, hex) => fromCodePointSafe(hex));
        decoded = decoded.replace(/&#([0-9]{1,7});?/g, (_, num) => {
            const cp = Number(num);
            if (!Number.isFinite(cp) || cp < 0 || cp > 0x10FFFF) {
                throw new Error('包含超出 Unicode 范围的实体值');
            }
            return String.fromCodePoint(cp);
        });

        return decoded;
    }

    function buildCharRows(text) {
        const rows = [];
        let index = 1;
        for (const ch of text) {
            const cp = ch.codePointAt(0);
            const code = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
            rows.push([String(index), displayChar(ch), code]);
            index += 1;
        }
        return rows;
    }

    function getCurrentMode() {
        return modeEl && modeEl.value ? modeEl.value : 'codepoint';
    }

    function setModeValue(value, labelText) {
        if (!modeEl) return;
        modeEl.value = value;
        if (modeLabelEl && labelText) {
            modeLabelEl.textContent = labelText;
        }
        const syncList = (listEl) => {
            if (!listEl) return;
            listEl.querySelectorAll('.dropdown-item').forEach((item) => {
                const match = item.dataset.value === value;
                item.classList.toggle('selected', match);
                item.setAttribute('aria-selected', match ? 'true' : 'false');
            });
        };
        syncList(modeListEl);
        syncList(modePortalListEl);
    }

    function collapseDropdown() {
        if (!modeDropdown || !modePortalListEl || !modeToggleEl || !modePortalEl) return;
        modeDropdown.classList.remove('open');
        modePortalListEl.classList.remove('open');
        modePortalListEl.style.maxHeight = '0px';
        modePortalEl.classList.add('hidden');
        modeToggleEl.setAttribute('aria-expanded', 'false');
    }

    function expandDropdown() {
        if (!modeDropdown || !modePortalListEl || !modeToggleEl || !modePortalEl) return;
        modeDropdown.classList.add('open');
        modePortalEl.classList.remove('hidden');
        modePortalListEl.classList.add('open');
        modePortalListEl.style.maxHeight = '0px';
        modeToggleEl.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(() => {
            if (!modeDropdown.classList.contains('open')) return;
            modePortalListEl.style.maxHeight = modePortalListEl.scrollHeight + 'px';
            positionPortal();
        });
    }

    function toggleDropdown() {
        if (!modeDropdown) return;
        const open = modeDropdown.classList.contains('open');
        if (open) {
            collapseDropdown();
        } else {
            expandDropdown();
        }
    }

    function positionPortal() {
        if (!modeToggleEl || !modePortalEl) return;
        const rect = modeToggleEl.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const gap = 8;

        const portalW = modePortalEl.offsetWidth || Math.min(Math.max(200, rect.width + 24), viewportW - 16);
        let left = rect.left;
        left = Math.min(Math.max(8, left), Math.max(8, viewportW - portalW - 8));
        modePortalEl.style.left = left + 'px';

        const portalH = modePortalEl.offsetHeight || 240;
        const spaceBelow = viewportH - rect.bottom;
        const preferBelow = spaceBelow > portalH + gap || rect.top < 120;
        modePortalEl.style.top = (preferBelow ? Math.min(viewportH - portalH - 8, rect.bottom + gap) : Math.max(8, rect.top - portalH - gap)) + 'px';
    }

    function handleAction(action) {
        if (!inputEl || !decodeInputEl || !outputHeadEl || !outputBodyEl) return;
        if (action === 'clear') {
            inputEl.value = '';
            decodeInputEl.value = '';
            renderTable(['序号', '字符', '结果'], []);
            setFeedback('输入输出已清空', 'info');
            toastApi.show('已清空输入和输出', 'info', 'icon-ic_fluent_delete_24_regular');
            return;
        }
        try {
            if (action === 'encode') {
                const raw = inputEl.value;
                if (!raw.trim()) {
                    setFeedback('请先输入字符内容再操作', 'error');
                    return;
                }
                const mode = getCurrentMode();
                const encodedRows = encodeUnicodeRows(raw, mode);
                renderTable(['序号', '字符', 'Unicode'], encodedRows);
                const modeName = modeMap[mode] ? modeMap[mode].label : 'Unicode';
                const message = modeName + ' 编码成功 · ' + Array.from(raw).length + ' 字符';
                setFeedback(message, 'success');
                toastApi.show(message, 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
            } else if (action === 'decode') {
                const raw = decodeInputEl.value;
                if (!raw.trim()) {
                    setFeedback('请先在小输入框中输入 Unicode 再操作', 'error');
                    return;
                }
                const decoded = decodeUnicode(raw);
                renderTable(['序号', '字符', '码点'], buildCharRows(decoded));
                const message = 'Unicode 转字符成功 · ' + Array.from(decoded).length + ' 字符';
                setFeedback(message, 'success');
                toastApi.show(message, 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
            }
        } catch (err) {
            const reason = err && err.message ? err.message : '处理失败';
            const message = 'Unicode 处理失败：' + reason;
            setFeedback(message, 'error');
            toastApi.show(message, 'error', 'icon-ic_fluent_error_circle_24_regular');
        }
    }

    function bindDropdown() {
        if (!modeDropdown || !modeListEl || !modeToggleEl || !modeEl) return;
        if (modeDropdown.dataset.bound === '1') return;

        modePortalEl = document.createElement('div');
        modePortalEl.className = 'settings-dropdown-portal component-dropdown-portal basex-dropdown-portal hidden';
        modePortalListEl = document.createElement('div');
        modePortalListEl.className = 'settings-dropdown-list component-dropdown-list component-dropdown-list--portal';
        modePortalEl.appendChild(modePortalListEl);
        document.body.appendChild(modePortalEl);

        modeListEl.querySelectorAll('.dropdown-item').forEach((item) => {
            const clone = item.cloneNode(true);
            clone.classList.add('component-dropdown-item');
            clone.addEventListener('click', () => {
                const val = clone.dataset.value || 'codepoint';
                setModeValue(val, clone.textContent || val);
                collapseDropdown();
            });
            modePortalListEl.appendChild(clone);
        });

        modeToggleEl.addEventListener('click', toggleDropdown);

        document.addEventListener('click', (evt) => {
            if (modeDropdown.contains(evt.target) || (modePortalEl && modePortalEl.contains(evt.target))) return;
            collapseDropdown();
        });

        window.addEventListener('resize', positionPortal);
        window.addEventListener('scroll', positionPortal, true);
        modeDropdown.dataset.bound = '1';

        const initialVal = modeEl.value || 'codepoint';
        const initialItem = modeListEl.querySelector('[data-value="' + initialVal + '"]') || modeListEl.querySelector('.dropdown-item');
        if (initialItem) {
            setModeValue(initialItem.dataset.value || initialVal, initialItem.textContent || initialVal);
        }
    }

    function markCopied(button) {
        if (!button) return;
        button.classList.add('copied');
        const existing = copyTimeouts.get(button);
        if (existing) clearTimeout(existing);
        const timer = setTimeout(() => {
            button.classList.remove('copied');
        }, 1200);
        copyTimeouts.set(button, timer);
    }

    function copyToClipboard(value, success, failure) {
        if (!value) {
            failure('没有可复制的内容');
            return;
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(value).then(success).catch((err) => failure(err ? err.message : '权限不足'));
            return;
        }
        try {
            const textarea = document.createElement('textarea');
            textarea.value = value;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (ok) {
                success();
            } else {
                failure('复制命令失败');
            }
        } catch (err) {
            failure(err && err.message ? err.message : '未知错误');
        }
    }

    function bindButtons() {
        document.querySelectorAll('[data-unicode-action]').forEach((button) => {
            const action = button.dataset.unicodeAction;
            if (!action || actionButtons.has(button)) return;
            const handler = () => {
                captureElements();
                handleAction(action);
            };
            actionButtons.set(button, handler);
            button.addEventListener('click', handler);
        });

        document.querySelectorAll('[data-copy-target]').forEach((button) => {
            if (copyButtons.has(button)) return;
            const handler = () => {
                captureElements();
                const targetId = button.dataset.copyTarget;
                let copyValue = '';
                if (targetId === 'unicode-input') {
                    copyValue = inputEl ? inputEl.value : '';
                } else if (targetId === 'unicode-output-table') {
                    copyValue = outputTextCache;
                }
                copyToClipboard(copyValue, () => {
                    markCopied(button);
                    const message = targetId === 'unicode-input' ? '输入内容已复制' : '输出内容已复制';
                    setFeedback(message, 'success');
                    toastApi.show('复制成功', 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
                }, (reason) => {
                    const message = '复制失败：' + reason;
                    setFeedback(message, 'error');
                    toastApi.show(message, 'error', 'icon-ic_fluent_error_circle_24_regular');
                });
            };
            copyButtons.set(button, handler);
            button.addEventListener('click', handler);
        });
    }

    function bindDelegatedButtons() {
        if (delegatedBound) return;
        delegatedBound = true;
        document.addEventListener('click', (evt) => {
            const actionBtn = evt.target.closest('[data-unicode-action]');
            if (actionBtn) {
                captureElements();
                const action = actionBtn.dataset.unicodeAction;
                if (action) handleAction(action);
                return;
            }
            const copyBtn = evt.target.closest('[data-copy-target]');
            if (!copyBtn) return;
            const targetId = copyBtn.dataset.copyTarget;
            if (targetId !== 'unicode-input' && targetId !== 'unicode-output-table') return;
            captureElements();
            let copyValue = '';
            if (targetId === 'unicode-input') {
                copyValue = inputEl ? inputEl.value : '';
            } else {
                copyValue = outputTextCache;
            }
            copyToClipboard(copyValue, () => {
                markCopied(copyBtn);
                const message = targetId === 'unicode-input' ? '输入内容已复制' : '输出内容已复制';
                setFeedback(message, 'success');
                toastApi.show('复制成功', 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
            }, (reason) => {
                const message = '复制失败：' + reason;
                setFeedback(message, 'error');
                toastApi.show(message, 'error', 'icon-ic_fluent_error_circle_24_regular');
            });
        });
    }

    function init() {
        captureElements();
        bindDelegatedButtons();
        if (!inputEl || !decodeInputEl || !outputHeadEl || !outputBodyEl || !modeEl) return false;
        bindDropdown();
        bindButtons();
        if (!outputBodyEl.childElementCount) {
            renderTable(['序号', '字符', '结果'], []);
        }
        if (typeof window.attachToastClose === 'function') {
            window.attachToastClose();
        }
        return true;
    }

    function bootstrapInit() {
        let attempts = 0;
        const maxAttempts = 40;
        const tick = () => {
            if (init()) return;
            attempts += 1;
            if (attempts < maxAttempts) {
                setTimeout(tick, 50);
            }
        };
        tick();
    }

    bootstrapInit();
    window.addEventListener('load', bootstrapInit);
    window.addEventListener('spa:page:loaded', bootstrapInit);
})();
