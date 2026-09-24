// World 8 — the Moon. Low gravity, Earthrise, a UFO that does not care about you.
(function () {
  const rand = KIT.rng(97);
  const stars = Array.from({ length: 160 }, () => ({ x: rand() * 1200, y: rand() * 320, r: rand() * 1.5 + 0.3, p: rand() * 6 }));
  const craters = Array.from({ length: 7 }, () => ({ x: rand() * 1200, y: 10 + rand() * 44, r: 10 + rand() * 26 }));

  function earth(ctx, x, y, r, t) {
    ctx.save();
    KIT.glow(ctx, 'rgba(90,170,255,0.7)', 40);
    ctx.fillStyle = '#2f6fd6';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    KIT.noGlow(ctx);
    ctx.clip();
    ctx.fillStyle = '#3fa66a';
    const drift = (t * 4) % (r * 4);
    [
      [-0.5, -0.2, 0.45, 0.3],
      [0.3, 0.3, 0.35, 0.25],
      [0.1, -0.55, 0.25, 0.15],
    ].forEach(([dx, dy, rx, ry]) => {
      ctx.beginPath();
      ctx.ellipse(x + dx * r - drift + r * 2, y + dy * r, rx * r, ry * r, 0.3, 0, Math.PI * 2);
      ctx.ellipse(x + dx * r - drift - r * 2, y + dy * r, rx * r, ry * r, 0.3, 0, Math.PI * 2);
      ctx.ellipse(x + dx * r - drift, y + dy * r, rx * r, ry * r, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    [
      [-0.3, -0.45, 0.35],
      [0.35, -0.05, 0.28],
      [-0.1, 0.5, 0.4],
    ].forEach(([dx, dy, rx]) => {
      ctx.beginPath();
      ctx.ellipse(x + dx * r, y + dy * r, rx * r, 0.07 * r, -0.15, 0, Math.PI * 2);
      ctx.fill();
    });
    const shade = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    shade.addColorStop(0.45, 'rgba(0,0,10,0)');
    shade.addColorStop(1, 'rgba(0,0,10,0.75)');
    ctx.fillStyle = shade;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  THEMES.push({
    id: 'moon',
    name: 'Moon',
    tagline: 'One small step. Very big jumps.',
    accent: '#a5b4fc',
    accent2: '#60a5fa',
    hud: '#eef2ff',
    dust: 'rgba(190,190,200,0.8)',
    physics: { gravity: 0.55, jump: 0.84 },

    drawBackground(ctx, f) {
      ctx.fillStyle = '#04050b';
      ctx.fillRect(0, 0, f.W, f.H);
      const neb = ctx.createRadialGradient(300, 90, 10, 300, 90, 320);
      neb.addColorStop(0, 'rgba(120,90,220,0.22)');
      neb.addColorStop(1, 'rgba(120,90,220,0)');
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, f.W, f.H);
      KIT.parallax(ctx, f.W, f.dist, 0.01, 1200, (c, ox) => {
        stars.forEach((s) => {
          c.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(f.t * 0.5 + s.p));
          c.fillStyle = '#fff';
          c.fillRect(ox + s.x, s.y, s.r, s.r);
        });
        c.globalAlpha = 1;
      });
      earth(ctx, 960, 110, 52, f.t);
      KIT.parallax(ctx, f.W, f.dist, 0.08, 1200, (c, ox) => {
        c.fillStyle = '#2a2c35';
        c.beginPath();
        c.moveTo(ox, f.G);
        for (let x = 0; x <= 1200; x += 60) c.lineTo(ox + x, f.G - 30 - Math.abs(Math.sin(x * 0.013) * 60) - (x % 180 === 0 ? 20 : 0));
        c.lineTo(ox + 1200, f.G);
        c.fill();
      });
    },

    drawGround(ctx, f) {
      ctx.fillStyle = KIT.vgrad(ctx, f.G, f.H, [
        [0, '#9a9ca5'],
        [1, '#5d5f68'],
      ]);
      ctx.fillRect(0, f.G, f.W, f.H - f.G);
      ctx.fillStyle = '#b5b7bf';
      ctx.fillRect(0, f.G, f.W, 3);
      KIT.parallax(ctx, f.W, f.dist, 1, 1200, (c, ox) => {
        craters.forEach((cr) => {
          c.fillStyle = 'rgba(40,42,50,0.45)';
          c.beginPath();
          c.ellipse(ox + cr.x, f.G + cr.y, cr.r, cr.r * 0.28, 0, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = 'rgba(210,212,220,0.35)';
          c.beginPath();
          c.ellipse(ox + cr.x + 2, f.G + cr.y + cr.r * 0.14, cr.r * 0.8, cr.r * 0.14, 0, 0, Math.PI);
          c.fill();
        });
      });
    },

    drawRunner(ctx, r, f) {
      KIT.humanoid(ctx, {
        x: r.x,
        bottom: r.bottom,
        w: r.w,
        h: r.h,
        phase: f.running ? r.phase * 0.7 : 0,
        airborne: r.airborne,
        ducking: r.ducking,
        near: '#f4f4f5',
        far: '#c4c4cc',
        torso: '#f4f4f5',
        limbW: 8,
        torsoW: 15,
        drawBack(c, shX, shY, hipX, hipY, lean) {
          c.save();
          c.translate((shX + hipX) / 2, (shY + hipY) / 2);
          c.rotate(lean);
          c.fillStyle = '#d4d4d8';
          c.beginPath();
          c.roundRect(-16, -12, 10, 22, 3);
          c.fill();
          c.restore();
        },
        drawHead(c, hx, hy) {
          c.fillStyle = '#f4f4f5';
          c.beginPath();
          c.arc(hx, hy, 11, 0, Math.PI * 2);
          c.fill();
          const g = c.createLinearGradient(hx, hy - 7, hx + 10, hy + 6);
          g.addColorStop(0, r.dead ? '#ff6b6b' : '#ffd27a');
          g.addColorStop(1, r.dead ? '#8a1c1c' : '#c26a1a');
          c.fillStyle = g;
          c.beginPath();
          c.ellipse(hx + 4, hy, 7, 7.5, 0, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = 'rgba(255,255,255,0.7)';
          c.fillRect(hx + 3, hy - 5, 3, 3);
        },
      });
    },

    drawObstacle(ctx, o, f) {
      const base = o.y + o.h;
      if (o.kind === 'small') {
        ctx.fillStyle = '#7a7c86';
        ctx.beginPath();
        ctx.moveTo(o.x, base);
        ctx.lineTo(o.x + 4, o.y + 18);
        ctx.lineTo(o.x + 14, o.y + 4);
        ctx.lineTo(o.x + 28, o.y + 10);
        ctx.lineTo(o.x + o.w, base);
        ctx.fill();
        ctx.fillStyle = '#9a9ca6';
        ctx.beginPath();
        ctx.moveTo(o.x + 4, o.y + 18);
        ctx.lineTo(o.x + 14, o.y + 4);
        ctx.lineTo(o.x + 18, o.y + 24);
        ctx.fill();
        ctx.fillStyle = 'rgba(40,40,50,0.5)';
        ctx.beginPath();
        ctx.arc(o.x + 22, o.y + 32, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (o.kind === 'tall') {
        const cx = o.x + o.w / 2;
        ctx.strokeStyle = '#c9cad2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, base);
        ctx.lineTo(cx, o.y + 16);
        ctx.moveTo(cx - 12, base);
        ctx.lineTo(cx, base - 30);
        ctx.lineTo(cx + 12, base);
        ctx.stroke();
        ctx.fillStyle = '#e4e4ea';
        ctx.beginPath();
        ctx.ellipse(cx, o.y + 12, 18, 7, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a0a1ab';
        ctx.beginPath();
        ctx.ellipse(cx, o.y + 12, 12, 4, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = Math.sin(f.t * 5 + o.seed) > 0 ? '#ff4d4d' : '#5a1a1a';
        ctx.beginPath();
        ctx.arc(cx + 3, o.y + 2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (o.kind === 'wide') {
        ctx.fillStyle = '#e4e4ea';
        ctx.beginPath();
        ctx.roundRect(o.x + 6, o.y + 14, o.w - 12, 20, 4);
        ctx.fill();
        ctx.fillStyle = '#d4a017';
        ctx.fillRect(o.x + 10, o.y + 18, o.w - 20, 6);
        ctx.strokeStyle = '#c9cad2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(o.x + o.w - 20, o.y + 14);
        ctx.lineTo(o.x + o.w - 20, o.y);
        ctx.stroke();
        ctx.fillStyle = '#e4e4ea';
        ctx.beginPath();
        ctx.arc(o.x + o.w - 20, o.y, 4, 0, Math.PI * 2);
        ctx.fill();
        [o.x + 16, o.x + o.w / 2, o.x + o.w - 16].forEach((wx) => {
          ctx.fillStyle = '#3a3b44';
          ctx.beginPath();
          ctx.arc(wx, base - 8, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#8b8c96';
          ctx.beginPath();
          ctx.arc(wx, base - 8, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        const cx = o.x + o.w / 2;
        const cy = o.y + o.h / 2 + Math.sin(f.t * 3 + o.seed) * 3;
        ctx.save();
        const beam = ctx.createLinearGradient(0, cy, 0, cy + 90);
        beam.addColorStop(0, 'rgba(140,255,170,0.25)');
        beam.addColorStop(1, 'rgba(140,255,170,0)');
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy + 6);
        ctx.lineTo(cx + 12, cy + 6);
        ctx.lineTo(cx + 30, cy + 90);
        ctx.lineTo(cx - 30, cy + 90);
        ctx.fill();
        ctx.fillStyle = 'rgba(160,255,230,0.75)';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 6, 13, 11, 0, Math.PI, 0);
        ctx.fill();
        const g = ctx.createLinearGradient(0, cy - 8, 0, cy + 10);
        g.addColorStop(0, '#d9dbe4');
        g.addColorStop(1, '#6b6e7c');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 32, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 5; i++) {
          const on = Math.floor(f.t * 8 + i) % 5 === 0;
          ctx.fillStyle = on ? '#fef08a' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(cx - 22 + i * 11, cy + 2, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    },
  });
})();
