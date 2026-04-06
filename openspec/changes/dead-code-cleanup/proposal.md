## Why

After the blog page redesign (card grid → year-grouped summary list), several components are now orphaned with no live imports. Dead components add cognitive overhead, confuse new contributors, and bloat the bundle (tree-shaking isn't perfect with dynamic imports). Cleaning them up now prevents further drift.

## What Changes

- Delete `components/Blog.tsx` — old blog page component, replaced by `pages/blog.tsx` rewrite
- Delete `components/BlogCard.tsx` — only imported by the now-dead `Blog.tsx`
- Delete `components/SearchBox.tsx` — only imported by the now-dead `Blog.tsx`
- Delete `components/TagCloud.tsx` — only imported by the now-dead `Blog.tsx`
- Delete `components/BlogCard.test.tsx` — tests for the dead `BlogCard` component

## Capabilities

### New Capabilities

- `remove-dead-blog-components`: Verify and remove all orphaned blog components left over from the blog page redesign

### Modified Capabilities

_None — this is a pure cleanup change with no requirement modifications._

## Impact

- **Code**: 5 files deleted in `website/components/`
- **Tests**: `BlogCard.test.tsx` removed (tests dead code)
- **Bundle**: Minor size reduction
- **APIs**: No API changes
- **Dependencies**: No dependency changes
