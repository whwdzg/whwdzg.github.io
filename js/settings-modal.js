// 模块：设置弹窗与主题 / Settings modal lifecycle, theme controls, custom colors.
// load control to avoid race when opening/closing rapidly
let __settingsLoadToken = 0; // incrementing token for each open
let __settingsFetchController = null; // AbortController for fetch
let __settingsClearTimeoutId = null; // timeout id used when closing
const SETTINGS_LANG_KEY = 'language';
const DEFAULT_THEME_COLOR = '#33CC99';
const CUSTOM_DEFAULT_COLOR = '#b6b6b6';
const CACHE_BUST = () => 'ts=' + Date.now();
const SETTINGS_URL_CANDIDATES = ['includes/setting.html', '../includes/setting.html', '../../includes/setting.html', '../../../includes/setting.html'];
let __settingsTemplateHtml = null; // in-memory cache of fetched template
let __settingsTemplatePromise = null; // inflight promise to avoid duplicate fetches

const getTranslationsMap = () => {
  return (typeof window !== 'undefined' && window.__translations) || (typeof translations !== 'undefined' ? translations : null);
};

function resolveSettingsLang(map) {
  const saved = localStorage.getItem(SETTINGS_LANG_KEY) || document.documentElement.lang || 'zh-CN';
  if (map && map[saved]) return saved;
  return 'zh-CN';
}

function getSettingsStrings() {
  const map = getTranslationsMap();
  if (!map) return null;
  const lang = resolveSettingsLang(map);
  const settings = map[lang] && map[lang].settings;
  return settings || null;
}

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

// Fallback markup: used when includes/setting.html cannot be loaded
const SETTINGS_FALLBACK_HTML = `
  <title>设置</title>
  <section id="lightdarktoggle" data-setting="follow-system">
    <h2>浅色/深色模式切换</h2>
    <h4>切换浅色模式/深色模式的行为</h4>
    <p>跟随系统</p>
    <p>手动设置</p>
  </section>
  <section id="maincolorpicker">
    <h2>切换主题色</h2>
    <h4>选择主题色标</h4>
    <p data-color="#007DC5">#007DC5</p>
    <p data-color="#33CC99">#33CC99</p>
    <p data-color="#F50000">#F50000</p>
    <p data-color="自定义">自定义</p>
  </section>
  <section id="pageprogress" data-setting="page-progress">
    <h2>页面进度条</h2>
    <h4>在页眉底部显示当前页面滚动进度</h4>
    <p>关闭</p>
    <p>开启</p>
  </section>
  <section id="particleanimation" data-setting="particle-animation">
    <h2>粒子动画</h2>
    <h4>在页面上显示粒子动画</h4>
    <p>关闭</p>
    <p>樱花</p>
    <p>落叶梧桐</p>
    <p>落叶银杏</p>
    <p>雪花</p>
  </section>
  <section id="clear-page-cache">
    <h2>清除页面缓存</h2>
    <h4>清除本地页面缓存，以确保页面为最新，一般情况不建议使用</h4>
    <button type="button">清除</button>
  </section>
`;

const DEFAULT_CATEGORY_TITLES = {
  personalization: '个性化',
  technical: '技术性',
  about: '关于'
};

const SECTION_ICON_MAP = {
  lightdarktoggle: 'icon-ic_fluent_brightness_high_24_regular',
  maincolorpicker: 'icon-ic_fluent_color_line_24_regular',
  pageprogress: 'icon-ic_fluent_chart_multiple_24_regular',
  'page-progress': 'icon-ic_fluent_chart_multiple_24_regular',
  particleanimation: 'icon-ic_fluent_sparkle_24_regular',
  'clear-page-cache': 'icon-ic_fluent_delete_24_regular',
  'settings-about-browserUA': 'icon-ic_fluent_window_24_regular',
  'settings-about-currentTime': 'icon-ic_fluent_timer_24_regular',
  'settings-about-siteVersion': 'icon-ic_fluent_code_24_regular',
  default: 'icon-ic_fluent_settings_24_regular'
};

function getSectionIconClass(sec) {
  if (!sec) return SECTION_ICON_MAP.default;
  const candidates = [sec.id, (sec.dataset && sec.dataset.setting)];
  for (const key of candidates) {
    if (key && SECTION_ICON_MAP[key]) return SECTION_ICON_MAP[key];
  }
  return SECTION_ICON_MAP.default;
}

