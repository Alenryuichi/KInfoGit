// DeepSeek API — multi-source raw data → structured weekly JSON
import { DEEPSEEK_API_URL, DEEPSEEK_MODEL, EDITORS } from './config'
import type { GitHubRelease } from './sources/github-releases'
import type { RssArticle } from './sources/rss-feeds'
import type { TavilyResult } from './sources/tavily-search'
import type { BailianResult } from './sources/bailian-search'
import type { NpmRelease } from './sources/npm-registry'

export interface SummarizedEditor {
  name: string
  category: 'ide' | 'cli'
  version?: string
  highlights: string[]
  source: string
  sourceUrl?: string
  aiSummary: string
}

export interface SummarizedWeekly {
  editors: SummarizedEditor[]
  blogs: Array<{
    company: string
    title: string
    url: string
    publishedAt: string
    summary: string
    tags: string[]
  }>
  weekSummary: string
}

interface RawData {
  githubReleases: GitHubRelease[]
  rssArticles: RssArticle[]
  tavilyResults: TavilyResult[]
  bailianResults: BailianResult[]
  npmReleases?: NpmRelease[]
}

export async function summarizeWeekly(raw: RawData): Promise<SummarizedWeekly> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.warn('[summarizer] DEEPSEEK_API_KEY not set, using raw data directly')
    return fallbackSummary(raw)
  }

  const prompt = buildPrompt(raw)

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
            content: `你是一个 AI Code 编辑器生态周报总结助手。你的任务是将多个数据源的原始数据整理为结构化的周报 JSON。

规则：
1. 只基于提供的原始数据总结，不要编造任何信息
2. 你必须为以下每个编辑器都生成一条记录，即使该编辑器本周无重大更新也要包含（设 highlights 为空数组，aiSummary 为"本周暂无重大更新"）
3. 为每个有更新的编辑器提取关键功能更新（highlights 数组，每项不超过 50 字，最多 5 项）
4. 为每个编辑器生成简短的 AI 摘要（aiSummary，2-3 句话）
5. 博客文章只保留与 AI/编程工具相关的，生成中文摘要
6. 生成本周整体总结（weekSummary，3-5 句话，中文）
7. 只返回纯 JSON，不要 markdown code fence，不要其他文字
8. **sourceUrl 必须只使用原始数据中提供的真实 URL，绝对不要编造或猜测 URL。** 用户消息末尾会附带一份"可用 URL 列表"，sourceUrl 和 blogs 的 url 必须从该列表中选取。如果没有合适的 URL，设 sourceUrl 为空字符串。

输出格式：
{
  "editors": [
    {
      "name": "编辑器名（必须与下方列表完全一致）",
      "category": "ide" | "cli",
      "version": "版本号（如有）",
      "highlights": ["更新点1", "更新点2"],
      "source": "数据来源",
      "sourceUrl": "链接",
      "aiSummary": "AI 摘要"
    }
  ],
  "blogs": [
    {
      "company": "公司名",
      "title": "标题",
      "url": "链接",
      "publishedAt": "日期",
      "summary": "摘要",
      "tags": ["tag1"]
    }
  ],
  "weekSummary": "本周整体总结"
}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 8192,
      }),
    })

    if (!res.ok) {
      console.warn(`[summarizer] DeepSeek HTTP ${res.status}, using fallback`)
      return fallbackSummary(raw)
    }

    const data = await res.json() as {
      choices: Array<{ message: { content: string } }>
    }

    const content = data.choices?.[0]?.message?.content || ''

    // Extract JSON — strip markdown code fences first
    let cleaned = content.trim()
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '')

    // Find the outermost balanced JSON object
    const jsonStr = extractBalancedJson(cleaned)
    if (!jsonStr) {
      console.warn('[summarizer] Could not parse JSON from DeepSeek response')
      return fallbackSummary(raw)
    }

    const parsed = JSON.parse(jsonStr) as SummarizedWeekly

    // Validate structure
    if (!parsed.editors || !Array.isArray(parsed.editors)) {
      return fallbackSummary(raw)
    }

    return parsed
  } catch (err) {
    console.warn('[summarizer] DeepSeek failed:', err)
    return fallbackSummary(raw)
  }
}

/** Collect all real URLs from raw data, grouped by editor name */
export function collectUrlsFromRaw(raw: RawData): { allUrls: Set<string>; editorUrls: Map<string, string[]> } {
  const allUrls = new Set<string>()
  const editorUrls = new Map<string, string[]>()

  const addUrl = (editor: string, url: string) => {
    if (!url) return
    allUrls.add(url)
    const list = editorUrls.get(editor) || []
    list.push(url)
    editorUrls.set(editor, list)
  }

  for (const r of raw.githubReleases) addUrl(r.editor, r.htmlUrl)
  for (const r of raw.tavilyResults) addUrl(r.editor, r.url)
  for (const r of raw.bailianResults) addUrl(r.editor, r.url)
  for (const r of raw.rssArticles) allUrls.add(r.url)

  return { allUrls, editorUrls }
}

function buildPrompt(raw: RawData): string {
  const sections: string[] = []

  // Inject editor list so DeepSeek knows ALL editors to report on
  const editorList = EDITORS.map(e => `- ${e.name} (${e.category})`).join('\n')
  sections.push(
    `## 需要追踪的编辑器列表\n` +
    `以下是需要报告的全部编辑器，每个都必须出现在输出的 editors 数组中。\n` +
    `如果某个编辑器在下方数据中没有相关信息，仍然要包含它，设 highlights 为空数组，aiSummary 为"本周暂无重大更新"。\n\n${editorList}`
  )

  if (raw.githubReleases.length > 0) {
    sections.push('## GitHub Releases\n' +
      raw.githubReleases.map(r =>
        `### ${r.editor} ${r.version}\n- Published: ${r.publishedAt}\n- URL: ${r.htmlUrl}\n- Changelog:\n${r.body.slice(0, 800)}`
      ).join('\n\n')
    )
  }

  if (raw.tavilyResults.length > 0) {
    sections.push('## Search Results (English)\n' +
      raw.tavilyResults.map(r =>
        `### ${r.editor}\n- ${r.title}\n- URL: ${r.url}\n- ${r.content.slice(0, 500)}`
      ).join('\n\n')
    )
  }

  if (raw.bailianResults.length > 0) {
    sections.push('## Search Results (Chinese)\n' +
      raw.bailianResults.map(r =>
        `### ${r.editor}\n- ${r.title}\n- URL: ${r.url}\n- ${r.content.slice(0, 500)}`
      ).join('\n\n')
    )
  }

  if (raw.rssArticles.length > 0) {
    sections.push('## Company Blog Articles\n' +
      raw.rssArticles.map(r =>
        `### ${r.company}: ${r.title}\n- URL: ${r.url}\n- Published: ${r.publishedAt}\n- ${r.summary.slice(0, 300)}`
      ).join('\n\n')
    )
  }

  if (raw.npmReleases && raw.npmReleases.length > 0) {
    // Group by editor
    const byEditor = new Map<string, typeof raw.npmReleases>()
    for (const r of raw.npmReleases) {
      const list = byEditor.get(r.editor) || []
      list.push(r)
      byEditor.set(r.editor, list)
    }
    sections.push('## npm Releases (recent 7 days)\n' +
      Array.from(byEditor.entries()).map(([editor, releases]) =>
        `### ${editor}\n${releases.slice(0, 5).map(r => `- ${r.version} (${r.publishedAt.slice(0, 10)})`).join('\n')}` +
        (releases.length > 5 ? `\n- ... and ${releases.length - 5} more versions` : '')
      ).join('\n\n')
    )
  }

  // Append explicit URL allowlist to reduce hallucination
  const { editorUrls } = collectUrlsFromRaw(raw)
  const urlSection: string[] = ['## 可用 URL 列表（sourceUrl 和 blogs url 必须从此列表中选取，不在列表中的 URL 一律不可使用）']
  for (const [editor, urls] of editorUrls.entries()) {
    urlSection.push(`${editor}: ${[...new Set(urls)].join(' , ')}`)
  }
  for (const r of raw.rssArticles) {
    urlSection.push(`Blog "${r.title}": ${r.url}`)
  }
  sections.push(urlSection.join('\n'))

  return sections.join('\n\n---\n\n') || 'No data collected this week.'
}

