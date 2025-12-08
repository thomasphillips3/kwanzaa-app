# Kwanzaa Pocket Guide App

A small, offline-first mobile app to help families celebrate **Kwanzaa**.

Built with **Valdi + TypeScript**, targeting **iOS and Android**.

## Features (v1)

- Shows the **current Kwanzaa day** (Dec 26–Jan 1)
- Displays the **Nguzo Saba** (7 principles) with descriptions and prompts
- Renders a **kinara** with 7 candles, lighting the correct candles by day
- Allows users to **journal reflections** locally on their device
- Sends **local notifications** during Kwanzaa evenings (Dec 26–Jan 1)

No backend. All data is bundled or stored locally.

---

## Tech Stack

- **Valdi** – TypeScript-based UI framework that compiles to native views
- **TypeScript** – strongly typed app logic
- **Native iOS/Android modules** – for local notifications and persistent storage (via Valdi interop)

> Note: Exact Valdi commands/APIs may evolve. Always cross-check with the official Valdi documentation when running CLI commands or using new APIs.

---

## Project Structure

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
  ios/
  android/
  package.json
  tsconfig.json
  README.md
  FULL-TUTORIAL.md
```

---

## Prerequisites

- Node.js (LTS)
- A working **Valdi** dev environment (CLI + iOS/Android tooling)
- For iOS builds: Xcode + iOS SDK
- For Android builds: Android Studio / SDK / emulator or device

Refer to the official Valdi docs for environment setup and CLI installation.

---

## Getting Started (High Level)

1. **Install dependencies**

   ```bash
   # in the project root
   npm install
   ```

2. **Run the app in development**

   Use the Valdi CLI to start a dev build for your target platform (commands may differ depending on the version of Valdi you have installed; check the docs):

   ```bash
   # iOS example (adjust per Valdi docs)
   valdi ios

   # Android example (adjust per Valdi docs)
   valdi android
   ```

3. **Edit code**

   - UI components live in `src/ui`.
   - Static principle data lives in `src/data/principles.ts`.
   - Date logic, storage, and notifications are in `src/logic`.

4. **Build for release**

   Use Valdi/Xcode/Android Studio to produce release builds for the App Store and Play Store. Follow platform-specific steps for signing, provisioning profiles, and store submission.

---

## Documentation

- **FULL-TUTORIAL.md** – step-by-step guide to building this app.
- **.cursor/AGENTS.md** – guidance for AI agents working on this repo.

---

## Roadmap Ideas (Post-v1)

- Multiple languages / localization
- Audio explanations for each principle
- Shareable reflection cards (image export)
- Optional cloud sync for journal entries

For now, the focus is shipping a **simple, reliable Kwanzaa v1** in time for the holiday season.
