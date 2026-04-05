## Context

The project has 26 React components in `website/components/`, all using `export default`. Seven also include a `'use client'` directive that is meaningless under Pages Router. The `.claude/rules/components.md` mandates named exports, so every existing component violates the rule. This is a mechanical, zero-risk refactor—no runtime behavior changes.

## Goals / Non-Goals

**Goals:**
- Convert all component exports to named exports (`export function Xxx`)
- Remove all `'use client'` directives
- Update every import site (pages, components, tests) to use `import { Xxx } from '...'`
- Verify with `type-check` and `test` that nothing breaks

**Non-Goals:**
- Refactoring component logic, props, or structure
- Changing any styling or behavior
- Updating third-party library imports
- Modifying `_app.tsx` beyond fixing its component imports

## Decisions

1. **Named export style**: Use `export function Xxx(props: XxxProps)` directly, not `function Xxx() {}; export { Xxx }`. Rationale: more concise, matches the rule in components.md, and is the dominant React community convention for named exports.

2. **Batch by file type, not component**: Process all 26 component files first, then all import sites, then run verification. Rationale: avoids partial states where some imports are broken mid-refactor; type-check only needs to pass once at the end.

3. **Automated verification**: Run `npm run type-check` and `npm run test` as the final gate. TypeScript will catch any missed import site because named imports from a default-only module produce a compile error.

## Risks / Trade-offs

- **[Missed import site]** → TypeScript `type-check` will catch any remaining `import Xxx from '...'` pointing at a module that no longer has a default export. Zero risk of silent failure.
- **[Dynamic imports]** → If any `next/dynamic(() => import(...))` uses default import, it needs special handling. → Check for `dynamic(` usage before starting.
- **[Re-export barrels]** → If any `index.ts` barrel file re-exports components, it needs updating. → Check `website/components/index.ts` existence.
