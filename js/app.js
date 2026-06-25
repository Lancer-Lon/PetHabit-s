// ==================== APP CORE ====================
let stateDirty = false;

function markDirty() {
  stateDirty = true;
}

function renderAll() {
  refreshTopbar();
  updateAllPetUI();
  renderHabits();
  renderShop();
  renderInventory();
  renderBoss();
  renderExpeditionBanner();
  renderExpeditionOptions();
  renderFurniture();
  renderAchievements();
  updateStatsUI();
  updateCollectionUI();
}

function saveGame() {
  const data = {
    state: JSON.parse(JSON.stringify(state)),
    habits: state.habits.list.map(h => ({ id: h.id, name: h.name, icon: h.icon, category: h.category })),
    habitsDone: state.habits.doneMap,
    nextHabitId: state.habits.nextId,
    shopItems: state.shop.accessories.map(i => ({ id: i.id, owned: i.owned, equipped: i.equipped })),
    shopBgs: state.shop.backgrounds.map(b => ({ id: b.id, owned: b.owned, equipped: b.equipped })),
    furniture: state.world.furniture.map(f => ({ id: f.id, owned: f.owned, placed: f.placed })),
  };
  localStorage.setItem('pethabit_modular', JSON.stringify(data));
  markDirty();
}

function loadGame() {
  try {
    const raw = localStorage.getItem('pethabit_modular');
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.state) {
      state.player = data.state.player || state.player;
      state.pet = data.state.pet || state.pet;
      state.world = data.state.world || state.world;
      state.shop = data.state.shop || state.shop;
      state.achievements = data.state.achievements || state.achievements;
    }

    if (data.shopItems) {
      data.shopItems.forEach(s => {
        const item = state.shop.accessories.find(i => i.id === s.id);
        if (item) { item.owned = s.owned; item.equipped = s.equipped; }
      });
    }
    if (data.shopBgs) {
      data.shopBgs.forEach(s => {
        const bg = state.shop.backgrounds.find(b => b.id === s.id);
        if (bg) { bg.owned = s.owned; bg.equipped = s.equipped; }
      });
    }
    if (data.furniture) {
      data.furniture.forEach(s => {
        const f = state.world.furniture.find(x => x.id === s.id);
        if (f) { f.owned = s.owned; f.placed = s.placed; }
      });
    }
    if (data.habits && data.habits.length > 0) {
      state.habits.list = data.habits.map(h => ({
        ...h,
        done: data.habitsDone?.[h.id] || false,
      }));
      state.habits.nextId = data.nextHabitId || state.habits.list.length + 1;
    }
    if (data.habitsDone) {
      state.habits.doneMap = data.habitsDone;
      state.habits.list.forEach(h => {
        h.done = state.habits.doneMap[h.id] || false;
      });
    }
    checkNewDay();
  } catch (e) {
    console.error('Load failed:', e);
  }
}

function checkNewDay() {
  const today = new Date().toISOString().split('T')[0];
  if (state.player.todayDate !== today) {
    state.player.weekHistory.push(state.habits.list.filter(h => h.done).length);
    state.player.weekHistory.shift();

    const wasAllDone = state.habits.list.every(h => h.done);
    if (!wasAllDone) state.player.streak = 0;

    state.player.todayDate = today;
    state.habits.doneMap = {};
    state.habits.list.forEach(h => { h.done = false; });

    state.pet.health = Math.max(0, state.pet.health - 5);
    state.pet.energy = Math.max(0, state.pet.energy - 10);
    state.pet.hunger = Math.max(0, state.pet.hunger - 15);
    state.pet.mood = Math.max(0, state.pet.mood - 5);
  }
}

