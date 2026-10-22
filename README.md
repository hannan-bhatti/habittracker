# 🎯 Habit Tracker — Atomic Daily Loops

A modern, identity-based personal habit tracking application designed around proven behavioral psychology. Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Capacitor** for cross-platform Web & native Android mobile.

---

## ✨ Key Features

### 👤 Identity-Based Habit Architecture
- Anchor every habit to a personal identity statement (*"I am the type of person who..."*).
- Cast undeniable votes of evidence with every check-off to build lasting self-belief.
- Track lifetime identity votes, tier progression (Spark, Emerging, Grounded, Embodied), and supporting habit loops.

### ⏰ Smart 10-Minute Advance Notifications
- **Automated Advance Heads-Up**: Automatically schedules high-priority notifications **10 minutes before** each task's scheduled time with 24-hour wrap-around calculation.
- **Configurable Notice**: Customize lead time (10m, 5m, 15m, 30m, or exact time) plus optional chime right at task start.
- **Active Alarms Preview**: Live dashboard displaying all scheduled alarms and calculated trigger times.
- **Morning & Evening Routines**: Morning Kick-off momentum prompt and Evening Reflection reminders.

### 🔗 Habit Stacking & Implementation Intentions
- **Habit Stacking Engine**: Chain new habits onto established anchor habits (*"After [Anchor Habit], I will [New Habit]"*).
- **Time & Location Cues**: Pre-commit to specific environment cues (e.g. *Living Room Mat*, *Mosque*, *Home Desk*).

### 📊 Streak Analytics & Multi-Week Calendar
- **Interactive Weekly Grid**: Check off habits with pleasant harmonic chimes and tactile haptic feedback.
- **Multi-Week Navigation**: Browse historical weeks, track completion rates, and view current vs best streak records.
- **Visual Analytics**: Interactive completion heatmaps, weekly performance charts, and unlocked achievement badges.

### 🔒 Resilient Native Android Persistence
- **Dual-Layer Storage**: Synchronous web storage combined with native Android `SharedPreferences` via `@capacitor/preferences`.
- **Zero Startup Race Conditions**: Safe state hydration preventing accidental data loss on app close/swipe-away.
- **Backup & Restore**: Instant JSON backup export, starter template loading, and one-click data reset.

---

## 🛠️ Technology Stack

- **Core**: React 19, TypeScript 6, Vite 8
- **Styling**: Tailwind CSS v4, Plus Jakarta Sans typography, Lucide Icons
- **Mobile Engine**: Capacitor 8 (Android SDK 34 / API 35)
- **Native Plugins**:
  - `@capacitor/local-notifications` (recurring scheduled alerts & high-importance channel)
  - `@capacitor/preferences` (native persistent storage)
  - `@capacitor/haptics` (tactile vibrations)
  - `@capacitor/splash-screen` (Android 12+ theme integration)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Android Studio](https://developer.android.com/studio) (for building the Android APK)

### Installation
```bash
# Clone the repository
git clone https://github.com/hannan-bhatti/habittracker.git
cd habittracker

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Building for Production
```bash
# Build production web bundle
npm run build

# Sync assets to Android
npx cap copy android

# Open project in Android Studio
npx cap open android
```

### Assembling Android APK via CLI
```bash
cd android
./gradlew assembleDebug
```
The compiled debug APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📄 License
MIT License.
