import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTask } from '@/lib/task-manager/tasks';

describe('Contract: createTask', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create a new task with valid description', () => {
    const description = 'Test task';
    const task = createTask(description);

    expect(task).toMatchObject({
      id: expect.any(String),
      description: 'Test task',
      completed: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
    expect(task.id).toHaveLength(36); // UUID length
  });

  it('should persist task to localStorage', () => {
    const description = 'Test task';
    const task = createTask(description);

    const storedTasks = JSON.parse(localStorage.getItem('todo-app-tasks') || '[]');
    expect(storedTasks).toHaveLength(1);
    expect(storedTasks[0]).toEqual(task);
  });

  it('should throw error for empty description', () => {
    expect(() => createTask('')).toThrow('Description cannot be empty');
    expect(() => createTask('   ')).toThrow('Description cannot be empty');
  });

  it('should throw error for description exceeding 100 characters', () => {
    const longDescription = 'a'.repeat(101);
    expect(() => createTask(longDescription)).toThrow('Description must be 100 characters or less');
  });

  it('should trim whitespace from description', () => {
    const task = createTask('  Test task  ');
    expect(task.description).toBe('Test task');
  });

  it('should set createdAt and updatedAt to same value', () => {
    const task = createTask('Test task');
    expect(task.createdAt).toBe(task.updatedAt);
  });

  it('should handle localStorage quota exceeded error', () => {
    // Mock localStorage.setItem to throw quota exceeded error
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => createTask('Test task')).toThrow('Storage quota exceeded');
  });
});