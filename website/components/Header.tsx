'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Fuse from 'fuse.js'

interface SearchItem {
  title: string
  description: string
  url: string
  category: string
  type: 'blog' | 'project'
}

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Work', href: '/work' },
  { name: 'Blog', href: '/blog' },
]

interface HeaderProps {
  onBookCallClick: () => void
}

// Logo Component - using custom SVG logo
const Logo = () => (
  <div className="group cursor-pointer header-transition">
    <div className="relative logo-glow">
      <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl header-transition group-hover:scale-110 flex items-center justify-center">
        <Image
          src="/logo.svg"
          alt="KM Logo"
          width={48}
          height={48}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      {/* Enhanced glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 scale-150"></div>
    </div>
  </div>
)

export default function Header({ onBookCallClick }: HeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const fuseRef = useRef<Fuse<SearchItem> | null>(null)

  // Get current active tab based on route
  const getActiveTab = () => {
    const path = router.pathname
    if (path === '/') return 'Home'
    if (path === '/about') return 'About'
    if (path === '/work') return 'Work'
    if (path.startsWith('/blog')) return 'Blog'
    return 'Home'
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load search index
  useEffect(() => {
    if (isSearchOpen && !fuseRef.current) {
      fetch('/search-index.json')
        .then(res => res.json())
        .then(data => {
          fuseRef.current = new Fuse(data, {
            keys: ['title', 'description', 'category'],
            threshold: 0.3,
            includeMatches: true
          })
        })
        .catch(err => console.error('Failed to load search index:', err))
    }
  }, [isSearchOpen])

  // Real-time search
  useEffect(() => {
    if (fuseRef.current && searchQuery.trim()) {
      const results = fuseRef.current.search(searchQuery).map(r => r.item)
      setSearchResults(results.slice(0, 5))
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleTabClick = () => {
    setIsMenuOpen(false)
  }

  const handleBookCallClick = () => {
    onBookCallClick()
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      router.push(searchResults[0].url)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between py-4">
          {/* Logo - Left Side */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Navigation - Center */}
          <nav className="hidden md:flex items-center justify-center flex-1">
            <div
              className={`nav-pill relative rounded-full px-1 py-1 header-transition ${
                scrolled ? 'scrolled' : ''
              }`}
              style={{ zIndex: 10 }}
            >
              {/* Top glowing indicator - positioned behind nav pill */}
              <div
                className="absolute top-glow-indicator rounded-lg transition-all duration-500 ease-out"
                style={{
                  left: `${4 + navigation.findIndex(item => item.name === getActiveTab()) * 80 + 20}px`,
                  top: '-3px',
                  width: '40px',
                  height: '20px',
                  zIndex: -10
                }}
              />

              {/* Active tab background indicator - glass effect */}
              <div
                className="absolute top-1 bottom-1 bg-white/5 backdrop-blur-sm rounded-full transition-all duration-500 ease-out border border-white/15"
                style={{
                  left: `${4 + navigation.findIndex(item => item.name === getActiveTab()) * 80}px`,
                  width: '80px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  zIndex: 10,
                  borderWidth: '0.1px'
                }}
              />

              <div className="relative flex items-center">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleTabClick}
                    className={`relative text-sm font-light rounded-full header-transition group flex items-center justify-center ${
                      getActiveTab() === item.name
                        ? 'text-white font-normal'
                        : 'text-white/70 hover:text-white'
                    }`}
                    style={{ width: '80px', height: '36px', zIndex: 20 }}
                  >
                    <span className="relative z-30">{item.name}</span>
                    {/* Hover effect for non-active items */}
                    {getActiveTab() !== item.name && (
                      <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 header-transition"></div>
                    )}
                  </Link>
                ))}

                {/* Book a Call button integrated into nav */}
                <button
                  onClick={handleBookCallClick}
                  className="relative px-4 py-2 text-sm font-medium rounded-full header-transition group bg-white/10 backdrop-blur-md text-white hover:bg-white/15 hover:scale-105 ml-2"
                  style={{ minWidth: '100px', zIndex: 20 }}
                >
                  <span className="relative z-30">Book a Call</span>
                  <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 header-transition"></div>
                </button>
              </div>
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2.5 bg-black/20 backdrop-blur-enhanced border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 header-transition shadow-lg group ${
                isSearchOpen ? 'bg-white/10 text-white scale-105' : ''
              }`}
              aria-label="Search"
            >
              <Search className={`w-4 h-4 header-transition ${isSearchOpen ? 'rotate-90' : ''}`} />
              <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 header-transition"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-6 right-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-3 bg-black/20 backdrop-blur-enhanced border border-white/10 rounded-full text-white/70 hover:text-white hover:scale-105 header-transition shadow-lg group ${
            isMenuOpen ? 'bg-white/10 text-white scale-105' : ''
          }`}
          aria-label="Toggle menu"
        >
          {isMenuOpen ?
            <X className="w-6 h-6 header-transition rotate-90" /> :
            <Menu className="w-6 h-6 header-transition" />
          }
          <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 header-transition"></div>
        </button>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-[60]">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blog posts, projects..."
                className="w-full px-6 py-4 bg-neutral-900/90 backdrop-blur-xl border border-white/20 text-white placeholder-white/40 rounded-2xl focus:border-blue-500/50 focus:outline-none shadow-2xl header-transition focus:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-white/50 hover:text-white hover:scale-110 header-transition group"
              >
                <Search className="w-5 h-5 header-transition" />
              </button>
              {/* Search input glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 header-transition -z-10 blur-2xl"></div>
            </div>
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-neutral-900/95 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="max-h-[60vh] overflow-y-auto">
                {searchResults.map((result) => (
                  <Link
                    key={result.url}
                    href={result.url}
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="block p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        {result.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 uppercase tracking-wider">
                        {result.type}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-1">{result.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="mt-2 p-6 text-center bg-neutral-900/90 backdrop-blur-xl border border-white/20 rounded-2xl text-white/50 text-sm shadow-2xl">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-20 right-4 bg-black/30 backdrop-blur-enhanced border border-white/20 rounded-2xl p-6 shadow-2xl min-w-[220px] z-[60]">
          <div className="space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  handleTabClick()
                  setIsMenuOpen(false)
                }}
                className={`block w-full text-left py-3 px-4 rounded-xl header-transition group relative ${
                  getActiveTab() === item.name
                    ? 'bg-gradient-to-r from-white/95 to-white/90 text-black font-semibold shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-105'
                }`}
              >
                <span className="relative z-10">
                  {item.name}
                </span>
                {/* Hover effect for non-active items */}
                {getActiveTab() !== item.name && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 header-transition"></div>
                )}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/20">
              <button
                onClick={() => {
                  handleBookCallClick()
                  setIsMenuOpen(false)
                }}
                className="block w-full text-center py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white font-medium rounded-xl border border-white/20 hover:border-white/30 hover:scale-105 header-transition group relative"
              >
                <span className="relative z-10">Book a Call</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 header-transition"></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}