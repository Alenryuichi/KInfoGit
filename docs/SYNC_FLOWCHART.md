# Yuque Content Sync - Visual Flowchart

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      YUQUE (语雀) - Source of Truth                     │
│                                                                         │
│  ┌─────────────────┐  ┌──────────────────────┐                         │
│  │  Blog Repo      │  │  Work/Projects Repo  │                         │
│  │ (qd9got)        │  │ (sh4e9k)             │                         │
│  │                 │  │                      │                         │
│  │ TOC Structure:  │  │ TOC Structure:       │                         │
│  │ ├─ Category 1   │  │ ├─ Section 1        │                         │
│  │ │ ├─ SubCat A   │  │ │ ├─ Project 1      │                         │
│  │ │ └─ SubCat B   │  │ │ ├─ Project 2      │                         │
│  │ └─ Category 2   │  │ └─ Section 2        │                         │
│  │   └─ Doc...     │  │   └─ Project 3      │                         │
│  └─────────────────┘  └──────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────┘
         ▲                              ▲
         │                              │
         │ Yuque API                    │ Yuque API
         │ X-Auth-Token                 │ X-Auth-Token
         │                              │
┌────────┴──────────────────────────────┴────────────────────────────────┐
│                       GITHUB ACTIONS WORKFLOWS                          │
│                                                                         │
│  ┌──────────────────┐            ┌─────────────────────┐               │
│  │  sync-yuque.yml  │            │ sync-yuque-work.yml │               │
│  │                  │            │                     │               │
│  │ Schedule:        │            │ Schedule:           │               │
│  │ Daily 00:00 UTC  │            │ Mon 01:00 UTC       │               │
│  │                  │            │                     │               │
│  │ Manual: Yes      │            │ Manual: Yes         │               │
│  └────────┬─────────┘            └──────────┬──────────┘               │
│           │                                 │                         │
│           │ npm run sync-yuque              │ npm run sync-yuque-work │
│           ▼                                 ▼                         │
│  ┌──────────────────────┐      ┌──────────────────────┐              │
│  │ scripts/            │      │ scripts/            │              │
│  │ sync-yuque.ts       │      │ sync-yuque-work.ts  │              │
│  └────────┬─────────────┘      └──────────┬──────────┘              │
└───────────┼──────────────────────────────┼─────────────────────────┘
            │                              │
            ▼                              ▼
