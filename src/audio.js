// Tiny WebAudio synth: per-world music loops + game SFX. No assets.
(function (root) {
  const SONGS = {
    trex: { bpm: 112, root: 57, scale: [0, 2, 4, 7, 9], prog: [0, 3, 4, 2], lead: 'triangle', bass: 'triangle', arp: [0, 2, 1, 2], hat: false },
    plumber: { bpm: 150, root: 60, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 3, 4, 0], lead: 'square', bass: 'triangle', arp: [0, 1, 2, 1, 3, 2, 1, 2], hat: true },
    synthwave: { bpm: 100, root: 50, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 3, 4], lead: 'sawtooth', bass: 'sawtooth', arp: [0, 1, 2, 3, 2, 1], hat: true },
    india: { bpm: 118, root: 55, scale: [0, 1, 4, 5, 7, 8, 11], prog: [0, 0, 3, 4], lead: 'triangle', bass: 'sine', arp: [0, 2, 1, 3, 2, 1], hat: true },
    underwater: { bpm: 84, root: 53, scale: [0, 2, 4, 6, 7, 9, 11], prog: [0, 1, 4, 3], lead: 'sine', bass: 'sine', arp: [0, 2, 3, 2], hat: false },
    japan: { bpm: 96, root: 57, scale: [0, 2, 3, 7, 8], prog: [0, 3, 0, 4], lead: 'triangle', bass: 'sine', arp: [0, 1, 2, 3, 2, 1], hat: false },
    arctic: { bpm: 90, root: 62, scale: [0, 2, 4, 7, 9], prog: [0, 2, 3, 1], lead: 'sine', bass: 'triangle', arp: [0, 2, 4, 2], hat: false },
    moon: { bpm: 76, root: 52, scale: [0, 2, 4, 6, 8, 10], prog: [0, 2, 1, 3], lead: 'sine', bass: 'sine', arp: [0, 3, 1, 4, 2, 5], hat: false },
  };

  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  const Audio = {
    ctx: null,
    enabled: true,
    song: SONGS.trex,
    pendingSong: null,
    step: 0,
    nextTime: 0,
    timer: null,
    playing: false,

    ensure() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return true;
      }
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.enabled ? 1 : 0;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.16;
      this.lp = this.ctx.createBiquadFilter();
      this.lp.type = 'lowpass';
      this.lp.frequency.value = 2600;
      this.musicBus.connect(this.lp).connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.32;
      this.sfxBus.connect(this.master);
      const len = this.ctx.sampleRate * 0.5;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return true;
    },

    setEnabled(on) {
      this.enabled = on;
      if (this.master) this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.03);
    },

    setSong(id) {
      const s = SONGS[id];
      if (!s || s === this.song) return;
      this.pendingSong = s;
    },

    start() {
      if (!this.ensure() || this.playing) return;
      this.playing = true;
      this.step = 0;
      this.nextTime = this.ctx.currentTime + 0.06;
      this.timer = setInterval(() => this.schedule(), 25);
    },

    stop() {
      this.playing = false;
      clearInterval(this.timer);
    },

    tone(bus, type, freq, t, dur, vol, slideTo) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + dur + 0.02);
    },

    hiss(bus, t, dur, vol, freq) {
      const s = this.ctx.createBufferSource();
      s.buffer = this.noise;
      const f = this.ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = freq || 7000;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(bus);
      s.start(t);
      s.stop(t + dur);
    },

    schedule() {
      const ctx = this.ctx;
      while (this.nextTime < ctx.currentTime + 0.12) {
        if (this.step % 16 === 0 && this.pendingSong) {
          this.song = this.pendingSong;
          this.pendingSong = null;
        }
        const s = this.song;
        const sixteenth = 60 / s.bpm / 4;
        const bar = Math.floor(this.step / 16) % s.prog.length;
        const deg = s.prog[bar];
        const note = (d) => {
          const n = s.scale.length;
          const i = deg + d;
          return s.root + s.scale[((i % n) + n) % n] + 12 * Math.floor(i / n);
        };
        const st = this.step % 16;
        const t = this.nextTime;
        if (st % 8 === 0) this.tone(this.musicBus, s.bass, hz(note(0) - 12), t, sixteenth * 6, 0.5);
        if (st % 4 === 2) this.tone(this.musicBus, s.bass, hz(note(0) - 12), t, sixteenth * 1.5, 0.22);
        if (st % 2 === 0) {
          const a = s.arp[(this.step / 2) % s.arp.length | 0];
          this.tone(this.musicBus, s.lead, hz(note(a * 1) + 12), t, sixteenth * 1.8, s.lead === 'sine' ? 0.32 : 0.16);
        }
        if (s.hat && st % 4 === 2) this.hiss(this.musicBus, t, 0.04, 0.12);
        if (st === 0 || st === 8) this.tone(this.musicBus, 'sine', 110, t, 0.14, 0.6, 40);
        this.nextTime += sixteenth;
        this.step++;
      }
    },

    sfx(name) {
      if (!this.ctx || !this.enabled) return;
      const t = this.ctx.currentTime;
      const B = this.sfxBus;
      if (name === 'jump') this.tone(B, 'square', 440, t, 0.11, 0.18, 880);
      else if (name === 'point') {
        this.tone(B, 'square', 988, t, 0.08, 0.14);
        this.tone(B, 'square', 1319, t + 0.08, 0.16, 0.14);
      } else if (name === 'hit') {
        this.hiss(B, t, 0.3, 0.5, 400);
        this.tone(B, 'sawtooth', 220, t, 0.35, 0.3, 50);
      } else if (name === 'whoosh') {
        const s = this.ctx.createBufferSource();
        s.buffer = this.noise;
        const f = this.ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.Q.value = 2;
        f.frequency.setValueAtTime(300, t);
        f.frequency.exponentialRampToValueAtTime(5000, t + 0.5);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.5, t + 0.25);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        s.connect(f).connect(g).connect(B);
        s.start(t);
        s.stop(t + 0.5);
        this.tone(B, 'sine', 523, t + 0.3, 0.3, 0.2);
        this.tone(B, 'sine', 784, t + 0.38, 0.4, 0.2);
      }
    },
  };

  root.GameAudio = Audio;
})(this);
