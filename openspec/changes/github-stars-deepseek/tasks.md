## 1. Data Layer

- [x] 1.1 Create `profile-data/github-stars/` directory
- [x] 1.2 Create `website/lib/github-stars.ts` with types (`StarredRepo`, `DailyStars`) and functions (`getAllStarDates`, `getStarsByDate`, `getAdjacentDates`), following `lib/ai-daily.ts` pattern

## 2. Build Script

- [x] 2.1 Create `scripts/fetch-stars.ts` — GitHub API fetch for configured users (`Alenryuichi`, `karpathy`, `yironghuang`), group by `starred_at` date, write JSON to `profile-data/github-stars/`
- [x] 2.2 Add DeepSeek API integration in `scripts/fetch-stars.ts` — call chat completions for each repo to generate `highlights` and `worthReading`, skip if no `DEEPSEEK_API_KEY`
- [x] 2.3 Add `fetch-stars` command to `scripts/content.just`

## 3. Pages

- [x] 3.1 Create `website/pages/stars.tsx` — list page showing all dates with star counts, using `getStaticProps` + `getAllStarDates()`
- [x] 3.2 Create `website/pages/stars/[date].tsx` — detail page with repo cards (name, language, stars, starredBy, AI commentary), date navigation, using `getStaticPaths` + `getStaticProps`

## 4. Navigation

- [x] 4.1 Update `website/components/Header.tsx` — add Stars to `navigation` array, update `getActiveTab()` for `/stars` routes, adjust nav pill sizing for 5 tabs

## 5. Verification

- [x] 5.1 Run `npm run type-check` — no TypeScript errors
- [x] 5.2 Run `npm run build` with sample JSON data — SSG exports `/stars/` and `/stars/[date]/` successfully
