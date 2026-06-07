// ── MAGIC PLATE TIMER ──
const PLATE = {
  canvas: null,
  ctx: null,
  animFrame: null,
  totalSec: 900,
  remainSec: 900,
  foods: [],

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx    = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.generateFoods();
    this.draw();
  },

  resize() {
    const parent = this.canvas.parentElement;
    const size   = Math.min(parent.offsetWidth || 260, 280);
    this.canvas.width  = size;
    this.canvas.height = size;
    this.generateFoods();
  },

  setTime(total, remain) {
    this.totalSec  = total;
    this.remainSec = remain;
  },

  generateFoods() {
    const size = this.canvas.width;
    const cx = size / 2, cy = size / 2;
    const maxR = size * 0.30;
    const items = ['🍗','🥕','🥦','🍝','🌽','🥩','🍅','🥚','🧀','🫐','🍠','🫛','🥐','🍖'];
    this.foods = [];
    const count = 13;
    for (let i = 0; i < count; i++) {
      const angle   = (i / count) * Math.PI * 2 + (i % 2 === 0 ? 0.2 : -0.15);
      const r       = maxR * (0.22 + (i % 3) * 0.26);
      const x       = cx + Math.cos(angle) * r;
      const y       = cy + Math.sin(angle) * r;
      const fs      = size * (0.085 + (i % 2) * 0.025);
      // Normalize angle to 0..2PI from top
      let norm = angle + Math.PI / 2;
      if (norm < 0)           norm += Math.PI * 2;
      if (norm >= Math.PI*2)  norm -= Math.PI * 2;
      this.foods.push({
        emoji: items[i % items.length],
        x, y, fs, norm,
        opacity: 1, scale: 1,
        popping: false, popProgress: 0,
      });
    }
  },

  draw() {
    const ctx  = this.ctx;
    const size = this.canvas.width;
    const cx = size / 2, cy = size / 2;
    const outerR = size * 0.468;
    const rimR   = size * 0.425;
    const plateR = size * 0.365;

    ctx.clearRect(0, 0, size, size);

    const fraction  = Math.max(0, Math.min(1, this.remainSec / this.totalSec));
    const sweepRad  = fraction * Math.PI * 2;
    const startAngle = -Math.PI / 2;
    const endAngle   = startAngle + sweepRad;

    // ── OUTER PLATE SHADOW ──
    ctx.save();
    ctx.shadowColor   = 'rgba(0,0,0,0.20)';
    ctx.shadowBlur    = size * 0.07;
    ctx.shadowOffsetY = size * 0.025;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fillStyle = '#e8ddd0';
    ctx.fill();
    ctx.restore();

    // ── PLATE RIM ──
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    const rimGrad = ctx.createRadialGradient(cx - size*0.07, cy - size*0.07, size*0.08, cx, cy, outerR);
    rimGrad.addColorStop(0,   '#fffaf4');
    rimGrad.addColorStop(0.5, '#f7ede0');
    rimGrad.addColorStop(1,   '#ead5bc');
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Rim decorative dots
    const dotCount = 26;
    const dotColors = ['#ff6b9d','#ff9800','#4caf50','#2196f3','#9c27b0'];
    for (let i = 0; i < dotCount; i++) {
      const a  = (i / dotCount) * Math.PI * 2;
      const dr = outerR - size * 0.038;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * dr, cy + Math.sin(a) * dr, size * 0.013, 0, Math.PI * 2);
      ctx.fillStyle   = dotColors[i % dotColors.length];
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Inner rim ring
    ctx.beginPath();
    ctx.arc(cx, cy, rimR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(190,150,100,0.35)';
    ctx.lineWidth   = size * 0.007;
    ctx.stroke();

    // ── CLEAN PLATE (full circle, always visible) ──
    ctx.beginPath();
    ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
    const plateGrad = ctx.createRadialGradient(cx - size*0.05, cy - size*0.05, 0, cx, cy, plateR);
    plateGrad.addColorStop(0,   '#fffef9');
    plateGrad.addColorStop(0.7, '#fff8f0');
    plateGrad.addColorStop(1,   '#fef0e0');
    ctx.fillStyle = plateGrad;
    ctx.fill();

    // ── FOOD AREA (pie slice remaining) ──
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

      // Food gradient — rich warm meal colors
      const foodGrad = ctx.createRadialGradient(cx * 0.85, cy * 0.85, 0, cx, cy, plateR);
      foodGrad.addColorStop(0,   '#fff9c4');
      foodGrad.addColorStop(0.25,'#ffcc02');
      foodGrad.addColorStop(0.55,'#ff9800');
      foodGrad.addColorStop(0.85,'#e64a19');
      foodGrad.addColorStop(1,   '#bf360c');
      ctx.fillStyle = foodGrad;
      ctx.fill();

      // Subtle texture over food
      ctx.globalAlpha = 0.07;
      for (let i = 0; i < 18; i++) {
        const ta = Math.random() * Math.PI * 2;
        const tr = Math.random() * plateR * 0.9;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ta)*tr, cy + Math.sin(ta)*tr, size * 0.02, 0, Math.PI*2);
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#7f3000';
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Soft eaten-edge darkening
      if (fraction < 0.98 && fraction > 0.02) {
        const edgeA = endAngle;
        const edgeX = cx + Math.cos(edgeA) * plateR * 0.7;
        const edgeY = cy + Math.sin(edgeA) * plateR * 0.7;
        const edgeGrad = ctx.createRadialGradient(edgeX, edgeY, 0, edgeX, edgeY, plateR * 0.35);
        edgeGrad.addColorStop(0,   'rgba(80,20,0,0.28)');
        edgeGrad.addColorStop(1,   'rgba(80,20,0,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, plateR, 0, Math.PI*2);
        ctx.fillStyle = edgeGrad;
        ctx.fill();
      }
      ctx.restore();
    }

    // ── PLATE SHINE (always on top of food, before emojis) ──
    const shine = ctx.createRadialGradient(cx - size*0.12, cy - size*0.12, 0, cx, cy, plateR * 0.6);
    shine.addColorStop(0,   'rgba(255,255,255,0.25)');
    shine.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, plateR, 0, Math.PI*2);
    ctx.fillStyle = shine;
    ctx.fill();

    // ── FOOD EMOJIS — drawn LAST, no clipping, always on top ──
    // This fixes iOS canvas emoji rendering issue
    this.foods.forEach(food => {
      if (food.opacity <= 0.01) return;

      // Is this food in the swept (eaten) zone?
      const inFoodZone = food.norm < sweepRad || fraction >= 0.999;

      if (!inFoodZone && !food.popping) {
        food.popping     = true;
        food.popProgress = 0;
      }
      if (food.popping) {
        food.popProgress = Math.min(1, food.popProgress + 0.055);
        food.opacity     = 1 - food.popProgress;
        food.scale       = 1 + food.popProgress * 0.6;
      }

      // Only draw if food is inside the plate area
      const dx = food.x - cx, dy = food.y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > plateR * 0.95) return;

      ctx.save();
      ctx.globalAlpha = food.opacity;
      ctx.translate(food.x, food.y);
      ctx.scale(food.scale, food.scale);
      ctx.font         = `${food.fs}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(food.emoji, 0, 0);
      ctx.restore();
    });

    // Reset foods when plate is full
    if (fraction > 0.98) {
      this.foods.forEach(f => {
        f.opacity = 1; f.scale = 1; f.popping = false; f.popProgress = 0;
      });
    }

    // ── INNER PLATE EDGE SHADOW (depth) ──
    const depthGrad = ctx.createRadialGradient(cx, cy, plateR * 0.72, cx, cy, plateR);
    depthGrad.addColorStop(0,   'rgba(0,0,0,0)');
    depthGrad.addColorStop(1,   'rgba(0,0,0,0.09)');
    ctx.beginPath();
    ctx.arc(cx, cy, plateR, 0, Math.PI*2);
    ctx.fillStyle = depthGrad;
    ctx.fill();

    this.animFrame = requestAnimationFrame(() => this.draw());
  },

  stop()  { if (this.animFrame) cancelAnimationFrame(this.animFrame); },
  reset() { this.foods.forEach(f => { f.opacity = 1; f.scale = 1; f.popping = false; f.popProgress = 0; }); },
};
