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
