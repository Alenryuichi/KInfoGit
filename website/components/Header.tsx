import { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, X, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'

interface PagefindResult {
  url: string
  excerpt: string
  meta: {
    title?: string
    image?: string
    type?: string
    date?: string
  }
  sub_results?: Array<{
    title: string
    url: string
    excerpt: string
  }>
}

interface SearchResult {
  title: string
  excerpt: string
  url: string
  type: string
  date: string
}

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Work', href: '/work' },
  { name: 'Blog', href: '/blog' },
  { name: 'AI Daily', href: '/ai-daily/' },
  { name: 'Code', href: '/code/' },
  { name: 'Stars', href: '/stars' },
]

const TAB_WIDTH = 72

const TYPE_COLORS: Record<string, string> = {
  Blog: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  Stars: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  'AI Daily': 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
  Code: 'bg-green-500/20 text-green-300 border-green-400/30',
  Work: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  About: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
}

const HISTORY_KEY = 'pagefind-search-history'
const MAX_HISTORY = 5

function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(s => typeof s === 'string') : []
  } catch {
    return []
  }
}

function saveSearchHistory(query: string) {
  try {
    const history = getSearchHistory().filter(h => h !== query)
    history.unshift(query)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
  } catch {
    // localStorage unavailable — silent degradation
  }
}

interface HeaderProps {
  onBookCallClick: () => void
}

// Logo Component - using custom SVG logo
const Logo = () => (
  <Link href="/" className="group cursor-pointer block">
    <div className="w-12 h-12 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
      <Image
        src="/logo.png"
        alt="KM Logo"
        width={48}
        height={48}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  </Link>
)

