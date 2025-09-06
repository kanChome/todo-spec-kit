# Data Model Specification

## Core Entities

### Task
Primary entity representing a single to-do item.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| id | string | Yes | UUID v4 format | Unique identifier |
| description | string | Yes | 1-100 characters | Task description text |
| completed | boolean | Yes | true/false | Completion status |
| createdAt | string | Yes | ISO 8601 datetime | Creation timestamp |
| updatedAt | string | Yes | ISO 8601 datetime | Last modification timestamp |

**TypeScript Interface**:
```typescript
interface Task {
  id: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Validation Rules**:
- `id`: Must be unique across all tasks
- `description`: 
  - Minimum 1 character (no empty tasks)
  - Maximum 100 characters
  - Trimmed of leading/trailing whitespace
- `completed`: Boolean only, defaults to false on creation
- `createdAt`: Set once on creation, immutable
- `updatedAt`: Updated on any modification

**State Transitions**:
```
NEW (completed: false) <--> COMPLETED (completed: true)
```

## Storage Schema

### localStorage Key Structure
```
Key: "todo-app-tasks"
Value: JSON string of Task[]
```

**Example Storage**:
```json
{
  "todo-app-tasks": "[{\"id\":\"550e8400-e29b-41d4-a716-446655440000\",\"description\":\"Buy groceries\",\"completed\":false,\"createdAt\":\"2024-01-15T09:30:00Z\",\"updatedAt\":\"2024-01-15T09:30:00Z\"}]"
}
```

## Operations

### Create Task
**Input**: 
- description: string

**Process**:
1. Validate description length (1-100 chars)
2. Generate UUID for id
3. Set completed to false
4. Set createdAt and updatedAt to current ISO timestamp
5. Add to task array
6. Persist to localStorage

**Output**: Created Task object

### Update Task
**Input**:
- id: string
- Partial<Pick<Task, 'description' | 'completed'>>

**Process**:
1. Find task by id
2. Validate new description if provided
3. Update provided fields
4. Update updatedAt timestamp
5. Persist to localStorage

**Output**: Updated Task object

### Delete Task
**Input**:
- id: string

**Process**:
1. Find task index by id
2. Remove from array
3. Persist to localStorage

**Output**: boolean (success)

### List Tasks
**Input**: None

**Process**:
1. Load from localStorage
2. Parse JSON
3. Sort by createdAt descending

**Output**: Task[]

### Toggle Completion
**Input**:
- id: string

**Process**:
1. Find task by id
2. Toggle completed field
3. Update updatedAt timestamp
4. Persist to localStorage

**Output**: Updated Task object

## Data Constraints

### Storage Limits
- localStorage typically has 5-10MB limit
- Each task ~200-300 bytes
- Theoretical max: ~25,000-50,000 tasks
- Practical limit: ~5,000 tasks for performance

### Concurrency
- Single-user, single-tab assumed
- No conflict resolution needed
- Last write wins if multiple tabs open

### Data Migration
Future schema changes handled via version field:
```typescript
interface StorageSchema {
  version: number;
  tasks: Task[];
}
```

## Error Scenarios

### Quota Exceeded
When localStorage is full:
- Show error message
- Suggest deleting completed tasks
- Prevent new task creation

### Corrupted Data
When JSON parse fails:
- Log error
- Show recovery option
- Offer to reset storage

### Invalid Data
When task validation fails:
- Show specific validation error
- Preserve user input
- Highlight invalid field