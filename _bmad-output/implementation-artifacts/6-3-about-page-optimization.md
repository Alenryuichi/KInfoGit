# Story 6.3: About 页面优化

Status: ready-for-dev

## Story

As a 访问者,
I want About 页面有更好的视觉效果和技能展示,
so that 我能快速了解站主的技术能力和专业背景。

## Acceptance Criteria

1. **Given** 用户访问 About 页面
   **When** 页面加载完成
   **Then** 技能区块以图标+标签云形式展示，按类别分组

2. **And** 技能分类清晰（如：前端/后端/AI/工具等）

3. **When** 鼠标悬停在技能标签上
   **Then** 有视觉反馈效果

4. **And** 页面内容有入场动画，元素依次淡入

5. **And** 页面在移动端响应式布局正常

## Tasks / Subtasks

- [ ] Task 1: 重新设计技能展示区块 (AC: #1, #2)
  - [ ] 创建技能分类数据结构
  - [ ] 使用图标库 (如 react-icons) 展示技术图标
  - [ ] 按类别分组展示
- [ ] Task 2: 添加技能标签 hover 效果 (AC: #3)
- [ ] Task 3: 使用 Framer Motion 添加入场动画 (AC: #4)
  - [ ] staggerChildren 实现依次淡入
- [ ] Task 4: 优化移动端布局 (AC: #5)
- [ ] Task 5: 确保联系区域有 id="contact" (配合 Story 6-1)

## Dev Notes

### 技能分类建议

```typescript
const skillCategories = [
  {
    name: "后端开发",
    skills: ["Python", "Golang", "Node.js", "Java"]
  },
  {
    name: "数据与AI",
    skills: ["ClickHouse", "Spark", "Machine Learning", "LLM"]
  },
  {
    name: "前端开发", 
    skills: ["React", "Vue.js", "TypeScript", "Next.js"]
  },
  {
    name: "工具与平台",
    skills: ["Docker", "Kubernetes", "Git", "Linux"]
  }
];
```

### 入场动画实现

```typescript
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {skills.map(skill => (
    <motion.div key={skill} variants={item}>
      {skill}
    </motion.div>
  ))}
</motion.div>
```

### 相关文件

- `pages/about.tsx`
- `components/About.tsx`
- `components/Skills.tsx`

### ⚠️ 注意事项

1. 保持现有内容，只优化展示方式
2. 技能数据可能需要从现有数据源提取或新建
3. 图标库选择：推荐 `react-icons` (已包含多种技术图标)
4. 确保动画不影响页面性能

### References

- [Source: Epic 1 回顾 - 行动项 #3]
- [react-icons](https://react-icons.github.io/react-icons/)

