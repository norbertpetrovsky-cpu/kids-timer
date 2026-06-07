// ── ANIMAL COMPETITOR DATABASE ──
const ANIMALS = [
  { id: 1, file: 'images/animal1.json', name: 'Mystery Friend', emoji: '🐾' },
  { id: 2, file: 'images/animal2.json', name: 'Giraffe',        emoji: '🦒' },
  { id: 3, file: 'images/animal3.json', name: 'Bear',           emoji: '🐻' },
  { id: 4, file: 'images/animal4.json', name: 'Pup',            emoji: '🐕' },
  { id: 5, file: 'images/animal5.json', name: 'Funny Friend',   emoji: '🐾' },
  { id: 6, file: 'images/animal6.json', name: 'Rocky',          emoji: '🐾' },
  { id: 7, file: 'images/animal7.json', name: 'Noodle Pal',     emoji: '🍜' },
  { id: 8, file: 'images/animal8.json', name: 'Chomper',        emoji: '😋' },
  { id: 9, file: 'images/animal9.json', name: 'Crab',           emoji: '🦀' },
];

// Animal eats at 110% of Elizabeth's time → always slightly slower
const ANIMAL_SPEED_FACTOR = 1.10;

let currentAnimal     = null;
let animalLottie      = null;
let animalTotalSec    = 0;
let animalRemainSec   = 0;
let animalInterval    = null;
let animalFinished    = false;

function pickRandomAnimal() {
  const idx = Math.floor(Math.random() * ANIMALS.length);
  return ANIMALS[idx];
}

function initAnimal(totalSeconds) {
  currentAnimal   = pickRandomAnimal();
  animalTotalSec  = Math.round(totalSeconds * ANIMAL_SPEED_FACTOR);
  animalRemainSec = animalTotalSec;
  animalFinished  = false;

  // Update name display
  const nameEl = document.getElementById('animal-name');
  if (nameEl) nameEl.textContent = currentAnimal.emoji + ' ' + currentAnimal.name;

  // Load Lottie
  const container = document.getElementById('lottie-animal');
  if (container && typeof lottie !== 'undefined') {
    if (animalLottie) { animalLottie.destroy(); animalLottie = null; }
    animalLottie = lottie.loadAnimation({
      container, renderer: 'svg', loop: true, autoplay: true,
      path: currentAnimal.file,
    });
  }

  drawAnimalPlate();
}

function startAnimalTimer() {
  stopAnimalTimer();
  animalInterval = setInterval(() => {
    if (animalRemainSec > 0) {
      animalRemainSec--;
      drawAnimalPlate();
    } else {
      animalFinished = true;
      stopAnimalTimer();
    }
  }, 1000);
}

function stopAnimalTimer() {
  if (animalInterval) { clearInterval(animalInterval); animalInterval = null; }
}

function pauseAnimalTimer() { stopAnimalTimer(); }

function resumeAnimalTimer() {
  if (!animalFinished) startAnimalTimer();
}

function resetAnimalTimer(totalSeconds) {
  stopAnimalTimer();
  animalTotalSec  = Math.round(totalSeconds * ANIMAL_SPEED_FACTOR);
  animalRemainSec = animalTotalSec;
  animalFinished  = false;
  drawAnimalPlate();
}

// ── ANIMAL MINI PLATE ──
function drawAnimalPlate() {
  const canvas = document.getElementById('animal-plate');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size/2, cy = size/2;
  const outerR = size*0.46, plateR = size*0.36;

  ctx.clearRect(0, 0, size, size);

  const fraction  = Math.max(0, Math.min(1, animalRemainSec / animalTotalSec));
  const sweepRad  = fraction * Math.PI * 2;
  const startA    = -Math.PI/2;
  const endA      = startA + sweepRad;

  // Outer shadow
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowBlur=size*0.06;
  ctx.beginPath(); ctx.arc(cx,cy,outerR,0,Math.PI*2);
  ctx.fillStyle='#e0d8cc'; ctx.fill();
  ctx.restore();

  // Rim
  ctx.beginPath(); ctx.arc(cx,cy,outerR,0,Math.PI*2);
  const rg = ctx.createRadialGradient(cx,cy,size*0.1,cx,cy,outerR);
  rg.addColorStop(0,'#fffaf4'); rg.addColorStop(1,'#ead5bc');
  ctx.fillStyle=rg; ctx.fill();

  // Rim dots (smaller)
  const dc=['#ff6b9d','#ff9800','#4caf50','#2196f3','#9c27b0'];
  for(let i=0;i<18;i++){
    const a=i/18*Math.PI*2;
    ctx.beginPath();
    ctx.arc(cx+Math.cos(a)*(outerR-size*0.04),cy+Math.sin(a)*(outerR-size*0.04),size*0.015,0,Math.PI*2);
    ctx.fillStyle=dc[i%dc.length]; ctx.globalAlpha=0.65; ctx.fill(); ctx.globalAlpha=1;
  }

  // Clean plate
  ctx.beginPath(); ctx.arc(cx,cy,plateR,0,Math.PI*2);
  const pg=ctx.createRadialGradient(cx,cy,0,cx,cy,plateR);
  pg.addColorStop(0,'#fffef9'); pg.addColorStop(1,'#fef0e0');
  ctx.fillStyle=pg; ctx.fill();

  // Food sweep
  if (fraction > 0.002) {
    ctx.save();
    ctx.beginPath();
    if (fraction >= 0.999) {
      ctx.arc(cx,cy,plateR*0.97,0,Math.PI*2);
    } else {
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,plateR*0.97,startA,endA,false);
      ctx.closePath();
    }
    const fg=ctx.createRadialGradient(cx*0.85,cy*0.85,0,cx,cy,plateR);
    fg.addColorStop(0,'#fff9c4'); fg.addColorStop(0.3,'#ffcc02');
    fg.addColorStop(0.6,'#ff9800'); fg.addColorStop(1,'#e64a19');
    ctx.fillStyle=fg; ctx.fill();
    ctx.restore();
  }

  // Shine
  const shine=ctx.createRadialGradient(cx-size*0.1,cy-size*0.1,0,cx,cy,plateR*0.6);
  shine.addColorStop(0,'rgba(255,255,255,0.22)'); shine.addColorStop(1,'rgba(255,255,255,0)');
  ctx.beginPath(); ctx.arc(cx,cy,plateR,0,Math.PI*2);
  ctx.fillStyle=shine; ctx.fill();

  // "DONE" overlay if animal finished
  if (animalFinished) {
    ctx.beginPath(); ctx.arc(cx,cy,plateR,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.fill();
    ctx.font=`bold ${size*0.18}px sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='#e53935'; ctx.fillText('DONE!',cx,cy);
  }
}
