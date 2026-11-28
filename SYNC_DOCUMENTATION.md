# Local Synchronization Queue

## What This Module Does

The synchronization queue records task operations in the current browser session and simulates processing them one at a time.

It supports three operation types:

- `ADD` – Records a newly created task.
- `UPDATE` – Records changes to an existing task, including completion or undo.
- `DELETE` – Records a task deletion along with its task data.

The current implementation simulates synchronization locally. It does not contact a remote server or synchronize tasks across devices.

A queue operation marked as `synced` means that local simulated processing completed successfully. It does not mean that a remote copy was updated.

## Storage and Current Limitations

Task data is stored in IndexedDB using the shared storage implementation.

However, the synchronization queue in `src/services/syncQueue.js` currently uses an in-memory JavaScript array.

This means:

- Tasks remain stored in IndexedDB after a page refresh.
- Pending queue operations are lost when the page is refreshed or closed.
- Queue processing is simulated locally.
- No real server or cross-device synchronization is implemented.

A persistent synchronization queue and real backend integration are future improvements.

## Queue Entry

Each created queue entry has the following structure:

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

`operationId` uniquely identifies a queue operation, while `taskId` identifies the associated task.

A single task can have multiple queue entries.

Operation data is copied when added to the queue, so later changes to the original object do not modify the stored queue entry.

For DELETE operations, the task snapshot is retained in the queue even after the task is removed locally.

## Exported Functions

### `addToQueue(operation)`

Accepts an object containing `{ taskId, type, data }`.

Supported operation types are `ADD`, `UPDATE`, and `DELETE`.

Task IDs must be non-empty strings or finite numbers, and operation data must be a non-empty object.

For ADD operations, the data must include:
- A non-empty task title.
- A valid priority: `Low`, `Medium`, or `High`.

The function generates a unique operation ID using `crypto.randomUUID()`, records the current timestamp, sets the status to `pending`, and returns a copy of the created entry.

Invalid input throws an error.

The ADD, UPDATE, and DELETE workflows in `App.jsx` use this function to record task operations.

### `getPendingOperations()`

Takes no parameters.

Returns copies of all pending queue entries, ordered by timestamp. Entries with identical timestamps retain their insertion order.

### `processQueue(options)`

Processes pending operations sequentially, waiting for each operation to finish before starting the next.

By default, `simulateOperation()` waits briefly and returns success without making any network request.

The function returns:

`{ processedCount, pending, synced }`

If an operation fails, processing stops and an error is returned containing the failed operation ID and the number of operations already processed.

The failed operation and subsequent operations remain pending, while successfully processed operations remain synced.

Calling `processQueue()` again retries pending operations.

For testing, callers can provide a custom processing function:

`{ processOperation: async (operation) => ... }`

Overlapping calls share the same in-progress promise to prevent concurrent processing of the same queue entries.

### `markAsSynced(operationId)`

Marks a pending queue operation as synced.

Returns `{ marked: true, operation }` when successful.

For unknown operation IDs, it returns:

`{ marked: false, reason: "not_found" }`

For operations already marked as synced, it returns:

`{ marked: false, reason: "already_synced" }`

Invalid or empty operation IDs throw an error.

### UI Helpers

- `getQueueStats()` returns the number of pending and synced operations.
- `subscribeToQueue(listener)` subscribes to queue updates and returns an unsubscribe function.
- `simulateOperation()` simulates a successful operation with a short delay.

## Example

```js
import { addToQueue, processQueue } from "./services/syncQueue";

addToQueue({
  taskId: "task-123",
  type: "ADD",
  data: {
    title: "DBMS Assignment",
    priority: "High"
  }
});

const result = await processQueue();

console.log(result.processedCount);
```

## UI and Task Status

`SyncStatus.jsx` provides the synchronization interface.

It displays:
- The number of pending queue operations.
- The number of locally processed operations.
- A Sync Now button.
- Processing and success/error feedback.

The button is disabled while queue processing is in progress.

Queue operation status is separate from the task-level `syncStatus` stored in IndexedDB.

When ADD or UPDATE operations are successfully processed, the application updates the corresponding task's `syncStatus` to `synced`.

For DELETE operations, the task is removed from IndexedDB and the UI before simulated queue processing. The queue retains the task snapshot for processing.

Conflict detection and resolution are not implemented in this synchronization module.

## Tests

The project uses Node.js's built-in test runner and does not require an additional testing framework.

Run the tests using:

```sh
npm test
```

The six automated tests cover:

- ADD, UPDATE, and DELETE operation creation.
- Unique queue IDs.
- Pending operation selection.
- Sequential processing.
- Prevention of duplicate processing.
- Failure handling and retry behavior.
- Overlapping processing calls.
- Invalid operation validation.

The tests verify the queue's behavior but do not cover persistent queue storage or real network synchronization.

## Deferred Integration Work

Future improvements include:

1. Persisting queue operations so they survive page refreshes.
2. Integrating a real backend for server synchronization.
3. Supporting synchronization across multiple devices.
4. Implementing conflict detection and resolution.
5. Adding tests for persistent queue behavior and real synchronization.

The current implementation provides IndexedDB-based task storage and an in-memory queue with simulated synchronization.