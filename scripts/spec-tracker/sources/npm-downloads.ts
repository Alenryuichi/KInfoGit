// npm Downloads — fetch weekly download counts + latest version

import type { NpmStats } from '../types'
import type { FrameworkConfig } from '../config'

const NPM_DOWNLOADS_API = 'https://api.npmjs.org/downloads/point/last-week'
const NPM_REGISTRY = 'https://registry.npmjs.org'

interface DownloadsResponse {
  downloads: number
  package: string
}

interface RegistryResponse {
  'dist-tags'?: Record<string, string>
  time?: Record<string, string>
}

async function fetchPackageStats(pkg: string): Promise<NpmStats | null> {
  try {
    // Fetch downloads and registry info in parallel
    const [dlRes, regRes] = await Promise.allSettled([
      fetch(`${NPM_DOWNLOADS_API}/${pkg}`, {
        headers: { 'User-Agent': 'KInfoGit-Spec-Tracker' },
        signal: AbortSignal.timeout(15_000),
      }),
      fetch(`${NPM_REGISTRY}/${pkg}`, {
        headers: {
          'User-Agent': 'KInfoGit-Spec-Tracker',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(15_000),
      }),
    ])

    // Parse downloads
    let weeklyDownloads = 0
    if (dlRes.status === 'fulfilled' && dlRes.value.ok) {
      const dlData = await dlRes.value.json() as DownloadsResponse
      weeklyDownloads = dlData.downloads ?? 0
    }

    // Parse registry
    let latestVersion = ''
    let lastPublishedAt = ''
    if (regRes.status === 'fulfilled' && regRes.value.ok) {
      const regData = await regRes.value.json() as RegistryResponse
      latestVersion = regData['dist-tags']?.latest ?? ''

      if (regData.time && latestVersion) {
        lastPublishedAt = regData.time[latestVersion] ?? ''
      }
    } else {
      // If registry failed entirely (e.g. 404), skip this package
      const status = regRes.status === 'fulfilled' ? regRes.value.status : 'network error'
      console.warn(`[npm] ${pkg}: registry ${status}`)
      return null
    }

    return {
      package: pkg,
      latestVersion,
      weeklyDownloads,
      lastPublishedAt,
    }
  } catch (err) {
    console.warn(`[npm] ${pkg} failed:`, err)
    return null
  }
}

/**
 * Fetch npm stats for all frameworks with a configured npmPackage.
 */
export async function fetchAllNpmStats(
  frameworks: FrameworkConfig[],
): Promise<Map<string, NpmStats>> {
  const withNpm = frameworks.filter(f => f.sources.npmPackage)
  const results = new Map<string, NpmStats>()

  const settled = await Promise.allSettled(
    withNpm.map(async (fw) => {
      const stats = await fetchPackageStats(fw.sources.npmPackage!)
      if (stats) {
        results.set(fw.id, stats)
        console.log(`[npm] ${fw.id}: ${stats.weeklyDownloads} downloads/wk, v${stats.latestVersion}`)
      }
    }),
  )

  const failures = settled.filter(r => r.status === 'rejected')
  if (failures.length > 0) {
    console.warn(`[npm] ${failures.length} packages failed`)
  }

  return results
}
