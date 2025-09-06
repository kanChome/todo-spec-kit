import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('Integration: Empty Task Prevention', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not create task when input is empty and Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    screen.getByLabelText(/what needs to be done/i);
    
    // Press Enter without typing anything
    await user.keyboard('{Enter}');

    // No task should be created
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    
    // Should show empty state message
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('should not create task when input is only whitespace', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    
    // Type only spaces and press Enter
    await user.type(input, '   ');
    await user.keyboard('{Enter}');

    // No task should be created
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    
    // Input should be cleared
    expect(input).toHaveValue('');
  });

  it('should not create task when clicking Add Task button with empty input', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addButton = screen.getByRole('button', { name: /add task/i });
    
    // Click Add Task without entering text
    await user.click(addButton);

    // No task should be created
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('should show error message when attempting to add empty task', async () => {
    const user = userEvent.setup();
    render(<App />);

    screen.getByLabelText(/what needs to be done/i);
    
    // Try to create empty task
    await user.keyboard('{Enter}');

    // Should show error message
    expect(screen.getByText(/task description cannot be empty/i)).toBeInTheDocument();
  });

  it('should clear error message when user starts typing', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    
    // Trigger empty task error
    await user.keyboard('{Enter}');
    expect(screen.getByText(/task description cannot be empty/i)).toBeInTheDocument();

    // Start typing
    await user.type(input, 'A');

    // Error message should be cleared
    expect(screen.queryByText(/task description cannot be empty/i)).not.toBeInTheDocument();
  });

  it('should disable Add Task button when input is empty', async () => {
    render(<App />);

    const addButton = screen.getByRole('button', { name: /add task/i });
    
    // Button should be disabled initially
    expect(addButton).toBeDisabled();
  });

  it('should enable Add Task button when input has valid text', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    const addButton = screen.getByRole('button', { name: /add task/i });
    
    // Initially disabled
    expect(addButton).toBeDisabled();

    // Type valid text
    await user.type(input, 'Valid task');

    // Button should be enabled
    expect(addButton).toBeEnabled();
  });

  it('should re-disable Add Task button if input becomes empty', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    const addButton = screen.getByRole('button', { name: /add task/i });
    
    // Type and clear
    await user.type(input, 'Some text');
    expect(addButton).toBeEnabled();

    await user.clear(input);
    expect(addButton).toBeDisabled();
  });

  it('should not allow saving empty task during edit', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a task first
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Original task');
    await user.keyboard('{Enter}');

    // Start editing
    const taskText = screen.getByText('Original task');
    await user.dblClick(taskText);

    const editInput = screen.getByDisplayValue('Original task');
    
    // Clear the input and try to save
    await user.clear(editInput);
    await user.keyboard('{Enter}');

    // Should show error and revert to original
    expect(screen.getByText(/task description cannot be empty/i)).toBeInTheDocument();
    expect(screen.getByText('Original task')).toBeInTheDocument();
  });

  it('should show visual feedback for empty input state', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    
    // Try to create empty task
    await user.keyboard('{Enter}');

    // Input should have error styling  
    expect(input.className).toMatch(/error/); // CSS modules hash class names
    
    // Type valid text to clear error state
    await user.type(input, 'Valid text');
    expect(input.className).not.toMatch(/error/);
  });

  it('should handle multiple empty task attempts gracefully', async () => {
    const user = userEvent.setup();
    render(<App />);

    screen.getByLabelText(/what needs to be done/i);
    
    // Multiple attempts to create empty tasks
    for (let i = 0; i < 5; i++) {
      await user.keyboard('{Enter}');
    }

    // Should still show error and no tasks created
    expect(screen.getByText(/task description cannot be empty/i)).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('should prevent empty task creation with various whitespace combinations', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    
    const whitespaceVariations = [
      '   ',           // spaces
      '\t\t',         // tabs
      '\n\n',         // newlines
      ' \t \n ',      // mixed whitespace
    ];

    for (const whitespace of whitespaceVariations) {
      await user.clear(input);
      await user.type(input, whitespace);
      await user.keyboard('{Enter}');

      // Should not create task
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      expect(input).toHaveValue('');
    }
  });
});