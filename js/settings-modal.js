// 模块：设置弹窗与主题 / Settings modal lifecycle, theme controls, custom colors.
// load control to avoid race when opening/closing rapidly
let __settingsLoadToken = 0; // incrementing token for each open
let __settingsFetchController = null; // AbortController for fetch
let __settingsClearTimeoutId = null; // timeout id used when closing
const SETTINGS_LANG_KEY = 'language';
const DEFAULT_THEME_COLOR = '#33CC99';
const CUSTOM_DEFAULT_COLOR = '#b6b6b6';
const CACHE_BUST = () => 'ts=' + Date.now();

function hslToHex(h, s, l) {
  const sN = s / 100;
  const lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = lN - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex) {
  const cleaned = (hex || '').replace('#', '').trim();
  if (![3, 6].includes(cleaned.length)) return null;
  const full = cleaned.length === 3
    ? cleaned.split('').map(ch => ch + ch).join('')
    : cleaned;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = 60 * (((g - b) / d) % 6);
        break;
      case g:
        h = 60 * ((b - r) / d + 2);
        break;
      default:
        h = 60 * ((r - g) / d + 4);
        break;
    }
  }
  return { h: (h + 360) % 360, s: Math.round(s * 100), l: Math.round(l * 100) };
}

// ���ն��ף�����޷����� includes/setting.html����ʹ�ô�����ģ��
const SETTINGS_FALLBACK_HTML = `
  <title>����</title>
  <section id="lightdarktoggle">
    <h2>ǳɫ/��ɫģʽ�л�</h2>
    <h4>�л�ǳɫģʽ/��ɫģʽ����Ϊ</h4>
    <p>����ϵͳ</p>
    <p>�ֶ�����</p>
  </section>
  <section id="maincolorpicker">
    <h2>�л�����ɫ</h2>
    <h4>ѡ������ɫ��</h4>
    <p data-color="#007DC5">#007DC5</p>
    <p data-color="#33CC99">#33CC99</p>
    <p data-color="#D70040">#D70040</p>
    <p data-color="自定义">自定义</p>
  </section>
  <section id="pageprogress" data-setting="page-progress">
    <h2>ҳ�������</h2>
    <h4>��ҳü�ײ���ʾ��ǰҳ���������</h4>
    <p>�ر�</p>
    <p>����</p>
  </section>
`;

function ensureContainers(){
  if (!document.getElementById('settings-backdrop')){
    const backdrop = document.createElement('div');
    backdrop.id = 'settings-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', closeModal);
  }
  if (!document.getElementById('settings-modal')){
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.innerHTML = '<div class="modal-header"><span class="modal-title"></span><button class="modal-close" aria-label="�ر�"><i class="icon-ic_fluent_dismiss_24_regular"></i></button></div><div class="modal-body"></div>';
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
  }
}

