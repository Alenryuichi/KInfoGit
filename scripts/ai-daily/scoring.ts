// AI Daily — DeepSeek unified scoring, classification, and filtering

import path from 'path'
import { fileURLToPath } from 'url'
import {
  DEEPSEEK_API_URL,
  DEEPSEEK_MODEL,
  SCORING_BATCH_SIZE,
  AI_FALLBACK_KEYWORDS,
  MAX_RETRY_DEPTH,
  FOCUS_TOPICS,
  MAX_TAGS_PER_ITEM,
  MAX_FOCUS_TOPICS_PER_ITEM,
  getTodayInShanghai,
} from './config'
import { loadScoringAnchors, formatAnchorBlock, type ScoringAnchor } from './anchors'
import type { RawNewsItem, ScoredItem } from './types'

const FOCUS_TOPIC_SET = new Set<string>(FOCUS_TOPICS)

// Resolve project root once, so scoring.ts stays invocable regardless of
// the caller's cwd (matters for CI and for unit tests).
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..', '..')

// Cache anchors for the lifetime of one scoreItems() call — they're the
// same across batches within a single run, no need to re-read files each time.
let anchorCache: ScoringAnchor[] | null = null

// ─── Runtime counters (reset each scoreItems() call) ───────
interface RunStats {
  totalLlmBatches: number
  failedBatches: number
  halveRetries: number
  keywordFallbacks: number
  hnWeighted: number
}

function freshStats(): RunStats {
  return { totalLlmBatches: 0, failedBatches: 0, halveRetries: 0, keywordFallbacks: 0, hnWeighted: 0 }
}

// ─── Unified Scoring ──────────────────────────────────────

/**
 * Score, classify, and filter all items in one DeepSeek call.
 * Splits into batches of SCORING_BATCH_SIZE. On JSON failure, halves and
 * retries recursively; single-item failures fall back to keyword matching.
 */
export async function scoreItems(items: RawNewsItem[]): Promise<ScoredItem[]> {
  if (items.length === 0) return []

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.warn('[scoring] DEEPSEEK_API_KEY not set, using keyword fallback for all items')
    return items.map(keywordFallback)
  }

  const stats = freshStats()

  // Load cross-day anchors once per run; cached for all batches
  anchorCache = loadScoringAnchors(PROJECT_ROOT)
  if (anchorCache.length > 0) {
    const summary = anchorCache.map(a => `${a.band}=${a.score.toFixed(1)}`).join(' ')
    console.log(`[scoring] loaded ${anchorCache.length} cross-day anchors (${summary})`)
  }

  // Split into batches of SCORING_BATCH_SIZE
  const batches: RawNewsItem[][] = []
  for (let i = 0; i < items.length; i += SCORING_BATCH_SIZE) {
    batches.push(items.slice(i, i + SCORING_BATCH_SIZE))
  }
  if (batches.length > 1) {
    console.log(`[scoring] Splitting ${items.length} items into ${batches.length} batches of ≤${SCORING_BATCH_SIZE}`)
  }

  const results: ScoredItem[] = []
  for (const batch of batches) {
    const scored = await tryScoreBatch(apiKey, batch, 0, stats)
    results.push(...scored)
  }

  const relevant = results.filter(s => s.aiRelevant).length
  console.log(
    `[scoring] done: ${relevant}/${results.length} AI-relevant | ` +
    `batches=${stats.totalLlmBatches} (failed=${stats.failedBatches}, halveRetries=${stats.halveRetries}) | ` +
    `keywordFallback=${stats.keywordFallbacks} | hnWeighted=${stats.hnWeighted}`
  )
  return results
}

/**
 * Call DeepSeek for a batch; on failure halve-and-retry recursively.
 * When a single item fails or depth exceeds MAX_RETRY_DEPTH, falls back to
 * keyword-based scoring so the pipeline never poisons results with blanket
 * "aiRelevant=true, score=5" defaults.
 */
