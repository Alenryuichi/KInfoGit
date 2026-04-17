// AI Daily — DeepSeek unified scoring, classification, and filtering

import { DEEPSEEK_API_URL, DEEPSEEK_MODEL, SCORING_BATCH_SIZE } from './config'
import type { RawNewsItem, ScoredItem } from './types'

// ─── Unified Scoring ──────────────────────────────────────

/**
 * Score, classify, and filter all items in one DeepSeek call.
 * Splits into batches if > SCORING_BATCH_SIZE items.
 * Falls back to defaults on API failure.
 */
export async function scoreItems(items: RawNewsItem[]): Promise<ScoredItem[]> {
  if (items.length === 0) return []

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.warn('[scoring] DEEPSEEK_API_KEY not set, using defaults')
    return items.map(defaultScore)
  }

  // Split into batches if needed
  if (items.length > SCORING_BATCH_SIZE) {
    const batches: RawNewsItem[][] = []
    for (let i = 0; i < items.length; i += SCORING_BATCH_SIZE) {
      batches.push(items.slice(i, i + SCORING_BATCH_SIZE))
    }
    console.log(`[scoring] Splitting ${items.length} items into ${batches.length} batches`)

    const results: ScoredItem[] = []
    for (const batch of batches) {
      const scored = await scoreBatch(apiKey, batch)
      results.push(...scored)
    }
    return results
  }

  return scoreBatch(apiKey, items)
}

async function scoreBatch(apiKey: string, items: RawNewsItem[]): Promise<ScoredItem[]> {
  const itemList = items
    .map((item, i) => `${i + 1}. [${item.sourceName}] ${item.title}\n   URL: ${item.url}\n   ${item.summary.slice(0, 150)}`)
    .join('\n')

  const today = new Date().toISOString().slice(0, 10)

  const prompt = `今天是 ${today}。以下是采集到的科技资讯列表。请为每条进行评分、分类和过滤。

评分标准 (0-10):
- 时效性：是否为今日（或昨日晚间）发布的新内容。常青页面、工具合集、"Best X Tools"指南类文章、网站首页、GitHub 仓库主页等不具有时效性。
- 影响力：对 AI/ML 行业的影响程度
- AI 相关度：与人工智能/机器学习的直接相关程度

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

新闻列表:
${itemList}

返回纯 JSON 数组（与输入一一对应），每个元素:
- index: 序号（从1开始）
- score: 0-10 的浮点数
- category: "breaking" | "research" | "release" | "insight"
- aiRelevant: true/false
- oneLiner: 一句话中文摘要（不超过 50 字）

只返回 JSON 数组，不要其他文字。`

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
          { role: 'system', content: '你是一个 AI 领域新闻编辑。只返回纯 JSON 数组，不要任何其他文字。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 4096,
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      console.warn(`[scoring] DeepSeek API returned ${res.status}`)
      return items.map(defaultScore)
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) return items.map(defaultScore)

    // Parse — handle possible code fences
    let jsonStr = content
    const fenceMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
    if (fenceMatch) jsonStr = fenceMatch[1].trim()

    const parsed = JSON.parse(jsonStr) as Array<{
      index: number
      score: number
      category: string
      aiRelevant: boolean
      oneLiner: string
    }>

    if (!Array.isArray(parsed)) return items.map(defaultScore)

    // Map scores back to items by index
    const scored: ScoredItem[] = items.map((item, i) => {
      const s = parsed.find(p => p.index === i + 1)
      if (!s) return defaultScore(item)

      return {
        ...item,
        score: Math.min(10, Math.max(0, s.score)),
        category: validateCategory(s.category),
        aiRelevant: s.aiRelevant ?? true,
        oneLiner: s.oneLiner ?? item.summary.slice(0, 50),
      }
    })

    const relevant = scored.filter(s => s.aiRelevant).length
    console.log(`[scoring] ${relevant}/${scored.length} items AI-relevant`)
    return scored
  } catch (err) {
    console.warn(`[scoring] DeepSeek failed: ${err}`)
    return items.map(defaultScore)
  }
}

function defaultScore(item: RawNewsItem): ScoredItem {
  return {
    ...item,
    score: 5,
    category: 'breaking',
    aiRelevant: true,
    oneLiner: item.summary.slice(0, 50),
  }
}

function validateCategory(cat: string): ScoredItem['category'] {
  const valid = ['breaking', 'research', 'release', 'insight'] as const
  return valid.includes(cat as typeof valid[number])
    ? (cat as ScoredItem['category'])
    : 'breaking'
}

// ─── Daily Brief Generation ───────────────────────────────

/**
 * Generate a 2-3 sentence Chinese daily brief from top-scored items.
 */
export async function generateDailyBrief(items: ScoredItem[]): Promise<string | null> {
  if (items.length === 0) return null

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return null

  const topItems = items
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(i => `- [${i.score.toFixed(1)}] ${i.title}: ${i.oneLiner}`)
    .join('\n')

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
          { role: 'user', content: `以下是今天最重要的 AI 新闻：\n\n${topItems}\n\n请生成 2-3 句中文当日快报，概述今天 AI 领域最重要的动态，引用具体事件。只返回纯文本。` },
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
