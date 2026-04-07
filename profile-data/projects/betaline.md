---
id: "betaline"
---

## 项目概况
+ **时间**: 2025.09 - 至今
+ **角色**: 独立开发者
+ **公司**: 独立开发

## 技术栈
SwiftUI, CoreML, YOLO11, MobileNet V3, Go/Gin, Docker Compose, MCP Server, Prometheus

## 项目简介
磕线是一款从 0 到 1 独立开发的攀岩 iOS 应用，涵盖产品设计、UI/UX、iOS 前端、Go 后端、AI 模型训练、DevOps 全流程。核心功能包括视频分析攀岩动作、岩点检测与分类、训练记录管理等。

## 核心职责
+ 产品设计：从用户研究到功能规划，完整产品设计流程
+ UI/UX：SwiftUI 原生 iOS 界面设计与实现
+ iOS 开发：前端完整功能开发
+ 后端开发：Go/Gin 三层架构后端服务
+ AI 模型训练：YOLO11 岩点检测 + MobileNet V3 分类器训练
+ DevOps：Docker Compose 部署、Prometheus 监控

## 主要成就
+ 独立完成全流程开发：产品/UI/前后端/AI/DevOps/运营
+ 设计 VideoMind Chain-of-Roles 工作流（4000+ 行，6 角色），成本降低 39%，准确率 92%
+ 训练 YOLO11m 岩点检测 + MobileNet V3 分类器，CoreML 导出实现 300x 加速
+ 构建 Go/Gin 三层架构 + JWT 双令牌轮换 + 8 层中间件
+ 自研 MCP Server（25 个运维工具）实现 AI Agent 远程服务器控制

## 技术亮点
VideoMind 是一个创新的视频分析工作流，采用 Chain-of-Roles 架构将视频分析任务分解为 6 个专业角色（导演、摄影师、分析师、标注员、审核员、总结员），通过角色协作完成复杂的攀岩视频分析。

AI 模型方面，通过 YOLO11m 进行岩点检测定位，再用 MobileNet V3 进行颜色/类型分类，最终导出 CoreML 格式在 iOS 端实现实时推理，相比云端推理速度提升 300 倍。