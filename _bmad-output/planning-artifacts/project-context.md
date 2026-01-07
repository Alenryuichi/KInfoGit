---
project_name: 'KInfoGit'
user_name: 'alenryuichi'
date: '2026-01-07'
sections_completed: ['technology_stack', 'typescript_rules', 'framework_rules', 'code_quality', 'critical_rules']
status: 'complete'
rule_count: 46
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Core Framework:**
- Next.js ^14.2.0 (Pages Router, NOT App Router)
- React ^18.3.0
- TypeScript ^5.0.0 (strict mode enabled)

**Styling:**
- Tailwind CSS ^3.3.0
- PostCSS ^8.4.0

**Content:**
- MDX ^3.0.0 (@mdx-js/loader, @next/mdx)
- Gray Matter ^4.0.3

**Animation:**
- Framer Motion ^10.16.0
- GSAP ^3.13.0

**Icons:**
- Lucide React ^0.294.0
- Heroicons ^2.2.0

**Build & Deploy:**
- Static Export (output: 'export')
- GitHub Pages (basePath: '/KInfoGit')
- ESLint ^8.0.0 + eslint-config-next

**Critical Version Notes:**
- Next.js 14.x 使用 Pages Router，不是 App Router
- TypeScript strict 模式要求完整类型注解
- 静态导出不支持 getServerSideProps

---

## Critical Implementation Rules

### Library Selection Rules (AI Agent 强制执行)

**🎯 核心原则:**
对于公认应该使用第三方库的功能类型，必须先搜索现有方案，禁止直接自研。

**📦 功能类型判断:**
| 必须用库 | 可以自研 |
|---------|---------|
| 日期时间处理、表单验证 | 简单工具函数 |
| HTTP 客户端、图表可视化 | 业务特定逻辑 |
| Markdown/富文本、加密安全 | 简单 UI 组件 |
| i18n、复杂动画、文件处理 | 配置/常量/映射 |

**🔍 搜索流程 (遇到"必须用库"类型时):**
1. 检查 Tier 1（项目已有库）是否满足需求
2. 搜索 npm/GitHub 找 2-3 个候选
3. 选择最合适的，或说明例外理由

**✅ 库选择标准:**
- Stars > 1k 或领域公认 | 6 个月内更新 | 有 TS 类型

**📋 Tier 1 已有库 (优先复用，禁止引入竞品):**
- 动画: Framer Motion, GSAP | 图标: Lucide, Heroicons | 内容: gray-matter, MDX

**⚠️ 灰色地带:** 不确定时，默认先搜索。宁可多搜一次，不要自研后返工。

### TypeScript Rules

**Configuration Requirements:**
- `strict: true` - 所有变量必须有明确类型或可推断类型
- `forceConsistentCasingInFileNames: true` - 文件名大小写必须一致
- `noEmit: true` - TypeScript 只做类型检查，由 Next.js 编译

**Import Patterns:**
- 使用路径别名: `@/*`, `@/components/*`, `@/lib/*`, `@/data/*`
- 禁止使用 `../../` 超过 2 层的相对路径
- JSON 文件可直接导入 (`resolveJsonModule: true`)

**Type Definition Rules:**
- 组件 Props 必须定义 interface (如 `interface HeaderProps {}`)
- 数据模型接口放在 `lib/data.ts` 或 `types/` 目录
- 使用 `| null` 而非 `| undefined` 表示可能缺失的数据
- async 函数返回值明确标注 `Promise<Type>`

**Export Patterns:**
- 组件使用 `export default function ComponentName()`
- 工具函数使用 named export: `export function funcName()`
- 类型使用 named export: `export interface TypeName {}`

### Next.js Rules (Pages Router)

**Routing:**
- 使用 `pages/` 目录，不是 `app/` 目录
- 动态路由: `[slug].tsx`, `[id].tsx`
- 使用 `useRouter` from `next/router`，不是 `next/navigation`

**Data Fetching:**
- 只使用 `getStaticProps` + `getStaticPaths` (SSG)
- 禁止使用 `getServerSideProps` (不兼容静态导出)
- 数据获取逻辑封装在 `lib/` 目录的函数中
- 页面组件只调用 lib 函数，不直接读取文件

