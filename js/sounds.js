// ── WEB AUDIO SOUNDS ──
// All sounds generated via Web Audio API — no files needed

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Resume context on first user interaction (iOS requirement)
function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

// ── HELPER: play a tone ──
function playTone(freq, type, startTime, duration, gainVal, ctx, dest) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(dest);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// ── MAGICAL START CHIME ──
// A rising arpeggio — C major pentatonic sparkle
function playStartChime() {
  const ctx  = getAudioCtx();
  const dest = ctx.destination;
  const now  = ctx.currentTime;
  const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
  notes.forEach((freq, i) => {
    playTone(freq, 'sine', now + i * 0.12, 0.6, 0.18, ctx, dest);
  });
  // Add a soft shimmer on top
  playTone(2093, 'sine', now + 0.5, 0.8, 0.06, ctx, dest);
}

// ── WARNING BELL (5 min left) ──
// Three urgent but friendly dings
function playWarningBell() {
  const ctx  = getAudioCtx();
  const dest = ctx.destination;
  const now  = ctx.currentTime;
  // Bell-like tone using two oscillators detuned slightly
  [0, 0.35, 0.70].forEach(offset => {
    playTone(880, 'sine',     now + offset, 0.5, 0.2,  ctx, dest);
    playTone(1108, 'sine',    now + offset, 0.4, 0.06, ctx, dest);
  });
}

// ── URGENT TICK (last 60 seconds, every 10s) ──
function playUrgentTick() {
  const ctx  = getAudioCtx();
  const dest = ctx.destination;
  const now  = ctx.currentTime;
  playTone(660, 'square', now,       0.08, 0.12, ctx, dest);
  playTone(660, 'square', now + 0.1, 0.08, 0.12, ctx, dest);
}

// ── CELEBRATION FANFARE ──
// A triumphant little melody
function playFanfare() {
  const ctx  = getAudioCtx();
  const dest = ctx.destination;
  const now  = ctx.currentTime;

  // Main melody — C E G C (triumphant)
  const melody = [
    { f: 523,  t: 0,    d: 0.18 },
    { f: 659,  t: 0.18, d: 0.18 },
    { f: 784,  t: 0.36, d: 0.18 },
    { f: 1047, t: 0.54, d: 0.45 },
    { f: 784,  t: 0.54, d: 0.22 },
    { f: 1047, t: 0.80, d: 0.60 },
  ];
  melody.forEach(n => playTone(n.f, 'sine', now + n.t, n.d, 0.22, ctx, dest));

  // Harmony underneath
  const harmony = [
    { f: 330, t: 0,    d: 0.54 },
    { f: 392, t: 0.54, d: 0.80 },
  ];
  harmony.forEach(n => playTone(n.f, 'triangle', now + n.t, n.d, 0.10, ctx, dest));

  // Sparkle high notes
  [0.2, 0.4, 0.6, 0.85, 1.1].forEach((t, i) => {
    playTone(1760 + i * 200, 'sine', now + t, 0.15, 0.06, ctx, dest);
  });
}

// ── TIMEOUT SOUND ──
// Gentle but noticeable — descending then resolve
function playTimeout() {
  const ctx  = getAudioCtx();
  const dest = ctx.destination;
  const now  = ctx.currentTime;
  const notes = [784, 659, 523, 392, 523];
  notes.forEach((freq, i) => {
    playTone(freq, 'sine', now + i * 0.18, 0.28, 0.18, ctx, dest);
  });
}

// ── BUTTON CLICK ──
function playClick() {
  const ctx  = getAudioCtx();
  const dest = ctx.destination;
  const now  = ctx.currentTime;
  playTone(440, 'sine', now, 0.08, 0.08, ctx, dest);
}
