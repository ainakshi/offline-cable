# Offline Cable — Testing Guide, Test Case Matrix & QA Report

## 1. Project Overview

Offline Cable is an offline-first task manager built using React and Vite. It supports local task management, IndexedDB persistence, task status indicators, a synchronization queue, and a conflict-resolution demonstration.

**Important implementation limitations:**
- Task data is persisted locally using IndexedDB.
- Synchronization queue operations are processed locally with simulated synchronization.
- The synchronization queue is in-memory and is lost after refreshing the application.
- Actual server synchronization and cross-device synchronization are not implemented.
- Conflict resolution currently uses sample tasks in a demonstration component and does not update actual IndexedDB records.

## 2. Test Suite Architecture

| Layer | Tooling | Files | Coverage |
|---|---|---|---|
| Unit Testing | Vitest + React Testing Library | `src/tests/TaskForm.test.jsx` | Form rendering, validation, submission, callbacks and unique IDs |
| Integration Testing | Vitest + React Testing Library | `src/tests/App.test.jsx` | Dashboard, task creation, modal interactions and footer counters |
| Queue Testing | Node.js Test Runner | `tests/syncQueue.test.js` | Queue operations, processing, retries and concurrent calls |
| End-to-End Testing | Playwright | `e2e/offline-cable.spec.js` | Desktop and mobile browser workflows |
| Static Analysis | ESLint | `eslint.config.js` | Code quality and lint checks |

## 3. Quick Start Commands

```bash
# Install dependencies
npm install

# Run all unit and queue tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate code coverage
npm run test:coverage

# Install Chromium
npx playwright install chromium

# Run browser tests
npm run test:e2e

# Run lint, unit/queue tests and E2E tests
npm run test:all
```

Coverage output is generated in the `coverage` directory.

## 4. Test Case Matrix

### TaskForm Unit Tests

| ID | Test Case | Expected Result |
|---|---|---|
| TC-01 | Render form and defaults | Inputs, Medium priority and action buttons appear |
| TC-02 | Submit valid task | Trimmed values and valid task metadata passed to `onAdd` |
| TC-03 | Submit empty title | Alert displayed and submission blocked |
| TC-04 | Submit whitespace-only title | Alert displayed and submission blocked |
| TC-05 | Submit empty description | Submission succeeds |
| TC-06 | Cancel form | `onCancel` called |
| TC-07 | Close form | `onCancel` called |
| TC-08 | Generate unique IDs | Consecutive submissions receive different IDs |

### App Integration Tests

| ID | Test Case | Expected Result |
|---|---|---|
| TC-09 | Render dashboard header | Header and offline indicator visible |
| TC-10 | Render initial tasks | Three initial tasks and their statuses displayed |
| TC-11 | Open Add Task modal | Modal appears after clicking Add Task |
| TC-12 | Cancel or close modal | Modal closes without adding a task |
| TC-13 | Add a new task | Modal closes and task appears in list |
| TC-14 | Add multiple tasks | Existing tasks remain and new tasks appear |
| TC-15 | Submit empty title | Alert displayed; modal remains open |
| TC-16 | Render footer counters | Synced, Pending and Conflict counts displayed dynamically |

### Synchronization Queue Tests

Six automated tests cover:
- ADD, UPDATE and DELETE operations.
- Retrieving pending operations.
- Sequential processing.
- Failure handling and retry.
- Concurrent processing protection.
- Invalid operation rejection.

### Playwright End-to-End Tests

| ID | Test Case | Expected Result |
|---|---|---|
| E2E-01 | Initial dashboard | Header, three tasks and footer visible |
| E2E-02 | Create task | New task and correct badges displayed |
| E2E-03 | Empty-title validation | Browser alert displayed; modal stays open |
| E2E-04 | Cancel and close | Modal closes without adding tasks |
| E2E-05 | Offline task creation | Task can be created while browser network is offline |
| E2E-06 | Mobile responsiveness | No horizontal overflow at 375 × 667 viewport |

The six E2E scenarios run on both desktop Chromium and Pixel 5 mobile emulation, producing 12 executions.

## 5. QA Findings and Bug Report

| ID | Finding | Status |
|---|---|---|
| BUG-01 | Footer counters previously hardcoded | Fixed — dynamic counters implemented |
| BUG-02 | Inconsistent sync status casing | Fixed — lowercase status values |
| BUG-03 | Missing label-input accessibility associations | Open |
| BUG-04 | Offline indicator does not track actual network state | Open |
| BUG-05 | Tasks previously lacked persistent storage | Fixed — IndexedDB implemented |
| BUG-06 | Native alert used for empty-title validation | Open — inline validation would improve UX |

### Additional Technical Limitations

1. Synchronization queue is in-memory and does not survive page refresh.
2. Synchronization is simulated locally; there is no actual remote server.
3. Conflict resolution is demonstrated using sample task versions rather than persisted application tasks.
4. Actual cross-device synchronization is not available.

## 6. Test Execution Summary

| Test Suite | Passed |
|---|---:|
| Sync Queue Tests | 6/6 |
| TaskForm Unit Tests | 8/8 |
| App Integration Tests | 8/8 |
| Playwright Desktop | 6/6 |
| Playwright Mobile | 6/6 |
| **Total** | **34/34** |

ESLint: Passed.

Production build: Passed.

All recorded automated tests passed successfully during the latest test execution.

## 7. Conclusion

Offline Cable has been validated through unit testing, integration testing, synchronization queue testing, browser automation and static code analysis.

The test results confirm that core task management workflows work correctly, including local task creation while the browser is offline.

The project demonstrates offline-first task management, local persistence, simulated synchronization and conflict-resolution concepts, while actual remote synchronization and cross-device functionality remain future improvements.