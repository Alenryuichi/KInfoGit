## Context

Topic Discovery v3 is the reverse direction of the existing Topic Health dashboard. Topic Health asks *"are our controlled-vocabulary anchors still firing?"*; Discovery asks *"which free-form tags are rising up past the controlled vocabulary's coverage?"*.

Both run at build time off the same `profile-data/ai-daily/YYYY-MM-DD.json` files. The reusable parts are the date-key window helper (`recentDateKeys`), the per-day JSON parser, and the example-collection pattern (up to 3, newest-first). The new parts are the **tag frequency counting, the entity blacklist, and the classification rules**.

## Key Decisions

### 1. Scan `tags[]` not `focusTopics[]`

`focusTopics` is already the controlled vocabulary — Topic Health covers it. `tags` is the LLM-generated free-form annotation, which is where new language emerges. Two important edge cases observed in data (7d window, 2026-04-17 → 04-23):

- `tags` sometimes contains values that ARE in the focus vocabulary (e.g. `multi-agent` appeared 16 times as a tag in 7d, independent of its focusTopic usage). We filter those out against the union of `TOPIC_VOCAB ∪ LEGACY_TOPIC_VOCAB`.
- Free tags are lowercase-dashed by the LLM prompt conventions (e.g. `ai-coding`, `open-source`). We normalize with `.toLowerCase().trim()` and do exact dedup.

### 2. Entity tag blacklist — hardcoded, ~15 entries

The biggest false-positive risk: the LLM tags many items with company/product names (`openai`, `cursor`, `claude`, `anthropic`, `google`, `meta`, `xai`, `spacex`, `deepmind`). Those have **no business being focusTopics** — focusTopics are supposed to anchor *themes* like "coding-agents" or "tool-use", not entities. A company shipping a feature is *caused* by a theme, not a theme itself.

We hardcode a blacklist in `ai-daily-metrics.ts`:

```ts
const ENTITY_TAG_BLACKLIST = new Set([
  // AI labs / model orgs
  'openai', 'anthropic', 'google', 'deepmind', 'meta',
  'microsoft', 'xai', 'mistral', 'cohere', 'databricks',
  // products / tools (nouns, not themes)
  'claude', 'chatgpt', 'gemini', 'grok', 'cursor',
  'copilot', 'claude-code', 'windsurf', 'aider',
  // orgs / non-AI companies that appear a lot but aren't topics
  'spacex', 'nvidia', 'apple', 'amazon',
])
```

**Why hardcoded, not data-driven**: A data-driven "detect entity tags" heuristic (e.g. "tags that overlap with a list of known companies") adds complexity for marginal gain. The blacklist is small, visible in one file, easy to extend when a new company blows up. If it grows past ~30 entries we can factor it out, but not before.

**Why not exclude by length or regex**: Company names like `openai` / `xai` are short; `post-training` / `tool-use` are the same shape. No structural signal separates them.

### 3. Classification rules — rising / persistent / sporadic

Three buckets, NOT the same four as Topic Health (healthy/watch/stale/dead), because we're answering a different question:

- **rising**: `hits7d >= 5` AND `hits7d >= hits30d * 0.4` — heavy in the recent week, so the topic is *accelerating*. These are the strongest candidates to review for promotion.
- **persistent**: `hits30d >= 10` AND `coverage30d >= 0.3` (showed up on at least 9 distinct days) — a tag that's been around for weeks without being a one-day-burst artifact of a single big event. Strong signal that it's a real theme.
- **sporadic**: anything with `hits30d >= 3` that isn't rising or persistent. Shown so the reader can spot "almost there" candidates.

Tags with `hits30d < 3` are dropped entirely — the dashboard isn't a frequency browser, it's a promotion candidate panel.

**Why thresholds not percentiles**: Percentile-based thresholds (e.g. "top 20%") would shift with total tag volume, making the numbers non-comparable week-over-week. Fixed integer thresholds (5, 10, 3) are easier to reason about as the dataset grows.

