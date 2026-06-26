// ==================== TUTORIAL SYSTEM ====================
const tutorialSteps = [
  {
    target: '#home-pet-emoji',
    title: 'Твой питомец',
    text: 'Привет! Я твой питомец. Следи за моими статами: если я голоден или устал — покорми или уложи спать.',
    position: 'bottom',
  },
  {
    target: '#habit-list',
    title: 'Привычки',
    text: 'Это твои привычки. Нажимай на них когда выполнишь. Каждая привычка даёт XP и радует меня!',
    position: 'top',
  },
  {
    target: '#quick-feed',
    title: 'Забота',
    text: 'Корми меня, играй со мной и гладь. Я буду счастливым и дам тебе бонусы!',
    position: 'top',
  },
  {
    target: '#daily-reward-btn',
    title: 'Ежедневная награда',
    text: 'Заходи каждый день и забирай подарки. Чем дольше стрик — тем круче награды!',
    position: 'top',
  },
];

let currentTutorialStep = 0;
let tutorialActive = false;

function startTutorial() {
  if (state.player.tutorialCompleted) return;
  tutorialActive = true;
  currentTutorialStep = 0;
  showTutorialStep();
}

function showTutorialStep() {
  if (currentTutorialStep >= tutorialSteps.length) {
    endTutorial();
    return;
  }
  
  const step = tutorialSteps[currentTutorialStep];
  const target = document.querySelector(step.target);
  if (!target) {
    currentTutorialStep++;
    showTutorialStep();
    return;
  }
  
  const rect = target.getBoundingClientRect();
  
  // Подсветка цели
  const highlight = document.createElement('div');
  highlight.id = 'tutorial-highlight';
  highlight.style.cssText = `
    position: fixed;
    left: ${rect.left - 4}px;
    top: ${rect.top - 4}px;
    width: ${rect.width + 8}px;
    height: ${rect.height + 8}px;
    border: 3px solid var(--accent);
    border-radius: 12px;
    z-index: 250;
    pointer-events: none;
    animation: pulse 2s ease-in-out infinite;
  `;
  document.body.appendChild(highlight);
  
  // Подсказка
  const tooltip = document.createElement('div');
  tooltip.id = 'tutorial-tooltip';
  const top = step.position === 'top' ? rect.top - 120 : rect.bottom + 10;
  tooltip.style.cssText = `
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    top: ${top}px;
    background: var(--text);
    color: white;
    padding: 16px 20px;
    border-radius: var(--radius-lg);
    z-index: 251;
    max-width: 300px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  `;
  tooltip.innerHTML = `
    <div style="font-size:24px;margin-bottom:4px;">🐾</div>
    <h3 style="color:white;margin-bottom:4px;">${step.title}</h3>
    <p style="font-size:13px;color:rgba(255,255,255,0.8);">${step.text}</p>
    <button id="tutorial-next-btn" style="background:white;color:var(--text);margin-top:10px;width:100%;border-radius:999px;">
      ${currentTutorialStep < tutorialSteps.length - 1 ? 'Дальше →' : 'Понятно! 🎉'}
    </button>
  `;
  document.body.appendChild(tooltip);
  
  document.getElementById('tutorial-next-btn').onclick = () => {
    document.getElementById('tutorial-highlight')?.remove();
    document.getElementById('tutorial-tooltip')?.remove();
    currentTutorialStep++;
    setTimeout(() => showTutorialStep(), 300);
  };
}

function endTutorial() {
  tutorialActive = false;
  state.player.tutorialCompleted = true;
  saveGame();
  showToast('🎉 Ты готов! Начни с первой привычки.');
}

  50% { box-shadow: 0 0 0 12px rgba(0,122,255,0); }
}

console.log('✅ Tutorial module loaded');
