import { useState } from 'react'

interface Tab {
  id: string
  label: string
}

interface WeeklyTabsProps {
  tabs: Tab[]
  children: (activeTab: string) => React.ReactNode
}

export function WeeklyTabs({ tabs, children }: WeeklyTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  return (
    <div>
      {/* Tab bar */}
      <div role="tablist" className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white/[0.08] text-white'
                : 'text-gray-400 hover:text-gray-300 hover:bg-white/[0.03]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel" id={`tabpanel-${activeTab}`}>{children(activeTab)}</div>
    </div>
  )
}
