# Coffee Tycoon

<img src="Images/logo.jpg" alt="Coffee Tycoon Logo" width="200" style="border-radius: 50%;">

A game where you brew coffee

---

## Contents
- [How to Download and Play](#how-to-download-and-play)
  - [Option 1: File](#option-1-file)
  - [Option 2: Link](#option-2-link)
- [Updates](#updates)
  - [Latest Version](#latest-version-v118--stats-window)
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

### Latest Version: v1.18 – Stats Window
**Release Date:** Sep 30, 2026

**Key Features**
- Stats Window: new 📊 button (or press 8) opens a full statistics dashboard
- Overview tab: Total coffee, CPS, and Golden Coffee cards plus time played, clicks, prestiges, and max CPS
- Production tab: historical CPS and coffee graphs with hover tooltips showing exact numbers
- Buildings tab: per-building CPS breakdown with share %, lifetime production, text filter, and bar chart
- Multipliers tab: every active multiplier (prestige, drinks, blends, storms...) in stacking order
- Lifetime tab: lifetime stats for everything — clicks, offline earnings, beans, storms, and more

---

## Future Updates

_See [Undecided Additions](#undecided-additions) below._

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
