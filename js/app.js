// ── CONFIG ──
const MEAL_DEFAULTS   = { breakfast: 15, lunch: 30, dinner: 30 };
const MEAL_BG         = { breakfast: 'images/bg-breakfast.svg', lunch: 'images/bg-lunch.svg', dinner: 'images/bg-dinner.svg' };
const MEAL_GREETINGS  = {
  breakfast: ['Good morning, Elizabeth! 🌅', 'Rise and shine! ☀️', 'Morning magic! 🌸'],
  lunch:     ['Lunchtime adventure! 🌿', 'Enchanted garden feast! 🌼', 'Yummy lunchtime! 🥗'],
  dinner:    ['Royal dinner time! 🌙', 'A magical feast awaits! 👑', 'Evening magic! ✨'],
};
const MOOD_MESSAGES = {
  idle:         ['Ready to eat, Elizabeth? 🍴', 'Time to be a good eater! 🌟', 'You can do it, princess! 🐰'],
  running_lots: ['Eating so well, Elizabeth! ⭐', 'So proud of you! 🌸', 'Keep going, princess! 🎀'],
  running_mid:  ['Almost halfway! 💪', "You're doing great! 🌟", 'Keep eating, sweetie! 🥄'],
  warning:      ['Hurry up a little! ⏰', 'A few more bites! 🍴', 'Almost done, keep going! 🐰'],
  urgent:       ['Quick quick! ⚡', 'Last bites, princess! 🏃', "You're almost there! 💨"],
};
const CONFETTI = ['🎊','🌟','🎈','👑','🌸','✨','🎀','🍬','🌈','💖','⭐','🦋'];

// ── STATE ──
let currentMeal      = 'breakfast';
let totalSeconds     = 15 * 60;
let remainingSeconds = totalSeconds;
let timerInterval    = null;
let isRunning        = false;
let isPaused         = false;
let lastMoodState    = 'idle';
let lottieAnim       = null;

const CIRCUMFERENCE = 2 * Math.PI * 76; // ~477.5

// ── LOTTIE INIT ──
function initLottie() {
  if (typeof lottie === 'undefined') return;
  lottieAnim = lottie.loadAnimation({
    container:     document.getElementById('lottie-bunny'),
    renderer:      'svg',
    loop:          true,
    autoplay:      true,
    path:          'images/bunny.json',
  });
}

function setBunnySpeed(speed) {
  if (!lottieAnim) return;
  lottieAnim.setSpeed(speed);
}

// ── BACKGROUND TRANSITION ──
function switchBackground(meal) {
  const bg     = document.getElementById('scene-bg');
  const bgNext = document.getElementById('scene-bg-next');
  bgNext.style.backgroundImage = `url('${MEAL_BG[meal]}')`;
  bgNext.style.opacity = '1';
  setTimeout(() => {
    bg.style.backgroundImage = `url('${MEAL_BG[meal]}')`;
    bgNext.style.opacity = '0';
  }, 700);
}

// ── AUTO-DETECT MEAL ──
function autoDetectMeal() {
  const h = new Date().getHours();
  let meal;
  if      (h >= 6  && h < 11) meal = 'breakfast';
  else if (h >= 11 && h < 15) meal = 'lunch';
  else if (h >= 17 && h < 22) meal = 'dinner';
  else                         meal = 'lunch';
  selectMeal(meal);
}

// ── SELECT MEAL ──
function selectMeal(meal) {
  if (isRunning) return;
  currentMeal = meal;
  document.body.className = 'meal-' + meal;
  document.querySelectorAll('.meal-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-' + meal).classList.add('active');
  const greets = MEAL_GREETINGS[meal];
  document.getElementById('subtitle').textContent = greets[Math.floor(Math.random() * greets.length)];
  totalSeconds     = MEAL_DEFAULTS[meal] * 60;
  remainingSeconds = totalSeconds;
  switchBackground(meal);
  updateDisplay();
  updateRing();
  updateMood('idle');
}

// ── ADJUST TIME ──
function adjustTime(delta) {
  if (isRunning) return;
  const n = totalSeconds + delta * 60;
  if (n < 60 || n > 90 * 60) return;
  totalSeconds = n; remainingSeconds = n;
  updateDisplay(); updateRing();
  document.getElementById('btn-minus').disabled = totalSeconds <= 60;
  document.getElementById('btn-plus').disabled  = totalSeconds >= 90 * 60;
}

