interface TrendInsightsProps {
  insights: string | null | undefined
}

export function TrendInsights({ insights }: TrendInsightsProps) {
  if (!insights) return null

  const paragraphs = insights.split(/\n\n+/).filter(p => p.trim())

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-400 text-sm">🤖</span>
        <h3 className="text-sm font-semibold text-amber-300/90">AI Trend Analysis</h3>
      </div>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-gray-300 leading-relaxed">
            {p.trim()}
          </p>
        ))}
      </div>
    </div>
  )
}
