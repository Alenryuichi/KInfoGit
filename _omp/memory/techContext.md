# Tech Context

## Tech Stack
<!-- 技术栈 -->

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 16.1.1 |
| **Language** | TypeScript | 5.0.0 |
| **UI Library** | React | 19.2.3 |
| **Styling** | Tailwind CSS | 3.3.0 |
| **Content** | MDX | 3.0.0 |
| **Animation** | Framer Motion | 12.24.12 |
| **Icons** | Lucide React | 0.562.0 |
| **Build** | PostCSS + Autoprefixer | 8.4.0 / 10.4.0 |
| **Testing** | Vitest | 4.0.16 |
| **E2E Testing** | Playwright | 1.57.0 |
| **Task Runner** | Just | - |
| **Deployment** | GitHub Pages + GitHub Actions | - |

## Development Setup
<!-- 开发环境配置 -->

```bash
# Clone and setup
git clone https://github.com/Alenryuichi/KInfoGit.git
cd KInfoGit

# Quick setup with Just (recommended)
brew install just
just setup
just dev

# Manual setup
cd website
npm install
npm run dev
```

## Dependencies
<!-- 主要依赖 -->

### Production
- next: ^16.1.1
- react: ^19.2.3
- react-dom: ^19.2.3
- tailwindcss: ^3.3.0
- framer-motion: ^12.24.12
- lucide-react: ^0.562.0
- @mdx-js/loader, @mdx-js/react: ^3.0.0
- gray-matter: ^4.0.3
- fuse.js: ^7.1.0 (搜索功能)
- satori: ^0.18.3 (OG 图片生成)
- three: ^0.182.0 (3D 效果)
- gsap: ^3.13.0 (动画)

### Development
- typescript: ^5.0.0
- vitest: ^4.0.16
- @playwright/test: ^1.57.0
- @testing-library/react: ^16.3.1
- eslint: ^9.39.2
- tsx: ^4.21.0

## Architecture
<!-- 架构类型 -->

**SSG (Static Site Generation)** - 静态站点生成

- **构建时预渲染**: 所有页面在构建时生成静态 HTML
- **部署目标**: GitHub Pages（静态托管）
- **性能优势**: 极快的加载速度，无需服务器运行时
- **SEO 友好**: 完全可索引的静态 HTML

## Just Commands
<!-- 常用命令 -->

| Command | Description |
|---------|-------------|
| `just dev` | 启动开发服务器 (localhost:3000) |
| `just build` | 生产构建 |
| `just deploy` | 构建并部署到 GitHub Pages |
| `just test` | 运行测试 |
| `just clean` | 清理构建产物 |

## Technical Constraints
<!-- 技术限制 -->

- 仅支持静态站点生成 (SSG)，无服务端渲染
- 部署目标为 GitHub Pages，Base Path: `/KInfoGit`
- 需要 Node.js 18+ 环境

## Environment Variables
<!-- 环境变量 -->

| Variable | Description | Required |
|----------|-------------|----------|
| BASE_PATH | GitHub Pages 基础路径 | 生产环境 |

---

*Updated when tech stack or constraints change.*
