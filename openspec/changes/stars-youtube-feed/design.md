## Context

The site is a Next.js 16 Pages Router static site (`output: 'export'`) deployed to GitHub Pages. The Stars & Posts feature displays daily curated GitHub starred repos and Bluesky posts from AI leaders, grouped by date with AI-generated summaries.

Data lives in `profile-data/`:
- `github-stars/YYYY-MM-DD.json` — starred repos per day
- `bluesky-posts/YYYY-MM-DD.json` — Bluesky posts per day
- `daily-summaries/YYYY-MM-DD.json` — AI summary per day

The existing data layer (`website/lib/social-feeds.ts`) reads these files at build time via `getStaticProps` and defines a `FeedItem = StarredRepo | BlueskyPost` union type. Build-time scripts in `scripts/` fetch data from external APIs and store JSON files.

YouTube Data API v3 has a daily quota of 10,000 units (free tier). The `search.list` endpoint costs 100 units per call, while `channels.list` and `playlistItems.list` cost only 1 unit each. For 3 channels, the efficient approach uses ~7 units per run vs. 300+ with search.

## Goals / Non-Goals

**Goals:**
- Fetch recent videos from 3 AI leader YouTube channels at build time using quota-efficient API calls
- Store video data as daily JSON files following the existing `profile-data/` pattern
- Add `YouTubeVideo` to the `FeedItem` union type so videos appear on `/stars/[date]/` pages
- Display videos as thumbnail cards with title, channel, and view count
- Skip gracefully if `YOUTUBE_API_KEY` is not set

**Non-Goals:**
- Full video embedding or playback within the site
- Comment fetching or subscriber counts
- Transcript extraction or video content analysis
- Channel discovery (channels are hardcoded)
- Real-time quota monitoring

## Decisions

### 1. Two-step API approach: channels.list → playlistItems.list

Each YouTube channel has a hidden "uploads" playlist. We first call `channels.list` with `part=contentDetails` to get the uploads playlist ID, then call `playlistItems.list` to get recent videos. This costs 2 units per channel (6 total for 3 channels) vs. 300 units for `search.list`.

**Alternative considered**: Using `search.list` with `channelId` filter. Rejected because it costs 100 units per call, which would consume 3% of daily quota per run.

### 2. Optional videos.list for view counts

After fetching video IDs from `playlistItems.list`, we optionally call `videos.list` with `part=statistics` to get view counts. This endpoint supports batching up to 50 video IDs per request (1 unit), so all videos can be fetched in a single call.

### 3. Store as `profile-data/youtube-videos/YYYY-MM-DD.json`

Following the existing pattern of `github-stars/` and `bluesky-posts/`, videos are grouped by `publishedAt` date. Each file has `{ date, videos: YouTubeVideo[] }` structure.

### 4. Standalone build script at `scripts/fetch-youtube.ts`

Following the pattern of `scripts/fetch-bluesky.ts`, the script runs via `npx tsx` and writes directly to `profile-data/youtube-videos/`. It handles deduplication by `videoId` and merges with existing data.

### 5. Extend FeedItem union type

Add `YouTubeVideo` with `type: 'youtube'` to the discriminated union in `social-feeds.ts`. The loader reads from `profile-data/youtube-videos/` and the `getFeedByDate` function merges all three sources.

### 6. Graceful skip when no API key

If `YOUTUBE_API_KEY` is not set, the script logs a message and exits with code 0. This allows the CI workflow to run without failing when the key is not configured.

## Risks / Trade-offs

- **[API quota]** Free tier is 10,000 units/day. With 3 channels, each run costs ~7 units. → Even running hourly (168 units/day), this is well within limits.
- **[Stale data]** Videos are only fetched when the workflow runs. → Acceptable for a personal site; daily sync is sufficient.
- **[Channel changes]** If a channel is deleted or renamed, the API will return errors. → The script logs warnings and continues with other channels.
- **[No API key in CI]** New contributors or forks won't have `YOUTUBE_API_KEY`. → The script skips gracefully, and existing cached data remains.
- **[Quota changes]** Google may change quota limits or pricing. → The efficient API approach minimizes risk; can reduce frequency if needed.
