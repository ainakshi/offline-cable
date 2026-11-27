
import { useState, useEffect } from "react";

function TaskForm({ onAdd, onCancel, initialTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  // Fill the form when editing an existing task
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setPriority(initialTask.priority);
    } else {
      setTitle("");
      setDescription("");
      setPriority("Medium");
    }
  }, [initialTask]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    const taskData = {
      id: initialTask?.id || crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: initialTask?.completed ?? false,
      createdAt: initialTask?.createdAt || Date.now(),
      updatedAt: Date.now(),
      syncStatus: initialTask ? "pending" : "pending",
    };

    onAdd(taskData);
  };

  return (
    <div className="form-overlay">
      <div className="task-form-container">
        <div className="form-header">
          <h2>{initialTask ? "Edit Task" : "Add New Task"}</h2>

          <button
            type="button"
            className="close-button"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>

            <input
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Priority</label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-button"
            >
              {initialTask ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
