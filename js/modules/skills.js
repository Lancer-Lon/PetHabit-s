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
