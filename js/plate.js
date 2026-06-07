// ── MAGIC PLATE TIMER V8 ──
// Canvas: plate rim + food sweep only
// Food emoji: HTML divs layered on top (fixes iOS canvas emoji bug)

const PLATE = {
  canvas:    null,
  ctx:       null,
  animFrame: null,
  container: null,  // the .plate-wrap div
  totalSec:  900,
  remainSec: 900,
  foods:     [],

  init(canvasId) {
    this.canvas    = document.getElementById(canvasId);
    this.ctx       = this.canvas.getContext('2d');
    this.container = this.canvas.parentElement;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.spawnFoodDivs();
    this.draw();
  },

  resize() {
    const size = Math.min(this.container.offsetWidth || 260, 280);
    this.canvas.width  = size;
    this.canvas.height = size;
    // Reposition existing food divs
    if (this.foods.length) this.positionFoodDivs();
  },

  setTime(total, remain) {
    this.totalSec  = total;
    this.remainSec = remain;
    this.updateFoodVisibility();
  },

  // ── FOOD DIVS ──
  spawnFoodDivs() {
    // Remove any existing
    this.container.querySelectorAll('.food-emoji').forEach(e => e.remove());
    this.foods = [];

    const items = ['🍗','🥕','🥦','🍝','🌽','🥩','🍅','🥚','🧀','🫐','🍠','🫛','🥐'];
    const count = 13;

    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2 + (i % 2 === 0 ? 0.2 : -0.15);
      const rFrac  = 0.22 + (i % 3) * 0.26; // 0.22 / 0.48 / 0.74 of plateR

      // Normalize angle to 0..2PI starting from top (-PI/2)
      let norm = angle + Math.PI / 2;
      if (norm < 0)          norm += Math.PI * 2;
      if (norm >= Math.PI*2) norm -= Math.PI * 2;

      const div = document.createElement('div');
      div.className   = 'food-emoji';
      div.textContent = items[i % items.length];
      div.style.fontSize   = '0px'; // set properly in positionFoodDivs
      div.style.opacity    = '1';
      div.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      this.container.appendChild(div);

      this.foods.push({ div, angle, rFrac, norm, visible: true });
    }
    this.positionFoodDivs();
  },

  positionFoodDivs() {
    const size   = this.canvas.width;
    const cx     = size / 2, cy = size / 2;
    const plateR = size * 0.365;

    // canvas is 100% width inside .plate-wrap, so pixel coords match
    this.foods.forEach(food => {
      const r  = plateR * food.rFrac;
      const x  = cx + Math.cos(food.angle) * r;
      const y  = cy + Math.sin(food.angle) * r;
      const fs = size * (0.085 + (food.rFrac > 0.5 ? 0.02 : 0));

      food.div.style.left     = x + 'px';
      food.div.style.top      = y + 'px';
      food.div.style.fontSize = fs + 'px';
    });
  },

  updateFoodVisibility() {
    const fraction  = Math.max(0, Math.min(1, this.remainSec / this.totalSec));
    const sweepRad  = fraction * Math.PI * 2;

    this.foods.forEach(food => {
      const inFoodZone = food.norm < sweepRad || fraction >= 0.999;

      if (inFoodZone && !food.visible) {
        // Food reappeared (reset)
        food.visible = true;
        food.div.classList.remove('popping');
        food.div.style.opacity   = '1';
        food.div.style.transform = 'translate(-50%, -50%) scale(1)';
      } else if (!inFoodZone && food.visible) {
        // Food just got eaten — pop animation
        food.visible = false;
        food.div.style.opacity   = '0';
        food.div.style.transform = 'translate(-50%, -50%) scale(1.7)';
      }
    });
  },

  reset() {
    this.foods.forEach(food => {
      food.visible = true;
      food.div.style.opacity   = '1';
      food.div.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  },

  // ── CANVAS DRAW — plate + sweep only, no emoji ──
  draw() {
    const ctx  = this.ctx;
    const size = this.canvas.width;
    const cx = size / 2, cy = size / 2;
    const outerR = size * 0.468;
    const rimR   = size * 0.425;
    const plateR = size * 0.365;

    ctx.clearRect(0, 0, size, size);

    const fraction   = Math.max(0, Math.min(1, this.remainSec / this.totalSec));
    const sweepRad   = fraction * Math.PI * 2;
    const startAngle = -Math.PI / 2;
    const endAngle   = startAngle + sweepRad;

    // ── OUTER SHADOW ──
    ctx.save();
    ctx.shadowColor   = 'rgba(0,0,0,0.20)';
    ctx.shadowBlur    = size * 0.07;
    ctx.shadowOffsetY = size * 0.025;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fillStyle = '#e8ddd0';
    ctx.fill();
    ctx.restore();

    // ── RIM ──
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    const rimGrad = ctx.createRadialGradient(cx - size*0.07, cy - size*0.07, size*0.08, cx, cy, outerR);
    rimGrad.addColorStop(0,   '#fffaf4');
    rimGrad.addColorStop(0.5, '#f7ede0');
    rimGrad.addColorStop(1,   '#ead5bc');
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Decorative dots on rim
    const dotColors = ['#ff6b9d','#ff9800','#4caf50','#2196f3','#9c27b0'];
    const dotCount  = 26;
    for (let i = 0; i < dotCount; i++) {
      const a  = (i / dotCount) * Math.PI * 2;
      const dr = outerR - size * 0.038;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a)*dr, cy + Math.sin(a)*dr, size * 0.013, 0, Math.PI * 2);
      ctx.fillStyle   = dotColors[i % dotColors.length];
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Inner rim line
    ctx.beginPath();
    ctx.arc(cx, cy, rimR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(190,150,100,0.35)';
    ctx.lineWidth   = size * 0.007;
    ctx.stroke();

    // ── CLEAN PLATE ──
    ctx.beginPath();
    ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
    const plateGrad = ctx.createRadialGradient(cx - size*0.05, cy - size*0.05, 0, cx, cy, plateR);
    plateGrad.addColorStop(0,   '#fffef9');
    plateGrad.addColorStop(0.7, '#fff8f0');
    plateGrad.addColorStop(1,   '#fef0e0');
    ctx.fillStyle = plateGrad;
    ctx.fill();

    // ── FOOD AREA (sweep) ──
    if (fraction > 0.002) {
      ctx.save();
      ctx.beginPath();
      if (fraction >= 0.999) {
        ctx.arc(cx, cy, plateR * 0.98, 0, Math.PI * 2);
      } else {
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, plateR * 0.98, startAngle, endAngle, false);
        ctx.closePath();
      }
      const foodGrad = ctx.createRadialGradient(cx * 0.85, cy * 0.85, 0, cx, cy, plateR);
      foodGrad.addColorStop(0,    '#fff9c4');
      foodGrad.addColorStop(0.25, '#ffcc02');
      foodGrad.addColorStop(0.55, '#ff9800');
      foodGrad.addColorStop(0.85, '#e64a19');
      foodGrad.addColorStop(1,    '#bf360c');
      ctx.fillStyle = foodGrad;
      ctx.fill();

      // Soft edge shadow at sweep boundary
      if (fraction < 0.98 && fraction > 0.02) {
        const ex = cx + Math.cos(endAngle) * plateR * 0.7;
        const ey = cy + Math.sin(endAngle) * plateR * 0.7;
        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, plateR * 0.35);
        eg.addColorStop(0, 'rgba(80,20,0,0.28)');
        eg.addColorStop(1, 'rgba(80,20,0,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, plateR, 0, Math.PI*2);
        ctx.fillStyle = eg;
        ctx.fill();
      }
      ctx.restore();
    }

    // ── SHINE ──
    const shine = ctx.createRadialGradient(cx - size*0.12, cy - size*0.12, 0, cx, cy, plateR * 0.6);
    shine.addColorStop(0, 'rgba(255,255,255,0.25)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, plateR, 0, Math.PI*2);
    ctx.fillStyle = shine;
    ctx.fill();

    // ── DEPTH SHADOW ──
    const depth = ctx.createRadialGradient(cx, cy, plateR * 0.72, cx, cy, plateR);
    depth.addColorStop(0, 'rgba(0,0,0,0)');
    depth.addColorStop(1, 'rgba(0,0,0,0.09)');
    ctx.beginPath();
    ctx.arc(cx, cy, plateR, 0, Math.PI*2);
    ctx.fillStyle = depth;
    ctx.fill();

    this.animFrame = requestAnimationFrame(() => this.draw());
  },

  stop() { if (this.animFrame) cancelAnimationFrame(this.animFrame); },
};
