## Why

The Stars & Posts page aggregates GitHub stars and Bluesky posts from AI leaders, but video content — especially from YouTube — is a major knowledge-sharing channel in the AI community. Andrej Karpathy, Jeremy Howard, and Yannic Kilcher regularly publish high-quality educational and analysis videos. Adding YouTube feeds closes this content gap and gives readers a more complete picture of what AI leaders are sharing.

## What Changes

- Add a build-time script (`scripts/fetch-youtube.ts`) that fetches recent videos from AI leader YouTube channels via YouTube Data API v3
- Uses quota-efficient approach: `channels.list` → `playlistItems.list` (1 unit each) instead of `search.list` (100 units)
- Optionally calls `videos.list` to fetch view counts (batch up to 50 IDs per request)
- Store output as `profile-data/youtube-videos/YYYY-MM-DD.json` grouped by video publishedAt date
- Add new `YouTubeVideo` type to the `FeedItem` union in `website/lib/social-feeds.ts`
- Display video cards on `/stars/[date]/` pages with thumbnail, title, channel name, and view count
- Add fetch step to `sync-stars.yml` GitHub Actions workflow
- 7-day rolling window, dedup by videoId
- Requires `YOUTUBE_API_KEY` env var; skips gracefully if not set

## Capabilities

### New Capabilities
- `youtube-feed-fetching`: Build-time script that fetches recent videos from configured AI leader YouTube channels via YouTube Data API v3 and stores them as daily JSON files
- `youtube-feed-display`: YouTube video cards rendered on `/stars/[date]/` pages alongside existing GitHub stars and Bluesky posts

### Modified Capabilities
<!-- No existing spec-level requirements are changing -->

## Impact

- **New file**: `scripts/fetch-youtube.ts` — standalone build script (uses `tsx`)
- **New directory**: `profile-data/youtube-videos/` — daily JSON files
- **Modified**: `website/lib/social-feeds.ts` — add `YouTubeVideo` type to `FeedItem` union, add loader functions
- **Modified**: `website/pages/stars/[date].tsx` — add `YouTubeVideoCard` component
- **Modified**: `.github/workflows/sync-stars.yml` — add YouTube fetch step
- **Dependencies**: None new (uses native `fetch` for YouTube Data API v3)
- **Environment**: Requires `YOUTUBE_API_KEY` (free Google Cloud API key, optional)
