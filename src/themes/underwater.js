// World 5 — underwater. Floaty physics, god rays, a very yellow submarine.
(function () {
  const rand = KIT.rng(53);
  const rocks = Array.from({ length: 8 }, (_, i) => ({ x: i * 150 + rand() * 40, w: 90 + rand() * 90, h: 40 + rand() * 90 }));
  const weeds = Array.from({ length: 14 }, () => ({ x: rand() * 1200, h: 30 + rand() * 50, p: rand() * 6 }));
  let bubbles = Array.from({ length: 40 }, () => ({ x: rand() * 1200, y: rand() * 400, r: 1 + rand() * 3.5, s: 20 + rand() * 40 }));
  let trail = [];

  function sub(ctx, x, bottom, w, h, t, ducking, dead) {
    ctx.save();
    const bodyH = ducking ? h * 0.8 : 34;
    const top = bottom - bodyH - 4;
    // Periscope and tower.
    if (!ducking) {
      ctx.fillStyle = '#e0a800';
      ctx.fillRect(x + 30, bottom - h, 4, 22);
      ctx.fillRect(x + 30, bottom - h, 12, 5);
      ctx.fillStyle = '#ffd000';
      ctx.beginPath();
      ctx.roundRect(x + 20, top - 12, 22, 16, 4);
      ctx.fill();
    }
    const g = ctx.createLinearGradient(0, top, 0, top + bodyH);
    g.addColorStop(0, '#ffe45c');
    g.addColorStop(1, '#e0a200');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, top + bodyH / 2, w / 2, bodyH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 4, top + 7, w / 2 - 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const px = x + 16 + i * ((w - 26) / 2);
      ctx.fillStyle = '#8a6200';
      ctx.beginPath();
      ctx.arc(px, top + bodyH / 2, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dead ? '#ff5a5a' : '#8fe3ff';
      ctx.beginPath();
      ctx.arc(px, top + bodyH / 2, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Propeller.
    const blade = Math.sin(t * 3) * 8;
    ctx.fillStyle = '#9aa3ad';
    ctx.fillRect(x - 5, top + bodyH / 2 - 2, 6, 4);
    ctx.beginPath();
    ctx.ellipse(x - 6, top + bodyH / 2, 2.5, Math.abs(blade) + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function jelly(ctx, o, t) {
    const pulse = Math.sin(t * 5 + o.seed);
    const cx = o.x + o.w / 2;
    const top = o.y + pulse * 2;
    const bw = o.w * 0.36 + pulse * 3;
    ctx.save();
    KIT.glow(ctx, 'rgba(255,140,220,0.9)', 18);
    ctx.fillStyle = 'rgba(255,150,220,0.75)';
    ctx.beginPath();
    ctx.moveTo(cx - bw, top + 20);
    ctx.bezierCurveTo(cx - bw, top - 4, cx + bw, top - 4, cx + bw, top + 20);
    ctx.quadraticCurveTo(cx, top + 26, cx - bw, top + 20);
    ctx.fill();
    KIT.noGlow(ctx);
    ctx.strokeStyle = 'rgba(255,180,235,0.7)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const tx = cx - bw + 5 + i * ((bw * 2 - 10) / 4);
      ctx.beginPath();
      ctx.moveTo(tx, top + 22);
      ctx.quadraticCurveTo(tx + Math.sin(t * 6 + i) * 6, top + 32, tx + Math.sin(t * 5 + i) * 4, o.y + o.h + 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  THEMES.push({
    id: 'underwater',
    name: 'Deep Sea',
    tagline: 'Everything floats down here.',
    accent: '#22d3ee',
    accent2: '#3b82f6',
    hud: '#e0f7ff',
    dust: 'rgba(210,190,140,0.6)',
    physics: { gravity: 0.72, jump: 0.88 },

    drawBackground(ctx, f) {
      KIT.sky(ctx, f.W, f.H, [
        [0, '#0b7fb8'],
        [0.5, '#075a8a'],
        [1, '#03304f'],
      ]);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const x = 120 + i * 190 + Math.sin(f.t * 0.4 + i) * 30;
        const g = ctx.createLinearGradient(0, 0, 0, f.G);
        g.addColorStop(0, 'rgba(180,240,255,0.16)');
        g.addColorStop(1, 'rgba(180,240,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 50, 0);
        ctx.lineTo(x - 60, f.G);
        ctx.lineTo(x - 160, f.G);
        ctx.fill();
      }
      ctx.restore();
      KIT.parallax(ctx, f.W, f.dist, 0.15, 1200, (c, ox) => {
        c.fillStyle = 'rgba(4,40,70,0.55)';
        rocks.forEach((r) => {
          c.beginPath();
          c.ellipse(ox + r.x, f.G, r.w / 2, r.h, 0, Math.PI, 0);
          c.fill();
        });
      });
      KIT.parallax(ctx, f.W, f.dist, 0.4, 1200, (c, ox) => {
        c.strokeStyle = 'rgba(20,120,90,0.6)';
        c.lineWidth = 5;
        c.lineCap = 'round';
        weeds.forEach((w) => {
          c.beginPath();
          c.moveTo(ox + w.x, f.G);
          c.quadraticCurveTo(ox + w.x + Math.sin(f.t * 1.5 + w.p) * 12, f.G - w.h / 2, ox + w.x + Math.sin(f.t * 1.2 + w.p) * 8, f.G - w.h);
          c.stroke();
        });
      });
    },

    drawGround(ctx, f) {
      ctx.fillStyle = KIT.vgrad(ctx, f.G, f.H, [
        [0, '#d9bd8c'],
        [1, '#a8875a'],
      ]);
      ctx.fillRect(0, f.G, f.W, f.H - f.G);
      ctx.strokeStyle = 'rgba(120,90,50,0.35)';
      ctx.lineWidth = 2;
      const off = KIT.wrap(f.dist, 80);
      for (let row = 0; row < 3; row++) {
        ctx.beginPath();
        for (let x = -off - 80; x < f.W + 80; x += 80) {
          const y = f.G + 14 + row * 16;
          ctx.moveTo(x + row * 26, y);
          ctx.quadraticCurveTo(x + row * 26 + 20, y - 5, x + row * 26 + 40, y);
        }
        ctx.stroke();
      }
    },

    drawRunner(ctx, r, f) {
      const bob = f.running && !r.airborne ? Math.sin(f.t * 5) * 1.5 : 0;
      sub(ctx, r.x - 2, r.bottom + bob, r.ducking ? r.w : 60, r.h, f.t * 10, r.ducking, r.dead);
      if (f.running && Math.random() < 0.4) {
        trail.push({ x: r.x - 8, y: r.bottom - 20 + (Math.random() - 0.5) * 10, r: 1.5 + Math.random() * 2.5, life: 0 });
      }
    },

    drawObstacle(ctx, o, f) {
      if (o.kind === 'small') {
        ctx.strokeStyle = '#ff6f91';
        ctx.lineCap = 'round';
        const base = o.y + o.h;
        const cx = o.x + o.w / 2;
        const branch = (x, y, a, len, wd, d) => {
          const x2 = x + Math.sin(a) * len;
          const y2 = y - Math.cos(a) * len;
          ctx.lineWidth = wd;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          if (d > 0) {
            branch(x2, y2, a - 0.5, len * 0.72, wd * 0.75, d - 1);
            branch(x2, y2, a + 0.45, len * 0.7, wd * 0.75, d - 1);
          } else {
            ctx.fillStyle = '#ffb3c6';
            ctx.beginPath();
            ctx.arc(x2, y2, wd * 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        };
        branch(cx, base, 0, 22, 8, 2);
      } else if (o.kind === 'tall') {
        const cx = o.x + o.w / 2;
        const cy = o.y + 18;
        ctx.strokeStyle = '#3b4a57';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(f.t * 2 + o.seed) * 3, o.y + o.h - 8);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#2d3942';
        ctx.fillRect(o.x + 8, o.y + o.h - 8, o.w - 16, 8);
        ctx.fillStyle = '#39454f';
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14);
          ctx.lineTo(cx + Math.cos(a + 0.2) * 20, cy + Math.sin(a + 0.2) * 20);
          ctx.lineTo(cx + Math.cos(a + 0.4) * 14, cy + Math.sin(a + 0.4) * 14);
          ctx.fill();
        }
        const g = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 17);
        g.addColorStop(0, '#6b7a86');
        g.addColorStop(1, '#1f2932');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = Math.sin(f.t * 6) > 0 ? '#ff4d4d' : '#7a1f1f';
        ctx.beginPath();
        ctx.arc(cx, cy - 4, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (o.kind === 'wide') {
        const x = o.x + 8;
        const w = o.w - 16;
        const y = o.y + 12;
        ctx.save();
        KIT.glow(ctx, 'rgba(255,220,100,0.9)', 22);
        ctx.fillStyle = '#ffe07a';
        ctx.fillRect(x + 4, y + 4, w - 8, 6);
        ctx.restore();
        ctx.fillStyle = '#7a4a22';
        ctx.beginPath();
        ctx.roundRect(x, y + 10, w, o.h - 22, 3);
        ctx.fill();
        ctx.fillStyle = '#8f5a2b';
        ctx.beginPath();
        ctx.moveTo(x - 2, y + 10);
        ctx.lineTo(x + 4, y - 8);
        ctx.lineTo(x + w - 4, y - 8);
        ctx.lineTo(x + w + 2, y + 10);
        ctx.fill();
        ctx.fillStyle = '#e2b13c';
        ctx.fillRect(x + 8, y - 8, 5, o.h - 4);
        ctx.fillRect(x + w - 13, y - 8, 5, o.h - 4);
        ctx.fillRect(x + w / 2 - 5, y + 12, 10, 10);
      } else {
        jelly(ctx, o, f.t);
      }
    },

    drawForeground(ctx, f) {
      ctx.fillStyle = 'rgba(210,245,255,0.5)';
      bubbles.forEach((b) => {
        b.y -= b.s * f.dt;
        b.x -= f.speed * 0.2 * f.dt;
        if (b.y < -10) b.y = f.H + 10;
        if (b.x < -10) b.x += f.W + 20;
        ctx.beginPath();
        ctx.arc(b.x + Math.sin(f.t * 2 + b.s) * 3, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      trail = trail.filter((p) => (p.life += f.dt) < 0.8);
      trail.forEach((p) => {
        p.x -= f.speed * f.dt * 0.6;
        p.y -= 30 * f.dt;
        ctx.globalAlpha = 1 - p.life / 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    },
  });
})();
