---
id: "ai-agent-review"
---

## 项目概况
+ **时间**: 2025.12 - 至今
+ **角色**: 技术负责人
+ **公司**: 腾讯

## 技术栈
Controlled ReAct, Prompt Chaining, CBR, BM25, Multi-Query RAG, Go, Langfuse, RAGAS, Gemini 2.0 Flash

## 项目简介
基于大模型的智能风控审核系统，通过 AI Agent 自动处理企业微信生态中的风控审核工单。主导 V1→V5 五代架构演进，核心设计哲学是"不信任 LLM 的流程判断，只信任 LLM 的内容判断"——让 LLM 专注内容理解，用确定性代码控制流程和规则。准确率从 70% 提升至 90%+，日均自动结单 300+，节省 2+ 人力/天。

## 核心职责
+ 架构设计：主导五代架构演进路线，从朴素 RAG 演进到 Phase-Gated Controlled ReAct
+ 核心开发：Orchestrator 编排引擎、领域 Agent 路由、MacroTool 取证体系、规则仲裁引擎
+ 质量体系：Langfuse 可观测链路 + 声明式 Trace 验证框架 + RAGAS 自动评估

## 主要成就
+ 设计 Phase-Gated Controlled ReAct 架构，将 Agent 审核流程拆为取证→定性→裁决 3 阶段确定性流水线，LLM 在取证阶段自主推理，流程流转由编排器强制驱动，消除 LLM 跳过关键步骤的风险
+ 构建五层正交架构（Entry/Runtime/Agent/Tool/Policy）+ 注册中心路由，新增审核场景仅需添加配置文件和注册 Tool，不修改主流程代码
+ 实现多层确定性兜底体系：PolicyArbiter 规则仲裁（好人分模型 Override、证据缺失强制人工等 5 条规则）、Strategy Gate 硬校验、SpamType 标准化映射，确保 LLM 幻觉不影响最终决策
+ 实现 Go 原生 BM25 知识检索引擎（中文分词 + 530 条规则库），将审核规则注入从全量 5000 token 降至按需 200 token，效率提升 25 倍
+ 构建声明式 Trace 验证框架（YAML spec + Go CLI + 14 种断言操作符），实现 Agent 行为的自动化质量验证，替代人工目视 trace 判断

## 架构演进
### V1→V3: 从 RAG 到 Prompt Chain
V1 朴素 RAG 召回不稳定（准确率 ~70%），V2 引入 CBR 案例推理提升复杂场景处理，V3 拆分为 4 步 Prompt Chain 实现精细化分析。但推理链固定，缺乏动态取证能力。

### V4: Multi-Query RAG + Strategy Gate
引入 Multi-Query 并行检索和 Query Rewriter 提升召回率，设计 Strategy Gate 用确定性代码替代 LLM 对高频场景的判断（如人脸解封条件校验），识别率从 5-10% 提升至 95%。但新场景接入退化为 if-else 分支，架构扩展成本高。

### V5: Phase-Gated Controlled ReAct
核心问题：纯 ReAct 架构下 LLM 可随时跳过定性/裁决步骤，输出质量不可控。

解决方案——四层职责分离 + 三阶段确定性流水线：

+ **编排层（Orchestrator）**: 控制阶段流转和资源预算，不包含任何审核知识
+ **Agent 层（DomainAgent + SkillRouter）**: 封装领域知识为声明式 Skill 文件，按场景类型（~13 种）动态路由注入
+ **工具层（MacroTool）**: 9 个标准化取证工具（RPC 适配 + 规则引擎 + 知识检索），含跨工单申诉历史关联
+ **规则层（PolicyArbiter）**: 5 条确定性仲裁规则统一收口，Agent 的建议必须经规则层审批

三阶段流水线：取证阶段 LLM 自由选择工具，系统级充分性校验兜底；定性阶段强制 LLM 输出违规类型；裁决阶段仅允许输出最终结论。

## 技术亮点
**LLM 与确定性系统的边界划分**是本项目的核心设计思考。风控场景对准确率和一致性要求极高，纯 LLM 方案的幻觉风险不可接受。V5 的策略是将审核流程分解为"需要理解力的环节"（证据分析、场景判断）和"需要确定性的环节"（流程控制、平台规则、输出规范），前者交给 LLM 自主推理，后者用代码强制约束。这一思路贯穿了 Phase-Gated 编排、PolicyArbiter 仲裁、Strategy Gate 短路、SpamType 标准化等所有模块设计。

**领域知识资产化**是另一个关键设计。传统做法是将审核规则硬编码在 Prompt 中，每次修改需要改代码和重新部署。V5 将审核知识拆为三层资产：Skill 文件（.md 格式的领域知识，embed.FS 自动发现）、知识库（CSV 格式的审核规则，BM25 按需检索）、案例库（CBR 相似案例召回）。新增审核场景只需添加 Skill 文件和配置触发条件，零代码改动。

**Spec-Driven 开发实践**：采用 Proposal→Design→Spec→Tasks→Verify 的规范化流程，2 周内完成 22 项架构变更并全量上线。配合声明式 Trace 验证框架，每项变更通过 YAML 断言自动验证 Agent 行为是否符合预期，消除人工验证的主观性。