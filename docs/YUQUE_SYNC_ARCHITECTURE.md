# KInfoGit Blog & Project Sync Architecture

## Overview
This project implements a sophisticated content synchronization system that pulls blog articles and work projects from **Yuque (语雀)** to the local `profile-data/` directory, where they're consumed by the Next.js website.

---

## 1. Sync Architecture

### Two Separate Sync Pipelines

#### A. Blog Sync (`scripts/sync-yuque.ts`)
- **Source**: Yuque Blog Knowledge Base (Default: `kylin-bxrhs/qd9got`)
- **Output**: `profile-data/blog/*.md` files
- **Trigger**: Daily at UTC 00:00 (Beijing 08:00) or manual via GitHub Actions
- **State**: Tracked in `tools/yuque-sync/sync-state.json`

#### B. Work/Projects Sync (`scripts/sync-yuque-work.ts`)
- **Source**: Yuque Work Knowledge Base (Default: `kylin-bxrhs/sh4e9k`)
- **Output**: `profile-data/projects/*.md` + `profile-data/projects/core-projects.json`
- **Trigger**: Weekly on Monday UTC 01:00 (Beijing 09:00) or manual
- **State**: Tracked in `tools/yuque-sync/work-sync-state.json`

---

## 2. GitHub Actions Workflows

### `.github/workflows/sync-yuque.yml` - Blog Sync
```yaml
Schedule: 0 0 * * * (daily at 00:00 UTC)
Manual: Yes (with force_sync input)

Steps:
1. Checkout repository
2. Setup Node.js 20
3. Install tsx
4. [Optional] Clear cache if force_sync=true
5. Run: npx tsx scripts/sync-yuque.ts
   - Env vars: YUQUE_TOKEN, YUQUE_LOGIN, YUQUE_REPO, DEEPSEEK_API_KEY
6. Check for changes
7. Auto-commit if changes detected
```

### `.github/workflows/sync-yuque-work.yml` - Work Sync
```yaml
Schedule: 0 1 * * 1 (Monday at 01:00 UTC)
Manual: Yes (with force_sync input)

Steps:
1. Similar setup as blog sync
2. [Optional] Delete sync state if force_sync=true
3. Run: npx tsx scripts/sync-yuque-work.ts --force
   - Env vars: YUQUE_TOKEN, YUQUE_LOGIN, YUQUE_WORK_REPO, DEEPSEEK_API_KEY
```

### `.github/workflows/deploy.yml` - Build & Deploy
- Runs on: master push, workflow_dispatch, daily 00:00 UTC
- Builds Next.js site and deploys to GitHub Pages

---

## 3. Sync Scripts Deep Dive

### Blog Sync: `scripts/sync-yuque.ts`

#### Data Flow
```
Yuque API
├── getToc(namespace) → Fetch directory structure
├── getDocList(namespace) → Fetch all docs metadata (batch)
└── getDoc(namespace, slug) → Fetch individual doc content

Processing Pipeline
├── cleanHtmlTags() → Remove Yuque HTML formatting
├── downloadImages() → Download images to website/public/blog/images/
│   └── Hashed filenames: {slug}-{md5_hash}{ext}
├── generateTagsAndExcerpt() → DeepSeek AI extracts tags + 50-100 char excerpt
└── calculateReadTime() → Chinese chars ÷ 400 + English words ÷ 200

Output Structure
└── profile-data/blog/{date}-{slug}.md
    ├── Frontmatter (YAML)
    │   ├── title: string
    │   ├── date: ISO 8601 (from created_at)
    │   ├── tags: string[] (AI-generated)
    │   ├── category: string (1st-level Yuque folder)
    │   ├── categoryOrder: number
    │   ├── subcategory: string? (2nd-level Yuque folder)
    │   ├── readTime: string
    │   ├── featured: boolean (default: false)
    │   └── excerpt: string (AI-generated, 50-100 chars)
    └── Markdown content (HTML cleaned, images rewritten to local paths)

Incremental Sync
├── Tracks: doc_id, updated_at, category, categoryOrder, subcategory
├── Skip condition: updated_at matches && category unchanged
├── Category-only changes: Update frontmatter without re-fetching content
└── 500ms delay between doc fetches (rate limiting)
```

#### Key Features
- **Yuque API Direct**: Replaces `elog` tool. Uses X-Auth-Token authentication.
- **Rate Limiting**: Handles 429 responses, waits for rate limit reset.
- **Image Downloads**: Fetches all markdown images, stores locally with MD5 hashes.
- **AI Tagging**: DeepSeek API generates tags + excerpt from content preview.
- **Incremental**: Only processes changed documents (checks updated_at).
- **Hierarchical Categories**: 
  - 1st-level Yuque sections → `category`
  - 2nd-level Yuque sections → `subcategory`
  - Preserves order from Yuque TOC

