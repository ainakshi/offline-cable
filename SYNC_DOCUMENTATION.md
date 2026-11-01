# Local synchronization queue

## What this module does

The queue records task changes in this browser session and simulates processing
them one at a time. It does not contact a server. A `synced` queue operation
means only that the local simulator completed successfully; it does not mean
that any remote copy was updated.

## Important temporary limitation

There is no storage implementation in the current project, and the IndexedDB
structure is coordinated by Aditi. Until that implementation is available and
agreed, `src/services/syncQueue.js` uses a temporary in-memory array. The queue
and task list are lost on refresh or when the page is closed. No database or
object store has been created.

The adapter must later be replaced with calls into the agreed storage API. That
follow-up should also handle persistence errors before reporting an operation
as synced. The current in-memory implementation has no persistence operation
that can fail.

## Queue entry

Each created entry has this shape:

```js
{
  operationId: "generated-unique-id",
  taskId: "id-of-the-task",
  type: "ADD", // ADD, UPDATE, or DELETE
  data: { title: "DBMS Assignment", priority: "High" },
  timestamp: 123456789,
  status: "pending" // pending or synced
}
```

`operationId` identifies one queue event; `taskId` identifies the task. A
single task may therefore have multiple entries. Operation data is copied when
queued so later edits to the caller's object do not change the recorded entry.
For DELETE, provide the task snapshot or other processing data when queueing it;
the queue retains that data even if the task is subsequently removed locally.

## Exported functions

### `addToQueue(operation)`

Accepts `{ taskId, type, data }`. Supported types are `ADD`, `UPDATE`, and
`DELETE`; task IDs must be non-empty strings or finite numbers, and data must
be a non-empty object. ADD data must include a non-empty `title` and a
`priority` of `Low`, `Medium`, or `High`.

The function generates an ID with `crypto.randomUUID()`, records the current
time, sets status to `pending`, and returns a copy of the new entry. Invalid
input throws an error. The ADD workflow in `App.jsx` currently uses this
function. UPDATE and DELETE workflows are not present in the app yet.

### `getPendingOperations()`

Takes no parameters. Returns copies of pending entries, ordered by timestamp;
entries with the same timestamp retain their insertion order.

### `processQueue(options)`

Processes pending entries in order and waits for each one before starting the
next. By default, `simulateOperation()` waits briefly and succeeds without
network requests. The function returns `{ processedCount, pending, synced }`.

If processing fails, it stops at the failed entry and rejects with an error
that includes the operation ID and the number already processed. The failed
entry and later entries remain pending; successfully completed earlier entries
remain synced. Calling `processQueue()` again retries pending entries.

For testing, callers may pass
`{ processOperation: async (operation) => ... }`. Overlapping calls share the
same in-progress promise, so they cannot process an entry twice concurrently.

### `markAsSynced(operationId)`

Marks a pending entry as synced and returns
`{ marked: true, operation }`. A missing ID throws. An unknown ID returns
`{ marked: false, reason: "not_found" }`; an already-synced entry returns
`{ marked: false, reason: "already_synced" }`. In the temporary in-memory
adapter, changing the status is synchronous.

### UI helpers

`getQueueStats()` returns `{ pending, synced }`. `subscribeToQueue(listener)`
calls the listener with updated counts when entries are added or marked synced,
and returns an unsubscribe function. `simulateOperation()` is also exported
for direct use or testing.

## Example

```js
import { addToQueue, processQueue } from "./services/syncQueue";

addToQueue({
  taskId: "task-123",
  type: "ADD",
  data: { title: "DBMS Assignment", priority: "High" },
});

const result = await processQueue();
console.log(result.processedCount);
```

## UI and task status

`SyncStatus.jsx` displays pending and locally processed operation counts,
disables the Sync Now button while processing, and shows success or error
feedback. Queue logic remains in the service module.

Queue operation status is separate from task `syncStatus`. The current app does
not update task-level status when operations are processed. That behavior must
be coordinated with the existing task-storage design so one successful
operation does not incorrectly mark a task synced while another is pending.
Conflict resolution is outside this module.

## Tests

The repository does not have a test framework dependency. Tests use Node's
built-in test runner, so no additional package is needed:

```sh
node --test
```

The tests cover validation, ADD/UPDATE/DELETE entries, pending selection,
sequential processing, duplicate prevention, failure and retry behavior, and
overlapping calls. Persistence across refreshes cannot be tested until an
approved persistent adapter exists.

## Deferred integration work

After Aditi provides the agreed database name, object stores, indexes, and
storage APIs, replace the in-memory implementation with the shared storage
adapter. Then add tests against isolated persistent storage, integrate
UPDATE/DELETE where those task workflows exist, and decide with the team how
task-level status should be maintained. No schema, backend, or conflict
resolution logic is introduced here.
