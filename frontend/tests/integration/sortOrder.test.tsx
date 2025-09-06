import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('Integration: Sort Order', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should display tasks in descending order by creation date (newest first)', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);

    // Create tasks in sequence
    await user.type(input, 'First created task');
    await user.keyboard('{Enter}');

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await user.type(input, 'Second created task');
    await user.keyboard('{Enter}');

    await new Promise(resolve => setTimeout(resolve, 10));

    await user.type(input, 'Third created task');
    await user.keyboard('{Enter}');

    // Verify order (newest first)
    const tasks = screen.getAllByRole('listitem');
    expect(tasks[0]).toHaveTextContent('Third created task');
    expect(tasks[1]).toHaveTextContent('Second created task');
    expect(tasks[2]).toHaveTextContent('First created task');
  });

  it('should maintain sort order after task completion', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);

    // Create tasks
    await user.type(input, 'Task A');
    await user.keyboard('{Enter}');
    await user.type(input, 'Task B');
    await user.keyboard('{Enter}');
    await user.type(input, 'Task C');
    await user.keyboard('{Enter}');

    // Wait for tasks to be rendered, then complete the middle task (Task B)
    await expect(screen.findByText('Task C')).resolves.toBeInTheDocument();
    
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]!); // Task B checkbox
    
    // Wait for the toggle to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verify order is still by creation date, not completion status
    const tasks = screen.getAllByRole('listitem');
    expect(tasks[0]).toHaveTextContent('Task C');
    expect(tasks[1]).toHaveTextContent('Task B');
    expect(tasks[2]).toHaveTextContent('Task A');

    // Verify completion visual state
    expect(checkboxes[1]).toBeChecked();
    expect(screen.getByText('Task B')).toHaveStyle({ textDecoration: 'line-through' });
  });

  it('should maintain sort order after task editing', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);

    // Create tasks
    await user.type(input, 'Original first');
    await user.keyboard('{Enter}');
    await user.type(input, 'Original second');
    await user.keyboard('{Enter}');
    await user.type(input, 'Original third');
    await user.keyboard('{Enter}');

    // Edit the middle task
    const taskText = screen.getByText('Original second');
    await user.dblClick(taskText);
    const editInput = screen.getByDisplayValue('Original second');
    await user.clear(editInput);
    await user.type(editInput, 'Edited second task');
    await user.keyboard('{Enter}');

    // Verify order is still by creation date
    const tasks = screen.getAllByRole('listitem');
    expect(tasks[0]).toHaveTextContent('Original third');
    expect(tasks[1]).toHaveTextContent('Edited second task');
    expect(tasks[2]).toHaveTextContent('Original first');
  });

  it('should maintain sort order after task deletion', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);

    // Create tasks
    await user.type(input, 'Task 1');
    await user.keyboard('{Enter}');
    await user.type(input, 'Task 2');
    await user.keyboard('{Enter}');
    await user.type(input, 'Task 3');
    await user.keyboard('{Enter}');
    await user.type(input, 'Task 4');
    await user.keyboard('{Enter}');

    // Delete the second task (Task 3)
    const taskToDelete = screen.getByText('Task 3').closest('li');
    await user.hover(taskToDelete!);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Verify remaining tasks maintain proper order
    const remainingTasks = screen.getAllByRole('listitem');
    expect(remainingTasks[0]).toHaveTextContent('Task 4');
    expect(remainingTasks[1]).toHaveTextContent('Task 2');
    expect(remainingTasks[2]).toHaveTextContent('Task 1');
  });

  it('should preserve sort order after app restart', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);

    // Create tasks with explicit timing
    await user.type(input, 'Oldest task');
    await user.keyboard('{Enter}');

    await new Promise(resolve => setTimeout(resolve, 50));

    await user.type(input, 'Middle task');
    await user.keyboard('{Enter}');

    await new Promise(resolve => setTimeout(resolve, 50));

    await user.type(input, 'Newest task');
    await user.keyboard('{Enter}');

    // Restart app
    unmount();
    render(<App />);

    // Verify order is preserved
    const tasks = screen.getAllByRole('listitem');
    expect(tasks[0]).toHaveTextContent('Newest task');
    expect(tasks[1]).toHaveTextContent('Middle task');
    expect(tasks[2]).toHaveTextContent('Oldest task');
  });

  it('should handle rapid task creation with correct ordering', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);

    // Rapidly create multiple tasks
    const taskNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
    
    for (const taskName of taskNames) {
      await user.type(input, taskName);
      await user.keyboard('{Enter}');
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
    }

    // Verify tasks appear in reverse order (newest first)
    const tasks = screen.getAllByRole('listitem');
    expect(tasks[0]).toHaveTextContent('Epsilon');
    expect(tasks[1]).toHaveTextContent('Delta');
    expect(tasks[2]).toHaveTextContent('Gamma');
    expect(tasks[3]).toHaveTextContent('Beta');
    expect(tasks[4]).toHaveTextContent('Alpha');
  });

  it('should sort correctly when tasks have identical creation times', async () => {
    // Manually set up tasks with identical createdAt timestamps
    const identicalTime = new Date().toISOString();
    const tasks = [
      {
        id: 'task-1',
        description: 'Task A',
        completed: false,
        createdAt: identicalTime,
        updatedAt: identicalTime
      },
      {
        id: 'task-2', 
        description: 'Task B',
        completed: false,
        createdAt: identicalTime,
        updatedAt: identicalTime
      },
      {
        id: 'task-3',
        description: 'Task C',
        completed: false,
        createdAt: identicalTime,
        updatedAt: identicalTime
      }
    ];

    localStorage.setItem('todo-app-tasks', JSON.stringify(tasks));
    render(<App />);

    // Should handle identical timestamps gracefully
    // (Order may depend on secondary sort criteria like ID)
    const taskElements = screen.getAllByRole('listitem');
    expect(taskElements).toHaveLength(3);
    
    // All tasks should be present
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('Task C')).toBeInTheDocument();
  });

  it('should maintain consistent order during mixed operations', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);

    // Create initial tasks
    await user.type(input, 'Task 1');
    await user.keyboard('{Enter}');
    await user.type(input, 'Task 2');
    await user.keyboard('{Enter}');

    // Verify initial order
    let tasks = screen.getAllByRole('listitem');
    expect(tasks[0]).toHaveTextContent('Task 2');
    expect(tasks[1]).toHaveTextContent('Task 1');

    // Complete a task
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!);

    // Add another task
    await user.type(input, 'Task 3');
    await user.keyboard('{Enter}');

    // Verify order is still maintained
    tasks = screen.getAllByRole('listitem');
    expect(tasks[0]).toHaveTextContent('Task 3'); // Newest
    expect(tasks[1]).toHaveTextContent('Task 2'); // Second (completed)
    expect(tasks[2]).toHaveTextContent('Task 1'); // Oldest

    // Edit the oldest task
    const oldestTask = screen.getByText('Task 1');
    await user.dblClick(oldestTask);
    const editInput = screen.getByDisplayValue('Task 1');
    await user.clear(editInput);
    await user.type(editInput, 'Edited Task 1');
    await user.keyboard('{Enter}');

    // Order should still be by creation time
    tasks = screen.getAllByRole('listitem');
    expect(tasks[0]).toHaveTextContent('Task 3');
    expect(tasks[1]).toHaveTextContent('Task 2');
    expect(tasks[2]).toHaveTextContent('Edited Task 1');
  });

  it('should handle edge case of single task', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Only task');
    await user.keyboard('{Enter}');

    const tasks = screen.getAllByRole('listitem');
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toHaveTextContent('Only task');
  });

  it('should handle empty task list correctly', () => {
    render(<App />);

    // Should show empty state
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});