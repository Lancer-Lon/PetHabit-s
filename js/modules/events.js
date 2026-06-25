// ==================== EVENT SYSTEM ====================
const eventBus = {
  _listeners: {},
  
  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  },
  
  emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(cb => cb(data));
  }
};

// Подписываемся на события
eventBus.on('habitToggled', () => {
  if (state.coop) dealCoopDamage();
  updateWeeklyProgress();
  renderWeeklyUI();
  checkMilestoneConfetti();
});

eventBus.on('habitToggled', () => {
  // Можно добавить любые другие обработчики без monkey-patching
});

console.log('✅ Events module loaded');