// ==================== ONBOARDING ====================
function renderOnboarding() {
  const selector = document.getElementById('color-selector');
  selector.innerHTML = '';

  Object.entries(petColors).forEach(([key, data]) => {
    const option = document.createElement('div');
    option.className = 'pet-color-option' + (state.pet.color === key ? ' selected' : '');
    option.style.position = 'relative';
    option.innerHTML = `${data.emoji}<span class="rarity-label">${data.rarity}</span>`;
    option.onclick = () => {
      state.pet.color = key;
      document.getElementById('preview-pet').textContent = data.emoji;
      document.querySelectorAll('.pet-color-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
    };
    selector.appendChild(option);
  });

  document.getElementById('preview-pet').textContent = petColors[state.pet.color].emoji;
  document.getElementById('pet-name-input').value = state.pet.name;
}

function startApp() {
  state.pet.name = document.getElementById('pet-name-input').value.trim() || 'Пиксель';
  document.getElementById('onboarding-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'flex';
  document.getElementById('home-pet-name').textContent = state.pet.name;
  renderAll();
  saveGame();
}

// ==================== EVENT BINDINGS ====================
function bindEvents() {
  document.getElementById('google-login-btn').onclick = signInWithGoogle;
  document.getElementById('apple-login-btn').onclick = signInWithApple;

  document.getElementById('skip-auth-btn').onclick = () => {
    state.player.isAnonymous = true;
    updateCloudStatus();
    startApp();
  };

  document.getElementById('user-avatar-btn').onclick = () => {
    showToast(state.player.isAnonymous ? '📱 Офлайн-режим' : '☁️ Облачное сохранение');
  };

  document.getElementById('quick-pet').onclick = () => petAction('pet');
  document.getElementById('quick-feed').onclick = () => petAction('feed');
  document.getElementById('quick-play').onclick = () => petAction('play');
  document.getElementById('quick-sleep').onclick = () => petAction('sleep');

  document.getElementById('daily-reward-btn').onclick = () => {
    const modal = document.getElementById('daily-modal');
    modal.style.display = 'flex';
    const can = state.player.lastDailyClaim !== new Date().toISOString().split('T')[0];
    document.getElementById('claim-daily-btn').disabled = !can;
    document.getElementById('claim-daily-btn').textContent = can ? 'Забрать' : '✓ Получено';

    const grid = document.getElementById('daily-grid');
    grid.innerHTML = '';
    const rewards = [
      { icon: '⚡', text: '20 XP' }, { icon: '⚡', text: '30 XP' },
      { icon: '⚡', text: '50 XP' }, { icon: '💎', text: '15' },
      { icon: '🌌', text: 'Фон' }, { icon: '⚡', text: '100 XP' },
      { icon: '👑', text: 'Корона' },
    ];
    rewards.forEach((r, i) => {
      const cell = document.createElement('div');
      const isActive = i === state.player.dailyStreak && can;
      const isPast = i < state.player.dailyStreak || (i === state.player.dailyStreak && !can);
      cell.style.cssText = `padding:6px 2px;border-radius:8px;text-align:center;font-size:10px;${
        isActive ? 'background:var(--accent-light);border:2px solid var(--accent);' :
        isPast ? 'background:var(--accent);color:white;' : 'background:rgba(60,60,67,0.06);'}`;
      cell.innerHTML = `<div style="font-size:16px;">${r.icon}</div>${r.text}`;
      grid.appendChild(cell);
    });
  };

  document.getElementById('close-daily-btn').onclick = () => {
    document.getElementById('daily-modal').style.display = 'none';
  };

  document.getElementById('claim-daily-btn').onclick = () => {
    if (state.player.lastDailyClaim === new Date().toISOString().split('T')[0]) return;
    state.player.lastDailyClaim = new Date().toISOString().split('T')[0];
    const rewards = [
      { type: 'xp', amount: 20 }, { type: 'xp', amount: 30 },
      { type: 'xp', amount: 50 }, { type: 'gems', amount: 15 },
      { type: 'bg', id: 'space' }, { type: 'xp', amount: 100 },
      { type: 'item', id: 'crown' },
    ];
    applyReward(rewards[state.player.dailyStreak % 7]);
    state.player.dailyStreak = (state.player.dailyStreak + 1) % 7;
    sfxReward();
    document.getElementById('daily-modal').style.display = 'none';
    renderAll();
    saveGame();
  };

  document.getElementById('add-habit-btn').onclick = openAddHabit;
  document.getElementById('cancel-habit-btn').onclick = () => {
    document.getElementById('habit-modal').style.display = 'none';
    state.habits.editingId = null;
  };
  document.getElementById('save-habit-btn').onclick = saveHabit;
  document.getElementById('habit-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
      state.habits.editingId = null;
    }
  });

  document.getElementById('close-ach-btn').onclick = () => {
    document.getElementById('ach-modal').style.display = 'none';
  };

  // Навигация
  document.querySelectorAll('.navbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.navbtn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('screen-' + btn.dataset.screen).classList.add('active');
      renderAll();
      saveGame();
    });
  });

  // Табы магазина
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('shop-tab').style.display = btn.dataset.tab === 'shop-tab' ? 'block' : 'none';
      document.getElementById('inventory-tab').style.display = btn.dataset.tab === 'inventory-tab' ? 'block' : 'none';
      if (btn.dataset.tab === 'inventory-tab') renderInventory();
    });
  });

  // Co-op button
  document.getElementById('coop-btn').addEventListener('click', () => {
    if (state.coop) { showCoopModal(); } else { startCoopExpedition(); }
  });

  // Hardcore button
  document.getElementById('hardcore-btn').addEventListener('click', startHardcoreMode);
}

