# KInfoGit — 个人简历网站

Next.js 16 (Pages Router) + React 19 + TypeScript + Tailwind CSS 静态站点，部署到 GitHub Pages。

## 构建 & 测试

```bash
just install          # 安装依赖 (cd website && npm install)
just dev              # 启动开发服务器
just build            # 生成博客封面 + 构建静态站点
just serve            # 本地预览构建产物 (localhost:8000)
```

```bash
cd website
npm run test          # vitest 单元测试
npm run lint          # ESLint
npm run type-check    # TypeScript 类型检查
npx playwright test   # E2E 测试
```

## 项目结构

```
website/
├── pages/            # 路由页面 (index, about, work, blog, blog/[slug])
├── components/       # React 组件 (~30 个)
├── lib/              # 工具函数、配置
├── styles/           # 全局 CSS
└── public/           # 静态资源
profile-data/
├── blog/             # 博客 Markdown 文章
├── resume/           # 简历 JSON 数据
└── projects/         # 项目描述
scripts/              # just 任务模块 (dev, git, content, utils)
```

## 关键约定

详细规范见 `.claude/rules/`，以下是核心要点：

- SSG 纯静态导出，Pages Router（→ `nextjs.md`）
- 函数组件 + TypeScript + Tailwind（→ `components.md`）
- 博客文章在 `profile-data/blog/`（→ `blog-content.md`）

## 易踩的坑

- 图片必须 `unoptimized: true`（GitHub Pages 无 Image Optimization API）
- 博客文章在 `profile-data/blog/` 而非 `website/` 下
- 构建前会自动生成博客封面图 (`just generate-covers`)

## 规则

条件规则位于 `.claude/rules/`，按文件类型自动加载。