// ── TIMER CONTROLS ──
function startTimer() {
  if (isRunning) return;
  isRunning = true; isPaused = false;
  document.getElementById('btn-start').style.display = 'none';
  document.getElementById('btn-pause').style.display = 'flex';
  document.getElementById('done-btn').classList.add('visible');
  document.getElementById('btn-minus').disabled = true;
  document.getElementById('btn-plus').disabled  = true;
  document.getElementById('paused-badge').classList.remove('show');
  updateMood('running_lots');
  timerInterval = setInterval(tick, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  if (!isPaused) {
    isPaused = true;
    clearInterval(timerInterval);
    lottieAnim && lottieAnim.pause();
    document.getElementById('btn-pause').innerHTML = '▶ Resume';
    document.getElementById('paused-badge').classList.add('show');
  } else {
    isPaused = false;
    lottieAnim && lottieAnim.play();
    document.getElementById('btn-pause').innerHTML = '⏸ Pause';
    document.getElementById('paused-badge').classList.remove('show');
    timerInterval = setInterval(tick, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false; isPaused = false;
  remainingSeconds = totalSeconds;
  lottieAnim && lottieAnim.play();
  setBunnySpeed(1);
  document.getElementById('btn-start').style.display = 'flex';
  document.getElementById('btn-pause').style.display = 'none';
  document.getElementById('btn-pause').innerHTML = '⏸ Pause';
  document.getElementById('done-btn').classList.remove('visible');
  document.getElementById('btn-minus').disabled = false;
  document.getElementById('btn-plus').disabled  = false;
  document.getElementById('paused-badge').classList.remove('show');
  document.getElementById('timer-display').className = 'timer-display';
  document.getElementById('ring-progress').className = 'ring-progress';
  document.querySelector('.bunny-wrap').classList.remove('shake', 'celebrate');
  updateDisplay(); updateRing(); updateMood('idle');
}

function tick() {
  remainingSeconds--;
  updateDisplay(); updateRing(); updateMoodByTime();
  if (remainingSeconds <= 0) {
    clearInterval(timerInterval);
    remainingSeconds = 0;
    updateDisplay();
    celebrate('timeout');
  }
}

// ── DISPLAY ──
function updateDisplay() {
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  document.getElementById('timer-display').textContent =
    String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  const el = document.getElementById('timer-display');
  el.className = 'timer-display';
  if      (remainingSeconds <= 60)      el.classList.add('urgent');
  else if (remainingSeconds <= 5 * 60)  el.classList.add('warning');
}

function updateRing() {
  const frac   = remainingSeconds / totalSeconds;
  const offset = CIRCUMFERENCE * (1 - frac);
  const rp = document.getElementById('ring-progress');
  rp.style.strokeDashoffset = offset;
  rp.className = 'ring-progress';
  if      (frac <= 0.15) rp.classList.add('urgent');
  else if (frac <= 0.35) rp.classList.add('warning');
}

// ── MOOD & BUNNY ──
function updateMoodByTime() {
  const frac = remainingSeconds / totalSeconds;
  let state;
  if      (frac > 0.6)  state = 'running_lots';
  else if (frac > 0.3)  state = 'running_mid';
  else if (frac > 0.1)  state = 'warning';
  else                  state = 'urgent';
  if (state !== lastMoodState) updateMood(state);
}

function updateMood(state) {
  lastMoodState = state;
  const msgs = MOOD_MESSAGES[state];
  const el = document.getElementById('mood-text');
  el.textContent = msgs[Math.floor(Math.random() * msgs.length)];
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'bubblePop 0.35s cubic-bezier(0.34,1.56,0.64,1)';

  const wrap = document.querySelector('.bunny-wrap');
  wrap.classList.remove('shake', 'celebrate');

  // Lottie speed + bunny shake
  if      (state === 'idle' || state === 'running_lots') setBunnySpeed(1);
  else if (state === 'running_mid')                      setBunnySpeed(1.2);
  else if (state === 'warning')  { setBunnySpeed(1.8); wrap.classList.add('shake'); }
  else if (state === 'urgent')   { setBunnySpeed(2.8); wrap.classList.add('shake'); }
}

// ── CELEBRATION ──
function celebrate(type) {
  clearInterval(timerInterval); isRunning = false;
  lottieAnim && lottieAnim.pause();
  document.querySelector('.bunny-wrap').classList.remove('shake');
  document.querySelector('.bunny-wrap').classList.add('celebrate');

  if (type === 'done') {
    document.getElementById('celeb-icon').textContent = '🎉';
    document.getElementById('celeb-title').textContent = 'Wonderful, Elizabeth!';
    document.getElementById('celeb-msg').textContent   = 'You finished your meal like a true princess! 👑🐰';
  } else {
    document.getElementById('celeb-icon').textContent = '⏰';
    document.getElementById('celeb-title').textContent = "Time's up, Elizabeth!";
    document.getElementById('celeb-msg').textContent   = "Let's try to eat a little faster next time! 🐰💪";
  }
  document.getElementById('celebrate-overlay').classList.add('show');
  launchConfetti();
}

function dismissCelebration() {
  document.getElementById('celebrate-overlay').classList.remove('show');
  lottieAnim && lottieAnim.play();
  resetTimer();
}

function launchConfetti() {
  for (let i = 0; i < 28; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.textContent = CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
      el.style.left             = Math.random() * 100 + 'vw';
      el.style.fontSize         = (1.2 + Math.random() * 1.4) + 'rem';
      el.style.animationDuration = (2.2 + Math.random() * 2.2) + 's';
      el.style.animationDelay   = (Math.random() * 0.6) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5500);
    }, i * 70);
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('scene-bg').style.backgroundImage = `url('${MEAL_BG.breakfast}')`;
  initLottie();
  autoDetectMeal();
  updateDisplay();
  updateRing();
});
