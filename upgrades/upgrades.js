// Initialize the upgrades page
document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
    setupEventListeners();
    setInterval(updateUI, 100);
});

function initializeUI() {
    const buyModeButtons = document.querySelectorAll('.btn-buy-mode');
    buyModeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            buyModeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const regularContent = document.getElementById('regular-upgrades-content');
            const goldenContent = document.getElementById('golden-upgrades-content');
            
            if (tab === 'regular') {
                regularContent.classList.add('active');
                goldenContent.classList.remove('active');
            } else {
                regularContent.classList.remove('active');
                goldenContent.classList.add('active');
            }
        });
    });
}

function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        const buyModeButtons = document.querySelectorAll('.btn-buy-mode');
        
        if (e.key === '1') {
            buyModeButtons[0]?.click();
        } else if (e.key === '2') {
            buyModeButtons[1]?.click();
        } else if (e.key === '3') {
            buyModeButtons[2]?.click();
        }
    });
}

function updateUI() {
    updateGoldenCoffeeProgress();
    renderGoldenUpgrades();
}

function updateGoldenCoffeeProgress() {
    const progressFill = document.getElementById('golden-coffee-progress-fill');
    const progressText = document.getElementById('golden-coffee-progress-text');
    const nextThresholdElement = document.getElementById('next-golden-threshold');
    
    if (!progressFill || !progressText || !nextThresholdElement) return;
    
    const progress = 50;
    progressFill.style.width = progress + '%';
    progressText.textContent = progress.toFixed(1) + '%';
    nextThresholdElement.textContent = '20B';
    
    if (progress >= 100) {
        progressFill.style.background = 'linear-gradient(90deg, #4caf50, #81c784)';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, #ffd700, #ffed4e)';
    }
}

function renderGoldenUpgrades() {
    const container = document.getElementById('golden-upgrades-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const goldenUpgrades = [
        { id: 'auto-buy-upgrades', name: 'Auto-Buy Upgrades', description: 'Automatically purchase affordable upgrades', cost: 1 },
        { id: 'auto-buy-items', name: 'Auto-Buy Items', description: 'Automatically purchase affordable items', cost: 2 },
        { id: 'auto-claim-achievements', name: 'Auto-Claim Achievements', description: 'Automatically claim achievement rewards', cost: 3 },
        { id: 'mark-all-read', name: 'Mark All Read', description: 'Clear all notifications', cost: 1 },
        { id: 'permanent-cps-bonus-1', name: 'Permanent CPS Bonus I', description: 'Increase base production by 5%', cost: 5 },
        { id: 'permanent-cps-bonus-2', name: 'Permanent CPS Bonus II', description: 'Increase base production by 10%', cost: 10 }
    ];
    
    goldenUpgrades.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = 'golden-upgrade-card';
        
        card.innerHTML = 
            '<div class="golden-upgrade-header">' +
                '<div>' +
                    '<div class="golden-upgrade-name">' + upgrade.name + '</div>' +
                    '<div class="golden-upgrade-description">' + upgrade.description + '</div>' +
                '</div>' +
                '<div class="golden-upgrade-cost">' + upgrade.cost + ' Golden Coffee</div>' +
            '</div>' +
            '<div class="golden-upgrade-actions">' +
                '<button class="golden-upgrade-btn" onclick="buyGoldenUpgrade(\'' + upgrade.id + '\')">Buy</button>' +
            '</div>';
        
        container.appendChild(card);
    });
}

function togglePack(packId) {
    const packElement = document.querySelector('.upgrade-pack');
    if (packElement) {
        packElement.classList.toggle('collapsed');
    }
}

function showNotification(title, message, type) {
    const notificationsArea = document.getElementById('notifications-area');
    if (!notificationsArea) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification notification-info';
    notification.innerHTML = 
        '<div class="notification-content">' +
            '<div class="notification-title">' + title + '</div>' +
            '<div class="notification-message">' + message + '</div>' +
        '</div>' +
        '<button class="notification-close" onclick="removeNotification(this)">×</button>';
    
    notificationsArea.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function removeNotification(button) {
    const notification = button.closest('.notification');
    if (notification) {
        notification.remove();
    }
}

function formatNumber(num) {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(1) + 'T';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function buyGoldenUpgrade(upgradeId) {
    showNotification('Golden Upgrade', 'This feature will be implemented when integrated with the main game', 'info');
}

function exportSave() {
    showNotification('Export', 'This feature will be implemented when integrated with the main game', 'info');
}

function importSave() {
    showNotification('Import', 'This feature will be implemented when integrated with the main game', 'info');
}

function quickSave() {
    showNotification('Quick Save', 'This feature will be implemented when integrated with the main game', 'info');
}

function quickLoad() {
    showNotification('Quick Load', 'This feature will be implemented when integrated with the main game', 'info');
}

function showSettings() {
    alert('Settings are managed in the main game. Visit the Settings page to configure game options.');
}

function showStats() {
    alert('Total Coffee Brewed: 0\nGolden Coffee: 0\nPrestige Multiplier: 100.0%\nItems Owned: 0\nUpgrades Purchased: 0\nGolden Upgrades Purchased: 0\nAchievements Earned: 0');
}