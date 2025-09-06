import { useState, useCallback, useEffect } from 'react';
import type { Task } from '@/lib/task-manager/types';
import { 
  listTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  toggleTask 
} from '@/lib/task-manager/tasks';
import { onStorageChange } from '@/lib/task-manager/storage';
import { isQuotaExceededError, isValidationError } from '@/lib/task-manager/errors';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createNewTask: (description: string) => Promise<Task | null>;
  updateExistingTask: (id: string, updates: { description?: string; completed?: boolean }) => Promise<Task | null>;
  deleteExistingTask: (id: string) => Promise<boolean>;
  toggleTaskCompletion: (id: string) => Promise<Task | null>;
  clearError: () => void;
  refreshTasks: () => void;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshTasks = useCallback(() => {
    try {
      const loadedTasks = listTasks();
      setTasks(loadedTasks);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
      setError('Failed to load tasks. Please try again.');
    }
  }, []);

  const createNewTask = useCallback(async (description: string): Promise<Task | null> => {
    try {
      const newTask = createTask(description);
      setTasks(currentTasks => {
        const updated = [...currentTasks, newTask];
        // Re-sort to maintain newest-first order
        return updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
      setError(null);
      return newTask;
    } catch (err) {
      console.error('Failed to create task:', err);
      
      if (isValidationError(err)) {
        setError(err.message);
      } else if (isQuotaExceededError(err)) {
        setError('Storage is full. Please delete some completed tasks to free up space.');
      } else {
        setError('Failed to create task. Please try again.');
      }
      
      return null;
    }
  }, []);

  const updateExistingTask = useCallback(async (
    id: string, 
    updates: { description?: string; completed?: boolean }
  ): Promise<Task | null> => {
    // Check if task exists in current state
    const currentTask = tasks.find(task => task.id === id);
    if (!currentTask) {
      console.warn(`Task ${id} not found in current state`);
      return null;
    }

    try {
      const updatedTask = updateTask(id, updates);
      setTasks(currentTasks => 
        currentTasks.map(task => task.id === id ? updatedTask : task)
      );
      setError(null);
      return updatedTask;
    } catch (err) {
      console.error('Failed to update task:', err);
      
      if (isValidationError(err)) {
        setError(err.message);
      } else {
        setError('Failed to update task. Please try again.');
      }
      
      return null;
    }
  }, [tasks]);

  const deleteExistingTask = useCallback(async (id: string): Promise<boolean> => {
    // Check if task exists in current state
    const currentTask = tasks.find(task => task.id === id);
    if (!currentTask) {
      console.warn(`Task ${id} not found in current state`);
      return false;
    }

    try {
      const success = deleteTask(id);
      if (success) {
        setTasks(currentTasks => currentTasks.filter(task => task.id !== id));
        setError(null);
      }
      return success;
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task. Please try again.');
      return false;
    }
  }, [tasks]);

  const toggleTaskCompletion = useCallback(async (id: string): Promise<Task | null> => {
    // Check if task exists in current state
    const currentTask = tasks.find(task => task.id === id);
    if (!currentTask) {
      console.warn(`Task ${id} not found in current state`);
      return null;
    }

    try {
      const updatedTask = toggleTask(id);
      setTasks(currentTasks => 
        currentTasks.map(task => task.id === id ? updatedTask : task)
      );
      setError(null);
      return updatedTask;
    } catch (err) {
      console.error('Failed to toggle task:', err);
      setError('Failed to update task. Please try again.');
      return null;
    }
  }, [tasks]);

  // Initialize tasks on mount
  useEffect(() => {
    refreshTasks();
    setLoading(false);
  }, [refreshTasks]);

  // Set up cross-tab synchronization
  useEffect(() => {
    const cleanup = onStorageChange((updatedTasks) => {
      setTasks(updatedTasks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    });

    return cleanup;
  }, []);

  return {
    tasks,
    loading,
    error,
    createNewTask,
    updateExistingTask,
    deleteExistingTask,
    toggleTaskCompletion,
    clearError,
    refreshTasks
  };
}