const ABOUT_ENTRY_DEFINITIONS = [
  {
    key: 'browserUA',
    defaultTitle: '浏览器UA',
    defaultSubtitle: '当前浏览器标识',
    valueFactory: () => (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown UA'),
    allowHtml: false
  },
  {
    key: 'currentTime',
    defaultTitle: '当前时间',
    defaultSubtitle: '包含年月日时分秒',
    valueFactory: () => formatCurrentTime(),
    allowHtml: false
  },
  {
    key: 'siteVersion',
    defaultTitle: '本站版本',
    defaultSubtitle: '当前构建版本',
    valueFactory: () => getSiteVersionMarkup(),
    allowHtml: true
  }
];

let __settingsCurrentTimeIntervalId = null;

function formatCurrentTime() {
  const now = new Date();
  const docLang = (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) ? document.documentElement.lang : '';
  const locale = docLang || (typeof navigator !== 'undefined' ? navigator.language : '') || 'zh-CN';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);
}

function getSiteVersionMarkup() {
  const map = getTranslationsMap();
  const lang = resolveSettingsLang(map);
  const version = map && map[lang] && map[lang].footer && map[lang].footer.version;
  return version || '当前版本：<strong>未知</strong>';
}

function stopCurrentTimeTicker() {
  if (__settingsCurrentTimeIntervalId) {
    clearInterval(__settingsCurrentTimeIntervalId);
    __settingsCurrentTimeIntervalId = null;
  }
}

function startCurrentTimeTicker(valueEl) {
  if (!valueEl) return;
  stopCurrentTimeTicker();
  const update = () => {
    if (valueEl) valueEl.textContent = formatCurrentTime();
  };
  update();
  __settingsCurrentTimeIntervalId = setInterval(update, 1000);
  valueEl.setAttribute('aria-live', 'polite');
}

function buildSettingUrls() {
  const resolved = SETTINGS_URL_CANDIDATES.map(p => {
    try { return new URL(p, location.href).href; } catch (_) { return null; }
  }).filter(Boolean);
  return [...new Set(resolved)];
}

async function fetchSettingsTemplate({ allowAbort } = {}) {
  const urls = buildSettingUrls();
  let lastErr = null;
  for (const url of urls) {
    try {
      const controller = allowAbort ? new AbortController() : null;
      if (allowAbort) __settingsFetchController = controller;
      const resp = await fetch(url, {
        cache: 'force-cache',
        signal: controller ? controller.signal : undefined,
      });
      if (!resp.ok) throw new Error('fetch failed: ' + resp.status);
      return resp.text();
    } catch (err) {
      if (err && err.name === 'AbortError') throw err;
      lastErr = err;
    }
  }
  if (lastErr) console.warn('[Settings Modal] fetch failed, using fallback', lastErr);
  return SETTINGS_FALLBACK_HTML;
}

async function loadSettingsTemplate(options) {
  const opts = options || {};
  if (__settingsTemplateHtml) return __settingsTemplateHtml;
  if (__settingsTemplatePromise) return __settingsTemplatePromise;

  __settingsTemplatePromise = (async () => {
    const html = await fetchSettingsTemplate({ allowAbort: opts.allowAbort });
    __settingsTemplateHtml = html;
    return html;
  })();

  try {
    return await __settingsTemplatePromise;
  } catch (err) {
    __settingsTemplatePromise = null;
    throw err;
  }
}

