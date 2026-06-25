// ==================== CONFETTI SYSTEM ====================
let confettiCanvas = null;

function initConfetti() {
  confettiCanvas = document.createElement('canvas');
  confettiCanvas.id = 'confetti-canvas';
  confettiCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
  document.body.appendChild(confettiCanvas);
}

function spawnConfetti(options = {}) {
  if (!confettiCanvas) initConfetti();
  
  const canvas = confettiCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const count = options.count || 50;
  const colors = options.colors || ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }
  
  let frame = 0;
  const maxFrames = 120; // 2 секунды при 60fps
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // Гравитация
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - frame / maxFrames);
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    
    if (frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  animate();
}

// Авто-конфетти при важных событиях
function checkMilestoneConfetti() {
  const streak = state.player.streak;
  const level = getLevel(state);
  
  // Конфетти при круглых числах стрика
  if (streak > 0 && streak % 7 === 0 && !state._confettiStreak?.[streak]) {
    if (!state._confettiStreak) state._confettiStreak = {};
    state._confettiStreak[streak] = true;
    spawnConfetti({ count: 80, colors: ['#FFD700', '#FFA500', '#FF6347'] });
    showToast(`🔥 Стрик ${streak} дней! Легенда!`);
  }
  
  // Конфетти при круглых уровнях
  if (level > 0 && level % 5 === 0 && !state._confettiLevel?.[level]) {
    if (!state._confettiLevel) state._confettiLevel = {};
    state._confettiLevel[level] = true;
    spawnConfetti({ count: 100, colors: ['#007AFF', '#AF52DE', '#34C759', '#FF9500'] });
    showToast(`⭐ Уровень ${level}! Конфетти!`);
  }
}

console.log('✅ Confetti module loaded');
