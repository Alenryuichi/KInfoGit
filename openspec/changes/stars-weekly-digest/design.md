## Context

The site has a Stars feature that aggregates GitHub starred repos and Bluesky posts from AI leaders, stored as daily JSON files (`profile-data/github-stars/YYYY-MM-DD.json`, `profile-data/bluesky-posts/YYYY-MM-DD.json`). A build-time script (`scripts/generate-summaries.ts`) calls DeepSeek to generate per-day summaries stored in `profile-data/daily-summaries/`. The data layer (`website/lib/social-feeds.ts`) loads these at SSG time, and the UI shows a date-list at `/stars/` with detail pages at `/stars/YYYY-MM-DD/`.

The CI workflow (`sync-stars.yml`) runs weekly on Monday UTC 03:00, fetching stars, posts, and generating daily summaries.

Constraints:
- SSG only (Next.js Pages Router, `output: 'export'`) — all data must be resolved at build time
- DeepSeek API for AI generation (existing `DEEPSEEK_API_KEY` secret)
- GitHub Pages deployment — no server-side capabilities

## Goals / Non-Goals

**Goals:**
- Aggregate 7 days of content into a structured weekly digest with trending topics, notable repos, key discussions, and cross-references
- Make weekly digests browsable at `/stars/weekly/YYYY-WXX/` and previewed on `/stars/`
- Integrate into the existing CI workflow with no additional scheduled runs
- Follow the exact same patterns as the daily summary pipeline

**Non-Goals:**
- Email/RSS delivery of weekly digests (future enhancement)
- User-configurable digest frequency or content filtering
- Real-time or ISR-based digest updates
- Changing the daily summary format or behavior

## Decisions

### 1. File naming: `YYYY-WXX.json` (ISO 8601 week)

ISO week numbering is unambiguous and locale-independent. Example: `2026-W15.json` for the week of April 6–12, 2026. The script computes the ISO week from the current date.

**Alternative considered**: Date-range naming (`2026-04-06_2026-04-12.json`) — rejected because it's harder to parse and doesn't match any standard.

### 2. Digest JSON structure

```typescript
interface WeeklyDigest {
  week: string             // "2026-W15"
  startDate: string        // "2026-04-06"
  endDate: string          // "2026-04-12"
  summary: string          // Overall narrative (3-5 paragraphs)
  trendingTopics: Array<{ topic: string; description: string }>
  notableRepos: Array<{ repo: string; url: string; stars: number; description: string; starredBy: string[] }>
  keyDiscussions: Array<{ title: string; summary: string; author: string }>
  crossReferences: Array<{ repo: string; starredBy: string[]; url: string }>
  stats: {
    totalRepos: number
    totalPosts: number
    uniqueAuthors: number
    daysWithContent: number
  }
}
```

This is richer than the daily summary's simple `{ date, summary }` because the weekly digest needs structured sections for UI rendering. DeepSeek returns JSON that the script validates and augments with computed stats.

**Alternative considered**: Flat text summary like daily — rejected because the UI needs structured sections (trending topics list, cross-reference table).

### 3. Script follows `generate-summaries.ts` pattern exactly

Same file structure: config constants → types → helpers → DeepSeek call → main loop. Reuses the same `loadDayContent()` approach but across 7 days. Skips existing digests (idempotent).

### 4. Data layer extension in `social-feeds.ts`

Add `getWeeklyDigests()` and `getWeeklyDigestByWeek(week)` functions following the exact same pattern as `getAllFeedDates()` / `getFeedByDate()`. Directory resolution uses the same `getXDir()` helper pattern.

### 5. Collapsible card on `/stars/` — client-side toggle via `useState`

The "This Week" card appears above the date list with a summary preview. Clicking expands to show trending topics and cross-references. Uses React state for expand/collapse — no JavaScript required for the initial collapsed view.

### 6. Detail page at `/stars/weekly/[week].tsx`

Uses `getStaticPaths` to enumerate all digest files and `getStaticProps` to load the specific digest. Same layout pattern as `stars/[date].tsx`.

### 7. CI integration: add one step after "Generate daily summaries"

The weekly digest step runs after daily summaries because it reads them. It only generates a digest for the current ISO week if one doesn't exist yet. Since the workflow already runs weekly on Monday, this naturally produces one digest per week.

## Risks / Trade-offs

- **[DeepSeek JSON output reliability]** → The script validates the response structure and falls back to a minimal digest with just the narrative summary if structured fields fail to parse. The prompt uses JSON mode with a schema example.
- **[Week boundary edge cases]** → ISO week numbering can cross year boundaries (e.g., Dec 29 may be W01 of next year). Mitigated by using a well-tested ISO week calculation, not manual date math.
- **[Empty weeks]** → If no content exists for a week, no digest is generated. The UI handles missing digests gracefully by not showing the card.
- **[Prompt token limits]** → 7 days of content could be large. The script truncates to ~4000 tokens of input by summarizing each day to key items, prioritizing repos with highest star counts and posts with highest engagement.
