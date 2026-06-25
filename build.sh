#!/bin/bash
cd /Users/nikitamechkaev/Documents/pethabit-app
cat js/modules/state.js \
    js/modules/events.js \
    js/modules/sounds.js \
    js/modules/ui.js \
    js/modules/pet.js \
    js/modules/habits.js \
    js/modules/achievements.js \
    js/modules/shop.js \
    js/modules/boss.js \
    js/modules/expeditions.js \
    js/modules/loot.js \
    js/modules/prestige.js \
    js/modules/ghosts.js \
    js/modules/hardcore.js \
    js/modules/skills.js \
    js/modules/coop.js \
    js/modules/tutorial.js \
    js/modules/heatmap.js \
    js/modules/weekly.js \
    js/modules/confetti.js \
    js/firebase.js \
    js/app.js > js/bundle.js
echo "✅ Bundle created! $(wc -c < js/bundle.js) bytes"
