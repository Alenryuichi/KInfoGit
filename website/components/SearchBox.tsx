'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchBoxProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export default function SearchBox({ onSearch, placeholder = "Search..." }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('search-input') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    // Real-time search
    onSearch(newQuery)
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
      <div className="relative group">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200" />
        
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-12 pr-16 py-3 
            bg-gray-900/50 border border-gray-700/50 rounded-xl 
            text-white placeholder-gray-400 
            focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70
            transition-all duration-300
            ${isFocused ? 'shadow-lg shadow-blue-500/10' : ''}
          `}
        />
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <kbd className={`
            px-2 py-1 text-xs rounded-md border
            transition-all duration-200
            ${isFocused 
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
              : 'bg-gray-800/60 text-gray-400 border-gray-700/50'
            }
          `}>
            ⌘K
          </kbd>
        </div>
      </div>
      
      {/* Search suggestions or results could go here */}
      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-gray-900/95 border border-gray-700/50 rounded-lg backdrop-blur-sm">
          <div className="text-sm text-gray-400">
            Searching for "{query}"...
          </div>
        </div>
      )}
    </form>
  )
}
