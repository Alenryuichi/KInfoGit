// AI Daily — configuration

export interface RssFeedConfig {
  name: string
  url: string
  category?: string
}

// ─── RSS Feeds (AI-specific) ──────────────────────────────

export const RSS_FEEDS: RssFeedConfig[] = [
  { name: 'ArXiv cs.AI', url: 'https://rss.arxiv.org/rss/cs.AI', category: 'research' },
  { name: 'ArXiv cs.CL', url: 'https://rss.arxiv.org/rss/cs.CL', category: 'research' },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', category: 'breaking' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', category: 'release' },
  { name: 'Simon Willison', url: 'https://simonwillison.net/atom/everything/', category: 'insight' },
]

// ─── Search Queries ───────────────────────────────────────

export const TAVILY_QUERIES = [
  'AI model release OR LLM launch announcement today',
  'AI research paper published OR new machine learning breakthrough',
  'new AI coding assistant OR developer tool launched OR AI startup funding',
]

export const EXA_QUERY = 'artificial intelligence news'
/**
 * Exa domain allowlist — authoritative AI / tech outlets that consistently
 * produce original reporting (not aggregators or rewrite mills). Exa's
 * neural search is already precision-oriented, so a broader allowlist
 * mostly improves recall without degrading signal quality.
 *
 * Organized by tier (the order matters only for human readability):
 * - Tier 1 general tech: techcrunch, theverge, arstechnica, venturebeat
 * - Tier 1 business/industry: wired, theinformation, wsj, bloomberg
 * - AI-specific trade press: semafor (AI vertical), decoder, axios
 * - Research-adjacent: mit.edu (Tech Review), nature, science
 */
export const EXA_DOMAINS = [
  'techcrunch.com', 'theverge.com', 'arstechnica.com', 'venturebeat.com',
  'wired.com', 'theinformation.com', 'bloomberg.com', 'wsj.com',
  'semafor.com', 'axios.com',
  'technologyreview.com', 'nature.com', 'science.org',
]
export const EXA_NUM_RESULTS = 10

// ─── Social Signal Thresholds ─────────────────────────────

export const BLUESKY_MIN_LIKES = 10
export const BLUESKY_AI_KEYWORDS = [
  'ai', 'llm', 'gpt', 'claude', 'gemini', 'agent', 'model', 'transformer',
  'diffusion', 'prompt', 'rag', 'inference', 'training', 'benchmark',
  'reasoning', 'multimodal', 'language model', 'machine learning',
  'deep learning', 'neural', 'openai', 'anthropic', 'deepseek', 'mcp',
]

// ─── Scoring ──────────────────────────────────────────────

export const SCORING_BATCH_SIZE = 15
export const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
export const DEEPSEEK_MODEL = 'deepseek-chat'

/**
 * Keywords used as a fallback to decide aiRelevant when the LLM scoring call
 * completely fails (after retries). Matched against title + summary with
 * word-boundaries to avoid false positives like "retail" containing "ai".
 */
export const AI_FALLBACK_KEYWORDS = [
  'ai', 'llm', 'gpt', 'claude', 'gemini', 'agent', 'neural',
  'diffusion', 'transformer', 'rag', 'embedding', 'inference',
  'fine-tun', 'openai', 'anthropic', 'deepmind', 'meta ai',
  'mistral', 'huggingface', 'deepseek', 'multimodal', 'reasoning',
  'machine learning', 'deep learning', 'language model',
]

/**
 * Maximum recursion depth for halve-and-retry on JSON parse failures.
 * 15 → 8 → 4 → 2 → 1 comfortably covers the default batch size.
 */
export const MAX_RETRY_DEPTH = 4

/**
 * Controlled vocabulary for per-item focusTopics. Must stay in sync with
 * the frontend FOCUS_TOPIC_META keys in:
 *   website/pages/ai-daily.tsx
 *   website/pages/ai-daily/[date].tsx
 * LLM output is whitelisted against this list; any value outside the set
 * is dropped during parse to prevent drift.
 */
export const FOCUS_TOPICS = [
  'memory',          // long-term memory, RAG, vector retrieval, context mgmt
  'self-evolution',  // self-improvement, self-supervision, online learning
  'multi-agent',     // multi-agent coordination, swarm, agent communication
  'planning',        // task decomposition, ReAct, CoT, tree search
  'reflection',      // self-critique, error correction, backtracking
  'tool-use',        // function calling, code execution, API orchestration
] as const
export type FocusTopic = typeof FOCUS_TOPICS[number]

/** Max tags/focusTopics per item (keep scoped to avoid LLM noise). */
export const MAX_TAGS_PER_ITEM = 5
export const MAX_FOCUS_TOPICS_PER_ITEM = 2

// ─── Output ───────────────────────────────────────────────

export const AI_DAILY_DIR = 'profile-data/ai-daily'

// ─── Date utils ───────────────────────────────────────────

/**
 * Return today's date (YYYY-MM-DD) in Asia/Shanghai, regardless of host TZ.
 * Prevents UTC-host cron jobs from writing to the previous day around midnight CST.
 */
export function getTodayInShanghai(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })
}
