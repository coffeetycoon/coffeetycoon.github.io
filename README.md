# Coffee Tycoon

A game where you brew coffee

---

## Contents
- [How to Download and Play](#how-to-download-and-play)
  - [Option 1: File](#option-1-file)
  - [Option 2: Link](#option-2-link)
- [Updates](#updates)
  - [Latest Version](#latest-version-v111-a-latte-noise)
  - [Last Major Update](#last-major-update-v111-a-latte-noise)
  - [Last Major Build](#last-major-build-v10)
- [Future Updates](#future-updates)
- [Undecided Additions](#undecided-additions)

---

## How to Download and Play

### Option 1: File
1 Download the **coffeetycoon.html** file  
   <img src="Images/Open.png" alt="Open" width="500">
2 Save the file to your computer  
   <img src="Images/Download.png" alt="Download" width="500">
3 Open the HTML file in any modern browser (Chrome, Edge, Firefox, Opera, etc.)  
   <img src="Images/Files.png" alt="Files" width="500">
4 Enjoy brewing your coffee empire

### Option 2: Link
- Play directly in your browser: [Coffee Tycoon Online](https://coffeetycoon.github.io/)

---

## Updates

### Latest Version: v1.12 – Pick Your Brew
**Release Date:** Jan 1, 2026

**Key Features**
- Settings Panel: New settings button with customizable options for notifications, quick keys, number display, and progress reset
- Save Export/Import: Export your game progress as a text string and import it on another device or browser
- Erase Progress: Option to completely reset your game progress with confirmation
- Extended Number Support: Number abbreviations now support up to trigintillion (10^96) for massive late-game progress

---

### Last Major Update: v1.12 – Pick Your Brew
**Release Date:** Jan 1, 2026
See above.
---

### Last Major Build: v1.0
**Release Date:** Aug 31, 2025
- Coffee Tycoon beta test concluded; full release live

---

## Future Updates

### v1.13 – Golden Gains
- Golden Coffee unlocks permanent Golden Upgrades (does not reset after prestige)
- Tab within tab design, inside upgrades tab, there will be a tab for golden upgrades and one for upgrades (golden upgrades button will be greyed out until unlocked), unlock cost is 1 golden coffee
- Available upgrades
  - Auto-buy upgrades/items
  - Auto-claim achievements
  - Permanent bonuses (+CPS, etc.)
  - Mark all notifications as read
  - Progress bar for golden coffee
  - Spending golden coffee will reduce your default bonus

### v1.14 – Grab a Lab
- Research Lab as Golden Upgrade
- Discover ~10 drink recipes with buffs/debuffs
- Max 3 active drinks at a time
- Swaps regenerate over time
- Golden Upgrades for building

### v1.15 – Roasters and Coasters
- Roastery as Golden Upgrade
- Buy and process beans into blends (Light, Medium, Dark)
- Activate blends for temporary global boosts
- Golden Upgrades for building

### v1.17 – Super Coffee
- Randomly spawning Super Coffee with temporary bonuses
- Occasional Golden Super Coffee with stronger buffs
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
