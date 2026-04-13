## ADDED Requirements

### Requirement: Blog RSS fetch script
The system SHALL provide a build script at `scripts/fetch-blogs.ts` that fetches recent posts from configured AI leader blog RSS/Atom feeds and stores them as daily JSON files.

#### Scenario: Successful blog fetch
- **WHEN** the script is executed via `npx tsx scripts/fetch-blogs.ts`
- **THEN** recent posts from all configured blog feeds SHALL be fetched and stored in `profile-data/blog-posts/`

#### Scenario: No API key required
- **WHEN** the script is executed
- **THEN** it SHALL fetch blog feeds using only public HTTP GET requests without any API keys or authentication

### Requirement: Configured blog feeds
The script SHALL track posts from the following AI leader blogs:

#### Scenario: All configured feeds are fetched
- **WHEN** the script runs
- **THEN** it SHALL attempt to fetch posts from these feed URLs:
  - Simon Willison: `https://simonwillison.net/atom/entries/`
  - Sebastian Raschka: `https://magazine.sebastianraschka.com/feed`
  - Lilian Weng: `https://lilianweng.github.io/index.xml`
  - Nathan Lambert: `https://www.interconnects.ai/feed`
  - Chip Huyen: `https://huyenchip.com/feed.xml`
  - Eugene Yan: `https://eugeneyan.com/rss/`

### Requirement: RSS 2.0 and Atom format support
The script SHALL parse both RSS 2.0 and Atom feed formats without external XML parsing libraries.

#### Scenario: RSS 2.0 feed
- **WHEN** a feed contains `<rss>` root element with `<item>` entries
- **THEN** the parser SHALL extract `<title>`, `<link>`, `<pubDate>`, and `<description>` from each `<item>`

#### Scenario: Atom feed
- **WHEN** a feed contains `<feed>` root element with `<entry>` entries
- **THEN** the parser SHALL extract `<title>`, `<link href="...">`, `<published>`, and `<summary>` or `<content>` from each `<entry>`

### Requirement: 7-day rolling window
The script SHALL only retain blog posts published within the last 7 days.

#### Scenario: Post within window
- **WHEN** a blog post was published 5 days ago
- **THEN** it SHALL be included in the output

#### Scenario: Post outside window
- **WHEN** a blog post was published 10 days ago
- **THEN** it SHALL NOT be included in the output

### Requirement: Deduplication by URL
The script SHALL deduplicate blog posts using their URL.

#### Scenario: Duplicate post in existing data
- **WHEN** a fetched post's URL already exists in the daily JSON file
- **THEN** the existing entry SHALL be preserved and the duplicate SHALL NOT be added

#### Scenario: New post not in existing data
- **WHEN** a fetched post's URL does not exist in the daily JSON file
- **THEN** the post SHALL be added to the file

### Requirement: Daily JSON file storage
Blog posts SHALL be stored as `profile-data/blog-posts/YYYY-MM-DD.json` grouped by the post's published date.

#### Scenario: File structure
- **WHEN** posts are saved for date 2026-04-10
- **THEN** a file `profile-data/blog-posts/2026-04-10.json` SHALL be created with structure `{ date: "2026-04-10", posts: BlogPost[] }`

#### Scenario: Merge with existing file
- **WHEN** a daily file already exists with 2 posts and 1 new post is fetched for that date
- **THEN** the file SHALL contain all 3 posts after the script runs

### Requirement: Graceful per-feed error handling
The script SHALL handle individual feed failures without stopping the entire fetch process.

#### Scenario: One feed fails
- **WHEN** one blog feed returns a network error or HTTP error
- **THEN** the script SHALL log a warning and continue fetching remaining feeds

#### Scenario: Malformed XML
- **WHEN** a feed returns invalid or unparseable XML
- **THEN** the script SHALL log a warning and skip that feed

### Requirement: Summary extraction and HTML stripping
The script SHALL extract a clean text summary from each blog post.

#### Scenario: HTML in description
- **WHEN** a feed entry's description contains HTML tags
- **THEN** the HTML tags SHALL be stripped and the text SHALL be truncated to approximately 300 characters

#### Scenario: Empty description
- **WHEN** a feed entry has no description or summary
- **THEN** the summary field SHALL be an empty string

### Requirement: Optional DeepSeek commentary
The script SHALL optionally generate AI commentary (highlights, worthReading) for each blog post using the DeepSeek API.

#### Scenario: DeepSeek API key available
- **WHEN** `DEEPSEEK_API_KEY` is set
- **THEN** each new blog post SHALL have `highlights` and `worthReading` fields populated by DeepSeek

#### Scenario: DeepSeek API key not available
- **WHEN** `DEEPSEEK_API_KEY` is not set
- **THEN** `highlights` and `worthReading` fields SHALL be empty strings

### Requirement: CI workflow integration
The blog fetch step SHALL be added to `.github/workflows/sync-stars.yml`.

#### Scenario: Workflow execution
- **WHEN** the sync-stars workflow runs
- **THEN** the blog fetch step SHALL execute alongside other fetch steps
