// ── ANIMAL COMPANION ──
// One random animal per session — replaces the bunny entirely
// Reacts to timer progress via Lottie speed

const ANIMALS = [
  { id:1, file:'images/animal1.json', name:'Mystery Friend', emoji:'🐾' },
  { id:2, file:'images/animal2.json', name:'Giraffe',        emoji:'🦒' },
  { id:3, file:'images/animal3.json', name:'Bear',           emoji:'🐻' },
  { id:4, file:'images/animal4.json', name:'Pup',            emoji:'🐕' },
  { id:5, file:'images/animal5.json', name:'Funny Friend',   emoji:'🐾' },
  { id:6, file:'images/animal6.json', name:'Rocky',          emoji:'🐾' },
  { id:7, file:'images/animal7.json', name:'Noodle Pal',     emoji:'🍜' },
  { id:8, file:'images/animal8.json', name:'Chomper',        emoji:'😋' },
  { id:9, file:'images/animal9.json', name:'Crab',           emoji:'🦀' },
];

let currentAnimal = null;
let animalLottie  = null;

function pickRandomAnimal() {
  return ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
}

function initAnimal() {
  currentAnimal = pickRandomAnimal();

  // Update name displays
  document.querySelectorAll('.animal-name-display').forEach(el => {
    el.textContent = currentAnimal.emoji + ' ' + currentAnimal.name;
  });

  loadAnimalLottie();
}

function loadAnimalLottie() {
  if (typeof lottie === 'undefined' || !currentAnimal) return;
  const container = document.getElementById('lottie-animal');
  if (!container) return;
  if (animalLottie) { animalLottie.destroy(); animalLottie = null; }
  animalLottie = lottie.loadAnimation({
    container, renderer:'svg', loop:true, autoplay:true,
    path: currentAnimal.file,
  });
}

function setAnimalSpeed(speed) {
  if (!animalLottie) return;
  animalLottie.setSpeed(speed);
}

function pauseAnimal()  { animalLottie && animalLottie.pause(); }
function resumeAnimal() { animalLottie && animalLottie.play();  }

// Mood-based animal reactions — mirrors bunny behavior
function setAnimalMood(state) {
  const wrap = document.getElementById('animal-wrap');
  if (!wrap) return;
  wrap.classList.remove('shake','celebrate');
  if      (state==='idle'||state==='running_lots') setAnimalSpeed(1);
  else if (state==='running_mid')                  setAnimalSpeed(1.2);
  else if (state==='warning') { setAnimalSpeed(1.8); wrap.classList.add('shake'); }
  else if (state==='urgent')  { setAnimalSpeed(2.8); wrap.classList.add('shake'); }
  else if (state==='celebrate') {
    setAnimalSpeed(1);
    wrap.classList.add('celebrate');
  }
}
