# 🔍 Search Implementation Documentation

## 📚 Documentation Index

This folder contains comprehensive documentation about the global search feature implementation. Choose the document that best fits your needs:

### 1. **SEARCH_QUICK_REFERENCE.md** ⭐ **START HERE**
   - **Best for:** Quick answers to your questions
   - **Length:** ~5 min read
   - **Contains:**
     - Direct answers to the 4 main questions
     - Quick configuration tweaks
     - Common issues & solutions
     - Testing checklist
   - **When to use:** You need fast answers

### 2. **SEARCH_IMPLEMENTATION_SUMMARY.md** 
   - **Best for:** Mid-level technical overview
   - **Length:** ~8 min read
   - **Contains:**
     - Quick reference table
     - Build-time index generation
     - Search component responsibilities
     - Data flow architecture
     - Performance profile
   - **When to use:** You want to understand the architecture

### 3. **SEARCH_ANALYSIS.md**
   - **Best for:** Deep technical understanding
   - **Length:** ~15 min read
   - **Contains:**
     - Detailed generation process
     - Data sources breakdown
     - UI component complete analysis
     - Fuse.js configuration options
     - Performance considerations
     - Extensibility guide
   - **When to use:** You need to modify or extend the feature

### 4. **SEARCH_FLOW_DIAGRAMS.md**
   - **Best for:** Visual learners
   - **Length:** ~10 min read
   - **Contains:**
     - Build-time pipeline diagram
     - Runtime search flow diagram
     - Component state management diagram
     - Data structure visualization
     - Fuzzy search algorithm flow
     - Performance timeline
   - **When to use:** You prefer diagrams and visual explanations

### 5. **SEARCH_CODE_REFERENCE.md**
   - **Best for:** Developers implementing changes
   - **Length:** ~12 min read
   - **Contains:**
     - Complete code snippets
     - State management code
     - Fuse.js configuration examples
     - Adding new search sources example
     - Adjusting search sensitivity
     - Testing code examples
     - Performance optimization tips
   - **When to use:** You're writing or modifying code

---

## 🎯 Quick Navigation

### I want to understand...

**The big picture:**
→ Start with **SEARCH_QUICK_REFERENCE.md** (10 min)
→ Then **SEARCH_IMPLEMENTATION_SUMMARY.md** (10 min)

**The implementation details:**
→ Read **SEARCH_ANALYSIS.md** (20 min)
→ Reference **SEARCH_CODE_REFERENCE.md** for code (30 min)

**How it works visually:**
→ Look at **SEARCH_FLOW_DIAGRAMS.md** (15 min)

**Specific aspects:**

- **Index generation?** → SEARCH_QUICK_REFERENCE.md #1
- **UI component?** → SEARCH_QUICK_REFERENCE.md #2
- **Search algorithm?** → SEARCH_QUICK_REFERENCE.md #3
- **Data sources?** → SEARCH_QUICK_REFERENCE.md #4
- **Building a similar feature?** → SEARCH_ANALYSIS.md sections 1 & 4
- **Modifying search sensitivity?** → SEARCH_CODE_REFERENCE.md #6
- **Adding new content type?** → SEARCH_ANALYSIS.md #9
- **Performance details?** → SEARCH_ANALYSIS.md #5

---

## 📋 Direct Answers to Your Questions

### 1. How is search-index.json generated?

**File:** `website/scripts/generate-search-index.ts`

**Trigger:** Build-time TypeScript script via `prebuild` npm hook

**Process:**
```
npm run build
  ↓
"prebuild": "tsx scripts/generate-search-index.ts"
  ↓
Read profile-data/blog/*.md + profile-data/projects/core-projects.json
  ↓
Generate website/public/search-index.json
  ↓
Continue with "next build"
```

**Not getStaticProps** - This is a plain Node.js script that runs during the build process.

👉 See **SEARCH_QUICK_REFERENCE.md** section 1 for more details.

---

### 2. What component handles the search UI?

**Component:** `website/components/Header.tsx`

**Features:**
- Modal-based search interface
- Keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows)
- Real-time results as you type
- Max 5 results displayed
- Search button (desktop + mobile)
- Responsive design

👉 See **SEARCH_QUICK_REFERENCE.md** section 2 or **SEARCH_CODE_REFERENCE.md** #2 for complete code.

---

### 3. How does the search logic work?

**Algorithm:** Client-side fuzzy search using **Fuse.js** v7.1.0

**Process:**
1. Modal opens → Fetch `/search-index.json`
2. Initialize Fuse with: `keys: ['title', 'description', 'category']`, `threshold: 0.3`
3. User types → Real-time search via `Fuse.search(query)`
4. Results filtered to top 5 and sorted by relevance
5. User clicks → `router.push(url)` navigates

**100% client-side** - No API calls, no server involvement.

👉 See **SEARCH_QUICK_REFERENCE.md** section 3 or **SEARCH_CODE_REFERENCE.md** #4 for configuration options.

---

### 4. What data sources feed into the search index?

**Two sources:**

**1. Blog Posts:** `profile-data/blog/*.md`
- Extract via gray-matter: title, excerpt (→ description), category
- URL: `/blog/{slug}`
- Currently: ~10 posts

**2. Projects:** `profile-data/projects/core-projects.json`
- Extract: title.en/.zh, description.en/.zh (or impact fallback), category, id
- URL: `/work/{id}`
- Currently: ~6 projects

👉 See **SEARCH_QUICK_REFERENCE.md** section 4 or **SEARCH_ANALYSIS.md** #1 for detailed breakdown.

---

## 🔧 Common Tasks

### Add a new search source (e.g., Wiki)

