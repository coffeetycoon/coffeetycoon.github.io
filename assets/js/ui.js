/* ═══════════════════════════════════════════════════════════════════════════
   COFFEE TYCOON v1.18 - UI & NOTIFICATIONS
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

  // Roastery: badge when the player can do something right now — buy beans,
  // roast a blend, or activate a blend while none is active
  const roasteryBtn = document.querySelector('[data-tab="roastery"]');
  if (roasteryBtn && gameState.purchasedGoldenUpgrades.has('roastery')) {
    const canBuyBeans = gameState.coffee >= beanCost(1);
    const canRoast = blendRecipes.some(b => gameState.beans >= roastBeanCost(b));
    const canActivate = !gameState.activeBlend && blendRecipes.some(b => (gameState.blends[b.id] || 0) > 0);
    const actionable = (canBuyBeans || canRoast || canActivate) ? 1 : 0;
    let roasteryBadge = roasteryBtn.querySelector('.notification-badge');
    if (actionable > 0 && !roasteryBadge) {
      roasteryBadge = document.createElement('div');
      roasteryBadge.className = 'notification-badge';
      roasteryBtn.appendChild(roasteryBadge);
    } else if (actionable === 0 && roasteryBadge) {
      roasteryBadge.remove();
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
  renderStormBanner();
  renderActiveEffectsStrip();
  if (force || activeTab === 'shop') {
    const sig = shopSignature();
    if (force || sig !== lastShopSignature) {
      renderShop();
      lastShopSignature = sig;
    }
  }
  if (force || activeTab === 'upgrades') renderUpgrades();
  if (force || activeTab === 'lab') renderLab();
  if (force || activeTab === 'roastery') renderRoastery();
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

// ═══ ROASTERY RENDERING (v1.16) ═══
function renderRoastery() {
  const container = document.getElementById('roasteryContent');
  if (!container) return;

  // Locked: the Roastery building hasn't been purchased yet
  if (!gameState.purchasedGoldenUpgrades.has('roastery')) {
    container.innerHTML = `
      <div class="upgrade-pack" style="background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(255, 215, 0, 0.3);">
        <div class="upgrade-pack-header">
          <div class="upgrade-pack-title">🔒 Roastery</div>
        </div>
        <div class="upgrade-pack-description">The roasters are cold. Purchase the <strong>Roastery</strong> golden upgrade (8 Golden Coffee) to unlock it: buy green beans, roast them into blends, and activate blends for temporary global boosts.</div>
        <div style="margin-top: 12px;">
          <button class="upgrade-buy-btn" id="roasteryLockedGotoGolden" style="width: 100%; padding: 10px; background: #ffd700; color: #1a1a2e; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
            VIEW GOLDEN UPGRADES
          </button>
        </div>
      </div>`;
    document.getElementById('roasteryLockedGotoGolden').onclick = () => {
      document.querySelector('[data-tab="upgrades"]').click();
      switchUpgradeTab('golden');
    };
    return;
  }

  tickBlendExpiry();

  // Active blend panel
  const active = gameState.activeBlend;
  let activeHtml = '';
  if (active) {
    const blend = blendRecipes.find(b => b.id === active.id);
    const remaining = Math.max(0, active.expiresAt - Date.now());
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    activeHtml = `
      <div class="upgrade-pack" style="background: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50;">
        <div class="upgrade-pack-header">
          <div class="upgrade-pack-title">🔥 ${blend.name} <span style="color: #4CAF50; font-size: 12px;">[BREWING]</span></div>
        </div>
        <div class="upgrade-pack-description">${describeBlendEffect(blend)}</div>
        <div style="margin-top: 8px; font-size: 1.2rem; font-weight: 700;">⏱ ${m}:${String(s).padStart(2, '0')} remaining</div>
      </div>`;
  } else {
    activeHtml = `
      <div class="upgrade-pack" style="background: rgba(255, 255, 255, 0.02); border: 1px dashed #666;">
        <div class="upgrade-pack-description" style="text-align: center; padding: 20px 0;">No blend active — roast beans and activate a blend below</div>
      </div>`;
  }

  // Green bean purchasing
  const beanBtns = [1, 10, 100].map(n => {
    const cost = beanCost(n);
    const afford = gameState.coffee >= cost;
    return `
      <button class="upgrade-buy-btn" data-buy-beans="${n}" ${afford ? '' : 'disabled'}
              style="flex: 1; padding: 10px; background: ${afford ? '#d4a574' : '#666'}; color: ${afford ? '#1a1a2e' : '#aaa'}; border: none; border-radius: 6px; font-weight: 600; cursor: ${afford ? 'pointer' : 'not-allowed'};">
        BUY ×${n}<br><span style="font-size: 12px;">${formatNumber(cost)} ☕</span>
      </button>`;
  }).join('');

  // Blend roasting cards
  let blendsHtml = '';
  blendRecipes.forEach(blend => {
    const cost = roastBeanCost(blend);
    const canRoast = gameState.beans >= cost;
    const owned = gameState.blends[blend.id] || 0;
    const discounted = gameState.purchasedGoldenUpgrades.has('master_roaster');
    blendsHtml += `
      <div class="upgrade-pack" style="background: rgba(212, 165, 116, 0.08); border: 1px solid rgba(212, 165, 116, 0.3);">
        <div class="upgrade-pack-header">
          <div class="upgrade-pack-title">🫘 ${blend.name} ${owned > 0 ? `<span style="color: #4CAF50; font-size: 14px;">(×${owned})</span>` : ''}</div>
        </div>
        <div class="upgrade-pack-description">${blend.description}</div>
        <div style="margin: 8px 0; font-size: 14px;">${describeBlendEffect(blend)}</div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="upgrade-buy-btn" data-roast="${blend.id}" ${canRoast ? '' : 'disabled'}
                  style="flex: 1; padding: 10px; background: ${canRoast ? '#d4a574' : '#666'}; color: ${canRoast ? '#1a1a2e' : '#aaa'}; border: none; border-radius: 6px; font-weight: 600; cursor: ${canRoast ? 'pointer' : 'not-allowed'};">
            ROAST — ${cost} bean${cost !== 1 ? 's' : ''}${discounted ? ' ★' : ''}
          </button>
          <button class="upgrade-buy-btn" data-activate-blend="${blend.id}" ${owned > 0 ? '' : 'disabled'}
                  style="flex: 1; padding: 10px; background: ${owned > 0 ? '#4CAF50' : '#666'}; color: ${owned > 0 ? '#fff' : '#aaa'}; border: none; border-radius: 6px; font-weight: 600; cursor: ${owned > 0 ? 'pointer' : 'not-allowed'};">
            ACTIVATE
          </button>
        </div>
      </div>`;
  });

  const doubleBatch = gameState.purchasedGoldenUpgrades.has('double_batch');
  container.innerHTML = `
    <h3 style="color: #d4a574; margin: 0 0 12px;">Active Blend</h3>
    <div class="achievements-grid">${activeHtml}</div>
    <h3 style="color: #d4a574; margin: 20px 0 12px;">Green Beans</h3>
    <div class="upgrade-pack" style="background: rgba(139, 90, 43, 0.12); border: 1px solid rgba(139, 90, 43, 0.5);">
      <div class="upgrade-pack-header">
        <div class="upgrade-pack-title">🫘 Bean Stock: ${gameState.beans}</div>
      </div>
      <div class="upgrade-pack-description">
        Lifetime purchased: ${formatNumber(gameState.lifetimeBeans)}<br>
        Beans start at 1B coffee each and get 1.15× more expensive per bean bought.
      </div>
      <div style="display: flex; gap: 8px; margin-top: 12px;">${beanBtns}</div>
    </div>
    <h3 style="color: #d4a574; margin: 20px 0 12px;">Roast Blends${doubleBatch ? ' <span style="font-size: 12px; color: #ffd700;">(Double Batch: 2 per roast!)</span>' : ''}</h3>
    <div class="upgrade-pack-description" style="margin-bottom: 12px;">Activating a blend consumes 1 from your stock and replaces any active blend.</div>
    <div class="achievements-grid">${blendsHtml}</div>`;

  container.querySelectorAll('[data-buy-beans]').forEach(btn => {
    btn.onclick = () => { if (buyBeans(parseInt(btn.dataset.buyBeans))) updateUI(true); };
  });
  container.querySelectorAll('[data-roast]').forEach(btn => {
    btn.onclick = () => { if (roastBlend(btn.dataset.roast)) updateUI(true); };
  });
  container.querySelectorAll('[data-activate-blend]').forEach(btn => {
    btn.onclick = () => { if (activateBlend(btn.dataset.activateBlend)) updateUI(true); };
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

// ═══ SUPER COFFEE SPAWNING (v1.17) ═══
// One spawn on screen at a time. core.js rolls the dice (rollSuperSpawns);
// this module owns the button DOM.
let superSpawnEl = null;
let superSpawnType = null;
let superSpawnDespawnAt = 0;

function uiSuperSpawnActive() {
  return !!superSpawnEl;
}

function clearSuperSpawn() {
  if (superSpawnEl) {
    superSpawnEl.remove();
    superSpawnEl = null;
    superSpawnType = null;
  }
}

function spawnSuperCoffee(type) {
  clearSuperSpawn();
  const layer = document.getElementById('superCoffeeLayer');
  if (!layer) return;

  const btn = document.createElement('button');
  btn.className = 'super-spawn-btn';
  const labels = {
    super: { emoji: '☕', title: 'Super Coffee! Click for a bonus!' },
    golden: { emoji: '✨', title: `Golden Super Coffee! Costs ${GOLDEN_SUPER_COST} Golden Coffee — click to buy a powerful buff!` },
    mystery: { emoji: '❓', title: 'Mystery Coffee Beans! Click for a rare boost!' }
  };
  const label = labels[type] || labels.super;
  btn.textContent = label.emoji;
  btn.title = label.title;
  btn.setAttribute('aria-label', label.title);
  if (type === 'golden') btn.classList.add('golden');
  if (type === 'mystery') btn.classList.add('mystery');

  // Random spot on screen, kept clear of the edges
  const pad = 100;
  const x = pad + Math.random() * Math.max(1, window.innerWidth - pad * 2);
  const y = pad + Math.random() * Math.max(1, window.innerHeight - pad * 2);
  btn.style.left = `${x - 42}px`;
  btn.style.top = `${y - 42}px`;

  const despawnMs = type === 'golden' ? GOLDEN_SUPER_DESPAWN_MS : SUPER_DESPAWN_MS;
  superSpawnDespawnAt = Date.now() + despawnMs;

  btn.onclick = () => {
    if (type === 'super') {
      collectSuperCoffee();
    } else if (type === 'mystery') {
      collectMysteryBean();
    } else if (type === 'golden') {
      if (confirm(`Buy a Golden Super Coffee for ${GOLDEN_SUPER_COST} Golden Coffee?\n\nGrants 3× CPS for 5 minutes!`)) {
        buyGoldenSuperCoffee();
      } else {
        return; // keep the button on screen if they cancel
      }
    }
    clearSuperSpawn();
    updateUI(true);
  };

  layer.appendChild(btn);
  superSpawnEl = btn;
  superSpawnType = type;
}

// Per-second maintenance: despawn expired buttons, roll new spawns,
// prune expired effects.
function tickSuperCoffee() {
  if (superSpawnEl && Date.now() >= superSpawnDespawnAt) {
    clearSuperSpawn();
  }
  pruneSuperEffects();
  const spawn = rollSuperSpawns();
  if (spawn) spawnSuperCoffee(spawn);
}

// Storm banner + active effects strip (brew tab)
function renderStormBanner() {
  const banner = document.getElementById('stormBanner');
  if (!banner) return;
  const storm = gameState.storm;
  if (storm && storm.expiresAt > Date.now()) {
    const s = Math.ceil((storm.expiresAt - Date.now()) / 1000);
    banner.classList.remove('hidden');
    banner.textContent = `⛈ COFFEE STORM — all CPS ×${storm.mult} for ${s}s!`;
  } else {
    banner.classList.add('hidden');
    banner.textContent = '';
  }
}

function renderActiveEffectsStrip() {
  const strip = document.getElementById('activeEffectsStrip');
  if (!strip) return;
  const now = Date.now();
  let html = '';

  if (gameState.storm && gameState.storm.expiresAt > now) {
    const s = Math.ceil((gameState.storm.expiresAt - now) / 1000);
    html += `<span class="effect-chip storm">⛈ Storm ×${gameState.storm.mult} CPS (${s}s)</span>`;
  }
  for (const fx of gameState.superEffects) {
    if (fx.expiresAt <= now) continue;
    const s = Math.ceil((fx.expiresAt - now) / 1000);
    const golden = fx.label === 'Golden Brew' ? ' golden' : '';
    html += `<span class="effect-chip${golden}">${fx.kind === 'cps' ? '☕' : '👆'} ${fx.label} ×${fx.mult} (${s}s)</span>`;
  }
  if (gameState.activeBlend && gameState.activeBlend.expiresAt > now) {
    const blend = blendRecipes.find(b => b.id === gameState.activeBlend.id);
    const s = Math.ceil((gameState.activeBlend.expiresAt - now) / 1000);
    if (blend) html += `<span class="effect-chip">🔥 ${blend.name} (${s}s)</span>`;
  }
  strip.innerHTML = html;
  strip.style.display = html ? 'flex' : 'none';
}

// ═══ STATS WINDOW (v1.18) ═══
function fmtExact(v) {
  if (!isFinite(v)) return '0';
  if (Math.abs(v) >= 1000) return Math.floor(v).toLocaleString('en-US');
  return (Math.round(v * 10) / 10).toLocaleString('en-US');
}

function fmtDuration(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

function fmtClock(t) {
  return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function openStatsModal() {
  document.getElementById('statsModal').classList.remove('hidden');
  renderStatsActiveTab();
}

function closeStatsModal() {
  document.getElementById('statsModal').classList.add('hidden');
  hideChartTooltip();
}

function switchStatsTab(name) {
  document.querySelectorAll('.stats-tab').forEach(b => b.classList.toggle('active', b.dataset.statsTab === name));
  document.querySelectorAll('.stats-pane').forEach(p => p.classList.toggle('hidden', p.id !== `stats-${name}`));
  renderStatsActiveTab();
}

function renderStatsActiveTab() {
  const active = document.querySelector('.stats-tab.active');
  const name = active ? active.dataset.statsTab : 'overview';
  if (name === 'overview') renderStatsOverview();
  else if (name === 'production') renderStatsProduction();
  else if (name === 'buildings') renderStatsBuildings();
  else if (name === 'multipliers') renderStatsMultipliers();
  else if (name === 'lifetime') renderStatsLifetime();
}

function renderStatsOverview() {
  const el = document.getElementById('stats-overview');
  const s = ensureStats();
  const cps = calculateTotalCPS();
  const played = s.startedAt ? fmtDuration(Date.now() - s.startedAt) : '—';
  el.innerHTML = `
    <div class="stats-cards">
      <div class="stats-card"><div class="card-label">Total Coffee</div><div class="card-value" title="${fmtExact(gameState.totalCoffeeAllTime)}">${formatNumber(gameState.totalCoffeeAllTime)}</div></div>
      <div class="stats-card"><div class="card-label">CPS</div><div class="card-value" title="${fmtExact(cps)}">${formatNumber(cps)}</div></div>
      <div class="stats-card"><div class="card-label">Golden Coffee</div><div class="card-value" title="${fmtExact(gameState.goldenCoffee)}">${formatNumber(gameState.goldenCoffee)}</div></div>
    </div>
    <div class="stats-mini-grid">
      <div class="stats-mini"><span class="mini-label">Time played</span><span class="mini-value">${played}</span></div>
      <div class="stats-mini"><span class="mini-label">Manual clicks</span><span class="mini-value">${fmtExact(s.totalClicks)}</span></div>
      <div class="stats-mini"><span class="mini-label">Prestiges</span><span class="mini-value">${fmtExact(s.totalPrestiges)}</span></div>
      <div class="stats-mini"><span class="mini-label">Max CPS</span><span class="mini-value" title="${fmtExact(s.maxCPS)}">${formatNumber(s.maxCPS)}</span></div>
    </div>`;
}

// --- Canvas charts ---
function hideChartTooltip() {
  document.getElementById('chartTooltip').classList.add('hidden');
}

function showChartTooltip(x, y, timeHtml, valueHtml) {
  const tt = document.getElementById('chartTooltip');
  tt.innerHTML = `<div class="tt-time">${timeHtml}</div><div class="tt-value">${valueHtml}</div>`;
  tt.classList.remove('hidden');
  const pad = 14;
  tt.style.left = `${Math.min(x + pad, window.innerWidth - tt.offsetWidth - 8)}px`;
  tt.style.top = `${Math.max(y - tt.offsetHeight - pad, 8)}px`;
}

// points: [{ t, v }]. Draws a filled line chart; hover shows exact values.
function drawLineChart(canvas, points, color) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  canvas._chartPoints = points;
  const padL = 8, padR = 8, padT = 12, padB = 22;
  if (!points.length) {
    ctx.fillStyle = '#9a8a70';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Not enough data yet — the timeline samples every 30 seconds.', W / 2, H / 2);
    return;
  }
  let min = Infinity, max = -Infinity;
  points.forEach(p => { if (p.v < min) min = p.v; if (p.v > max) max = p.v; });
  if (max === min) { max = min * 1.1 + 1; min = Math.max(0, min * 0.9 - 1); }
  const span = max - min || 1;
  const x = i => padL + (i / Math.max(1, points.length - 1)) * (W - padL - padR);
  const y = v => padT + (1 - (v - min) / span) * (H - padT - padB);

  // fill
  ctx.beginPath();
  ctx.moveTo(x(0), y(points[0].v));
  points.forEach((p, i) => ctx.lineTo(x(i), y(p.v)));
  ctx.lineTo(x(points.length - 1), H - padB);
  ctx.lineTo(x(0), H - padB);
  ctx.closePath();
  ctx.fillStyle = color + '22';
  ctx.fill();
  // line
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(x(i), y(p.v)) : ctx.moveTo(x(i), y(p.v)));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  // axis labels
  ctx.fillStyle = '#9a8a70';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(fmtClock(points[0].t), padL, H - 6);
  ctx.textAlign = 'right';
  ctx.fillText(fmtClock(points[points.length - 1].t), W - padR, H - 6);
  ctx.textAlign = 'left';
  ctx.fillText(formatNumber(max), padL, padT);
  canvas._chartGeom = { x, y, padL, padR, padT, padB, W, H };
}

function attachLineHover(canvas, valueLabel) {
  canvas.onmousemove = (e) => {
    const pts = canvas._chartPoints, g = canvas._chartGeom;
    if (!pts || !pts.length) return;
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (canvas.width / r.width);
    let best = 0, bd = Infinity;
    pts.forEach((p, i) => { const d = Math.abs(g.x(i) - mx); if (d < bd) { bd = d; best = i; } });
    const p = pts[best];
    const rect = canvas.getBoundingClientRect();
    showChartTooltip(e.clientX, e.clientY, fmtClock(p.t), `${valueLabel}: ${fmtExact(p.v)}`);
    // crosshair
    const ctx = canvas.getContext('2d');
    drawLineChart(canvas, pts, canvas._chartColor);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(g.x(best), g.padT);
    ctx.lineTo(g.x(best), g.H - g.padB);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  canvas.onmouseleave = hideChartTooltip;
}

function renderStatsProduction() {
  const s = ensureStats();
  const cpsPts = s.history.map(h => ({ t: h[0], v: h[1] }));
  const cofPts = s.history.map(h => ({ t: h[0], v: h[2] }));
  const cpsCanvas = document.getElementById('cpsChart');
  const cofCanvas = document.getElementById('coffeeChart');
  cpsCanvas._chartColor = '#ffd700';
  cofCanvas._chartColor = '#d4a574';
  drawLineChart(cpsCanvas, cpsPts, '#ffd700');
  drawLineChart(cofCanvas, cofPts, '#d4a574');
  attachLineHover(cpsCanvas, 'CPS');
  attachLineHover(cofCanvas, 'Total coffee');
  document.getElementById('historyNote').textContent =
    s.history.length ? `Showing ${s.history.length} sample${s.history.length === 1 ? '' : 's'} — one every 30 seconds, up to 8 hours of history.` : '';
}

// bars: [{ label, value }]. Horizontal bar chart; hover shows exact values.
function drawBarChart(canvas, bars) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const owned = bars.filter(b => b.value > 0);
  canvas._barData = owned;
  if (!owned.length) {
    ctx.fillStyle = '#9a8a70';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No production yet — buy buildings in the Shop.', W / 2, H / 2);
    return;
  }
  const max = Math.max(...owned.map(b => b.value));
  const rowH = Math.min(30, (H - 16) / owned.length);
  const labelW = 150, padR = 70;
  canvas._barGeom = { rowH, labelW, padR, W, H };
  owned.forEach((b, i) => {
    const y = 8 + i * rowH;
    ctx.fillStyle = '#e8d5b5';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(b.label, labelW - 8, y + rowH / 2 + 4);
    const bw = (b.value / max) * (W - labelW - padR);
    const grad = ctx.createLinearGradient(labelW, 0, labelW + bw, 0);
    grad.addColorStop(0, '#8a5a2b');
    grad.addColorStop(1, '#d4a574');
    ctx.fillStyle = grad;
    ctx.fillRect(labelW, y + 4, Math.max(2, bw), rowH - 8);
    ctx.fillStyle = '#9a8a70';
    ctx.textAlign = 'left';
    ctx.fillText(formatNumber(b.value), labelW + bw + 6, y + rowH / 2 + 4);
  });
  canvas.onmousemove = (e) => {
    const g = canvas._barGeom, data = canvas._barData;
    if (!g || !data) return;
    const r = canvas.getBoundingClientRect();
    const my = (e.clientY - r.top) * (canvas.height / r.height);
    const i = Math.floor((my - 8) / g.rowH);
    if (i < 0 || i >= data.length) { hideChartTooltip(); return; }
    showChartTooltip(e.clientX, e.clientY, data[i].label, `CPS: ${fmtExact(data[i].value)}`);
  };
  canvas.onmouseleave = hideChartTooltip;
}

function renderStatsBuildings() {
  const filter = (document.getElementById('buildingFilter').value || '').toLowerCase();
  const { total, perItem } = calculateCPSBreakdown();
  const s = ensureStats();
  const tbody = document.querySelector('#buildingsTable tbody');
  const rows = shopItems
    .map(item => {
      const count = gameState.items[item.id] ? (gameState.items[item.id].count ?? 0) : 0;
      const cps = perItem[item.id] || 0;
      return { item, count, cps };
    })
    .filter(r => r.count > 0 || r.cps > 0)
    .filter(r => !filter || r.item.name.toLowerCase().includes(filter))
    .sort((a, b) => b.cps - a.cps);
  tbody.innerHTML = rows.map(r => {
    const share = total > 0 ? (r.cps / total * 100) : 0;
    const life = s.coffeeByBuilding[r.item.id] || 0;
    return `<tr>
      <td>${r.item.name}</td>
      <td>${fmtExact(r.count)}</td>
      <td title="${fmtExact((perItem[r.item.id] || 0) / Math.max(1, r.count))}">${formatNumber(r.count ? (perItem[r.item.id] || 0) / r.count : 0)}</td>
      <td title="${fmtExact(r.cps)}">${formatNumber(r.cps)}</td>
      <td>${share.toFixed(1)}%</td>
      <td title="${fmtExact(life)}">${formatNumber(life)}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" style="text-align:center;color:#9a8a70;">No buildings match.</td></tr>`;
  drawBarChart(document.getElementById('buildingChart'), rows.map(r => ({ label: r.item.name, value: r.cps })));
}

function renderStatsMultipliers() {
  const el = document.getElementById('multipliersList');
  const drinkM = getDrinkMultipliers().cps;
  const blendM = getBlendMultipliers().cps;
  const superM = getSuperMultipliers().cps;
  const activeDrinks = gameState.activeDrinks.length;
  const blend = gameState.activeBlend ? blendRecipes.find(b => b.id === gameState.activeBlend.id) : null;
  const storm = gameState.storm && gameState.storm.expiresAt > Date.now() ? gameState.storm : null;
  const rows = [
    { name: 'Base building output', detail: 'Sum of all buildings × their shop upgrades', value: '×1' },
    { name: 'Prestige', detail: `${fmtExact(gameState.goldenCoffee)} Golden Coffee`, value: `×${gameState.prestigeMultiplier.toFixed(2)}` },
    { name: 'Permanent GC bonus', detail: 'Golden upgrades', value: `×${(gameState.permanentCPSBonus || 1).toFixed(2)}` },
    { name: 'Mystery Bean bonus', detail: 'Permanent, from Mystery Coffee Beans', value: `×${(gameState.mysteryCPSBonus || 1).toFixed(3)}` },
    { name: 'Lab drinks', detail: activeDrinks ? `${activeDrinks} drink${activeDrinks === 1 ? '' : 's'} active` : 'No drinks active', value: `×${drinkM.toFixed(2)}` },
    { name: 'Roastery blend', detail: blend ? blend.name : 'No blend active', value: `×${blendM.toFixed(2)}` },
    { name: 'Super Coffee', detail: gameState.superEffects.length ? `${gameState.superEffects.length} effect${gameState.superEffects.length === 1 ? '' : 's'} active` : 'No effects active', value: `×${superM.toFixed(2)}` },
    { name: 'Coffee storm', detail: storm ? `×${storm.mult} storm raging` : 'No storm', value: storm ? `×${storm.mult.toFixed(1)}` : '×1' },
  ];
  const total = calculateTotalCPS();
  el.innerHTML = rows.map(r => `
    <div class="mult-row">
      <div><div class="mult-name">${r.name}</div><div class="mult-detail">${r.detail}</div></div>
      <div class="mult-value">${r.value}</div>
    </div>`).join('') + `
    <div class="mult-row" style="border-bottom:none;margin-top:8px;">
      <div><div class="mult-name">Total CPS</div><div class="mult-detail">Base × all multipliers</div></div>
      <div class="mult-value" title="${fmtExact(total)}">${formatNumber(total)}</div>
    </div>`;
}

function renderStatsLifetime() {
  const el = document.getElementById('lifetimeGrid');
  const s = ensureStats();
  const fromBuildings = Object.values(s.coffeeByBuilding).reduce((a, b) => a + b, 0);
  const earned = gameState.achievements.filter(a => a.earned).length;
  const items = [
    ['Total coffee earned', gameState.totalCoffeeAllTime],
    ['Coffee from clicks', s.clicksCoffee],
    ['Coffee from buildings', fromBuildings],
    ['Coffee while away', s.coffeeOffline],
    ['Manual clicks', s.totalClicks],
    ['Prestiges', s.totalPrestiges],
    ['Highest CPS', s.maxCPS],
    ['Golden Coffee earned', s.lifetimeGoldenEarned],
    ['Green beans bought', gameState.lifetimeBeans],
    ['Blends roasted', gameState.lifetimeBlendsRoasted],
    ['Blends activated', gameState.lifetimeBlendsActivated],
    ['Drink recipes discovered', gameState.discoveredDrinks.size],
    ['Super Coffees collected', gameState.lifetimeSuperCoffee],
    ['Golden Super Coffees', gameState.lifetimeGoldenSuperCoffee],
    ['Coffee storms weathered', gameState.lifetimeStorms],
    ['Mystery Beans found', gameState.lifetimeMysteryBeans],
    ['Achievements earned', `${earned}/${gameState.achievements.length}`],
  ];
  el.innerHTML = items.map(([label, v]) =>
    `<div class="stats-mini"><span class="mini-label">${label}</span><span class="mini-value" title="${typeof v === 'number' ? fmtExact(v) : v}">${typeof v === 'number' ? formatNumber(v) : v}</span></div>`
  ).join('');
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
        <p>• Research Lab drinks and discoveries are kept forever</p>
        <p>• Roastery beans and roasted blends are kept forever (an active blend ends)</p>
        <p>• Mystery Bean permanent CPS bonuses are kept forever (active Super Coffee effects and storms end)</p>
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
    const earned = gameState.clickPower * gameState.prestigeMultiplier * getDrinkMultipliers().click * getBlendMultipliers().click * getSuperMultipliers().click;
    gameState.coffee += earned;
    gameState.totalCoffeeAllTime += earned;
    trackClick(earned); // v1.18 stats

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

    const tabs = ['brew', 'shop', 'upgrades', 'lab', 'roastery', 'prestige', 'achievements'];
    const index = parseInt(e.key) - 1;

    if (e.key === '8') {
      openStatsModal();
      return;
    }

    if (index >= 0 && index < tabs.length) {
      const btn = document.querySelector(`[data-tab="${tabs[index]}"]`);
      if (btn) btn.click();
    }
  });

  // Modal controls
  document.getElementById('helpBtn').onclick = openHelp;
  document.getElementById('infoBtn').onclick = openVersionInfo;
  document.getElementById('settingsBtn').onclick = openSettingsModal;
  document.getElementById('statsBtn').onclick = openStatsModal;
  document.getElementById('closeStatsModal').onclick = closeStatsModal;
  document.getElementById('startGameBtn').onclick = closeInstructions;
  document.getElementById('closeVersionModal').onclick = closeVersionInfo;
  document.getElementById('closeAchievementModal').onclick = closeAchievementModal;
  document.getElementById('closeSettingsModal').onclick = closeSettingsModal;
  document.getElementById('closeOfflineModal').onclick = closeOfflineModal;
  document.getElementById('offlineContinueBtn').onclick = closeOfflineModal;

  document.getElementById('statsModal').onclick = (e) => {
    if (e.target.id === 'statsModal') {
      closeStatsModal();
    }
  };
  document.querySelectorAll('.stats-tab').forEach(btn => {
    btn.onclick = () => switchStatsTab(btn.dataset.statsTab);
  });
  document.getElementById('buildingFilter').addEventListener('input', renderStatsBuildings);

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

    // creditProduction records per-building lifetime stats (v1.18)
    const { totalCPS } = creditProduction(elapsedSeconds);

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
    tickBlendExpiry();
    tickSuperCoffee();
    sampleStatsHistory(); // v1.18: timeline sample + max CPS
    if (!document.getElementById('statsModal').classList.contains('hidden')) {
      renderStatsActiveTab(); // keep open stats window live
    }
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
          const earnings = cps * elapsedSeconds * getDrinkMultipliers().offline * getBlendMultipliers().offline;
          gameState.coffee += earnings;
          gameState.totalCoffeeAllTime += earnings;
          ensureStats().coffeeOffline += earnings; // v1.18 stats
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