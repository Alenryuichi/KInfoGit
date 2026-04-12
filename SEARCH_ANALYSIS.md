# Global Search Feature Implementation Analysis

## Overview
The Next.js website implements a global search feature that allows users to search through blog posts and projects. The search is **client-side based** with a **pre-generated static index** built at compile time.

---

## 1. Search Index Generation

### How It's Generated: Build-Time Script (Pre-build Step)

**Location:** `website/scripts/generate-search-index.ts`

**Trigger:** 
- The script runs as a **prebuild hook** in the build pipeline
- Defined in `package.json`: `"prebuild": "tsx scripts/generate-search-index.ts"`
- Executes BEFORE `next build`

**Process Flow:**
```
npm run build → prebuild script runs → generate-search-index.ts → search-index.json created → next build uses it
```

**Implementation Details:**

```typescript
// Data sources
const profileDataDir = path.join(process.cwd(), '..', 'profile-data')
const outputDir = path.join(process.cwd(), 'public')
const outputFile = path.join(outputDir, 'search-index.json')

// SearchItem interface
interface SearchItem {
  title: string
  description: string
  url: string
  category: string
  type: 'blog' | 'project'
}
```

### Data Sources

#### 1. **Blog Posts**
- **Location:** `profile-data/blog/` (Markdown files)
- **Processing:** Reads all `.md` files and extracts frontmatter using `gray-matter`
- **Extracted Fields:**
  - `title` from frontmatter or filename
  - `excerpt` as description
  - `category` from frontmatter
  - URL: `/blog/{slug}` (slug = filename without .md)

**Example Blog Entries in Index:**
```json
{
  "title": "Page Agent 深度技术分析报告",
  "description": "本文是一份关于阿里巴巴开源项目 Page Agent 的深度技术分析报告...",
  "url": "/blog/2026-03-06-page-agent-深度技术分析报告",
  "category": "研究",
  "type": "blog"
}
```

#### 2. **Projects**
- **Location:** `profile-data/projects/core-projects.json` (JSON file)
- **Processing:** Reads JSON and transforms each project into a search item
- **Extracted Fields:**
  - `title` (supports multilingual: `title.en` or `title.zh`)
  - `description` (supports multilingual)
  - `impact` as fallback for description
  - `category` from project data
  - URL: `/work/{project.id}`

**Example Project Entry in Index:**
```json
{
  "title": "OpenMemory Plus - AI Agent Dual-Layer Memory Framework",
  "description": "OpenMemory Plus is a dual-layer memory framework designed for AI Agents...",
  "url": "/work/openmemory-plus",
  "category": "ai-agent",
  "type": "project"
}
```

### Output File
- **Location:** `website/public/search-index.json`
- **Format:** JSON array of SearchItem objects
- **Size:** Currently 114 entries (13 projects + ~10 blog posts)
- **Included in:** Static export (available to client)

---

## 2. Search UI Component

### Component: Header Component

**Location:** `website/components/Header.tsx`

**Key Features:**
1. Search button in header (desktop and mobile variants)
2. Global keyboard shortcut: **Cmd+K** (Mac) or **Ctrl+K** (Windows/Linux)
3. Modal-based search interface
4. Real-time search results

### Search UI Layout
```
┌─────────────────────────────────────────┐
│  Search Modal (fixed top-center)        │
│  ┌─────────────────────────────────────┐│
│  │ 🔍 Search blog posts, projects... ⌘K││  <- Search input
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ Result 1: Title       [BLOG/PROJECT] ││
│  │ description preview...                ││
│  │─────────────────────────────────────││
│  │ Result 2: Title       [BLOG/PROJECT] ││
│  │ description preview...                ││
│  │─────────────────────────────────────││
│  │ Result 3: Title       [BLOG/PROJECT] ││
│  │ description preview...                ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### State Management (in Header component)

```typescript
const [isSearchOpen, setIsSearchOpen] = useState(false)      // Modal visibility
const [searchQuery, setSearchQuery] = useState('')           // User input
const [searchResults, setSearchResults] = useState<SearchItem[]>([])  // Results
const fuseRef = useRef<Fuse<SearchItem> | null>(null)       // Fuse instance (cached)
```

### UI Interactions

**Opening Search:**
```typescript
// Button click
<button onClick={() => setIsSearchOpen(true)}>Search</button>

// Keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setIsSearchOpen((prev) => !prev)
    }
  }
  document.addEventListener('keydown', handleKeyDown)
}, [])
```

**Closing Search:**
- Click outside modal (dark overlay)
- Select a result
- Press Escape implicitly via Next Link navigation

**Result Navigation:**
```typescript
<Link
  href={result.url}
  onClick={() => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }}
>
```

---

## 3. Search Logic: Fuzzy Search Implementation

### Library Used: **Fuse.js**
- Version: `^7.1.0` (in package.json)
- Type: Client-side fuzzy search library
- No external API calls

### Search Algorithm Configuration

```typescript
// Load search index on demand (when modal opens)
useEffect(() => {
  if (isSearchOpen && !fuseRef.current) {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(data => {
        fuseRef.current = new Fuse(data, {
          keys: ['title', 'description', 'category'],  // Search these fields
          threshold: 0.3,                               // Fuzzy matching tolerance
          includeMatches: true                          // Include match positions
        })
      })
      .catch(err => console.error('Failed to load search index:', err))
  }
}, [isSearchOpen])
```

### Key Configuration Options

| Option | Value | Explanation |
|--------|-------|-------------|
| `keys` | `['title', 'description', 'category']` | Searchable fields - searches across all three |
| `threshold` | `0.3` | Fuzzy tolerance (0-1): 0.3 = 70% similarity required for match |
| `includeMatches` | `true` | Tracks which parts matched (useful for highlighting) |

### Search Process

**Step 1: Real-time Filtering**
```typescript
useEffect(() => {
  if (fuseRef.current && searchQuery.trim()) {
    const results = fuseRef.current.search(searchQuery).map(r => r.item)
    setSearchResults(results.slice(0, 5))  // Limit to 5 results
  } else {
    setSearchResults([])
  }
}, [searchQuery])
```

**Step 2: Result Handling**
- Triggers on every keystroke (real-time)
- Returns only top 5 results
- Empty when query is empty
- No pagination (fixed 5-result limit)

**Step 3: Form Submission**
```typescript
const handleSearchSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (searchResults.length > 0) {
    router.push(searchResults[0].url)  // Navigate to first result
    setIsSearchOpen(false)
    setSearchQuery('')
  }
}
```

### Search Behavior Examples

| Query | Match Type | Threshold Explanation |
|-------|------------|----------------------|
| "AI Agent" | Exact/Near match | Both words found (title/description) |
| "agent" | Substring match | Fuzzy finds "Agent" despite case |
| "agnt" | Fuzzy match | 75% similarity (3/4 chars) ✓ passes 0.3 threshold |
| "ai native corp" | Multi-term | Finds blog post "AI-Native Corp" |

---

## 4. Data Flow Architecture

### Complete Flow Diagram

```
Build Time (npm run build)
│
├─► generate-search-index.ts
│   ├─► Read profile-data/blog/*.md (gray-matter)
│   ├─► Read profile-data/projects/core-projects.json
│   └─► Generate website/public/search-index.json
│
└─► next build
    └─► Static HTML/CSS/JS exported

Runtime (Browser)
│
├─► Page Load
│   └─► search-index.json is part of static assets
│
└─► User opens search modal (Cmd+K)
    ├─► fetch('/search-index.json') - load index
    ├─► Initialize Fuse instance with config
    └─► Ready for searching
    
    └─► User types query
        ├─► Fuse.search(query) - client-side fuzzy search
        ├─► Filter top 5 results
        ├─► Display in results dropdown
        │
        └─► User selects result or presses Enter
            └─► Next router.push(url) - navigate
```

### Caching Strategy

```typescript
const fuseRef = useRef<Fuse<SearchItem> | null>(null)

// Fuse instance is loaded ONCE when search modal first opens
// Cached in useRef and reused for all subsequent searches in same session
// Not reloaded on close/reopen during same page session
```

---

## 5. Performance Considerations

### Strengths ✅
- **Static generation:** Index created at build time, no runtime overhead
- **Client-side search:** No network calls during search (except initial index load)
- **Lazy loading:** Search index fetched only when modal opens
- **Caching:** Fuse instance cached and reused
- **Limited results:** Fixed 5-result limit reduces DOM rendering
- **Optimized library:** Fuse.js is efficient for small-to-medium datasets

### Potential Optimizations
- **Result count:** Could make configurable or paginated for large datasets
- **Debouncing:** Currently searches on every keystroke (fine for current size)
- **Keyboard shortcuts:** Could add arrow keys for result navigation
- **Highlighting:** Could highlight matching terms in results (currently only shows)

---

## 6. Search Index Content Summary

**Current Index (search-index.json):**

### Blog Posts (10 entries)
- "Page Agent 深度技术分析报告" (Research)
- "AI-Native Corp" (AI)
- "Karpathy知识编辑有感" (Essays)
- "为什么 Harness?" (Harness)
- "近日阅读" (Sharing)
- "LLM-utils" (Sharing)
- "Polanyi-we know more wo can tell" (Essays)
- "am i losing my ability?" (Essays)
- "chunk中的内容怎么影响Embedding空间" (Research)
- "HTML嵌入测试" (Life)

### Projects (4+ entries)
- "HTML Embedding Test" (web-testing)
- "Betaline - Full-stack iOS Climbing App" (mobile-app)
- "OpenMemory Plus" (ai-agent)
- "Self-built Application Anti-fraud Governance" (system-architecture)
- "Portrait Platform" (system-architecture)
- "Risk Control Review Large Model AI Agent" (ai-agent)

---

## 7. Key Dependencies

```json
{
  "fuse.js": "^7.1.0",           // Client-side fuzzy search
  "gray-matter": "^4.0.3",       // Extract frontmatter from MD
  "next": "^16.1.1",             // Framework
  "react": "^19.2.3",            // UI
  "lucide-react": "^0.562.0",    // Search icon
  "framer-motion": "^12.24.12"   // Modal animations
}
```

---

## 8. File Structure Summary

```
website/
├── scripts/
│   └── generate-search-index.ts       # ← Index generation script
├── components/
│   └── Header.tsx                      # ← Search UI & logic
├── public/
│   └── search-index.json              # ← Generated output
├── package.json                        # ← "prebuild" hook
└── next.config.js
```

---

## 9. Configuration & Extensibility

### Adding New Search Sources

To add new content to search (e.g., projects, resources), modify `generate-search-index.ts`:

```typescript
// Example: Add Wiki/Documentation
const wikiDir = path.join(profileDataDir, 'wiki')
if (fs.existsSync(wikiDir)) {
  const wikiFiles = fs.readdirSync(wikiDir).filter(f => f.endsWith('.md'))
  wikiFiles.forEach(file => {
    // Extract and add to searchIndex
    searchIndex.push({
      title: ...,
      description: ...,
      url: ...,
      category: 'Wiki',
      type: 'wiki'  // Add new type
    })
  })
}
```

### Adjusting Search Behavior

```typescript
// In Header.tsx, modify Fuse configuration:
new Fuse(data, {
  keys: ['title', 'description', 'category'],
  threshold: 0.3,           // ← Lower = stricter, Higher = more permissive
  includeMatches: true,
  
  // Optional additions:
  // distance: 100,         // How far apart matches can be
  // location: 0,           // Prefer matches at start
  // minMatchCharLength: 1  // Minimum char to match
})
```

### Adjusting Result Limit

```typescript
// In Header.tsx search effect:
setSearchResults(results.slice(0, 5))  // ← Change 5 to desired limit
```

---

## 10. Summary Table

| Aspect | Implementation |
|--------|-----------------|
| **Generation** | Build-time TypeScript script (prebuild hook) |
| **Index Location** | `website/public/search-index.json` |
| **Search Library** | Fuse.js (fuzzy search) |
| **Search Execution** | 100% client-side |
| **Data Sources** | Blog posts (MD) + Projects (JSON) |
| **UI Component** | Header.tsx modal |
| **Keyboard Shortcut** | Cmd+K / Ctrl+K |
| **Result Limit** | 5 results max |
| **Fuzzy Threshold** | 0.3 (70% similarity) |
| **Caching** | Fuse instance cached in useRef |
| **Performance** | Lazy load index on modal open |