function buildSection(sec){
  const wrapper = document.createElement('section');
  wrapper.className = 'settings-section';

  const left = document.createElement('div');
  left.className = 'section-left';

  const h2 = sec.querySelector('h2');
  if (h2){
    const title = document.createElement('div');
    title.className = 'section-title';
    title.innerHTML = h2.innerHTML;
    left.appendChild(title);
  }

  const h4 = sec.querySelector('h4');
  if (h4){
    const subtitle = document.createElement('div');
    subtitle.className = 'section-subtitle';
    subtitle.innerHTML = h4.innerHTML;
    left.appendChild(subtitle);
  }

  wrapper.appendChild(left);

  const ps = Array.from(sec.querySelectorAll('p'));

  // 专门处理：浅色/深色切换（使用 follow-system 存储键）
  if (sec.id === 'lightdarktoggle') {
    const row = document.createElement('div');
    row.className = 'settings-toggle-row';
    const pContainer = document.createElement('div');
    pContainer.style.margin = '0';
    const pFollow = document.createElement('p');
    const pManual = document.createElement('p');
    // ps[0] / ps[1] 文本来自模板，保持原样
    pFollow.innerHTML = ps[0] ? ps[0].innerHTML : '跟随系统';
    pManual.innerHTML = ps[1] ? ps[1].innerHTML : '手动设置';
    pFollow.style.margin = '0';
    pManual.style.margin = '0';
    pContainer.appendChild(pFollow);
    pContainer.appendChild(pManual);

    const followSystemStr = localStorage.getItem('follow-system');
    const initialActive = followSystemStr === null ? true : followSystemStr === 'true';

    // initialActive === true 表示跟随系统（显示 pFollow）
    pFollow.style.display = initialActive ? '' : 'none';
    pManual.style.display = initialActive ? 'none' : '';

    const toggle = buildToggle((on) => {
      // on 表示跟随系统
      pFollow.style.display = on ? '' : 'none';
      pManual.style.display = on ? 'none' : '';
      try { localStorage.setItem('follow-system', on ? 'true' : 'false'); } catch(e) {}
      document.dispatchEvent(new CustomEvent('follow-system-changed', { detail: { fromModal: true } }));
    }, initialActive);

    row.appendChild(pContainer);
    row.appendChild(toggle);
    wrapper.appendChild(row);
    return wrapper;
  }

  if (sec.id === 'maincolorpicker') {
    try {
      const row = document.createElement('div');
      row.className = 'color-picker-row';
      const currentThemeColor = localStorage.getItem('theme-color') || DEFAULT_THEME_COLOR;

      const swatchColors = ['#007DC5','#33CC99','#D70040','#F59E0B','#7C3AED'];
      let customOption = null;
      let customCore = null;
      let customPanel = null;
      let hexInput = null;
      // expose sliders/preview so main row clicks can update the open panel
      let hueSlider = null;
      let satSlider = null;
      let lightSlider = null;
      let preview = null;
      let syncFromHslFn = null;

      function closeCustomPanel(){
        if (customPanel) customPanel.remove();
        customPanel = null;
        hexInput = null;
        hueSlider = null;
        satSlider = null;
        lightSlider = null;
        preview = null;
        syncFromHslFn = null;
      }

      function markSelected(opt){
        row.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      }

      function resetCustomCore(){
        if (customCore) customCore.style.backgroundColor = CUSTOM_DEFAULT_COLOR;
      }

      function applyColor(color, fromCustom){
        applyThemeColor(color);
        localStorage.setItem('theme-color', color);
        if (fromCustom && customCore) {
          customCore.style.backgroundColor = color;
          markSelected(customOption);
        } else {
          resetCustomCore();
        }
      }

      function buildCustomPanel(){
        const panel = document.createElement('div');
        panel.className = 'color-floating-panel';

        const header = document.createElement('div');
        header.className = 'color-panel-header';
        header.textContent = '自定义颜色';

        preview = document.createElement('div');
        preview.className = 'color-preview';

        const hueRow = document.createElement('div');
        hueRow.className = 'color-slider-row';
        const hueLabel = document.createElement('span');
        hueLabel.textContent = '色相';
        hueSlider = document.createElement('input');
        hueSlider.type = 'range';
        hueSlider.className = 'color-slider color-hue';
        hueSlider.min = '0';
        hueSlider.max = '360';

        const satRow = document.createElement('div');
        satRow.className = 'color-slider-row';
        const satLabel = document.createElement('span');
        satLabel.textContent = '饱和';
        satSlider = document.createElement('input');
        satSlider.type = 'range';
        satSlider.className = 'color-slider color-sat';
        satSlider.min = '0';
        satSlider.max = '100';

        const lightRow = document.createElement('div');
        lightRow.className = 'color-slider-row';
        const lightLabel = document.createElement('span');
        lightLabel.textContent = '明度';
        lightSlider = document.createElement('input');
        lightSlider.type = 'range';
        lightSlider.className = 'color-slider color-light';
        lightSlider.min = '0';
        lightSlider.max = '100';

        const hsl = hexToHsl(currentThemeColor) || { h: 160, s: 60, l: 50 };
        hueSlider.value = hsl.h;
        satSlider.value = hsl.s;
        lightSlider.value = hsl.l;

        const updateSlidersBg = () => {
          const hueColor = hslToHex(parseFloat(hueSlider.value), 100, 50);
          satSlider.style.background = `linear-gradient(to right, #808080 0%, ${hueColor} 100%)`;
          lightSlider.style.background = `linear-gradient(to right, #000000 0%, ${hslToHex(parseFloat(hueSlider.value), parseFloat(satSlider.value), 50)} 50%, #ffffff 100%)`;
        };

        const syncFromHsl = () => {
          const hex = hslToHex(parseFloat(hueSlider.value), parseFloat(satSlider.value), parseFloat(lightSlider.value));
          preview.style.backgroundColor = hex;
          if (hexInput) hexInput.value = hex;
          updateSlidersBg();
        };

        // expose sync function for external updates
        syncFromHslFn = syncFromHsl;

        hueSlider.addEventListener('input', syncFromHsl);
        satSlider.addEventListener('input', syncFromHsl);
        lightSlider.addEventListener('input', syncFromHsl);

        updateSlidersBg();

        hueRow.appendChild(hueLabel);
        hueRow.appendChild(hueSlider);
        satRow.appendChild(satLabel);
        satRow.appendChild(satSlider);
        lightRow.appendChild(lightLabel);
        lightRow.appendChild(lightSlider);

        const grid = document.createElement('div');
        grid.className = 'color-swatch-grid';
        swatchColors.forEach(c => {
          const s = document.createElement('div');
          s.className = 'color-swatch';
          s.style.backgroundColor = c;
          s.addEventListener('click', ()=>{
            if (hexInput) hexInput.value = c;
            const pickedHsl = hexToHsl(c);
            if (pickedHsl && typeof syncFromHslFn === 'function') {
              hueSlider.value = pickedHsl.h;
              satSlider.value = pickedHsl.s;
              lightSlider.value = pickedHsl.l;
              syncFromHslFn();
            }
            applyColor(c, true);
            closeCustomPanel();
          });
          grid.appendChild(s);
        });

        const actions = document.createElement('div');
        actions.className = 'color-custom-actions';
        hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.className = 'color-hex-input';
        hexInput.placeholder = '#RRGGBB 或 #RGB';
        hexInput.value = currentThemeColor;

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'color-apply-btn';
        applyBtn.textContent = '确定';
        applyBtn.addEventListener('click', ()=>{
          const val = (hexInput.value || '').trim();
          if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(val)) {
            hexInput.focus();
            return;
          }
          applyColor(val, true);
          closeCustomPanel();
        });

        actions.appendChild(hexInput);
        actions.appendChild(applyBtn);

        panel.appendChild(header);
        panel.appendChild(preview);
        panel.appendChild(hueRow);
        panel.appendChild(satRow);
        panel.appendChild(lightRow);
        panel.appendChild(grid);
        panel.appendChild(actions);

        syncFromHsl();
        return panel;
      }

      function toggleCustomPanel(){
        if (customPanel) {
          closeCustomPanel();
          return;
        }
        customPanel = buildCustomPanel();
        row.after(customPanel);
        if (hexInput) hexInput.focus();
      }

      ps.forEach(p => {
        const color = p.getAttribute('data-color');
        if (!color) return;
        const isCustom = color === '自定义';
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option' + (isCustom ? ' custom' : '');
        const core = document.createElement('div');
        core.className = 'color-core';
        if (isCustom) {
          core.style.backgroundColor = CUSTOM_DEFAULT_COLOR;
          const icon = document.createElement('i');
          // 使用 Fluent System Icons 的 edit 图标类，保留 fluent-icon 以应用字体族
          icon.className = 'fluent-icon icon-ic_fluent_edit_24_regular';
          core.appendChild(icon);
          customOption = colorOption;
          customCore = core;
        } else {
          core.style.backgroundColor = color;
        }
        colorOption.appendChild(core);
        colorOption.setAttribute('data-color', color);

        if (!isCustom && color.toLowerCase() === currentThemeColor.toLowerCase()) {
          markSelected(colorOption);
        }

        colorOption.addEventListener('click', () => {
          if (isCustom) {
            markSelected(colorOption);
            toggleCustomPanel();
            return;
          }
          core.classList.remove('click-anim');
          void core.offsetWidth; // restart animation
          core.classList.add('click-anim');
          markSelected(colorOption);
          // If custom panel is open, update its input and sliders instead of closing it
          if (customPanel) {
            if (hexInput) hexInput.value = color;
            const picked = hexToHsl(color);
            if (picked && typeof syncFromHslFn === 'function') {
              hueSlider.value = picked.h;
              satSlider.value = picked.s;
              lightSlider.value = picked.l;
              syncFromHslFn();
            }
            applyColor(color, false);
            return;
          }
          // ensure panel closed when not interacting with it
          closeCustomPanel();
          applyColor(color, false);
        });

        row.appendChild(colorOption);
      });

      const presetColors = new Set(ps.map(p => p.getAttribute('data-color')).filter(c => c && c !== '自定义').map(c => c.toLowerCase()));
      if (customOption && customCore && !presetColors.has(currentThemeColor.toLowerCase())) {
        customCore.style.backgroundColor = currentThemeColor;
        markSelected(customOption);
      }

      wrapper.appendChild(row);
    } catch (err) {
      console.error('[Settings Modal] color section render failed, using simple presets', err);
      const row = document.createElement('div');
      row.className = 'color-picker-row';
      const current = localStorage.getItem('theme-color') || DEFAULT_THEME_COLOR;
      ps.forEach(p => {
        const color = p.getAttribute('data-color');
        if (!color || color === '自定义') return;
        const opt = document.createElement('div');
        opt.className = 'color-option';
        const core = document.createElement('div');
        core.className = 'color-core';
        core.style.backgroundColor = color;
        opt.appendChild(core);
        if (color.toLowerCase() === current.toLowerCase()) opt.classList.add('selected');
        opt.addEventListener('click', ()=>{
          row.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          localStorage.setItem('theme-color', color);
          applyThemeColor(color);
        });
        row.appendChild(opt);
      });
      wrapper.appendChild(row);
    }
  } else if (sec.dataset && sec.dataset.setting === 'page-progress') {
    const row = document.createElement('div');
    row.className = 'settings-toggle-row';
    const pContainer = document.createElement('div');
    pContainer.style.margin = '0';
    const pOn = document.createElement('p');
    const pOff = document.createElement('p');
    const psAll = sec.querySelectorAll('p');
    pOn.innerHTML = psAll[1] ? psAll[1].innerHTML : '����';
    pOff.innerHTML = psAll[0] ? psAll[0].innerHTML : '�ر�';
    pOn.style.margin = '0';
    pOff.style.margin = '0';
    pContainer.appendChild(pOn);
    pContainer.appendChild(pOff);

    const storedPageProgress = localStorage.getItem('show-page-progress');
    const initialActive = storedPageProgress === null ? true : storedPageProgress === 'true';
    pOn.style.display = initialActive ? '' : 'none';
    pOff.style.display = initialActive ? 'none' : '';

    const toggle = buildToggle((on) => {
      pOn.style.display = on ? '' : 'none';
      pOff.style.display = on ? 'none' : '';
      localStorage.setItem('show-page-progress', on ? 'true' : 'false');
      document.dispatchEvent(new CustomEvent('page-progress-toggled', { detail: { enabled: on } }));
    }, initialActive);

    row.appendChild(pContainer);
    row.appendChild(toggle);
    wrapper.appendChild(row);
  } else if (ps.length === 1) {
    const row = document.createElement('div');
    row.className = 'settings-toggle-row';
    const p = document.createElement('p');
    p.innerHTML = ps[0].innerHTML;
    p.style.margin = '0';
    const alt = ps[0].getAttribute('data-alt');
    const toggle = buildToggle((on)=>{
      if (alt){
        p.textContent = on ? alt : ps[0].textContent;
      }
    });
    row.appendChild(p);
    row.appendChild(toggle);
    wrapper.appendChild(row);
  } else if (ps.length >= 2) {
    // If exactly two <p> items, render using the same toggle UI as `page-progress`
    if (ps.length === 2) {
      const row = document.createElement('div');
      row.className = 'settings-toggle-row';
      const pContainer = document.createElement('div');
      pContainer.style.margin = '0';
      const pOn = document.createElement('p');
      const pOff = document.createElement('p');
      pOn.innerHTML = ps[1] ? ps[1].innerHTML : ps[0].innerHTML;
      pOff.innerHTML = ps[0] ? ps[0].innerHTML : '';
      pOn.style.margin = '0';
      pOff.style.margin = '0';
      pContainer.appendChild(pOff);
      pContainer.appendChild(pOn);

      const key = `setting-${sec.id || 'unknown'}`;
      const stored = localStorage.getItem(key);
      const initialActive = stored === null ? true : stored === 'true';

      pOn.style.display = initialActive ? '' : 'none';
      pOff.style.display = initialActive ? 'none' : '';

      const toggle = buildToggle((on) => {
        pOn.style.display = on ? '' : 'none';
        pOff.style.display = on ? 'none' : '';
        try { localStorage.setItem(key, on ? 'true' : 'false'); } catch(e) {}
        document.dispatchEvent(new CustomEvent('setting-changed', { detail: { id: sec.id, index: on ? 1 : 0, text: on ? ps[1].textContent : ps[0].textContent } }));
      }, initialActive);

      row.appendChild(pContainer);
      row.appendChild(toggle);
      wrapper.appendChild(row);
      return wrapper;
    }
    // If the p elements mostly represent named options (not hex colors), render a dropdown list
    const isHex = (t) => {
      if (!t) return false;
      const v = (t.getAttribute && t.getAttribute('data-color')) || t.textContent || '';
      return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
    };

    const nonHexCount = ps.reduce((acc, p) => acc + (isHex(p) ? 0 : 1), 0);

    if (nonHexCount >= 2) {
      const row = document.createElement('div');
      row.className = 'settings-dropdown';

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'settings-dropdown-toggle';
      const label = document.createElement('span');
      label.className = 'toggle-label';
      label.textContent = ps[0].textContent || '';
      const icon = document.createElement('i');
      icon.className = 'toggle-icon icon-ic_fluent_chevron_right_24_regular';
      icon.setAttribute('aria-hidden', 'true');
      toggleBtn.appendChild(label);
      toggleBtn.appendChild(icon);

      const list = document.createElement('div');
      list.className = 'settings-dropdown-list';

      // Create portal container appended to body so it floats above the modal
      const portal = document.createElement('div');
      portal.className = 'settings-dropdown-portal hidden';
      portal.appendChild(list);
      document.body.appendChild(portal);

      // determine stored selection index (if any)
      const storageKey = `setting-${sec.id || 'unknown'}`;
      let storedIdx = null;
      try { storedIdx = parseInt(localStorage.getItem(storageKey), 10); } catch(e) { storedIdx = null; }

      ps.forEach((p, idx) => {
        const text = p.textContent || '';
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = text;
        // highlight if it's the stored selection
        if (!Number.isNaN(storedIdx) && storedIdx === idx) item.classList.add('selected');
        item.addEventListener('click', () => {
          // click animation
          item.classList.remove('click-anim');
          void item.offsetWidth; // reflow to restart animation
          item.classList.add('click-anim');
          item.addEventListener('animationend', function _once(){ item.classList.remove('click-anim'); item.removeEventListener('animationend', _once); });
          // store selection by index under a key derived from section id
          const key = storageKey;
          localStorage.setItem(key, String(idx));
          label.textContent = text;
          // update visual selection
          list.querySelectorAll('.dropdown-item').forEach(it => it.classList.remove('selected'));
          item.classList.add('selected');
          // collapse after select
          collapseDropdown();
          // dispatch change event
          document.dispatchEvent(new CustomEvent('setting-changed', { detail: { id: sec.id, index: idx, text } }));
        });
        list.appendChild(item);
      });

      function positionPortal(e){
        // position portal under the toggleBtn (align left by default)
        const rect = toggleBtn.getBoundingClientRect();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const minW = 160, maxW = 520; // allow wider portal for long labels

        // Only recompute width on first layout or on resize events.
        // Avoid recomputing on scroll to prevent scroll-triggered width/jump.
        const isResizeEvent = e && e.type === 'resize';
        if (isResizeEvent || !portal.dataset.widthComputed) {
          // Compute content width conservatively: find max scrollWidth of items
          const items = list.querySelectorAll('.dropdown-item');
          let maxItemW = rect.width;
          items.forEach(it => {
            try { maxItemW = Math.max(maxItemW, Math.ceil(it.scrollWidth)); } catch (err) {}
          });
          // Add padding so text has breathing room
          const contentW = maxItemW + 24;
          // clamp to min/max and viewport to avoid single long token stretching panel
          let portalW = Math.min(maxW, Math.max(minW, contentW));
          portalW = Math.min(portalW, viewportW - 16);
          portal.style.width = portalW + 'px';
          portal.dataset.widthComputed = '1';
        }

        // measure portal height after width applied
        const portalH = portal.offsetHeight || 240;
        const gap = 8;
        const spaceBelow = viewportH - rect.bottom;
        const preferBelow = spaceBelow > portalH + gap || rect.top < 120;

        // compute left: prefer aligning with toggle left, but clamp to viewport
        // read computed width to clamp left correctly
        const portalWcur = parseInt(portal.style.width, 10) || Math.min(Math.max(160, Math.ceil(list.scrollWidth || rect.width) + 24), viewportW - 16);
        let left = rect.left;
        const maxLeft = Math.max(8, viewportW - portalWcur - 8);
        left = Math.min(Math.max(8, left), maxLeft);
        portal.style.left = left + 'px';

        if (preferBelow) {
          portal.style.top = Math.min(viewportH - portalH - 8, rect.bottom + gap) + 'px';
        } else {
          portal.style.top = Math.max(8, rect.top - portalH - gap) + 'px';
        }
      }

      function expandDropdown(){
        row.classList.add('open');
        list.classList.add('open');
        portal.classList.remove('hidden');
        // ensure portal visible then measure
        portal.style.maxHeight = '';
        // allow width recomputation on open
        delete portal.dataset.widthComputed;
        // let portal width adapt to content before measurement
        portal.style.width = '';
        // compute available height to avoid portal bottom overflow; if limited, allow scrolling
        const rect = toggleBtn.getBoundingClientRect();
        const gap = 8;
        const portalPadding = 12; // portal vertical padding
        const viewportH = window.innerHeight;
        const preferBelow = (viewportH - rect.bottom) > 120 || rect.top < 120;
        let availableHeight = 0;
        if (preferBelow) {
          availableHeight = Math.max(80, viewportH - rect.bottom - gap - portalPadding - 16);
        } else {
          availableHeight = Math.max(80, rect.top - gap - portalPadding - 16);
        }
        const targetH = Math.min(list.scrollHeight, availableHeight);
        list.style.maxHeight = targetH + 'px';
        if (list.scrollHeight > targetH) {
          list.classList.add('scrollable');
        } else {
          list.classList.remove('scrollable');
        }
        // set CSS variable to control rotation only (keep translateY from CSS)
        toggleBtn.style.setProperty('--toggle-rotate', '90deg');
        positionPortal();
        // bind outside click and resize/scroll handlers
        window.addEventListener('click', outsideClickHandler);
        window.addEventListener('resize', outsideCloseHandler);
        window.addEventListener('scroll', outsideCloseHandler, true);
        // reposition on resize/scroll while open
        window.addEventListener('resize', positionPortal);
        window.addEventListener('scroll', positionPortal, true);
        opened = true;
      }
      function collapseDropdown(){
        row.classList.remove('open');
        list.classList.remove('open');
        list.style.maxHeight = '0px';
        toggleBtn.style.setProperty('--toggle-rotate', '-90deg');
        portal.classList.add('hidden');
        // clear computed flag so future opens can recompute width
        delete portal.dataset.widthComputed;
        window.removeEventListener('click', outsideClickHandler);
        window.removeEventListener('resize', outsideCloseHandler);
        window.removeEventListener('scroll', outsideCloseHandler, true);
        window.removeEventListener('resize', positionPortal);
        window.removeEventListener('scroll', positionPortal, true);
        opened = false;
      }

      function outsideClickHandler(e){
        if (!portal.contains(e.target) && !toggleBtn.contains(e.target)) collapseDropdown();
      }
      function outsideCloseHandler(e){
        // If the scroll event originated from inside the portal (or toggle), ignore it
        try {
          if (e && portal && (portal.contains(e.target) || toggleBtn.contains(e.target))) return;
        } catch (err) {}
        collapseDropdown();
      }

      let opened = false;
      toggleBtn.addEventListener('click', () => {
        const isOpen = row.classList.contains('open');
        if (!isOpen) {
          expandDropdown();
        } else {
          collapseDropdown();
        }
      });

      // restore stored selection
      try {
        const key = `setting-${sec.id || 'unknown'}`;
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          const idx = parseInt(stored, 10);
          if (!Number.isNaN(idx) && ps[idx]) label.textContent = ps[idx].textContent;
        }
      } catch (e) {}

      row.appendChild(toggleBtn);
      // list is appended to portal; ensure portal cleaned when modal closes
      const cleanupPortal = ()=>{ try{ portal.remove(); }catch(e){} };
      // remove portal when modal is closed
      document.addEventListener('close-settings-modal', cleanupPortal, { once: true });
      // also remove when DOM unloads
      window.addEventListener('unload', cleanupPortal);
      wrapper.appendChild(row);
      wrapper.appendChild(row);
    } else {
      // fallback to old two-option toggle behavior (follow-system style)
      const row = document.createElement('div');
      row.className = 'settings-toggle-row';
      const pContainer = document.createElement('div');
      pContainer.style.margin = '0';
      const p1 = document.createElement('p');
      const p2 = document.createElement('p');
      p1.innerHTML = ps[0].innerHTML;
      p2.innerHTML = ps[1].innerHTML;
      p1.style.margin = '0';
      p2.style.margin = '0';
      pContainer.appendChild(p1);
      pContainer.appendChild(p2);

      const followSystemStr = localStorage.getItem('follow-system');
      // follow-system === 'true' 表示跟随系统（p1 显示为跟随系统）
      const initialActive = followSystemStr === null ? true : followSystemStr === 'true';

      // p1 = 跟随系统, p2 = 手动设置
      p1.style.display = initialActive ? '' : 'none';
      p2.style.display = initialActive ? 'none' : '';

      const toggle = buildToggle((on)=>{
        // on 表示跟随系统
        p1.style.display = on ? '' : 'none';
        p2.style.display = on ? 'none' : '';
        localStorage.setItem('follow-system', on ? 'true' : 'false');
        document.dispatchEvent(new CustomEvent('follow-system-changed', { detail: { fromModal: true } }));
      }, initialActive);

      row.appendChild(pContainer);
      row.appendChild(toggle);
      wrapper.appendChild(row);
    }
  } else {
    const content = document.createElement('div');
    [...sec.children].forEach(ch => {
      if (ch.tagName.toLowerCase() !== 'h2' && ch.tagName.toLowerCase() !== 'h4'){
        content.appendChild(ch.cloneNode(true));
      }
    });
    wrapper.appendChild(content);
  }

  return wrapper;
}

