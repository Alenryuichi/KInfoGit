## ADDED Requirements

### Requirement: Data layer provides weekly digest loading functions
The `website/lib/social-feeds.ts` module SHALL export `getAllWeeklyDigests()` and `getWeeklyDigestByWeek(week: string)` functions that read from `profile-data/weekly-digests/`.

#### Scenario: Load all weekly digests
- **WHEN** `getAllWeeklyDigests()` is called and digest files exist
- **THEN** it returns an array of `WeeklyDigestSummary` objects sorted by week descending (newest first)

#### Scenario: Load specific weekly digest
- **WHEN** `getWeeklyDigestByWeek("2026-W15")` is called and the file exists
- **THEN** it returns the full `WeeklyDigest` object parsed from `profile-data/weekly-digests/2026-W15.json`

#### Scenario: Digest file does not exist
- **WHEN** `getWeeklyDigestByWeek("2099-W01")` is called and no file exists
- **THEN** it returns `null`

#### Scenario: No digest directory
- **WHEN** `getAllWeeklyDigests()` is called and `profile-data/weekly-digests/` does not exist
- **THEN** it returns an empty array

### Requirement: Stars list page shows collapsible weekly digest card
The `/stars/` page SHALL display a "This Week" card above the daily date list when a digest exists for the most recent ISO week.

#### Scenario: Current week digest exists
- **WHEN** a user visits `/stars/` and a digest exists for the current or most recent week
- **THEN** a card is displayed at the top showing the week label, a summary preview (first 2 sentences), and item counts

#### Scenario: No weekly digest available
- **WHEN** a user visits `/stars/` and no weekly digests exist
- **THEN** the page renders the daily date list without any digest card

#### Scenario: Card is collapsible
- **WHEN** a user clicks the expand button on the "This Week" card
- **THEN** the card expands to show trending topics, notable repos, and cross-references
- **WHEN** a user clicks the collapse button
- **THEN** the card collapses back to the summary preview

#### Scenario: Card links to full digest page
- **WHEN** a user clicks the "View full digest" link on the card
- **THEN** the user is navigated to `/stars/weekly/YYYY-WXX/`

### Requirement: Weekly digest detail page
A detail page SHALL exist at `/stars/weekly/[week]/` displaying the full weekly digest content.

#### Scenario: Valid digest page renders
- **WHEN** a user visits `/stars/weekly/2026-W15/`
- **THEN** the page displays the full summary, trending topics list, notable repos with descriptions and star counts, key discussions, cross-references, and weekly stats

#### Scenario: SSG generates pages for all digests
- **WHEN** the site builds via `getStaticPaths`
- **THEN** a static page is generated for every `YYYY-WXX.json` file in `profile-data/weekly-digests/`

#### Scenario: Invalid week parameter
- **WHEN** `getStaticProps` receives a week parameter that has no corresponding digest file
- **THEN** the page returns `notFound: true` resulting in a 404

### Requirement: Digest detail page shows navigation
The weekly digest detail page SHALL include links to the previous and next weekly digests when they exist.

#### Scenario: Adjacent digests exist
- **WHEN** digests exist for W14, W15, and W16
- **THEN** the W15 page shows "← W14" and "W16 →" navigation links

#### Scenario: First digest in history
- **WHEN** viewing the earliest weekly digest
- **THEN** only the "next week" navigation link is shown

### Requirement: Digest detail page links to daily pages
The weekly digest detail page SHALL include links to each day's detail page for the days covered by the digest.

#### Scenario: Week with 5 days of content
- **WHEN** viewing a digest that covers Mon-Sun and content exists for 5 of those days
- **THEN** the page shows links to the 5 daily pages (e.g., `/stars/2026-04-06/` through `/stars/2026-04-10/`)

### Requirement: Weekly digest types are exported
The `social-feeds.ts` module SHALL export `WeeklyDigest` and `WeeklyDigestSummary` TypeScript interfaces.

#### Scenario: Types available for import
- **WHEN** a page component imports `WeeklyDigest` from `@/lib/social-feeds`
- **THEN** the import resolves and the type provides autocompletion for all digest fields

### Requirement: Visual design consistency
The weekly digest UI components SHALL follow the existing Stars page design patterns: black background, white text, gray-400/500 secondary text, hover states with `bg-white/[0.02]`, and the same max-w-3xl container layout.

#### Scenario: Digest card matches page style
- **WHEN** the "This Week" card renders on `/stars/`
- **THEN** it uses the same color palette, typography scale, and spacing as the existing date list items
