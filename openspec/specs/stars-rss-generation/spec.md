# stars-rss-generation Specification

## Purpose
TBD - created by archiving change stars-rss-feed. Update Purpose after archive.
## Requirements
### Requirement: RSS feed generation script
The system SHALL provide a build script at `scripts/generate-stars-rss.ts` that generates a valid RSS 2.0 XML feed from daily feed data.

#### Scenario: Successful feed generation
- **WHEN** the script is executed via `npx tsx scripts/generate-stars-rss.ts`
- **THEN** a valid RSS 2.0 XML file is written to `website/public/stars/feed.xml`

#### Scenario: Script reads from all data sources
- **WHEN** daily data exists in `profile-data/github-stars/`, `profile-data/bluesky-posts/`, and `profile-data/daily-summaries/`
- **THEN** the script SHALL read and combine data from all three directories

### Requirement: Feed contains last 30 days of entries
The generated feed SHALL include at most 30 RSS items, covering the 30 most recent days that have feed data.

#### Scenario: More than 30 days of data exist
- **WHEN** feed data exists for 45 days
- **THEN** the feed SHALL contain exactly 30 items representing the 30 most recent days

#### Scenario: Fewer than 30 days of data exist
- **WHEN** feed data exists for only 10 days
- **THEN** the feed SHALL contain exactly 10 items

### Requirement: One RSS item per day
Each RSS `<item>` SHALL represent a single day's aggregated content, not individual repos or posts.

#### Scenario: Day with both GitHub stars and Bluesky posts
- **WHEN** a day has 3 GitHub starred repos and 2 Bluesky posts
- **THEN** one RSS item is generated for that day containing all 5 entries in the description

#### Scenario: Day with only GitHub stars
- **WHEN** a day has GitHub stars but no Bluesky posts
- **THEN** one RSS item is generated for that day containing only the GitHub repos

### Requirement: RSS item structure
Each RSS item SHALL have a title of "Stars & Posts — YYYY-MM-DD", a link to `/stars/YYYY-MM-DD/`, and a description containing the AI daily summary followed by a listing of repos and posts.

#### Scenario: Item title format
- **WHEN** an RSS item is generated for date 2026-04-09
- **THEN** the item title SHALL be "Stars & Posts — 2026-04-09"

#### Scenario: Item link format
- **WHEN** an RSS item is generated for date 2026-04-09
- **THEN** the item link SHALL be `https://kylinmiao.me/stars/2026-04-09/`

#### Scenario: Item description content
- **WHEN** a day has an AI summary and feed items
- **THEN** the description SHALL contain the AI summary text followed by a listing of repos (with name and description) and posts (with author and content excerpt)

#### Scenario: Item pubDate
- **WHEN** an RSS item is generated for a given date
- **THEN** the item SHALL include a `<pubDate>` element in RFC 822 format

### Requirement: Valid RSS 2.0 channel metadata
The feed SHALL include standard RSS 2.0 channel elements.

#### Scenario: Channel metadata
- **WHEN** the feed is generated
- **THEN** the `<channel>` element SHALL include `<title>` ("Stars & Posts — Kylin Miao"), `<link>` (https://kylinmiao.me/stars/), `<description>`, and `<lastBuildDate>`

### Requirement: XML content is properly escaped
All text content included in the RSS feed SHALL be properly XML-escaped.

#### Scenario: Description contains special XML characters
- **WHEN** a repo description contains `&`, `<`, or `>` characters
- **THEN** those characters SHALL be escaped as `&amp;`, `&lt;`, `&gt;` in the XML output

### Requirement: RSS generation in CI workflow
The RSS generation step SHALL be added to `.github/workflows/sync-stars.yml` after the summary generation step and before the git commit step.

#### Scenario: Workflow execution order
- **WHEN** the sync-stars workflow runs
- **THEN** the RSS feed generation step SHALL execute after "Generate daily summaries" and before "Check for changes"

#### Scenario: Feed committed with data
- **WHEN** the workflow detects changes and commits
- **THEN** the generated `feed.xml` SHALL be included in the commit