function extractBalancedJson(text: string): string | null {
  const start = text.indexOf('{')
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') depth--
    if (depth === 0) return text.slice(start, i + 1)
  }
  return null
}

function fallbackSummary(raw: RawData): SummarizedWeekly {
  // Build editors from raw data without AI summarization
  const editorMap = new Map<string, SummarizedEditor>()
  const categoryMap = new Map(EDITORS.map(e => [e.name, e.category]))

  for (const release of raw.githubReleases) {
    editorMap.set(release.editor, {
      name: release.editor,
      category: categoryMap.get(release.editor) || 'cli',
      version: release.version,
      highlights: [release.body.split('\n').filter(l => l.trim()).slice(0, 3).join('; ')].filter(Boolean),
      source: 'GitHub Releases',
      sourceUrl: release.htmlUrl,
      aiSummary: '',
    })
  }

  // Merge search results
  for (const r of [...raw.tavilyResults, ...raw.bailianResults]) {
    if (!editorMap.has(r.editor)) {
      editorMap.set(r.editor, {
        name: r.editor,
        category: categoryMap.get(r.editor) || 'cli',
        highlights: [],
        source: 'Search',
        sourceUrl: r.url,
        aiSummary: '',
      })
    }
    const entry = editorMap.get(r.editor)!
    if (r.title) entry.highlights.push(r.title)
  }

  return {
    editors: Array.from(editorMap.values()),
    blogs: raw.rssArticles.map(a => ({
      company: a.company,
      title: a.title,
      url: a.url,
      publishedAt: a.publishedAt,
      summary: a.summary,
      tags: a.tags,
    })),
    weekSummary: `本周共追踪到 ${editorMap.size} 个编辑器的更新和 ${raw.rssArticles.length} 篇公司博客文章。`,
  }
}
