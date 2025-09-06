# Implementation Plan: React ToDo Application

**Branch**: `001-react-todo` | **Date**: 2025-09-05 | **Spec**: `/specs/001-react-todo/spec.md`
**Input**: Feature specification from `/specs/001-react-todo/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
A single-user ToDo application built with React that allows users to manage daily tasks through a web interface. Users can create, edit, delete, and mark tasks as complete/incomplete. Data persists in browser local storage with a maximum task description length of 100 characters and tasks displayed in descending order by creation date.

## Technical Context
**Language/Version**: TypeScript 5.x / JavaScript ES6+  
**Primary Dependencies**: React 19.x, Vite (build tool)  
**Storage**: Browser Local Storage  
**Testing**: Vitest, React Testing Library  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: web - frontend only (no backend required)  
**Performance Goals**: Instant UI updates (<100ms), smooth interactions  
**Constraints**: 100 character task limit, local storage only, single-user  
**Scale/Scope**: Single page application, ~10-15 components, unlimited tasks (storage permitting)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (frontend only)
- Using framework directly? Yes (React hooks, no wrapper classes)
- Single data model? Yes (Task entity only)
- Avoiding patterns? Yes (direct state management, no Redux/MobX)

**Architecture**:
- EVERY feature as library? Yes (task-manager lib)
- Libraries listed: 
  - task-manager: Core task CRUD operations and local storage
  - ui-components: Reusable React components
- CLI per library: N/A (web application)
- Library docs: llms.txt format planned? Yes

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes
- Git commits show tests before implementation? Yes
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Yes (actual localStorage)
- Integration tests for: new libraries, contract changes, shared schemas? Yes
- FORBIDDEN: Implementation before test, skipping RED phase ✓

**Observability**:
- Structured logging included? Yes (console with context)
- Frontend logs → backend? N/A (no backend)
- Error context sufficient? Yes (operation, data, error type)

**Versioning**:
- Version number assigned? 1.0.0
- BUILD increments on every change? Yes
- Breaking changes handled? Yes (localStorage migration if needed)

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application - frontend only)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract endpoint → contract test task [P]
  - GET /tasks → test list functionality
  - POST /tasks → test create functionality
  - PUT /tasks/{id} → test update functionality
  - DELETE /tasks/{id} → test delete functionality
  - POST /tasks/{id}/toggle → test toggle functionality
- Task entity → model creation task [P]
- localStorage service → storage implementation task
- Each user story → integration test task:
  - Create task flow
  - Complete/incomplete toggle flow
  - Edit task flow
  - Delete task flow
- React components to implement:
  - TaskInput component
  - TaskList component
  - TaskItem component
  - App component (container)
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation
- Layer order:
  1. Contract tests (API layer)
  2. Data model & storage
  3. Service layer
  4. React components
  5. Integration tests
  6. E2E tests
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 30-35 numbered, ordered tasks in tasks.md

**Task Categories**:
1. **Setup Tasks** (1-3 tasks): Project initialization, dependencies
2. **Contract Test Tasks** (5-6 tasks): One per API endpoint
3. **Model Tasks** (2-3 tasks): Task entity, validation
4. **Storage Tasks** (3-4 tasks): localStorage service, error handling
5. **Component Tasks** (8-10 tasks): React components with tests
6. **Integration Tasks** (4-5 tasks): User flow tests
7. **E2E Tasks** (2-3 tasks): Full application tests
8. **Polish Tasks** (3-4 tasks): Error handling, accessibility, performance

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*