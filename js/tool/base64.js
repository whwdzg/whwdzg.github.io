(() => {
    const encoder = window.TextEncoder ? new TextEncoder() : null;
    const decoder = window.TextDecoder ? new TextDecoder('utf-8') : null;

    let inputEl = null;
    let outputEl = null;
    let feedbackEl = null;
    const actionButtons = new WeakMap();
    const copyButtons = new WeakMap();
    const copyTimeouts = new WeakMap();
    const toastApi = window.globalCopyToast || { show () {}, hide () {} };

    function setFeedback(message, state) {
        if (!feedbackEl) return;
        feedbackEl.textContent = message;
        feedbackEl.dataset.state = state || 'info';
    }

    function encodeToBase64(value) {
        if (encoder) {
            const bytes = encoder.encode(value);
            let binary = '';
            for (let i = 0; i < bytes.length; i += 1) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        }
        const utf8 = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, function (_, hex) {
            return String.fromCharCode('0x' + hex);
        });
        return btoa(utf8);
    }

    function decodeFromBase64(value) {
        const normalized = value.replace(/\s+/g, '');
        const binary = atob(normalized);
        if (decoder) {
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i += 1) {
                bytes[i] = binary.charCodeAt(i);
            }
            return decoder.decode(bytes);
        }
        let uri = '';
        for (let i = 0; i < binary.length; i += 1) {
            uri += '%' + binary.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return decodeURIComponent(uri);
    }

    function handleAction(action) {
        if (!outputEl || !inputEl) return;
        const raw = inputEl.value;
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
                const encoded = encodeToBase64(raw);
                outputEl.value = encoded;
                const message = '编码成功 · ' + encoded.length + ' 字符';
                setFeedback(message, 'success');
                toastApi.show(message, 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
            } else if (action === 'decode') {
                const decoded = decodeFromBase64(raw);
                outputEl.value = decoded;
                const message = '解码成功';
                setFeedback(message, 'success');
                toastApi.show(message, 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
            }
        } catch (err) {
            const reason = err && err.message ? err.message : '输入不合法的 Base64 字符串';
            const message = '处理失败：' + reason;
            setFeedback(message, 'error');
            toastApi.show(message, 'error', 'icon-ic_fluent_error_circle_24_regular');
        }
    }

    function captureElements() {
        inputEl = document.getElementById('base64-input');
        outputEl = document.getElementById('base64-output');
        feedbackEl = document.getElementById('base64-feedback');
    }

    function bindButtons() {
        const buttons = document.querySelectorAll('[data-base64-action]');
        buttons.forEach((button) => {
            const action = button.dataset.base64Action;
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
            const message = targetId === 'base64-input' ? '输入内容已复制' : '输出内容已复制';
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

    const init = () => {
        captureElements();
        if (!inputEl || !outputEl) return;
        bindButtons();
        bindCopyButtons();
        attachToastClose();
    };

    init();
    window.addEventListener('load', init);
    window.addEventListener('spa:page:loaded', init);
})();
