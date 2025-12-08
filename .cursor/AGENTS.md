# Kwanzaa App – Cursor Agents Guide

This file describes how AI agents should work on this repo. The goal is to build and ship a small, high-quality **Kwanzaa Pocket Guide** app using **Valdi**.

--- 
## 1. Project Vision

A cross-platform mobile app (iOS + Android) that helps families celebrate Kwanzaa by:
- Showing the **current Kwanzaa day** and principle
- Displaying a **kinara** (7 candles) with the correct candles lit
- Providing short **descriptions and reflection prompts** for each principle
- Allowing users to **journal** their reflections locally on their device
- Sending **local notifications** during Kwanzaa evenings (Dec 26–Jan 1)

Stack: **Valdi + TypeScript**, no backend, all data stored locally.

--- 
## 2. Repo Structure (Planned)

```text
kwanzaa-app/
  .cursor/
    AGENTS.md
  src/
    data/
      principles.ts
    logic/
      kwanzaaDates.ts
      storage.ts
      notifications.ts
    ui/
      AppRoot.ts
      HomeScreen.ts
      PrinciplesListScreen.ts
      PrincipleDetailScreen.ts
      JournalScreen.ts
      components/
        Kinara.ts
        Layout.ts
  ios/        # Valdi/iOS native boilerplate
  android/    # Valdi/Android native boilerplate
  package.json
  tsconfig.json
  README.md
  FULL-TUTORIAL.md
```

If some of these files don’t exist yet, agents may create them when needed.

--- 
## 3. Agent Responsibilities

### 3.1. `app-arch-agent`

**Goal:** Keep the architecture simple, clear, and consistent.

Tasks:
- Maintain the folder structure shown above.
- Ensure business logic lives in `src/logic` and static data in `src/data`.
- Keep UI components in `src/ui` and `src/ui/components`.
- Avoid circular dependencies between modules.

### 3.2. `valdi-ui-agent`

**Goal:** Implement all UI in Valdi using TSX-style components.

Guidelines:
- Use Valdi primitives (`view`, `label`, `button`, etc.) consistently.
- Centralize shared colors and typography in `Layout.ts` (e.g., export `colors` and `spacing` constants).
- Make the UI accessible: good contrast, font sizes ≥ 16 for body text, readable on a phone in portrait orientation.
- Keep logic (date, storage) out of components; call functions from `src/logic`.

### 3.3. `data-logic-agent`

**Goal:** Own date logic, principle data, and storage utilities.

Tasks:
- Implement `src/data/principles.ts` with the 7 Nguzo Saba principles.
- Implement `src/logic/kwanzaaDates.ts` with helpers like:
  - `isInKwanzaaRange(date: Date): boolean`
  - `getKwanzaaDayIndex(date: Date): 1 | 2 | 3 | 4 | 5 | 6 | 7 | null`
  - `getNextKwanzaaStart(date: Date): Date`
- Implement `src/logic/storage.ts` wrapping local storage APIs (per Valdi/host platform guidance) with async functions:
  - `saveJournalEntry(key: string, text: string)`
  - `loadJournalEntry(key: string): Promise<string | null>`

### 3.4. `native-bridge-agent`

**Goal:** Provide a minimal native bridge for **local notifications** and **persistent storage** when Valdi does not provide a direct helper.

Tasks:
- Add thin Swift/Kotlin modules to schedule local notifications for Dec 26–Jan 1 at ~7pm local time.
- Expose these as simple async functions to the TS layer via Valdi’s interop mechanisms.
- Keep the API surface tiny and stable:
  - `scheduleKwanzaaNotifications()`
  - `cancelKwanzaaNotifications()`

### 3.5. `docs-agent`

**Goal:** Keep docs accurate and helpful.

Tasks:
- Maintain `README.md` as a concise overview with setup instructions.
- Maintain `FULL-TUTORIAL.md` as a longer, step-by-step guide.
- When code changes significantly, update the docs in the same PR/patch.

--- 
## 4. Coding Style

- Language: **TypeScript**.
- Prefer named exports over default exports.
- Keep functions small and focused.
- Use clear, descriptive names (e.g., `getKwanzaaDayInfo` instead of `getInfo`).
- Write pure functions for date/data logic where possible.
- [CLEAN-CODE.md](./CLEAN_CODE.md)

--- 
## 5. Non-Goals for v1

Agents should **not** add:
- User authentication
- Remote/cloud sync
- Payments or subscriptions
- Analytics SDKs

Focus on a clean, offline-first Kwanzaa experience.

--- 
## 6. Definition of Done for v1

- App builds and runs on at least one iOS device and one Android device.
- Home screen shows correct Kwanzaa day and candle state for dates between Dec 26 and Jan 1.
- Principles screen lists all 7 principles with details.
- Journal screen allows saving and reloading at least one text entry per day+principle.
- Local notifications fire during Kwanzaa when enabled.
- README and FULL-TUTORIAL are up to date.
