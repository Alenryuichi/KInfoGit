# Search Implementation - Code Reference Guide

## 1. Search Index Generation Script

**File:** `website/scripts/generate-search-index.ts`

### Complete Script
```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const profileDataDir = path.join(process.cwd(), '..', 'profile-data')
const outputDir = path.join(process.cwd(), 'public')
const outputFile = path.join(outputDir, 'search-index.json')

interface SearchItem {
  title: string
  description: string
  url: string
  category: string
  type: 'blog' | 'project'
}

async function generateIndex() {
  const searchIndex: SearchItem[] = []

  // 1. Process Blog Posts
  const blogDir = path.join(profileDataDir, 'blog')
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'))
    blogFiles.forEach(file => {
      const slug = file.replace(/\.md$/, '')
      const fullPath = path.join(blogDir, file)
      const content = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(content)
      
      searchIndex.push({
        title: data.title || slug,
        description: data.excerpt || '',
        url: `/blog/${slug}`,
        category: data.category || 'Blog',
        type: 'blog'
      })
    })
  }

  // 2. Process Projects
  const projectsPath = path.join(profileDataDir, 'projects', 'core-projects.json')
  if (fs.existsSync(projectsPath)) {
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'))
    projects.forEach((project: {
      title: { en?: string; zh?: string }
      description?: { en?: string; zh?: string }
      impact?: string
      id: string
      category?: string
    }) => {
      searchIndex.push({
        title: project.title.en || project.title.zh || 'Project',
        description: project.description?.en || project.description?.zh || project.impact || '',
        url: `/work/${project.id}`,
        category: project.category || 'Project',
        type: 'project'
      })
    })
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputFile, JSON.stringify(searchIndex, null, 2))
  console.log(`✅ Search index generated with ${searchIndex.length} items at ${outputFile}`)
}

generateIndex().catch(err => {
  console.error('❌ Failed to generate search index:', err)
  process.exit(1)
})
```

### Key Functions

#### Reading Blog Metadata
```typescript
const content = fs.readFileSync(fullPath, 'utf8')
const { data } = matter(content)
// Extracts frontmatter from markdown:
// ---
// title: "My Blog Post"
// excerpt: "A short description"
// category: "AI"
// ---
```

#### Reading Project Data
```typescript
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'))
// Returns array of project objects with multilingual support
```

---

## 2. Search UI Component

**File:** `website/components/Header.tsx` (partial)

### State Management
```typescript
import { useState, useEffect, useRef } from 'react'
import Fuse from 'fuse.js'

interface SearchItem {
  title: string
  description: string
  url: string
  category: string
  type: 'blog' | 'project'
}

export function Header({ onBookCallClick }: HeaderProps) {
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const fuseRef = useRef<Fuse<SearchItem> | null>(null)

  // ... rest of component
}
```

### Load Search Index Effect
```typescript
// Load search index when modal opens
useEffect(() => {
  if (isSearchOpen && !fuseRef.current) {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(data => {
        // Initialize Fuse with configuration
        fuseRef.current = new Fuse(data, {
          keys: ['title', 'description', 'category'],
          threshold: 0.3,           // Fuzzy matching tolerance
          includeMatches: true      // Track which parts matched
        })
      })
      .catch(err => console.error('Failed to load search index:', err))
  }
}, [isSearchOpen])
```

### Real-time Search Effect
```typescript
// Search as user types
useEffect(() => {
  if (fuseRef.current && searchQuery.trim()) {
    // Perform search and get results
    const results = fuseRef.current.search(searchQuery).map(r => r.item)
    
    // Limit to top 5 results
    setSearchResults(results.slice(0, 5))
  } else {
    setSearchResults([])
  }
}, [searchQuery])
```

### Keyboard Shortcut Handler
```typescript
// Keyboard shortcut: Cmd+K (Mac) or Ctrl+K (Windows/Linux)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setIsSearchOpen((prev) => !prev)
    }
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [])
```

### Search Submit Handler
```typescript
const handleSearchSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (searchResults.length > 0) {
    // Navigate to first result
    router.push(searchResults[0].url)
    setIsSearchOpen(false)
    setSearchQuery('')
  }
}
```