function applySettingsTranslations(container) {
  const map = getTranslationsMap();
  if (!map) return;
  const lang = resolveSettingsLang(map);
  const t = map[lang] && map[lang].settings;
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
    if (t.color.customLabel) {
      const customLabel = t.color.customLabel;
      Array.from(color.querySelectorAll('p[data-color]')).forEach(p => {
        const val = (p.getAttribute('data-color') || '').toLowerCase();
        if (val === 'custom' || val === '自定义' || val === '自訂') {
          p.textContent = customLabel;
          p.setAttribute('data-color', 'custom');
        }
      });
    }
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

  const clearCache = container.querySelector('#clear-page-cache');
  if (clearCache && t.clearCache) {
    const h2 = clearCache.querySelector('h2');
    const h4 = clearCache.querySelector('h4');
    const btn = clearCache.querySelector('button');
    if (h2 && t.clearCache.title) h2.textContent = t.clearCache.title;
    if (h4 && t.clearCache.subtitle) h4.textContent = t.clearCache.subtitle;
    if (btn && t.clearCache.button) btn.textContent = t.clearCache.button;
  }
}

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
  const settingsStrings = getSettingsStrings();
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
  const iconClass = getSectionIconClass(sec);
  if (iconClass) {
    const icon = document.createElement('i');
    icon.className = `section-icon fluent-icon ${iconClass}`;
    icon.setAttribute('aria-hidden', 'true');
    wrapper.insertBefore(icon, left);
  }

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

      const colorStrings = settingsStrings && settingsStrings.color;
      const customStrings = colorStrings && colorStrings.customPanel;
      const customLabel = colorStrings && colorStrings.customLabel;

      const swatchColors = ['#007DC5','#33CC99','#F50000','#F59E0B','#7C3AED'];
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
        header.textContent = (customStrings && customStrings.title) || '自定义颜色';

        preview = document.createElement('div');
        preview.className = 'color-preview';

        const hueRow = document.createElement('div');
        hueRow.className = 'color-slider-row';
        const hueLabel = document.createElement('span');
        hueLabel.textContent = (customStrings && customStrings.hue) || '色相';
        hueSlider = document.createElement('input');
        hueSlider.type = 'range';
        hueSlider.className = 'color-slider color-hue';
        hueSlider.min = '0';
        hueSlider.max = '360';

        const satRow = document.createElement('div');
        satRow.className = 'color-slider-row';
        const satLabel = document.createElement('span');
        satLabel.textContent = (customStrings && customStrings.saturation) || '饱和';
        satSlider = document.createElement('input');
        satSlider.type = 'range';
        satSlider.className = 'color-slider color-sat';
        satSlider.min = '0';
        satSlider.max = '100';

        const lightRow = document.createElement('div');
        lightRow.className = 'color-slider-row';
        const lightLabel = document.createElement('span');
        lightLabel.textContent = (customStrings && customStrings.lightness) || '明度';
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
          // mark selected if matches current theme color
          if (currentThemeColor && c.toLowerCase() === currentThemeColor.toLowerCase()) {
            s.classList.add('selected');
          }
          // make keyboard-focusable
          s.setAttribute('tabindex', '0');
          s.setAttribute('role', 'button');
          s.addEventListener('click', ()=>{
            if (hexInput) hexInput.value = c;
            const pickedHsl = hexToHsl(c);
            if (pickedHsl && typeof syncFromHslFn === 'function') {
              hueSlider.value = pickedHsl.h;
              satSlider.value = pickedHsl.s;
              lightSlider.value = pickedHsl.l;
              syncFromHslFn();
            }
            // update selected class for swatch grid
            grid.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('selected'));
            s.classList.add('selected');
            // also update main preset color-options if present
            try {
              row.querySelectorAll('.color-option').forEach(o => {
                if (o.getAttribute('data-color') && o.getAttribute('data-color').toLowerCase() === c.toLowerCase()) {
                  row.querySelectorAll('.color-option').forEach(x => x.classList.remove('selected'));
                  o.classList.add('selected');
                }
              });
            } catch (err) {}
            applyColor(c, true);
            closeCustomPanel();
          });
          s.addEventListener('keydown', (e)=>{
            if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar'){
              e.preventDefault();
              s.click();
            }
          });
          // focus handling mirrors other controls: add .focus only if keyboard interaction
          s.addEventListener('focus', ()=>{ if (window.__lastInteractionWasKeyboard) s.classList.add('focus'); });
          s.addEventListener('blur', ()=> s.classList.remove('focus'));
          // pointer fallback to ensure hover ring disappears on leave
          s.addEventListener('pointerenter', ()=> s.classList.add('focus'));
          s.addEventListener('pointerleave', ()=> s.classList.remove('focus'));
          grid.appendChild(s);
        });

        const actions = document.createElement('div');
        actions.className = 'color-custom-actions';
        hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.className = 'color-hex-input';
        hexInput.placeholder = (customStrings && customStrings.hexPlaceholder) || '#RRGGBB 或 #RGB';
        hexInput.value = currentThemeColor;

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'color-apply-btn';
        applyBtn.textContent = (customStrings && customStrings.apply) || '确定';
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
        const lower = (color || '').toLowerCase();
        const isCustom = lower === 'custom' || color === '自定义' || (customLabel && color === customLabel);
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

        // make color swatch keyboard focusable and clickable
        colorOption.setAttribute('tabindex', '0');
        colorOption.setAttribute('role', 'button');
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

        // keyboard activation (Enter / Space)
        colorOption.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space' || e.key === 'Spacebar') {
            e.preventDefault();
            colorOption.click();
          }
        });

        // focus handling: only add .focus when last interaction was keyboard
        colorOption.addEventListener('focus', ()=>{
          if (window.__lastInteractionWasKeyboard) colorOption.classList.add('focus');
        });
        colorOption.addEventListener('blur', ()=> colorOption.classList.remove('focus'));

        row.appendChild(colorOption);
      });

      const presetColors = new Set(ps
        .map(p => p.getAttribute('data-color'))
        .filter(c => {
          if (!c) return false;
          const val = c.toLowerCase();
          if (val === 'custom') return false;
          if (c === '自定义') return false;
          if (customLabel && c === customLabel) return false;
          return true;
        })
        .map(c => c.toLowerCase()));
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
    const pageProgressStrings = settingsStrings && settingsStrings.pageProgress;
    pOn.innerHTML = psAll[1] ? psAll[1].innerHTML : ((pageProgressStrings && pageProgressStrings.on) || '开启');
    pOff.innerHTML = psAll[0] ? psAll[0].innerHTML : ((pageProgressStrings && pageProgressStrings.off) || '关闭');
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
  } else if (sec.id === 'clear-page-cache') {
    const row = document.createElement('div');
    row.className = 'settings-action-row';

    const status = document.createElement('span');
    status.className = 'settings-action-status';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'settings-action-btn';
    const sourceBtn = sec.querySelector('button');
    btn.textContent = (sourceBtn && sourceBtn.textContent ? sourceBtn.textContent.trim() : '清除') || '清除';

    btn.addEventListener('click', () => handleClearPageCache(btn, status));

    row.appendChild(status);
    row.appendChild(btn);
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

  const infoEl = wrapper.querySelector('.info-value');
  if (infoEl && left) {
    infoEl.classList.add('section-info');
    left.appendChild(infoEl);
  }

  return wrapper;
}

