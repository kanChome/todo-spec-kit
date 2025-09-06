import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('Integration: Delete Task Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should show delete button when hovering over task', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Task to delete');
    await user.keyboard('{Enter}');

    // Hover over the task
    const taskItem = screen.getByRole('listitem');
    await user.hover(taskItem);

    // Verify delete button appears
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('should delete task when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Task to delete');
    await user.keyboard('{Enter}');

    // Hover and click delete
    const taskItem = screen.getByRole('listitem');
    await user.hover(taskItem);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Verify task is removed
    expect(screen.queryByText('Task to delete')).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('should remove task from localStorage when deleted', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Task to delete');
    await user.keyboard('{Enter}');

    // Delete the task
    const taskItem = screen.getByRole('listitem');
    await user.hover(taskItem);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Verify localStorage is empty
    const storedTasks = JSON.parse(localStorage.getItem('todo-app-tasks') || '[]');
    expect(storedTasks).toHaveLength(0);
  });

  it('should only delete specific task when multiple tasks exist', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create multiple tasks
    const input = screen.getByLabelText(/what needs to be done/i);
    
    await user.type(input, 'First task');
    await user.keyboard('{Enter}');
    
    await user.type(input, 'Second task');
    await user.keyboard('{Enter}');
    
    await user.type(input, 'Third task');
    await user.keyboard('{Enter}');

    // Delete the middle task (Second task)
    const secondTask = screen.getByText('Second task').closest('li');
    await user.hover(secondTask!);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Verify only the specific task is deleted
    expect(screen.queryByText('Second task')).not.toBeInTheDocument();
    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Third task')).toBeInTheDocument();
  });

  it('should show empty state when all tasks are deleted', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Only task');
    await user.keyboard('{Enter}');

    // Delete the task
    const taskItem = screen.getByRole('listitem');
    await user.hover(taskItem);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Verify empty state is shown
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('should persist deletion across page refreshes', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    // Create two tasks
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Persistent task');
    await user.keyboard('{Enter}');
    await user.type(input, 'Task to delete');
    await user.keyboard('{Enter}');

    // Delete one task
    const taskToDelete = screen.getByText('Task to delete').closest('li');
    await user.hover(taskToDelete!);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Unmount and re-render
    unmount();
    render(<App />);

    // Verify deletion persisted
    expect(screen.getByText('Persistent task')).toBeInTheDocument();
    expect(screen.queryByText('Task to delete')).not.toBeInTheDocument();
  });

  it('should handle rapid successive deletions', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create multiple tasks
    const input = screen.getByLabelText(/what needs to be done/i);
    for (let i = 1; i <= 5; i++) {
      await user.type(input, `Task ${i}`);
      await user.keyboard('{Enter}');
    }

    // Rapidly delete tasks
    for (let i = 5; i >= 3; i--) {
      const task = screen.getByText(`Task ${i}`).closest('li');
      await user.hover(task!);
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
    }

    // Verify correct tasks remain
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 4')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 5')).not.toBeInTheDocument();
  });

  it('should maintain task order after deletion', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create tasks in sequence
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'First task');
    await user.keyboard('{Enter}');
    await user.type(input, 'Second task');
    await user.keyboard('{Enter}');
    await user.type(input, 'Third task');
    await user.keyboard('{Enter}');

    // Delete the middle task
    const secondTask = screen.getByText('Second task').closest('li');
    await user.hover(secondTask!);
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Verify remaining tasks maintain proper order (newest first)
    const remainingTasks = screen.getAllByRole('listitem');
    expect(remainingTasks[0]).toHaveTextContent('Third task');
    expect(remainingTasks[1]).toHaveTextContent('First task');
  });
});