// DOM wiring: HUD, overlays, world rail, input, persistence.
(function () {
  const $ = (id) => document.getElementById(id);
  const themes = window.THEMES;
  const root = document.documentElement;
  const body = document.body;
  const pad = (n) => String(n).padStart(5, '0');

  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('trex-reimagined:' + k);
        return v === null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('trex-reimagined:' + k, JSON.stringify(v));
      } catch (e) {}
    },
  };

  // Brand mark from the real T-Rex sprite.
  (function () {
    const rows = themes[0].iconRows;
    let d = '';
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) if (row[x] === '#') d += `M${x} ${y}h1v1h-1z`;
    });
    $('brand-mark').innerHTML = `<path fill="currentColor" d="${d}"/>`;
    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.href = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 23"><path fill="#535353" d="${d}"/></svg>`);
    document.head.appendChild(icon);
  })();

  const el = {
    hudScore: $('hud-score'),
    hudHi: $('hud-hi'),
    best: $('best'),
    toast: $('toast'),
    start: $('ov-start'),
    over: $('ov-over'),
    pause: $('ov-pause'),
    rail: $('rail'),
    hint: $('worlds-hint'),
  };

  let lastScore = -1;
  let toastTimer = 0;
  let items = [];
  let active = 0;
  let stage = 1;

  function applyTheme(idx) {
    const th = themes[idx];
    root.style.setProperty('--accent', th.accent);
    root.style.setProperty('--accent2', th.accent2);
    root.style.setProperty('--hud', th.hud);
    root.style.setProperty('--hud-shadow', th.hudShadow || 'none');
    items.forEach((it, i) => (it.li.dataset.active = String(i === idx)));
    active = idx;
  }

  function showToast(idx) {
    const th = themes[idx];
    $('toast-eyebrow').textContent = `Stage ${stage}`;
    $('toast-name').textContent = th.name;
    $('toast-tag').textContent = th.tagline;
    el.toast.dataset.state = 'in';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.toast.dataset.state = 'out'), 2600);
  }

  function open(ov, on) {
    ov.dataset.open = String(on);
  }

  function markSelected(idx) {
    items.forEach((it, i) => (it.li.dataset.selected = String(i === idx)));
  }

  const game = createGame($('game'), {
    onMode(idx, animate) {
      const prev = active;
      applyTheme(idx);
      GameAudio.setSong(themes[idx].id);
      if (game && game.state === 'running' && animate) {
        items[prev].li.dataset.done = 'true';
        items[prev].fill.style.transform = '';
        stage++;
        showToast(idx);
      }
    },
    onStart(idx) {
      items.forEach((it) => {
        it.li.dataset.done = 'false';
        it.fill.style.transform = '';
      });
      lastScore = -1;
      stage = 1;
      GameAudio.start();
      showToast(idx);
    },
    onScore(score, hi, progress) {
      if (score !== lastScore) {
        lastScore = score;
        el.hudScore.textContent = pad(score);
        el.hudHi.textContent = pad(hi);
      }
      if (progress !== undefined && items[active]) items[active].fill.style.transform = `scaleX(${progress})`;
    },
    onMilestone() {
      el.hudScore.classList.remove('flash');
      void el.hudScore.offsetWidth;
      el.hudScore.classList.add('flash');
    },
    onState(st) {
      body.dataset.state = st;
      open(el.start, st === 'ready');
      open(el.pause, st === 'paused');
      if (st !== 'over') open(el.over, false);
      el.hint.textContent = st === 'ready' || st === 'over' ? 'Pick where your run begins.' : 'Progress through the worlds this run.';
      if (st === 'dying' || st === 'over') el.toast.dataset.state = 'out';
    },
    onOver(d) {
      $('over-score').textContent = d.score.toLocaleString();
      $('over-world').textContent = d.theme.name;
      $('over-best').textContent = d.best.toLocaleString();
      $('over-badge').hidden = !d.newBest || d.score === 0;
      el.best.textContent = pad(d.best);
      store.set('best', d.best);
      open(el.over, true);
    },
  });

  // World rail.
  themes.forEach((th, i) => {
    const li = document.createElement('li');
    li.className = 'world';
    li.style.setProperty('--w-accent', th.accent);
    li.innerHTML = `
      <button class="world-btn" type="button" aria-label="Start in ${th.name}">
        <canvas class="thumb"></canvas>
        <span class="world-meta"><span class="world-num">${String(i + 1).padStart(2, '0')}</span><span class="world-name">${th.name}</span></span>
        <span class="bar"><span class="fill"></span></span>
      </button>`;
    el.rail.appendChild(li);
    const btn = li.querySelector('button');
    btn.addEventListener('click', () => {
      game.chooseStart(i);
      markSelected(i);
      store.set('start', i);
      btn.blur();
    });
    items.push({ li, thumb: li.querySelector('canvas'), fill: li.querySelector('.fill') });
  });

  function drawThumbs() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    items.forEach((it, i) => {
      const w = it.thumb.clientWidth;
      it.thumb.width = Math.round(w * dpr);
      it.thumb.height = Math.round((w / 3) * dpr);
      game.renderThumb(i, it.thumb);
    });
  }

  // Restore persisted state.
  const best = store.get('best', 0);
  game.setBest(best);
  el.best.textContent = pad(best);
  el.hudHi.textContent = pad(best);
  const startIdx = Math.min(themes.length - 1, Math.max(0, store.get('start', 0) | 0));
  applyTheme(0);
  game.chooseStart(startIdx, false);
  applyTheme(startIdx);
  markSelected(startIdx);

  // Sound.
  const soundBtn = $('sound');
  function setSound(on) {
    GameAudio.setEnabled(on);
    soundBtn.setAttribute('aria-pressed', String(on));
    store.set('sound', on);
  }
  setSound(store.get('sound', true));
  soundBtn.addEventListener('click', () => {
    GameAudio.ensure();
    setSound(!GameAudio.enabled);
    soundBtn.blur();
  });

  // Buttons.
  $('btn-start').addEventListener('click', () => game.start());
  $('btn-retry').addEventListener('click', () => game.start());
  $('btn-resume').addEventListener('click', () => game.togglePause());

  // Keyboard.
  const JUMP = new Set(['Space', 'ArrowUp', 'KeyW']);
  const DUCK = new Set(['ArrowDown', 'KeyS']);
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (JUMP.has(e.code)) {
      e.preventDefault();
      if (!e.repeat) {
        GameAudio.ensure();
        game.press('jump', true);
      }
    } else if (DUCK.has(e.code)) {
      e.preventDefault();
      game.press('duck', true);
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
      game.togglePause();
    } else if (e.code === 'KeyM') {
      GameAudio.ensure();
      setSound(!GameAudio.enabled);
    } else if (e.code === 'Enter' && (game.state === 'ready' || game.state === 'over')) {
      e.preventDefault();
      GameAudio.ensure();
      game.start();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (JUMP.has(e.code)) {
      e.preventDefault();
      game.press('jump', false);
    } else if (DUCK.has(e.code)) game.press('duck', false);
  });

  // Touch / pointer on the screen: upper area jumps, lower area ducks.
  const screen = $('screen');
  screen.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    GameAudio.ensure();
    const r = screen.getBoundingClientRect();
    const lower = e.clientY - r.top > r.height * 0.6 && game.state === 'running';
    game.press(lower ? 'duck' : 'jump', true);
  });
  const release = () => {
    game.press('jump', false);
    game.press('duck', false);
  };
  screen.addEventListener('pointerup', release);
  screen.addEventListener('pointercancel', release);
  screen.addEventListener('pointerleave', release);

  // Pause when the player looks away.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state === 'running') game.togglePause();
  });
  window.addEventListener('blur', () => {
    if (game.state === 'running') game.togglePause();
  });

  new ResizeObserver(() => game.resize()).observe($('game'));
  let thumbTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(thumbTimer);
    thumbTimer = setTimeout(drawThumbs, 120);
  }).observe(el.rail);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(drawThumbs);
})();
