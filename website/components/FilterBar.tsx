import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Check } from 'lucide-react'

interface FilterBarProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  tags: string[]
  selectedTags: string[]
  onTagClick: (tag: string) => void
  onClearAll: () => void
  className?: string
}

export default function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  tags,
  selectedTags,
  onTagClick,
  onClearAll,
  className = ''
}: FilterBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredTags = tags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Top Bar: Categories + Filter Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Animated Category Tabs */}
        <div className="flex p-1 bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-800/50 relative">
          {categories.map((category) => {
            const isActive = selectedCategory === category
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors z-10 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gray-800 rounded-full border border-gray-700/50"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            )
          })}
        </div>

        {/* Filter Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 ${
              isDropdownOpen || selectedTags.length > 0
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <Filter size={14} />
            <span>Filter</span>
            {selectedTags.length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs font-bold text-black bg-blue-400 rounded-full">
                {selectedTags.length}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-full mt-2 w-64 p-2 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl z-50 origin-top-right"
              >
                <div className="p-2 border-b border-gray-800/50 mb-2">
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-600"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar px-1">
                  {filteredTags.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {filteredTags.map(tag => {
                        const isSelected = selectedTags.includes(tag)
                        return (
                          <button
                            key={tag}
                            onClick={() => onTagClick(tag)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                              isSelected
                                ? 'bg-blue-500/10 text-blue-300'
                                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                            }`}
                          >
                            <span>{tag}</span>
                            {isSelected && <Check size={14} className="text-blue-400" />}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No tags found
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected Tags (Pills) */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 overflow-hidden"
          >
            <span className="text-sm text-gray-500 mr-1">Active:</span>
            {selectedTags.map(tag => (
              <motion.button
                key={tag}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onTagClick(tag)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-colors"
              >
                {tag}
                <X size={12} />
              </motion.button>
            ))}
            <button
              onClick={onClearAll}
              className="text-xs text-gray-500 hover:text-white transition-colors ml-2 px-2 py-1"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
