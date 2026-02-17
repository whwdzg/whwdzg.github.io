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
    let timer = null;

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
        timer = setTimeout(() => toastEl.classList.remove('show'), 1600);
    }

    function hide() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        toastEl.classList.remove('show');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', hide);
    }

    window.globalCopyToast = { show, hide };
})();
