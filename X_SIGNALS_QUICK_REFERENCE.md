# Quick Reference: X Signals Pipeline

## Core Flow
```
X API → fetch-x-signals.ts → profile-data/x-signals/{date}.json
                                      ↓
                    generate-people-data.ts (aggregates)
                                      ↓
                      profile-data/people-activity/{id}.json
                                      ↓
                    website/lib/social-feeds.ts (displays)
```

## Fetch Script Template (fetch-x-signals.ts)

```typescript
// 1. FETCH from API
async function fetchUserPosts(handle: string): Promise<XPost[]> {
  // Call X API v2
  // Error handling: warn on 403 (rate limit), return []
}

// 2. DEEPSEEK TAGGING
async function generateCommentary(post: XPost): Promise<{
  highlights: string
  worthReading: string
  tags: string[]
}> {
  // POST to https://api.deepseek.com/chat/completions
  // model: 'deepseek-chat', temperature: 0.7, max_tokens: 300
  // response_format: { type: 'json_object' }
  // Validate tags against VALID_TAGS
}

// 3. MAIN FLOW
async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  
  // Fetch all posts from X_HANDLES
  // Filter to last 7 days
  // Group by date: Map<string, XPost[]>
  
  for (const [date, posts] of byDate) {
    // Load existing posts from {date}.json
    // Deduplicate by post.id
    // Generate DeepSeek tags for new posts
    // Merge and write: { date, posts }
  }
}
```

## Key Constants

```typescript
const X_HANDLES = [...]          // From people.json where x field set
const X_API_URL = 'https://api.twitter.com/2'
const OUTPUT_DIR = 'profile-data/x-signals'
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

const VALID_TAGS = [
  'agent', 'llm', 'infra', 'rag', 'multi-modal',
  'safety', 'fine-tuning', 'evaluation', 'deployment', 'tooling',
] as const
```

## XPost Type

```typescript
interface XPost {
  type: 'x'                  // Added by social-feeds.ts
  id: string                 // X tweet ID
  url: string                // https://x.com/{handle}/status/{id}
  author: {
    handle: string           // twitter handle
    displayName: string
    avatar: string | null
  }
  content: string            // Tweet text
  createdAt: string          // ISO timestamp
  likeCount: number
  replyCount: number
  retweetCount: number       // Shares
  highlights: string         // From DeepSeek
  worthReading: string       // From DeepSeek
  tags: string[]             // From DeepSeek, validated
}
```

## Output File Format

```json
{
  "date": "2026-04-15",
  "posts": [
    {
      "id": "123456789",
      "url": "https://x.com/karpathy/status/123456789",
      "author": { "handle": "karpathy", "displayName": "Andrej Karpathy", "avatar": null },
      "content": "Tweet here",
      "createdAt": "2026-04-15T10:30:00Z",
      "likeCount": 1234,
      "replyCount": 56,
      "retweetCount": 234,
      "highlights": "AI insight",
      "worthReading": "Why it matters",
      "tags": ["llm", "infra"]
    }
  ]
}
```

## Integration Points (4 files to update)

### 1. profile-data/people.json
```json
{
  "id": "karpathy",
  "x": "karpathy",  // NEW FIELD
  "github": "karpathy",
  ...
}
```

### 2. scripts/generate-people-data.ts
- Add `X_SIGNALS_DIR` constant (line ~12)
- Add `XPost` interface (line ~83)
- Add loading from x-signals/ (line ~240)
- Add to PersonActivity type: `xPosts?: XPost[]`
- Add matching in person loop (line ~300): `if (person.x) { ... }`

### 3. website/lib/social-feeds.ts
- Add `XPost` interface (line ~64)
- Update `FeedItem` union to include XPost
- Add `X_SIGNALS_DIR` constant
- Add `getXSignalsDir()` function
- Add `loadXSignals(date)` function
- Update `getAllFeedDates()` to include X counts
- Update `getFeedByDate()` to include X posts
- Update `getTagStats()` to include X tags

### 4. scripts/fetch-x-signals.ts (NEW)
- Create new file following fetch-bluesky.ts pattern
- ~300-350 lines of code
- Main functions: fetchUserPosts(), generateCommentary(), main()