function buildToggle(onChange, initialState){
  const el = document.createElement('div');
  el.className = 'toggle-switch';
  const knob = document.createElement('div');
  knob.className = 'knob';
  el.appendChild(knob);
  let active = initialState || false;
  
  if (active) {
    el.classList.add('active');
  }
  
  const update = ()=>{
    el.classList.toggle('active', active);
    onChange && onChange(active);
  };

  update();
  
  el.addEventListener('click', ()=>{ 
    active = !active; 
    update(); 
  });
  
  return el;
}

function applyThemeColor(color) {
  document.documentElement.style.setProperty('--primary-color', color);

  try {
    const hex = (color || '').replace('#', '').trim();
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      document.documentElement.style.setProperty('--primary-color-rgb', `${r},${g},${b}`);
    } else if (hex.length === 6) {
      const r = parseInt(hex.substring(0,2), 16);
      const g = parseInt(hex.substring(2,4), 16);
      const b = parseInt(hex.substring(4,6), 16);
      document.documentElement.style.setProperty('--primary-color-rgb', `${r},${g},${b}`);
    }
  } catch (e) {
    // ignore parse errors
  }

  document.dispatchEvent(new CustomEvent('theme-color-changed', { detail: { color } }));
}

function showModal(){
  const backdrop = document.getElementById('settings-backdrop');
  const modal = document.getElementById('settings-modal');
  if (backdrop) backdrop.classList.add('show');
  if (modal) modal.classList.add('show');
}

