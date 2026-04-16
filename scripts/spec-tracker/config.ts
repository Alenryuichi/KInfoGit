// Spec Tracker — framework configuration

export type FrameworkCategory = 'toolkit' | 'agent-framework' | 'ide' | 'platform' | 'rules'

export interface FrameworkConfig {
  id: string
  name: string
  category: FrameworkCategory
  description: string
  website?: string
  sources: {
    githubRepo?: string      // owner/repo
    npmPackage?: string       // npm package name
    changelogUrl?: string     // HTML changelog page
  }
}

// ─── Fixed Tracking List (8 frameworks) ────────────────────

export const FRAMEWORKS: FrameworkConfig[] = [
  {
    id: 'spec-kit',
    name: 'Spec-Kit',
    category: 'toolkit',
    description: 'GitHub 官方 spec-driven development toolkit，constitution → specify → plan → tasks → implement',
    website: 'https://github.com/github/spec-kit',
    sources: {
      githubRepo: 'github/spec-kit',
      // npm package TBD — may be 'specify-cli' or scoped under @github
    },
  },
  {
    id: 'bmad',
    name: 'BMAD Method',
    category: 'agent-framework',
    description: '21 个专家角色 (PM/架构师/Dev/QA…) + 34+ workflows 的 AI 驱动敏捷开发框架',
    website: 'https://github.com/bmad-code-org/BMAD-METHOD',
    sources: {
      githubRepo: 'bmad-code-org/BMAD-METHOD',
      npmPackage: 'bmad-method',
    },
  },
  {
    id: 'openspec',
    name: 'OpenSpec',
    category: 'toolkit',
    description: '轻量 spec-driven development，brownfield 友好，fluid iterative 变更管理',
    website: 'https://github.com/Fission-AI/OpenSpec',
    sources: {
      githubRepo: 'Fission-AI/OpenSpec',
      npmPackage: 'openspec',
    },
  },
  {
    id: 'gsd',
    name: 'GSD-2',
    category: 'toolkit',
    description: '自主 agent CLI — Milestone→Slice→Task 分层执行，crash recovery + 成本追踪',
    website: 'https://github.com/gsd-build/gsd-2',
    sources: {
      githubRepo: 'gsd-build/gsd-2',
      npmPackage: 'gsd-pi',
    },
  },
  {
    id: 'kiro',
    name: 'Kiro',
    category: 'ide',
    description: 'AWS 出品 agentic IDE，EARS notation spec-driven + Agent Hooks + autopilot',
    website: 'https://kiro.dev',
    sources: {
      // 闭源，无 GitHub/npm
    },
  },
  {
    id: 'tessl',
    name: 'Tessl',
    category: 'platform',
    description: 'Agent enablement platform — skill registry + performance evaluation，Snyk 创始人创办',
    website: 'https://tessl.io',
    sources: {
      npmPackage: 'tessl',
    },
  },
  {
    id: 'rulebook-ai',
    name: 'Rulebook-AI',
    category: 'toolkit',
    description: '一次定义 rules 环境，同步到 10+ AI 工具 (Cursor/Claude Code/Copilot/...)',
    website: 'https://github.com/botingw/rulebook-ai',
    sources: {
      githubRepo: 'botingw/rulebook-ai',
      npmPackage: 'rulebook-ai',
    },
  },
  {
    id: 'awesome-cursorrules',
    name: 'awesome-cursorrules',
    category: 'rules',
    description: '39k★ 社区 .cursorrules 模板合集，150+ 框架/语言覆盖',
    website: 'https://github.com/PatrickJS/awesome-cursorrules',
    sources: {
      githubRepo: 'PatrickJS/awesome-cursorrules',
    },
  },
]

// ─── Discovery Search Terms ────────────────────────────────

export const DISCOVERY_GITHUB_QUERIES = [
  '"spec-driven" language:typescript sort:stars',
  '"ai-coding-spec" OR "agent-specification" language:typescript sort:stars',
  '"spec-driven-development" sort:stars',
]

export const DISCOVERY_NPM_KEYWORDS = [
  'spec-driven',
  'ai-coding-spec',
  'agent-specification',
]

/** Minimum stars for a discovered project to be included */
export const DISCOVERY_MIN_STARS = 50

/** Maximum age in days for discovered project's last push */
export const DISCOVERY_MAX_AGE_DAYS = 90

/** Maximum number of discovered projects to keep */
export const DISCOVERY_MAX_RESULTS = 10

// ─── Output Paths ──────────────────────────────────────────

export const SPECS_DIR = 'profile-data/specs'
export const SPECS_HISTORY_DIR = 'profile-data/specs/history'
