import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { BenchmarkSection } from './BenchmarkSection'
import type { BenchmarkSummary } from './HeroCards'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(function MotionDiv(
      { children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
      ref: React.Ref<HTMLDivElement>,
    ) {
      return React.createElement('div', { ...props, ref }, children)
    }),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}))

const baseBenchmark: BenchmarkSummary = {
  id: 'swe-bench',
  title: 'SWE-bench',
  unit: '%',
  maxValue: 100,
  topN: [
    { label: 'Model A', value: 80, org: 'Anthropic' },
    { label: 'Model B', value: 70, org: 'OpenAI' },
  ],
}

describe('BenchmarkSection', () => {
  it('shows Chart and Table buttons', () => {
    const { container } = render(
      React.createElement(BenchmarkSection, {
        benchmark: baseBenchmark,
        description: 'Test',
        tableContent: React.createElement('div', null, 'table'),
      }),
    )
    const buttons = container.querySelectorAll('button')
    const labels = Array.from(buttons).map(b => b.textContent)
    expect(labels).toEqual(['Chart', 'Table'])
  })

  it('defaults to chart view', () => {
    const { container } = render(
      React.createElement(BenchmarkSection, {
        benchmark: baseBenchmark,
        description: 'Test',
        tableContent: React.createElement('div', { 'data-testid': 'table' }, 'table content'),
      }),
    )
    const chartBtn = container.querySelectorAll('button')[0]
    expect(chartBtn.getAttribute('aria-pressed')).toBe('true')
  })

  it('switches to table view when Table clicked', () => {
    const { container, getByText } = render(
      React.createElement(BenchmarkSection, {
        benchmark: baseBenchmark,
        description: 'Test',
        tableContent: React.createElement('div', null, 'table content'),
      }),
    )
    const tableBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Table')
    fireEvent.click(tableBtn!)
    expect(getByText('table content')).toBeDefined()
  })
})
