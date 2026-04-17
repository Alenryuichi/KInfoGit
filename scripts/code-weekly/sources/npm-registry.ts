// npm Registry — fetch recent package versions
// Uses the public npm registry API (no auth needed)
import type { WeekBounds } from '../config'

export interface NpmRelease {
  editor: string
  pkg: string
  version: string
  publishedAt: string
}

const NPM_REGISTRY = 'https://registry.npmjs.org'

interface NpmPackageData {
  'dist-tags'?: Record<string, string>
  time?: Record<string, string>  // version → ISO date, plus "created" and "modified"
}

/**
 * Fetch package versions published within the target week for configured
 * npm packages. Uses the full metadata endpoint to get the per-version
 * timestamp map.
 */
export async function fetchNpmReleases(
  packages: Array<{ editor: string; pkg: string }>,
  bounds: WeekBounds,
): Promise<NpmRelease[]> {
  const results = await Promise.allSettled(
    packages.map(p => fetchPackageReleases(p.editor, p.pkg, bounds))
  )

  const releases: NpmRelease[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      releases.push(...result.value)
    }
  }

  return releases
}

async function fetchPackageReleases(
  editor: string,
  pkg: string,
  bounds: WeekBounds,
): Promise<NpmRelease[]> {
  try {
    const res = await fetch(`${NPM_REGISTRY}/${pkg}`, {
      headers: {
        'User-Agent': 'KInfoGit-Code-Weekly',
        // Request abbreviated metadata (smaller response)
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      console.warn(`[npm] ${pkg}: HTTP ${res.status}`)
      return []
    }

    const data = await res.json() as NpmPackageData
    if (!data.time) return []

    const releases: NpmRelease[] = []

    for (const [version, dateStr] of Object.entries(data.time)) {
      // Skip metadata keys
      if (version === 'created' || version === 'modified') continue

      const pub = new Date(dateStr).getTime()
      if (isNaN(pub) || pub < bounds.start.getTime() || pub >= bounds.end.getTime()) continue

      releases.push({
        editor,
        pkg,
        version,
        publishedAt: dateStr,
      })
    }

    // Sort newest first
    releases.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    if (releases.length > 0) {
      console.log(`[npm] ${pkg}: ${releases.length} versions in ${bounds.weekLabel} (latest: ${releases[0].version})`)
    }

    return releases
  } catch (err) {
    console.warn(`[npm] ${pkg} failed:`, err)
    return []
  }
}