function getSettingsCategoryDefinitions(strings) {
  const categories = strings && strings.categories;
  return [
    {
      key: 'personalization',
      title: (categories && categories.personalization) || DEFAULT_CATEGORY_TITLES.personalization,
      sectionIds: ['lightdarktoggle', 'maincolorpicker', 'pageprogress', 'particleanimation']
    },
    {
      key: 'technical',
      title: (categories && categories.technical) || DEFAULT_CATEGORY_TITLES.technical,
      sectionIds: ['clear-page-cache']
    },
    {
      key: 'about',
      title: (categories && categories.about) || DEFAULT_CATEGORY_TITLES.about
    }
  ];
}

function buildAboutEntries(strings) {
  const entryStrings = strings && strings.aboutEntries;
  return ABOUT_ENTRY_DEFINITIONS.map(def => {
    const localized = entryStrings && entryStrings[def.key];
    const title = (localized && localized.title) || def.defaultTitle;
    const subtitle = (localized && localized.subtitle) || def.defaultSubtitle || '';
    const section = document.createElement('section');
    section.id = `settings-about-${def.key}`;
    const h2 = document.createElement('h2');
    h2.textContent = title;
    section.appendChild(h2);
    if (subtitle) {
      const h4 = document.createElement('h4');
      h4.textContent = subtitle;
      section.appendChild(h4);
    }
    const info = document.createElement('div');
    info.className = 'info-value';
    info.dataset.infoKey = def.key;
    const value = def.valueFactory(strings);
    if (def.allowHtml) {
      info.innerHTML = value;
    } else {
      info.textContent = value;
    }
    section.appendChild(info);
    const wrapper = buildSection(section);
    const valueEl = wrapper.querySelector('.info-value');
    return { key: def.key, wrapper, valueEl };
  });
}

