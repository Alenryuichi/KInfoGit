# AI Daily Feature Implementation - Complete Exploration

## Overview
The AI Daily feature is a curated news digest system that:
- **Input**: Horizon markdown summaries (`tools/horizon/repo/data/summaries/horizon-YYYY-MM-DD-en.md`)
- **Processing**: Convert via `scripts/convert-horizon.ts` script
- **Output**: Structured JSON in `profile-data/ai-daily/YYYY-MM-DD.json`
- **Display**: React pages at `/ai-daily/` (list) and `/ai-daily/[date]/` (detail)

The system classifies news items into 3 sections, stores metadata (tags, sources, scores), and renders them with a clean UI.

---

## 1. Data Classification in `scripts/convert-horizon.ts`

### SECTION_KEYWORDS Configuration (Lines 51-55)

```typescript
const SECTION_KEYWORDS: Record<string, string[]> = {
  headlines: [
    'raises', 'launches', 'announces', 'releases', 'funding', 'acquires', 
    'supports', 'backs', 'bill', 'policy', 'regulation', 'FBI', 'government'
  ],
  research: [
    'researchers', 'paper', 'study', 'quantum', 'achieve', 'demonstrate', 
    'novel', 'benchmark', 'scaling', 'arxiv', 'breakthrough'
  ],
  engineering: [
    'tool', 'library', 'framework', 'tutorial', 'guide', 'open-source', 
    'CLI', 'SDK', 'API', 'web tool', 'unicode', 'macOS', 'CPU', 'debug'
  ],
};
```

### classifyItem() Function (Lines 57-72)

The algorithm counts keyword matches in title + summary + tags and returns the section with the highest score. Falls back to 'headlines'.

### Classification Flow (Lines 188-204)

Items are placed into `sectionMap`, then non-empty sections are returned as `DigestSection[]`.

---

## 2. Data Format & Tag Storage

### TypeScript Interfaces (website/lib/ai-daily.ts, Lines 5-32)

```typescript
export interface NewsItem {
  title: string
  summary: string
  url: string
  score: number
  sources: NewsSource[]
  tags: string[]        // <- Stored as array
  background?: string
  discussion?: string
}
```

**Tags Storage**: Array of strings, parsed from markdown `**Tags**: `#tag1`, `#tag2``

**Display**: First 3 tags shown as `#privacy #encryption #iOS` in UI

---

## 3. Horizon Raw Markdown Format

### Input Path: `tools/horizon/repo/data/summaries/horizon-2026-04-10-en.md`

Markdown structure:
- TOC with scores
- Item blocks: `## [Title](URL) ⭐️ score/10`
- Source line: `source · meta · timestamp`
- Sections: **Background**, **Discussion**, **Tags**
- HTML: `<details>`, `<a id=...>` (parsed but skipped)

### Parsing in convert-horizon.ts (Lines 76-184)

**Regex Patterns**:
- Item: `/^## \[(.+?)\]\((.+?)\)\s*⭐️\s*([\d.]+)\/10/`
- Source: `/^(\w+)\s*·\s*(.+?)(?:\s*·\s*(.+))?$/`
- Tags: `/#([^`]+)/g` extracts between backticks

---

## 4. Detail Page Rendering (`website/pages/ai-daily/[date].tsx`)

### SectionBlock Component (Lines 96-107)
Renders section title and maps NewsItem → NewsItemCard

### NewsItemCard Component (Lines 53-92)
- Score with color: emerald (8+), yellow (7+), blue (<7)
- Title → external link
- Summary truncated to 300 chars
- Source line + first 3 tags with # prefix

### Date Navigation (Lines 111-171)
- Previous/Next links
- 5 nearby date pills
- Current date highlighted

---

## 5. List Page (`website/pages/ai-daily.tsx`)

- **No filtering UI** – just date-ordered links
- Sorted newest first from `getAllDailyDates()`
- Item count per date
- Hover effects

---

## 6. Data Flow Architecture

```
Horizon Markdown
    ↓
scripts/convert-horizon.ts
  ├─ parseHorizonMarkdown()
  ├─ classifyItem()
  └─ Output: DailyDigest (date, itemCount, sections)
    ↓
profile-data/ai-daily/YYYY-MM-DD.json
    ↓
website/lib/ai-daily.ts
  ├─ getAllDailyDates()
  ├─ getDailyDigest(date)
  ├─ getLatestDate()
  └─ getAdjacentDates(date)
    ↓
React Pages
  ├─ ai-daily.tsx (list)
  └─ ai-daily/[date].tsx (detail)
    ↓
Static HTML (out/ai-daily/)
```

---

## 7. Directory Structure

```
project/
├── scripts/convert-horizon.ts
├── tools/horizon/repo/data/summaries/horizon-*.md
├── profile-data/ai-daily/*.json
└── website/
    ├── lib/ai-daily.ts
    ├── pages/ai-daily.tsx
    └── pages/ai-daily/[date].tsx
```

---

## 8. Build Process

1. Run: `tsx scripts/convert-horizon.ts` (convert Horizon → JSON)
2. Build: `npm run build` (getStaticProps loads JSON)
3. Export: Static HTML to `out/ai-daily/`

---

## 9. Key Metrics from 2026-04-10

- **Total items**: 8
- **Headlines**: 2
- **Research**: 1
- **Engineering**: 5
- **Scores**: 8.0 (2), 8.0 (2), 7.0 (2), 6.0 (2)
- **Tags per item**: 4-5 tags
- **Sources**: 1 per item (hackernews + username)

---

## 10. All Your Questions Answered ✅

1. ✅ **Classification**: Keyword-based in `classifyItem()`, three sections
2. ✅ **Tags Storage**: JSON array, displayed as `#tag1 #tag2 #tag3`
3. ✅ **Detail Page**: SectionBlock → NewsItemCard with score colors
4. ✅ **TypeScript Interfaces**: NewsItem, DigestSection, DailyDigest in ai-daily.ts
5. ✅ **Horizon Markdown**: Structured with regex patterns
6. ✅ **List Page**: Simple date links, no filtering
7. ✅ **Data Flow**: Horizon → markdown → JSON → TypeScript → React → HTML