**静态导出限制:**
- `output: 'export'` 模式下无 API Routes
- 所有页面必须可静态生成
- 使用 `trailingSlash: true` 生成 `/page/index.html`

**basePath 处理:**
- 生产环境 basePath = `/KInfoGit`
- 使用 `next/link` 和 `next/image` 自动处理 basePath
- 手动构建 URL 时必须考虑 basePath

### React Rules

**Hooks 使用:**
- 组件顶层声明 hooks，不在条件语句中
- 使用 `useState` 管理本地状态
- 使用 `useEffect` 处理副作用，注意依赖数组

**组件结构:**
- 每个文件一个组件，文件名 = 组件名
- Props 接口定义在组件上方
- 使用 `'use client'` 标记客户端组件（如有交互）

**状态管理:**
- 主题状态使用 ThemeProvider (React Context)
- 简单状态用 useState，跨组件用 Context
- 禁止引入 Redux/Zustand 等外部状态库

### Code Quality & Style Rules

**文件命名:**
- 组件文件: PascalCase (`Header.tsx`, `ProjectCard.tsx`)
- 页面文件: kebab-case (`about.tsx`, `[slug].tsx`)
- 工具函数: camelCase (`data.ts`, `config.ts`)
- 类型定义: PascalCase (`Project.ts`) 或放在 `lib/data.ts`

**变量命名:**
- 变量/函数: camelCase (`getUserName`, `isMenuOpen`)
- 常量: UPPER_SNAKE_CASE (`API_URL`, `MAX_ITEMS`)
- 接口/类型: PascalCase (`Project`, `BlogPost`)
- Props 接口: ComponentName + Props (`HeaderProps`)

**Tailwind CSS 规则:**
- 直接在 className 写 Tailwind 类
- 复杂/重复样式可提取为变量
- 使用 `dark:` 前缀支持暗色模式
- 响应式: 桌面优先，使用 `md:`, `lg:` 等

**代码组织:**
- imports 顺序: React → Next.js → 第三方 → 本地
- 组件内顺序: hooks → 状态 → handlers → JSX
- 每个文件不超过 300 行，过长需拆分

**ESLint 规则:**
- 运行 `npm run lint` 检查代码
- 运行 `npm run type-check` 检查类型
- 禁止 `any` 类型（除非确实必要并注释原因）
- 禁止未使用的变量和导入

### Critical Don't-Miss Rules

**🚫 反模式 - 绝对禁止:**

1. **禁止使用 App Router 语法**
   - ❌ `import { usePathname } from 'next/navigation'`
   - ✅ `import { useRouter } from 'next/router'`

2. **禁止 getServerSideProps**
   - ❌ `export async function getServerSideProps()`
   - ✅ `export async function getStaticProps()`

3. **禁止在组件中直接读取文件**
   - ❌ `fs.readFileSync()` 在组件中
   - ✅ 在 `lib/` 函数中读取，通过 getStaticProps 传递

4. **禁止硬编码 basePath**
   - ❌ `href="/KInfoGit/about"`
   - ✅ `href="/about"` (Next.js 自动处理)

**⚠️ 边缘情况:**

1. **图片路径** - 静态图片放 `public/`，使用 `next/image` 或相对路径
2. **MDX 内容** - frontmatter 用 gray-matter 解析，内容用 MDX loader
3. **数据目录** - `profile-data/` 在 `website/` 外部，路径是 `../profile-data`
4. **构建产物** - `out/` 目录是静态输出，不要修改

**🔒 安全规则:**

- 不要在客户端代码中暴露敏感路径
- 邮箱等个人信息从 JSON 数据文件读取
- 不要在代码中硬编码个人联系方式

**⚡ 性能规则:**

- 图片使用 WebP 格式，手动压缩
- 避免在首屏加载大型动画库
- 使用 `priority` 属性预加载首屏图片

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Reference `_bmad-output/planning-artifacts/architecture.md` for detailed architecture decisions

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

---

**Last Updated:** 2026-01-07