function buildSettingsLayout(sectionMap, settingsStrings) {
  stopCurrentTimeTicker();
  const layout = document.createElement('div');
  layout.className = 'settings-layout';
  const nav = document.createElement('div');
  nav.className = 'settings-layout-nav';
  nav.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'settings-layout-panels';
  layout.appendChild(nav);
  layout.appendChild(panels);

  const categories = getSettingsCategoryDefinitions(settingsStrings);
  const tabs = [];
  const categoryPanels = [];
  const assigned = new Set();

  categories.forEach(category => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'settings-category-tab';
    tab.dataset.category = category.key;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', 'false');
    tab.tabIndex = -1;
    tab.textContent = category.title;
    tab.addEventListener('click', () => activateCategory(category.key));
    tabs.push(tab);
    nav.appendChild(tab);

    const panel = document.createElement('div');
    panel.className = 'settings-category-panel';
    panel.dataset.category = category.key;
    panels.appendChild(panel);
    categoryPanels.push(panel);

    if (Array.isArray(category.sectionIds)) {
      category.sectionIds.forEach(id => {
        const built = sectionMap.get(id);
        if (built) {
          panel.appendChild(built);
          assigned.add(id);
        }
      });
    }
  });

  const aboutPanel = categoryPanels.find(panel => panel.dataset.category === 'about');
  if (aboutPanel) {
    const aboutEntries = buildAboutEntries(settingsStrings);
    aboutEntries.forEach(entry => aboutPanel.appendChild(entry.wrapper));
    const timeEntry = aboutEntries.find(entry => entry.key === 'currentTime');
    if (timeEntry && timeEntry.valueEl) {
      startCurrentTimeTicker(timeEntry.valueEl);
    }
  }

  const fallbackPanel = categoryPanels[0] || null;
  sectionMap.forEach((wrapper, id) => {
    if (!assigned.has(id) && fallbackPanel) {
      fallbackPanel.appendChild(wrapper);
      assigned.add(id);
    }
  });

  function activateCategory(key) {
    tabs.forEach(tab => {
      const active = tab.dataset.category === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });
    categoryPanels.forEach(panel => panel.classList.toggle('active', panel.dataset.category === key));
  }

  if (categories.length) {
    activateCategory(categories[0].key);
  }

  return layout;
}

function renderSettingsSections(source, bodyEl, settingsStrings) {
  if (!bodyEl) return;
  const sections = source.querySelectorAll('section');
  if (sections.length === 0) throw new Error('no sections');
  const sectionMap = new Map();
  sections.forEach((sec, index) => {
    const built = buildSection(sec);
    const key = sec.id || sec.getAttribute('data-setting') || `section-${index}`;
    sectionMap.set(key, built);
  });
  const layout = buildSettingsLayout(sectionMap, settingsStrings);
  bodyEl.innerHTML = '';
  bodyEl.appendChild(layout);
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
  
  // accessibility: make it focusable and expose role/aria
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'switch');
  el.setAttribute('aria-checked', active ? 'true' : 'false');

  const update = ()=>{
    el.classList.toggle('active', active);
    el.setAttribute('aria-checked', active ? 'true' : 'false');
    onChange && onChange(active);
  };

  update();

  // pointer interaction
  el.addEventListener('click', (e)=>{ 
    // prevent double-activation when keyboard triggers
    e.preventDefault();
    active = !active; 
    update(); 
  });

  // keyboard support
  el.addEventListener('keydown', (e)=>{
    if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar'){
      e.preventDefault();
      active = !active;
      update();
    } else if (e.code === 'Enter' || e.key === 'Enter'){
      e.preventDefault();
      active = !active;
      update();
    }
  });

  // ensure we track whether last interaction was keyboard or pointer
  if (typeof window.__lastInteractionWasKeyboard === 'undefined'){
    window.__lastInteractionWasKeyboard = false;
    // keyboard navigation (Tab, Arrow keys, etc.)
    document.addEventListener('keydown', (ev)=>{
      try { window.__lastInteractionWasKeyboard = true; } catch(e){}
    }, true);
    // pointer interaction
    document.addEventListener('pointerdown', (ev)=>{
      try { window.__lastInteractionWasKeyboard = false; } catch(e){}
    }, true);
  }

  // visual focus styling when using keyboard only
  el.addEventListener('focus', ()=>{
    if (window.__lastInteractionWasKeyboard) el.classList.add('focus');
  });
  el.addEventListener('blur', ()=> el.classList.remove('focus'));

  return el;
}

