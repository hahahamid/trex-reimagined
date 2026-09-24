// World 3 — synthwave. Striped sun, chrome horizon, perspective grid.
(function () {
  const HORIZON = 252;
  const CYAN = '#2de2e6';
  const PINK = '#ff2bd6';
  const HOT = '#ff3864';

  const sun = document.createElement('canvas');
  sun.width = sun.height = 260;
  (function () {
    const g = sun.getContext('2d');
    const grad = g.createLinearGradient(0, 20, 0, 240);
    grad.addColorStop(0, '#ffe35a');
    grad.addColorStop(0.45, '#ff8a3d');
    grad.addColorStop(1, '#ff2975');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(130, 130, 110, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 8; i++) {
      const y = 140 + i * 13 + i * i * 0.6;
      g.fillRect(0, y, 260, 2 + i * 0.9);
    }
  })();

  const rand = KIT.rng(23);
  const stars = Array.from({ length: 90 }, () => ({ x: rand() * 1200, y: rand() * 200, r: rand() * 1.4 + 0.3, p: rand() * 6 }));
  const peaks = Array.from({ length: 14 }, (_, i) => ({ x: i * 110, h: 30 + rand() * 60 }));

  function mountains(ctx, ox) {
    ctx.beginPath();
    ctx.moveTo(ox, HORIZON);
    peaks.forEach((p, i) => {
      ctx.lineTo(ox + p.x + 55, HORIZON - p.h);
      ctx.lineTo(ox + p.x + 110, HORIZON - (i % 3 === 0 ? 10 : 22));
    });
    ctx.lineTo(ox + 1540, HORIZON);
    ctx.closePath();
    ctx.fillStyle = '#1b0b33';
    ctx.fill();
    ctx.strokeStyle = PINK;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function neonStroke(ctx, color, blur, fn) {
    ctx.save();
    KIT.glow(ctx, color, blur);
    ctx.strokeStyle = color;
    fn();
    ctx.restore();
  }

  THEMES.push({
    id: 'synthwave',
    name: 'Synthwave',
    tagline: 'Neon never sleeps.',
    accent: '#ff2bd6',
    accent2: '#2de2e6',
    hud: '#ffe7fb',
    dust: 'rgba(45,226,230,0.8)',
    physics: { gravity: 1, jump: 1 },

    drawBackground(ctx, f) {
      KIT.sky(ctx, f.W, HORIZON, [
        [0, '#07011a'],
        [0.55, '#2a0a4a'],
        [1, '#8a1a6e'],
      ]);
      stars.forEach((s) => {
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(f.t * 0.8 + s.p));
        ctx.fillStyle = '#fff';
        ctx.fillRect(s.x, s.y, s.r, s.r);
      });
      ctx.globalAlpha = 1;
      ctx.save();
      KIT.glow(ctx, '#ff5e8a', 60);
      ctx.drawImage(sun, 760, HORIZON - 190);
      ctx.restore();
      KIT.parallax(ctx, f.W, f.dist, 0.05, 1540, mountains);
    },

    drawGround(ctx, f) {
      ctx.fillStyle = KIT.vgrad(ctx, HORIZON, f.H, [
        [0, '#2a0845'],
        [1, '#07010f'],
      ]);
      ctx.fillRect(0, HORIZON, f.W, f.H - HORIZON);

      const vp = f.W / 2;
      const depth = f.H - HORIZON;
      const sG = (f.G - HORIZON) / depth;
      const off = KIT.wrap(f.dist, 90);
      ctx.save();
      KIT.glow(ctx, PINK, 12);
      ctx.strokeStyle = 'rgba(255,43,214,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = -30; i <= 44; i++) {
        const bx = i * 90 - off;
        const topX = vp + (bx - vp) * (0.02 / sG);
        const botX = vp + (bx - vp) * (1 / sG);
        ctx.moveTo(topX, HORIZON);
        ctx.lineTo(botX, f.H);
      }
      for (let k = 0; k < 12; k++) {
        const s = Math.pow(k / 11, 2.1);
        const y = HORIZON + depth * s;
        ctx.moveTo(0, y);
        ctx.lineTo(f.W, y);
      }
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = KIT.vgrad(ctx, HORIZON - 6, HORIZON + 26, [
        [0, 'rgba(255,56,100,0)'],
        [0.3, 'rgba(255,120,160,0.55)'],
        [1, 'rgba(255,56,100,0)'],
      ]);
      ctx.fillRect(0, HORIZON - 6, f.W, 32);
    },

    drawRunner(ctx, r, f) {
      ctx.save();
      KIT.glow(ctx, CYAN, 14);
      KIT.humanoid(ctx, {
        x: r.x,
        bottom: r.bottom,
        w: r.w,
        h: r.h,
        phase: f.running ? r.phase : 0,
        airborne: r.airborne,
        ducking: r.ducking,
        near: CYAN,
        far: '#157d8a',
        torso: CYAN,
        limbW: 5,
        torsoW: 8,
        drawHead(c, hx, hy) {
          c.fillStyle = '#0b0220';
          c.strokeStyle = CYAN;
          c.lineWidth = 3;
          c.beginPath();
          c.arc(hx, hy, 9, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          c.fillStyle = r.dead ? '#fff' : PINK;
          c.fillRect(hx - 1, hy - 3, 11, 4);
        },
      });
      ctx.restore();
    },

    drawObstacle(ctx, o, f) {
      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      if (o.kind === 'small') {
        ctx.fillStyle = 'rgba(45,226,230,0.14)';
        neonStroke(ctx, CYAN, 16, () => {
          ctx.beginPath();
          ctx.moveTo(o.x, o.y + o.h);
          ctx.lineTo(o.x + o.w / 2, o.y);
          ctx.lineTo(o.x + o.w, o.y + o.h);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(o.x + o.w / 2, o.y);
          ctx.lineTo(o.x + o.w * 0.62, o.y + o.h);
          ctx.stroke();
        });
      } else if (o.kind === 'tall') {
        ctx.fillStyle = 'rgba(255,43,214,0.12)';
        neonStroke(ctx, PINK, 18, () => {
          ctx.beginPath();
          ctx.moveTo(o.x + 6, o.y + o.h);
          ctx.lineTo(o.x + 12, o.y + 10);
          ctx.lineTo(o.x + o.w / 2, o.y);
          ctx.lineTo(o.x + o.w - 12, o.y + 10);
          ctx.lineTo(o.x + o.w - 6, o.y + o.h);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
        const pulse = 0.5 + 0.5 * Math.sin(f.t * 6 + o.seed);
        ctx.fillStyle = `rgba(255,227,90,${0.5 + pulse * 0.5})`;
        for (let i = 0; i < 3; i++) ctx.fillRect(o.x + 13, o.y + 22 + i * 16, o.w - 26, 3);
      } else if (o.kind === 'wide') {
        neonStroke(ctx, HOT, 14, () => {
          ctx.beginPath();
          ctx.moveTo(o.x + 10, o.y + 16);
          ctx.lineTo(o.x + 10, o.y + o.h);
          ctx.moveTo(o.x + o.w - 10, o.y + 16);
          ctx.lineTo(o.x + o.w - 10, o.y + o.h);
          ctx.stroke();
        });
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.w, 20, 4);
        ctx.clip();
        ctx.fillStyle = '#12021f';
        ctx.fillRect(o.x, o.y, o.w, 20);
        ctx.fillStyle = HOT;
        for (let i = -1; i < 7; i++) {
          ctx.beginPath();
          ctx.moveTo(o.x + i * 16, o.y + 20);
          ctx.lineTo(o.x + i * 16 + 8, o.y + 20);
          ctx.lineTo(o.x + i * 16 + 20, o.y);
          ctx.lineTo(o.x + i * 16 + 12, o.y);
          ctx.fill();
        }
        ctx.restore();
        neonStroke(ctx, HOT, 12, () => {
          ctx.beginPath();
          ctx.roundRect(o.x, o.y, o.w, 20, 4);
          ctx.stroke();
        });
      } else {
        // Floating cassette.
        const bob = Math.sin(f.t * 4 + o.seed) * 2;
        const y = o.y + bob;
        ctx.fillStyle = '#1a0630';
        neonStroke(ctx, PINK, 16, () => {
          ctx.beginPath();
          ctx.roundRect(o.x, y, o.w, o.h, 5);
          ctx.fill();
          ctx.stroke();
        });
        ctx.fillStyle = '#ffe35a';
        ctx.fillRect(o.x + 6, y + 5, o.w - 12, 8);
        ctx.fillStyle = '#0b0220';
        ctx.beginPath();
        ctx.roundRect(o.x + 12, y + 17, o.w - 24, 14, 7);
        ctx.fill();
        [o.x + 22, o.x + o.w - 22].forEach((cx) => {
          ctx.save();
          ctx.translate(cx, y + 24);
          ctx.rotate(f.t * 8);
          ctx.strokeStyle = CYAN;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.moveTo(-5, 0);
          ctx.lineTo(5, 0);
          ctx.moveTo(0, -5);
          ctx.lineTo(0, 5);
          ctx.stroke();
          ctx.restore();
        });
      }
      ctx.restore();
    },

    drawForeground(ctx, f) {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let y = 0; y < f.H; y += 4) ctx.fillRect(0, y, f.W, 1);
    },
  });
})();
