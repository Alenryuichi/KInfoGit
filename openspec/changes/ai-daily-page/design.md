## Context

The site is a Next.js 16 SSG (Pages Router) deployed to GitHub Pages. Content is synced from Yuque via GitHub Actions cron → TypeScript scripts → `profile-data/` → `getStaticProps`. The same pattern applies here: Horizon (Python) runs in CI, outputs Markdown, a conversion step produces JSON, and Next.js builds static pages from it.

The site uses a dark theme (bg-black, text-gray-*), Tailwind CSS, and the existing Header component has a `NAV_ITEMS` array for navigation tabs.

## Goals / Non-Goals

**Goals:**
- Automated daily AI news digest page with zero manual intervention
- TLDR-style minimal UI: section headers, title + 2-4 line summary + source tags, no cards/borders
- Horizon handles source aggregation, AI scoring, deduplication, and bilingual summary generation
- GitHub Actions runs daily, commits JSON data, triggers deploy
- Data format is structured JSON (not raw Markdown) for typed rendering

**Non-Goals:**
- Real-time updates (SSG rebuilds once per day)
- User-facing search/filter (keep it simple, daily digest format)
- Twitter/X API integration (cost prohibitive, Horizon covers enough sources)
- Manual curation or editorial workflow
- Email newsletter subscription

## Decisions

### 1. Horizon runs in CI, not locally

**Decision**: Horizon (Python + uv) runs exclusively in GitHub Actions. The website has no Python dependency.

**Rationale**: Keeps the website build clean (Node.js only). Horizon is a data producer, not a runtime dependency. Same pattern as Yuque sync.

### 2. JSON intermediate format, not raw Markdown

**Decision**: Horizon outputs Markdown to `data/summaries/`. A TypeScript conversion script parses it into structured JSON at `profile-data/ai-daily/{date}.json`.

**Rationale**: Typed JSON enables rich rendering (section grouping, source badges, score coloring) without Markdown parsing at build time. The conversion script can normalize Horizon's output format across versions.

**JSON schema**:
```json
{
  "date": "2026-04-10",
  "itemCount": 12,
  "sections": [
    {
      "id": "headlines",
      "title": "Headlines & Launches",
      "items": [
        {
          "title": "...",
          "summary": "...",
          "url": "https://...",
          "sources": [{ "name": "HN", "meta": "342 points" }],
          "tags": ["LLM", "multimodal"]
        }
      ]
    }
  ]
}
```

### 3. TLDR-style layout: pure text, section dividers, no cards

**Decision**: Each news item is: bold title (link) → gray summary text → small source/tag line. Sections separated by uppercase headers with thin divider. No card borders, no background variation, no images.

**Rationale**: Matches TLDR AI style. Scannable, fast-loading, consistent with the site's minimal dark aesthetic.

### 4. Date-based routing with latest redirect

**Decision**: `/ai-daily/` redirects to the most recent date. `/ai-daily/2026-04-10/` is the canonical page for each day. Date picker at top for navigation between days.

**Rationale**: SSG-friendly (each date is a static page). No dynamic routing needed.

### 5. Horizon config: DeepSeek + HN/arXiv/Reddit/RSS

**Decision**: Use DeepSeek (already have API key) for AI scoring and summary. Sources: HackerNews, arXiv (cs.AI, cs.CL), Reddit (r/artificial, r/MachineLearning, r/LocalLLaMA), curated RSS feeds. Score threshold: 6.0.

**Rationale**: Free data sources + cheap AI ($0.02/day). Covers the English-language AI ecosystem comprehensively.

### 6. Three fixed sections

**Decision**: Every daily digest has exactly three sections:
1. **Headlines & Launches** — Major announcements, product launches, funding
2. **Research & Innovation** — Papers, benchmarks, novel approaches
3. **Engineering & Resources** — Tools, tutorials, open-source releases

**Rationale**: Horizon's AI scoring + the conversion script categorize items. Fixed sections make the page predictable and scannable.

## Risks / Trade-offs

- **[Horizon output format may change]** → The conversion script acts as an adapter layer. Pin Horizon version in CI.
- **[No content on day 1]** → Seed with a few days of historical data by running Horizon locally with `--hours 72`.
- **[CI Python setup adds ~30s]** → Acceptable for a daily job. Use `uv` for fast installs.
- **[DeepSeek rate limits]** → Daily batch of ~50 items is well within limits.
