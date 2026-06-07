// ── MAGIC PLATE V9 ──
// Supports: custom food items + liquid mode (vývar/soup)

const PLATE = {
  canvas: null, ctx: null, animFrame: null, container: null,
  totalSec: 900, remainSec: 900,
  foods: [], isLiquid: false,
  liquidParticles: [], liquidOffset: 0,

  init(canvasId) {
    this.canvas    = document.getElementById(canvasId);
    this.ctx       = this.canvas.getContext('2d');
    this.container = this.canvas.parentElement;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.draw();
  },

  resize() {
    const size = Math.min(this.container.offsetWidth || 260, 280);
    this.canvas.width = size; this.canvas.height = size;
    if (this.foods.length) this.positionFoodDivs();
    if (this.isLiquid)     this.initLiquidParticles();
  },

  setTime(total, remain) {
    this.totalSec = total; this.remainSec = remain;
    if (!this.isLiquid) this.updateFoodVisibility();
  },

  // ── SET FOOD from picker selection ──
  setFoods(selectedItems) {
    // Remove existing food divs
    this.container.querySelectorAll('.food-emoji').forEach(e => e.remove());
    this.foods = [];

    // Detect liquid mode: any liquid item selected
    this.isLiquid = selectedItems.some(f => f.type === 'liquid');

    if (this.isLiquid) {
      this.initLiquidParticles();
      return; // no emoji divs in liquid mode
    }

    // Solid mode: fill 12 slots by repeating selected items
    const SLOTS = 12;
    const filled = [];
    for (let i = 0; i < SLOTS; i++) {
      filled.push(selectedItems[i % selectedItems.length]);
    }

    const size   = this.canvas.width;
    const cx     = size / 2, cy = size / 2;
    const plateR = size * 0.365;

    // Natural scattered positions (fixed angles + varying radii)
    const positions = [];
    for (let i = 0; i < SLOTS; i++) {
      const angle  = (i / SLOTS) * Math.PI * 2 + (i % 2 === 0 ? 0.22 : -0.18);
      const rFrac  = i % 3 === 0 ? 0.28 : i % 3 === 1 ? 0.54 : 0.76;
      let norm     = angle + Math.PI / 2;
      if (norm < 0)          norm += Math.PI * 2;
      if (norm >= Math.PI*2) norm -= Math.PI * 2;
      positions.push({ angle, rFrac, norm });
    }

    filled.forEach((food, i) => {
      const pos = positions[i];
      const div = document.createElement('div');
      div.className   = 'food-emoji';
      div.textContent = food.emoji;
      div.style.opacity    = '1';
      div.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      this.container.appendChild(div);
      this.foods.push({ div, ...pos, visible: true });
    });

    this.positionFoodDivs();
    this.updateFoodVisibility();
  },

  positionFoodDivs() {
    const size   = this.canvas.width;
    const cx     = size / 2, cy = size / 2;
    const plateR = size * 0.365;
    // Fewer items → bigger emoji
    const baseFs = this.foods.length <= 5 ? 0.13 : 0.085;

    this.foods.forEach(food => {
      const r  = plateR * food.rFrac;
      const x  = cx + Math.cos(food.angle) * r;
      const y  = cy + Math.sin(food.angle) * r;
      const fs = size * (baseFs + (food.rFrac > 0.5 ? 0.018 : 0));
      food.div.style.left     = x + 'px';
      food.div.style.top      = y + 'px';
      food.div.style.fontSize = fs + 'px';
    });
  },

  updateFoodVisibility() {
    if (this.isLiquid) return;
    const fraction = Math.max(0, Math.min(1, this.remainSec / this.totalSec));
    const sweepRad = fraction * Math.PI * 2;
    this.foods.forEach(food => {
      const inZone = food.norm < sweepRad || fraction >= 0.999;
      if (inZone && !food.visible) {
        food.visible = true;
        food.div.style.opacity   = '1';
        food.div.style.transform = 'translate(-50%,-50%) scale(1)';
      } else if (!inZone && food.visible) {
        food.visible = false;
        food.div.style.opacity   = '0';
        food.div.style.transform = 'translate(-50%,-50%) scale(1.7)';
      }
    });
  },

  reset() {
    this.foods.forEach(f => {
      f.visible = true;
      f.div.style.opacity   = '1';
      f.div.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  },

  // ── LIQUID MODE ──
  initLiquidParticles() {
    this.liquidParticles = [];
    const size   = this.canvas.width;
    const plateR = size * 0.33;
    // Floating ingredient dots: carrots + noodle shapes
    const types = ['🥕','🥕','🥕','⬤','⬤','⬤','⬤','⬤'];
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r     = Math.random() * plateR * 0.72;
      this.liquidParticles.push({
        x:     size/2 + Math.cos(angle) * r,
        y:     size/2 + Math.sin(angle) * r,
        baseY: size/2 + Math.sin(angle) * r,
        speed: 0.3 + Math.random() * 0.4,
        amp:   2 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        type:  types[i % types.length],
        size:  size * (i < 3 ? 0.055 : 0.025),
        color: i < 3 ? null : `hsla(${30 + Math.random()*20},80%,${60+Math.random()*15}%,0.6)`,
      });
    }
  },

  // ── DRAW ──
  draw() {
    const ctx = this.ctx, size = this.canvas.width;
    const cx = size/2, cy = size/2;
    const outerR = size*0.468, rimR = size*0.425, plateR = size*0.365;

    ctx.clearRect(0, 0, size, size);

    const fraction   = Math.max(0, Math.min(1, this.remainSec / this.totalSec));
    const sweepRad   = fraction * Math.PI * 2;
    const startAngle = -Math.PI/2;
    const endAngle   = startAngle + sweepRad;

    // ── OUTER SHADOW ──
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,0.20)';ctx.shadowBlur=size*0.07;ctx.shadowOffsetY=size*0.025;
    ctx.beginPath();ctx.arc(cx,cy,outerR,0,Math.PI*2);ctx.fillStyle='#e8ddd0';ctx.fill();
    ctx.restore();

    // ── RIM ──
    ctx.beginPath();ctx.arc(cx,cy,outerR,0,Math.PI*2);
    const rg=ctx.createRadialGradient(cx-size*0.07,cy-size*0.07,size*0.08,cx,cy,outerR);
    rg.addColorStop(0,'#fffaf4');rg.addColorStop(0.5,'#f7ede0');rg.addColorStop(1,'#ead5bc');
    ctx.fillStyle=rg;ctx.fill();

    const dc=['#ff6b9d','#ff9800','#4caf50','#2196f3','#9c27b0'],dotCount=26;
    for(let i=0;i<dotCount;i++){
      const a=i/dotCount*Math.PI*2,dr=outerR-size*0.038;
      ctx.beginPath();ctx.arc(cx+Math.cos(a)*dr,cy+Math.sin(a)*dr,size*0.013,0,Math.PI*2);
      ctx.fillStyle=dc[i%dc.length];ctx.globalAlpha=0.7;ctx.fill();ctx.globalAlpha=1;
    }
    ctx.beginPath();ctx.arc(cx,cy,rimR,0,Math.PI*2);
    ctx.strokeStyle='rgba(190,150,100,0.35)';ctx.lineWidth=size*0.007;ctx.stroke();

    // ── CLEAN PLATE ──
    ctx.beginPath();ctx.arc(cx,cy,plateR,0,Math.PI*2);
    const pg=ctx.createRadialGradient(cx-size*0.05,cy-size*0.05,0,cx,cy,plateR);
    pg.addColorStop(0,'#fffef9');pg.addColorStop(0.7,'#fff8f0');pg.addColorStop(1,'#fef0e0');
    ctx.fillStyle=pg;ctx.fill();

    // ── FOOD AREA ──
    if (fraction > 0.002) {
      ctx.save();
      ctx.beginPath();
      if (this.isLiquid) {
        // Liquid: full circle fill — golden soup color
        ctx.arc(cx, cy, plateR*0.98, 0, Math.PI*2);
      } else {
        if (fraction >= 0.999) {
          ctx.arc(cx, cy, plateR*0.98, 0, Math.PI*2);
        } else {
          ctx.moveTo(cx,cy);
          ctx.arc(cx, cy, plateR*0.98, startAngle, endAngle, false);
          ctx.closePath();
        }
      }

      if (this.isLiquid) {
        // Rich golden soup gradient
        const lg = ctx.createRadialGradient(cx*0.8, cy*0.8, 0, cx, cy, plateR);
        lg.addColorStop(0,    '#fff9c4');
        lg.addColorStop(0.2,  '#ffe082');
        lg.addColorStop(0.5,  '#ffc107');
        lg.addColorStop(0.8,  '#ff8f00');
        lg.addColorStop(1,    '#e65100');
        ctx.fillStyle = lg; ctx.fill();

        // Animated shimmer wave
        this.liquidOffset = (this.liquidOffset || 0) + 0.018;
        const shimmerY = cy + Math.sin(this.liquidOffset) * size * 0.015;
        const sg = ctx.createLinearGradient(cx - plateR, shimmerY - size*0.04, cx + plateR, shimmerY + size*0.04);
        sg.addColorStop(0,    'rgba(255,255,255,0)');
        sg.addColorStop(0.4,  'rgba(255,255,255,0)');
        sg.addColorStop(0.5,  'rgba(255,255,255,0.18)');
        sg.addColorStop(0.6,  'rgba(255,255,255,0)');
        sg.addColorStop(1,    'rgba(255,255,255,0)');
        ctx.fillStyle = sg; ctx.fill();

        // Floating particles (emoji drawn outside clip below)
      } else {
        // Solid food gradient
        const fg = ctx.createRadialGradient(cx*0.85, cy*0.85, 0, cx, cy, plateR);
        fg.addColorStop(0,'#fff9c4');fg.addColorStop(0.25,'#ffcc02');
        fg.addColorStop(0.55,'#ff9800');fg.addColorStop(0.85,'#e64a19');fg.addColorStop(1,'#bf360c');
        ctx.fillStyle=fg;ctx.fill();
        // Edge shadow
        if (fraction<0.98 && fraction>0.02) {
          const ex=cx+Math.cos(endAngle)*plateR*0.7, ey=cy+Math.sin(endAngle)*plateR*0.7;
          const eg=ctx.createRadialGradient(ex,ey,0,ex,ey,plateR*0.35);
          eg.addColorStop(0,'rgba(80,20,0,0.28)');eg.addColorStop(1,'rgba(80,20,0,0)');
          ctx.beginPath();ctx.arc(cx,cy,plateR,0,Math.PI*2);ctx.fillStyle=eg;ctx.fill();
        }
      }
      ctx.restore();

      // Liquid floating ingredients (drawn outside clip for iOS emoji compat)
      if (this.isLiquid && fraction > 0.002) {
        const t = Date.now() * 0.001;
        this.liquidParticles.forEach(p => {
          const floatY = p.baseY + Math.sin(t * p.speed + p.phase) * p.amp;
          // Clip emoji to plate circle manually
          const dx = p.x - cx, dy = floatY - cy;
          if (Math.sqrt(dx*dx + dy*dy) > plateR * 0.88) return;

          if (p.type === '⬤') {
            ctx.beginPath();
            ctx.arc(p.x, floatY, p.size, 0, Math.PI*2);
            ctx.fillStyle = p.color;
            ctx.fill();
          } else {
            ctx.save();
            ctx.font         = `${p.size*2.2}px serif`;
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha  = 0.85;
            ctx.fillText(p.type, p.x, floatY);
            ctx.restore();
            ctx.globalAlpha = 1;
          }
        });
      }
    }

    // ── SHINE ──
    const shine=ctx.createRadialGradient(cx-size*0.12,cy-size*0.12,0,cx,cy,plateR*0.6);
    shine.addColorStop(0,'rgba(255,255,255,0.25)');shine.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath();ctx.arc(cx,cy,plateR,0,Math.PI*2);ctx.fillStyle=shine;ctx.fill();

    // ── DEPTH ──
    const depth=ctx.createRadialGradient(cx,cy,plateR*0.72,cx,cy,plateR);
    depth.addColorStop(0,'rgba(0,0,0,0)');depth.addColorStop(1,'rgba(0,0,0,0.09)');
    ctx.beginPath();ctx.arc(cx,cy,plateR,0,Math.PI*2);ctx.fillStyle=depth;ctx.fill();

    this.animFrame = requestAnimationFrame(() => this.draw());
  },

  stop()  { if (this.animFrame) cancelAnimationFrame(this.animFrame); },
};
