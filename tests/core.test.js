const test = require('node:test');
const assert = require('node:assert/strict');
const CORE = require('../src/core.js');

const NORMAL = { gravity: 1, jump: 1 };

function freshRunner() {
  return { y: 0, vy: 0, airborne: false, ducking: false };
}

function simulateJump(phys, duckInAir) {
  const r = freshRunner();
  let t = 0;
  let apex = 0;
  CORE.stepRunner(r, { jump: true, jumpHeld: true, duck: false }, 1 / 120, phys);
  while (r.airborne && t < 5) {
    CORE.stepRunner(r, { jump: false, jumpHeld: true, duck: duckInAir && r.vy < 0 }, 1 / 120, phys);
    apex = Math.max(apex, r.y);
    t += 1 / 120;
  }
  return { r, t, apex };
}

const RANDS = Array.from({ length: 100 }, (_, i) => i / 100);

test('pickNextMode never repeats either of the last two worlds', () => {
  for (const r of RANDS) {
    const next = CORE.pickNextMode([5, 2, 7], 8, r);
    assert.ok(next !== 2 && next !== 7, `got ${next}`);
    assert.ok(next >= 0 && next < 8);
  }
});

test('pickNextMode with one world of history only excludes that world', () => {
  const seen = new Set(RANDS.map((r) => CORE.pickNextMode([3], 8, r)));
  assert.equal(seen.has(3), false);
  assert.equal(seen.size, 7);
});

test('pickNextMode can reach every allowed world', () => {
  const seen = new Set(RANDS.map((r) => CORE.pickNextMode([0, 1], 8, r)));
  assert.deepEqual([...seen].sort(), [2, 3, 4, 5, 6, 7]);
});

test('pickNextMode never returns out of range at r close to 1', () => {
  assert.ok(CORE.pickNextMode([0, 1], 8, 0.999999) <= 7);
});

test('segmentForScore counts completed spans', () => {
  assert.equal(CORE.segmentForScore(0, 500), 0);
  assert.equal(CORE.segmentForScore(499, 500), 0);
  assert.equal(CORE.segmentForScore(500, 500), 1);
  assert.equal(CORE.segmentForScore(1250, 500), 2);
});

test('speedAt starts at start speed, is monotonic, and caps at max', () => {
  assert.equal(CORE.speedAt(0), CORE.SPEED.start);
  assert.equal(CORE.speedAt(1e6), CORE.SPEED.max);
  assert.ok(CORE.speedAt(10) > CORE.speedAt(5));
});

test('intersects detects overlap but not touching edges', () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  assert.equal(CORE.intersects(a, { x: 5, y: 5, w: 10, h: 10 }), true);
  assert.equal(CORE.intersects(a, { x: 10, y: 0, w: 10, h: 10 }), false);
  assert.equal(CORE.intersects(a, { x: 50, y: 50, w: 10, h: 10 }), false);
});

test('insetBox shrinks symmetrically', () => {
  assert.deepEqual(CORE.insetBox({ x: 0, y: 0, w: 100, h: 50 }, 0.1), { x: 10, y: 5, w: 80, h: 40 });
});

test('stepRunner jumps, rises, and lands back on the ground', () => {
  const { r, apex } = simulateJump(NORMAL, false);
  assert.ok(apex > 100, `apex ${apex} should clear tall obstacles`);
  assert.equal(r.y, 0);
  assert.equal(r.airborne, false);
});

test('stepRunner blocks double jumps', () => {
  const r = freshRunner();
  CORE.stepRunner(r, { jump: true, jumpHeld: true, duck: false }, 1 / 60, NORMAL);
  const vyAfterFirst = r.vy;
  CORE.stepRunner(r, { jump: true, jumpHeld: true, duck: false }, 1 / 60, NORMAL);
  assert.ok(r.vy < vyAfterFirst);
});

test('ducking in the air fast-falls and lands sooner', () => {
  const normal = simulateJump(NORMAL, false);
  const fast = simulateJump(NORMAL, true);
  assert.ok(fast.t < normal.t);
});

test('ducking on the ground sets ducking state', () => {
  const r = freshRunner();
  CORE.stepRunner(r, { jump: false, jumpHeld: false, duck: true }, 1 / 60, NORMAL);
  assert.equal(r.ducking, true);
});

test('low gravity yields a higher, longer jump', () => {
  const normal = simulateJump(NORMAL, false);
  const moon = simulateJump({ gravity: 0.6, jump: 0.86 }, false);
  assert.ok(moon.apex > normal.apex);
  assert.ok(moon.t > normal.t);
});

test('releasing jump early gives a shorter jump', () => {
  const full = simulateJump(NORMAL, false);
  const r = freshRunner();
  let apex = 0;
  CORE.stepRunner(r, { jump: true, jumpHeld: true, duck: false }, 1 / 120, NORMAL);
  while (r.airborne) {
    CORE.stepRunner(r, { jump: false, jumpHeld: false, duck: false }, 1 / 120, NORMAL);
    apex = Math.max(apex, r.y);
  }
  assert.ok(apex < full.apex);
  assert.ok(apex > CORE.SIZES.small.h, 'a tap still clears a small obstacle');
});

test('nextGap grows with speed and always leaves room to land', () => {
  const slow = CORE.nextGap(CORE.SPEED.start, 0);
  const fast = CORE.nextGap(CORE.SPEED.max, 0);
  assert.ok(fast > slow);
  const airtime = (2 * CORE.PHYS.jumpV) / CORE.PHYS.gravity;
  assert.ok(fast > CORE.SPEED.max * airtime * 0.9);
});

test('pickObstacle never spawns fliers early, can spawn them later', () => {
  for (let i = 0; i < 20; i++) {
    assert.notEqual(CORE.pickObstacle(100, i / 20, 0.5).kind, 'flier');
  }
  const late = CORE.pickObstacle(2000, 0, 0.5);
  assert.equal(late.kind, 'flier');
  assert.ok(CORE.FLIER_BOTTOMS.includes(late.bottom));
});

test('mid-height flier hits a standing runner but clears a ducking one', () => {
  const S = CORE.SIZES.flier;
  const bottom = CORE.FLIER_BOTTOMS[1];
  const flier = CORE.insetBox({ x: CORE.RUNNER.x, y: CORE.GROUND - bottom - S.h, w: S.w, h: S.h }, 0.12);
  const stand = CORE.insetBox(CORE.runnerBox({ y: 0, ducking: false }), 0.14);
  const duck = CORE.insetBox(CORE.runnerBox({ y: 0, ducking: true }), 0.14);
  assert.equal(CORE.intersects(stand, flier), true);
  assert.equal(CORE.intersects(duck, flier), false);
});

test('spawnBlocked quiets spawns around mode boundaries', () => {
  assert.equal(CORE.spawnBlocked(690, 700), true);
  assert.equal(CORE.spawnBlocked(710, 700), true);
  assert.equal(CORE.spawnBlocked(350, 700), false);
});
