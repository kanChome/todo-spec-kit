import { describe, it, expect, beforeEach } from 'vitest';
import { updateTask, createTask } from '@/lib/task-manager/tasks';

describe('Contract: updateTask', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should update task description', () => {
    const originalTask = createTask('Original task');
    const updatedTask = updateTask(originalTask.id, { description: 'Updated task' });

    expect(updatedTask.description).toBe('Updated task');
    expect(updatedTask.id).toBe(originalTask.id);
    expect(updatedTask.createdAt).toBe(originalTask.createdAt);
    expect(updatedTask.updatedAt).not.toBe(originalTask.updatedAt);
  });

  it('should update task completion status', () => {
    const originalTask = createTask('Test task');
    const updatedTask = updateTask(originalTask.id, { completed: true });

    expect(updatedTask.completed).toBe(true);
    expect(updatedTask.description).toBe(originalTask.description);
    expect(updatedTask.updatedAt).not.toBe(originalTask.updatedAt);
  });

  it('should update both description and completion status', () => {
    const originalTask = createTask('Test task');
    const updatedTask = updateTask(originalTask.id, { 
      description: 'Updated task', 
      completed: true 
    });

    expect(updatedTask.description).toBe('Updated task');
    expect(updatedTask.completed).toBe(true);
    expect(updatedTask.updatedAt).not.toBe(originalTask.updatedAt);
  });

  it('should persist updated task to localStorage', () => {
    const originalTask = createTask('Test task');
    const updatedTask = updateTask(originalTask.id, { description: 'Updated task' });

    const storedTasks = JSON.parse(localStorage.getItem('todo-app-tasks') || '[]');
    expect(storedTasks[0]).toEqual(updatedTask);
  });

  it('should throw error when task not found', () => {
    expect(() => updateTask('nonexistent-id', { description: 'Updated' }))
      .toThrow('Task not found');
  });

  it('should validate description length when updating', () => {
    const task = createTask('Test task');
    
    expect(() => updateTask(task.id, { description: '' }))
      .toThrow('Description cannot be empty');
      
    expect(() => updateTask(task.id, { description: 'a'.repeat(101) }))
      .toThrow('Description must be 100 characters or less');
  });

  it('should trim whitespace from updated description', () => {
    const task = createTask('Test task');
    const updatedTask = updateTask(task.id, { description: '  Updated task  ' });
    
    expect(updatedTask.description).toBe('Updated task');
  });
});