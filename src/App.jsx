
import { useState } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import ConflictDemo from "./components/ConflictDemo";

function App() {
  const [showForm, setShowForm] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete project documentation",
      description: "Prepare the project documentation.",
      priority: "High",
      syncStatus: "Synced",
    },
    {
      id: 2,
      title: "Review pending tasks",
      description: "Check tasks waiting for synchronization.",
      priority: "Medium",
      syncStatus: "Pending",
    },
  ]);

  const handleAddTask = (newTask) => {
    setTasks((previousTasks) => [
      ...previousTasks,
      newTask,
    ]);

    setShowForm(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Offline Cable</h1>
        </div>
      </header>

      <main className="main-content">
        <div className="tasks-header">
          <h2>My Tasks</h2>

          <button onClick={() => setShowForm(!showForm)}>
            Add Task
          </button>
        </div>

        {showForm && (
          <TaskForm
            onAdd={handleAddTask}
            onCancel={() => setShowForm(false)}
          />
        )}

        <div className="task-list">
          {tasks.map((task) => (
            <div className="task-card" key={task.id}>
              <div className="task-content">
                <h3>{task.title}</h3>
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
            </div>
          ))}
        </div>

        <ConflictDemo />
      </main>

      <footer className="summary">
        <div>
          <strong>8</strong>
          <span>Synced</span>
        </div>

        <div>
          <strong>2</strong>
          <span>Pending</span>
        </div>

        <div>
          <strong>1</strong>
          <span>Conflict</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
