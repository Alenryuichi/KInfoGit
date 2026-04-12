# KInfoGit - 项目文档索引

**生成日期**: 2026-01-05
**文档版本**: 1.0.0
**扫描级别**: Deep Scan

---

## 📋 项目概览

- **项目名称**: KInfoGit Personal Website
- **项目类型**: Web Application (Monolith)
- **主要语言**: TypeScript
- **架构模式**: SSG (Static Site Generation)

### 快速参考

| 属性 | 值 |
|------|------|
| **技术栈** | Next.js 14 + React 18 + TypeScript 5 |
| **UI框架** | Tailwind CSS 3 |
| **内容系统** | MDX 3.0 |
| **入口点** | `website/pages/_app.tsx` |
| **架构模式** | Pages Router + SSG |
| **部署目标** | GitHub Pages (静态托管) |

---

## 📚 生成的文档

### 核心文档

- [项目概览](./project-overview.md) ⭐
  完整的项目介绍、技术栈概览和特性说明

- [架构文档](./architecture.md) ⭐
  详细的系统架构、设计决策和技术实现

- [组件清单](./component-inventory.md)
  所有 React 组件的分类和说明（15个组件）

- [开发指南](./development-guide.md)
  开发环境设置、命令使用和常见问题解决

### 技术细节文档

- **API 接口**: 无（纯静态站点）
- **数据模型**: 无数据库（使用静态 JSON/MD文件）
- **状态管理**: React Context API（主题管理）
- **部署配置**: GitHub Actions + GitHub Pages

---

## 📖 现有文档

### 项目根目录文档

- [../README.md](../README.md)
  项目主 README，包含完整的使用说明和 Just 命令参考

### 脚本文档

- [../scripts/README.md](../scripts/README.md)
  开发和部署脚本说明

### 职业发展文档

- [../profile-data/career/career-planning.md](../profile-data/career/career-planning.md)
  长期职业目标和转型策略

- [../profile-data/career/interview-preparation.md](../profile-data/career/interview-preparation.md)
  面试问题和公司研究

- [../profile-data/career/ai-learning-notes.md](../profile-data/career/ai-learning-notes.md)
  AI 技术学习路线图和笔记

- [../profile-data/career/team-understanding-questions.md](../profile-data/career/team-understanding-questions.md)
  团队理解问题清单

### 博客文章

- [../profile-data/blog/2024-12-20-css-grid-vs-flexbox.md](../profile-data/blog/2024-12-20-css-grid-vs-flexbox.md)
  CSS Grid vs Flexbox 对比

- [../profile-data/blog/2025-01-15-my-2025-stack-as-frontend-developer.md](../profile-data/blog/2025-01-15-my-2025-stack-as-frontend-developer.md)
  2025年前端开发技术栈

- [../profile-data/blog/2025-01-08-how-to-build-blog-with-nextjs-mdx.md](../profile-data/blog/2025-01-08-how-to-build-blog-with-nextjs-mdx.md)
  使用 Next.js 和 MDX 构建博客

---

## 🚀 快速开始

### 对于新开发者

1. **了解项目**
   - 阅读 [项目概览](./project-overview.md)
   - 查看 [架构文档](./architecture.md)

2. **设置开发环境**
   - 参考 [开发指南](./development-guide.md)
   - 安装依赖: `just install` 或 `cd website && npm install`
   - 启动开发服务器: `just dev`

3. **开始开发**
   - 查看 [组件清单](./component-inventory.md) 了解现有组件
   - 参考 [开发指南](./development-guide.md) 添加新功能

### 对于 AI 辅助开发

当使用 AI 工具（如 Claude、GitHub Copilot）进行开发时：

1. **提供此索引作为上下文**: 帮助 AI 理解项目结构
2. **引用架构文档**: 确保新代码符合现有架构模式
3. **参考组件清单**: 复用现有组件而不是重新创建

---

## 🏗️ 项目结构总览

```
KInfoGit/
├── website/                    # Next.js 应用
│   ├── components/            # 15个 React 组件
│   ├── pages/                 # 6个页面（含动态路由）
│   │   ├── _app.tsx          # 应用入口
│   │   ├── index.tsx         # 首页
│   │   ├── about.tsx         # 关于页面
│   │   ├── work.tsx          # 项目展示
│   │   ├── blog.tsx          # 博客列表
│   │   └── blog/[slug].tsx   # 动态博客文章
│   ├── lib/                   # 工具库和配置
│   ├── utils/                 # 辅助函数
│   ├── styles/                # 全局样式
│   ├── public/                # 静态资源
│   └── out/                   # 构建输出（Git忽略）
│
├── profile-data/              # 内容数据
│   ├── resume/               # 简历文件
│   ├── projects/             # 项目数据
│   ├── skills/               # 技能数据
│   ├── career/               # 职业规划文档（4个）
│   └── blog/                 # 博客文章（3篇 MDX）
│
├── scripts/                   # 开发脚本
├── docs/                      # 项目文档（本目录）
├── _bmad/                     # BMAD 工作流配置
├── _bmad-output/              # BMAD 输出
└── .github/workflows/         # GitHub Actions CI/CD
```

