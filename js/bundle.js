// ==================== STATE MANAGEMENT ====================
const state = {
  player: {
    xp: 0,
    gems: 30,
    streak: 0,
    bestStreak: 0,
    totalHabitsDone: 0,
    totalDays: 0,
    lastDailyClaim: null,
    dailyStreak: 0,
    todayDate: new Date().toISOString().split('T')[0],
    heatmapData: Array(28).fill(false),
    weekHistory: Array(7).fill(0),
    userId: null,
    isAnonymous: true,
    doubleNextReward: false,
    prestigeLevel: 0,
  },
  pet: {
    name: 'Пиксель',
    color: 'yellow',
    health: 100,
    energy: 100,
    hunger: 100,
    mood: 80,
    deepSleep: false,
    sleepHabitsNeeded: 0,
  },
  habits: {
    list: [
      { id: 1, name: 'Выпить стакан воды', icon: '💧', category: 'rest', done: false },
      { id: 2, name: '10 минут чтения', icon: '📖', category: 'mind', done: false },
      { id: 3, name: 'Прогулка 15 минут', icon: '🏃', category: 'strength', done: false },
      { id: 4, name: 'Без телефона перед сном', icon: '🌙', category: 'rest', done: false },
    ],
    nextId: 5,
    doneMap: {},
    editingId: null,
    swipedId: null,
  },
  world: {
    currentBoss: null,
    bossKills: 0,
    activeExpedition: null,
    furniture: [
      { id: 'bed', name: 'Кровать', icon: '🛏️', cost: 30, owned: false, placed: false, 
        bonus: { type: 'energy', value: 10, desc: '⚡ +10% энергии из сна' } },
      { id: 'plant', name: 'Растение', icon: '🪴', cost: 15, owned: false, placed: false, 
        bonus: { type: 'loot', value: 3, desc: '🎁 +3% шанс находок' } },
      { id: 'painting', name: 'Картина', icon: '🖼️', cost: 20, owned: false, placed: false, 
        bonus: { type: 'loot', value: 2, desc: '🎁 +2% шанс находок' } },
      { id: 'rug', name: 'Коврик', icon: '🧶', cost: 25, owned: false, placed: false,
        bonus: { type: 'energy', value: 5, desc: '⚡ +5% энергии из сна' } },
      { id: 'bookshelf', name: 'Книжная полка', icon: '📚', cost: 35, owned: false, placed: false,
        bonus: { type: 'xp', value: 10, desc: '⭐ +10% XP за привычки' } },
      { id: 'lamp', name: 'Лампа', icon: '💡', cost: 20, owned: false, placed: false,
        bonus: { type: 'mood', value: 15, desc: '😊 +15% настроения из действий' } },
    ],
  },
  shop: {
    accessories: [
      { id: 'hat', name: 'Шапка', cost: 30, icon: '🎩', owned: false, equipped: false },
      { id: 'glasses', name: 'Очки', cost: 50, icon: '🕶️', owned: false, equipped: false },
      { id: 'bow', name: 'Бантик', cost: 20, icon: '🎀', owned: false, equipped: false },
      { id: 'crown', name: 'Корона', cost: 100, icon: '👑', owned: false, equipped: false },
    ],
    backgrounds: [
      { id: 'forest', name: 'Лес', cost: 40, icon: '🌳', owned: false, equipped: false },
      { id: 'space', name: 'Космос', cost: 80, icon: '🌌', owned: false, equipped: false },
      { id: 'beach', name: 'Пляж', cost: 60, icon: '🏖️', owned: false, equipped: false },
    ],
  },
  achievements: {
    unlocked: [],
    list: [
      { id: 'first_habit', icon: '✅', name: 'Первый шаг', desc: 'Выполнить первую привычку', check: s => s.player.totalHabitsDone >= 1 },
      { id: 'streak_3', icon: '🔥', name: 'Три дня', desc: 'Стрик 3 дня', check: s => s.player.bestStreak >= 3 },
      { id: 'streak_7', icon: '🔥', name: 'Неделя силы', desc: 'Стрик 7 дней', check: s => s.player.bestStreak >= 7 },
      { id: 'streak_10', icon: '💪', name: 'Железная воля', desc: 'Стрик 10 дней', check: s => s.player.bestStreak >= 10 },
      { id: 'habits_10', icon: '📋', name: 'Десятка', desc: '10 привычек', check: s => s.player.totalHabitsDone >= 10 },
      { id: 'habits_50', icon: '🏅', name: 'Полтинник', desc: '50 привычек', check: s => s.player.totalHabitsDone >= 50 },
      { id: 'habits_100', icon: '🏆', name: 'Сотня', desc: '100 привычек', check: s => s.player.totalHabitsDone >= 100 },
      { id: 'boss_kill', icon: '⚔️', name: 'Убийца боссов', desc: 'Победить босса', check: s => s.world.bossKills >= 1 },
      { id: 'boss_kill_3', icon: '🗡️', name: 'Охотник', desc: '3 босса', check: s => s.world.bossKills >= 3 },
      { id: 'furniture_1', icon: '🪑', name: 'Новоселье', desc: 'Купить мебель', check: s => s.world.furniture.some(f => f.owned) },
      { id: 'furniture_3', icon: '🏠', name: 'Дизайнер', desc: '3 мебели', check: s => s.world.furniture.filter(f => f.owned).length >= 3 },
      { id: 'level_5', icon: '⭐', name: 'Расту', desc: '5 уровень', check: s => getLevel(s) >= 5 },
    ],
  },
};

function getLevel(s) {
  let lvl = 1;
  while (s.player.xp >= xpForLevel(lvl + 1)) lvl++;
  return lvl;
}
function xpForLevel(lvl) {
  return lvl <= 1 ? 0 : Math.floor(100 * Math.pow(1.15, lvl - 1));
}
function xpProgress(s) {
  const lvl = getLevel(s);
  const cur = xpForLevel(lvl);
  const nxt = xpForLevel(lvl + 1);
  const into = s.player.xp - cur;
  return { lvl, pct: Math.min(100, Math.round((into / (nxt - cur)) * 100)), into, needed: nxt - cur, next: lvl + 1 };
}

const petColors = {
  yellow: { emoji: '🐥', name: 'Жёлтый', rarity: 'Обычный', weight: 70 },
  white: { emoji: '🐤', name: 'Белый', rarity: 'Необычный', weight: 20 },
  black: { emoji: '🐧', name: 'Чёрный', rarity: 'Редкий', weight: 8 },
  golden: { emoji: '🦅', name: 'Золотой', rarity: 'Легендарный', weight: 2 },
};

function generatePetColor() {
  const rand = Math.random() * 100;
  let cum = 0;
  for (const [key, data] of Object.entries(petColors)) {
    cum += data.weight;
    if (rand <= cum) return key;
  }
  return 'yellow';
}

console.log('✅ State module loaded');
// ==================== EVENT SYSTEM ====================
const eventBus = {
  _listeners: {},
  
  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  },
  
  emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(cb => cb(data));
  }
};

// Подписываемся на события
eventBus.on('habitToggled', () => {
  if (state.coop) dealCoopDamage();
  updateWeeklyProgress();
  renderWeeklyUI();
  checkMilestoneConfetti();
});

eventBus.on('habitToggled', () => {
  // Можно добавить любые другие обработчики без monkey-patching
});

console.log('✅ Events module loaded');
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
// ==================== UI HELPERS ====================
function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2100);
}

function refreshTopbar() {
  document.getElementById('nav-streak').textContent = state.player.streak;
  document.getElementById('nav-level').textContent = getLevel(state);
  document.getElementById('nav-gems').textContent = state.player.gems;
}

function updateCloudStatus() {
  const badge = document.getElementById('cloud-status');
  if (!badge) return;
  if (state.player.isAnonymous) {
    badge.textContent = '📱 Офлайн';
    badge.style.color = 'var(--muted)';
  } else {
    badge.textContent = '☁️ Синхр.';
    badge.style.color = 'var(--green)';
  }
  badge.style.display = 'inline-flex';
}

