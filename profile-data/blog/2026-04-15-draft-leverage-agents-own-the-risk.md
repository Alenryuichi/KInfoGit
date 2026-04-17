---
title: "draft-Leverage agents, own the risk"
date: "2026-04-15"
tags: ["AI Agent","代码生成","生产环境","风险管理","持续交付"]
category: "随笔"
categoryOrder: 4
readTime: "1 min read"
featured: false
excerpt: "文章探讨了在生产环境中负责任地部署AI Agent代码所面临的挑战。作者指出Agent代码生成量与人工审查量之间存在巨大鸿沟，即使CI全绿也无法保证代码质量；强调了在追求自动化效率的同时，必须建立有效的风险管控机制。"
---

最近看 vercel 关于“如何负责任的在生产环境持续交付 Agent 代码”的一篇文章，感触颇深。当前 Agent 庞大的代码生成量和孱弱的人工 review 量存在的巨大的 gap，All Green CI 也无法证明代码