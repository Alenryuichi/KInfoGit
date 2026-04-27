## 1. RSS Feed Generation Script

- [x] 1.1 Create `scripts/generate-stars-rss.ts` with XML helper functions (escapeXml, toRFC822Date)
- [x] 1.2 Implement data reading logic: scan `profile-data/github-stars/`, `profile-data/bluesky-posts/`, and `profile-data/daily-summaries/` for available dates
- [x] 1.3 Implement RSS item generation: for each of the last 30 days, build `<item>` with title "Stars & Posts — YYYY-MM-DD", link to `https://kylinmiao.me/stars/YYYY-MM-DD/`, pubDate in RFC 822, and description containing the AI summary + repo/post listing
- [x] 1.4 Implement RSS channel wrapper with `<title>`, `<link>`, `<description>`, `<lastBuildDate>`, and all `<item>` elements
- [x] 1.5 Write the complete RSS XML to `website/public/stars/feed.xml` (ensure `website/public/stars/` directory exists)
- [x] 1.6 Verify script runs successfully via `npx tsx scripts/generate-stars-rss.ts` and produces valid XML

## 2. Stars Page RSS Discovery

- [x] 2.1 Add `<link rel="alternate" type="application/rss+xml" title="Stars & Posts — Kylin Miao" href="/stars/feed.xml" />` to the `<Head>` in `website/pages/stars.tsx`
- [x] 2.2 Add a visible RSS icon (inline SVG) with link to `/stars/feed.xml` in the Stars page header, styled as `text-gray-400 hover:text-orange-400` for consistency

## 3. CI Workflow Integration

- [x] 3.1 Add "Generate RSS feed" step to `.github/workflows/sync-stars.yml` after "Generate daily summaries" and before "Check for changes", running `npx tsx scripts/generate-stars-rss.ts`

## 4. Verification

- [x] 4.1 Run full build (`just build`) and confirm `feed.xml` is present in the static export output
- [x] 4.2 Validate the generated RSS feed is well-formed XML with correct item count and content
