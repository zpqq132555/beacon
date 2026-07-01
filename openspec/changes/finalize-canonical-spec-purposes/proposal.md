## Why

当前 `openspec/specs/` 中已有 4 份 canonical spec 在归档后仍保留 `Purpose: TBD` 占位文案，说明主线规范收口不完整。这类遗留会降低 `openspec/specs/` 作为长期事实源的可信度，也暴露出归档后缺少完整性防护的问题，因此适合现在用一个小范围 change 同时修正现状并补上防回归约束。

## What Changes

**canonical spec Purpose 收口**
- From: 部分 canonical spec 在进入主线后仍保留 `TBD - created by archiving change...` 这类占位文案。
- To: 回填这些 spec 的 `## Purpose`，改为准确描述对应 capability 的稳定职责与边界。
- Reason: 主线 spec 应该表达已确认的长期契约，而不是保留归档过程中的临时占位。
- Impact: 非破坏性变更，影响 OpenSpec 主线文档质量与后续维护体验。

**主线 spec 占位防回归**
- From: 仓库缺少针对 canonical spec 占位文案的自动化约束，后续归档可能再次把占位留回主线。
- To: 新增一层自动化校验，确保 `openspec/specs/**/spec.md` 不再接受归档占位式 `Purpose` 文案进入主线。
- Reason: 仅手工补文案只能修一次，无法防止同类问题复发。
- Impact: 非破坏性变更，新增规范完整性 guard，主要影响测试与规范维护流程。

## Capabilities

### New Capabilities
- `canonical-spec-completeness`: 约束主线 `openspec/specs/**/spec.md` 必须具备可读的 Purpose，并通过自动化校验阻止归档占位文案残留。

### Modified Capabilities

## Impact

- Affected docs: `openspec/specs/agents-document-topology/spec.md`、`openspec/specs/agents-tree-maintenance/spec.md`、`openspec/specs/archive-agents-sedimentation/spec.md`、`openspec/specs/human-documentation-localization/spec.md`
- Affected tests: 与 OpenSpec/spec 文本完整性相关的 TypeScript 测试
- Affected systems: OpenSpec 主线规范维护流程、归档后主 spec 完整性校验
