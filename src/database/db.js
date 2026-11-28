// src/database/db.js

export const DB_NAME = "OfflineCableDB";
export const DB_VERSION = 1;
export const STORE_NAME = "tasks";

/**
 * Opens and initializes the IndexedDB database.
 * 
 * Implementation Details:
 * 1. Checks for window.indexedDB support in the browser.
 * 2. Uses window.indexedDB.open() with DB_NAME and DB_VERSION.
 * 3. Handles onupgradeneeded: creates the 'tasks' object store with keyPath 'id'
 *    if it doesn't already exist. Optional indexes (e.g. priority, syncStatus) are added
 *    to help with future query optimization.
 * 4. Wraps asynchronous events (onsuccess, onerror, onblocked) in a native Promise.
 * 
 * @returns {Promise<IDBDatabase>} Resolves with the open IDBDatabase instance.
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this browser environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        // Useful indexes for querying
        store.createIndex("priority", "priority", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
        store.createIndex("completed", "completed", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(new Error(`Failed to open IndexedDB '${DB_NAME}': ${event.target.error?.message || "Unknown error"}`));
    };

    request.onblocked = () => {
      console.warn(`IndexedDB database '${DB_NAME}' open request is blocked. Please close other tabs.`);
    };
  });
}
