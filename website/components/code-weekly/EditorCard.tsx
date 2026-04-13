import type { EditorUpdate } from '@/lib/code-weekly'

interface EditorCardProps {
  editor: EditorUpdate
}

const CATEGORY_STYLES: Record<string, string> = {
  ide: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  cli: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
}

const CATEGORY_LABELS: Record<string, string> = {
  ide: 'IDE',
  cli: 'CLI / Plugin',
}

export function EditorCard({ editor }: EditorCardProps) {
  return (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors">
      {/* Header: name + category + version */}
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-lg font-semibold text-white">{editor.name}</h3>
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${CATEGORY_STYLES[editor.category] || ''}`}>
          {CATEGORY_LABELS[editor.category] || editor.category}
        </span>
        {editor.version && (
          <span className="text-xs text-gray-500 font-mono">{editor.version}</span>
        )}
      </div>

      {/* Highlights */}
      {editor.highlights.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {editor.highlights.map((highlight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-gray-600 mt-0.5 flex-shrink-0">•</span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}

      {/* AI Summary */}
      {editor.aiSummary && (
        <p className="text-[13px] text-gray-400 leading-relaxed mt-3 pt-3 border-t border-white/[0.04]">
          {editor.aiSummary}
        </p>
      )}

      {/* Source link */}
      {editor.sourceUrl && (
        <div className="mt-3 text-xs">
          <a
            href={editor.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            {editor.source} →
          </a>
        </div>
      )}
    </div>
  )
}
