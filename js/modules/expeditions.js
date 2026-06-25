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
