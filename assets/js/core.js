/* ═══════════════════════════════════════════════════════════════════════════
   COFFEE TYCOON v1.18 - CORE GAME LOGIC
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
  goldenUpgradeStacks: {}, // { upgradeId: times purchased } — for stackable golden upgrades
  itemMultipliers: {},
  viewedUpgrades: new Set(),
  viewedShopItems: new Set(), // shop item ids the player has seen (drives "new" tags + shop tab badge)
  celebratedMilestones: new Set(), // milestone ids already celebrated with confetti
  tutorialDone: false, // guided onboarding completed or skipped
  viewedAchievements: new Set(),
  achievements: [],
  collapsedPacks: new Set(),
  unclaimedAchievements: new Set(),
  discoveredDrinks: new Set(), // drink recipe ids discovered in the Research Lab
  activeDrinks: [], // drink recipe ids currently active (max 3, 4 with Extra Thermos)
  swapCharges: 3, // drink swap charges; regenerate over real time
  lastSwapRegen: null, // timestamp used to regenerate swap charges
  beans: 0, // green beans in stock (Roastery)
  lifetimeBeans: 0, // lifetime beans purchased (drives bean cost scaling)
  blends: {}, // roasted blend inventory { blendId: count }
  activeBlend: null, // { id, expiresAt } — one active blend at a time
  lifetimeBlendsRoasted: 0,
  lifetimeBlendsActivated: 0,
  // Super Coffee (v1.17) — temporary active-play bonuses
  superEffects: [], // [{ kind: 'cps'|'click', mult, expiresAt, label }]
  storm: null, // { mult, expiresAt } — coffee storm boosting all CPS
  mysteryCPSBonus: 1, // permanent CPS multiplier from Mystery Coffee Beans
  lifetimeSuperCoffee: 0,
  lifetimeGoldenSuperCoffee: 0,
  lifetimeStorms: 0,
  lifetimeMysteryBeans: 0,
  // Stats Window (v1.18) — lifetime production statistics
  stats: {
    startedAt: null, // timestamp of first production tick
    totalClicks: 0,
    clicksCoffee: 0, // lifetime coffee earned from manual clicks
    totalPrestiges: 0,
    maxCPS: 0,
    lifetimeGoldenEarned: 0,
    coffeeOffline: 0, // lifetime coffee from offline earnings
    coffeeByBuilding: {}, // { itemId: lifetime coffee produced }
    history: [] // [[timestamp, cps, totalCoffeeAllTime, goldenCoffee], ...] sampled every 30s, max 960
  },
  buyMode: 1, // ×1, ×10, ×100
  sellMode: 1,
  settings: {
    notifications: true,
    quickKeys: true,
    sound: true,
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
  { id: 'total_1000000', name: 'French Press Pharaoh', requirement: 'Own 1,000,000 total buildings', condition: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) >= 1000000, earned: false, progress: () => Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) + "/1,000,000", percent: () => Math.min(Object.values(gameState.items).reduce((sum, i) => sum + (i?.count ?? 0), 0) / 1000000 * 100, 100) || 0, reward: { type: 'coffee', value: 10000000 } },
  { id: 'lab_rat', name: 'Lab Rat', requirement: 'Discover 1 drink recipe in the Research Lab', condition: () => gameState.discoveredDrinks.size >= 1, earned: false, progress: () => gameState.discoveredDrinks.size + "/1", percent: () => Math.min(gameState.discoveredDrinks.size / 1 * 100, 100) || 0, reward: { type: 'coffee', value: 250 } },
  { id: 'master_brewer', name: 'Master Brewer', requirement: 'Discover all 10 drink recipes in the Research Lab', condition: () => gameState.discoveredDrinks.size >= 10, earned: false, progress: () => gameState.discoveredDrinks.size + "/10", percent: () => Math.min(gameState.discoveredDrinks.size / 10 * 100, 100) || 0, reward: { type: 'coffee', value: 10000 } },
  { id: 'bean_100', name: 'Bean Counter', requirement: 'Buy 100 green beans in the Roastery', condition: () => gameState.lifetimeBeans >= 100, earned: false, progress: () => gameState.lifetimeBeans + "/100", percent: () => Math.min(gameState.lifetimeBeans / 100 * 100, 100) || 0, reward: { type: 'coffee', value: 5000000 } },
  { id: 'blend_10', name: 'Blend Connoisseur', requirement: 'Activate 10 blends in the Roastery', condition: () => gameState.lifetimeBlendsActivated >= 10, earned: false, progress: () => gameState.lifetimeBlendsActivated + "/10", percent: () => Math.min(gameState.lifetimeBlendsActivated / 10 * 100, 100) || 0, reward: { type: 'coffee', value: 10000000 } },
  { id: 'super_1', name: 'Super Sipper', requirement: 'Collect 1 Super Coffee', condition: () => gameState.lifetimeSuperCoffee >= 1, earned: false, progress: () => gameState.lifetimeSuperCoffee + "/1", percent: () => Math.min(gameState.lifetimeSuperCoffee / 1 * 100, 100) || 0, reward: { type: 'coffee', value: 5000 } },
  { id: 'super_25', name: 'Super Collector', requirement: 'Collect 25 Super Coffees', condition: () => gameState.lifetimeSuperCoffee >= 25, earned: false, progress: () => gameState.lifetimeSuperCoffee + "/25", percent: () => Math.min(gameState.lifetimeSuperCoffee / 25 * 100, 100) || 0, reward: { type: 'coffee', value: 250000 } },
  { id: 'golden_super_1', name: 'Golden Gulp', requirement: 'Buy 1 Golden Super Coffee', condition: () => gameState.lifetimeGoldenSuperCoffee >= 1, earned: false, progress: () => gameState.lifetimeGoldenSuperCoffee + "/1", percent: () => Math.min(gameState.lifetimeGoldenSuperCoffee / 1 * 100, 100) || 0, reward: { type: 'coffee', value: 1000000 } },
  { id: 'storm_1', name: 'Storm Chaser', requirement: 'Experience 1 coffee storm', condition: () => gameState.lifetimeStorms >= 1, earned: false, progress: () => gameState.lifetimeStorms + "/1", percent: () => Math.min(gameState.lifetimeStorms / 1 * 100, 100) || 0, reward: { type: 'coffee', value: 50000 } },
  { id: 'mystery_1', name: 'Mystery Solver', requirement: 'Find 1 Mystery Coffee Bean', condition: () => gameState.lifetimeMysteryBeans >= 1, earned: false, progress: () => gameState.lifetimeMysteryBeans + "/1", percent: () => Math.min(gameState.lifetimeMysteryBeans / 1 * 100, 100) || 0, reward: { type: 'coffee', value: 100000 } }
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
    progress: () => formatNumber(calculateTotalCPS()) + "/" + formatNumber(milestone.value),
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
    type: 'toggle',
    setting: 'autoBuyUpgrades'
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
    type: 'toggle',
    setting: 'autoBuyItems'
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
    type: 'toggle',
    setting: 'autoClaimAchievements'
  },
  {
    id: 'mark_notifications_read',
    name: 'Mark All Read',
    description: 'Claim all pending achievement rewards and clear notifications (one-time action)',
    cost: 2,
    effect: () => {
      // Clear all active notifications first...
      activeNotifications.forEach(n => removeNotificationNow(n));
      // ...then CLAIM (never delete) all pending achievement rewards
      [...gameState.unclaimedAchievements].forEach(id => {
        const achievement = gameState.achievements.find(a => a.id === id);
        if (achievement) claimAchievementReward(achievement);
      });
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
      gameState.cpsBonus5Count++;
      recalculatePermanentCPSBonus();
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
      gameState.cpsBonus10Count++;
      recalculatePermanentCPSBonus();
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
      gameState.cpsBonus20Count++;
      recalculatePermanentCPSBonus();
    },
    unlockCondition: () => gameState.goldenCoffee >= 20,
    type: 'bonus'
  },
  {
    id: 'research_lab',
    name: 'Research Lab',
    description: 'Unlock the Research Lab tab: discover drink recipes with powerful buffs and debuffs',
    cost: 3,
    effect: () => {},
    unlockCondition: () => gameState.goldenCoffee >= 1,
    type: 'building'
  },
  {
    id: 'extra_thermos',
    name: 'Extra Thermos',
    description: 'Research Lab: +1 active drink slot (4 total)',
    cost: 5,
    effect: () => {},
    unlockCondition: () => gameState.purchasedGoldenUpgrades.has('research_lab'),
    type: 'building'
  },
  {
    id: 'rapid_experimentation',
    name: 'Rapid Experimentation',
    description: 'Research Lab: drink swaps regenerate twice as fast',
    cost: 4,
    effect: () => {},
    unlockCondition: () => gameState.purchasedGoldenUpgrades.has('research_lab'),
    type: 'building'
  },
  {
    id: 'potent_brews',
    name: 'Potent Brews',
    description: 'Research Lab: drink buffs are 25% stronger (debuffs unaffected)',
    cost: 6,
    effect: () => {},
    unlockCondition: () => gameState.purchasedGoldenUpgrades.has('research_lab'),
    type: 'building'
  },
  // ── Roastery building (v1.16) ──
  {
    id: 'roastery',
    name: 'Roastery',
    description: 'Unlock the Roastery tab: buy green beans, roast them into blends, and activate blends for temporary global boosts',
    cost: 8,
    effect: () => {},
    unlockCondition: () => gameState.goldenCoffee >= 5,
    type: 'building'
  },
  {
    id: 'master_roaster',
    name: 'Master Roaster',
    description: 'Roastery: roasting costs 25% fewer green beans per stack',
    cost: 10,
    costScale: 2,
    stackable: true,
    effect: () => {},
    unlockCondition: () => gameState.purchasedGoldenUpgrades.has('roastery'),
    type: 'building'
  },
  {
    id: 'blend_mastery',
    name: 'Blend Mastery',
    description: 'Roastery: active blends last 50% longer per stack',
    cost: 10,
    costScale: 2,
    stackable: true,
    effect: () => {},
    unlockCondition: () => gameState.purchasedGoldenUpgrades.has('roastery'),
    type: 'building'
  },
  {
    id: 'double_batch',
    name: 'Double Batch',
    description: 'Roastery: each roast produces +1 extra blend per stack',
    cost: 12,
    costScale: 2,
    stackable: true,
    effect: () => {},
    unlockCondition: () => gameState.purchasedGoldenUpgrades.has('roastery'),
    type: 'building'
  }
];

// Permanent CPS bonus — derived from purchase counts so it can be rebuilt
// on load without re-applying (and compounding) the upgrade effects
gameState.permanentCPSBonus = 1.0;
gameState.cpsBonus5Count = 0;
gameState.cpsBonus10Count = 0;
gameState.cpsBonus20Count = 0;

// ═══ RESEARCH LAB — DRINK RECIPES ═══
// effect axes: cps (CPS multiplier), click (click power multiplier),
// shopCost (shop price multiplier, <1 = discount), offline (offline earnings multiplier)
const drinkRecipes = [
  { id: 'double_espresso', name: 'Double Espresso', description: 'Twice the beans, twice the buzz.', discoveryCost: 5000, effect: { cps: 1.2, click: 0.85 } },
  { id: 'cold_brew', name: 'Cold Brew', description: 'Slow-steeped and smooth. Strengthens the hands.', discoveryCost: 5000, effect: { click: 1.3, cps: 0.9 } },
  { id: 'caramel_latte', name: 'Caramel Latte', description: 'Sweet talk for your suppliers.', discoveryCost: 25000, effect: { shopCost: 0.9, cps: 0.95 } },
  { id: 'black_coffee', name: 'Black Coffee', description: 'No frills. Just production.', discoveryCost: 50000, effect: { cps: 1.1 } },
  { id: 'mocha_madness', name: 'Mocha Madness', description: 'Chocolate-fueled frenzy on the production floor.', discoveryCost: 200000, effect: { cps: 1.35, click: 0.8 } },
  { id: 'decaf_delight', name: 'Decaf Delight', description: 'The night shift never sleeps.', discoveryCost: 200000, effect: { offline: 1.3, cps: 0.95 } },
  { id: 'nitro_boost', name: 'Nitro Boost', description: 'Infused with pure velocity.', discoveryCost: 1000000, effect: { click: 1.6, cps: 0.85 } },
  { id: 'pumpkin_spice', name: 'Pumpkin Spice', description: 'Basic, but brutally effective.', discoveryCost: 1000000, effect: { cps: 1.15, click: 1.15, shopCost: 1.1 } },
  { id: 'french_press', name: 'French Press', description: 'Full-immersion brewing for full-immersion profits.', discoveryCost: 5000000, effect: { cps: 1.25, offline: 0.9 } },
  { id: 'turkish_coffee', name: 'Turkish Coffee', description: 'Ancient. Intense. Uncompromising.', discoveryCost: 25000000, effect: { cps: 1.5, click: 0.75, shopCost: 1.05 } }
];

const SWAP_MAX_CHARGES = 3;
const SWAP_REGEN_MS = 5 * 60 * 1000; // one swap every 5 minutes of real time

function maxActiveDrinks() {
  return 3 + (gameState.purchasedGoldenUpgrades.has('extra_thermos') ? 1 : 0);
}

function swapRegenMs() {
  return gameState.purchasedGoldenUpgrades.has('rapid_experimentation') ? SWAP_REGEN_MS / 2 : SWAP_REGEN_MS;
}

// Combined multipliers from all active drinks (stack multiplicatively).
// Potent Brews amplifies only the beneficial (buff) side of each drink.
function getDrinkMultipliers() {
  const mults = { cps: 1, click: 1, shopCost: 1, offline: 1 };
  const potent = gameState.purchasedGoldenUpgrades.has('potent_brews');
  gameState.activeDrinks.forEach(id => {
    const drink = drinkRecipes.find(d => d.id === id);
    if (!drink) return;
    for (const key of Object.keys(mults)) {
      let m = drink.effect[key] || 1;
      if (potent && m > 1) m = 1 + (m - 1) * 1.25;
      mults[key] *= m;
    }
  });
  return mults;
}

// Regenerate swap charges based on elapsed real time. Called on load and
// every second by the game loop so swaps tick up even while playing.
function regenSwaps() {
  if (gameState.swapCharges >= SWAP_MAX_CHARGES) {
    gameState.lastSwapRegen = Date.now();
    return;
  }
  const regenMs = swapRegenMs();
  let last = gameState.lastSwapRegen || Date.now();
  const now = Date.now();
  while (gameState.swapCharges < SWAP_MAX_CHARGES && now - last >= regenMs) {
    gameState.swapCharges++;
    last += regenMs;
  }
  gameState.lastSwapRegen = last;
}

function discoverDrink(drinkId, quiet = false) {
  const drink = drinkRecipes.find(d => d.id === drinkId);
  if (!drink || gameState.discoveredDrinks.has(drinkId)) return false;
  if (gameState.coffee < drink.discoveryCost) {
    if (!quiet) showNotification(`Not enough coffee to research ${drink.name}`, 'warning');
    return false;
  }
  gameState.coffee -= drink.discoveryCost;
  gameState.discoveredDrinks.add(drinkId);
  if (!quiet) showNotification(`Discovered recipe: ${drink.name}!`, 'success');
  checkAchievements();
  saveGame();
  return true;
}

// Activating or deactivating a drink costs 1 swap charge.
function setDrinkActive(drinkId, active, quiet = false) {
  const drink = drinkRecipes.find(d => d.id === drinkId);
  if (!drink || !gameState.discoveredDrinks.has(drinkId)) return false;
  const isActive = gameState.activeDrinks.includes(drinkId);
  if (active === isActive) return false;
  if (gameState.swapCharges < 1) {
    if (!quiet) showNotification('No drink swaps left — they regenerate over time', 'warning');
    return false;
  }
  if (active && gameState.activeDrinks.length >= maxActiveDrinks()) {
    if (!quiet) showNotification('No empty flask — deactivate a drink first', 'warning');
    return false;
  }
  gameState.swapCharges--;
  gameState.lastSwapRegen = Date.now();
  if (active) {
    gameState.activeDrinks.push(drinkId);
    if (!quiet) showNotification(`${drink.name} is now brewing!`, 'success');
  } else {
    gameState.activeDrinks = gameState.activeDrinks.filter(id => id !== drinkId);
    if (!quiet) showNotification(`${drink.name} poured out`, 'info');
  }
  saveGame();
  return true;
}

// ═══ ROASTERY (v1.16) ═══
// Buy green beans (1B coffee base, 1.15x per lifetime bean), roast them into
// blends, and activate one blend at a time for temporary global boosts.
const BEAN_BASE_COST = 1e9;
const BEAN_SCALE = 1.15;

const blendRecipes = [
  {
    id: 'light',
    name: 'Light Roast',
    description: 'Bright, lively, and quick to roast.',
    beanCost: 10,
    durationMs: 5 * 60 * 1000,
    effect: { cps: 1.25 }
  },
  {
    id: 'medium',
    name: 'Medium Roast',
    description: 'Balanced and smooth, a little of everything.',
    beanCost: 25,
    durationMs: 5 * 60 * 1000,
    effect: { cps: 1.15, click: 1.15 }
  },
  {
    id: 'dark',
    name: 'Dark Roast',
    description: 'Bold and intense production surge.',
    beanCost: 50,
    durationMs: 3 * 60 * 1000,
    effect: { cps: 1.5 }
  },
  {
    id: 'french',
    name: 'French Roast',
    description: 'Dark, smoky, enormously powerful — but brief.',
    beanCost: 100,
    durationMs: 2 * 60 * 1000,
    effect: { cps: 2.0 }
  },
  {
    id: 'italian',
    name: 'Italian Roast',
    description: 'For night owls: stronger clicks and better offline hauls.',
    beanCost: 150,
    durationMs: 5 * 60 * 1000,
    effect: { click: 2.0, offline: 1.25 }
  }
];

// Cost of buying `count` beans: geometric series over lifetime purchases.
function beanCost(count = 1) {
  const first = BEAN_BASE_COST * Math.pow(BEAN_SCALE, gameState.lifetimeBeans);
  return Math.floor(first * (Math.pow(BEAN_SCALE, count) - 1) / (BEAN_SCALE - 1));
}

function buyBeans(count = 1) {
  const cost = beanCost(count);
  if (gameState.coffee < cost) {
    showNotification('Not Enough Coffee', `Need ${formatNumber(cost)} coffee for ${count} bean${count !== 1 ? 's' : ''}.`, 'info');
    return false;
  }
  gameState.coffee -= cost;
  gameState.beans += count;
  gameState.lifetimeBeans += count;
  showPurchaseNotification(count === 1 ? 'Green Coffee Beans' : `${count}x Green Coffee Beans`, count);
  playSfx('purchaseorclaim');
  checkAchievements();
  saveGame();
  return true;
}

function roastBeanCost(blend) {
  const discount = Math.pow(0.75, goldenUpgradeStacks('master_roaster'));
  return Math.max(1, Math.ceil(blend.beanCost * discount));
}

function roastBlend(blendId) {
  const blend = blendRecipes.find(b => b.id === blendId);
  if (!blend) return false;
  const cost = roastBeanCost(blend);
  if (gameState.beans < cost) {
    showNotification('Not Enough Beans', `Roasting ${blend.name} needs ${cost} green beans.`, 'info');
    return false;
  }
  gameState.beans -= cost;
  const batch = 1 + goldenUpgradeStacks('double_batch');
  gameState.blends[blendId] = (gameState.blends[blendId] || 0) + batch;
  gameState.lifetimeBlendsRoasted += batch;
  showPurchaseNotification(batch === 1 ? blend.name : `${batch}x ${blend.name}`, batch);
  playSfx('purchaseorclaim');
  checkAchievements();
  saveGame();
  return true;
}

function blendDurationMs(blend) {
  const longer = Math.pow(1.5, goldenUpgradeStacks('blend_mastery'));
  return Math.floor(blend.durationMs * longer);
}

// ═══ STACKABLE GOLDEN UPGRADES ═══
// Roastery golden upgrades can be purchased repeatedly; each purchase (stack)
// multiplies the effect and doubles the price of the next stack.
function goldenUpgradeStacks(id) {
  return gameState.goldenUpgradeStacks[id] || 0;
}

function goldenUpgradeCost(upgrade) {
  if (!upgrade.stackable) return upgrade.cost;
  return Math.floor(upgrade.cost * Math.pow(upgrade.costScale || 2, goldenUpgradeStacks(upgrade.id)));
}

// Multipliers from the currently active blend (stacks multiplicatively with
// everything else). Expired blends contribute nothing; the game loop clears
// them via tickBlendExpiry().
function getBlendMultipliers() {
  const mults = { cps: 1, click: 1, offline: 1 };
  const active = gameState.activeBlend;
  if (!active) return mults;
  if (Date.now() >= active.expiresAt) return mults;
  const blend = blendRecipes.find(b => b.id === active.id);
  if (!blend) return mults;
  for (const key of Object.keys(mults)) {
    mults[key] *= (blend.effect[key] || 1);
  }
  return mults;
}

// Activating a blend consumes one from inventory and replaces any active blend.
function activateBlend(blendId) {
  const blend = blendRecipes.find(b => b.id === blendId);
  if (!blend) return false;
  if ((gameState.blends[blendId] || 0) < 1) {
    showNotification('No Blends Ready', `Roast ${blend.name} first, then activate it.`, 'info');
    return false;
  }
  gameState.blends[blendId] -= 1;
  gameState.activeBlend = { id: blendId, expiresAt: Date.now() + blendDurationMs(blend) };
  gameState.lifetimeBlendsActivated += 1;
  showNotification(`${blend.name} Activated!`, describeBlendEffect(blend), 'default');
  playSfx('purchaseorclaim');
  checkAchievements();
  saveGame();
  return true;
}

function describeBlendEffect(blend) {
  const parts = [];
  if (blend.effect.cps) parts.push(`+${Math.round((blend.effect.cps - 1) * 100)}% CPS`);
  if (blend.effect.click) parts.push(`+${Math.round((blend.effect.click - 1) * 100)}% click power`);
  if (blend.effect.offline) parts.push(`+${Math.round((blend.effect.offline - 1) * 100)}% offline earnings`);
  const mins = Math.round(blendDurationMs(blend) / 60000);
  return `${parts.join(', ')} for ${mins} min`;
}

// Called by the per-second game loop: clears an expired active blend.
function tickBlendExpiry() {
  if (gameState.activeBlend && Date.now() >= gameState.activeBlend.expiresAt) {
    const blend = blendRecipes.find(b => b.id === gameState.activeBlend.id);
    gameState.activeBlend = null;
    showNotification('Blend Wore Off', `${blend ? blend.name : 'Active blend'} has worn off.`, 'info');
    saveGame();
  }
}

// ═══ SUPER COFFEE (v1.17) ═══
// Randomly spawning Super Coffees with temporary bonuses, occasional Golden
// Super Coffees (purchased with Golden Coffee), coffee storms that boost all
// CPS 2x-5x, and rare Mystery Coffee Beans. These are active-play bonuses:
// they do NOT apply to offline earnings.
const SUPER_SPAWN_CHANCE = 1 / 300; // per second, ~once every 5 min on average
const SUPER_DESPAWN_MS = 25000;
const GOLDEN_SUPER_CHANCE = 0.08; // of super spawns
const GOLDEN_SUPER_COST = 5; // Golden Coffee
const GOLDEN_SUPER_DESPAWN_MS = 30000;
const MYSTERY_BEAN_CHANCE = 0.03; // of super spawns
const STORM_CHANCE = 1 / 2400; // per second, ~once every 40 min on average

const superCoffeeBonuses = [
  { id: 'cps_rush', label: 'Espresso Rush', description: '2× CPS for 60s', weight: 3, apply: () => addSuperEffect('cps', 2, 60 * 1000, 'Espresso Rush') },
  { id: 'click_frenzy', label: 'Click Frenzy', description: '5× click power for 30s', weight: 2, apply: () => addSuperEffect('click', 5, 30 * 1000, 'Click Frenzy') },
  { id: 'instant_brew', label: 'Instant Brew', description: '+10 minutes of CPS instantly', weight: 3, apply: () => {
    const gain = Math.max(calculateTotalCPS() * 600, 1000);
    gameState.coffee += gain;
    gameState.totalCoffeeAllTime += gain;
    return `+${formatNumber(gain)} coffee!`;
  } },
  { id: 'storm_call', label: 'Storm Call', description: 'Summons a coffee storm!', weight: 1, apply: () => { startStorm(); return 'A coffee storm brews on the horizon!'; } }
];

const mysteryBeanOutcomes = [
  { id: 'jackpot', label: 'Jackpot Beans', description: '+2 Golden Coffee', weight: 1, apply: () => {
    gameState.goldenCoffee = Math.min(gameState.goldenCoffee + 2, MAX_GOLDEN_COFFEE);
    ensureStats().lifetimeGoldenEarned += 2;
    return '+2 Golden Coffee!';
  } },
  { id: 'ancient', label: 'Ancient Blend', description: 'Permanent +5% CPS', weight: 2, apply: () => {
    gameState.mysteryCPSBonus *= 1.05;
    return 'Permanent +5% CPS!';
  } },
  { id: 'time_warp', label: 'Time Warp', description: '+1 hour of CPS instantly', weight: 2, apply: () => {
    const gain = Math.max(calculateTotalCPS() * 3600, 10000);
    gameState.coffee += gain;
    gameState.totalCoffeeAllTime += gain;
    return `+${formatNumber(gain)} coffee!`;
  } },
  { id: 'bean_feast', label: 'Bean Feast', description: '+100 green beans', weight: 2, apply: () => {
    gameState.beans += 100;
    gameState.lifetimeBeans += 100;
    return '+100 green beans!';
  } }
];

function pickWeighted(list) {
  const total = list.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of list) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return list[list.length - 1];
}

function addSuperEffect(kind, mult, durationMs, label) {
  gameState.superEffects.push({ kind, mult, expiresAt: Date.now() + durationMs, label });
  return `${label}: ${kind === 'cps' ? mult + '× CPS' : mult + '× click power'}`;
}

// Multipliers from active super effects + coffee storm (multiplicative).
function getSuperMultipliers() {
  const mults = { cps: 1, click: 1 };
  const now = Date.now();
  for (const fx of gameState.superEffects) {
    if (fx.expiresAt > now && (fx.kind === 'cps' || fx.kind === 'click')) {
      mults[fx.kind] *= fx.mult;
    }
  }
  if (gameState.storm && gameState.storm.expiresAt > now) {
    mults.cps *= gameState.storm.mult;
  }
  return mults;
}

function pruneSuperEffects() {
  const now = Date.now();
  const before = gameState.superEffects.length;
  gameState.superEffects = gameState.superEffects.filter(fx => fx.expiresAt > now);
  let stormEnded = false;
  if (gameState.storm && gameState.storm.expiresAt <= now) {
    gameState.storm = null;
    stormEnded = true;
    showNotification('Storm Passed', 'The coffee storm has blown over.', 'info');
  }
  if (gameState.superEffects.length !== before || stormEnded) saveGame();
}

function collectSuperCoffee() {
  gameState.lifetimeSuperCoffee++;
  const bonus = pickWeighted(superCoffeeBonuses);
  const result = bonus.apply();
  showNotification(`☕ Super Coffee: ${bonus.label}!`, typeof result === 'string' ? result : bonus.description, 'default');
  playSfx('purchaseorclaim');
  checkAchievements();
  saveGame();
}

function buyGoldenSuperCoffee() {
  if (gameState.goldenCoffee < GOLDEN_SUPER_COST) {
    showNotification('Not Enough Golden Coffee', `A Golden Super Coffee costs ${GOLDEN_SUPER_COST} Golden Coffee.`, 'info');
    return false;
  }
  gameState.goldenCoffee -= GOLDEN_SUPER_COST;
  gameState.lifetimeGoldenSuperCoffee++;
  const result = addSuperEffect('cps', 3, 5 * 60 * 1000, 'Golden Brew');
  showNotification('✨ Golden Super Coffee!', `${result} — 3× CPS for 5 minutes!`, 'default');
  playSfx('purchaseorclaim');
  checkAchievements();
  saveGame();
  return true;
}

function collectMysteryBean() {
  gameState.lifetimeMysteryBeans++;
  const outcome = pickWeighted(mysteryBeanOutcomes);
  const result = outcome.apply();
  showNotification(`❓ Mystery Coffee Beans: ${outcome.label}!`, `${outcome.description} ${result}`, 'default');
  playSfx('purchaseorclaim');
  checkAchievements();
  saveGame();
}

function startStorm(mult) {
  const stormMult = mult || (2 + Math.floor(Math.random() * 4)); // 2x-5x
  const durationMs = (60 + Math.floor(Math.random() * 61)) * 1000; // 60-120s
  gameState.storm = { mult: stormMult, expiresAt: Date.now() + durationMs };
  gameState.lifetimeStorms++;
  showNotification('⛈ Coffee Storm!', `All CPS boosted ${stormMult}× for ${Math.round(durationMs / 1000)}s!`, 'default');
  playSfx('purchaseorclaim');
  checkAchievements();
  saveGame();
}

// Called by the per-second game loop. Spawning is handled by ui.js
// (it owns the spawn button DOM); this rolls the dice and reports spawns.
function rollSuperSpawns() {
  if (document.hidden) return null;
  if (uiSuperSpawnActive()) return null; // one spawn on screen at a time
  if (Math.random() >= SUPER_SPAWN_CHANCE) {
    // No super coffee this tick — maybe a storm instead
    if (gameState.totalCoffeeAllTime >= 100000 && !gameState.storm && Math.random() < STORM_CHANCE) {
      startStorm();
    }
    return null;
  }
  if (gameState.totalCoffeeAllTime < 5000) return null;
  const roll = Math.random();
  if (roll < MYSTERY_BEAN_CHANCE && gameState.totalCoffeeAllTime >= 50000) return 'mystery';
  if (roll < MYSTERY_BEAN_CHANCE + GOLDEN_SUPER_CHANCE && gameState.goldenCoffee >= GOLDEN_SUPER_COST) return 'golden';
  return 'super';
}

function recalculatePermanentCPSBonus() {
  gameState.permanentCPSBonus =
    Math.pow(1.05, gameState.cpsBonus5Count || 0) *
    Math.pow(1.10, gameState.cpsBonus10Count || 0) *
    Math.pow(1.20, gameState.cpsBonus20Count || 0);
}

// ═══ PRESTIGE MATH (single source of truth for all prestige UI/logic) ═══
const PRESTIGE_BASE_COST = 10000000000;
const MAX_GOLDEN_COFFEE = 100;

function goldenCoffeeForTotal(totalCoffee) {
  return Math.min(MAX_GOLDEN_COFFEE, Math.floor(Math.log2(totalCoffee / PRESTIGE_BASE_COST + 1)));
}

function prestigeGain() {
  return Math.max(0, goldenCoffeeForTotal(gameState.totalCoffeeAllTime) - gameState.goldenCoffee);
}

// Total lifetime coffee needed to earn the next Golden Coffee
function nextGoldenThreshold() {
  return PRESTIGE_BASE_COST * (Math.pow(2, gameState.goldenCoffee + 1) - 1);
}

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
  if (num < 1000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'QiD';
  if (num < 1000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'SxD';
  if (num < 1000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'SpD';
  if (num < 1000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'OcD';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'NoD';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Vg';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Uv';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Dv';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Tv';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Qt';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Qn';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'SxV';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'SpV';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'OcV';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'NoV';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'NoT';
  if (num < 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000) return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Tg';
  return (num / 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + 'Tg';
}

// Display formatting: abbreviated (default) or full with thousands separators
function formatNumber(num) {
  if (gameState.settings.numberDisplay === 'full') {
    return Math.floor(num).toLocaleString('en-US');
  }
  return abbreviateNumber(num);
}

function calculateTotalCPS() {
  return calculateCPSBreakdown().total;
}

// Per-building CPS breakdown (v1.18 Stats Window). Returns
// { total, perItem: { itemId: cps }, global } where global is the
// combined multiplier applied on top of every building.
function calculateCPSBreakdown() {
  const perItem = {};
  let base = 0;
  shopItems.forEach(item => {
    if (!gameState.items[item.id]) {
      gameState.items[item.id] = { count: 0, cost: item.baseCost };
    }
    const itemState = gameState.items[item.id];
    const multiplier = gameState.itemMultipliers[item.id] || 1;
    const count = itemState.count ?? 0;
    const unit = item.cps * multiplier * count;
    perItem[item.id] = unit;
    base += unit;
  });
  const global = gameState.prestigeMultiplier * (gameState.permanentCPSBonus || 1) * (gameState.mysteryCPSBonus || 1) * getDrinkMultipliers().cps * getBlendMultipliers().cps * getSuperMultipliers().cps;
  let total = 0;
  for (const id in perItem) {
    perItem[id] *= global;
    total += perItem[id];
  }
  return { total, perItem, global };
}

// Backfill stats defaults for saves from before v1.18.
function ensureStats() {
  if (!gameState.stats || typeof gameState.stats !== 'object') gameState.stats = {};
  const s = gameState.stats;
  if (typeof s.startedAt !== 'number') s.startedAt = null;
  s.totalClicks = s.totalClicks || 0;
  s.clicksCoffee = s.clicksCoffee || 0;
  s.totalPrestiges = s.totalPrestiges || 0;
  s.maxCPS = s.maxCPS || 0;
  s.lifetimeGoldenEarned = s.lifetimeGoldenEarned || 0;
  s.coffeeOffline = s.coffeeOffline || 0;
  if (!s.coffeeByBuilding || typeof s.coffeeByBuilding !== 'object') s.coffeeByBuilding = {};
  if (!Array.isArray(s.history)) s.history = [];
  return s;
}

// Credit one production tick and record per-building lifetime stats.
// Returns { earned, totalCPS }.
function creditProduction(elapsedSeconds) {
  ensureStats();
  const s = gameState.stats;
  if (!s.startedAt) s.startedAt = Date.now();
  const { total, perItem } = calculateCPSBreakdown();
  let earned = 0;
  if (total > 0 && elapsedSeconds > 0) {
    earned = total * elapsedSeconds;
    gameState.coffee += earned;
    gameState.totalCoffeeAllTime += earned;
    for (const id in perItem) {
      if (perItem[id] > 0) {
        s.coffeeByBuilding[id] = (s.coffeeByBuilding[id] || 0) + perItem[id] * elapsedSeconds;
      }
    }
  }
  return { earned, totalCPS: total };
}

// Sample the production timeline (v1.18): every 30s, keep 960 samples (8h).
const STATS_SAMPLE_MS = 30000;
const STATS_HISTORY_MAX = 960;
function sampleStatsHistory() {
  const s = ensureStats();
  const now = Date.now();
  const cps = calculateTotalCPS();
  if (cps > s.maxCPS) s.maxCPS = cps;
  const last = s.history[s.history.length - 1];
  if (last && now - last[0] < STATS_SAMPLE_MS) return;
  s.history.push([now, cps, gameState.totalCoffeeAllTime, gameState.goldenCoffee]);
  while (s.history.length > STATS_HISTORY_MAX) s.history.shift();
}

function trackClick(earned) {
  const s = ensureStats();
  s.totalClicks++;
  s.clicksCoffee += earned;
}

function calculateItemCPS(item) {
  const multiplier = gameState.itemMultipliers[item.id] || 1;
  return item.cps * multiplier * gameState.prestigeMultiplier * (gameState.permanentCPSBonus || 1) * (gameState.mysteryCPSBonus || 1) * getDrinkMultipliers().cps * getBlendMultipliers().cps * getSuperMultipliers().cps;
}

function calculateBulkCost(item, currentCount, amount) {
  const { baseCost, scale } = item;
  const firstCost = baseCost * Math.pow(scale, currentCount);
  const totalCost = firstCost * (Math.pow(scale, amount) - 1) / (scale - 1);
  return Math.floor(totalCost * getDrinkMultipliers().shopCost);
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

function notificationsEnabled() {
  return gameState.settings.notifications !== false;
}

// ═══ SOUND EFFECTS ═══
// Files live in sfx/ (buttonclick.mp3, purchaseorclaim.mp3). Pools of clones
// per file let rapid clicks overlap without cutting each other off.
const sfxSounds = {};
const sfxPools = {};
const SFX_POOL_SIZE = 5;

function initSfx() {
  if (typeof Audio === 'undefined') return;
  ['buttonclick', 'purchaseorclaim'].forEach(name => {
    try {
      const base = new Audio(`sfx/${name}.mp3`);
      base.preload = 'auto';
      sfxSounds[name] = base;
      sfxPools[name] = Array.from({ length: SFX_POOL_SIZE }, () => base.cloneNode());
    } catch (e) {
      // Audio unavailable (or blocked): game continues silently
    }
  });
}

function playSfx(name) {
  if (!gameState.settings.sound) return;
  const pool = sfxPools[name];
  if (!pool) return;
  // Find a clone that has finished playing; fall back to the first one
  const sound = pool.find(s => s.paused || s.ended) || pool[0];
  try {
    sound.currentTime = 0;
    sound.play().catch(() => {}); // autoplay policies may block until first user gesture
  } catch (e) {
    // Ignore playback errors
  }
}

// ═══ OFFLINE EARNINGS ═══
let pendingOfflineEarnings = null;
const OFFLINE_EARNINGS_THRESHOLD_MS = 5 * 60 * 1000; // Only count after 5+ minutes away

const MAX_OFFLINE_SECONDS = 24 * 60 * 60; // Cap offline credit at 24 hours

function applyOfflineEarnings(lastPlayed) {
  if (!lastPlayed) return;

  const elapsedMs = Date.now() - lastPlayed;
  if (elapsedMs < OFFLINE_EARNINGS_THRESHOLD_MS) return;

  const elapsedSeconds = Math.min(elapsedMs / 1000, MAX_OFFLINE_SECONDS);
  const cps = calculateTotalCPS();
  if (cps <= 0) return;

  const earnings = cps * elapsedSeconds * getDrinkMultipliers().offline * getBlendMultipliers().offline;

  gameState.coffee += earnings;
  gameState.totalCoffeeAllTime += earnings;
  ensureStats().coffeeOffline += earnings;

  pendingOfflineEarnings = {
    seconds: elapsedSeconds,
    earnings: earnings,
    cps: cps
  };
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
    goldenUpgradeStacks: gameState.goldenUpgradeStacks,
    itemMultipliers: gameState.itemMultipliers,
    viewedUpgrades: Array.from(gameState.viewedUpgrades),
    viewedAchievements: Array.from(gameState.viewedAchievements),
    achievements: gameState.achievements.map(a => ({ id: a.id, earned: a.earned })),
    collapsedPacks: Array.from(gameState.collapsedPacks),
    unclaimedAchievements: Array.from(gameState.unclaimedAchievements),
    buyMode: gameState.buyMode,
    sellMode: gameState.sellMode,
    settings: gameState.settings,
    permanentCPSBonus: gameState.permanentCPSBonus,
    discoveredDrinks: Array.from(gameState.discoveredDrinks),
    activeDrinks: gameState.activeDrinks,
    swapCharges: gameState.swapCharges,
    lastSwapRegen: gameState.lastSwapRegen,
    beans: gameState.beans,
    lifetimeBeans: gameState.lifetimeBeans,
    blends: gameState.blends,
    activeBlend: gameState.activeBlend,
    lifetimeBlendsRoasted: gameState.lifetimeBlendsRoasted,
    lifetimeBlendsActivated: gameState.lifetimeBlendsActivated,
    superEffects: gameState.superEffects,
    storm: gameState.storm,
    mysteryCPSBonus: gameState.mysteryCPSBonus,
    lifetimeSuperCoffee: gameState.lifetimeSuperCoffee,
    lifetimeGoldenSuperCoffee: gameState.lifetimeGoldenSuperCoffee,
    lifetimeStorms: gameState.lifetimeStorms,
    lifetimeMysteryBeans: gameState.lifetimeMysteryBeans,
    stats: gameState.stats,
    lastPlayed: Date.now()
  };
  return btoa(JSON.stringify(saveData));
}

// Shared by loadGame and importSave so both restore state identically
function applySaveData(data) {
  gameState.coffee = data.coffee || 0;
  gameState.totalCoffeeAllTime = data.totalCoffeeAllTime || 0;
  gameState.clickPower = data.clickPower || 1;
  gameState.goldenCoffee = data.goldenCoffee || 0;
  if (gameState.goldenCoffee > MAX_GOLDEN_COFFEE) gameState.goldenCoffee = MAX_GOLDEN_COFFEE;
  gameState.prestigeMultiplier = data.prestigeMultiplier || 1.0;
  gameState.items = data.items || {};
  gameState.purchasedUpgrades = new Set(data.purchasedUpgrades || []);
  gameState.purchasedGoldenUpgrades = new Set(data.purchasedGoldenUpgrades || []);
  gameState.goldenUpgradeStacks = data.goldenUpgradeStacks || {};
  gameState.itemMultipliers = data.itemMultipliers || {};
  gameState.viewedUpgrades = new Set(data.viewedUpgrades || []);
  gameState.viewedShopItems = new Set(data.viewedShopItems || []);
  gameState.celebratedMilestones = new Set(data.celebratedMilestones || []);
  gameState.tutorialDone = data.tutorialDone === true;
  gameState.viewedAchievements = new Set(data.viewedAchievements || []);
  gameState.collapsedPacks = new Set(data.collapsedPacks || []);
  gameState.unclaimedAchievements = new Set(data.unclaimedAchievements || []);
  gameState.discoveredDrinks = new Set(data.discoveredDrinks || []);
  gameState.activeDrinks = Array.isArray(data.activeDrinks) ? data.activeDrinks.filter(id => gameState.discoveredDrinks.has(id)) : [];
  gameState.swapCharges = typeof data.swapCharges === 'number' ? Math.min(Math.max(data.swapCharges, 0), SWAP_MAX_CHARGES) : SWAP_MAX_CHARGES;
  gameState.lastSwapRegen = data.lastSwapRegen || null;
  gameState.beans = data.beans || 0;
  gameState.lifetimeBeans = data.lifetimeBeans || 0;
  gameState.blends = data.blends || {};
  // An active blend from a previous session has expired while away — don't restore it
  gameState.activeBlend = (data.activeBlend && typeof data.activeBlend.expiresAt === 'number' && data.activeBlend.expiresAt > Date.now() && blendRecipes.some(b => b.id === data.activeBlend.id)) ? data.activeBlend : null;
  gameState.lifetimeBlendsRoasted = data.lifetimeBlendsRoasted || 0;
  gameState.lifetimeBlendsActivated = data.lifetimeBlendsActivated || 0;
  // Super Coffee: only restore unexpired temporary effects
  const now = Date.now();
  gameState.superEffects = Array.isArray(data.superEffects)
    ? data.superEffects.filter(fx => fx && (fx.kind === 'cps' || fx.kind === 'click') && typeof fx.expiresAt === 'number' && fx.expiresAt > now)
    : [];
  gameState.storm = (data.storm && typeof data.storm.expiresAt === 'number' && data.storm.expiresAt > now) ? data.storm : null;
  gameState.mysteryCPSBonus = typeof data.mysteryCPSBonus === 'number' && data.mysteryCPSBonus >= 1 ? data.mysteryCPSBonus : 1;
  gameState.lifetimeSuperCoffee = data.lifetimeSuperCoffee || 0;
  gameState.lifetimeGoldenSuperCoffee = data.lifetimeGoldenSuperCoffee || 0;
  gameState.lifetimeStorms = data.lifetimeStorms || 0;
  gameState.lifetimeMysteryBeans = data.lifetimeMysteryBeans || 0;
  gameState.stats = data.stats || null;
  ensureStats();
  // Regenerate swaps that accrued while away
  regenSwaps();
  gameState.buyMode = data.buyMode || 1;
  gameState.sellMode = data.sellMode || 1;
  if (data.settings) {
    gameState.settings = { ...gameState.settings, ...data.settings };
  }

  restoreCPSBonus(data);

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

  // Only re-apply toggle effects (auto-buy flags). Bonus effects are derived
  // from purchase counts, and one-time actions must never re-run on load.
  gameState.purchasedGoldenUpgrades.forEach(upgradeId => {
    const upgrade = goldenUpgrades.find(u => u.id === upgradeId);
    // Only re-apply the toggle effect if the player never set it explicitly.
    // An explicit OFF (false) saved in settings must survive reloads.
    if (upgrade && upgrade.type === 'toggle' && upgrade.setting && gameState.settings[upgrade.setting] === undefined) {
      upgrade.effect();
    }
  });
}

// Automation flags must never be ON for upgrades the player hasn't purchased.
// A standalone settings key (or a stale one) must not override what the save owns,
// e.g. after importing a save into a browser that had auto-buy enabled.
function reconcileAutomationSettings() {
  let fixed = false;
  goldenUpgrades.forEach(upgrade => {
    if (upgrade.type === 'toggle' && upgrade.setting) {
      if (!gameState.purchasedGoldenUpgrades.has(upgrade.id) && gameState.settings[upgrade.setting]) {
        gameState.settings[upgrade.setting] = false;
        fixed = true;
      }
    }
  });
  if (fixed) saveSettings();
}

// Restore the permanent CPS bonus without re-applying effects. Each permanent
// upgrade is a one-time purchase, so counts are derived from the purchased set
// — this also heals legacy saves whose stored bonus got double-applied.
function restoreCPSBonus(data) {
  gameState.cpsBonus5Count = gameState.purchasedGoldenUpgrades.has('permanent_cps_5') ? 1 : 0;
  gameState.cpsBonus10Count = gameState.purchasedGoldenUpgrades.has('permanent_cps_10') ? 1 : 0;
  gameState.cpsBonus20Count = gameState.purchasedGoldenUpgrades.has('permanent_cps_20') ? 1 : 0;

  if (gameState.cpsBonus5Count || gameState.cpsBonus10Count || gameState.cpsBonus20Count) {
    recalculatePermanentCPSBonus();
  } else if (typeof data.permanentCPSBonus === 'number' && data.permanentCPSBonus > 1) {
    // Very old saves kept the bonus value but not the purchase set
    gameState.permanentCPSBonus = data.permanentCPSBonus;
  } else {
    recalculatePermanentCPSBonus();
  }
}

function importSave(importString) {
  try {
    const data = JSON.parse(atob(importString));
    applySaveData(data);
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

// Multi-tab guard: when another tab takes over as the active session, this tab
// must stop saving so it can't clobber the newer tab's progress. Managed by ui.js.
let isPrimaryTab = true;

function saveGame() {
  // A superseded tab never writes: its in-memory state is older than the
  // active tab's, and saving would overwrite the player's real progress.
  if (!isPrimaryTab) return;
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
    viewedShopItems: Array.from(gameState.viewedShopItems),
    celebratedMilestones: Array.from(gameState.celebratedMilestones),
    tutorialDone: gameState.tutorialDone,
    viewedAchievements: Array.from(gameState.viewedAchievements),
    achievements: gameState.achievements.map(a => ({ id: a.id, earned: a.earned })),
    collapsedPacks: Array.from(gameState.collapsedPacks),
    unclaimedAchievements: Array.from(gameState.unclaimedAchievements),
    buyMode: gameState.buyMode,
    sellMode: gameState.sellMode,
    settings: gameState.settings,
    purchasedGoldenUpgrades: Array.from(gameState.purchasedGoldenUpgrades),
    goldenUpgradeStacks: gameState.goldenUpgradeStacks,
    permanentCPSBonus: gameState.permanentCPSBonus,
    discoveredDrinks: Array.from(gameState.discoveredDrinks),
    activeDrinks: gameState.activeDrinks,
    swapCharges: gameState.swapCharges,
    lastSwapRegen: gameState.lastSwapRegen,
    beans: gameState.beans,
    lifetimeBeans: gameState.lifetimeBeans,
    blends: gameState.blends,
    activeBlend: gameState.activeBlend,
    lifetimeBlendsRoasted: gameState.lifetimeBlendsRoasted,
    lifetimeBlendsActivated: gameState.lifetimeBlendsActivated,
    superEffects: gameState.superEffects,
    storm: gameState.storm,
    mysteryCPSBonus: gameState.mysteryCPSBonus,
    lifetimeSuperCoffee: gameState.lifetimeSuperCoffee,
    lifetimeGoldenSuperCoffee: gameState.lifetimeGoldenSuperCoffee,
    lifetimeStorms: gameState.lifetimeStorms,
    lifetimeMysteryBeans: gameState.lifetimeMysteryBeans,
    stats: gameState.stats,
    lastPlayed: Date.now()
  };
  localStorage.setItem('coffeeTycoonSave', JSON.stringify(saveData));
}

function loadGame() {
  const saved = localStorage.getItem('coffeeTycoonSave');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      applySaveData(data);

      // Award coffee earned while away from the game
      applyOfflineEarnings(data.lastPlayed || 0);
      // Persist immediately: heals legacy bonus values and records lastPlayed
      // so the next session's offline earnings stay accurate
      saveGame();

      return true;
    } catch (e) {
      console.error('Error loading save:', e);
      return false;
    }
  }
  return false;
}

// ═══ CORE GAME ACTIONS ═══
function buyItem(itemId, amount = 1, quiet = false) {
  const shopItem = shopItems.find(i => i.id === itemId);
  if (!shopItem) return false;

  if (!gameState.items[itemId]) {
    gameState.items[itemId] = { count: 0, cost: shopItem.baseCost };
  }

  const itemState = gameState.items[itemId];
  const currentCount = itemState.count ?? 0;

  const affordableAmount = calculateAffordableAmount(shopItem, currentCount, amount, gameState.coffee);

  if (affordableAmount === 0) return false;

  const totalCost = calculateBulkCost(shopItem, currentCount, affordableAmount);

  if (gameState.coffee >= totalCost) {
    gameState.coffee -= totalCost;
    itemState.count = currentCount + affordableAmount;

    itemState.cost = Math.floor(shopItem.baseCost * Math.pow(shopItem.scale, itemState.count));

    // Automated purchases stay silent: no per-purchase sound/notification spam
    if (!quiet) {
      showPurchaseNotification(shopItem.name, affordableAmount);
      playSfx('purchaseorclaim');
      saveGame();
      updateUI();
    }
    return true;
  }
  return false;
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
  playSfx('purchaseorclaim');

  saveGame();
  updateUI();
}

function buyUpgrade(upgradeId, quiet = false) {
  const upgrade = upgrades.find(u => u.id === upgradeId);
  if (!upgrade || gameState.purchasedUpgrades.has(upgradeId)) return false;
  
  if (gameState.coffee >= upgrade.cost) {
    gameState.coffee -= upgrade.cost;
    gameState.purchasedUpgrades.add(upgradeId);
    gameState.viewedUpgrades.add(upgradeId);
    upgrade.effect();
    
    const packId = upgrade.pack;
    if (packId) {
      removeNotificationsByPack(packId);
    }
    
    // Automated purchases stay silent: no per-purchase sound/notification spam
    if (!quiet) {
      showPurchaseNotification(upgrade.name);
      playSfx('purchaseorclaim');
      saveGame();
      updateUI();
    }
    return true;
  }
  return false;
}

function buyGoldenUpgrade(upgradeId) {
  const upgrade = goldenUpgrades.find(u => u.id === upgradeId);
  if (!upgrade) return;
  // Non-stackable golden upgrades can only be purchased once.
  if (!upgrade.stackable && gameState.purchasedGoldenUpgrades.has(upgradeId)) return;

  const cost = goldenUpgradeCost(upgrade);
  if (gameState.goldenCoffee >= cost) {
    gameState.goldenCoffee -= cost;
    gameState.purchasedGoldenUpgrades.add(upgradeId);
    if (upgrade.stackable) {
      gameState.goldenUpgradeStacks[upgradeId] = goldenUpgradeStacks(upgradeId) + 1;
    }
    upgrade.effect();

    showPurchaseNotification(upgrade.name);
    playSfx('purchaseorclaim');

    saveGame();
    updateUI();
  }
}

function doPrestige() {
  const gained = prestigeGain();
  if (gained > 0) {
    if (confirm(`Prestige and gain ${gained} Golden Coffee?\n\nThis will reset:\n• Coffee count\n• All items\n• All regular upgrades\n\nYou will keep:\n• Golden Coffee\n• ${((gameState.goldenCoffee + gained) * 10)}% production multiplier\n• Permanent CPS bonuses\n• Golden upgrades and their automations (Auto-Buy, Auto-Claim)\n• Research Lab drinks and discoveries\n• Roastery beans and roasted blends (active blend ends)\n• Mystery Bean permanent CPS bonus\n• Super Coffee effects and storms end\n• All achievements and their claimed rewards`)) {
      gameState.goldenCoffee += gained;
      gameState.prestigeMultiplier = 1 + (gameState.goldenCoffee * 0.1);
      ensureStats().totalPrestiges++;
      ensureStats().lifetimeGoldenEarned += gained;

      gameState.coffee = 0;
      gameState.clickPower = 1;
      gameState.purchasedUpgrades = new Set();
      // Claimed achievement multipliers are permanent rewards — keep them.
      // Roastery: beans and roasted blends persist; the temporary active blend ends.
      gameState.activeBlend = null;
      // Super Coffee: temporary effects and storms end; permanent mystery bonus stays.
      gameState.superEffects = [];
      gameState.storm = null;

      shopItems.forEach(item => {
        gameState.items[item.id] = { count: 0, cost: item.baseCost };
      });

      showNotification('Prestige Complete!', `Gained ${gained} Golden Coffee — multiplier now ${gameState.prestigeMultiplier.toFixed(1)}x`, 'default');
      playSfx('purchaseorclaim');
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

// ═══ MILESTONE CELEBRATIONS (v1.20 UX) ═══
// Big empire moments get a confetti celebration the first time they happen.
// The visual celebration itself lives in ui.js (celebrateMilestone); core
// only detects crossings and records them so they persist across sessions.
const MILESTONES = [
  { id: 'ms_coffee_1k', label: '1K coffee brewed!', value: () => gameState.totalCoffeeAllTime, threshold: 1000 },
  { id: 'ms_coffee_100k', label: '100K coffee brewed!', value: () => gameState.totalCoffeeAllTime, threshold: 100000 },
  { id: 'ms_coffee_1m', label: '1M coffee brewed! ☕', value: () => gameState.totalCoffeeAllTime, threshold: 1000000 },
  { id: 'ms_coffee_100m', label: '100M coffee brewed!', value: () => gameState.totalCoffeeAllTime, threshold: 100000000 },
  { id: 'ms_coffee_1b', label: '1B coffee brewed!', value: () => gameState.totalCoffeeAllTime, threshold: 1000000000 },
  { id: 'ms_coffee_10b', label: '10B coffee — prestige awaits!', value: () => gameState.totalCoffeeAllTime, threshold: 10000000000 },
  { id: 'ms_buildings_10', label: '10 buildings owned!', value: () => Object.values(gameState.items).reduce((s, i) => s + (i?.count ?? 0), 0), threshold: 10 },
  { id: 'ms_buildings_100', label: '100 buildings owned!', value: () => Object.values(gameState.items).reduce((s, i) => s + (i?.count ?? 0), 0), threshold: 100 },
  { id: 'ms_buildings_1000', label: '1,000 buildings owned!', value: () => Object.values(gameState.items).reduce((s, i) => s + (i?.count ?? 0), 0), threshold: 1000 },
  { id: 'ms_prestige_1', label: 'First prestige! 🎉', value: () => gameState.stats?.totalPrestiges ?? 0, threshold: 1 },
];

function checkMilestones() {
  for (const m of MILESTONES) {
    if (!gameState.celebratedMilestones.has(m.id) && m.value() >= m.threshold) {
      gameState.celebratedMilestones.add(m.id);
      if (typeof celebrateMilestone === 'function') celebrateMilestone(m.label);
      saveGame();
    }
  }
}

function claimAchievementReward(achievement, quiet = false) {

  if (!achievement.reward || !gameState.unclaimedAchievements.has(achievement.id)) return '';
  
  gameState.unclaimedAchievements.delete(achievement.id);
  gameState.viewedAchievements.add(achievement.id);
  
  removeNotificationsByAchievement(achievement.id);
  
  // Automated claims stay silent: no per-claim sound/notification spam
  if (!quiet) {
    showClaimNotification(achievement.name);
    playSfx('purchaseorclaim');
  }
  
  if (achievement.reward.type === 'coffee') {
    gameState.coffee += achievement.reward.value;
    // Coffee rewards count toward lifetime totals (prestige progress), like offline earnings
    gameState.totalCoffeeAllTime += achievement.reward.value;
    if (!quiet) {
      saveGame();
      updateUI();
    }
    return ` (+${formatNumber(achievement.reward.value)} coffee!)`;
  } else if (achievement.reward.type === 'multiplier') {
    const itemId = achievement.reward.itemId;
    gameState.itemMultipliers[itemId] = (gameState.itemMultipliers[itemId] || 1) * achievement.reward.value;
    const itemName = shopItems.find(i => i.id === itemId)?.name;
    const multiplierPercent = ((achievement.reward.value - 1) * 100).toFixed(1);
    if (!quiet) {
      saveGame();
      updateUI();
    }
    return ` (+${multiplierPercent}% ${itemName} production!)`;
  }
  
  return '';
}

function getRewardText(reward) {
  if (reward.type === 'coffee') {
    return `Reward: ${formatNumber(reward.value)} Coffee`;
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
    },
    {
      id: 'lab_collection',
      title: 'Lab Collection',
      description: 'Achievements for research in the Research Lab',
      achievements: achievements.filter(a => a.id === 'lab_rat' || a.id === 'master_brewer')
    },
    {
      id: 'roastery_collection',
      title: 'Roastery Collection',
      description: 'Achievements for roasting in the Roastery',
      achievements: achievements.filter(a => a.id === 'bean_100' || a.id === 'blend_10')
    },
    {
      id: 'super_collection',
      title: 'Super Coffee Collection',
      description: 'Achievements for Super Coffees, storms, and mystery beans',
      achievements: achievements.filter(a => ['super_1', 'super_25', 'golden_super_1', 'storm_1', 'mystery_1'].includes(a.id))
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
  let changed = false;

  // Auto-buy upgrades: buy the single next-cheapest affordable upgrade each pass
  if (gameState.settings.autoBuyUpgrades) {
    let cheapest = null;
    let cheapestCost = Infinity;
    upgrades.forEach(upgrade => {
      if (gameState.purchasedUpgrades.has(upgrade.id)) return;
      if (!upgrade.unlockCondition()) return;
      const cost = upgrade.cost;
      if (gameState.coffee >= cost && cost < cheapestCost) {
        cheapest = upgrade;
        cheapestCost = cost;
      }
    });
    if (cheapest && buyUpgrade(cheapest.id, true)) changed = true;
  }

  // Auto-buy items: buy the single next-cheapest item each pass
  if (gameState.settings.autoBuyItems) {
    let cheapest = null;
    let cheapestCost = Infinity;
    shopItems.forEach(item => {
      if (!isItemUnlocked(item)) return;
      const itemState = gameState.items[item.id];
      const cost = (itemState && itemState.cost) ?? item.baseCost;
      if (gameState.coffee >= cost && cost < cheapestCost) {
        cheapest = item;
        cheapestCost = cost;
      }
    });
    if (cheapest && buyItem(cheapest.id, 1, true)) changed = true;
  }

  // Auto-claim achievements
  if (gameState.settings.autoClaimAchievements) {
    gameState.achievements.forEach(achievement => {
      if (achievement.earned && gameState.unclaimedAchievements.has(achievement.id)) {
        claimAchievementReward(achievement, true);
        changed = true;
      }
    });
  }

  // One save per automation pass instead of one per purchase
  if (changed) saveGame();
}

// Automation and rendering are driven by the game loop intervals in ui.js
// (core.js loads before ui.js, so it must not start any loops itself).
