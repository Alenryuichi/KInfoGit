## 1. Blog RSS Fetch Script

- [x] 1.1 Create `scripts/fetch-blogs.ts` with blog feed config (6 feeds: Simon Willison, Sebastian Raschka, Lilian Weng, Nathan Lambert, Chip Huyen, Eugene Yan) and output dir setup
- [x] 1.2 Implement `fetchFeedXml(url)` — HTTP GET with User-Agent header, return raw XML string, handle errors gracefully per-feed
- [x] 1.3 Implement `parseRssFeed(xml, feedUrl)` — detect RSS 2.0 vs Atom format, extract title/link/pubDate/description from `<item>` or `<entry>` elements using regex
- [x] 1.4 Implement HTML stripping and summary truncation (~300 chars) for description/content fields
- [x] 1.5 Implement DeepSeek commentary generation for blog posts (highlights, worthReading) — reuse pattern from `fetch-bluesky.ts`
- [x] 1.6 Implement main logic: fetch all feeds → filter to last 7 days → group by published date → merge with existing daily files → dedup by URL → write to `profile-data/blog-posts/YYYY-MM-DD.json`
- [ ] 1.7 Verify script runs successfully via `npx tsx scripts/fetch-blogs.ts`

## 2. Social Feeds Type & Loader Updates

- [x] 2.1 Add `BlogPost` interface to `website/lib/social-feeds.ts` with fields: type, title, url, author, publishedAt, summary, highlights, worthReading
- [x] 2.2 Update `FeedItem` union type to include `BlogPost`
- [x] 2.3 Add `BLOG_POSTS_DIR` constant and `getBlogPostsDir()` helper function
- [x] 2.4 Add `loadBlogPosts(date)` function to read from `profile-data/blog-posts/`
- [x] 2.5 Update `getFeedByDate` to merge blog posts alongside other feed item types
- [x] 2.6 Update `getAllFeedDates` to scan `profile-data/blog-posts/` and include `blogCount` in `DailyFeedSummary`

## 3. Stars Page Display

- [x] 3.1 Create `BlogPostCard` component in `website/pages/stars/[date].tsx` (or as a separate component) — title, author, summary, link to original post
- [x] 3.2 Add rendering logic in `[date].tsx` to display blog posts alongside existing content types
- [x] 3.3 Show AI commentary (highlights, worthReading) on blog cards when available

## 4. CI Workflow Integration

- [x] 4.1 Add "Fetch blog posts" step to `.github/workflows/sync-stars.yml` running `npx tsx scripts/fetch-blogs.ts`

## 5. Verification

- [x] 5.1 Run full build (`just build`) and confirm blog posts appear on `/stars/[date]/` pages
- [ ] 5.2 Verify per-feed error handling — script continues when one feed is unreachable
- [ ] 5.3 Verify deduplication works when running the script multiple times
