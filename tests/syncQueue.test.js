import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addToQueue,
  getPendingOperations,
  getQueueStats,
  markAsSynced,
  processQueue,
} from "../src/services/syncQueue.js";

function addOperation(type, taskId, data) {
  return addToQueue({ type, taskId, data });
}

test("adds ADD, UPDATE, and DELETE operations with unique queue IDs", async () => {
  const add = addOperation("ADD", "task-add", {
    title: "DBMS Assignment",
    priority: "High",
  });
  const update = addOperation("UPDATE", "task-update", {
    title: "Updated title",
  });
  const deletedTaskSnapshot = {
    title: "Task to delete",
    priority: "Low",
  };
  const remove = addOperation("DELETE", "task-delete", deletedTaskSnapshot);

  assert.equal(new Set([add.operationId, update.operationId, remove.operationId]).size, 3);
  assert.notEqual(add.operationId, add.taskId);
  assert.equal(add.status, "pending");
  assert.equal(typeof add.timestamp, "number");
  assert.equal(remove.data.title, "Task to delete");
  assert.deepEqual(
    [add.type, update.type, remove.type],
    ["ADD", "UPDATE", "DELETE"],
  );
  const expectedOrder = [add.operationId, update.operationId, remove.operationId];
  assert.deepEqual(
    getPendingOperations()
      .filter((operation) => expectedOrder.includes(operation.operationId))
      .map((operation) => operation.operationId),
    expectedOrder,
  );
  await processQueue({ processOperation: async () => ({ success: true }) });
});

test("returns only pending operations and marks known IDs safely", async () => {
  const operation = addOperation("ADD", "pending-task", {
    title: "Pending task",
    priority: "Medium",
  });

  assert.ok(
    getPendingOperations().some(
      (pending) => pending.operationId === operation.operationId,
    ),
  );
  assert.deepEqual(markAsSynced("missing-operation"), {
    marked: false,
    reason: "not_found",
  });
  assert.throws(() => markAsSynced(""), /operationId is required/);

  assert.equal(markAsSynced(operation.operationId).marked, true);
  assert.deepEqual(markAsSynced(operation.operationId), {
    marked: false,
    reason: "already_synced",
  });
  assert.ok(
    !getPendingOperations().some(
      (pending) => pending.operationId === operation.operationId,
    ),
  );
});

test("processes operations sequentially and does not process synced entries again", async () => {
  const first = addOperation("ADD", "sequential-1", {
    title: "First task",
    priority: "Low",
  });
  const second = addOperation("UPDATE", "sequential-2", {
    title: "Second task",
  });
  const order = [];
  let activeCount = 0;

  const result = await processQueue({
    processOperation: async (operation) => {
      activeCount += 1;
      assert.equal(activeCount, 1);
      order.push(operation.operationId);
      await new Promise((resolve) => setTimeout(resolve, 5));
      activeCount -= 1;
    },
  });

  assert.deepEqual(order.slice(-2), [first.operationId, second.operationId]);
  assert.equal(result.processedCount, 2);
  assert.equal(markAsSynced(first.operationId).reason, "already_synced");
  assert.equal(markAsSynced(second.operationId).reason, "already_synced");

  let repeatedCalls = 0;
  await processQueue({
    processOperation: async () => {
      repeatedCalls += 1;
    },
  });
  assert.equal(repeatedCalls, 0);
});

test("leaves an operation pending after a simulated failure and retries it", async () => {
  const operation = addOperation("ADD", "failure-task", {
    title: "Will retry",
    priority: "High",
  });

  await assert.rejects(
    processQueue({
      processOperation: async () => {
        throw new Error("simulated failure");
      },
    }),
    /simulated failure/,
  );
  assert.ok(
    getPendingOperations().some(
      (pending) => pending.operationId === operation.operationId,
    ),
  );

  await processQueue({ processOperation: async () => ({ success: true }) });
  assert.ok(
    !getPendingOperations().some(
      (pending) => pending.operationId === operation.operationId,
    ),
  );
});

test("overlapping calls share one processing run", async () => {
  const operation = addOperation("ADD", "concurrent-task", {
    title: "Concurrent task",
    priority: "Medium",
  });
  let releaseProcessing;
  let callCount = 0;
  const processOperation = () => {
    callCount += 1;
    return new Promise((resolve) => {
      releaseProcessing = resolve;
    });
  };

  const firstCall = processQueue({ processOperation });
  const overlappingCall = processQueue();
  assert.equal(overlappingCall, firstCall);

  releaseProcessing();
  await Promise.all([firstCall, overlappingCall]);
  assert.equal(callCount, 1);
  assert.ok(
    !getPendingOperations().some(
      (pending) => pending.operationId === operation.operationId,
    ),
  );
});

test("rejects invalid operations without changing the queue", () => {
  const pendingBefore = getQueueStats().pending;

  assert.throws(
    () => addToQueue({ type: "PATCH", taskId: "task", data: { title: "x" } }),
    /Operation type/,
  );
  assert.throws(
    () => addToQueue({ type: "UPDATE", taskId: "", data: { title: "x" } }),
    /taskId/,
  );
  assert.throws(
    () => addToQueue({ type: "UPDATE", taskId: "task", data: {} }),
    /non-empty object/,
  );
  assert.throws(
    () =>
      addToQueue({
        type: "ADD",
        taskId: "task",
        data: { title: "Missing priority" },
      }),
    /valid priority/,
  );
  assert.equal(getQueueStats().pending, pendingBefore);
});
