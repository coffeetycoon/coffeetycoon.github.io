/* ═══════════════════════════════════════════════════════════════════════════
   COFFEE TYCOON v1.13.3 - CORE GAME LOGIC
   Game State, Save System, Math, and Core Calculations
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══ GAME STATE ═══
const gameState = {
  coffee: 0,
  totalCoffeeAllTime: 0,
  clickPower: 1,
  goldenCoffee: 0,
  prestigeMultiplier: 1.0,
  items: {},
  purchasedUpgrades: new Set(),
  purchasedGoldenUpgrades: new Set(),
  itemMultipliers: {},
  viewedUpgrades: new Set(),
  viewedAchievements: new Set(),
  achievements: [],
  collapsedPacks: new Set(),
  unclaimedAchievements: new Set(),
  displayCoffee: 0,
  displayCPS: 0,
  targetCoffee: 0,
  targetCPS: 0,
  buyMode: 1, // ×1, ×10, ×100
  sellMode: 1,
  settings: {
    notifications: true,
    quickKeys: true,
    numberDisplay: 'abbreviated' // 'full' or 'abbreviated'
  }
};

// ═══ SHOP ITEMS ═══
const shopItems = [
  { id: 'brewer', name: 'Auto Brewer', baseCost: 50, cps: 5, scale: 1.15 },
  { id: 'barista', name: 'Barista', baseCost: 500, cps: 10, scale: 1.15 },
  { id: 'grinder', name: 'Coffee Grinder', baseCost: 5000, cps: 100, scale: 1.2 },
  { id: 'espresso', name: 'Espresso Machine', baseCost: 50000, cps: 500, scale: 1.2 },
  { id: 'truck', name: 'Coffee Truck', baseCost: 200000, cps: 2000, scale: 1.25 },
  { id: 'factory', name: 'Coffee Factory', baseCost: 1000000, cps: 30000, scale: 1.25 },
  { id: 'corporation', name: 'Coffee Corporation', baseCost: 8000000, cps: 400000, scale: 1.3 },
  { id: 'franchise', name: 'Coffee Franchise', baseCost: 50000000, cps: 5000000, scale: 1.3 },
  { id: 'country', name: 'Coffee Country', baseCost: 500000000, cps: 50000000, scale: 1.35 },
  { id: 'continent', name: 'Coffee Continent', baseCost: 5000000000, cps: 500000000, scale: 1.35 },
  { id: 'planet', name: 'Coffee Planet', baseCost: 75000000000, cps: 7500000000, scale: 1.4 },
  { id: 'solarsystem', name: 'Coffee Solar System', baseCost: 1000000000000, cps: 100000000000, scale: 1.4 },
  { id: 'galaxy', name: 'Coffee Galaxy', baseCost: 15000000000000, cps: 1500000000000, scale: 1.45 },
  { id: 'universe', name: 'Coffee Universe', baseCost: 250000000000000, cps: 25000000000000, scale: 1.45 },
  { id: 'dimension', name: 'Coffee Dimension', baseCost: 5000000000000000, cps: 500000000000000, scale: 1.5 },
  { id: 'multiverse', name: 'Coffee Multiverse', baseCost: 100000000000000000, cps: 10000000000000000, scale: 1.5 }
];

// Initialize items
shopItems.forEach(item => {
  if (!gameState.items[item.id]) {
    gameState.items[item.id] = { count: 0, cost: item.baseCost };
  }
});

// ═══ UPGRADES ═══
const upgrades = [
  // Click Power Upgrades
  { 
    id: 'click_1', 
    name: 'Better Coffee Beans', 
    description: '+1 coffee per click', 
    cost: 1500, 
    effect: () => { gameState.clickPower += 1; },
    unlockCondition: () => gameState.totalCoffeeAllTime >= 1000,
    pack: 'click-power'
  },
  { 
    id: 'click_2', 
    name: 'Premium Coffee Beans', 
    description: '+2 coffee per click', 
    cost: 15000, 
    effect: () => { gameState.clickPower += 2; },
    unlockCondition: () => gameState.totalCoffeeAllTime >= 10000,
    pack: 'click-power'
  },
  { 
    id: 'click_3', 
    name: 'Exotic Coffee Beans', 
    description: '+5 coffee per click', 
    cost: 150000, 
    effect: () => { gameState.clickPower += 5; },
    unlockCondition: () => gameState.totalCoffeeAllTime >= 100000,
    pack: 'click-power'
  }
];

// Generate upgrades for all shop items (8 tiers each)
shopItems.forEach(item => {
  const tierCosts = [
    item.baseCost * 10,
    item.baseCost * 100,
    item.baseCost * 1000,
    item.baseCost * 10000,
    item.baseCost * 100000,
    item.baseCost * 1000000,
    item.baseCost * 10000000,
    item.baseCost * 100000000
  ];
  
  const tierRequirements = [10, 25, 50, 100, 200, 400, 700, 1000];
  const tierNames = [
    'Upgraded', 'Advanced', 'Industrial', 'Quantum', 
    'Hyper', 'Ultra', 'Mega', 'Divine'
  ];
  
  for (let i = 0; i < 8; i++) {
    upgrades.push({
      id: `${item.id}_${i + 1}`,
      name: `${tierNames[i]} ${item.name}`,
      description: `${item.name}s produce 2× coffee`,
      cost: tierCosts[i],
      effect: () => {
        gameState.itemMultipliers[item.id] = (gameState.itemMultipliers[item.id] || 1) * 2;
      },
      unlockCondition: () => (gameState.items[item.id]?.count || 0) >= tierRequirements[i],
      pack: item.id
    });
  }
});

// Global Upgrades
upgrades.push(
  { 
    id: 'global_1', 
    name: 'Efficient Operations', 
    description: 'All items produce 1.5× coffee', 
    cost: 500000, 
    effect: () => { 
      shopItems.forEach(item => {
        gameState.itemMultipliers[item.id] = (gameState.itemMultipliers[item.id] || 1) * 1.5;
      });
    },
    unlockCondition: () => shopItems.every(item => (gameState.items[item.id]?.count || 0) >= 10),
    pack: 'global'
  },
  { 
    id: 'global_2', 
    name: 'Coffee Revolution', 
    description: 'All items produce 2× coffee', 
    cost: 5000000, 
    effect: () => { 
      shopItems.forEach(item => {
        gameState.itemMultipliers[item.id] = (gameState.itemMultipliers[item.id] || 1) * 2;
      });
    },
    unlockCondition: () => shopItems.every(item => (gameState.items[item.id]?.count || 0) >= 25),
    pack: 'global'
  }
);

const upgradePacks = [
  { id: 'click-power', name: 'Click Power Upgrades', icon: '👆', description: 'Increase coffee per click' },
  { id: 'brewer', name: 'Auto Brewer Upgrades', icon: '☕', description: 'Boost Auto Brewer production' },
  { id: 'barista', name: 'Barista Upgrades', icon: '👨‍🍳', description: 'Enhance Barista efficiency' },
  { id: 'grinder', name: 'Coffee Grinder Upgrades', icon: '⚙️', description: 'Improve Coffee Grinder output' },
  { id: 'espresso', name: 'Espresso Machine Upgrades', icon: '🔧', description: 'Upgrade Espresso Machine power' },
  { id: 'truck', name: 'Coffee Truck Upgrades', icon: '🚚', description: 'Enhance Coffee Truck capabilities' },
  { id: 'factory', name: 'Coffee Factory Upgrades', icon: '🏭', description: 'Amplify Coffee Factory performance' },
  { id: 'corporation', name: 'Coffee Corporation Upgrades', icon: '🏢', description: 'Expand Coffee Corporation reach' },
  { id: 'franchise', name: 'Coffee Franchise Upgrades', icon: '🌟', description: 'Scale Coffee Franchise operations' },
  { id: 'country', name: 'Coffee Country Upgrades', icon: '🏳️', description: 'Boost Country production' },
  { id: 'continent', name: 'Coffee Continent Upgrades', icon: '🗺️', description: 'Enhance Continent reach' },
  { id: 'planet', name: 'Coffee Planet Upgrades', icon: '🌍', description: 'Enhance Coffee Planet production' },
  { id: 'solarsystem', name: 'Solar System Upgrades', icon: '☀️', description: 'Boost Solar System output' },
  { id: 'galaxy', name: 'Coffee Galaxy Upgrades', icon: '🌌', description: 'Amplify Galaxy production' },
  { id: 'universe', name: 'Coffee Universe Upgrades', icon: '🌠', description: 'Maximize Universe efficiency' },
  { id: 'dimension', name: 'Coffee Dimension Upgrades', icon: '🔮', description: 'Amplify Dimension power' },
  { id: 'multiverse', name: 'Coffee Multiverse Upgrades', icon: '♾️', description: 'Maximize Multiverse output' },
  { id: 'global', name: 'Global Upgrades', icon: '🌐', description: 'Universal production multipliers' }
];

// ═══ ACHIEVEMENTS ═══
const achievements = [
  // Coffee Collection Milestones (with puns!)
  { id: 'first', name: 'First Sip', requirement: 'Brew 1 coffee', condition: () => gameState.totalCoffeeAllTime >= 1, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/1", percent: () => Math.min(gameState.totalCoffeeAllTime / 1 * 100, 100) || 0, reward: { type: 'coffee', value: 1 } },
  { id: 'ten', name: 'Decaf No More', requirement: 'Brew 10 coffees', condition: () => gameState.totalCoffeeAllTime >= 10, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/10", percent: () => Math.min(gameState.totalCoffeeAllTime / 10 * 100, 100) || 0, reward: { type: 'coffee', value: 5 } },
  { id: 'hundred', name: 'Cent-imental Value', requirement: 'Brew 100 coffees', condition: () => gameState.totalCoffeeAllTime >= 100, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/100", percent: () => Math.min(gameState.totalCoffeeAllTime / 100 * 100, 100) || 0, reward: { type: 'coffee', value: 50 } },
  { id: 'thousand', name: 'Grand Grinder', requirement: 'Brew 1,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 1000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/1,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 1000 * 100, 100) || 0, reward: { type: 'coffee', value: 500 } },
  { id: 'tenk', name: 'Bean Counter', requirement: 'Brew 10,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 10000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/10,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 10000 * 100, 100) || 0, reward: { type: 'coffee', value: 5000 } },
  { id: 'hundredk', name: 'Latte Legend', requirement: 'Brew 100,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 100000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/100,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 100000 * 100, 100) || 0, reward: { type: 'coffee', value: 50000 } },
  { id: 'million', name: 'Mocha Millionaire', requirement: 'Brew 1,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 1000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/1,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 1000000 * 100, 100) || 0, reward: { type: 'coffee', value: 500000 } },
  { id: 'tenmill', name: 'Espresso Excess', requirement: 'Brew 10,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 10000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/10,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 10000000 * 100, 100) || 0, reward: { type: 'coffee', value: 5000000 } },
  { id: 'hundredmill', name: 'Brew Tycoon', requirement: 'Brew 100,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 100000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/100,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 100000000 * 100, 100) || 0, reward: { type: 'coffee', value: 50000000 } },
  { id: 'billion', name: 'Cappuccino Kingpin', requirement: 'Brew 1,000,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 1000000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/1,000,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 1000000000 * 100, 100) || 0, reward: { type: 'coffee', value: 500000000 } },
  { id: 'tenb', name: 'Drip Drop Titan', requirement: 'Brew 10,000,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 10000000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/10,000,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 10000000000 * 100, 100) || 0, reward: { type: 'coffee', value: 5000000000 } },
  { id: 'hundredb', name: 'Macchiato Master', requirement: 'Brew 100,000,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 100000000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/100,000,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 100000000000 * 100, 100) || 0, reward: { type: 'coffee', value: 50000000000 } },
  { id: 'trillion', name: 'French Press Phenom', requirement: 'Brew 1,000,000,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 1000000000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/1,000,000,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 1000000000000 * 100, 100) || 0, reward: { type: 'coffee', value: 500000000000 } },
  { id: 'tentr', name: 'Percolator Prodigy', requirement: 'Brew 10,000,000,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 10000000000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/10,000,000,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 10000000000000 * 100, 100) || 0, reward: { type: 'coffee', value: 5000000000000 } },
  { id: 'hundredtr', name: 'Americano Overlord', requirement: 'Brew 100,000,000,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 100000000000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/100,000,000,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 100000000000000 * 100, 100) || 0, reward: { type: 'coffee', value: 50000000000000 } },
  { id: 'quadrillion', name: 'Ristretto Royalty', requirement: 'Brew 1,000,000,000,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 1000000000000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/1,000,000,000,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 1000000000000000 * 100, 100) || 0, reward: { type: 'coffee', value: 500000000000000 } },
  { id: 'tenq', name: 'Affogato Architect', requirement: 'Brew 10,000,000,000,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 10000000000000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/10,000,000,000,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 10000000000000000 * 100, 100) || 0, reward: { type: 'coffee', value: 5000000000000000 } },
  { id: 'hundredq', name: 'Cortado Commander', requirement: 'Brew 100,000,000,000,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 100000000000000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/100,000,000,000,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 100000000000000000 * 100, 100) || 0, reward: { type: 'coffee', value: 50000000000000000 } },
  { id: 'quintillion', name: 'Lungo Luminary', requirement: 'Brew 1,000,000,000,000,000,000 coffees', condition: () => gameState.totalCoffeeAllTime >= 1000000000000000000, earned: false, progress: () => Math.floor(gameState.totalCoffeeAllTime) + "/1,000,000,000,000,000,000", percent: () => Math.min(gameState.totalCoffeeAllTime / 1000000000000000000 * 100, 100) || 0, reward: { type: 'coffee', value: 500000000000000000 } },
  
  // Item Collection Achievements
  { id: 'first_item', name: 'Bean There', requirement: 'Purchase your first item', condition: () => Object.values(gameState.items).some(i => (i?.count ?? 0) >= 1), earned: false, progress: () => Object.values(gameState.items).some(i => (i?.count ?? 0) >= 1) ? "1/1" : "0/1", percent: () => Object.values(gameState.items).some(i => (i?.count ?? 0) >= 1) ? 100 : 0, reward: { type: 'coffee', value: 50 } },
  { id: 'five_any', name: 'Done That', requirement: 'Have 5 of any single item', condition: () => Object.values(gameState.items).some(i => (i?.count ?? 0) >= 5), earned: false, progress: () => {
    const max = Math.max(...Object.values(gameState.items).map(i => i?.count ?? 0), 0);
    return max + "/5";
  }, percent: () => {
    const max = Math.max(...Object.values(gameState.items).map(i => i?.count ?? 0), 0);
    return Math.min(max / 5 * 100, 100) || 0;
  }, reward: { type: 'coffee', value: 3 } },
  // General Collection Achievements (total buildings)
  { id: 'total_10', name: 'Small Collection', requirement: 'Own 10 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 10, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/10", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 10 * 100, 100) || 0, reward: { type: 'coffee', value: 100 } },
  { id: 'total_50', name: 'Growing Empire', requirement: 'Own 50 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 50, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/50", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 50 * 100, 100) || 0, reward: { type: 'coffee', value: 500 } },
  { id: 'total_100', name: 'Coffee Conglomerate', requirement: 'Own 100 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 100, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/100", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 100 * 100, 100) || 0, reward: { type: 'coffee', value: 1000 } },
  { id: 'total_500', name: 'Brewing Baron', requirement: 'Own 500 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 500, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/500", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 500 * 100, 100) || 0, reward: { type: 'coffee', value: 5000 } },
  { id: 'total_1000', name: 'Latte Lord', requirement: 'Own 1,000 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 1000, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/1,000", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 1000 * 100, 100) || 0, reward: { type: 'coffee', value: 10000 } },
  { id: 'total_5000', name: 'Espresso Emperor', requirement: 'Own 5,000 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 5000, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/5,000", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 5000 * 100, 100) || 0, reward: { type: 'coffee', value: 50000 } },
  { id: 'total_10000', name: 'Mocha Monarch', requirement: 'Own 10,000 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 10000, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/10,000", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 10000 * 100, 100) || 0, reward: { type: 'coffee', value: 100000 } },
  { id: 'total_50000', name: 'Cappuccino Conqueror', requirement: 'Own 50,000 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 50000, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/50,000", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 50000 * 100, 100) || 0, reward: { type: 'coffee', value: 500000 } },
  { id: 'total_100000', name: 'Drip Drop Dominator', requirement: 'Own 100,000 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 100000, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/100,000", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 100000 * 100, 100) || 0, reward: { type: 'coffee', value: 1000000 } },
  { id: 'total_500000', name: 'Macchiato Mastermind', requirement: 'Own 500,000 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 500000, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/500,000", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 500000 * 100, 100) || 0, reward: { type: 'coffee', value: 5000000 } },
  { id: 'total_1000000', name: 'French Press Pharaoh', requirement: 'Own 1,000,000 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 1000000, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/1,000,000", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 1000000 * 100, 100) || 0, reward: { type: 'coffee', value: 10000000 } }
];

// Generate item-specific milestones
const itemMilestones = [10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
shopItems.forEach(item => {
  itemMilestones.forEach((milestone, idx) => {
    const multiplier = 1.025 + (idx * 0.025);
    achievements.push({
      id: `${item.id}_${milestone}`,
      name: `${item.name} ${milestone >= 1000 ? (milestone/1000).toFixed(0) + 'K' : milestone}`,
      requirement: `Own ${milestone.toLocaleString()} ${item.name}${milestone > 1 ? 's' : ''}`,
      condition: () => (gameState.items[item.id]?.count || 0) >= milestone,
      earned: false,
      progress: () => (gameState.items[item.id]?.count || 0) + "/" + milestone.toLocaleString(),
      percent: () => Math.min((gameState.items[item.id]?.count || 0) / milestone * 100, 100) || 0,
      reward: { type: 'multiplier', value: multiplier, itemId: item.id }
    });
  });
});

// CPS Achievement Pack
const cpsMilestones = [
  { value: 1, name: 'Slow Drip' },
  { value: 10, name: 'Gentle Pour' },
  { value: 100, name: 'Steady Stream' },
  { value: 1000, name: 'A Latte Speed' },
  { value: 10000, name: 'Espresso Express' },
  { value: 100000, name: 'Turbo Brew' },
  { value: 1000000, name: 'Mega Percolator' },
  { value: 10000000, name: 'Hyper Grinder' },
  { value: 100000000, name: 'Ultra Drip' },
  { value: 1000000000, name: 'Giga Bean' },
  { value: 10000000000, name: 'Tera Roast' },
  { value: 100000000000, name: 'Peta Press' },
  { value: 1000000000000, name: 'Exa Pour' },
  { value: 10000000000000, name: 'Zetta Caffeine' },
  { value: 100000000000000, name: 'Yotta Extraction' },
  { value: 1000000000000000, name: 'Quantum Percolator' },
  { value: 10000000000000000, name: 'Cosmic Espresso' },
  { value: 100000000000000000, name: 'Universal Brew' },
  { value: 1000000000000000000, name: 'Multiversal Mocha' },
  { value: 10000000000000000000, name: 'Infinite Latte' }
];

cpsMilestones.forEach((milestone) => {
  achievements.push({
    id: `cps_${milestone.value}`,
    name: milestone.name,
    requirement: `Reach ${abbreviateNumber(milestone.value)} CPS`,
    condition: () => calculateTotalCPS() >= milestone.value,
    earned: false,
    progress: () => abbreviateNumber(calculateTotalCPS()) + "/" + abbreviateNumber(milestone.value),
    percent: () => Math.min(calculateTotalCPS() / milestone.value * 100, 100) || 0,
    reward: { type: 'coffee', value: milestone.value * 100 }
  });
});

// Upgrade Collection Achievements
for (let i = 10; i <= 100; i += 10) {
  achievements.push({
    id: `upgrades_${i}`,
    name: `Upgrade ${i}% Club`,
    requirement: `Purchase ${i}% of all upgrades`,
    condition: () => {
      const totalUpgrades = upgrades.length;
      const purchasedCount = gameState.purchasedUpgrades.size;
      return (purchasedCount / totalUpgrades * 100) >= i;
    },
    earned: false,
    progress: () => {
      const totalUpgrades = upgrades.length;
      const purchasedCount = gameState.purchasedUpgrades.size;
      const percent = Math.floor(purchasedCount / totalUpgrades * 100);
      return `${percent}%/${i}%`;
    },
    percent: () => {
      const totalUpgrades = upgrades.length;
      const purchasedCount = gameState.purchasedUpgrades.size;
      const currentPercent = (purchasedCount / totalUpgrades * 100);
      return Math.min(currentPercent / i * 100, 100) || 0;
    },
    reward: { type: 'coffee', value: i * 10000 }
  });
}

gameState.achievements = achievements;

// ═══ GOLDEN UPGRADES ═══
const goldenUpgrades = [
  {
    id: 'auto_buy_upgrades',
    name: 'Auto-Buy Upgrades',
    description: 'Automatically purchase affordable upgrades',
    cost: 2,
    effect: () => {
      gameState.settings.autoBuyUpgrades = true;
    },
    unlockCondition: () => gameState.goldenCoffee >= 1,
    type: 'toggle'
  },
  {
    id: 'auto_buy_items',
    name: 'Auto-Buy Items',
    description: 'Automatically purchase affordable items',
    cost: 4,
    effect: () => {
      gameState.settings.autoBuyItems = true;
    },
    unlockCondition: () => gameState.goldenCoffee >= 2,
    type: 'toggle'
  },
  {
    id: 'auto_claim_achievements',
    name: 'Auto-Claim Achievements',
    description: 'Automatically claim achievement rewards',
    cost: 2,
    effect: () => {
      gameState.settings.autoClaimAchievements = true;
    },
    unlockCondition: () => gameState.goldenCoffee >= 1,
    type: 'toggle'
  },
  {
    id: 'mark_notifications_read',
    name: 'Mark All Read',
    description: 'Clear all notifications (one-time action)',
    cost: 2,
    effect: () => {
      // Clear all active notifications
      activeNotifications.forEach(n => removeNotificationNow(n));
      // Clear unclaimed achievements
      gameState.unclaimedAchievements.clear();
      // Clear upgrade notifications
      gameState.viewedUpgrades = new Set([...gameState.viewedUpgrades, ...upgrades.map(u => u.id)]);
    },
    unlockCondition: () => gameState.goldenCoffee >= 1,
    type: 'action'
  },
  {
    id: 'permanent_cps_5',
    name: 'Permanent +5% CPS',
    description: 'Increase base CPS by 5% permanently',
    cost: 10,
    effect: () => {
      // This will be handled in calculateTotalCPS
      gameState.permanentCPSBonus = (gameState.permanentCPSBonus || 1) * 1.05;
    },
    unlockCondition: () => gameState.goldenCoffee >= 5,
    type: 'bonus'
  },
  {
    id: 'permanent_cps_10',
    name: 'Permanent +10% CPS',
    description: 'Increase base CPS by 10% permanently',
    cost: 20,
    effect: () => {
      gameState.permanentCPSBonus = (gameState.permanentCPSBonus || 1) * 1.10;
    },
    unlockCondition: () => gameState.goldenCoffee >= 10,
    type: 'bonus'
  },
  {
    id: 'permanent_cps_20',
    name: 'Permanent +20% CPS',
    description: 'Increase base CPS by 20% permanently',
    cost: 40,
    effect: () => {
      gameState.permanentCPSBonus = (gameState.permanentCPSBonus || 1) * 1.20;
    },
    unlockCondition: () => gameState.goldenCoffee >= 20,
    type: 'bonus'
  }
];

// Add permanentCPSBonus to gameState
gameState.permanentCPSBonus = 1.0;

// ═══ UTILITY FUNCTIONS ═══
function abbreviateNumber(num) {
  if (num < 1000) return Math.floor(num).toString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  if (num < 1000000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num < 1000000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num < 1000000000000000) return (num / 1000000000000).toFixed(1).replace(/\.0$/, '') + 'T';
  if (num < 1000000000000000000) return (num / 1000000000000000).toFixed(1).replace(/\.0$/, '') + 'Q';
  if (num < 1000000000000000000000) return (num / 1000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Qi';
  if (num < 1000000000000000000000000) return (num / 1000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Sx';
  if (num < 1000000000000000000000000000) return (num / 1000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Sp';
  if (num < 1000000000000000000000000000000) return (num / 1000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Oc';
  if (num < 1000000000000000000000000000000000) return (num / 1000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'No';
  if (num < 1000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Dc';
  if (num < 1000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Un';
  if (num < 1000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Du';
  if (num < 1000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Tr';
  if (num < 1000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Qa';
  if (num < 1000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Qi';
  if (num < 1000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Sx';
  if (num < 1000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Sp';
  if (num < 1000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Oc';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'No';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Vg';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Uv';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Dv';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Tv';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Qt';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Qn';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Sx';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Sp';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Oc';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'No';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Tg';
  return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Tg';
}

function calculateTotalCPS() {
  let totalCPS = 0;
  shopItems.forEach(item => {
    if (!gameState.items[item.id]) {
      gameState.items[item.id] = { count: 0, cost: item.baseCost };
    }
    const itemState = gameState.items[item.id];
    const multiplier = gameState.itemMultipliers[item.id] || 1;
    const count = itemState.count ?? 0;
    totalCPS += item.cps * count * multiplier;
  });
  return totalCPS * gameState.prestigeMultiplier * (gameState.permanentCPSBonus || 1);
}

function calculateItemCPS(item) {
  const multiplier = gameState.itemMultipliers[item.id] || 1;
  return item.cps * multiplier * gameState.prestigeMultiplier;
}

function calculateBulkCost(item, currentCount, amount) {
  const { baseCost, scale } = item;
  const firstCost = baseCost * Math.pow(scale, currentCount);
  const totalCost = firstCost * (Math.pow(scale, amount) - 1) / (scale - 1);
  return Math.floor(totalCost);
}

function calculateAffordableAmount(item, currentCount, maxAmount, availableCoffee) {
  let affordable = 0;
  for (let i = 1; i <= maxAmount; i++) {
    const cost = calculateBulkCost(item, currentCount, i);
    if (cost <= availableCoffee) {
      affordable = i;
    } else {
      break;
    }
  }
  return affordable;
}

function calculateSellValue(item, currentCount) {
  if (currentCount <= 0) return 0;
  const { baseCost, scale } = item;
  const lastCost = baseCost * Math.pow(scale, currentCount - 1);
  return Math.floor(lastCost * 0.5);
}

function isItemUnlocked(item) {
  const itemState = gameState.items[item.id];
  const hasOwned = (itemState?.count ?? 0) > 0;
  const canAfford50Percent = gameState.coffee >= (item.baseCost * 0.5);
  return hasOwned || canAfford50Percent;
}

// ═══ SAVE/LOAD SYSTEM ═══
function saveSettings() {
  localStorage.setItem('coffeeTycoonSettings', JSON.stringify(gameState.settings));
}

function loadSettings() {
  const saved = localStorage.getItem('coffeeTycoonSettings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      gameState.settings = { ...gameState.settings, ...settings };
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  }
}

function exportSave() {
  const saveData = {
    coffee: gameState.coffee,
    totalCoffeeAllTime: gameState.totalCoffeeAllTime,
    clickPower: gameState.clickPower,
    goldenCoffee: gameState.goldenCoffee,
    prestigeMultiplier: gameState.prestigeMultiplier,
    items: gameState.items,
    purchasedUpgrades: Array.from(gameState.purchasedUpgrades),
    purchasedGoldenUpgrades: Array.from(gameState.purchasedGoldenUpgrades),
    itemMultipliers: gameState.itemMultipliers,
    viewedUpgrades: Array.from(gameState.viewedUpgrades),
    viewedAchievements: Array.from(gameState.viewedAchievements),
    achievements: gameState.achievements.map(a => ({ id: a.id, earned: a.earned })),
    collapsedPacks: Array.from(gameState.collapsedPacks),
    unclaimedAchievements: Array.from(gameState.unclaimedAchievements),
    buyMode: gameState.buyMode,
    sellMode: gameState.sellMode,
    settings: gameState.settings,
    permanentCPSBonus: gameState.permanentCPSBonus
  };
  return btoa(JSON.stringify(saveData));
}

function importSave(importString) {
  try {
    const data = JSON.parse(atob(importString));
    gameState.coffee = data.coffee || 0;
    gameState.totalCoffeeAllTime = data.totalCoffeeAllTime || 0;
    gameState.clickPower = data.clickPower || 1;
    gameState.goldenCoffee = data.goldenCoffee || 0;
    if (gameState.goldenCoffee > 100) gameState.goldenCoffee = 100;
    gameState.prestigeMultiplier = data.prestigeMultiplier || 1.0;
    gameState.items = data.items || {};
    gameState.purchasedUpgrades = new Set(data.purchasedUpgrades || []);
    gameState.purchasedGoldenUpgrades = new Set(data.purchasedGoldenUpgrades || []);
    gameState.itemMultipliers = data.itemMultipliers || {};
    gameState.viewedUpgrades = new Set(data.viewedUpgrades || []);
    gameState.viewedAchievements = new Set(data.viewedAchievements || []);
    gameState.collapsedPacks = new Set(data.collapsedPacks || []);
    gameState.unclaimedAchievements = new Set(data.unclaimedAchievements || []);
    gameState.buyMode = data.buyMode || 1;
    gameState.sellMode = data.sellMode || 1;
    if (data.settings) {
      gameState.settings = { ...gameState.settings, ...data.settings };
    }
    if (data.permanentCPSBonus) {
      gameState.permanentCPSBonus = data.permanentCPSBonus;
    }

    shopItems.forEach(item => {
      if (!gameState.items[item.id]) {
        gameState.items[item.id] = { count: 0, cost: item.baseCost };
      }
    });

    if (data.achievements) {
      data.achievements.forEach(savedAch => {
        const ach = gameState.achievements.find(a => a.id === savedAch.id);
        if (ach) ach.earned = savedAch.earned;
      });
    }

    // Apply golden upgrades effects
    gameState.purchasedGoldenUpgrades.forEach(upgradeId => {
      const upgrade = goldenUpgrades.find(u => u.id === upgradeId);
      if (upgrade) {
        upgrade.effect();
      }
    });

    saveGame();
    updateUI();
    return true;
  } catch (e) {
    console.error('Error importing save:', e);
    return false;
  }
}

function eraseProgress() {
  if (confirm('Are you sure you want to erase ALL progress? This cannot be undone!')) {
    localStorage.clear();
    location.reload();
  }
}

function saveGame() {
  const saveData = {
    coffee: gameState.coffee,
    totalCoffeeAllTime: gameState.totalCoffeeAllTime,
    clickPower: gameState.clickPower,
    goldenCoffee: gameState.goldenCoffee,
    prestigeMultiplier: gameState.prestigeMultiplier,
    items: gameState.items,
    purchasedUpgrades: Array.from(gameState.purchasedUpgrades),
    itemMultipliers: gameState.itemMultipliers,
    viewedUpgrades: Array.from(gameState.viewedUpgrades),
    viewedAchievements: Array.from(gameState.viewedAchievements),
    achievements: gameState.achievements.map(a => ({ id: a.id, earned: a.earned })),
    collapsedPacks: Array.from(gameState.collapsedPacks),
    unclaimedAchievements: Array.from(gameState.unclaimedAchievements),
    buyMode: gameState.buyMode,
    sellMode: gameState.sellMode,
    settings: gameState.settings
  };
  localStorage.setItem('coffeeTycoonSave', JSON.stringify(saveData));
}

function loadGame() {
  const saved = localStorage.getItem('coffeeTycoonSave');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      gameState.coffee = data.coffee || 0;
      gameState.totalCoffeeAllTime = data.totalCoffeeAllTime || 0;
      gameState.clickPower = data.clickPower || 1;
      gameState.goldenCoffee = data.goldenCoffee || 0;
      if (gameState.goldenCoffee > 100) gameState.goldenCoffee = 100;
      gameState.prestigeMultiplier = data.prestigeMultiplier || 1.0;
      gameState.items = data.items || {};
      gameState.purchasedUpgrades = new Set(data.purchasedUpgrades || []);
      gameState.purchasedGoldenUpgrades = new Set(data.purchasedGoldenUpgrades || []);
      gameState.itemMultipliers = data.itemMultipliers || {};
      gameState.viewedUpgrades = new Set(data.viewedUpgrades || []);
      gameState.viewedAchievements = new Set(data.viewedAchievements || []);
      gameState.collapsedPacks = new Set(data.collapsedPacks || []);
      gameState.unclaimedAchievements = new Set(data.unclaimedAchievements || []);
      gameState.buyMode = data.buyMode || 1;
      gameState.sellMode = data.sellMode || 1;
      if (data.settings) {
        gameState.settings = { ...gameState.settings, ...data.settings };
      }
      if (data.permanentCPSBonus) {
        gameState.permanentCPSBonus = data.permanentCPSBonus;
      }

      shopItems.forEach(item => {
        if (!gameState.items[item.id]) {
          gameState.items[item.id] = { count: 0, cost: item.baseCost };
        }
      });

      if (data.achievements) {
        data.achievements.forEach(savedAch => {
          const ach = gameState.achievements.find(a => a.id === savedAch.id);
          if (ach) ach.earned = savedAch.earned;
        });
      }

      // Apply golden upgrades effects
      gameState.purchasedGoldenUpgrades.forEach(upgradeId => {
        const upgrade = goldenUpgrades.find(u => u.id === upgradeId);
        if (upgrade) {
          upgrade.effect();
        }
      });

      return true;
    } catch (e) {
      console.error('Error loading save:', e);
      return false;
    }
  }
  return false;
}

// ═══ CORE GAME ACTIONS ═══
function buyItem(itemId, amount = 1) {
  const shopItem = shopItems.find(i => i.id === itemId);
  if (!shopItem) return;

  if (!gameState.items[itemId]) {
    gameState.items[itemId] = { count: 0, cost: shopItem.baseCost };
  }

  const itemState = gameState.items[itemId];
  const currentCount = itemState.count ?? 0;

  const affordableAmount = calculateAffordableAmount(shopItem, currentCount, amount, gameState.coffee);

  if (affordableAmount === 0) return;

  const totalCost = calculateBulkCost(shopItem, currentCount, affordableAmount);

  if (gameState.coffee >= totalCost) {
    gameState.coffee -= totalCost;
    itemState.count = currentCount + affordableAmount;

    itemState.cost = Math.floor(shopItem.baseCost * Math.pow(shopItem.scale, itemState.count));

    if (affordableAmount > 1) {
      showPurchaseNotification(`Bought ${affordableAmount}× ${shopItem.name}`);
    } else {
      showPurchaseNotification(shopItem.name);
    }

    saveGame();
    updateUI();
  }
}

function sellItem(itemId, amount = 1) {
  const shopItem = shopItems.find(i => i.id === itemId);
  if (!shopItem) return;

  const itemState = gameState.items[itemId];
  if (!itemState || itemState.count <= 0) return;

  const amountToSell = Math.min(amount, itemState.count);
  let totalRefund = 0;
  for (let i = 0; i < amountToSell; i++) {
    const currentCount = itemState.count - i;
    totalRefund += calculateSellValue(shopItem, currentCount);
  }

  gameState.coffee += totalRefund;
  itemState.count -= amountToSell;

  itemState.cost = Math.floor(shopItem.baseCost * Math.pow(shopItem.scale, itemState.count));

  showSellNotification(shopItem.name, amountToSell);

  saveGame();
  updateUI();
}

function buyUpgrade(upgradeId) {
  const upgrade = upgrades.find(u => u.id === upgradeId);
  if (!upgrade || gameState.purchasedUpgrades.has(upgradeId)) return;
  
  if (gameState.coffee >= upgrade.cost) {
    gameState.coffee -= upgrade.cost;
    gameState.purchasedUpgrades.add(upgradeId);
    gameState.viewedUpgrades.add(upgradeId);
    upgrade.effect();
    
    const packId = upgrade.pack;
    if (packId) {
      removeNotificationsByPack(packId);
    }
    
    showPurchaseNotification(upgrade.name);
    
    saveGame();
    updateUI();
  }
}

function buyGoldenUpgrade(upgradeId) {
  const upgrade = goldenUpgrades.find(u => u.id === upgradeId);
  if (!upgrade || gameState.purchasedGoldenUpgrades.has(upgradeId)) return;
  
  if (gameState.goldenCoffee >= upgrade.cost) {
    gameState.goldenCoffee -= upgrade.cost;
    gameState.purchasedGoldenUpgrades.add(upgradeId);
    upgrade.effect();
    
    showPurchaseNotification(upgrade.name);
    
    saveGame();
    updateUI();
  }
}

function doPrestige() {
  const baseCost = 10000000000;
  const goldenCoffeeToGain = Math.min(100, Math.floor(Math.log2(gameState.totalCoffeeAllTime / baseCost + 1)));
  if (goldenCoffeeToGain > gameState.goldenCoffee && (gameState.goldenCoffee > 0 || goldenCoffeeToGain >= 1)) {
    const gained = goldenCoffeeToGain - gameState.goldenCoffee;
    if (confirm(`Prestige and gain ${gained} Golden Coffee?\n\nThis will reset:\n• Coffee count\n• All items\n• All upgrades\n\nYou will keep:\n• Golden Coffee\n• ${(goldenCoffeeToGain * 10)}% production multiplier\n• All achievements`)) {
      gameState.goldenCoffee = goldenCoffeeToGain;
      gameState.prestigeMultiplier = 1 + (gameState.goldenCoffee * 0.1);

      gameState.coffee = 0;
      gameState.clickPower = 1;
      gameState.purchasedUpgrades = new Set();
      gameState.itemMultipliers = {};

      shopItems.forEach(item => {
        gameState.items[item.id] = { count: 0, cost: item.baseCost };
      });

      showPurchaseNotification(`Prestiged! Gained ${gained} Golden Coffee!`);
      saveGame();
      updateUI();
    }
  }
}

function checkAchievements() {
  const currentTab = document.querySelector('.tab-btn.active')?.dataset.tab;
  
  gameState.achievements.forEach(a => {
    if (a.condition() && !a.earned) {
      a.earned = true;
      gameState.unclaimedAchievements.add(a.id);
      
      if (currentTab !== 'achievements') {
        showNotification(
          'Achievement Unlocked!',
          `${a.name}`,
          'achievement',
          { achievementId: a.id }
        );
      }
      
      saveGame();
    }
  });
}

function claimAchievementReward(achievement) {
  if (!achievement.reward || !gameState.unclaimedAchievements.has(achievement.id)) return '';
  
  gameState.unclaimedAchievements.delete(achievement.id);
  gameState.viewedAchievements.add(achievement.id);
  
  removeNotificationsByAchievement(achievement.id);
  
  showClaimNotification(achievement.name);
  
  if (achievement.reward.type === 'coffee') {
    gameState.coffee += achievement.reward.value;
    gameState.targetCoffee = gameState.coffee;
    saveGame();
    updateUI();
    return ` (+${abbreviateNumber(achievement.reward.value)} coffee!)`;
  } else if (achievement.reward.type === 'multiplier') {
    const itemId = achievement.reward.itemId;
    gameState.itemMultipliers[itemId] = (gameState.itemMultipliers[itemId] || 1) * achievement.reward.value;
    const itemName = shopItems.find(i => i.id === itemId)?.name;
    const multiplierPercent = ((achievement.reward.value - 1) * 100).toFixed(1);
    saveGame();
    updateUI();
    return ` (+${multiplierPercent}% ${itemName} production!)`;
  }
  
  return '';
}

function getRewardText(reward) {
  if (reward.type === 'coffee') {
    return `Reward: ${abbreviateNumber(reward.value)} Coffee`;
  } else if (reward.type === 'multiplier') {
    const itemName = shopItems.find(i => i.id === reward.itemId)?.name;
    const multiplierPercent = ((reward.value - 1) * 100).toFixed(1);
    return `Reward: +${multiplierPercent}% ${itemName} production`;
  }
  return '';
}

function getVisibleAchievements(achievementList) {
  const visible = [];
  for (let i = 0; i < achievementList.length; i++) {
    const achievement = achievementList[i];
    if (achievement.earned) {
      visible.push(achievement);
    } else {
      const previousEarned = i === 0 || achievementList[i - 1].earned;
      if (previousEarned) {
        visible.push(achievement);
      }
      break;
    }
  }
  return visible;
}

function getAchievementPacks() {
  const packs = [
    {
      id: 'coffee_milestones',
      title: 'Coffee Milestones',
      description: 'Achievements for brewing coffee',
      achievements: achievements.filter(a =>
        ['first', 'ten', 'hundred', 'thousand', 'tenk', 'hundredk',
         'million', 'tenmill', 'hundredmill', 'billion', 'tenb', 'hundredb',
         'trillion', 'tentr', 'hundredtr', 'quadrillion', 'tenq', 'hundredq', 'quintillion'].includes(a.id)
      )
    },
    {
      id: 'cps_milestones',
      title: 'CPS Milestones',
      description: 'Achievements for coffee per second',
      achievements: achievements.filter(a => a.id.startsWith('cps_'))
    },
    {
      id: 'general_collection',
      title: 'General Collection',
      description: 'Achievements for collecting any items',
      achievements: achievements.filter(a =>
        a.id.includes('_item') ||
        a.id.includes('_any') ||
        a.id.startsWith('total_')
      )
    },
    {
      id: 'upgrade_collection',
      title: 'Upgrade Collection',
      description: 'Achievements for purchasing upgrades',
      achievements: achievements.filter(a => a.id.startsWith('upgrades_'))
    }
  ];

  shopItems.forEach(item => {
    const itemAchievements = achievements.filter(a => a.id.startsWith(item.id + '_') && !a.id.includes('_any'));
    if (itemAchievements.length > 0 && isItemUnlocked(item)) {
      packs.push({
        id: item.id + '_pack',
        title: `${item.name} Collection`,
        description: `Achievements for owning ${item.name}s`,
        achievements: itemAchievements
      });
    }
  });

  return packs;
}

// ═══ AUTOMATION SYSTEM ═══
function runAutomation() {
  // Auto-buy upgrades
  if (gameState.settings.autoBuyUpgrades) {
    upgrades.forEach(upgrade => {
      if (!gameState.purchasedUpgrades.has(upgrade.id) && !gameState.viewedUpgrades.has(upgrade.id)) {
        if (gameState.coffee >= upgrade.cost && upgrade.unlockCondition()) {
          buyUpgrade(upgrade.id);
        }
      }
    });
  }

  // Auto-buy items
  if (gameState.settings.autoBuyItems) {
    shopItems.forEach(item => {
      if (isItemUnlocked(item)) {
        const itemState = gameState.items[item.id];
        const currentCount = itemState.count ?? 0;
        const affordableAmount = calculateAffordableAmount(item, currentCount, 1, gameState.coffee);
        if (affordableAmount > 0) {
          buyItem(item.id, affordableAmount);
        }
      }
    });
  }

  // Auto-claim achievements
  if (gameState.settings.autoClaimAchievements) {
    gameState.achievements.forEach(achievement => {
      if (achievement.earned && gameState.unclaimedAchievements.has(achievement.id)) {
        claimAchievementReward(achievement);
      }
    });
  }
}

// Add automation to the main game loop
let lastAutomationTime = 0;
function updateGameLoop() {
  const now = Date.now();
  
  // Run automation every 500ms
  if (now - lastAutomationTime > 500) {
    runAutomation();
    lastAutomationTime = now;
  }
  
  // Continue with existing game loop logic
  updateUI();
  requestAnimationFrame(updateGameLoop);
}

// Start the game loop
updateGameLoop();
