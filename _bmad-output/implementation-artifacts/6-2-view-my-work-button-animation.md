# Story 6.2: View My Work 按钮动画优化

Status: done

## Story

As a 访问者,
I want "View My Work" 按钮有流畅优雅的动画效果,
so that 网站给人专业、现代的第一印象。

## Acceptance Criteria

1. **Given** 用户在首页看到 "View My Work" 按钮
   **When** 鼠标悬停在按钮上
   **Then** 按钮有平滑的放大效果 (scale: 1.05) 和阴影加深

2. **And** 动画使用弹性缓动，过渡自然不生硬

3. **When** 用户点击按钮
   **Then** 有轻微的按压反馈 (scale: 0.98)

4. **And** 动画在移动端触摸时也能正常工作

## Tasks / Subtasks

- [x] Task 1: 安装 Framer Motion (如未安装) (AC: #1-3)
  - [x] 已安装 framer-motion ^10.16.0
- [x] Task 2: 将按钮改为 motion 组件 (AC: #1-3)
- [x] Task 3: 添加 hover 和 tap 动画效果 (AC: #1-3)
- [x] Task 4: 测试桌面端和移动端效果 (AC: #4)

## Dev Notes

### 推荐实现

```typescript
import { motion } from 'framer-motion';

<motion.button
  whileHover={{ 
    scale: 1.05, 
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)" 
  }}
  whileTap={{ scale: 0.98 }}
  transition={{ 
    type: "spring", 
    stiffness: 400, 
    damping: 17 
  }}
  className="..." // 保持原有样式
>
  View My Work
</motion.button>
```

### 按钮位置

可能在以下文件：
- `pages/index.tsx`
- `components/Hero.tsx`
- `components/Button.tsx` (如有通用按钮组件)

### 动画参数说明

| 参数 | 值 | 说明 |
|------|-----|------|
| scale (hover) | 1.05 | 轻微放大，不过于夸张 |
| scale (tap) | 0.98 | 点击时轻微缩小，模拟按压 |
| stiffness | 400 | 弹性强度，越高越快 |
| damping | 17 | 阻尼，控制回弹 |

### ⚠️ 注意事项

1. 如果项目已有 Framer Motion，直接使用
2. 确保不影响按钮原有的点击功能
3. "Let's Connect" 按钮也可以应用相同动画效果保持一致性
4. 检查是否与现有 CSS transition 冲突

### References

- [Source: Epic 1 回顾 - 行动项 #2]
- [Framer Motion 文档](https://www.framer.com/motion/)

---

## Dev Agent Record

### Implementation Plan
- 使用已安装的 Framer Motion 库
- 定义 buttonVariants 和 buttonTransition 配置
- 将两个 CTA 按钮 (`<a>`) 改为 `<motion.a>` 组件
- 移除 CSS transform hover:scale，改用 Framer Motion 的 whileHover/whileTap

### Completion Notes
- ✅ Framer Motion 已存在 (^10.16.0)
- ✅ 在 Hero.tsx 添加了 buttonVariants 和 buttonTransition 配置
- ✅ "View My Work" 按钮使用 motion.a + spring 动画
- ✅ "Let's Connect" 按钮同样应用，保持一致性
- ✅ 移除了 CSS 的 `transform hover:scale-105`，避免冲突
- ✅ 所有 46 个测试通过
- ✅ npm run build 成功

### Animation Config
```typescript
const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
  tap: { scale: 0.98 }
}
const buttonTransition = { type: "spring", stiffness: 400, damping: 17 }
```

---

## File List

| 文件 | 操作 |
|------|------|
| `website/components/Hero.tsx` | 修改 - 添加 Framer Motion 动画 |

---

## Change Log

| 日期 | 变更 |
|------|------|
| 2026-01-07 | Story 实现完成 - CTA 按钮现在有流畅的弹性动画效果 |

