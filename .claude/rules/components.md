---
paths:
  - "website/components/**"
---

# React 组件规范

- 使用函数组件 + hooks，不用 class 组件
- Props 用 `interface XxxProps` 定义，放在组件文件顶部
- 使用命名导出 (`export function`)，不用 default export
- 样式使用 Tailwind CSS class，不写内联 `style={}`（当前部分组件仍有内联 style，新代码应避免）
- 动画优先用 framer-motion，复杂时序动画用 GSAP
- 组件文件名 PascalCase，与组件名一致
- 测试文件与源文件同目录：`Component.test.tsx`