function updateAllPetUI() {
  const avg = (state.pet.health + state.pet.energy + state.pet.hunger + state.pet.mood) / 4;
  const base = petColors[state.pet.color]?.emoji || '🐥';
  let emoji = base;
  let moodText = '😊 Счастлив';
  
  if (avg < 25) { emoji = '💀'; moodText = '💀 Очень плохо...'; }
  else if (state.pet.hunger < 20) { emoji = '😿'; moodText = '🍖 Голоден!'; }
  else if (avg >= 75) moodText = '😊 Счастлив';
  else if (avg >= 50) moodText = '🙂 Нормально';
  else moodText = '😐 Грустит';

  document.getElementById('home-pet-emoji').textContent = emoji;
  document.getElementById('home-pet-name').textContent = state.pet.name;
  document.getElementById('home-pet-status').textContent = moodText;
  document.getElementById('mini-health').textContent = state.pet.health;
  document.getElementById('mini-energy').textContent = state.pet.energy;
  document.getElementById('mini-hunger').textContent = state.pet.hunger;

  const xp = xpProgress(state);
  document.getElementById('home-xp-bar').style.width = xp.pct + '%';
  document.getElementById('home-xp-text').textContent = `${xp.into}/${xp.needed} XP до ур.${xp.next}`;

  // Аксессуар НА питомце (не сбоку!)
  const eq = state.shop.accessories.find(x => x.equipped);
  const accessoryEl = document.getElementById('pet-accessory-layer');
  if (accessoryEl) {
    accessoryEl.textContent = eq?.icon || '';
    // Позиционируем ПОВЕРХ питомца
    accessoryEl.style.position = 'absolute';
    accessoryEl.style.top = '50%';
    accessoryEl.style.left = '50%';
    accessoryEl.style.transform = 'translate(-50%, -50%)';
    accessoryEl.style.fontSize = '28px';
    accessoryEl.style.zIndex = '5';
    accessoryEl.style.pointerEvents = 'none';
  }
}

function animatePet(type) {
  const el = document.getElementById('home-pet-emoji');
  if (!el) return;
  el.classList.remove('bounce', 'happy');
  void el.offsetWidth;
  el.classList.add(type);
}

function updateStatsUI() {
  const today = state.habits.list.filter(h => h.done).length;
  const week = state.player.weekHistory.reduce((a, b) => a + b, 0) + today;
  document.getElementById('stats-today').textContent = today;
  document.getElementById('stats-week').textContent = week;
  document.getElementById('stats-streak').textContent = state.player.streak;
  document.getElementById('stats-best').textContent = state.player.bestStreak;
}

function updateCollectionUI() {
  const total = state.shop.accessories.length + state.shop.backgrounds.length + state.world.furniture.length;
  const collected = [
    ...state.shop.accessories,
    ...state.shop.backgrounds,
    ...state.world.furniture
  ].filter(i => i.owned).length;
  document.getElementById('collection-count').textContent = collected;
  document.getElementById('collection-bar').style.width = Math.round(collected / total * 100) + '%';
}

console.log('✅ UI module loaded');
// ==================== PET MODULE ====================
function petAction(action) {
  // Если питомец в глубоком сне — действия не работают
  if (state.pet.deepSleep) {
    showToast('😴 Питомец в глубоком сне. Выполни 3 привычки чтобы разбудить.');
    return;
  }

  switch (action) {
    case 'pet':
      state.pet.mood = Math.min(100, state.pet.mood + 15);
      state.pet.health = Math.min(100, state.pet.health + 5);
      showToast('❤️ Питомец рад!');
      break;
    case 'feed':
      if (state.player.gems >= 3) {
        state.player.gems -= 3;
        state.pet.hunger = Math.min(100, state.pet.hunger + 25);
        showToast('🍖 Ням!');
      } else {
        showToast('Недостаточно 💎');
        return;
      }
      break;
    case 'play':
      state.pet.energy = Math.max(0, state.pet.energy - 10);
      state.pet.mood = Math.min(100, state.pet.mood + 20);
      state.pet.hunger = Math.max(0, state.pet.hunger - 5);
      showToast('⚽ Весело!');
      break;
    case 'sleep':
      state.pet.energy = Math.min(100, state.pet.energy + 40);
      state.pet.health = Math.min(100, state.pet.health + 15);
      showToast('😴 Сладких снов');
      break;
  }
  animatePet(action === 'play' ? 'bounce' : 'happy');
  updateAllPetUI();
  saveGame();
}

function petDecay() {
  if (state.pet.deepSleep) return; // В глубоком сне статы не падают

  state.pet.health = Math.max(0, state.pet.health - 0.3);
  state.pet.energy = Math.max(0, state.pet.energy - 0.5);
  state.pet.hunger = Math.max(0, state.pet.hunger - 0.8);
  if (state.pet.hunger < 15 || state.pet.energy < 15) {
    state.pet.mood = Math.max(0, state.pet.mood - 0.5);
  }

  // Проверка на глубокий сон (вместо смерти)
  const avg = (state.pet.health + state.pet.energy + state.pet.hunger + state.pet.mood) / 4;
  if (avg < 10 && !state.pet.deepSleep) {
    state.pet.deepSleep = true;
    state.pet.sleepHabitsNeeded = 5;
    showToast('😴 Питомец уснул глубоким сном... Выполни 5 привычек чтобы разбудить!');
  }

  updateAllPetUI();
}

// Попытка разбудить питомца при выполнении привычки
function tryWakeUp() {
  if (!state.pet.deepSleep) return false;
  state.pet.sleepHabitsNeeded--;
  if (state.pet.sleepHabitsNeeded <= 0) {
    state.pet.deepSleep = false;
    state.pet.health = 30;
    state.pet.energy = 30;
    state.pet.hunger = 30;
    state.pet.mood = 30;
    showToast('🎉 Питомец проснулся!');
    return true;
  }
  showToast(`😴 Ещё ${state.pet.sleepHabitsNeeded} привычек чтобы разбудить...`);
  return false;
}

console.log('✅ Pet module loaded');
// ==================== HABITS MODULE ====================
const MAX_HABITS = 10;

function renderHabits() {
  const list = document.getElementById('habit-list');
  list.innerHTML = '';

  state.habits.list.forEach(h => {
    const isCounter = h.target && h.target > 0;
    const progress = isCounter ? Math.round((h.progress || 0) / h.target * 100) : 0;
    const completed = isCounter ? (h.progress >= h.target) : h.done;
    
    const container = document.createElement('div');
    container.className = 'habit-container';
    container.innerHTML = `
      <div class="habit-swipe-bg">
        <div class="habit-swipe-action habit-swipe-delete" data-action="delete" data-id="${h.id}">🗑️</div>
      </div>`;

    const row = document.createElement('div');
    row.className = 'habit-row' + (completed ? ' done' : '') + (state.habits.swipedId === h.id ? ' swiped' : '');
    
    if (isCounter) {
      row.innerHTML = `
        <div class="habit-check ${completed ? 'checked' : ''}">${completed ? '✓' : (h.progress || 0)}</div>
        <span style="font-size:20px;">${h.icon}</span>
        <div class="habit-info" style="flex:1;">
          <div class="habit-name ${completed ? 'done-text' : ''}">${h.name}</div>
          <div class="progress-track" style="margin-top:4px;">
            <div class="progress-fill" style="width:${progress}%;height:3px;background:${completed ? 'var(--green)' : 'var(--accent)'};"></div>
          </div>
          <div style="font-size:9px;color:var(--muted);">${h.progress || 0}/${h.target} ${h.unit || 'раз'}</div>
        </div>
        <span class="habit-edit-btn" data-edit="${h.id}" style="font-size:14px;opacity:0.4;padding:4px;">✏️</span>
        <button class="habit-counter-btn" data-action="increment" data-id="${h.id}" style="background:var(--accent-light);color:var(--accent);padding:4px 8px;border-radius:999px;font-size:12px;">+1</button>`;
    } else {
      row.innerHTML = `
        <div class="habit-check ${completed ? 'checked' : ''}">${completed ? '✓' : ''}</div>
        <span style="font-size:20px;">${h.icon}</span>
        <div class="habit-info">
          <div class="habit-name ${completed ? 'done-text' : ''}">${h.name}</div>
        </div>
        <span class="habit-edit-btn" data-edit="${h.id}" style="font-size:14px;opacity:0.4;padding:4px;">✏️</span>`;
    }

    let startX = 0, startY = 0;
    row.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    row.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && dx < -40) {
        state.habits.swipedId = h.id;
        renderHabits();
      } else if (dx > 40 && state.habits.swipedId === h.id) {
        state.habits.swipedId = null;
        renderHabits();
      } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        if (isCounter) incrementHabit(h.id);
        else toggleHabit(h.id);
      }
    });

    row.addEventListener('click', (e) => {
      if (e.target.closest('.habit-edit-btn')) {
        e.stopPropagation();
        state.habits.swipedId = null;
        openEditHabit(parseInt(e.target.closest('.habit-edit-btn').dataset.edit));
        return;
      }
      if (e.target.closest('.habit-counter-btn')) {
        e.stopPropagation();
        incrementHabit(parseInt(e.target.closest('.habit-counter-btn').dataset.id));
        return;
      }
      if (state.habits.swipedId === h.id) {
        state.habits.swipedId = null;
        renderHabits();
        return;
      }
      if (isCounter) incrementHabit(h.id);
      else toggleHabit(h.id);
    });

    container.querySelector('.habit-swipe-delete').addEventListener('click', e => {
      e.stopPropagation();
      deleteHabit(parseInt(h.id));
    });

    container.appendChild(row);
    list.appendChild(container);
  });
}

