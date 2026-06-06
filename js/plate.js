// ── MAGIC PLATE TIMER ──
// A beautiful circular plate with food that sweeps away clockwise as time passes

const PLATE = {
  canvas: null,
  ctx: null,
  animFrame: null,
  totalSec: 900,
  remainSec: 900,
  foods: [],
  plateParticles: [],

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx    = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.generateFoods();
    this.draw();
  },

  resize() {
    const size = Math.min(this.canvas.parentElement.offsetWidth, 260);
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
    const innerR = size * 0.28; // food zone radius
    const foods = ['🍗','🥕','🥦','🍝','🌽','🥩','🍅','🫛','🥚','🧀','🍠','🫐'];
    this.foods = [];
    // Place food items in a natural scattered pattern inside the plate
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const r = innerR * (0.25 + Math.random() * 0.72);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const fontSize = size * (0.09 + Math.random() * 0.05);
      this.foods.push({
        emoji: foods[i % foods.length],
        x, y, fontSize,
        angle,  // original angle for sweep calculation
        r,
        opacity: 1,
        scale: 1,
        popping: false,
        popProgress: 0,
      });
    }
  },

  // Calculate sweep angle: starts at -90deg (top), sweeps clockwise
  // fraction = remainSec / totalSec → 1 = full plate, 0 = empty
  getSweepAngle() {
    return (this.remainSec / this.totalSec); // 0 to 1
  },

  draw() {
    const c   = this.canvas;
    const ctx = this.ctx;
    const size = c.width;
    const cx = size / 2, cy = size / 2;
    const outerR = size * 0.46;
    const rimR   = size * 0.42;
    const innerR = size * 0.36;
    const plateR = size * 0.34;

    ctx.clearRect(0, 0, size, size);

    const fraction = this.getSweepAngle(); // 1=full, 0=empty
    const sweepRad = fraction * Math.PI * 2; // how much food remains (clockwise from top)

    // ── PLATE OUTER SHADOW ──
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur  = size * 0.06;
    ctx.shadowOffsetY = size * 0.02;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fillStyle = '#e8e0d5';
    ctx.fill();
    ctx.restore();

    // ── PLATE RIM (decorative border) ──
    // Outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    const rimGrad = ctx.createRadialGradient(cx - size*0.08, cy - size*0.08, size*0.1, cx, cy, outerR);
    rimGrad.addColorStop(0,   '#fff9f0');
    rimGrad.addColorStop(0.6, '#f5ede0');
    rimGrad.addColorStop(1,   '#e8d5c0');
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Rim decorative pattern — small dots around edge
    const dotCount = 28;
    for (let i = 0; i < dotCount; i++) {
      const a = (i / dotCount) * Math.PI * 2;
      const dx = cx + Math.cos(a) * (outerR - size * 0.035);
      const dy = cy + Math.sin(a) * (outerR - size * 0.035);
      ctx.beginPath();
      ctx.arc(dx, dy, size * 0.012, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? '#ff9800' : i % 3 === 1 ? '#e91e63' : '#4caf50';
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Inner rim line
    ctx.beginPath();
    ctx.arc(cx, cy, rimR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200,160,110,0.4)';
    ctx.lineWidth = size * 0.008;
    ctx.stroke();

    // ── CLEAN PLATE AREA (revealed as food is eaten) ──
    ctx.beginPath();
    ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
    const plateGrad = ctx.createRadialGradient(cx - size*0.05, cy - size*0.05, 0, cx, cy, plateR);
    plateGrad.addColorStop(0,   '#fffef8');
    plateGrad.addColorStop(0.7, '#fff8f0');
    plateGrad.addColorStop(1,   '#fef0e0');
    ctx.fillStyle = plateGrad;
    ctx.fill();

    // ── FOOD AREA (the pie slice that remains) ──
    if (fraction > 0.001) {
      // Draw food background — warm meal color
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      // Start from top (-90deg), sweep clockwise for remaining fraction
      const startAngle = -Math.PI / 2;
      const endAngle   = startAngle + sweepRad;
      ctx.arc(cx, cy, plateR - size * 0.01, startAngle, endAngle, false);
      ctx.closePath();
      ctx.clip();

      // Rich food gradient background
      const foodGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, plateR);
      foodGrad.addColorStop(0,   '#fff176');
      foodGrad.addColorStop(0.3, '#ffcc02');
      foodGrad.addColorStop(0.6, '#ff9800');
      foodGrad.addColorStop(1,   '#e65100');
      ctx.beginPath();
      ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
      ctx.fillStyle = foodGrad;
      ctx.fill();

      // Texture dots for richness
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * plateR;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a)*r, cy + Math.sin(a)*r, size*0.018, 0, Math.PI*2);
        ctx.fillStyle = i % 2 === 0 ? '#fff' : '#a05000';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // ── SWEPT EDGE — soft bite mark ──
      // Draw a slight darkening at the sweeping edge to look like it's being eaten
      if (fraction < 0.99) {
        ctx.save();
        ctx.beginPath();
        const edgeAngle = -Math.PI/2 + sweepRad;
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, plateR, edgeAngle - 0.18, edgeAngle + 0.02);
        ctx.closePath();
        const edgeGrad = ctx.createLinearGradient(
          cx + Math.cos(edgeAngle) * plateR * 0.6,
          cy + Math.sin(edgeAngle) * plateR * 0.6,
          cx + Math.cos(edgeAngle) * plateR,
          cy + Math.sin(edgeAngle) * plateR
        );
        edgeGrad.addColorStop(0, 'rgba(100,40,0,0)');
        edgeGrad.addColorStop(1, 'rgba(100,40,0,0.35)');
        ctx.fillStyle = edgeGrad;
        ctx.fill();
        ctx.restore();
      }
    }

    // ── FOOD EMOJIS ──
    this.foods.forEach(food => {
      if (food.opacity <= 0) return;

      // Determine if this food item is in the remaining (food) zone
      // Convert food position to angle from center
      const foodAngle = Math.atan2(food.y - cy, food.x - cx); // -PI to PI
      // Normalize to 0..2PI starting from top (-PI/2)
      let normalizedAngle = foodAngle + Math.PI/2;
      if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;

      const inFoodZone = normalizedAngle < sweepRad;

      if (!inFoodZone && !food.popping) {
        food.popping = true;
        food.popProgress = 0;
      }

      if (food.popping) {
        food.popProgress = Math.min(1, food.popProgress + 0.06);
        food.opacity = 1 - food.popProgress;
        food.scale   = 1 + food.popProgress * 0.5;
      }

      ctx.save();
      ctx.globalAlpha = food.opacity;
      ctx.translate(food.x, food.y);
      ctx.scale(food.scale, food.scale);
      ctx.font = `${food.fontSize}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(food.emoji, 0, 0);
      ctx.restore();
    });

    // Reset popped food if timer resets
    if (fraction > 0.98) {
      this.foods.forEach(f => { f.opacity = 1; f.scale = 1; f.popping = false; f.popProgress = 0; });
    }

    // ── CENTER SHINE ──
    const shine = ctx.createRadialGradient(cx - size*0.1, cy - size*0.1, 0, cx, cy, plateR * 0.5);
    shine.addColorStop(0,   'rgba(255,255,255,0.22)');
    shine.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
    ctx.fillStyle = shine;
    ctx.fill();

    // ── PLATE INNER SHADOW (depth) ──
    const innerShadow = ctx.createRadialGradient(cx, cy, plateR * 0.7, cx, cy, plateR);
    innerShadow.addColorStop(0,   'rgba(0,0,0,0)');
    innerShadow.addColorStop(1,   'rgba(0,0,0,0.08)');
    ctx.beginPath();
    ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
    ctx.fillStyle = innerShadow;
    ctx.fill();

    this.animFrame = requestAnimationFrame(() => this.draw());
  },

  stop() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  },

  reset() {
    this.foods.forEach(f => { f.opacity = 1; f.scale = 1; f.popping = false; f.popProgress = 0; });
  }
};
