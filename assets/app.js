/* The page notices when you stop.
 *   awake  — lamp at full, dust sparse, no moth
 *   idle   — after 8s: lamp dims, dust thickens, moth appears and orbits
 */
(() => {
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const mI = document.getElementById('m-i');
  const mS = document.getElementById('m-s');
  const mL = document.getElementById('m-l');

  let lastMove = performance.now(), idleT = 0, lamp = 1, moth = 0, t = 0;
  let mx = W / 2;

  const dust = [];
  for (let i = 0; i < 220; i++) dust.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + 0.3, ph: Math.random() * 6.28, sp: 0.1 + Math.random() * 0.4 });

  c.addEventListener('pointermove', (e) => {
    const r = c.getBoundingClientRect();
    mx = (e.clientX - r.left) * (W / r.width);
    lastMove = performance.now();
  }, { passive: true });

  function frame() {
    t += 0.016;
    const since = (performance.now() - lastMove) / 1000;
    idleT = since;
    const idle = since > 8;
    const target = idle ? 0.42 : 1;
    lamp += (target - lamp) * 0.045;
    moth += ((idle ? 1 : 0) - moth) * 0.02;

    // room
    ctx.fillStyle = '#0a0806';
    ctx.fillRect(0, 0, W, H);

    // lamp cone from the top-left
    const lx = 190, ly = 40;
    const cone = ctx.createRadialGradient(lx, ly, 10, lx, ly, 620);
    cone.addColorStop(0, `rgba(255,215,150,${0.30 * lamp})`);
    cone.addColorStop(0.35, `rgba(255,190,110,${0.13 * lamp})`);
    cone.addColorStop(1, 'rgba(255,180,100,0)');
    ctx.fillStyle = cone;
    ctx.fillRect(0, 0, W, H);

    // desk + a book, so there is something in the light
    ctx.fillStyle = '#14100c';
    ctx.fillRect(0, H - 90, W, 90);
    ctx.fillStyle = '#1b1611';
    ctx.fillRect(420, H - 132, 260, 42);
    ctx.fillStyle = 'rgba(255,220,170,.06)';
    ctx.fillRect(420, H - 132, 260, 3);

    // the small creature on the book edge
    const cy = H - 140 - Math.sin(t * 0.9) * (idle ? 2 : 0.6);
    const cx = 560 + Math.sin(t * 0.4) * 12;
    ctx.fillStyle = `rgba(${120 + 40 * lamp},${100 + 30 * lamp},${90 + 20 * lamp},1)`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 13, 11 + (idle ? 2 : 0), 0, 0, 6.283);
    ctx.fill();
    // eyes blink slower when idle
    const blink = (Math.sin(t * (idle ? 0.7 : 1.6)) > 0.96) ? 0.15 : 1;
    ctx.fillStyle = '#1a1410';
    ctx.beginPath(); ctx.ellipse(cx - 4, cy - 3, 1.6, 2.2 * blink, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 4, cy - 3, 1.6, 2.2 * blink, 0, 0, 6.283); ctx.fill();

    // dust — sparse when awake, thick when idle
    const count = Math.floor(60 + 160 * moth);
    for (let i = 0; i < count; i++) {
      const d = dust[i];
      d.y += d.sp * (0.3 + 0.5 * moth);
      d.x += Math.sin(t * 0.5 + d.ph) * 0.3;
      if (d.y > H) { d.y = -4; d.x = Math.random() * W; }
      const dist = Math.hypot(d.x - lx, d.y - ly);
      const lit = Math.max(0, 1 - dist / 620) * lamp;
      ctx.fillStyle = `rgba(255,225,180,${lit * 0.55})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
    }

    // the moth, once it is idle enough
    if (moth > 0.02) {
      const a = t * 0.8;
      const mxp = cx + Math.cos(a) * (70 + Math.sin(a * 1.7) * 26);
      const myp = cy - 40 + Math.sin(a * 1.3) * 34;
      ctx.globalAlpha = moth;
      ctx.fillStyle = 'rgba(255,235,200,.7)';
      const f = Math.abs(Math.sin(t * 18)) * 4 + 2;
      ctx.beginPath(); ctx.ellipse(mxp - 4, myp, 4, f, -0.5, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.ellipse(mxp + 4, myp, 4, f, 0.5, 0, 6.283); ctx.fill();
      ctx.globalAlpha = 1;
    }

    mI.textContent = since.toFixed(1) + 's';
    mS.textContent = idle ? 'idle' : 'awake';
    mL.textContent = Math.round(lamp * 100) + '%';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.documentElement.dataset.ready = '1';
})();
