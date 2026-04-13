// Org → color mapping for benchmark charts

export const ORG_COLORS: Record<string, string> = {
  Anthropic: '#F97316',   // orange
  Google: '#3B82F6',      // blue
  Openai: '#22C55E',      // green
  OpenAI: '#22C55E',
  Meta: '#8B5CF6',        // violet
  Xai: '#EF4444',         // red
  xAI: '#EF4444',
  DeepSeek: '#06B6D4',    // cyan
  Alibaba: '#F59E0B',     // amber
  Moonshot: '#EC4899',    // pink
  Mistral: '#F43F5E',     // rose
  Baidu: '#DC2626',       // red-600
  Zai: '#10B981',         // emerald (ZhipuAI/GLM)
  Xiaomi: '#FF6B35',      // orange-ish
  Minimax: '#A78BFA',     // violet-light
  MiniMax: '#A78BFA',
  ByteDance: '#14B8A6',   // teal
  Tencent: '#60A5FA',     // blue-light
}

export const DEFAULT_BAR_COLOR = '#6B7280' // gray-500

// Model name patterns → org inference
const MODEL_ORG_PATTERNS: Array<[RegExp, string]> = [
  [/claude/i, 'Anthropic'],
  [/gpt|o[1-4][-\s]|openai|chatgpt|codex/i, 'OpenAI'],
  [/gemini|gemma/i, 'Google'],
  [/grok/i, 'xAI'],
  [/deepseek/i, 'DeepSeek'],
  [/qwen/i, 'Alibaba'],
  [/glm|zhipu|chatglm/i, 'Zai'],
  [/llama|muse[-\s]spark/i, 'Meta'],
  [/mistral/i, 'Mistral'],
  [/ernie/i, 'Baidu'],
  [/kimi/i, 'Moonshot'],
  [/minimax/i, 'MiniMax'],
  [/mimo/i, 'Xiaomi'],
  [/trae|doubao|seed/i, 'ByteDance'],
  [/codebuddy|hunyuan/i, 'Tencent'],
]

/** Infer org from model name if org is empty */
export function inferOrg(model: string, org?: string): string {
  if (org) return org
  for (const [pattern, orgName] of MODEL_ORG_PATTERNS) {
    if (pattern.test(model)) return orgName
  }
  return ''
}

export function orgColor(org: string): string {
  return ORG_COLORS[org] ?? DEFAULT_BAR_COLOR
}
