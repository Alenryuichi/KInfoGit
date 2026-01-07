/**
 * Skills Component Tests
 * @module components/Skills.test
 *
 * Tests for Story 6-3: About page optimization - Skills section animations
 */
import { describe, it, expect, vi } from 'vitest'

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
  it('renders the Skills section with correct heading', async () => {
    const { default: Skills } = await import('./Skills')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(Skills))

    expect(container.textContent).toContain('My Skills')
    expect(container.textContent).toContain('The Secret Sauce')
  })

  it('renders all three skill categories', async () => {
    const { default: Skills } = await import('./Skills')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(Skills))

    expect(container.textContent).toContain('Frontend Technologies')
    expect(container.textContent).toContain('Backend & Database')
    expect(container.textContent).toContain('Tools & DevOps')
  })

  it('renders Core Strengths cards with motion animation', async () => {
    const { default: Skills } = await import('./Skills')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(Skills))

    // Check that Core Strengths titles exist
    expect(container.textContent).toContain('Anti-fraud Expert')
    expect(container.textContent).toContain('System Architect')
    expect(container.textContent).toContain('Full-Stack Developer')

    // Check motion divs are rendered (for entrance animation)
    const motionDivs = container.querySelectorAll('[data-testid="motion-div"]')
    expect(motionDivs.length).toBeGreaterThan(0)
  })

  it('renders CTA section with Get In Touch button', async () => {
    const { default: Skills } = await import('./Skills')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(Skills))

    expect(container.textContent).toContain('Ready to build something amazing?')

    const ctaButton = container.querySelector('a[href="#contact"]')
    expect(ctaButton).not.toBeNull()
    expect(ctaButton?.textContent).toContain('Get In Touch')
  })

  it('renders tech badges for each category', async () => {
    const { default: Skills } = await import('./Skills')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(Skills))

    // Check some tech names exist
    expect(container.textContent).toContain('React')
    expect(container.textContent).toContain('TypeScript')
    expect(container.textContent).toContain('Docker')
  })

  it('renders quality attributes section', async () => {
    const { default: Skills } = await import('./Skills')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(Skills))

    expect(container.textContent).toContain('Websites that stand out and make a difference')
    expect(container.textContent).toContain('Accessible')
    expect(container.textContent).toContain('Responsive')
  })
})

