import fs from 'fs'
import path from 'path'

/**
 * Resolve a subdirectory under `profile-data/` with a double-cwd fallback.
 *
 * Next.js tooling runs from two possible working directories:
 * - `website/` (dev server, build) → data lives at `../profile-data/<sub>`
 * - repo root (some scripts / CI contexts) → data lives at `./profile-data/<sub>`
 *
 * This helper checks both locations and returns whichever exists. If neither
 * exists (first-run / missing data), it returns the preferred `../profile-data`
 * form so downstream `fs.readdir` surfaces a clean ENOENT.
 *
 * @param segments path segments under `profile-data/` (e.g. `['github-stars']`
 *   or `['ai-daily', '_meta']`). Joined via `path.join`.
 * @returns absolute filesystem path to the resolved directory or file.
 *
 * @example
 *   const dir = resolveProfileDataPath('github-stars')
 *   const metaDir = resolveProfileDataPath('ai-daily', '_meta')
 *   const jsonPath = resolveProfileDataPath('people.json')
 */
export function resolveProfileDataPath(...segments: string[]): string {
  const primary = path.join(process.cwd(), '..', 'profile-data', ...segments)
  if (fs.existsSync(primary)) return primary
  const fallback = path.join(process.cwd(), 'profile-data', ...segments)
  if (fs.existsSync(fallback)) return fallback
  return primary
}
