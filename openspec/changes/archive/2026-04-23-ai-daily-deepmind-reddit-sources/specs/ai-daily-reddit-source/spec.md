## ADDED Requirements

### Requirement: Reddit source module with subreddit allowlist and megathread filtering

The system SHALL provide `scripts/ai-daily/sources/reddit.ts` exporting a `fetchRedditItems(): Promise<RawNewsItem[]>` function that fetches the public `.rss` endpoint for each subreddit in a hardcoded allowlist (`r/LocalLLaMA`, `r/MachineLearning`), parses the Atom response, and returns items published within the last 24 hours as `RawNewsItem` entries with `sourceType: 'rss'` and `sourceName: 'Reddit r/<sub>'`.

#### Scenario: High-signal post passes through

- **WHEN** `r/LocalLLaMA` contains a post titled `Qwen 3.6 27B is out` published 6 hours ago
- **THEN** `fetchRedditItems()` returns an item with that title, a non-empty cleaned summary, `sourceType: 'rss'`, and `sourceName: 'Reddit r/LocalLLaMA'`

#### Scenario: Megathread is filtered

- **WHEN** a Reddit entry's title starts with any of the hardcoded prefixes (`[D] Self-Promotion Thread`, `[D] Monthly Who`, `[D] Simple Questions`, `Best Local LLMs`, `Announcing LocalLlama`, `Megathread`)
- **THEN** the entry is omitted from the returned array, and a filter count is reflected in the per-subreddit log line

#### Scenario: Subreddit outside allowlist is not fetched

- **WHEN** `fetchRedditItems()` is called
- **THEN** it only issues HTTP requests for the subreddits in the hardcoded allowlist; `r/singularity`, `r/artificial`, `r/OpenAI`, and `r/ClaudeAI` are never fetched

#### Scenario: Subreddit fetch fails with network error

- **WHEN** one subreddit's `.rss` endpoint returns a non-2xx status or times out (15s)
- **THEN** that subreddit's items are skipped, a warning is logged, and the other subreddits still return their items (Promise.allSettled semantics)

#### Scenario: Items older than 24 hours are filtered

- **WHEN** a Reddit entry has `<updated>` or `<published>` more than 24 hours before the run's cutoff
- **THEN** that entry is omitted from the returned array

### Requirement: Reddit summary HTML decoding

The module SHALL apply an HTML-entity decoding pass to each Atom `<summary>` (or equivalent) *before* HTML tag stripping, and SHALL remove Reddit-specific artifacts including `<!-- SC_OFF -->` / `<!-- SC_ON -->` content markers and trailing `[link] [comments]` markers.

#### Scenario: Double-encoded summary is decoded

- **WHEN** Reddit returns a summary containing `&lt;!-- SC_OFF --&gt;&lt;div class=&quot;md&quot;&gt;&lt;p&gt;We&amp;#39;re back!&lt;/p&gt;`
- **THEN** the cleaned summary (after decodeEntities + stripHtml + artifact removal) contains the plaintext `We're back!` and nothing else

#### Scenario: Summary length capped at 500 chars

- **WHEN** Reddit returns a summary longer than 500 characters after cleaning
- **THEN** the cleaned summary is truncated to 500 characters and assigned to `RawNewsItem.summary`

### Requirement: Reddit source count in RunRecord metrics

The `RunRecord.sources` schema SHALL include an optional field `reddit?: number` tracking how many Reddit items made it into the digest for a given run. The `/ai-daily/metrics` `SourceStackChart` SHALL include a dedicated color band and legend entry for Reddit, stacked alongside `rss / search / social / horizon / github`.

#### Scenario: Reddit count recorded on a successful run

- **WHEN** the daily pipeline runs and `fetchRedditItems()` returns 12 items
- **THEN** the run record appended to `profile-data/ai-daily/_meta/YYYY-MM.json` contains `sources.reddit: 12`

#### Scenario: Anomaly alert remains scoped to broad sources

- **WHEN** a run reports `sources.reddit: 0` but `sources.rss > 0` and `sources.search > 0`
- **THEN** no anomaly is raised; Reddit is a narrow vertical feed and may legitimately be 0 on a slow day
