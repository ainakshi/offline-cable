// src/database/storage.js
import { openDB, STORE_NAME } from "./db";

/**
 * Saves a new task to IndexedDB.
 * Uses store.add(task) so it fails if a task with the same id already exists,
 * preventing accidental overwrites.
 *
 * Task structure:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   priority: "High" | "Medium" | "Low",
 *   completed: boolean,
 *   createdAt: number,
 *   updatedAt: number,
 *   syncStatus: "pending" | "synced" | "conflict"
 * }
 *
 * @param {Object} task
 * @returns {Promise<Object>} The saved task
 */
export async function addTask(task) {
  if (!task || typeof task !== "object") {
    throw new Error("Invalid task: task must be a valid object.");
  }

  const id = task.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
  const now = Date.now();

  const formattedTask = {
    id,
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "Medium",
    completed: typeof task.completed === "boolean" ? task.completed : false,
    createdAt: task.createdAt || now,
    updatedAt: task.updatedAt || now,
    syncStatus: task.syncStatus || "pending",
  };

  const db = await openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(formattedTask);

      request.onsuccess = () => {
        resolve(formattedTask);
      };

      request.onerror = (event) => {
        reject(new Error(`Failed to add task: ${event.target.error?.message || "Unknown error"}`));
      };

      transaction.onerror = (event) => {
        reject(new Error(`Transaction error while adding task: ${event.target.error?.message || "Unknown error"}`));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieves all tasks from IndexedDB.
 *
 * @returns {Promise<Array<Object>>} Array of task objects
 */
export async function getTasks() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = (event) => {
        reject(new Error(`Failed to retrieve tasks: ${event.target.error?.message || "Unknown error"}`));
      };

      transaction.onerror = (event) => {
        reject(new Error(`Transaction error while retrieving tasks: ${event.target.error?.message || "Unknown error"}`));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieves a single task by its id.
 *
 * @param {string|number} id
 * @returns {Promise<Object|null>} The task object or null if not found
 */
export async function getTaskById(id) {
  if (id === undefined || id === null) {
    throw new Error("Task id is required.");
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = (event) => {
        reject(new Error(`Failed to retrieve task with id '${id}': ${event.target.error?.message || "Unknown error"}`));
      };

      transaction.onerror = (event) => {
        reject(new Error(`Transaction error while retrieving task '${id}': ${event.target.error?.message || "Unknown error"}`));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Updates an existing task with partial or full updates.
 * Checks that the task exists before updating, merges existing fields,
 * and automatically updates updatedAt.
 *
 * @param {string|number} id - Primary key of the task to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} The updated task object
 */
export async function updateTask(id, updates) {
  if (id === undefined || id === null) {
    throw new Error("Task id is required for update.");
  }
  if (!updates || typeof updates !== "object") {
    throw new Error("Updates must be a valid object.");
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingTask = getRequest.result;

        if (!existingTask) {
          reject(new Error(`Cannot update: task with id '${id}' not found.`));
          return;
        }

        // Merge updates, preserving primary key id, and update updatedAt timestamp
        const updatedTask = {
          ...existingTask,
          ...updates,
          id, // ensure primary key is never accidentally altered
          updatedAt: updates.updatedAt || Date.now(),
        };

        const putRequest = store.put(updatedTask);

        putRequest.onsuccess = () => {
          resolve(updatedTask);
        };

        putRequest.onerror = (event) => {
          reject(new Error(`Failed to save updated task with id '${id}': ${event.target.error?.message || "Unknown error"}`));
        };
      };

      getRequest.onerror = (event) => {
        reject(new Error(`Failed to find task with id '${id}': ${event.target.error?.message || "Unknown error"}`));
      };

      transaction.onerror = (event) => {
        reject(new Error(`Transaction error while updating task '${id}': ${event.target.error?.message || "Unknown error"}`));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Deletes a task from IndexedDB by its id.
 * Checks if the task exists before deleting.
 *
 * @param {string|number} id - Primary key of the task to delete
 * @returns {Promise<{ id: string|number, deleted: boolean }>} Confirmation of deletion
 */
export async function deleteTask(id) {
  if (id === undefined || id === null) {
    throw new Error("Task id is required for deletion.");
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingTask = getRequest.result;
        if (!existingTask) {
          reject(new Error(`Cannot delete: task with id '${id}' not found.`));
          return;
        }

        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = () => {
          resolve({ id, deleted: true });
        };

        deleteRequest.onerror = (event) => {
          reject(new Error(`Failed to delete task with id '${id}': ${event.target.error?.message || "Unknown error"}`));
        };
      };

      getRequest.onerror = (event) => {
        reject(new Error(`Failed to find task with id '${id}': ${event.target.error?.message || "Unknown error"}`));
      };

      transaction.onerror = (event) => {
        reject(new Error(`Transaction error while deleting task '${id}': ${event.target.error?.message || "Unknown error"}`));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Clears all tasks from the object store.
 * Useful for test suites or resets.
 *
 * @returns {Promise<boolean>}
 */
export async function clearAllTasks() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (event) => {
        reject(new Error(`Failed to clear tasks: ${event.target.error?.message || "Unknown error"}`));
      };

      transaction.onerror = (event) => {
        reject(new Error(`Transaction error while clearing tasks: ${event.target.error?.message || "Unknown error"}`));
      };
    } catch (err) {
      reject(err);
    }
  });
}