function incrementHabit(id) {
  const h = state.habits.list.find(x => x.id === id);
  if (!h || !h.target) return;
  if (h.progress >= h.target) return;

  h.progress = (h.progress || 0) + 1;
  
  // Частичный XP
  const progressPct = h.progress / h.target;
  const xpGain = Math.floor(5 * progressPct);
  state.player.xp += xpGain;
  state.pet.mood = Math.min(100, state.pet.mood + 1);
  
  if (h.progress >= h.target) {
    // Полное выполнение — бонус
    state.player.xp += 5; // бонус за завершение
    state.player.totalHabitsDone++;
    state.pet.energy = Math.min(100, state.pet.energy + 5);
    animatePet('happy');
    sfxCheck();
    showToast(`${h.name}: готово! +${xpGain + 5} XP`);
    
    // Лут при завершении
    const loot = checkRandomLoot();
    if (loot) { saveGame(); }
    
    checkAllDone();
  } else {
    showToast(`${h.progress}/${h.target} · +${xpGain} XP`);
  }
  
  updateAllPetUI();
  renderHabits();
  refreshTopbar();
  saveGame();
}

function toggleHabit(id) {
  const h = state.habits.list.find(x => x.id === id);
  if (!h) return;
  if (h.done) return;

  const wasAllDone = state.habits.list.every(x => x.done);
  h.done = true;
  state.habits.doneMap[h.id] = true;

  const xpPerHabit = Math.max(5, Math.floor(40 / state.habits.list.length));
  // Бонус от навыков питомца
  const skillBonus = state.pet.skills?.xpBoost ? Math.floor(xpPerHabit * 0.1) : 0;
  state.player.xp += xpPerHabit + skillBonus;
  state.player.totalHabitsDone++;
  state.pet.energy = Math.min(100, state.pet.energy + 5);
  state.pet.mood = Math.min(100, state.pet.mood + 3);
  animatePet('happy');
  sfxCheck();
  showToast(`+${xpPerHabit + skillBonus} XP 🎉`);

  if (state.world.currentBoss && state.world.currentBoss.hp > 0) {
    const damage = Math.max(5, Math.floor(40 / state.habits.list.length));
    state.world.currentBoss.hp = Math.max(0, state.world.currentBoss.hp - damage);
    if (state.world.currentBoss.hp <= 0) {
      applyReward(state.world.currentBoss.reward);
      state.player.xp += state.world.currentBoss.xpReward;
      state.world.bossKills++;
      sfxReward();
      showToast(`⚔️ Босс побеждён! ${state.world.currentBoss.reward.text}`);
    }
  }

  if (state.habits.list.length <= 7 && Math.random() < 0.15) {
    const loot = checkRandomLoot();
    if (loot) { saveGame(); }
  }

  checkAllDone(wasAllDone);

  const prevLevel = state.player.level || 1;
  state.player.level = getLevel(state);
  if (state.player.level > prevLevel) {
    sfxLevelUp();
    showToast(`⭐ Уровень ${state.player.level}!`);
    checkSkillPoint();
  }

  spawnParticles();
  checkAndShowAchievements();
  eventBus.emit("habitToggled");  updateAllPetUI();
  renderHabits();
  refreshTopbar();
  saveGame();
}

function checkAllDone(wasAllDone = false) {
  const allDone = state.habits.list.every(h => {
    if (h.target) return h.progress >= h.target;
    return h.done;
  });
  
  if (allDone && !wasAllDone) {
    state.player.streak++;
    state.player.totalDays++;
    if (state.player.streak > state.player.bestStreak) state.player.bestStreak = state.player.streak;
    state.player.gems += 2;
    showToast('🔥 День закрыт! +2 💎');
  }
}

function spawnParticles() {
  const pet = document.getElementById('home-pet-emoji');
  if (!pet) return;
  const rect = pet.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.textContent = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
    particle.style.cssText = `
      position: fixed; left: ${cx}px; top: ${cy}px;
      font-size: ${12 + Math.random() * 14}px; pointer-events: none;
      z-index: 999; transition: all 0.8s cubic-bezier(0.25,0.8,0.25,1.2);
      opacity: 1;
    `;
    document.body.appendChild(particle);
    requestAnimationFrame(() => {
      particle.style.transform = `translate(${(Math.random()-0.5)*120}px, ${-60-Math.random()*80}px) scale(0)`;
      particle.style.opacity = '0';
    });
    setTimeout(() => particle.remove(), 900);
  }
}

let lastDeletedHabit = null;

function deleteHabit(id) {
  if (state.habits.list.length <= 1) {
    showToast('Минимум 1 привычка');
    state.habits.swipedId = null;
    renderHabits();
    return;
  }
  const habit = state.habits.list.find(h => h.id === id);
  lastDeletedHabit = habit;
  state.habits.list = state.habits.list.filter(h => h.id !== id);
  delete state.habits.doneMap[id];
  state.habits.swipedId = null;
  updateAllPetUI();
  renderHabits();
  saveGame();
  showToast('Привычка удалена');

  const undoBtn = document.createElement('button');
  undoBtn.textContent = '↩ Отменить';
  undoBtn.style.cssText = 'position:fixed;bottom:130px;left:50%;transform:translateX(-50%);z-index:300;background:var(--text);color:white;border-radius:999px;padding:10px 20px;font-size:13px;';
  undoBtn.onclick = () => {
    if (lastDeletedHabit) {
      state.habits.list.push(lastDeletedHabit);
      state.habits.doneMap[lastDeletedHabit.id] = lastDeletedHabit.done;
      lastDeletedHabit = null;
      updateAllPetUI();
      renderHabits();
      saveGame();
      showToast('Восстановлено');
    }
    undoBtn.remove();
  };
  document.body.appendChild(undoBtn);
  setTimeout(() => undoBtn.remove(), 4000);
}

function openEditHabit(id) {
  const h = state.habits.list.find(x => x.id === id);
  if (!h) return;
  state.habits.editingId = id;
  document.getElementById('habit-modal-title').textContent = 'Редактировать';
  document.getElementById('habit-name-input').value = h.name;
  document.getElementById('habit-emoji-input').value = h.icon;
  document.getElementById('habit-category-input').value = h.category;
  document.getElementById('habit-target-input').value = h.target || '';
  document.getElementById('habit-unit-input').value = h.unit || '';
  document.getElementById('habit-modal').style.display = 'flex';
}

