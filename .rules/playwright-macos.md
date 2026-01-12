# Playwright 截图路径处理 (macOS)

在 macOS 上读取 Playwright MCP 截图时：

- Playwright 返回路径：`/tmp/playwright-mcp-output/...`
- 实际读取需使用：`/private/tmp/playwright-mcp-output/...`

原因：macOS 的 `/tmp` 是 `/private/tmp` 的符号链接。