function closeModal(){
  const b = document.getElementById('settings-backdrop');
  const m = document.getElementById('settings-modal');
  __settingsLoadToken += 1;

  if (__settingsFetchController) {
    try { __settingsFetchController.abort(); } catch (e) {}
    __settingsFetchController = null;
  }

  if (b) b.classList.remove('show');
  if (m) {
    m.classList.remove('show');
    if (__settingsClearTimeoutId) clearTimeout(__settingsClearTimeoutId);
    __settingsClearTimeoutId = setTimeout(()=>{
      const body = m.querySelector('.modal-body');
      if (body) body.innerHTML = '';
      __settingsClearTimeoutId = null;
    }, 200);
  }
}

async function openModal(){
  ensureContainers();

  __settingsLoadToken += 1;
  const myToken = __settingsLoadToken;
  if (__settingsFetchController) {
    try { __settingsFetchController.abort(); } catch (e) {}
    __settingsFetchController = null;
  }
  if (__settingsClearTimeoutId) {
    clearTimeout(__settingsClearTimeoutId);
    __settingsClearTimeoutId = null;
  }

  const body = document.querySelector('#settings-modal .modal-body');
  if (body) {
    body.innerHTML = '<div class="settings-loading">���ڼ���������</div>';
  }
  showModal();

  const minVisibleMs = 40;
  const minVisible = new Promise(resolve => setTimeout(resolve, minVisibleMs));

  const stillValid = () => myToken === __settingsLoadToken;

  const buildSettingUrls = () => {
    const candidates = ['includes/setting.html', '../includes/setting.html', '../../includes/setting.html', '../../../includes/setting.html'];
    const resolved = candidates.map(p => {
      try { return new URL(p, location.href).href; } catch (_) { return null; }
    }).filter(Boolean);
    return [...new Set(resolved)];
  };

  const withBust = (url) => {
    if (!url) return url;
    return url + (url.includes('?') ? '&' : '?') + CACHE_BUST();
  };

  const tryLoad = async (url) => {
    const target = withBust(url);
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', target, false);
      xhr.send(null);
      if (xhr.status === 200 || xhr.status === 0) {
        return xhr.responseText;
      }
    } catch (err) {
      console.warn('[Settings Modal] XHR load failed, will try fetch', err);
    }

    __settingsFetchController = new AbortController();
    const resp = await fetch(target, { cache: 'no-store', signal: __settingsFetchController.signal });
    if (!resp.ok) throw new Error('fetch failed');
    return resp.text();
  };

  const fetchSettingsMarkup = async () => {
    const urls = buildSettingUrls();
    let lastErr = null;
    for (const url of urls) {
      try {
        const text = await tryLoad(url);
        if (text) return text;
      } catch (e) {
        lastErr = e;
      }
    }
    if (lastErr) console.warn('[Settings Modal] fallback to built-in settings, last error:', lastErr);
    return SETTINGS_FALLBACK_HTML;
  };

  const resolveLang = () => {
    const saved = localStorage.getItem(SETTINGS_LANG_KEY) || document.documentElement.lang || 'zh-CN';
    if (typeof translations !== 'undefined' && translations[saved]) return saved;
    return 'zh-CN';
  };

  const applySettingsTranslations = (container) => {
    if (typeof translations === 'undefined') return;
    const lang = resolveLang();
    const t = translations[lang] && translations[lang].settings;
    if (!t) return;

    const titleEl = container.querySelector('title');
    if (titleEl && t.title) titleEl.textContent = t.title;

    const light = container.querySelector('#lightdarktoggle');
    if (light && t.lightdark) {
      const h2 = light.querySelector('h2');
      const h4 = light.querySelector('h4');
      const ps = light.querySelectorAll('p');
      if (h2 && t.lightdark.title) h2.textContent = t.lightdark.title;
      if (h4 && t.lightdark.subtitle) h4.textContent = t.lightdark.subtitle;
      if (ps[0] && t.lightdark.follow) ps[0].textContent = t.lightdark.follow;
      if (ps[1] && t.lightdark.manual) ps[1].textContent = t.lightdark.manual;
    }

    const color = container.querySelector('#maincolorpicker');
    if (color && t.color) {
      const h2 = color.querySelector('h2');
      const h4 = color.querySelector('h4');
      if (h2 && t.color.title) h2.textContent = t.color.title;
      if (h4 && t.color.subtitle) h4.textContent = t.color.subtitle;
    }

    const prog = container.querySelector('#pageprogress');
    if (prog && t.pageProgress) {
      const h2 = prog.querySelector('h2');
      const h4 = prog.querySelector('h4');
      const ps = prog.querySelectorAll('p');
      if (h2 && t.pageProgress.title) h2.textContent = t.pageProgress.title;
      if (h4 && t.pageProgress.subtitle) h4.textContent = t.pageProgress.subtitle;
      if (ps[0] && t.pageProgress.off) ps[0].textContent = t.pageProgress.off;
      if (ps[1] && t.pageProgress.on) ps[1].textContent = t.pageProgress.on;
    }

    const particle = container.querySelector('#particleanimation');
    if (particle && t.particleAnimation) {
      const h2 = particle.querySelector('h2');
      const h4 = particle.querySelector('h4');
      const ps = particle.querySelectorAll('p');
      if (h2 && t.particleAnimation.title) h2.textContent = t.particleAnimation.title;
      if (h4 && t.particleAnimation.subtitle) h4.textContent = t.particleAnimation.subtitle;
      if (ps && ps.length && Array.isArray(t.particleAnimation.options)) {
        for (let i = 0; i < ps.length && i < t.particleAnimation.options.length; i++) {
          ps[i].textContent = t.particleAnimation.options[i];
        }
      }
    }
  };

  try {
    const markup = await fetchSettingsMarkup();
    if (!stillValid()) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = markup;
    applySettingsTranslations(tmp);
    const titleEl = tmp.querySelector('title');
    const title = titleEl ? titleEl.textContent.trim() : '����';
    document.querySelector('#settings-modal .modal-title').textContent = title;
    await minVisible;
    if (!stillValid()) return;
    body.innerHTML = '';
    const sections = tmp.querySelectorAll('section');
    if (sections.length === 0) throw new Error('no sections');
    try {
      sections.forEach(sec => body.appendChild(buildSection(sec)));
    } catch (e) {
      console.error('[Settings Modal] render error, fallback to built-in template', e);
      const fallback = document.createElement('div');
      fallback.innerHTML = SETTINGS_FALLBACK_HTML;
      const fbSections = fallback.querySelectorAll('section');
      body.innerHTML = '';
      fbSections.forEach(sec => body.appendChild(buildSection(sec)));
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    console.error('[Settings Modal] Error loading settings:', e);
    if (body) body.innerHTML = '<div class="settings-loading">���ڼ��������ʧ�ܣ�</div>';
  } finally {
    __settingsFetchController = null;
  }
}