async function tryScoreBatch(
  apiKey: string,
  items: RawNewsItem[],
  depth: number,
  stats: RunStats,
): Promise<ScoredItem[]> {
  if (items.length === 0) return []

  stats.totalLlmBatches += 1
  const parsed = await callDeepSeek(apiKey, items)

  if (parsed) {
    // Map LLM output back to items; fill holes with keyword fallback
    return items.map((item, i) => {
      const s = parsed.find(p => p.index === i + 1)
      if (!s) {
        stats.keywordFallbacks += 1
        return keywordFallback(item)
      }
      return finalizeScored(item, s, stats)
    })
  }

  // Parse failed
  stats.failedBatches += 1

  if (items.length === 1 || depth >= MAX_RETRY_DEPTH) {
    console.warn(
      `[scoring] giving up on batch of ${items.length} at depth ${depth}, using keyword fallback`
    )
    stats.keywordFallbacks += items.length
    return items.map(keywordFallback)
  }

  // Halve and retry
  stats.halveRetries += 1
  const mid = Math.ceil(items.length / 2)
  console.warn(`[scoring] batch of ${items.length} failed at depth ${depth}, halving into ${mid} + ${items.length - mid}`)
  const left = await tryScoreBatch(apiKey, items.slice(0, mid), depth + 1, stats)
  const right = await tryScoreBatch(apiKey, items.slice(mid), depth + 1, stats)
  return [...left, ...right]
}

interface LlmScoreEntry {
  index: number
  score: number
  category: string
  aiRelevant: boolean
  oneLiner: string
  tags: string[]
  focusTopics: string[]
}

/**
 * Call DeepSeek once for the given batch and return the parsed results array.
 * Returns null on any failure (network, non-2xx, empty, JSON parse, bad shape).
 */
