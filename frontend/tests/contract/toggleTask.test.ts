import { describe, it, expect, beforeEach } from 'vitest';
import { toggleTask, createTask } from '@/lib/task-manager/tasks';

describe('Contract: toggleTask', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should toggle incomplete task to complete', () => {
    const task = createTask('Test task');
    expect(task.completed).toBe(false);

    const toggledTask = toggleTask(task.id);
    
    expect(toggledTask.completed).toBe(true);
    expect(toggledTask.id).toBe(task.id);
    expect(toggledTask.description).toBe(task.description);
    expect(toggledTask.updatedAt).not.toBe(task.updatedAt);
  });

  it('should toggle complete task to incomplete', () => {
    const task = createTask('Test task');
    const completedTask = toggleTask(task.id); // First toggle to complete
    const incompleteTask = toggleTask(task.id); // Second toggle back to incomplete

    expect(incompleteTask.completed).toBe(false);
    expect(incompleteTask.id).toBe(task.id);
    expect(incompleteTask.updatedAt).not.toBe(completedTask.updatedAt);
  });

  it('should persist toggle state to localStorage', () => {
    const task = createTask('Test task');
    const toggledTask = toggleTask(task.id);

    const storedTasks = JSON.parse(localStorage.getItem('todo-app-tasks') || '[]');
    expect(storedTasks[0]).toEqual(toggledTask);
  });

  it('should throw error when task not found', () => {
    expect(() => toggleTask('nonexistent-id'))
      .toThrow('Task not found');
  });

  it('should update updatedAt timestamp', () => {
    const task = createTask('Test task');
    
    // Mock the current time to be different
    const mockNow = '2024-01-01T11:00:00Z';
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockNow);
    
    const toggledTask = toggleTask(task.id);
    
    expect(toggledTask.updatedAt).toBe(mockNow);
    expect(toggledTask.createdAt).toBe(task.createdAt);
    
    vi.restoreAllMocks();
  });

  it('should maintain task order after toggle', () => {
    const task1 = createTask('First task');
    const task2 = createTask('Second task');
    
    toggleTask(task1.id);
    
    const storedTasks = JSON.parse(localStorage.getItem('todo-app-tasks') || '[]');
    expect(storedTasks).toHaveLength(2);
    // Order should be preserved (by creation date, not by completion status)
    expect(storedTasks[0]?.id).toBe(task2.id);
    expect(storedTasks[1]?.id).toBe(task1.id);
  });
});