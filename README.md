# House Chores 🏡✨

A clean, responsive cross-platform chore tracking app for **iPhone (iOS)**, **Android**, **Windows**, **Linux**, and **Web**.

---

## 🌟 Key Features

1. **Chores with Configurable Frequencies**:
   - Set frequency in Days, Weeks, or Months (e.g. Daily, Every 3 days, Weekly, Monthly).
2. **User-Defined Multi-Labels**:
   - Freely name labels (e.g. `#Kitchen`, `#Floors`, `#Upstairs`, `#DeepClean`).
   - Assign multiple labels or none.
3. **Completion Logging & Time-Elapsed Tracking**:
   - 1-tap "Done" logging.
   - Displays exact time passed since the chore was last performed (e.g. *"Last performed: 3 days ago"*).
4. **Sorted Strictly by Order of Lateness**:
   - Chores are sorted with the most overdue chore (most time passed since due date) at the very top.
5. **Category Filtering**:
   - Filter the list by tapping any category pill or shortcut tile.
6. **Customizable Widget-Style Home Page**:
   - 📊 **Consistency & Performance Tracker Widget (Dopamine Booster)**:
     - Pick any chore from the list (using the horizontal selector chips or widget settings).
     - Displays an interactive performance bar graph of past completion cycles.
     - Celebratory on-time score (`92%`), on-time streak (`🔥 5 in a row`), and target frequency baseline.
     - One-tap button right on the widget to log completions and watch your streak grow!
   - 🔥 **Most Late Chores Widget**: Displays the top 3, 5, or 10 most overdue chores with direct 1-tap completion logging.
   - 🏷️ **Category Shortcuts Widget**: Interactive tiles for user categories showing chore and overdue counts.
   - 📈 **Status Overview Widget**: High-level summary of overdue, on-track, and total chores.
   - ⚙️ **Customize Widgets Modal**: Toggle any widget on or off, select which chore is tracked, or change item limits.

---

## 📱 Running on iPhone

```powershell
npx expo start -c
```
*(Or `npx expo start --tunnel -c` if on guest Wi-Fi)*.
Scan the QR code with your iPhone's **Camera app** and tap **"Open in Expo Go"**.

---

## 💻 Running on Desktop (Windows / Linux)

```powershell
npm run web
# or
npx expo start --web
```

---

## 🧪 Automated Testing & Type Checking

```powershell
npm test        # 9/9 unit tests passing
npm run typecheck # 0 TypeScript errors
npx expo-doctor # 21/21 checks passing
```
