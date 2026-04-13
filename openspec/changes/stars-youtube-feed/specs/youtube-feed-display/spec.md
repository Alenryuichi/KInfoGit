## ADDED Requirements

### Requirement: YouTubeVideo type in FeedItem union
The `website/lib/social-feeds.ts` module SHALL define a `YouTubeVideo` interface and include it in the `FeedItem` union type.

#### Scenario: YouTubeVideo type structure
- **WHEN** a YouTube video is represented in the system
- **THEN** it SHALL have the following fields: `type: 'youtube'`, `videoId: string`, `title: string`, `description: string`, `channelTitle: string`, `publishedAt: string`, `thumbnail: string`, `viewCount: number`, `url: string`, `highlights: string`, `worthReading: string`

#### Scenario: FeedItem union includes YouTubeVideo
- **WHEN** the `FeedItem` type is used
- **THEN** it SHALL be `StarredRepo | BlueskyPost | YouTubeVideo`

### Requirement: YouTube video data loader
The `social-feeds.ts` module SHALL provide functions to load YouTube video data from `profile-data/youtube-videos/`.

#### Scenario: Load videos for a date with data
- **WHEN** `profile-data/youtube-videos/2026-04-10.json` exists with 3 videos
- **THEN** the loader SHALL return an array of 3 `YouTubeVideo` items with `type: 'youtube'`

#### Scenario: Load videos for a date without data
- **WHEN** no YouTube videos file exists for a given date
- **THEN** the loader SHALL return an empty array

### Requirement: getFeedByDate includes YouTube videos
The `getFeedByDate` function SHALL merge YouTube videos alongside GitHub stars and Bluesky posts.

#### Scenario: Date with all three sources
- **WHEN** a date has GitHub stars, Bluesky posts, and YouTube videos
- **THEN** `getFeedByDate` SHALL return all items merged in the `items` array

#### Scenario: Date with only YouTube videos
- **WHEN** a date has YouTube videos but no GitHub stars or Bluesky posts
- **THEN** `getFeedByDate` SHALL return a valid `DailyFeed` with only YouTube video items

### Requirement: DailyFeedSummary includes YouTube count
The `DailyFeedSummary` type SHALL include a `youtubeCount` field.

#### Scenario: Summary with YouTube videos
- **WHEN** `getAllFeedDates` is called and a date has 2 YouTube videos
- **THEN** the summary for that date SHALL include `youtubeCount: 2`

### Requirement: YouTubeVideoCard component
The `/stars/[date]/` page SHALL render YouTube videos as video cards.

#### Scenario: Video card display
- **WHEN** a YouTube video is rendered on the page
- **THEN** it SHALL display the video thumbnail, title, channel name, and view count

#### Scenario: Video card links to YouTube
- **WHEN** a user clicks on a video card
- **THEN** it SHALL open the YouTube video URL (`https://www.youtube.com/watch?v={videoId}`) in a new tab

#### Scenario: Video card with AI commentary
- **WHEN** a video has non-empty `highlights` and `worthReading` fields
- **THEN** the card SHALL display the AI-generated highlights and worth reading text
