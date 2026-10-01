# Coffee Tycoon

<img src="Images/logo.jpg" alt="Coffee Tycoon Logo" width="200" style="border-radius: 50%;">

A game where you brew coffee

---

## Contents
- [How to Download and Play](#how-to-download-and-play)
  - [Option 1: File](#option-1-file)
  - [Option 2: Link](#option-2-link)
- [Updates](#updates)
  - [Latest Version](#latest-version-v117--super-coffee)
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

### Latest Version: v1.17 – Super Coffee
**Release Date:** Sep 30, 2026

**Key Features**
- Super Coffee: random ☕ Super Coffees pop up around the screen — click for temporary bonuses (Espresso Rush 2× CPS, Click Frenzy 5× clicks, Instant Brew, Storm Call)
- Golden Super Coffee: rare ✨ spawns purchasable for 5 Golden Coffee — 3× CPS for 5 minutes
- Coffee Storms: ⛈ random storms boost all CPS 2×–5× for 1–2 minutes
- Mystery Coffee Beans: rare ❓ spawns grant jackpot rewards — Golden Coffee, permanent +5% CPS, Time Warp, or Bean Feast
- New Achievements: Super Sipper, Super Collector, Golden Gulp, Storm Chaser, Mystery Solver
- Bug Fixes: Lab achievements now appear in the Achievements tab; prestige discloses that Lab drinks and Roastery stock persist

---

## Future Updates

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
