## ADDED Requirements

### Requirement: All identified dead components are removed

The following files SHALL be deleted from `website/components/`:
- `Blog.tsx`
- `BlogCard.tsx`
- `BlogCard.test.tsx`
- `SearchBox.tsx`
- `TagCloud.tsx`

#### Scenario: Dead component files no longer exist
- **WHEN** the cleanup change is applied
- **THEN** none of the 5 listed files exist in `website/components/`

### Requirement: Build passes after removal

The project SHALL build successfully with no TypeScript or Next.js errors after the dead components are deleted.

#### Scenario: TypeScript compilation succeeds
- **WHEN** `npx tsc --noEmit` is run after deletion
- **THEN** the command exits with code 0 and no type errors

#### Scenario: Next.js build succeeds
- **WHEN** `npx next build` is run after deletion
- **THEN** the build completes successfully with no errors

### Requirement: No remaining imports of deleted components

After deletion, no file in the codebase SHALL contain an import statement referencing any of the deleted component names.

#### Scenario: Grep finds no stale imports
- **WHEN** the codebase is searched for import references to `Blog`, `BlogCard`, `SearchBox`, or `TagCloud` from the deleted paths
- **THEN** zero matches are found outside of the deleted files themselves
