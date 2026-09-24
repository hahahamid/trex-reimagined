// World 7 — Arctic night. Aurora ribbons, snowfall, a penguin that belly-slides.
(function () {
  const rand = KIT.rng(79);
  const stars = Array.from({ length: 70 }, () => ({ x: rand() * 1200, y: rand() * 220, r: rand() * 1.3 + 0.3, p: rand() * 6 }));
  let snow = Array.from({ length: 70 }, () => ({ x: rand() * 1200, y: rand() * 400, r: 0.8 + rand() * 2.2, s: 25 + rand() * 45 }));
  const bergs = Array.from({ length: 5 }, (_, i) => ({ x: i * 260 + rand() * 60, w: 120 + rand() * 90, h: 30 + rand() * 50 }));

  function aurora(ctx, f) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    [
      ['rgba(124,255,203,', 90, 0],
      ['rgba(179,136,255,', 60, 2],
    ].forEach(([c, amp, ph]) => {
      for (let band = 0; band < 3; band++) {
        const g = ctx.createLinearGradient(0, 40, 0, 200);
        g.addColorStop(0, c + '0)');
        g.addColorStop(0.5, c + (0.24 - band * 0.06) + ')');
        g.addColorStop(1, c + '0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        for (let x = 0; x <= f.W; x += 20) {
          const y = 90 + Math.sin(x * 0.006 + f.t * 0.5 + ph + band) * 30 + Math.sin(x * 0.013 - f.t * 0.3) * 14;
          if (x === 0) ctx.moveTo(x, y - amp);
          else ctx.lineTo(x, y - amp);
        }
        for (let x = f.W; x >= 0; x -= 20) {
          const y = 90 + Math.sin(x * 0.006 + f.t * 0.5 + ph + band) * 30 + Math.sin(x * 0.013 - f.t * 0.3) * 14;
          ctx.lineTo(x, y + 40);
        }
        ctx.fill();
      }
    });
    ctx.restore();
  }

  function penguin(ctx, r, f) {
    const slide = r.ducking;
    ctx.save();
    if (slide) {
      const cx = r.x + r.w / 2;
      const cy = r.bottom - 16;
      ctx.translate(cx, cy);
      ctx.fillStyle = '#1b2230';
      ctx.beginPath();
      ctx.ellipse(0, 0, 38, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5f9ff';
      ctx.beginPath();
      ctx.ellipse(2, 5, 30, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffa630';
      ctx.beginPath();
      ctx.moveTo(36, -4);
      ctx.lineTo(46, 0);
      ctx.lineTo(36, 3);
      ctx.fill();
      ctx.fillRect(-42, -2, 8, 4);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(26, -6, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(27, -6, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    const waddle = f.running && !r.airborne ? Math.sin(r.phase) * 0.12 : 0;
    const cx = r.x + r.w / 2;
    ctx.translate(cx, r.bottom);
    ctx.rotate(waddle);
    // Feet.
    ctx.fillStyle = '#ffa630';
    const step = f.running && !r.airborne ? Math.sin(r.phase) * 4 : 0;
    ctx.beginPath();
    ctx.ellipse(-8 + step, -3, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(8 - step, -3, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body.
    ctx.fillStyle = '#1b2230';
    ctx.beginPath();
    ctx.ellipse(0, -32, 22, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5f9ff';
    ctx.beginPath();
    ctx.ellipse(5, -28, 15, 23, 0, 0, Math.PI * 2);
    ctx.fill();
    // Flippers.
    const flap = r.airborne ? -1.2 : Math.sin(r.phase) * 0.25;
    ctx.fillStyle = '#131926';
    ctx.save();
    ctx.translate(-14, -40);
    ctx.rotate(0.35 + flap);
    ctx.beginPath();
    ctx.ellipse(0, 12, 5, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Face.
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(10, -48, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    if (r.dead) {
      ctx.fillRect(7, -49, 7, 2);
    } else {
      ctx.beginPath();
      ctx.arc(11.5, -48, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffa630';
    ctx.beginPath();
    ctx.moveTo(18, -46);
    ctx.lineTo(29, -42);
    ctx.lineTo(18, -39);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,120,150,0.5)';
    ctx.beginPath();
    ctx.arc(14, -39, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function owl(ctx, o, t) {
    const flap = Math.sin(t * 9 + o.seed);
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2 + 4;
    ctx.fillStyle = '#e8eef6';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.quadraticCurveTo(cx - 26, cy - 26 * flap, cx - 32, cy - 8 * flap);
    ctx.lineTo(cx + 6, cy + 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 14, cy - 8, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9aa7b8';
    for (let i = 0; i < 4; i++) ctx.fillRect(cx - 6 + i * 6, cy - 2 + (i % 2) * 5, 3, 2);
    ctx.fillStyle = '#ffcc33';
    ctx.beginPath();
    ctx.arc(cx - 18, cy - 10, 3.2, 0, Math.PI * 2);
    ctx.arc(cx - 10, cy - 10, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 19, cy - 11, 2, 2);
    ctx.fillRect(cx - 11, cy - 11, 2, 2);
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 6);
    ctx.lineTo(cx - 14, cy - 2);
    ctx.lineTo(cx - 12, cy - 6);
    ctx.fill();
    ctx.fillStyle = '#dde5ef';
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy);
    ctx.quadraticCurveTo(cx + 10, cy - 30 * flap, cx - 2, cy - 22 * flap);
    ctx.fill();
  }

  THEMES.push({
    id: 'arctic',
    name: 'Arctic',
    tagline: 'Northern lights, cold feet.',
    accent: '#7cffcb',
    accent2: '#b388ff',
    hud: '#e6fbff',
    dust: 'rgba(235,245,255,0.9)',
    physics: { gravity: 1, jump: 1 },

    drawBackground(ctx, f) {
      KIT.sky(ctx, f.W, f.G, [
        [0, '#050b1f'],
        [0.6, '#0e2447'],
        [1, '#1d4468'],
      ]);
      stars.forEach((s) => {
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(f.t * 0.7 + s.p));
        ctx.fillStyle = '#fff';
        ctx.fillRect(s.x, s.y, s.r, s.r);
      });
      ctx.globalAlpha = 1;
      aurora(ctx, f);
      KIT.parallax(ctx, f.W, f.dist, 0.05, 1200, (c, ox) => {
        c.fillStyle = '#2b4d73';
        c.beginPath();
        c.moveTo(ox, f.G);
        [
          [150, 120],
          [260, 70],
          [420, 150],
          [560, 90],
          [700, 130],
          [860, 60],
          [1000, 140],
          [1200, 0],
        ].forEach(([x, h]) => c.lineTo(ox + x, f.G - 20 - h));
        c.lineTo(ox + 1200, f.G);
        c.fill();
      });
      KIT.parallax(ctx, f.W, f.dist, 0.3, 1300, (c, ox) => {
        bergs.forEach((b) => {
          c.fillStyle = '#cfe8f7';
          c.beginPath();
          c.moveTo(ox + b.x, f.G);
          c.lineTo(ox + b.x + b.w * 0.2, f.G - b.h);
          c.lineTo(ox + b.x + b.w * 0.55, f.G - b.h * 0.8);
          c.lineTo(ox + b.x + b.w * 0.75, f.G - b.h * 1.1);
          c.lineTo(ox + b.x + b.w, f.G);
          c.fill();
          c.fillStyle = 'rgba(90,150,200,0.35)';
          c.beginPath();
          c.moveTo(ox + b.x + b.w * 0.55, f.G - b.h * 0.8);
          c.lineTo(ox + b.x + b.w * 0.75, f.G - b.h * 1.1);
          c.lineTo(ox + b.x + b.w, f.G);
          c.lineTo(ox + b.x + b.w * 0.6, f.G);
          c.fill();
        });
      });
    },

    drawGround(ctx, f) {
      ctx.fillStyle = KIT.vgrad(ctx, f.G, f.H, [
        [0, '#f4f9ff'],
        [1, '#b9d3ea'],
      ]);
      ctx.fillRect(0, f.G, f.W, f.H - f.G);
      ctx.fillStyle = 'rgba(120,170,215,0.35)';
      const off = KIT.wrap(f.dist, 140);
      for (let x = -off; x < f.W + 140; x += 140) {
        ctx.beginPath();
        ctx.ellipse(x + 40, f.G + 22, 50, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 110, f.G + 44, 36, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    drawRunner(ctx, r, f) {
      penguin(ctx, r, f);
    },

    drawObstacle(ctx, o, f) {
      if (o.kind === 'small') {
        const g = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
        g.addColorStop(0, 'rgba(210,245,255,0.95)');
        g.addColorStop(1, 'rgba(110,190,235,0.9)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(o.x, o.y + 12, o.w, o.h - 12, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(o.x + 4, o.y + 16, 4, o.h - 22);
        ctx.fillStyle = '#e9f6ff';
        ctx.beginPath();
        ctx.roundRect(o.x - 2, o.y + 8, o.w + 4, 8, 4);
        ctx.fill();
      } else if (o.kind === 'tall') {
        const base = o.y + o.h;
        [
          [0.2, 0.55],
          [0.5, 1],
          [0.8, 0.7],
        ].forEach(([px, ph]) => {
          const x = o.x + o.w * px;
          ctx.fillStyle = '#a8dcf5';
          ctx.beginPath();
          ctx.moveTo(x - 9, base);
          ctx.lineTo(x, base - o.h * ph);
          ctx.lineTo(x + 9, base);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.beginPath();
          ctx.moveTo(x - 3, base);
          ctx.lineTo(x, base - o.h * ph);
          ctx.lineTo(x + 1, base);
          ctx.fill();
        });
      } else if (o.kind === 'wide') {
        const base = o.y + o.h;
        ctx.fillStyle = '#8795a6';
        ctx.beginPath();
        ctx.moveTo(o.x + 4, base);
        ctx.quadraticCurveTo(o.x, base - 30, o.x + 20, base - 32);
        ctx.quadraticCurveTo(o.x + 50, base - 26, o.x + 80, base - 8);
        ctx.quadraticCurveTo(o.x + 90, base - 2, o.x + 84, base);
        ctx.fill();
        ctx.fillStyle = '#a3b0bf';
        ctx.beginPath();
        ctx.ellipse(o.x + 34, base - 10, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(o.x + 12, base - 26, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(40,40,40,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(o.x + 4, base - 20);
        ctx.lineTo(o.x - 6, base - 22);
        ctx.moveTo(o.x + 4, base - 18);
        ctx.lineTo(o.x - 6, base - 16);
        ctx.stroke();
        const flip = Math.sin(f.t * 3 + o.seed) * 4;
        ctx.fillStyle = '#6f7d8e';
        ctx.beginPath();
        ctx.ellipse(o.x + 82, base - 6 - flip, 8, 4, 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        owl(ctx, o, f.t);
      }
    },

    drawForeground(ctx, f) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      snow.forEach((s) => {
        s.y += s.s * f.dt;
        s.x -= (f.speed * 0.3 + 10) * f.dt;
        if (s.y > f.H + 4) s.y = -4;
        if (s.x < -4) s.x += f.W + 8;
        ctx.beginPath();
        ctx.arc(s.x + Math.sin(f.t + s.s) * 4, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  });
})();
