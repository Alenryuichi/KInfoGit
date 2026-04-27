# stars-topic-tagging Specification

## Purpose
TBD - created by archiving change stars-topic-filter. Update Purpose after archive.
## Requirements
### Requirement: DeepSeek extracts topic tags at build time
The fetch scripts (`scripts/fetch-stars.ts` and `scripts/fetch-bluesky.ts`) SHALL extend the existing DeepSeek commentary prompt to also return a `tags` array of 1–3 topic tags per item, selected from the predefined taxonomy: `agent`, `llm`, `infra`, `rag`, `multi-modal`, `safety`, `fine-tuning`, `evaluation`, `deployment`, `tooling`.

#### Scenario: GitHub repo gets topic tags
- **WHEN** `scripts/fetch-stars.ts` calls DeepSeek for a starred repo
- **THEN** the response JSON includes a `tags` array with 1–3 tags from the predefined taxonomy alongside `highlights` and `worthReading`

#### Scenario: Bluesky post gets topic tags
- **WHEN** `scripts/fetch-bluesky.ts` calls DeepSeek for a Bluesky post
- **THEN** the response JSON includes a `tags` array with 1–3 tags from the predefined taxonomy alongside `highlights` and `worthReading`

#### Scenario: Item does not match any taxonomy tag
- **WHEN** DeepSeek determines no predefined tag fits the item
- **THEN** the `tags` array SHALL be empty (`[]`)

### Requirement: Tags are validated against the predefined taxonomy
The fetch scripts SHALL validate DeepSeek-returned tags against the predefined taxonomy and discard any tags not in the list.

#### Scenario: DeepSeek returns an unknown tag
- **WHEN** DeepSeek returns a tag value not present in the predefined taxonomy (e.g., `"transformers"`)
- **THEN** that tag is silently dropped; only valid taxonomy tags are saved

### Requirement: Tags stored in daily JSON output files
The `tags` field SHALL be persisted in each item within the daily JSON files (`profile-data/github-stars/*.json` and `profile-data/bluesky-posts/*.json`).

#### Scenario: Tags written to GitHub stars JSON
- **WHEN** `fetch-stars.ts` writes the daily output file
- **THEN** each star object in the `stars` array includes a `tags: string[]` field

#### Scenario: Tags written to Bluesky posts JSON
- **WHEN** `fetch-bluesky.ts` writes the daily output file
- **THEN** each post object in the `posts` array includes a `tags: string[]` field

### Requirement: Backfill items missing tags
The fetch scripts SHALL detect existing items that lack a `tags` field and call DeepSeek to extract tags for them (same backfill pattern as existing commentary).

#### Scenario: Existing item has no tags field
- **WHEN** the script loads an existing daily JSON file and an item has no `tags` field
- **THEN** the script calls DeepSeek to extract tags for that item and updates the file

### Requirement: BlueskyPost type includes tags field
The `BlueskyPost` interface in `website/lib/social-feeds.ts` SHALL include a `tags: string[]` field.

#### Scenario: BlueskyPost type definition
- **WHEN** a developer inspects the `BlueskyPost` interface
- **THEN** the interface includes `tags: string[]`

### Requirement: StarredRepo type includes tags field
The `StarredRepo` interface in `website/lib/social-feeds.ts` SHALL include a `tags: string[]` field, separate from the existing `topics` field.

#### Scenario: StarredRepo type definition
- **WHEN** a developer inspects the `StarredRepo` interface
- **THEN** the interface includes both `topics: string[]` (GitHub repo topics) and `tags: string[]` (AI-domain tags)

### Requirement: Data loading defaults tags to empty array
The `loadGitHubStars()` and `loadBlueskyPosts()` functions SHALL default `tags` to `[]` when the field is missing from JSON data (backward compatibility).

#### Scenario: Loading a JSON file without tags field
- **WHEN** `loadGitHubStars()` or `loadBlueskyPosts()` reads an item that lacks a `tags` field
- **THEN** the resulting object has `tags: []`

