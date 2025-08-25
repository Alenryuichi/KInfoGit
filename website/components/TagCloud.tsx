'use client'

import { useState } from 'react'

interface TagCloudProps {
  tags: string[]
  selectedTags: string[]
  onTagClick: (tag: string) => void
  className?: string
}

export default function TagCloud({ tags, selectedTags, onTagClick, className = '' }: TagCloudProps) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null)

  // Calculate tag sizes based on frequency (mock implementation)
  const getTagSize = (tag: string) => {
    const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg']
    const hash = tag.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return sizes[hash % sizes.length]
  }

  const getTagColor = (tag: string, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) {
      return 'bg-blue-500/20 text-blue-300 border-blue-400/50'
    }
    if (isHovered) {
      return 'bg-gray-700/60 text-white border-gray-600/50'
    }
    return 'bg-gray-800/40 text-gray-300 border-gray-700/30 hover:bg-gray-700/50 hover:text-white hover:border-gray-600/50'
  }

  if (tags.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-gray-400 text-sm italic">No tags available</div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="mr-2">#</span>
        Topics
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          const isHovered = hoveredTag === tag
          
          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              onMouseEnter={() => setHoveredTag(tag)}
              onMouseLeave={() => setHoveredTag(null)}
              className={`
                px-3 py-1.5 rounded-full border transition-all duration-200
                ${getTagSize(tag)} font-medium
                ${getTagColor(tag, isSelected, isHovered)}
                transform hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
              `}
            >
              {tag}
            </button>
          )
        })}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            <button
              onClick={() => selectedTags.forEach(tag => onTagClick(tag))}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-md border border-blue-400/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
