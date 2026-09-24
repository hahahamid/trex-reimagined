// World 4 — India. Golden hour, marigold bunting, painted kerbs, an unbothered cow.
(function () {
  const rand = KIT.rng(41);
  const bunting = ['#ff9f1c', '#ff4f79', '#2ec4b6', '#ffd23f', '#ffffff'];
  const holi = ['#ff3d8b', '#ffd23f', '#2ec4b6', '#7b61ff', '#ff7a1a', '#3ddc84'];
  let powder = [];

  function skyline(ctx, ox, base, col) {
    ctx.fillStyle = col;
    // Dome with minarets.
    ctx.beginPath();
    ctx.moveTo(ox + 80, base);
    ctx.lineTo(ox + 80, base - 60);
    ctx.lineTo(ox + 180, base - 60);
    ctx.lineTo(ox + 180, base);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(ox + 95, base - 60);
    ctx.bezierCurveTo(ox + 92, base - 120, ox + 130, base - 128, ox + 130, base - 142);
    ctx.bezierCurveTo(ox + 130, base - 128, ox + 168, base - 120, ox + 165, base - 60);
    ctx.fill();
    [60, 196].forEach((dx) => {
      ctx.fillRect(ox + dx, base - 110, 8, 110);
      ctx.beginPath();
      ctx.arc(ox + dx + 4, base - 112, 7, Math.PI, 0);
      ctx.fill();
    });
    // Arch gate.
    ctx.beginPath();
    ctx.moveTo(ox + 330, base);
    ctx.lineTo(ox + 330, base - 96);
    ctx.lineTo(ox + 410, base - 96);
    ctx.lineTo(ox + 410, base);
    ctx.lineTo(ox + 388, base);
    ctx.lineTo(ox + 388, base - 50);
    ctx.arc(ox + 370, base - 50, 18, 0, Math.PI, true);
    ctx.lineTo(ox + 352, base);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(ox + 322, base - 106, 96, 12);
    // Temple tower.
    ctx.beginPath();
    ctx.moveTo(ox + 540, base);
    for (let i = 0; i < 6; i++) {
      const w = 70 - i * 10;
      const y = base - i * 20;
      ctx.lineTo(ox + 575 - w / 2, y);
      ctx.lineTo(ox + 575 - w / 2, y - 18);
    }
    ctx.lineTo(ox + 575, base - 138);
    for (let i = 5; i >= 0; i--) {
      const w = 70 - i * 10;
      const y = base - i * 20;
      ctx.lineTo(ox + 575 + w / 2, y - 18);
      ctx.lineTo(ox + 575 + w / 2, y);
    }
    ctx.fill();
  }

  const houses = Array.from({ length: 9 }, (_, i) => ({
    x: i * 120 + rand() * 20,
    w: 70 + rand() * 40,
    h: 40 + rand() * 60,
    c: ['#e98a5a', '#d9785a', '#f0a36b', '#c96e5a'][i % 4],
  }));

  function street(ctx, ox, base) {
    houses.forEach((h) => {
      ctx.fillStyle = h.c;
      ctx.fillRect(ox + h.x, base - h.h, h.w, h.h);
      ctx.fillStyle = 'rgba(80,30,20,0.35)';
      for (let wy = base - h.h + 10; wy < base - 16; wy += 18) {
        for (let wx = ox + h.x + 10; wx < ox + h.x + h.w - 14; wx += 20) ctx.fillRect(wx, wy, 8, 10);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(ox + h.x, base - h.h, h.w, 3);
    });
  }

  function buntingRow(ctx, ox, f) {
    ctx.strokeStyle = 'rgba(90,40,20,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox, 8);
    ctx.quadraticCurveTo(ox + 300, 48, ox + 600, 8);
    ctx.stroke();
    for (let i = 1; i < 20; i++) {
      const u = i / 20;
      const x = ox + u * 600;
      const y = 8 + 80 * u * (1 - u) * 1;
      const sway = Math.sin(f.t * 3 + i) * 2;
      ctx.fillStyle = bunting[i % bunting.length];
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x + 8, y);
      ctx.lineTo(x + sway, y + 16);
      ctx.fill();
    }
  }

  function auto(ctx, x, bottom, w, h, t, dead) {
    ctx.save();
    ctx.translate(x, bottom - h);
    ctx.scale(w / 60, h / 64);
    // Canopy.
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.moveTo(6, 30);
    ctx.quadraticCurveTo(4, 4, 30, 4);
    ctx.lineTo(44, 4);
    ctx.quadraticCurveTo(52, 6, 52, 18);
    ctx.lineTo(48, 30);
    ctx.fill();
    // Body.
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.moveTo(2, 30);
    ctx.lineTo(56, 30);
    ctx.quadraticCurveTo(60, 42, 58, 52);
    ctx.lineTo(4, 52);
    ctx.quadraticCurveTo(0, 40, 2, 30);
    ctx.fill();
    ctx.fillStyle = '#2a9d4b';
    ctx.fillRect(2, 44, 56, 8);
    // Windscreen + driver.
    ctx.fillStyle = 'rgba(180,230,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(46, 10);
    ctx.lineTo(51, 18);
    ctx.lineTo(48, 29);
    ctx.lineTo(44, 29);
    ctx.fill();
    ctx.fillStyle = '#5a3a28';
    ctx.beginPath();
    ctx.arc(38, 18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(33, 23, 10, 7);
    ctx.fillStyle = dead ? '#ff4f4f' : '#ff9f1c';
    ctx.beginPath();
    ctx.arc(57, 36, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Wheels.
    [12, 48].forEach((cx) => {
      ctx.fillStyle = '#141414';
      ctx.beginPath();
      ctx.arc(cx, 55, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.arc(cx, 55, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(t) * 6, 55 + Math.sin(t) * 6);
      ctx.lineTo(cx - Math.cos(t) * 6, 55 - Math.sin(t) * 6);
      ctx.stroke();
    });
    ctx.restore();
  }

  function cow(ctx, o, t) {
    const x = o.x;
    const y = o.y;
    const tail = Math.sin(t * 4 + o.seed) * 0.5;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#e8e0d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 80, y + 18);
    ctx.quadraticCurveTo(x + 88 + tail * 6, y + 30, x + 84 + tail * 10, y + 40);
    ctx.stroke();
    ctx.fillStyle = '#f5efe6';
    [14, 24, 60, 70].forEach((lx, i) => {
      ctx.fillStyle = i % 2 ? '#e2d8ca' : '#f5efe6';
      ctx.fillRect(x + lx, y + 30, 6, 20);
    });
    ctx.fillStyle = '#f5efe6';
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 10, 72, 26, 12);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 10, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8ded0';
    ctx.beginPath();
    ctx.ellipse(x + 50, y + 26, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head.
    ctx.fillStyle = '#f5efe6';
    ctx.beginPath();
    ctx.ellipse(x + 6, y + 20, 9, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2b8a2';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 28, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 4, y + 16, 2.5, 2.5);
    ctx.strokeStyle = '#ff7a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 9);
    ctx.quadraticCurveTo(x + 2, y, x + 8, y - 2);
    ctx.moveTo(x + 11, y + 10);
    ctx.quadraticCurveTo(x + 14, y + 1, x + 20, y + 1);
    ctx.stroke();
    // Marigold garland.
    ctx.fillStyle = '#ff9f1c';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x + 11 + i * 2.5, y + 22 + i * 2.2, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  THEMES.push({
    id: 'india',
    name: 'India',
    tagline: 'Honk OK please.',
    accent: '#ff9f1c',
    accent2: '#ff3d8b',
    hud: '#ffffff',
    hudShadow: '0 1px 2px rgba(90,30,0,0.6), 0 0 12px rgba(120,40,0,0.35)',
    dust: 'rgba(160,100,60,0.55)',
    physics: { gravity: 1, jump: 1 },

    onMilestone(f) {
      for (let i = 0; i < 70; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 80 + Math.random() * 260;
        powder.push({
          x: 200 + Math.random() * 800,
          y: 120 + Math.random() * 120,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 60,
          life: 0,
          max: 0.9 + Math.random() * 0.8,
          r: 3 + Math.random() * 7,
          c: holi[i % holi.length],
        });
      }
    },

    drawBackground(ctx, f) {
      KIT.sky(ctx, f.W, f.G, [
        [0, '#f79a52'],
        [0.5, '#fcc98a'],
        [1, '#ffe9cc'],
      ]);
      ctx.fillStyle = 'rgba(255,248,225,0.9)';
      KIT.glow(ctx, 'rgba(255,230,160,0.9)', 50);
      ctx.beginPath();
      ctx.arc(900, 150, 46, 0, Math.PI * 2);
      ctx.fill();
      KIT.noGlow(ctx);
      KIT.parallax(ctx, f.W, f.dist, 0.06, 760, (c, ox) => skyline(c, ox, f.G - 20, 'rgba(196,110,80,0.35)'));
      KIT.parallax(ctx, f.W, f.dist, 0.3, 1100, (c, ox) => street(c, ox, f.G));
      KIT.parallax(ctx, f.W, f.dist, 0.7, 600, (c, ox) => buntingRow(c, ox, f));
    },

    drawGround(ctx, f) {
      ctx.fillStyle = '#4b403a';
      ctx.fillRect(0, f.G, f.W, f.H - f.G);
      const off = KIT.wrap(f.dist, 48);
      for (let x = -off; x < f.W; x += 48) {
        ctx.fillStyle = '#f2c14e';
        ctx.fillRect(x, f.G, 24, 9);
        ctx.fillStyle = '#1f1f1f';
        ctx.fillRect(x + 24, f.G, 24, 9);
      }
      const d = KIT.wrap(f.dist, 120);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (let x = -d; x < f.W; x += 120) ctx.fillRect(x, f.G + 36, 60, 4);
    },

    drawRunner(ctx, r, f) {
      const bump = f.running && !r.airborne ? Math.abs(Math.sin(r.phase)) * 1.5 : 0;
      if (r.ducking) auto(ctx, r.x, r.bottom, r.w, r.h, r.phase * 2, r.dead);
      else auto(ctx, r.x - 2, r.bottom - bump, 60, 64, r.phase * 2, r.dead);
    },

    drawObstacle(ctx, o, f) {
      if (o.kind === 'small') {
        ctx.fillStyle = '#f6f1e7';
        ctx.beginPath();
        ctx.moveTo(o.x, o.y + o.h);
        ctx.lineTo(o.x, o.y + 16);
        ctx.arc(o.x + o.w / 2, o.y + 16, o.w / 2, Math.PI, 0);
        ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.fill();
        ctx.fillStyle = '#f2c14e';
        ctx.beginPath();
        ctx.arc(o.x + o.w / 2, o.y + 16, o.w / 2, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#3b2a20';
        ctx.font = '700 9px "Geist Mono", ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MUM', o.x + o.w / 2, o.y + 30);
        ctx.fillText(String(7 + (o.seed % 90 | 0)), o.x + o.w / 2, o.y + 41);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(o.x + o.w - 5, o.y + 16, 5, o.h - 16);
      } else if (o.kind === 'tall') {
        const tiers = 4;
        const th = (o.h - 10) / tiers;
        for (let i = 0; i < tiers; i++) {
          const y = o.y + 10 + i * th;
          const g = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
          g.addColorStop(0, '#8e98a3');
          g.addColorStop(0.35, '#f1f5f9');
          g.addColorStop(1, '#6b7580');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.roundRect(o.x + 2, y + 1, o.w - 4, th - 2, 4);
          ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.fillRect(o.x + 2, y + th - 4, o.w - 4, 2);
        }
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(o.x + 4, o.y + o.h - 6);
        ctx.lineTo(o.x + 4, o.y + 6);
        ctx.quadraticCurveTo(o.x + o.w / 2, o.y - 6, o.x + o.w - 4, o.y + 6);
        ctx.lineTo(o.x + o.w - 4, o.y + o.h - 6);
        ctx.stroke();
      } else if (o.kind === 'wide') {
        cow(ctx, o, f.t);
      } else {
        const sway = Math.sin(f.t * 3 + o.seed) * 0.18;
        const cx = o.x + o.w / 2;
        const cy = o.y + o.h / 2;
        ctx.strokeStyle = 'rgba(80,40,30,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + 120, cy - 60, cx + 260, -10);
        ctx.stroke();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sway);
        const kw = 26;
        const kh = 22;
        ctx.fillStyle = '#ff3d8b';
        ctx.beginPath();
        ctx.moveTo(0, -kh);
        ctx.lineTo(kw, 0);
        ctx.lineTo(0, kh);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.moveTo(0, -kh);
        ctx.lineTo(-kw, 0);
        ctx.lineTo(0, kh);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(60,20,10,0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -kh);
        ctx.lineTo(0, kh);
        ctx.moveTo(-kw, 0);
        ctx.quadraticCurveTo(0, -8, kw, 0);
        ctx.stroke();
        ctx.fillStyle = '#2ec4b6';
        ctx.beginPath();
        ctx.moveTo(0, kh - 2);
        ctx.lineTo(-6 + Math.sin(f.t * 8) * 3, kh + 12);
        ctx.lineTo(6 + Math.sin(f.t * 8) * 3, kh + 12);
        ctx.fill();
        ctx.restore();
      }
    },

    drawForeground(ctx, f) {
      if (!powder.length) return;
      powder = powder.filter((p) => (p.life += f.dt) < p.max);
      powder.forEach((p) => {
        p.vx *= 0.97;
        p.vy = p.vy * 0.97 + 40 * f.dt;
        p.x += p.vx * f.dt;
        p.y += p.vy * f.dt;
        const k = 1 - p.life / p.max;
        ctx.globalAlpha = k * 0.8;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1.6 - k * 0.6), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    },
  });
})();
