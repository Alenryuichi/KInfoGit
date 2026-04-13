// 百炼 WebSearch API — Chinese editor news search
import { BAILIAN_API_URL, BAILIAN_MODEL } from '../config'

export interface BailianResult {
  editor: string
  title: string
  url: string
  content: string
}

interface BailianResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function searchBailian(query: string, editor: string): Promise<BailianResult[]> {
  const apiKey = process.env.BAILIAN_API_KEY
  if (!apiKey) {
    console.warn('[bailian] BAILIAN_API_KEY not set, skipping')
    return []
  }

  const res = await fetch(BAILIAN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: BAILIAN_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个搜索助手。请根据用户的搜索查询，只返回最近一周（7天内）的相关新闻和功能更新信息，忽略更早的内容。以 JSON 数组格式返回结果，每项包含 title、url、content 字段。只返回 JSON，不要其他文字。',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      enable_search: true,
    }),
  })

  if (!res.ok) {
    console.warn(`[bailian] ${editor}: HTTP ${res.status}`)
    return []
  }

  const data = await res.json() as BailianResponse
  const content = data.choices?.[0]?.message?.content || ''

  // Try to parse JSON from the response
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    const items = JSON.parse(jsonMatch[0]) as Array<{
      title: string
      url: string
      content: string
    }>

    return items.map(item => ({
      editor,
      title: item.title || '',
      url: item.url || '',
      content: (item.content || '').slice(0, 1000),
    }))
  } catch {
    // If not parseable as JSON, treat whole content as a single result
    return [{
      editor,
      title: `${editor} 最新动态`,
      url: '',
      content: content.slice(0, 1000),
    }]
  }
}

export async function fetchBailianForEditors(
  editors: Array<{ name: string; query: string }>
): Promise<BailianResult[]> {
  if (!process.env.BAILIAN_API_KEY) {
    console.warn('[bailian] BAILIAN_API_KEY not set, skipping all Bailian searches')
    return []
  }

  const settled = await Promise.allSettled(
    editors.map(({ name, query }) => searchBailian(query, name))
  )

  const results: BailianResult[] = []
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(...result.value)
    } else {
      console.warn('[bailian] Failed:', result.reason)
    }
  }

  return results
}
