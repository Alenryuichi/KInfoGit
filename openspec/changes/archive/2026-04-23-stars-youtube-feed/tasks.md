## 1. YouTube Fetch Script

- [x] 1.1 Create `scripts/fetch-youtube.ts` with channel config (Karpathy, Jeremy Howard, Yannic Kilcher channel IDs) and `YOUTUBE_API_KEY` env var check (exit gracefully if not set)
- [x] 1.2 Implement `fetchUploadsPlaylistId(channelId)` — call `channels.list?part=contentDetails` to get the uploads playlist ID
- [x] 1.3 Implement `fetchPlaylistVideos(playlistId)` — call `playlistItems.list?part=snippet` to get recent videos (filter to last 7 days)
- [x] 1.4 Implement `fetchVideoStats(videoIds)` — call `videos.list?part=statistics` with batched IDs (up to 50) to get view counts
- [x] 1.5 Implement DeepSeek commentary generation for videos (highlights, worthReading) — reuse pattern from `fetch-bluesky.ts`
- [x] 1.6 Implement main logic: fetch all channels → group by publishedAt date → merge with existing daily files → dedup by videoId → write to `profile-data/youtube-videos/YYYY-MM-DD.json`
- [x] 1.7 Verify script runs successfully via `npx tsx scripts/fetch-youtube.ts` with and without API key

## 2. Social Feeds Type & Loader Updates

- [x] 2.1 Add `YouTubeVideo` interface to `website/lib/social-feeds.ts` with fields: type, videoId, title, description, channelTitle, publishedAt, thumbnail, viewCount, url, highlights, worthReading
- [x] 2.2 Update `FeedItem` union type to include `YouTubeVideo`
- [x] 2.3 Add `YOUTUBE_VIDEOS_DIR` constant and `getYouTubeDir()` helper function
- [x] 2.4 Add `loadYouTubeVideos(date)` function to read from `profile-data/youtube-videos/`
- [x] 2.5 Update `getFeedByDate` to merge YouTube videos alongside GitHub stars and Bluesky posts
- [x] 2.6 Update `getAllFeedDates` to scan `profile-data/youtube-videos/` and include `youtubeCount` in `DailyFeedSummary`

## 3. Stars Page Display

- [x] 3.1 Create `YouTubeVideoCard` component in `website/components/stars/YouTubeVideoCard.tsx` — thumbnail, title, channel name, view count, link to YouTube
- [x] 3.2 Add rendering logic in `[date].tsx` to display YouTube videos alongside existing GitHub stars and Bluesky posts
- [x] 3.3 Show AI commentary (highlights, worthReading) on video cards when available

## 4. CI Workflow Integration

- [x] 4.1 Add "Fetch YouTube videos" step to `.github/workflows/sync-stars.yml` running `npx tsx scripts/fetch-youtube.ts` with `YOUTUBE_API_KEY` from secrets

## 5. Verification

- [x] 5.1 Run full build (`just build`) and confirm YouTube videos appear on `/stars/[date]/` pages
- [x] 5.2 Verify the script handles missing API key gracefully (no errors, exit 0)
- [x] 5.3 Verify deduplication works when running the script multiple times
