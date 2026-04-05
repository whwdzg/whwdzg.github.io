/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\component.js
 * 作用: 组件交互逻辑（提示框、对话框、输入框等）。
 * English: Interaction logic for component demos.
 */
(() => {
  const root = document.documentElement;
  let toastTimer = null;
  let globalEscBound = false;

  function getToastParts() {
    const el = document.querySelector('[data-component-toast]');
    if (!el) return { el: null, icon: null, message: null, close: null };
    return {
      el,
      icon: el.querySelector('.component-toast__icon'),
      message: el.querySelector('.component-toast__message'),
      close: el.querySelector('.component-toast__close')
    };
  }

  function hexToRgbTuple(hex) {
    const normalized = (hex || '').trim().replace('#', '');
    if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) return null;
    const full = normalized.length === 3
      ? normalized.split('').map((x) => x + x).join('')
      : normalized;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return { hex: '#' + full.toLowerCase(), rgb: r + ',' + g + ',' + b };
  }

  function applyThemeColor(hex) {
    const parsed = hexToRgbTuple(hex);
    if (!parsed) return false;
    root.style.setProperty('--primary-color', parsed.hex);
    root.style.setProperty('--primary-color-rgb', parsed.rgb);
    document.querySelectorAll('[data-theme-color]').forEach((swatch) => {
      swatch.classList.toggle('active', (swatch.dataset.themeColor || '').toLowerCase() === parsed.hex);
    });
    document.querySelectorAll('[data-theme-hex]').forEach((input) => {
      input.value = parsed.hex;
    });
    return true;
  }

  function setToastVariant(variant) {
    const { el: toastEl } = getToastParts();
    if (!toastEl) return;
    toastEl.classList.remove('component-toast--success', 'component-toast--warning', 'component-toast--error', 'component-toast--info');
    if (variant) toastEl.classList.add('component-toast--' + variant);
  }

  function setToastIcon(iconClass) {
    const { icon: toastIcon } = getToastParts();
    if (!toastIcon) return;
    toastIcon.className = 'component-toast__icon ' + (iconClass || 'icon-ic_fluent_info_24_regular');
  }

  function showToast(message, variant, iconClass, borderColor) {
    const { el: toastEl, message: toastMessage } = getToastParts();
    if (!toastEl) return;
    if (toastMessage) toastMessage.textContent = message || '';
    setToastVariant(variant || 'info');
    setToastIcon(iconClass);
    if (borderColor) {
      toastEl.style.setProperty('--toast-border', borderColor);
    } else {
      toastEl.style.removeProperty('--toast-border');
    }
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  function hideToast() {
    const { el: toastEl } = getToastParts();
    if (!toastEl) return;
    if (toastTimer) clearTimeout(toastTimer);
    toastEl.classList.remove('show');
  }

  function copyToClipboard(value, onSuccess, onError) {
    if (!value) {
      onError('没有可复制的内容');
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(onSuccess).catch((err) => onError(err ? err.message : '权限不足'));
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
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        onSuccess();
      } else {
        onError('复制失败');
      }
    } catch (err) {
      onError(err && err.message ? err.message : '未知错误');
    }
  }

  function markTintFeedback(btn) {
    if (!btn) return;
    btn.classList.add('is-feedback');
    setTimeout(() => btn.classList.remove('is-feedback'), 260);
  }

  function safePlay(mediaEl) {
    if (!mediaEl || typeof mediaEl.play !== 'function') return;
    try {
      const maybePromise = mediaEl.play();
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {});
      }
    } catch (_) {
      // Ignore autoplay/user-gesture errors in demo page.
    }
  }

  function updateSliderVisual(rangeEl) {
    if (!rangeEl) return;
    const min = Number(rangeEl.min || 0);
    const max = Number(rangeEl.max || 100);
    const value = Number(rangeEl.value || min);
    const safeMax = max <= min ? min + 1 : max;
    const pct = ((value - min) / (safeMax - min)) * 100;
    const clamped = Math.min(100, Math.max(0, pct));
    rangeEl.style.setProperty('--slider-pct', clamped.toFixed(2) + '%');
  }

  function bindRangeVisuals(scope) {
    const target = scope || document;
    target.querySelectorAll('input[type="range"]').forEach((rangeEl) => {
      if (rangeEl.dataset.boundSliderVisual !== 'true') {
        rangeEl.dataset.boundSliderVisual = 'true';
        rangeEl.addEventListener('input', () => updateSliderVisual(rangeEl));
        rangeEl.addEventListener('change', () => updateSliderVisual(rangeEl));
      }
      updateSliderVisual(rangeEl);
    });
  }

  function bindTopControls() {
    const swatches = document.querySelectorAll('[data-theme-color]');
    const applyBtns = document.querySelectorAll('[data-theme-apply]');

    swatches.forEach((swatch) => {
      if (swatch.dataset.boundThemeSwatch === 'true') return;
      swatch.dataset.boundThemeSwatch = 'true';
      swatch.addEventListener('click', () => {
        const target = swatch.dataset.themeColor;
        if (!target) return;
        if (applyThemeColor(target)) {
          showToast('主题色已切换', 'success', 'icon-ic_fluent_color_24_regular');
        }
      });
    });

    applyBtns.forEach((applyBtn) => {
      if (applyBtn.dataset.boundThemeApply === 'true') return;
      applyBtn.dataset.boundThemeApply = 'true';
      applyBtn.addEventListener('click', () => {
        const panel = applyBtn.closest('[data-custom-color-panel]');
        if (panel && typeof panel.__applyDraft === 'function') {
          if (!panel.__applyDraft()) {
            showToast('请输入有效 16 进制色值', 'warning', 'icon-ic_fluent_warning_24_regular');
            return;
          }
          panel.setAttribute('hidden', '');
          document.querySelectorAll('[data-open-custom-color]').forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
          showToast('已应用自定义色值', 'success', 'icon-ic_fluent_color_24_regular');
          return;
        }

        const scope = applyBtn.closest('.component-demo-controls, .component-palette, .component-section') || document;
        const hexInput = scope.querySelector('[data-theme-hex]') || document.querySelector('[data-theme-hex]');
        if (!hexInput || !applyThemeColor(hexInput.value)) {
          showToast('请输入有效 16 进制色值', 'warning', 'icon-ic_fluent_warning_24_regular');
          return;
        }
        showToast('已应用自定义色值', 'success', 'icon-ic_fluent_color_24_regular');
      });
    });
  }

  function bindSpectrumControls() {
    const panel = document.querySelector('[data-custom-color-panel]');
    const rRange = document.querySelector('[data-rgb-range="r"]');
    const gRange = document.querySelector('[data-rgb-range="g"]');
    const bRange = document.querySelector('[data-rgb-range="b"]');
    const rInput = document.querySelector('[data-rgb-input="r"]');
    const gInput = document.querySelector('[data-rgb-input="g"]');
    const bInput = document.querySelector('[data-rgb-input="b"]');
    const hexInput = document.querySelector('[data-theme-hex]');
    const preview = document.querySelector('[data-color-preview]');
    if (!panel || !rRange || !gRange || !bRange || !rInput || !gInput || !bInput || !hexInput || !preview) return;
    if (panel.dataset.boundSpectrum === 'true') return;
    panel.dataset.boundSpectrum = 'true';

    const clamp255 = (v) => {
      const n = parseInt(v, 10);
      if (isNaN(n)) return 0;
      return Math.min(255, Math.max(0, n));
    };

    const syncDraftFromRgb = () => {
      const r = clamp255(rRange.value);
      const g = clamp255(gRange.value);
      const b = clamp255(bRange.value);
      rInput.value = String(r);
      gInput.value = String(g);
      bInput.value = String(b);
      const hex = '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
      hexInput.value = hex;
      preview.style.background = hex;
      updateSliderVisual(rRange);
      updateSliderVisual(gRange);
      updateSliderVisual(bRange);
    };

    const syncRangeFromInput = () => {
      rRange.value = String(clamp255(rInput.value));
      gRange.value = String(clamp255(gInput.value));
      bRange.value = String(clamp255(bInput.value));
      syncDraftFromRgb();
    };

    const setDraftFromHex = (hex) => {
      const parsed = hexToRgbTuple(hex);
      if (!parsed) return false;
      const parts = parsed.rgb.split(',').map((v) => Number(v));
      rRange.value = String(parts[0]);
      gRange.value = String(parts[1]);
      bRange.value = String(parts[2]);
      syncDraftFromRgb();
      return true;
    };

    panel.__setDraftFromTheme = () => {
      const current = getComputedStyle(root).getPropertyValue('--primary-color').trim() || '#33cc99';
      if (!setDraftFromHex(current)) setDraftFromHex('#33cc99');
    };

    panel.__applyDraft = () => applyThemeColor(hexInput.value);

    panel.__cancelDraft = () => {
      if (typeof panel.__setDraftFromTheme === 'function') panel.__setDraftFromTheme();
    };

    [rRange, gRange, bRange].forEach((el) => el.addEventListener('input', syncDraftFromRgb));
    [rInput, gInput, bInput].forEach((el) => el.addEventListener('input', syncRangeFromInput));
    hexInput.addEventListener('input', () => {
      if (!setDraftFromHex(hexInput.value)) {
        preview.style.background = 'transparent';
      }
    });

    panel.__setDraftFromTheme();
    bindRangeVisuals(panel);
  }

  function bindCustomColorPanel() {
    const openBtns = document.querySelectorAll('[data-open-custom-color]');
    const panel = document.querySelector('[data-custom-color-panel]');
    if (!openBtns.length || !panel) return;
    if (panel.dataset.boundCustomColor === 'true') return;
    panel.dataset.boundCustomColor = 'true';

    const positionPanel = (anchorEl) => {
      const anchor = anchorEl || openBtns[0];
      if (!anchor) return;
      const previousHidden = panel.hasAttribute('hidden');
      if (previousHidden) {
        panel.style.visibility = 'hidden';
        panel.removeAttribute('hidden');
      }

      const rect = anchor.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const header = document.querySelector('header');
      const headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      const minTop = headerBottom + 8;

      let left = rect.left;
      left = Math.max(8, Math.min(vw - panelRect.width - 8, left));

      const belowTop = rect.bottom + 8;
      const aboveTop = rect.top - panelRect.height - 8;
      let top = belowTop;
      if (belowTop + panelRect.height > vh - 8 && aboveTop >= minTop) {
        top = aboveTop;
      }
      top = Math.max(minTop, Math.min(vh - panelRect.height - 8, top));

      panel.style.left = left + 'px';
      panel.style.top = top + 'px';

      if (previousHidden) {
        panel.setAttribute('hidden', '');
        panel.style.visibility = '';
      }
    };

    const togglePanel = (visible, anchorEl) => {
      if (visible) {
        panel.removeAttribute('hidden');
        if (typeof panel.__setDraftFromTheme === 'function') panel.__setDraftFromTheme();
        positionPanel(anchorEl);
      } else {
        panel.setAttribute('hidden', '');
      }
      openBtns.forEach((btn) => btn.setAttribute('aria-expanded', visible ? 'true' : 'false'));
    };

    openBtns.forEach((openBtn) => {
      openBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const hidden = panel.hasAttribute('hidden');
        togglePanel(hidden, openBtn);
      });
    });

    const cancelBtns = panel.querySelectorAll('[data-theme-cancel]');
    cancelBtns.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        if (typeof panel.__cancelDraft === 'function') panel.__cancelDraft();
        togglePanel(false);
      });
    });

    document.addEventListener('click', (event) => {
      if (panel.hasAttribute('hidden')) return;
      if (panel.contains(event.target)) return;
      let clickedOpenBtn = false;
      openBtns.forEach((btn) => {
        if (btn.contains(event.target)) clickedOpenBtn = true;
      });
      if (clickedOpenBtn) return;
      togglePanel(false);
    });

    window.addEventListener('resize', () => {
      if (!panel.hasAttribute('hidden')) positionPanel();
    });

    window.addEventListener('scroll', () => {
      if (!panel.hasAttribute('hidden')) positionPanel();
    }, true);
  }

  function bindDialogHandlers() {
    const openButtons = document.querySelectorAll('[data-dialog-open]');
    openButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.dialogOpen;
        const dialog = targetId ? document.getElementById(targetId) : null;
        if (!dialog) return;
        dialog.classList.add('is-open');
        const input = dialog.querySelector('.component-dialog__input');
        if (input) input.focus();
      });
    });

    const dialogs = document.querySelectorAll('.component-dialog');
    dialogs.forEach((dialog) => {
      const backdrop = dialog.querySelector('[data-dialog-close]');
      if (backdrop) backdrop.addEventListener('click', () => dialog.classList.remove('is-open'));
      dialog.querySelectorAll('[data-dialog-cancel]').forEach((btn) => btn.addEventListener('click', () => dialog.classList.remove('is-open')));
      dialog.querySelectorAll('[data-dialog-confirm]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const input = dialog.querySelector('.component-dialog__input');
          if (input) {
            showToast('已提交：' + input.value, 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
          } else {
            showToast('已确认操作', 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
          }
          dialog.classList.remove('is-open');
        });
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      dialogs.forEach((dialog) => {
        if (dialog.classList.contains('is-open')) dialog.classList.remove('is-open');
      });
    });
  }

  function bindInputHandlers() {
    const inputs = document.querySelectorAll('[data-component-input]');
    inputs.forEach((wrapper) => {
      const textarea = wrapper.querySelector('textarea');
      if (!textarea) return;
      const defaultHeight = textarea.offsetHeight;

      const adjustHeight = () => {
        if (textarea.dataset.autoResize !== 'true') return;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      };

      textarea.addEventListener('input', adjustHeight);
      adjustHeight();

      wrapper.querySelectorAll('[data-input-action="copy"]').forEach((btn) => {
        btn.addEventListener('click', () => {
          copyToClipboard(textarea.value, () => {
            markTintFeedback(btn);
            showToast('复制成功', 'success', 'icon-ic_fluent_checkmark_circle_24_regular');
          }, (reason) => {
            showToast('复制失败：' + reason, 'error', 'icon-ic_fluent_error_circle_24_regular');
          });
        });
      });

      wrapper.querySelectorAll('[data-input-action="clear"]').forEach((btn) => {
        btn.addEventListener('click', () => {
          textarea.value = '';
          if (textarea.dataset.autoResize === 'true') textarea.style.height = defaultHeight + 'px';
          markTintFeedback(btn);
          showToast('已清空输入', 'info', 'icon-ic_fluent_delete_24_regular');
        });
      });
    });
  }

  function updateSearchResults(query) {
    const rows = document.querySelectorAll('[data-search-item]');
    if (!rows.length) return 0;
    let count = 0;
    const normalized = (query || '').trim().toLowerCase();
    rows.forEach((row) => {
      const text = (row.dataset.searchItem || row.textContent || '').toLowerCase();
      const visible = !normalized || text.indexOf(normalized) !== -1;
      row.classList.toggle('hidden', !visible);
      if (visible) count += 1;
    });
    return count;
  }

  function bindSearchHandlers() {
    const searchWrap = document.querySelector('.component-search-wrap');
    if (!searchWrap) return;
    const search = searchWrap.querySelector('.component-search');
    if (!search) return;
    const input = search.querySelector('.component-search__input');
    const clearBtn = search.querySelector('[data-search-clear]');
    const submitBtn = search.querySelector('[data-search-submit]');
    if (!input || !clearBtn || !submitBtn) return;

    searchWrap.querySelectorAll('.search-result-text').forEach((item) => {
      item.setAttribute('title', item.textContent || '');
    });

    const runSearch = () => {
      const query = input.value.trim();
      const count = updateSearchResults(query);
      if (!query) {
        showToast('已显示全部项目', 'info', 'icon-ic_fluent_search_24_regular');
        return;
      }
      showToast('匹配到 ' + count + ' 项：' + query, 'success', 'icon-ic_fluent_search_24_regular');
    };

    input.addEventListener('input', () => {
      if (!input.value.trim()) updateSearchResults('');
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      updateSearchResults('');
      markTintFeedback(clearBtn);
      showToast('已清空搜索', 'info', 'icon-ic_fluent_delete_24_regular');
    });

    submitBtn.addEventListener('click', () => {
      markTintFeedback(submitBtn);
      runSearch();
    });

    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      markTintFeedback(submitBtn);
      runSearch();
    });
  }

  function bindFilterHandlers() {
    const chips = document.querySelectorAll('.component-filter-chip');
    const statusEl = document.querySelector('[data-filter-status]');
    if (!chips.length) return;
    if (chips[0].dataset.boundFilter === 'true') return;
    chips.forEach((chip) => {
      chip.dataset.boundFilter = 'true';
    });

    const allTotal = chips[0] && chips[0].dataset.filterCount
      ? parseInt(chips[0].dataset.filterCount, 10)
      : chips.length;

    const updateStatus = (chip) => {
      if (!statusEl) return;
      const selectedCount = chip && chip.dataset.filterCount
        ? parseInt(chip.dataset.filterCount, 10)
        : 1;
      statusEl.textContent = '已筛选·' + selectedCount + '项·共' + allTotal + '项';
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((item) => item.classList.remove('active'));
        chip.classList.add('active');
        updateStatus(chip);
        showToast('筛选：' + chip.textContent.trim(), 'info', 'icon-ic_fluent_filter_24_regular');
      });
    });

    updateStatus(document.querySelector('.component-filter-chip.active') || chips[0]);
  }

  function bindDropdownHandlers() {
    const dropdowns = document.querySelectorAll('[data-component-dropdown]');
    if (!dropdowns.length) return;

    const placeDropdown = (dropdown) => {
      const list = dropdown.querySelector('.component-dropdown-list');
      const toggle = dropdown.querySelector('.component-dropdown-toggle');
      if (!list || !toggle) return;
      const listRect = list.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const listHeight = listRect.height || Math.min(280, list.scrollHeight || 0);
      const spaceBelow = viewportHeight - toggleRect.bottom;
      const spaceAbove = toggleRect.top;
      const shouldDropUp = spaceBelow < listHeight + 12 && spaceAbove > spaceBelow;
      dropdown.classList.toggle('dropup', shouldDropUp);
    };

    dropdowns.forEach((dropdown) => {
      if (dropdown.dataset.boundDropdown === 'true') return;
      dropdown.dataset.boundDropdown = 'true';
      const toggle = dropdown.querySelector('.component-dropdown-toggle');
      const label = dropdown.querySelector('.toggle-label');
      const items = dropdown.querySelectorAll('.component-dropdown-item');
      if (!toggle || !label || !items.length) return;

      toggle.addEventListener('click', () => {
        document.querySelectorAll('[data-component-dropdown].open').forEach((item) => {
          if (item !== dropdown) {
            item.classList.remove('open');
            const otherToggle = item.querySelector('.component-dropdown-toggle');
            if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
          }
        });
        const open = dropdown.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) placeDropdown(dropdown);
      });

      items.forEach((item) => {
        item.addEventListener('click', () => {
          items.forEach((it) => {
            it.classList.remove('selected');
            it.setAttribute('aria-selected', 'false');
          });
          item.classList.add('selected');
          item.setAttribute('aria-selected', 'true');
          label.textContent = item.textContent.trim();
          dropdown.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          showToast('已选择：' + label.textContent, 'info', 'icon-ic_fluent_chevron_down_24_regular');
        });
      });
    });

    const updateOpenDropdownDirection = () => {
      dropdowns.forEach((dropdown) => {
        if (dropdown.classList.contains('open')) placeDropdown(dropdown);
      });
    };

    window.addEventListener('resize', updateOpenDropdownDirection);
    window.addEventListener('scroll', updateOpenDropdownDirection, true);

    document.addEventListener('click', (event) => {
      dropdowns.forEach((dropdown) => {
        if (dropdown.contains(event.target)) return;
        dropdown.classList.remove('open');
        const toggle = dropdown.querySelector('.component-dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function bindMenuHandlers() {
    const rootMenu = document.querySelector('.component-menu');
    if (!rootMenu) return;
    const toggles = rootMenu.querySelectorAll('[data-menu-toggle]');

    const setCurrent = (targetEl) => {
      rootMenu.querySelectorAll('.component-menu-link.current, .component-menu-toggle.current').forEach((item) => item.classList.remove('current'));
      if (targetEl) targetEl.classList.add('current');
    };

    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const item = toggle.closest('.component-menu-item');
        if (!item) return;
        const isOpen = item.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        setCurrent(toggle);
        const label = toggle.textContent ? toggle.textContent.trim() : '菜单';
        showToast((isOpen ? '已展开：' : '已收起：') + label, 'info', 'icon-ic_fluent_panel_left_24_regular');
      });
    });

    rootMenu.querySelectorAll('.component-menu-link').forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href') || '';
        if (href === '#' || href.trim() === '') event.preventDefault();
        setCurrent(link);
        const label = link.textContent ? link.textContent.trim() : '菜单项';
        showToast('已选择：' + label, 'info', 'icon-ic_fluent_checkmark_24_regular');
      });
    });
  }

  function bindRangeValueSync() {
    const range = document.querySelector('[data-range-demo]');
    const value = document.querySelector('[data-range-value]');
    if (!range || !value) return;

    const syncFromRange = () => {
      value.value = range.value;
      updateSliderVisual(range);
    };
    const syncFromValue = () => {
      const min = Number(range.min || 0);
      const max = Number(range.max || 100);
      const raw = Number(value.value);
      const fallback = Number(range.value || min);
      const numeric = Number.isFinite(raw) ? raw : fallback;
      const n = Math.max(min, Math.min(max, numeric));
      range.value = String(n);
      value.value = String(n);
      updateSliderVisual(range);
    };

    range.addEventListener('input', syncFromRange);
    range.addEventListener('change', syncFromRange);
    value.addEventListener('input', syncFromValue);
    value.addEventListener('change', syncFromValue);
    syncFromRange();
  }

  function bindColorfulImmersiveButtons() {
    const buttons = document.querySelectorAll('[data-color-cycle]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const parts = (btn.dataset.colorCycle || '').split('|').filter(Boolean);
        if (!parts.length) return;
        const current = parseInt(btn.dataset.colorIndex || '0', 10) || 0;
        const next = (current + 1) % parts.length;
        const parsed = hexToRgbTuple(parts[next]);
        if (!parsed) return;
        btn.dataset.colorIndex = String(next);
        btn.style.setProperty('--btn-rgb', parsed.rgb);
        markTintFeedback(btn);
      });
    });
  }

  function formatTime(sec) {
    const value = Number(sec) || 0;
    const m = Math.floor(value / 60);
    const s = Math.floor(value % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function bindAudioItem() {
    const audio = document.querySelector('[data-demo-audio]');
    const dock = document.querySelector('[data-audio-dock]');
    const openBtn = document.querySelector('[data-audio-open]');
    const closeBtn = document.querySelector('[data-audio-close]');
    const playBtn = document.querySelector('[data-audio-toggle]');
    const prevBtn = document.querySelector('[data-audio-prev]');
    const nextBtn = document.querySelector('[data-audio-next]');
    const openPageLink = dock.querySelector('a[href*="/media/music.html"]');
    const seek = document.querySelector('[data-audio-seek]');
    const timeEl = document.querySelector('[data-audio-time]');
    const nameEl = document.querySelector('[data-audio-name]');
    if (!audio || !dock || !openBtn || !closeBtn || !playBtn || !seek || !timeEl || !nameEl) return;
    if (openBtn.dataset.boundAudioOpen === 'true') return;
    openBtn.dataset.boundAudioOpen = 'true';

    const tracks = [
      { name: 'MyGO!!!!! - エガクミライ', src: '/resource/aud/MyGO!!!!! - %E3%82%A8%E3%82%AC%E3%82%AF%E3%83%9F%E3%83%A9%E3%82%A4.mp3' },
      { name: 'MyGO!!!!! - エガクミライ (Loop Demo)', src: '/resource/aud/MyGO!!!!! - %E3%82%A8%E3%82%AC%E3%82%AF%E3%83%9F%E3%83%A9%E3%82%A4.mp3' }
    ];
    let currentTrack = 0;
    let isSeeking = false;

    const icon = playBtn.querySelector('i');

    const updatePlayPageLink = (track) => {
      if (!openPageLink || !track) return;
      const params = new URLSearchParams();
      params.set('title', track.name || '未命名音频');
      params.set('author', '组件页');
      params.set('src', track.src || '');
      params.set('cover', '/resource/img/shell/shuiyu.avif');
      openPageLink.href = '/media/music.html?' + params.toString();
    };

    const showDock = () => {
      dock.classList.remove('is-closing');
      dock.classList.add('show');
      dock.setAttribute('aria-hidden', 'false');
    };

    const hideDock = () => {
      dock.classList.remove('show');
      dock.classList.add('is-closing');
      dock.setAttribute('aria-hidden', 'true');
      window.setTimeout(() => {
        dock.classList.remove('is-closing');
      }, 260);
    };

    const setTrack = (index) => {
      currentTrack = (index + tracks.length) % tracks.length;
      const track = tracks[currentTrack];
      audio.src = track.src;
      nameEl.textContent = track.name;
      updatePlayPageLink(track);
      audio.currentTime = 0;
      safePlay(audio);
      updateAudioUi();
    };

    const updateAudioUi = () => {
      const duration = Number(audio.duration) || 0;
      seek.max = String(duration);
      if (!isSeeking) seek.value = String(audio.currentTime || 0);
      timeEl.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
      updateSliderVisual(seek);
      if (icon) {
        icon.className = audio.paused ? 'icon-ic_fluent_play_24_regular' : 'icon-ic_fluent_pause_24_regular';
      }
    };

    openBtn.addEventListener('click', () => {
      showDock();
      safePlay(audio);
      updateAudioUi();
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        setTrack(currentTrack - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        setTrack(currentTrack + 1);
      });
    }

    closeBtn.addEventListener('click', () => {
      audio.pause();
      hideDock();
      isSeeking = false;
      updateAudioUi();
    });

    playBtn.addEventListener('click', () => {
      if (audio.paused) safePlay(audio);
      else audio.pause();
      updateAudioUi();
    });

    seek.addEventListener('pointerdown', () => {
      isSeeking = true;
    });

    seek.addEventListener('touchstart', () => {
      isSeeking = true;
    }, { passive: true });

    seek.addEventListener('input', () => {
      const next = Number(seek.value || 0);
      timeEl.textContent = formatTime(next) + ' / ' + formatTime(audio.duration);
    });

    const commitSeek = () => {
      const duration = Number(audio.duration) || 0;
      if (duration > 0) {
        audio.currentTime = Math.max(0, Math.min(duration, Number(seek.value || 0)));
      }
      isSeeking = false;
      updateAudioUi();
    };

    seek.addEventListener('change', commitSeek);
    seek.addEventListener('pointerup', commitSeek);
    seek.addEventListener('touchend', commitSeek, { passive: true });
    seek.addEventListener('pointercancel', () => {
      isSeeking = false;
      updateAudioUi();
    });

    audio.addEventListener('timeupdate', updateAudioUi);
    audio.addEventListener('loadedmetadata', updateAudioUi);
    audio.addEventListener('play', updateAudioUi);
    audio.addEventListener('pause', updateAudioUi);

    setTrack(0);
    audio.pause();
    updateAudioUi();
  }

  function bindVideoItem() {
    const video = document.querySelector('[data-demo-video]');
    const toggle = document.querySelector('[data-video-toggle]');
    const timeEl = document.querySelector('[data-video-time]');
    const seek = document.querySelector('[data-video-seek]');
    if (!video || !toggle || !timeEl || !seek) return;
    if (video.dataset.boundVideo === 'true') return;
    video.dataset.boundVideo = 'true';

    const icon = toggle.querySelector('i');
    let videoProgressRaf = 0;

    const updateVideoUi = () => {
      seek.max = String(video.duration || 0);
      seek.value = String(video.currentTime || 0);
      timeEl.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
      updateSliderVisual(seek);
      const paused = video.paused;
      if (icon) {
        icon.className = paused ? 'icon-ic_fluent_play_24_regular' : 'icon-ic_fluent_pause_24_regular';
      }
    };

    const stopVideoProgressLoop = () => {
      if (videoProgressRaf) {
        cancelAnimationFrame(videoProgressRaf);
        videoProgressRaf = 0;
      }
    };

    const startVideoProgressLoop = () => {
      if (videoProgressRaf) return;
      const tick = () => {
        updateVideoUi();
        if (!video.paused && !video.ended) {
          videoProgressRaf = requestAnimationFrame(tick);
        } else {
          videoProgressRaf = 0;
        }
      };
      videoProgressRaf = requestAnimationFrame(tick);
    };

    toggle.addEventListener('click', () => {
      if (video.paused) safePlay(video);
      else video.pause();
      updateVideoUi();
    });

    seek.addEventListener('input', () => {
      video.currentTime = Number(seek.value || 0);
      updateVideoUi();
    });

    video.addEventListener('timeupdate', updateVideoUi);
    video.addEventListener('loadedmetadata', updateVideoUi);
    video.addEventListener('play', () => {
      updateVideoUi();
      startVideoProgressLoop();
    });
    video.addEventListener('pause', () => {
      stopVideoProgressLoop();
      updateVideoUi();
    });
    video.addEventListener('ended', () => {
      stopVideoProgressLoop();
      updateVideoUi();
    });
  }

  function bindToastButtons() {
    const buttons = document.querySelectorAll('[data-toast-variant]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const variant = btn.dataset.toastVariant || 'info';
        const message = btn.dataset.toastMessage || '这是一个提示';
        const icon = btn.dataset.toastIcon || 'icon-ic_fluent_info_24_regular';
        const border = btn.dataset.toastBorder || '';
        showToast(message, variant, icon, border);
      });
    });
  }

  function bindGlobalEsc() {
    if (globalEscBound) return;
    globalEscBound = true;
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') hideToast();
    });
  }

  const init = () => {
    const page = document.querySelector('.component-demo-page');
    if (!page) return false;

    const steps = [
      bindTopControls,
      bindSpectrumControls,
      bindCustomColorPanel,
      bindDialogHandlers,
      bindInputHandlers,
      bindSearchHandlers,
      bindFilterHandlers,
      bindDropdownHandlers,
      bindMenuHandlers,
      bindRangeValueSync,
      bindColorfulImmersiveButtons,
      bindAudioItem,
      bindVideoItem,
      bindToastButtons,
      bindRangeVisuals,
      () => updateSearchResults('')
    ];

    const { close: toastClose } = getToastParts();
    if (toastClose && toastClose.dataset.toastCloseBound !== 'true') {
      toastClose.dataset.toastCloseBound = 'true';
      toastClose.addEventListener('click', hideToast);
    }

    bindGlobalEsc();

    steps.forEach((step) => {
      try {
        step();
      } catch (error) {
        console.error('[component-demo] init step failed:', error);
      }
    });
    return true;
  };

  const tryInit = () => {
    if (init()) return;
    window.setTimeout(() => {
      init();
    }, 200);
  };

  let initTimer = null;
  const scheduleInit = () => {
    if (initTimer) window.clearTimeout(initTimer);
    initTimer = window.setTimeout(() => {
      initTimer = null;
      tryInit();
    }, 60);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit, { once: true });
  } else {
    tryInit();
  }

  window.addEventListener('pageshow', tryInit);
  window.addEventListener('hashchange', tryInit);
  window.addEventListener('popstate', tryInit);

  const observer = new MutationObserver(scheduleInit);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.componentToast = { show: showToast, hide: hideToast, applyThemeColor };
})();
