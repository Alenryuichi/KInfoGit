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
export const EXA_DOMAINS = ['techcrunch.com', 'theverge.com', 'arstechnica.com', 'venturebeat.com']

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
