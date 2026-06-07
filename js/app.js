// ── CONFIG ──
const MEAL_DEFAULTS  = { breakfast:15, lunch:30, dinner:30 };
const MEAL_BG        = { breakfast:'images/bg-breakfast.svg', lunch:'images/bg-lunch.svg', dinner:'images/bg-dinner.svg' };
const MEAL_LABELS    = { breakfast:'🥞 Breakfast', lunch:'🥣 Lunch', dinner:'🍽️ Dinner' };
const MEAL_GREETINGS = {
  breakfast:['Good morning, Elizabeth! 🌅','Rise and shine! ☀️','Morning magic! 🌸'],
  lunch:    ['Lunchtime adventure! 🌿','Enchanted garden feast! 🌼','Yummy lunchtime! 🥗'],
  dinner:   ['Royal dinner time! 🌙','A magical feast awaits! 👑','Evening magic! ✨'],
};
const MOOD_MESSAGES = {
  idle:        ['Ready to eat, Elizabeth? 🍴','Time to be a good eater! 🌟','You can do it, princess! 🐰'],
  running_lots:['Eating so well, Elizabeth! ⭐','So proud of you! 🌸','Keep going, princess! 🎀'],
  running_mid: ['Almost halfway! 💪',"You're doing great! 🌟",'Keep eating, sweetie! 🥄'],
  warning:     ['Hurry up a little! ⏰','A few more bites! 🍴','Almost done, keep going! 🐰'],
  urgent:      ['Quick quick! ⚡','Last bites, princess! 🏃',"You're almost there! 💨"],
};
const CONFETTI=['🎊','🌟','🎈','👑','🌸','✨','🎀','🍬','🌈','💖','⭐','🦋'];
const MAX_FOOD_SELECT = 5;

// ── STATE ──
let currentMeal      = 'breakfast';
let selectedMinutes  = 15;
let totalSeconds     = 15*60;
let remainingSeconds = totalSeconds;
let timerInterval    = null;
let isRunning        = false;
let isPaused         = false;
let lastMoodState    = 'idle';
let lottieAnim       = null;
let lottieAnimL      = null; // landscape bunny
let warningPlayed    = false;
let urgentPlayed     = false;
let selectedFoods    = [];
let isLandscape      = false;

// ── LOTTIE BUNNY ──
function initLottie() {
  if (typeof lottie === 'undefined') return;
  lottieAnim = lottie.loadAnimation({
    container: document.getElementById('lottie-bunny'),
    renderer:'svg', loop:true, autoplay:true, path:'images/bunny.json',
  });
}

function initLottieL() {
  if (typeof lottie === 'undefined') return;
  if (lottieAnimL) { lottieAnimL.destroy(); lottieAnimL = null; }
  lottieAnimL = lottie.loadAnimation({
    container: document.getElementById('lottie-bunny-l'),
    renderer:'svg', loop:true, autoplay:true, path:'images/bunny.json',
  });
}

function setBunnySpeed(s) {
  lottieAnim  && lottieAnim.setSpeed(s);
  lottieAnimL && lottieAnimL.setSpeed(s);
}
function pauseBunny()  { lottieAnim && lottieAnim.pause();  lottieAnimL && lottieAnimL.pause(); }
function resumeBunny() { lottieAnim && lottieAnim.play();   lottieAnimL && lottieAnimL.play(); }

// ── ORIENTATION ──
function checkOrientation() {
  const landscape = window.innerWidth > window.innerHeight && window.innerWidth > 500;
  if (landscape === isLandscape) return;
  isLandscape = landscape;

  const portrait  = document.getElementById('layout-portrait');
  const lsLayout  = document.getElementById('layout-landscape');

  if (landscape) {
    portrait.style.display  = 'none';
    lsLayout.style.display  = 'flex';
    // Sync labels
    document.getElementById('timer-meal-label-l').textContent =
      document.getElementById('timer-meal-label-p').textContent;
    document.getElementById('animal-name-l').textContent =
      document.getElementById('animal-name-p').textContent;
    document.getElementById('mood-text-l').textContent =
      document.getElementById('mood-text').textContent;
    document.getElementById('timer-display-l').textContent =
      document.getElementById('timer-display').textContent;
    syncControlsLandscape();
    // Init landscape bunny & animal
    initLottieL();
    initAnimalLottie('l');
    // Resize plate
    setTimeout(() => {
      PLATE.resize();
      resizeLandscapePlate();
    }, 60);
  } else {
    lsLayout.style.display  = 'none';
    portrait.style.display  = 'flex';
    setTimeout(() => PLATE.resize(), 60);
  }
}

