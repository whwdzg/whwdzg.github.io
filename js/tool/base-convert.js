/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\tool\base-convert.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
(() => {
    const toastApi = window.globalCopyToast || { show () {} };

    let inputEl = null;
    let outputHeadEl = null;
    let outputBodyEl = null;
    let feedbackEl = null;
    let fromBaseEl = null;

    const actionButtons = new WeakMap();
    const copyButtons = new WeakMap();
    const copyTimeouts = new WeakMap();
    let delegatedBound = false;

    const dropdownState = {};
    const displayBases = [2, 8, 10, 16];
    let outputTextCache = '';

    function setFeedback(message, state) {
        if (!feedbackEl) return;
        feedbackEl.textContent = message;
        feedbackEl.dataset.state = state || 'info';
    }

    function captureElements() {
        inputEl = document.getElementById('base-input');
        outputHeadEl = document.getElementById('base-output-head');
        outputBodyEl = document.getElementById('base-output-body');
        feedbackEl = document.getElementById('base-feedback');
        fromBaseEl = document.getElementById('base-from');
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

    function getBaseLabel(base) {
        const num = Number(base);
        if (num === 2) return 'Base2（二进制）';
        if (num === 8) return 'Base8（八进制）';
        if (num === 10) return 'Base10（十进制）';
        if (num === 16) return 'Base16（十六进制）';
        return 'Base' + num;
    }

    function setDropdownValue(role, value) {
        const state = dropdownState[role];
        if (!state) return;
        state.hidden.value = String(value);
        state.label.textContent = getBaseLabel(value);

        const sync = (listEl) => {
            if (!listEl) return;
            listEl.querySelectorAll('.dropdown-item').forEach((item) => {
                const matched = item.dataset.value === String(value);
                item.classList.toggle('selected', matched);
                item.setAttribute('aria-selected', matched ? 'true' : 'false');
            });
        };

        sync(state.list);
        sync(state.portalList);
    }

    function positionPortal(role) {
        const state = dropdownState[role];
        if (!state || !state.portal || !state.toggle) return;
        const rect = state.toggle.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const gap = 8;

        const portalW = state.portal.offsetWidth || Math.min(Math.max(200, rect.width + 24), viewportW - 16);
        let left = rect.left;
        left = Math.min(Math.max(8, left), Math.max(8, viewportW - portalW - 8));
        state.portal.style.left = left + 'px';

        const portalH = state.portal.offsetHeight || 240;
        const spaceBelow = viewportH - rect.bottom;
        const preferBelow = spaceBelow > portalH + gap || rect.top < 120;
        state.portal.style.top = (preferBelow ? Math.min(viewportH - portalH - 8, rect.bottom + gap) : Math.max(8, rect.top - portalH - gap)) + 'px';
    }

    function closeDropdown(role) {
        const state = dropdownState[role];
        if (!state || !state.dropdown || !state.portalList || !state.portal) return;
        state.dropdown.classList.remove('open');
        state.portalList.classList.remove('open');
        state.portalList.style.maxHeight = '0px';
        state.portal.classList.add('hidden');
        state.toggle.setAttribute('aria-expanded', 'false');
    }

    function openDropdown(role) {
        const state = dropdownState[role];
        if (!state || !state.dropdown || !state.portalList || !state.portal) return;
        state.dropdown.classList.add('open');
        state.portalList.classList.add('open');
        state.portalList.style.maxHeight = state.portalList.scrollHeight + 'px';
        state.portal.classList.remove('hidden');
        state.toggle.setAttribute('aria-expanded', 'true');
        positionPortal(role);
    }

    function toggleDropdown(role) {
        const state = dropdownState[role];
        if (!state || !state.dropdown) return;
        if (state.dropdown.classList.contains('open')) {
            closeDropdown(role);
        } else {
            openDropdown(role);
        }
    }

    function sanitizeInput(raw, base) {
        let value = String(raw || '').trim().replace(/[\s_]/g, '');
        if (!value) return value;
        const sign = value.startsWith('-') ? '-' : '';
        if (sign) {
            value = value.slice(1);
        }
        if (base === 16 && /^0x/i.test(value)) value = value.slice(2);
        if (base === 8 && /^0o/i.test(value)) value = value.slice(2);
        if (base === 2 && /^0b/i.test(value)) value = value.slice(2);
        return sign + value;
    }

    function parseInBase(raw, base) {
        const cleaned = sanitizeInput(raw, base);
        if (!cleaned || cleaned === '-') {
            throw new Error('请输入合法整数');
        }

        const negative = cleaned.startsWith('-');
        const digits = negative ? cleaned.slice(1) : cleaned;
        const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

        let result = 0n;
        const radix = BigInt(base);

        for (let i = 0; i < digits.length; i += 1) {
            const ch = digits[i].toLowerCase();
            const val = alphabet.indexOf(ch);
            if (val < 0 || val >= base) {
                throw new Error('字符 "' + digits[i] + '" 不属于 Base' + base);
            }
            result = result * radix + BigInt(val);
        }

        return negative ? -result : result;
    }

    function buildBaseRows(value) {
        return displayBases.map((base) => {
            return [getBaseLabel(base), value.toString(base).toUpperCase()];
        });
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

    function handleAction(action) {
        if (!inputEl || !outputHeadEl || !outputBodyEl || !fromBaseEl) return;

        if (action === 'clear') {
            inputEl.value = '';
            renderTable(['进制', '数值'], []);
            setFeedback('输入输出已清空', 'info');
            return;
        }

        if (action === 'copy') {
            copyToClipboard(outputTextCache, () => {
                setFeedback('输出内容已复制', 'success');
                toastApi.show('复制成功', 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
            }, (reason) => {
                const message = '复制失败：' + reason;
                setFeedback(message, 'error');
                toastApi.show(message, 'error', 'icon-ic_fluent_error_circle_24_regular');
            });
            return;
        }

        const raw = inputEl.value;
        if (!raw.trim()) {
            setFeedback('请先输入内容再操作', 'error');
            return;
        }

        try {
            const fromBase = Number(fromBaseEl.value || '10');
            const decimalValue = parseInBase(raw, fromBase);
            renderTable(['进制', '数值'], buildBaseRows(decimalValue));
            const message = '转换成功：已展示四种进制';
            setFeedback(message, 'success');
            toastApi.show(message, 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
        } catch (err) {
            const reason = err && err.message ? err.message : '处理失败';
            const message = '转换失败：' + reason;
            setFeedback(message, 'error');
            toastApi.show(message, 'error', 'icon-ic_fluent_error_circle_24_regular');
        }
    }

    function buildBaseItems(listEl) {
        listEl.innerHTML = '';
        displayBases.forEach((base) => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.setAttribute('role', 'option');
            item.dataset.value = String(base);
            item.textContent = getBaseLabel(base);
            listEl.appendChild(item);
        });
    }

    function bindDropdown(role) {
        const hidden = document.getElementById('base-' + role);
        const dropdown = document.querySelector('[data-base-role="' + role + '"]');
        const list = document.getElementById('base-' + role + '-list');
        const toggle = document.getElementById('base-' + role + '-toggle');
        const label = document.getElementById('base-' + role + '-label');
        if (!hidden || !dropdown || !list || !toggle || !label) return;
        if (dropdown.dataset.bound === '1') return;

        buildBaseItems(list);

        const portal = document.createElement('div');
        portal.className = 'settings-dropdown-portal basex-dropdown-portal hidden';
        const portalList = document.createElement('div');
        portalList.className = 'settings-dropdown-list';
        portal.appendChild(portalList);
        document.body.appendChild(portal);

        dropdownState[role] = { hidden, dropdown, list, toggle, label, portal, portalList };

        list.querySelectorAll('.dropdown-item').forEach((item) => {
            const clone = item.cloneNode(true);
            clone.addEventListener('click', () => {
                const value = Number(clone.dataset.value || '10');
                setDropdownValue(role, value);
                closeDropdown(role);
            });
            portalList.appendChild(clone);
        });

        toggle.addEventListener('click', () => {
            toggleDropdown(role);
        });

        document.addEventListener('click', (evt) => {
            const state = dropdownState[role];
            if (!state) return;
            if (state.dropdown.contains(evt.target) || state.portal.contains(evt.target)) return;
            closeDropdown(role);
        });

        window.addEventListener('resize', () => positionPortal(role));
        window.addEventListener('scroll', () => positionPortal(role), true);

        dropdown.dataset.bound = '1';
        setDropdownValue(role, Number(hidden.value || '10'));
    }

    function bindButtons() {
        document.querySelectorAll('[data-base-action]').forEach((button) => {
            const action = button.dataset.baseAction;
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
                if (targetId === 'base-input') {
                    copyValue = inputEl ? inputEl.value : '';
                } else if (targetId === 'base-output-table') {
                    copyValue = outputTextCache;
                }
                copyToClipboard(copyValue, () => {
                    markCopied(button);
                    const message = targetId === 'base-input' ? '输入内容已复制' : '输出内容已复制';
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
            const actionBtn = evt.target.closest('[data-base-action]');
            if (actionBtn) {
                captureElements();
                const action = actionBtn.dataset.baseAction;
                if (action) handleAction(action);
                return;
            }
            const copyBtn = evt.target.closest('[data-copy-target]');
            if (!copyBtn) return;
            const targetId = copyBtn.dataset.copyTarget;
            if (targetId !== 'base-input' && targetId !== 'base-output-table') return;
            captureElements();
            let copyValue = '';
            if (targetId === 'base-input') {
                copyValue = inputEl ? inputEl.value : '';
            } else {
                copyValue = outputTextCache;
            }
            copyToClipboard(copyValue, () => {
                markCopied(copyBtn);
                const message = targetId === 'base-input' ? '输入内容已复制' : '输出内容已复制';
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
        if (!inputEl || !outputHeadEl || !outputBodyEl || !fromBaseEl) return false;
        bindDropdown('from');
        bindButtons();
        if (!outputBodyEl.childElementCount) {
            renderTable(['进制', '数值'], []);
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