┌───────────────────────────────────────────────────────────────────────┐
│                      PROCESSING PIPELINE                              │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ BLOG SYNC (sync-yuque.ts)                                   │    │
│  │                                                             │    │
│  │  1. Fetch TOC from Yuque API                               │    │
│  │  2. Fetch doc list (batch query for updated_at)            │    │
│  │  3. For each doc:                                          │    │
│  │     ├─ Skip if unchanged (updated_at match)               │    │
│  │     ├─ Fetch full doc content                             │    │
│  │     ├─ Clean HTML tags                                    │    │
│  │     ├─ Download images → /blog/images/{hash}              │    │
│  │     ├─ Generate tags + excerpt via DeepSeek AI            │    │
│  │     ├─ Calculate read time                                │    │
│  │     ├─ Generate frontmatter (YAML)                        │    │
│  │     └─ Write to profile-data/blog/{date}-{slug}.md        │    │
│  │  4. Update sync-state.json                                 │    │
│  │  5. Rate limiting: 500ms between doc fetches               │    │
│  └────────────────────────┬────────────────────────────────────┘    │
│                           │                                         │
│  ┌────────────────────────▼────────────────────────────────────┐    │
│  │ WORK SYNC (sync-yuque-work.ts)                              │    │
│  │                                                             │    │
│  │  1. Fetch TOC from Yuque API                               │    │
│  │  2. Fetch doc list (batch query for updated_at)            │    │
│  │  3. For each project doc:                                  │    │
│  │     ├─ Skip if unchanged (unless --force)                 │    │
│  │     ├─ Fetch full doc content                             │    │
│  │     ├─ Clean HTML tags                                    │    │
│  │     ├─ Download images → /work/images/{hash}              │    │
│  │     ├─ Extract structured data via DeepSeek              │    │
│  │     │  └─ Returns: title, role, tech_stack,               │    │
│  │     │             achievements, description, etc.         │    │
│  │     ├─ Generate smart slug from title                     │    │
│  │     ├─ Write detail markdown to projects/{slug}.md        │    │
│  │     └─ Build Project object                               │    │
│  │  4. Assign featured: true for top 3 by order              │    │
│  │  5. Write core-projects.json                              │    │
│  │  6. Update work-sync-state.json                           │    │
│  │  7. Rate limiting: 1500ms between doc fetches              │    │
│  └────────────────┬───────────────────────────────────────────┘    │
└───────────────────┼─────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    LOCAL FILE SYSTEM OUTPUT                          │
│                                                                      │
│  profile-data/                                                       │
│  ├─ blog/                                                           │
│  │  ├─ 2026-04-06-article-title.md                               │
│  │  ├─ 2026-04-07-another-post.md                                │
│  │  └─ ...                                                         │
│  ├─ projects/                                                      │
│  │  ├─ betaline.md (detail page)                                 │
│  │  ├─ core-projects.json (master index)                         │
│  │  └─ ...                                                         │
│  └─ [other existing directories]                                  │
│                                                                      │
│  website/public/                                                     │
│  ├─ blog/images/                                                    │
│  │  ├─ article-title-a1b2c3d4.png                                │
│  │  └─ ...                                                         │
│  └─ work/images/                                                    │
│     ├─ betaline-e5f6g7h8.jpg                                      │
│     └─ ...                                                         │
│                                                                      │
│  tools/yuque-sync/                                                   │
│  ├─ sync-state.json (blog metadata cache)                          │
│  └─ work-sync-state.json (projects metadata cache)                 │
└──────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │  Git Commit Changes     │
        │  (if changed)           │
        │  Commit message:        │
        │  "chore: sync yuque..." │
        └────────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │  Push to master branch  │
        └────────────┬────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│              WEBSITE BUILD & DEPLOYMENT (deploy.yml)                │
