## ADDED Requirements

### Requirement: YouTube video fetch script
The system SHALL provide a build script at `scripts/fetch-youtube.ts` that fetches recent videos from configured AI leader YouTube channels via YouTube Data API v3 and stores them as daily JSON files.

#### Scenario: Successful video fetch
- **WHEN** the script is executed via `npx tsx scripts/fetch-youtube.ts` with `YOUTUBE_API_KEY` set
- **THEN** recent videos from all configured channels SHALL be fetched and stored in `profile-data/youtube-videos/`

#### Scenario: No API key set
- **WHEN** the script is executed without `YOUTUBE_API_KEY` environment variable
- **THEN** the script SHALL log a message and exit with code 0 without fetching any data

### Requirement: Quota-efficient API usage
The script SHALL use `channels.list` and `playlistItems.list` endpoints (1 quota unit each) instead of `search.list` (100 quota units).

#### Scenario: Two-step fetch per channel
- **WHEN** fetching videos for a channel
- **THEN** the script SHALL first call `channels.list` with `part=contentDetails` to get the uploads playlist ID, then call `playlistItems.list` with `part=snippet` to get recent videos

#### Scenario: Batch view count fetch
- **WHEN** video IDs have been collected from all channels
- **THEN** the script SHALL call `videos.list` with `part=statistics` batching up to 50 video IDs per request to fetch view counts

### Requirement: Configured YouTube channels
The script SHALL track videos from the following AI leader channels:

#### Scenario: All configured channels are fetched
- **WHEN** the script runs
- **THEN** it SHALL attempt to fetch videos from these channel IDs:
  - Andrej Karpathy: `UCNJINJRR_UpocDm5BkndigbQ`
  - Jeremy Howard (fast.ai): `UCX7Y2qWriXpqocG97SFW2OQ`
  - Yannic Kilcher: `UCZHmQk67mN31gbHey6BVyNw`

### Requirement: 7-day rolling window
The script SHALL only retain videos published within the last 7 days.

#### Scenario: Video within window
- **WHEN** a video was published 3 days ago
- **THEN** it SHALL be included in the output

#### Scenario: Video outside window
- **WHEN** a video was published 10 days ago
- **THEN** it SHALL NOT be included in the output

### Requirement: Deduplication by videoId
The script SHALL deduplicate videos using their YouTube videoId.

#### Scenario: Duplicate video in existing data
- **WHEN** a fetched video's videoId already exists in the daily JSON file
- **THEN** the existing entry SHALL be preserved and the duplicate SHALL NOT be added

#### Scenario: New video not in existing data
- **WHEN** a fetched video's videoId does not exist in the daily JSON file
- **THEN** the video SHALL be added to the file

### Requirement: Daily JSON file storage
Videos SHALL be stored as `profile-data/youtube-videos/YYYY-MM-DD.json` grouped by the video's `publishedAt` date.

#### Scenario: File structure
- **WHEN** videos are saved for date 2026-04-10
- **THEN** a file `profile-data/youtube-videos/2026-04-10.json` SHALL be created with structure `{ date: "2026-04-10", videos: YouTubeVideo[] }`

#### Scenario: Merge with existing file
- **WHEN** a daily file already exists with 2 videos and 1 new video is fetched for that date
- **THEN** the file SHALL contain all 3 videos after the script runs

### Requirement: Optional DeepSeek commentary
The script SHALL optionally generate AI commentary (highlights, worthReading) for each video using the DeepSeek API.

#### Scenario: DeepSeek API key available
- **WHEN** `DEEPSEEK_API_KEY` is set
- **THEN** each new video SHALL have `highlights` and `worthReading` fields populated by DeepSeek

#### Scenario: DeepSeek API key not available
- **WHEN** `DEEPSEEK_API_KEY` is not set
- **THEN** `highlights` and `worthReading` fields SHALL be empty strings

### Requirement: CI workflow integration
The YouTube fetch step SHALL be added to `.github/workflows/sync-stars.yml`.

#### Scenario: Workflow execution
- **WHEN** the sync-stars workflow runs
- **THEN** the YouTube fetch step SHALL execute alongside other fetch steps
- **AND** the `YOUTUBE_API_KEY` secret SHALL be passed as an environment variable
