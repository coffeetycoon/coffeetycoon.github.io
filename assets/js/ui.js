/* ═══════════════════════════════════════════════════════════════════════════
   COFFEE TYCOON v1.13 - UI & NOTIFICATIONS
   UI Rendering, Notifications, Modals, and Event Handlers
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══ NOTIFICATION SYSTEM ═══
let activeNotifications = [];
let notificationIdCounter = 0;
let notificationTimers = new Map();

function showNotification(title, message, type = 'default', metadata = {}) {
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

function updateNotificationPositions() {
  activeNotifications.forEach((notif, i) => {
    notif.style.transform = `translateY(${i * 10}px)`;
  });
}

function showPurchaseNotification(itemName) {
  const container = document.getElementById('notificationContainer');

  const existing = activeNotifications.find(n =>
    n.dataset.itemName === itemName &&
    n.classList.contains('purchase-notif')
  );

  if (existing) {
    const messageEl = existing.querySelector('.notification-message');
    const match = messageEl.textContent.match(/x(\d+)/);
    const count = match ? parseInt(match[1]) + 1 : 2;

    messageEl.textContent = `Purchased x${count} ${itemName}`;
    existing.dataset.count = count;

    const oldTimer = notificationTimers.get(existing);
    if (oldTimer) clearTimeout(oldTimer);

    const newTimer = setTimeout(() => {
      removeNotificationNow(existing);
    }, 4000);
    notificationTimers.set(existing, newTimer);

    existing.style.transform = 'scale(1.02)';
    setTimeout(() => {
      existing.style.transform = '';
      updateNotificationPositions();
    }, 150);

    return;
  }

  const notifId = notificationIdCounter++;
  const notif = document.createElement('div');
  notif.className = 'notification purchase-notif';
  notif.dataset.notifId = notifId;
  notif.dataset.itemName = itemName;
  notif.dataset.count = 1;

  notif.innerHTML = `
    <div class="notification-title">Purchase Complete</div>
    <div class="notification-message">${itemName}</div>
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
  const container = document.getElementById('notificationContainer');

  const notifId = notificationIdCounter++;
  const notif = document.createElement('div');
  notif.className = 'notification sell-notif';
  notif.dataset.notifId = notifId;
  notif.dataset.itemName = itemName;

  // New selling notification format - completely separate from purchasing
  notif.innerHTML = `
    <div class="notification-title">💰 Sale Completed</div>
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

// ═══ UI UPDATE FUNCTIONS ═══
function updateNotificationBadges() {
  const availableUpgrades = upgrades.filter(u => 
    u.unlockCondition() && 
    !gameState.purchasedUpgrades.has(u.id) && 
    !gameState.viewedUpgrades.has(u.id)
  );
  const upgradesBtn = document.querySelector('[data-tab="upgrades"]');
  let upgradeBadge = upgradesBtn.querySelector('.notification-badge');
  if (availableUpgrades.length > 0 && !upgradeBadge) {
    upgradeBadge = document.createElement('div');
    upgradeBadge.className = 'notification-badge';
    upgradesBtn.appendChild(upgradeBadge);
  } else if (availableUpgrades.length === 0 && upgradeBadge) {
    upgradeBadge.remove();
  }
  
  const unclaimedCount = gameState.unclaimedAchievements.size;
  const achievementsBtn = document.querySelector('[data-tab="achievements"]');
  let achievementBadge = achievementsBtn.querySelector('.notification-badge');
  if (unclaimedCount > 0 && !achievementBadge) {
    achievementBadge = document.createElement('div');
    achievementBadge.className = 'notification-badge';
    achievementsBtn.appendChild(achievementBadge);
  } else if (unclaimedCount === 0 && achievementBadge) {
    achievementBadge.remove();
  }
}

function updateUI() {
  document.getElementById('coffeeDisplay').textContent = abbreviateNumber(gameState.displayCoffee);
  document.getElementById('cpsDisplay').textContent = abbreviateNumber(gameState.displayCPS);
  document.getElementById('goldenCoffeeDisplay').textContent = gameState.goldenCoffee;
  document.getElementById('clickPowerDisplay').textContent = gameState.clickPower;
  
  updateNotificationBadges();
  renderShop();
  renderUpgrades();
  renderPrestige();
  renderAchievements();
  checkAchievements();
}

// ═══ SHOP RENDERING ═══
function renderShop() {
  const container = document.getElementById('shopList');
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
    const totalCost = affordableAmount > 0 ? calculateBulkCost(item, currentCount, affordableAmount) :
                      calculateBulkCost(item, currentCount, amount);
    const canAfford = affordableAmount > 0;

    const itemCPS = calculateItemCPS(item);
    const sellValue = calculateSellValue(item, currentCount);
    const canSell = currentCount > 0;

    const div = document.createElement('div');
    div.className = 'shop-item' + (canAfford ? ' affordable' : '');
    div.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-effect">Effect: +${abbreviateNumber(itemCPS)} CPS each</div>
      </div>
      <div class="item-actions">
        <div class="quantity-display">${currentCount}</div>
        <div class="sell-section">
          <button class="sell-btn" ${!canSell ? 'disabled' : ''}>
            SELL ×${gameState.sellMode}<br><span style="font-size: 0.8rem;">(${abbreviateNumber(sellValue)} each)</span>
          </button>
        </div>
        <div class="buy-section">
          <button class="buy-btn" ${!canAfford ? 'disabled' : ''}>
            BUY ${affordableAmount > 1 && affordableAmount < amount ? '×' + affordableAmount : amount > 1 ? '×' + amount : ''}
          </button>
          <div class="cost-tile">☕ ${abbreviateNumber(totalCost)}</div>
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
let previouslyUnlockedUpgrades = new Set();

function renderUpgrades() {
  const container = document.getElementById('upgradesList');
  container.innerHTML = '';
  container.className = 'achievements-grid';
  
  const currentTab = document.querySelector('.tab-btn.active')?.dataset.tab;
  
  upgradePacks.forEach(pack => {
    const packUpgrades = upgrades.filter(u => u.pack === pack.id);
    if (packUpgrades.length === 0) return;
    
    const unlockedUpgrades = packUpgrades.filter(u => u.unlockCondition());
    if (unlockedUpgrades.length === 0) return;
    
    const newlyUnlocked = unlockedUpgrades.filter(u => 
      !previouslyUnlockedUpgrades.has(u.id) && 
      !gameState.purchasedUpgrades.has(u.id)
    );
    
    if (newlyUnlocked.length > 0 && currentTab !== 'upgrades') {
      showNotification(
        'New Upgrades Available!',
        `${pack.name}: ${newlyUnlocked.length} upgrade${newlyUnlocked.length > 1 ? 's' : ''} unlocked`,
        'upgrade',
        { packId: pack.id }
      );
    }
    
    newlyUnlocked.forEach(u => previouslyUnlockedUpgrades.add(u.id));
    
    const purchasedUpgrades = packUpgrades.filter(u => gameState.purchasedUpgrades.has(u.id));
    const affordableUpgrades = unlockedUpgrades.filter(u => 
      !gameState.purchasedUpgrades.has(u.id) && 
      gameState.coffee >= u.cost
    );
    
    if (currentTab === 'upgrades') {
      unlockedUpgrades.forEach(u => {
        if (!gameState.purchasedUpgrades.has(u.id)) {
          gameState.viewedUpgrades.add(u.id);
        }
      });
    }
    
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
          return `<span class="upgrade-pack-badge" ${affordable ? 'title="Affordable" aria-label="Affordable"' : ''}>${purchased ? '✓' : (affordable ? '!' : '○')}</span>`;
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
          <div class="upgrade-status">${purchased ? '✓ OWNED' : ''}</div>
        </div>
        <div class="upgrade-description">${upgrade.description}</div>
        <div class="upgrade-footer">
          <div class="cost-tile">☕ ${abbreviateNumber(upgrade.cost)}</div>
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
  const baseCost = 10000000000;
  const rawGain = Math.floor(Math.log2(gameState.totalCoffeeAllTime / baseCost + 1));
  const goldenCoffeeToGain = gameState.goldenCoffee >= 100 ? 0 : Math.min(100 - gameState.goldenCoffee, rawGain);
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
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p><strong>How it works:</strong></p>
        <p>• Every 10B total coffees = 1 Golden Coffee (base cost)</p>
        <p>• Golden Coffee cost doubles with each prestige (exponential scaling)</p>
        <p>• Each Golden Coffee gives +10% production (permanent!)</p>
        <p>• Prestiging resets coffee, items, and upgrades</p>
        <p>• Golden Coffee and multiplier are kept forever</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0;">
        <div style="background: rgba(255, 255, 255, 0.05); padding: 16px; border-radius: 12px;">
          <div style="opacity: 0.8; margin-bottom: 8px;">Total Coffee Brewed</div>
          <div style="font-size: 1.8rem; font-weight: 700; color: #ffd700;">${abbreviateNumber(gameState.totalCoffeeAllTime)}</div>
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
      ` : gameState.goldenCoffee >= 100 ? `
        <div style="text-align: center; margin: 20px 0; font-size: 1.1rem; opacity: 0.8;">
          Maximum Golden Coffee reached (100)
        </div>
      ` : `
        <div style="text-align: center; margin: 20px 0; font-size: 1.1rem; opacity: 0.8;">
          Need ${abbreviateNumber((gameState.goldenCoffee + 1) * 10000000000)} total coffees to prestige
          <br>Current: ${abbreviateNumber(gameState.totalCoffeeAllTime)}
        </div>
      `}
      <button class="prestige-button" ${!canPrestige ? 'disabled' : ''}>
        ${canPrestige ? 'PRESTIGE NOW' : 'Not Enough Coffee Yet'}
      </button>
    </div>
  `;
  
  const btn = container.querySelector('.prestige-button');
  if (canPrestige) {
    btn.onclick = doPrestige;
  }
}

// ═══ ACHIEVEMENTS RENDERING ═══
function renderAchievements() {
  const container = document.getElementById('achievementsList');
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
          return `<span class="pack-badge">${a.earned ? (isUnclaimed ? '!' : '✓') : '○'}</span>`;
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
        ${a.earned ? (isUnclaimed ? '!' : '✓') : '○'} ${a.name}
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
        openAchievementModal(pack);
        renderAchievements();
      };
    }
    
    modalAchievements.appendChild(div);
  });
  
  modal.classList.remove('hidden');
}

function closeAchievementModal() {
  document.getElementById('achievementModal').classList.add('hidden');
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

  // Clear export textarea
  document.getElementById('exportTextarea').value = '';

  document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

// ═══ ANIMATION ═══
function smoothAnimate() {
  const lerpFactor = 0.15;
  
  const coffeeDiff = gameState.targetCoffee - gameState.displayCoffee;
  if (Math.abs(coffeeDiff) > 0.01) {
    gameState.displayCoffee += coffeeDiff * lerpFactor;
  } else {
    gameState.displayCoffee = gameState.targetCoffee;
  }
  
  const cpsDiff = gameState.targetCPS - gameState.displayCPS;
  if (Math.abs(cpsDiff) > 0.01) {
    gameState.displayCPS += cpsDiff * lerpFactor;
  } else {
    gameState.displayCPS = gameState.targetCPS;
  }
}

// ═══ EVENT LISTENERS ═══
document.addEventListener('DOMContentLoaded', () => {
  // Coffee button click
  document.getElementById('coffeeButton').onclick = () => {
    const earned = gameState.clickPower * gameState.prestigeMultiplier;
    gameState.coffee += earned;
    gameState.totalCoffeeAllTime += earned;
    
    gameState.targetCoffee = gameState.coffee;
    
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

      updateUI();
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
    };
  });



  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    const tabs = ['brew', 'shop', 'upgrades', 'prestige', 'achievements'];
    const index = parseInt(key) - 1;
    
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
        alert('Save imported successfully!');
        closeSettingsModal();
      } else {
        alert('Failed to import save. Please check the format.');
      }
    }
  };

  document.getElementById('eraseProgressBtn').onclick = eraseProgress;

  // ═══ GAME LOOP ═══
  let lastRenderTime = Date.now();

  // Main game tick (10 times per second)
  setInterval(() => {
    const totalCPS = calculateTotalCPS();
    const coffeePerTick = totalCPS / 10;
    
    if (totalCPS > 0) {
      gameState.coffee += coffeePerTick;
      gameState.totalCoffeeAllTime += coffeePerTick;
      gameState.targetCoffee = gameState.coffee;
    }
    
    gameState.targetCPS = totalCPS;
    smoothAnimate();
    
    const now = Date.now();
    if (now - lastRenderTime > 16) {
      document.getElementById('coffeeDisplay').textContent = abbreviateNumber(gameState.displayCoffee);
      document.getElementById('cpsDisplay').textContent = abbreviateNumber(gameState.displayCPS);
      lastRenderTime = now;
    }
  }, 100);

  // UI update (once per second)
  setInterval(() => {
    updateUI();
  }, 1000);

  // Auto-save (every 30 seconds)
  setInterval(() => {
    saveGame();
  }, 30000);

  // ═══ GAME INITIALIZATION ═══
  const hasExistingSave = loadGame();
  loadSettings();

  // Update mode button display
  document.querySelectorAll('.buy-mode-btn').forEach(btn => {
    const type = btn.dataset.type;
    const mode = parseInt(btn.dataset.mode);
    if ((type === 'sell' && mode === gameState.sellMode) ||
        (type === 'buy' && mode === gameState.buyMode)) {
      btn.classList.add('active');
    }
  });

  if (!hasExistingSave) {
    document.getElementById('instructionsOverlay').classList.remove('hidden');
  } else {
    document.getElementById('instructionsOverlay').classList.add('hidden');
  }

  document.getElementById('versionModal').classList.add('hidden');

  gameState.targetCoffee = gameState.coffee;
  gameState.displayCoffee = gameState.coffee;
  gameState.targetCPS = calculateTotalCPS();
  gameState.displayCPS = gameState.targetCPS;

  updateUI();
});