│                                                                      │
│  1. Checkout repository                                              │
│  2. npm install in website/                                          │
│  3. Next.js build:                                                   │
│     ├─ Reads profile-data/blog/*.md (via getAllBlogPosts)          │
│     ├─ Parses frontmatter with gray-matter                         │
│     ├─ Reads profile-data/projects/core-projects.json              │
│     └─ Pre-renders all blog + project pages (SSG)                  │
│  4. Upload artifact to GitHub Pages                                 │
│  5. Deploy static site                                              │
│                                                                      │
│  Result: Live on https://kylinmiao.me/                             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Transformation Pipeline

### Blog Post Transformation

```
Yuque Doc (HTML)
    │
    ├─ API: /repos/{namespace}/docs/{slug}
    ├─ Fields: body (HTML), created_at, updated_at, title
    │
    ▼
Content Processing
    │
    ├─ cleanHtmlTags()
    │  └─ Remove <font>, <span>, <div>, <p>, <a name>, etc.
    │     Preserve content, collapse blank lines
    │
    ├─ downloadImages()
    │  ├─ Regex: /!\[alt\]\(https:\/\/...\)/g
    │  ├─ For each match:
    │  │  ├─ Fetch from URL
    │  │  ├─ MD5 hash content (8 chars)
    │  │  ├─ Save to website/public/blog/images/{slug}-{hash}.{ext}
    │  │  └─ Rewrite reference: ![alt](/blog/images/{filename})
    │  └─ Graceful failure: Log warning, continue
    │
    ├─ generateTagsAndExcerpt()
    │  ├─ DeepSeek API call (temperature: 0.3, max_tokens: 500)
    │  ├─ Input: content preview (first 2000 chars) + title
    │  ├─ Output: JSON { tags: string[], excerpt: string }
    │  └─ Fallback: tags=['未分类'], excerpt=title
    │
    ├─ calculateReadTime()
    │  ├─ Chinese chars count ÷ 400
    │  ├─ + English words count ÷ 200
    │  └─ Result: "{minutes} min read"
    │
    ├─ Category Hierarchy
    │  ├─ From TOC (1st-level) → category
    │  ├─ From TOC (2nd-level) → subcategory
    │  └─ Preserve categoryOrder from TOC
    │
    └─ generateFrontmatter()
       └─ YAML frontmatter:
          ├─ title, date (from created_at)
          ├─ tags (AI-generated)
          ├─ category, categoryOrder
          ├─ subcategory (optional)
          ├─ readTime, featured, excerpt
          └─ All quotes escaped

Output: Markdown file
    │
    ├─ Filename: profile-data/blog/{date}-{slug}.md
    ├─ Content: frontmatter + cleaned markdown
    └─ Example:
       ---
       title: "Article Title"
       date: "2026-04-06"
       tags: ["tag1", "tag2"]
       category: "Category"
       categoryOrder: 1
       readTime: "5 min read"
       featured: false
       excerpt: "Summary..."
       ---
       
       # Content here (HTML cleaned, images rewritten)
```

### Project Transformation

```
Yuque Doc (HTML)
    │
    ├─ API: /repos/{namespace}/docs/{slug}
    ├─ Fields: body (HTML), created_at, updated_at, title
    │
    ▼
Content Processing
    │
    ├─ cleanHtmlTags() [same as blog]
    │
    ├─ downloadImages() [same as blog, different directory]
    │  └─ Saves to: website/public/work/images/
    │
    ├─ extractProjectData() via DeepSeek
    │  ├─ Context: First 3000 chars of content
    │  ├─ Prompt: Structured extraction with example JSON
    │  ├─ Temperature: 0.2 (lower for accuracy)
    │  ├─ Max tokens: 2000
    │  ├─ Returns structured:
    │  │  ├─ title: { zh, en }
    │  │  ├─ period, company, role: { zh, en }
    │  │  ├─ tech_stack: string[]
    │  │  ├─ responsibilities: { zh: [], en: [] }
    │  │  ├─ achievements: { zh: [], en: [] }
    │  │  ├─ description: { zh, en }
    │  │  ├─ highlights: { zh, en }
    │  │  ├─ impact: string (one-liner quantified)
    │  │  └─ category: string (tag like "ai-agent")
    │  └─ Retry logic: 1 retry on failure
    │
    ├─ generateSlug()
    │  ├─ Pattern 1: "(EnglishName)" → "englishname"
    │  ├─ Pattern 2: "English - Chinese" → "english"
    │  ├─ Pattern 3: Extract English words from title
    │  ├─ Pattern 4: Slugify entire title (remove Chinese)
    │  └─ Fallback: "untitled"
    │
    ├─ Build Project object
    │  ├─ id: slug
    │  ├─ title, slug, period, company, role (from extraction)
    │  ├─ tech_stack, responsibilities, achievements (from extraction)
    │  ├─ description, highlights, impact, category (from extraction)
    │  ├─ section: from TOC (1st-level)
    │  ├─ order: global position in TOC
    │  ├─ featured: initially false (set later)
    │  └─ hasDetailPage: true if content > 50 chars
    │
    └─ Write markdown + JSON

Output Files
    │
    ├─ Detail page: profile-data/projects/{slug}.md
    │  ├─ Frontmatter: id: "{slug}"
    │  └─ Content: cleaned markdown from Yuque
    │
    └─ Index: profile-data/projects/core-projects.json
       ├─ Array of Project objects
       ├─ Featured assignment: sort by order, top 3 → featured: true
       └─ Example:
          [{
            "id": "betaline",
            "title": { "zh": "...", "en": "..." },
            "slug": "betaline",
            "period": "2025.09 - 至今",
            "company": "独立开发",
            "role": { "zh": "...", "en": "..." },
            "tech_stack": [...],
            "responsibilities": { "zh": [...], "en": [...] },
            "achievements": { "zh": [...], "en": [...] },
            "description": { "zh": "...", "en": "..." },
            "highlights": { "zh": "...", "en": "..." },
            "impact": "独立完成全流程",
            "category": "mobile-app",
            "section": "个人项目",
            "featured": true,
            "order": 0,
            "hasDetailPage": true
          }, ...]
```

---

## Sync State Management

```
Yuque Doc Tracking (Incremental Sync)
    │
    ├─ Store: tools/yuque-sync/{sync-state.json, work-sync-state.json}
    │
    ├─ Structure:
    │  {
    │    "lastSync": "2026-04-09T00:16:53.994Z",
    │    "docs": {
    │      "{doc_id}": {
    │        "slug": "yuque-slug",
    │        "updated_at": "2026-04-06T12:34:56.789Z",
    │        "category": "Category",        [blog only]
    │        "categoryOrder": 2,            [blog only]
    │        "subcategory": "SubCat",       [blog only]
    │        "blogFile": "2026-04-06-*.md", [blog only]
    │        "project": { ... }             [work only]
    │      }
    │    }
    │  }
    │
    └─ Sync Decision Logic
       │
       ├─ If doc_id not in cache:
       │  └─ NEW DOC → Always process
       │
       ├─ If updated_at matches cached:
       │  ├─ NO CONTENT CHANGE
       │  ├─ But check: category, categoryOrder, subcategory changed?
       │  └─ If YES (blog) → Update frontmatter only
       │     If NO → SKIP
       │
       └─ If updated_at differs:
          └─ CONTENT CHANGED → Full re-process

Force Sync Options
    │
    ├─ Blog: rm tools/yuque-sync/sync-state.json
    ├─ Work: rm tools/yuque-sync/work-sync-state.json
    ├─ OR: GitHub Actions force_sync=true input
    │      (work also accepts --force CLI flag)
    └─ Effect: Discard all state, re-fetch and re-process ALL docs
```

---

## Rate Limiting & Retry Handling

```
Yuque API Call
    │
    ├─ Headers:
    │  ├─ X-Auth-Token: {YUQUE_TOKEN}
    │  ├─ Content-Type: application/json
    │  └─ User-Agent: KInfoGit-Sync/1.0
    │
    ├─ Rate Limit Headers:
    │  ├─ X-RateLimit-Remaining: N
    │  ├─ X-RateLimit-Limit: M
    │  └─ x-cchm: h:{hours_remaining},m:{minutes_remaining}
    │
    └─ Response Status
       │
       ├─ 200: OK → Return data
       │
       ├─ 429: Rate Limited
       │  │
       │  ├─ Parse x-cchm header
       │  ├─ If hourRemaining === 0:
       │  │  ├─ Calculate wait: 60 - current_minutes (max 10 min)
       │  │  └─ Wait & retry (up to 3 attempts)
       │  │
       │  └─ Else (per-second throttle):
       │     ├─ Exponential backoff: 5s * attempt_number
       │     └─ Retry up to 3 times
       │
       └─ Other Error (non-429):
          └─ Fail with error message

Between-Request Delays (Rate Limiting Strategy)
    │
    ├─ Blog sync: 500ms between doc fetches
    ├─ Work sync: 1500ms between doc fetches (stricter)
    └─ Purpose: Avoid hitting per-second rate limit
```

---

## Website Consumption Flow

```
Next.js Build Process (Static Generation)
    │
    ├─ At build time (no server runtime):
    │  │
    │  ├─ getStaticProps in blog pages
    │  │  ├─ Calls: getAllBlogPosts() from @/lib/data
    │  │  ├─ Reads: profile-data/blog/*.md
    │  │  ├─ Parses: YAML frontmatter + markdown content
    │  │  ├─ Returns: BlogPost[] (sorted by date, newest first)
    │  │  └─ Props to page component
    │  │
    │  ├─ getStaticPaths in [slug].tsx
    │  │  ├─ Generate paths for each blog post slug
    │  │  └─ Enable ISR: revalidate: 3600 (not used since export mode)
    │  │
    │  ├─ getStaticProps in work pages
    │  │  ├─ Calls: getCoreProjects() from @/lib/data
    │  │  ├─ Reads: profile-data/projects/core-projects.json
    │  │  ├─ Parses: JSON structure
    │  │  └─ Returns: Project[]
    │  │
    │  └─ getStaticPaths in [id].tsx
    │     ├─ Generate paths for each project id
    │
    └─ Data Functions (@/lib/data.ts)
       │
       ├─ getAllBlogPosts()
       │  ├─ fs.readdirSync(profile-data/blog)
       │  ├─ For each .md file:
       │  │  ├─ slug = filename without .md
       │  │  ├─ gray-matter(content) → { data, content }
       │  │  └─ Map to BlogPost interface
       │  └─ Sort by date descending
       │
       ├─ getBlogPost(slug)
       │  ├─ fs.readFileSync(profile-data/blog/{slug}.md)
       │  └─ gray-matter(content)
       │
       ├─ getCoreProjects()
       │  ├─ fs.readFileSync(profile-data/projects/core-projects.json)
       │  └─ JSON.parse()
       │
       ├─ getFeaturedProjects()
       │  ├─ getCoreProjects() filtered by featured=true
       │  └─ Sort by order
       │
       └─ getProjectDetailContent(id)
          ├─ fs.readFileSync(profile-data/projects/{id}.md)
          └─ gray-matter(content) → content only

Page Rendering
    │
    ├─ website/pages/blog.tsx
    │  ├─ Displays: All blog posts grouped by year
    │  ├─ Filters: Category, subcategory
    │  └─ Sorts: By date
    │
    ├─ website/pages/blog/[slug].tsx
    │  ├─ Displays: Single blog post
    │  ├─ Components: TableOfContents, MarkdownRenderer
    │  └─ Navigation: Previous/Next post links
    │
    ├─ website/pages/work.tsx
    │  ├─ Displays: All projects (or featured)
    │  ├─ Grouped: By section
    │  └─ Highlights: Featured projects
    │
    └─ website/pages/work/[id].tsx
       ├─ Displays: Single project detail
       ├─ Shows: Title, role, tech_stack, achievements
       └─ Content: Detail markdown page

Static Export
    │
    └─ npm run build (next.config.js: output: 'export')
       ├─ Generates: website/out/ (static HTML/CSS/JS)
       ├─ All data embedded at build time
       ├─ No API runtime needed
       └─ Ready for GitHub Pages deployment
```

---

## Complete Workflow Timeline

```
TIME    │ EVENT
────────┼─────────────────────────────────────────────────────────────
00:00   │ GitHub Actions: sync-yuque.yml trigger (daily)
UTC     │
        │ → Runs: scripts/sync-yuque.ts
        │ → Updates: profile-data/blog/
        │ → Updates: tools/yuque-sync/sync-state.json
        │ → Updates: website/public/blog/images/
        │ → Commits to master (if changed)
        │ → Triggers: deploy.yml
────────┼─────────────────────────────────────────────────────────────
00:10   │ GitHub Actions: deploy.yml (blog sync complete)
UTC     │
        │ → Checks out master
        │ → npm install (website/)
        │ → npm run build
        │    ├─ Reads new blog posts
        │    ├─ Generates static pages
        │    └─ Output to website/out/
        │ → Upload artifact to GitHub Pages
        │ → Deploy live
        │
        │ LIVE SITE UPDATED with new blog content
────────┼─────────────────────────────────────────────────────────────
Mon     │ GitHub Actions: sync-yuque-work.yml trigger (weekly)
01:00   │
UTC     │ → Runs: scripts/sync-yuque-work.ts
        │ → Updates: profile-data/projects/
        │ → Updates: tools/yuque-sync/work-sync-state.json
        │ → Updates: website/public/work/images/
        │ → Commits to master (if changed)
        │ → Triggers: deploy.yml
────────┼─────────────────────────────────────────────────────────────
Mon     │ GitHub Actions: deploy.yml (work sync complete)
01:20   │
UTC     │ → Reads new projects
        │ → Generates static pages
        │ → Deploys live
        │
        │ LIVE SITE UPDATED with new project content
────────┴─────────────────────────────────────────────────────────────
```
