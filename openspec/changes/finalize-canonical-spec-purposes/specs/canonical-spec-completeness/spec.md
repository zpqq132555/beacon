## ADDED Requirements

### Requirement: Canonical Spec Purpose Must Be Meaningful
主线 `openspec/specs/**/spec.md` 中的 canonical spec MUST 在 `## Purpose` 段落提供可读的职责说明，且 MUST NOT 保留归档脚手架或占位式 Purpose 文案。

#### Scenario: Canonical spec uses concrete Purpose text
- **WHEN** 维护者阅读任一主线 canonical spec
- **THEN** 该文件的 `## Purpose` 必须描述对应 capability 的长期职责、范围或边界，而不是 `TBD`、`created by archiving change` 或等价占位文案

### Requirement: Canonical Spec Placeholder Purpose Must Be Guarded
仓库 MUST 通过自动化校验阻止主线 `openspec/specs/**/spec.md` 保留归档占位式 Purpose 文案。

#### Scenario: Automated validation rejects archive placeholder Purpose
- **WHEN** 测试或等价自动化校验扫描主线 `openspec/specs/**/spec.md`
- **THEN** 如果发现 `Purpose` 段落中存在 `TBD`、`created by archiving change` 或等价归档占位文案，校验必须失败并指向对应文件
