// GitHub Releases API — fetch latest releases for open-source editors
import { EDITORS, type WeekBounds } from '../config'

export interface GitHubRelease {
  editor: string
  version: string
  publishedAt: string
  body: string
  htmlUrl: string
}

export async function fetchGitHubReleases(bounds: WeekBounds): Promise<GitHubRelease[]> {
  const editorsWithRepo = EDITORS.filter(e => e.sources.githubRepo)
  const results: GitHubRelease[] = []

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'KInfoGit-Code-Weekly',
  }

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const settled = await Promise.allSettled(
    editorsWithRepo.map(async (editor) => {
      const repo = editor.sources.githubRepo!
      const url = `https://api.github.com/repos/${repo}/releases?per_page=10`

      const res = await fetch(url, { headers })
      if (!res.ok) {
        console.warn(`[github-releases] ${repo}: HTTP ${res.status}`)
        return []
      }

      const releases = await res.json() as Array<{
        tag_name: string
        published_at: string
        body: string
        html_url: string
      }>

      // Filter to releases within the target week (Asia/Shanghai Mon–Sun).
      return releases
        .filter(r => {
          const pub = new Date(r.published_at).getTime()
          return pub >= bounds.start.getTime() && pub < bounds.end.getTime()
        })
        .map(r => ({
          editor: editor.name,
          version: r.tag_name,
          publishedAt: r.published_at,
          body: r.body?.slice(0, 2000) || '',
          htmlUrl: r.html_url,
        }))
    })
  )

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(...result.value)
    } else {
      console.warn('[github-releases] Failed:', result.reason)
    }
  }

  return results
}
