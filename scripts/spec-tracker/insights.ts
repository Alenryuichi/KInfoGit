// Spec Tracker — AI trend insights via DeepSeek API

import { DEEPSEEK_API_URL, DEEPSEEK_MODEL } from '../code-weekly/config'
import type { SpecSnapshot, DiscoveredProject } from './types'

// ─── Types ────────────────────────────────────────────────

export interface ScoredProject {
  fullName: string
  relevant: boolean
  reason: string
}

/**
 * Generate 2-3 paragraphs of Chinese trend analysis from snapshot + delta data.
 * Returns null on failure (API unavailable, no API key, etc.).
 */
export async function generateInsights(snapshot: SpecSnapshot): Promise<string | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.warn('[insights] DEEPSEEK_API_KEY not set, skipping AI insights')
    return null
  }

  const prompt = buildPrompt(snapshot)

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
          {
            role: 'system',
            content: `你是一个 AI Coding Spec 生态分析师。基于提供的框架数据和变化趋势，生成简明扼要的中文趋势分析。

规则：
1. 只基于提供的数据分析，不要编造信息
2. 引用具体数字和对比（如 stars 变化、下载量变化）
3. 输出 2-3 段中文分析文字
4. 关注：哪些框架在增长？哪些在放缓？新发现了什么有趣项目？
5. 返回纯 JSON 格式：{ "insights": "分析文字..." }
6. insights 字段中的段落用 \\n\\n 分隔`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      console.warn(`[insights] DeepSeek API returned ${res.status}`)
      return null
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) return null

    // Parse JSON response — handle markdown code fences
    try {
      let jsonStr = content
      // Strip markdown code fence if present
      const fenceMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim()
      }
      const parsed = JSON.parse(jsonStr)
      return parsed.insights ?? null
    } catch {
      // If not valid JSON, try to use the raw text
      return content
    }
  } catch (err) {
    console.warn(`[insights] DeepSeek API call failed: ${err}`)
    return null
  }
}

function buildPrompt(snapshot: SpecSnapshot): string {
  const lines: string[] = ['## 当前 Spec 框架数据\n']

  for (const fw of snapshot.frameworks) {
    const parts = [`### ${fw.name} (${fw.category})`]

    if (fw.github) {
      parts.push(`- Stars: ${fw.github.stars}`)
      if (fw.github.latestRelease) {
        parts.push(`- 最新版本: ${fw.github.latestRelease.tag} (${fw.github.latestRelease.publishedAt.slice(0, 10)})`)
      }
      parts.push(`- 周提交: ${fw.github.weeklyCommits}`)
    }

    if (fw.npm) {
      parts.push(`- npm 周下载: ${fw.npm.weeklyDownloads}`)
      parts.push(`- npm 最新版: ${fw.npm.latestVersion}`)
    }

    // Delta data
    const delta = snapshot.deltas?.find(d => d.frameworkId === fw.id)
    if (delta) {
      if (delta.starsDelta != null) parts.push(`- Stars 变化: ${delta.starsDelta > 0 ? '+' : ''}${delta.starsDelta}`)
      if (delta.npmDelta != null) parts.push(`- npm 下载变化: ${delta.npmDelta > 0 ? '+' : ''}${delta.npmDelta}`)
    }

    lines.push(parts.join('\n'))
  }

  // Discovered projects
  if (snapshot.discovered.length > 0) {
    lines.push('\n## 新发现的项目\n')
    for (const p of snapshot.discovered) {
      lines.push(`- ${p.fullName} (${p.stars}★, ${p.language}) — ${p.description}`)
    }
  }

  // Weekly diff
  if (snapshot.weeklyDiff) {
    lines.push('\n## 周变化摘要\n')
    if (snapshot.weeklyDiff.topGainer) {
      lines.push(`- 最大涨幅: ${snapshot.weeklyDiff.topGainer.frameworkId} +${snapshot.weeklyDiff.topGainer.delta}★`)
    }
    if (snapshot.weeklyDiff.newDiscovered.length > 0) {
      lines.push(`- 新进项目: ${snapshot.weeklyDiff.newDiscovered.join(', ')}`)
    }
    if (snapshot.weeklyDiff.exitedDiscovered.length > 0) {
      lines.push(`- 退出项目: ${snapshot.weeklyDiff.exitedDiscovered.join(', ')}`)
    }
  }

  lines.push('\n请基于以上数据，生成 2-3 段中文趋势分析。')

  return lines.join('\n')
}

// ─── Discovery AI Filter ─────────────────────────────────

/**
 * Use DeepSeek to judge whether discovered projects are relevant to
 * "AI coding spec-driven development". Returns empty array on failure
 * (caller should fallback to keeping all projects unfiltered).
 */
export async function filterDiscoveredProjects(
  projects: DiscoveredProject[],
): Promise<ScoredProject[]> {
  if (projects.length === 0) return []

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.warn('[filter] DEEPSEEK_API_KEY not set, skipping AI filter')
    return []
  }

  const projectList = projects.map(p =>
    `- ${p.fullName} (${p.stars}★, ${p.language}) — ${p.description}`
  ).join('\n')

  const prompt = `以下是通过 GitHub 搜索发现的项目列表。请判断每个项目是否与 "AI coding spec-driven development"（AI 辅助编程中的规范驱动开发）相关。

相关的定义：
- 提供 spec/规范 驱动的 AI 编程工作流
- 为 AI coding agent 提供结构化规范、规则或方法论
- spec-driven development 工具链（规范编写、验证、执行）
- AI 编程助手的 rules/cursorrules 管理工具

不相关的例子：
- 通用微服务框架、Web 框架
- 纯 LLM 应用（聊天机器人、RAG）
- 与编程规范无关的 AI 工具

项目列表：
${projectList}

请返回纯 JSON 数组，每个元素包含：
- fullName: 项目全名
- relevant: true/false
- reason: 一句话理由（中文，不超过 30 字）

只返回 JSON，不要 markdown code fence。`

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
          {
            role: 'system',
            content: '你是一个 AI Coding 生态分析师。只返回纯 JSON，不要任何其他文字。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      console.warn(`[filter] DeepSeek API returned ${res.status}`)
      return []
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) return []

    // Parse — handle possible code fences
    let jsonStr = content
    const fenceMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim()
    }

    const parsed = JSON.parse(jsonStr) as ScoredProject[]
    if (!Array.isArray(parsed)) return []

    const relevant = parsed.filter(p => p.relevant).length
    const total = parsed.length
    console.log(`[filter] AI judged ${relevant}/${total} projects as relevant`)

    return parsed
  } catch (err) {
    console.warn(`[filter] DeepSeek API call failed: ${err}`)
    return []
  }
}
