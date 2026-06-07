const MEAL_DEFAULTS  = { breakfast: 15, lunch: 30, dinner: 30 };
const MEAL_BG        = { breakfast: 'images/bg-breakfast.svg', lunch: 'images/bg-lunch.svg', dinner: 'images/bg-dinner.svg' };
const MEAL_LABELS    = { breakfast: '🥞 Breakfast', lunch: '🥣 Lunch', dinner: '🍽️ Dinner' };
const MEAL_GREETINGS = {
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

let currentMeal     = 'breakfast';
let selectedMinutes = 15;
let totalSeconds    = 15 * 60;
let remainingSeconds = totalSeconds;
let timerInterval   = null;
let isRunning       = false;
let isPaused        = false;
let lastMoodState   = 'idle';
let lottieAnim      = null;
let warningPlayed   = false;
let urgentPlayed    = false;

function initLottie() {
  if (typeof lottie === 'undefined') return;
  lottieAnim = lottie.loadAnimation({
    container: document.getElementById('lottie-bunny'),
    renderer: 'svg', loop: true, autoplay: true, path: 'images/bunny.json',
  });
}
function setBunnySpeed(s) { lottieAnim && lottieAnim.setSpeed(s); }

function switchBackground(meal) {
  const bgNext = document.getElementById('scene-bg-next');
  bgNext.style.backgroundImage = `url('${MEAL_BG[meal]}')`;
  bgNext.style.opacity = '1';
  setTimeout(() => {
    document.getElementById('scene-bg').style.backgroundImage = `url('${MEAL_BG[meal]}')`;
    bgNext.style.opacity = '0';
  }, 700);
}

function autoDetectMeal() {
  const h = new Date().getHours();
  let meal;
  if      (h >= 6  && h < 11) meal = 'breakfast';
  else if (h >= 11 && h < 15) meal = 'lunch';
  else if (h >= 17 && h < 22) meal = 'dinner';
  else                         meal = 'lunch';
  selectMeal(meal);
}

function selectMeal(meal) {
  currentMeal = meal;
  document.body.className = 'meal-' + meal;
  document.querySelectorAll('.meal-card').forEach(c => c.classList.remove('active'));
  document.getElementById('card-' + meal).classList.add('active');
  selectedMinutes = MEAL_DEFAULTS[meal];
  const slider = document.getElementById('time-slider');
  slider.value = selectedMinutes;
  updateSliderDisplay(selectedMinutes);
  const greets = MEAL_GREETINGS[meal];
  document.getElementById('home-subtitle').textContent = greets[Math.floor(Math.random() * greets.length)];
  switchBackground(meal);
}

function onSliderChange(val) {
  resumeAudio();
  selectedMinutes = parseInt(val);
  updateSliderDisplay(selectedMinutes);
  document.getElementById('card-time-' + currentMeal).textContent = selectedMinutes + ' min';
}

function updateSliderDisplay(minutes) {
  const el = document.getElementById('slider-value');
  el.textContent = minutes + ' minutes ⏱️';
  el.style.animation = 'none'; void el.offsetWidth;
  el.style.animation = 'valuePop 0.25s cubic-bezier(0.34,1.56,0.64,1)';
  const slider = document.getElementById('time-slider');
  const pct = ((minutes - 5) / (60 - 5)) * 100;
  slider.style.background = `linear-gradient(to right, var(--accent) ${pct}%, rgba(0,0,0,0.08) ${pct}%)`;
  updateTooltip(slider, minutes);
}

function updateTooltip(slider, minutes) {
  const tooltip = document.getElementById('slider-tooltip');
  if (!tooltip) return;
  tooltip.textContent = minutes + ' min';
  const min = parseFloat(slider.min), max = parseFloat(slider.max), val = parseFloat(slider.value);
  const pct = (val - min) / (max - min);
  const thumbW = 36, trackW = slider.offsetWidth;
  const thumbCenter = thumbW / 2 + pct * (trackW - thumbW);
  tooltip.style.left = thumbCenter + 'px';
}

function goToTimer() {
  resumeAudio(); playClick();
  totalSeconds = selectedMinutes * 60;
  remainingSeconds = totalSeconds;
  isRunning = false; isPaused = false;
  warningPlayed = false; urgentPlayed = false;

  document.getElementById('timer-meal-label').textContent = MEAL_LABELS[currentMeal];

  // Init plate
  PLATE.setTime(totalSeconds, remainingSeconds);
  PLATE.reset();

  updateDisplay(); updateMood('idle');
  setBunnySpeed(1); lottieAnim && lottieAnim.play();
  document.querySelector('.bunny-wrap').classList.remove('shake', 'celebrate');
  document.getElementById('btn-start').style.display = 'flex';
  document.getElementById('btn-pause').style.display = 'none';
  document.getElementById('btn-pause').innerHTML = '⏸ Pause';
  document.getElementById('done-btn').classList.remove('visible');
  document.getElementById('paused-badge').classList.remove('show');
  document.getElementById('timer-display').className = 'timer-display';

  const home = document.getElementById('screen-home');
  const timer = document.getElementById('screen-timer');
  home.classList.add('slide-out-left');
  setTimeout(() => {
    home.classList.add('hidden');
    home.classList.remove('slide-out-left');
    timer.classList.remove('hidden');
    // Resize plate canvas after it becomes visible
    setTimeout(() => PLATE.resize(), 50);
  }, 380);
}

function goHome() {
  clearInterval(timerInterval);
  isRunning = false; isPaused = false;
  lottieAnim && lottieAnim.play(); setBunnySpeed(1);
  document.getElementById('screen-timer').classList.add('hidden');
  document.getElementById('screen-home').classList.remove('hidden');
  updateSliderDisplay(selectedMinutes);
}

function startTimer() {
  if (isRunning) return;
  resumeAudio();
  isRunning = true; isPaused = false;
  warningPlayed = false; urgentPlayed = false;
  document.getElementById('btn-start').style.display = 'none';
  document.getElementById('btn-pause').style.display = 'flex';
  document.getElementById('done-btn').classList.add('visible');
  playStartChime(); updateMood('running_lots');
  timerInterval = setInterval(tick, 1000);
}

function pauseTimer() {
  if (!isRunning) return; resumeAudio();
  if (!isPaused) {
    isPaused = true; clearInterval(timerInterval);
    lottieAnim && lottieAnim.pause(); playClick();
    document.getElementById('btn-pause').innerHTML = '▶ Resume';
    document.getElementById('paused-badge').classList.add('show');
  } else {
    isPaused = false; lottieAnim && lottieAnim.play(); playClick();
    document.getElementById('btn-pause').innerHTML = '⏸ Pause';
    document.getElementById('paused-badge').classList.remove('show');
    timerInterval = setInterval(tick, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false; isPaused = false;
  warningPlayed = false; urgentPlayed = false;
  remainingSeconds = totalSeconds;
  lottieAnim && lottieAnim.play(); setBunnySpeed(1);
  PLATE.setTime(totalSeconds, remainingSeconds); PLATE.reset();
  document.getElementById('btn-start').style.display = 'flex';
  document.getElementById('btn-pause').style.display = 'none';
  document.getElementById('btn-pause').innerHTML = '⏸ Pause';
  document.getElementById('done-btn').classList.remove('visible');
  document.getElementById('paused-badge').classList.remove('show');
  document.getElementById('timer-display').className = 'timer-display';
  document.querySelector('.bunny-wrap').classList.remove('shake', 'celebrate');
  updateDisplay(); updateMood('idle');
}

function tick() {
  remainingSeconds--;
  PLATE.setTime(totalSeconds, remainingSeconds);
  updateDisplay(); updateMoodByTime();
  if (remainingSeconds === 5 * 60 && !warningPlayed) { warningPlayed = true; playWarningBell(); }
  if (remainingSeconds === 60 && !urgentPlayed)       { urgentPlayed = true; playUrgentTick(); }
  if (remainingSeconds < 60 && remainingSeconds > 0 && remainingSeconds % 10 === 0) playUrgentTick();
  if (remainingSeconds <= 0) { clearInterval(timerInterval); remainingSeconds = 0; updateDisplay(); celebrate('timeout'); }
}

function updateDisplay() {
  const m = Math.floor(remainingSeconds / 60), s = remainingSeconds % 60;
  document.getElementById('timer-display').textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  const el = document.getElementById('timer-display');
  el.className = 'timer-display';
  if      (remainingSeconds <= 60)     el.classList.add('urgent');
  else if (remainingSeconds <= 5 * 60) el.classList.add('warning');
}

function updateMoodByTime() {
  const frac = remainingSeconds / totalSeconds;
  let state;
  if      (frac > 0.6) state = 'running_lots';
  else if (frac > 0.3) state = 'running_mid';
  else if (frac > 0.1) state = 'warning';
  else                 state = 'urgent';
  if (state !== lastMoodState) updateMood(state);
}

function updateMood(state) {
  lastMoodState = state;
  const el = document.getElementById('mood-text');
  el.textContent = MOOD_MESSAGES[state][Math.floor(Math.random() * MOOD_MESSAGES[state].length)];
  el.style.animation = 'none'; void el.offsetWidth;
  el.style.animation = 'bubblePop 0.35s cubic-bezier(0.34,1.56,0.64,1)';
  const wrap = document.querySelector('.bunny-wrap');
  wrap.classList.remove('shake', 'celebrate');
  if      (state === 'idle' || state === 'running_lots') setBunnySpeed(1);
  else if (state === 'running_mid')                      setBunnySpeed(1.2);
  else if (state === 'warning')  { setBunnySpeed(1.8); wrap.classList.add('shake'); }
  else if (state === 'urgent')   { setBunnySpeed(2.8); wrap.classList.add('shake'); }
}

function celebrate(type) {
  clearInterval(timerInterval); isRunning = false;
  lottieAnim && lottieAnim.pause();
  document.querySelector('.bunny-wrap').classList.remove('shake');
  document.querySelector('.bunny-wrap').classList.add('celebrate');
  if (type === 'done') {
    document.getElementById('celeb-icon').textContent  = '🎉';
    document.getElementById('celeb-title').textContent = 'Wonderful, Elizabeth!';
    document.getElementById('celeb-msg').textContent   = 'You finished your meal like a true princess! 👑🐰';
    playFanfare();
  } else {
    document.getElementById('celeb-icon').textContent  = '⏰';
    document.getElementById('celeb-title').textContent = "Time's up, Elizabeth!";
    document.getElementById('celeb-msg').textContent   = "Let's try to eat a little faster next time! 🐰💪";
    playTimeout();
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
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = (1.2 + Math.random() * 1.4) + 'rem';
      el.style.animationDuration = (2.2 + Math.random() * 2.2) + 's';
      el.style.animationDelay = (Math.random() * 0.6) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5500);
    }, i * 70);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('scene-bg').style.backgroundImage = `url('${MEAL_BG.breakfast}')`;
  initLottie();
  PLATE.init('plate-canvas');
  autoDetectMeal();
  setTimeout(() => {
    const slider = document.getElementById('time-slider');
    updateTooltip(slider, selectedMinutes);
  }, 100);
});
