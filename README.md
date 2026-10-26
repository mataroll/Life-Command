# Life Command Center

> 🚧 **Work in progress.** The home screen (activity rings and daily checklist) works. The dependency board and purchase queue are still being built.

An installable app (PWA) for managing your life, where every goal, task, dream and purchase is a **connected node**.
Tasks don't unlock by date. They unlock by **conditions**: other tasks completed, streaks reached, money saved.

> *"The date doesn't open the task. The conditions do."*

## Tech stack
- **React 18 + TypeScript + Vite**
- **Firebase:** Firestore with real-time listeners, Cloud Functions, Hosting
- **PWA:** installable on the iPhone home screen, with push notifications
- Dark mode, right-to-left Hebrew layout, sidebar navigation

## What's built
- Home screen with Apple Watch-style SVG activity rings and a daily task checklist
- Firestore data layer (typed `LifeNode`, daily and weekly logs, finance) with real-time sync
- Push notification registration and local status notifications

## Roadmap
- Detective board: a visual graph of how tasks depend on each other
- Purchase queue tied to savings goals
- Authentication (single user in the MVP)

## Run locally
```bash
npm install
npm run dev
```
