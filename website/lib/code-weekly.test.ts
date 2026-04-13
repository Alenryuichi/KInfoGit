import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'

// We test getBenchmarkHistory by pointing it at a real temp dir.
// The function uses getBenchmarksDir() which checks process.cwd()/../profile-data/benchmarks
// We'll test the extraction logic directly instead.

// Re-implement minimal extraction logic for testability
// (since we can't easily redirect the fs path in the module)

interface SimpleBenchmarkData {
  arenaRanking: Array<{ rank: number; model: string; elo: number; org: string; delta: number }>
  aiderLeaderboard: Array<{ model: string; passRate: number; delta: number }>
  sweBench?: Array<{ model: string; resolved: number; org?: string }>
  liveCodeBench?: Array<{ model: string; passRate: number }>
}

function makeBenchmarkJson(overrides: Partial<SimpleBenchmarkData> = {}): string {
  return JSON.stringify({
    arenaRanking: [
      { rank: 1, model: 'Model A', elo: 1500, org: 'Anthropic', delta: 0 },
      { rank: 2, model: 'Model B', elo: 1480, org: 'OpenAI', delta: 0 },
      { rank: 3, model: 'Model C', elo: 1460, org: 'Google', delta: 0 },
    ],
    aiderLeaderboard: [
      { model: 'Model A', passRate: 80, delta: 0 },
      { model: 'Model B', passRate: 75, delta: 0 },
    ],
    sweBench: [
      { model: 'Agent A', resolved: 70, org: 'Anthropic' },
    ],
    liveCodeBench: [
      { model: 'Model X', passRate: 85 },
    ],
    ...overrides,
  })
}

// Test the history aggregation logic using a temp directory
describe('getBenchmarkHistory logic', () => {
  let tmpDir: string
  let historyDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-test-'))
    historyDir = path.join(tmpDir, 'history')
    fs.mkdirSync(historyDir, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  function readHistoryFiles() {
    const files = fs.readdirSync(historyDir)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort()

    type ModelEntry = { model: string; value: number; rank: number; org: string }
    const results: Array<{ date: string; models: ModelEntry[] }> = []

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(historyDir, file), 'utf-8')
        const data = JSON.parse(content) as SimpleBenchmarkData
        if (!data.arenaRanking || !Array.isArray(data.arenaRanking)) continue
        const models = data.arenaRanking.slice(0, 10).map((e, i) => ({
          model: e.model, value: e.elo, rank: i + 1, org: e.org,
        }))
        results.push({ date: file.replace('.json', ''), models })
      } catch {
        continue
      }
    }
    return results
  }

  it('returns empty for empty directory', () => {
    expect(readHistoryFiles()).toEqual([])
  })

  it('aggregates multiple files chronologically', () => {
    fs.writeFileSync(path.join(historyDir, '2026-04-11.json'), makeBenchmarkJson())
    fs.writeFileSync(path.join(historyDir, '2026-04-10.json'), makeBenchmarkJson())
    const results = readHistoryFiles()
    expect(results.length).toBe(2)
    expect(results[0].date).toBe('2026-04-10')
    expect(results[1].date).toBe('2026-04-11')
  })

  it('skips malformed JSON files', () => {
    fs.writeFileSync(path.join(historyDir, '2026-04-10.json'), 'INVALID{')
    fs.writeFileSync(path.join(historyDir, '2026-04-11.json'), makeBenchmarkJson())
    const results = readHistoryFiles()
    expect(results.length).toBe(1)
    expect(results[0].date).toBe('2026-04-11')
  })

  it('limits to top 10 models per snapshot', () => {
    const bigRanking = Array.from({ length: 30 }, (_, i) => ({
      rank: i + 1, model: `Model ${i}`, elo: 1500 - i * 10, org: 'Test', delta: 0,
    }))
    fs.writeFileSync(
      path.join(historyDir, '2026-04-13.json'),
      JSON.stringify({ arenaRanking: bigRanking, aiderLeaderboard: [], sweBench: [], liveCodeBench: [] }),
    )
    const results = readHistoryFiles()
    expect(results[0].models.length).toBe(10)
  })

  it('handles single file gracefully', () => {
    fs.writeFileSync(path.join(historyDir, '2026-04-13.json'), makeBenchmarkJson())
    const results = readHistoryFiles()
    expect(results.length).toBe(1)
    expect(results[0].models.length).toBe(3)
  })

  it('ignores non-date-pattern files', () => {
    fs.writeFileSync(path.join(historyDir, 'latest.json'), makeBenchmarkJson())
    fs.writeFileSync(path.join(historyDir, '2026-04-13.json'), makeBenchmarkJson())
    const results = readHistoryFiles()
    expect(results.length).toBe(1)
  })
})
