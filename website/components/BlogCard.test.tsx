/**
 * BlogCard Component Tests
 * @module components/BlogCard.test
 *
 * Tests for Story 6-4: Blog page optimization - card hover effects
 */
import { describe, it, expect, vi } from 'vitest'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} />,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    article: ({ children, className, whileHover, ...props }: any) => (
      <article
        className={className}
        data-testid="motion-article"
        data-hover-y={whileHover?.y}
      >
        {children}
      </article>
    ),
  },
}))

const mockPost = {
  slug: 'test-post',
  title: 'Test Blog Post Title',
  date: '2026-01-07',
  excerpt: 'This is a test excerpt for the blog post.',
  readTime: '5 min read',
  tags: ['React', 'TypeScript', 'Testing'],
  category: 'Development',
  featured: false,
}

describe('BlogCard Component', () => {
  it('renders blog post title', async () => {
    const { default: BlogCard } = await import('./BlogCard')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(BlogCard, { post: mockPost }))

    expect(container.textContent).toContain('Test Blog Post Title')
  })

  it('renders formatted date', async () => {
    const { default: BlogCard } = await import('./BlogCard')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(BlogCard, { post: mockPost }))

    // Date should be formatted as "Jan 7, 2026"
    expect(container.textContent).toContain('Jan 7, 2026')
  })

  it('renders excerpt text', async () => {
    const { default: BlogCard } = await import('./BlogCard')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(BlogCard, { post: mockPost }))

    expect(container.textContent).toContain('This is a test excerpt for the blog post.')
  })

  it('renders tags', async () => {
    const { default: BlogCard } = await import('./BlogCard')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(BlogCard, { post: mockPost }))

    expect(container.textContent).toContain('React')
    expect(container.textContent).toContain('TypeScript')
    expect(container.textContent).toContain('Testing')
  })

  it('renders read time', async () => {
    const { default: BlogCard } = await import('./BlogCard')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(BlogCard, { post: mockPost }))

    expect(container.textContent).toContain('5 min read')
  })

  it('links to the correct blog post URL', async () => {
    const { default: BlogCard } = await import('./BlogCard')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(BlogCard, { post: mockPost }))

    const link = container.querySelector('a')
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe('/blog/test-post')
  })

  it('renders motion article with hover animation (y: -8)', async () => {
    const { default: BlogCard } = await import('./BlogCard')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const { container } = render(React.createElement(BlogCard, { post: mockPost }))

    const motionArticle = container.querySelector('[data-testid="motion-article"]')
    expect(motionArticle).not.toBeNull()
    expect(motionArticle?.getAttribute('data-hover-y')).toBe('-8')
  })

  it('shows featured badge when post is featured', async () => {
    const { default: BlogCard } = await import('./BlogCard')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const featuredPost = { ...mockPost, featured: true }
    const { container } = render(React.createElement(BlogCard, { post: featuredPost }))

    expect(container.textContent).toContain('Featured')
  })

  it('limits tags display to 4 and shows "+X more"', async () => {
    const { default: BlogCard } = await import('./BlogCard')
    const React = await import('react')
    const { render } = await import('@testing-library/react')

    const manyTagsPost = {
      ...mockPost,
      tags: ['React', 'TypeScript', 'Testing', 'Next.js', 'Tailwind', 'Vitest'],
    }
    const { container } = render(React.createElement(BlogCard, { post: manyTagsPost }))

    // Should show first 4 tags and "+2 more"
    expect(container.textContent).toContain('React')
    expect(container.textContent).toContain('TypeScript')
    expect(container.textContent).toContain('Testing')
    expect(container.textContent).toContain('Next.js')
    expect(container.textContent).toContain('+2 more')
  })
})

