// Pure game rules: no DOM, no canvas. Shared by the browser build and node tests.
(function (root) {
  const CORE = {
    W: 1200,
    H: 400,
    GROUND: 336,
    MODE_SPAN: 500,

    RUNNER: { x: 96, w: 56, h: 64, duckW: 80, duckH: 40 },
    SIZES: {
      small: { w: 34, h: 52 },
      tall: { w: 40, h: 78 },
      wide: { w: 86, h: 50 },
      flier: { w: 64, h: 42 },
    },
    // Gap between ground and a flier's underside: jump over, duck under, run under.
    FLIER_BOTTOMS: [14, 40, 104],

    PHYS: { gravity: 2600, jumpV: 920, cutV: 560, fastFall: 3.2 },
    SPEED: { start: 390, max: 880, accel: 5.5 },
    SCORE_PER_PX: 0.025,
    FLIER_FROM: 300,

    segmentForScore(score, span) {
      return Math.floor(score / span);
    },

    // Random next world that is neither of the last two visited.
    pickNextMode(history, count, r) {
      const recent = history.slice(-2);
      const options = [];
      for (let i = 0; i < count; i++) if (!recent.includes(i)) options.push(i);
      return options[Math.min(options.length - 1, Math.floor(r * options.length))];
    },

    speedAt(t) {
      return Math.min(CORE.SPEED.max, CORE.SPEED.start + CORE.SPEED.accel * t);
    },

    scoreForDistance(d) {
      return Math.floor(d * CORE.SCORE_PER_PX);
    },

    nextGap(speed, r) {
      return speed * (0.72 + r * 0.8) + 140;
    },

    pickObstacle(score, r1, r2) {
      const fliers = score >= CORE.FLIER_FROM;
      if (fliers && r1 < 0.2) {
        const i = Math.min(CORE.FLIER_BOTTOMS.length - 1, Math.floor(r2 * CORE.FLIER_BOTTOMS.length));
        return { kind: 'flier', bottom: CORE.FLIER_BOTTOMS[i] };
      }
      const u = fliers ? (r1 - 0.2) / 0.8 : r1;
      const kind = u < 0.45 ? 'small' : u < 0.75 ? 'tall' : 'wide';
      return { kind, bottom: 0 };
    },

    spawnBlocked(score, span) {
      const m = score % span;
      return m > span - 30 || m < 25;
    },

    insetBox(b, k) {
      const dx = b.w * k;
      const dy = b.h * k;
      return { x: b.x + dx, y: b.y + dy, w: b.w - 2 * dx, h: b.h - 2 * dy };
    },

    intersects(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    },

    runnerBox(r) {
      const R = CORE.RUNNER;
      const w = r.ducking ? R.duckW : R.w;
      const h = r.ducking ? R.duckH : R.h;
      return { x: R.x, y: CORE.GROUND - r.y - h, w, h };
    },

    // Mutates r. y is height above ground (up is positive). Returns 'jump' | 'land' | null.
    stepRunner(r, input, dt, phys) {
      const P = CORE.PHYS;
      let event = null;
      if (input.jump && !r.airborne) {
        r.vy = P.jumpV * phys.jump;
        r.airborne = true;
        event = 'jump';
      }
      if (r.airborne) {
        const cut = P.cutV * phys.jump;
        if (!input.jumpHeld && r.vy > cut) r.vy = cut;
        const g = P.gravity * phys.gravity * (input.duck ? P.fastFall : 1);
        r.vy -= g * dt;
        r.y += r.vy * dt;
        if (r.y <= 0) {
          r.y = 0;
          r.vy = 0;
          r.airborne = false;
          event = 'land';
        }
      }
      r.ducking = !!input.duck && !r.airborne;
      return event;
    },
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CORE;
  else root.CORE = CORE;
})(this);
