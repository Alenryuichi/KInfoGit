## Why

The Stars & Posts page aggregates daily GitHub stars and Bluesky posts with AI summaries, but there's no way for readers to subscribe and get notified of new content. An RSS feed is a lightweight, universal subscription mechanism that requires no backend — ideal for a static site deployed to GitHub Pages.

## What Changes

- Add a build-time script (`scripts/generate-stars-rss.ts`) that reads daily feed data and generates a static RSS 2.0 XML file
- Output the feed to `website/public/stars/feed.xml` so it's included in the static export
- Each RSS item represents one day (last 30 days), with the AI summary and a listing of repos/posts as the description
- Add `<link rel="alternate" type="application/rss+xml">` to the `/stars/` page `<Head>`
- Add an RSS icon/link in the Stars list page header
- Add the RSS generation step to the `sync-stars.yml` GitHub Actions workflow so the feed is regenerated when new content is synced

## Capabilities

### New Capabilities
- `stars-rss-generation`: Build-time script that reads daily feed data from `profile-data/` and generates a static RSS 2.0 XML feed at `website/public/stars/feed.xml`
- `stars-rss-discovery`: RSS autodiscovery `<link>` tag and visible RSS icon/link on the `/stars/` page

### Modified Capabilities
<!-- No existing spec-level requirements are changing -->

## Impact

- **New file**: `scripts/generate-stars-rss.ts` — standalone build script (uses `tsx`)
- **New file**: `website/public/stars/feed.xml` — generated output (gitignored or committed)
- **Modified**: `website/pages/stars.tsx` — add RSS `<link>` in `<Head>` and RSS icon in header
- **Modified**: `.github/workflows/sync-stars.yml` — add RSS generation step after summary generation
- **Dependencies**: None new (XML is generated as a raw string, no RSS library needed)
- **Data sources**: `profile-data/github-stars/`, `profile-data/bluesky-posts/`, `profile-data/daily-summaries/`