### Search Input JSX
```typescript
<form onSubmit={handleSearchSubmit}>
  <div className="relative group">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search blog posts, projects..."
      className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/[0.08] 
                 text-white placeholder-white/30 rounded-xl 
                 focus:border-white/20 focus:outline-none shadow-2xl 
                 transition-colors text-[15px]"
      autoFocus
    />
    <button
      type="submit"
      className="absolute right-3 top-1/2 transform -translate-y-1/2 
                 p-2 text-white/40 hover:text-white transition-colors"
    >
      <Search className="w-4 h-4" />
    </button>
  </div>
</form>
```

### Search Results Dropdown
```typescript
{/* Search Results Dropdown */}
{searchResults.length > 0 && (
  <div className="mt-3 bg-[#0a0a0a] border border-white/[0.08] 
                  rounded-xl overflow-hidden shadow-2xl 
                  animate-in fade-in slide-in-from-top-2 duration-200">
    <div className="max-h-[50vh] overflow-y-auto">
      {searchResults.map((result) => (
        <Link
          key={result.url}
          href={result.url}
          onClick={() => {
            setIsSearchOpen(false)
            setSearchQuery('')
          }}
          className="block px-5 py-4 hover:bg-white/[0.03] 
                     transition-colors border-b border-white/[0.04] 
                     last:border-0 group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-200 
                           group-hover:text-white transition-colors">
              {result.title}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md 
                           bg-white/[0.04] border border-white/[0.06] 
                           text-gray-400 uppercase tracking-widest font-mono">
              {result.type}
            </span>
          </div>
          <p className="text-[13px] text-gray-500 line-clamp-1">
            {result.description}
          </p>
        </Link>
      ))}
    </div>
  </div>
)}

{/* No Results Message */}
{searchQuery && searchResults.length === 0 && (
  <div className="mt-3 p-6 text-center bg-[#0a0a0a] 
                  border border-white/[0.08] rounded-xl 
                  text-gray-500 text-[13px] shadow-2xl">
    No results found for "{searchQuery}"
  </div>
)}
```

---

## 3. Build Configuration

**File:** `website/package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "prebuild": "tsx scripts/generate-search-index.ts",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "fuse.js": "^7.1.0",
    "gray-matter": "^4.0.3",
    "lucide-react": "^0.562.0",
    "framer-motion": "^12.24.12",
    "next": "^16.1.1",
    "react": "^19.2.3"
  }
}
```

### Key: prebuild Hook
```json
"prebuild": "tsx scripts/generate-search-index.ts"
```
This runs **before** `next build` command executes.

---

## 4. Fuse.js Configuration Options

### Current Configuration
```typescript
new Fuse(searchData, {
  // Which fields to search
  keys: ['title', 'description', 'category'],
  
  // Fuzzy matching tolerance (0-1)
  // 0 = exact match required
  // 1 = any match accepted
  // 0.3 = default, requires ~70% similarity
  threshold: 0.3,
  
  // Include which characters were matched
  includeMatches: true
})
```

### Advanced Options (available but not used)
```typescript
new Fuse(searchData, {
  keys: ['title', 'description', 'category'],
  threshold: 0.3,
  includeMatches: true,
  
  // Maximum distance between query and match
  // distance: 100,
  
  // Prefer matches at the beginning
  // location: 0,
  
  // Minimum characters needed to match
  // minMatchCharLength: 1,
  
  // Should search be case sensitive?
  // isCaseSensitive: false,
  
  // If true, searches for "exact" match first
  // ignoreLocation: false,
  
  // Whether to search text outside of keys
  // shouldSort: true
})
```

---

## 5. Example: Adding New Search Source

### Add Wiki/Documentation to Search

**Modify:** `website/scripts/generate-search-index.ts`

```typescript
async function generateIndex() {
  const searchIndex: SearchItem[] = []

  // ... existing blog posts code ...
  // ... existing projects code ...

  // 3. NEW: Process Wiki/Documentation
  const wikiDir = path.join(profileDataDir, 'wiki')
  if (fs.existsSync(wikiDir)) {
    const wikiFiles = fs.readdirSync(wikiDir)
      .filter(f => f.endsWith('.md'))
      .filter(f => !f.startsWith('.')) // Skip hidden files
    
    wikiFiles.forEach(file => {
      const slug = file.replace(/\.md$/, '')
      const fullPath = path.join(wikiDir, file)
      const content = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(content)
      
      searchIndex.push({
        title: data.title || slug,
        description: data.description || '',
        url: `/wiki/${slug}`,
        category: data.category || 'Documentation',
        type: 'wiki'  // NEW TYPE
      })
    })
  }

  // Write index file
  fs.writeFileSync(outputFile, JSON.stringify(searchIndex, null, 2))
}
```

