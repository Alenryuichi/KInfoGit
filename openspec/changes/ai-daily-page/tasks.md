## 1. Horizon Setup & Configuration

- [x] 1.1 Add Horizon config file at `tools/horizon/config.json` with DeepSeek provider, HN/arXiv/Reddit/RSS sources, score threshold 6.0, 24h window
- [x] 1.2 Add curated RSS feed list (Simon Willison, Lilian Weng, The Batch, etc.)
- [x] 1.3 Test Horizon locally: `uv run horizon` and verify output in `data/summaries/`

## 2. Conversion Script

- [x] 2.1 Create `scripts/convert-horizon.ts` that reads Horizon's Markdown output, parses sections/items, and writes structured JSON to `profile-data/ai-daily/{date}.json`
- [x] 2.2 Implement section categorization logic: map Horizon's output sections to the three fixed categories (Headlines, Research, Engineering)
- [x] 2.3 Extract source metadata (name, score/points) and tags from Horizon's per-item format
- [x] 2.4 Handle edge cases: empty output, malformed Markdown, duplicate dates

## 3. GitHub Actions Workflow

- [x] 3.1 Create `.github/workflows/sync-horizon.yml` with daily cron, Python/uv setup, Horizon run, conversion script, and git commit/push
- [x] 3.2 Add required secrets documentation (DEEPSEEK_API_KEY reused)
- [x] 3.3 Add workflow_dispatch for manual trigger

## 4. Data Loading (website/lib)

- [x] 4.1 Create `website/lib/ai-daily.ts` with functions: `getAllDailyDates()`, `getDailyDigest(date)`, `getLatestDate()` — read from `profile-data/ai-daily/`
- [x] 4.2 Define TypeScript interfaces: `DailyDigest`, `DigestSection`, `NewsItem`, `NewsSource`

## 5. AI Daily Pages

- [x] 5.1 Create `website/pages/ai-daily.tsx` — list page with `getStaticProps`, shows all available dates with item counts
- [x] 5.2 Create `website/pages/ai-daily/[date].tsx` — detail page with `getStaticProps`/`getStaticPaths`, renders one day's digest
- [x] 5.3 Build date navigation component: prev/next arrows + horizontal date selector
- [x] 5.4 Build news item component: bold title link + gray summary + source tags line
- [x] 5.5 Build section component: uppercase header with divider + list of news items
- [x] 5.6 Build footer stats line (item count · source count · score threshold)
- [x] 5.7 Style everything TLDR-style: no cards, no borders on items, pure text with spacing

## 6. Navigation Integration

- [x] 6.1 Add `{ name: 'AI Daily', href: '/ai-daily' }` to `NAV_ITEMS` in `Header.tsx`
- [x] 6.2 Add active state detection for `/ai-daily` paths in the Header's path matching logic

## 7. Seed Data & Verification

- [x] 7.1 Run Horizon with `--hours 72` to generate 2-3 days of seed data
- [x] 7.2 Run conversion script on seed data to populate `profile-data/ai-daily/`
- [x] 7.3 Run `npm run build` and verify AI Daily pages are generated
- [x] 7.4 Run `npm run lint` and `npm run type-check`
- [ ] 7.5 Verify on localhost: list page, detail page, date navigation, all sections render
