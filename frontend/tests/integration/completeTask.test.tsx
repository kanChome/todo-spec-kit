import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('Integration: Complete Task Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should mark task as complete when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a task first
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Task to complete');
    await user.keyboard('{Enter}');

    // Click the checkbox
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Verify checkbox is checked
    expect(checkbox).toBeChecked();
    
    // Verify task text has strikethrough style
    const taskText = screen.getByText('Task to complete');
    expect(taskText).toHaveStyle({ textDecoration: 'line-through' });
  });

  it('should toggle task back to incomplete when clicked again', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create and complete a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Toggle task');
    await user.keyboard('{Enter}');

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox); // Complete
    expect(checkbox).toBeChecked();

    // Toggle back to incomplete
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Verify strikethrough is removed
    const taskText = screen.getByText('Toggle task');
    expect(taskText).not.toHaveStyle({ textDecoration: 'line-through' });
  });

  it('should persist completion state across page refreshes', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    // Create and complete a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Persistent completion');
    await user.keyboard('{Enter}');

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Unmount and re-render
    unmount();
    render(<App />);

    // Verify task is still marked as complete
    const newCheckbox = screen.getByRole('checkbox');
    expect(newCheckbox).toBeChecked();

    const taskText = screen.getByText('Persistent completion');
    expect(taskText).toHaveStyle({ textDecoration: 'line-through' });
  });

  it('should maintain visual distinction between complete and incomplete tasks', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create two tasks
    const input = screen.getByLabelText(/what needs to be done/i);
    
    await user.type(input, 'Incomplete task');
    await user.keyboard('{Enter}');
    
    await user.type(input, 'Complete task');
    await user.keyboard('{Enter}');

    // Complete the second task
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // Complete the first one in the list (most recent)

    // Verify visual distinction
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();

    expect(screen.getByText('Complete task')).toHaveStyle({ textDecoration: 'line-through' });
    expect(screen.getByText('Incomplete task')).not.toHaveStyle({ textDecoration: 'line-through' });
  });

  it('should show completion status immediately on click', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Instant feedback task');
    await user.keyboard('{Enter}');

    const checkbox = screen.getByRole('checkbox');
    const taskText = screen.getByText('Instant feedback task');

    // Verify initial state
    expect(checkbox).not.toBeChecked();
    expect(taskText).not.toHaveStyle({ textDecoration: 'line-through' });

    // Click and verify immediate update
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(taskText).toHaveStyle({ textDecoration: 'line-through' });
  });
});