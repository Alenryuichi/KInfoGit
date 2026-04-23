## Context

This is the third cross-board integration in the profile site:
- 2026-04-17: **AI Daily → Code** (`scripts/code-weekly/sources/ai-daily-ingest.ts` — `coding-agents` items feed Code 周报 Ecosystem Card)
- 2026-04-23: **AI Daily P2 expansion** (DeepMind RSS + Reddit subs)
- **This change**: **Stars → AI Daily** (co-starred repos feed daily digest)

The `ai-daily-ingest.ts` pattern is the reference — **scripts/ pipeline reads raw profile-data JSON from another board**, does minimal transformation, emits items in the *consumer board's* raw-item format. No cross-imports between website/lib and scripts/. Keeps the two boards loosely coupled (one can fail without breaking the other).

## Key Decisions

### 1. minCount=2, not the ROADMAP-proposed ≥3

Per data audit in proposal.md: full 60-day dataset has **zero** count≥3 repos. ROADMAP wrote ≥3 as aspiration, not observation. `computeCoStarredRepos` default is 2; Stars board itself uses 2 for `/stars/[date]` Co-Starred cards.

At count=2 with 30d window we get 2 stable candidates (`huggingface/ml-intern`, `mattmireles/gemma-tuner-multimodal`) — both genuinely high-signal (scores 7-8, >500 stars, research-lab adjacent). This is the honest threshold for the current data density.

### 2. Window: 30 days, not 7

