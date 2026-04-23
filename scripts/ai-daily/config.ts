// AI Daily — configuration

export interface RssFeedConfig {
  name: string
  url: string
  category?: string
}

// ─── RSS Feeds (AI-specific) ──────────────────────────────

/**
 * Curated AI RSS feeds. Selection philosophy:
 *
 *   - ArXiv cs.AI / cs.CL → research firehose (high volume, filtered by scoring)
 *   - Google AI Blog, DeepMind, Hugging Face → lab/platform official product news
 *   - Simon Willison → high-signal independent commentary
 *   - OpenAI News → frontier lab product announcements (Anthropic does NOT
 *     publish an RSS feed as of 2026-04; we rely on Exa allowlist instead)
 *   - Latent Space, The Gradient, Interconnects → technical long-form essays
 *     by practitioners (Swyx, Nathan Lambert, etc.)
 *   - Pragmatic Engineer → eng-leadership lens on AI tooling adoption
 *
 * Feed health notes:
 *   - Anthropic has no public RSS. /rss.xml, /feed.xml, /news/rss.xml,
 *     /atom.xml all 404 (verified 2026-04-17 and 2026-04-23). If they
 *     ship one later, add it here.
 *   - DeepMind RSS added 2026-04-23. Cadence ~5-7 days, clean summaries,
 *     standard RSS 2.0 format. Returns 200 OK on deepmind.google/blog/rss.xml.
 *   - OpenAI feed blocks non-browser User-Agents. The fetcher in
 *     sources/rss-feeds.ts sends a Mozilla UA specifically to reach it.
 *   - Substack feeds (Latent Space, Pragmatic Engineer, Interconnects) deliver
 *     paywalled posts as truncated summaries, which is fine for scoring.
 */
export const RSS_FEEDS: RssFeedConfig[] = [
  // Research firehose
  { name: 'ArXiv cs.AI',       url: 'https://rss.arxiv.org/rss/cs.AI',                   category: 'research' },
  { name: 'ArXiv cs.CL',       url: 'https://rss.arxiv.org/rss/cs.CL',                   category: 'research' },

  // Lab / platform official
  { name: 'OpenAI News',       url: 'https://openai.com/news/rss',                       category: 'release' },
  { name: 'Google AI Blog',    url: 'https://blog.google/technology/ai/rss/',            category: 'breaking' },
  { name: 'DeepMind',          url: 'https://deepmind.google/blog/rss.xml',              category: 'release' },
  { name: 'Hugging Face',      url: 'https://huggingface.co/blog/feed.xml',              category: 'release' },

  // Technical long-form (practitioner voices)
  { name: 'Latent Space',      url: 'https://www.latent.space/feed',                     category: 'insight' },
  { name: 'Interconnects',     url: 'https://www.interconnects.ai/feed',                 category: 'insight' },
  { name: 'The Gradient',      url: 'https://thegradient.pub/rss/',                      category: 'insight' },
  { name: 'Simon Willison',    url: 'https://simonwillison.net/atom/everything/',        category: 'insight' },

  // Engineering leadership lens
  { name: 'Pragmatic Engineer', url: 'https://newsletter.pragmaticengineer.com/feed',    category: 'insight' },
]

// ─── Search Queries ───────────────────────────────────────

/**
 * Tavily queries — "wide-funnel" design: each query is a broad OR group
 * covering a cluster of focus topics, NOT a per-topic narrow search.
 * Rationale:
 *   - Per-topic queries create confirmation bias — you only find what you
 *     already defined. Wide funnels let unexpected topics surface, which is
 *     essential for the topic-discovery loop (metrics/Topic Health).
 *   - Tavily charges per-query and caps at ~8 results, so narrow queries
 *     waste quota on overlapping hits.
 *   - Keep count small (4) to leave headroom if we add more later.
 *
 * Each query is designed to cover ≥2 focus topics from FOCUS_TOPICS.
 */
export const TAVILY_QUERIES = [
  'AI model release OR LLM launch OR new foundation model announcement',        // → model-release
  'AI research paper OR benchmark results OR evaluation OR safety evaluation',  // → evals
  'AI coding agent OR AI developer tool OR AI IDE OR programming assistant',    // → coding-agents
  'AI agent framework OR orchestration platform OR multi-agent system OR MCP',  // → agent-harness
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
 * - Frontier lab corporate comms: anthropic.com (no RSS available,
 *   so Exa is our only way to pick up Anthropic's product announcements)
 */
export const EXA_DOMAINS = [
  'techcrunch.com', 'theverge.com', 'arstechnica.com', 'venturebeat.com',
  'wired.com', 'theinformation.com', 'bloomberg.com', 'wsj.com',
  'semafor.com', 'axios.com',
  'technologyreview.com', 'nature.com', 'science.org',
  'anthropic.com',
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
