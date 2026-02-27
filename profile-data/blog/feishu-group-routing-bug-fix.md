---
title: "Bug: 飞书群组消息路由到错误的 Agent"
date: 2026-02-28
tags: ["OpenClaw", "Bug 修复", "Agent"]
category: technology
draft: false
image: null
excerpt: "记录飞书群组消息路由到错误 Agent 的问题排查和修复过程"
readTime: "5 min read"
---

# Bug: 飞书群组消息路由到错误的 Agent

> **状态**: ✅ 已解决  
> **日期**: 2026-02-28  
> **影响范围**: 群组 `oc_22ef83f566fc9b0ae01633a12e92e4c0`

## 问题描述

飞书群组 `oc_22ef83f566fc9b0ae01633a12e92e4c0` 的消息被 `default` bot 接收后，错误地 dispatch 到了 `tech-lead` agent，而不是预期的 `main` agent。

### 症状

1. 用户在群里问 "你是谁？"，bot 回复说自己是 "Tech Lead"
2. 日志显示：`dispatching to agent (session=agent:tech-lead:feishu:group:oc_22ef...)`
3. 即使添加了 binding 把 `default` accountId 绑定到 `main`，问题依然存在
4. 删除 tech-lead 的 session 后，session 会自动重建

## 根本原因

**`main` agent 没有在 `agents.list` 中配置。**

### OpenClaw Routing 规则

根据 [Channel Routing 文档](https://docs.openclaw.ai/channels/channel-routing)，routing 规则按以下顺序匹配：

1. Exact peer match (`bindings` with `peer.kind` + `peer.id`)
2. Parent peer match (thread inheritance)
3. Guild + roles match (Discord)
4. Guild match (Discord)
5. Team match (Slack)
6. **Account match (`accountId` on the channel)** ← 我们的 binding 在这里匹配
7. Channel match (any account, `accountId: "*"`)
8. **Default agent (`agents.list[].default`, else first list entry, fallback to `main`)** ← 问题出在这里

### 问题链

```
1. default bot 收到消息
   ↓
2. 检查 bindings，找到 { agentId: "main", match: { accountId: "default" } }
   ↓
3. 尝试加载 main agent 配置
   ↓
4. ❌ main 不在 agents.list 中，找不到配置
   ↓
5. Fallback 到 agents.list[0]（第一个 agent）
   ↓
6. 第一个 agent 是 tech-lead
   ↓
7. Session 被创建在 tech-lead 下
   ↓
8. 后续消息继续使用该 session（粘性）
```

### 配置问题

**修复前的 `agents.list`:**
```json
{
  "agents": {
    "list": [
      { "id": "tech-lead", ... },  // ← 第一个，成为 fallback
      { "id": "ios-dev", ... },
      { "id": "golang-dev", ... }
      // ❌ main 缺失！
    ]
  }
}
```

## 解决方案

### 1. 添加 `main` agent 到 `agents.list`

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "name": "Main",
        "workspace": "/Users/ryuichi/.openclaw/workspace",
        "default": true,
        "model": "bailian/qwen3.5-plus"
      },
      { "id": "tech-lead", ... },
      { "id": "ios-dev", ... },
      { "id": "golang-dev", ... }
    ]
  }
}
```

### 2. 删除错误的 session

```bash
python3 << 'EOF'
import json

with open('~/.openclaw/agents/tech-lead/sessions/sessions.json', 'r') as f:
    sessions = json.load(f)

del sessions["agent:tech-lead:feishu:group:oc_22ef83f566fc9b0ae01633a12e92e4c0"]

with open('~/.openclaw/agents/tech-lead/sessions/sessions.json', 'w') as f:
    json.dump(sessions, f, indent=2)
EOF
```

### 3. 重启 Gateway

```bash
launchctl bootout gui/$(id -u)/ai.openclaw.gateway
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

## 经验教训

1. **agents.list 必须包含所有被引用的 agent** - 即使 binding 指向某个 agentId，该 agent 也必须在 `agents.list` 中有定义
2. **设置 `default: true`** - 明确指定默认 agent，避免依赖隐式的 fallback 逻辑
3. **Session 粘性** - 一旦 session 被创建，后续消息会继续使用同一 session，需要手动清理错误的 session
4. **检查日志中的 session key** - `session=agent:xxx:...` 可以快速定位消息被 dispatch 到了哪个 agent

## 相关配置

- `~/.openclaw/openclaw.json` - 主配置文件
- `~/.openclaw/agents/<agentId>/sessions/sessions.json` - Session 存储
- 飞书群组 ID: `oc_22ef83f566fc9b0ae01633a12e92e4c0`

---

**标签**: #OpenClaw #Bug 修复 #Agent  
**日期**: 2026-02-28  
**状态**: ✅ 已解决
