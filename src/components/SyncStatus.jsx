import { useEffect, useState } from "react";
import {
  getQueueStats,
  processQueue,
  subscribeToQueue,
} from "../services/syncQueue";

function SyncStatus() {
  const [stats, setStats] = useState(getQueueStats);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => subscribeToQueue(setStats), []);

  const handleSync = async () => {
    setIsProcessing(true);
    setMessage("");
    setHasError(false);

    try {
      const result = await processQueue();
      setStats(getQueueStats());
      setMessage(
        result.processedCount === 0
          ? "There are no pending operations."
          : `Processed ${result.processedCount} operation(s) locally.`,
      );
    } catch (error) {
      setStats(getQueueStats());
      setHasError(true);
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <footer className="summary" aria-label="Synchronization queue">
      <div>
        <strong>{stats.pending}</strong>
        <span>Pending operations</span>
      </div>

      <div>
        <strong>{stats.synced}</strong>
        <span>Processed locally</span>
      </div>

      <div className="sync-action">
        <button
          className="sync-button"
          type="button"
          onClick={handleSync}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Sync Now"}
        </button>
        {message && (
          <p role={hasError ? "alert" : "status"}>{message}</p>
        )}
      </div>
    </footer>
  );
}

export default SyncStatus;
