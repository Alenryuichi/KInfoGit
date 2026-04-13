// Centralized tag metadata — used by RepoCard, BlueskyPostCard, [date].tsx, TagCloud, etc.

export const STAR_TOPIC_META: Record<string, { label: string; color: string }> = {
  agent: { label: 'Agent', color: 'bg-violet-500/20 text-violet-300' },
  llm: { label: 'LLM', color: 'bg-blue-500/20 text-blue-300' },
  infra: { label: 'Infra', color: 'bg-amber-500/20 text-amber-300' },
  rag: { label: 'RAG', color: 'bg-emerald-500/20 text-emerald-300' },
  'multi-modal': { label: 'Multi-modal', color: 'bg-pink-500/20 text-pink-300' },
  safety: { label: 'Safety', color: 'bg-red-500/20 text-red-300' },
  'fine-tuning': { label: 'Fine-tuning', color: 'bg-orange-500/20 text-orange-300' },
  evaluation: { label: 'Evaluation', color: 'bg-cyan-500/20 text-cyan-300' },
  deployment: { label: 'Deployment', color: 'bg-gray-500/20 text-gray-300' },
  tooling: { label: 'Tooling', color: 'bg-teal-500/20 text-teal-300' },
}
