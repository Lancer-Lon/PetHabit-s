// ==================== SOUNDS ====================
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, type, duration, vol = 0.06) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Игнорируем ошибки звука
  }
}

function sfxCheck() {
  playTone(880, 'sine', 0.1, 0.05);
  setTimeout(() => playTone(1320, 'sine', 0.12, 0.04), 60);
}

function sfxReward() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 'triangle', 0.15, 0.06), i * 80);
  });
}

function sfxLevelUp() {
  [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => {
    setTimeout(() => playTone(f, 'sine', 0.18, 0.07), i * 70);
  });
}

function sfxPurchase() {
  playTone(1200, 'sine', 0.08, 0.04);
  setTimeout(() => playTone(1600, 'sine', 0.1, 0.05), 50);
}

function sfxAchievement() {
  [392, 523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 'triangle', 0.25, 0.08), i * 100);
  });
}

console.log('✅ Sounds module loaded');
