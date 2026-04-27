## 1. Data Layer — Conversion Script

- [x] 1.1 Add `FOCUS_TOPICS` keyword mapping to `scripts/convert-horizon.ts` with 6 topics (memory, self-evolution, multi-agent, planning, reflection, tool-use)
- [x] 1.2 Implement `detectFocusTopics()` function that scans title+summary+tags and returns matched topic IDs
- [x] 1.3 Add `focusTopics` field to `NewsItem` interface in the conversion script
- [x] 1.4 Wire `detectFocusTopics()` into the main parse loop, populate each item's `focusTopics`
- [x] 1.5 Re-run conversion on existing Horizon data and verify JSON output contains `focusTopics`

## 2. Type Definitions — Website Lib

- [x] 2.1 Add `focusTopics?: string[]` to `NewsItem` interface in `website/lib/ai-daily.ts`
- [x] 2.2 Add `focusTopics?: string[]` to `DailyDigestSummary` interface
- [x] 2.3 Update `getAllDailyDates()` to extract and pass through focus topics from each day's JSON

## 3. Detail Page — Filter UI

- [x] 3.1 Compute `allFocusTopics` from digest data in `getStaticProps` of `[date].tsx`
- [x] 3.2 Build `FocusTopicFilter` component: horizontal chip row with "All" default + per-topic chips
- [x] 3.3 Add `useState` for active topic filter, wire into section/item rendering to filter displayed items
- [x] 3.4 Hide empty sections when filter is active and no items match
- [x] 3.5 Add focus topic badges to `NewsItemCard` component (small colored pills below source line)
- [x] 3.6 Conditionally render filter bar only when `allFocusTopics` is non-empty

## 4. List Page — Topic Badges

- [x] 4.1 Pass `focusTopics` through `getStaticProps` in `ai-daily.tsx`
- [x] 4.2 Display focus topic badges next to each date entry in the list

## 5. Verification

- [x] 5.1 Run `npm run type-check` and `npm run lint` — no errors
- [x] 5.2 Run `npm run dev` and verify: filter chips render, clicking filters items, badges display correctly
- [x] 5.3 Verify backward compatibility: old JSON without `focusTopics` renders without filter bar
