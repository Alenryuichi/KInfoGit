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

export const SCORING_BATCH_SIZE = 30
export const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
export const DEEPSEEK_MODEL = 'deepseek-chat'

// ─── Output ───────────────────────────────────────────────

export const AI_DAILY_DIR = 'profile-data/ai-daily'
