// World 6 — Japan. Fuji at dawn, drifting sakura, a ninja with a scarf that never stops.
(function () {
  const rand = KIT.rng(67);
  let petals = Array.from({ length: 36 }, () => ({
    x: rand() * 1200,
    y: rand() * 400,
    r: 3 + rand() * 3,
    s: 20 + rand() * 30,
    a: rand() * 6,
  }));
  const trees = Array.from({ length: 5 }, (_, i) => ({ x: i * 260 + rand() * 80, s: 0.8 + rand() * 0.5 }));

  function fuji(ctx, ox, base) {
    ctx.fillStyle = '#7d8bb0';
    ctx.beginPath();
    ctx.moveTo(ox, base);
    ctx.lineTo(ox + 260, base - 170);
    ctx.lineTo(ox + 320, base - 170);
    ctx.lineTo(ox + 600, base);
    ctx.fill();
    ctx.fillStyle = '#f8f8ff';
    ctx.beginPath();
    ctx.moveTo(ox + 214, base - 140);
    ctx.lineTo(ox + 260, base - 170);
    ctx.lineTo(ox + 320, base - 170);
    ctx.lineTo(ox + 372, base - 136);
    for (let i = 0; i < 6; i++) ctx.lineTo(ox + 362 - i * 26, base - (i % 2 ? 120 : 132));
    ctx.fill();
  }

  function pagoda(ctx, x, base) {
    ctx.fillStyle = '#6d4c6e';
    for (let i = 0; i < 4; i++) {
      const w = 70 - i * 12;
      const y = base - i * 28;
      ctx.fillRect(x - w / 2 + 10, y - 22, w - 20, 22);
      ctx.beginPath();
      ctx.moveTo(x - w / 2 - 8, y - 20);
      ctx.quadraticCurveTo(x, y - 34, x + w / 2 + 8, y - 20);
      ctx.lineTo(x + w / 2 - 4, y - 26);
      ctx.lineTo(x - w / 2 + 4, y - 26);
      ctx.fill();
    }
    ctx.fillRect(x - 1.5, base - 140, 3, 30);
  }

  function sakura(ctx, x, base, s) {
    ctx.strokeStyle = '#5b3a44';
    ctx.lineWidth = 6 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.quadraticCurveTo(x + 6, base - 40 * s, x - 10 * s, base - 70 * s);
    ctx.moveTo(x + 3, base - 36 * s);
    ctx.quadraticCurveTo(x + 24 * s, base - 50 * s, x + 30 * s, base - 72 * s);
    ctx.stroke();
    ctx.fillStyle = '#ffb7c5';
    [
      [-18, -78, 26],
      [10, -92, 30],
      [34, -76, 24],
      [-2, -64, 22],
    ].forEach(([dx, dy, r]) => {
      ctx.beginPath();
      ctx.arc(x + dx * s, base + dy * s, r * s, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#ffd1dc';
    ctx.beginPath();
    ctx.arc(x + 4 * s, base - 98 * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  THEMES.push({
    id: 'japan',
    name: 'Japan',
    tagline: 'Silent feet, falling petals.',
    accent: '#ff5c7a',
    accent2: '#ffb7c5',
    hud: '#3d1f2b',
    dust: 'rgba(90,70,80,0.45)',
    physics: { gravity: 1, jump: 1 },

    drawBackground(ctx, f) {
      KIT.sky(ctx, f.W, f.G, [
        [0, '#ffd6de'],
        [0.6, '#ffe8e0'],
        [1, '#fff4ea'],
      ]);
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(820, 130, 64, 0, Math.PI * 2);
      ctx.fill();
      KIT.parallax(ctx, f.W, f.dist, 0.03, 1400, (c, ox) => fuji(c, ox + 400, f.G - 10));
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(0, f.G - 60, f.W, 60);
      KIT.parallax(ctx, f.W, f.dist, 0.2, 1000, (c, ox) => {
        pagoda(c, ox + 180, f.G);
        c.fillStyle = '#b8455a';
        c.fillRect(ox + 640, f.G - 60, 5, 60);
        c.fillRect(ox + 690, f.G - 60, 5, 60);
        c.fillRect(ox + 630, f.G - 62, 76, 6);
        c.fillRect(ox + 636, f.G - 50, 64, 4);
      });
      KIT.parallax(ctx, f.W, f.dist, 0.5, 1300, (c, ox) => trees.forEach((t) => sakura(c, ox + t.x, f.G, t.s)));
    },

    drawGround(ctx, f) {
      ctx.fillStyle = '#2f2a3a';
      ctx.fillRect(0, f.G, f.W, f.H - f.G);
      ctx.fillStyle = '#4a4258';
      ctx.fillRect(0, f.G, f.W, 5);
      const off = KIT.wrap(f.dist, 64);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      for (let x = -off; x < f.W; x += 64) {
        ctx.fillRect(x, f.G + 5, 2, 26);
        ctx.fillRect(x + 32, f.G + 31, 2, 33);
      }
      ctx.fillRect(0, f.G + 31, f.W, 2);
    },

    drawRunner(ctx, r, f) {
      const t = f.t;
      KIT.humanoid(ctx, {
        x: r.x,
        bottom: r.bottom,
        w: r.w,
        h: r.h,
        phase: f.running ? r.phase : 0,
        airborne: r.airborne,
        ducking: r.ducking,
        near: '#1d1b2c',
        far: '#0e0d17',
        torso: '#1d1b2c',
        limbW: 6,
        torsoW: 11,
        drawBack(c, shX, shY) {
          c.strokeStyle = '#e63946';
          c.lineWidth = 4;
          c.beginPath();
          c.moveTo(shX, shY - 2);
          for (let i = 1; i <= 4; i++) {
            c.lineTo(shX - i * 8, shY + 2 + Math.sin(t * 14 - i) * (2 + i * 1.5));
          }
          c.stroke();
        },
        drawHead(c, hx, hy) {
          c.fillStyle = '#1d1b2c';
          c.beginPath();
          c.arc(hx, hy, 9.5, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#f4d3b5';
          c.fillRect(hx - 2, hy - 3, 11, 5);
          c.fillStyle = '#111';
          c.fillRect(hx + 3, hy - 2, r.dead ? 4 : 2.5, r.dead ? 1.5 : 3);
          c.fillStyle = '#e63946';
          c.fillRect(hx - 9, hy - 8, 18, 3.5);
          c.strokeStyle = '#e63946';
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(hx - 8, hy - 7);
          c.quadraticCurveTo(hx - 18, hy - 10 + Math.sin(t * 16) * 3, hx - 24, hy - 4 + Math.sin(t * 14) * 4);
          c.stroke();
        },
      });
    },

    drawObstacle(ctx, o, f) {
      const cx = o.x + o.w / 2;
      const base = o.y + o.h;
      if (o.kind === 'small') {
        ctx.fillStyle = '#8b8795';
        ctx.fillRect(cx - 5, base - 22, 10, 22);
        ctx.fillRect(cx - 14, base - 6, 28, 6);
        ctx.fillStyle = '#a19dab';
        ctx.fillRect(cx - 12, base - 36, 24, 14);
        ctx.fillStyle = '#ffcf7a';
        ctx.fillRect(cx - 5, base - 33, 10, 8);
        ctx.fillStyle = '#716d7c';
        ctx.beginPath();
        ctx.moveTo(cx - 19, base - 36);
        ctx.lineTo(cx, base - 48);
        ctx.lineTo(cx + 19, base - 36);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, base - 50, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (o.kind === 'tall') {
        [
          [-12, 0, '#4f9d3a'],
          [0, -6, '#62b347'],
          [12, 4, '#3f8a2f'],
        ].forEach(([dx, dy, col]) => {
          const x = cx + dx - 4;
          const top = o.y + 6 + dy;
          ctx.fillStyle = col;
          ctx.fillRect(x, top, 8, base - top);
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          for (let y = top + 14; y < base; y += 18) ctx.fillRect(x, y, 8, 2);
          ctx.fillStyle = '#7cc95d';
          ctx.beginPath();
          ctx.ellipse(x + 12, top + 10, 8, 2.5, -0.5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (o.kind === 'wide') {
        [o.x + 21, o.x + o.w - 21].forEach((bx) => {
          ctx.fillStyle = '#f1e6cf';
          ctx.beginPath();
          ctx.roundRect(bx - 19, base - 44, 38, 44, 6);
          ctx.fill();
          ctx.fillStyle = '#6b4a2f';
          ctx.fillRect(bx - 19, base - 40, 38, 4);
          ctx.fillRect(bx - 19, base - 8, 38, 4);
          ctx.strokeStyle = '#c1121f';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(bx, base - 22, 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#c1121f';
          ctx.fillRect(bx - 1.5, base - 28, 3, 12);
        });
      } else {
        const flap = Math.sin(f.t * 10 + o.seed);
        const y = o.y + o.h / 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(o.x, y - 6);
        ctx.lineTo(o.x + 14, y);
        ctx.lineTo(o.x + 50, y + 2);
        ctx.lineTo(o.x + 64, y - 12);
        ctx.lineTo(o.x + 44, y + 8);
        ctx.lineTo(o.x + 18, y + 8);
        ctx.fill();
        ctx.fillStyle = '#f2e8ec';
        ctx.beginPath();
        ctx.moveTo(o.x + 20, y + 2);
        ctx.lineTo(o.x + 40, y - 22 * flap);
        ctx.lineTo(o.x + 44, y + 2);
        ctx.fill();
        ctx.fillStyle = '#ffd1dc';
        ctx.beginPath();
        ctx.moveTo(o.x + 26, y + 2);
        ctx.lineTo(o.x + 30, y - 14 * flap);
        ctx.lineTo(o.x + 40, y + 2);
        ctx.fill();
      }
    },

    drawForeground(ctx, f) {
      ctx.fillStyle = '#ffb7c5';
      petals.forEach((p) => {
        p.y += p.s * f.dt;
        p.x -= (f.speed * 0.35 + 20) * f.dt;
        p.a += f.dt * 2;
        if (p.y > f.H + 10) p.y = -10;
        if (p.x < -10) p.x += f.W + 20;
        ctx.save();
        ctx.translate(p.x + Math.sin(p.a) * 8, p.y);
        ctx.rotate(p.a);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    },
  });
})();