function syncControlsLandscape() {
  const running = isRunning, paused = isPaused;
  const btnStartL = document.getElementById('btn-start-l');
  const btnPauseL = document.getElementById('btn-pause-l');
  const doneBtnL  = document.getElementById('done-btn-l');
  btnStartL.style.display = (!running || paused) ? 'flex' : 'none';
  btnPauseL.style.display = (running && !paused) ? 'flex' : 'none';
  btnPauseL.innerHTML = isPaused ? '▶ Resume' : '⏸ Pause';
  if (isRunning) doneBtnL.classList.add('visible');
  else           doneBtnL.classList.remove('visible');
  const pb = document.getElementById('paused-badge-l');
  if (isPaused) pb.classList.add('show'); else pb.classList.remove('show');
}

// Landscape plate canvas
let plateLottieL = null;
function resizeLandscapePlate() {
  const wrap   = document.getElementById('plate-wrap-l');
  const canvas = document.getElementById('plate-canvas-l');
  if (!wrap || !canvas) return;
  const size = Math.min(wrap.offsetWidth, 220);
  canvas.width = size; canvas.height = size;
}

window.addEventListener('resize',    checkOrientation);
window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 200));

// ── BACKGROUND ──
function switchBackground(meal) {
  const bgNext = document.getElementById('scene-bg-next');
  bgNext.style.backgroundImage = `url('${MEAL_BG[meal]}')`;
  bgNext.style.opacity = '1';
  setTimeout(() => {
    document.getElementById('scene-bg').style.backgroundImage = `url('${MEAL_BG[meal]}')`;
    bgNext.style.opacity = '0';
  }, 700);
}

// ── AUTO DETECT ──
function autoDetectMeal() {
  const h = new Date().getHours();
  let meal;
  if      (h>=6  && h<11) meal='breakfast';
  else if (h>=11 && h<15) meal='lunch';
  else if (h>=17 && h<22) meal='dinner';
  else                     meal='lunch';
  selectMeal(meal);
}

