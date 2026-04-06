import { describe, it, expect } from 'vitest'
import { stripMarkdownTitle } from './utils'

describe('stripMarkdownTitle', () => {
  it('strips single # heading marker', () => {
    expect(stripMarkdownTitle('# Hello World')).toBe('Hello World')
  })

  it('strips ## heading marker', () => {
    expect(stripMarkdownTitle('## Section Title')).toBe('Section Title')
  })

  it('strips ### heading marker', () => {
    expect(stripMarkdownTitle('### 最致命的问题：无法应对考古需求')).toBe('最致命的问题：无法应对考古需求')
  })

  it('strips ###### heading marker', () => {
    expect(stripMarkdownTitle('###### Deep Heading')).toBe('Deep Heading')
  })

  it('returns clean titles unchanged', () => {
    expect(stripMarkdownTitle('Already Clean Title')).toBe('Already Clean Title')
  })

  it('handles empty string', () => {
    expect(stripMarkdownTitle('')).toBe('')
  })

  it('strips heading marker even with leading whitespace', () => {
    expect(stripMarkdownTitle('  ## Spaced Title  ')).toBe('Spaced Title')
  })

  it('does not strip # without trailing space', () => {
    expect(stripMarkdownTitle('#NoSpace')).toBe('#NoSpace')
  })

  it('only strips leading heading markers', () => {
    expect(stripMarkdownTitle('## Title with # in middle')).toBe('Title with # in middle')
  })
})
