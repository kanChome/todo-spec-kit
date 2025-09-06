import { describe, it, expect, beforeEach } from 'vitest';
import { listTasks } from '@/lib/task-manager/tasks';

describe('Contract: listTasks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no tasks exist', () => {
    const tasks = listTasks();
    expect(tasks).toEqual([]);
  });

  it('should return tasks sorted by creation date (newest first)', () => {
    // Setup test data in localStorage
    const testTasks = [
      {
        id: '1',
        description: 'First task',
        completed: false,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        description: 'Second task',
        completed: true,
        createdAt: '2024-01-01T11:00:00Z',
        updatedAt: '2024-01-01T11:00:00Z'
      }
    ];
    localStorage.setItem('todo-app-tasks', JSON.stringify(testTasks));

    const tasks = listTasks();
    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.id).toBe('2'); // Newest first
    expect(tasks[1]?.id).toBe('1');
  });

  it('should handle corrupted localStorage data', () => {
    localStorage.setItem('todo-app-tasks', 'invalid-json');
    
    const tasks = listTasks();
    expect(tasks).toEqual([]);
  });

  it('should return array of valid Task objects', () => {
    const testTasks = [
      {
        id: '1',
        description: 'Test task',
        completed: false,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      }
    ];
    localStorage.setItem('todo-app-tasks', JSON.stringify(testTasks));

    const tasks = listTasks();
    expect(tasks[0]).toMatchObject({
      id: expect.any(String),
      description: expect.any(String),
      completed: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });
});