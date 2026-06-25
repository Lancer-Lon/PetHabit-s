// ==================== WEEKLY GOALS ====================
function initWeeklyGoals() {
  if (!state.player.weeklyGoals) {
    state.player.weeklyGoals = {
      startDate: getMonday(),
      habitsTarget: 20,
      habitsDone: 0,
      streakDaysTarget: 5,
      streakDaysDone: 0,
      expeditionTarget: 2,
      expeditionsDone: 0,
      rewardClaimed: false,
    };
  }
  
  const monday = getMonday();
  if (state.player.weeklyGoals.startDate !== monday) {
    state.player.weeklyGoals = {
      startDate: monday,
      habitsTarget: 15 + Math.floor(Math.random() * 15),
      habitsDone: 0,
      streakDaysTarget: 3 + Math.floor(Math.random() * 4),
      streakDaysDone: 0,
      expeditionTarget: 1 + Math.floor(Math.random() * 3),
      expeditionsDone: 0,
      rewardClaimed: false,
    };
  }
}

function getMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function updateWeeklyProgress() {
  if (!state.player.weeklyGoals) initWeeklyGoals();
  const wg = state.player.weeklyGoals;
  
  wg.habitsDone = state.habits.list.filter(h => {
    if (h.target) return h.progress >= h.target;
    return h.done;
  }).length;
  wg.streakDaysDone = state.player.streak;
  wg.expeditionsDone = state.world.bossKills;
  
  const allDone = wg.habitsDone >= wg.habitsTarget && 
                  wg.streakDaysDone >= wg.streakDaysTarget &&
                  wg.expeditionsDone >= wg.expeditionTarget;
  
  if (allDone && !wg.rewardClaimed) {
    wg.rewardClaimed = true;
    claimWeeklyReward();
  }
  
  saveGame();
}

function claimWeeklyReward() {
  state.player.gems += 30;
  state.player.xp += 100;
  
  const crown = state.shop.accessories.find(i => i.id === 'crown' && !i.owned);
  if (Math.random() < 0.3 && crown) {
    crown.owned = true;
    showToast('🎁 Недельная цель: Корона + 30💎 + 100XP!');
  } else {
    showToast('🎉 Недельная цель выполнена! +30💎 +100XP');
  }
  
  sfxReward();
  updateAllPetUI();
  renderWeeklyUI();
}

function renderWeeklyUI() {
  const container = document.getElementById('weekly-goals');
  if (!container) return;
  
  initWeeklyGoals();
  const wg = state.player.weeklyGoals;
  
  const habitsPct = Math.min(100, Math.round(wg.habitsDone / wg.habitsTarget * 100));
  const streakPct = Math.min(100, Math.round(wg.streakDaysDone / wg.streakDaysTarget * 100));
  const expedPct = Math.min(100, Math.round(wg.expeditionsDone / wg.expeditionTarget * 100));
  
  container.innerHTML = `
    <div class="card" style="background:var(--glass-bg);backdrop-filter:blur(16px);">
      <div class="row" style="justify-content:space-between;margin-bottom:8px;">
        <h3>🎯 Цели недели</h3>
        <span class="muted" style="font-size:10px;">до воскресенья</span>
      </div>
      
      <div style="margin-bottom:8px;">
        <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:2px;">
          <span>✅ Привычек: ${wg.habitsDone}/${wg.habitsTarget}</span>
          <span>${habitsPct}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${habitsPct}%;"></div></div>
      </div>
      
      <div style="margin-bottom:8px;">
        <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:2px;">
          <span>🔥 Дней стрика: ${wg.streakDaysDone}/${wg.streakDaysTarget}</span>
          <span>${streakPct}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${streakPct}%;background:var(--orange);"></div></div>
      </div>
      
      <div style="margin-bottom:8px;">
        <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:2px;">
          <span>⚔️ Боссов: ${wg.expeditionsDone}/${wg.expeditionTarget}</span>
          <span>${expedPct}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${expedPct}%;background:var(--red);"></div></div>
      </div>
      
      ${wg.rewardClaimed ? '<p style="text-align:center;color:var(--green);font-weight:600;">✓ Награда получена!</p>' : ''}
    </div>`;
}

console.log('✅ Weekly module loaded');
