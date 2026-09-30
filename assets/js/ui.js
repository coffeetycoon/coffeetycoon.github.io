/* ═══════════════════════════════════════════════════════════════════════════
   COFFEE TYCOON v1.14 - UI & NOTIFICATIONS
   UI Rendering, Notifications, Modals, and Event Handlers
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══ NOTIFICATION SYSTEM ═══
let activeNotifications = [];
let notificationIdCounter = 0;
let notificationTimers = new Map();

function showNotification(title, message, type = 'default', metadata = {}) {
  if (!notificationsEnabled()) return;
  const container = document.getElementById('notificationContainer');
  const notifId = notificationIdCounter++;
  
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.dataset.notifId = notifId;
  
  if (type === 'achievement') {
    notif.classList.add('achievement-notif');
    notif.dataset.achievementId = metadata.achievementId || '';
  } else if (type === 'upgrade') {
    notif.classList.add('upgrade-notif');
    notif.dataset.packId = metadata.packId || '';
  }
  
  notif.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-message">${message}</div>
  `;
  
  container.appendChild(notif);
  activeNotifications.push(notif);
  
  updateNotificationPositions();
  
  const timer = setTimeout(() => {
    removeNotificationNow(notif);
  }, 3000);
  notificationTimers.set(notif, timer);
  
  return notifId;
}

// Stacking is handled by flex gap in CSS; only the exit animation needs a transform
function updateNotificationPositions() {}

function showPurchaseNotification(itemName, count = 1) {
  if (!notificationsEnabled()) return;
  const container = document.getElementById('notificationContainer');

  const existing = activeNotifications.find(n =>
    n.dataset.itemName === itemName &&
    n.classList.contains('purchase-notif')
  );

  if (existing) {
    const newCount = (parseInt(existing.dataset.count) || 1) + count;
    existing.dataset.count = newCount;
    existing.querySelector('.notification-message').textContent =
      newCount > 1 ? `Purchased x${newCount} ${itemName}` : itemName;

    const oldTimer = notificationTimers.get(existing);
    if (oldTimer) clearTimeout(oldTimer);

    const newTimer = setTimeout(() => {
      removeNotificationNow(existing);
    }, 4000);
    notificationTimers.set(existing, newTimer);
    return;
  }

  const notifId = notificationIdCounter++;
  const notif = document.createElement('div');
  notif.className = 'notification purchase-notif';
  notif.dataset.notifId = notifId;
  notif.dataset.itemName = itemName;
  notif.dataset.count = count;

  notif.innerHTML = `
    <div class="notification-title">Purchase Complete</div>
    <div class="notification-message">${count > 1 ? `Purchased x${count} ${itemName}` : itemName}</div>
  `;

  container.appendChild(notif);
  activeNotifications.push(notif);

  updateNotificationPositions();

  const timer = setTimeout(() => {
    removeNotificationNow(notif);
  }, 4000);
  notificationTimers.set(notif, timer);
}

function showSellNotification(itemName, count) {
  if (!notificationsEnabled()) return;
  const container = document.getElementById('notificationContainer');

  const notifId = notificationIdCounter++;
  const notif = document.createElement('div');
  notif.className = 'notification sell-notif';
  notif.dataset.notifId = notifId;
  notif.dataset.itemName = itemName;

  notif.innerHTML = `
    <div class="notification-title">Sale Completed</div>
    <div class="notification-message">Converted ${count}x ${itemName} back to coffee</div>
  `;

  container.appendChild(notif);
  activeNotifications.push(notif);

  updateNotificationPositions();

  const timer = setTimeout(() => {
    removeNotificationNow(notif);
  }, 4000);
  notificationTimers.set(notif, timer);
}

function showClaimNotification(achievementName) {
  if (!notificationsEnabled()) return;
  const container = document.getElementById('notificationContainer');
  
  const notifId = notificationIdCounter++;
  const notif = document.createElement('div');
  notif.className = 'notification purchase-notif';
  notif.dataset.notifId = notifId;
  notif.dataset.itemName = achievementName;
  
  notif.innerHTML = `
    <div class="notification-title">Achievement Claimed!</div>
    <div class="notification-message">${achievementName}</div>
  `;
  
  container.appendChild(notif);
  activeNotifications.push(notif);
  
  updateNotificationPositions();
  
  const timer = setTimeout(() => {
    removeNotificationNow(notif);
  }, 4000);
  notificationTimers.set(notif, timer);
}

function removeNotificationNow(notificationElement) {
  if (!notificationElement || !notificationElement.parentNode) return;
  
  const timer = notificationTimers.get(notificationElement);
  if (timer) {
    clearTimeout(timer);
    notificationTimers.delete(notificationElement);
  }
  
  activeNotifications = activeNotifications.filter(n => n !== notificationElement);
  
  notificationElement.classList.add('fade-out');
  
  updateNotificationPositions();
  
  setTimeout(() => {
    if (notificationElement.parentNode) {
      notificationElement.remove();
    }
  }, 300);
}

function removeNotificationsByAchievement(achievementId) {
  const toRemove = activeNotifications.filter(n => n.dataset.achievementId === achievementId);
  toRemove.forEach(n => removeNotificationNow(n));
}

function removeNotificationsByPack(packId) {
  const toRemove = activeNotifications.filter(n => n.dataset.packId === packId);
  toRemove.forEach(n => removeNotificationNow(n));
}

// ═══ SHARED PRESTIGE / PROGRESS RENDERING ═══
function renderGoldenCoffeeProgressCard() {
  const threshold = nextGoldenThreshold();
  const progress = Math.min((gameState.totalCoffeeAllTime / threshold) * 100, 100);
  const coffeeNeeded = Math.max(0, threshold - gameState.totalCoffeeAllTime);
  const atMax = gameState.goldenCoffee >= MAX_GOLDEN_COFFEE;
  const gain = prestigeGain();
  const ready = gain > 0;

  const statusText = ready
    ? `<span style="color: #4CAF50; font-weight: 600;">[!] Ready to prestige for ${gain} more Golden Coffee!</span>`
    : atMax
      ? '<span style="color: #d4a574;">Maximum Golden Coffee reached (100)</span>'
      : `<span style="color: rgba(245, 245, 245, 0.8);">Need ${formatNumber(coffeeNeeded)} more total coffee for next Golden Coffee</span>`;

  return `
    <div style="background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(212, 165, 116, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="color: #d4a574; margin: 0; font-size: 18px; font-weight: 600;">Golden Coffee Progress</h3>
        <span style="color: #ffd700; font-weight: bold; font-size: 16px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${progress.toFixed(1)}%</span>
      </div>
      <div style="width: 100%; height: 12px; background: rgba(255, 255, 255, 0.1); border-radius: 6px; overflow: hidden; margin-bottom: 8px; border: 1px solid rgba(212, 165, 116, 0.2);">
        <div style="height: 100%; background: linear-gradient(90deg, #d4a574, #ffd700); width: ${progress}%; box-shadow: 0 0 10px rgba(212, 165, 116, 0.4);"></div>
      </div>
      <div style="color: #f5f5f5; font-size: 14px; text-align: center;">${statusText}</div>
      <div style="color: rgba(212, 165, 116, 0.9); font-size: 12px; text-align: center; margin-top: 8px;">
        Current: ${gameState.goldenCoffee} Golden Coffee | Multiplier: ${gameState.prestigeMultiplier.toFixed(1)}x
      </div>
    </div>
  `;
}

// ═══ UI UPDATE FUNCTIONS ═══
function updateNotificationBadges() {
  const availableUpgrades = upgrades.filter(u => 
    u.unlockCondition() && 
    !gameState.purchasedUpgrades.has(u.id) && 
    !gameState.viewedUpgrades.has(u.id)
  );
  // Golden upgrades live on the same tab: badge when one is unlocked AND affordable
  const availableGolden = goldenUpgrades.filter(u =>
    u.unlockCondition() &&
    !gameState.purchasedGoldenUpgrades.has(u.id) &&
    gameState.goldenCoffee >= u.cost
  );
  const upgradesBtn = document.querySelector('[data-tab="upgrades"]');
  if (!upgradesBtn) return;
  let upgradeBadge = upgradesBtn.querySelector('.notification-badge');
  if ((availableUpgrades.length > 0 || availableGolden.length > 0) && !upgradeBadge) {
    upgradeBadge = document.createElement('div');
    upgradeBadge.className = 'notification-badge';
    upgradesBtn.appendChild(upgradeBadge);
  } else if (availableUpgrades.length === 0 && availableGolden.length === 0 && upgradeBadge) {
    upgradeBadge.remove();
  }
  
  const unclaimedCount = gameState.unclaimedAchievements.size;
  const achievementsBtn = document.querySelector('[data-tab="achievements"]');
  if (!achievementsBtn) return;
  let achievementBadge = achievementsBtn.querySelector('.notification-badge');
  if (unclaimedCount > 0 && !achievementBadge) {
    achievementBadge = document.createElement('div');
    achievementBadge.className = 'notification-badge';
    achievementsBtn.appendChild(achievementBadge);
  } else if (unclaimedCount === 0 && achievementBadge) {
    achievementBadge.remove();
  }

  // Lab: badge when a drink recipe can be discovered right now
  const labBtn = document.querySelector('[data-tab="lab"]');
  if (labBtn && gameState.purchasedGoldenUpgrades.has('research_lab')) {
    const discoverable = drinkRecipes.filter(d =>
      !gameState.discoveredDrinks.has(d.id) && gameState.coffee >= d.discoveryCost
    ).length;
    let labBadge = labBtn.querySelector('.notification-badge');
    if (discoverable > 0 && !labBadge) {
      labBadge = document.createElement('div');
      labBadge.className = 'notification-badge';
      labBtn.appendChild(labBadge);
    } else if (discoverable === 0 && labBadge) {
      labBadge.remove();
    }
  }
}

// `force` re-renders hidden tabs too (used on init, import and tab switches)
function updateUI(force = false) {
  document.getElementById('coffeeDisplay').textContent = formatNumber(gameState.coffee);
  document.getElementById('cpsDisplay').textContent = formatNumber(calculateTotalCPS());
  document.getElementById('goldenCoffeeDisplay').textContent = gameState.goldenCoffee;
  document.getElementById('clickPowerDisplay').textContent = gameState.clickPower;

  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'brew';

  updateNotificationBadges();
  checkAchievements();
  if (force || activeTab === 'shop') {
    const sig = shopSignature();
    if (force || sig !== lastShopSignature) {
      renderShop();
      lastShopSignature = sig;
    }
  }
  if (force || activeTab === 'upgrades') renderUpgrades();
  if (force || activeTab === 'lab') renderLab();
  if (force || activeTab === 'prestige') renderPrestige();
  if (force || activeTab === 'achievements') renderAchievements();
}

// ═══ SHOP RENDERING ═══
// Signature of everything renderShop() displays. Rebuilding the shop DOM every
// second replaces the buy/sell buttons under the player's finger and swallows
// rapid (or mobile) taps, so updateUI() only re-renders when this changes.
let lastShopSignature = null;
function shopSignature() {
  const parts = [gameState.buyMode, gameState.sellMode];
  shopItems.forEach(item => {
    if (!isItemUnlocked(item)) return;
    const itemState = gameState.items[item.id] || { count: 0, cost: item.baseCost };
    const currentCount = itemState.count ?? 0;
    const affordableAmount = calculateAffordableAmount(item, currentCount, gameState.buyMode, gameState.coffee);
    const buyAmount = affordableAmount > 0 ? affordableAmount : gameState.buyMode;
    const totalCost = calculateBulkCost(item, currentCount, buyAmount);
    parts.push(item.id, currentCount, Math.floor(itemState.cost ?? item.baseCost),
      affordableAmount > 0, buyAmount, Math.floor(totalCost), currentCount > 0);
  });
  return parts.join('|');
}

function renderShop() {
  const container = document.getElementById('shopList');
  if (!container) return;
  container.innerHTML = '';

  shopItems.forEach(item => {
    if (!isItemUnlocked(item)) return;

    if (!gameState.items[item.id]) {
      gameState.items[item.id] = { count: 0, cost: item.baseCost };
    }

    const itemState = gameState.items[item.id];
    const currentCount = itemState.count ?? 0;
    const amount = gameState.buyMode;

    const affordableAmount = calculateAffordableAmount(item, currentCount, amount, gameState.coffee);
    // Buy button purchases what is affordable, so its cost tile must match it
    const buyAmount = affordableAmount > 0 ? affordableAmount : amount;
    const totalCost = calculateBulkCost(item, currentCount, buyAmount);
    const canAfford = affordableAmount > 0;

    const itemCPS = calculateItemCPS(item);
    const sellValue = calculateSellValue(item, currentCount);
    const canSell = currentCount > 0;

    const div = document.createElement('div');
    div.className = 'shop-item' + (canAfford ? ' affordable' : '');
    div.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-effect">Effect: +${formatNumber(itemCPS)} CPS each</div>
      </div>
      <div class="item-actions">
        <div class="quantity-display">${currentCount}</div>
        <div class="sell-section">
          <button class="sell-btn" data-item-id="${item.id}" ${!canSell ? 'disabled' : ''}>
            SELL x${gameState.sellMode}<br><span style="font-size: 0.8rem;">(${formatNumber(sellValue)} each)</span>
          </button>
        </div>
        <div class="buy-section">
          <button class="buy-btn" data-item-id="${item.id}" ${!canAfford ? 'disabled' : ''}>
            BUY ${buyAmount > 1 ? 'x' + buyAmount : ''}
          </button>
          <div class="cost-tile">${formatNumber(totalCost)} coffee</div>
        </div>
      </div>
    `;

    div.querySelector('.buy-btn').onclick = () => buyItem(item.id, gameState.buyMode);
    div.querySelector('.sell-btn').onclick = () => sellItem(item.id, gameState.sellMode);
    container.appendChild(div);
  });

  if (container.children.length === 0) {
    container.innerHTML = '<div class="empty-state">No items available yet. Keep brewing coffee to unlock shop items!</div>';
  }
}

// ═══ UPGRADES RENDERING ═══
let currentUpgradeTab = 'regular';

function renderUpgrades() {
  renderRegularUpgrades();
  renderGoldenUpgrades();
}

function renderRegularUpgrades() {
  const container = document.getElementById('upgradesList');
  if (!container) return;

  container.innerHTML = '';
  container.className = 'achievements-grid';

  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
  const onUpgradesTab = activeTab === 'upgrades';

  upgradePacks.forEach(pack => {
    const packUpgrades = upgrades.filter(u => u.pack === pack.id);
    if (packUpgrades.length === 0) return;

    const unlockedUpgrades = packUpgrades.filter(u => u.unlockCondition());
    if (unlockedUpgrades.length === 0) return;

    // Viewing the tab marks upgrades as seen; the tab badge (in
    // updateNotificationBadges) is what signals "new upgrades available"
    if (onUpgradesTab) {
      unlockedUpgrades.forEach(u => {
        if (!gameState.purchasedUpgrades.has(u.id)) {
          gameState.viewedUpgrades.add(u.id);
        }
      });
    }

    const purchasedUpgrades = packUpgrades.filter(u => gameState.purchasedUpgrades.has(u.id));
    const affordableUpgrades = unlockedUpgrades.filter(u =>
      !gameState.purchasedUpgrades.has(u.id) &&
      gameState.coffee >= u.cost
    );

    const isCollapsed = gameState.collapsedPacks.has(pack.id);
    const progressPercent = packUpgrades.length > 0 ? Math.round((purchasedUpgrades.length / packUpgrades.length) * 100) : 0;

    const packDiv = document.createElement('div');
    packDiv.className = 'upgrade-pack';

    const previewUpgrades = unlockedUpgrades.slice(0, 8);
    packDiv.innerHTML = `
      <div class="upgrade-pack-header">
        <div class="upgrade-pack-title">
          <span>${pack.name}</span>
        </div>
      </div>
      <div class="upgrade-pack-description">${pack.description}</div>
      <div class="progress" style="margin-bottom: 12px;">
        <div class="progress-bar" style="width: ${progressPercent}%; background: #d4a574;"></div>
      </div>
      <div class="upgrade-pack-preview">
        ${previewUpgrades.map(u => {
          const purchased = gameState.purchasedUpgrades.has(u.id);
          const affordable = !purchased && gameState.coffee >= u.cost && u.unlockCondition();
          return `<span class="upgrade-pack-badge" ${affordable ? 'title="Affordable" aria-label="Affordable"' : ''}>${purchased ? '[x]' : (affordable ? '[!]' : '[ ]')}</span>`;
        }).join('')}
        ${unlockedUpgrades.length > 8 ? '<span style="opacity: 0.6;">...</span>' : ''}
      </div>
      ${affordableUpgrades.length > 0 ? `<div style="color: #4CAF50; font-weight: 600; font-size: 0.9rem; margin-top: 8px;">${affordableUpgrades.length} affordable upgrade${affordableUpgrades.length !== 1 ? 's' : ''}</div>` : ''}
      <div class="upgrade-pack-toggle">${isCollapsed ? '▼ Click to expand' : '▲ Click to collapse'}</div>
    `;

    packDiv.onclick = (e) => {
      if (!e.target.closest('.upgrade-buy-btn')) {
        toggleUpgradePack(pack.id);
      }
    };

    const contentDiv = document.createElement('div');
    contentDiv.className = `upgrade-pack-content ${isCollapsed ? 'collapsed' : ''}`;

    unlockedUpgrades.forEach(upgrade => {
      const purchased = gameState.purchasedUpgrades.has(upgrade.id);
      const canAfford = gameState.coffee >= upgrade.cost && !purchased;

      const upgradeDiv = document.createElement('div');
      upgradeDiv.className = 'upgrade-item';
      if (canAfford) upgradeDiv.classList.add('affordable');
      if (purchased) upgradeDiv.classList.add('purchased');

      upgradeDiv.innerHTML = `
        <div class="upgrade-header">
          <div class="upgrade-name">${upgrade.name}</div>
          <div class="upgrade-status">${purchased ? '[OWNED]' : ''}</div>
        </div>
        <div class="upgrade-description">${upgrade.description}</div>
        <div class="upgrade-footer">
          <div class="cost-tile">${formatNumber(upgrade.cost)} coffee</div>
          <button class="upgrade-buy-btn" ${!canAfford || purchased ? 'disabled' : ''}>
            ${purchased ? 'PURCHASED' : 'BUY UPGRADE'}
          </button>
        </div>
      `;

      if (!purchased) {
        upgradeDiv.querySelector('.upgrade-buy-btn').onclick = (e) => {
          e.stopPropagation();
          buyUpgrade(upgrade.id);
        };
      }

      contentDiv.appendChild(upgradeDiv);
    });

    packDiv.appendChild(contentDiv);
    container.appendChild(packDiv);
  });

  if (container.children.length === 0) {
    container.innerHTML = '<div class="empty-state">No upgrades available yet. Keep brewing coffee and purchasing items to unlock upgrades!</div>';
  }
}

function renderGoldenUpgrades() {
  const container = document.getElementById('goldenUpgradesList');
  const progressContainer = document.getElementById('goldenCoffeeProgressContainer');
  if (!container || !progressContainer) return;

  container.innerHTML = '';
  progressContainer.innerHTML = renderGoldenCoffeeProgressCard();

  // Render ALL Golden Upgrades (always visible, regardless of unlock status)
  goldenUpgrades.forEach(upgrade => {
    const purchased = gameState.purchasedGoldenUpgrades.has(upgrade.id);
    const canAfford = gameState.goldenCoffee >= upgrade.cost && !purchased;
    const isLocked = !upgrade.unlockCondition();
    const isToggle = upgrade.type === 'toggle' && upgrade.setting;
    const toggleOn = isToggle ? gameState.settings[upgrade.setting] !== false : false;
    
    const upgradeDiv = document.createElement('div');
    upgradeDiv.className = 'upgrade-pack';
    upgradeDiv.style.background = purchased ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 215, 0, 0.05)';
    upgradeDiv.style.border = purchased ? '1px solid #4CAF50' : '1px solid rgba(255, 215, 0, 0.3)';
    
    upgradeDiv.innerHTML = `
      <div class="upgrade-pack-header" style="justify-content: space-between;">
        <div class="upgrade-pack-title">
          <span style="color: ${purchased ? '#4CAF50' : '#ffd700'};">${purchased ? '[x]' : '[*]'} ${upgrade.name}</span>
        </div>
        <div style="color: #ffd700; font-weight: 600; font-size: 14px;">
          ${upgrade.cost} Golden Coffee
        </div>
      </div>
      <div class="upgrade-pack-description">${upgrade.description}</div>
      ${isToggle && purchased ? `
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
          <span style="color: ${toggleOn ? '#4CAF50' : '#888'}; font-size: 12px; font-weight: 600;">${toggleOn ? 'ON' : 'OFF'}</span>
          <label class="switch" style="position: relative; display: inline-block; width: 46px; height: 24px;">
            <input type="checkbox" id="golden-toggle-${upgrade.id}" ${toggleOn ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
            <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${toggleOn ? '#4CAF50' : '#666'}; border-radius: 24px; transition: 0.2s;"></span>
          </label>
        </div>` : (upgrade.type === 'toggle' && purchased ? '<div style="color: #4CAF50; font-size: 12px; margin-top: 8px;">[x] Active</div>' : '')}
      ${isLocked ? '<div style="color: #888; font-size: 12px; margin-top: 8px;">[Locked] Need more Golden Coffee</div>' : ''}
      ${isToggle && purchased ? '' : `
      <div style="margin-top: 12px;">
        <button class="upgrade-buy-btn" 
                style="width: 100%; padding: 10px; background: ${purchased ? '#4CAF50' : (canAfford ? '#ffd700' : '#666')}; color: ${purchased ? '#fff' : '#1a1a2e'}; border: none; border-radius: 6px; font-weight: 600; cursor: ${purchased || !canAfford ? 'not-allowed' : 'pointer'};" 
                ${!canAfford || purchased ? 'disabled' : ''}>
          ${purchased ? 'PURCHASED' : (canAfford ? 'BUY UPGRADE' : 'NOT ENOUGH GOLDEN COFFEE')}
        </button>
      </div>`}
    `;
    
    if (isToggle && purchased) {
      const toggle = upgradeDiv.querySelector(`#golden-toggle-${upgrade.id}`);
      if (toggle) {
        toggle.onchange = () => {
          gameState.settings[upgrade.setting] = toggle.checked;
          saveSettings();
          saveGame();
          renderGoldenUpgrades();
        };
      }
    } else if (!purchased && canAfford) {
      upgradeDiv.querySelector('.upgrade-buy-btn').onclick = () => {
        buyGoldenUpgrade(upgrade.id);
      };
    }
    
    container.appendChild(upgradeDiv);
  });
}

// ═══ RESEARCH LAB RENDERING ═══
function describeDrinkEffect(drink) {
  const e = drink.effect;
  const parts = [];
  const fmt = (m) => m > 1 ? `+${Math.round((m - 1) * 100)}%` : `−${Math.round((1 - m) * 100)}%`;
  if (e.cps) parts.push({ text: `${fmt(e.cps)} CPS`, good: e.cps > 1 });
  if (e.click) parts.push({ text: `${fmt(e.click)} click power`, good: e.click > 1 });
  if (e.shopCost) parts.push(e.shopCost < 1
    ? { text: `−${Math.round((1 - e.shopCost) * 100)}% shop prices`, good: true }
    : { text: `+${Math.round((e.shopCost - 1) * 100)}% shop prices`, good: false });
  if (e.offline) parts.push({ text: `${fmt(e.offline)} offline earnings`, good: e.offline > 1 });
  return parts.map(p => `<span style="color: ${p.good ? '#4CAF50' : '#f44336'}; font-weight: 600;">${p.text}</span>`).join(' &nbsp;·&nbsp; ');
}

function renderLab() {
  const container = document.getElementById('labContent');
  if (!container) return;

  // Locked: the Research Lab building hasn't been purchased yet
  if (!gameState.purchasedGoldenUpgrades.has('research_lab')) {
    container.innerHTML = `
      <div class="upgrade-pack" style="background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(255, 215, 0, 0.3);">
        <div class="upgrade-pack-header">
          <div class="upgrade-pack-title">🔒 Research Lab</div>
        </div>
        <div class="upgrade-pack-description">The lab is dark. Purchase the <strong>Research Lab</strong> golden upgrade (3 Golden Coffee) to unlock it and start discovering drink recipes with powerful buffs — and risky debuffs.</div>
        <div style="margin-top: 12px;">
          <button class="upgrade-buy-btn" id="labLockedGotoGolden" style="width: 100%; padding: 10px; background: #ffd700; color: #1a1a2e; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
            VIEW GOLDEN UPGRADES
          </button>
        </div>
      </div>`;
    document.getElementById('labLockedGotoGolden').onclick = () => {
      document.querySelector('[data-tab="upgrades"]').click();
      switchUpgradeTab('golden');
    };
    return;
  }

  regenSwaps();

  // Swap status
  const now = Date.now();
  let nextIn = '';
  if (gameState.swapCharges < SWAP_MAX_CHARGES) {
    const ms = Math.max(0, swapRegenMs() - (now - (gameState.lastSwapRegen || now)));
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    nextIn = ` — next in ${m}:${String(s).padStart(2, '0')}`;
  }
  const dots = '●'.repeat(gameState.swapCharges) + '○'.repeat(SWAP_MAX_CHARGES - gameState.swapCharges);

  // Active drink flasks
  const maxActive = maxActiveDrinks();
  let activeHtml = '';
  for (let i = 0; i < maxActive; i++) {
    const id = gameState.activeDrinks[i];
    if (id) {
      const drink = drinkRecipes.find(d => d.id === id);
      if (!drink) continue;
      activeHtml += `
        <div class="upgrade-pack" style="background: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50;">
          <div class="upgrade-pack-header">
            <div class="upgrade-pack-title">🧪 ${drink.name} <span style="color: #4CAF50; font-size: 12px;">[BREWING]</span></div>
          </div>
          <div class="upgrade-pack-description">${drink.description}</div>
          <div style="margin: 8px 0; font-size: 14px;">${describeDrinkEffect(drink)}</div>
          <div style="margin-top: 12px;">
            <button class="upgrade-buy-btn" data-deactivate="${drink.id}" style="width: 100%; padding: 10px; background: #f44336; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
              POUR OUT (1 swap)
            </button>
          </div>
        </div>`;
    } else {
      activeHtml += `
        <div class="upgrade-pack" style="background: rgba(255, 255, 255, 0.02); border: 1px dashed #666;">
          <div class="upgrade-pack-description" style="text-align: center; padding: 20px 0;">Empty flask — activate a discovered drink below</div>
        </div>`;
    }
  }

  // Recipe book
  let recipesHtml = '';
  drinkRecipes.forEach(drink => {
    const discovered = gameState.discoveredDrinks.has(drink.id);
    const active = gameState.activeDrinks.includes(drink.id);
    let actionHtml = '';
    if (!discovered) {
      const afford = gameState.coffee >= drink.discoveryCost;
      actionHtml = `
        <button class="upgrade-buy-btn" data-discover="${drink.id}" ${afford ? '' : 'disabled'}
                style="width: 100%; padding: 10px; background: ${afford ? '#d4a574' : '#666'}; color: ${afford ? '#1a1a2e' : '#aaa'}; border: none; border-radius: 6px; font-weight: 600; cursor: ${afford ? 'pointer' : 'not-allowed'};">
          ${afford ? `DISCOVER — ${formatNumber(drink.discoveryCost)} coffee` : `NEED ${formatNumber(drink.discoveryCost)} coffee`}
        </button>`;
    } else if (active) {
      actionHtml = `
        <button class="upgrade-buy-btn" data-deactivate="${drink.id}"
                style="width: 100%; padding: 10px; background: #f44336; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
          POUR OUT (1 swap)
        </button>`;
    } else {
      const canSwap = gameState.swapCharges >= 1 && gameState.activeDrinks.length < maxActive;
      actionHtml = `
        <button class="upgrade-buy-btn" data-activate="${drink.id}" ${canSwap ? '' : 'disabled'}
                style="width: 100%; padding: 10px; background: ${canSwap ? '#4CAF50' : '#666'}; color: ${canSwap ? '#fff' : '#aaa'}; border: none; border-radius: 6px; font-weight: 600; cursor: ${canSwap ? 'pointer' : 'not-allowed'};">
          ACTIVATE (1 swap)
        </button>`;
    }
    recipesHtml += `
      <div class="upgrade-pack" style="background: ${discovered ? 'rgba(212, 165, 116, 0.08)' : 'rgba(255, 255, 255, 0.02)'}; border: 1px solid ${active ? '#4CAF50' : 'rgba(212, 165, 116, 0.3)'};">
        <div class="upgrade-pack-header">
          <div class="upgrade-pack-title">${discovered ? '📖' : '❓'} ${discovered ? drink.name : '???'}</div>
        </div>
        <div class="upgrade-pack-description">${discovered ? drink.description : 'An undiscovered recipe. Research it to reveal its effects.'}</div>
        ${discovered ? `<div style="margin: 8px 0; font-size: 14px;">${describeDrinkEffect(drink)}</div>` : ''}
        <div style="margin-top: 12px;">${actionHtml}</div>
      </div>`;
  });

  container.innerHTML = `
    <div class="upgrade-pack" style="background: rgba(33, 150, 243, 0.08); border: 1px solid rgba(33, 150, 243, 0.4);">
      <div class="upgrade-pack-header">
        <div class="upgrade-pack-title">🔄 Drink Swaps</div>
      </div>
      <div class="upgrade-pack-description">
        <span style="font-size: 18px; letter-spacing: 4px; color: #2196F3;">${dots}</span>
        <span style="margin-left: 8px;">${gameState.swapCharges}/${SWAP_MAX_CHARGES}${nextIn}</span><br>
        Activating or pouring out a drink costs 1 swap. Swaps regenerate over time.
      </div>
    </div>
    <h3 style="color: #d4a574; margin: 20px 0 12px;">Active Drinks (${gameState.activeDrinks.length}/${maxActive})</h3>
    <div class="achievements-grid">${activeHtml}</div>
    <h3 style="color: #d4a574; margin: 20px 0 12px;">Recipe Book (${gameState.discoveredDrinks.size}/${drinkRecipes.length})</h3>
    <div class="achievements-grid">${recipesHtml}</div>`;

  container.querySelectorAll('[data-discover]').forEach(btn => {
    btn.onclick = () => { if (discoverDrink(btn.dataset.discover)) updateUI(true); };
  });
  container.querySelectorAll('[data-activate]').forEach(btn => {
    btn.onclick = () => { if (setDrinkActive(btn.dataset.activate, true)) updateUI(true); };
  });
  container.querySelectorAll('[data-deactivate]').forEach(btn => {
    btn.onclick = () => { if (setDrinkActive(btn.dataset.deactivate, false)) updateUI(true); };
  });
}

function switchUpgradeTab(tab) {
  currentUpgradeTab = tab;
  
  // Update button styles
  document.querySelectorAll('.upgrade-tab-btn').forEach(btn => {
    const isActive = btn.dataset.upgradeTab === tab;
    btn.classList.toggle('active', isActive);
    btn.style.background = isActive ? '#d4a574' : 'rgba(212, 165, 116, 0.2)';
    btn.style.color = isActive ? '#1a1a2e' : '#d4a574';
  });
  
  // Show/hide content
  document.getElementById('regularUpgradesContent').style.display = tab === 'regular' ? 'block' : 'none';
  document.getElementById('goldenUpgradesContent').style.display = tab === 'golden' ? 'block' : 'none';
  
  // Re-render
  if (tab === 'regular') {
    renderRegularUpgrades();
  } else {
    renderGoldenUpgrades();
  }
}

function toggleUpgradePack(packId) {
  if (gameState.collapsedPacks.has(packId)) {
    gameState.collapsedPacks.delete(packId);
  } else {
    gameState.collapsedPacks.add(packId);
  }
  renderUpgrades();
  saveGame();
}

// ═══ PRESTIGE RENDERING ═══
function renderPrestige() {
  const container = document.getElementById('prestigeContent');
  if (!container) return;
  const goldenCoffeeToGain = prestigeGain();
  const newMultiplier = 1 + ((gameState.goldenCoffee + goldenCoffeeToGain) * 0.1);
  const canPrestige = goldenCoffeeToGain > 0;

  container.innerHTML = `
    <div class="prestige-container">
      <div class="prestige-info">
        <h3 style="color: #ffd700; font-size: 1.5rem; margin: 0 0 16px 0;">Golden Coffee System</h3>
        <p>Reset your progress to earn Golden Coffee for permanent production multipliers!</p>
        <div style="font-size: 2rem; font-weight: 700; color: #ffd700; margin: 16px 0;">
          Current Multiplier: ${gameState.prestigeMultiplier.toFixed(1)}x
        </div>
      </div>

      ${renderGoldenCoffeeProgressCard()}

      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p><strong>How it works:</strong></p>
        <p>• Every ${formatNumber(PRESTIGE_BASE_COST)} total coffee brewed = 1 Golden Coffee</p>
        <p>• The requirement for each additional Golden Coffee doubles (exponential scaling)</p>
        <p>• Each Golden Coffee gives +10% production (permanent!)</p>
        <p>• Prestiging resets coffee, items, and regular upgrades</p>
        <p>• Golden Coffee, multiplier, permanent CPS bonuses, golden upgrades and their automations are kept forever</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0;">
        <div style="background: rgba(255, 255, 255, 0.05); padding: 16px; border-radius: 12px;">
          <div style="opacity: 0.8; margin-bottom: 8px;">Total Coffee Brewed</div>
          <div style="font-size: 1.8rem; font-weight: 700; color: #ffd700;">${formatNumber(gameState.totalCoffeeAllTime)}</div>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 16px; border-radius: 12px;">
          <div style="opacity: 0.8; margin-bottom: 8px;">Golden Coffee to Gain</div>
          <div style="font-size: 1.8rem; font-weight: 700; color: #ffd700;">${goldenCoffeeToGain}</div>
        </div>
      </div>
      ${canPrestige ? `
        <div style="text-align: center; font-size: 1.2rem; color: #4CAF50; font-weight: 600; margin: 12px 0;">
          You will gain ${goldenCoffeeToGain} Golden Coffee!
        </div>
        <div style="text-align: center; font-size: 1.2rem; color: #4CAF50; font-weight: 600; margin: 12px 0;">
          New Multiplier: ${newMultiplier.toFixed(1)}x (from ${gameState.prestigeMultiplier.toFixed(1)}x)
        </div>
      ` : gameState.goldenCoffee >= MAX_GOLDEN_COFFEE ? `
        <div style="text-align: center; margin: 20px 0; font-size: 1.1rem; opacity: 0.8;">
          Maximum Golden Coffee reached (${MAX_GOLDEN_COFFEE})
        </div>
      ` : `
        <div style="text-align: center; margin: 20px 0; font-size: 1.1rem; opacity: 0.8;">
          Need ${formatNumber(Math.max(0, nextGoldenThreshold() - gameState.totalCoffeeAllTime))} more total coffee to prestige
          <br>Current: ${formatNumber(gameState.totalCoffeeAllTime)}
        </div>
      `}
      <button class="prestige-button" ${!canPrestige ? 'disabled' : ''}>
        ${canPrestige ? 'PRESTIGE NOW' : 'Not Enough Coffee Yet'}
      </button>
    </div>
  `;

  const btn = container.querySelector('.prestige-button');
  if (canPrestige && btn) {
    btn.onclick = doPrestige;
  }
}

// ═══ ACHIEVEMENTS RENDERING ═══
function renderAchievements() {
  const container = document.getElementById('achievementsList');
  if (!container) return;
  container.innerHTML = '';
  container.className = 'achievements-grid';
  
  const packs = getAchievementPacks();
  packs.forEach(pack => {
    const visibleAchievements = getVisibleAchievements(pack.achievements);
    
    if (visibleAchievements.length === 0) return;
    
    const earnedCount = pack.achievements.filter(a => a.earned).length;
    const totalCount = pack.achievements.length;
    const progressPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
    
    const unclaimedInPack = pack.achievements.filter(a => gameState.unclaimedAchievements.has(a.id)).length;
    
    const div = document.createElement('div');
    div.className = 'achievement-pack';
    
    const badgeHTML = unclaimedInPack > 0 ? `<div class="notification-badge">${unclaimedInPack}</div>` : '';
    
    div.innerHTML = `
      ${badgeHTML}
      <div class="pack-header">
        <div class="pack-title">${pack.title}</div>
      </div>
      <div class="pack-description">${pack.description}</div>
      <div class="progress" style="margin-bottom: 12px;">
        <div class="progress-bar" style="width: ${progressPercent}%; background: #4CAF50;"></div>
      </div>
      <div class="pack-preview">
        ${visibleAchievements.slice(0, 8).map(a => {
          const isUnclaimed = gameState.unclaimedAchievements.has(a.id);
          return `<span class="pack-badge">${a.earned ? (isUnclaimed ? '[!]' : '[x]') : '[ ]'}</span>`;
        }).join('')}
        ${visibleAchievements.length > 8 ? '<span style="opacity: 0.6;">...</span>' : ''}
      </div>
    `;
    
    div.onclick = () => openAchievementModal(pack);
    container.appendChild(div);
  });
}

// ═══ MODALS ═══
function openAchievementModal(pack) {
  const modal = document.getElementById('achievementModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalAchievements = document.getElementById('modalAchievements');
  
  modalTitle.textContent = pack.title;
  modalAchievements.innerHTML = '';
  
  const visibleAchievements = getVisibleAchievements(pack.achievements);
  
  visibleAchievements.forEach(a => {
    const isUnclaimed = gameState.unclaimedAchievements.has(a.id);
    const isClaimed = a.earned && !isUnclaimed;
    
    const div = document.createElement('div');
    
    if (isUnclaimed) {
      div.className = 'modal-achievement unlocked unclaimed';
    } else if (isClaimed) {
      div.className = 'modal-achievement claimed';
    } else {
      div.className = 'modal-achievement';
    }
    
    div.innerHTML = `
      <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">
        ${a.earned ? (isUnclaimed ? '[!]' : '[x]') : '[ ]'} ${a.name}
      </div>
      <div style="opacity: 0.9; margin-bottom: 8px; font-size: 0.9rem;">${a.requirement}</div>
      ${a.reward ? `<div class="achievement-reward">${getRewardText(a.reward)}${isUnclaimed ? ' - Click to claim!' : ''}</div>` : ''}
      <div class="progress">
        <div class="progress-bar" style="width: ${a.percent()}%; ${a.earned ? 'background: #4CAF50;' : ''}"></div>
      </div>
    `;
    
    if (isUnclaimed) {
      div.onclick = () => {
        claimAchievementReward(a);
        renderAchievements();
        updateNotificationBadges();
        openAchievementModal(pack);
      };
    }
    
    modalAchievements.appendChild(div);
  });
  
  modal.classList.remove('hidden');
}

function closeAchievementModal() {
  document.getElementById('achievementModal').classList.add('hidden');
}

function formatDuration(totalSeconds) {
  const seconds = Math.floor(totalSeconds);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  // Always show the two most significant units so short durations stay readable
  const parts = [];
  if (days > 0) parts.push(days + (days === 1 ? ' day' : ' days'));
  if (hours > 0) parts.push(hours + (hours === 1 ? ' hour' : ' hours'));
  if (minutes > 0) parts.push(minutes + (minutes === 1 ? ' minute' : ' minutes'));
  if (parts.length < 2 && secs > 0) parts.push(secs + (secs === 1 ? ' second' : ' seconds'));
  if (parts.length === 0) return '0 seconds';
  return parts.slice(0, 2).join(', ');
}

function showOfflineModal(info) {
  document.getElementById('offlineDuration').textContent = formatDuration(info.seconds);
  document.getElementById('offlineEarnings').textContent = formatNumber(info.earnings);
  document.getElementById('offlineCPS').textContent = formatNumber(info.cps);
  document.getElementById('offlineModal').classList.remove('hidden');
}

function closeOfflineModal() {
  document.getElementById('offlineModal').classList.add('hidden');
}

function openVersionInfo() {
  document.getElementById('versionModal').classList.remove('hidden');
}

function closeVersionInfo() {
  document.getElementById('versionModal').classList.add('hidden');
}

function openHelp() {
  document.getElementById('instructionsOverlay').classList.remove('hidden');
}

function closeInstructions() {
  document.getElementById('instructionsOverlay').classList.add('hidden');
}

function openSettingsModal() {
  // Update toggle states
  document.getElementById('numberDisplayToggle').checked = gameState.settings.numberDisplay === 'full';
  document.getElementById('notificationsToggle').checked = gameState.settings.notifications;
  document.getElementById('quickKeysToggle').checked = gameState.settings.quickKeys;
  document.getElementById('soundToggle').checked = gameState.settings.sound;

  // Clear export textarea
  document.getElementById('exportTextarea').value = '';

  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

// ═══ EVENT LISTENERS ═══
document.addEventListener('DOMContentLoaded', () => {
  // Coffee button click
  document.getElementById('coffeeButton').onclick = () => {
    const earned = gameState.clickPower * gameState.prestigeMultiplier * getDrinkMultipliers().click;
    gameState.coffee += earned;
    gameState.totalCoffeeAllTime += earned;

    playSfx('buttonclick');

    const btn = document.getElementById('coffeeButton');
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => btn.style.transform = 'scale(1)', 100);
  };

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.dataset.tab + 'Tab';
      document.getElementById(tabId).classList.add('active');

      updateUI(true);
      saveGame();
    };
  });

  // Mode selector
  document.querySelectorAll('.buy-mode-btn').forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      document.querySelectorAll(`.buy-mode-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (type === 'sell') {
        gameState.sellMode = parseInt(btn.dataset.mode);
      } else {
        gameState.buyMode = parseInt(btn.dataset.mode);
      }
      saveGame();
      renderShop();
      lastShopSignature = shopSignature();
    };
  });

  // Upgrade tab switching
  document.querySelectorAll('.upgrade-tab-btn').forEach(btn => {
    btn.onclick = () => {
      const tab = btn.dataset.upgradeTab;
      switchUpgradeTab(tab);
    };
  });

  // Keyboard shortcuts (only when quick keys are enabled and the user is
  // not typing in a text field)
  document.addEventListener('keydown', (e) => {
    if (!gameState.settings.quickKeys) return;
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const tabs = ['brew', 'shop', 'upgrades', 'lab', 'prestige', 'achievements'];
    const index = parseInt(e.key) - 1;

    if (index >= 0 && index < tabs.length) {
      const btn = document.querySelector(`[data-tab="${tabs[index]}"]`);
      if (btn) btn.click();
    }
  });

  // Modal controls
  document.getElementById('helpBtn').onclick = openHelp;
  document.getElementById('infoBtn').onclick = openVersionInfo;
  document.getElementById('settingsBtn').onclick = openSettingsModal;
  document.getElementById('startGameBtn').onclick = closeInstructions;
  document.getElementById('closeVersionModal').onclick = closeVersionInfo;
  document.getElementById('closeAchievementModal').onclick = closeAchievementModal;
  document.getElementById('closeSettingsModal').onclick = closeSettingsModal;
  document.getElementById('closeOfflineModal').onclick = closeOfflineModal;
  document.getElementById('offlineContinueBtn').onclick = closeOfflineModal;

  document.getElementById('offlineModal').onclick = (e) => {
    if (e.target.id === 'offlineModal') {
      closeOfflineModal();
    }
  };

  document.getElementById('achievementModal').onclick = (e) => {
    if (e.target.id === 'achievementModal') {
      closeAchievementModal();
    }
  };

  document.getElementById('versionModal').onclick = (e) => {
    if (e.target.id === 'versionModal') {
      closeVersionInfo();
    }
  };

  document.getElementById('settingsModal').onclick = (e) => {
    if (e.target.id === 'settingsModal') {
      closeSettingsModal();
    }
  };

  document.getElementById('instructionsOverlay').onclick = (e) => {
    if (e.target.id === 'instructionsOverlay') {
      closeInstructions();
    }
  };

  // Settings controls
  document.getElementById('numberDisplayToggle').addEventListener('change', (e) => {
    gameState.settings.numberDisplay = e.target.checked ? 'full' : 'abbreviated';
    saveSettings();
    updateUI();
  });

  document.getElementById('notificationsToggle').addEventListener('change', (e) => {
    gameState.settings.notifications = e.target.checked;
    saveSettings();
  });

  document.getElementById('quickKeysToggle').addEventListener('change', (e) => {
    gameState.settings.quickKeys = e.target.checked;
    saveSettings();
  });

  document.getElementById('soundToggle').addEventListener('change', (e) => {
    gameState.settings.sound = e.target.checked;
    saveSettings();
  });

  document.getElementById('exportSaveBtn').onclick = () => {
    const saveString = exportSave();
    document.getElementById('exportTextarea').value = saveString;
    // Copy to clipboard if supported
    if (navigator.clipboard) {
      navigator.clipboard.writeText(saveString).catch(err => {
        console.log('Failed to copy to clipboard:', err);
      });
    }
  };

  document.getElementById('importSaveBtn').onclick = () => {
    const importString = document.getElementById('importTextarea').value.trim();
    if (importString) {
      if (importSave(importString)) {
        document.getElementById('importTextarea').value = '';
        alert('Save imported successfully!');
        closeSettingsModal();
        updateUI(true);
      } else {
        alert('Failed to import save. Please check the format.');
      }
    }
  };

  document.getElementById('eraseProgressBtn').onclick = eraseProgress;

  // ═══ GAME LOOP ═══
  // Coffee accrues from real elapsed time, so throttled background tabs and
  // missed ticks never under-credit production.
  let lastTickTime = Date.now();
  let hiddenStartTime = null;

  setInterval(() => {
    const now = Date.now();
    // While hidden, production pauses here and is credited in full on return
    // (see the visibilitychange handler). Throttled background ticks must not
    // dribble out partial, clamped credit for the hidden period.
    if (document.hidden) {
      lastTickTime = now;
      return;
    }
    const elapsedSeconds = Math.min((now - lastTickTime) / 1000, 60); // clamp huge pauses
    lastTickTime = now;

    const totalCPS = calculateTotalCPS();
    if (totalCPS > 0 && elapsedSeconds > 0) {
      const earned = totalCPS * elapsedSeconds;
      gameState.coffee += earned;
      gameState.totalCoffeeAllTime += earned;
    }

    // Fast, cheap status readout every tick
    document.getElementById('coffeeDisplay').textContent = formatNumber(gameState.coffee);
    document.getElementById('cpsDisplay').textContent = formatNumber(totalCPS);
  }, 100);

  // Automation + full UI refresh (once per second)
  let lastAutomationTime = 0;
  setInterval(() => {
    const now = Date.now();
    if (now - lastAutomationTime >= 500) {
      runAutomation();
      lastAutomationTime = now;
    }
    regenSwaps();
    updateUI();
  }, 1000);

  // Auto-save (every 30 seconds)
  setInterval(() => {
    saveGame();
  }, 30000);

  // Save the moment the player leaves so offline earnings are accurate
  window.addEventListener('beforeunload', saveGame);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      hiddenStartTime = Date.now();
      saveGame();
    } else if (document.visibilityState === 'visible') {
      // Credit the hidden period like offline earnings (capped at 24h).
      // The game loop paused production while hidden, so nothing double-counts.
      if (hiddenStartTime !== null) {
        const elapsedSeconds = Math.min((Date.now() - hiddenStartTime) / 1000, MAX_OFFLINE_SECONDS);
        hiddenStartTime = null;
        const cps = calculateTotalCPS();
        if (elapsedSeconds >= 1 && cps > 0) {
          const earnings = cps * elapsedSeconds * getDrinkMultipliers().offline;
          gameState.coffee += earnings;
          gameState.totalCoffeeAllTime += earnings;
          if (elapsedSeconds >= 60) {
            showNotification('Welcome Back!', `+${formatNumber(earnings)} coffee earned while away`, 'default');
          }
          saveGame();
          updateUI();
        }
      }
    }
  });

  // ═══ MULTI-TAB SESSION ═══
  // The newest tab wins: it claims the session key, and any older tab that sees
  // the claim stands down (stops saving) so it can't overwrite real progress.
  const TAB_SESSION_ID = 'tab-' + Math.random().toString(36).slice(2) + '-' + Date.now();
  const TAB_SESSION_KEY = 'coffeeTycoonActiveTab';

  function claimTabSession() {
    try {
      localStorage.setItem(TAB_SESSION_KEY, JSON.stringify({ id: TAB_SESSION_ID, time: Date.now() }));
    } catch (e) { /* storage unavailable — behaves as a single tab */ }
  }

  function showTabSupersededBanner() {
    if (document.getElementById('tabSupersededBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'tabSupersededBanner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#b3541e;color:#fff;' +
      'text-align:center;padding:10px 16px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,.4);';
    banner.textContent = '⏸ Paused — this game is open in another tab. Only the newest tab saves progress. Reload this tab to take over.';
    document.body.prepend(banner);
  }

  window.addEventListener('storage', (e) => {
    if (e.key !== TAB_SESSION_KEY || !e.newValue) return;
    try {
      const claim = JSON.parse(e.newValue);
      if (claim.id !== TAB_SESSION_ID && isPrimaryTab) {
        isPrimaryTab = false;
        showTabSupersededBanner();
        showNotification('Paused', 'Game opened in another tab — this tab stopped saving.', 'default');
      }
    } catch (err) { /* ignore malformed claims */ }
  });

  claimTabSession();

  // ═══ GAME INITIALIZATION ═══
  const hasExistingSave = loadGame();
  loadSettings();
  // Automation flags must match owned upgrades (an imported save must not
  // inherit auto-buy from this browser's standalone settings).
  reconcileAutomationSettings();
  initSfx();

  // Show offline earnings earned while the game was closed
  if (pendingOfflineEarnings) {
    showOfflineModal(pendingOfflineEarnings);
    pendingOfflineEarnings = null;
  }

  // Update mode button display (exactly one active per type)
  document.querySelectorAll('.buy-mode-btn').forEach(btn => {
    const type = btn.dataset.type;
    const mode = parseInt(btn.dataset.mode);
    btn.classList.toggle('active',
      (type === 'sell' && mode === gameState.sellMode) ||
      (type === 'buy' && mode === gameState.buyMode));
  });

  if (!hasExistingSave) {
    document.getElementById('instructionsOverlay').classList.remove('hidden');
  }

  updateUI(true);
});