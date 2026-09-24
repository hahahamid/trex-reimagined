// Drawing helpers shared by every theme.
(function (root) {
  const KIT = {};

  KIT.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  KIT.lerp = (a, b, t) => a + (b - a) * t;
  KIT.wrap = (v, m) => ((v % m) + m) % m;
  KIT.easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  KIT.easeOut = (t) => 1 - Math.pow(1 - t, 3);

  KIT.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Rows of characters -> offscreen canvas at 1px per cell. '.' is transparent.
  KIT.pixel = function (rows, palette) {
    const w = Math.max(...rows.map((r) => r.length));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = rows.length;
    const g = c.getContext('2d');
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const col = palette[row[x]];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    });
    return c;
  };

  KIT.sprite = function (ctx, spr, x, y, w, h, flip) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (flip) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(spr, 0, 0, w, h);
    } else {
      ctx.drawImage(spr, x, y, w, h);
    }
    ctx.restore();
  };

  KIT.rrect = function (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  };

  KIT.vgrad = function (ctx, y0, y1, stops) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  };

  KIT.sky = function (ctx, W, H, stops) {
    ctx.fillStyle = KIT.vgrad(ctx, 0, H, stops);
    ctx.fillRect(0, 0, W, H);
  };

  // Repeating parallax strip. drawTile(ctx, originX) paints one tile of width `tile`.
  KIT.parallax = function (ctx, W, dist, factor, tile, drawTile) {
    const off = KIT.wrap(dist * factor, tile);
    for (let x = -off; x < W; x += tile) drawTile(ctx, x);
  };

  KIT.glow = function (ctx, color, blur) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
  };

  KIT.noGlow = function (ctx) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  function limb(ctx, x, y, a1, l1, a2, l2) {
    const kx = x + Math.sin(a1) * l1;
    const ky = y + Math.cos(a1) * l1;
    const fx = kx + Math.sin(a2) * l2;
    const fy = ky + Math.cos(a2) * l2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    return { kx, ky, fx, fy };
  }

  // Stick-figure rig with real gait. Angles are measured from straight down, positive = forward.
  // o: { x, bottom, w, h, phase, airborne, ducking, near, far, torso, limbW, torsoW, drawHead(ctx, hx, hy, angle), drawBack? }
  KIT.humanoid = function (ctx, o) {
    const duck = o.ducking;
    const lean = duck ? 1.2 : o.airborne ? 0.22 : 0.16;
    const hipX = o.x + (duck ? o.w * 0.34 : o.w * 0.44);
    const hipY = o.bottom - (duck ? 18 : o.airborne ? 28 : 27);
    const torsoLen = duck ? 26 : 22;
    const shX = hipX + Math.sin(lean) * torsoLen;
    const shY = hipY - Math.cos(lean) * torsoLen;
    const thigh = duck ? 12 : 14;
    const shin = duck ? 11 : 14;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function legs(i) {
      const p = o.phase + i * Math.PI;
      let a1, a2;
      if (o.airborne) {
        a1 = i ? 1.1 : 0.2;
        a2 = i ? -0.3 : -0.9;
      } else {
        a1 = Math.sin(p) * (duck ? 0.7 : 0.85) + (duck ? -0.5 : 0);
        a2 = a1 - (0.25 + 1.2 * Math.max(0, Math.cos(p)));
      }
      return limb(ctx, hipX, hipY, a1, thigh, a2, shin);
    }
    function arms(i) {
      const p = o.phase + i * Math.PI + Math.PI;
      let a1, a2;
      if (o.airborne) {
        a1 = i ? -2.3 : 2.4;
        a2 = a1 + 0.6;
      } else {
        a1 = Math.sin(p) * 0.9 + (duck ? 1.4 : 0);
        a2 = a1 + 1.3;
      }
      return limb(ctx, shX, shY + 2, a1, 11, a2, 10);
    }

    // Far side first, darker.
    ctx.strokeStyle = o.far;
    ctx.lineWidth = o.limbW;
    legs(1);
    arms(1);

    if (o.drawBack) o.drawBack(ctx, shX, shY, hipX, hipY, lean);

    ctx.strokeStyle = o.torso;
    ctx.lineWidth = o.torsoW;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(shX, shY);
    ctx.stroke();

    ctx.strokeStyle = o.near;
    ctx.lineWidth = o.limbW;
    const nearLeg = legs(0);
    const nearArm = arms(0);

    const hx = shX + Math.sin(lean) * 11;
    const hy = shY - Math.cos(lean) * 11;
    o.drawHead(ctx, hx, hy, lean);
    ctx.restore();
    return { hipX, hipY, shX, shY, hx, hy, nearLeg, nearArm };
  };

  root.KIT = KIT;
})(this);
