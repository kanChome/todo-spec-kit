import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('Integration: Edit Task Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should enter edit mode when task description is double-clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Original task');
    await user.keyboard('{Enter}');

    // Double-click the task description
    const taskText = screen.getByText('Original task');
    await user.dblClick(taskText);

    // Verify edit input appears
    const editInput = screen.getByDisplayValue('Original task');
    expect(editInput).toBeInTheDocument();
    expect(editInput).toHaveFocus();
  });

  it('should save edited task when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create and edit a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Original task');
    await user.keyboard('{Enter}');

    const taskText = screen.getByText('Original task');
    await user.dblClick(taskText);

    const editInput = screen.getByDisplayValue('Original task');
    await user.clear(editInput);
    await user.type(editInput, 'Updated task');
    await user.keyboard('{Enter}');

    // Verify updated text appears
    expect(screen.getByText('Updated task')).toBeInTheDocument();
    expect(screen.queryByText('Original task')).not.toBeInTheDocument();
  });

  it('should cancel edit when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create and start editing a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Original task');
    await user.keyboard('{Enter}');

    const taskText = screen.getByText('Original task');
    await user.dblClick(taskText);

    const editInput = screen.getByDisplayValue('Original task');
    await user.clear(editInput);
    await user.type(editInput, 'Changed text');
    await user.keyboard('{Escape}');

    // Verify original text is restored
    expect(screen.getByText('Original task')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Changed text')).not.toBeInTheDocument();
  });

  it('should save edit when input loses focus', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Original task');
    await user.keyboard('{Enter}');

    // Start editing
    const taskText = screen.getByText('Original task');
    await user.dblClick(taskText);

    const editInput = screen.getByDisplayValue('Original task');
    await user.clear(editInput);
    await user.type(editInput, 'Blur updated task');

    // Click somewhere else to lose focus
    await user.click(document.body);

    // Verify task is updated
    expect(screen.getByText('Blur updated task')).toBeInTheDocument();
  });

  it('should validate description length during edit', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Original task');
    await user.keyboard('{Enter}');

    // Start editing
    const taskText = screen.getByText('Original task');
    await user.dblClick(taskText);

    const editInput = screen.getByDisplayValue('Original task');
    await user.clear(editInput);
    
    // Try to enter empty description
    await user.keyboard('{Enter}');
    
    // Verify error message appears
    expect(screen.getByText(/description cannot be empty/i)).toBeInTheDocument();
    
    // Verify original task remains
    expect(screen.getByText('Original task')).toBeInTheDocument();
  });

  it('should trim whitespace from edited description', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Original task');
    await user.keyboard('{Enter}');

    // Edit with extra whitespace
    const taskText = screen.getByText('Original task');
    await user.dblClick(taskText);

    const editInput = screen.getByDisplayValue('Original task');
    await user.clear(editInput);
    await user.type(editInput, '  Trimmed task  ');
    await user.keyboard('{Enter}');

    // Verify whitespace is trimmed
    expect(screen.getByText('Trimmed task')).toBeInTheDocument();
  });

  it('should persist edited task across page refreshes', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    // Create and edit a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Original task');
    await user.keyboard('{Enter}');

    const taskText = screen.getByText('Original task');
    await user.dblClick(taskText);

    const editInput = screen.getByDisplayValue('Original task');
    await user.clear(editInput);
    await user.type(editInput, 'Persistent edit');
    await user.keyboard('{Enter}');

    // Unmount and re-render
    unmount();
    render(<App />);

    // Verify edited task persists
    expect(screen.getByText('Persistent edit')).toBeInTheDocument();
    expect(screen.queryByText('Original task')).not.toBeInTheDocument();
  });

  it('should maintain completion status when editing task', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create and complete a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Completed task');
    await user.keyboard('{Enter}');

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Edit the completed task
    const taskText = screen.getByText('Completed task');
    await user.dblClick(taskText);

    const editInput = screen.getByDisplayValue('Completed task');
    await user.clear(editInput);
    await user.type(editInput, 'Edited completed task');
    await user.keyboard('{Enter}');

    // Verify completion status is maintained
    const updatedCheckbox = screen.getByRole('checkbox');
    expect(updatedCheckbox).toBeChecked();

    const updatedTaskText = screen.getByText('Edited completed task');
    expect(updatedTaskText).toHaveStyle({ textDecoration: 'line-through' });
  });
});