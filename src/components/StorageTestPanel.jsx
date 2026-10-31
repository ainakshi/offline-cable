// src/components/StorageTestPanel.jsx
import { useState, useEffect } from "react";
import { addTask, getTasks, updateTask, deleteTask, clearAllTasks } from "../database/storage";
import { runStorageTests } from "../database/test-storage";

export default function StorageTestPanel() {
  const [tasks, setTasks] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [inputTitle, setInputTitle] = useState("");
  const [inputPriority, setInputPriority] = useState("High");

  const refreshTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setStatusMessage(`Error loading tasks: ${err.message}`);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getTasks()
      .then((data) => {
        if (isMounted) setTasks(data);
      })
      .catch((err) => {
        if (isMounted) setStatusMessage(`Error loading tasks: ${err.message}`);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunAutomatedSuite = async () => {
    setStatusMessage("Running automated test suite...");
    const outcome = await runStorageTests();
    setTestResults(outcome.results || []);
    if (outcome.success) {
      setStatusMessage("✅ All automated tests passed!");
    } else {
      setStatusMessage(`❌ Test failed: ${outcome.error?.message}`);
    }
    await refreshTasks();
  };

  const handleManualAdd = async () => {
    if (!inputTitle.trim()) {
      setStatusMessage("Please enter a title");
      return;
    }
    try {
      const newTask = {
        id: crypto.randomUUID(),
        title: inputTitle.trim(),
        description: "Added via Storage Test Panel",
        priority: inputPriority,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: "pending"
      };
      await addTask(newTask);
      setInputTitle("");
      setStatusMessage(`Added task "${newTask.title}" (persist will survive browser refresh)`);
      await refreshTasks();
    } catch (err) {
      setStatusMessage(`Add error: ${err.message}`);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      setStatusMessage(`Updated task "${task.title}" status to ${!task.completed ? "Completed" : "Active"}`);
      await refreshTasks();
    } catch (err) {
      setStatusMessage(`Update error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setStatusMessage(`Deleted task ${id}`);
      await refreshTasks();
    } catch (err) {
      setStatusMessage(`Delete error: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllTasks();
      setStatusMessage("Cleared all tasks from IndexedDB");
      await refreshTasks();
    } catch (err) {
      setStatusMessage(`Clear error: ${err.message}`);
    }
  };

  return (
    <div style={{
      margin: "24px auto",
      maxWidth: "800px",
      padding: "20px",
      border: "2px dashed #4f46e5",
      borderRadius: "12px",
      backgroundColor: "#f8fafc",
      color: "#0f172a",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", color: "#1e1b4b" }}>
            🛠️ IndexedDB Storage Test Harness
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            Validates CRUD operations &amp; persistence in <code>OfflineCableDB</code>.
          </p>
        </div>
        <button
          onClick={handleRunAutomatedSuite}
          style={{
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          ▶ Run Automated Tests
        </button>
      </div>

      {statusMessage && (
        <div style={{
          padding: "8px 12px",
          backgroundColor: "#e0e7ff",
          borderLeft: "4px solid #4f46e5",
          borderRadius: "4px",
          fontSize: "0.85rem",
          marginBottom: "16px"
        }}>
          {statusMessage}
        </div>
      )}

      {/* Manual interactive testing form */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="New task title to test IndexedDB..."
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          style={{
            flex: "1 1 240px",
            padding: "8px 10px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px"
          }}
        />
        <select
          value={inputPriority}
          onChange={(e) => setInputPriority(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button
          onClick={handleManualAdd}
          style={{
            backgroundColor: "#10b981",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Add Task to DB
        </button>
        <button
          onClick={refreshTasks}
          style={{
            backgroundColor: "#64748b",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 12px",
            cursor: "pointer"
          }}
        >
          Refresh DB View
        </button>
        <button
          onClick={handleClearAll}
          style={{
            backgroundColor: "#ef4444",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 12px",
            cursor: "pointer"
          }}
        >
          Clear DB
        </button>
      </div>

      {/* Test results list if automated suite was run */}
      {testResults.length > 0 && (
        <div style={{ marginBottom: "16px", backgroundColor: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem" }}>Automated Test Results ({testResults.filter(r => r.passed).length}/{testResults.length} passed):</h4>
          <div style={{ maxHeight: "160px", overflowY: "auto", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "4px" }}>
            {testResults.map((t, idx) => (
              <div key={idx} style={{ color: t.passed ? "#16a34a" : "#dc2626" }}>
                {t.passed ? "✓" : "✗"} <strong>{t.testName}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live tasks in IndexedDB */}
      <div>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem" }}>
          Current IndexedDB Tasks ({tasks.length}) - <em>(Data stays after page refresh)</em>:
        </h4>
        {tasks.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
            No tasks in IndexedDB. Use &quot;Add Task to DB&quot; or run the automated tests.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  textDecoration: task.completed ? "line-through" : "none",
                  opacity: task.completed ? 0.7 : 1
                }}
              >
                <div>
                  <strong>{task.title}</strong>
                  <span style={{ marginLeft: "8px", fontSize: "0.75rem", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#f1f5f9" }}>
                    {task.priority}
                  </span>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    ID: {task.id} | Status: {task.syncStatus}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => handleToggleComplete(task)}
                    style={{ fontSize: "0.75rem", padding: "4px 8px", cursor: "pointer" }}
                  >
                    {task.completed ? "Mark Active" : "Mark Done"}
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    style={{ fontSize: "0.75rem", padding: "4px 8px", color: "#dc2626", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
