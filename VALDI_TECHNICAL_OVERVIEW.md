# Valdi Technical Implementation: Kwanzaa App

This document outlines the technical architecture of the Kwanzaa App, specifically focusing on how the **Valdi** framework was utilized to deliver a cross-platform, native-first experience with a single shared codebase.

## 1. Architecture: The "One Codebase, Any Platform" Approach

Valdi decouples the **User Interface (UI)** and **Business Logic** from the underlying platform implementations (iOS/Android).

### A. The "Brain" (TypeScript/Valdi Layer)
*   **Location**: `src/ui/` and `src/logic/`
*   **Role**: Contains 100% of the application logic and UI definitions.
*   **Implementation**: Written in strict TypeScript.
    *   **UI**: Components like `HomeScreen.ts` use Valdi's declarative primitives (`view`, `label`, `button`) to describe the interface abstractly. It does not bind to specific iOS `UIView` or Android `View` classes.
    *   **Logic**: Core algorithms (e.g., `kwanzaaDates.ts` for determining the current principle) are pure TypeScript functions, fully unit-testable and platform-agnostic.

### B. The "Bridge" (Native Bindings)
*   **Location**: `ios/KwanzaaBridge.swift` and `android/KwanzaaBridge.kt`
*   **Role**: Exposes platform-specific capabilities to the Valdi runtime.
*   **Implementation**: A `NativeBridge` interface handles secure interactions such as:
    *   **Storage**: `saveJournalEntry` / `loadJournalEntry`
    *   **Haptics**: Device feedback
    *   **Notifications**: Local scheduling
    The TypeScript layer calls these methods asynchronously, and the native host fulfills them.

### C. The "Host" (Native Apps)
*   **Role**: A thin native shell that initializes the Valdi runtime.
*   **Function**: It loads the compiled JavaScript bundle. When Valdi executes a `view()` function, the host translates that abstract definition into a real native hierarchy in real-time:
    *   **iOS**: Translates to native `SwiftUI` or `UIKit` views.
    *   **Android**: Translates to `Jetpack Compose` or standard Android `Views`.

## 2. Code Reusability Strategy

By using Valdi, the project achieves ~95% code sharing between iOS and Android.

*   **Shared UI Components**: Complex components like the `Kinara` (candle holder) are defined once in `src/ui/components/Kinara.ts` and render natively on both platforms.
*   **State Management**: Navigation (routing) and app state (e.g., `AppRoot.ts`) are handled entirely in TypeScript. Routing logic is not duplicated in Swift or Kotlin.

## 3. The PWA (Progressive Web App) Relationship

While Valdi drives the native apps, the **PWA** (hosted at `kwanzaa.holiday`) serves as an instant-access web companion.

*   **Implementation**: The PWA is a lightweight, "offline-first" web client that mirrors the Valdi app's feature set.
*   **Data Consistency**: The Valdi native app and the PWA share the same data structures and logic (e.g., the `principles.ts` data model), ensuring content consistency across the "Installable App" (Valdi) and the "Instant Web App" (PWA).

## Summary for Technical Teams

This architecture demonstrates how Valdi enables high-fidelity native experiences without maintaining two distinct codebases. It treats the UI as data computed by a shared JavaScript core, delivering the "Write Once, Run Everywhere" promise with a lighter weight, native-first rendering approach.

