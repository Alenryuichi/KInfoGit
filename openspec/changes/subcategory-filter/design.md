## Context

当前 blog tabs 由一级目录驱动（yuque-api-sync change 已实现）。二级目录在 TOC 中为 depth=2 的 TITLE 节点，当前被忽略。用户选择了 Shopify Engineering 风格的 popover 子筛选方案。

## Goals / Non-Goals

**Goals:**
- 同步脚本识别二级目录，写入 frontmatter `subcategory` 字段
- 有子分类的 tab 显示下拉箭头，点击弹出 popover 选择
- 选中子分类后 tab 显示「分类 · 子分类 ▾」
- 无子分类的 tab 保持原样（纯点击切换，无箭头）
- 点击外部区域 / 切换其他 tab 自动关闭 popover

**Non-Goals:**
- 不支持三级及以上目录
- 不做移动端特殊适配（popover 在移动端也能用）
- 不改变一级 tab 的动态生成逻辑

## Decisions

### Decision 1: Popover 实现方式

**选择**: 纯 CSS + React state，不引入第三方 headless UI 库

**理由**: 项目已有 framer-motion，popover 逻辑简单（open/close + click outside），不需要 Radix/Headless UI 的重量级方案。用 `useRef` + `useEffect` 监听 click outside 即可。

### Decision 2: Popover 视觉风格

**选择**: 暗色毛玻璃风格，与现有 tab 栏一致

```
bg-gray-900/95 backdrop-blur-sm
border border-white/10
rounded-lg shadow-xl
py-1
```

每个选项:
```
px-4 py-2 text-sm
hover:bg-white/5
active: text-blue-400 bg-white/5
```

framer-motion 入场动画: opacity 0→1, y -4→0, duration 0.15s

### Decision 3: Tab 显示逻辑

**选择**:
- 无子分类 → 纯文字 tab，点击直接筛选（现有行为）
- 有子分类，未选子项 → `文章 ▾`，点击 tab 同时选中该分类并打开 popover
- 有子分类，已选子项 → `文章 · AI ▾`，点击切换 popover 开关
- 选中 popover 中「全部」→ 回到只按一级分类筛选，tab 恢复为 `文章 ▾`

### Decision 4: 同步脚本 subcategory 处理

**选择**: `parseToc()` 中追踪 depth=2 TITLE 节点为 `currentSubcategory`，遇到新的 depth=1 TITLE 时重置。DOC 节点继承当前 subcategory。

frontmatter 输出: 有 subcategory 时添加 `subcategory: "xxx"` 行，无则省略。

增量同步: subcategory 变化时（文章移动目录）也触发 frontmatter 更新，复用已有的 category 变更检测逻辑。

## Risks / Trade-offs

- **[Popover 定位]** 简单实现用 `absolute` 定位于 tab 下方，不需要 floating-ui。Tab 栏在页面顶部，不存在溢出问题。
- **[click outside 监听]** 需要正确处理 ref，避免点击 tab 本身也触发 close。用 `mousedown` 事件 + 排除 tab ref。
