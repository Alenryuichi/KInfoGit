## Context

The Stars feature (`/stars/` and `/stars/[date]/`) displays GitHub starred repos and Bluesky posts from AI leaders, grouped by day. Currently items render as a flat list with no topical organization. The parallel feature AI Daily (`/ai-daily/[date]`) already implements a `FocusTopicFilter` component with a `FOCUS_TOPIC_META` color map — this is the proven pattern to replicate.

Data pipeline: `scripts/fetch-stars.ts` and `scripts/fetch-bluesky.ts` already call DeepSeek for `highlights` + `worthReading` commentary per item. Tags will piggyback on this existing API call.

Types: `StarredRepo` already carries a `topics: string[]` field (sourced from GitHub repo topics). These are GitHub-assigned topics (e.g., "python", "machine-learning") which are too granular and inconsistent for filtering. We need a separate `tags: string[]` field with curated AI-domain labels.

Static site constraint: Pages Router SSG with `output: 'export'` — all filtering must be client-side.

## Goals / Non-Goals

**Goals:**
- Auto-extract 1–3 AI-domain topic tags per item at build time via DeepSeek
- Provide a topic filter bar + source filter bar on `/stars/[date]/`
- Display topic tags as colored badges on each card
- Backfill tags for existing items that lack them (same pattern as commentary backfill)
- Use a predefined, closed taxonomy so filter buttons are stable

**Non-Goals:**
- Cross-date tag aggregation or tag-based search across all dates
- User-editable tags or any runtime API calls
- Changing the `/stars/` index page (filter is detail-page only)
- Modifying the AI Daily feature's existing filter implementation

## Decisions

### D1: Separate `tags` field vs reusing `topics`

**Decision**: Add a new `tags: string[]` field to both `StarredRepo` and `BlueskyPost`.

**Rationale**: `StarredRepo.topics` comes from GitHub's repo topics (e.g., "python", "llm", "ai-agent") — they are user-defined, inconsistent, and too numerous for a filter bar. AI-extracted tags use a closed taxonomy suitable for filtering. BlueskyPost has no topics at all, so a new field is needed regardless.

**Alternative considered**: Map GitHub topics to our taxonomy at render time → rejected because it misses semantic context that DeepSeek can capture from descriptions/content.

### D2: Tag taxonomy

**Decision**: Use a predefined list of ~10 tags, stored as a `STAR_TOPIC_META` constant (analogous to `FOCUS_TOPIC_META`):

| Tag Key | Label | Color |
|---------|-------|-------|
| `agent` | Agent | `bg-violet-500/20 text-violet-300` |
| `llm` | LLM | `bg-blue-500/20 text-blue-300` |
| `infra` | Infra | `bg-amber-500/20 text-amber-300` |
| `rag` | RAG | `bg-emerald-500/20 text-emerald-300` |
| `multi-modal` | Multi-modal | `bg-pink-500/20 text-pink-300` |
| `safety` | Safety | `bg-red-500/20 text-red-300` |
| `fine-tuning` | Fine-tuning | `bg-orange-500/20 text-orange-300` |
| `evaluation` | Evaluation | `bg-cyan-500/20 text-cyan-300` |
| `deployment` | Deployment | `bg-gray-500/20 text-gray-300` |
| `tooling` | Tooling | `bg-teal-500/20 text-teal-300` |

DeepSeek prompt will instruct the model to pick only from this list.

**Rationale**: Closed taxonomy keeps filter buttons stable and colors predictable. ~10 tags is manageable for a single filter row.

### D3: Piggyback tags on existing DeepSeek call

**Decision**: Extend the existing `generateCommentary()` prompt in both fetch scripts to also return a `tags` array. Single API call returns `{ highlights, worthReading, tags }`.

**Rationale**: Avoids doubling API costs. The model already has full context (repo description, language, topics, or post content) to extract tags.

**Alternative considered**: Separate API call for tags → rejected, unnecessary cost and latency.

### D4: Filter state management

**Decision**: Two independent `useState` hooks — `activeTopic: string | null` and `activeSource: 'all' | 'github' | 'bluesky'`. Filter is applied as simple `Array.filter()` over `daily.items` before rendering.

**Rationale**: Matches the pattern in `ai-daily/[date].tsx`. No URL state needed since the filter resets on navigation (acceptable for a daily feed).

### D5: Tag list passed via getStaticProps

**Decision**: Compute `allTags` (the set of all tags present for that day) in `getStaticProps` and pass as a prop. Only tags that have at least one matching item appear as filter buttons.

**Rationale**: Avoids showing empty filter buttons. Same pattern as `allFocusTopics` in ai-daily.

## Risks / Trade-offs

- **[DeepSeek tag quality]** → Mitigate with strict prompt ("pick 1–3 from this exact list, return empty array if none fit") + validate returned tags against the taxonomy, discarding unknowns.
- **[Backfill cost]** → Existing items without tags will need a DeepSeek call on next script run. Mitigate: backfill only items missing `tags` field (same pattern as commentary backfill).
- **[Filter UX on few items]** → Some days may have <5 items, making filters unnecessary. Mitigate: only render filter bar when ≥2 distinct tags exist for the day.
- **[Taxonomy evolution]** → Adding a new tag later is safe (just add to `STAR_TOPIC_META`; old data without it simply won't match). Removing a tag requires data cleanup.