document.addEventListener('open-settings-modal', () => openModal());
document.addEventListener('close-settings-modal', () => closeModal());

// Particle setting: listen for changes and initialize
document.addEventListener('setting-changed', (e) => {
  try {
    const d = e.detail || {};
    if (d && d.id === 'particleanimation') {
      const idx = Number(localStorage.getItem('setting-particleanimation')) || 0;
      const ensureParticles = (cb) => {
        if (window.Particles) return cb();
        const s = document.createElement('script');
        s.src = 'js/particles.js';
        s.defer = true;
        s.onload = cb;
        s.onerror = () => cb();
        document.head.appendChild(s);
      };
      ensureParticles(() => {
        if (window.Particles) {
          if (idx && idx > 0) window.Particles.enable(idx);
          else window.Particles.disable();
        }
      });
    }
  } catch (err) {}
});

// initialize particle system from stored value on load
try {
  window.addEventListener('DOMContentLoaded', () => {
    try {
      const idx = Number(localStorage.getItem('setting-particleanimation')) || 0;
      if (idx && idx > 0) {
        const s = document.createElement('script');
        s.src = 'js/particles.js';
        s.defer = true;
        s.onload = () => { try{ if (window.Particles) window.Particles.enable(idx); } catch(e){} };
        s.onerror = () => {};
        document.head.appendChild(s);
      }
    } catch (e) {}
  });
} catch (e) {}

document.addEventListener('follow-system-changed', (e) => {
  if (e.detail && e.detail.fromModal) {
    return;
  }
  
  const modal = document.getElementById('settings-modal');
  if (modal && modal.classList.contains('show')) {
    const body = modal.querySelector('.modal-body');
    if (body) {
      const template = document.getElementById('settings-template');
      if (template) {
        body.innerHTML = '';
        const content = template.content.cloneNode(true);
        const sections = content.querySelectorAll('section');
        sections.forEach(sec => body.appendChild(buildSection(sec)));
      }
    }
  }
});

window.closeSettingsModal = closeModal;

document.addEventListener('DOMContentLoaded', () => {
  const savedColor = localStorage.getItem('theme-color');
  const colorToUse = savedColor || DEFAULT_THEME_COLOR;
  if (!savedColor) {
    localStorage.setItem('theme-color', colorToUse);
  }
  applyThemeColor(colorToUse);
});
