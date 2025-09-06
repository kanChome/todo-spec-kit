import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('Integration: Data Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should persist tasks across app restarts', async () => {
    const user = userEvent.setup();
    
    // First app instance
    const { unmount: unmount1 } = render(<App />);

    // Create multiple tasks with different states
    const input = screen.getByLabelText(/what needs to be done/i);
    
    await user.type(input, 'First task');
    await user.keyboard('{Enter}');
    
    await user.type(input, 'Second task');
    await user.keyboard('{Enter}');
    
    await user.type(input, 'Third task');
    await user.keyboard('{Enter}');

    // Wait for tasks to be rendered, then complete the second task
    await expect(screen.findByText('Third task')).resolves.toBeInTheDocument();
    
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]!); // Complete middle task
    
    // Wait for the toggle to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Unmount first instance
    unmount1();

    // Start new app instance
    render(<App />);

    // Verify all tasks persist with correct states
    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
    expect(screen.getByText('Third task')).toBeInTheDocument();

    // Verify completion states persist
    const newCheckboxes = screen.getAllByRole('checkbox');
    expect(newCheckboxes[0]).not.toBeChecked(); // Third task (newest, incomplete)
    expect(newCheckboxes[1]).toBeChecked();     // Second task (completed)
    expect(newCheckboxes[2]).not.toBeChecked(); // First task (oldest, incomplete)
  });

  it('should persist task order after restart', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    // Create tasks in specific order
    const input = screen.getByLabelText(/what needs to be done/i);
    
    await user.type(input, 'Oldest task');
    await user.keyboard('{Enter}');
    
    await user.type(input, 'Middle task');
    await user.keyboard('{Enter}');
    
    await user.type(input, 'Newest task');
    await user.keyboard('{Enter}');

    unmount();
    render(<App />);

    // Verify order is maintained (newest first)
    const tasks = screen.getAllByRole('listitem');
    expect(tasks[0]).toHaveTextContent('Newest task');
    expect(tasks[1]).toHaveTextContent('Middle task');
    expect(tasks[2]).toHaveTextContent('Oldest task');
  });

  it('should handle localStorage quota exceeded gracefully', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Mock localStorage.setItem to throw quota exceeded error
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });

    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Task that exceeds quota');
    await user.keyboard('{Enter}');

    // Should show error message about storage being full
    expect(screen.getByText(/storage is full/i)).toBeInTheDocument();
    
    // Restore all mocks
    vi.restoreAllMocks();
  });

  it('should recover from corrupted localStorage data', async () => {
    // Set corrupted data in localStorage before rendering
    localStorage.setItem('todo-app-tasks', 'invalid-json-data');

    render(<App />);

    // Should show empty state instead of crashing (wait for loading to complete)
    await expect(screen.findByText(/no tasks yet/i)).resolves.toBeInTheDocument();
    
    // Should be able to add new tasks normally
    const user = userEvent.setup();
    const input = screen.getByLabelText(/what needs to be done/i);
    
    await user.type(input, 'Recovery task');
    await user.keyboard('{Enter}');

    // Wait for the task to appear
    await expect(screen.findByText('Recovery task')).resolves.toBeInTheDocument();
  });

  it('should handle missing localStorage gracefully', async () => {
    // Mock localStorage.getItem to throw error
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    render(<App />);

    // Should show empty state (may take a moment to load)
    await expect(screen.findByText(/no tasks yet/i)).resolves.toBeInTheDocument();

    // Restore all mocks
    vi.restoreAllMocks();
  });

  it('should preserve task metadata across restarts', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    // Create task and note the creation time
    const beforeCreate = new Date().toISOString();
    
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Metadata task');
    await user.keyboard('{Enter}');

    const afterCreate = new Date().toISOString();

    // Edit the task to update the updatedAt timestamp
    await new Promise(resolve => setTimeout(resolve, 100)); // Ensure different timestamps
    
    const taskText = screen.getByText('Metadata task');
    await user.dblClick(taskText);
    
    const editInput = screen.getByDisplayValue('Metadata task');
    await user.clear(editInput);
    await user.type(editInput, 'Updated metadata task');
    await user.keyboard('{Enter}');

    unmount();
    render(<App />);

    // Verify task persists with updated content
    expect(screen.getByText('Updated metadata task')).toBeInTheDocument();
    
    // Verify metadata is preserved (this would require exposing task data)
    const storedTasks = JSON.parse(localStorage.getItem('todo-app-tasks') || '[]');
    expect(storedTasks).toHaveLength(1);
    
    const task = storedTasks[0];
    expect(task.description).toBe('Updated metadata task');
    expect(task.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(task.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(new Date(task.createdAt).getTime()).toBeGreaterThanOrEqual(new Date(beforeCreate).getTime());
    expect(new Date(task.createdAt).getTime()).toBeLessThanOrEqual(new Date(afterCreate).getTime());
    expect(new Date(task.updatedAt).getTime()).toBeGreaterThan(new Date(task.createdAt).getTime());
  });

  it('should handle concurrent tab updates', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create initial task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Initial task');
    await user.keyboard('{Enter}');

    // Simulate another tab adding a task directly to localStorage
    const existingTasks = JSON.parse(localStorage.getItem('todo-app-tasks') || '[]');
    const newTask = {
      id: 'external-task-id',
      description: 'Task from another tab',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedTasks = [...existingTasks, newTask];
    localStorage.setItem('todo-app-tasks', JSON.stringify(updatedTasks));

    // Trigger a localStorage change event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'todo-app-tasks',
      newValue: JSON.stringify(updatedTasks),
      oldValue: JSON.stringify(existingTasks)
    }));

    // Should reflect the new task from the other tab
    expect(screen.getByText('Task from another tab')).toBeInTheDocument();
    expect(screen.getByText('Initial task')).toBeInTheDocument();
  });

  it('should maintain data integrity after multiple operations', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    // Perform multiple operations
    const input = screen.getByLabelText(/what needs to be done/i);
    
    // Create tasks
    for (let i = 1; i <= 5; i++) {
      await user.type(input, `Task ${i}`);
      await user.keyboard('{Enter}');
    }

    // Complete some tasks
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!); // Complete newest
    await user.click(checkboxes[2]!); // Complete middle

    // Edit a task
    const taskText = screen.getByText('Task 3');
    await user.dblClick(taskText);
    const editInput = screen.getByDisplayValue('Task 3');
    await user.clear(editInput);
    await user.type(editInput, 'Edited Task 3');
    await user.keyboard('{Enter}');

    // Delete a task
    const taskToDelete = screen.getByText('Task 2').closest('li');
    await user.hover(taskToDelete!);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    unmount();
    render(<App />);

    // Verify final state
    expect(screen.getByText('Task 5')).toBeInTheDocument();
    expect(screen.getByText('Task 4')).toBeInTheDocument();
    expect(screen.getByText('Edited Task 3')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();

    // Verify completion states
    const finalCheckboxes = screen.getAllByRole('checkbox');
    expect(finalCheckboxes[0]).toBeChecked();   // Task 5 (was completed)
    expect(finalCheckboxes[1]).not.toBeChecked(); // Task 4
    expect(finalCheckboxes[2]).toBeChecked();   // Edited Task 3 (was completed)
    expect(finalCheckboxes[3]).not.toBeChecked(); // Task 1
  });
});