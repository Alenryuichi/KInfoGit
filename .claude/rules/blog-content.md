---
paths:
  - "profile-data/blog/**"
---

# 博客内容规范

- 文件命名：`YYYY-MM-DD-slug.md`，slug 可以是英文或中文
- 必须包含 frontmatter：title, date, tags
- 标签用英文小写，多词用连字符（如 `anti-fraud`）
- 封面图由构建脚本自动生成，无需手动创建
- 新建博客用 `just new-post "标题"` 命令
