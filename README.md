# Offline Cable – Offline-First Task Manager

**Manage your tasks locally, even without an internet connection.**

Offline Cable is an offline-first task management web application built using React.js. It allows users to create, view, update, delete, and complete tasks while storing task data locally in the browser using IndexedDB.

The project demonstrates local data persistence, a synchronization queue, task status tracking, conflict detection, and conflict resolution through a simple dashboard.

## Features

- **Task Management (CRUD):** Add, view, edit, and delete tasks.
- **Task Completion:** Mark tasks as completed or undo completion.
- **Local Data Persistence:** Store tasks in IndexedDB so they remain available after refreshing the application.
- **Synchronization Queue:** Queue task operations such as ADD, UPDATE, and DELETE.
- **Sync Status Tracking:** Display task statuses as Synced, Pending, or Conflict.
- **Manual Sync Simulation:** Process queued operations locally using the Sync Now feature.
- **Conflict Detection:** Identify differences between local and remote sample task versions.
- **Conflict Resolution:** Demonstrate Local, Remote, and Last Write Wins strategies.
- **Responsive Dashboard:** A user-friendly interface designed for desktop and mobile screens.

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development and reusable components |
| JavaScript | Application functionality |
| CSS3 | UI styling and responsive layout |
| IndexedDB | Local browser database |
| Vite | Development server and build tool |
| Git & GitHub | Version control and team collaboration |
| Vitest | Unit and component testing |
| React Testing Library | Component interaction testing |
| Playwright | End-to-end testing |
| Node.js Test Runner | Synchronization queue testing |

## Project Architecture

The application is organized into different modules:

```text
offline-cable/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── TaskForm.jsx
│   │   ├── SyncStatus.jsx
│   │   ├── ConflictDemo.jsx
│   │   └── ConflictDemo.css
│   │
│   ├── database/
│   │   └── storage.js
│   │
│   ├── services/
│   │   └── syncQueue.js
│   │
│   ├── data/
│   │   └── sampleTasks.js
│   │
│   ├── utils/
│   │   └── conflict.js
│   │
│   ├── tests/
│   │   ├── App.test.jsx
│   │   ├── TaskForm.test.jsx
│   │   └── setup.js
│   │
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── tests/
│   └── syncQueue.test.js
│
├── e2e/
│   └── offline-cable.spec.js
│
├── playwright.config.js
├── vite.config.js
├── TESTING_GUIDE.md
├── SYNC_DOCUMENTATION.md
├── package.json
└── README.md
```

## How It Works

### 1. Local Task Storage

Tasks are stored in the browser using IndexedDB. When the application opens, it retrieves previously saved tasks and displays them on the dashboard.

### 2. Synchronization Queue

When a user adds, updates, or deletes a task, the corresponding operation is added to a local synchronization queue.

Each operation is categorized as:

- `ADD` – Add a new task.
- `UPDATE` – Update an existing task.
- `DELETE` – Delete a task.

The Sync Now feature processes queued operations locally and updates task statuses.

### 3. Conflict Detection and Resolution

The conflict demonstration compares two sample versions of a task.

It identifies differences in fields such as title, priority, and completion status.

Users can choose between:

- **Local:** Keep the local version.
- **Remote:** Keep the remote sample version.
- **Last Write Wins:** Select the version with the more recent timestamp.

### 4. Dashboard and User Interface

The React dashboard provides a central interface for task management, task status tracking, and accessing the conflict demonstration.

## Installation and Setup

### Prerequisites

- Node.js
- npm
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/ainakshi/offline-cable.git
```

### Step 2: Navigate to the Project

```bash
cd offline-cable
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## Testing

The project includes unit, component, synchronization queue, and end-to-end tests.

Run the following commands:

| Command | Description |
|---|---|
| `npm run lint` | Run ESLint checks |
| `npm run test:sync` | Run synchronization queue tests |
| `npm run test:unit` | Run unit and component tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:coverage` | Generate test coverage |
| `npm run test:all` | Run linting and all test suites |
| `npm run build` | Create a production build |

### Testing Results

The integrated test suite successfully passed:

- 6 synchronization queue tests
- 16 unit and component test cases
- 12 end-to-end test executions across desktop and mobile Chromium

**Total: 34 successful test executions.**

The production build was also completed successfully.

For detailed test cases and execution instructions, refer to [TESTING_GUIDE.md](TESTING_GUIDE.md).

## Team Contributions

This project was developed collaboratively by a team of five members.

| Team Member | Contribution |
|---|---|
| **Ainakshi** | Frontend development, UI/UX, dashboard layout, task interactions, and module integration |
| **Aditi Gupta** | IndexedDB integration and local task storage |
| **Agrim Sharma** | Synchronization queue implementation |
| **Abhinav Chauhan** | Conflict detection and resolution |
| **Akarsh Mishra** | Testing, quality assurance, and test documentation |

## Current Project Scope and Limitations

Offline Cable is a functional academic prototype demonstrating offline-first concepts. The current implementation has the following limitations:

- There is no backend server or cloud database.
- Actual synchronization between multiple devices is not implemented.
- Synchronization queue processing is simulated locally.
- The synchronization queue is maintained in memory and does not survive a page refresh.
- Conflict resolution uses sample task versions and does not persist the selected result to IndexedDB.
- The offline indicator is currently a static UI indicator rather than live network detection.

These features can be extended in future development.

## Future Enhancements

- Implement backend and cloud synchronization.
- Enable real-time synchronization across multiple devices.
- Persist queued operations across application restarts.
- Integrate conflict resolution with actual stored task records.
- Add user authentication and task ownership.
- Improve network connectivity detection.
- Add notifications and advanced task filtering.

## Learning Outcomes

Through this project, the team gained practical experience in:

- Building component-based applications using React.
- Managing application state with React Hooks.
- Working with browser-based IndexedDB storage.
- Understanding offline-first application architecture.
- Implementing synchronization queues and conflict resolution concepts.
- Writing automated tests using Vitest and Playwright.
- Collaborating through Git, GitHub branches, and pull requests.

---

**Project:** Offline Cable – Offline-First Task Manager  
**Repository:** https://github.com/ainakshi/offline-cable

*Developed as a collaborative academic project.*
