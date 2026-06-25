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
