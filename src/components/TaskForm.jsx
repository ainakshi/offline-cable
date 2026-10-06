import { useState } from "react";

function TaskForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      priority: priority,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: "pending"
    };

    onAdd(newTask);

    setTitle("");
    setDescription("");
    setPriority("Medium");
  };

  return (
    <div className="form-overlay">
      <div className="task-form-container">

        <div className="form-header">
          <h2>Add New Task</h2>

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
              Add Task
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default TaskForm;