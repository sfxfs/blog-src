---
title: "DeepSeek V4 正式发布：1.6T 参数开源大模型，1M 上下文成为标配"
description: "DeepSeek V4 Preview 正式发布并开源，包含 Pro 和 Flash 两个版本。Pro 版拥有 1.6T 总参数/49B 激活参数，性能媲美顶级闭源模型；Flash 版 284B 总参数/13B 激活参数，提供高性价比选择。"
date: 2026-04-24 15:00:00
tags: [AI, DeepSeek, 大模型, 开源, LLM]
categories: AI
---

> 发布日期：2026 年 4 月 24 日

## 核心亮点

DeepSeek V4 Preview 今日正式发布并完全开源，标志着大模型进入**高性价比的 1M 上下文长度时代**。

本次发布包含两个版本：

- **DeepSeek-V4-Pro**：1.6T 总参数 / 49B 激活参数，性能媲美世界顶级闭源模型
- **DeepSeek-V4-Flash**：284B 总参数 / 13B 激活参数，快速、高效、经济的选择

用户可立即通过 [chat.deepseek.com](https://chat.deepseek.com) 的 Expert Mode / Instant Mode 体验，API 已同步更新可用。

---

## DeepSeek-V4-Pro：开源模型的性能巅峰

### 三大核心优势

**1. 增强的 Agent 能力**
- 在 Agentic Coding 基准测试中达到开源模型 SOTA（State of the Art）
- 已与 Claude Code、OpenClaw、OpenCode 等主流 AI 智能体框架深度集成
- 已在 DeepSeek 内部驱动智能体编码工作流

**2. 丰富的世界知识**
- 在所有当前开源模型中领先
- 仅次于 Gemini-3.1-Pro

**3. 世界级的推理能力**
- 在数学、STEM、编程领域超越所有当前开源模型
- 性能媲美顶级闭源模型

---

## DeepSeek-V4-Flash：高效经济的理想选择

### 核心特性

- **推理能力接近 V4-Pro**：在推理任务上表现与 Pro 版非常接近
- **Agent 任务表现相当**：在简单 Agent 任务上与 V4-Pro 性能持平
- **更小的参数规模**：更快的响应速度，极具成本效益的 API 定价

---

## 架构创新与超高上下文效率

### 技术突破

**1. 全新注意力机制**
- Token-wise 压缩 + DSA（DeepSeek Sparse Attention，深度稀疏注意力）

**2. 极致效率**
- 世界领先的长上下文处理能力
- 大幅降低计算和内存成本

**3. 1M 上下文成为标配**
- 1M 上下文长度现在是所有 DeepSeek 官方服务的默认配置

---

## API 与定价

### 模型规格对比

| 特性 | DeepSeek-V4-Flash | DeepSeek-V4-Pro |
|------|-------------------|-------------------|
| 模型版本 | DeepSeek-V4-Flash | DeepSeek-V4-Pro |
| 总参数 / 激活参数 | 284B / 13B | 1.6T / 49B |
| 上下文长度 | 1M | 1M |
| 最大输出 | 384K | 384K |
| 思考模式 | 支持非思考/思考模式（默认思考） | 支持非思考/思考模式 |
| JSON 输出 | ✅ | ✅ |
| 工具调用 | ✅ | ✅ |
| 前缀补全（Beta） | ✅ | ✅ |
| FIM 补全（Beta） | 仅非思考模式 | 仅非思考模式 |

### 定价（每 1M tokens）

| 计费项 | V4-Flash | V4-Pro |
|--------|----------|--------|
| 输入（缓存命中） | $0.028 | $0.145 |
| 输入（缓存未命中） | $0.14 | $1.74 |
| 输出 | $0.28 | $3.48 |

### API 使用方式

**OpenAI 兼容格式：**
```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "thinking": {"type": "enabled"},
    "reasoning_effort": "high",
    "stream": false
  }'
```

**Anthropic 兼容格式：**
- Base URL: `https://api.deepseek.com/anthropic`

### 重要迁移提示

⚠️ `deepseek-chat` 和 `deepseek-reasoner` 将于 **2026 年 7 月 24 日** 正式停用。

- 当前 `deepseek-chat` → 映射到 `deepseek-v4-flash` 的非思考模式
- 当前 `deepseek-reasoner` → 映射到 `deepseek-v4-flash` 的思考模式

建议开发者尽快迁移到新的模型名称。

---

## 开源资源

- **技术报告**：[HuggingFace PDF](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf)
- **开源权重**：[HuggingFace 集合](https://huggingface.co/collections/deepseek-ai/deepseek-v4)
- **GitHub**：[deepseek-ai](https://github.com/deepseek-ai)

---

## 总结

DeepSeek V4 的发布是开源大模型领域的重要里程碑：

1. **Pro 版**以 1.6T 总参数达到开源 SOTA，在 Agent 能力、世界知识和推理方面全面领先
2. **Flash 版**以极高的性价比，让 1M 上下文和强大推理能力触手可及
3. **架构创新**（Token-wise 压缩 + DSA）让超长上下文处理变得经济可行
4. **完全开源**的权重和技术报告，持续推动开源社区发展

DeepSeek 表示将继续坚持长期主义，稳步推进实现 AGI 的终极目标。

> 🔗 官方信息来源：[DeepSeek API 文档](https://api-docs.deepseek.com/) | [发布新闻](https://api-docs.deepseek.com/news/news260424)
> 
> ⚠️ 提醒：请关注 DeepSeek 官方渠道获取准确信息，其他渠道的声明不代表 DeepSeek 观点。
