// 设置弹窗逻辑：从页面内嵌的模板加载内容并渲染
// load control to avoid race when opening/closing rapidly
let __settingsLoadToken = 0; // incrementing token for each open
let __settingsFetchController = null; // AbortController for fetch
let __settingsClearTimeoutId = null; // timeout id used when closing
const SETTINGS_LANG_KEY = 'language';
const DEFAULT_THEME_COLOR = '#33CC99';

// 最终兜底：如果无法加载 includes/setting.html，则使用此内置模板
const SETTINGS_FALLBACK_HTML = `
  <title>设置</title>
  <section id="lightdarktoggle">
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
    <p data-color="#D70040">#D70040</p>
  </section>
  <section id="pageprogress" data-setting="page-progress">
    <h2>页面进度条</h2>
    <h4>在页眉底部显示当前页面滚动进度</h4>
    <p>关闭</p>
    <p>开启</p>
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
    modal.innerHTML = '<div class="modal-header"><span class="modal-title"></span><button class="modal-close" aria-label="关闭"><i class="icon-ic_fluent_dismiss_24_regular"></i></button></div><div class="modal-body"></div>';
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
  }
}

function buildSection(sec){
  const wrapper = document.createElement('div');
  wrapper.className = 'settings-section';

  const h2 = sec.querySelector('h2');
  const h4 = sec.querySelector('h4');
  const ps = sec.querySelectorAll('p');

  // 左侧：标题和副标题
  const leftDiv = document.createElement('div');
  leftDiv.className = 'section-left';
  
  if (h2){
    const titleEl = document.createElement('div');
    titleEl.className = 'section-title';
    titleEl.textContent = h2.textContent.trim();
    leftDiv.appendChild(titleEl);
  }
  if (h4){
    const subEl = document.createElement('div');
    subEl.className = 'section-subtitle';
    subEl.textContent = h4.textContent.trim();
    leftDiv.appendChild(subEl);
  }
  
  wrapper.appendChild(leftDiv);

  // 检查是否为颜色选择器（p标签有data-color属性）
  const hasColorAttr = ps.length > 0 && ps[0].hasAttribute('data-color');
  
  if (hasColorAttr) {
    // 颜色选择器
    const row = document.createElement('div');
    row.className = 'color-picker-row';
    const currentThemeColor = localStorage.getItem('theme-color') || '#007DC5';
    
    ps.forEach(p => {
      const color = p.getAttribute('data-color');
      if (color) {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        const core = document.createElement('div');
        core.className = 'color-core';
        core.style.backgroundColor = color;
        colorOption.appendChild(core);
        colorOption.setAttribute('data-color', color);
        
        // 标记当前选中的颜色
        if (color === currentThemeColor) {
          colorOption.classList.add('selected');
        }
        
        // 点击切换颜色
        colorOption.addEventListener('click', () => {
          // 点击动画：重置并重新添加类以触发动画（仅作用于内部圆点）
          core.classList.remove('click-anim');
          void core.offsetWidth; // 触发重绘
          core.classList.add('click-anim');
          // 移除其他选中状态
          row.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
          // 标记当前选中
          colorOption.classList.add('selected');
          // 保存到localStorage
          localStorage.setItem('theme-color', color);
          // 应用主题色
          applyThemeColor(color);
        });
        
        row.appendChild(colorOption);
      }
    });
    
    wrapper.appendChild(row);
  }
  else if (sec.dataset && sec.dataset.setting === 'page-progress') {
    const row = document.createElement('div');
    row.className = 'settings-toggle-row';
    const pContainer = document.createElement('div');
    pContainer.style.margin = '0';
    const pOn = document.createElement('p');
    const pOff = document.createElement('p');
    const psAll = sec.querySelectorAll('p');
    // psAll ordering in pop_page/setting.html is [关闭, 开启]
    pOn.innerHTML = psAll[1] ? psAll[1].innerHTML : '开启';
    pOff.innerHTML = psAll[0] ? psAll[0].innerHTML : '关闭';
    pOn.style.margin = '0';
    pOff.style.margin = '0';
    pContainer.appendChild(pOn);
    pContainer.appendChild(pOff);

    // 初始状态取 localStorage（默认 false）
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
  }
  // 右侧：开关和文本
  else if (ps.length === 1){
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
  } else if (ps.length >= 2){
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
    
    // 初始状态：根据 localStorage 的 'follow-system' 决定
    // follow-system = 'true' 时，显示 p1（"跟随系统"），滑块 ON
    // follow-system = 'false' 时，显示 p2（"手动设置"），滑块 OFF
    const followSystemStr = localStorage.getItem('follow-system');
    const initialActive = followSystemStr === 'true';
    
    // 初始化时设置正确的文本显示
    p1.style.display = initialActive ? '' : 'none';
    p2.style.display = initialActive ? 'none' : '';
    
    const toggle = buildToggle((on)=>{
      p1.style.display = on ? '' : 'none';
      p2.style.display = on ? 'none' : '';
      // 更新 localStorage
      localStorage.setItem('follow-system', on ? 'true' : 'false');
      // 通知 theme.js 更新状态，标记来源为内部（不需要刷新弹窗）
      document.dispatchEvent(new CustomEvent('follow-system-changed', { detail: { fromModal: true } }));
    }, initialActive);
    
    row.appendChild(pContainer);
    row.appendChild(toggle);
    wrapper.appendChild(row);
  } else if (ps.length > 0) {
    // 如果有其他内容，放在右侧
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
  
  // 初始化状态（不触发动画）
  if (active) {
    el.classList.add('active');
  }
  
  const update = ()=>{
    el.classList.toggle('active', active);
    onChange && onChange(active);
  };

  // Ensure initial callback runs to sync UI/state
  // but don't trigger the click animation (update handles class only)
  update();
  
  el.addEventListener('click', ()=>{ 
    active = !active; 
    update(); 
  });
  
  return el;
}

  function applyThemeColor(color) {
    // 将颜色应用到CSS变量
    document.documentElement.style.setProperty('--primary-color', color);

    // 解析 hex 到 r,g,b 并设置 --primary-color-rgb 以供 rgba() 使用
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

    // 派发事件通知其他组件
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
  // invalidate any inflight load so its result is ignored
  __settingsLoadToken += 1;

  // abort any ongoing fetch
  if (__settingsFetchController) {
    try { __settingsFetchController.abort(); } catch (e) {}
    __settingsFetchController = null;
  }

  if (b) b.classList.remove('show');
  if (m) {
    m.classList.remove('show');
    // 关闭时清空弹窗内容，下次打开时重新生成确保获取最新状态
    if (__settingsClearTimeoutId) clearTimeout(__settingsClearTimeoutId);
    __settingsClearTimeoutId = setTimeout(()=>{
      const body = m.querySelector('.modal-body');
      if (body) body.innerHTML = '';
      __settingsClearTimeoutId = null;
    }, 200); // 等待淡出动画完成
  }
}

async function openModal(){
  ensureContainers();

  // prepare guarding token and cancel previous
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

  // show loading indicator immediately
  const body = document.querySelector('#settings-modal .modal-body');
  if (body) {
    body.innerHTML = '<div class="settings-loading">正在加载设置项…</div>';
  }
  // show modal so user sees loading state while we prepare content
  showModal();

  const minVisibleMs = 40;
  const minVisible = new Promise(resolve => setTimeout(resolve, minVisibleMs));

  const stillValid = () => myToken === __settingsLoadToken;

  const buildSettingUrls = () => {
    const candidates = ['includes/setting.html', '../includes/setting.html', '../../includes/setting.html', '../../../includes/setting.html'];
    const resolved = candidates.map(p => {
      try { return new URL(p, location.href).href; } catch (_) { return null; }
    }).filter(Boolean);
    // de-dup while preserving order
    return [...new Set(resolved)];
  };

  const tryLoad = async (url) => {
    // try sync XHR first to support file:// and avoid CORS issues
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      if (xhr.status === 200 || xhr.status === 0) {
        return xhr.responseText;
      }
    } catch (err) {
      console.warn('[Settings Modal] XHR load failed, will try fetch', err);
    }

    __settingsFetchController = new AbortController();
    const resp = await fetch(url, { cache: 'no-store', signal: __settingsFetchController.signal });
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
  };

  try {
    const markup = await fetchSettingsMarkup();
    if (!stillValid()) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = markup;
    applySettingsTranslations(tmp);
    const titleEl = tmp.querySelector('title');
    const title = titleEl ? titleEl.textContent.trim() : '设置';
    document.querySelector('#settings-modal .modal-title').textContent = title;
    await minVisible;
    if (!stillValid()) return;
    body.innerHTML = '';
    const sections = tmp.querySelectorAll('section');
    if (sections.length === 0) throw new Error('no sections');
    sections.forEach(sec => body.appendChild(buildSection(sec)));
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    console.error('[Settings Modal] Error loading settings:', e);
    if (body) body.innerHTML = '<div class="settings-loading">正在加载设置项…（失败）</div>';
  } finally {
    __settingsFetchController = null;
  }
}

// 监听事件
document.addEventListener('open-settings-modal', () => openModal());
// allow external callers to request closing the modal via event
document.addEventListener('close-settings-modal', () => closeModal());

// 监听 follow-system 改变事件，如果弹窗已打开则刷新
document.addEventListener('follow-system-changed', (e) => {
  // 如果事件来自弹窗内部的滑块，不需要重新渲染（避免破坏动画）
  if (e.detail && e.detail.fromModal) {
    return;
  }
  
  const modal = document.getElementById('settings-modal');
  if (modal && modal.classList.contains('show')) {
    // 弹窗已打开，重新渲染以反映最新状态
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

// 暴露到全局，供必要时关闭
window.closeSettingsModal = closeModal;

// 页面加载时应用保存的主题色
document.addEventListener('DOMContentLoaded', () => {
  const savedColor = localStorage.getItem('theme-color');
  const colorToUse = savedColor || DEFAULT_THEME_COLOR;
  if (!savedColor) {
    localStorage.setItem('theme-color', colorToUse);
  }
  applyThemeColor(colorToUse);
});
