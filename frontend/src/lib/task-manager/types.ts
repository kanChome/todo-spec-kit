export interface Task {
  id: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateTaskRequest = {
  description: string;
};

export type UpdateTaskRequest = {
  description?: string;
  completed?: boolean;
};

export interface TaskError extends Error {
  code: string;
  details?: Record<string, unknown>;
}

export type TaskValidationError = TaskError & {
  code: 'VALIDATION_ERROR';
  field: string;
};

export type TaskNotFoundError = TaskError & {
  code: 'TASK_NOT_FOUND';
  taskId: string;
};

export type StorageError = TaskError & {
  code: 'STORAGE_ERROR';
  operation: 'read' | 'write' | 'delete';
};