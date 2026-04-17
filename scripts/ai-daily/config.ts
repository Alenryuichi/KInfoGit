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
 *   website/lib/ai-daily-metrics.ts (TOPIC_VOCAB)
 * And with the prompt-embedded topic descriptions in:
 *   scripts/ai-daily/scoring.ts (FOCUS_TOPICS_PROMPT_BLOCK)
 *
 * LLM output is whitelisted against this list; any value outside the set
 * is dropped during parse to prevent drift.
 *
 * Revision history:
 *   v1 (2026-04): memory / self-evolution / multi-agent / planning /
 *     reflection / tool-use. Data after ~30 days showed 4/6 dead and the
 *     set skewed to 2024 academic terminology.
 *   v2 (2026-04-17, current): renamed for 2026 language + coverage of
 *     product-signal news (model releases, coding agents, evals). Old
 *     per-day digests keep v1 values; historical rows on the Topic Health
 *     dashboard will show the crossover naturally.
 */
export const FOCUS_TOPICS = [
  'coding-agents',       // Cursor, Claude Code, Codebuddy, Copilot, IDE agents
  'context-engineering', // long context, RAG, prompt caching, memory, KV cache
  'agent-harness',       // agent frameworks, skills, MCP, orchestration, swarms
  'planning',            // task decomposition, ReAct, CoT, tree search, reasoning
  'tool-use',            // function calling, code execution, API orchestration
  'post-training',       // RLHF, DPO, RLAIF, constitutional AI, fine-tuning
  'model-release',       // major model launches: GPT/Claude/Gemini/DeepSeek/Llama
  'evals',               // benchmarks, red-teaming, regression tracking, leaderboards
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
