# KInfoGit - 项目概览

**生成日期**: 2026-01-05
**项目类型**: Web Application (Next.js)
**仓库结构**: Monolith (单体应用)

---

## 📋 执行摘要

KInfoGit 是一个现代化的个人简介网站，展示 Kylin（苗静思）作为反欺诈技术专家和全栈开发人员的专业经历、项目成果和技术能力。该网站采用 Next.js 14 + TypeScript 构建，使用静态站点生成（SSG）技术，部署在 GitHub Pages 上。

---

## 🎯 项目目标

1. **专业展示**: 创建一个专业的在线简历和作品集网站
2. **技术博客**: 分享技术文章和学习笔记
3. **项目展示**: 展示核心项目和技术成就
4. **职业发展**: 支持职业规划和面试准备

---

## 🏗️ 技术栈概览

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **框架** | Next.js | 14.2.0 | React 框架，使用 Pages Router |
| **语言** | TypeScript | 5.0.0 | 类型安全的 JavaScript 超集 |
| **UI 库** | React | 18.3.0 | 用户界面构建库 |
| **样式** | Tailwind CSS | 3.3.0 | 实用优先的 CSS 框架 |
| **内容** | MDX | 3.0.0 | Markdown + JSX，用于博客文章 |
| **动画** | Framer Motion | 10.16.0 | React 动画库 |
| **图标** | Lucide React | 0.294.0 | 现代图标库 |
| **构建** | PostCSS + Autoprefixer | 8.4.0 / 10.4.0 | CSS 后处理工具 |
| **代码质量** | ESLint | 8.0.0 | 代码检查工具 |

---

## 📦 仓库结构

```
KInfoGit/
├── profile-data/          # 结构化简历数据
│   ├── resume/           # 简历（多格式）
│   ├── projects/         # 项目详情和案例研究
│   ├── skills/           # 技能和认证
│   ├── career/           # 职业规划和面试准备
│   └── blog/             # 博客文章和文章
├── website/              # Next.js 网站源码
│   ├── components/       # React 组件（15个）
│   ├── pages/            # Next.js 页面（6个页面）
│   ├── lib/              # 工具函数
│   ├── utils/            # 辅助工具
│   ├── styles/           # CSS 和样式
│   └── public/           # 静态资源
├── scripts/              # 开发和部署脚本
├── docs/                 # 项目文档（本文档）
└── .github/workflows/    # CI/CD 配置
```

---

## 🎨 架构类型

**SSG (Static Site Generation)** - 静态站点生成

- **构建时预渲染**: 所有页面在构建时生成静态 HTML
- **部署目标**: GitHub Pages（静态托管）
- **性能优势**: 极快的加载速度，无需服务器运行时
- **SEO 友好**: 完全可索引的静态 HTML

---

## 🗂️ 主要特性

### ✅ 已实现功能

1. **响应式设计**
   - 移动优先的响应式布局
   - 支持所有设备尺寸

2. **主题切换**
   - 明暗主题切换
   - 使用 Context API 管理主题状态
   - LocalStorage 持久化

3. **多页面架构**
   - 首页（Hero展示）
   - About 页面（技能和经历）
   - Work 页面（项目展示）
   - Blog 页面（技术博客）
   - 动态博客文章页（`[slug].tsx`）

4. **MDX 博客系统**
   - 支持 Markdown + JSX
   - Gray Matter 前言解析
   - 动态路由生成

5. **SEO 优化**
   - 完整的 meta 标签
   - Open Graph 支持
   - Twitter Cards 支持
   - Canonical URLs

6. **开发工作流**
   - Just 命令运行器集成
   - Git工作流自动化
   - 内容管理脚本

---

## 📊 项目规模

| 指标 | 数量 |
|------|------|
| **页面** | 6个（含动态路由） |
| **组件** | 15个 React 组件 |
| **博客文章** | 3篇（可扩展） |
| **职业文档** | 4个 Markdown 文件 |
| **技术依赖** | 25+ npm 包 |

---

## 🚀 部署配置

- **托管平台**: GitHub Pages
- **CI/CD**: GitHub Actions
- **构建输出**: 静态 HTML/CSS/JS
- **Base Path**: `/KInfoGit` (生产环境)
- **自动化**: 推送到 `main` 分支自动部署

---

## 📚 相关文档链接

- [架构文档](./architecture.md)
- [源码树分析](./source-tree-analysis.md)
- [组件清单](./component-inventory.md)
- [开发指南](./development-guide.md)
- [项目 README](../README.md)

---

## 👨‍💻 项目维护者

**Kylin (苗静思)**
Email: miaojsi@outlook.com
Location: Shenzhen, China

---

**文档版本**: 1.0.0
**最后更新**: 2026-01-05
