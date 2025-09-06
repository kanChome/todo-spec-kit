import type { Task } from './types';
import { v4 as uuidv4 } from 'uuid';

export function generateTaskId(): string {
  return uuidv4();
}

export function getCurrentISOString(): string {
  return new Date().toISOString();
}

export function sortTasksByCreationDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Sort by createdAt in descending order (newest first)
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    
    if (bTime !== aTime) {
      return bTime - aTime;
    }
    
    // If createdAt is identical, use id as secondary sort for consistency
    return b.id.localeCompare(a.id);
  });
}

export function findTaskById(tasks: Task[], taskId: string): Task | undefined {
  return tasks.find(task => task.id === taskId);
}

export function findTaskIndexById(tasks: Task[], taskId: string): number {
  return tasks.findIndex(task => task.id === taskId);
}

export function createTaskTemplate(description: string): Omit<Task, 'id'> {
  const now = getCurrentISOString();
  
  return {
    description,
    completed: false,
    createdAt: now,
    updatedAt: now
  };
}

export function updateTaskTemplate(existingTask: Task, updates: Partial<Pick<Task, 'description' | 'completed'>>): Task {
  return {
    ...existingTask,
    ...updates,
    updatedAt: getCurrentISOString()
  };
}

export function filterCompletedTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.completed);
}

export function filterIncompleteTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => !task.completed);
}

export function getTaskStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = filterCompletedTasks(tasks).length;
  const incomplete = total - completed;
  
  return {
    total,
    completed,
    incomplete,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100)
  };
}