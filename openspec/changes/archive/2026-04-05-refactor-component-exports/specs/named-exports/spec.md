## ADDED Requirements

### Requirement: Components use named exports
Every React component file in `website/components/` SHALL use named function export syntax (`export function Xxx`). Default exports (`export default`) SHALL NOT be present.

#### Scenario: New component file
- **WHEN** a component file exists in `website/components/`
- **THEN** it MUST contain `export function ComponentName` and MUST NOT contain `export default`

#### Scenario: Existing component converted
- **WHEN** an existing component had `export default function Xxx` or `export default Xxx`
- **THEN** it SHALL be changed to `export function Xxx` with no default export remaining

### Requirement: No 'use client' directive in Pages Router
Component files SHALL NOT contain the `'use client'` directive. This directive is only meaningful in App Router and is a no-op in Pages Router.

#### Scenario: Component with 'use client' removed
- **WHEN** a component file previously contained `'use client'` at the top
- **THEN** the directive SHALL be removed entirely

### Requirement: Import sites use named import syntax
All files importing from `website/components/` SHALL use destructured named import syntax (`import { Xxx } from '...'`), not default import syntax (`import Xxx from '...'`).

#### Scenario: Page importing a component
- **WHEN** a file in `website/pages/` imports a component
- **THEN** it MUST use `import { ComponentName } from '../components/ComponentName'`

#### Scenario: Component importing another component
- **WHEN** a file in `website/components/` imports another component
- **THEN** it MUST use `import { OtherComponent } from './OtherComponent'`

#### Scenario: Test file importing a component
- **WHEN** a test file imports a component under test
- **THEN** it MUST use `import { ComponentName } from './ComponentName'`

### Requirement: Zero runtime behavior change
The refactor SHALL NOT change any runtime behavior, rendering output, or user-facing functionality.

#### Scenario: All tests pass after refactor
- **WHEN** `npm run test` is executed after the refactor
- **THEN** all existing tests SHALL pass without modification to test assertions

#### Scenario: Type check passes after refactor
- **WHEN** `npm run type-check` is executed after the refactor
- **THEN** zero TypeScript errors SHALL be reported