function selectMeal(meal) {
  currentMeal = meal;
  document.body.className = 'meal-'+meal;
  document.querySelectorAll('.meal-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('card-'+meal).classList.add('active');
  selectedMinutes = MEAL_DEFAULTS[meal];
  const slider = document.getElementById('time-slider');
  slider.value = selectedMinutes;
  updateSliderDisplay(selectedMinutes);
  const greets = MEAL_GREETINGS[meal];
  document.getElementById('home-subtitle').textContent = greets[Math.floor(Math.random()*greets.length)];
  switchBackground(meal);
}

// ── SLIDER ──
function onSliderChange(val) {
  resumeAudio(); selectedMinutes = parseInt(val);
  updateSliderDisplay(selectedMinutes);
  document.getElementById('card-time-'+currentMeal).textContent = selectedMinutes+' min';
}
function updateSliderDisplay(minutes) {
  const el = document.getElementById('slider-value');
  el.textContent = minutes+' minutes ⏱️';
  el.style.animation='none'; void el.offsetWidth;
  el.style.animation='valuePop 0.25s cubic-bezier(0.34,1.56,0.64,1)';
  const slider = document.getElementById('time-slider');
  const pct = ((minutes-5)/(60-5))*100;
  slider.style.background=`linear-gradient(to right,var(--accent) ${pct}%,rgba(0,0,0,0.08) ${pct}%)`;
  updateTooltip(slider, minutes);
}
function updateTooltip(slider, minutes) {
  const tooltip = document.getElementById('slider-tooltip');
  if (!tooltip) return;
  tooltip.textContent = minutes+' min';
  const min=parseFloat(slider.min),max=parseFloat(slider.max),val=parseFloat(slider.value);
  const pct=(val-min)/(max-min);
  const thumbW=36, trackW=slider.offsetWidth;
  tooltip.style.left=(thumbW/2+pct*(trackW-thumbW))+'px';
}

// ── FOOD PICKER ──
function buildFoodGrid() {
  const grid = document.getElementById('food-grid');
  grid.innerHTML = ''; selectedFoods = []; updateFoodCounter();
  CAT_ORDER.forEach(catKey => {
    const meta  = CAT_META[catKey];
    const items = FOOD_DB.filter(f=>f.cat===catKey);
    if (!items.length) return;
    const section = document.createElement('div'); section.className='food-category';
    const label   = document.createElement('div');
    label.className='food-cat-label'; label.textContent=meta.label;
    section.appendChild(label);
    const row = document.createElement('div'); row.className='food-items-row';
    items.forEach(food => {
      const card = document.createElement('div');
      card.className='food-item'; card.id='food-'+food.id;
      card.innerHTML=`<div class="food-item-emoji">${food.emoji}</div><div class="food-item-name">${food.name}</div><div class="food-item-check">✓</div>`;
      card.onclick = () => toggleFood(food, card);
      row.appendChild(card);
    });
    section.appendChild(row); grid.appendChild(section);
  });
}

function toggleFood(food, card) {
  resumeAudio();
  const idx = selectedFoods.findIndex(f=>f.id===food.id);
  if (idx > -1) {
    selectedFoods.splice(idx,1); card.classList.remove('selected');
  } else {
    if (selectedFoods.length >= MAX_FOOD_SELECT) return;
    selectedFoods.push(food); card.classList.add('selected');
    card.style.animation='none'; void card.offsetWidth;
    card.style.animation='valuePop 0.25s cubic-bezier(0.34,1.56,0.64,1)';
  }
  updateFoodCounter();
  document.querySelectorAll('.food-item').forEach(c => {
    if (selectedFoods.length>=MAX_FOOD_SELECT && !c.classList.contains('selected'))
      c.classList.add('disabled');
    else c.classList.remove('disabled');
  });
}

function updateFoodCounter() {
  document.getElementById('food-counter').textContent=`${selectedFoods.length} / ${MAX_FOOD_SELECT} selected`;
  document.getElementById('food-go-btn').disabled = selectedFoods.length===0;
}

// ── NAVIGATION ──
function goToFoodPicker() {
  resumeAudio(); playClick(); buildFoodGrid();
  const home=document.getElementById('screen-home');
  const food=document.getElementById('screen-food');
  home.classList.add('slide-out-left');
  setTimeout(()=>{ home.classList.add('hidden'); home.classList.remove('slide-out-left'); food.classList.remove('hidden'); },380);
}

function goHome() {
  clearInterval(timerInterval); stopAnimalTimer();
  isRunning=false; isPaused=false; resumeBunny(); setBunnySpeed(1);
  ['screen-food','screen-timer'].forEach(id=>document.getElementById(id).classList.add('hidden'));
  document.getElementById('screen-home').classList.remove('hidden');
  updateSliderDisplay(selectedMinutes);
}

function goToTimer() {
  resumeAudio(); playClick();
  if (selectedFoods.length===0) return;
  totalSeconds=selectedMinutes*60; remainingSeconds=totalSeconds;
  isRunning=false; isPaused=false; warningPlayed=false; urgentPlayed=false;

  const mealLabel = MEAL_LABELS[currentMeal];
  document.getElementById('timer-meal-label-p').textContent = mealLabel;
  document.getElementById('timer-meal-label-l').textContent = mealLabel;

  PLATE.setFoods(selectedFoods);
  PLATE.setTime(totalSeconds, remainingSeconds);

  // Init animal competitor
  initAnimal(totalSeconds);
  initAnimalLottie('p');

  updateDisplay(); updateMood('idle');
  setBunnySpeed(1); resumeBunny();
  document.querySelector('.bunny-wrap').classList.remove('shake','celebrate');
  resetTimerUI();

  const food=document.getElementById('screen-food');
  const timer=document.getElementById('screen-timer');
  food.classList.add('slide-out-left');
  setTimeout(()=>{
    food.classList.add('hidden'); food.classList.remove('slide-out-left');
    timer.classList.remove('hidden');
    setTimeout(()=>{ PLATE.resize(); checkOrientation(); resizeLandscapePlate(); },60);
  },380);
}

function goToFoodPickerFromTimer() {
  clearInterval(timerInterval); stopAnimalTimer();
  isRunning=false; isPaused=false; resumeBunny(); setBunnySpeed(1);
  document.getElementById('screen-timer').classList.add('hidden');
  document.getElementById('screen-food').classList.remove('hidden');
}

function resetTimerUI() {
  ['btn-start','btn-start-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='flex';});
  ['btn-pause','btn-pause-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  ['btn-pause','btn-pause-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='⏸ Pause';});
  ['done-btn','done-btn-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('visible');});
  ['paused-badge','paused-badge-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('show');});
  document.getElementById('timer-display').className='timer-display';
  if (document.getElementById('timer-display-l')) document.getElementById('timer-display-l').className='timer-display';
}

// ── ANIMAL LOTTIE (loads into portrait or landscape container) ──
function initAnimalLottie(mode) {
  if (!currentAnimal || typeof lottie === 'undefined') return;
  const containerId = mode==='p' ? 'lottie-animal-p' : 'lottie-animal-l';
  const container   = document.getElementById(containerId);
  if (!container) return;
  // Destroy previous
  const existing = container._lottie;
  if (existing) existing.destroy();
  const anim = lottie.loadAnimation({
    container, renderer:'svg', loop:true, autoplay:true,
    path: currentAnimal.file,
  });
  container._lottie = anim;
  // Sync name
  document.getElementById('animal-name-p').textContent = currentAnimal.emoji+' '+currentAnimal.name;
  document.getElementById('animal-name-l').textContent = currentAnimal.emoji+' '+currentAnimal.name;
}

// Override drawAnimalPlate to draw on both canvases
const _origDrawAnimalPlate = drawAnimalPlate;
function drawAnimalPlate() {
  _drawAnimalPlateTo('animal-plate-p');
  _drawAnimalPlateTo('animal-plate-l');
}
function _drawAnimalPlateTo(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx=canvas.getContext('2d'), size=canvas.width;
  const cx=size/2, cy=size/2, outerR=size*0.46, plateR=size*0.36;
  ctx.clearRect(0,0,size,size);
  const fraction=Math.max(0,Math.min(1,animalRemainSec/animalTotalSec));
  const sweepRad=fraction*Math.PI*2, startA=-Math.PI/2, endA=startA+sweepRad;

  ctx.save(); ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowBlur=size*0.06;
  ctx.beginPath(); ctx.arc(cx,cy,outerR,0,Math.PI*2); ctx.fillStyle='#e0d8cc'; ctx.fill(); ctx.restore();

  ctx.beginPath(); ctx.arc(cx,cy,outerR,0,Math.PI*2);
  const rg=ctx.createRadialGradient(cx,cy,size*0.1,cx,cy,outerR);
  rg.addColorStop(0,'#fffaf4'); rg.addColorStop(1,'#ead5bc'); ctx.fillStyle=rg; ctx.fill();

  const dc=['#ff6b9d','#ff9800','#4caf50','#2196f3','#9c27b0'];
  for(let i=0;i<16;i++){
    const a=i/16*Math.PI*2;
    ctx.beginPath(); ctx.arc(cx+Math.cos(a)*(outerR-size*0.05),cy+Math.sin(a)*(outerR-size*0.05),size*0.018,0,Math.PI*2);
    ctx.fillStyle=dc[i%dc.length]; ctx.globalAlpha=0.65; ctx.fill(); ctx.globalAlpha=1;
  }
  ctx.beginPath(); ctx.arc(cx,cy,plateR,0,Math.PI*2);
  const pg=ctx.createRadialGradient(cx,cy,0,cx,cy,plateR);
  pg.addColorStop(0,'#fffef9'); pg.addColorStop(1,'#fef0e0'); ctx.fillStyle=pg; ctx.fill();

  if(fraction>0.002){
    ctx.save(); ctx.beginPath();
    if(fraction>=0.999){ ctx.arc(cx,cy,plateR*0.97,0,Math.PI*2); }
    else { ctx.moveTo(cx,cy); ctx.arc(cx,cy,plateR*0.97,startA,endA,false); ctx.closePath(); }
    const fg=ctx.createRadialGradient(cx*0.85,cy*0.85,0,cx,cy,plateR);
    fg.addColorStop(0,'#fff9c4'); fg.addColorStop(0.3,'#ffcc02');
    fg.addColorStop(0.6,'#ff9800'); fg.addColorStop(1,'#e64a19');
    ctx.fillStyle=fg; ctx.fill(); ctx.restore();
  }
  const shine=ctx.createRadialGradient(cx-size*0.1,cy-size*0.1,0,cx,cy,plateR*0.6);
  shine.addColorStop(0,'rgba(255,255,255,0.22)'); shine.addColorStop(1,'rgba(255,255,255,0)');
  ctx.beginPath(); ctx.arc(cx,cy,plateR,0,Math.PI*2); ctx.fillStyle=shine; ctx.fill();

  if(animalFinished){
    ctx.beginPath(); ctx.arc(cx,cy,plateR,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.fill();
    ctx.font=`bold ${size*0.18}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='#e53935'; ctx.fillText('DONE!',cx,cy);
  }
}

// Also draw landscape plate via PLATE object
const _origPLATEdraw = PLATE.draw.bind(PLATE);
function drawLandscapePlate() {
  const canvas = document.getElementById('plate-canvas-l');
  if (!canvas || !isLandscape) return;
  // Mirror PLATE state onto landscape canvas
  const ctx=canvas.getContext('2d'), size=canvas.width;
  if (!size) return;
  // Temporarily override PLATE canvas
  const origCanvas = PLATE.canvas;
  PLATE.canvas = canvas;
  PLATE.ctx    = ctx;
  PLATE.draw();
  PLATE.canvas = origCanvas;
  PLATE.ctx    = origCanvas.getContext('2d');
}

// ── TIMER ──
function startTimer() {
  if (isRunning) return; resumeAudio();
  isRunning=true; isPaused=false; warningPlayed=false; urgentPlayed=false;
  ['btn-start','btn-start-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  ['btn-pause','btn-pause-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='flex';});
  ['done-btn','done-btn-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('visible');});
  playStartChime(); updateMood('running_lots');
  startAnimalTimer();
  timerInterval=setInterval(tick,1000);
}

function pauseTimer() {
  if (!isRunning) return; resumeAudio();
  if (!isPaused) {
    isPaused=true; clearInterval(timerInterval); pauseAnimalTimer(); pauseBunny(); playClick();
    ['btn-pause','btn-pause-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='▶ Resume';});
    ['paused-badge','paused-badge-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('show');});
  } else {
    isPaused=false; resumeAnimalTimer(); resumeBunny(); playClick();
    ['btn-pause','btn-pause-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='⏸ Pause';});
    ['paused-badge','paused-badge-l'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('show');});
    timerInterval=setInterval(tick,1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval); stopAnimalTimer();
  isRunning=false; isPaused=false; warningPlayed=false; urgentPlayed=false;
  remainingSeconds=totalSeconds;
  resumeBunny(); setBunnySpeed(1);
  PLATE.setTime(totalSeconds,remainingSeconds);
  if (!PLATE.isLiquid) PLATE.reset();
  resetAnimalTimer(totalSeconds);
  resetTimerUI();
  document.querySelector('.bunny-wrap').classList.remove('shake','celebrate');
  updateDisplay(); updateMood('idle');
}

function tick() {
  remainingSeconds--;
  PLATE.setTime(totalSeconds,remainingSeconds);
  updateDisplay(); updateMoodByTime();
  if (remainingSeconds===5*60 && !warningPlayed){warningPlayed=true;playWarningBell();}
  if (remainingSeconds===60  && !urgentPlayed) {urgentPlayed=true; playUrgentTick();}
  if (remainingSeconds<60 && remainingSeconds>0 && remainingSeconds%10===0) playUrgentTick();
  if (remainingSeconds<=0){clearInterval(timerInterval);remainingSeconds=0;updateDisplay();celebrate('done_timeout');}
}

function updateDisplay() {
  const m=Math.floor(remainingSeconds/60),s=remainingSeconds%60;
  const txt=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  document.getElementById('timer-display').textContent=txt;
  if (document.getElementById('timer-display-l')) document.getElementById('timer-display-l').textContent=txt;
  ['timer-display','timer-display-l'].forEach(id=>{
    const el=document.getElementById(id); if(!el)return;
    el.className='timer-display';
    if(remainingSeconds<=60)    el.classList.add('urgent');
    else if(remainingSeconds<=5*60) el.classList.add('warning');
  });
}

function updateMoodByTime() {
  const frac=remainingSeconds/totalSeconds;
  let state;
  if      (frac>0.6) state='running_lots';
  else if (frac>0.3) state='running_mid';
  else if (frac>0.1) state='warning';
  else               state='urgent';
  if (state!==lastMoodState) updateMood(state);
}

function updateMood(state) {
  lastMoodState=state;
  const msg=MOOD_MESSAGES[state][Math.floor(Math.random()*MOOD_MESSAGES[state].length)];
  ['mood-text','mood-text-l'].forEach(id=>{
    const el=document.getElementById(id); if(!el)return;
    el.textContent=msg; el.style.animation='none'; void el.offsetWidth;
    el.style.animation='bubblePop 0.35s cubic-bezier(0.34,1.56,0.64,1)';
  });
  const wrap=document.querySelector('.bunny-wrap');
  wrap.classList.remove('shake','celebrate');
  if      (state==='idle'||state==='running_lots') setBunnySpeed(1);
  else if (state==='running_mid')                  setBunnySpeed(1.2);
  else if (state==='warning'){setBunnySpeed(1.8);wrap.classList.add('shake');}
  else if (state==='urgent') {setBunnySpeed(2.8);wrap.classList.add('shake');}
}

function celebrate(type) {
  clearInterval(timerInterval); stopAnimalTimer(); isRunning=false;
  pauseBunny();
  document.querySelector('.bunny-wrap').classList.remove('shake');
  document.querySelector('.bunny-wrap').classList.add('celebrate');

  if (type==='done') {
    document.getElementById('celeb-icon').textContent='🎉';
    document.getElementById('celeb-title').textContent='Wonderful, Elizabeth!';
    document.getElementById('celeb-msg').textContent='You beat '+currentAnimal.name+'! You\'re the fastest eater! 🏆🐰';
    playFanfare();
  } else {
    document.getElementById('celeb-icon').textContent='⏰';
    document.getElementById('celeb-title').textContent="Time's up, Elizabeth!";
    document.getElementById('celeb-msg').textContent="Let's try to eat a little faster next time! 🐰💪";
    playTimeout();
  }
  document.getElementById('celebrate-overlay').classList.add('show');
  launchConfetti();
}

function dismissCelebration() {
  document.getElementById('celebrate-overlay').classList.remove('show');
  resumeBunny(); resetTimer();
}

function launchConfetti() {
  for(let i=0;i<28;i++){
    setTimeout(()=>{
      const el=document.createElement('div');
      el.className='confetti-piece';
      el.textContent=CONFETTI[Math.floor(Math.random()*CONFETTI.length)];
      el.style.left=Math.random()*100+'vw';
      el.style.fontSize=(1.2+Math.random()*1.4)+'rem';
      el.style.animationDuration=(2.2+Math.random()*2.2)+'s';
      el.style.animationDelay=(Math.random()*0.6)+'s';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),5500);
    },i*70);
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('scene-bg').style.backgroundImage=`url('${MEAL_BG.breakfast}')`;
  initLottie();
  PLATE.init('plate-canvas');
  autoDetectMeal();
  checkOrientation();
  setTimeout(()=>{
    const slider=document.getElementById('time-slider');
    updateTooltip(slider,selectedMinutes);
  },100);
});
