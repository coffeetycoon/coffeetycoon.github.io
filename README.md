# Coffee Tycoon

A game where you brew coffee.

---

## Contents
- [How to Download and Play](#how-to-download-and-play)
  - [File Download](#option-1-file)
  - [Link to Game](#option-2-link)
- [Updates](#updates)
  - [Latest Version](#latest-version-v181-gains-and-grains-patch-1)
  - [Last Major Update](#last-major-update-v18-gains-and-grains)
  - [Last Major Build](#last-major-build-v10)
- [Future Updates](#future-updates)

---

## How to Download and Play

### Option 1: File
1. Download the **coffeetycoon.html** file above  
   <img src="Images/Open.png" alt="Open" width="500">
2. Download the file  
   <img src="Images/Download.png" alt="Download" width="500">
3. Open the HTML in any modern browser (Chrome, Edge, Firefox, Opera, etc.)  
   <img src="Images/Files.png" alt="Files" width="500">
4. Have fun!

### Option 2: Link
1. Current Link: [https://coffeetycoon.github.io/Coffee-Tycoon/](https://coffeetycoon.github.io/Coffee-Tycoon/)

---

## Updates

### Latest Version: v1.8.1: Gains and Grains Patch 1
#### Release Date: Oct 29, 2025
#### Bug Fixes
- Remove the number of achievements from achievement packs ([number unlocked]/[number total] achievements will not show anymore), while keeping the green progress bar
  - Same for upgrade packs
- Reduce the size of red dot on tabs for notifications, so the dot doesn't overlay onto text
- Upgrade purchase notifications don't look the same as shop item purchase notifications, so now upgrade purchase will look like shop item purchase notifications
- Achievement unlock delivers duplicate notification, only the one that matches the shop purchase notification will be kept
- Achievement claim notification will be restyled to look like the shop purchase notification

---

### Last Major Update: v1.8: Gains and Grains
#### Release Date: Oct 28, 2025
#### New Features
- Added notifications for **new Achievements and Upgrade Packs**
- Notifications disappear after buying upgrades or claiming rewards
- Cleaned up achievement icons (removed emojis)
- Notifications now appear on the **right side of the screen** and will not overlap
  - Older notifications move down, newer ones appear on top
  - Disappear timing unchanged

---

### Last Major Build: v1.0
#### Release Date: Aug 31, 2025
#### Coffee Tycoon beta test ends, and full release is live

---

## Future Updates

### v1.9 - Riches and Reaches
#### Release Target: Nov 4, 2025
- Achievements for coffee collection will scale to 1 quintillion coffee
- Achievements for shop item collection will scale to 5000 items
- New achievement pack: upgrades collection, achievement for 10% of upgrades, then 20% and so on until 100% of upgrades
- Remove number from notifications on achievement packs
- All shop items coffee grinder and beyond buffed by at least 200%
- All shop items more spaced out (CPS-wise), no price changes but Coffee Franchise now produces 1M CPS, with all items before till coffee grinder scaling along with it
- Auto Brewer now does 5 CPS, Barista now does 10 CPS
- Affordable upgrades in an upgrade pack will be represented by "!" instead of "."
- Claimed achievements will now have a green border/theme, so as not to confuse them with unclaimed achievements
  - Unclaimed (but completed) achievements will not change

### v1.10 – A Whole Latte Trade
#### Release Target: Nov 11, 2025
- Progressive unlocking of shop items (shop items that you cannot afford 50% of the initial price for will not be shown)
- Add new shop items beyond Coffee Franchise (up till producing 100 billion coffee [named like, coffee planet, galaxy, universe, solar system, continent, country, factory etc, can scale in size till universe if needed])
- Add bulk buying options (×1, ×10, ×100)
  - Notifications like “Bought 10× Barista”
- Add ability to **sell shop items**

### v1.11 - A Latte Noise
- Coffee cup animation (cups fall based on click/CPS output)
- Turn the CPS into a button that opens a window showing a breakdown of CPS contributions (percent and number)
- Looping Background Music: TBD
- Generic sound effect for buttons
- Affordable upgrades notifications (pop-up like unlocking upgrades)
- Affordable shop items notifications (Red dot)

### v1.12 Pick Your Brew
- Settings Button next to info and help
  - Notifications for affordable upgrades (toggle)
  - Background Music toggle and SFX toggle
  - Customizable Quick Keys
  - Toggle to change coffee display to full number instead of abbreviated (also a toggle for CPS, and another one for golden coffee
- Export/Import save system using save strings  
- Erase progress option

### v1.13 Golden Gains
 Golden Coffee can buy **Golden Upgrades**  
  - Loses production boost but gains stronger buffs
  - Golden Upgrades (New Pack) - Will not reset after prestige, is permanent upgrade:
    - Auto-Buy Upgrades - (5 min gap between upgrades being bought - can't spam buy upgrades) {10 Golden Coffee}
    - Auto-Buy Shop Items - (1 min gap between next cheapest item being bought) {10 Golden Coffee}
    - Auto Claim Achievement Rewards - (Claims max one reward every minute; Level 2 upgrade claims all every 5 minutes) {10 Golden Coffee} - First level is claim all button, then auto-claim is second level
    - Permanent Upgrades (Such as +15% CPS boost, etc.)
    - Mark All Notifications As Read

### v1.14 Grab a Lab
  - Prior to unlocking, the tab is greyed out and when you click on it it should say "Unlock/Purchase the Research Lab Golden Upgrade" in a notification, 
  - Research Lab (Available as Golden Upgrade)
    - A new tab where you can spend coffee to discover new drink recipes
    - Research Drink Recipes (e.g., Espresso, Latte, Cappuccino, Macchiato) ~10 drinks total
    - Each unlocked drink provides a unique, passive boost (e.g., "Espressos boost click power by +25%", "Lattes boost all Barista CPS by +10%") + some will have debuffs and buffs as part of the same drink
      - You can choose in the tab which drink is active, max 3 is active at a time, 1st one is at 100% power, 2nd is at 75% power, last is at 50% power
      - To change the drink it costs 1 swap, each swap generates over an hour
   
### v1.15 Roasters and Coasters
  - Roastery (Available as Golden Upgrade)
    - A new building/tab that allows you to buy different tiers of raw Coffee Beans
    - The Roastery processes beans into "Roasted Blends" (e.g., Light, Medium, Dark)
    - Activating a blend consumes it and provides a powerful, temporary global boost (e.g., "Activate Dark Roast: 2x all CPS for 60 seconds")

---

## Undecided Additions
#### These may move to planned or unplanned updates, or be removed entirely:
- Mobile UI
  - Will use sidebar instead of tabs
- Add "super coffee", which gives random bonuses and randomly spawns once every 10 min
- Progress bar in prestige tab to show with progress till next golden coffee
- Balance Change: Golden Coffee cost will scale by factor of 10 every with every golden coffee collected, will go down if you spend golden coffee on golden upgrades
- Stats button, next to settings button: Opens a window like info, but with tabs within it
  - Tab graph with history of total coffee and total CPS and golden coffee
  - Graph with percentage of CPS from each building (each building has its own graph), and on same graph a graph of CPS from each building
   
---
#### Only used for major update when necessary
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
---
*Stay tuned for more updates as Coffee Tycoon continues to brew improvements!*
