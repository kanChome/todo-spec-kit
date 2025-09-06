import type { TaskNotFoundError, StorageError, TaskError } from './types';

export function createTaskNotFoundError(taskId: string): TaskNotFoundError {
  const error = new Error(`Task not found: ${taskId}`) as TaskNotFoundError;
  error.code = 'TASK_NOT_FOUND';
  error.taskId = taskId;
  error.name = 'TaskNotFoundError';
  return error;
}

export function createStorageError(
  operation: 'read' | 'write' | 'delete',
  originalError?: Error
): StorageError {
  let message = `Storage ${operation} operation failed`;
  
  if (originalError) {
    if (originalError.message.includes('QuotaExceededError') || 
        originalError.name === 'QuotaExceededError') {
      message = 'Storage quota exceeded';
    } else {
      message = `${message}: ${originalError.message}`;
    }
  }

  const error = new Error(message) as StorageError;
  error.code = 'STORAGE_ERROR';
  error.operation = operation;
  error.name = 'StorageError';
  
  if (originalError) {
    error.details = {
      originalError: {
        name: originalError.name,
        message: originalError.message
      }
    };
  }

  return error;
}

export function isTaskError(error: unknown): error is TaskError {
  return error instanceof Error && 
         'code' in error && 
         typeof error.code === 'string';
}

export function isValidationError(error: unknown): error is import('./types').TaskValidationError {
  return isTaskError(error) && error.code === 'VALIDATION_ERROR';
}

export function isTaskNotFoundError(error: unknown): error is TaskNotFoundError {
  return isTaskError(error) && error.code === 'TASK_NOT_FOUND';
}

export function isStorageError(error: unknown): error is StorageError {
  return isTaskError(error) && error.code === 'STORAGE_ERROR';
}

export function isQuotaExceededError(error: unknown): boolean {
  return isStorageError(error) && 
         error.message.includes('quota exceeded');
}