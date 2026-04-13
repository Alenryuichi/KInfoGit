## ADDED Requirements

### Requirement: BlogPost type in FeedItem union
The `website/lib/social-feeds.ts` module SHALL define a `BlogPost` interface and include it in the `FeedItem` union type.

#### Scenario: BlogPost type structure
- **WHEN** a blog post is represented in the system
- **THEN** it SHALL have the following fields: `type: 'blog'`, `title: string`, `url: string`, `author: string`, `publishedAt: string`, `summary: string`, `highlights: string`, `worthReading: string`

#### Scenario: FeedItem union includes BlogPost
- **WHEN** the `FeedItem` type is used
- **THEN** it SHALL include `BlogPost` in the union (e.g., `StarredRepo | BlueskyPost | YouTubeVideo | BlogPost`)

### Requirement: Blog post data loader
The `social-feeds.ts` module SHALL provide functions to load blog post data from `profile-data/blog-posts/`.

#### Scenario: Load posts for a date with data
- **WHEN** `profile-data/blog-posts/2026-04-10.json` exists with 3 posts
- **THEN** the loader SHALL return an array of 3 `BlogPost` items with `type: 'blog'`

#### Scenario: Load posts for a date without data
- **WHEN** no blog posts file exists for a given date
- **THEN** the loader SHALL return an empty array

### Requirement: getFeedByDate includes blog posts
The `getFeedByDate` function SHALL merge blog posts alongside other feed item types.

#### Scenario: Date with all source types
- **WHEN** a date has GitHub stars, Bluesky posts, and blog posts
- **THEN** `getFeedByDate` SHALL return all items merged in the `items` array

#### Scenario: Date with only blog posts
- **WHEN** a date has blog posts but no other content types
- **THEN** `getFeedByDate` SHALL return a valid `DailyFeed` with only blog post items

### Requirement: DailyFeedSummary includes blog count
The `DailyFeedSummary` type SHALL include a `blogCount` field.

#### Scenario: Summary with blog posts
- **WHEN** `getAllFeedDates` is called and a date has 4 blog posts
- **THEN** the summary for that date SHALL include `blogCount: 4`

### Requirement: BlogPostCard component
The `/stars/[date]/` page SHALL render blog posts as cards.

#### Scenario: Blog card display
- **WHEN** a blog post is rendered on the page
- **THEN** it SHALL display the post title, author name, and summary text

#### Scenario: Blog card links to original post
- **WHEN** a user clicks on a blog card
- **THEN** it SHALL open the original blog post URL in a new tab

#### Scenario: Blog card with AI commentary
- **WHEN** a blog post has non-empty `highlights` and `worthReading` fields
- **THEN** the card SHALL display the AI-generated highlights and worth reading text
