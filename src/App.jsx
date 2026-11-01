import { useState } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import SyncStatus from "./components/SyncStatus";
import { addToQueue } from "./services/syncQueue";

function App() {
  const [showForm, setShowForm] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete DBMS Assignment",
      description: "Finish chapter 4 questions",
      priority: "High",
      syncStatus: "Synced",
    },
    {
      id: 2,
      title: "Prepare Mini Project",
      description: "Work on Offline Cable dashboard",
      priority: "Medium",
      syncStatus: "Pending",
    },
    {
      id: 3,
      title: "Submit SIH Documents",
      description: "Review and submit final documents",
      priority: "High",
      syncStatus: "Conflict",
    },
  ]);

  const handleAddTask = async (newTask) => {
    addToQueue({
      taskId: newTask.id,
      type: "ADD",
      data: {
        title: newTask.title,
        priority: newTask.priority,
      },
    });

    setTasks((previousTasks) => [
      ...previousTasks,
      newTask,
    ]);

    setShowForm(false);
  };

  return (
    <div className="app">

      {/* Header */}
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


      {/* Main Content */}
      <main className="main-content">

        <div className="tasks-header">
          <h2>My Tasks</h2>

          <button
            className="add-task-btn"
            onClick={() => setShowForm(true)}
          >
            + Add Task
          </button>
        </div>


        {/* Add Task Form */}
        {showForm && (
          <TaskForm
            onAdd={handleAddTask}
            onCancel={() => setShowForm(false)}
          />
        )}


        {/* Task List */}
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

      </main>


      <SyncStatus />

    </div>
  );
}

export default App;