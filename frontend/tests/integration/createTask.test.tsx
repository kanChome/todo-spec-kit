import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('Integration: Create Task Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should create a new task when user enters description and submits', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Find the input field
    const input = screen.getByLabelText(/what needs to be done/i);
    expect(input).toBeInTheDocument();

    // Enter task description
    await user.type(input, 'Complete project documentation');
    
    // Submit by pressing Enter
    await user.keyboard('{Enter}');

    // Verify task appears in the list
    expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
    
    // Verify input is cleared
    expect(input).toHaveValue('');
  });

  it('should create task when clicking Add Task button', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    const addButton = screen.getByRole('button', { name: /add task/i });

    await user.type(input, 'Test task via button');
    await user.click(addButton);

    expect(screen.getByText('Test task via button')).toBeInTheDocument();
  });

  it('should show task with unchecked checkbox when created', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'New task');
    await user.keyboard('{Enter}');

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should display tasks in newest-first order', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);

    // Add first task
    await user.type(input, 'First task');
    await user.keyboard('{Enter}');

    // Add second task (should appear first)
    await user.type(input, 'Second task');
    await user.keyboard('{Enter}');

    // Verify order
    const tasks = screen.getAllByRole('listitem');
    expect(tasks[0]).toHaveTextContent('Second task');
    expect(tasks[1]).toHaveTextContent('First task');
  });

  it('should persist created tasks across page refreshes', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    // Create a task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Persistent task');
    await user.keyboard('{Enter}');

    // Unmount and re-render (simulating page refresh)
    unmount();
    render(<App />);

    // Verify task is still there
    expect(screen.getByText('Persistent task')).toBeInTheDocument();
  });
});