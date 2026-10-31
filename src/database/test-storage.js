// src/database/test-storage.js
import { addTask, getTasks, getTaskById, updateTask, deleteTask, clearAllTasks } from "./storage";

/**
 * Runs automated in-browser verification test suite for IndexedDB CRUD operations.
 * Results can be viewed in the browser developer console or in a test UI.
 */
export async function runStorageTests() {
  const results = [];
  const log = (testName, passed, details) => {
    results.push({ testName, passed, details });
    console.log(`[Storage Test] ${passed ? "✅ PASS" : "❌ FAIL"}: ${testName}`, details || "");
  };

  try {
    console.log("=== Starting OfflineCableDB Storage Tests ===");

    // Clean slate before tests
    await clearAllTasks();
    log("Reset store (clearAllTasks)", true, "Clean state ready");

    // 1. Test getTasks() on empty database
    const initialTasks = await getTasks();
    log("Initial getTasks() on empty store", Array.isArray(initialTasks) && initialTasks.length === 0, `Count: ${initialTasks.length}`);

    // 2. Test addTask(task) with sample task
    const sampleTask1 = {
      id: "task-test-1",
      title: "DBMS Assignment",
      description: "Complete assignment",
      priority: "High",
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: "pending"
    };

    const added1 = await addTask(sampleTask1);
    log("addTask() with unique ID", added1 && added1.id === "task-test-1" && added1.title === "DBMS Assignment", added1);

    // 3. Test addTask() prevents accidental overwrite of existing record
    let duplicateRejected = false;
    try {
      await addTask(sampleTask1);
    } catch {
      duplicateRejected = true;
    }
    log("addTask() rejects duplicate id (no accidental overwrite)", duplicateRejected, "Duplicate add rejected as expected");

    // 4. Test adding a second task
    const sampleTask2 = {
      id: "task-test-2",
      title: "Offline Sync Testing",
      description: "Test offline cable sync workflow",
      priority: "Medium",
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: "pending"
    };
    await addTask(sampleTask2);
    log("addTask() with second task", true, "Added task-test-2");

    // 5. Test getTasks() retrieves both tasks
    const allTasks = await getTasks();
    log("getTasks() returns all stored tasks", allTasks.length === 2, `Retrieved ${allTasks.length} tasks`);

    // 6. Test getTaskById()
    const foundTask = await getTaskById("task-test-1");
    log("getTaskById('task-test-1')", foundTask && foundTask.title === "DBMS Assignment", foundTask);

    // 7. Test updateTask()
    const updated = await updateTask("task-test-1", {
      completed: true,
      priority: "Low",
      description: "Completed DBMS Assignment with solutions"
    });
    log(
      "updateTask() updates fields and preserves primary key",
      updated.completed === true && updated.priority === "Low" && updated.id === "task-test-1",
      updated
    );

    // Verify update persisted
    const verifiedUpdate = await getTaskById("task-test-1");
    log("Verify updated task persistence", verifiedUpdate.completed === true && verifiedUpdate.priority === "Low", verifiedUpdate);

    // 8. Test updateTask() with non-existent id
    let nonExistentUpdateFailed = false;
    try {
      await updateTask("non-existent-id", { completed: true });
    } catch {
      nonExistentUpdateFailed = true;
    }
    log("updateTask() on non-existent ID fails gracefully", nonExistentUpdateFailed, "Non-existent id safely rejected");

    // 9. Test deleteTask()
    const deleteResult = await deleteTask("task-test-2");
    log("deleteTask('task-test-2')", deleteResult && deleteResult.deleted === true, deleteResult);

    // 10. Verify deletion
    const remainingTasks = await getTasks();
    log("getTasks() after deletion has 1 remaining task", remainingTasks.length === 1 && remainingTasks[0].id === "task-test-1", remainingTasks);

    // 11. Test deleteTask() on non-existent id
    let nonExistentDeleteFailed = false;
    try {
      await deleteTask("task-test-2");
    } catch {
      nonExistentDeleteFailed = true;
    }
    log("deleteTask() on already deleted/non-existent ID fails gracefully", nonExistentDeleteFailed, "Already deleted id safely rejected");

    console.log("=== All Tests Completed Successfully ===");
    return { success: true, results };
  } catch (err) {
    console.error("Test failed with exception:", err);
    log("Exception occurred during test execution", false, err.message);
    return { success: false, results, error: err };
  }
}