### 4. Limit shown candidates per bucket

**Top 10 rising / top 10 persistent / top 10 sporadic** — after classification, sort by `hits30d` DESC and cap. The tail is usually long (7d window: 731 unique tags total) and the long tail is noise.

### 5. Examples: reuse Topic Health's pattern

Up to 3 examples per candidate tag, newest-first, format `{ date, title, score }`. Reuse the `TopicExample` type already exported from `ai-daily-metrics.ts`. Don't invent a new example shape.

### 6. No state persistence

Unlike the benchmarks alert state file, Topic Discovery doesn't need to remember "was this tag rising last week too?". The 7/14/30 column already encodes acceleration (a true rising tag has high 7d relative to 30d). Adding week-over-week diff would require writing a per-run snapshot file and reading the prior one; not worth it for a human-facing promotion panel.

### 7. Page placement: below Topic Health, not beside it

Topic Health is wider (shows all 12 anchors + legacy) and denser (bars + bars + 7/14/30 columns + examples). Putting Discovery beside it cramps both. Stacked below with clear section heading is simpler and keeps the reading order top-down: *first verify existing anchors are firing, then look at what might need to be promoted*.

### 8. Presentation: three side-by-side compact tables, not one merged table

Each classification bucket has different meaning and different "next action" context, so three distinct tables with their own section heading read better than one table with a "classification" column. Compact row format (one line per candidate):

```
[rising]    mcp                 7  /  12  /  18   "Model Context Protocol is…"
[rising]    fine-tuning         5  /   9  /  13   "OpenAI fine-tunes o4…"
[rising]    multimodal-ai       4  /   7  /  11   "Gemini 3 adds video…"
```

Desktop (md+): 3 columns side-by-side. Mobile: stack vertically.

## Non-Goals

- **No automatic vocabulary update.** Promotion remains a manual edit to `scripts/ai-daily/config.ts` FOCUS_TOPICS. The panel tells you *what* to consider; you decide.
- **No embedding-based tag clustering** ("image-generation" + "multimodal-ai" + "visual-generation" are semantically adjacent — should they be one topic?). That's a different, bigger project. Current scope is exact-match frequency counting only.
- **No historical promotion log.** "When did `coding-agents` enter the vocabulary?" is answerable via git log of `config.ts` — we don't duplicate that into a TOML log.
- **No threshold auto-tuning.** The 5/10/3 thresholds are fixed; if data volume grows 3x in six months we'll revisit them manually.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| LLM tags are noisy (typos, synonyms, pluralization) | Accept the noise. Exact-match counting catches the important signals; a tag that matters will appear >5 times even with 20% variation. |
| Blacklist misses a new major company | Obvious after one month of usage ("why is `meta` showing up as rising?"). Add to blacklist, zero downtime. |
| `recentDateKeys` time zone boundary differs from ingest pipeline | Use `Asia/Shanghai` to match the existing `recentDateKeys` helper in Topic Health. No change needed. |
| Page build perf — 30 files × ~60 items × tags scan | Trivial: the loop is already running for Topic Health. Adding one more counter is O(1) extra per item. |

## Alternatives Considered

1. **Dedicated page `/ai-daily/topics` separate from `/metrics`** — rejected. Topic Health and Topic Discovery are two views of the same question ("are our anchors the right ones?"). Keeping them on one page means one URL to bookmark for the weekly review.

2. **Inline Topic Discovery into Weekly Digest banner** — rejected. Weekly Digest is reader-facing (the consumer of the digest). Topic Discovery is editor-facing (the producer who decides the vocabulary). Different audiences → different surfaces.

3. **Automate promotion via PR** — rejected as first version. Would require: (a) threshold for auto-promotion, (b) PR body generation, (c) review flow that doesn't block CI. All solvable but premature — we haven't even used the manual flow to promote one topic yet. Ship the read-only version first, see if the signal is good, add write path later if decisions are lining up with what the panel suggests.
