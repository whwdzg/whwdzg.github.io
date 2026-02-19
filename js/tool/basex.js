(() => {
    const encoder = window.TextEncoder ? new TextEncoder() : null;
    const decoder = window.TextDecoder ? new TextDecoder('utf-8') : null;
    const toastApi = window.globalCopyToast || { show () {}, hide () {} };

    let inputEl = null;
    let outputEl = null;
    let feedbackEl = null;
    let modeEl = null;
    let modeDropdown = null;
    let modeListEl = null;
    let modePortalEl = null;
    let modePortalListEl = null;
    let modeToggleEl = null;
    let modeLabelEl = null;

    const actionButtons = new WeakMap();
    const copyButtons = new WeakMap();
    const copyTimeouts = new WeakMap();

    const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const base91Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=?@[]^_`{|}~\"";
    const base91Map = (() => {
        const map = Object.create(null);
        for (let i = 0; i < base91Alphabet.length; i += 1) {
            map[base91Alphabet[i]] = i;
        }
        return map;
    })();

    function toBytes(value) {
        if (encoder) {
            return encoder.encode(value);
        }
        const utf8 = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, function (_, hex) {
            return String.fromCharCode('0x' + hex);
        });
        const bytes = new Uint8Array(utf8.length);
        for (let i = 0; i < utf8.length; i += 1) {
            bytes[i] = utf8.charCodeAt(i);
        }
        return bytes;
    }

    function fromBytes(bytes) {
        if (decoder) {
            return decoder.decode(bytes);
        }
        let uri = '';
        for (let i = 0; i < bytes.length; i += 1) {
            uri += '%' + bytes[i].toString(16).padStart(2, '0');
        }
        return decodeURIComponent(uri);
    }

    function bytesToBase64(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.length; i += 1) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function base64ToBytes(value) {
        const normalized = value.replace(/\s+/g, '');
        const binary = atob(normalized);
        const out = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) {
            out[i] = binary.charCodeAt(i);
        }
        return out;
    }

    function encodeBase16(bytes) {
        let out = '';
        for (let i = 0; i < bytes.length; i += 1) {
            out += bytes[i].toString(16).padStart(2, '0');
        }
        return out;
    }

    function decodeBase16(value) {
        const normalized = value.replace(/\s+/g, '').toLowerCase();
        if (normalized.length % 2 !== 0) {
            throw new Error('Base16 长度需要为偶数');
        }
        const len = normalized.length / 2;
        const out = new Uint8Array(len);
        for (let i = 0; i < len; i += 1) {
            const byte = normalized.substr(i * 2, 2);
            const parsed = parseInt(byte, 16);
            if (Number.isNaN(parsed)) {
                throw new Error('包含非法的十六进制字符');
            }
            out[i] = parsed;
        }
        return out;
    }

    function encodeBase32(bytes) {
        let output = '';
        let buffer = 0;
        let bits = 0;
        for (let i = 0; i < bytes.length; i += 1) {
            buffer = (buffer << 8) | bytes[i];
            bits += 8;
            while (bits >= 5) {
                const index = (buffer >> (bits - 5)) & 31;
                output += base32Alphabet[index];
                bits -= 5;
            }
        }
        if (bits > 0) {
            const index = (buffer << (5 - bits)) & 31;
            output += base32Alphabet[index];
        }
        while (output.length % 8 !== 0) {
            output += '=';
        }
        return output;
    }

    function decodeBase32(value) {
        const normalized = value.replace(/=+$/g, '').replace(/\s+/g, '').toUpperCase();
        let buffer = 0;
        let bits = 0;
        const out = [];
        for (let i = 0; i < normalized.length; i += 1) {
            const char = normalized[i];
            const idx = base32Alphabet.indexOf(char);
            if (idx === -1) {
                throw new Error('包含非法的 Base32 字符');
            }
            buffer = (buffer << 5) | idx;
            bits += 5;
            if (bits >= 8) {
                bits -= 8;
                out.push((buffer >> bits) & 0xff);
            }
        }
        return new Uint8Array(out);
    }

    function encodeBase58(bytes) {
        if (!bytes.length) return '';
        let zeros = 0;
        while (zeros < bytes.length && bytes[zeros] === 0) {
            zeros += 1;
        }
        let value = 0n;
        for (let i = 0; i < bytes.length; i += 1) {
            value = (value << 8n) + BigInt(bytes[i]);
        }
        let encoded = '';
        while (value > 0n) {
            const mod = Number(value % 58n);
            value = value / 58n;
            encoded = base58Alphabet[mod] + encoded;
        }
        for (let i = 0; i < zeros; i += 1) {
            encoded = '1' + encoded;
        }
        return encoded;
    }

    function decodeBase58(value) {
        const normalized = value.replace(/\s+/g, '');
        if (!normalized) return new Uint8Array(0);
        let num = 0n;
        for (let i = 0; i < normalized.length; i += 1) {
            const char = normalized[i];
            const idx = base58Alphabet.indexOf(char);
            if (idx === -1) {
                throw new Error('包含非法的 Base58 字符');
            }
            num = num * 58n + BigInt(idx);
        }
        const bytes = [];
        while (num > 0n) {
            bytes.push(Number(num % 256n));
            num = num / 256n;
        }
        bytes.reverse();
        let leadingOnes = 0;
        for (let i = 0; i < normalized.length && normalized[i] === '1'; i += 1) {
            leadingOnes += 1;
        }
        const result = new Uint8Array(leadingOnes + bytes.length);
        for (let i = 0; i < leadingOnes; i += 1) {
            result[i] = 0;
        }
        for (let i = 0; i < bytes.length; i += 1) {
            result[leadingOnes + i] = bytes[i];
        }
        return result;
    }

    function encodeBase85(bytes) {
        if (!bytes.length) return '';
        let output = '';
        for (let i = 0; i < bytes.length; i += 4) {
            const slice = bytes.slice(i, i + 4);
            const padding = 4 - slice.length;
            let value = 0;
            for (let j = 0; j < slice.length; j += 1) {
                value = (value << 8) | slice[j];
            }
            for (let j = 0; j < padding; j += 1) {
                value = value << 8;
            }
            const encoded = [];
            for (let k = 0; k < 5; k += 1) {
                encoded.push(String.fromCharCode((value % 85) + 33));
                value = Math.floor(value / 85);
            }
            encoded.reverse();
            if (padding > 0) {
                encoded.splice(5 - padding);
            }
            output += encoded.join('');
        }
        return output;
    }

    function decodeBase85(value) {
        const normalized = value.replace(/\s+/g, '');
        if (!normalized) return new Uint8Array(0);
        const out = [];
        let group = [];
        for (let i = 0; i < normalized.length; i += 1) {
            const code = normalized.charCodeAt(i);
            if (code < 33 || code > 117) {
                throw new Error('包含非法的 Base85 字符');
            }
            group.push(code - 33);
            if (group.length === 5) {
                let acc = 0;
                for (let j = 0; j < 5; j += 1) {
                    acc = acc * 85 + group[j];
                }
                out.push((acc >> 24) & 0xff, (acc >> 16) & 0xff, (acc >> 8) & 0xff, acc & 0xff);
                group = [];
            }
        }
        if (group.length > 0) {
            const originalLength = group.length;
            while (group.length < 5) {
                group.push(84);
            }
            let acc = 0;
            for (let i = 0; i < 5; i += 1) {
                acc = acc * 85 + group[i];
            }
            const bytes = [(acc >> 24) & 0xff, (acc >> 16) & 0xff, (acc >> 8) & 0xff, acc & 0xff];
            const keep = Math.max(0, originalLength - 1);
            out.push.apply(out, bytes.slice(0, keep));
        }
        return new Uint8Array(out);
    }

    function encodeBase91(bytes) {
        let b = 0;
        let n = 0;
        let output = '';
        for (let i = 0; i < bytes.length; i += 1) {
            b |= bytes[i] << n;
            n += 8;
            if (n > 13) {
                let v = b & 8191;
                if (v > 88) {
                    b >>= 13;
                    n -= 13;
                } else {
                    v = b & 16383;
                    b >>= 14;
                    n -= 14;
                }
                output += base91Alphabet[v % 91];
                output += base91Alphabet[Math.floor(v / 91)];
            }
        }
        if (n) {
            output += base91Alphabet[b % 91];
            if (n > 7 || b > 90) {
                output += base91Alphabet[Math.floor(b / 91)];
            }
        }
        return output;
    }

    function decodeBase91(value) {
        const normalized = value.replace(/\s+/g, '');
        if (!normalized) return new Uint8Array(0);
        let v = -1;
        let b = 0;
        let n = 0;
        const out = [];
        for (let i = 0; i < normalized.length; i += 1) {
            const ch = normalized[i];
            const c = base91Map[ch];
            if (c === undefined) {
                throw new Error('包含非法的 Base91 字符');
            }
            if (v < 0) {
                v = c;
            } else {
                v += c * 91;
                b |= v << n;
                n += (v & 8191) > 88 ? 13 : 14;
                while (n >= 8) {
                    out.push(b & 255);
                    b >>= 8;
                    n -= 8;
                }
                v = -1;
            }
        }
        if (v > -1) {
            out.push((b | (v << n)) & 255);
        }
        return new Uint8Array(out);
    }

    const baseHandlers = {
        base16: {
            label: 'Base16',
            encode: (text) => encodeBase16(toBytes(text)),
            decode: (encoded) => fromBytes(decodeBase16(encoded))
        },
        base32: {
            label: 'Base32',
            encode: (text) => encodeBase32(toBytes(text)),
            decode: (encoded) => fromBytes(decodeBase32(encoded))
        },
        base58: {
            label: 'Base58',
            encode: (text) => encodeBase58(toBytes(text)),
            decode: (encoded) => fromBytes(decodeBase58(encoded))
        },
        base64: {
            label: 'Base64',
            encode: (text) => bytesToBase64(toBytes(text)),
            decode: (encoded) => fromBytes(base64ToBytes(encoded))
        },
        base85: {
            label: 'Base85',
            encode: (text) => encodeBase85(toBytes(text)),
            decode: (encoded) => fromBytes(decodeBase85(encoded))
        },
        base91: {
            label: 'Base91',
            encode: (text) => encodeBase91(toBytes(text)),
            decode: (encoded) => fromBytes(decodeBase91(encoded))
        }
    };

    function setFeedback(message, state) {
        if (!feedbackEl) return;
        feedbackEl.textContent = message;
        feedbackEl.dataset.state = state || 'info';
    }

    function getCurrentModeKey() {
        return modeEl && modeEl.value ? modeEl.value : 'base64';
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

    function collapseModeDropdown() {
        if (!modeDropdown || !modePortalListEl || !modeToggleEl || !modePortalEl) return;
        modeDropdown.classList.remove('open');
        modePortalListEl.classList.remove('open');
        modePortalListEl.style.maxHeight = '0px';
        modePortalEl.classList.add('hidden');
        modeToggleEl.setAttribute('aria-expanded', 'false');
    }

    function expandModeDropdown() {
        if (!modeDropdown || !modePortalListEl || !modeToggleEl || !modePortalEl) return;
        modeDropdown.classList.add('open');
        modePortalListEl.classList.add('open');
        modePortalListEl.style.maxHeight = modePortalListEl.scrollHeight + 'px';
        modePortalEl.classList.remove('hidden');
        modeToggleEl.setAttribute('aria-expanded', 'true');
        positionModePortal();
    }

    function toggleModeDropdown() {
        if (!modeDropdown || !modePortalListEl) return;
        const open = modeDropdown.classList.contains('open');
        if (open) {
            collapseModeDropdown();
        } else {
            expandModeDropdown();
        }
    }

    function positionModePortal() {
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
        if (preferBelow) {
            modePortalEl.style.top = Math.min(viewportH - portalH - 8, rect.bottom + gap) + 'px';
        } else {
            modePortalEl.style.top = Math.max(8, rect.top - portalH - gap) + 'px';
        }
    }

    function handleAction(action) {
        if (!inputEl || !outputEl || !modeEl) return;
        const raw = inputEl.value;
        const modeKey = getCurrentModeKey();
        const handler = baseHandlers[modeKey];
        if (!handler) {
            setFeedback('未找到对应的编码方案', 'error');
            return;
        }
        if (action === 'clear') {
            inputEl.value = '';
            outputEl.value = '';
            setFeedback('输入输出已清空', 'info');
            return;
        }
        if (!raw.trim()) {
            setFeedback('请先输入内容再操作', 'error');
            return;
        }
        try {
            if (action === 'encode') {
                const encoded = handler.encode(raw);
                outputEl.value = encoded;
                const message = handler.label + ' 编码成功 · ' + encoded.length + ' 字符';
                setFeedback(message, 'success');
                toastApi.show(message, 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
            } else if (action === 'decode') {
                const decoded = handler.decode(raw);
                outputEl.value = decoded;
                const message = handler.label + ' 解码成功';
                setFeedback(message, 'success');
                toastApi.show(message, 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
            }
        } catch (err) {
            const reason = err && err.message ? err.message : '处理失败';
            const message = handler.label + ' 处理失败：' + reason;
            setFeedback(message, 'error');
            toastApi.show(message, 'error', 'icon-ic_fluent_error_circle_24_regular');
        }
    }

    function captureElements() {
        inputEl = document.getElementById('basex-input');
        outputEl = document.getElementById('basex-output');
        feedbackEl = document.getElementById('basex-feedback');
        modeEl = document.getElementById('basex-mode');
        modeDropdown = document.querySelector('.basex-dropdown');
        modeListEl = document.getElementById('basex-mode-list');
        modeToggleEl = document.getElementById('basex-mode-toggle');
        modeLabelEl = document.getElementById('basex-mode-label');
    }

    function bindModeDropdown() {
        if (!modeDropdown || !modeListEl || !modeToggleEl || !modeEl) return;
        if (modeDropdown.dataset.bound === '1') return;

        // Build floating portal and clone list items
        modePortalEl = document.createElement('div');
        modePortalEl.className = 'settings-dropdown-portal basex-dropdown-portal hidden';
        modePortalListEl = document.createElement('div');
        modePortalListEl.className = 'settings-dropdown-list';
        modePortalEl.appendChild(modePortalListEl);
        document.body.appendChild(modePortalEl);

        modeListEl.querySelectorAll('.dropdown-item').forEach((item) => {
            const clone = item.cloneNode(true);
            clone.addEventListener('click', () => {
                const val = clone.dataset.value || 'base64';
                const labelText = clone.textContent || val;
                setModeValue(val, labelText);
                collapseModeDropdown();
            });
            modePortalListEl.appendChild(clone);
        });

        const outsideHandler = (evt) => {
            if (modeDropdown.contains(evt.target) || (modePortalEl && modePortalEl.contains(evt.target))) return;
            collapseModeDropdown();
        };

        modeToggleEl.addEventListener('click', () => {
            toggleModeDropdown();
        });

        document.addEventListener('click', outsideHandler);
        window.addEventListener('resize', positionModePortal);
        window.addEventListener('scroll', positionModePortal, true);
        modeDropdown.dataset.bound = '1';

        // sync initial label and selection
        const initialVal = modeEl.value || 'base64';
        const initialItem = modeListEl.querySelector(`[data-value="${initialVal}"]`) || modeListEl.querySelector('.dropdown-item');
        if (initialItem) {
            setModeValue(initialItem.dataset.value || initialVal, initialItem.textContent || initialVal);
        }
    }

    function bindButtons() {
        const buttons = document.querySelectorAll('[data-basex-action]');
        buttons.forEach((button) => {
            const action = button.dataset.basexAction;
            if (!action) return;
            if (actionButtons.has(button)) return;
            const handler = () => {
                captureElements();
                handleAction(action);
            };
            actionButtons.set(button, handler);
            button.addEventListener('click', handler);
        });
    }

    function markCopied(button) {
        if (!button) return;
        button.classList.add('copied');
        const existing = copyTimeouts.get(button);
        if (existing) {
            clearTimeout(existing);
        }
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
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (successful) {
                success();
            } else {
                failure('复制命令失败');
            }
        } catch (err) {
            failure(err && err.message ? err.message : '未知错误');
        }
    }

    function handleCopy(button) {
        captureElements();
        if (!feedbackEl) return;
        const targetId = button.dataset.copyTarget;
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (!target) return;
        const currentValue = target.value;
        copyToClipboard(currentValue, () => {
            markCopied(button);
            const message = targetId === 'basex-input' ? '输入内容已复制' : '输出内容已复制';
            setFeedback(message, 'success');
            toastApi.show('复制成功', 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
        }, (reason) => {
            setFeedback('复制失败：' + reason, 'error');
            toastApi.show('复制失败：' + reason, 'error', 'icon-ic_fluent_error_circle_24_regular');
        });
    }

    function bindCopyButtons() {
        const buttons = document.querySelectorAll('[data-copy-target]');
        buttons.forEach((button) => {
            if (copyButtons.has(button)) return;
            const handler = () => {
                handleCopy(button);
            };
            copyButtons.set(button, handler);
            button.addEventListener('click', handler);
        });
    }

    function init() {
        captureElements();
        if (!inputEl || !outputEl || !modeEl) return;
        bindModeDropdown();
        bindButtons();
        bindCopyButtons();
        if (typeof window.attachToastClose === 'function') {
            window.attachToastClose();
        }
    }

    init();
    window.addEventListener('load', init);
    window.addEventListener('spa:page:loaded', init);
})();
