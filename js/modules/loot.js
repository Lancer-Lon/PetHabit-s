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
