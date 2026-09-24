// Engine: loop, spawning, collisions, world transitions. Rendering is delegated to themes.
(function (root) {
  const C = CORE;
  const TRANSITION_S = 1.15;
  const DEATH_S = 0.55;

  function createGame(canvas, hooks) {
    const ctx = canvas.getContext('2d');
    const themes = root.THEMES;
    const reduceMotion = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const s = {
      state: 'ready',
      startIdx: 0,
      cur: 0,
      trans: null,
      time: 0,
      dist: 0,
      speed: C.SPEED.start,
      score: 0,
      best: 0,
      milestone: 0,
      segment: 0,
      history: [],
      runner: { y: 0, vy: 0, airborne: false, ducking: false, phase: 0 },
      obstacles: [],
      gap: 0,
      fx: [],
      shake: 0,
      flash: 0,
      deathT: 0,
      overAt: 0,
      pausedFrom: null,
    };
    const input = { jump: false, jumpHeld: false, duck: false };
    let clock = 0;
    let last = performance.now();
    let scale = 1;

    function theme() {
      return themes[s.cur];
    }

    function frameInfo(dt) {
      return { W: C.W, H: C.H, G: C.GROUND, t: clock, dt, dist: s.dist, speed: s.state === 'running' ? s.speed : 0, running: s.state === 'running' };
    }

    function resize() {
      const dpr = Math.min(root.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round((cssW * C.H * dpr) / C.W);
      scale = canvas.width / C.W;
    }

    function setMode(idx, animate) {
      if (idx === s.cur) return;
      const from = s.cur;
      s.cur = idx;
      if (animate) s.trans = { from, to: idx, t: 0 };
      hooks.onMode(idx, animate);
    }

    function resetRun() {
      s.time = 0;
      s.dist = 0;
      s.speed = C.SPEED.start;
      s.score = 0;
      s.milestone = 0;
      s.segment = 0;
      s.history = [s.startIdx];
      s.obstacles = [];
      s.gap = 0;
      s.runner = { y: 0, vy: 0, airborne: false, ducking: false, phase: 0 };
      input.jump = false;
    }

    function start() {
      resetRun();
      setMode(s.startIdx, true);
      s.state = 'running';
      hooks.onStart(s.startIdx);
      hooks.onState('running');
      hooks.onScore(0, s.best, 0);
    }

    function dust(n, spread, up) {
      const col = theme().dust;
      for (let i = 0; i < n; i++) {
        s.fx.push({
          x: C.RUNNER.x + 10 + Math.random() * 30,
          y: C.GROUND - 2,
          vx: -60 - Math.random() * spread,
          vy: -Math.random() * up,
          life: 0,
          max: 0.35 + Math.random() * 0.25,
          r: 1.5 + Math.random() * 2.5,
          c: col,
        });
      }
    }

    function burst(x, y) {
      const cols = [theme().accent, theme().accent2, '#ffffff'];
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 80 + Math.random() * 280;
        s.fx.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, life: 0, max: 0.5 + Math.random() * 0.4, r: 2 + Math.random() * 3, c: cols[i % 3], g: 600 });
      }
    }

    function spawn() {
      const pick = C.pickObstacle(s.score, Math.random(), Math.random());
      let kind = pick.kind;
      if (kind === 'wide' && s.score < 100) kind = 'small';
      const size = C.SIZES[kind];
      s.obstacles.push({ kind, x: C.W + 20, bottom: pick.bottom, w: size.w, h: size.h, seed: (Math.random() * 1000) | 0 });
      const ph = theme().physics;
      const air = ph.jump / ph.gravity;
      s.gap = C.nextGap(s.speed, Math.random()) * (1 + (air - 1) * 0.6) + size.w;
    }

    function die() {
      s.state = 'dying';
      s.deathT = 0;
      s.shake = reduceMotion ? 0 : 1;
      s.flash = 1;
      const rb = C.runnerBox(s.runner);
      burst(rb.x + rb.w / 2, rb.y + rb.h / 2);
      GameAudio.sfx('hit');
      hooks.onState('dying');
    }

    function update(dt) {
      if (s.trans) {
        s.trans.t += dt / TRANSITION_S;
        if (s.trans.t >= 1) s.trans = null;
      }
      if (s.state === 'running') {
        s.time += dt;
        s.speed = C.speedAt(s.time);
        s.dist += s.speed * dt;
        s.score = C.scoreForDistance(s.dist);

        const seg = C.segmentForScore(s.score, C.MODE_SPAN);
        if (seg > s.segment) {
          s.segment = seg;
          const next = C.pickNextMode(s.history, themes.length, Math.random());
          s.history.push(next);
          setMode(next, true);
          GameAudio.sfx('whoosh');
        }
        const ms = Math.floor(s.score / 100);
        if (ms > s.milestone) {
          s.milestone = ms;
          if (s.score % C.MODE_SPAN >= 100) {
            GameAudio.sfx('point');
            hooks.onMilestone(s.score);
            if (theme().onMilestone) theme().onMilestone(frameInfo(dt));
          }
        }

        const r = s.runner;
        const ev = C.stepRunner(r, input, dt, theme().physics);
        input.jump = false;
        if (ev === 'jump') {
          GameAudio.sfx('jump');
          dust(5, 60, 40);
        } else if (ev === 'land') dust(8, 120, 60);
        r.phase += (dt * s.speed) / 24;

        s.obstacles.forEach((o) => (o.x -= (s.speed + (o.kind === 'flier' ? 50 : 0)) * dt));
        s.obstacles = s.obstacles.filter((o) => o.x + o.w > -40);

        s.gap -= s.speed * dt;
        if (s.gap <= 0 && !C.spawnBlocked(s.score, C.MODE_SPAN)) spawn();

        const rb = C.insetBox(C.runnerBox(r), 0.14);
        for (const o of s.obstacles) {
          const ob = C.insetBox({ x: o.x, y: C.GROUND - o.bottom - o.h, w: o.w, h: o.h }, 0.12);
          if (C.intersects(rb, ob)) {
            die();
            break;
          }
        }
        hooks.onScore(s.score, Math.max(s.best, s.score), (s.score % C.MODE_SPAN) / C.MODE_SPAN);
      } else if (s.state === 'dying') {
        s.deathT += dt;
        if (s.deathT >= DEATH_S) {
          s.state = 'over';
          s.overAt = performance.now();
          const newBest = s.score > s.best;
          s.best = Math.max(s.best, s.score);
          hooks.onOver({ score: s.score, best: s.best, newBest, theme: theme(), index: s.cur });
          hooks.onState('over');
        }
      }

      s.fx = s.fx.filter((p) => (p.life += dt) < p.max);
      s.fx.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += (p.g || 200) * dt;
      });
      s.shake = Math.max(0, s.shake - dt * 3.2);
      s.flash = Math.max(0, s.flash - dt * 7);
    }

    function runnerView() {
      const r = s.runner;
      const b = C.runnerBox(r);
      return {
        x: b.x,
        bottom: b.y + b.h,
        w: b.w,
        h: b.h,
        ducking: r.ducking,
        airborne: r.airborne,
        phase: r.phase,
        dead: s.state === 'dying' || s.state === 'over',
      };
    }

    function drawScene(th, f, c) {
      th.drawBackground(c, f);
      th.drawGround(c, f);
      for (const o of s.obstacles) {
        th.drawObstacle(c, { kind: o.kind, x: o.x, y: C.GROUND - o.bottom - o.h, w: o.w, h: o.h, seed: o.seed }, f);
      }
      th.drawRunner(c, runnerView(), f);
      if (th.drawForeground) th.drawForeground(c, f);
    }

    function render(dt) {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      if (s.shake > 0) {
        const m = 9 * s.shake * s.shake;
        ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
      }
      const f = frameInfo(s.state === 'paused' ? 0 : dt);
      if (s.trans) {
        const p = KIT.easeInOut(Math.min(1, s.trans.t));
        drawScene(themes[s.trans.from], f, ctx);
        const rb = C.runnerBox(s.runner);
        const cx = rb.x + rb.w / 2;
        const cy = rb.y + rb.h / 2;
        const R = Math.hypot(C.W, C.H) * p;
        ctx.save();
        if (reduceMotion) {
          ctx.globalAlpha = p;
        } else {
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(0.1, R), 0, Math.PI * 2);
          ctx.clip();
        }
        drawScene(themes[s.trans.to], f, ctx);
        ctx.restore();
        if (!reduceMotion && p < 1) {
          ctx.save();
          KIT.glow(ctx, themes[s.trans.to].accent, 24);
          ctx.strokeStyle = themes[s.trans.to].accent;
          ctx.globalAlpha = 1 - p * 0.6;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      } else {
        drawScene(theme(), f, ctx);
      }

      for (const p of s.fx) {
        ctx.globalAlpha = 1 - p.life / p.max;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (s.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${s.flash * 0.5})`;
        ctx.fillRect(-20, -20, C.W + 40, C.H + 40);
      }
    }

    function loop(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (s.state !== 'paused') {
        clock += dt;
        update(dt);
      }
      render(dt);
      requestAnimationFrame(loop);
    }

    function renderThumb(idx, target) {
      const off = document.createElement('canvas');
      off.width = C.W;
      off.height = C.H;
      const c = off.getContext('2d');
      const th = themes[idx];
      const f = { W: C.W, H: C.H, G: C.GROUND, t: 1.3 + idx, dt: 0, dist: 300 + idx * 211, speed: 0, running: false };
      th.drawBackground(c, f);
      th.drawGround(c, f);
      th.drawObstacle(c, { kind: 'tall', x: 520, y: C.GROUND - C.SIZES.tall.h, w: C.SIZES.tall.w, h: C.SIZES.tall.h, seed: 3 }, f);
      th.drawObstacle(c, { kind: 'flier', x: 820, y: C.GROUND - 120 - C.SIZES.flier.h, w: C.SIZES.flier.w, h: C.SIZES.flier.h, seed: 5 }, f);
      th.drawRunner(c, { x: C.RUNNER.x + 140, bottom: C.GROUND, w: C.RUNNER.w, h: C.RUNNER.h, ducking: false, airborne: false, phase: 0, dead: false }, f);
      const tc = target.getContext('2d');
      tc.imageSmoothingQuality = 'high';
      tc.drawImage(off, 150, 0, C.W - 300, C.H, 0, 0, target.width, target.height);
    }

    resize();
    requestAnimationFrame(loop);

    return {
      resize,
      renderThumb,
      get state() {
        return s.state;
      },
      get startIdx() {
        return s.startIdx;
      },
      setBest(b) {
        s.best = b;
      },
      chooseStart(idx, animate = true) {
        s.startIdx = idx;
        if (s.state === 'ready' || s.state === 'over') setMode(idx, animate);
      },
      press(action, down) {
        if (action === 'jump') {
          if (down) {
            if (s.state === 'ready') return start();
            if (s.state === 'over') {
              if (performance.now() - s.overAt > 350) start();
              return;
            }
            if (s.state === 'running' && !input.jumpHeld) input.jump = true;
            input.jumpHeld = true;
          } else input.jumpHeld = false;
        } else if (action === 'duck') {
          input.duck = down;
        }
      },
      start() {
        if (s.state === 'ready' || s.state === 'over') start();
      },
      togglePause() {
        if (s.state === 'running') {
          s.state = 'paused';
          input.jumpHeld = false;
          input.duck = false;
          hooks.onState('paused');
        } else if (s.state === 'paused') {
          s.state = 'running';
          last = performance.now();
          hooks.onState('running');
        }
      },
    };
  }

  root.createGame = createGame;
})(this);
