import type { Task } from './types';
import { createStorageError } from './errors';

const STORAGE_KEY = 'todo-app-tasks';

export function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    
    // Validate that we got an array
    if (!Array.isArray(parsed)) {
      console.warn('Invalid task data format in localStorage, resetting to empty array');
      return [];
    }

    // Basic validation of task structure
    return parsed.filter((task: unknown): task is Task => {
      return (
        task !== null &&
        typeof task === 'object' &&
        'id' in task &&
        'description' in task &&
        'completed' in task &&
        'createdAt' in task &&
        'updatedAt' in task &&
        typeof task.id === 'string' &&
        typeof task.description === 'string' &&
        typeof task.completed === 'boolean' &&
        typeof task.createdAt === 'string' &&
        typeof task.updatedAt === 'string'
      );
    });
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    // For corrupted data, return empty array instead of throwing
    if (error instanceof SyntaxError) {
      console.warn('Corrupted localStorage data detected, starting fresh');
      return [];
    }
    throw createStorageError('read', error instanceof Error ? error : undefined);
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    const serialized = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
    throw createStorageError('write', error instanceof Error ? error : undefined);
  }
}

export function clearTasks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear tasks from localStorage:', error);
    throw createStorageError('delete', error instanceof Error ? error : undefined);
  }
}

// Storage event listener for cross-tab synchronization
export function onStorageChange(callback: (tasks: Task[]) => void): () => void {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      try {
        const tasks = loadTasks();
        callback(tasks);
      } catch (error) {
        console.error('Failed to handle storage change:', error);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}