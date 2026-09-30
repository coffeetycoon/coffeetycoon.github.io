# Coffee Tycoon

<img src="Images/logo.jpg" alt="Coffee Tycoon Logo" width="200" style="border-radius: 50%;">

A game where you brew coffee

---

## Contents
- [How to Download and Play](#how-to-download-and-play)
  - [Option 1: File](#option-1-file)
  - [Option 2: Link](#option-2-link)
- [Updates](#updates)
  - [Latest Version](#latest-version-v115--grab-a-lab)
- [Future Updates](#future-updates)
- [Undecided Additions](#undecided-additions)

---

## How to Download and Play

### Option 1: File
1. Download the **index.html** file  
   <img src="Images/Open.png" alt="Open" width="500">
2. Save the file to your computer  
   <img src="Images/Download.png" alt="Download" width="500">
3. Open the HTML file in any modern browser (Chrome, Edge, Firefox, Opera, etc.)  
   <img src="Images/Files.png" alt="Files" width="500">
4. Enjoy brewing your coffee empire

### Option 2: Link
- Play directly in your browser: [Coffee Tycoon Online](https://coffeetycoon.github.io/)

---

## Updates

### Latest Version: v1.15 – Grab a Lab
**Release Date:** Sep 30, 2026

**Key Features**
- Research Lab: a new golden upgrade (3 Golden Coffee) unlocks the Lab tab
- Drink Recipes: discover 10 recipes, each with buffs and debuffs — e.g. Double Espresso (+20% CPS, −15% click power), Caramel Latte (−10% shop prices, −5% CPS)
- Active Drinks: brew up to 3 drinks at once; buffs stack multiplicatively
- Drink Swaps: activating or pouring out a drink costs 1 swap; swaps regenerate over time (1 per 5 minutes)
- Lab Golden Upgrades: Extra Thermos (+1 drink slot), Rapid Experimentation (swaps regenerate 2× faster), Potent Brews (buffs 25% stronger)
- New Achievements: Lab Rat and Master Brewer for discovering recipes
- Bug Fixes: all 15 findings from the post-v1.14 bug hunt are fixed (golden toggles, silent automation, prestige disclosures, offline credit for hidden tabs, multi-tab guard, save-import safety, number suffixes, and more)

---

## Future Updates

### v1.16 – Roasters and Coasters
- Roastery as Golden Upgrade (new main tab)
- Buy and process beans into blends (Light, Medium, Dark, French etc.)
- Activate blends for temporary global boosts
- Golden Upgrades for building
- Each bean starts as 1 billion CPS cost, and scales by 1.15x depending on the number of beans you have purchased in a lifetime

### v1.17 – Super Coffee
- Randomly spawning Super Coffee with temporary bonuses (spawns as a button in a random spot on screen)
- Occasional Golden Super Coffee (need to purchase with stronger buffs)
- Coffee storms temporarily boost all CPS 2×–5×
- Achievements for collecting Super Coffees
- Chance to spawn Mystery Coffee Beans for rare boosts

### v1.18 – Stats Window
- Stats button with tabs for total coffee, CPS, golden coffee
- Graphs for each building and combined CPS
- Historical coffee production timeline
- Filter CPS by building or upgrade type
- Tooltip hover to see exact numbers
- Will show lifetime stats for everything

---

## Undecided Additions
- Mobile UI
  - Sidebar navigation instead of tabs
  - Adjusted touch controls for phones/tablets

---

#### Only used for major update when necessary
```javascript
// ===== One-time global reset for Coffee Tycoon vx.x.x =====
const GAME_VERSION = "x.x.x-reset"; // Change this if want another one-time reset

// Check stored version
const savedVersion = localStorage.getItem("gameVersion");

// If version doesn't match (or no version found), wipe save and set new version

if (savedVersion !== GAME_VERSION) {
  
  console.log("Performing one-time global reset for Coffee Tycoon vx.x.x");
  
  localStorage.clear(); // completely reset all player progress
  
  localStorage.setItem("gameVersion", GAME_VERSION);

}
```
---
*Stay tuned for more updates as coffee tycoon improves!*
