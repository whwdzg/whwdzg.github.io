document.addEventListener('DOMContentLoaded', function(){
  // create overlay markup
  if (!document.getElementById('videoplay-overlay')){
    const ov = document.createElement('div');
    ov.id = 'videoplay-overlay';
    ov.innerHTML = `
      <button class="vp-close" aria-label="关闭"><i class="icon icon-ic_fluent_dismiss_24_regular" aria-hidden="true"></i></button>
      <div class="vp-container">
        <div class="vp-video-area">
          <video class="vp-video" controlsList="nodownload" preload="metadata"></video>
        </div>
        <div class="vp-controls" aria-hidden="false">
          <button class="vp-play" title="播放"><i class="icon icon-ic_fluent_play_24_regular" aria-hidden="true"></i></button>
          <div class="vp-time vp-current">0:00</div>
          <div class="vp-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100">
            <div class="vp-progress-filled"></div>
          </div>
          <div class="vp-time vp-duration">0:00</div>
          <button class="vp-menu" title="菜单" aria-expanded="false"><i class="icon icon-ic_fluent_more_horizontal_24_regular" aria-hidden="true"></i></button>
          <div class="vp-settings-panel" hidden>
            <div class="vp-toggle-row">
              <button class="vp-toggle vp-toggle-danmaku" aria-pressed="false">弹幕关</button>
              <button class="vp-toggle vp-toggle-subtitle" aria-pressed="false">字幕关</button>
            </div>
            <div class="vp-volume-control" role="group" aria-label="音量控制">
              <i class="icon icon-ic_fluent_speaker_2_24_regular vp-volume-icon" aria-hidden="true"></i>
              <input class="vp-volume-slider" type="range" min="0" max="1" step="0.05" value="1" aria-label="音量滑块" />
            </div>
          </div>
          <button class="vp-fullscreen" title="全屏"><i class="icon icon-ic_fluent_full_screen_maximize_24_regular" aria-hidden="true"></i></button>
        </div>
      </div>`;
    document.body.appendChild(ov);
  }

  const overlay = document.getElementById('videoplay-overlay');
  const container = overlay.querySelector('.vp-container');
  const video = overlay.querySelector('.vp-video');
  const closeBtn = overlay.querySelector('.vp-close');
  const playBtn = overlay.querySelector('.vp-play');
  const currentEl = overlay.querySelector('.vp-current');
  const durationEl = overlay.querySelector('.vp-duration');
  const progress = overlay.querySelector('.vp-progress');
  const filled = overlay.querySelector('.vp-progress-filled');
  const menuBtn = overlay.querySelector('.vp-menu');
  const settingsPanel = overlay.querySelector('.vp-settings-panel');
  const danmakuToggle = overlay.querySelector('.vp-toggle-danmaku');
  const subtitleToggle = overlay.querySelector('.vp-toggle-subtitle');
  const volumeSlider = overlay.querySelector('.vp-volume-slider');
  const volumeIcon = overlay.querySelector('.vp-volume-icon');
  const fullscreenBtn = overlay.querySelector('.vp-fullscreen');
  // hint area for transient messages (e.g. no Range support)
  const controlsEl = overlay.querySelector('.vp-controls');
  let rangeHintEl = controlsEl.querySelector('.vp-range-hint');
  if (!rangeHintEl) {
    rangeHintEl = document.createElement('div');
    rangeHintEl.className = 'vp-range-hint';
    rangeHintEl.style.cssText = 'position: absolute; left: 50%; transform: translateX(-50%); bottom: -28px; font-size: 12px; color: #fff; background: rgba(0,0,0,0.6); padding:4px 8px; border-radius:6px; display:none;';
    controlsEl.appendChild(rangeHintEl);
  }

  function showRangeHint(msg, ms = 4000){
    try {
      rangeHintEl.textContent = msg;
      rangeHintEl.style.display = 'block';
      setTimeout(()=>{ rangeHintEl.style.display = 'none'; }, ms);
    } catch(e){}
  }

  let isDragging = false;
  let pendingSeekPct = null;
  let controlsHideTimer = null;
  let controlsVisible = true;
  let menuOpen = false;

  function updateVolumeIconFromValue(val){
    if (!volumeIcon) return;
    const v = Number(val);
    let cls = 'icon icon-ic_fluent_speaker_2_24_regular';
    if (v <= 0) cls = 'icon icon-ic_fluent_speaker_mute_24_regular';
    else if (v < 0.5) cls = 'icon icon-ic_fluent_speaker_1_24_regular';
    volumeIcon.className = cls;
  }

  function syncSettingsLayout(){
    const isFull = !!document.fullscreenElement && container.classList.contains('vp-fullscreen-mode');
    controlsEl.classList.toggle('menu-inline', isFull);
    if (menuBtn) menuBtn.style.display = isFull ? 'none' : '';
    if (settingsPanel) {
      if (isFull) {
        settingsPanel.hidden = false;
      } else {
        settingsPanel.hidden = !menuOpen;
      }
    }
    if (menuBtn) menuBtn.setAttribute('aria-expanded', (!isFull && menuOpen).toString());
  }

  function setMenuOpen(open){
    menuOpen = !!open;
    syncSettingsLayout();
  }

  function showControls(){
    if (!controlsVisible){
      container.querySelector('.vp-controls').classList.remove('hidden');
      controlsVisible = true;
    }
    resetControlsHideTimer();
  }
  function hideControls(){
    if (menuOpen) return; // keep controls visible while menu展开
    if (document.fullscreenElement) return; // avoid hiding in fullscreen to keep UI usable
    container.querySelector('.vp-controls').classList.add('hidden');
    controlsVisible = false;
  }
  function resetControlsHideTimer(){
    if (controlsHideTimer) clearTimeout(controlsHideTimer);
    controlsHideTimer = setTimeout(()=>{ hideControls(); }, 5000);
  }

  function formatTime(sec){
    if (!isFinite(sec)) return '0:00';
    const s = Math.floor(sec%60); const m = Math.floor(sec/60);
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  function openVideo(src){
    // attach metadata listener before setting src so pendingSeekPct is applied
    video.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(video.duration);
      // if there was a pending seek requested before metadata, apply it now
      if (pendingSeekPct !== null && isFinite(video.duration) && video.duration > 0) {
        try {
          const t = Math.max(0, Math.min(1, pendingSeekPct)) * video.duration;
          applySeek(t);
        } catch(e){}
        pendingSeekPct = null;
      }
      updateProgress();
    }, { once: true });

    overlay.classList.add('active');
    document.body.classList.add('no-scroll-lightbox');
  setMenuOpen(false);
  syncSettingsLayout();
  if (typeof video.volume === 'number') { updateVolumeIconFromValue(video.muted ? 0 : video.volume); }
    // ensure controls visible and start hide timer
    showControls();
    // prefer to preload to allow buffering/seekability detection
    try { video.preload = 'auto'; } catch(e){}
    video.src = src;
    // asynchronously check whether server supports Range requests for this src
    try { checkRangeSupport(src).then(support => { video._rangeSupport = support; dbg('videoplay: rangeSupport', { src, support }); }); } catch(e){}
    // attempt to start loading immediately
    try { video.load(); } catch(e){}
    video.play().catch(()=>{ /* autoplay blocked */ });
    updatePlayButton();
  }

  // 检查 Range 支持，失败时自动 encodeURI 路径重试
  async function checkRangeSupport(url) {
    async function tryOne(u) {
      try {
        let abs;
        try { abs = new URL(u, location.href).toString(); } catch (e) { abs = u; }
        // HEAD first
        try {
          const head = await fetch(abs, { method: 'HEAD', cache: 'no-store' });
          const ar = head.headers.get('Accept-Ranges');
          if (ar && /bytes/i.test(ar)) return true;
        } catch (e) { dbg('checkRangeSupport:HEAD-failed', String(e)); }
        // Fallback: GET with Range
        try {
          const res = await fetch(abs, { method: 'GET', headers: { Range: 'bytes=0-0' }, cache: 'no-store' });
          if (res && res.status === 206) return true;
        } catch (e) { dbg('checkRangeSupport:RangeGET-failed', String(e)); }
      } catch (e) { dbg('checkRangeSupport:tryOne-error', String(e)); }
      return false;
    }
    // 先试原始路径，再试 encodeURI 路径
    let ok = await tryOne(url);
    if (!ok) {
      try {
        // 只 encode 路径部分
        let u = url;
        if (/^https?:\/\//i.test(url)) {
          const m = url.match(/^(https?:\/\/[^\/]+)(\/.*)$/i);
          if (m) u = m[1] + encodeURI(m[2]);
        } else {
          u = encodeURI(url);
        }
        if (u !== url) ok = await tryOne(u);
      } catch (e) { dbg('checkRangeSupport:encodeURI-failed', String(e)); }
    }
    return !!ok;
  }

  // dbg: 仅 window.videoplayDebug === true 时输出调试日志
  function dbg(){
    if (window && window.videoplayDebug && window.console && window.console.debug) {
      try { window.console.debug.apply(console, arguments); } catch(e){}
    }
  }
  let pendingPollHandle = null;

  // Robust seek helper: try fastSeek, fallback to currentTime, and verify via seeked or retries.
  function applySeek(targetTime) {
    if (!isFinite(targetTime) || targetTime < 0) return;
    const MAX_RETRIES = 6; // ~600ms total
    const RETRY_MS = 100;
    let attempts = 0;
    let done = false;

    function finalize() {
      if (done) return;
      done = true;
      try { video.removeEventListener('seeked', onSeeked); } catch (e) {}
      updateProgress();
    }

    function onSeeked() {
      dbg('applySeek:seeked', { currentTime: video.currentTime, targetTime });
      finalize();
    }

    function verify() {
      attempts++;
      const ct = Number(video.currentTime) || 0;
      const diff = Math.abs(ct - targetTime);
      dbg('applySeek:verify', { attempts, currentTime: ct, targetTime, diff, readyState: video.readyState });
      // If we are close enough or exhausted attempts, finalize.
      if (diff < 0.25 || attempts >= MAX_RETRIES) {
        if (diff >= 0.25) {
          try { video.currentTime = targetTime; } catch (e) { dbg('applySeek:finalSetError', String(e)); }
        }
        finalize();
        return;
      }

      // Heuristic: if readyState is still very low and currentTime is near 0 after several attempts,
      // resource might not support random access yet. Fall back to pendingSeekPct so poll can retry later.
      if (attempts >= 3 && video.readyState <= 1 && ct < 1) {
        try {
          const pct = (video.duration && isFinite(video.duration) && video.duration > 0) ? Math.max(0, Math.min(1, targetTime / video.duration)) : null;
          if (pct !== null) {
            pendingSeekPct = pct;
            dbg('applySeek:falling-back-to-pending', { pendingSeekPct, attempts, readyState: video.readyState, currentTime: ct });
            // if we detected server doesn't support Range requests, inform the user
            if (video._rangeSupport === false) {
              showRangeHint('服务器不支持随机访问 (Range)，跳转将稍后完成');
            } else {
              showRangeHint('视频正在缓冲，跳转将稍后完成');
            }
            startPendingSeekPoll();
            finalize();
            return;
          }
        } catch (e) { /* ignore */ }
      }
      setTimeout(verify, RETRY_MS);
    }

    // If the resource isn't seekable yet (no seekable ranges), fall back to pendingSeekPct
    try {
      if (video.seekable && typeof video.seekable.length === 'number' && video.seekable.length === 0) {
        // convert targetTime to percent if duration available, otherwise approximate
        const pct = (video.duration && isFinite(video.duration) && video.duration > 0)
          ? Math.max(0, Math.min(1, targetTime / video.duration))
          : Math.max(0, Math.min(1, 0));
        pendingSeekPct = pct;
        dbg('applySeek:resource-not-seekable, fallback to pendingSeekPct', { pendingSeekPct, targetTime, readyState: video.readyState });
        startPendingSeekPoll();
        return;
      }
    } catch (e) { /* ignore inspect errors */ }

    video.addEventListener('seeked', onSeeked);
    try {
      if (typeof video.fastSeek === 'function') {
        dbg('applySeek:fastSeek', { targetTime });
        video.fastSeek(targetTime);
      } else {
        dbg('applySeek:setCurrentTime', { targetTime });
        video.currentTime = targetTime;
      }
    } catch (err) {
      dbg('applySeek:errorOnSet', String(err));
    }
    setTimeout(verify, RETRY_MS);
  }
  function startPendingSeekPoll(){
    if (pendingPollHandle) return;
    const start = Date.now();
    pendingPollHandle = setInterval(()=>{
      if (pendingSeekPct === null) { clearInterval(pendingPollHandle); pendingPollHandle = null; return; }
      const now = Date.now();
      if (video.duration && isFinite(video.duration) && video.duration > 0) {
        try {
          const t = Math.max(0, Math.min(1, pendingSeekPct)) * video.duration;
          applySeek(t);
        } catch(e){}
        pendingSeekPct = null;
        clearInterval(pendingPollHandle); pendingPollHandle = null;
        dbg('videoplay: pendingSeek applied via poll');
        return;
      }
      if (now - start > 5000) { clearInterval(pendingPollHandle); pendingPollHandle = null; dbg('videoplay: pendingSeek poll timeout'); }
    }, 200);
  }

  function closeVideo(){
    overlay.classList.remove('active');
    try{ video.pause(); }catch(e){}
    video.removeAttribute('src');
    video.load();
    document.body.classList.remove('no-scroll-lightbox');
    if (controlsHideTimer) { clearTimeout(controlsHideTimer); controlsHideTimer = null; }
    setMenuOpen(false);
  }

  function updatePlayButton(){
    const icon = playBtn.querySelector('i');
    if (!icon) return;
    if (video.paused) {
      icon.className = 'icon icon-ic_fluent_play_24_regular';
    } else {
      icon.className = 'icon icon-ic_fluent_pause_24_regular';
    }
  }

  function updateProgress(){
    const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    filled.style.width = pct + '%';
    currentEl.textContent = formatTime(video.currentTime);
  }

  // bind events
  closeBtn.addEventListener('click', closeVideo);
  playBtn.addEventListener('click', () => {
    if (video.paused) video.play(); else video.pause();
    updatePlayButton();
  });
  video.addEventListener('play', updatePlayButton);
  video.addEventListener('pause', updatePlayButton);
  video.addEventListener('timeupdate', updateProgress);

  // --- Initialize inline videos: generate first-frame poster and apply image-like rounded corners
  try {
    // helper to apply same rounded corner style as images
    function styleVideoAsImage(v){
      try { v.classList.add('video-as-image'); } catch(e){
        try { v.style.borderRadius = '10px'; v.style.overflow = 'hidden'; } catch(_){}
      }
      try { v.classList.add('zoomable-img'); } catch(_){}
    }

    function createPlaceholderPoster(v, w, h){
      try {
        const c = document.createElement('canvas');
        c.width = w || Math.max(160, v.clientWidth || 320);
        c.height = h || Math.max(90, v.clientHeight || 180);
        const ctx = c.getContext('2d');
        // background neutral
        ctx.fillStyle = '#efefef';
        ctx.fillRect(0,0,c.width,c.height);
        // subtle vignette
        try {
          ctx.fillStyle = 'rgba(0,0,0,0.04)';
          ctx.fillRect(0,0,c.width,c.height);
        } catch(_){}
        // draw play triangle
        const cx = c.width/2, cy = c.height/2;
        const size = Math.min(c.width, c.height) * 0.18;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.moveTo(cx - size*0.6, cy - size);
        ctx.lineTo(cx - size*0.6, cy + size);
        ctx.lineTo(cx + size, cy);
        ctx.closePath();
        ctx.fill();
        try { v.setAttribute('poster', c.toDataURL('image/png')); } catch(e){ /* ignore */ }
      } catch(e) { /* ignore */ }
    }

    // capture first frame as poster for videos without poster attribute
    const inlineVideos = Array.from(document.querySelectorAll('main video, article video, .post-content video, #aside-stack video, video'));
    inlineVideos.forEach(v => {
      try {
        // skip if poster already present or no src
        if (v.getAttribute('poster')) { styleVideoAsImage(v); return; }
        const src = v.currentSrc || v.src;
        if (!src) { styleVideoAsImage(v); return; }
        // create offscreen video to avoid affecting original element playback state
        const off = document.createElement('video');
        off.muted = true; off.preload = 'metadata'; off.crossOrigin = 'anonymous';
        off.src = src;
        // try to grab first frame once metadata and a small buffer are available
        const grab = () => {
          try {
            const c = document.createElement('canvas');
            const w = off.videoWidth || v.videoWidth || v.clientWidth || 320;
            const h = off.videoHeight || v.videoHeight || v.clientHeight || 180;
            c.width = w; c.height = h;
            const ctx = c.getContext('2d');
            ctx.drawImage(off, 0, 0, w, h);
            try {
              const data = c.toDataURL('image/png');
              v.setAttribute('poster', data);
            } catch(e){
              // Likely CORS or tainted canvas — fallback to neutral placeholder
              console.debug && console.debug('videoplay: poster toDataURL failed, using placeholder', e);
              createPlaceholderPoster(v, w, h);
            }
            styleVideoAsImage(v);
            // clean up
            off.pause(); off.removeAttribute('src'); try{ off.load(); }catch(e){}
          } catch(e){
            console.debug && console.debug('videoplay: grab frame failed, using placeholder', e);
            createPlaceholderPoster(v);
            styleVideoAsImage(v);
          }
        };
        off.addEventListener('loadeddata', function onld(){ try { grab(); } catch(e){} }, { once: true });
        // fallback: if loadedmetadata but not loadeddata, try to seek to 0 and grab after small delay
        off.addEventListener('loadedmetadata', function(){ try { off.currentTime = 0; setTimeout(grab, 80); } catch(e){} }, { once: true });
        // start loading
        try { off.load(); } catch(e){}
      } catch(e){ styleVideoAsImage(v); }
    });
  } catch(e){}

  // progress seek handling: support click and drag. On drag, update fill live and set time on pointerup.
  let seekingPct = 0;
  function pctFromEvent(e){
    const rect = progress.getBoundingClientRect();
    const clientX = (typeof e.clientX === 'number') ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
    const x = Math.min(rect.width, Math.max(0, clientX - rect.left));
    return rect.width ? (x / rect.width) : 0;
  }

  progress.addEventListener('pointerdown', (e)=>{
    isDragging = true;
    seekingPct = pctFromEvent(e);
    filled.style.width = (seekingPct * 100) + '%';
    // prevent text selection or other interactions
    e.preventDefault();
    try{ dbg('videoplay: pointerdown ' + JSON.stringify({ seekingPct, duration: video.duration })); }catch(e){ dbg('videoplay: pointerdown'); }
    // if metadata is available, apply the seek immediately
    if (video.duration && isFinite(video.duration) && video.duration > 0) {
      // if server doesn't support Range, fall back to pending seek instead of immediate hard seek
      if (video._rangeSupport === false) {
        pendingSeekPct = seekingPct;
        showRangeHint('服务器不支持直接跳转，稍后完成');
        startPendingSeekPoll();
      } else {
        try { applySeek(seekingPct * video.duration); } catch(e){}
      }
      currentEl.textContent = formatTime(seekingPct * video.duration);
    } else {
      pendingSeekPct = seekingPct;
      startPendingSeekPoll();
    }
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once:true });
    showControls();
  });

  function onPointerMove(e){
    if (!isDragging) return;
    seekingPct = pctFromEvent(e);
    filled.style.width = (seekingPct * 100) + '%';
    // update current time display while dragging (don't set video.currentTime until pointerup for some browsers)
    if (video.duration && isFinite(video.duration) && video.duration > 0) {
      // throttle live seeking to reduce jank
      const now = Date.now();
      if (!onPointerMove._last || now - onPointerMove._last > 120) {
        try {
          if (video._rangeSupport === false) {
            // avoid heavy seeking if server lacks Range support
            pendingSeekPct = seekingPct;
            showRangeHint('服务器不支持直接跳转，稍后完成');
            startPendingSeekPoll();
          } else {
            applySeek(seekingPct * video.duration);
          }
        } catch(e){}
        onPointerMove._last = now;
      }
      currentEl.textContent = formatTime(seekingPct * video.duration);
    } else {
      currentEl.textContent = '0:00';
    }
  }

  function onPointerUp(e){
    if (!isDragging) return;
    isDragging = false;
    window.removeEventListener('pointermove', onPointerMove);
    // finalize seek
    // use last known seekingPct as final position (safer than relying on pointerup coords)
    let finalPct = (typeof seekingPct === 'number' && seekingPct >= 0) ? seekingPct : pctFromEvent(e);
    try{ dbg('videoplay: pointerup ' + JSON.stringify({ finalPct, seekingPct, duration: video.duration, pendingSeekPct })); }catch(e){ dbg('videoplay: pointerup'); }
    if (video.duration && isFinite(video.duration) && video.duration > 0) {
      if (video._rangeSupport === false) {
        pendingSeekPct = finalPct;
        showRangeHint('服务器不支持直接跳转，稍后完成');
        startPendingSeekPoll();
      } else {
        try { applySeek(finalPct * video.duration); } catch(e){}
      }
      // ensure UI sync
      filled.style.width = (finalPct * 100) + '%';
      currentEl.textContent = formatTime(finalPct * video.duration);
      try{ dbg('videoplay: after set currentTime', JSON.stringify({ attemptedTarget: finalPct * video.duration, readyState: video.readyState, paused: video.paused })); }catch(e){ dbg('videoplay: after set currentTime'); }
      setTimeout(()=>{ try{ dbg('videoplay: after 200ms', JSON.stringify({ currentTime: video.currentTime, readyState: video.readyState, paused: video.paused })); }catch(e){ dbg('videoplay: after 200ms'); } }, 200);
      setTimeout(()=>{ try{ dbg('videoplay: after 500ms', JSON.stringify({ currentTime: video.currentTime, readyState: video.readyState, paused: video.paused })); }catch(e){ dbg('videoplay: after 500ms'); } }, 500);
    } else {
      // metadata not loaded yet: remember the desired seek percent and apply when loaded
      pendingSeekPct = finalPct;
      startPendingSeekPoll();
      filled.style.width = (finalPct * 100) + '%';
      currentEl.textContent = '0:00';
    }
    showControls();
  }

  // menu toggle
  if (menuBtn && settingsPanel) {
    menuBtn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      setMenuOpen(!menuOpen);
      showControls();
    });
  }

  // click outside to close menu (only when not fullscreen)
  document.addEventListener('click', (ev)=>{
    if (!controlsEl.contains(ev.target)) setMenuOpen(false);
  });

  function bindToggle(btn, labelOn, labelOff, eventName){
    if (!btn) return;
    btn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      const active = btn.getAttribute('aria-pressed') === 'true';
      const next = !active;
      btn.setAttribute('aria-pressed', String(next));
      btn.classList.toggle('active', next);
      btn.textContent = next ? labelOn : labelOff;
      try { video.dispatchEvent(new CustomEvent(eventName, { detail: { enabled: next } })); } catch(_){ }
      showControls();
    });
  }

  bindToggle(danmakuToggle, '弹幕开', '弹幕关', 'videoplay:danmaku');
  bindToggle(subtitleToggle, '字幕开', '字幕关', 'videoplay:subtitle');

  // volume slider (inside menu / inline in fullscreen)
  if (volumeSlider) {
    const applyVolume = (val)=>{
      const v = Math.max(0, Math.min(1, Number(val)));
      try { video.volume = v; video.muted = v === 0; } catch(_){ }
      updateVolumeIconFromValue(v);
    };
    volumeSlider.addEventListener('input', (e)=>{ applyVolume(e.target.value); showControls(); });
    applyVolume(volumeSlider.value || 1);
  }

  // fullscreen toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', async ()=>{
      try {
        if (!document.fullscreenElement) {
          // prefer making the container fullscreen so controls remain visible
          if (container.requestFullscreen) await container.requestFullscreen();
          else if (overlay.requestFullscreen) await overlay.requestFullscreen();
          const fi = fullscreenBtn.querySelector('i'); if (fi) fi.className = 'icon icon-ic_fluent_full_screen_minimize_24_regular';
          // add class to help CSS target fullscreen mode
          container.classList.add('vp-fullscreen-mode');
          syncSettingsLayout();
        } else {
          if (document.exitFullscreen) await document.exitFullscreen();
          const fi = fullscreenBtn.querySelector('i'); if (fi) fi.className = 'icon icon-ic_fluent_full_screen_maximize_24_regular';
          container.classList.remove('vp-fullscreen-mode');
          setMenuOpen(false);
          syncSettingsLayout();
        }
      } catch (err) { /* ignore */ }
    });
    // update fullscreen icon when user exits via ESC or other
    document.addEventListener('fullscreenchange', ()=>{
      const fi = fullscreenBtn.querySelector('i');
      if (!fi) return;
      fi.className = document.fullscreenElement ? 'icon icon-ic_fluent_full_screen_minimize_24_regular' : 'icon icon-ic_fluent_full_screen_maximize_24_regular';
      // ensure class toggled if user uses ESC or other global action
      if (document.fullscreenElement) container.classList.add('vp-fullscreen-mode'); else { container.classList.remove('vp-fullscreen-mode'); setMenuOpen(false); }
      syncSettingsLayout();
    });
  }

  // close on background click
  overlay.addEventListener('click', (e)=>{ if (e.target === overlay) closeVideo(); });

  // show controls on user interaction and reset hide timer
  ['mousemove','pointermove','pointerdown','touchstart','keydown'].forEach(ev => {
    overlay.addEventListener(ev, ()=>{ showControls(); }, { passive:true });
  });

  syncSettingsLayout();

  // expose a helper to open by src
  window.openVideoOverlay = openVideo;

  // auto-wire thumbnails: any element with class "videoplay-thumb" and data-src attribute
  document.querySelectorAll('.videoplay-thumb').forEach(el => {
    el.addEventListener('click', (ev)=>{
      const src = el.getAttribute('data-src') || el.dataset.src;
      if (!src) return;
      openVideo(src);
    });
  });
});
// videoplay: independent overlay video player with controls
document.addEventListener('DOMContentLoaded', function(){
    // initialize overlay wrappers: only videos explicitly marked for overlay
    function initVideoPlay() {
      const videos = Array.from(document.querySelectorAll('main video[data-overlay-player], #aside-stack video[data-overlay-player]'));
        videos.forEach((v, idx) => {
        if (v.hasAttribute('data-inline-player')) return; // inline players handled separately
            if (v.dataset.videoplayAttached) return;
            v.dataset.videoplayAttached = '1';
            // create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'videoplay-wrapper';
            const thumb = document.createElement('img');
            thumb.className = 'videoplay-thumb';
            thumb.alt = v.getAttribute('title') || v.getAttribute('alt') || '';
        const poster = v.getAttribute('poster');
        if (poster) {
          thumb.src = poster;
        } else {
          // generate a thumbnail from the video file itself
          thumb.src = '';
          try { generateThumbnailFromVideo(v, thumb); } catch (e) { /* ignore */ }
        }
            const playIcon = document.createElement('span'); playIcon.className = 'videoplay-play'; playIcon.innerHTML = '<i class="icon-ic_fluent_play_24_regular" aria-hidden="true"></i>';
            // insert wrapper before video and move video into wrapper (hide original video)
            try {
              v.parentNode.insertBefore(wrapper, v);
              wrapper.appendChild(thumb);
              wrapper.appendChild(v);
              wrapper.appendChild(playIcon);
              v.style.display = 'none';
              try { v.controls = false; v.removeAttribute('controls'); } catch(_){}
            } catch(e) { return; }
            // determine a usable src for the video (src attribute, currentSrc, or first <source>)
            const srcAttr = v.getAttribute('src') || v.currentSrc || (v.querySelector && (v.querySelector('source') || {}).src) || '';
            if (srcAttr) wrapper.setAttribute('data-src', srcAttr);
            wrapper.addEventListener('click', (e)=>{
              e.stopPropagation();
              const src = wrapper.getAttribute('data-src') || '';
              if (!src) return;
              // call the centralized overlay player implemented above
              if (window.openVideoOverlay) {
                window.openVideoOverlay(src);
              }
            });
        });
    }

    // Inline player: keep video in place with custom controls
    function initInlinePlayers(){
      const vids = Array.from(document.querySelectorAll('main video:not([data-overlay-player]), #aside-stack video:not([data-overlay-player]), article video:not([data-overlay-player]), video[data-inline-player]'));
      vids.forEach((v)=>{
        if (v.dataset.vpInlineAttached) return;
        v.dataset.vpInlineAttached = '1';
        try { v.controls = false; v.removeAttribute('controls'); } catch(_){}
        // build wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'vp-inline';
        v.parentNode.insertBefore(wrapper, v);
        wrapper.appendChild(v);

        const controls = document.createElement('div');
        controls.className = 'vp-inline-controls';
        controls.innerHTML = `
          <button class="vp-inline-play" title="播放"><i class="icon icon-ic_fluent_play_24_regular" aria-hidden="true"></i></button>
          <span class="vp-inline-time vp-inline-current">0:00</span>
          <input class="vp-inline-progress" type="range" min="0" max="100" step="0.1" value="0" aria-label="进度" />
          <span class="vp-inline-time vp-inline-duration">0:00</span>
          <button class="vp-inline-toggle vp-inline-danmaku" aria-pressed="false">弹幕关</button>
          <button class="vp-inline-toggle vp-inline-subtitle" aria-pressed="false">字幕关</button>
          <div class="vp-inline-volume">
            <i class="icon icon-ic_fluent_speaker_2_24_regular" aria-hidden="true"></i>
            <input class="vp-inline-volume-slider" type="range" min="0" max="1" step="0.05" value="1" aria-label="音量" />
          </div>
          <button class="vp-inline-fullscreen" title="全屏"><i class="icon icon-ic_fluent_full_screen_maximize_24_regular" aria-hidden="true"></i></button>
        `;
        wrapper.appendChild(controls);

        const playBtn = controls.querySelector('.vp-inline-play');
        const curEl = controls.querySelector('.vp-inline-current');
        const durEl = controls.querySelector('.vp-inline-duration');
        const progress = controls.querySelector('.vp-inline-progress');
        const danmakuBtn = controls.querySelector('.vp-inline-danmaku');
        const subtitleBtn = controls.querySelector('.vp-inline-subtitle');
        const volumeSlider = controls.querySelector('.vp-inline-volume-slider');
        const volumeIcon = controls.querySelector('.vp-inline-volume i');
        const fullscreenBtn = controls.querySelector('.vp-inline-fullscreen');

        const fmt = (sec)=>{
          if (!isFinite(sec)) return '0:00';
          const s = Math.floor(sec%60); const m = Math.floor(sec/60);
          return `${m}:${s.toString().padStart(2,'0')}`;
        };

        function syncPlayIcon(){
          const i = playBtn.querySelector('i');
          if (!i) return;
          i.className = v.paused ? 'icon icon-ic_fluent_play_24_regular' : 'icon icon-ic_fluent_pause_24_regular';
        }
        function syncProgress(){
          const pct = v.duration ? (v.currentTime / v.duration) * 100 : 0;
          progress.value = pct;
          curEl.textContent = fmt(v.currentTime);
          durEl.textContent = fmt(v.duration);
        }
        function setVolume(val){
          const vol = Math.max(0, Math.min(1, Number(val)));
          try { v.volume = vol; v.muted = vol === 0; } catch(_){ }
          if (volumeIcon) {
            let cls = 'icon icon-ic_fluent_speaker_2_24_regular';
            if (vol === 0) cls = 'icon icon-ic_fluent_speaker_mute_24_regular';
            else if (vol < 0.5) cls = 'icon icon-ic_fluent_speaker_1_24_regular';
            volumeIcon.className = cls;
          }
        }

        playBtn.addEventListener('click', ()=>{ if (v.paused) v.play(); else v.pause(); });
        v.addEventListener('play', syncPlayIcon);
        v.addEventListener('pause', syncPlayIcon);
        v.addEventListener('timeupdate', syncProgress);
        v.addEventListener('loadedmetadata', syncProgress, { once:true });

        progress.addEventListener('input', ()=>{
          if (v.duration && isFinite(v.duration)) {
            v.currentTime = (progress.value / 100) * v.duration;
            curEl.textContent = fmt(v.currentTime);
          }
        });

        volumeSlider.addEventListener('input', ()=>{ setVolume(volumeSlider.value); });
        setVolume(volumeSlider.value || 1);

        function bindToggle(btn, labelOn, labelOff, evt){
          if (!btn) return;
          btn.addEventListener('click', ()=>{
            const active = btn.getAttribute('aria-pressed') === 'true';
            const next = !active;
            btn.setAttribute('aria-pressed', String(next));
            btn.classList.toggle('active', next);
            btn.textContent = next ? labelOn : labelOff;
            try { v.dispatchEvent(new CustomEvent(evt, { detail: { enabled: next } })); } catch(_){ }
          });
        }
        bindToggle(danmakuBtn, '弹幕开', '弹幕关', 'videoplay:danmaku');
        bindToggle(subtitleBtn, '字幕开', '字幕关', 'videoplay:subtitle');

        fullscreenBtn.addEventListener('click', async ()=>{
          try {
            if (!document.fullscreenElement) {
              if (wrapper.requestFullscreen) await wrapper.requestFullscreen();
              const i = fullscreenBtn.querySelector('i'); if (i) i.className = 'icon icon-ic_fluent_full_screen_minimize_24_regular';
            } else {
              if (document.exitFullscreen) await document.exitFullscreen();
              const i = fullscreenBtn.querySelector('i'); if (i) i.className = 'icon icon-ic_fluent_full_screen_maximize_24_regular';
            }
          } catch(_){ }
        });
        document.addEventListener('fullscreenchange', ()=>{
          const i = fullscreenBtn.querySelector('i');
          if (!i) return;
          i.className = document.fullscreenElement ? 'icon icon-ic_fluent_full_screen_minimize_24_regular' : 'icon icon-ic_fluent_full_screen_maximize_24_regular';
        });

        syncPlayIcon();
        syncProgress();
      });
    }

      // Generate a thumbnail image for a video element and set it on the provided img element.

          // Observe DOM changes to catch dynamically injected videos
          const mo = new MutationObserver((mutations)=>{
            let found = false;
            for (const m of mutations) {
              if ((m.addedNodes || []).length === 0) continue;
              m.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.querySelector && node.querySelector('video')) found = true;
                if (node.nodeType === 1 && node.tagName === 'VIDEO') found = true;
              });
              if (found) break;
            }
            if (found) { initVideoPlay(); initInlinePlayers(); }
          });
            try { mo.observe(document.body, { childList: true, subtree: true }); } catch(_){ }
      // This creates a temporary offscreen video, seeks to a short time and draws a frame to canvas.
      function generateThumbnailFromVideo(sourceVideoEl, imgEl) {
        const src = sourceVideoEl.getAttribute('src') || sourceVideoEl.currentSrc || '';
        if (!src) return;
        const tmp = document.createElement('video');
        tmp.crossOrigin = 'anonymous';
        tmp.muted = true;
        tmp.playsInline = true;
        tmp.preload = 'metadata';
        // prefer same source; if source is a <source> child, try to pick first
        tmp.src = src;

        // small timeout to avoid hanging forever
        let timedOut = false;
        const to = setTimeout(() => { timedOut = true; cleanup(); }, 4000);

        function cleanup(){ try{ tmp.pause(); }catch(e){} tmp.removeAttribute('src'); tmp.load(); if (tmp.parentNode) tmp.parentNode.removeChild(tmp); clearTimeout(to); }

        tmp.addEventListener('loadedmetadata', function onmeta(){
          if (timedOut) return;
          // pick a seek time: prefer 0.5s or middle if shorter
          const seekTo = Math.min(0.5, Math.max(0, (tmp.duration && Math.min(0.5, tmp.duration/2))));
          // some files have duration 0 or NaN; fallback to 0
          try { tmp.currentTime = isFinite(seekTo) ? seekTo : 0; } catch(e){ /* seeking may throw on some browsers */ }
        }, { once: true });

        tmp.addEventListener('seeked', function onseek(){
          if (timedOut) return;
          try {
            const w = Math.min(640, tmp.videoWidth || 320);
            const h = Math.round((tmp.videoHeight || (w*9/16)) * (w / (tmp.videoWidth || w)));
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
            const data = canvas.toDataURL('image/jpeg', 0.8);
            imgEl.src = data;
          } catch (err) {
            // drawing may fail due to CORS or other reasons
          } finally {
            cleanup();
          }
        }, { once: true });

        // load error fallback
        tmp.addEventListener('error', function onerr(){ cleanup(); }, { once: true });
        // append offscreen so some browsers will load/seek
        tmp.style.position = 'fixed'; tmp.style.left = '-9999px'; tmp.style.width = '1px'; tmp.style.height = '1px'; document.body.appendChild(tmp);
      }

    // The dedicated overlay implementation below was removed because a unified
    // centered overlay (`#videoplay-overlay`) is created at the top of this
    // file and exposed via `window.openVideoOverlay(src)`. Using that overlay
    // avoids duplicate DOM and ensures the player appears centered like the
    // site's lightbox.

    // init on DOM ready and SPA events
    initVideoPlay();
    initInlinePlayers();
    document.addEventListener('spa:page:loaded', initVideoPlay);
  document.addEventListener('spa:page:loaded', initInlinePlayers);
});
