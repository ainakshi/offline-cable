
export function detectConflict(localTask, remoteTask) {
  if (!localTask || !remoteTask) {
    return {
      conflict: false,
      error: "Both task versions are required"
    };
  }

  if (localTask.id !== remoteTask.id || !localTask.id) {
    return {
      conflict: false,
      error: "Task IDs do not match"
    };
  }

  const fields = ["title", "priority", "completed"];

  const conflictingFields = fields.filter(
    (field) => localTask[field] !== remoteTask[field]
  );

  return {
    conflict: conflictingFields.length > 0,
    conflictingFields,
    localTask,
    remoteTask
  };
}

export function resolveConflict(localTask, remoteTask, strategy) {
  if (!localTask || !remoteTask) {
    throw new Error("Both task versions are required");
  }

  if (localTask.id !== remoteTask.id) {
    throw new Error("Cannot resolve different tasks");
  }

  if (strategy === "LOCAL") {
    return { ...localTask };
  }

  if (strategy === "REMOTE") {
    return { ...remoteTask };
  }

  if (strategy === "LAST_WRITE_WINS") {
    if (
      !Number.isFinite(localTask.updatedAt) ||
      !Number.isFinite(remoteTask.updatedAt)
    ) {
      throw new Error("Valid timestamps are required");
    }

    return localTask.updatedAt > remoteTask.updatedAt
      ? { ...localTask }
      : { ...remoteTask };
  }

  throw new Error("Invalid resolution strategy");
}
