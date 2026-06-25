const CACHE_NAME = 'pethabit-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/firebase.js',
  '/js/modules/state.js',
  '/js/modules/events.js',
  '/js/modules/sounds.js',
  '/js/modules/ui.js',
  '/js/modules/pet.js',
  '/js/modules/habits.js',
  '/js/modules/achievements.js',
  '/js/modules/shop.js',
  '/js/modules/boss.js',
  '/js/modules/expeditions.js',
  '/js/modules/loot.js',
  '/js/modules/prestige.js',
  '/js/modules/ghosts.js',
  '/js/modules/hardcore.js',
  '/js/modules/skills.js',
  '/js/modules/coop.js',
  '/js/modules/tutorial.js',
  '/js/modules/heatmap.js',
  '/js/modules/weekly.js',
  '/js/modules/confetti.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
