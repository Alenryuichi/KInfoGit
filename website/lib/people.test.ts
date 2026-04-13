import { describe, it, expect, vi } from 'vitest'
import { getAllPeople, getPersonByHandle, getAllPersonIds, getHandleToPersonMap } from './people'

// Mock fs module
vi.mock('fs', () => {
  const mockPeople = JSON.stringify([
    {
      id: 'karpathy',
      name: 'Andrej Karpathy',
      bio: 'AI educator',
      github: 'karpathy',
      bluesky: 'karpathy.bsky.social',
      avatar: 'https://example.com/avatar.jpg',
    },
    {
      id: 'simonw',
      name: 'Simon Willison',
      bio: 'AI tools blogger',
      github: 'simonw',
      bluesky: 'simonwillison.net',
      avatar: 'https://example.com/simon.jpg',
    },
    {
      id: 'markriedl',
      name: 'Mark Riedl',
      bio: 'Georgia Tech',
      bluesky: 'markriedl.bsky.social',
      avatar: '',
    },
  ])

  const mockActivity = JSON.stringify({
    id: 'karpathy',
    stars: [{ type: 'github', repo: 'test/repo', starredBy: 'karpathy' }],
    posts: [],
    dailyCounts: new Array(30).fill(0),
    interestSummary: 'Interested in LLMs',
  })

  return {
    default: {
      existsSync: (filePath: string) => {
        if (filePath.includes('people.json')) return true
        if (filePath.includes('people-activity/karpathy.json')) return true
        return false
      },
      readFileSync: (filePath: string) => {
        if (filePath.includes('people.json')) return mockPeople
        if (filePath.includes('people-activity/karpathy.json')) return mockActivity
        throw new Error('File not found')
      },
    },
    existsSync: (filePath: string) => {
      if (filePath.includes('people.json')) return true
      if (filePath.includes('people-activity/karpathy.json')) return true
      return false
    },
    readFileSync: (filePath: string) => {
      if (filePath.includes('people.json')) return mockPeople
      if (filePath.includes('people-activity/karpathy.json')) return mockActivity
      throw new Error('File not found')
    },
  }
})

describe('getAllPeople', () => {
  it('returns all people with activity counts', () => {
    const people = getAllPeople()
    expect(people).toHaveLength(3)
    expect(people[0].id).toBe('karpathy')
    expect(people[0].activityCount).toBe(1) // 1 star from mock
  })

  it('returns 0 activity count for people without activity files', () => {
    const people = getAllPeople()
    const simon = people.find(p => p.id === 'simonw')
    expect(simon?.activityCount).toBe(0)
  })
})

describe('getPersonByHandle', () => {
  it('returns person with activity data', () => {
    const person = getPersonByHandle('karpathy')
    expect(person).not.toBeNull()
    expect(person?.name).toBe('Andrej Karpathy')
    expect(person?.activity.stars).toHaveLength(1)
    expect(person?.activity.interestSummary).toBe('Interested in LLMs')
  })

  it('returns person with empty activity when no activity file', () => {
    const person = getPersonByHandle('simonw')
    expect(person).not.toBeNull()
    expect(person?.name).toBe('Simon Willison')
    expect(person?.activity.stars).toHaveLength(0)
    expect(person?.activity.posts).toHaveLength(0)
    expect(person?.activity.dailyCounts).toHaveLength(30)
  })

  it('returns null for unknown handle', () => {
    const person = getPersonByHandle('nonexistent')
    expect(person).toBeNull()
  })
})

describe('getAllPersonIds', () => {
  it('returns all person IDs', () => {
    const ids = getAllPersonIds()
    expect(ids).toEqual(['karpathy', 'simonw', 'markriedl'])
  })
})

describe('getHandleToPersonMap', () => {
  it('maps github usernames to person IDs', () => {
    const map = getHandleToPersonMap()
    expect(map['github:karpathy']).toBe('karpathy')
    expect(map['github:simonw']).toBe('simonw')
  })

  it('maps bluesky handles to person IDs', () => {
    const map = getHandleToPersonMap()
    expect(map['bluesky:karpathy.bsky.social']).toBe('karpathy')
    expect(map['bluesky:simonwillison.net']).toBe('simonw')
    expect(map['bluesky:markriedl.bsky.social']).toBe('markriedl')
  })

  it('does not include github key for bluesky-only people', () => {
    const map = getHandleToPersonMap()
    // markriedl has no github
    expect(Object.keys(map).filter(k => k.startsWith('github:'))).toHaveLength(2)
  })
})
