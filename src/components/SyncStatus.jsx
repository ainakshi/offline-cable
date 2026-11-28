import { useEffect, useState } from "react";
import {
  getQueueStats,
  processQueue,
  subscribeToQueue,
  simulateOperation,
} from "../services/syncQueue";

function SyncStatus({ onOperationProcessed }) {
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
      const result = await processQueue({
  processOperation: async (operation) => {
    await simulateOperation();

    if (operation.type !== "DELETE") {
      await onOperationProcessed(operation);
    }
  },
});
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
<div className="sync-action">
    <button
      className="sync-button"
      type="button"
      onClick={handleSync}
      disabled={isProcessing}
    >
      {isProcessing ? "Processing..." : "Sync Now"}
    </button>

    <p>
      Queue: {stats.pending} pending · {stats.synced} processed
    </p>

    {message && (
      <p role={hasError ? "alert" : "status"}>
        {message}
      </p>
    )}
  </div>
);

}

export default SyncStatus;