### Update SearchItem Type

**Modify:** `website/components/Header.tsx` and `website/scripts/generate-search-index.ts`

```typescript
interface SearchItem {
  title: string
  description: string
  url: string
  category: string
  type: 'blog' | 'project' | 'wiki'  // NEW TYPE
}
```

### Update Result Display

**In search results JSX:**
```typescript
<span className="text-[11px] px-2 py-0.5 rounded-md 
                 bg-white/[0.04] border border-white/[0.06] 
                 text-gray-400 uppercase tracking-widest font-mono">
  {result.type.toUpperCase()}  {/* Displays: WIKI */}
</span>
```

---

## 6. Example: Adjusting Search Sensitivity

### Make Search More Strict (fewer results)
```typescript
// In Header.tsx, change threshold:
fuseRef.current = new Fuse(data, {
  keys: ['title', 'description', 'category'],
  threshold: 0.1,  // ← Was 0.3, now 0.1 (90% similarity required)
  includeMatches: true
})

// Result: Only very close matches will appear
```

### Make Search More Permissive (more results)
```typescript
// In Header.tsx, change threshold:
fuseRef.current = new Fuse(data, {
  keys: ['title', 'description', 'category'],
  threshold: 0.6,  // ← Was 0.3, now 0.6 (40% similarity required)
  includeMatches: true
})

// Result: More fuzzy/loose matches will appear
```

### Search More Fields
```typescript
// Currently searches title + description + category
// Add more fields:
fuseRef.current = new Fuse(data, {
  keys: [
    'title',        // High priority
    'description',  // Medium priority
    'category',     // Medium priority
    'url',          // Lower priority (less important)
    'tags'          // If tags array existed
  ],
  threshold: 0.3,
  includeMatches: true
})
```

---

## 7. Testing Search Functionality

### Manual Testing Checklist
```
□ Open page, press Cmd+K (Mac) or Ctrl+K (Windows)
  → Modal should appear, input focused

□ Type "ai"
  → Results containing "ai" should appear in dropdown
  
□ Type "ai agent"
  → Results with "AI Agent" should rank higher
  
□ Type "xyz123"
  → "No results found" message should appear
  
□ Click on a result
  → Should navigate to that page
  → Modal should close
  
□ Press Escape (implicit, via navigation)
  → Modal should close on navigation
  
□ Click outside modal (dark overlay)
  → Modal should close
  
□ Search again after closing
  → Should use cached Fuse instance
  → Search should be instant (not re-fetch index)
  
□ Test on mobile
  → Search button should appear (different icon)
  → Modal should be full-width on small screens
```

### Browser Console Debugging
```javascript
// Check if search index loads
fetch('/search-index.json')
  .then(r => r.json())
  .then(data => console.log(data))

// Check Fuse configuration
console.log('Fuse version:', Fuse.version)

// Manual Fuse search (in console)
const Fuse = window.Fuse  // If exposed globally (it's not by default)
// Will need to access via component state instead
```

---

## 8. Performance Optimization Tips

### Current Optimizations ✓
```typescript
// 1. Lazy load: Only fetch when modal opens
if (isSearchOpen && !fuseRef.current) {
  fetch('/search-index.json')  // Only happens once per session
}

// 2. Cache: Fuse instance reused
const fuseRef = useRef<Fuse<SearchItem> | null>(null)

// 3. Limit results: Max 5 displayed
setSearchResults(results.slice(0, 5))

// 4. Static generation: Index built at build-time
// No server requests needed
```

### Possible Future Optimizations
```typescript
// 1. Add debouncing for very large datasets
const [searchQuery, setSearchQuery] = useState('')
// Add 100-200ms debounce before calling Fuse.search()

// 2. Add result pagination
const [page, setPage] = useState(1)
const resultsPerPage = 5
const startIndex = (page - 1) * resultsPerPage
setSearchResults(results.slice(startIndex, startIndex + resultsPerPage))

// 3. Keyboard navigation (arrow keys)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % searchResults.length)
    }
    if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length)
    }
  }
  document.addEventListener('keydown', handleKeyDown)
}, [searchResults])

// 4. Highlight matching terms in results
// Currently using includeMatches: true but not displaying highlights
// Could wrap matching terms in <mark> tags

// 5. Add search analytics
// Track what users search for, which results they click
```

