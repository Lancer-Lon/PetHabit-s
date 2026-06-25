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
