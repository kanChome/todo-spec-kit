import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

describe('Integration: Character Limit Validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should enforce 100 character limit on task input', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    const longText = 'a'.repeat(101);

    await user.type(input, longText);

    // Input should be limited to 100 characters
    expect(input).toHaveValue('a'.repeat(100));
  });

  it('should show character counter', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    
    // Initially should show 100 remaining
    expect(screen.getByText('100 characters remaining')).toBeInTheDocument();

    // Type some text
    await user.type(input, 'Hello world');
    expect(screen.getByText('89 characters remaining')).toBeInTheDocument();
  });

  it('should show warning when approaching character limit', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    const nearLimitText = 'a'.repeat(95);

    await user.type(input, nearLimitText);

    // Should show warning color/style when < 10 chars remaining
    const counter = screen.getByText('5 characters remaining');
    expect(counter.className).toMatch(/warning/); // CSS modules hash class names
  });

  it('should show error when at character limit', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    const maxText = 'a'.repeat(100);

    await user.type(input, maxText);

    // Should show error state when at limit
    const counter = screen.getByText('0 characters remaining');
    expect(counter.className).toMatch(/error/); // CSS modules hash class names
  });

  it('should still allow task creation at exactly 100 characters', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    const maxText = 'a'.repeat(100);

    await user.type(input, maxText);
    await user.keyboard('{Enter}');

    // Task should be created successfully
    expect(screen.getByText(maxText)).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('should prevent typing beyond 100 characters', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    const maxText = 'a'.repeat(100);

    await user.type(input, maxText);
    
    // Try to type more
    await user.type(input, 'extra');

    // Should still be exactly 100 characters
    expect(input).toHaveValue('a'.repeat(100));
    expect(screen.getByText('0 characters remaining')).toBeInTheDocument();
  });

  it('should update character counter in real-time during editing', async () => {
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
    
    // Should show character counter during edit
    expect(screen.getByText(/characters remaining/)).toBeInTheDocument();

    // Clear and type new text
    await user.clear(editInput);
    await user.type(editInput, 'Much longer task description that takes more space');

    // Verify counter updates during edit
    const expectedRemaining = 100 - 'Much longer task description that takes more space'.length;
    expect(screen.getByText(`${expectedRemaining} characters remaining`)).toBeInTheDocument();
  });

  it('should validate character limit during edit operations', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a short task
    const input = screen.getByLabelText(/what needs to be done/i);
    await user.type(input, 'Short task');
    await user.keyboard('{Enter}');

    // Edit to exceed limit
    const taskText = screen.getByText('Short task');
    await user.dblClick(taskText);

    const editInput = screen.getByDisplayValue('Short task');
    await user.clear(editInput);
    
    const tooLongText = 'a'.repeat(101);
    await user.type(editInput, tooLongText);

    // Should be limited to 100 characters
    expect(editInput).toHaveValue('a'.repeat(100));
  });

  it('should handle paste operations that exceed character limit', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);
    
    // Simulate pasting text longer than 100 characters
    const longText = 'a'.repeat(150);
    await user.click(input);
    
    // Note: Testing clipboard paste is complex in jsdom
    // This test would need to be adjusted based on actual implementation
    await user.type(input, longText);

    // Should be truncated to 100 characters
    expect(input).toHaveValue('a'.repeat(100));
  });

  it('should show appropriate feedback for different character counts', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/what needs to be done/i);

    // Test different thresholds
    const testCases = [
      { text: 'a'.repeat(50), expected: '50 characters remaining', class: 'normal' },
      { text: 'a'.repeat(90), expected: '10 characters remaining', class: 'caution' },
      { text: 'a'.repeat(95), expected: '5 characters remaining', class: 'warning' },
      { text: 'a'.repeat(100), expected: '0 characters remaining', class: 'error' }
    ];

    for (const testCase of testCases) {
      await user.clear(input);
      await user.type(input, testCase.text);
      
      const counter = screen.getByText(testCase.expected);
      expect(counter).toBeInTheDocument();
      
      // Check that the counter has the appropriate class (CSS modules generate hashed class names)
      if (testCase.class === 'warning') {
        expect(counter.className).toMatch(/warning/);
      } else if (testCase.class === 'error') {
        expect(counter.className).toMatch(/error/);
      } else if (testCase.class === 'caution') {
        expect(counter.className).toMatch(/warning/); // Using warning for caution state
      }
    }
  });
});