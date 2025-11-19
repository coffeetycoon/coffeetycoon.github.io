# Coffee Tycoon

A game where you brew coffee

---

## Contents
- [How to Download and Play](#how-to-download-and-play)
  - [Option 1: File](#option-1-file)
  - [Option 2: Link](#option-2-link)
- [Updates](#updates)
  - [Latest Version](#latest-version-v110-a-whole-latte-trade)
  - [Last Major Update](#last-major-update-v110-a-whole-latte-trade)
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

### Latest Version: v1.10 – A Whole Latte Trade
**Release Date:** Nov 17, 2025

**Key Features**
- Progressive shop unlocking (items hidden until ≥50% base cost)
- Added high-tier buildings: Coffee Planet → Coffee Multiverse
- Bulk buy ×1/×10/×100
- Sell 1 item (50% refund)
- Building buffs 2×–5×
- CPS Achievement Pack up to 1e20 CPS
- Renamed all achievements with coffee puns
- Updated credits to Sanchit P.
- Fixed duplicate achievement notifications and wording

---

### Last Major Update: v1.10 – A Whole Latte Trade
**Release Date:** Nov 17, 2025  
*See details above*

---

### Last Major Build: v1.0
**Release Date:** Aug 31, 2025  
- Coffee Tycoon beta test concluded; full release live

---

## Future Updates

### v1.11 – A Latte Noise
- Coffee cup animation reacts to clicks and CPS output
- CPS button opens a breakdown window showing contributions
- Looping background music and button SFX
- Affordable upgrade/shop item notifications
- Achievement packs of shop items not unlocked yet should show up
- Add selling of up to 100x
- Everything in shop is vertically aligned with each other (all sell blocks with sells etc.)
- Coffee country and universe moved before planet, and everything adjusted in CPS to match new order (while keeping old progression)
- Achievements for buildings that haven't been unlocked yet should not be displayed
- New achievement pack, building unlocks, each achievement opens when the corresponding building is unlocked (it shows up in shop screen)
- Golden Coffee nerf, where after getting one golden coffee the next one costs 2x as much, all existing golden coffee will be recalculated
- general collection achievement pack expanded till 1 million buildings
- Prestige will be allowed upon collecting one golden coffee

### v1.12 – Pick Your Brew
- Settings button with toggles (notifications, music, SFX, quick keys, number display)
- Export/import save system (based on strings of text with info)
- Erase progress option

### v1.13 – Golden Gains
- Golden Coffee unlocks permanent Golden Upgrades
- Tab within tab design, inside upgrades tab, there will be a tab for golden upgrades and one for upgrades (golden upgrades button will be greyed out until unlocked), unlock cost is 1 golden coffee
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