#### Environment Variables
```bash
YUQUE_TOKEN        # Yuque API token (from secrets)
YUQUE_LOGIN        # Yuque namespace login (default: kylin-bxrhs)
YUQUE_REPO         # Yuque blog repo slug (default: qd9got)
DEEPSEEK_API_KEY   # DeepSeek API token for AI extraction
```

---

### Work/Projects Sync: `scripts/sync-yuque-work.ts`

#### Data Flow (Similar to Blog)
```
Yuque API → TOC Parse → Batch Fetch Docs → Process Each Doc

Processing Pipeline
├── cleanHtmlTags() → Remove HTML
├── downloadImages() → Download to website/public/work/images/
├── extractProjectData() → DeepSeek structured extraction (2000 token context)
│   └── Returns: {title, period, company, role, tech_stack, responsibilities,
│                 achievements, description, highlights, impact, category}
├── generateSlug() → Smart slug extraction:
│   1. Try parenthesized English name: "磕线 (Betaline)" → "betaline"
│   2. Try English prefix: "BetalineAPP - 描述" → "betaline-app"
│   3. Extract first English words
│   4. Fallback: slug-ify full title
└── Generate detail markdown

Output Structure
├── profile-data/projects/{slug}.md (detail page with ID frontmatter)
└── profile-data/projects/core-projects.json (array of Project objects)
    └── Each Project object:
        ├── id: string (slug)
        ├── title: {zh, en} (AI-translated)
        ├── slug: string
        ├── period: string ("2025.09 - 至今")
        ├── company: string
        ├── role: {zh, en}
        ├── tech_stack: string[]
        ├── responsibilities: {zh, en}
        ├── achievements: {zh, en} (quantified)
        ├── description: {zh, en}
        ├── highlights: {zh, en}
        ├── impact: string (one-liner, e.g., "年化收益超300万元")
        ├── category: string ("system-architecture", "ai-agent", etc.)
        ├── section: string (1st-level Yuque category)
        ├── featured: boolean (top 3 by order)
        ├── order: number (global position)
        └── hasDetailPage: boolean

Featured Selection
├── Sorts by order (ascending)
├── First 3 projects → featured: true
└── Rest → featured: false

Incremental Sync
├── --force flag: Clear sync state, re-extract all projects via DeepSeek
├── Normal mode: Skip if updated_at unchanged
└── Rate limiting: 1500ms delay between doc fetches (Yuque strict)
```

#### Key Features
- **DeepSeek Extraction**: Analyzes doc content, extracts structure + English translation.
- **Bilingual Support**: Every field has zh + en versions.
- **Smart Slug Generation**: Extracts English name from title patterns.
- **Impact/Metrics**: One-liner quantified impact for card display.
- **Section-based Grouping**: 1st-level TOC becomes "section" field.
- **Featured Auto-ranking**: Top 3 by appearance order marked featured.

#### Environment Variables
```bash
YUQUE_TOKEN         # Yuque API token
YUQUE_LOGIN         # Yuque namespace (default: kylin-bxrhs)
YUQUE_WORK_REPO     # Yuque work repo slug (default: sh4e9k)
DEEPSEEK_API_KEY    # DeepSeek API (for structured extraction)
```

---

## 4. Image Handling

### Blog Images
**Location**: `website/public/blog/images/`
**Naming**: `{doc-slug}-{md5-hash-8chars}.{ext}`
**Process**:
1. Extract all markdown images: `![alt](https://...)`
2. Download from URL
3. Hash content with MD5
4. Rewrite image references: `/blog/images/{filename}`

### Work/Project Images
**Location**: `website/public/work/images/`
**Same hashing logic as blog images**

### Error Handling
- If image download fails (network error, 404, etc.), log warning but continue
- Original markdown references preserved if download fails

---

## 5. Sync State Tracking

### `tools/yuque-sync/sync-state.json` (Blog)
```json
{
  "lastSync": "2026-04-09T00:16:53.994Z",
  "docs": {
    "{doc_id}": {
      "slug": "yuque-doc-slug",
      "updated_at": "2026-04-06T12:34:56.789Z",
      "category": "Harness",
      "categoryOrder": 2,
      "subcategory": "SubCat",
      "blogFile": "2026-04-06-为什么-harness.md"
    }
  }
}
```

### `tools/yuque-sync/work-sync-state.json` (Work)
```json
{
  "lastSync": "2026-04-09T00:16:53.994Z",
  "docs": {
    "{doc_id}": {
      "slug": "yuque-slug",
      "updated_at": "2026-04-06T12:34:56.789Z",
      "project": { /* Full Project object */ }
    }
  }
}
```

---

## 6. Content Output Structure

### Blog Post File Format
**Path**: `profile-data/blog/{date}-{slug}.md`

