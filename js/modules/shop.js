// ==================== SHOP MODULE ====================
function renderShop() {
  renderShopGroup('shop-items', state.shop.accessories);
  renderShopGroup('shop-bgs', state.shop.backgrounds);
  renderShopGroup('shop-furniture', state.world.furniture);
}

function renderShopGroup(elementId, items) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'shop-item';
    card.innerHTML = `
      <div style="font-size:24px;">${item.icon}</div>
      <div style="font-size:12px;">${item.name}</div>
      ${item.owned
        ? '<div class="muted" style="font-size:10px;">В инвентаре</div>'
        : `<div style="font-size:11px;">💎 ${item.cost}</div>`
      }`;

    card.onclick = () => {
      if (!item.owned && state.player.gems >= item.cost) {
        state.player.gems -= item.cost;
        item.owned = true;
        sfxPurchase();
        showToast(`Куплено: ${item.name}`);
        checkAndShowAchievements();
        renderAll();
        saveGame();
      } else if (!item.owned) {
        showToast('Недостаточно 💎');
      }
    };

    el.appendChild(card);
  });
}

function renderInventory() {
  renderInvGroup('inv-items', state.shop.accessories, 'equipped');
  renderInvGroup('inv-bgs', state.shop.backgrounds, 'equipped');
  renderInvGroup('inv-furniture', state.world.furniture, 'placed');
}

function renderInvGroup(elementId, items, equipKey) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = '';

  const owned = items.filter(i => i.owned);
  if (!owned.length) {
    el.innerHTML = '<p class="muted">Пусто</p>';
    return;
  }

  owned.forEach(item => {
    const card = document.createElement('div');
    card.className = 'inventory-item' + (item[equipKey] ? ' equipped' : '');
    card.innerHTML = `
      <div style="font-size:22px;">${item.icon}</div>
      <div style="font-size:11px;">${item.name}</div>
      <div style="font-size:10px;color:${item[equipKey] ? 'var(--accent)' : 'var(--muted)'};">
        ${item[equipKey] ? '✓ Используется' : 'Надеть'}
      </div>`;

    card.onclick = () => {
      items.forEach(i => i[equipKey] = false);
      item[equipKey] = true;
      updateAllPetUI();
      renderAll();
      saveGame();
    };

    el.appendChild(card);
  });
}

console.log('✅ Shop module loaded');
