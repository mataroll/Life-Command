# Life Command Center

## What This Is
A PWA life management app where every goal, task, dream, and purchase is a **connected node**.
Tasks don't unlock by date — they unlock by **conditions** (other tasks done, streaks reached, money saved).

**"The date doesn't open the task. The conditions do."**

## Tech Stack
- React 18 + TypeScript + Vite
- Firebase (Firestore + Cloud Functions + Hosting)
- PWA — installable on iPhone home screen
- Dark mode, RTL Hebrew, sidebar nav
- No auth in MVP — single user

## Repo Structure
```
src/
  lib/types.ts        — LifeNode, DailyLog, WeeklyLog, Finance types
  lib/firestore.ts    — Firestore CRUD + real-time listeners
  lib/firebase.ts     — Firebase config
  lib/push.ts         — Push notification registration + local status notifs
  lib/seed.ts         — Seed data helper
  pages/Home.tsx      — Main screen: activity rings + daily task checklist
  pages/DetectiveBoard.tsx — Placeholder (dependency graph, not built yet)
  pages/Purchases.tsx — Placeholder (purchase queue, not built yet)
  pages/Debug.tsx     — Debug/seed data view
  components/ActivityRings.tsx — Apple Watch style SVG rings
  components/Layout.tsx — App shell with sidebar
  components/Sidebar.tsx — Navigation sidebar
functions/index.js    — Cloud Functions: hourly push, morning summary, daily log trigger
```

## Data Model
- **LifeNode** — id, name, type (task/dream/purchase/metric), status, dependencies[], rhythm, priority, streak, category, moneyRequired, people[], location, deadline, links[], files[], notes
- **DailyLog** — date (8am-8am boundary), tasks[], score
- **WeeklyLog** — weekStart, weeklyTasks[], dailyScores[], score
- **Finance** — balance, safetyBuffer
- **DependencyCondition** — nodeId, type (completion/streak-threshold/balance-threshold), threshold

## Key Rules
- **8am day boundary** — not midnight. Day runs 8am to 8am.
- **No in-app editing** — app is display + check-off only. All node setup through Claude.
- **Status is computed** from dependencies, not manually set (except "done")
- **Hebrew-first** — all UI text in Hebrew, RTL layout
- **Single user** — no auth, all data in one Firestore space

## Current State (March 2026)
Sessions 1-3 complete:
- ✅ PWA shell with dark mode + RTL
- ✅ Firebase + Firestore data model
- ✅ Home screen with activity rings + task checklist
- ✅ Push notifications (VAPID, Cloud Functions)

Remaining:
- Session 4: Drill-down views (weekly→daily→tasks) + check-off flow
- Session 5: Dependency engine (auto-compute node status from conditions)
- Session 6: Purchases page (priority queue gated by money)
- Session 7: Detective board (visual dependency graph)
- Session 8: Polish + offline
- Session 9: Cloud Functions expansion

## Key Blockers (Life Map)
These are the user's real-life critical path nodes:

1. **דיבור עם אבא** — unlocks: doctors, swimming, apartment move, chiropractor, Arsenal, כותל, אתרים
2. **חיפה** — unlocks: all friend meetups (רזאביב, שי, ניר, עמית, בשה, דניק, עופרי, בר ירון, עמית ארד, פאדל)
3. **ציטרון** — unlocks: creative projects, צמידים מוארים
4. **עקומת למידה** — chain: אינפי 1 → אינפי 2 → אלגברה → ... → טכניון. Currently on אינפי 1
5. **מעבר דירה** — blocked by dad talk, unlocks kitchen equipment + wall art

## How to Help
When the user talks about their life on the phone:
1. **New task/goal/dream/purchase** → define it as a LifeNode with dependencies
2. **New connection** → note the DependencyCondition
3. **Code changes** → edit files and push to this repo
4. **Firestore data** → can be seeded via the seed helper or Cloud Functions

## Working With This Repo
```bash
# Fetch a file
gh api repos/mataroll/Life-Command/contents/src/lib/types.ts --jq '.content' | base64 -d

# Clone locally
git clone https://github.com/mataroll/Life-Command.git

# Dev server
npm install && npm run dev

# Deploy
firebase deploy
```
