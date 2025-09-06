import { describe, it, expect, beforeEach } from 'vitest';
import { deleteTask, createTask, listTasks } from '@/lib/task-manager/tasks';

describe('Contract: deleteTask', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should delete existing task', () => {
    const task = createTask('Test task');
    const result = deleteTask(task.id);

    expect(result).toBe(true);
    expect(listTasks()).toHaveLength(0);
  });

  it('should remove task from localStorage', () => {
    const task1 = createTask('First task');
    const task2 = createTask('Second task');
    
    deleteTask(task1.id);
    
    const storedTasks = JSON.parse(localStorage.getItem('todo-app-tasks') || '[]');
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0]?.id).toBe(task2.id);
  });

  it('should return false when task not found', () => {
    const result = deleteTask('nonexistent-id');
    expect(result).toBe(false);
  });

  it('should handle deleting from empty list', () => {
    const result = deleteTask('any-id');
    expect(result).toBe(false);
  });

  it('should not affect other tasks when deleting one', () => {
    const task1 = createTask('First task');
    const task2 = createTask('Second task');
    const task3 = createTask('Third task');

    deleteTask(task2.id);

    const remainingTasks = listTasks();
    expect(remainingTasks).toHaveLength(2);
    expect(remainingTasks.map(t => t.id)).toEqual([task3.id, task1.id]); // Sorted by creation date
  });

  it('should handle corrupted localStorage during deletion', () => {
    localStorage.setItem('todo-app-tasks', 'invalid-json');
    
    const result = deleteTask('any-id');
    expect(result).toBe(false);
  });
});