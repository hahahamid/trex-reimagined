// World 1 — the original. Pixel-faithful, slightly warmer paper.
(function () {
  const INK = '#535353';
  const PAPER = '#f7f7f5';
  const P = { '#': INK };
  const S = 3;

  const HEAD = [
    '...........########.',
    '..........##.#######',
    '..........##########',
    '..........##########',
    '..........#####.....',
    '..........########..',
    '#........#####......',
    '#.......######......',
    '##.....#########....',
    '###...#######..#....',
    '###########.........',
    '.##########.........',
    '..#########.........',
    '...#######..........',
    '....######..........',
  ];
  const DEAD_HEAD = HEAD.slice();
  DEAD_HEAD[1] = '..........##..######';
  DEAD_HEAD[2] = '..........##..######';

  const LEGS_STAND = ['....###.##..........', '....##...#..........', '....#....#..........', '....##...##.........'];
  const LEGS_A = ['....###.##..........', '....##...##.........', '....#...............', '....##..............'];
  const LEGS_B = ['....###.##..........', '.....##..#..........', '.........#..........', '.........##.........'];

  const DUCK_BODY = [
    '..................########.',
    '#......###########.#######',
    '##...#####################',
    '#####################.....',
    '#########################.',
    '.##################.......',
    '..################........',
    '...#######..#####.........',
  ];
  const DUCK_A = ['....###...#...............', '....#......##.............', '....##....................'];
  const DUCK_B = ['....###...#...............', '.....##....#..............', '...........##.............'];

  const CACTUS_S = [
    '.....##.....',
    '....####....',
    '....####....',
    '....####..#.',
    '#...####.###',
    '##..####.###',
    '##..####.###',
    '##..####.###',
    '##..#######.',
    '##..######..',
    '###.####....',
    '.#######....',
    '..######....',
    '....####....',
    '....####....',
    '....####....',
    '....####....',
    '....####....',
  ];
  const CACTUS_T = [
    '.....###.....',
    '....#####....',
    '....#####....',
    '....#####....',
    '....#####....',
    '.#..#####....',
    '###.#####..#.',
    '###.#####.###',
    '###.#####.###',
    '###.#####.###',
    '###.#####.###',
    '###.#####.###',
    '###.#####.###',
    '###.#####.###',
    '#########.###',
    '.########.###',
    '....#########',
    '....########.',
    '....#####....',
    '....#####....',
    '....#####....',
    '....#####....',
    '....#####....',
    '....#####....',
    '....#####....',
    '....#####....',
  ];
  const PTERO_UP = [
    '.......#.............',
    '.......##............',
    '.......###...........',
    '.......####..........',
    '...#...#####.........',
    '..##...######........',
    '.###...#######.......',
    '####################.',
    '....#################',
    '.....###############.',
    '......########.......',
    '.....................',
    '.....................',
    '.....................',
  ];
  const PTERO_DOWN = [
    '.....................',
    '.....................',
    '.....................',
    '.....................',
    '...#.................',
    '..##.................',
    '.###.................',
    '####################.',
    '....#################',
    '.....###############.',
    '......########.......',
    '.......#####.........',
    '.......####..........',
    '.......###...........',
  ];
  const CLOUD = [
    '.........######.........',
    '.......##......##.......',
    '..######........######..',
    '.#....................#.',
    '#......................#',
    '########################',
  ];

  const spr = {
    stand: KIT.pixel(HEAD.concat(LEGS_STAND), P),
    run: [KIT.pixel(HEAD.concat(LEGS_A), P), KIT.pixel(HEAD.concat(LEGS_B), P)],
    dead: KIT.pixel(DEAD_HEAD.concat(LEGS_STAND), P),
    duck: [KIT.pixel(DUCK_BODY.concat(DUCK_A), P), KIT.pixel(DUCK_BODY.concat(DUCK_B), P)],
    cs: KIT.pixel(CACTUS_S, P),
    ct: KIT.pixel(CACTUS_T, P),
    ptero: [KIT.pixel(PTERO_UP, P), KIT.pixel(PTERO_DOWN, P)],
    cloud: KIT.pixel(CLOUD, { '#': '#d6d6d3' }),
  };

  function at(ctx, s, cx, bottom) {
    const w = s.width * S;
    const h = s.height * S;
    KIT.sprite(ctx, s, Math.round(cx - w / 2), Math.round(bottom - h), w, h);
  }

  const rand = KIT.rng(7);
  const pebbles = Array.from({ length: 22 }, () => ({
    x: rand() * 1200,
    y: 2 + Math.floor(rand() * 3) * 4,
    w: 2 + Math.floor(rand() * 3) * 2,
  }));
  const bumps = Array.from({ length: 6 }, () => ({ x: rand() * 1200, w: 12 + rand() * 30 }));
  const clouds = Array.from({ length: 4 }, () => ({ x: rand() * 1400, y: 50 + rand() * 110 }));

  THEMES.push({
    id: 'trex',
    iconRows: HEAD.concat(LEGS_STAND),
    name: 'T-Rex',
    tagline: 'Where it all began.',
    accent: '#d6d3d1',
    accent2: '#a8a29e',
    hud: '#535353',
    dust: 'rgba(83,83,83,0.5)',
    physics: { gravity: 1, jump: 1 },

    drawBackground(ctx, f) {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, f.W, f.H);
      KIT.parallax(ctx, f.W, f.dist, 0.14, 1400, (c, ox) => {
        clouds.forEach((cl) => KIT.sprite(c, spr.cloud, Math.round(ox + cl.x), cl.y, 48 * 2, 12 * 2));
      });
    },

    drawGround(ctx, f) {
      ctx.fillStyle = INK;
      KIT.parallax(ctx, f.W, f.dist, 1, 1200, (c, ox) => {
        c.fillRect(ox, f.G - 6, 1200, 2);
        bumps.forEach((b) => c.fillRect(Math.round(ox + b.x), f.G - 8, Math.round(b.w), 2));
        pebbles.forEach((p) => c.fillRect(Math.round(ox + p.x), f.G - 4 + p.y, p.w, 2));
      });
    },

    drawRunner(ctx, r, f) {
      const frame = Math.floor(r.phase / Math.PI) % 2;
      if (r.dead) return at(ctx, spr.dead, r.x + r.w / 2, r.bottom);
      if (r.ducking) return at(ctx, spr.duck[frame], r.x + r.w / 2, r.bottom);
      if (r.airborne || !f.running) return at(ctx, spr.stand, r.x + r.w / 2, r.bottom);
      at(ctx, spr.run[frame], r.x + r.w / 2, r.bottom);
    },

    drawObstacle(ctx, o, f) {
      const cx = o.x + o.w / 2;
      const bottom = o.y + o.h;
      if (o.kind === 'small') at(ctx, spr.cs, cx, bottom);
      else if (o.kind === 'tall') at(ctx, spr.ct, cx, bottom);
      else if (o.kind === 'wide') {
        at(ctx, spr.cs, o.x + 18, bottom);
        at(ctx, spr.cs, o.x + 43, bottom);
        at(ctx, spr.cs, o.x + 68, bottom);
      } else at(ctx, spr.ptero[Math.floor(f.t * 6) % 2], cx, bottom + 4);
    },
  });
})();
