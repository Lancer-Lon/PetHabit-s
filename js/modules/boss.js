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
