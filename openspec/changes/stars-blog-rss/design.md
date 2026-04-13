## Context

The site is a Next.js 16 Pages Router static site (`output: 'export'`) deployed to GitHub Pages. The Stars & Posts feature displays daily curated content from AI leaders, grouped by date with AI-generated summaries.

Data lives in `profile-data/`:
- `github-stars/YYYY-MM-DD.json` — starred repos per day
- `bluesky-posts/YYYY-MM-DD.json` — Bluesky posts per day
- `daily-summaries/YYYY-MM-DD.json` — AI summary per day

The existing data layer (`website/lib/social-feeds.ts`) reads these files at build time via `getStaticProps` and defines a `FeedItem` discriminated union type. Build-time scripts in `scripts/` fetch data from external sources and store JSON files.

RSS and Atom are standard XML-based syndication formats. Most technical blogs publish one or both. The feeds are publicly accessible via HTTP GET with no authentication.

## Goals / Non-Goals

**Goals:**
- Fetch recent blog posts from 6 AI leader blogs via their public RSS/Atom feeds
- Parse XML without external libraries (regex-based extraction is sufficient for well-known feed formats)
- Store blog post data as daily JSON files following the existing `profile-data/` pattern
- Add `BlogPost` to the `FeedItem` union type so posts appear on `/stars/[date]/` pages
- Display blog posts as cards with title, author, and summary

**Non-Goals:**
- Full article content extraction or readability parsing
- RSS feed autodiscovery (feeds are hardcoded)
- Feed validation or format normalization beyond RSS 2.0 and Atom
- Podcast/enclosure support
- Real-time feed monitoring or webhooks

## Decisions

### 1. Parse XML with regex (no library)

RSS 2.0 and Atom feeds have predictable structures. Simple regex patterns can extract `<title>`, `<link>`, `<pubDate>`/`<published>`, and `<description>`/`<summary>` from `<item>` or `<entry>` elements. This avoids adding a dependency for straightforward XML extraction.

**Alternative considered**: Using `fast-xml-parser` or `rss-parser` library. Rejected because it adds a dependency for a simple extraction task, and the feed formats from these specific blogs are well-known and stable.

### 2. Support both RSS 2.0 and Atom formats

The configured blogs use a mix of RSS 2.0 and Atom formats. The parser detects the format by checking for `<feed>` (Atom) vs `<rss>` (RSS) root elements and extracts fields accordingly:
- RSS 2.0: `<item>` → `<title>`, `<link>`, `<pubDate>`, `<description>`
- Atom: `<entry>` → `<title>`, `<link href="...">`, `<published>`, `<summary>` or `<content>`

### 3. Store as `profile-data/blog-posts/YYYY-MM-DD.json`

Following the existing pattern, blog posts are grouped by published date. Each file has `{ date, posts: BlogPost[] }` structure.

### 4. Standalone build script at `scripts/fetch-blogs.ts`

Following the pattern of `scripts/fetch-bluesky.ts`, the script runs via `npx tsx` and writes directly to `profile-data/blog-posts/`. No API keys needed — just HTTP fetch of public URLs.

### 5. Graceful error handling per feed

If a single feed fails to fetch (network error, 404, malformed XML), the script logs a warning and continues with remaining feeds. This prevents one blog being down from blocking all content.

### 6. Summary extraction

For blog post summaries, the parser extracts from `<description>` (RSS) or `<summary>`/`<content>` (Atom), strips HTML tags, and truncates to ~300 characters. This provides enough context for the card display without storing full article content.

## Risks / Trade-offs

- **[Feed format changes]** Blog authors may change their feed URL or format. → Feeds are from established blogs with stable URLs; the script logs warnings for parse failures.
- **[Feed unavailability]** A blog server may be temporarily down. → Per-feed error handling continues with other feeds; existing cached data remains.
- **[Regex parsing fragility]** Regex-based XML parsing can break on edge cases (CDATA, namespaces, unusual formatting). → The 6 configured feeds are well-known and tested; can switch to a library if issues arise.
- **[Summary quality]** RSS descriptions vary in quality — some are full HTML, some are excerpts, some are empty. → Strip HTML and truncate; empty summaries display fine on cards.
- **[Rate limiting]** Some blogs may rate-limit requests. → The script fetches only 6 URLs, once per workflow run; unlikely to trigger any limits.
