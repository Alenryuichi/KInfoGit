## Context

The blog page was redesigned from a card-grid layout (powered by `Blog.tsx`, `BlogCard.tsx`, `SearchBox.tsx`, `TagCloud.tsx`) to a year-grouped summary list implemented directly in `pages/blog.tsx`. The old components are no longer imported by any live code. `FilterBar.tsx` was already deleted during the redesign itself.

## Goals / Non-Goals

**Goals:**

- Remove all dead blog components to reduce maintenance surface
- Confirm no live code depends on the deleted components before removal
- Ensure the build passes cleanly after deletion

**Non-Goals:**

- Refactoring any live components
- Changing any blog page behavior or styling
- Introducing new components or abstractions

## Decisions

1. **Verify before delete**: Grep the entire codebase for imports of each component before deleting. A component is safe to delete only if its sole consumers are themselves in the dead chain (`Blog.tsx` → `BlogCard.tsx`, `SearchBox.tsx`, `TagCloud.tsx`).

2. **Delete in one batch**: Remove all 5 files in a single commit rather than one-per-commit, since they form a single dependency cluster. This keeps the git history clean and the change atomic.

3. **Build verification**: Run `npx tsc --noEmit` and `npx next build` after deletion to confirm no breakage. The TypeScript compiler and Next.js build will catch any missed imports.

## Risks / Trade-offs

- **Missed import**: A file outside the dead chain might import `BlogCard` or `SearchBox` → **Mitigation**: Grep verification before deletion + build check after.
- **Future reuse**: Someone might want these components later → **Mitigation**: They remain in git history and can be recovered. Dead code in the tree is worse than recoverable code in history.
