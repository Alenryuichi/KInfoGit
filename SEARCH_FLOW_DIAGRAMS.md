# Search Implementation - Visual Flow Diagrams

## 1. Build-Time Index Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                      npm run build                                   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  prebuild hook runs  │
                    │ (package.json)       │
                    └──────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────────┐
        │    generate-search-index.ts (TypeScript)         │
        └──────────────────────────────────────────────────┘
              │                                     │
              ▼                                     ▼
    ┌─────────────────────┐          ┌──────────────────────────┐
    │ profile-data/blog   │          │ profile-data/projects/   │
    │ ├── 2026-03-06*.md  │          │ └── core-projects.json   │
    │ ├── 2026-04-06*.md  │          │                          │
    │ └── ... (10+ posts) │          │ {                        │
    │                     │          │   "id": "betaline",      │
    │ Extract via         │          │   "title": {...},        │
    │ gray-matter:        │          │   "description": {...}   │
    │ - title             │          │ }                        │
    │ - excerpt           │          │                          │
    │ - category          │          │ Extract:                 │
    └─────────────────────┘          │ - title.en/.zh           │
           │                         │ - description.en/.zh     │
           │                         │ - impact (fallback)      │
           │                         │ - category               │
           │                         │ - id → /work/{id}        │
           │                         └──────────────────────────┘
           │                                     │
           └─────────────────────┬───────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │  SearchItem[]            │
                    │ ┌────────────────────┐   │
                    │ │ {                  │   │
                    │ │   title: string    │   │
                    │ │   description: str │   │
                    │ │   url: string      │   │
                    │ │   category: string │   │
                    │ │   type: 'blog'|    │   │
                    │ │         'project'  │   │
                    │ │ }                  │   │
                    │ │ ... (13+ items)    │   │
                    │ └────────────────────┘   │
                    └──────────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────┐
                    │ website/public/              │
                    │ search-index.json            │
                    │ (static asset ~50KB)         │
                    └──────────────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────┐
                    │    next build continues      │
                    │    (HTML, CSS, JS export)    │
                    └──────────────────────────────┘
