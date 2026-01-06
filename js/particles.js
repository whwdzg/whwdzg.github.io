/* Lightweight particle effects for settings: sakura, leaf-a, leaf-b, snow
   API: window.Particles.enable(index)  -- 0 = off, 1..n = effects
*/
(function(){
  const containerId = 'site-particles-canvas';
  let canvas = null, ctx = null;
  let raf = null;
  let particles = [];
  let enabled = 0;
  let lastTime = 0;
  const effects = {
    1: { name: 'sakura' },
    2: { name: 'leaf-a' },
    3: { name: 'leaf-b' },
    4: { name: 'snow' }
  };

  function ensureCanvas(){
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = containerId;
    canvas.style.position = 'fixed';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    // place global particle layer behind image overlays
    canvas.style.zIndex = '1000';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  // Image overlay accumulation (only used for snow)
  let imageOverlays = []; // { img, canvas, ctx, rect, accum, width, height, dpr }
  // default to no image overlays (particles pass over images without mask/accum)
  let overlayMode = 'none'; // 'none' = no overlays; 'mask' = draw uniform overlay; 'accum' = particle accumulation

  function shouldTrackImage(img) {
    try {
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      // ignore tiny icons
      return w >= 64 && h >= 32;
    } catch (_) { return false; }
  }

  function createOverlayForImage(img) {
    const rect = img.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // ensure image is wrapped inside a dedicated wrapper so overlay aligns to the image box
    let wrapper = null;
    let createdWrapper = false;
    if (img.parentElement && img.parentElement.classList && img.parentElement.classList.contains('particle-image-wrapper')) {
      wrapper = img.parentElement;
    } else {
      // create wrapper
      wrapper = document.createElement('div');
      wrapper.className = 'particle-image-wrapper';
      // copy display style from image
      try {
        const cs = window.getComputedStyle(img);
        wrapper.style.display = cs && cs.display ? cs.display : 'block';
      } catch (_) { wrapper.style.display = 'block'; }
      wrapper.style.position = 'relative';
      // insert wrapper before img and move img into it
      const p = img.parentElement || document.body;
      p.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      createdWrapper = true;
    }
    const ov = document.createElement('canvas');
    ov.className = 'particle-image-overlay';
    ov.style.position = 'absolute';
    ov.style.left = '0px';
    ov.style.top = '0px';
    ov.style.width = '100%';
    ov.style.height = '100%';
    ov.style.pointerEvents = 'none';
    ov.style.zIndex = '1401';
    wrapper.appendChild(ov);
    const ctx2 = ov.getContext('2d');
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    ov.width = Math.floor(width * dpr);
    ov.height = Math.floor(height * dpr);
    ctx2.setTransform(dpr,0,0,dpr,0,0);
    // accumulation per-pixel column (CSS pixels)
    const accum = new Float32Array(width);
    imageOverlays.push({ img, canvas: ov, ctx: ctx2, rect: rect, accum, width, height, dpr, wrapper, createdWrapper });
  }

  function rebuildOverlays() {
    // remove existing overlays and unwrap images if we created wrappers
    imageOverlays.forEach(o => {
      try {
        if (o && o.canvas) o.canvas.remove();
        if (o && o.createdWrapper && o.wrapper) {
          const w = o.wrapper;
          const parent = w.parentElement;
          if (o.img && parent) parent.insertBefore(o.img, w);
          w.remove();
        }
      } catch(_){}
    });
    imageOverlays = [];
    // if overlays are disabled, do not create wrappers/canvases
    if (overlayMode !== 'accum') return;

    // find candidate images (only when accumulation overlays are enabled)
    const imgs = Array.from(document.querySelectorAll('img'));
    imgs.forEach(img => {
      if (!shouldTrackImage(img)) return;
      if (!img.complete) {
        img.addEventListener('load', function onload(){
          try { createOverlayForImage(img); updateOverlayRects(); } catch(_){ }
        }, { once: true });
      } else {
        createOverlayForImage(img);
      }
    });
      // overlay application is handled during the animation step when needed
  }

  function applyMaskToOverlays(effectName) {
    if (!effectName) return;
    imageOverlays.forEach(o => {
      try {
        const ctx2 = o.ctx;
        const w = o.width;
        const h = o.height;
        ctx2.clearRect(0,0,w,h);
        if (effectName === 'snow') {
          // translucent white overlay with stronger visibility
          ctx2.fillStyle = 'rgba(255,255,255,0.18)';
          ctx2.fillRect(0,0,w,h);
          // small flecks (brighter)
          ctx2.fillStyle = 'rgba(255,255,255,0.46)';
          for (let i=0;i<Math.floor((w*h)/6000);i++) {
            const x = Math.floor(Math.random()*w);
            const y = Math.floor(Math.random()*h);
            const s = Math.random()*2.2 + 0.6;
            ctx2.beginPath(); ctx2.arc(x, y, s, 0, Math.PI*2); ctx2.fill();
          }
        } else if (effectName === 'sakura') {
          ctx2.fillStyle = 'rgba(255,200,210,0.12)';
          ctx2.fillRect(0,0,w,h);
        } else if (effectName.indexOf('leaf') === 0) {
          // warm translucent overlay
          ctx2.fillStyle = 'rgba(220,190,150,0.12)';
          ctx2.fillRect(0,0,w,h);
        } else {
          ctx2.clearRect(0,0,w,h);
        }
        o.maskEffect = effectName;
      } catch(_){}
    });
  }

  function clearOverlayMasks() {
    imageOverlays.forEach(o => {
      try { o.ctx.clearRect(0,0,o.width,o.height); o.maskEffect = null; } catch(_){}
    });
  }

  function updateOverlayRects() {
    imageOverlays.forEach(o => {
      try {
        // rect should match wrapper bounding box if available
        const rect = (o.wrapper && o.wrapper.getBoundingClientRect) ? o.wrapper.getBoundingClientRect() : o.img.getBoundingClientRect();
        o.rect = rect;
        // overlay is positioned inside parent as 100% width/height; ensure canvas internal pixel size matches
        // if size changed, recreate accum buffer
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        if (w !== o.width || h !== o.height) {
          const dpr = o.dpr || (window.devicePixelRatio || 1);
          o.width = w; o.height = h; o.canvas.width = Math.floor(w * dpr); o.canvas.height = Math.floor(h * dpr);
          o.ctx.setTransform(dpr,0,0,dpr,0,0);
          o.accum = new Float32Array(w);
        }
      } catch (_) {}
    });
  }

  function resize(){
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // update overlays when main canvas resizes
    updateOverlayRects();
  }

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function createParticle(effect){
    const w = window.innerWidth;
    const h = window.innerHeight;
    const p = {
      x: rand(0, w),
      y: rand(-50, -10),
      vx: rand(-0.25, 0.25),
      vy: rand(0.2, 0.8),
      size: rand(4, 12),
      rot: rand(0, Math.PI*2),
      vrots: rand(-0.02, 0.02),
      // increase opacity baseline so particles are less transparent
      alpha: rand(0.75, 1.0),
      life: 0,
      ttl: rand(10, 24),
      type: effect
    };
    // tweak by effect
    switch(effect){
      case 'sakura': p.vx *= 0.7; p.vy *= 0.7; p.size *= 0.9; p.alpha = Math.min(1, p.alpha * 1.0); break;
      case 'leaf-a': p.vx *= 1.0; p.vy *= 0.85; p.size *= 1.1; p.alpha = Math.min(1, p.alpha * 1.0); break;
      case 'leaf-b': p.vx *= 0.9; p.vy *= 0.95; p.size *= 1.05; p.alpha = Math.min(1, p.alpha * 1.0); break;
      case 'snow': p.vx *= 0.4; p.vy *= 0.45; p.size *= 1.05; p.alpha = rand(0.9, 1.0); break;
    }
    return p;
  }

  function step(ts){
    if (!lastTime) lastTime = ts;
    const dt = Math.min(40, ts - lastTime) / 1000;
    lastTime = ts;
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    // spawn rate
    // limit spawn and overall particle count to keep effect light
    // adjusted for narrow viewports: base rate + width-scaled rate
    const w = window.innerWidth;
    const effectName = effects[enabled].name;
    const baseSpawn = (w < 768) ? 1 : 0.5;  // more base spawn for narrow screens
    const spawnBoost = effectName === 'snow' ? 1.35 : 1;
    const spawn = Math.max(0, Math.min(4, Math.floor((baseSpawn + (w/1000) * (effectName === 'snow' ? 3.6 : 2)) * spawnBoost)));
    const baseMax = (w < 768) ? 30 : 20;     // higher base max for narrow screens
    const maxParticles = Math.max(baseMax, Math.floor((effectName === 'snow' ? 1.6 : 1) * w / 35));
    const spawnChance = effectName === 'snow' ? 0.18 : 0.1;
    for (let i=0;i<spawn;i++){
      if (particles.length >= maxParticles) break;
      if (Math.random() < spawnChance) particles.push(createParticle(effectName));
    }
    // update
    for (let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.life += dt;
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.rot += p.vrots;
      // gentle oscillation for leaves
      if (p.type.indexOf('leaf') === 0 || p.type === 'sakura') p.x += Math.sin(p.life*2 + p.size) * 0.6;
      // draw
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha * (1 - p.life / p.ttl));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      // draw by type
      if (p.type === 'sakura'){
        drawPetal(ctx, p.size, p.type);
      } else if (p.type.indexOf('leaf') === 0){
        drawLeaf(ctx, p.size, p.type);
      } else if (p.type === 'snow'){
        drawSnow(ctx, p.size);
      }
      ctx.restore();
      // overlay accumulation for snow: only active when overlayMode === 'accum'
      if (imageOverlays.length && overlayMode === 'accum') {
        for (let oi = 0; oi < imageOverlays.length; oi++) {
          const o = imageOverlays[oi];
          const r = o.rect;
          if (!r) continue;
          // only consider if particle is over the image rect
          if (p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom) {
            const localX = Math.floor(p.x - r.left);
            if (localX >= 0 && localX < o.width) {
              if (p.type === 'snow') {
                // increase accumulation by particle size * alpha
                o.accum[localX] = Math.min(o.height, o.accum[localX] + (p.size * p.alpha * 0.25));
              } else if (p.type === 'sakura' || p.type.indexOf('leaf') === 0) {
                // determine landing: if particle near bottom of image or very slow vertically, make it land once
                const distToBottom = r.bottom - p.y; // distance in viewport px
                const prevY = p.y - p.vy * 60 * dt;
                const nextY = p.y + p.vy * 60 * dt;
                const slowFall = Math.abs(p.vy) < 0.25; // more tolerant slow threshold
                const nearBottom = distToBottom < (p.size * 0.9);
                const willCross = nextY >= (r.bottom - 2);
                const enteringFromTop = prevY < r.top && p.y >= r.top;
                if (enteringFromTop || nearBottom || slowFall || willCross || p.life > p.ttl * 0.6) {
                  // compute deposit position relative to overlay (from top)
                  const stack = o.accum[localX] || 0;
                  const depSize = Math.max(1, Math.floor(p.size/1.2));
                  // if entering from top, place at that y; otherwise place on top of accum stack from bottom
                  const depY = enteringFromTop ? Math.max(0, Math.floor(p.y - r.top)) : Math.max(0, o.height - Math.floor(stack) - depSize);
                  if (!o.deposits) o.deposits = [];
                  // make deposits long-lived so they appear to stay on image
                  o.deposits.push({ x: localX, y: depY, size: depSize, alpha: p.alpha, type: p.type, life: 0, ttl: 3600 });
                  // increase accumulation under deposit so future particles land on top
                  o.accum[localX] = Math.min(o.height, (o.accum[localX] || 0) + depSize);
                  // remove this particle (landed)
                  particles.splice(i, 1);
                  // continue to next particle (we already removed current)
                  continue;
                }
                // otherwise don't create continuous deposits (avoid trailing)
              }
            }
          }
        }
      }
      // remove if out
      if (p.y > window.innerHeight + 50 || p.life > p.ttl*1.2) particles.splice(i,1);
    }
    raf = requestAnimationFrame(step);
    // draw accumulation overlays (for snow) if accumulation mode is active
    if (imageOverlays.length && overlayMode === 'accum') {
      imageOverlays.forEach(o => {
        try {
          const ctx2 = o.ctx;
          const w = o.width;
          const h = o.height;
          ctx2.clearRect(0,0,w,h);
          // draw accumulation as white semi-opaque layer from bottom up (more opaque)
          ctx2.fillStyle = 'rgba(255,255,255,0.98)';
          for (let x = 0; x < w; x++) {
            const col = Math.max(0, Math.min(h, o.accum[x] || 0));
            if (col > 0) {
              // draw vertical column at x from bottom
              ctx2.fillRect(x, h - col, 1, col);
              // decay accumulation a bit faster for visible effect
              o.accum[x] = Math.max(0, (o.accum[x] || 0) - (0.08 + Math.random()*0.04));
            }
          }
          // draw small deposits for petals/leaves (short-lived)
          if (o.deposits && o.deposits.length) {
            for (let di = o.deposits.length - 1; di >= 0; di--) {
              const d = o.deposits[di];
              d.life += dt || 0.016;
              const progress = Math.min(1, d.life / d.ttl);
              const a = Math.max(0, d.alpha * (1 - progress));
              if (d.type === 'sakura') {
                ctx2.fillStyle = `rgba(255,180,200,${a})`;
                // draw small ellipse
                ctx2.beginPath(); ctx2.ellipse(d.x, Math.max(0, Math.min(h, d.y)), d.size, d.size*1.2, 0, 0, Math.PI*2); ctx2.fill();
              } else if (d.type.indexOf('leaf') === 0) {
                const color = (d.type === 'leaf-a') ? 'rgba(200,140,70,' + a + ')' : 'rgba(220,180,80,' + a + ')';
                ctx2.fillStyle = color;
                ctx2.beginPath(); ctx2.moveTo(d.x - d.size*0.5, d.y); ctx2.quadraticCurveTo(d.x, d.y - d.size*0.8, d.x + d.size*0.5, d.y); ctx2.quadraticCurveTo(d.x, d.y + d.size*0.8, d.x - d.size*0.5, d.y); ctx2.fill();
              }
              if (d.life >= d.ttl) o.deposits.splice(di, 1);
            }
          }
        } catch (_) {}
      });
    }
  }

  function drawPetal(ctx, size){
    ctx.fillStyle = 'rgba(255,180,200,1)';
    ctx.beginPath();
    ctx.ellipse(0, 0, size*0.6, size, 0, 0, Math.PI*2);
    ctx.fill();
  }
  function drawLeaf(ctx, size, type){
    ctx.fillStyle = (type==='leaf-a') ? 'rgba(200,140,70,1)' : 'rgba(220,180,80,1)';
    ctx.beginPath();
    ctx.moveTo(-size*0.5,0);
    ctx.quadraticCurveTo(0, -size*0.8, size*0.5,0);
    ctx.quadraticCurveTo(0, size*0.8, -size*0.5,0);
    ctx.fill();
  }
  function drawSnow(ctx, size){
    const radius = size * 0.55;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0.45)');
    ctx.fillStyle = g;
    ctx.shadowBlur = radius * 0.8;
    ctx.shadowColor = 'rgba(255,255,255,0.65)';
    ctx.beginPath();
    ctx.arc(0,0,radius,0,Math.PI*2);
    ctx.fill();
  }

  function enable(idx){
    idx = Number(idx) || 0;
    if (!idx){
      disable();
      return;
    }
    const eff = effects[idx];
    if (!eff) { disable(); return; }
    enabled = idx;
    ensureCanvas();
    // prepare overlays for images (used for snow, sakura, leaves)
    try { rebuildOverlays(); } catch(_){ }
    // keep overlays responsive
    window.addEventListener('scroll', updateOverlayRects);
    window.addEventListener('resize', updateOverlayRects);
      // overlays will be drawn/updated during animation step
    // warm up some particles
    const w = window.innerWidth;
    const warmupBase = (w < 768) ? 15 : 5;    // more initial particles for narrow screens
    const warmupMax = (w < 768) ? 25 : Math.max(10, Math.floor(w/60));
    const warmupBoost = eff.name === 'snow' ? 1.35 : 1;
    for (let i=0; i < Math.floor(warmupBase + (w/1000)*3); i++) {
      if (particles.length > warmupMax * warmupBoost) break;
      particles.push(createParticle(eff.name));
    }
    if (!raf) raf = requestAnimationFrame(step);
  }

  function disable(){
    enabled = 0;
    if (raf){ cancelAnimationFrame(raf); raf = null; }
    particles = [];
    lastTime = 0;
    if (canvas){ canvas.remove(); canvas = null; ctx = null; }
    window.removeEventListener('resize', resize);
    // clear masks
    try { clearOverlayMasks(); } catch(_){}
    // cleanup overlays
    try {
      imageOverlays.forEach(o => {
        try {
          if (o && o.canvas) o.canvas.remove();
          if (o && o.createdWrapper && o.wrapper) {
            // move img back out and remove wrapper
            const w = o.wrapper;
            const parent = w.parentElement;
            if (o.img && parent) parent.insertBefore(o.img, w);
            w.remove();
          }
        } catch(_){}
      });
    } catch(_) {}
    imageOverlays = [];
    window.removeEventListener('scroll', updateOverlayRects);
    window.removeEventListener('resize', updateOverlayRects);
  }

  // expose
  window.Particles = {
    enable,
    disable
    , rebuildOverlays
  };
})();
