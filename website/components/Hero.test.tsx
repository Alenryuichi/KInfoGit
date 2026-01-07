/**
 * Hero Component Tests
 * @module components/Hero.test
 * 
 * Tests for Story 6-1: Let's Connect button navigation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the animations module to avoid GSAP issues in tests
vi.mock('@/utils/animations', () => ({
  animateHeroEntrance: vi.fn(),
  addButtonHoverEffects: vi.fn(),
}))

describe('Hero Component', () => {
  describe('Let\'s Connect Button (Story 6-1)', () => {
    it('should have href pointing to /about#contact', async () => {
      // Import dynamically after mocks are set up
      const { default: Hero } = await import('./Hero')
      const React = await import('react')
      const { render } = await import('@testing-library/react')
      
      const { container } = render(React.createElement(Hero))
      
      // Find the "Let's Connect" button by its text
      const letsConnectLink = container.querySelector('a[href="/about#contact"]')
      
      expect(letsConnectLink).not.toBeNull()
      expect(letsConnectLink?.textContent).toContain("Let's Connect")
    })

    it('should have aria-label for accessibility', async () => {
      const { default: Hero } = await import('./Hero')
      const React = await import('react')
      const { render } = await import('@testing-library/react')
      
      const { container } = render(React.createElement(Hero))
      
      const letsConnectLink = container.querySelector('a[href="/about#contact"]')
      
      expect(letsConnectLink).not.toBeNull()
      expect(letsConnectLink?.getAttribute('aria-label')).toBe("Let's Connect - Navigate to contact section")
    })

    it('should have View My Work button linking to /work#projects', async () => {
      const { default: Hero } = await import('./Hero')
      const React = await import('react')
      const { render } = await import('@testing-library/react')
      
      const { container } = render(React.createElement(Hero))
      
      const viewWorkLink = container.querySelector('a[href="/work#projects"]')
      
      expect(viewWorkLink).not.toBeNull()
      expect(viewWorkLink?.textContent).toContain('View My Work')
    })
  })
})

