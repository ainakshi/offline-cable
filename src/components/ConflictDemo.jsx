
import { useState } from "react";
import { detectConflict, resolveConflict } from "../utils/conflict";
import { localTask, remoteTask } from "../data/sampleTasks";
import "./ConflictDemo.css";

function ConflictDemo() {
  const [resolvedTask, setResolvedTask] = useState(null);
  const [strategy, setStrategy] = useState("");
  const [error, setError] = useState("");

  const conflictResult = detectConflict(localTask, remoteTask);

  const handleResolve = (selectedStrategy) => {
    setError("");
    setResolvedTask(null);

    try {
      const result = resolveConflict(
        localTask,
        remoteTask,
        selectedStrategy
      );

      setResolvedTask(result);
      setStrategy(selectedStrategy);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="conflict-demo">
      <h2>Conflict Resolution</h2>

      <p className="conflict-status">
        {conflictResult.conflict
          ? "Conflict Detected!"
          : "No Conflict Detected"}
      </p>

      <div className="device-container">
        <div className="device-card">
          <h3>Device A (Local)</h3>
          <p>Task: {localTask.title}</p>
          <p>Priority: {localTask.priority}</p>
          <p>Last Updated: {localTask.updatedAt}</p>
        </div>

        <div className="device-card">
          <h3>Device B (Remote)</h3>
          <p>Task: {remoteTask.title}</p>
          <p>Priority: {remoteTask.priority}</p>
          <p>Last Updated: {remoteTask.updatedAt}</p>
        </div>
      </div>

      {conflictResult.conflict && (
        <div className="resolution-options">
          <h3>Choose Resolution Strategy</h3>

          <button onClick={() => handleResolve("LOCAL")}>
            Choose A
          </button>

          <button onClick={() => handleResolve("REMOTE")}>
            Choose B
          </button>

          <button onClick={() => handleResolve("LAST_WRITE_WINS")}>
            Last Write Wins
          </button>
        </div>
      )}

      {error && (
        <div className="resolved-task">
          <h3>Resolution Error</h3>
          <p>{error}</p>
        </div>
      )}

      {resolvedTask && (
        <div className="resolved-task">
          <h3>Resolved Task</h3>
          <p>Selected Strategy: {strategy}</p>
          <p>Task: {resolvedTask.title}</p>
          <p>Priority: {resolvedTask.priority}</p>
          <p>Last Updated: {resolvedTask.updatedAt}</p>
        </div>
      )}
    </div>
  );
}

export default ConflictDemo;