function openAddHabit() {
  if (state.habits.list.length >= MAX_HABITS) {
    showToast(`Максимум ${MAX_HABITS} привычек`);
    return;
  }
  state.habits.editingId = null;
  document.getElementById('habit-modal-title').textContent = 'Новая привычка';
  document.getElementById('habit-name-input').value = '';
  document.getElementById('habit-emoji-input').value = '';
  document.getElementById('habit-category-input').value = 'strength';
  document.getElementById('habit-target-input').value = '';
  document.getElementById('habit-unit-input').value = '';
  document.getElementById('habit-modal').style.display = 'flex';
}

function saveHabit() {
  const name = document.getElementById('habit-name-input').value.trim();
  const icon = document.getElementById('habit-emoji-input').value.trim() || '✅';
  const cat = document.getElementById('habit-category-input').value;
  const target = parseInt(document.getElementById('habit-target-input').value) || 0;
  const unit = document.getElementById('habit-unit-input').value.trim() || 'раз';

  if (!name) { showToast('Введите название'); return; }

  if (state.habits.editingId) {
    const h = state.habits.list.find(x => x.id === state.habits.editingId);
    if (h) { h.name = name; h.icon = icon; h.category = cat; h.target = target; h.unit = unit; }
    showToast('Привычка обновлена');
  } else {
    if (state.habits.list.length >= MAX_HABITS) { showToast(`Максимум ${MAX_HABITS} привычек`); return; }
    const nh = { id: state.habits.nextId++, name, icon, category: cat, done: false, target, unit, progress: 0 };
    state.habits.list.push(nh);
    state.habits.doneMap[nh.id] = false;
    showToast('Привычка добавлена');
  }
  document.getElementById('habit-modal').style.display = 'none';
  state.habits.editingId = null;
  updateAllPetUI();
  renderHabits();
  saveGame();
}

console.log('✅ Habits module loaded');
// ==================== ACHIEVEMENTS MODULE ====================
function checkAchievements() {
  const newly = [];
  state.achievements.list.forEach(ach => {
    if (!state.achievements.unlocked.includes(ach.id) && ach.check(state)) {
      state.achievements.unlocked.push(ach.id);
      newly.push(ach);
    }
  });
  return newly;
}

function checkAndShowAchievements() {
  const newAchs = checkAchievements();
  newAchs.forEach(ach => {
    document.getElementById('ach-modal-icon').textContent = ach.icon;
    document.getElementById('ach-modal-name').textContent = ach.name;
    document.getElementById('ach-modal-desc').textContent = ach.desc;
    document.getElementById('ach-modal').style.display = 'flex';
    sfxAchievement();
  });
}