async function callDeepSeek(apiKey: string, items: RawNewsItem[]): Promise<LlmScoreEntry[] | null> {
  const itemList = items
    .map((item, i) => {
      const lines = [
        `${i + 1}. [${item.sourceName}] ${item.title}`,
        `   URL: ${item.url}`,
        `   ${item.summary.slice(0, 150)}`,
      ]
      if (item.priorScore != null) {
        lines.push(`   Community signal (HN): ${(item.priorScore * 10).toFixed(1)}/10`)
      }
      return lines.join('\n')
    })
    .join('\n')

  const today = getTodayInShanghai()

  const anchorBlock = formatAnchorBlock(anchorCache ?? [])

  const prompt = `今天是 ${today}。以下是采集到的科技资讯列表。请为每条进行评分、分类和过滤。

评分标准 (0-10):
- 时效性：是否为今日（或昨日晚间）发布的新内容。常青页面、工具合集、"Best X Tools"指南类文章、网站首页、GitHub 仓库主页等不具有时效性。
- 影响力：对 AI/ML 行业的影响程度
- AI 相关度：与人工智能/机器学习的直接相关程度

注意：部分条目附带 "Community signal (HN)" 行，这是 Hacker News 社区给出的分数，可作为辅助参考（高分代表社区关注度高），但不要把它直接当作你的评分，你仍需要独立判断内容质量。

分类（四选一）:
- breaking: 重大发布、融资、政策、里程碑
- research: 论文、benchmark、研究发现
- release: 工具/库/模型版本更新
- insight: 观点、分析、社区讨论

aiRelevant 判断（必须同时满足两个条件才为 true）:
1. 与 AI/ML/LLM/AI 编程直接相关
2. 是近 24 小时内发布的具体新闻/论文/公告（不是常青内容）

以下情况必须标为 aiRelevant=false:
- 网站首页、分类目录页（如 ai.google/research/）
- "Best/Top N Tools" 合集文章、年度指南
- 旧文章（标题含"Already in 2025"或明确非今日内容）
- GitHub 仓库主页（非具体 release）
- 聚合索引页（如 llm-stats.com/llm-updates）
- Reddit/论坛旧讨论帖
- 通用科技、安全事件、量子计算（除非直接用于 AI）

tags（3-5 个自由标签）:
- 英文小写，每个 1-3 个词，不含 # 符号
- 描述内容主题、技术栈、领域（如 "llm", "benchmark", "open-source", "multimodal"）
- 避免重复（不要同时给 "ai" 和 "artificial-intelligence"）

focusTopics（0-${MAX_FOCUS_TOPICS_PER_ITEM} 个）:
- **必须且仅能**从下列 6 个受控值中选择，任何其他值一律无效，会被丢弃：
  * memory          —— 长期记忆、RAG、向量检索、上下文管理、context window
  * self-evolution  —— 自我迭代、自监督、在线学习、自我批判、self-improvement
  * multi-agent     —— 多 agent 协同、swarm、agent communication
  * planning        —— 任务分解、ReAct、思维链（CoT）、tree search
  * reflection      —— 自我反思、错误修正、回溯、self-critique
  * tool-use        —— 工具调用、function calling、code execution、API 编排
- **严格匹配才打**：只有条目核心议题与某个 topic 深度相关才打，泛 AI 新闻应返回空数组 []
- 最多打 ${MAX_FOCUS_TOPICS_PER_ITEM} 个；大多数条目应为 0 个
${anchorBlock}
新闻列表:
${itemList}

返回一个 JSON 对象（根级），形如：
{
  "results": [
    {
      "index": 1,
      "score": 8.5,
      "category": "research",
      "aiRelevant": true,
      "oneLiner": "一句话中文摘要",
      "tags": ["llm", "benchmark", "reasoning"],
      "focusTopics": ["planning"]
    },
    {
      "index": 2,
      "score": 6.0,
      "category": "insight",
      "aiRelevant": true,
      "oneLiner": "另一句摘要",
      "tags": ["ai-coding", "developer-tools"],
      "focusTopics": []
    }
  ]
}

results 数组必须与输入一一对应（按 index 升序）。oneLiner 不超过 50 字。只返回该 JSON 对象，不要包含任何其他文字或 Markdown 代码块。`

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: '你是一个 AI 领域新闻编辑。严格按用户要求返回一个 JSON 对象，包含 results 数组字段，不要任何其他文字或代码块。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      console.warn(`[scoring] DeepSeek API returned ${res.status}`)
      return null
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) return null

    // Primary: JSON mode should return a clean JSON object.
    // Fallback: strip ```json fences if the model ignored the instruction.
    let jsonStr = content
    const fenceMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
    if (fenceMatch) jsonStr = fenceMatch[1].trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      return null
    }

    // Accept { results: [...] } (preferred) or a bare array (legacy tolerance)
    let resultsArr: unknown
    if (Array.isArray(parsed)) {
      resultsArr = parsed
    } else if (parsed && typeof parsed === 'object' && 'results' in parsed) {
      resultsArr = (parsed as { results: unknown }).results
    } else {
      return null
    }
    if (!Array.isArray(resultsArr)) return null

    // Best-effort validation of entry shape
    const entries: LlmScoreEntry[] = []
    for (const raw of resultsArr) {
      if (!raw || typeof raw !== 'object') continue
      const r = raw as Record<string, unknown>
      if (typeof r.index !== 'number' || typeof r.score !== 'number') continue
      entries.push({
        index: r.index,
        score: r.score,
        category: typeof r.category === 'string' ? r.category : 'insight',
        aiRelevant: typeof r.aiRelevant === 'boolean' ? r.aiRelevant : true,
        oneLiner: typeof r.oneLiner === 'string' ? r.oneLiner : '',
        tags: sanitizeTags(r.tags),
        focusTopics: sanitizeFocusTopics(r.focusTopics),
      })
    }

    return entries.length > 0 ? entries : null
  } catch (err) {
    console.warn(`[scoring] DeepSeek call failed: ${err}`)
    return null
  }
}

/**
 * Sanitize free-form tags from LLM output:
 * - string only, trim + lowercase
 * - drop empty or overlong (>30 chars)
 * - strip leading '#' that some models emit despite instructions
 * - dedupe, cap at MAX_TAGS_PER_ITEM
 */
function sanitizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of raw) {
    if (typeof t !== 'string') continue
    const normalized = t.trim().toLowerCase().replace(/^#+/, '').trim()
    if (!normalized || normalized.length > 30) continue
    if (seen.has(normalized)) continue
    seen.add(normalized)
    out.push(normalized)
    if (out.length >= MAX_TAGS_PER_ITEM) break
  }
  return out
}

/**
 * Whitelist focusTopics against the controlled vocabulary. Drops any
 * value outside FOCUS_TOPICS to prevent LLM drift (e.g. "reasoning",
 * "agent" that look plausible but aren't in the frontend's known set).
 */
function sanitizeFocusTopics(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of raw) {
    if (typeof t !== 'string') continue
    const normalized = t.trim().toLowerCase()
    if (!FOCUS_TOPIC_SET.has(normalized)) continue
    if (seen.has(normalized)) continue
    seen.add(normalized)
    out.push(normalized)
    if (out.length >= MAX_FOCUS_TOPICS_PER_ITEM) break
  }
  return out
}

