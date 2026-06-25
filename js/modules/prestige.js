// ==================== PRESTIGE SYSTEM ====================
const MAX_LEVEL = 30;

function checkPrestige() {
  const level = getLevel(state);
  if (level >= MAX_LEVEL && !state.player.prestigeReady) {
    state.player.prestigeReady = true;
    showPrestigeModal();
  }
}

function showPrestigeModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.style.zIndex = '200';
  modal.innerHTML = `
    <div class="modal-sheet" style="text-align:center;">
      <div style="font-size:72px;">🐉</div>
      <h2>Питомец готов к легенде!</h2>
      <p style="margin:12px 0;">${state.pet.name} достиг максимального уровня и хочет отправиться на покой.</p>
      <div class="stat-card" style="margin:12px 0;text-align:left;">
        <p>🎁 <b>Награды престижа:</b></p>
        <p>🏅 Золотая медаль (бонус XP навсегда)</p>
        <p>🦅 Редкий питомец в следующем цикле</p>
        <p>💎 +100 кристаллов</p>
        <p>⭐ Уровень престижа: ${state.player.prestigeLevel + 1}</p>
      </div>
      <button class="gold" id="prestige-btn" style="width:100%;">Отправить на покой 🕊️</button>
      <button class="secondary" id="cancel-prestige-btn" style="width:100%;margin-top:8px;">Пока остаться</button>
    </div>`;
  
  document.body.appendChild(modal);
  
  document.getElementById('prestige-btn').onclick = () => {
    performPrestige();
    modal.remove();
  };
  
  document.getElementById('cancel-prestige-btn').onclick = () => {
    state.player.prestigeReady = false;
    modal.remove();
  };
}

function performPrestige() {
  // Сохраняем что можно
  const oldName = state.pet.name;
  const oldColor = state.pet.color;
  
  // Награды
  state.player.gems += 100;
  state.player.prestigeLevel++;
  state.player.xpBonus = (state.player.xpBonus || 0) + 15; // +15% XP навсегда
  
  // Сбрасываем питомца
  state.pet.name = oldName + ' II';
  state.pet.color = generatePetColor();
  state.pet.health = 100;
  state.pet.energy = 100;
  state.pet.hunger = 100;
  state.pet.mood = 100;
  state.pet.deepSleep = false;
  
  // Сбрасываем прогресс но сохраняем инвентарь
  state.player.xp = 0;
  state.player.streak = 0;
  state.player.bestStreak = 0;
  state.player.totalHabitsDone = 0;
  state.player.totalDays = 0;
  state.player.prestigeReady = false;
  
  // Сбрасываем привычки к дефолтным
  state.habits.list = [
    { id: state.habits.nextId++, name: 'Выпить стакан воды', icon: '💧', category: 'rest', done: false },
    { id: state.habits.nextId++, name: '10 минут чтения', icon: '📖', category: 'mind', done: false },
    { id: state.habits.nextId++, name: 'Прогулка 15 минут', icon: '🏃', category: 'strength', done: false },
    { id: state.habits.nextId++, name: 'Без телефона перед сном', icon: '🌙', category: 'rest', done: false },
  ];
  state.habits.doneMap = {};
  
  // Боссы сбрасываются
  state.world.currentBoss = null;
  state.world.bossKills = 0;
  state.world.activeExpedition = null;
  
  // Достижения остаются
  // Инвентарь остаётся
  
  updateAllPetUI();
  renderAll();
  saveGame();
  
  showToast('🕊️ Питомец ушёл на покой. Новый цикл начался!');
  sfxLevelUp();
}

console.log('✅ Prestige module loaded');
