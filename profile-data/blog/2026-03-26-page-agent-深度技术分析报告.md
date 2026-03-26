---
title: "Page Agent 深度技术分析报告"
date: "2026-03-26"
tags: ["Page Agent","AI Agent","前端自动化","LLM集成","DOM操作"]
category: "AI"
readTime: "30 min read"
featured: false
image: "/blog/covers/2026-03-26-page-agent-深度技术分析报告.png"
excerpt: "本文对阿里巴巴开源的 Page Agent 项目进行了深度技术分析，重点剖析了其整体架构、基于 Re-act 循环的核心执行流程、DOM 提取与简化、内置工具系统以及 Prompt 设计策略。报告旨在评估其与 atoms-plus 项目集成的可行性，并总结了其关键设计决策和潜在的集成方向。"
---

> 分析日期: 2026-03-06
源码版本: alibaba/page-agent (latest)
分析目的: 评估与 atoms-plus 集成的可行性
>

## 📋 目录
1. [整体架构](#-整体架构)
2. [核心执行流程](#-核心执行流程-re-act-循环)
3. [DOM 提取与简化](#-dom-提取与简化)
4. [内置工具系统](#-内置工具系统)
5. [DOM 操作实现](#-dom-操作实现)
6. [LLM 客户端设计](#-llm-客户端设计)
7. [视觉反馈系统](#-视觉反馈系统)
8. [Prompt 设计策略](#-prompt-设计策略)
9. [关键设计决策](#-关键设计决策总结)
10. [集成方向](#-集成到-atoms-plus-的可能方向)

**附录：深度解析**

+ [MacroTool 与 Re-act 循环深度解析](#附录macrotool-与-re-act-循环深度解析)
    - [什么是 Re-act 循环](#-什么是-re-act-循环)
    - [什么是 MacroTool](#-什么是-macrotool)
    - [MacroTool 类型定义](#-macrotool-的类型定义)
    - [MacroTool 构建过程](#-macrotool-的构建过程)
    - [完整执行流程代码](#-完整的执行流程代码)
    - [自动修复机制](#-自动修复机制-normalizeresponse)
    - [历史记录结构](#-历史记录结构)
    - [优势对比](#-macrotool--re-act-的优势对比)
    - [对 atoms-plus 的启发](#-对-atoms-plus-的启发)
+ [System Prompt 设计详解](#附录system-prompt-设计详解)
    - [整体结构](#-整体结构-1)
    - [逐模块详解](#-逐模块详解) (12 个模块)
    - [User Prompt 动态组装](#-user-prompt-动态组装)
    - [设计亮点总结](#-设计亮点总结)
    - [扩展点](#-扩展点)

---

## 🏗️ 整体架构
```plain
┌─────────────────────────────────────────────────────────────────────┐
│                         page-agent (入口)                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PageAgent = PageAgentCore + Panel UI + Human-in-the-loop   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│     core      │      │     llms      │      │page-controller│
│               │      │               │      │               │
│ PageAgentCore │◄────►│  LLM Client   │      │ DOM 操作引擎  │
│ Tools 定义    │      │  重试机制     │      │ 元素高亮系统  │
│ Prompt 组装   │      │  模型适配     │      │ 视觉遮罩      │
└───────┬───────┘      └───────────────┘      └───────┬───────┘
        │                                              │
        └──────────────────────┬───────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   DOM Tree 提取     │
                    │  (browser-use 移植) │
                    └─────────────────────┘
```

### 模块职责
| 模块 | 职责 | npm 包名 |
| --- | --- | --- |
| **page-agent** | 主入口，整合 Core + UI | `page-agent` |
| **core** | Agent 核心逻辑，无 UI | `@page-agent/core` |
| **llms** | LLM 客户端，支持 OpenAI 兼容 API | `@page-agent/llms` |
| **page-controller** | DOM 操作和视觉反馈 | `@page-agent/page-controller` |
| **ui** | Panel 界面和 i18n | `@page-agent/ui` |

---

## 🔄 核心执行流程 (Re-act 循环)
```plain
┌─────────────────────────────────────────────────────────────────┐
│                     execute(task) 入口                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: 👀 Observe (观察)                                       │
│  • pageController.getBrowserState()                              │
│  • 提取 DOM 树 → 生成简化文本表示                                  │
│  • 检测页面变化、URL 导航                                         │
│  • 处理系统观察 (剩余步数警告等)                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: 🧠 Think (思考) - LLM 调用                              │
│  输入:                                                           │
│    • System Prompt (行为规则)                                    │
│    • User Prompt = instructions + agent_state + history          │
│                  + browser_state                                 │
│    • MacroTool (所有工具合并为单一工具)                           │
│                                                                  │
│  输出 (Reflection-Before-Action):                                │
│    {                                                             │
│      evaluation_previous_goal: "评估上一步",                     │
│      memory: "记忆关键信息",                                      │
│      next_goal: "下一步目标",                                     │
│      action: { tool_name: { ...params } }                        │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: 🎯 Act (执行)                                           │
│  • MacroTool.execute() 解析 action                               │
│  • 调用对应的 PageController 方法                                 │
│  • 记录到 history                                                │
│  • 发送 activity 事件给 UI                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ action = done?  │──Yes──► 返回结果
                    └────────┬────────┘
                             │ No
                             ▼
                    ┌─────────────────┐
                    │ step < maxSteps │──No──► 超时错误
                    └────────┬────────┘
                             │ Yes
                             ▼
                        循环回 STEP 1
```

---

## 🌳 DOM 提取与简化
这是 Page Agent 最核心的创新，移植自 [browser-use](https://github.com/browser-use/browser-use)。

### 提取流程
```javascript
// 1. 遍历 DOM 树
buildDomTree(document.body)

// 2. 对每个元素检测
isElementVisible(element)      // 可见性检测
isInteractiveElement(element)  // 交互性检测 (8 层检测!)
isTopElement(element)          // 顶层检测 (多点 elementFromPoint)
isInExpandedViewport(element)  // 视口检测

// 3. 生成扁平化树结构
{
  rootId: "0",
  map: {
    "0": { tagName: "body", children: ["1", "2", ...] },
    "1": { tagName: "button", highlightIndex: 0, ref: <HTMLElement> },
    ...
  }
}

// 4. 转换为 LLM 可读的文本格式
[0]<button>Submit</button>
[1]<input placeholder="Enter name">
*[2]New element  // * 表示新出现的元素
```

### 交互性检测 (8 层检测)
这是确保正确识别可交互元素的关键：

```javascript
function isInteractiveElement(element) {
  // 1. 光标样式检测
  if (interactiveCursors.has(style.cursor)) return true  // pointer, grab, text...

  // 2. 语义标签检测
  if (['a', 'button', 'input', 'select', 'textarea'].includes(tagName)) return true

  // 3. ARIA 角色检测
  if (interactiveRoles.has(role)) return true  // button, menuitem, checkbox...

  // 4. contenteditable 检测
  if (element.isContentEditable) return true

  // 5. 类名启发式检测
  if (element.classList.contains('button') ||
      element.getAttribute('data-toggle') === 'dropdown') return true

  // 6. 事件监听器检测
  if (getEventListeners(element).click?.length > 0) return true

  // 7. onclick 属性检测
  if (element.hasAttribute('onclick')) return true

  // 8. 可滚动容器检测
  if (isScrollableElement(element)) return true

  return false
}
```

### 输出给 LLM 的格式示例
```plain
Current URL: https://example.com/form

Interactive Elements:
[0]<form>User Registration</form>
  [1]<input type="text" placeholder="Username">
  [2]<input type="password" placeholder="Password">
  [3]<select>Country</select>
    [4]<option>USA</option>
    [5]<option>China</option>
  *[6]<button>Submit</button>   ← 新出现的元素

Page Content:
Welcome to our registration page...
```

---

## 🛠️ 内置工具系统
### 工具列表
| 工具名 | 描述 | 参数 |
| --- | --- | --- |
| `done` | 完成任务 | `{text, success}` |
| `wait` | 等待页面加载 | `{seconds: 1-10}` |
| `ask_user` | 询问用户 | `{question}` |
| `click_element_by_index` | 点击元素 | `{index}` |
| `input_text` | 输入文本 | `{index, text}` |
| `select_dropdown_option` | 选择下拉选项 | `{index, text}` |
| `scroll` | 垂直滚动 | `{down, num_pages, index?}` |
| `scroll_horizontally` | 水平滚动 | `{right, pixels, index?}` |
| `execute_javascript` | 执行 JS (实验性) | `{script}` |

### MacroTool 设计 (关键创新)
不是分开的多个工具，而是合并成一个 MacroTool：

```javascript
const macroTool = {
  AgentOutput: {
    inputSchema: z.object({
      evaluation_previous_goal: z.string(),  // 强制反思
      memory: z.string(),                     // 强制记忆
      next_goal: z.string(),                  // 强制规划
      action: z.union([                       // 选择一个动作
        z.object({ done: doneSchema }),
        z.object({ click_element_by_index: clickSchema }),
        z.object({ input_text: inputSchema }),
        // ...
      ])
    }),
    execute: async (input) => {
      const toolName = Object.keys(input.action)[0]
      const tool = tools.get(toolName)
      return await tool.execute(input.action[toolName])
    }
  }
}
```

**为什么这样设计？**

+ **强制反思**: LLM 必须先评估上一步、记忆、规划，才能给出动作
+ **简化接口**: 只有一个工具，减少 LLM 的选择复杂度
+ **结构化输出**: 保证每步都有完整的推理链

---

## 🖱️ DOM 操作实现
### 点击操作 (完整事件序列)
```javascript
async clickElement(index) {
  const element = this.getElementByIndex(index)

  // 完整的事件序列，模拟真实用户点击
  element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
  element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
  element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  element.focus()
  element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }))

  return { success: true, message: '✅ Clicked element' }
}
```

### 输入操作 (绕过框架拦截)
```javascript
async inputText(index, text) {
  const element = this.getElementByIndex(index)

  // 使用原生 setter，绕过 React/Vue 的拦截
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype, 'value'
  ).set

  nativeInputValueSetter.call(element, text)

  // 手动触发事件
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}
```

### 滚动操作
```javascript
async scroll({ down, numPages, index }) {
  // 如果指定了 index，滚动特定元素
  if (index !== undefined) {
    const element = this.getElementByIndex(index)
    const scrollAmount = element.clientHeight * numPages
    element.scrollBy({ top: down ? scrollAmount : -scrollAmount, behavior: 'smooth' })
  } else {
    // 否则滚动整个页面
    const scrollAmount = window.innerHeight * numPages
    window.scrollBy({ top: down ? scrollAmount : -scrollAmount, behavior: 'smooth' })
  }
}
```

---

## 🔁 LLM 客户端设计
### 架构
```typescript
class LLM extends EventTarget {
  config: LLMConfig
  client: OpenAIClient  // OpenAI 兼容客户端

  async invoke(messages, tools, abortSignal, options) {
    return await withRetry(
      () => this.client.invoke(messages, tools, abortSignal, options),
      { maxRetries: this.config.maxRetries, onRetry, onError }
    )
  }
}
```

### 重试机制
```javascript
async function withRetry(fn, { maxRetries, onRetry, onError }) {
  let attempt = 0
  while (attempt <= maxRetries) {
    try {
      return await fn()
    } catch (error) {
      // 用户中止 → 不重试
      if (error.name === 'AbortError') throw error

      // 不可重试错误 (401, 403) → 不重试
      if (error instanceof InvokeError && !error.retryable) throw error

      // 可重试 → 等待 100ms 后重试
      await sleep(100)
      onRetry(++attempt)
    }
  }
  throw lastError
}
```

### 响应规范化 (自动修复 LLM 输出)
```javascript
function normalizeResponse(response, tools) {
  // 1. 修复空 action
  if (!response.action || Object.keys(response.action).length === 0) {
    response.action = { done: { text: 'No action', success: false } }
  }

  // 2. 修复工具名大小写
  const toolName = Object.keys(response.action)[0]
  const correctName = findToolCaseInsensitive(toolName, tools)
  if (correctName !== toolName) {
    response.action = { [correctName]: response.action[toolName] }
  }

  // 3. 修复参数类型 (string → number)
  // 4. 修复嵌套 action
  // 5. 修复缺失的必需字段

  return response
}
```

### 支持的模型
通过模型名自动适配参数：

+ **Qwen 系列**: qwen-plus, qwen-max, qwen-turbo
+ **DeepSeek**: deepseek-chat, deepseek-coder
+ **Anthropic**: claude-3.5-sonnet, claude-3-opus
+ **OpenAI**: gpt-4o, gpt-4-turbo
+ **Google**: gemini-1.5-pro, gemini-2.0-flash
+ **其他 OpenAI 兼容 API**

---

## 🎨 视觉反馈系统
### 元素高亮
```javascript
function highlightElement(element, index) {
  // 1. 获取元素所有矩形 (处理多行文本)
  const rects = element.getClientRects()

  // 2. 为每个矩形创建高亮覆盖层
  for (const rect of rects) {
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      border: 2px solid ${color};
      background: ${color}1A;
      pointer-events: none;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `
    container.appendChild(overlay)
  }

  // 3. 添加索引标签
  const label = document.createElement('div')
  label.textContent = index.toString()
  // 定位到元素右上角
}
```

### SimulatorMask (操作遮罩)
执行期间阻止用户操作：

```javascript
class SimulatorMask {
  show() {
    this.mask = document.createElement('div')
    this.mask.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      pointer-events: all;
      cursor: not-allowed;
      background: rgba(0, 0, 0, 0.1);
    `
    document.body.appendChild(this.mask)
  }

  hide() {
    this.mask?.remove()
  }
}
```

### 光标动画
模拟真实用户的鼠标移动：

```javascript
async moveCursorTo(targetX, targetY) {
  const animate = () => {
    // 缓动 20%
    this.cursorX += (targetX - this.cursorX) * 0.2
    this.cursorY += (targetY - this.cursorY) * 0.2

    this.cursor.style.transform = `translate(${this.cursorX}px, ${this.cursorY}px)`

    if (Math.abs(targetX - this.cursorX) > 1) {
      requestAnimationFrame(animate)
    }
  }
  requestAnimationFrame(animate)
}
```

---

## 📝 Prompt 设计策略
### System Prompt 结构
```markdown
<intro>         # 角色定义和能力说明
<language>      # 语言设置
<input>         # 输入格式说明
<agent_history> # 历史记录格式
<browser_state> # 浏览器状态格式
<browser_rules> # 浏览器操作规则 (17 条)
<capability>    # 能力边界和失败处理
<task_completion_rules>  # 任务完成规则
<reasoning_rules>        # 推理规则
<examples>      # 好的输出示例
<output>        # 输出格式要求
```

### 关键的 Browser Rules (17 条)
1. 只与有数字索引 `[index]` 的元素交互
2. 页面变化后分析是否需要与新元素交互
3. 默认只列出视口内元素，需要时滚动
4. 遇到 captcha 告知用户无法解决
5. 元素缺失时尝试滚动或返回
6. 页面未加载完成时使用 `wait`
7. 同一动作不重复超过 3 次
8. 输入后被中断通常意味着出现了建议列表
9. 有明确筛选条件时使用过滤器
10. 用户指定的步骤优先级最高
11. 输入后可能需要回车、点击按钮或选择下拉
12. 不需要登录就不登录
13. 区分精确步骤任务和开放式任务
14. ...

### User Prompt 组装
```javascript
async assembleUserPrompt() {
  let prompt = ''

  // 1. 自定义指令 (可选)
  prompt += '<instructions>...'

  // 2. Agent 状态
  prompt += '<agent_state>'
  prompt += `  <user_request>${this.task}</user_request>`
  prompt += `  <step_info>Step ${step} of ${maxSteps}</step_info>`
  prompt += '</agent_state>'

  // 3. 历史记录
  prompt += '<agent_history>'
  for (const event of this.history) {
    if (event.type === 'step') {
      prompt += `<step_${i}>
        Evaluation: ${event.reflection.evaluation_previous_goal}
        Memory: ${event.reflection.memory}
        Next Goal: ${event.reflection.next_goal}
        Action Results: ${event.action.output}
      </step_${i}>`
    } else if (event.type === 'observation') {
      prompt += `<sys>${event.content}</sys>`
    }
  }
  prompt += '</agent_history>'

  // 4. 浏览器状态 (DOM 简化表示)
  prompt += '<browser_state>'
  prompt += browserState.content  // [0]<button>... 格式
  prompt += '</browser_state>'

  return prompt
}
```

---

## 📊 关键设计决策总结
| 决策 | 选择 | 原因 |
| --- | --- | --- |
| **DOM 表示** | 文本而非截图 | 无需多模态 LLM，成本低、速度快 |
| **元素定位** | 数字索引 | LLM 易于理解和输出 |
| **工具设计** | MacroTool 合并 | 强制反思-行动循环 |
| **事件模拟** | 完整序列 | 兼容各种框架和监听器 |
| **输入方式** | 原生 setter | 绕过 React/Vue 拦截 |
| **缓存策略** | WeakMap | 自动垃圾回收 |
| **顶层检测** | 多点检测 | 提高准确性 |
| **历史记录** | 双轨制 | History (持久) + Activity (瞬时) |

### 性能特征
```plain
updateTree():       O(n) 时间，O(n) 空间
clickElement():     O(1) 时间，O(1) 空间
scrollVertically(): O(h) 时间，O(1) 空间
```

---

## 🚀 集成到 atoms-plus 的可能方向
基于以上分析，Page Agent 可以为 atoms-plus 带来以下能力：

### 1. 预览窗口的 AI 操控
```plain
用户: "把那个登录按钮变成圆角蓝色"
         ↓
Page Agent 识别预览中的按钮
         ↓
OpenHands 修改代码
         ↓
实时更新预览
```

### 2. 自然语言 UI 测试
```javascript
// 用户只需要说
"测试一下：填写表单，用户名 admin，密码 123456，点提交"

// Page Agent 在预览中执行，返回结果
✅ 填写用户名成功
✅ 填写密码成功
✅ 点击提交
❌ 报错：密码必须至少8位
```

### 3. 组件自动演示
生成组件后，自动展示如何使用：

```plain
AI: "我帮你生成了一个 DatePicker 组件，让我演示一下..."

[Page Agent 自动]
1. 点击输入框
2. 选择日期
3. 展示选中效果
```

### 4. 可视化调试
```plain
用户: "点击这个添加按钮，看看为什么没反应"

Page Agent:
- 点击按钮 ✓
- 检测到 console.error: "items is undefined"
- 发现问题：state 初始化缺少 items 数组
```

### 5. Voice-to-UI (未来方向)
```plain
🎤 用户语音: "在这个页面加一个搜索框，放在导航栏右边"
    ↓
Page Agent 定位导航栏位置
    ↓
OpenHands 生成搜索框代码并插入正确位置
    ↓
预览实时更新
```

### 集成架构设想
```plain
┌─────────────────────────────────────────────────────┐
│                   atoms-plus 前端                    │
├─────────────────────┬───────────────────────────────┤
│    代码编辑器       │      预览 iframe              │
│                     │  ┌─────────────────────┐      │
│                     │  │   Page Agent 注入   │      │
│                     │  │   (监听自然语言)    │      │
│                     │  └─────────────────────┘      │
├─────────────────────┴───────────────────────────────┤
│  💬 "把那个表格的第三列隐藏掉"                        │
└─────────────────────────────────────────────────────┘
          ↓
    Page Agent 识别 → 告诉 OpenHands 需要修改什么
          ↓
    OpenHands 修改代码 → 预览更新
```

### 实现复杂度评估
| 功能 | 难度 | 价值 | 建议优先级 |
| --- | --- | --- | --- |
| Live Preview 交互修改 | 🟡 中 | ⭐⭐⭐⭐⭐ | P0 |
| 自然语言 UI 测试 | 🟢 低 | ⭐⭐⭐⭐ | P0 |
| 组件自动演示 | 🟢 低 | ⭐⭐⭐ | P1 |
| 可视化调试 | 🟡 中 | ⭐⭐⭐⭐ | P1 |
| Voice-to-UI | 🔴 高 | ⭐⭐⭐⭐⭐ | P2 |

---

## 📚 参考资源
+ **Page Agent 官方文档**: [https://alibaba.github.io/page-agent/](https://alibaba.github.io/page-agent/)
+ **GitHub 仓库**: [https://github.com/alibaba/page-agent](https://github.com/alibaba/page-agent)
+ **browser-use (灵感来源)**: [https://github.com/browser-use/browser-use](https://github.com/browser-use/browser-use)
+ **npm 包**: [https://www.npmjs.com/package/page-agent](https://www.npmjs.com/package/page-agent)

---

> **总结**: Page Agent 是一个设计精良、架构清晰的浏览器自动化框架。其核心创新在于：
>
> 1. 文本化的 DOM 表示（无需多模态 LLM）
> 2. MacroTool 强制反思-行动循环
> 3. 完整的事件模拟（兼容各种框架）
>
> 与 atoms-plus 集成后，可以实现 **"所见即所得的 AI 交互"**，这是 vibe coding 最缺的一环。
>

---

# 附录：MacroTool 与 Re-act 循环深度解析
## 🧠 什么是 Re-act 循环？
**Re-act** = **Re**asoning + **Act**ing

这是一种让 AI Agent 在执行任务时「边思考边行动」的设计模式，源自 2022 年的论文 [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)。

### 核心思想对比
```plain
传统方式:  用户输入 → LLM 一次性输出所有步骤 → 执行
Re-act:   用户输入 → [观察 → 思考 → 行动] → 循环直到完成
```

### Page Agent 的 Re-act 实现流程
```plain
┌─────────────────────────────────────────────────────────────────────┐
│                          一次循环 (Step)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. 👀 OBSERVE (观察)                                               │
│     ┌──────────────────────────────────────────────────────────┐   │
│     │ • 获取当前页面 DOM 状态                                    │   │
│     │ • 检测 URL 是否变化                                        │   │
│     │ • 生成系统观察 (剩余步数警告等)                            │   │
│     │ • 输出: browser_state (简化的 DOM 文本)                    │   │
│     └──────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  2. 🧠 THINK (思考) - LLM 调用                                      │
│     ┌──────────────────────────────────────────────────────────┐   │
│     │ 输入:                                                      │   │
│     │   • System Prompt (你是谁、规则是什么)                     │   │
│     │   • agent_history (之前所有步骤的记录)                     │   │
│     │   • browser_state (当前页面状态)                           │   │
│     │   • user_request (用户的任务)                              │   │
│     │                                                            │   │
│     │ 强制输出 (MacroTool):                                      │   │
│     │   {                                                        │   │
│     │     evaluation_previous_goal: "上一步成功了吗？",          │   │
│     │     memory: "我需要记住什么？",                             │   │
│     │     next_goal: "下一步要做什么？",                          │   │
│     │     action: { tool_name: { params } }                      │   │
│     │   }                                                        │   │
│     └──────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  3. 🎯 ACT (行动)                                                   │
│     ┌──────────────────────────────────────────────────────────┐   │
│     │ • 解析 LLM 返回的 action                                   │   │
│     │ • 执行对应的工具 (click, input, scroll...)                 │   │
│     │ • 获取执行结果                                             │   │
│     │ • 记录到 history                                           │   │
│     └──────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  4. 判断是否结束                                                    │
│     • action === 'done' → 返回结果                                 │
│     • step >= maxSteps → 超时错误                                  │
│     • 否则 → 继续下一轮循环                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 什么是 MacroTool？
**MacroTool** 是 Page Agent 的核心创新 —— 将所有工具合并成**一个**工具，并强制 LLM 在调用前进行反思。

### 传统 Function Calling 的问题
```javascript
// 传统方式：多个独立工具
tools = [
  { name: "click", params: { index: number } },
  { name: "input", params: { index: number, text: string } },
  { name: "scroll", params: { down: boolean } },
  { name: "done", params: { text: string } },
]

// LLM 可以直接选择工具，不需要解释为什么
LLM输出: { tool: "click", args: { index: 5 } }  // 没有任何推理！
```

**问题：**

1. LLM 可能「盲目行动」，不评估上一步是否成功
2. 没有记忆机制，容易重复犯错
3. 没有规划，不知道为什么要执行这个动作

### MacroTool 的解决方案
```javascript
// MacroTool：一个工具，强制反思
const macroTool = {
  name: "AgentOutput",
  inputSchema: z.object({
    // 强制反思字段
    evaluation_previous_goal: z.string(),  // 必须评估上一步
    memory: z.string(),                     // 必须记忆关键信息
    next_goal: z.string(),                  // 必须规划下一步

    // 动作选择 (union of all tools)
    action: z.union([
      z.object({ click_element_by_index: z.object({ index: z.number() }) }),
      z.object({ input_text: z.object({ index: z.number(), text: z.string() }) }),
      z.object({ scroll: z.object({ down: z.boolean() }) }),
      z.object({ done: z.object({ text: z.string(), success: z.boolean() }) }),
      // ...
    ])
  })
}
```

**LLM 必须输出：**

```json
{
  "evaluation_previous_goal": "Successfully clicked the login button, the login form appeared.",
  "memory": "User wants to login with username 'admin'. Form has username and password fields.",
  "next_goal": "Fill in the username field with 'admin'.",
  "action": {
    "input_text": {
      "index": 3,
      "text": "admin"
    }
  }
}
```

---

## 📐 MacroTool 的类型定义
```typescript
// 来源: packages/core/src/types.ts

/**
 * Agent reflection state - the reflection-before-action model
 *
 * Every tool call must first reflect on:
 * - evaluation_previous_goal: How well did the previous action achieve its goal?
 * - memory: Key information to remember for future steps
 * - next_goal: What should be accomplished in the next action?
 */
export interface AgentReflection {
  evaluation_previous_goal: string  // 评估上一步目标是否达成
  memory: string                     // 需要记住的关键信息
  next_goal: string                  // 下一步的目标
}

/**
 * MacroTool input structure
 *
 * This is the core abstraction that enforces the "reflection-before-action" mental model.
 * Before executing any action, the LLM must output its reasoning state.
 */
export interface MacroToolInput extends Partial<AgentReflection> {
  action: Record<string, any>  // { tool_name: { params } }
}

/**
 * MacroTool output structure
 */
export interface MacroToolResult {
  input: MacroToolInput   // 保存 LLM 的输入（用于历史记录）
  output: string          // 工具执行结果
}
```

---

## 🔨 MacroTool 的构建过程
```typescript
// 来源: packages/core/src/PageAgentCore.ts

#packMacroTool(): Tool<MacroToolInput, MacroToolResult> {
  const tools = this.tools  // Map<string, PageAgentTool>

  // 1. 为每个工具创建一个对象 schema
  const actionSchemas = Array.from(tools.entries()).map(([toolName, tool]) => {
    return z.object({
      [toolName]: tool.inputSchema
    }).describe(tool.description)
  })

  // 示例: actionSchemas = [
  //   z.object({ click_element_by_index: z.object({ index: z.int() }) }),
  //   z.object({ input_text: z.object({ index: z.int(), text: z.string() }) }),
  //   z.object({ done: z.object({ text: z.string(), success: z.boolean() }) }),
  //   ...
  // ]

  // 2. 合并成 union schema
  const actionSchema = z.union(actionSchemas)

  // 3. 构建完整的 MacroTool schema
  const macroToolSchema = z.object({
    evaluation_previous_goal: z.string().optional(),
    memory: z.string().optional(),
    next_goal: z.string().optional(),
    action: actionSchema,  // 必须选择一个动作
  })

  // 4. 返回工具定义
  return {
    description: 'You MUST call this tool every step!',
    inputSchema: macroToolSchema,
    execute: async (input: MacroToolInput): Promise<MacroToolResult> => {
      // 解析动作
      const toolName = Object.keys(input.action)[0]  // e.g., "click_element_by_index"
      const toolInput = input.action[toolName]        // e.g., { index: 5 }

      // 找到对应的工具
      const tool = this.tools.get(toolName)

      // 执行工具 (bind this 使工具可以访问 PageAgent 实例)
      const result = await tool.execute.bind(this)(toolInput)

      return {
        input,    // 保存输入用于历史
        output: result,
      }
    },
  }
}
```

---

## 🔄 完整的执行流程代码
```typescript
// 来源: packages/core/src/PageAgentCore.ts (简化版)

async execute(task: string): Promise<ExecutionResult> {
  this.task = task
  this.history = []

  let step = 0

  while (true) {
    // ===== 1. OBSERVE =====
    // 获取浏览器状态（DOM 简化表示）
    this.#states.browserState = await this.pageController.getBrowserState()
    await this.#handleObservations(step)  // 系统观察

    // ===== 2. THINK =====
    // 组装 prompts
    const messages = [
      { role: 'system', content: this.#getSystemPrompt() },
      { role: 'user', content: await this.#assembleUserPrompt() },
    ]

    // 构建 MacroTool
    const macroTool = { AgentOutput: this.#packMacroTool() }

    // 调用 LLM
    const result = await this.#llm.invoke(messages, macroTool, this.#abortController.signal, {
      toolChoiceName: 'AgentOutput',  // 强制调用 AgentOutput
      normalizeResponse: (res) => normalizeResponse(res, this.tools),
    })

    // ===== 3. ACT =====
    const macroResult = result.toolResult as MacroToolResult
    const input = macroResult.input
    const actionName = Object.keys(input.action)[0]

    // 记录到历史
    this.history.push({
      type: 'step',
      stepIndex: step,
      reflection: {
        evaluation_previous_goal: input.evaluation_previous_goal,
        memory: input.memory,
        next_goal: input.next_goal,
      },
      action: {
        name: actionName,
        input: input.action[actionName],
        output: macroResult.output,
      },
    })

    // ===== 4. CHECK DONE =====
    if (actionName === 'done') {
      return {
        success: input.action.done.success,
        data: input.action.done.text,
        history: this.history,
      }
    }

    step++
    if (step > this.config.maxSteps) {
      return { success: false, data: 'Max steps exceeded', history: this.history }
    }

    await waitFor(0.4)  // 步骤间延迟
  }
}
```

---

## 🛠️ 自动修复机制 (normalizeResponse)
LLM 的输出经常不规范，Page Agent 有一套自动修复机制：

```typescript
// 来源: packages/core/src/utils/autoFixer.ts

/**
 * Normalize LLM response and fix common format issues.
 *
 * Handles:
 * - No tool_calls but JSON in message.content (fallback)
 * - Model returns action name as tool call instead of AgentOutput
 * - Arguments wrapped as double JSON string
 * - Nested function call format
 * - Missing action field (fallback to wait)
 * - Primitive action input for single-field tools
 */
export function normalizeResponse(response: any, tools?: Map<string, PageAgentTool>): any {
  let resolvedArguments = null

  // === 修复 #1: 工具名不是 AgentOutput ===
  // 有些模型直接返回 { name: "click_element_by_index", arguments: {...} }
  // 需要包装成 { action: { click_element_by_index: {...} } }
  if (toolCall.function.name && toolCall.function.name !== 'AgentOutput') {
    log(`#1: fixing tool_call`)
    resolvedArguments = { action: safeJsonParse(resolvedArguments) }
  }

  // === 修复 #2: JSON 在 content 而非 tool_calls ===
  // 有些模型把 JSON 放在 message.content 里
  if (message.content) {
    const jsonInContent = retrieveJsonFromString(content)
    if (jsonInContent) {
      resolvedArguments = safeJsonParse(jsonInContent)

      // === 修复 #3: 多层嵌套 ===
      // { name: "AgentOutput", arguments: { name: "AgentOutput", arguments: {...} } }
      if (resolvedArguments?.name === 'AgentOutput') {
        log(`#2: fixing tool_call`)
        resolvedArguments = safeJsonParse(resolvedArguments.arguments)
      }

      // 有时甚至 2 层包装
      if (resolvedArguments?.type === 'function') {
        log(`#3: fixing tool_call`)
        resolvedArguments = safeJsonParse(resolvedArguments.function.arguments)
      }

      // === 修复 #4: 只有 action 级别，缺少反思字段 ===
      if (
        !resolvedArguments?.action &&
        !resolvedArguments?.evaluation_previous_goal &&
        !resolvedArguments?.memory &&
        !resolvedArguments?.next_goal
      ) {
        log(`#4: fixing tool_call`)
        resolvedArguments = { action: safeJsonParse(resolvedArguments) }
      }
    }
  }

  // === 修复 #5: 缺少 action 字段 ===
  // 只有反思字段，没有 action
  if (!resolvedArguments.action) {
    log(`#5: fixing tool_call`)
    resolvedArguments.action = { name: 'wait', input: { seconds: 1 } }  // 默认等待
  }

  // === 修复 #6: 原始值转对象 ===
  // { click_element_by_index: 5 } → { click_element_by_index: { index: 5 } }
  if (schema instanceof z.ZodObject && value !== null && typeof value !== 'object') {
    const requiredKey = Object.keys(schema.shape).find(
      (k) => !(schema.shape as Record<string, z.ZodType>)[k].safeParse(undefined).success
    )
    if (requiredKey) {
      log(`coercing primitive action input for "${toolName}"`)
      value = { [requiredKey]: value }
    }
  }

  // 返回规范化的响应
  return normalizedResponse
}
```

### 修复场景汇总
| 场景 | 原始输出 | 修复后 |
| --- | --- | --- |
| **#1** 工具名错误 | `{ name: "click", args: {...} }` | `{ action: { click: {...} } }` |
| **#2** JSON 在 content | `content: '{"action":...}'` | 提取并解析 |
| **#3** 多层嵌套 | `{ name: "AgentOutput", arguments: {...} }` | 展开一层 |
| **#4** 缺少反思 | `{ click: { index: 5 } }` | `{ action: { click: {...} } }` |
| **#5** 缺少 action | `{ memory: "...", next_goal: "..." }` | 添加 `{ wait: { seconds: 1 } }` |
| **#6** 原始值输入 | `{ click: 5 }` | `{ click: { index: 5 } }` |

---

## 📊 历史记录结构
每一步都会记录完整的推理链：

```typescript
// history 数组示例
[
  {
    type: 'step',
    stepIndex: 0,
    reflection: {
      evaluation_previous_goal: "N/A - this is the first step",
      memory: "User wants to login to the website with username 'admin'",
      next_goal: "Click on the login button to open the login form"
    },
    action: {
      name: 'click_element_by_index',
      input: { index: 5 },
      output: '✅ Clicked element'
    },
    usage: { promptTokens: 1500, completionTokens: 200, totalTokens: 1700 }
  },
  {
    type: 'step',
    stepIndex: 1,
    reflection: {
      evaluation_previous_goal: "Success - login form appeared after clicking",
      memory: "Login form has username field [index: 8] and password field [index: 9]",
      next_goal: "Enter username 'admin' in the username field"
    },
    action: {
      name: 'input_text',
      input: { index: 8, text: 'admin' },
      output: '✅ Input text into element'
    },
    usage: { promptTokens: 2000, completionTokens: 180, totalTokens: 2180 }
  },
  // ... 更多步骤
]
```

---

## 🎯 MacroTool + Re-act 的优势对比
| 特性 | 传统 Function Calling | MacroTool + Re-act |
| --- | --- | --- |
| **推理可见性** | 黑盒，不知道为什么选这个工具 | 白盒，每步都有完整推理 |
| **错误恢复** | 容易卡住重复错误 | 每步评估上一步，及时调整 |
| **上下文记忆** | 依赖 LLM 自动记忆 | 显式 memory 字段强制记忆 |
| **规划能力** | 无显式规划 | next_goal 强制规划 |
| **调试友好** | 难以理解决策过程 | 历史记录完整可追溯 |
| **Human-in-the-loop** | 难以介入 | 可以在任何步骤暂停/修改 |

---

## 💡 对 atoms-plus 的启发
MacroTool + Re-act 的设计可以应用到 atoms-plus 的多个场景：

### 1. 代码生成的反思-行动循环
```javascript
// 而不是一次性生成代码，可以分步推理
{
  evaluation_previous_goal: "Created the Button component, but missing hover state",
  memory: "User wants a primary button with hover effect and disabled state",
  next_goal: "Add hover state styles to the Button",
  action: {
    edit_file: {
      file: "Button.tsx",
      changes: "..."
    }
  }
}
```

### 2. 预览交互的反思链
```javascript
// 在预览中操作时保持推理
{
  evaluation_previous_goal: "Clicked the submit button, but nothing happened",
  memory: "Console shows 'items is undefined' error",
  next_goal: "Fix the state initialization in the parent component",
  action: {
    suggest_fix: {
      file: "Form.tsx",
      line: 15,
      issue: "items array not initialized"
    }
  }
}
```

### 3. 多步任务的链式推理
```javascript
// 复杂任务分解为多个推理步骤
Step 1: { next_goal: "分析用户需求，确定需要的组件" }
Step 2: { next_goal: "创建基础组件结构" }
Step 3: { next_goal: "添加样式和交互" }
Step 4: { next_goal: "编写单元测试" }
Step 5: { action: { done: { success: true, text: "组件已完成" } } }
```

---

# 附录：System Prompt 设计详解
## 📐 整体结构
System Prompt 采用 **XML 标签分块** 的设计，共 12 个模块：

```plain
┌─────────────────────────────────────────────────────────────────────┐
│                      System Prompt 结构                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  <intro>              → 角色定义和能力说明                          │
│  <language_settings>  → 语言设置                                    │
│  <input>              → 输入格式说明                                │
│  <agent_history>      → 历史记录格式                                │
│  <user_request>       → 用户请求优先级说明                          │
│  <browser_state>      → 浏览器状态格式                              │
│  <browser_rules>      → 浏览器操作规则 (17条)                       │
│  <capability>         → 能力边界和失败处理                          │
│  <task_completion_rules> → 任务完成规则                             │
│  <reasoning_rules>    → 推理规则                                    │
│  <examples>           → 输出示例                                    │
│  <output>             → 输出格式要求                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 逐模块详解
### 1. `<intro>` - 角色定义
```markdown
You are an AI agent designed to operate in an iterative loop to automate browser tasks.
Your ultimate goal is accomplishing the task provided in <user_request>.

You excel at following tasks:
1. Navigating complex websites and extracting precise information
2. Automating form submissions and interactive web actions
3. Gathering and saving information
4. Operate effectively in an agent loop
5. Efficiently performing diverse web tasks
```

**设计要点：**

+ 明确身份：「在迭代循环中操作的 AI Agent」
+ 明确目标：完成 `<user_request>` 中的任务
+ 列出 5 项核心能力

---

### 2. `<language_settings>` - 语言设置
```markdown
- Default working language: **English**
- Use the language that user is using. Return in user's language.
```

**动态替换实现：**

```typescript
#getSystemPrompt(): string {
  const targetLanguage = this.config.language === 'zh-CN' ? '中文' : 'English'
  const systemPrompt = SYSTEM_PROMPT.replace(
    /Default working language: \*\*.*?\*\*/,
    `Default working language: **${targetLanguage}**`
  )
  return systemPrompt
}
```

---

### 3. `<input>` - 输入格式说明
```markdown
At every step, your input will consist of:
1. <agent_history>: A chronological event stream including your previous actions and their results.
2. <agent_state>: Current <user_request> and <step_info>.
3. <browser_state>: Current URL, interactive elements indexed for actions, and visible page content.
```

**目的：告诉 LLM 每步会收到什么数据结构。**

---

### 4. `<agent_history>` - 历史记录格式
```markdown
<step_{step_number}>:
Evaluation of Previous Step: Assessment of last action
Memory: Your memory of this step
Next Goal: Your goal for this step
Action Results: Your actions and their results
</step_{step_number}>
and system messages wrapped in <sys> tag.
```

**实际示例：**

```xml
<step_1>
Evaluation of Previous Step: Successfully clicked login button. Verdict: Success
Memory: Login form appeared with username [8] and password [9] fields
Next Goal: Fill username field with 'admin'
Action Results: ✅ Clicked element
</step_1>
<sys>Warning: 3 steps remaining</sys>

```

---

### 5. `<user_request>` - 用户请求优先级
```markdown
USER REQUEST: This is your ultimate objective and always remains visible.
- This has the highest priority. Make the user happy.
- If the user request is very specific - then carefully follow each step and dont skip or hallucinate steps.
- If the task is open ended you can plan yourself how to get it done.
```

**关键点：**

+ 用户请求 = 最高优先级
+ 区分「精确步骤任务」和「开放式任务」

---

### 6. `<browser_state>` - 浏览器状态格式
```markdown
Interactive Elements: All interactive elements will be provided in format as [index]<type>text</type>
- index: Numeric identifier for interaction
- type: HTML element type (button, input, etc.)
- text: Element description

Examples:
[33]User form
\t*[35]<button aria-label='Submit form'>Submit</button>
Note that:
- Only elements with numeric indexes in [] are interactive
- (stacked) indentation (with \t) is important (html child relationship)
- Elements tagged with `*[` are NEW elements since last step
- Pure text elements without [] are not interactive.
```

**这是 DOM 简化表示的「协议」，让 LLM 知道如何解读页面结构。**

---

### 7. `<browser_rules>` - 浏览器操作规则 (17 条)
这是最重要的部分，定义了 Agent 在浏览器中的行为边界：

| # | 规则 | 目的 |
| --- | --- | --- |
| 1 | 只与有 `[index]` 的元素交互 | 防止幻觉操作 |
| 2 | 只使用明确提供的 index | 防止瞎猜 |
| 3 | 页面变化后分析是否需要与新元素交互 | 处理动态 UI |
| 4 | 默认只列出视口内元素，需要时滚动 | 处理长页面 |
| 5 | 可用 `num_pages` 控制滚动量 | 精细滚动控制 |
| 6 | 滚动容器标记 `data-scrollable` | 处理嵌套滚动 |
| 7 | 遇 captcha 告知用户无法解决 | 知道能力边界 |
| 8 | 元素缺失时尝试滚动或返回 | 错误恢复策略 |
| 9 | 页面未加载完成时使用 `wait` | 等待页面加载 |
| 10 | 同一动作不重复超过 3 次 | 防止死循环 |
| 11 | 输入被中断通常意味着出现建议列表 | 处理自动完成 |
| 12 | 有筛选条件时使用过滤器 | 提高操作效率 |
| 13 | 用户指定步骤优先级最高 | 尊重用户意图 |
| 14 | 输入后可能需要回车/点击/选择 | 完成输入操作 |
| 15 | 不必要时不要登录 | 最小权限原则 |
| 16 | 区分两类任务：精确步骤 vs 开放式 | 策略选择 |
| 17 | 卡住时尝试替代方案 | 灵活应对问题 |

**完整规则文本：**

```markdown
Strictly follow these rules while using the browser:
- Only interact with elements that have a numeric [index] assigned.
- Only use indexes that are explicitly provided.
- If the page changes after an input text action, analyze if you need to interact with new elements.
- By default, only elements in the visible viewport are listed. Use scrolling if relevant content is offscreen.
- You can scroll by a specific number of pages using the num_pages parameter.
- All scrollable elements are marked with `data-scrollable` attribute.
- If a captcha appears, tell user you can not solve captcha.
- If expected elements are missing, try scrolling, or navigating back.
- If the page is not fully loaded, use the `wait` action.
- Do not repeat one action for more than 3 times unless conditions changed.
- If you fill an input field and your action sequence is interrupted, something changed (e.g. suggestions popped up).
- If the <user_request> includes specific filters, try to apply them to be more efficient.
- The <user_request> is the ultimate goal. User-specified explicit steps have highest priority.
- If you input_text into a field, you might need to press enter, click search button, or select from dropdown.
- Don't login into a page if you don't have to. Don't login if you don't have the credentials.
- There are 2 types of tasks:
  1. Very specific step by step instructions: Follow them precisely, don't skip steps.
  2. Open ended tasks: Plan yourself, be creative in achieving them.
```

---

### 8. `<capability>` - 能力边界
```markdown
- You can only handle single page app. Do not jump out of current page.
- Do not click on link if it will open in a new page (<a target="_blank">)
- It is ok to fail the task.
  - User can be wrong. If the request is not achievable, tell user to make a better request.
  - Webpage can be broken. All webpages have bugs. Tell user the problem.
  - Trying too hard can be harmful. User would rather you complete with a fail.
- If you do not have knowledge for the current task, require user to give specific instructions.
```

**关键设计理念：「允许失败」比「盲目尝试」更好。**

这是非常重要的设计哲学：

1. 承认能力边界（单页应用、不能跨 Tab）
2. 失败是可接受的（比造成副作用好）
3. 用户可能错了，网页可能坏了
4. 不懂就问用户

---

### 9. `<task_completion_rules>` - 任务完成规则
```markdown
You must call the `done` action in one of three cases:
- When you have fully completed the USER REQUEST.
- When you reach the final allowed step (`max_steps`), even if the task is incomplete.
- When you feel stuck or unable to solve user request. Or user request is not clear or contains inappropriate content.
- If it is ABSOLUTELY IMPOSSIBLE to continue.

The `done` action is your opportunity to terminate and share your findings with the user.
- Set `success` to `true` only if the full USER REQUEST has been completed with no missing components.
- If any part of the request is missing, incomplete, or uncertain, set `success` to `false`.
- You can use the `text` field of the `done` action to communicate your findings.
- You are ONLY ALLOWED to call `done` as a single action. Don't call it together with other actions.
- If the user asks for specified format, MAKE sure to use the right format in your answer.
- If the user asks for a structured output, your `done` action's schema may be modified.
```

`done`** 是唯一的终止动作，必须单独调用。**

---

### 10. `<reasoning_rules>` - 推理规则
```markdown
Exhibit the following reasoning patterns to successfully achieve the <user_request>:

- Reason about <agent_history> to track progress and context toward <user_request>.
- Analyze the most recent "Next Goal" and "Action Result" and clearly state what you previously tried to achieve.
- Analyze all relevant items in <agent_history> and <browser_state> to understand your state.
- Explicitly judge success/failure/uncertainty of the last action. Never assume an action succeeded just because it appears executed.
- Analyze whether you are stuck (repeating same actions multiple times without progress).
- Ask user for help if you have any difficulty. Keep user in the loop.
- If you see information relevant to <user_request>, plan saving the information to memory.
- Always reason about the <user_request>. Compare the current trajectory with the user request carefully.
```

**强制 LLM 进行显式推理，而不是盲目行动。**

关键点：

+ 必须分析历史记录
+ 必须显式判断上一步成功/失败/不确定
+ 不能假设执行了就成功了
+ 卡住时要识别并求助
+ 看到有用信息要记忆

---

### 11. `<examples>` - 输出示例
```markdown
<evaluation_examples>
"evaluation_previous_goal": "Successfully navigated to the product page and found the target information. Verdict: Success"
"evaluation_previous_goal": "Clicked the login button and user authentication form appeared. Verdict: Success"
</evaluation_examples>
<memory_examples>
"memory": "Found many pending reports that need to be analyzed in the main page. Successfully processed the first 2 reports on quarterly sales data and moving on to inventory analysis and customer feedback reports."
</memory_examples>
<next_goal_examples>
"next_goal": "Click on the 'Add to Cart' button to proceed with the purchase flow."
</next_goal_examples>

```

**Few-shot 示例，展示期望的输出风格。**

---

### 12. `<output>` - 输出格式要求
```markdown
{
  "evaluation_previous_goal": "Concise one-sentence analysis of your last action. Clearly state success, failure, or uncertain.",
  "memory": "1-3 concise sentences of specific memory of this step and overall progress. You should put here everything that will help you track progress in future steps.",
  "next_goal": "State the next immediate goal and action to achieve it, in one clear sentence.",
  "action":{
    "Action name": {// Action parameters}
  }
}
```

**这与 MacroTool 的 schema 完全对应。**

---

## 📨 User Prompt 动态组装
System Prompt 是静态的，User Prompt 是每步动态组装的：

```typescript
// 来源: packages/core/src/PageAgentCore.ts

async #assembleUserPrompt(): Promise<string> {
  let prompt = ''

  // 1. <instructions> (可选 - 自定义指令)
  prompt += await this.#getInstructions()

  // 2. <agent_state>
  //    - <user_request>: 用户任务
  //    - <step_info>: 当前步数和时间
  prompt += '<agent_state>\n'
  prompt += '<user_request>\n'
  prompt += `${this.task}\n`
  prompt += '</user_request>\n'
  prompt += '<step_info>\n'
  prompt += `Step ${stepCount + 1} of ${this.config.maxSteps} max possible steps\n`
  prompt += `Current time: ${new Date().toLocaleString()}\n`
  prompt += '</step_info>\n'
  prompt += '</agent_state>\n\n'

  // 3. <agent_history>
  //    - <step_N>: 每步的反思和结果
  //    - <sys>: 系统观察消息
  prompt += '<agent_history>\n'
  for (const event of this.history) {
    if (event.type === 'step') {
      prompt += `<step_${stepIndex}>\n`
      prompt += `Evaluation of Previous Step: ${event.reflection.evaluation_previous_goal}\n`
      prompt += `Memory: ${event.reflection.memory}\n`
      prompt += `Next Goal: ${event.reflection.next_goal}\n`
      prompt += `Action Results: ${event.action.output}\n`
      prompt += `</step_${stepIndex}>\n`
    } else if (event.type === 'observation') {
      prompt += `<sys>${event.content}</sys>\n`
    } else if (event.type === 'user_takeover') {
      prompt += `<sys>User took over control and made changes to the page</sys>\n`
    }
  }
  prompt += '</agent_history>\n\n'

  // 4. <browser_state>
  //    - URL、Tab 信息
  //    - DOM 简化文本
  //    - 可滚动信息
  let pageContent = browserState.content
  if (this.config.transformPageContent) {
    pageContent = await this.config.transformPageContent(pageContent)
  }

  prompt += '<browser_state>\n'
  prompt += browserState.header + '\n'   // Current URL: https://...
  prompt += pageContent + '\n'           // [0]<button>Submit</button> ...
  prompt += browserState.footer + '\n'   // Scroll info
  prompt += '</browser_state>\n\n'

  return prompt
}
```

### User Prompt 示例
```xml
<agent_state>
<user_request>
登录网站，用户名 admin，密码 123456
</user_request>
<step_info>
Step 2 of 40 max possible steps
Current time: 2026/3/6 14:30:25
</step_info>
</agent_state>
<agent_history>
<step_1>
Evaluation of Previous Step: N/A - this is the first step
Memory: User wants to login with username 'admin' and password '123456'
Next Goal: Click the login button to open login form
Action Results: ✅ Clicked element
</step_1>
</agent_history>
<browser_state>
Current URL: https://example.com/login

[0]<input placeholder="用户名">
[1]<input type="password" placeholder="密码">
[2]<button>登录</button>
[3]<a>忘记密码?</a>
Scrollable: false
</browser_state>

```

---

## 🎯 设计亮点总结
| 设计点 | 实现方式 | 目的 |
| --- | --- | --- |
| **XML 分块** | `<tag>...</tag>` | 结构清晰，便于 LLM 解析 |
| **显式规则** | 17 条 browser_rules | 减少幻觉和错误行为 |
| **允许失败** | capability 明确边界 | 宁可失败也不盲目尝试 |
| **强制推理** | reasoning_rules | 每步必须评估/记忆/规划 |
| **示例驱动** | examples 模块 | 展示期望的输出格式 |
| **动态注入** | User Prompt 组装 | 历史、状态、时间都是动态的 |
| **自定义扩展** | instructions/customSystemPrompt | 支持覆盖或扩展 |
| **新元素标记** | `*[index]` 语法 | 帮助 Agent 识别页面变化 |
| **层级缩进** | `\t` 表示父子关系 | 保留 DOM 结构信息 |

---

## 🔧 扩展点
Page Agent 提供多个扩展点来自定义 Prompt：

### 1. 自定义系统指令
```typescript
const agent = new PageAgent({
  instructions: {
    // 全局系统指令
    system: '你是一个专门处理电商网站的助手，优先使用筛选功能',

    // 页面级动态指令
    getPageInstructions: (url) => {
      if (url.includes('checkout')) {
        return '结账页面：仔细核对订单金额，不要自动确认付款'
      }
      return null
    }
  }
})
```

### 2. 完全覆盖 System Prompt
```typescript
const agent = new PageAgent({
  customSystemPrompt: `
    你是一个专门用于测试的 Agent...
    // 完全自定义的 prompt
  `
})
```

### 3. 页面内容转换
```typescript
const agent = new PageAgent({
  // 在发送给 LLM 前处理页面内容
  transformPageContent: async (content) => {
    // 脱敏处理
    return content.replace(/1[3-9]\d{9}/g, '***********')
  }
})
```

### 4. 实验性 llms.txt 支持
```typescript
const agent = new PageAgent({
  // 自动获取网站的 /llms.txt 作为上下文
  experimentalLlmsTxt: true
})
```