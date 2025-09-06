# todo-spec-kit Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-06

## Active Technologies
- TypeScript 5.x / JavaScript ES6+ (001-react-todo)
- React 19.x with Vite build tool (001-react-todo)
- Vitest + React Testing Library (001-react-todo)
- Browser Local Storage for persistence (001-react-todo)

## Project Structure
```
frontend/
├── src/
│   ├── components/    # React components
│   ├── lib/          # Core libraries (task-manager)
│   ├── services/     # Service layer
│   └── pages/        # Page components
└── tests/
    ├── contract/     # API contract tests
    ├── integration/  # Integration tests  
    └── unit/         # Unit tests
```

## Commands
```bash
# Development
npm install           # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests
npm run test:coverage # Check test coverage

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## Code Style
- TypeScript: Strict mode enabled, no any/unknown types
- React: Functional components with hooks only
- CSS: CSS Modules for scoped styling
- Testing: RED-GREEN-Refactor TDD cycle mandatory

## Architecture Principles
- Single data model (Task entity only)
- Direct React state management (no Redux/MobX)
- Every feature as a library (task-manager lib)
- Contract-first development
- Real dependencies in tests (actual localStorage)

## Testing Requirements
- Test order: Contract → Integration → E2E → Unit
- All tests must fail first (RED phase)
- Git commits show tests before implementation
- No mocks for core dependencies

## Data Model
```typescript
interface Task {
  id: string;          // UUID v4
  description: string; // 1-100 characters
  completed: boolean;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}
```

## Recent Changes
- 001-react-todo: Initial React ToDo app setup with TypeScript, Vite, and localStorage

<!-- MANUAL ADDITIONS START -->
<!-- Add any manual project-specific notes here -->
<!-- MANUAL ADDITIONS END -->