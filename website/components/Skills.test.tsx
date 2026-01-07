/**
 * Skills Component Tests
 * @module components/Skills.test
 *
 * Tests for Story 6-3: About page optimization - Skills section animations
 */
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import Skills from './Skills'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} data-testid="motion-div" {...props}>{children}</div>,
    a: ({ children, className, href, ...props }: any) => <a className={className} href={href} data-testid="motion-a" {...props}>{children}</a>,
  },
}))

// Mock animations utility
vi.mock('@/utils/animations', () => ({
  animateOnScroll: vi.fn(),
  animateSkillTags: vi.fn(),
}))

describe('Skills Component', () => {
  it('renders the Skills section with correct heading', () => {
    const { container } = render(<Skills />)

    expect(container.textContent).toContain('My Skills')
    expect(container.textContent).toContain('The Secret Sauce')
  })

  it('renders all four skill categories', () => {
    const { container } = render(<Skills />)

    expect(container.textContent).toContain('Frontend')
    expect(container.textContent).toContain('Backend & Database')
    expect(container.textContent).toContain('AI & Agentic Engineering')
    expect(container.textContent).toContain('Tools & DevOps')
  })

  it('renders Core Strengths cards with motion animation', () => {
    const { container } = render(<Skills />)

    // Check that Core Strengths titles exist
    expect(container.textContent).toContain('Anti-fraud Expert')
    expect(container.textContent).toContain('System Architect')
    expect(container.textContent).toContain('Full-Stack Developer')

    // Check motion divs are rendered (for entrance animation)
    const motionDivs = container.querySelectorAll('[data-testid="motion-div"]')
    expect(motionDivs.length).toBeGreaterThan(0)
  })

  it('renders CTA section with Get In Touch button', () => {
    const { container } = render(<Skills />)

    expect(container.textContent).toContain('Ready to build something amazing?')

    const ctaButton = container.querySelector('a[href="#contact"]')
    expect(ctaButton).not.toBeNull()
    expect(ctaButton?.textContent).toContain('Get In Touch')
  })

  it('renders tech badges for each category', () => {
    const { container } = render(<Skills />)

    // Check some tech names exist
    expect(container.textContent).toContain('React')
    expect(container.textContent).toContain('TypeScript')
    expect(container.textContent).toContain('Docker')
  })

  it('renders quality attributes section', () => {
    const { container } = render(<Skills />)

    expect(container.textContent).toContain('Websites that stand out and make a difference')
    expect(container.textContent).toContain('Accessible')
    expect(container.textContent).toContain('Responsive')
  })
})