# Offline Cable — Complete Testing Guide, Test Case Matrix & QA Bug Report

This guide covers everything needed to run automated tests, generate coverage reports, and present QA findings for the **Offline Cable** React + Vite application.

## 1. Test Suite Architecture

| Layer | Tooling | Files | What It Covers |
| :--- | :--- | :--- | :--- |
| **Unit Testing** | Vitest + React Testing Library | `src/tests/TaskForm.test.jsx` | Form rendering, defaults, input trimming, empty/whitespace validation, `onAdd` payload structure, `onCancel` / `×` handlers, unique ID generation |
| **Integration Testing** | Vitest + React Testing Library | `src/tests/App.test.jsx` | Header & offline indicator, initial 3 tasks & badge classes, modal open/close flow, adding single & multiple tasks, empty-submit guard, footer summary |
| **Smoke Testing** | Vitest + ReactDOM | `src/tests/main.test.jsx` | Clean React 19 root mount/unmount into `#root` without runtime errors |
| **End-to-End (E2E) Testing** | Playwright | `e2e/offline-cable.spec.js` | Real browser flows (Desktop Chrome + Pixel 5 mobile), dialog validation, offline network simulation (`setOffline(true)`), responsive overflow check |
| **Static Linting** | ESLint | `eslint.config.js` | Code quality checks across app and test files |

## 2. Quick Start Commands

Inside the `offline-cable-main` folder, run:

```bash
# 1. Install all dependencies (including Vitest, Testing Library, and Playwright)
npm install

# 2. Run all unit, integration, and smoke tests
npm test

# 3. Run tests in watch mode while developing
npm run test:watch

# 4. Generate code coverage report (outputs to ./coverage/index.html)
npm run test:coverage

# 5. Install Chromium for Playwright (one-time setup)
npx playwright install chromium

# 6. Run End-to-End browser tests (starts Vite dev server automatically)
npm run test:e2e

# 7. Run everything (Lint + Coverage + E2E)
npm run test:all
```

## 3. Complete Test Case Matrix

| ID | Suite | Test Case | Expected Result |
| :--- | :--- | :--- | :--- |
| TC-01 | `TaskForm.test.jsx` | Render modal UI & defaults | Heading, inputs, `Medium` default priority, Cancel/Add/× buttons visible |
| TC-02 | `TaskForm.test.jsx` | Submit valid task | Trims title/description, passes valid object to `onAdd`, resets form |
| TC-03 | `TaskForm.test.jsx` | Submit empty title | Calls `alert("Please enter a task title.")`, blocks `onAdd` |
| TC-04 | `TaskForm.test.jsx` | Submit whitespace-only title | Calls `alert(...)`, blocks `onAdd` |
| TC-05 | `TaskForm.test.jsx` | Submit with empty description | Succeeds with `description: ""` |
| TC-06 | `TaskForm.test.jsx` | Click Cancel button | Calls `onCancel`, does not call `onAdd` |
| TC-07 | `TaskForm.test.jsx` | Click close (`×`) button | Calls `onCancel`, does not call `onAdd` |
| TC-08 | `TaskForm.test.jsx` | Multiple submissions | Generates distinct `crypto.randomUUID()` IDs |
| TC-09 | `App.test.jsx` | Render header & connection badge | Displays "Offline Cable", subtitle, and "Offline" status dot |
| TC-10 | `App.test.jsx` | Render initial 3 tasks | Displays all 3 seeded tasks with matching priority & sync CSS classes |
| TC-11 | `App.test.jsx` | Toggle modal via `+ Add Task` | Modal hidden on load, visible after click |
| TC-12 | `App.test.jsx` | Cancel/close modal from App | Modal closes, task count remains 3 |
| TC-13 | `App.test.jsx` | Add task end-to-end in App | Modal closes, task count becomes 4, new card has correct classes |
| TC-14 | `App.test.jsx` | Add multiple tasks sequentially | Task count becomes 5, prior tasks preserved |
| TC-15 | `App.test.jsx` | Empty title submit in App | Alert shown, modal stays open, task count stays 3 |
| TC-16 | `App.test.jsx` | Render footer summary | Displays Synced, Pending, Conflict counters |
| TC-17 | `main.test.jsx` | Mount app into `#root` | Mounts and unmounts cleanly with zero errors |
| E2E-01 | `offline-cable.spec.js` | Initial page load | Page title, header, 3 tasks, and footer visible |
| E2E-02 | `offline-cable.spec.js` | Create task in browser | New task rendered in DOM with `High` & `pending` badges |
| E2E-03 | `offline-cable.spec.js` | Browser alert validation | Native browser alert text matches, modal stays open |
| E2E-04 | `offline-cable.spec.js` | Cancel & close buttons | Modal hides without adding tasks |
| E2E-05 | `offline-cable.spec.js` | Offline mode task creation | Task creation succeeds with `context.setOffline(true)` |
| E2E-06 | `offline-cable.spec.js` | Mobile responsiveness (375×667) | Zero horizontal scroll overflow, `+ Add Task` visible |

## 4. QA Findings & Bug Report (Found During Code Audit)

Include these verified defects in your QA report or share them with the dev team:

1. **BUG-01 (High) — Hardcoded Footer Summary Counts (`src/App.jsx`)**
   - **Observed**: Footer always shows `8 Synced`, `2 Pending`, `1 Conflict`, even though initial state has 1 Synced, 1 Pending, and 1 Conflict — and adding new tasks never increments Pending.
   - **Fix**: Derive counts dynamically from `tasks.filter(t => t.syncStatus.toLowerCase() === ...).length`.

2. **BUG-02 (Medium) — Inconsistent `syncStatus` Casing (`src/App.jsx` vs `src/components/TaskForm.jsx`)**
   - **Observed**: Seeded tasks use `"Pending"` (capitalized), whereas `TaskForm.jsx` creates tasks with `syncStatus: "pending"` (lowercase), causing inconsistent badge text in the UI.
   - **Fix**: Standardize `TaskForm.jsx` to `syncStatus: "Pending"` (or format consistently in the UI).

3. **BUG-03 (Medium) — Missing Label-Input Accessibility Associations (`src/components/TaskForm.jsx`)**
   - **Observed**: `<label>Task Title</label>`, `<label>Description</label>`, and `<label>Priority</label>` lack `htmlFor` attributes matching input `id` attributes, hurting screen-reader accessibility and label click-to-focus.
   - **Fix**: Add `id` to each input/textarea/select and matching `htmlFor` to each `<label>`.

4. **BUG-04 (Low) — Hardcoded Offline Indicator (`src/App.jsx`)**
   - **Observed**: Header always displays `Offline` regardless of actual `navigator.onLine` network state.
   - **Fix**: Track `navigator.onLine` with `window.addEventListener('online' / 'offline', ...)`.

5. **BUG-05 (Low) — No Offline Persistence (`src/App.jsx`)**
   - **Observed**: Tasks are stored only in `useState`, so refreshing the page wipes newly created tasks.
   - **Fix**: Persist tasks to `localStorage` or `IndexedDB` so the app truly works offline across reloads.

6. **BUG-06 (Low) — Blocking `window.alert()` Validation (`src/components/TaskForm.jsx`)**
   - **Observed**: Empty title validation uses native `alert()`, which blocks the browser thread.
   - **Fix**: Display an inline error message below the Task Title input.