## DeepSeek Prompt Template (X Posts)

```
You are a technical reviewer. Given an X post about AI/tech, provide:
1. "highlights": Core insight or key takeaway (2-3 sentences, concise)
2. "worthReading": Why it's worth exploring (1-2 sentences)
3. "tags": Pick 1-3 tags from: agent, llm, infra, rag, multi-modal, safety, fine-tuning, evaluation, deployment, tooling

Post Author: ${post.author.displayName} (@${post.author.handle})
Content: ${post.content}
Engagement: ${post.likeCount} likes, ${post.retweetCount} retweets

Respond in JSON format: {"highlights": "...", "worthReading": "...", "tags": ["..."]}
```

## API Response Parsing

```typescript
const res = await fetch(DEEPSEEK_API_URL, { /* ... */ })
const data = await res.json()
const content = data.choices?.[0]?.message?.content || ''
const parsed = JSON.parse(content)

// Validate tags
const rawTags = Array.isArray(parsed.tags) ? parsed.tags : []
const validTags = rawTags.filter(t => VALID_TAGS.includes(t))

return {
  highlights: parsed.highlights || '',
  worthReading: parsed.worthReading || '',
  tags: validTags,
}
```

## Deduplication by ID

```typescript
// Load existing posts from {date}.json
const existingPosts = loadJsonFile<DailyXPosts>(filePath)?.posts || []

// Deduplicate by tweet ID
const existingIds = new Set(existingPosts.map(p => p.id))
const newPosts = posts.filter(p => !existingIds.has(p.id))

// Merge and write
const allPosts = [...existingPosts, ...newPosts]
fs.writeFileSync(filePath, JSON.stringify({ date, posts: allPosts }, null, 2) + '\n')
```

## Console Logging Pattern

```typescript
console.log('🐦 Fetching X posts from AI leaders...')
console.log(`  📥 Fetching posts for ${handle}...`)
console.log(`     Found ${posts.length} recent posts`)
console.log(`  📅 Found ${recentPosts.length} posts in the last 7 days`)
console.log(`  🏷️  Extracting tags for ${newPosts.length} posts on ${date}...`)
console.log(`  📄 ${date}: No new posts (${existingPosts.length} existing)`)
console.log(`  ✅ ${date}: ${allPosts.length} posts (${newPosts.length} new)`)
console.log('🎉 Done!')
```

## Common Errors & Handling

```typescript
// Rate limit (403)
if (res.status === 403) {
  console.warn(`⚠️  Rate limited for user ${handle}, skipping.`)
  return []
}

// API error
if (!res.ok) {
  console.warn(`⚠️  X API error for ${handle}: ${res.status} ${res.statusText}`)
  return []
}

// DeepSeek error
if (!res.ok) {
  console.warn(`⚠️  DeepSeek API error: ${res.status}`)
  return { highlights: '', worthReading: '', tags: [] }
}

// JSON parse error
try {
  const parsed = JSON.parse(content)
} catch (err) {
  console.error('❌ DeepSeek parse error:', err)
  return fallback
}
```

---

## Implementation Checklist

- [ ] Create scripts/fetch-x-signals.ts (~350 lines)
- [ ] Add X_SIGNALS_DIR to generate-people-data.ts
- [ ] Add XPost type to generate-people-data.ts
- [ ] Add loading from x-signals/ to generate-people-data.ts
- [ ] Add person.x field matching to generate-people-data.ts
- [ ] Add XPost interface to website/lib/social-feeds.ts
- [ ] Add X_SIGNALS_DIR and getXSignalsDir() to website/lib/social-feeds.ts
- [ ] Add loadXSignals() function to website/lib/social-feeds.ts
- [ ] Update FeedItem union type to include XPost
- [ ] Update getAllFeedDates() to include X data
- [ ] Update getFeedByDate() to include X data
- [ ] Update getTagStats() to include X tags
- [ ] Add x field to people.json for relevant users
- [ ] Test fetch-x-signals.ts manually
- [ ] Test generate-people-data.ts regenerates correctly
- [ ] Test website loads X posts in feeds

