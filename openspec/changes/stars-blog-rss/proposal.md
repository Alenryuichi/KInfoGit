## Why

The Stars & Posts page aggregates GitHub stars and Bluesky posts, but long-form blog content from AI leaders is a critical knowledge source that's missing. Researchers like Simon Willison, Lilian Weng, and Sebastian Raschka publish in-depth technical articles that often go deeper than social media posts. Adding blog RSS feeds captures this long-form content layer without requiring any API keys — just public HTTP fetches of RSS/Atom XML.

## What Changes

- Add a build-time script (`scripts/fetch-blogs.ts`) that fetches recent posts from AI leader blogs via RSS/Atom feeds
- Parse XML using simple regex or built-in DOMParser — no external RSS library needed
- Blog feeds to track:
  - Simon Willison: `https://simonwillison.net/atom/entries/`
  - Sebastian Raschka: `https://magazine.sebastianraschka.com/feed`
  - Lilian Weng: `https://lilianweng.github.io/index.xml`
  - Nathan Lambert: `https://www.interconnects.ai/feed`
  - Chip Huyen: `https://huyenchip.com/feed.xml`
  - Eugene Yan: `https://eugeneyan.com/rss/`
- Store output as `profile-data/blog-posts/YYYY-MM-DD.json` grouped by published date
- Add new `BlogPost` type to the `FeedItem` union in `website/lib/social-feeds.ts`
- Display blog cards on `/stars/[date]/` pages with title, author, and summary
- Optional DeepSeek commentary (highlights + worthReading)
- Add fetch step to `sync-stars.yml` GitHub Actions workflow
- 7-day rolling window, dedup by URL
- No API key needed — pure HTTP fetch of public RSS

## Capabilities

### New Capabilities
- `blog-feed-fetching`: Build-time script that fetches recent posts from configured AI leader blog RSS/Atom feeds and stores them as daily JSON files
- `blog-feed-display`: Blog post cards rendered on `/stars/[date]/` pages alongside existing GitHub stars, Bluesky posts, and YouTube videos

### Modified Capabilities
<!-- No existing spec-level requirements are changing -->

## Impact

- **New file**: `scripts/fetch-blogs.ts` — standalone build script (uses `tsx`)
- **New directory**: `profile-data/blog-posts/` — daily JSON files
- **Modified**: `website/lib/social-feeds.ts` — add `BlogPost` type to `FeedItem` union, add loader functions
- **Modified**: `website/pages/stars/[date].tsx` — add `BlogPostCard` component
- **Modified**: `.github/workflows/sync-stars.yml` — add blog fetch step
- **Dependencies**: None new (XML parsed with regex/DOMParser, native `fetch` for HTTP)
- **Environment**: No API keys required