```markdown
---
title: "Article Title"
date: "2026-04-06"
tags: ["tag1", "tag2", "tag3"]
category: "Main Category"
categoryOrder: 2
subcategory: "Sub Category"
readTime: "11 min read"
featured: false
excerpt: "50-100 character AI-generated summary"
---

# Article content here (HTML cleaned, images rewritten)
```

### Project Detail File
**Path**: `profile-data/projects/{slug}.md`

```markdown
---
id: "{slug}"
---

## Project details (markdown from Yuque)
```

### Projects JSON
**Path**: `profile-data/projects/core-projects.json`

Array of Project objects (as described above), sorted by order.

---

## 7. Website Integration

### Data Loading (`website/lib/data.ts`)
```typescript
// Load all blog posts
getAllBlogPosts(): Promise<BlogPost[]>
  └── Reads all *.md from profile-data/blog/
  └── Parses frontmatter with gray-matter
  └── Returns sorted by date (newest first)

// Get single blog post
getBlogPost(slug: string): Promise<BlogPost | null>

// Load all projects
getCoreProjects(): Promise<Project[]>
  └── Reads profile-data/projects/core-projects.json
  └── Parses JSON

// Get featured projects
getFeaturedProjects(): Project[]
  └── Filters featured=true, sorts by order

// Get project detail markdown
getProjectDetailContent(id: string): Promise<string>
  └── Reads profile-data/projects/{id}.md
```

### Blog Pages
- **`website/pages/blog.tsx`**: Blog listing with category/subcategory filters
- **`website/pages/blog/[slug].tsx`**: Single blog post page with TOC, reading progress

### Work Pages
- **`website/pages/work.tsx`**: Projects listing
- **`website/pages/work/[id].tsx`**: Project detail page

---

## 8. API Rate Limiting & Retry Logic

### Yuque API Rate Limits
- **Hour quota**: Limited by `x-cchm` header (h:<hours_remaining>)
- **Per-second**: Limited by `X-RateLimit-*` headers

### Retry Strategy
```
If 429 (Rate Limited):
├── Check x-cchm header
├── If hourRemaining === 0:
│   └── Wait until next hour (max 10 min)
├── Else (per-second throttle):
│   └── Exponential backoff: 5s * attempt
├── Retry up to 3 times
└── Fail with clear error message
```

---

## 9. Env File Loading

### `.elog.env` (Dev Support)
**Location**: `tools/yuque-sync/.elog.env`

For local testing, env vars can be stored here (not committed). Loaded at script startup:
```bash
YUQUE_TOKEN=...
YUQUE_LOGIN=...
YUQUE_REPO=...
DEEPSEEK_API_KEY=...
```

---

## 10. Integration Points

### Build Pipeline
1. **Sync step**: GitHub Actions runs sync scripts
2. **Commit**: Auto-commits `profile-data/**` changes
3. **Build**: Next.js builds reads synced files from profile-data/
4. **Deploy**: Static site deployed to GitHub Pages

### Content Update Workflow
```
User updates Yuque document
  ↓
GitHub Actions scheduled job triggers
  ↓
Sync script fetches, processes, AI-enhances content
  ↓
Images downloaded, references rewritten
  ↓
Markdown files written to profile-data/
  ↓
core-projects.json regenerated
  ↓
Auto-commit to master
  ↓
Website rebuild triggered
  ↓
New content live on GitHub Pages
```

---

## 11. Troubleshooting & Notes

### Key Considerations
- **Image hosting**: All remote images must be downloaded to local. No external image URLs in final output.
- **Rate limiting**: Yuque API is strict; work sync has longer delays (1500ms vs 500ms for blog).
- **DeepSeek dependency**: AI extraction requires working API key; falls back gracefully on error.
- **Incremental sync**: Deleting local files won't auto-remove them; need manual cleanup or full resync.
- **SOT (Source of Truth)**: Yuque is the source; local files are generated/cached.

### Force Sync Scenarios
- `blog`: `rm tools/yuque-sync/sync-state.json` or GitHub Actions force_sync=true
- `work`: `rm tools/yuque-sync/work-sync-state.json` or GitHub Actions force_sync=true with --force flag

---

## 12. Summary Table

| Component | Location | Trigger | Output | Format |
|-----------|----------|---------|--------|--------|
| **Blog Sync** | `scripts/sync-yuque.ts` | Daily 00:00 UTC | `profile-data/blog/*.md` | Markdown + Frontmatter |
| **Work Sync** | `scripts/sync-yuque-work.ts` | Weekly Mon 01:00 UTC | `profile-data/projects/*` | Markdown + JSON |
| **Images** | Download in scripts | Per-sync | `website/public/{blog,work}/images/` | PNG/JPG/GIF |
| **State** | `tools/yuque-sync/*.json` | Per-sync | Sync metadata | JSON |
| **Website** | `website/lib/data.ts` | Build-time | In-memory | TypeScript interfaces |
| **CI/CD** | `.github/workflows/` | Scheduled + manual | Git commits + deploy | GitHub Actions |

