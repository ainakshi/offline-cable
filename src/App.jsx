import { useState, useEffect, useRef } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import ConflictDemo from "./components/ConflictDemo";
import {
  addTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./database/storage";
import { addToQueue } from "./services/syncQueue";
import SyncStatus from "./components/SyncStatus";

function App() {
  const hasLoadedRef = useRef(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load tasks from IndexedDB when the application opens
  useEffect(() => {
  if (hasLoadedRef.current) return;

  hasLoadedRef.current = true;

  const loadTasks = async () => {
      try {
        const savedTasks = await getTasks();

        // Add demo tasks only when the database is empty
        if (savedTasks.length === 0) {
          const demoTasks = [
            {
              id: "1",
              title: "Complete DBMS Assignment",
              description: "Finish chapter 4 questions",
              priority: "High",
              completed: false,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              syncStatus: "synced",
            },
            {
              id: "2",
              title: "Prepare Mini Project",
              description: "Work on Offline Cable dashboard",
              priority: "Medium",
              completed: false,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              syncStatus: "pending",
            },
            {
              id: "3",
              title: "Submit SIH Documents",
              description: "Review and submit final documents",
              priority: "High",
              completed: false,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              syncStatus: "conflict",
            },
          ];

          for (const task of demoTasks) {
            await addTask(task);
          }

          setTasks(demoTasks);
        } else {
          setTasks(savedTasks);
        }
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError("Unable to load tasks from local storage.");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);
// Add a new task or update an existing task
const handleSaveTask = async (taskData) => {
  try {
    if (editingTask) {
      const updatedTask = await updateTask(
        editingTask.id,
        {
          ...taskData,
          syncStatus: "pending",
          updatedAt: Date.now(),
        }
      );

      addToQueue({
        type: "UPDATE",
        taskId: updatedTask.id,
        data: updatedTask,
      });

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === editingTask.id ? updatedTask : task
        )
      );
    } else {
      const savedTask = await addTask({
        ...taskData,
        syncStatus: "pending",
      });

      addToQueue({
        type: "ADD",
        taskId: savedTask.id,
        data: savedTask,
      });

      setTasks((previousTasks) => [
        ...previousTasks,
        savedTask,
      ]);
    }

    setShowForm(false);
    setEditingTask(null);
    setError("");
  } catch (err) {
    console.error("Error saving task:", err);
    setError("Unable to save task. Please try again.");
  }
};


  // Open the form with existing task details
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Delete a task from IndexedDB and the UI
const handleDeleteTask = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this task?"
  );

  if (!confirmed) return;

  try {
    const taskToDelete = tasks.find((task) => task.id === id);

    if (!taskToDelete) return;

    // Queue the task snapshot before deleting it locally
    addToQueue({
      type: "DELETE",
      taskId: id,
      data: taskToDelete,
    });

    await deleteTask(id);

    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id)
    );

    setError("");
  } catch (err) {
    console.error("Error deleting task:", err);
    setError("Unable to delete task. Please try again.");
  }
};


// Mark a task as completed or undo completion
const handleToggleComplete = async (task) => {
  try {
    const updatedTask = await updateTask(task.id, {
  completed: !task.completed,
  syncStatus: "pending",
  // eslint-disable-next-line react-hooks/purity -- timestamp generated after user action
  updatedAt: Date.now(),
});

    addToQueue({
      type: "UPDATE",
      taskId: updatedTask.id,
      data: updatedTask,
    });

    setTasks((previousTasks) =>
      previousTasks.map((item) =>
        item.id === task.id ? updatedTask : item
      )
    );

    setError("");
  } catch (err) {
    console.error("Error updating task status:", err);
    setError("Unable to update task. Please try again.");
  }
};

//syncing
const handleOperationProcessed = async (operation) => {
  const existingTask = await getTaskById(operation.taskId);

  // Task may already have been deleted locally
  if (!existingTask) return;

  const updatedTask = await updateTask(operation.taskId, {
    syncStatus: "synced",
  });

  setTasks((previousTasks) =>
    previousTasks.map((task) =>
      task.id === operation.taskId ? updatedTask : task
    )
  );
};


  // Close the form and clear edit mode
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Calculate actual task counts
  const syncedCount = tasks.filter(
    (task) => task.syncStatus === "synced"
  ).length;

  const pendingCount = tasks.filter(
    (task) => task.syncStatus === "pending"
  ).length;

  const conflictCount = tasks.filter(
    (task) => task.syncStatus === "conflict"
  ).length;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Offline Cable</h1>
          <p>Your tasks, available anywhere.</p>
        </div>

        <div className="connection-status">
          <span className="status-dot"></span>
          Offline
        </div>
      </header>

      <main className="main-content">
        <div className="tasks-header">
          <h2>My Tasks</h2>

          <button
            className="add-task-btn"
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
          >
            + Add Task
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {showForm && (
          <TaskForm
            onAdd={handleSaveTask}
            onCancel={handleCancelForm}
            initialTask={editingTask}
          />
        )}

        <div className="task-list">
          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p>No tasks yet. Add your first task!</p>
          ) : (
            tasks.map((task) => (
              <div className="task-card" key={task.id}>
                <div className="task-content">
                  <h3
                    style={{
                      textDecoration: task.completed
                        ? "line-through"
                        : "none",
                      opacity: task.completed ? 0.6 : 1,
                    }}
                  >
                    {task.title}
                  </h3>

                  <p>{task.description}</p>
                </div>

                <div className="task-meta">
                  <span
                    className={`priority ${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>

                  <span
                    className={`sync-status ${task.syncStatus.toLowerCase()}`}
                  >
                    {task.syncStatus}
                  </span>
                </div>

                <div className="task-actions">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(task)}
                  >
                    {task.completed ? "Undo" : "Complete"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditTask(task)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <ConflictDemo />
      </main>

      <footer className="summary">
        <div>
          <strong>{syncedCount}</strong>
          <span>Synced</span>
        </div>

        <div>
          <strong>{pendingCount}</strong>
          <span>Pending</span>
        </div>

        <div>
          <strong>{conflictCount}</strong>
          <span>Conflict</span>
        </div>
        <SyncStatus onOperationProcessed={handleOperationProcessed} />
      </footer>
    </div>
  );
}
export default App;
