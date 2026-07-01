## 背景

当前仓库没有活动中的 OpenSpec change，工作区干净，适合挑一个低风险但能提升主线质量的改动先做。

在检查 `openspec/specs/` 后，发现 4 份 canonical spec 仍保留归档后遗留的 `Purpose: TBD` 占位：

- `openspec/specs/agents-document-topology/spec.md`
- `openspec/specs/agents-tree-maintenance/spec.md`
- `openspec/specs/archive-agents-sedimentation/spec.md`
- `openspec/specs/human-documentation-localization/spec.md`

这些文件都已经是主线规范，不再是临时草稿。对应的上下文已经存在于归档变更里，因此继续保留 `TBD` 更像是归档收口不完整，而不是需求尚未明确。

## 问题定义

这次最值得处理的不是新增功能，而是修复主线规范层面的“知识未收口”：

- canonical spec 作为长期事实源，不应保留归档占位文案
- 当前问题已经不是单文件疏漏，而是一个可重复出现的模式
- 如果只手工补文案而不加防护，后续 archive 仍可能再次把占位带回主线

## 备选方向

### 方案 A：只补 4 个 Purpose 文案

优点：

- 范围最小
- 风险最低
- 能快速消除当前最明显的不完整状态

缺点：

- 只能修复这一次
- 无法防止未来归档后再次留下同类占位

### 方案 B：补 Purpose，并增加占位防回归检查

优点：

- 同时解决“当前不完整”和“后续可能复发”两个问题
- 改动仍然聚焦在规范与测试层，风险可控
- 能把 canonical spec 的完整性要求明确固化下来

缺点：

- 比纯文案修补多一层测试或脚本约束
- 需要明确 guard 放在哪一层最合适

### 方案 C：转去做别的能力演进，例如供应链或平台范围

优点：

- 可能带来更直接的功能增量

缺点：

- 当前这些领域没有同等明显的缺口
- 会绕过已经暴露出来的主线规范完整性问题

## 推荐

推荐采用方案 B：补齐 canonical spec 的 `Purpose`，并加一层防回归检查。

原因：

- 问题已明确且范围可控
- 上下文足够，不需要重新发散需求
- 相比功能扩展，这是一笔更适合现在做的“清主线债务”

## 范围草案

本次 change 聚焦两件事：

1. 回填 4 份 canonical spec 的 `## Purpose`
2. 增加 guard，避免 `openspec/specs/**/spec.md` 再出现类似 `TBD - created by archiving change...` 的占位文案

## 设计倾向

guard 倾向优先落在自动化验证层，而不是先改 archive 主流程行为：

- 如果只需要约束主线 spec 文本完整性，测试 guard 更轻、更稳
- 只有当现有归档流程明确会持续生成错误占位时，才需要进一步修改归档脚本或模板

这意味着第一版优先考虑：

- 在测试中扫描 canonical spec 占位
- 必要时补充一个小型辅助校验逻辑

而不是立刻扩大成“重做归档产物生成策略”

## 用户确认

已经向用户给出推荐，并得到确认：

- 推荐 change 名：`finalize-canonical-spec-purposes`
- 备选名：`guard-main-spec-placeholders`
- 用户回复“好”，确认按推荐方向收束为正式 change proposal
