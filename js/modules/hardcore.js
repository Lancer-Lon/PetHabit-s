// ==================== HARDCORE MODE ====================
function startHardcoreMode() {
  if (state.player.hardcoreMode) return;
  if (state.player.streak < 7) {
    showToast('Нужен стрик 7 дней для активации');
    return;
  }
  
  state.player.hardcoreMode = true;
  state.player.hardcoreSkin = state.pet.color;
  
  // Меняем облик на "прокачанный"
  const hardcoreSkins = {
    yellow: '🔥',
    white: '❄️',
    black: '🌑',
    golden: '👑',
  };
  
  state.pet.hardcoreEmoji = hardcoreSkins[state.pet.color] || '💎';
  updateAllPetUI();
  saveGame();
  showToast('⚡ Режим испытания активирован! Не пропускай дни!');
}

function checkHardcoreFail() {
  if (!state.player.hardcoreMode) return;
  
  const today = new Date().toISOString().split('T')[0];
  if (state.player.lastHardcoreCheck === today) return;
  
  state.player.lastHardcoreCheck = today;
  
  const allDone = state.habits.list.every(h => h.done);
  if (!allDone && state.player.streak === 0) {
    // Провал — сброс облика
    state.player.hardcoreMode = false;
    state.player.hardcoreSkin = null;
    state.pet.hardcoreEmoji = null;
    updateAllPetUI();
    saveGame();
    showToast('💔 Испытание провалено. Облик сброшен.');
  }
}

function isHardcoreActive() {
  return state.player.hardcoreMode && state.player.streak > 0;
}

console.log('✅ Hardcore module loaded');