7d window currently yields 1 repo (and some days 0). 30d yields 2 stable candidates — enough to be worth it, not enough to flood the pipeline. 60d gives no extra (dataset doesn't extend that far with useful co-star clusters).

If future star pipeline tracks 20+ AI leaders instead of the current handful, 30d may produce too many — `coStarred` source caps at 10 output items as a guard.

### 3. Read profile-data/github-stars directly, don't import from website/lib

Exact mirror of the 2026-04-17 decision for `ai-daily-ingest.ts`:

> scripts/ pipeline code cannot import from website/lib/*. The two environments have different TypeScript paths, different build configs, and deliberately different lifecycles. When one board consumes another's data, it reads the on-disk JSON directly and re-implements the minimal subset of logic needed.

`computeCoStarredRepos` in `website/lib/social-feeds.ts` is 85 lines of aggregation logic. Our needs are smaller (count≥2 filter, emit RawNewsItem, no example extraction, no tag aggregation) so we re-implement ~40 lines of essentials in the new module.

### 4. RawNewsItem shape, not a new union member

`RawNewsItem.sourceType` is `'rss' | 'search' | 'social' | 'horizon' | 'github'`. Options:

- Add `'co-starred'` → type union bloat for marginal value
- Use `'github'` → confusing because `fetchGithubTrendingItems` already owns that label; readers would think the item came from GitHub trending
- Use `'rss'` → conceptually feed-driven (yes, we're pulling from a stored feed of starred events), matches the pattern we set for Reddit (`sourceType: 'rss'` on 2026-04-23)

**Decision: 'rss'** with `sourceName: 'Co-Starred'`. The distinct source identity is preserved in the metrics `coStarred` counter (for dashboard color band) and in the `sourceName` shown to DeepSeek during scoring.

### 5. Synthetic summary — embed the "2 leaders" signal as prompt-visible text

DeepSeek scoring treats RawNewsItem like any other item. The **only way** for it to learn "this was co-starred by multiple leaders" is via the summary text. We construct:

```ts
summary = `Starred by ${count} leaders (${handles.slice(0, 3).join(', ')}): ${description}`
```

This:
- Puts the social proof signal *first* in the 500-char summary so it's never truncated away
- Names the leaders so the model can weight known authoritative handles (simonw, karpathy, etc.)
- Falls back to repo description so the topical content is preserved for focusTopic classification

The summary pattern is similar to how `ai-daily-ingest.ts` emits EcosystemItem — synthesizing human-readable context rather than blind passthrough.

### 6. No scoring prompt change

The AI Daily scoring rubric is already good at recognizing multi-leader endorsement signals — it's trained on "notable" and "worthReading" notions. Adding co-star-specific instructions would be scope creep. Observe one week of runs; if the model consistently underscoresores these, revisit.

### 7. Cap output at 10 items

Current data: 2 items. Room to grow. If Stars pipeline eventually tracks many more leaders, daily output could balloon. `.slice(0, 10)` after sort keeps the pipeline bounded and predictable.

### 8. publishedAt = latestDate

A co-starred repo aggregates stars from multiple days. For AI Daily's 24h-bias scoring, we use `latestDate` (most recent star event) — the signal is "this was *still being starred* as of this date", so latest-date is the right freshness cue.

### 9. URL canonical dedup is existing infrastructure

`fetch-ai-daily.ts` already has `deduplicateByUrl` that strips trailing slashes, query params, etc. If the same repo appears in both `fetchGithubTrendingItems()` (from GitHub trending API) and `fetchCoStarredItems()` (from starred-by leaders), URL dedup will collapse them. Source order matters for which keeps:

```
rss → search → social → horizon → github → reddit → coStarred  (our slot)
```

Co-starred last, so if a repo is both on GitHub trending AND co-starred, the trending item wins (which is fine — it was there first and had its own metadata). Co-starred only adds *new* repos that trending missed — exactly the intended value.

### 10. Source ordering principle

Add co-starred *after* social but *before* horizon:

```
rss, search, social, horizon, github, reddit, coStarred
```

Rationale:
- `rss`/`search`/`social` are firehoses (dozens of items)
- `horizon`/`github`/`reddit` are narrow feeds (single-digit items each)
- `coStarred` is narrowest (0-2 items/day currently)

Narrowest last — doesn't interfere with dedup behavior of the big sources.

## Non-Goals

- **No LLM-generated summary**. The synthetic summary is formulaic. If an item makes it through scoring and into the final digest, DeepSeek's `oneLiner` generation will produce a Chinese one-liner naturally.
- **No Stars-side changes**. We don't modify how stars are collected, scored, or stored. Pure downstream consumer.
- **No minCount tuning knob**. Hardcoded to 2 for now; revisit if data density changes substantively.
- **No per-day entry**. We emit one RawNewsItem per unique repo (not one per star event). Multiple stars of the same repo accumulate into the single item's "Starred by N leaders" count.
- **No "reverse flow" — AI Daily items feeding Stars**. That's a different relationship; Stars is person-centric and AI Daily is event-centric.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| URL variations cause dedup miss (e.g. `github.com/X/Y` vs `github.com/X/Y/tree/main`) | Accept. Probability very low; main pipeline handles trailing slashes already. |
| Stars board adds 20+ leaders, co-star output balloons | `.slice(0, 10)` cap. Revisit thresholds when Stars board grows. |
| DeepSeek scoring ignores the "Starred by N leaders" phrasing | Observe first week. Can always tweak the summary template or add a scoring hint. |
| A repo gets co-star signal for >30 days and keeps reappearing daily | Intentional — if a repo is still being starred 30 days later, it's still a real signal. De-dup by URL prevents duplicate cards in a single day's digest. |

## Alternatives Considered

1. **Call `computeCoStarredRepos` via inter-package import** — rejected. scripts/ and website/ are separate TypeScript environments; cross-imports break the layering. Re-implement the minimal subset instead (mirrors `ai-daily-ingest.ts` decision).

2. **Add to the existing Co-Starred card flow (inject into `/ai-daily/[date]` via static props)** — rejected. AI Daily is event-centric with DeepSeek scoring/sectioning; bolting on a separate "Co-Starred" card would bypass all the scoring and tagging. Joining as RawNewsItem lets the model integrate the signal naturally.

3. **Score-threshold filter on co-starred items** — considered, rejected for v1. Every co-star repo passes unchanged into the pipeline; DeepSeek's own scoring will filter out junk (`aiRelevant: false`). If noise becomes an issue we can add a `score >= 5` prefilter, but current data suggests all co-starred items are already high-signal.

4. **Include "second star date delta" (how much time between independent stars)** — interesting signal (rapid stars = hype wave) but adds complexity without obvious consumer. Not worth it for v1.
