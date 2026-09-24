// World 2 — 8-bit plumber. Blue sky, rolling hills, brick floor.
(function () {
  const PAL = {
    R: '#e52521',
    H: '#6b3d0e',
    S: '#fcb07c',
    B: '#2c4fd6',
    Y: '#fcd000',
    K: '#111111',
    W: '#ffffff',
    T: '#f3c49a',
    G: '#b4541c',
  };
  const HEAD = [
    '...RRRRR....',
    '..RRRRRRRRR.',
    '..HHHSSHS...',
    '.HSHSSSHSSS.',
    '.HSHHSSSHSSS',
    '.HHSSSSHHHH.',
    '...SSSSSSS..',
  ];
  const BODY = ['..RRBRRR....', '.RRRBRRBRRR.', 'RRRRBBBBRRRR', 'SSRBYBBYBRSS', 'SSSBBBBBBSSS', 'SSBBBBBBBBSS'];
  const FEET_A = ['..BBB..BBB..', '.HHH....HHH.', 'HHHH....HHHH'];
  const FEET_B = ['...BBBBBB...', '....HHHH....', '....HHHHH...'];
  const JUMP_BODY = ['S.RRBRRR..SS', 'SRRRBRRBRRSS', 'SRRRBBBBRR..', '..RBYBBYB...', '..BBBBBBBB..', '.BBBBBBBBBB.'];
  const FEET_J = ['.BBB....BBB.', 'HHH......HHH', 'HH........HH'];

  const GOOMBA = [
    '......GGGG......',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GKKGGGGGGKKG..',
    '.GGGWKGGGGKWGGG.',
    '.GGGWKKKKKKWGGG.',
    'GGGGWKWGGWKWGGGG',
    'GGGGWWWGGWWWGGGG',
    'GGGGGGGGGGGGGGGG',
    '.GGGGTTTTTTGGGG.',
    '....TTTTTTTT....',
    '...TTTTTTTTTT...',
    '..KKTTTTTTTTKK..',
    '.KKKKTTTTTTKKKK.',
    '.KKKKK....KKKKK.',
  ];

  const spr = {
    run: [KIT.pixel(HEAD.concat(BODY, FEET_A), PAL), KIT.pixel(HEAD.concat(BODY, FEET_B), PAL)],
    jump: KIT.pixel(HEAD.concat(JUMP_BODY, FEET_J), PAL),
    goomba: KIT.pixel(GOOMBA, PAL),
  };

  const brick = document.createElement('canvas');
  brick.width = brick.height = 32;
  (function () {
    const g = brick.getContext('2d');
    g.fillStyle = '#c84c0c';
    g.fillRect(0, 0, 32, 32);
    g.fillStyle = '#fcbcb0';
    g.fillRect(0, 0, 32, 2);
    g.fillRect(0, 16, 32, 2);
    g.fillStyle = '#1a0a02';
    g.fillRect(0, 14, 32, 2);
    g.fillRect(0, 30, 32, 2);
    g.fillRect(14, 0, 2, 14);
    g.fillRect(30, 16, 2, 14);
    g.fillStyle = '#fcbcb0';
    g.fillRect(16, 2, 2, 12);
    g.fillRect(0, 18, 2, 12);
  })();
  let brickPattern = null;

  const rand = KIT.rng(11);
  const cloudXs = Array.from({ length: 3 }, () => ({ x: rand() * 1300, y: 40 + rand() * 90, n: 1 + Math.floor(rand() * 3) }));

  function cloud(ctx, x, y, n) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1b2a6b';
    ctx.lineWidth = 2;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(x + 30 + i * 34, y, 22, Math.PI, 0);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.roundRect(x + 4, y - 6, 52 + (n - 1) * 34, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#bfe3ff';
    ctx.fillRect(x + 12, y + 10, 36 + (n - 1) * 34, 4);
  }

  function hill(ctx, x, base, w, h) {
    ctx.fillStyle = '#2fb24a';
    ctx.strokeStyle = '#0b4d1c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.bezierCurveTo(x + w * 0.12, base - h, x + w * 0.88, base - h, x + w, base);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0b4d1c';
    [
      [0.38, 0.55],
      [0.52, 0.4],
      [0.6, 0.62],
    ].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.ellipse(x + w * px, base - h * py, 3, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function bush(ctx, x, base, n) {
    ctx.fillStyle = '#7fd12c';
    ctx.strokeStyle = '#0b4d1c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) ctx.arc(x + 20 + i * 26, base, 20 + (i % 2) * 5, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  }

  function qblock(ctx, x, y, w, h, t) {
    ctx.fillStyle = '#1a0a02';
    ctx.fillRect(x, y, w, h);
    const shine = 0.5 + 0.5 * Math.sin(t * 5);
    ctx.fillStyle = shine > 0.8 ? '#ffd966' : '#fcb400';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    ctx.fillStyle = '#1a0a02';
    [
      [4, 4],
      [w - 7, 4],
      [4, h - 7],
      [w - 7, h - 7],
    ].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 3, 3));
    ctx.font = `900 ${Math.round(h * 0.7)}px "Geist Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#8a3a0a';
    ctx.fillText('?', x + w / 2 + 2, y + h / 2 + 3);
    ctx.fillStyle = '#fff6d6';
    ctx.fillText('?', x + w / 2, y + h / 2 + 1);
  }

  function bullet(ctx, x, y, w, h) {
    const cy = y + h / 2;
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(x + h / 2, y);
    ctx.lineTo(x + w - 12, y);
    ctx.lineTo(x + w - 12, y + h);
    ctx.lineTo(x + h / 2, y + h);
    ctx.arc(x + h / 2, cy, h / 2, Math.PI / 2, Math.PI * 1.5);
    ctx.fill();
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(x + w - 16, y + 3, 4, h - 6);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x + w - 12, y + 5, 12, h - 10);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(x + h / 2 + 4, y + 9, 12, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x + 20, cy - 3, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(x + 16, cy - 5, 4, 8);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 12, cy - 14);
    ctx.lineTo(x + 28, cy - 9);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x + 30, y + h - 4, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  THEMES.push({
    id: 'plumber',
    name: '8-Bit Plumber',
    tagline: 'Pipes, bricks and a very angry bullet.',
    accent: '#ff5a4f',
    accent2: '#4f7bff',
    hud: '#ffffff',
    dust: 'rgba(255,255,255,0.8)',
    physics: { gravity: 1, jump: 1 },

    drawBackground(ctx, f) {
      ctx.fillStyle = '#6b8cff';
      ctx.fillRect(0, 0, f.W, f.H);
      KIT.parallax(ctx, f.W, f.dist, 0.08, 1300, (c, ox) => cloudXs.forEach((cl) => cloud(c, ox + cl.x, cl.y, cl.n)));
      KIT.parallax(ctx, f.W, f.dist, 0.25, 1000, (c, ox) => {
        hill(c, ox + 40, f.G, 320, 150);
        hill(c, ox + 560, f.G, 200, 86);
        qblock(c, ox + 760, 150, 30, 30, f.t);
        c.drawImage(brick, ox + 790, 150, 30, 30);
        qblock(c, ox + 820, 150, 30, 30, f.t + 1);
      });
      KIT.parallax(ctx, f.W, f.dist, 0.55, 900, (c, ox) => {
        bush(c, ox + 200, f.G, 3);
        bush(c, ox + 640, f.G, 2);
      });
    },

    drawGround(ctx, f) {
      if (!brickPattern) brickPattern = ctx.createPattern(brick, 'repeat');
      ctx.save();
      ctx.translate(-KIT.wrap(f.dist, 32), f.G);
      ctx.fillStyle = brickPattern;
      ctx.fillRect(0, 0, f.W + 64, f.H - f.G);
      ctx.restore();
    },

    drawRunner(ctx, r, f) {
      const frame = Math.floor(r.phase / Math.PI) % 2;
      ctx.save();
      if (r.dead) {
        KIT.sprite(ctx, spr.jump, r.x + 4, r.bottom - 64, 48, 64);
      } else if (r.ducking) {
        KIT.sprite(ctx, spr.run[frame], r.x + 6, r.bottom - 40, 64, 40);
      } else if (r.airborne) {
        KIT.sprite(ctx, spr.jump, r.x + 4, r.bottom - 64, 48, 64);
      } else {
        KIT.sprite(ctx, spr.run[f.running ? frame : 0], r.x + 4, r.bottom - 64, 48, 64);
      }
      ctx.restore();
    },

    drawObstacle(ctx, o, f) {
      if (o.kind === 'small') {
        const flip = Math.floor(f.t * 4) % 2 === 0;
        KIT.sprite(ctx, spr.goomba, o.x - 7, o.y + o.h - 48, 48, 48, flip);
      } else if (o.kind === 'tall') {
        const lip = 18;
        const body = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
        body.addColorStop(0, '#0c6a13');
        body.addColorStop(0.3, '#6fe06a');
        body.addColorStop(0.45, '#2bb33a');
        body.addColorStop(1, '#0a4f10');
        ctx.fillStyle = '#062b09';
        ctx.fillRect(o.x + 1, o.y + lip - 2, o.w - 2, o.h - lip + 2);
        ctx.fillStyle = body;
        ctx.fillRect(o.x + 4, o.y + lip, o.w - 8, o.h - lip);
        ctx.fillStyle = '#062b09';
        ctx.fillRect(o.x - 4, o.y, o.w + 8, lip);
        ctx.fillStyle = body;
        ctx.fillRect(o.x - 2, o.y + 2, o.w + 4, lip - 4);
      } else if (o.kind === 'wide') {
        const bw = o.w / 3;
        const bh = o.h / 2;
        for (let i = 0; i < 3; i++) {
          ctx.drawImage(brick, o.x + i * bw, o.y + bh, bw, bh);
          qblock(ctx, o.x + i * bw, o.y, bw, bh, f.t + i * 0.4);
        }
      } else {
        bullet(ctx, o.x, o.y, o.w, o.h);
      }
    },
  });
})();