function renderAchievements() {
  const el = document.getElementById('achievements-list');
  if (!el) return;
  el.innerHTML = '';
  let count = 0;

  state.achievements.list.forEach(ach => {
    const unlocked = state.achievements.unlocked.includes(ach.id);
    if (unlocked) count++;

    const row = document.createElement('div');
    row.className = 'achievement-row' + (unlocked ? ' unlocked' : '');
    row.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-info">
        <div class="achievement-name">${unlocked ? ach.name : '???'}</div>
        <div class="achievement-desc">${unlocked ? ach.desc : 'Секретное достижение'}</div>
      </div>
      <div class="achievement-badge">✓</div>`;
    el.appendChild(row);
  });

  document.getElementById('ach-count').textContent = count;
}

console.log('✅ Achievements module loaded');
// ==================== SHOP MODULE ====================
function renderShop() {
  renderShopGroup('shop-items', state.shop.accessories);
  renderShopGroup('shop-bgs', state.shop.backgrounds);
  renderShopGroup('shop-furniture', state.world.furniture);
}

function renderShopGroup(elementId, items) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'shop-item';
    card.innerHTML = `
      <div style="font-size:24px;">${item.icon}</div>
      <div style="font-size:12px;">${item.name}</div>
      ${item.owned
        ? '<div class="muted" style="font-size:10px;">В инвентаре</div>'
        : `<div style="font-size:11px;">💎 ${item.cost}</div>`
      }`;

    card.onclick = () => {
      if (!item.owned && state.player.gems >= item.cost) {
        state.player.gems -= item.cost;
        item.owned = true;
        sfxPurchase();
        showToast(`Куплено: ${item.name}`);
        checkAndShowAchievements();
        renderAll();
        saveGame();
      } else if (!item.owned) {
        showToast('Недостаточно 💎');
      }
    };

    el.appendChild(card);
  });
}

function renderInventory() {
  renderInvGroup('inv-items', state.shop.accessories, 'equipped');
  renderInvGroup('inv-bgs', state.shop.backgrounds, 'equipped');
  renderInvGroup('inv-furniture', state.world.furniture, 'placed');
}

function renderInvGroup(elementId, items, equipKey) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = '';

  const owned = items.filter(i => i.owned);
  if (!owned.length) {
    el.innerHTML = '<p class="muted">Пусто</p>';
    return;
  }

  owned.forEach(item => {
    const card = document.createElement('div');
    card.className = 'inventory-item' + (item[equipKey] ? ' equipped' : '');
    card.innerHTML = `
      <div style="font-size:22px;">${item.icon}</div>
      <div style="font-size:11px;">${item.name}</div>
      <div style="font-size:10px;color:${item[equipKey] ? 'var(--accent)' : 'var(--muted)'};">
        ${item[equipKey] ? '✓ Используется' : 'Надеть'}
      </div>`;

    card.onclick = () => {
      items.forEach(i => i[equipKey] = false);
      item[equipKey] = true;
      updateAllPetUI();
      renderAll();
      saveGame();
    };

    el.appendChild(card);
  });
}

console.log('✅ Shop module loaded');
// ==================== BOSS MODULE ====================
const bosses = [
  { name: '🐉 Дракон Лени', hp: 500, maxHp: 500, reward: { type: 'item', id: 'crown', text: '👑 Корона' }, xpReward: 200 },
  { name: '👻 Призрак Прокрастинации', hp: 300, maxHp: 300, reward: { type: 'gems', amount: 50, text: '💎 50' }, xpReward: 150 },
  { name: '🧟 Зомби Рутины', hp: 400, maxHp: 400, reward: { type: 'item', id: 'glasses', text: '🕶️ Очки' }, xpReward: 180 },
];

function generateBoss() {
  if (state.world.currentBoss && state.world.currentBoss.hp > 0) return;
  const boss = bosses[Math.floor(Math.random() * bosses.length)];
  state.world.currentBoss = { ...boss, hp: boss.maxHp, maxHp: boss.maxHp };
}

function renderBoss() {
  const panel = document.getElementById('boss-panel');
  if (!panel) return;

  generateBoss();
  const boss = state.world.currentBoss;

  if (!boss || boss.hp <= 0) {
    panel.innerHTML = '<h3>🏆 Босс побеждён!</h3><p class="muted">Новый появится завтра.</p>';
    return;
  }

  const pct = Math.round(boss.hp / boss.maxHp * 100);
  panel.innerHTML = `
    <h3>${boss.name}</h3>
    <p style="font-size:12px;">Привычка = 10 урона</p>
    <div class="boss-hp-bar">
      <div class="boss-hp-fill" style="width:${pct}%;"></div>
    </div>
    <p>❤️ ${boss.hp}/${boss.maxHp} | Награда: ${boss.reward.text} + ${boss.xpReward} XP</p>
  `;
}

console.log('✅ Boss module loaded');
// ==================== EXPEDITIONS MODULE ====================
const expeditionLocations = [
  { id: 'forest', name: '🌲 Лес', icon: '🌳', time: 2, cost: 15 },
  { id: 'mountains', name: '🏔️ Горы', icon: '⛰️', time: 4, cost: 25 },
  { id: 'beach', name: '🏖️ Пляж', icon: '🌊', time: 3, cost: 20 },
  { id: 'space', name: '🌌 Космос', icon: '🚀', time: 8, cost: 40 },
];

const expeditionRewards = [
  { type: 'gems', amount: 15, text: '💎 15', weight: 25 },
  { type: 'gems', amount: 30, text: '💎 30', weight: 15 },
  { type: 'xp', amount: 60, text: '⚡ 60 XP', weight: 20 },
  { type: 'item', id: 'hat', text: '🎩 Шляпа', weight: 10 },
  { type: 'item', id: 'glasses', text: '🕶️ Очки', weight: 10 },
  { type: 'item', id: 'bow', text: '🎀 Бантик', weight: 10 },
  { type: 'item', id: 'crown', text: '👑 Корона', weight: 5 },
  { type: 'bg', id: 'space', text: '🌌 Фон', weight: 5 },
];

function getRandomLoot() {
  const rand = Math.random() * 100;
  let cum = 0;
  for (const r of expeditionRewards) {
    cum += r.weight;
    if (rand <= cum) return r;
  }
  return expeditionRewards[0];
}

function applyReward(reward) {
  switch (reward.type) {
    case 'xp':
      state.player.xp += reward.amount;
      break;
    case 'gems':
      state.player.gems += reward.amount;
      break;
    case 'bg':
      const bg = state.shop.backgrounds.find(b => b.id === reward.id);
      if (bg) bg.owned = true;
      break;
    case 'item':
      const item = state.shop.accessories.find(i => i.id === reward.id);
      if (item) item.owned = true;
      break;
  }
}

function renderExpeditionBanner() {
  const el = document.getElementById('expedition-banner');
  if (!el) return;

  if (state.world.activeExpedition) {
    const now = Date.now();
    const end = state.world.activeExpedition.endTime;
    const remaining = Math.max(0, end - now);
    const totalMinutes = Math.ceil(remaining / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeStr = hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
    
    const loc = expeditionLocations.find(l => l.id === state.world.activeExpedition.location);
    el.innerHTML = `
      <div class="expedition-active">
        <p>🗺 В экспедиции: <b>${loc?.name}</b></p>
        <p class="muted">Вернётся через ${timeStr}</p>
        ${remaining <= 0 ? '<button id="claim-exp-btn" class="gold" style="width:100%;margin-top:6px;">🎁 Забрать добычу</button>' : ''}
      </div>`;
    
    if (remaining <= 0 && document.getElementById('claim-exp-btn')) {
      document.getElementById('claim-exp-btn').onclick = claimExpedition;
    }
  } else {
    el.innerHTML = '';
  }
}

function renderExpeditionOptions() {
  const el = document.getElementById('expedition-options');
  if (!el) return;
  el.innerHTML = '';

  expeditionLocations.forEach(loc => {
    const btn = document.createElement('button');
    btn.className = 'secondary';
    btn.innerHTML = `${loc.icon} ${loc.name}<br><span style="font-size:10px;">${loc.time}ч · 💎${loc.cost}</span>`;
    btn.onclick = () => startExpedition(loc.id);
    btn.disabled = !!state.world.activeExpedition || state.player.gems < loc.cost;
    el.appendChild(btn);
  });
}

function startExpedition(locationId) {
  const loc = expeditionLocations.find(l => l.id === locationId);
  if (!loc || state.player.gems < loc.cost || state.world.activeExpedition) return;

  state.player.gems -= loc.cost;
  
  // РЕАЛЬНОЕ ВРЕМЯ: часы * 60 * 60 * 1000
  const durationMs = loc.time * 60 * 60 * 1000;
  state.world.activeExpedition = {
    location: locationId,
    endTime: Date.now() + durationMs,
  };

  renderAll();
  saveGame();
  showToast(`Отправлен в ${loc.name} на ${loc.time}ч`);

  // Отправляем уведомление
  scheduleExpeditionNotification(loc, durationMs);
}

function claimExpedition() {
  if (!state.world.activeExpedition || Date.now() < state.world.activeExpedition.endTime) return;

  const reward = getRandomLoot();
  applyReward(reward);
  const loc = expeditionLocations.find(l => l.id === state.world.activeExpedition.location);
  state.world.activeExpedition = null;
  sfxReward();
  renderAll();
  saveGame();
  showToast(`${loc?.name}: найдено ${reward.text}`);
}

// ==================== УВЕДОМЛЕНИЯ ====================
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function scheduleExpeditionNotification(loc, durationMs) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  // Показываем уведомление сразу: питомец ушёл
  new Notification('🗺 Питомец в экспедиции', {
    body: `Пиксель отправился в ${loc.name} на ${loc.time}ч`,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🗺</text></svg>',
    tag: 'expedition-start',
  });

  // Планируем уведомление о возвращении
  const now = Date.now();
  const delay = durationMs - 5000; // За 5 секунд до возвращения
  if (delay > 0) {
    setTimeout(() => {
      new Notification('🎁 Питомец возвращается!', {
        body: `Пиксель скоро вернётся из ${loc.name}. Забери добычу!`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎁</text></svg>',
        tag: 'expedition-end',
      });
    }, delay);
  }
}

function renderFurniture() {
  const el = document.getElementById('furniture-display');
  if (!el) return;
  el.innerHTML = '';

  const placed = state.world.furniture.filter(f => f.placed);
  if (!placed.length) {
    el.innerHTML = '<p class="muted">Купите мебель в магазине</p>';
    return;
  }

  placed.forEach(f => {
    const div = document.createElement('div');
    div.className = 'stat-card';
    div.style.textAlign = 'center';
    div.innerHTML = `<div style="font-size:28px;">${f.icon}</div><div style="font-size:11px;">${f.name}</div>`;
    el.appendChild(div);
  });
}

// Запрашиваем разрешение при загрузке
requestNotificationPermission();

console.log('✅ Expeditions module loaded');

// Контекстное уведомление: питомец голоден
function checkContextualNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  if (state.pet.hunger < 20) {
    new Notification('🍖 Питомец голоден!', {
      body: `${state.pet.name} хочет есть. Покорми его!`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍖</text></svg>',
      tag: 'pet-hungry',
    });
  }
  
  if (state.pet.energy < 20) {
    new Notification('😴 Питомец устал', {
      body: `${state.pet.name} нужен отдых. Уложи его спать.`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">😴</text></svg>',
      tag: 'pet-tired',
    });
  }
}

// Проверяем каждые 30 минут
setInterval(checkContextualNotifications, 30 * 60 * 1000);
// ==================== RANDOM LOOT SYSTEM ====================
const rareLootTable = [
  { id: 'golden_feather', name: 'Золотое перо', icon: '🪶', rarity: 'legendary', desc: 'Питомец нашёл редкое перо! +50 XP', xpBonus: 50, weight: 3 },
  { id: 'ancient_coin', name: 'Древняя монета', icon: '🪙', rarity: 'epic', desc: 'Монета из древнего сундука! +30 💎', gemBonus: 30, weight: 8 },
  { id: 'magic_crystal', name: 'Магический кристалл', icon: '💠', rarity: 'rare', desc: 'Кристалл усиливает питомца! +20 энергии', energyBonus: 20, weight: 15 },
  { id: 'lucky_clover', name: 'Клевер удачи', icon: '🍀', rarity: 'uncommon', desc: 'Удваивает следующую награду!', doubleNext: true, weight: 20 },
  { id: 'strange_mushroom', name: 'Странный гриб', icon: '🍄', rarity: 'common', desc: 'Питомец принёс гриб. +10 XP', xpBonus: 10, weight: 30 },
  { id: 'shiny_pebble', name: 'Блестящий камешек', icon: '🪨', rarity: 'common', desc: 'Красивый камень! +5 💎', gemBonus: 5, weight: 24 },
];

const petLetters = [
  { subject: 'Прогулка', body: 'Сегодня я гулял по лесу и нашёл удивительный запах! Жду не дождусь нашей следующей прогулки.' },
  { subject: 'Сон', body: 'Мне приснилось, что мы летали на драконе! Ты был таким смелым. Спасибо, что заботишься обо мне.' },
  { subject: 'Мысли', body: 'Знаешь, я тут подумал... Ты выполняешь привычки уже много дней. Я горжусь тобой! Правда.' },
  { subject: 'Секрет', body: 'Тсс... я спрятал кое-что в своей подстилке. Загляни туда, когда у тебя будет минутка.' },
  { subject: 'Дождь', body: 'Сегодня шёл дождь, и я смотрел в окно. Вспоминал нашу первую встречу. Ты выбрал меня из всех питомцев.' },
  { subject: 'Благодарность', body: 'Просто хотел сказать спасибо. Не все питомцы живут так хорошо, как я. Ты — лучший хозяин.' },
];

function checkRandomLoot() {
  // Базовый шанс 8% + бонус от мебели
  let chance = 0.08;
  if (state.world.furniture.find(f => f.id === 'plant' && f.placed)) chance += 0.03;
  if (state.world.furniture.find(f => f.id === 'painting' && f.placed)) chance += 0.02;
  
  if (Math.random() < chance) {
    return rollLoot();
  }
  return null;
}

function rollLoot() {
  const rand = Math.random() * 100;
  let cum = 0;
  for (const item of rareLootTable) {
    cum += item.weight;
    if (rand <= cum) {
      applyLoot(item);
      return item;
    }
  }
  return rareLootTable[rareLootTable.length - 1];
}

function applyLoot(item) {
  if (item.xpBonus) state.player.xp += item.xpBonus;
  if (item.gemBonus) state.player.gems += item.gemBonus;
  if (item.energyBonus) state.pet.energy = Math.min(100, state.pet.energy + item.energyBonus);
  if (item.doubleNext) state.player.doubleNextReward = true;
  
  // Показываем модалку с находкой
  showLootModal(item);
}

function showLootModal(item) {
  const rarityColors = {
    legendary: '#FFD700',
    epic: '#AF52DE',
    rare: '#007AFF',
    uncommon: '#34C759',
    common: '#8E8E93',
  };

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.style.zIndex = '150';
  modal.innerHTML = `
    <div class="modal-sheet" style="text-align:center;">
      <div style="font-size:64px;animation: float 1s ease-in-out infinite;">${item.icon}</div>
      <div style="font-size:12px;color:${rarityColors[item.rarity]};font-weight:700;margin:8px 0;">${item.rarity.toUpperCase()}</div>
      <h2>${item.name}!</h2>
      <p style="margin:8px 0;">${item.desc}</p>
      <button class="gold" style="width:100%;margin-top:12px;" id="close-loot-btn">Круто! 🎉</button>
    </div>`;
  
  document.body.appendChild(modal);
  document.getElementById('close-loot-btn').onclick = () => modal.remove();
  sfxAchievement();
}

function getRandomLetter() {
  if (Math.random() < 0.12) { // 12% шанс при выполнении всех привычек
    return petLetters[Math.floor(Math.random() * petLetters.length)];
  }
  return null;
}

console.log('✅ Loot module loaded');
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
// ==================== GHOST SYSTEM ====================
const friends = [
  { id: 'fox-001', name: 'Лиса', pet: '🦊', streak: 12, online: true },
  { id: 'owl-002', name: 'Сова', pet: '🦉', streak: 30, online: true },
  { id: 'bee-003', name: 'Пчела', pet: '🐝', streak: 0, online: false },
];

function checkGhostVisits() {
  // 20% шанс что призрак друга посетит при каждом входе
  if (Math.random() < 0.2) {
    const offlineFriends = friends.filter(f => !f.online || f.streak === 0);
    if (offlineFriends.length > 0) {
      const ghost = offlineFriends[Math.floor(Math.random() * offlineFriends.length)];
      showGhostVisit(ghost);
    }
  }
}

function showGhostVisit(friend) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.style.zIndex = '180';
  modal.innerHTML = `
    <div class="modal-sheet" style="text-align:center;">
      <div style="font-size:48px;opacity:0.5;">👻</div>
      <h3>Призрак питомца</h3>
      <p style="margin:8px 0;">${friend.pet} питомец ${friend.name} забрёл к вам.</p>
      <p class="muted">${friend.name} давно не заходил(а).</p>
      <div class="grid2" style="margin:12px 0;">
        <button class="secondary" id="ghost-feed-btn">🍖 Покормить</button>
        <button class="secondary" id="ghost-cheer-btn">💪 Приободрить</button>
      </div>
      <button class="secondary" id="close-ghost-btn" style="width:100%;margin-top:8px;">Закрыть</button>
    </div>`;
  
  document.body.appendChild(modal);
  
  document.getElementById('ghost-feed-btn').onclick = () => {
    state.player.gems = Math.max(0, state.player.gems - 1);
    showToast(`Вы покормили питомца ${friend.name} 🍖`);
    modal.remove();
  };
  
  document.getElementById('ghost-cheer-btn').onclick = () => {
    state.pet.mood = Math.min(100, state.pet.mood + 10);
    showToast(`Вы приободрили питомца ${friend.name} 💪`);
    modal.remove();
  };
  
  document.getElementById('close-ghost-btn').onclick = () => modal.remove();
}

console.log('✅ Ghosts module loaded');
// ==================== HARDCORE MODE ====================
function startHardcoreMode() {
  if (state.player.hardcoreMode) return;
  if (state.player.streak < 7) {
    showToast('Нужен стрик 7 дней для активации');
    return;
  }
  
  state.player.hardcoreMode = true;
  state.player.hardcoreSkin = state.pet.color;
  
  // Меняем облик на "прокачанный"
  const hardcoreSkins = {
    yellow: '🔥',
    white: '❄️',
    black: '🌑',
    golden: '👑',
  };
  
  state.pet.hardcoreEmoji = hardcoreSkins[state.pet.color] || '💎';
  updateAllPetUI();
  saveGame();
  showToast('⚡ Режим испытания активирован! Не пропускай дни!');
}

function checkHardcoreFail() {
  if (!state.player.hardcoreMode) return;
  
  const today = new Date().toISOString().split('T')[0];
  if (state.player.lastHardcoreCheck === today) return;
  
  state.player.lastHardcoreCheck = today;
  
  const allDone = state.habits.list.every(h => h.done);
  if (!allDone && state.player.streak === 0) {
    // Провал — сброс облика
    state.player.hardcoreMode = false;
    state.player.hardcoreSkin = null;
    state.pet.hardcoreEmoji = null;
    updateAllPetUI();
    saveGame();
    showToast('💔 Испытание провалено. Облик сброшен.');
  }
}

function isHardcoreActive() {
  return state.player.hardcoreMode && state.player.streak > 0;
}

console.log('✅ Hardcore module loaded');
// ==================== SKILL TREE ====================
const skillTree = [
  {
    id: 'xpBoost1',
    name: 'Ученик',
    icon: '📖',
    desc: '+10% XP за привычки',
    level: 5,
    requires: null,
  },
  {
    id: 'xpBoost2',
    name: 'Мастер',
    icon: '📚',
    desc: '+20% XP за привычки',
    level: 15,
    requires: 'xpBoost1',
  },
  {
    id: 'lootLuck1',
    name: 'Искатель',
    icon: '🍀',
    desc: '+5% шанс находок',
    level: 8,
    requires: null,
  },
  {
    id: 'lootLuck2',
    name: 'Кладоискатель',
    icon: '💎',
    desc: '+10% шанс находок',
    level: 18,
    requires: 'lootLuck1',
  },
  {
    id: 'expeditionSpeed',
    name: 'Быстроход',
    icon: '🏃',
    desc: 'Экспедиции на 25% быстрее',
    level: 10,
    requires: null,
  },
  {
    id: 'bossDamage',
    name: 'Воитель',
    icon: '⚔️',
    desc: '+50% урона боссам',
    level: 12,
    requires: null,
  },
];

function checkSkillPoint() {
  const level = getLevel(state);
  const available = skillTree.filter(s => 
    s.level <= level && 
    !state.pet.skills?.unlocked?.includes(s.id) &&
    (!s.requires || state.pet.skills?.unlocked?.includes(s.requires))
  );
  
  if (available.length > 0) {
    state.pendingSkill = available;
    showSkillModal(available);
  }
}

function showSkillModal(availableSkills) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.style.zIndex = '150';
  
  const skillsHTML = availableSkills.map(s => `
    <div class="skill-option" data-skill="${s.id}" style="
      background:var(--glass-bg);border:1px solid var(--glass-border);
      border-radius:var(--radius-md);padding:12px;margin-bottom:8px;cursor:pointer;text-align:left;
    ">
      <div class="row">
        <span style="font-size:24px;">${s.icon}</span>
        <div>
          <div style="font-weight:600;">${s.name}</div>
          <div style="font-size:11px;color:var(--muted);">${s.desc}</div>
        </div>
      </div>
    </div>
  `).join('');
  
  modal.innerHTML = `
    <div class="modal-sheet" style="text-align:center;">
      <h2>🌟 Новый навык!</h2>
      <p class="muted">Выбери один навык для питомца:</p>
      <div style="margin:12px 0;">${skillsHTML}</div>
    </div>`;
  
  document.body.appendChild(modal);
  
  modal.querySelectorAll('.skill-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const skillId = opt.dataset.skill;
      if (!state.pet.skills) state.pet.skills = { unlocked: [], xpBoost: 0, lootLuck: 0 };
      state.pet.skills.unlocked.push(skillId);
      
      const skill = skillTree.find(s => s.id === skillId);
      if (skill.id.includes('xpBoost')) state.pet.skills.xpBoost = (state.pet.skills.xpBoost || 0) + 10;
      if (skill.id.includes('lootLuck')) state.pet.skills.lootLuck = (state.pet.skills.lootLuck || 0) + 5;
      
      modal.remove();
      updateAllPetUI();
      saveGame();
      showToast(`Навык "${skill.name}" изучен!`);
    });
  });
}

function getActiveSkills() {
  return state.pet.skills?.unlocked?.map(id => skillTree.find(s => s.id === id)).filter(Boolean) || [];
}

console.log('✅ Skills module loaded');
// ==================== CO-OP EXPEDITIONS ====================
const coopBosses = [
  { name: '🐲 Древний дракон', hp: 1000, maxHp: 1000, 
    reward: { type: 'item', id: 'crown', text: '👑 Корона Дракона' }, 
    xpReward: 500, minPlayers: 2 },
  { name: '🌋 Вулканический голем', hp: 1500, maxHp: 1500,
    reward: { type: 'gems', amount: 100, text: '💎 100 кристаллов' },
    xpReward: 700, minPlayers: 3 },
  { name: '🌪️ Штормовой элементаль', hp: 800, maxHp: 800,
    reward: { type: 'item', id: 'glasses', text: '🕶️ Очки Шторма' },
    xpReward: 400, minPlayers: 2 },
];

const mockFriends = [
  { id: 'user1', name: 'Анна', pet: '🦊', level: 5, streak: 12, online: true },
  { id: 'user2', name: 'Макс', pet: '🐱', level: 7, streak: 20, online: true },
  { id: 'user3', name: 'Оля', pet: '🐰', level: 3, streak: 5, online: false },
  { id: 'user4', name: 'Дима', pet: '🐶', level: 8, streak: 15, online: true },
];

function startCoopExpedition() {
  const onlineFriends = mockFriends.filter(f => f.online);
  const boss = coopBosses[Math.floor(Math.random() * coopBosses.length)];
  
  if (onlineFriends.length < boss.minPlayers) {
    showToast(`Нужно минимум ${boss.minPlayers} друга онлайн`);
    return;
  }
  
  // Выбираем случайных друзей для кооператива
  const team = [{
    id: 'you',
    name: 'Ты',
    pet: petColors[state.pet.color]?.emoji || '🐥',
    level: getLevel(state),
    streak: state.player.streak,
  }];
  
  const available = [...onlineFriends];
  for (let i = 0; i < boss.minPlayers; i++) {
    const rand = Math.floor(Math.random() * available.length);
    team.push(available.splice(rand, 1)[0]);
  }
  
  state.coop = {
    boss: { ...boss, hp: boss.maxHp, maxHp: boss.maxHp },
    team,
    damageDealt: 0,
    startTime: Date.now(),
    duration: 24 * 60 * 60 * 1000, // 24 часа
  };
  
  showCoopModal();
  saveGame();
}

function showCoopModal() {
  if (!state.coop || !state.coop.boss) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.style.zIndex = '160';
  
  const boss = state.coop.boss;
  const teamHTML = state.coop.team.map(member => `
    <div class="row" style="padding:6px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:18px;">${member.pet}</span>
      <div style="flex:1;">
        <div style="font-size:12px;font-weight:600;">${member.name}</div>
        <div style="font-size:10px;color:var(--muted);">⭐${member.level} · 🔥${member.streak}д</div>
      </div>
      <span style="font-size:12px;">${member.id === 'you' ? '🎯 Ты' : '🤝'}</span>
    </div>
  `).join('');
  
  const remaining = Math.max(0, state.coop.duration - (Date.now() - state.coop.startTime));
  const hoursLeft = Math.ceil(remaining / (1000 * 60 * 60));
  
  modal.innerHTML = `
    <div class="modal-sheet" style="text-align:center;">
      <div style="font-size:48px;">${boss.name.split(' ')[0]}</div>
      <h2>Совместная охота</h2>
      <div class="boss-card">
        <h3>${boss.name}</h3>
        <div class="boss-hp-bar"><div class="boss-hp-fill" style="width:${Math.round(boss.hp/boss.maxHp*100)}%;"></div></div>
        <p>❤️ ${boss.hp}/${boss.maxHp}</p>
        <p class="muted">Осталось: ${hoursLeft}ч</p>
      </div>
      
      <h3 style="margin:12px 0 8px;">Команда</h3>
      ${teamHTML}
      
      <p class="muted" style="margin-top:8px;">
        Каждая твоя привычка наносит 15 урона боссу.<br>
        Друзья тоже помогают!
      </p>
      
      <button id="close-coop-btn" class="secondary" style="width:100%;margin-top:12px;">Понятно</button>
    </div>`;
  
  document.body.appendChild(modal);
  document.getElementById('close-coop-btn').onclick = () => modal.remove();
}

function dealCoopDamage() {
  if (!state.coop || !state.coop.boss || state.coop.boss.hp <= 0) return;
  
  // Твой урон
  const bossDmgSkill = state.pet.skills?.unlocked?.includes('bossDamage') ? 22 : 15;
  state.coop.boss.hp = Math.max(0, state.coop.boss.hp - bossDmgSkill);
  
  // Друзья тоже наносят урон (каждый час)
  const elapsed = Date.now() - state.coop.startTime;
  const hoursPassed = Math.floor(elapsed / (1000 * 60 * 60));
  const friendDamage = hoursPassed * state.coop.team.length * 8;
  state.coop.boss.hp = Math.max(0, state.coop.boss.hp - friendDamage);
  
  if (state.coop.boss.hp <= 0) {
    // Победа!
    applyReward(state.coop.boss.reward);
    state.player.xp += state.coop.boss.xpReward;
    state.world.bossKills++;
    showCoopVictoryModal();
    state.coop = null;
    sfxAchievement();
  }
  
  saveGame();
}

function showCoopVictoryModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.style.zIndex = '170';
  modal.innerHTML = `
    <div class="modal-sheet" style="text-align:center;">
      <div style="font-size:72px;">🏆</div>
      <h2>Совместная победа!</h2>
      <p>Команда победила ${state.coop?.boss?.name || 'босса'}!</p>
      <p style="margin:8px 0;">🎁 ${state.coop?.boss?.reward?.text || 'Награда'}</p>
      <p>⚡ +${state.coop?.boss?.xpReward || 0} XP</p>
      <button id="close-victory-btn" class="gold" style="width:100%;margin-top:12px;">Ура! 🎉</button>
    </div>`;
  
  document.body.appendChild(modal);
  document.getElementById('close-victory-btn').onclick = () => modal.remove();
}

console.log('✅ Co-op module loaded');
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

console.log('✅ Tutorial module loaded');
// ==================== HEATMAP MODULE ====================
function renderHeatmap() {
  const container = document.getElementById('heatmap-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const today = new Date();
  const days = [];
  
  // Последние 28 дней
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const done = state.player.heatmapData?.[i] || false;
    const count = done ? Math.floor(Math.random() * 4) + 1 : 0; // 0-4 выполненных привычек
    
    let color;
    if (count === 0) color = 'rgba(60,60,67,0.06)';
    else if (count === 1) color = 'rgba(52,199,89,0.3)';
    else if (count === 2) color = 'rgba(52,199,89,0.5)';
    else if (count === 3) color = 'rgba(52,199,89,0.7)';
    else color = 'rgba(52,199,89,0.9)';
    
    const cell = document.createElement('div');
    cell.style.cssText = `
      width: 14px; height: 14px;
      border-radius: 3px;
      background: ${color};
      cursor: pointer;
    `;
    cell.title = `${date.toLocaleDateString('ru-RU')}: ${count} привычек`;
    cell.onclick = () => {
      showToast(`${date.toLocaleDateString('ru-RU', {day:'numeric',month:'long'})}: ${count} привычек`);
    };
    
    container.appendChild(cell);
  }
}

console.log('✅ Heatmap module loaded');
// ==================== WEEKLY GOALS ====================
function initWeeklyGoals() {
  if (!state.player.weeklyGoals) {
    state.player.weeklyGoals = {
      startDate: getMonday(),
      habitsTarget: 20,
      habitsDone: 0,
      streakDaysTarget: 5,
      streakDaysDone: 0,
      expeditionTarget: 2,
      expeditionsDone: 0,
      rewardClaimed: false,
    };
  }
  
  const monday = getMonday();
  if (state.player.weeklyGoals.startDate !== monday) {
    state.player.weeklyGoals = {
      startDate: monday,
      habitsTarget: 15 + Math.floor(Math.random() * 15),
      habitsDone: 0,
      streakDaysTarget: 3 + Math.floor(Math.random() * 4),
      streakDaysDone: 0,
      expeditionTarget: 1 + Math.floor(Math.random() * 3),
      expeditionsDone: 0,
      rewardClaimed: false,
    };
  }
}

function getMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function updateWeeklyProgress() {
  if (!state.player.weeklyGoals) initWeeklyGoals();
  const wg = state.player.weeklyGoals;
  
  wg.habitsDone = state.habits.list.filter(h => {
    if (h.target) return h.progress >= h.target;
    return h.done;
  }).length;
  wg.streakDaysDone = state.player.streak;
  wg.expeditionsDone = state.world.bossKills;
  
  const allDone = wg.habitsDone >= wg.habitsTarget && 
                  wg.streakDaysDone >= wg.streakDaysTarget &&
                  wg.expeditionsDone >= wg.expeditionTarget;
  
  if (allDone && !wg.rewardClaimed) {
    wg.rewardClaimed = true;
    claimWeeklyReward();
  }
  
  saveGame();
}

function claimWeeklyReward() {
  state.player.gems += 30;
  state.player.xp += 100;
  
  const crown = state.shop.accessories.find(i => i.id === 'crown' && !i.owned);
  if (Math.random() < 0.3 && crown) {
    crown.owned = true;
    showToast('🎁 Недельная цель: Корона + 30💎 + 100XP!');
  } else {
    showToast('🎉 Недельная цель выполнена! +30💎 +100XP');
  }
  
  sfxReward();
  updateAllPetUI();
  renderWeeklyUI();
}

function renderWeeklyUI() {
  const container = document.getElementById('weekly-goals');
  if (!container) return;
  
  initWeeklyGoals();
  const wg = state.player.weeklyGoals;
  
  const habitsPct = Math.min(100, Math.round(wg.habitsDone / wg.habitsTarget * 100));
  const streakPct = Math.min(100, Math.round(wg.streakDaysDone / wg.streakDaysTarget * 100));
  const expedPct = Math.min(100, Math.round(wg.expeditionsDone / wg.expeditionTarget * 100));
  
  container.innerHTML = `
    <div class="card" style="background:var(--glass-bg);backdrop-filter:blur(16px);">
      <div class="row" style="justify-content:space-between;margin-bottom:8px;">
        <h3>🎯 Цели недели</h3>
        <span class="muted" style="font-size:10px;">до воскресенья</span>
      </div>
      
      <div style="margin-bottom:8px;">
        <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:2px;">
          <span>✅ Привычек: ${wg.habitsDone}/${wg.habitsTarget}</span>
          <span>${habitsPct}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${habitsPct}%;"></div></div>
      </div>
      
      <div style="margin-bottom:8px;">
        <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:2px;">
          <span>🔥 Дней стрика: ${wg.streakDaysDone}/${wg.streakDaysTarget}</span>
          <span>${streakPct}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${streakPct}%;background:var(--orange);"></div></div>
      </div>
      
      <div style="margin-bottom:8px;">
        <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:2px;">
          <span>⚔️ Боссов: ${wg.expeditionsDone}/${wg.expeditionTarget}</span>
          <span>${expedPct}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${expedPct}%;background:var(--red);"></div></div>
      </div>
      
      ${wg.rewardClaimed ? '<p style="text-align:center;color:var(--green);font-weight:600;">✓ Награда получена!</p>' : ''}
    </div>`;
}

console.log('✅ Weekly module loaded');
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
// ==================== FIREBASE MODULE ====================
const firebaseConfig = {
  apiKey: "AIzaSyBU5jbR8af_Fh-RTj7JsZQ1OSFyhnnx5YM",
  authDomain: "pethabit-77373.firebaseapp.com",
  projectId: "pethabit-77373",
  storageBucket: "pethabit-77373.firebasestorage.app",
  messagingSenderId: "210388751632",
  appId: "1:210388751632:web:dc78a9fd1014e118978195",
  measurementId: "G-1FNG89BDQK"
};

let auth = null;
let db = null;
let firebaseReady = false;

try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  db.enablePersistence().catch(() => {});
  firebaseReady = true;
  console.log('✅ Firebase ready');
} catch (e) {
  console.warn('⚠️ Firebase not configured');
}

// ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ для авторизации
function signInWithGoogle() {
  if (!firebaseReady) { showToast('Firebase не настроен'); return; }
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(e => showToast('Ошибка: ' + e.message));
}

function signInWithApple() {
  if (!firebaseReady) { showToast('Firebase не настроен'); return; }
  const provider = new firebase.auth.OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  auth.signInWithPopup(provider).catch(e => showToast('Ошибка: ' + e.message));
}

// Единый обработчик — только через onAuthStateChanged
async function onUserLoggedIn(user) {
  state.player.userId = user.uid;
  state.player.isAnonymous = false;
  
  const cloudData = await loadFromCloud(user.uid);
  if (cloudData) {
    Object.assign(state, cloudData);
    showToast('☁️ Прогресс загружен!');
  } else {
    await saveToCloud();
    showToast('☁️ Прогресс сохранён!');
  }
  
  updateCloudStatus();
  startApp();
}

async function loadFromCloud(uid) {
  if (!firebaseReady) return null;
  try {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? doc.data().state : null;
  } catch (e) {
    return null;
  }
}

async function saveToCloud() {
  if (!firebaseReady || !state.player.userId || state.player.isAnonymous) return;
  try {
    await db.collection('users').doc(state.player.userId).set({
      state: JSON.parse(JSON.stringify(state)),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.error('Save failed:', e);
  }
}

console.log('✅ Firebase module loaded');
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
      if (data.state.achievements) { state.achievements.unlocked = data.state.achievements.unlocked || []; }
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
