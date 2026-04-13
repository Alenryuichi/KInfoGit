## 1. Data Model & Types

- [x] 1.1 Add `tags: string[]` field to `BlueskyPost` interface in `website/lib/social-feeds.ts`
- [x] 1.2 Add `tags: string[]` field to `StarredRepo` interface in `website/lib/social-feeds.ts`
- [x] 1.3 Update `loadGitHubStars()` to default `tags` to `[]` when missing from JSON
- [x] 1.4 Update `loadBlueskyPosts()` to default `tags` to `[]` when missing from JSON

## 2. Build-time Tag Extraction — fetch-stars.ts

- [x] 2.1 Add `VALID_TAGS` constant with the predefined taxonomy in `scripts/fetch-stars.ts`
- [x] 2.2 Add `tags: string[]` to the `StarredRepo` type in `scripts/fetch-stars.ts`
- [x] 2.3 Extend `generateCommentary()` prompt to also request `tags` (1–3 from taxonomy)
- [x] 2.4 Update `generateCommentary()` return type and parsing to include `tags`, validate against `VALID_TAGS`
- [x] 2.5 Wire `tags` into the star object creation in the main processing loop
- [x] 2.6 Add backfill logic for existing stars missing `tags` (parallel to commentary backfill)

## 3. Build-time Tag Extraction — fetch-bluesky.ts

- [x] 3.1 Add `VALID_TAGS` constant with the predefined taxonomy in `scripts/fetch-bluesky.ts`
- [x] 3.2 Add `tags: string[]` to the `BlueskyPost` type in `scripts/fetch-bluesky.ts`
- [x] 3.3 Extend `generateCommentary()` prompt to also request `tags` (1–3 from taxonomy)
- [x] 3.4 Update `generateCommentary()` return type and parsing to include `tags`, validate against `VALID_TAGS`
- [x] 3.5 Wire `tags` into the post object creation in the main processing loop
- [x] 3.6 Add backfill logic for existing posts missing `tags` (parallel to commentary backfill)

## 4. Stars Detail Page — Filter UI

- [x] 4.1 Add `STAR_TOPIC_META` color map constant in `website/pages/stars/[date].tsx`
- [x] 4.2 Compute `allTags` in `getStaticProps` and pass as prop
- [x] 4.3 Add `allTags: string[]` to `StarsDetailProps` interface
- [x] 4.4 Add `useState<string | null>` for `activeTopic` filter state
- [x] 4.5 Add `useState<'all' | 'github' | 'bluesky'>` for `activeSource` filter state
- [x] 4.6 Create `TopicFilter` component (same pattern as ai-daily's `FocusTopicFilter`) — render only when ≥2 distinct tags
- [x] 4.7 Create `SourceFilter` component — render only when both GitHub and Bluesky items exist
- [x] 4.8 Apply composed filter (topic + source) to `daily.items` before rendering

## 5. Stars Detail Page — Tag Badges

- [x] 5.1 Add tag badge rendering to `RepoCard` — display up to 3 colored badges from `STAR_TOPIC_META`
- [x] 5.2 Add tag badge rendering to `BlueskyPostCard` — display up to 3 colored badges from `STAR_TOPIC_META`

## 6. Verification

- [x] 6.1 Run `npm run type-check` to verify no TypeScript errors
- [x] 6.2 Run `npm run lint` to verify no lint errors
- [x] 6.3 Run `npm run test` to verify existing tests pass
- [x] 6.4 Visually verify filter bar and tag badges on a dev server with sample data
