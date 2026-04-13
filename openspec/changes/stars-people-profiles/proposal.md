## Why

The Stars feature currently shows a daily feed of GitHub stars and Bluesky posts from ~14 GitHub users and ~21 Bluesky accounts (AI leaders like Karpathy, Simon Willison, etc.), but there is no way to explore activity **by person**. Visitors see author names in cards but can't click through to learn who these people are, what they've been interested in recently, or see all their activity in one place. People Profile pages turn the Stars section from a chronological firehose into a navigable directory of AI thought leaders.

## What Changes

- **New People index page** (`/stars/people/`) — a grid of all tracked AI leaders showing avatar, name, and platform badges (GitHub / Bluesky).
- **New People detail page** (`/stars/people/[handle]/`) — individual profile with:
  - Name, avatar, short bio line, links to their GitHub and Bluesky profiles.
  - "Recent interests" — a build-time AI-generated summary of what they've been starring/posting about.
  - Activity sparkline — stars + posts per day over the last 30 days rendered as an inline SVG.
  - Chronological list of their recent starred repos and Bluesky posts (reusing existing card components).
- **People config file** (`profile-data/people.json`) — single source of truth mapping a person's canonical `id` to their `github` username, `bluesky` handle, display `name`, and optional `avatar` URL.
- **Build-time data generation script** (`scripts/generate-people-data.ts`) — reads existing daily feed JSON files and aggregates per-person activity, recent-interest summaries, and sparkline data into `profile-data/people-activity/` so pages can be statically generated.
- **Author name links on `/stars/[date]`** — clicking an author name in RepoCard / BlueskyPostCard navigates to that person's profile page instead of opening an external link.

## Capabilities

### New Capabilities
- `people-profiles`: People index grid page and individual profile detail pages with activity data, sparklines, and aggregated feed items.
- `people-data-pipeline`: Build-time script to aggregate per-person activity from existing daily feed data and generate AI interest summaries.

### Modified Capabilities
<!-- No existing spec-level requirements are changing. The [date] page gets author links
     but that is an implementation detail, not a spec-level behavior change. -->

## Impact

- **New pages**: `website/pages/stars/people/index.tsx`, `website/pages/stars/people/[handle].tsx`
- **New components**: `PersonCard`, `ActivitySparkline`, `PlatformBadge`
- **New data layer**: `website/lib/people.ts` — reads `people.json` + aggregated activity data
- **New config**: `profile-data/people.json`
- **New script**: `scripts/generate-people-data.ts` (added to `just build` pipeline)
- **Modified file**: `website/pages/stars/[date].tsx` — author names become internal links
- **Modified file**: `website/lib/social-feeds.ts` — may export helper for per-person queries
- **Dependencies**: None new. Uses existing Tailwind, Next.js SSG, DeepSeek API (for interest summaries at build time).
