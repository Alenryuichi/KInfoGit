---
title: "How to Build a Blog with Next.js and MDX"
date: "2025-01-08"
tags: ["typescript", "nextjs", "mdx"]
category: "Recently Updated"
readTime: "8 min read"
featured: false
image: "/blog/nextjs-mdx.jpg"
excerpt: "Build a blazing fast markdown blog using Next.js and MDX with this complete walkthrough guide. Perfect for developers who want full control."
---

# How to Build a Blog with Next.js and MDX

Building a blog in 2025 doesn't have to be complicated. With Next.js and MDX, you can create a blazing-fast, developer-friendly blog that gives you complete control over your content and design.

## Why Next.js + MDX?

### The Perfect Combination
- **Next.js** - React framework with excellent performance
- **MDX** - Markdown with React components
- **TypeScript** - Type safety for better DX
- **Tailwind CSS** - Utility-first styling

### Benefits
1. **Performance** - Static generation for lightning-fast loading
2. **SEO** - Server-side rendering out of the box
3. **Developer Experience** - Hot reloading and TypeScript support
4. **Flexibility** - Custom React components in markdown

## Setting Up the Project

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest my-blog --typescript --tailwind --eslint
cd my-blog
```

### 2. Install MDX Dependencies

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
npm install gray-matter remark remark-html
```

### 3. Configure Next.js for MDX

```javascript
// next.config.js
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

module.exports = withMDX({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  experimental: {
    mdxRs: true,
  },
})
```

## Creating the Blog Structure

### File Organization
```
blog/
├── posts/
│   ├── 2025-01-08-nextjs-blog.md
│   └── 2025-01-15-frontend-stack.md
├── components/
│   ├── BlogCard.tsx
│   ├── BlogLayout.tsx
│   └── SearchBox.tsx
└── lib/
    └── blog.ts
```

### Blog Data Types

```typescript
// lib/types.ts
export interface BlogPost {
  slug: string
  title: string
  date: string
  tags: string[]
  category: string
  readTime: string
  featured: boolean
  image?: string
  excerpt: string
  content: string
}
```

## Building Core Components

### Blog Card Component

```tsx
// components/BlogCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/lib/types'

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors">
          {post.image && (
            <div className="aspect-video relative">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <time>{post.date}</time>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {post.title}
            </h3>
            
            <p className="text-gray-300 text-sm mb-4">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
```

## Advanced Features

### Search Functionality

```tsx
// components/SearchBox.tsx
'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchBoxProps {
  onSearch: (query: string) => void
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
        <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">
          ⌘K
        </kbd>
      </div>
    </form>
  )
}
```

## Deployment

### Vercel Deployment
```bash
npm install -g vercel
vercel --prod
```

### Performance Optimizations
- **Image optimization** - Next.js Image component
- **Static generation** - Pre-render at build time
- **Code splitting** - Automatic by Next.js
- **Caching** - CDN and browser caching

## Conclusion

Building a blog with Next.js and MDX gives you the perfect balance of performance, flexibility, and developer experience. You get:

- ⚡ **Lightning fast** - Static generation
- 🎨 **Full control** - Custom React components
- 📱 **Responsive** - Mobile-first design
- 🔍 **SEO optimized** - Server-side rendering

The setup might seem complex initially, but the long-term benefits are worth it. You'll have a blog that's fast, maintainable, and completely under your control.

---

*Ready to build your own blog? Check out the [complete source code](https://github.com/kylinmiao/nextjs-mdx-blog) on GitHub.*