1. Read: **SEARCH_ANALYSIS.md** section 9
2. Code: **SEARCH_CODE_REFERENCE.md** section 5
3. Example: Add wiki folder processing to `generate-search-index.ts`

### Adjust search sensitivity

1. Read: **SEARCH_QUICK_REFERENCE.md** "Quick Configuration Tweaks"
2. Code: **SEARCH_CODE_REFERENCE.md** section 6
3. Action: Modify `threshold` in Header.tsx Fuse configuration

### Understand the complete flow

1. Start: **SEARCH_FLOW_DIAGRAMS.md**
2. Details: **SEARCH_ANALYSIS.md**
3. Reference: **SEARCH_CODE_REFERENCE.md**

### Debug search issues

1. Read: **SEARCH_QUICK_REFERENCE.md** "Common Issues & Solutions"
2. Test: **SEARCH_CODE_REFERENCE.md** section 7
3. Deep dive: **SEARCH_ANALYSIS.md** section 5

---

## 🎓 Learning Paths

### Path 1: Quick Understanding (15 minutes)
1. **SEARCH_QUICK_REFERENCE.md** - Read all 4 question answers
2. **SEARCH_QUICK_REFERENCE.md** - Glance at state diagram
3. **Done!** You now understand the implementation

### Path 2: Complete Technical Review (45 minutes)
1. **SEARCH_QUICK_REFERENCE.md** - Full read (10 min)
2. **SEARCH_IMPLEMENTATION_SUMMARY.md** - Full read (10 min)
3. **SEARCH_FLOW_DIAGRAMS.md** - All diagrams (10 min)
4. **SEARCH_ANALYSIS.md** - Sections 1-4 (15 min)

### Path 3: Ready to Modify (90 minutes)
1. Path 2 above (45 min)
2. **SEARCH_ANALYSIS.md** - Sections 5-9 (15 min)
3. **SEARCH_CODE_REFERENCE.md** - Full read (20 min)
4. Review actual files: Header.tsx, generate-search-index.ts (10 min)

### Path 4: Building Similar Feature (120 minutes)
1. Path 3 above (90 min)
2. Study **SEARCH_CODE_REFERENCE.md** sections 1 & 2 (15 min)
3. Review `search-index.json` structure (5 min)
4. Plan your implementation (10 min)

---

## 📁 Source Files

### Essential Files
- `website/scripts/generate-search-index.ts` - Index generator
- `website/components/Header.tsx` - Search UI & logic
- `website/public/search-index.json` - Generated index
- `website/package.json` - Build configuration

### Data Sources
- `profile-data/blog/*.md` - Blog posts
- `profile-data/projects/core-projects.json` - Projects

---

## ⚡ Key Facts

| Aspect | Value |
|--------|-------|
| **Generation** | Build-time script (prebuild hook) |
| **Index location** | `website/public/search-index.json` |
| **Search library** | Fuse.js v7.1.0 |
| **Execution** | 100% client-side |
| **Fuzzy threshold** | 0.3 (70% similarity) |
| **Max results** | 5 items |
| **Keyboard shortcut** | Cmd+K / Ctrl+K |
| **Time to generate** | ~1 second |
| **Time to search** | ~2ms per query |
| **Index size** | ~50KB |
| **API calls** | 0 (no server involved) |

---

## 🆘 Quick Help

**I want to...**
- Understand the system → Read SEARCH_QUICK_REFERENCE.md
- See how it works → Look at SEARCH_FLOW_DIAGRAMS.md
- Modify the code → Use SEARCH_CODE_REFERENCE.md
- Learn deeply → Study SEARCH_ANALYSIS.md
- Know the architecture → Read SEARCH_IMPLEMENTATION_SUMMARY.md

---

## 📞 File Cross-References

### If reading SEARCH_QUICK_REFERENCE.md
- Need code examples? → SEARCH_CODE_REFERENCE.md
- Need more detail? → SEARCH_ANALYSIS.md
- Need visuals? → SEARCH_FLOW_DIAGRAMS.md
- Need overview? → SEARCH_IMPLEMENTATION_SUMMARY.md

### If reading SEARCH_ANALYSIS.md
- Need quick answers? → SEARCH_QUICK_REFERENCE.md
- Need code samples? → SEARCH_CODE_REFERENCE.md
- Need diagrams? → SEARCH_FLOW_DIAGRAMS.md

### If reading SEARCH_FLOW_DIAGRAMS.md
- Need text explanations? → SEARCH_ANALYSIS.md
- Need quick answers? → SEARCH_QUICK_REFERENCE.md
- Need code? → SEARCH_CODE_REFERENCE.md

### If reading SEARCH_CODE_REFERENCE.md
- Need algorithm explanation? → SEARCH_ANALYSIS.md #3
- Need to extend? → SEARCH_ANALYSIS.md #9
- Need quick answers? → SEARCH_QUICK_REFERENCE.md

### If reading SEARCH_IMPLEMENTATION_SUMMARY.md
- Need deep dive? → SEARCH_ANALYSIS.md
- Need more detail? → SEARCH_FLOW_DIAGRAMS.md + SEARCH_CODE_REFERENCE.md
- Need quick overview? → SEARCH_QUICK_REFERENCE.md

---

## ✅ Documentation Checklist

- [x] Quick reference for common questions
- [x] Detailed technical analysis
- [x] Visual flow diagrams
- [x] Complete code examples
- [x] Implementation summary
- [x] Performance details
- [x] Extension guide
- [x] Troubleshooting tips
- [x] Learning paths
- [x] Quick navigation guide

---

**Last Updated:** April 2026

**Created by:** Comprehensive Search Implementation Analysis

**Total Documentation:** 5 files, ~75KB, covering every aspect of the search feature
