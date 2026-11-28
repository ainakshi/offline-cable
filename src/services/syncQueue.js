const operations = [];
const listeners = new Set();
let processingPromise = null;

function clone(value) {
  try {
    return structuredClone(value);
  } catch (error) {
    throw new TypeError("Queue data must be structured-cloneable.", {
      cause: error,
    });
  }
}

function validateOperation(operation) {
  if (!operation || typeof operation !== "object" || Array.isArray(operation)) {
    throw new TypeError("An operation object is required.");
  }

  if (!["ADD", "UPDATE", "DELETE"].includes(operation.type)) {
    throw new TypeError("Operation type must be ADD, UPDATE, or DELETE.");
  }

  const validTaskId =
    (typeof operation.taskId === "string" && operation.taskId.trim()) ||
    (typeof operation.taskId === "number" && Number.isFinite(operation.taskId));

  if (!validTaskId) {
    throw new TypeError("A non-empty string or finite number taskId is required.");
  }

  if (
    !operation.data ||
    typeof operation.data !== "object" ||
    Array.isArray(operation.data) ||
    Object.keys(operation.data).length === 0
  ) {
    throw new TypeError("Operation data must be a non-empty object.");
  }

  if (
    operation.type === "ADD" &&
    (typeof operation.data.title !== "string" ||
      !operation.data.title.trim() ||
      !["Low", "Medium", "High"].includes(operation.data.priority))
  ) {
    throw new TypeError("ADD data must include a title and valid priority.");
  }
}

function createOperationId() {
  if (typeof globalThis.crypto?.randomUUID !== "function") {
    throw new Error("This environment does not support crypto.randomUUID().");
  }

  let operationId = globalThis.crypto.randomUUID();
  while (operations.some((operation) => operation.operationId === operationId)) {
    operationId = globalThis.crypto.randomUUID();
  }

  return operationId;
}

function getOrderedOperations() {
  return operations
    .map((operation, insertionOrder) => ({ operation, insertionOrder }))
    .sort(
      (left, right) =>
        left.operation.timestamp - right.operation.timestamp ||
        left.insertionOrder - right.insertionOrder,
    )
    .map(({ operation }) => operation);
}

function notifyListeners() {
  const stats = getQueueStats();
  for (const listener of listeners) {
    listener(stats);
  }
}

export function getQueueStats() {
  return {
    pending: operations.filter((operation) => operation.status === "pending").length,
    synced: operations.filter((operation) => operation.status === "synced").length,
  };
}

export function subscribeToQueue(listener) {
  if (typeof listener !== "function") {
    throw new TypeError("A queue listener function is required.");
  }

  listeners.add(listener);
  listener(getQueueStats());
  return () => listeners.delete(listener);
}

export function addToQueue(operation) {
  validateOperation(operation);

  const queueEntry = {
    operationId: createOperationId(),
    taskId: operation.taskId,
    type: operation.type,
    data: clone(operation.data),
    timestamp: Date.now(),
    status: "pending",
  };

  operations.push(queueEntry);
  notifyListeners();
  return clone(queueEntry);
}

export function getPendingOperations() {
  return getOrderedOperations()
    .filter((operation) => operation.status === "pending")
    .map(clone);
}

export function markAsSynced(operationId) {
  if (typeof operationId !== "string" || !operationId.trim()) {
    throw new TypeError("A non-empty operationId is required.");
  }

  const operation = operations.find(
    (entry) => entry.operationId === operationId,
  );
  if (!operation) {
    return { marked: false, reason: "not_found" };
  }
  if (operation.status === "synced") {
    return { marked: false, reason: "already_synced" };
  }

  operation.status = "synced";
  notifyListeners();
  return { marked: true, operation: clone(operation) };
}

export async function simulateOperation() {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return { success: true };
}

async function processPendingOperations(processOperation) {
  let processedCount = 0;

  for (const operation of getPendingOperations()) {
    try {
      await processOperation(operation);
      markAsSynced(operation.operationId);
      processedCount += 1;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Processing stopped at operation ${operation.operationId} after ${processedCount} successful operation(s): ${message}`,
        { cause: error },
      );
    }
  }

  return { processedCount, ...getQueueStats() };
}

export function processQueue({ processOperation = simulateOperation } = {}) {
  if (typeof processOperation !== "function") {
    throw new TypeError("processOperation must be a function.");
  }
  if (processingPromise) {
    return processingPromise;
  }

  processingPromise = processPendingOperations(processOperation).finally(() => {
    processingPromise = null;
  });
  return processingPromise;
}
