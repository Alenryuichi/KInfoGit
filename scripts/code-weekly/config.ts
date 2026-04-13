// Code Weekly — Editor tracking configuration
// Add/remove editors here to change what gets tracked each week.

export type EditorCategory = 'ide' | 'cli'

export interface EditorConfig {
  name: string
  category: EditorCategory
  sources: {
    githubRepo?: string        // owner/repo — for GitHub Releases API
    rssUrl?: string            // company blog RSS feed
    tavilyQuery?: string       // English search query template
    bailianQuery?: string      // Chinese search query template
    npmPackage?: string        // npm package name — for npm registry API
  }
}

export interface RssFeedConfig {
  company: string
  url: string
  tags?: string[]
}

// ─── Editor List ───────────────────────────────────────────

export const EDITORS: EditorConfig[] = [
  // IDE
  {
    name: 'Cursor',
    category: 'ide',
    sources: {
      rssUrl: 'https://cursor.com/changelog/rss.xml',
      tavilyQuery: 'Cursor IDE new features updates this week',
    },
  },
  {
    name: 'Windsurf',
    category: 'ide',
    sources: {
      tavilyQuery: 'Windsurf IDE updates OR Windsurf release notes OR Codeium Windsurf changelog',
    },
  },
  {
    name: 'Trae',
    category: 'ide',
    sources: {
      bailianQuery: 'Trae AI 编辑器 最新功能 更新',
      tavilyQuery: 'Trae AI editor ByteDance new features this week',
    },
  },
  {
    name: 'Augment',
    category: 'ide',
    sources: {
      tavilyQuery: 'Augment Code editor updates OR Augment IDE release notes OR Augment AI announcement',
    },
  },
  // CLI / Plugin
  {
    name: 'Claude Code',
    category: 'cli',
    sources: {
      npmPackage: '@anthropic-ai/claude-code',
      tavilyQuery: 'Claude Code release OR Claude CLI update OR Anthropic Claude Code changelog',
    },
  },
  {
    name: 'Gemini CLI',
    category: 'cli',
    sources: {
      githubRepo: 'google-gemini/gemini-cli',
      tavilyQuery: 'Gemini CLI Google new features this week',
    },
  },
  {
    name: 'OpenCode',
    category: 'cli',
    sources: {
      githubRepo: 'opencode-ai/opencode',
      tavilyQuery: 'OpenCode AI terminal coding new features this week',
    },
  },
  {
    name: 'Aider',
    category: 'cli',
    sources: {
      githubRepo: 'Aider-AI/aider',
      tavilyQuery: 'Aider AI coding assistant new features this week',
    },
  },
  {
    name: 'Copilot',
    category: 'cli',
    sources: {
      tavilyQuery: 'GitHub Copilot new features updates this week',
    },
  },
  {
    name: 'CodeBuddy',
    category: 'cli',
    sources: {
      bailianQuery: 'CodeBuddy 腾讯 AI 编程助手 最新功能 更新',
      tavilyQuery: 'CodeBuddy Tencent AI coding assistant new features',
    },
  },
]

// ─── Company Blog RSS Feeds ────────────────────────────────

export const RSS_FEEDS: RssFeedConfig[] = [
  // Anthropic removed their RSS feed — rely on Tavily search instead
  // { company: 'Anthropic', url: 'https://www.anthropic.com/rss.xml', tags: ['claude', 'safety'] },
  // OpenAI removed their blog RSS feed — rely on Tavily search instead
  // { company: 'OpenAI', url: 'https://openai.com/blog/rss.xml', tags: ['gpt', 'chatgpt'] },
  { company: 'Google AI', url: 'https://blog.google/innovation-and-ai/technology/ai/rss/', tags: ['gemini', 'deepmind'] },
  { company: 'Cursor', url: 'https://cursor.com/changelog/rss.xml', tags: ['cursor', 'ide'] },
  { company: 'Vercel', url: 'https://vercel.com/atom', tags: ['v0', 'ai-sdk'] },
  { company: 'Windsurf', url: 'https://windsurf.com/feed.xml', tags: ['windsurf', 'codeium', 'ide'] },
]

// ─── API Configuration ─────────────────────────────────────

export const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
export const DEEPSEEK_MODEL = 'deepseek-chat'

export const TAVILY_API_URL = 'https://api.tavily.com/search'

export const BAILIAN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
export const BAILIAN_MODEL = 'qwen-plus'

// ─── Output paths ──────────────────────────────────────────

export const CODE_WEEKLY_DIR = 'profile-data/code-weekly'
export const BENCHMARKS_DIR = 'profile-data/benchmarks'
export const BENCHMARKS_HISTORY_DIR = 'profile-data/benchmarks/history'
