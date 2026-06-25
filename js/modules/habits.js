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
    if (loot) { saveGame(); return; }
    
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
    if (loot) { saveGame(); return; }
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
