# Tasks: React ToDo Application

**Input**: Design documents from `/specs/001-react-todo/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app frontend only**: `frontend/src/`, `frontend/tests/`
- Based on plan.md Option 2 structure

## Phase 3.1: Setup
- [ ] T001 Create frontend directory structure per implementation plan
- [ ] T002 Initialize React 19 project with Vite and TypeScript
- [ ] T003 Install core dependencies (React 19, Vite, TypeScript, Vitest, React Testing Library)
- [ ] T004 [P] Configure TypeScript with strict mode in frontend/tsconfig.json
- [ ] T005 [P] Configure ESLint and Prettier in frontend/.eslintrc.json
- [ ] T006 [P] Configure Vitest in frontend/vite.config.ts
- [ ] T007 Create package.json scripts (dev, build, test, lint, type-check)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Local Storage API)
- [ ] T008 [P] Contract test for listTasks in frontend/tests/contract/listTasks.test.ts
- [ ] T009 [P] Contract test for createTask in frontend/tests/contract/createTask.test.ts
- [ ] T010 [P] Contract test for updateTask in frontend/tests/contract/updateTask.test.ts
- [ ] T011 [P] Contract test for deleteTask in frontend/tests/contract/deleteTask.test.ts
- [ ] T012 [P] Contract test for toggleTask in frontend/tests/contract/toggleTask.test.ts

### Integration Tests (User Flows)
- [ ] T013 [P] Integration test for creating first task in frontend/tests/integration/createTask.test.tsx
- [ ] T014 [P] Integration test for marking task complete in frontend/tests/integration/completeTask.test.tsx
- [ ] T015 [P] Integration test for editing task in frontend/tests/integration/editTask.test.tsx
- [ ] T016 [P] Integration test for deleting task in frontend/tests/integration/deleteTask.test.tsx
- [ ] T017 [P] Integration test for character limit validation in frontend/tests/integration/validation.test.tsx
- [ ] T018 [P] Integration test for empty task prevention in frontend/tests/integration/emptyTask.test.tsx
- [ ] T019 [P] Integration test for data persistence in frontend/tests/integration/persistence.test.tsx
- [ ] T020 [P] Integration test for sort order in frontend/tests/integration/sortOrder.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Model & Types
- [ ] T021 [P] Task interface and types in frontend/src/lib/task-manager/types.ts
- [ ] T022 [P] Task validation utilities in frontend/src/lib/task-manager/validation.ts

### Storage Service (task-manager library)
- [ ] T023 [P] localStorage service implementation in frontend/src/lib/task-manager/storage.ts
- [ ] T024 [P] Task CRUD operations in frontend/src/lib/task-manager/tasks.ts
- [ ] T025 [P] Error handling utilities in frontend/src/lib/task-manager/errors.ts
- [ ] T026 [P] Task sorting and filtering in frontend/src/lib/task-manager/utils.ts

### React Components
- [ ] T027 [P] TaskInput component in frontend/src/components/TaskInput/TaskInput.tsx
- [ ] T028 [P] TaskInput styles in frontend/src/components/TaskInput/TaskInput.module.css
- [ ] T029 [P] TaskItem component in frontend/src/components/TaskItem/TaskItem.tsx
- [ ] T030 [P] TaskItem styles in frontend/src/components/TaskItem/TaskItem.module.css
- [ ] T031 [P] TaskList component in frontend/src/components/TaskList/TaskList.tsx
- [ ] T032 [P] TaskList styles in frontend/src/components/TaskList/TaskList.module.css
- [ ] T033 App component (container) in frontend/src/App.tsx
- [ ] T034 App styles in frontend/src/App.module.css
- [ ] T035 Global styles and CSS reset in frontend/src/index.css

### Hooks
- [ ] T036 [P] useTasks custom hook in frontend/src/hooks/useTasks.ts
- [ ] T037 [P] useLocalStorage hook in frontend/src/hooks/useLocalStorage.ts

## Phase 3.4: Integration & Polish

### Component Tests
- [ ] T038 [P] Unit tests for TaskInput in frontend/tests/unit/TaskInput.test.tsx
- [ ] T039 [P] Unit tests for TaskItem in frontend/tests/unit/TaskItem.test.tsx
- [ ] T040 [P] Unit tests for TaskList in frontend/tests/unit/TaskList.test.tsx
- [ ] T041 [P] Unit tests for validation utilities in frontend/tests/unit/validation.test.ts
- [ ] T042 [P] Unit tests for storage service in frontend/tests/unit/storage.test.ts

### E2E Tests
- [ ] T043 E2E test for complete user journey in frontend/tests/e2e/userJourney.test.ts
- [ ] T044 E2E test for error scenarios in frontend/tests/e2e/errorHandling.test.ts

### Performance & Accessibility
- [ ] T045 Add React.memo optimization to TaskItem component
- [ ] T046 Add useMemo for filtered/sorted task lists
- [ ] T047 [P] Add ARIA labels and keyboard navigation
- [ ] T048 [P] Add focus management for task editing
- [ ] T049 [P] Add loading states and error boundaries

### Documentation
- [ ] T050 [P] Create llms.txt for task-manager library
- [ ] T051 [P] Update README.md with setup instructions
- [ ] T052 Run quickstart.md scenarios for validation

## Dependencies
- Setup (T001-T007) must complete first
- All tests (T008-T020) before implementation (T021-T037)
- Data model (T021-T022) before storage service (T023-T026)
- Storage service before React components (T027-T035)
- Components before hooks (T036-T037)
- Core implementation before component tests (T038-T042)
- All implementation before E2E tests (T043-T044)
- Everything before documentation (T050-T052)

## Parallel Execution Examples

### Setup Phase (T004-T006)
```bash
# Can run these configuration tasks simultaneously:
Task: "Configure TypeScript with strict mode in frontend/tsconfig.json"
Task: "Configure ESLint and Prettier in frontend/.eslintrc.json"
Task: "Configure Vitest in frontend/vite.config.ts"
```

### Contract Tests (T008-T012)
```bash
# All contract tests can run in parallel:
Task: "Contract test for listTasks in frontend/tests/contract/listTasks.test.ts"
Task: "Contract test for createTask in frontend/tests/contract/createTask.test.ts"
Task: "Contract test for updateTask in frontend/tests/contract/updateTask.test.ts"
Task: "Contract test for deleteTask in frontend/tests/contract/deleteTask.test.ts"
Task: "Contract test for toggleTask in frontend/tests/contract/toggleTask.test.ts"
```

### Integration Tests (T013-T020)
```bash
# All integration tests can run in parallel:
Task: "Integration test for creating first task"
Task: "Integration test for marking task complete"
Task: "Integration test for editing task"
Task: "Integration test for deleting task"
Task: "Integration test for character limit validation"
Task: "Integration test for empty task prevention"
Task: "Integration test for data persistence"
Task: "Integration test for sort order"
```

### Library Implementation (T021-T026)
```bash
# Task manager library files can be created in parallel:
Task: "Task interface and types in frontend/src/lib/task-manager/types.ts"
Task: "Task validation utilities in frontend/src/lib/task-manager/validation.ts"
Task: "localStorage service implementation in frontend/src/lib/task-manager/storage.ts"
Task: "Task CRUD operations in frontend/src/lib/task-manager/tasks.ts"
Task: "Error handling utilities in frontend/src/lib/task-manager/errors.ts"
Task: "Task sorting and filtering in frontend/src/lib/task-manager/utils.ts"
```

### React Components (T027-T032)
```bash
# Component files and their styles can be created in parallel:
Task: "TaskInput component in frontend/src/components/TaskInput/TaskInput.tsx"
Task: "TaskInput styles in frontend/src/components/TaskInput/TaskInput.module.css"
Task: "TaskItem component in frontend/src/components/TaskItem/TaskItem.tsx"
Task: "TaskItem styles in frontend/src/components/TaskItem/TaskItem.module.css"
Task: "TaskList component in frontend/src/components/TaskList/TaskList.tsx"
Task: "TaskList styles in frontend/src/components/TaskList/TaskList.module.css"
```

## Notes
- [P] tasks = different files, no dependencies
- CRITICAL: Verify tests fail (RED phase) before implementing
- Commit after each task with descriptive messages
- Run `npm test` after implementation to verify GREEN phase
- Avoid: vague tasks, same file conflicts, skipping tests

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T008-T012)
- [x] All entities have model tasks (T021-T022)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD cycle enforced (RED-GREEN-Refactor)