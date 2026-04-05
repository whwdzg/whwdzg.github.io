/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\copy-toast.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
(function () {
    const toastId = 'global-copy-toast';
    const successIcon = 'icon-ic_fluent_checkmark_circle_24_regular';
    const errorIcon = 'icon-ic_fluent_error_circle_24_regular';
    const toastEl = document.getElementById(toastId);
    if (!toastEl) {
        window.globalCopyToast = {
            show: function () {},
            hide: function () {}
        };
        return;
    }
    const iconEl = toastEl.querySelector('.global-toast-icon');
    const messageEl = toastEl.querySelector('.global-toast-message');
    const closeBtn = toastEl.querySelector('.global-toast-close');
    const progressEl = toastEl.querySelector('.global-toast-progress');
    let timer = null;
    let progressRaf = 0;
    let shownAt = 0;
    let hideAfter = 1600;

    function setVariant(variant) {
        toastEl.classList.remove('global-copy-toast--success', 'global-copy-toast--error');
        toastEl.classList.add('global-copy-toast--' + variant);
    }

    function updateIcon(iconName) {
        if (!iconEl) return;
        iconEl.classList.remove(successIcon, errorIcon);
        if (iconName) {
            iconEl.classList.add(iconName);
        }
    }

    function stopProgressLoop() {
        if (progressRaf) {
            cancelAnimationFrame(progressRaf);
            progressRaf = 0;
        }
    }

    function setProgress(percent) {
        if (!progressEl) return;
        const safe = Math.max(0, Math.min(100, Number(percent) || 0));
        const ratio = safe / 100;
        toastEl.style.setProperty('--toast-progress', String(safe));
        toastEl.style.setProperty('--toast-progress-ratio', String(ratio));
    }

    function startProgressLoop(duration) {
        stopProgressLoop();
        shownAt = performance.now();
        hideAfter = Math.max(1, Number(duration) || 1600);
        setProgress(100);

        const tick = (now) => {
            const elapsed = now - shownAt;
            const remaining = Math.max(0, hideAfter - elapsed);
            setProgress((remaining / hideAfter) * 100);
            if (remaining > 0 && toastEl.classList.contains('show')) {
                progressRaf = requestAnimationFrame(tick);
            } else {
                progressRaf = 0;
                setProgress(0);
            }
        };

        progressRaf = requestAnimationFrame(tick);
    }

    function show(message, variant, iconName) {
        if (!toastEl) return;
        if (messageEl) {
            messageEl.textContent = message || '';
        } else {
            toastEl.textContent = message || '';
        }
        setVariant(variant || 'success');
        updateIcon(iconName || successIcon);
        toastEl.classList.add('show');
        if (timer) {
            clearTimeout(timer);
        }
        const duration = 1600;
        startProgressLoop(duration);
        timer = setTimeout(() => {
            toastEl.classList.remove('show');
            stopProgressLoop();
            setProgress(0);
        }, duration);
    }

    function hide() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        stopProgressLoop();
        setProgress(0);
        toastEl.classList.remove('show');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', hide);
    }

    window.globalCopyToast = { show, hide };
})();
