/**
 * About Component Tests
 * @module components/About.test
 * 
 * Tests for Story 6-1: Contact anchor for navigation
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import About from './About'

describe('About Component', () => {
  describe('Contact Anchor (Story 6-1)', () => {
    it('should have element with id="contact"', () => {
      const { container } = render(<About />)
      
      const contactElement = container.querySelector('#contact')
      
      expect(contactElement).not.toBeNull()
    })

    it('should have scroll-mt-24 class for header offset', () => {
      const { container } = render(<About />)
      
      const contactElement = container.querySelector('#contact')
      
      expect(contactElement).not.toBeNull()
      expect(contactElement?.classList.contains('scroll-mt-24')).toBe(true)
    })

    it('should contain social links within contact section', () => {
      const { container } = render(<About />)
      
      const contactElement = container.querySelector('#contact')
      
      expect(contactElement).not.toBeNull()
      
      // Should contain email, GitHub, and LinkedIn links
      const links = contactElement?.querySelectorAll('a')
      expect(links?.length).toBeGreaterThanOrEqual(3)
      
      // Check for email link
      const emailLink = contactElement?.querySelector('a[href^="mailto:"]')
      expect(emailLink).not.toBeNull()
      
      // Check for GitHub link
      const githubLink = contactElement?.querySelector('a[href*="github"]')
      expect(githubLink).not.toBeNull()
      
      // Check for LinkedIn link
      const linkedinLink = contactElement?.querySelector('a[href*="linkedin"]')
      expect(linkedinLink).not.toBeNull()
    })
  })
})

