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
