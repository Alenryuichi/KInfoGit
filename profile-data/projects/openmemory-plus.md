---
id: "openmemory-plus"
---

## 项目概况
+ **时间**: 2026.02 - 至今
+ **角色**: 独立开发者
+ **公司**: 独立开发

## 技术栈
MCP, AI Agent, Memory System, Qdrant, E2E Testing, Multi-Agent

## 项目简介
OpenMemory Plus 是一个为 AI Agent 设计的双层记忆框架，解决跨会话上下文丢失问题。支持 Augment、Cursor、Windsurf、Cline 等主流 IDE Agent，通过 MCP 协议实现统一记忆管理。

## 核心职责
+ 架构设计：设计双层记忆架构（短期记忆 + 长期记忆），实现跨会话上下文保持
+ 核心开发：基于 Qdrant 向量数据库的记忆存储与检索系统
+ 测试体系构建：构建 Agent 自闭环测试体系，15 项端到端测试全自动化

## 主要成就
+ 设计双层记忆架构，跨会话上下文保持率 95%+
+ 实现 ROT 智能过滤（Redundant/Obsolete/Trivial），减少 40% 冗余记忆
+ 构建 Agent 自闭环测试体系，15 项端到端测试全自动化
+ 设计统一 _omp/ 目录结构，支持 4+ IDE Agent 无缝共享

## 技术亮点
项目采用 MCP（Model Context Protocol）作为统一通信协议，使得不同 IDE 的 AI Agent 可以共享同一套记忆系统。双层架构将记忆分为短期工作记忆和长期语义记忆，通过 ROT 过滤机制自动清理冗余信息，保证记忆库的高质量。

测试方面创新性地采用 Agent 自闭环测试——让 AI Agent 自己验证记忆系统的正确性，实现了完全自动化的端到端测试流程。