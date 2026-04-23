## ADDED Requirements

### Requirement: Scan free-form item tags for unsupervised topic candidates

The system SHALL provide a build-time function `computeTopicDiscovery()` in `website/lib/ai-daily-metrics.ts` that reads all `profile-data/ai-daily/YYYY-MM-DD.json` files within the last 30 days and counts occurrences of every value in `item.tags[]` (the LLM-generated free-form tag array), after `.toLowerCase().trim()` normalization. The function MUST NOT count values from `item.focusTopics[]`.

#### Scenario: Tags from all items across 30 days are counted

- **WHEN** `profile-data/ai-daily/` contains 7 daily files spanning 2026-04-17 → 2026-04-23 and the `mcp` tag appears 6 times across those files
- **THEN** `computeTopicDiscovery()` returns a candidate for `mcp` with `hits7d = 6` (or matching slice) and `hits30d` reflecting the full scan window

#### Scenario: Case normalization

- **WHEN** two items tag the same string as `MCP` and `mcp`
- **THEN** both contribute to a single candidate keyed by `mcp`

### Requirement: Exclude controlled vocabulary and entity tags from discovery

The function SHALL filter out tags that are already in `TOPIC_VOCAB ∪ LEGACY_TOPIC_VOCAB` (so the reader doesn't see anchors they already have), and tags that are in a hardcoded `ENTITY_TAG_BLACKLIST` containing roughly 15 well-known AI-lab, product, and company names (e.g. `openai`, `anthropic`, `claude`, `cursor`, `meta`, `xai`).

#### Scenario: Legacy anchor is skipped

- **WHEN** the tag `multi-agent` (a legacy v1 focusTopic anchor) appears 16 times in `tags[]`
- **THEN** `multi-agent` does NOT appear in any bucket of `computeTopicDiscovery()`'s output

#### Scenario: Entity tag is skipped

- **WHEN** the tag `openai` appears 18 times across the 30-day window
- **THEN** `openai` does NOT appear in any bucket of `computeTopicDiscovery()`'s output

#### Scenario: Very low frequency tag is skipped

- **WHEN** a tag has `hits30d < 3`
- **THEN** that tag is omitted from every bucket (rising / persistent / sporadic)

### Requirement: Classify candidates into rising / persistent / sporadic buckets

The function SHALL classify each surviving candidate using these exact rules (applied in order):

- **rising**: `hits7d >= 5` AND `hits7d >= hits30d * 0.4`
- **persistent**: (not rising) AND `hits30d >= 10` AND `coverage30d >= 0.3`
- **sporadic**: everything else with `hits30d >= 3`

Within each bucket, candidates SHALL be sorted by `hits30d` descending and capped at 10 entries. The return shape is `{ rising: TopicCandidate[], persistent: TopicCandidate[], sporadic: TopicCandidate[] }`.

#### Scenario: Tag hot this week becomes rising

- **WHEN** the tag `mcp` has `hits7d = 6` and `hits30d = 12` (so `6 >= 12 * 0.4 = 4.8`)
- **THEN** `mcp` appears in the `rising` bucket

#### Scenario: Tag steady for a month becomes persistent

- **WHEN** the tag `ai-agents` has `hits7d = 3`, `hits30d = 25`, and `coverage30d = 0.6` (seen on 18 of 30 days)
- **THEN** `ai-agents` appears in the `persistent` bucket (fails rising because `3 < 5`, passes persistent)

#### Scenario: Medium tag that fits neither is sporadic

- **WHEN** the tag `benchmark` has `hits7d = 2` and `hits30d = 5`
- **THEN** `benchmark` appears in the `sporadic` bucket

#### Scenario: Each bucket is capped at 10 entries

- **WHEN** 15 tags satisfy the `persistent` rule
- **THEN** only the top 10 by `hits30d` are returned in `persistent`; the remainder are dropped (not reclassified into sporadic)

### Requirement: Attach up to 3 recent examples per candidate

For each candidate returned by `computeTopicDiscovery()`, the function SHALL attach up to 3 `TopicExample` items (`{ date, title, score }`), newest-first, pulled from the items that contained the tag.

#### Scenario: Three most recent examples are attached

- **WHEN** the `mcp` tag appeared in items on dates 2026-04-17, 2026-04-19, 2026-04-20, 2026-04-22, 2026-04-23
- **THEN** the candidate's `recentExamples` contains the 2026-04-23, 2026-04-22, 2026-04-20 items (in that order), not the older two

### Requirement: Display Topic Discovery panel on /ai-daily/metrics

The page `website/pages/ai-daily/metrics.tsx` SHALL call `computeTopicDiscovery()` in `getStaticProps`, pass the result as a `topicDiscovery` prop, and render a new `<section>` labeled "Topic Discovery (v3)" placed directly after the existing Topic Health section. The section SHALL show three side-by-side buckets on desktop (stacked on mobile), each listing the bucket's candidates with tag name, 7d/14d/30d hit counts, and the first example title.

#### Scenario: Known buckets render

- **WHEN** `computeTopicDiscovery()` returns rising=[mcp, fine-tuning], persistent=[ai-agents, open-source], sporadic=[rag]
- **THEN** the page renders three labeled columns ("Rising", "Persistent", "Sporadic") with the corresponding entries visible in order

#### Scenario: Empty bucket shows a placeholder

- **WHEN** the `rising` bucket is empty (e.g. on a quiet week)
- **THEN** the Rising column renders a neutral placeholder like "No candidates in this tier yet." instead of collapsing the column