/**
 * Combine an item with its LLM score entry; fuse HN priorScore if present.
 * final = 0.85 * llmScore + 0.15 * (priorScore * 10), clamped to [0, 10].
 */
function finalizeScored(item: RawNewsItem, s: LlmScoreEntry, stats: RunStats): ScoredItem {
  let finalScore = Math.min(10, Math.max(0, s.score))
  if (item.priorScore != null) {
    const hn = Math.min(10, Math.max(0, item.priorScore * 10))
    finalScore = Math.min(10, Math.max(0, 0.85 * finalScore + 0.15 * hn))
    stats.hnWeighted += 1
  }
  return {
    ...item,
    score: finalScore,
    category: validateCategory(s.category),
    aiRelevant: s.aiRelevant,
    oneLiner: s.oneLiner || item.summary.slice(0, 50),
    tags: s.tags,
    focusTopics: s.focusTopics,
  }
}

/**
 * Keyword-based fallback used when the LLM scoring completely fails
 * (after halve-and-retry). This replaces the old blanket defaultScore
 * that marked everything aiRelevant=true and let garbage into the digest.
 *
 * Strategy: word-boundary match AI_FALLBACK_KEYWORDS against title+summary.
 * If any keyword hits, mark aiRelevant=true with a neutral score 5 and
 * safer 'insight' category; otherwise drop it from the digest.
 */
export function keywordFallback(item: RawNewsItem): ScoredItem {
  const hay = `${item.title} ${item.summary}`.toLowerCase()
  const aiRelevant = AI_FALLBACK_KEYWORDS.some(kw => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i')
    return re.test(hay)
  })
  return {
    ...item,
    score: 5,
    category: 'insight',
    aiRelevant,
    oneLiner: item.summary.slice(0, 50),
    tags: [],
    focusTopics: [],
  }
}

function validateCategory(cat: string): ScoredItem['category'] {
  const valid = ['breaking', 'research', 'release', 'insight'] as const
  return valid.includes(cat as typeof valid[number])
    ? (cat as ScoredItem['category'])
    : 'insight'
}

// ─── Daily Brief Generation ───────────────────────────────

/** Generate a stable anchor id from a news item's URL (sync with frontend) */
function generateItemId(item: { url: string; title: string }): string {
  try {
    const u = new URL(item.url)
    const slug = (u.hostname + u.pathname)
      .replace(/^www\./, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60)
    return `item-${slug}`
  } catch {
    return `item-${item.title.slice(0, 30).replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
  }
}

/**
 * Generate a 2-3 sentence Chinese daily brief from top-scored items.
 */
export async function generateDailyBrief(items: ScoredItem[]): Promise<string | null> {
  if (items.length === 0) return null

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return null

  // Build structured input: group by category, top 3 per group
  const sectionLabels: Record<string, string> = {
    breaking: '重大发布',
    research: '研究论文',
    release: '工具更新',
    insight: '观点洞察',
  }
  const byCategory: Record<string, ScoredItem[]> = {}
  for (const item of items) {
    ;(byCategory[item.category] ??= []).push(item)
  }
  const sections: string[] = []
  for (const [cat, label] of Object.entries(sectionLabels)) {
    const group = byCategory[cat]
    if (!group?.length) continue
    group.sort((a, b) => b.score - a.score)
    const lines = group.slice(0, 3).map(i => `  - [id: ${generateItemId(i)}] ${i.title}: ${i.oneLiner}`)
    sections.push(`【${label}】(${group.length} 条)\n${lines.join('\n')}`)
  }
  const structuredInput = sections.join('\n\n')

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: '你是一个 AI 领域新闻编辑。生成简洁的中文当日快报。只返回纯文本。' },
          { role: 'user', content: `以下是今日 AI Daily 各板块摘要：\n\n${structuredInput}\n\n请生成 3-4 句中文当日快报，须覆盖所有板块。在提及具体事件时，请务必使用 Markdown 链接格式将其链接到对应的 id，例如：[谷歌在Chrome推出AI探索模式](#item-xxx)。只返回纯文本。` },
        ],
        temperature: 0.5,
        max_tokens: 512,
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) return null

    const data = await res.json()
    return data?.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  }
}