// ==================== INIT ====================
function init() {
  const saved = localStorage.getItem('pethabit_modular');

  if (saved) {
    loadGame();
    if (state.player.totalHabitsDone > 0 || state.player.streak > 0) {
      document.getElementById('onboarding-screen').style.display = 'none';
      document.getElementById('main-app').style.display = 'flex';
      updateCloudStatus();
      if (!state.pet.color) state.pet.color = generatePetColor();
      if (!state.achievements.unlocked) state.achievements.unlocked = [];
      if (!state.world.bossKills) state.world.bossKills = 0;
      checkNewDay();
      generateBoss();
      bindEvents();
      renderAll();
      saveGame();
      return;
    }
  }

  state.pet.color = generatePetColor();
  renderOnboarding();
  updateCloudStatus();
  bindEvents();
}

// ЕДИНЫЙ слушатель авторизации
if (firebaseReady && auth) {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Пользователь залогинился — загружаем облачные данные
      await onUserLoggedIn(user);
    }
  });
}

// Запуск
init();

// ==================== ЦИКЛЫ ====================
// Сохраняем в облако ТОЛЬКО если state изменился (dirty-флаг)
setInterval(() => {
  if (stateDirty) {
    stateDirty = false;
    saveToCloud();
  }
  
  if (state.world.activeExpedition && Date.now() >= state.world.activeExpedition.endTime) {
    renderExpeditionBanner();
    renderExpeditionOptions();
  }
  
  if (Math.random() < 0.04) petDecay();
  
  checkPrestige();
  checkHardcoreFail();
  
  if (isHardcoreActive()) {
    document.getElementById('hardcore-badge').style.display = 'inline-flex';
    document.getElementById('hardcore-crown').style.display = 'block';
    document.getElementById('hardcore-crown').textContent = state.pet.hardcoreEmoji || '💎';
  } else {
    document.getElementById('hardcore-badge').style.display = 'none';
    document.getElementById('hardcore-crown').style.display = 'none';
  }
}, 5000);

// Сохранение при закрытии вкладки
window.addEventListener('visibilitychange', () => {
  if (document.hidden && stateDirty) {
    saveToCloud();
    stateDirty = false;
  }
});

window.addEventListener('beforeunload', () => {
  if (stateDirty) {
    saveToCloud();
  }
});

// ==================== WEEKLY + CONFETTI ====================
initWeeklyGoals();
renderWeeklyUI();

setTimeout(() => {
  if (!state.player.tutorialCompleted) startTutorial();
  checkGhostVisits();
}, 5000);

console.log('✅ App initialized');
