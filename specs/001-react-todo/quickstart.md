# ToDo App Quick Start Guide

## Prerequisites
- Node.js 18+ and npm installed
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation
```bash
# Clone the repository
git clone [repository-url]
cd todo-app

# Install dependencies
npm install

# Start development server
npm run dev
```

## Quick Test Scenarios

### Scenario 1: Create Your First Task
1. Open the app in your browser (http://localhost:5173)
2. Find the input field labeled "What needs to be done?"
3. Type "Complete project documentation" 
4. Press Enter or click "Add Task"
5. **Expected**: Task appears in the list below with an unchecked checkbox

### Scenario 2: Mark Task as Complete
1. Click the checkbox next to any task
2. **Expected**: Task text gets a strikethrough style and checkbox is checked

### Scenario 3: Edit an Existing Task
1. Double-click on any task description
2. Edit the text to "Updated task description"
3. Press Enter to save
4. **Expected**: Task description updates immediately

### Scenario 4: Delete a Task
1. Hover over any task
2. Click the delete button (X) that appears
3. **Expected**: Task is removed from the list

### Scenario 5: Test Character Limit
1. Try to enter a task with more than 100 characters
2. **Expected**: Input is limited to 100 characters, counter shows remaining

### Scenario 6: Test Empty Task Prevention
1. Try to add a task with empty input
2. Press Enter or click "Add Task"
3. **Expected**: No task is added, error message appears

### Scenario 7: Test Data Persistence
1. Add several tasks
2. Mark some as complete
3. Refresh the browser (F5)
4. **Expected**: All tasks remain with their correct states

### Scenario 8: Test Sort Order
1. Add multiple tasks in sequence:
   - "First task" (wait 1 second)
   - "Second task" (wait 1 second)  
   - "Third task"
2. **Expected**: Tasks appear with "Third task" at the top (newest first)

### Scenario 9: Test Toggle Completion
1. Mark a task as complete (checkbox checked)
2. Click the checkbox again
3. **Expected**: Task returns to incomplete state (no strikethrough)

### Scenario 10: Test Storage Error Handling
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Fill localStorage to near capacity
4. Try to add a new task
5. **Expected**: Error message about storage being full

## Keyboard Shortcuts
- `Enter` - Add new task (when in input field)
- `Escape` - Cancel editing (when editing a task)
- `Tab` - Navigate between elements

## Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

## Building for Production
```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## Verification Checklist
- [ ] App loads without errors
- [ ] Can create new tasks
- [ ] Can mark tasks as complete/incomplete
- [ ] Can edit task descriptions
- [ ] Can delete tasks
- [ ] Tasks persist after page refresh
- [ ] Tasks display in correct order (newest first)
- [ ] Character limit (100) is enforced
- [ ] Empty tasks are prevented
- [ ] Error messages display appropriately

## Troubleshooting

### Tasks not persisting
- Check if localStorage is enabled in your browser
- Clear browser cache and localStorage
- Check browser console for errors

### App not loading
- Ensure Node.js 18+ is installed: `node --version`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if port 5173 is available

### Tests failing
- Ensure all dependencies are installed: `npm install`
- Clear test cache: `npm run test:clear-cache`
- Check that no app instance is running on test port

## Performance Benchmarks
- Initial load: < 1 second
- Task creation: < 100ms
- Task update: < 50ms
- List rendering (100 tasks): < 200ms