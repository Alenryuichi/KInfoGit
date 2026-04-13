## ADDED Requirements

### Requirement: BlueskyPost type includes tags field
The `BlueskyPost` interface in `website/lib/social-feeds.ts` SHALL include a `tags: string[]` field. The `loadBlueskyPosts()` function SHALL default `tags` to `[]` if missing from the JSON data.

#### Scenario: BlueskyPost with tags
- **WHEN** a Bluesky post JSON object includes a `tags` array
- **THEN** the loaded `BlueskyPost` object has `tags` set to that array

#### Scenario: BlueskyPost without tags in legacy data
- **WHEN** a Bluesky post JSON object does not include a `tags` field
- **THEN** the loaded `BlueskyPost` object has `tags` defaulting to `[]`

### Requirement: StarredRepo type includes tags field
The `StarredRepo` interface in `website/lib/social-feeds.ts` SHALL include a `tags: string[]` field. The `loadGitHubStars()` function SHALL default `tags` to `[]` if missing from the JSON data. This is separate from the existing `topics` field (which holds GitHub-assigned repo topics).

#### Scenario: StarredRepo with tags
- **WHEN** a GitHub star JSON object includes a `tags` array
- **THEN** the loaded `StarredRepo` object has `tags` set to that array

#### Scenario: StarredRepo without tags in legacy data
- **WHEN** a GitHub star JSON object does not include a `tags` field
- **THEN** the loaded `StarredRepo` object has `tags` defaulting to `[]`

### Requirement: STAR_TOPIC_META color map constant
A `STAR_TOPIC_META` constant SHALL be defined in `website/pages/stars/[date].tsx` mapping each tag key to a `{ label: string; color: string }` object. The constant SHALL cover all tags in the taxonomy: `agent`, `llm`, `infra`, `rag`, `multi-modal`, `safety`, `fine-tuning`, `evaluation`, `deployment`, `tooling`. Each tag SHALL have a distinct Tailwind color class.

#### Scenario: Known tag has color and label
- **WHEN** rendering a tag badge for a known tag key (e.g., "agent")
- **THEN** the badge uses the label ("Agent") and Tailwind color class from `STAR_TOPIC_META`

#### Scenario: Unknown tag has no entry
- **WHEN** a tag key is not in `STAR_TOPIC_META`
- **THEN** the tag badge is not rendered (same pattern as `FOCUS_TOPIC_META` in ai-daily)

### Requirement: Topic filter bar on stars detail page
The `/stars/[date]/` page SHALL render a topic filter bar when the day's items contain ≥2 distinct tags. The filter bar SHALL include an "All" button and one button per tag present that day. Clicking a tag button filters items to only those containing that tag. Clicking the active tag or "All" resets to showing all items. Filter state SHALL use `useState<string | null>`.

#### Scenario: Filter bar shown with multiple tags
- **WHEN** the day's items contain 2 or more distinct tags
- **THEN** a filter bar renders above the item list with "All" + one button per tag

#### Scenario: Filter bar hidden with few tags
- **WHEN** the day's items contain 0 or 1 distinct tags
- **THEN** no filter bar is rendered

#### Scenario: Clicking a tag filters items
- **WHEN** the user clicks the "Agent" filter button
- **THEN** only items whose `tags` array includes "agent" are displayed

#### Scenario: Clicking active tag resets filter
- **WHEN** the user clicks the currently active tag button
- **THEN** the filter resets to "All" and all items are displayed

#### Scenario: All button resets filter
- **WHEN** the user clicks the "All" button
- **THEN** all items are displayed regardless of tags

### Requirement: Source filter bar on stars detail page
The `/stars/[date]/` page SHALL render a source filter bar with buttons: [All] [GitHub] [Bluesky]. Clicking a source button filters items by `item.type`. Source filter and topic filter SHALL compose (both are applied). Filter state SHALL use `useState<'all' | 'github' | 'bluesky'>`.

#### Scenario: Source filter shown when both sources present
- **WHEN** the day has both GitHub repos and Bluesky posts
- **THEN** a source filter bar renders with "All", "GitHub", and "Bluesky" buttons

#### Scenario: Source filter hidden when single source
- **WHEN** the day has only GitHub repos or only Bluesky posts
- **THEN** no source filter bar is rendered

#### Scenario: Clicking GitHub filters to repos only
- **WHEN** the user clicks "GitHub"
- **THEN** only items with `type === 'github'` are displayed

#### Scenario: Source and topic filters compose
- **WHEN** the user selects "GitHub" source and "Agent" topic
- **THEN** only GitHub repos whose `tags` include "agent" are displayed

### Requirement: Tag badges on item cards
Each `RepoCard` and `BlueskyPostCard` SHALL display the item's `tags` as small colored badge pills using colors from `STAR_TOPIC_META`. Badges render after existing metadata (language, stars count, engagement metrics). Maximum 3 badges displayed per card.

#### Scenario: Repo card shows tag badges
- **WHEN** a StarredRepo has `tags: ["agent", "llm"]`
- **THEN** the RepoCard renders two colored badge pills labeled "Agent" and "LLM"

#### Scenario: Bluesky card shows tag badges
- **WHEN** a BlueskyPost has `tags: ["safety"]`
- **THEN** the BlueskyPostCard renders one colored badge pill labeled "Safety"

#### Scenario: Item with no tags shows no badges
- **WHEN** an item has `tags: []`
- **THEN** no tag badge section is rendered on the card

#### Scenario: Maximum 3 badges per card
- **WHEN** an item has more than 3 tags
- **THEN** only the first 3 tags are rendered as badges

### Requirement: allTags computed in getStaticProps
The `getStaticProps` in `/stars/[date]/` SHALL compute the set of all unique tags across all items for the given day and pass it as an `allTags: string[]` prop (sorted alphabetically). This determines which filter buttons appear.

#### Scenario: Tags collected from all items
- **WHEN** a day has 3 GitHub repos with tags ["agent", "llm"] and 2 Bluesky posts with tags ["safety", "llm"]
- **THEN** `allTags` is `["agent", "llm", "safety"]`

#### Scenario: Empty tags
- **WHEN** no items for the day have any tags
- **THEN** `allTags` is `[]`
