import type { Task, UpdateTaskRequest } from './types';
import { validateTaskDescription, validateTaskId } from './validation';
import { createTaskNotFoundError } from './errors';
import { loadTasks, saveTasks } from './storage';
import { 
  generateTaskId, 
  sortTasksByCreationDate, 
  findTaskById, 
  findTaskIndexById,
  createTaskTemplate,
  updateTaskTemplate
} from './utils';

export function listTasks(): Task[] {
  const tasks = loadTasks();
  return sortTasksByCreationDate(tasks);
}

export function createTask(description: string): Task {
  const validDescription = validateTaskDescription(description);
  
  const taskTemplate = createTaskTemplate(validDescription);
  const newTask: Task = {
    id: generateTaskId(),
    ...taskTemplate
  };

  const existingTasks = loadTasks();
  const updatedTasks = [...existingTasks, newTask];
  
  saveTasks(updatedTasks);
  
  return newTask;
}

export function updateTask(taskId: string, updates: UpdateTaskRequest): Task {
  validateTaskId(taskId);
  
  const tasks = loadTasks();
  const taskIndex = findTaskIndexById(tasks, taskId);
  
  if (taskIndex === -1) {
    throw createTaskNotFoundError(taskId);
  }

  const existingTask = tasks[taskIndex]!;
  
  // Validate updates
  const validatedUpdates: Partial<Pick<Task, 'description' | 'completed'>> = {};
  
  if (updates.description !== undefined) {
    validatedUpdates.description = validateTaskDescription(updates.description);
  }
  
  if (updates.completed !== undefined) {
    validatedUpdates.completed = updates.completed;
  }

  const updatedTask = updateTaskTemplate(existingTask, validatedUpdates);
  
  // Update the task in the array
  const updatedTasks = [...tasks];
  updatedTasks[taskIndex] = updatedTask;
  
  saveTasks(updatedTasks);
  
  return updatedTask;
}

export function deleteTask(taskId: string): boolean {
  try {
    validateTaskId(taskId);
  } catch {
    // If taskId is invalid, treat as not found
    return false;
  }
  
  const tasks = loadTasks();
  const taskIndex = findTaskIndexById(tasks, taskId);
  
  if (taskIndex === -1) {
    return false;
  }

  const updatedTasks = tasks.filter((_, index) => index !== taskIndex);
  saveTasks(updatedTasks);
  
  return true;
}

export function toggleTask(taskId: string): Task {
  validateTaskId(taskId);
  
  const tasks = loadTasks();
  const existingTask = findTaskById(tasks, taskId);
  
  if (!existingTask) {
    throw createTaskNotFoundError(taskId);
  }

  return updateTask(taskId, { completed: !existingTask.completed });
}

export function getTask(taskId: string): Task | null {
  validateTaskId(taskId);
  
  const tasks = loadTasks();
  const task = findTaskById(tasks, taskId);
  
  return task || null;
}

export function clearCompletedTasks(): Task[] {
  const tasks = loadTasks();
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  saveTasks(incompleteTasks);
  
  return sortTasksByCreationDate(incompleteTasks);
}

export function markAllCompleted(): Task[] {
  const tasks = loadTasks();
  const updatedTasks = tasks.map(task => 
    updateTaskTemplate(task, { completed: true })
  );
  
  saveTasks(updatedTasks);
  
  return sortTasksByCreationDate(updatedTasks);
}

export function markAllIncomplete(): Task[] {
  const tasks = loadTasks();
  const updatedTasks = tasks.map(task => 
    updateTaskTemplate(task, { completed: false })
  );
  
  saveTasks(updatedTasks);
  
  return sortTasksByCreationDate(updatedTasks);
}

// Additional exports for testing
export { loadTasks, saveTasks } from './storage';