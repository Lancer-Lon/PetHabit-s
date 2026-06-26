const state = {
  player: { xp: 0, gems: 30, streak: 0, bestStreak: 0, totalHabitsDone: 0, totalDays: 0, lastDailyClaim: null, dailyStreak: 0, todayDate: new Date().toISOString().split('T')[0], heatmapData: Array(28).fill(false), weekHistory: Array(7).fill(0), userId: null, isAnonymous: true, doubleNextReward: false, prestigeLevel: 0 },
  pet: { name: 'Пиксель', color: 'yellow', health: 100, energy: 100, hunger: 100, mood: 80, deepSleep: false, sleepHabitsNeeded: 0 },
  habits: { list: [{ id: 1, name: 'Выпить стакан воды', icon: '💧', category: 'rest', done: false },{ id: 2, name: '10 минут чтения', icon: '📖', category: 'mind', done: false },{ id: 3, name: 'Прогулка 15 минут', icon: '🏃', category: 'strength', done: false },{ id: 4, name: 'Без телефона перед сном', icon: '🌙', category: 'rest', done: false }], nextId: 5, doneMap: {}, editingId: null, swipedId: null },
  world: { currentBoss: null, bossKills: 0, activeExpedition: null, furniture: [{ id: 'bed', name: 'Кровать', icon: '🛏️', cost: 30, owned: false, placed: false },{ id: 'plant', name: 'Растение', icon: '🪴', cost: 15, owned: false, placed: false },{ id: 'painting', name: 'Картина', icon: '🖼️', cost: 20, owned: false, placed: false },{ id: 'rug', name: 'Коврик', icon: '🧶', cost: 25, owned: false, placed: false },{ id: 'bookshelf', name: 'Книжная полка', icon: '📚', cost: 35, owned: false, placed: false },{ id: 'lamp', name: 'Лампа', icon: '💡', cost: 20, owned: false, placed: false }] },
  shop: { accessories: [{ id: 'hat', name: 'Шапка', cost: 30, icon: '🎩', owned: false, equipped: false },{ id: 'glasses', name: 'Очки', cost: 50, icon: '🕶️', owned: false, equipped: false },{ id: 'bow', name: 'Бантик', cost: 20, icon: '🎀', owned: false, equipped: false },{ id: 'crown', name: 'Корона', cost: 100, icon: '👑', owned: false, equipped: false }], backgrounds: [{ id: 'forest', name: 'Лес', cost: 40, icon: '🌳', owned: false, equipped: false },{ id: 'space', name: 'Космос', cost: 80, icon: '🌌', owned: false, equipped: false },{ id: 'beach', name: 'Пляж', cost: 60, icon: '🏖️', owned: false, equipped: false }] },
  achievements: { unlocked: [] }
};
const achievementsList = [
  { id: 'first_habit', icon: '✅', name: 'Первый шаг', desc: 'Выполнить первую привычку', check: s => s.player.totalHabitsDone >= 1 },
  { id: 'streak_3', icon: '🔥', name: 'Три дня', desc: 'Стрик 3 дня', check: s => s.player.bestStreak >= 3 },
  { id: 'streak_7', icon: '🔥', name: 'Неделя силы', desc: 'Стрик 7 дней', check: s => s.player.bestStreak >= 7 },
  { id: 'streak_10', icon: '💪', name: 'Железная воля', desc: 'Стрик 10 дней', check: s => s.player.bestStreak >= 10 },
  { id: 'habits_10', icon: '📋', name: 'Десятка', desc: '10 привычек', check: s => s.player.totalHabitsDone >= 10 },
  { id: 'habits_50', icon: '🏅', name: 'Полтинник', desc: '50 привычек', check: s => s.player.totalHabitsDone >= 50 },
  { id: 'habits_100', icon: '🏆', name: 'Сотня', desc: '100 привычек', check: s => s.player.totalHabitsDone >= 100 },
  { id: 'boss_kill', icon: '⚔️', name: 'Убийца боссов', desc: 'Победить босса', check: s => s.world.bossKills >= 1 },
  { id: 'boss_kill_3', icon: '🗡️', name: 'Охотник', desc: '3 босса', check: s => s.world.bossKills >= 3 },
  { id: 'furniture_1', icon: '🪑', name: 'Новоселье', desc: 'Купить мебель', check: s => s.world.furniture.some(f => f.owned) },
  { id: 'furniture_3', icon: '🏠', name: 'Дизайнер', desc: '3 мебели', check: s => s.world.furniture.filter(f => f.owned).length >= 3 },
  { id: 'level_5', icon: '⭐', name: 'Расту', desc: '5 уровень', check: s => getLevel(s) >= 5 }
];
function getLevel(s) { let l = 1; while (s.player.xp >= xpForLevel(l + 1)) l++; return l; }
function xpForLevel(l) { return l <= 1 ? 0 : Math.floor(100 * Math.pow(1.15, l - 1)); }
const petColors = { yellow: { emoji: '🐥', name: 'Жёлтый', weight: 70 }, white: { emoji: '🐤', name: 'Белый', weight: 20 }, black: { emoji: '🐧', name: 'Чёрный', weight: 8 }, golden: { emoji: '🦅', name: 'Золотой', weight: 2 } };
function generatePetColor() { const r = Math.random() * 100; let c = 0; for (const [k, d] of Object.entries(petColors)) { c += d.weight; if (r <= c) return k; } return 'yellow'; }