export function Header({ onBookCallClick }: HeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pagefindRef = useRef<any>(null)
  const pagefindLoadingRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Get current active tab based on route
  const getActiveTab = () => {
    const path = router.pathname
    if (path === '/') return 'Home'
    if (path === '/about') return 'About'
    if (path.startsWith('/work')) return 'Work'
    if (path.startsWith('/blog')) return 'Blog'
    if (path.startsWith('/ai-daily')) return 'AI Daily'
    if (path.startsWith('/code')) return 'Code'
    if (path.startsWith('/stars')) return 'Stars'
    return 'Home'
  }

  // Pre-calculate active tab index for animation offsets
  const activeTabName = getActiveTab()
  const activeTabIndex = Math.max(0, navigation.findIndex(item => item.name === activeTabName))

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Idempotent Pagefind loader — can be called from hover/focus/open
  const loadPagefind = useCallback(async () => {
    if (pagefindRef.current || pagefindLoadingRef.current) return
    pagefindLoadingRef.current = true
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      if (w.__pagefind) {
        pagefindRef.current = w.__pagefind
        return
      }
      const pagefind = await import(
        // @ts-expect-error Pagefind is generated at build time
        /* webpackIgnore: true */ '/pagefind/pagefind.js'
      )
      await pagefind.init()
      pagefindRef.current = pagefind
      pagefindLoadingRef.current = false
    } catch {
      console.error('Failed to load Pagefind search index')
      pagefindLoadingRef.current = false
    }
  }, [])

  // Load Pagefind when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      loadPagefind()
      setSearchHistory(getSearchHistory())
    }
  }, [isSearchOpen, loadPagefind])

  // Pagefind search with debounce
  const performSearch = useCallback(async (query: string) => {
    if (!pagefindRef.current || !query.trim()) {
      setSearchResults([])
      setIsSearchLoading(false)
      return
    }
    try {
      const search = await pagefindRef.current.search(query)
      const results: SearchResult[] = []
      for (const result of search.results.slice(0, 5)) {
        const data: PagefindResult = await result.data()
        results.push({
          title: data.meta?.title || '',
          excerpt: data.excerpt || '',
          url: data.url.replace(/index\.html$/, ''),
          type: data.meta?.type || '',
          date: data.meta?.date || '',
        })
      }
      setSearchResults(results)
    } catch {
      setSearchResults([])
    }
    setIsSearchLoading(false)
  }, [])

  // Real-time search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSelectedIndex(-1)
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearchLoading(false)
      return
    }
    setIsSearchLoading(true)
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery)
    }, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, performSearch])

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

  const searchQueryRef = useRef(searchQuery)
  searchQueryRef.current = searchQuery

  const navigateToResult = useCallback((result: SearchResult) => {
    const q = searchQueryRef.current.trim()
    if (q) saveSearchHistory(q)
    router.push(result.url)
    setIsSearchOpen(false)
    setSearchQuery('')
    setSelectedIndex(-1)
  }, [router])

  // Keyboard navigation inside search modal
  useEffect(() => {
    if (!isSearchOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (searchResults.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % searchResults.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => prev <= 0 ? searchResults.length - 1 : prev - 1)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, searchResults.length])

  const handleTabClick = () => {
    setIsMenuOpen(false)
  }

  const handleBookCallClick = () => {
    onBookCallClick()
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      const idx = selectedIndex >= 0 ? selectedIndex : 0
      if (searchResults[idx]) navigateToResult(searchResults[idx])
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
                className="absolute top-glow-indicator rounded-lg transition-transform duration-500 ease-out will-change-transform"
                style={{
                  transform: `translateX(${4 + activeTabIndex * TAB_WIDTH + TAB_WIDTH / 2 - 20}px)`,
                  left: 0,
                  top: '-3px',
                  width: '40px',
                  height: '20px',
                  zIndex: -10
                }}
              />

              {/* Wrapper to clip internal optical effects perfectly to the pill shape */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                {/* Ambient Spotlight - casts a very soft glow behind the active tab */}
                <div
                  className="absolute transition-transform duration-500 ease-out will-change-transform"
                  style={{
                    transform: `translateX(${4 + activeTabIndex * TAB_WIDTH - 10}px)`,
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${TAB_WIDTH + 20}px`,
                    background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                  }}
                />
              </div>

              {/* Active tab background indicator - raised glass effect */}
              <div
                className="absolute top-1 bottom-1 bg-white/[0.04] backdrop-blur-lg rounded-full transition-transform duration-500 ease-out border border-white/[0.05] will-change-transform"
                style={{
                  transform: `translateX(${4 + activeTabIndex * TAB_WIDTH}px)`,
                  left: 0,
                  width: `${TAB_WIDTH}px`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.4), inset 0 8px 20px rgba(255, 255, 255, 0.08)',
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
                      activeTabName === item.name
                        ? 'text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                    style={{ width: `${TAB_WIDTH}px`, height: '36px', zIndex: 20 }}
                  >
                    <span className="relative z-30">{item.name}</span>
                    {/* Hover effect for non-active items */}
                    {activeTabName !== item.name && (
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
              onMouseEnter={() => loadPagefind()}
              onFocus={() => loadPagefind()}
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
              onMouseEnter={() => loadPagefind()}
              onFocus={() => loadPagefind()}
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
                  {searchResults.map((result, index) => (
                    <Link
                      key={result.url}
                      href={result.url}
                      onClick={() => navigateToResult(result)}
                      className={`block px-5 py-4 transition-colors border-b border-white/[0.04] last:border-0 group ${
                        index === selectedIndex ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                          {result.title}
                        </span>
                        {result.type && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ml-2 ${TYPE_COLORS[result.type] || 'bg-white/[0.04] text-gray-400 border-white/[0.06]'}`}>
                            {result.type}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[13px] text-gray-500 line-clamp-2 [&_mark]:bg-blue-500/30 [&_mark]:text-white [&_mark]:rounded-sm [&_mark]:px-0.5"
                        dangerouslySetInnerHTML={{ __html: result.excerpt }}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state: history or guidance */}
            {!searchQuery && isSearchOpen && (
              <div className="mt-3 bg-[#0a0a0a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden">
                {searchHistory.length > 0 ? (
                  <div className="p-3">
                    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest px-2 mb-2">最近搜索</div>
                    {searchHistory.map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center">
                    <p className="text-[13px] text-gray-500 mb-2">搜索博客、项目、Stars、AI Daily...</p>
                    <div className="flex items-center justify-center gap-3 text-[11px] text-gray-600">
                      <span>↑↓ 导航</span>
                      <span>↵ 打开</span>
                      <span>esc 关闭</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {searchQuery && !isSearchLoading && searchResults.length === 0 && (
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