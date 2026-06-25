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
