## 1. Verify no live imports

- [x] 1.1 Grep to confirm `Blog.tsx` has no imports outside the dead dependency chain
- [x] 1.2 Grep to confirm `BlogCard.tsx` has no imports outside `Blog.tsx`
- [x] 1.3 Grep to confirm `SearchBox.tsx` has no imports outside `Blog.tsx`
- [x] 1.4 Grep to confirm `TagCloud.tsx` has no imports outside `Blog.tsx`
- [x] 1.5 Check if any test files besides `BlogCard.test.tsx` reference the deleted components

## 2. Delete dead components

- [x] 2.1 Delete `website/components/Blog.tsx`
- [x] 2.2 Delete `website/components/BlogCard.tsx`
- [x] 2.3 Delete `website/components/BlogCard.test.tsx`
- [x] 2.4 Delete `website/components/SearchBox.tsx`
- [x] 2.5 Delete `website/components/TagCloud.tsx`

## 3. Verify build

- [x] 3.1 Run `npx tsc --noEmit` and confirm no type errors
- [x] 3.2 Run `npx next build` and confirm successful build