```

---

## 2. Runtime Search Flow

```
┌────────────────────────────────────────────────────────────────┐
│                      Browser Runtime                           │
└────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
    ┌─────────┐         ┌─────────┐         ┌──────────┐
    │ Click   │         │ Cmd+K / │         │   Page   │
    │ Search  │         │ Ctrl+K  │         │  Search  │
    │ Button  │         │ Pressed │         │  Button  │
    └────┬────┘         └────┬────┘         └────┬─────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │ isSearchOpen = true         │
                │ Show modal & input          │
                └────────────────────────────┘
                             │
                             ▼
          ┌──────────────────────────────────────┐
          │  Is Fuse instance cached?            │
          └──────────────────────────────────────┘
                     │                    │
            Yes ◄─────┘                    └─────► No
            │                                      │
            │                                      ▼
            │                          ┌──────────────────────┐
            │                          │ fetch('/search-      │
            │                          │ index.json')         │
            │                          └──────────────────────┘
            │                                      │
            │                                      ▼
            │                          ┌──────────────────────┐
            │                          │ Initialize Fuse      │
            │                          │ new Fuse(data, {     │
            │                          │  keys: ['title',     │
            │                          │         'desc',      │
            │                          │         'category']  │
            │                          │  threshold: 0.3      │
            │                          │ })                   │
            │                          └──────────────────────┘
            │                                      │
            └──────────────────┬───────────────────┘
                               │
                               ▼
                ┌────────────────────────────┐
                │ User typing in input       │
                │ (searchQuery state)        │
                └────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
            Empty?                       Content?
            │                             │
            │                             ▼
            │                 ┌────────────────────────┐
            │                 │ Fuse.search(query)     │
            │                 │ Perform fuzzy matching │
            │                 │ on title, description, │
            │                 │ category fields        │
            │                 └────────────────────────┘
            │                             │
            │                             ▼
            │                 ┌────────────────────────┐
            │                 │ Sort results by        │
            │                 │ relevance score        │
            │                 └────────────────────────┘
            │                             │
            │                             ▼
            │                 ┌────────────────────────┐
            │                 │ Take first 5 results   │
            │                 │ limit = 5              │
            │                 └────────────────────────┘
            │                             │
            ▼                             ▼
    ┌─────────────────────┐    ┌────────────────────────┐
    │ searchResults = []   │    │ searchResults =        │
    │ No dropdown shown    │    │ [{title, desc, ...}]  │
    └─────────────────────┘    │ Display dropdown       │
                               │ (scrollable max 50vh)  │
                               └────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
                    ▼                                         ▼
            ┌──────────────────┐                   ┌──────────────────┐
            │ User clicks       │                   │ User presses     │
            │ on a result       │                   │ Enter / Submit   │
            │ (Link click)      │                   │                  │
            └──────────────────┘                   └──────────────────┘
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────────┐
                           │ router.push(result.url)     │
                           │ Navigate to blog post /     │
                           │ project page                │
                           └─────────────────────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────────┐
                           │ isSearchOpen = false        │
                           │ Close modal                 │
                           │ Clear searchQuery           │
                           └─────────────────────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────────┐
                           │ Browser navigates to        │
                           │ selected content page       │
                           └─────────────────────────────┘
```

---

## 3. Component State Management

```
┌───────────────────────────────────────────────────────────────┐
│                     Header Component                          │
│                   (components/Header.tsx)                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Search State Variables:                                      │
│  ┌──────────────────────────────────────────────────────┐     │
│  │                                                      │     │
│  │  const [isSearchOpen, setIsSearchOpen] = useState    │     │
│  │  • Tracks modal visibility                          │     │
│  │  • false → modal hidden                             │     │
│  │  • true → modal visible                             │     │
│  │                                                      │     │
│  │  const [searchQuery, setSearchQuery] = useState      │     │
│  │  • Current search input text                        │     │
│  │  • Updated on every keystroke                       │     │
│  │  • Triggers search effect                           │     │
│  │                                                      │     │
│  │  const [searchResults, setSearchResults] =          │     │
│  │    useState<SearchItem[]>                           │     │
│  │  • Search result items (max 5)                      │     │
│  │  • Empty array if no matches                        │     │
│  │  • Updated on query change                          │     │
│  │                                                      │     │
│  │  const fuseRef = useRef<Fuse<SearchItem> | null>    │     │
│  │  • Caches Fuse instance                             │     │
│  │  • Persists across renders                          │     │
│  │  • Null until modal opened                          │     │
│  │                                                      │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                               │
│  Effects:                                                     │
│  ┌──────────────────────────────────────────────────────┐     │
│  │                                                      │     │
│  │  1. Load Search Index                              │     │
│  │     Trigger: isSearchOpen changes                   │     │
│  │     Action: fetch('/search-index.json')             │     │
│  │     Result: fuseRef.current initialized             │     │
│  │                                                      │     │
│  │  2. Real-time Search                               │     │
│  │     Trigger: searchQuery changes                    │     │
│  │     Action: fuseRef.current.search(query)           │     │
│  │     Result: setSearchResults(top 5)                 │     │
│  │                                                      │     │
│  │  3. Keyboard Shortcut                              │     │
│  │     Trigger: Cmd+K or Ctrl+K                        │     │
│  │     Action: Toggle isSearchOpen                     │     │
│  │     Result: Modal open/close                        │     │
│  │                                                      │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 4. Data Structure in search-index.json

```
website/public/search-index.json
│
├─ [0] Blog Entry
│  ├─ title: "Page Agent 深度技术分析报告"
│  ├─ description: "本文是一份关于阿里巴巴开源项目..."
│  ├─ url: "/blog/2026-03-06-page-agent-深度技术分析报告"
│  ├─ category: "研究"
│  └─ type: "blog"
│
├─ [1] Blog Entry
│  ├─ title: "AI-Native Corp"
│  ├─ description: "本文探讨了AI Native公司的核心定义..."
│  ├─ url: "/blog/2026-04-06-ai-native-corp"
│  ├─ category: "AI"
│  └─ type: "blog"
│
├─ [2-9] ... more blog entries
│
├─ [10] Project Entry
│  ├─ title: "Betaline - Full-stack iOS Climbing App"
│  ├─ description: "Betaline is a climbing iOS app..."
│  ├─ url: "/work/betaline"
│  ├─ category: "mobile-app"
│  └─ type: "project"
│
├─ [11] Project Entry
│  ├─ title: "OpenMemory Plus - AI Agent Dual-Layer..."
│  ├─ description: "OpenMemory Plus is a dual-layer..."
│  ├─ url: "/work/openmemory-plus"
│  ├─ category: "ai-agent"
│  └─ type: "project"
│
└─ [12-13] ... more project entries
```

---

## 5. Fuzzy Search Algorithm Flow

```
User Query: "ai agent"
     │
     ▼
┌─────────────────────────────────────────┐
│  Fuse Configuration:                    │
│  - keys: ['title', 'desc', 'category']  │
│  - threshold: 0.3 (0-1 scale)           │
│  - includeMatches: true                 │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  For each SearchItem in index:          │
│  1. Search 'title' for "ai agent"       │
│  2. Search 'description' for same       │
│  3. Search 'category' for same          │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Match Evaluation:                      │
│                                         │
│  Item: "OpenMemory Plus..."             │
│  - Title has "AI Agent" ✓               │
│  - Description has "AI Agents" ✓        │
│  - Category: "ai-agent" ✓               │
│  Score: 0.95 (95% match)                │
│                                         │
│  Item: "Portrait Platform..."           │
│  - Title: no match ✗                    │
│  - Description: no match ✗              │
│  - Category: no match ✗                 │
│  Score: 0.0 (no match)                  │
│                                         │
│  Item: "Risk Control AI Agent..."       │
│  - Title has "AI Agent" ✓               │
│  - Description has "Agent" ✓            │
│  - Category: "ai-agent" ✓               │
│  Score: 0.90 (90% match)                │
│                                         │
│  Item: "Betaline Climbing App..."       │
│  - Title: partial (fuzzy) ✓             │
│  - Description: no match ✗              │
│  - Category: no match ✗                 │
│  Score: 0.35 (35% match > 0.3 ✓)        │
│                                         │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Filter by threshold (0.3):             │
│  Keep only items with score > 0.3       │
│  - OpenMemory Plus (0.95) ✓             │
│  - Risk Control AI Agent (0.90) ✓       │
│  - Betaline Climbing (0.35) ✓           │
│  - Portrait Platform (0.0) ✗            │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Sort by relevance score (descending):  │
│  1. OpenMemory Plus (0.95)              │
│  2. Risk Control AI Agent (0.90)        │
│  3. Betaline Climbing (0.35)            │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Return top 5 (or fewer):               │
│  searchResults = [                      │
│    OpenMemory Plus,                     │
│    Risk Control AI Agent,               │
│    Betaline Climbing                    │
│  ]                                      │
│  (Limited to first 5, now only 3)       │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Display in dropdown with:              │
│  - Result title                         │
│  - Type badge (BLOG / PROJECT)          │
│  - Description preview (line-clamp-1)  │
│  - Hover effects (bg-white/[0.03])      │
└─────────────────────────────────────────┘
```

---

## 6. Performance Timeline

```
TIME    │ ACTION
────────┼─────────────────────────────────────────────────────────
 T=0    │ npm run build starts
        │
 T+1s   │ prebuild hook: generate-search-index.ts runs
        │ ├─ Read profile-data/blog (10 files)
        │ ├─ Read profile-data/projects/core-projects.json
        │ └─ Write website/public/search-index.json (~50KB)
        │
 T+2s   │ next build starts
        │ └─ Bundles JS/CSS, includes search-index.json
        │
 T+15s  │ Build complete: HTML/CSS/JS exported
        │
════════╪═════════════════════════════════════════════════════════
BROWSER │ RUNTIME
════════╪═════════════════════════════════════════════════════════
 0ms    │ Page loads
        │ • HTML parsed
        │ • JS bundle loaded
        │ • search-index.json is static asset (not loaded yet)
        │
 +100ms │ Header component mounted
        │ • fuseRef = null (Fuse not initialized)
        │ • isSearchOpen = false
        │
 +500ms │ User presses Cmd+K
        │ • isSearchOpen = true
        │ • Modal appears (fast)
        │
 +510ms │ useEffect triggers
        │ • fetch('/search-index.json') starts
        │
 +550ms │ search-index.json loaded (1KB file, ~50KB on disk)
        │ • fuseRef.current = new Fuse(data, config)
        │ • Fuse initialization: ~5ms
        │ • Ready for search
        │
 +600ms │ User types first character: "a"
        │ • searchQuery = "a"
        │ • Fuse.search("a") executes (~2ms)
        │ • Returns ~8 matches > 0.3 threshold
        │ • Slice to top 5
        │ • Display in dropdown
        │
 +650ms │ User types second character: "i"
        │ • searchQuery = "ai"
        │ • Fuse.search("ai") executes (~2ms)
        │ • Returns ~5 matches > 0.3 threshold
        │ • Display updated results
        │
 +700ms │ User types third character: " a"
        │ • searchQuery = "ai a"
        │ • Fuse.search("ai a") executes (~2ms)
        │ • Returns ~3 exact matches
        │ • Display final results
        │
 +750ms │ User clicks on first result
        │ • router.push("/work/openmemory-plus")
        │ • Navigation starts
        │ • Modal closes
        │
 +850ms │ New page loaded and displayed
```

