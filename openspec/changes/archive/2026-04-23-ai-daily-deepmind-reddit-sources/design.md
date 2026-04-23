## Context

Two new content sources, handled differently:

**DeepMind** is a single RSS feed that fits perfectly into the existing `RSS_FEEDS` array — standard RSS 2.0, clean summaries, standard pubDate, no auth. Adding it is a one-line config change plus a docs comment update. No new code path.

**Reddit** is different enough to warrant its own source file, not because the protocol is different (Reddit `.rss` is just Atom), but because the *content pipeline* needs Reddit-specific pre-filtering that would clutter the generic RSS parser.

## Key Decisions

### 1. DeepMind: minimum viable integration

The existing `sources/rss-feeds.ts` parser already handles:
- Atom `<entry>` and RSS `<item>` blocks via regex
- `<pubDate>` / `<published>` / `<updated>` / `<dc:date>` fallback chain
- CDATA unwrapping
- HTML stripping in summaries
- Mozilla UA injection (for feeds that 403 on curl-like UAs — DeepMind doesn't need this but the code path is there)

Verified via probe (`_probe-feeds.ts`, 2026-04-23):
- URL: `https://deepmind.google/blog/rss.xml`
- Response: 200 OK, 913ms, 100 entries
- First 5 titles: all frontier AI product news, zero noise
- Publication cadence: ~5-7 days between posts

**Decision: single config entry, no new code.** Any future DeepMind-specific tuning (e.g. they start publishing press release noise) can happen later.

### 2. Reddit: separate source module

**Why not shove into RSS_FEEDS:** because Reddit RSS has three Reddit-specific problems that would pollute the generic parser:

a. **Megathread noise.** Every subreddit has ~3 sticky "Self-Promotion Thread" / "Who's Hiring" / "Best Local LLMs Monthly Megathread" posts that show up in the feed every single day and contain zero time-sensitive signal. They need to be filtered by title pattern.

b. **Double HTML encoding in summary.** Reddit's description field is HTML that's already been HTML-entity-encoded *inside* CDATA. So a link like `<a href="...">foo</a>` appears as `&lt;a href=&quot;...&quot;&gt;foo&lt;/a&gt;`. The generic `stripHtml` in rss-feeds.ts only does one pass; Reddit's descriptions need an extra `decodeEntities` *before* stripHtml or they end up mangled.

c. **Noisy boilerplate markers.** Reddit's rendered description has `<!-- SC_OFF -->` / `<!-- SC_ON -->` (Shreddit content markers) and `<table>` wrappers for post meta. Even after stripHtml you get "submitted by /u/alice [link] [comments]" suffix on a lot of them.

Rather than bloat the generic RSS parser with three Reddit-specific branches, isolate them in `sources/reddit.ts`. The extracted items are still emitted as `sourceType: 'rss'` in `RawNewsItem` so downstream scoring / focusTopic tagging / metrics treat them uniformly — we only special-case the *ingest* layer.

### 3. Which subreddits — allowlist, not discovery

Include:
- `r/LocalLLaMA` — model releases, quantization, inference-stack practical discussion (the highest-signal AI subreddit right now)
- `r/MachineLearning` — research/implementation cross-posts + practitioner discussion (`[D]` / `[R]` / `[P]` tags built-in signal)

Skip:
- `r/singularity` — AGI-adjacent speculation, high noise / low news density
- `r/artificial` — general purpose, mostly re-posts of trade press we already get via RSS/Exa
- `r/OpenAI` / `r/ClaudeAI` / `r/Anthropic` — product fan subs, lots of "my chat isn't working" noise

Hardcoded two-entry array in `reddit.ts`. Adding/removing subreddits is a one-line change.

### 4. Megathread title blacklist — prefix-based, not regex

Decision: use **exact-prefix substring matching**, not regex. False-positive risk of a regex on user-submitted titles is too high for the marginal benefit.

```ts
const REDDIT_TITLE_BLACKLIST_PREFIXES = [
  '[D] Self-Promotion Thread',
  '[D] Monthly Who',              // matches "Monthly Who's Hiring" variants
  '[D] Simple Questions',
  'Best Local LLMs',              // monthly megathread in r/LocalLLaMA
  'Announcing LocalLlama',        // pinned discord promo
  'Megathread',                   // generic
]

function isMegathread(title: string): boolean {
  return REDDIT_TITLE_BLACKLIST_PREFIXES.some(p => title.startsWith(p))
}
```

If a new megathread format shows up, add a line. Visible in one file.

### 5. HTML entity decoding before strip

```ts
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}
```

Applied to raw summary, then stripHtml, then strip `<!-- SC_OFF -->` / `<!-- SC_ON -->` comments and the trailing `[link] [comments]` marker. Output is a clean 500-char summary for scoring.

### 6. Time window: 24h same as rss-feeds.ts

`sources/rss-feeds.ts` already enforces a 24h cutoff via `cutoff.setDate(cutoff.getDate() - 1)`. Reddit does the same. No new time-window logic.

### 7. `sourceType: 'rss'` not `'reddit'`

The reason RSS, search, and social are distinct `sourceType` values is so the scoring prompt and downstream sectioning know where the item came from. Reddit is **conceptually RSS** (feed-driven, pubDate ordering) and **content-wise a mix of research/product/discussion**; tagging it as its own type doesn't buy us anything at the scoring layer — the LLM already sees `sources: ['Reddit r/LocalLLaMA']` in the prompt and can use that if it matters.

The only place Reddit needs its own identity is in the `RunRecord.sources.reddit` counter (for the dashboard stack chart), and that's a metrics concern, not a schema concern.

### 8. Metrics integration — extend, don't replace

`RunRecord.sources` currently has optional `rss / search / social / horizon / github`. Add `reddit?: number` next to them. Frontend `SourceStackChart` (`ai-daily/metrics.tsx`) already shows 5 stacked colors — add a 6th (teal or lime) + legend entry. Pattern exactly mirrors the 2026-04-22 github-column addition (which we did as a model to copy).

`findAnomalies()` alert rule for "no RSS or search items" stays untouched — Reddit is a narrow vertical feed like github/horizon, not a broad firehose, so a zero-Reddit day is normal.

## Non-Goals

- **No Anthropic RSS probing automation.** They don't have one. Re-probing every month is manual.
- **No Reddit score threshold.** Reddit RSS doesn't include upvote counts; we'd need the JSON API for that, which requires app auth. Not worth the complexity — the megathread filter + downstream DeepSeek scoring already filters low-signal posts.
- **No Reddit comment scraping.** "Good signal often in comments" is a real pattern but a separate scope (it's a different data model — comments, thread context, score cascades).
- **No subreddit auto-discovery.** The allowlist is manually curated; adding new subreddits is a deliberate editorial decision.
- **No distinct `sourceType: 'reddit'`.** Keep the type union simple. Reddit is feed-driven like RSS, handle it as such at the scoring layer.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Reddit rate limits (429 on frequent fetches) | `Promise.allSettled` on per-subreddit fetch (same as rss-feeds.ts); UA identifies the project. Daily CI cadence (1/day) is well below Reddit's public-RSS limits. |
| Megathread blacklist misses a new format | Visible in one array. Expected to evolve with subreddit conventions. Reviewing the new-source additions during the weekly metrics review catches drift. |
| DeepMind feed goes stale (no posts for 2+ weeks) | This is legitimate publishing cadence, not a bug. Topic Health will keep showing the source in metrics regardless. If they stop entirely, the empty count shows up in the SourceStackChart. |
| Reddit HTML markup breaks summary parser on edge cases | `decodeEntities → stripHtml → strip comments → trim` pipeline is robust to most shapes. Worst case: bad summary string passes through, LLM scoring gives it a low score, it filters out naturally. |
| Duplicate content: a DeepMind post shows up in DeepMind RSS AND Exa's `technologyreview.com` allowlist | URL-canonical dedup in the main pipeline handles this. Not a concern. |

## Alternatives Considered

1. **Fetch Reddit via the JSON API (`/r/X.json`) for upvote scores** — rejected. Requires registering a Reddit app for token. Reddit API changes are frequent. The megathread pattern blacklist + DeepSeek scoring handle the low-quality posts well enough without real-time scores.

2. **Use pushshift.io instead of official RSS** — rejected. Pushshift was unreliable pre-2023 API restrictions, and its status in 2026 is unclear. Official RSS is stable and documented.

3. **Single combined "DeepMind + Reddit" source module** — rejected. They have nothing in common — DeepMind is a single clean feed, Reddit is a filtered aggregation from multiple subs with custom pre-processing. Mixing them hurts readability.

4. **Put Reddit items under `sourceType: 'social'`** — rejected. Social is the Bluesky / X path, which has different fields (author handle, likes, reposts) and scoring logic. Reddit RSS lacks all of those. `sourceType: 'rss'` is the honest fit.
