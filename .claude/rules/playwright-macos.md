---
paths:
  - "**/*.spec.ts"
  - "**/playwright*"
---

# Playwright macOS 路径问题

macOS 上 Playwright 浏览器安装路径与 Linux 不同，常见问题：

- 浏览器二进制文件位于 `~/Library/Caches/ms-playwright/`
- 如果测试报 "browser not found"，运行 `npx playwright install`
- CI 环境（Linux）路径自动处理，本地开发需注意