---

## 🛠️ 常用命令

### 开发命令

```bash
just dev          # 启动开发服务器
just build        # 生产构建
just serve        # 预览构建产物
```

### Git 和部署

```bash
just status       # 查看仓库状态
just quick        # 快速提交
just deploy       # 部署到 GitHub Pages
```

### 内容管理

```bash
just new-post "标题"        # 创建新博客文章
just list-posts             # 列出所有文章
just validate-json          # 验证 JSON 文件
```

---

## 📊 项目统计

| 指标 | 数量 |
|------|------|
| **页面** | 6个（含1个动态路由） |
| **组件** | 15个 |
| **博客文章** | 3篇 |
| **职业文档** | 4个 |
| **技术依赖** | 25+ npm 包 |
| **代码行数** | ~2,000+ 行 TypeScript/TSX |

---

## 🎯 架构关键点

### 1. **静态站点生成 (SSG)**
- 所有页面在构建时预渲染
- 无服务器运行时
- 部署到 GitHub Pages

### 2. **组件化设计**
- 15个可复用 React 组件
- TypeScript 类型安全
- Tailwind CSS 样式化

### 3. **状态管理**
- React Context API（主题管理）
- LocalStorage 持久化
- 无需 Redux/Zustand

### 4. **内容系统**
- MDX 支持（Markdown + JSX）
- Gray Matter 前言解析
- 动态路由（`[slug].tsx`）

---

## 🔧 技术决策记录

### 为什么选择这个技术栈？

1. **Next.js 14 (Pages Router)**
   - 成熟稳定的 SSG 支持
   - 优秀的性能和 SEO
   - 完整的 TypeScript 支持

2. **Tailwind CSS**
   - 快速开发
   - 一致的设计系统
   - 响应式设计简单

3. **MDX**
   - Markdown 易于编写
   - JSX 支持交互组件
   - 博客系统理想选择

4. **GitHub Pages**
   - 免费托管
   - 自动 HTTPS
   - 与 GitHub 无缝集成

---

## 📈 未来改进方向

### 短期（1-3个月）

- [ ] 添加全文搜索功能
- [ ] 集成评论系统（Giscus）
- [ ] 添加网站分析
- [ ] 生成 RSS Feed

### 长期（3-12个月）

- [ ] 支持中英文切换（i18n）
- [ ] CMS 集成（Contentful/Sanity）
- [ ] PWA 支持（离线功能）
- [ ] 性能优化（图片优化、懒加载）

---

## 🐛 已知问题

目前无已知重大问题。

---

## 📞 联系和支持

**项目维护者**: Kylin (苗静思)
**Email**: miaojsi@outlook.com
**Location**: Shenzhen, China

### 如何获取帮助

1. **查看文档**: 首先查阅本索引和相关文档
2. **查看 README**: 参考项目 [README.md](../README.md)
3. **联系维护者**: 通过邮件联系

---

## 📝 文档维护

### 如何更新文档

当项目发生重大变化时，请更新相应文档：

1. **添加新页面/组件**
   - 更新 [组件清单](./component-inventory.md)
   - 更新 [架构文档](./architecture.md) 中的组件依赖图

2. **修改技术栈**
   - 更新 [项目概览](./project-overview.md) 中的技术栈表格
   - 更新 [架构文档](./architecture.md) 中的技术决策

3. **添加新功能**
   - 更新 [项目概览](./project-overview.md) 中的特性列表
   - 必要时添加新的专题文档

4. **重新生成文档**
   - 运行 `/bmad:bmm:workflows:document-project` 重新扫描

---

## 🎓 学习资源

### 对于项目新手

1. **Next.js 基础**
   - [Next.js 官方教程](https://nextjs.org/learn)
   - [React 官方文档](https://react.dev/learn)

2. **TypeScript**
   - [TypeScript 官方手册](https://www.typescriptlang.org/docs/handbook/intro.html)
   - [React + TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

3. **Tailwind CSS**
   - [Tailwind CSS 文档](https://tailwindcss.com/docs)
   - [Tailwind UI 组件](https://tailwindui.com/components)

### 相关技术

- [MDX 文档](https://mdxjs.com/)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [Gray Matter](https://github.com/jonschlinkert/gray-matter)

---

## ✅ 文档完整性检查

- ✅ 项目概览
- ✅ 架构文档
- ✅ 组件清单
- ✅ 开发指南
- ✅ 主索引（本文档）
- ✅ 现有文档链接
- ✅ 快速开始指南

---

**索引版本**: 1.0.0
**最后更新**: 2026-01-05
**下次审查**: 2026-04-05（每季度更新）

---

💡 **提示**: 将此文档加入书签，作为项目开发的中心入口点！