async function handleClearPageCache(btn, statusEl){
  if (!btn) return;
  const settingsStrings = getSettingsStrings();
  const clearStrings = (settingsStrings && settingsStrings.clearCache) || null;
  const statusStrings = clearStrings && clearStrings.status;
  const workingBtnText = (clearStrings && clearStrings.buttonWorking) || '清除中...';
  const unsupportedText = (statusStrings && statusStrings.unsupported) || '当前浏览器不支持清除缓存';
  const workingText = (statusStrings && statusStrings.working) || '正在清除缓存...';
  const doneText = (statusStrings && statusStrings.done) || '已清除缓存，正在刷新';
  const failedText = (statusStrings && statusStrings.failed) || '清除失败，请重试';
  const originalText = btn.textContent;
  const setStatus = (text, tone) => {
    if (!statusEl) return;
    statusEl.textContent = text || '';
    statusEl.classList.remove('ok', 'error', 'muted');
    if (tone) statusEl.classList.add(tone);
  };

  const start = () => {
    btn.disabled = true;
    btn.classList.add('loading');
    btn.textContent = workingBtnText;
  };

  const reset = () => {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = originalText;
  };

  const hasAnyCapability = () => {
    const hasCache = typeof caches !== 'undefined';
    const hasSw = typeof navigator !== 'undefined' && !!navigator.serviceWorker && typeof navigator.serviceWorker.getRegistrations === 'function';
    return hasCache || hasSw;
  };

  if (!hasAnyCapability()) {
    setStatus(unsupportedText, 'error');
    return;
  }

  start();
  setStatus(workingText, 'muted');

  try {
    const cacheTask = (async () => {
      if (typeof caches === 'undefined' || !caches.keys) return;
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    })();

    const swTask = (async () => {
      if (!navigator || !navigator.serviceWorker || typeof navigator.serviceWorker.getRegistrations !== 'function') return;
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    })();

    await Promise.all([cacheTask, swTask]);
    setStatus(doneText, 'ok');
    setTimeout(() => {
      try { location.reload(); } catch (e) { reset(); }
    }, 220);
  } catch (err) {
    console.error('[Settings Modal] 清除缓存失败', err);
    setStatus(failedText, 'error');
    reset();
  }
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
  stopCurrentTimeTicker();

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
  const settingsStrings = getSettingsStrings();
  if (body) {
    body.innerHTML = '<div class="settings-loading">Loading settings...</div>';
  }
  showModal();

  const minVisibleMs = 40;
  const minVisible = new Promise(resolve => setTimeout(resolve, minVisibleMs));

  const stillValid = () => myToken === __settingsLoadToken;

  try {
    const markup = await loadSettingsTemplate({ allowAbort: true });
    if (!stillValid()) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = markup;
    applySettingsTranslations(tmp);
    const titleEl = tmp.querySelector('title');
    const title = titleEl ? titleEl.textContent.trim() : '设置';
    document.querySelector('#settings-modal .modal-title').textContent = title;
    await minVisible;
    if (!stillValid()) return;
    if (body) {
      body.innerHTML = '';
      try {
        renderSettingsSections(tmp, body, settingsStrings);
      } catch (e) {
        console.error('[Settings Modal] render error, fallback to built-in template', e);
        const fallback = document.createElement('div');
        fallback.innerHTML = SETTINGS_FALLBACK_HTML;
        applySettingsTranslations(fallback);
        renderSettingsSections(fallback, body, settingsStrings);
      }
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    console.error('[Settings Modal] Error loading settings:', e);
    if (body) body.innerHTML = '<div class="settings-loading">Failed to load settings</div>';
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
  if (e.detail && e.detail.fromModal) return;
  const modal = document.getElementById('settings-modal');
  if (!modal || !modal.classList.contains('show')) return;
  const body = modal.querySelector('.modal-body');
  if (!body || !__settingsTemplateHtml) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = __settingsTemplateHtml;
  applySettingsTranslations(tmp);
  const titleEl = tmp.querySelector('title');
  if (titleEl && titleEl.textContent.trim()) {
    document.querySelector('#settings-modal .modal-title').textContent = titleEl.textContent.trim();
  }
  try {
    renderSettingsSections(tmp, body, getSettingsStrings());
  } catch (err) {
    console.error('[Settings Modal] follow-system re-render failed', err);
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

  // warm settings template to speed up first open
  try {
    const kickOffPrefetch = () => loadSettingsTemplate().catch(()=>{});
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(kickOffPrefetch, { timeout: 1200 });
    } else {
      setTimeout(kickOffPrefetch, 800);
    }
  } catch (e) {}
});
