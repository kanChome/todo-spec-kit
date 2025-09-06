import type { TaskValidationError } from './types';

export function validateTaskDescription(description: string): string {
  if (typeof description !== 'string') {
    throw createValidationError('description', 'Description must be a string');
  }

  const trimmed = description.trim();
  
  if (trimmed.length === 0) {
    throw createValidationError('description', 'Description cannot be empty');
  }

  if (trimmed.length > 100) {
    throw createValidationError('description', 'Description must be 100 characters or less');
  }

  return trimmed;
}

export function validateTaskId(id: string): string {
  if (typeof id !== 'string') {
    throw createValidationError('id', 'Task ID must be a string');
  }

  if (id.trim().length === 0) {
    throw createValidationError('id', 'Task ID cannot be empty');
  }

  // Basic UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw createValidationError('id', 'Task ID must be a valid UUID');
  }

  return id;
}

export function validateTaskCompleted(completed: boolean): boolean {
  if (typeof completed !== 'boolean') {
    throw createValidationError('completed', 'Completed status must be a boolean');
  }

  return completed;
}

export function validateISODate(dateString: string, fieldName: string): string {
  if (typeof dateString !== 'string') {
    throw createValidationError(fieldName, `${fieldName} must be a string`);
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw createValidationError(fieldName, `${fieldName} must be a valid ISO date string`);
  }

  // Ensure it's in ISO format
  if (date.toISOString() !== dateString) {
    throw createValidationError(fieldName, `${fieldName} must be in ISO 8601 format`);
  }

  return dateString;
}

function createValidationError(field: string, message: string): TaskValidationError {
  const error = new Error(message) as TaskValidationError;
  error.code = 'VALIDATION_ERROR';
  error.field = field;
  error.name = 'TaskValidationError';
  return error;
}