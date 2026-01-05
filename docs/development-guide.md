# KInfoGit - 开发指南

**项目**: KInfoGit Personal Website
**生成日期**: 2026-01-05

---

## 🚀 快速开始

### 前置要求

- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **Just**: (可选但推荐) 命令运行器

### 安装依赖

```bash
# 使用 Just (推荐)
just install

# 或手动安装
cd website
npm install
```

---

## 💻 开发命令

### Just 命令（推荐）

```bash
# 开发服务器
just dev                    # 启动开发服务器 (localhost:3000)

# 构建
just build                  # 生产构建
just serve                  # 本地预览构建产物

# 代码质量
npm run lint               # ESLint 检查
npm run type-check         # TypeScript 类型检查

# 清理
just clean                  # 清理构建产物和依赖
```

### npm 脚本

```bash
npm run dev                 # next dev
npm run build               # next build
npm run start               # next start (生产模式)
npm run lint                # eslint 检查
npm run type-check          # tsc --noEmit
```

---

## 📁 项目结构

```
website/
├── components/             # React 组件
│   ├── Layout.tsx         # 布局组件
│   ├── Header.tsx         # 导航栏
│   ├── Hero.tsx           # 首页英雄区
│   ├── Blog.tsx           # 博客列表
│   └── ...                # 其他组件
├── pages/                  # Next.js 页面
│   ├── _app.tsx           # 应用入口
│   ├── index.tsx          # 首页
│   ├── about.tsx          # 关于页面
│   ├── work.tsx           # 项目展示
│   ├── blog.tsx           # 博客列表
│   └── blog/
│       └── [slug].tsx     # 动态博客页面
├── lib/                    # 工具库
│   └── config.ts          # 配置文件
├── utils/                  # 辅助函数
├── styles/                 # 全局样式
│   └── globals.css        # Tailwind CSS 入口
├── public/                 # 静态资源
│   ├── favicon.svg
│   └── ...
├── next.config.js          # Next.js 配置
├── tailwind.config.js      # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 项目依赖
```

---

## 🎨 开发工作流

### 1. 启动开发环境

```bash
just dev
```

浏览器打开 `http://localhost:3000`

### 2. 修改代码

- **组件**: 编辑 `components/` 中的文件
- **页面**: 编辑 `pages/` 中的文件
- **样式**: 使用 Tailwind CSS 类名

Hot Reload 会自动刷新浏览器。

### 3. 添加新页面

```bash
# 创建新页面文件
touch website/pages/new-page.tsx
```

```typescript
// website/pages/new-page.tsx
import Head from 'next/head'

export default function NewPage() {
  return (
    <>
      <Head>
        <title>New Page</title>
      </Head>
      <main>
        <h1>New Page Content</h1>
      </main>
    </>
  )
}
```

访问 `http://localhost:3000/new-page`

### 4. 添加新组件

```bash
# 创建新组件文件
touch website/components/NewComponent.tsx
```

```typescript
// website/components/NewComponent.tsx
interface NewComponentProps {
  title: string
  content: string
}

export default function NewComponent({ title, content }: NewComponentProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p>{content}</p>
    </div>
  )
}
```

在页面中导入并使用：

```typescript
import NewComponent from '@/components/NewComponent'

<NewComponent title="Hello" content="World" />
```

### 5. 添加博客文章

```bash
# 创建新博客文章
just new-post "My New Blog Post"
```

或手动创建：

```bash
touch profile-data/blog/2026-01-05-my-new-post.md
```

```markdown
---
title: "My New Blog Post"
date: "2026-01-05"
excerpt: "A brief description of the post"
tags: ["nextjs", "react", "typescript"]
---

# My New Blog Post

Content goes here...
```

---

## 🛠️ 技术栈使用

### TypeScript

```typescript
// 类型定义示例
interface BlogPost {
  title: string
  slug: string
  date: string
  excerpt: string
  content: string
  tags: string[]
}

// 组件 Props 类型
interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  // ...
}
```

### Tailwind CSS

```tsx
// 使用 Tailwind 类名
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h2>
</div>
```

### MDX 博客

```tsx
// pages/blog/[slug].tsx
import { MDXRemote } from 'next-mdx-remote'

export default function BlogPost({ mdxSource }) {
  return (
    <article>
      <MDXRemote {...mdxSource} />
    </article>
  )
}
```

---

## 🧪 测试（未实施）

目前项目未包含自动化测试。未来可添加：

```bash
# 安装测试依赖（示例）
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

---

## 📦 构建和部署

### 本地构建

```bash
just build
```

生成的静态文件在 `website/out/` 目录。

### 本地预览构建

```bash
just serve
```

访问 `http://localhost:8000`

### 部署到 GitHub Pages

```bash
just deploy "Update personal info"
```

或手动部署：

```bash
cd website
npm run build
# 将 out/ 目录内容推送到 gh-pages 分支
```

---

## 🐛 常见问题

### 1. 端口已被占用

```bash
# 错误: Port 3000 is already in use
# 解决: 更改端口或终止占用进程
PORT=3001 npm run dev
```

### 2. TypeScript 类型错误

```bash
# 运行类型检查
npm run type-check

# 检查特定文件
npx tsc --noEmit path/to/file.tsx
```

### 3. Tailwind 样式不生效

确保在 `styles/globals.css` 中导入了 Tailwind：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. 构建失败

```bash
# 清理缓存并重建
just clean
just install
just build
```

---

## 📚 相关资源

### 官方文档

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)

### 项目文档

- [架构文档](./architecture.md)
- [组件清单](./component-inventory.md)
- [项目概览](./project-overview.md)

---

## 👥 贡献指南

### Git 工作流

```bash
# 查看状态
just status

# 快速提交
just quick

# 创建新分支
just branch feature/new-feature

# 部署
just deploy "Commit message"
```

### 代码风格

- 使用 ESLint 推荐配置
- 组件名使用 PascalCase
- 文件名与组件名一致
- 使用 TypeScript 严格模式

---

## 📞 支持

**开发者**: Kylin (苗静思)
**Email**: miaojsi@outlook.com

**文档版本**: 1.0.0
**最后更新**: 2026-01-05
