// Spec Tracker — delta calculation between snapshots

import type { SpecSnapshot, FrameworkDelta, WeeklyDiff } from './types'

/**
 * Compute per-framework starsDelta and npmDelta by comparing current vs previous snapshot.
 * Returns null deltas when previous data is missing.
 */
export function computeDeltas(
  current: SpecSnapshot,
  previous: SpecSnapshot | null,
): FrameworkDelta[] {
  if (!previous) {
    return current.frameworks.map(fw => ({
      frameworkId: fw.id,
      starsDelta: null,
      npmDelta: null,
    }))
  }

  const prevMap = new Map(previous.frameworks.map(fw => [fw.id, fw]))

  return current.frameworks.map(fw => {
    const prev = prevMap.get(fw.id)

    const starsDelta =
      fw.github?.stars != null && prev?.github?.stars != null
        ? fw.github.stars - prev.github.stars
        : null

    const npmDelta =
      fw.npm?.weeklyDownloads != null && prev?.npm?.weeklyDownloads != null
        ? fw.npm.weeklyDownloads - prev.npm.weeklyDownloads
        : null

    return { frameworkId: fw.id, starsDelta, npmDelta }
  })
}

/**
 * Compute weekly diff: top gainer, new/exited discovered projects.
 */
export function computeWeeklyDiff(
  current: SpecSnapshot,
  previous: SpecSnapshot | null,
  deltas: FrameworkDelta[],
): WeeklyDiff | null {
  if (!previous) return null

  // Top gainer: framework with highest positive starsDelta
  let topGainer: WeeklyDiff['topGainer'] = null
  for (const d of deltas) {
    if (d.starsDelta != null && d.starsDelta > 0) {
      if (!topGainer || d.starsDelta > topGainer.delta) {
        topGainer = { frameworkId: d.frameworkId, delta: d.starsDelta }
      }
    }
  }

  // Discovered projects diff
  const prevNames = new Set(previous.discovered.map(p => p.fullName))
  const currNames = new Set(current.discovered.map(p => p.fullName))

  const newDiscovered = current.discovered
    .filter(p => !prevNames.has(p.fullName))
    .map(p => p.fullName)

  const exitedDiscovered = previous.discovered
    .filter(p => !currNames.has(p.fullName))
    .map(p => p.fullName)

  // Return null if everything is empty
  if (!topGainer && newDiscovered.length === 0 && exitedDiscovered.length === 0) {
    return null
  }

  return { topGainer, newDiscovered, exitedDiscovered }
}
