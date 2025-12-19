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
    canvas.style.zIndex = '1500';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize(){
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      alpha: rand(0.5, 0.9),
      life: 0,
      ttl: rand(10, 24),
      type: effect
    };
    // tweak by effect
    switch(effect){
      case 'sakura': p.vx *= 0.7; p.vy *= 0.7; p.size *= 0.9; break;
      case 'leaf-a': p.vx *= 1.0; p.vy *= 0.85; p.size *= 1.1; break;
      case 'leaf-b': p.vx *= 0.9; p.vy *= 0.95; p.size *= 1.05; break;
      case 'snow': p.vx *= 0.35; p.vy *= 0.5; p.size *= 0.8; p.alpha = rand(0.45, 0.8); break;
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
    const spawn = Math.max(0, Math.min(3, Math.floor((window.innerWidth/1000) * (enabled === 4 ? 3 : 2))));
    const maxParticles = Math.max(20, Math.floor(window.innerWidth / 40));
    for (let i=0;i<spawn;i++){
      if (particles.length >= maxParticles) break;
      if (Math.random() < 0.08) particles.push(createParticle(effects[enabled].name));
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
      // remove if out
      if (p.y > window.innerHeight + 50 || p.life > p.ttl*1.2) particles.splice(i,1);
    }
    raf = requestAnimationFrame(step);
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
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(0,0,size*0.45,0,Math.PI*2);
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
    // warm up some particles
    for (let i=0;i<Math.floor((window.innerWidth/1000)*3);i++) {
      if (particles.length > Math.max(10, Math.floor(window.innerWidth/60))) break;
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
  }

  // expose
  window.Particles = {
    enable,
    disable
  };
})();
