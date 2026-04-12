---
title: "chunk 中的内容怎么影响 Embedding 空间的分布？"
date: "2026-04-09"
tags: ["Embedding","信息检索","向量数据库","分片策略","检索增强"]
category: "研究"
categoryOrder: 0
subcategory: "实验"
readTime: "2 min read"
featured: false
excerpt: "本文介绍了一个交互式教学网站，旨在系统讲解Embedding技术的核心知识点与应用。网站涵盖了从基础概念、分片策略、检索范式到模型训练、生产落地的全流程，并通过可视化工具（如UMAP）和预设实验（如不同分片策略对比）来演示chunk内容如何影响Embedding空间分布及检索效果。"
---

> 最近在做提升召回率的工作，对于 Embedding 中各阶段很感兴趣，于是做了一个交互教学网站，来讲解 Embedding 涉及的大部分知识点。
>

## 功能模块
| 模块 | 内容 |
| --- | --- |
| **概念讲解** | Embedding 原理、余弦相似度、QKV 注意力机制、Q2Q/Q2A/A2A 检索范式图文讲解 |
| **Playground** | 自由输入文本，实时生成 Embedding 并在 UMAP 2D 空间中可视化 |
| **分片实验室** | 5 个预设实验对比不同分片策略的效果（单主题/多主题、转折词、序号列表等） |
| **检索范式** | Q2Q / Q2A / A2A 三种检索模式的并排对比演示 |
| **模型训练** | Bi-Encoder 架构、训练三元组、对比学习动画、难负例与数据质量 |
| **检索失败** | 三种常见失败模式：语义稀释、语义鸿沟、否定陷阱 |
| **Top-K 与阈值** | 相似度分布可视化、Precision/Recall 权衡、交互式阈值调节 |
| **Reranker 原理** | Bi-Encoder vs Cross-Encoder 对比，两阶段检索排序演示 |
| **HyDE 原理** | 假想文档 Embedding 的向量空间可视化与相似度提升对比 |
| **稀疏 vs 稠密** | BM25 vs Embedding 排序对比、RRF 混合检索、分数分布对比 |
| **Chunk 构建** | 6 类噪声源（格式/元数据/符号/样板/提取残留/冗余）对 Embedding 的量化影响 |
| **向量索引** | 暴力检索 vs ANN、HNSW/IVF/PQ 对比、efSearch 调参、Recall-延迟权衡、索引选型决策 |
| **数据与微调** | 训练数据来源（FAQ/日志/LLM 合成/人工标注）、负样本策略、微调决策树与检查清单 |
| **生产落地** | 索引生命周期管理、模型版本迁移、线上监控指标、常见故障排查指南 |

<iframe src="/blog/embeds/embedding-lab-embedding.html" width="100%" height="800" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;" loading="lazy"></iframe>