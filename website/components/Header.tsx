import { useState, useEffect, useRef } from 'react'
import { Menu, X, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
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
          src="/logo.png"
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

export function Header({ onBookCallClick }: HeaderProps) {
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
    if (path.startsWith('/work')) return 'Work'
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

  // Keyboard shortcut for Search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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

              {/* Dynamic border highlight tracker */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none" 
                style={{ 
                  padding: '1px', 
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', 
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', 
                  WebkitMaskComposite: 'xor', 
                  maskComposite: 'exclude',
                  zIndex: 20
                }}
              >
                <div
                  className="absolute transition-all duration-500 ease-out"
                  style={{
                    top: 0,
                    bottom: 0,
                    left: `${4 + navigation.findIndex(item => item.name === getActiveTab()) * 80}px`,
                    width: '80px',
                    background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)',
                  }}
                />
              </div>

              {/* Active tab background indicator - raised glass effect */}
              <div
                className="absolute top-1 bottom-1 bg-white/[0.06] backdrop-blur-md rounded-full transition-all duration-500 ease-out border border-white/[0.08]"
                style={{
                  left: `${4 + navigation.findIndex(item => item.name === getActiveTab()) * 80}px`,
                  width: '80px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  zIndex: 10,
                }}
              />

              <div className="relative flex items-center">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleTabClick}
                    className={`relative text-[13px] font-medium tracking-tight rounded-full header-transition group flex items-center justify-center ${
                      getActiveTab() === item.name
                        ? 'text-white'
                        : 'text-white/60 hover:text-white'
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
                  className="relative px-4 py-2 text-[13px] font-medium tracking-tight rounded-full header-transition group bg-white/10 backdrop-blur-md text-white hover:bg-white/15 hover:scale-105 ml-2"
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
            {/* Search Button (Desktop) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2.5 p-1.5 hover:bg-white/[0.04] rounded-xl transition-all duration-300 group"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-colors ml-1" />
              <div className="flex items-center justify-center px-1.5 py-0.5 text-[10px] font-sans font-medium text-gray-400 bg-white/[0.04] rounded-md border border-white/[0.08] group-hover:bg-white/[0.08] group-hover:text-gray-200 group-hover:border-white/[0.15] transition-all">
                ⌘K
              </div>
            </button>

            {/* Search Button (Mobile) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isMenuOpen ? 'close' : 'open'}
          className="md:hidden fixed top-6 right-4 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2.5 bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors shadow-xl group ${
              isMenuOpen ? 'bg-white/[0.08] text-white border-white/[0.15]' : ''
            }`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ?
              <X className="w-5 h-5 transition-transform duration-300 rotate-90" /> :
              <Menu className="w-5 h-5 transition-transform duration-300" />
            }
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Search Modal */}
      {isSearchOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50]" onClick={() => setIsSearchOpen(false)} />
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4 z-[60]">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blog posts, projects..."
                  className="w-full px-5 py-4 bg-[#0a0a0a] border border-white/[0.08] text-white placeholder-white/30 rounded-xl focus:border-white/20 focus:outline-none shadow-2xl transition-colors text-[15px]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[50vh] overflow-y-auto">
                  {searchResults.map((result) => (
                    <Link
                      key={result.url}
                      href={result.url}
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="block px-5 py-4 hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0 group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                          {result.title}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-gray-400 uppercase tracking-widest font-mono">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-500 line-clamp-1">{result.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="mt-3 p-6 text-center bg-[#0a0a0a] border border-white/[0.08] rounded-xl text-gray-500 text-[13px] shadow-2xl">
                No results found for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed top-20 right-4 bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-5 shadow-2xl min-w-[200px] z-[60]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    handleTabClick()
                    setIsMenuOpen(false)
                  }}
                  className={`block w-full text-left py-2.5 px-4 rounded-lg transition-colors relative ${
                    getActiveTab() === item.name
                      ? 'bg-white/[0.06] text-white font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="relative z-10 text-[15px]">
                    {item.name}
                  </span>
                </Link>
              ))}
              <div className="pt-3 mt-1 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    handleBookCallClick()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-center py-2 text-[14px] text-gray-300 hover:text-white font-medium rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                >
                  Book a Call
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}