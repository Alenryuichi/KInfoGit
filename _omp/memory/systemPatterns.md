# System Patterns

## Architecture Overview
<!-- 系统整体架构 -->

```
KInfoGit/
├── profile-data/           # 结构化简历数据 (JSON/MD)
│   ├── resume/            # 个人信息
│   ├── projects/          # 项目详情
│   ├── skills/            # 技能数据
│   ├── career/            # 职业规划
│   └── blog/              # 博客文章
├── website/               # Next.js 应用
│   ├── components/        # React 组件 (15个)
│   ├── pages/             # Next.js 页面 (6个)
│   ├── lib/               # 工具函数
│   ├── styles/            # Tailwind CSS
│   └── public/            # 静态资源
├── scripts/               # Just 脚本模块
├── docs/                  # 项目文档
└── _omp/memory/           # AI 记忆系统
```

## Key Technical Decisions
<!-- 重要的技术决策及原因 -->

| Decision | Rationale | Date |
|----------|-----------|------|
| Next.js Pages Router | 简单易用，适合静态站点 | 2026-01 |
| Tailwind CSS | 快速开发，实用优先 | 2026-01 |
| MDX for Blog | Markdown + JSX，灵活性强 | 2026-01 |
| SSG 静态生成 | GitHub Pages 部署，性能最优 | 2026-01 |
| Just 命令运行器 | 简化开发工作流 | 2026-01 |
| Vitest + Playwright | 现代测试框架组合 | 2026-02 |

## Design Patterns
<!-- 项目中使用的设计模式 -->

### Theme Context
- **Name**: React Context for Theme
- **Usage**: 全局主题状态管理（明/暗模式）
- **Location**: `website/lib/ThemeContext`

### Data-Driven Content
- **Name**: JSON-based Content
- **Usage**: 将内容与代码分离，便于维护
- **Location**: `profile-data/` 目录

### Component Composition
- **Name**: 组件组合模式
- **Usage**: 页面由可复用组件组成
- **Location**: `website/components/`

## Component Relationships
<!-- 组件之间的关系 -->

```
Layout
├── Navbar (导航栏)
├── ThemeToggle (主题切换)
└── Page Content
    ├── Hero (首页展示)
    ├── Skills (技能矩阵)
    ├── Projects (项目列表)
    └── Blog (博客列表)
```

## Coding Conventions
<!-- 代码规范 -->

- **TypeScript**: 严格类型检查
- **组件命名**: PascalCase
- **文件命名**: kebab-case
- **CSS**: Tailwind utility-first
- **测试**: 与源文件同目录或 `__tests__/`
- **ESLint**: next/core-web-vitals 配置

## 目录约定

| 目录 | 用途 |
|------|------|
| `website/components/` | React 组件 |
| `website/pages/` | Next.js 页面路由 |
| `website/lib/` | 工具函数和上下文 |
| `website/styles/` | 全局样式 |
| `profile-data/` | 内容数据 |
| `scripts/` | Just 脚本模块 |

---

*Updated when architecture or patterns change.*
