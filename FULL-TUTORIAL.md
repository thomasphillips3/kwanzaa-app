# Kwanzaa Pocket Guide App – Full Build Tutorial

Welcome to the step-by-step tutorial for building the **Kwanzaa Pocket Guide** app using Valdi and TypeScript. This guide will walk you through the entire process: setting up data, implementing date logic, building UI components, adding storage and notifications, and finally running your app on iOS and Android.

---

## Table of Contents

1. Project Setup
2. Defining the Principles Data
3. Implementing Kwanzaa Date Logic
4. Building Core UI Components
5. Adding Persistent Journal Storage
6. Scheduling Local Notifications
7. Wiring Up Navigation
8. Running on Device/Simulator

---

## 1. Project Setup

### 1.1 Initialize the Project

Assuming you have Valdi CLI installed, create a new project folder and initialize npm:

```bash
mkdir kwanzaa-app
cd kwanzaa-app
npm init -y
```

### 1.2 Install Valdi and TypeScript

```bash
npm install valdi typescript
```

### 1.3 Setup Folder Structure

Create the following folders:

```
src/
  data/
  logic/
  ui/
    components/
```

---

## 2. Defining the Principles Data

Create `src/data/principles.ts`:

```ts
export interface Principle {
  id: number;
  name: string;
  description: string;
  reflectionPrompt: string;
}

export const principles: Principle[] = [
  {
    id: 1,
    name: "Umoja (Unity)",
    description: "To strive for and maintain unity in the family, community, nation, and race.",
    reflectionPrompt: "How can you foster unity in your community today?"
  },
  {
    id: 2,
    name: "Kujichagulia (Self-Determination)",
    description: "To define ourselves, name ourselves, create for ourselves, and speak for ourselves.",
    reflectionPrompt: "In what ways can you express your self-determination?"
  },
  {
    id: 3,
    name: "Ujima (Collective Work and Responsibility)",
    description: "To build and maintain our community together and make our brothers’ and sisters’ problems our problems.",
    reflectionPrompt: "How can you contribute to collective work in your community?"
  },
  {
    id: 4,
    name: "Ujamaa (Cooperative Economics)",
    description: "To build and maintain our own stores, shops, and other businesses and to profit from them together.",
    reflectionPrompt: "What cooperative economic activities can you support?"
  },
  {
    id: 5,
    name: "Nia (Purpose)",
    description: "To make our collective vocation the building and developing of our community.",
    reflectionPrompt: "What is your purpose in building your community?"
  },
  {
    id: 6,
    name: "Kuumba (Creativity)",
    description: "To always do as much as we can, in the way we can, to leave our community more beautiful and beneficial.",
    reflectionPrompt: "How can you use creativity to improve your community?"
  },
  {
    id: 7,
    name: "Imani (Faith)",
    description: "To believe with all our heart in our people, our parents, our teachers, our leaders, and the righteousness of our struggle.",
    reflectionPrompt: "What gives you faith in your community and its future?"
  }
];
```

---

## 3. Implementing Kwanzaa Date Logic

Create `src/logic/kwanzaaDates.ts`:

```ts
export function isInKwanzaaRange(date: Date): boolean {
  const year = date.getFullYear();
  const start = new Date(year, 11, 26); // Dec 26
  const end = new Date(year + 1, 0, 1); // Jan 1 next year
  return date >= start && date <= end;
}

export function getKwanzaaDayIndex(date: Date): 1 | 2 | 3 | 4 | 5 | 6 | 7 | null {
  if (!isInKwanzaaRange(date)) return null;
  const start = new Date(date.getFullYear(), 11, 26);
  const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return (diff + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function getNextKwanzaaStart(date: Date): Date {
  const year = date.getMonth() === 11 && date.getDate() > 25 ? date.getFullYear() + 1 : date.getFullYear();
  return new Date(year, 11, 26);
}
```

---

## 4. Building Core UI Components

### 4.1 Layout and Theme

Create `src/ui/components/Layout.ts`:

```ts
import { view, label, button } from "valdi";

export const colors = {
  background: "#fff",
  text: "#222",
  primary: "#cc0000",
  candleLit: "#ff6600",
  candleUnlit: "#ccc"
};

export const spacing = {
  small: 8,
  medium: 16,
  large: 24
};
```

### 4.2 Kinara Component

Create `src/ui/components/Kinara.ts`:

```ts
import { view, label } from "valdi";
import { colors, spacing } from "./Layout";

interface KinaraProps {
  litCandles: number; // 0-7
}

export function Kinara({ litCandles }: KinaraProps) {
  return view(
    { style: { flexDirection: "row", justifyContent: "center", marginVertical: spacing.large } },
    Array.from({ length: 7 }, (_, i) =>
      view(
        {
          key: i,
          style: {
            width: 20,
            height: 60,
            marginHorizontal: spacing.small,
            backgroundColor: i < litCandles ? colors.candleLit : colors.candleUnlit,
            borderRadius: 4
          }
        },
        label({ style: { textAlign: "center", marginTop: 4 } }, (7 - i).toString())
      )
    )
  );
}
```

### 4.3 Home Screen

Create `src/ui/HomeScreen.ts`:

```ts
import { view, label } from "valdi";
import { getKwanzaaDayIndex } from "../logic/kwanzaaDates";
import { colors, spacing } from "./components/Layout";
import { Kinara } from "./components/Kinara";

export function HomeScreen() {
  const today = new Date();
  const dayIndex = getKwanzaaDayIndex(today);

  return view(
    { style: { flex: 1, padding: spacing.medium, backgroundColor: colors.background } },
    label(
      { style: { fontSize: 24, fontWeight: "bold", color: colors.primary, marginBottom: spacing.medium } },
      "Kwanzaa Pocket Guide"
    ),
    dayIndex
      ? label(
          { style: { fontSize: 18, marginBottom: spacing.medium, color: colors.text } },
          `Today is day ${dayIndex} of Kwanzaa`
        )
      : label(
          { style: { fontSize: 18, marginBottom: spacing.medium, color: colors.text } },
          "Today is not during Kwanzaa"
        ),
    Kinara({ litCandles: dayIndex ?? 0 })
  );
}
```

---

## 5. Adding Persistent Journal Storage

Create `src/logic/storage.ts`:

```ts
// Placeholder for persistent storage, replace with Valdi platform APIs

const journalStorage: Record<string, string> = {};

export async function saveJournalEntry(key: string, text: string): Promise<void> {
  // Simulate async write
  journalStorage[key] = text;
}

export async function loadJournalEntry(key: string): Promise<string | null> {
  return journalStorage[key] ?? null;
}
```

---

## 6. Scheduling Local Notifications

Create `src/logic/notifications.ts`:

```ts
// Placeholder stubs - replace with native bridge calls

export async function scheduleKwanzaaNotifications(): Promise<void> {
  // Schedule local notifications for Dec 26–Jan 1 at ~7pm local time
  // Implement native interop in iOS/Android code
  console.log("Scheduling Kwanzaa notifications");
}

export async function cancelKwanzaaNotifications(): Promise<void> {
  console.log("Canceling Kwanzaa notifications");
}
```

---

## 7. Wiring Up Navigation

Create `src/ui/AppRoot.ts`:

```ts
import { view } from "valdi";
import { HomeScreen } from "./HomeScreen";

export function AppRoot() {
  return view({ style: { flex: 1 } }, HomeScreen());
}
```

---

## 8. Running on Device/Simulator

- Run `npm install` to install dependencies.
- Use Valdi CLI commands:

```bash
valdi ios   # For iOS simulator/device
valdi android  # For Android emulator/device
```

- Make code changes in `src/ui` and `src/logic` as needed.
- Rebuild and reload the app to see updates.

---

## Conclusion

You now have a functional Kwanzaa Pocket Guide app foundation with:

- Data-driven principles
- Date logic to identify Kwanzaa days
- UI components including a kinara
- Persistent journal storage stubs
- Notification scheduling stubs

From here, you can enhance the UI, add journal screens, implement native bridges for notifications/storage, and polish the app for release.

Happy coding and Happy Kwanzaa!
