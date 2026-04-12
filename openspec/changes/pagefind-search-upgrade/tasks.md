## 1. 依赖与构建配置

- [x] 1.1 安装 pagefind 为 devDependency (`npm install -D pagefind`)
- [x] 1.2 在 `package.json` 添加 `postbuild` script: `pagefind --site out --glob "**/*.html"`
- [x] 1.3 移除 `prebuild` 中的 `generate-search-index.ts` 调用
- [x] 1.4 从 dependencies 中移除 `fuse.js`

## 2. 页面内容标记

- [x] 2.1 在 blog 详情页模板添加 `data-pagefind-body` 到主内容容器
- [x] 2.2 在 AI Daily 页面添加 `data-pagefind-body` 到主内容容器
- [x] 2.3 在 work/projects 页面添加 `data-pagefind-body` 到主内容容器
- [x] 2.4 在 blog 列表页、about 页等添加 `data-pagefind-body`（按需）

## 3. 搜索 UI 替换

- [x] 3.1 移除 Header.tsx 中的 Fuse.js 导入和相关类型定义
- [x] 3.2 实现 Pagefind JS API 加载逻辑（动态 import `/pagefind/pagefind.js`）
- [x] 3.3 替换搜索逻辑：用 `pagefind.search(query)` + debounce 替代 Fuse.js
- [x] 3.4 适配搜索结果渲染：从 Pagefind 结果中提取 title、excerpt（带高亮）、url
- [x] 3.5 保留 Cmd+K 快捷键、modal 开关、结果点击导航等现有交互

## 4. 清理与验证

- [x] 4.1 删除 `website/scripts/generate-search-index.ts`
- [x] 4.2 删除 `website/public/search-index.json`
- [x] 4.3 执行 `npm run build` 验证 Pagefind 索引生成成功
- [x] 4.4 本地 serve 并测试中文搜索、英文搜索、跨页面类型搜索
- [x] 4.5 确认 AI Daily 内容可被搜索到
