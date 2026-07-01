# agents-tree-maintenance Specification

## Purpose
TBD - created by archiving change add-beacon-init-agents-maintenance-skill. Update Purpose after archive.
## Requirements
### Requirement: Manual Beacon Init Maintains the AGENTS Tree
`/beacon-init` MUST 作为项目级 AGENTS 树维护入口，支持在用户手动调用时基于当前工作区现状创建或更新 AGENTS 体系。

#### Scenario: 手动调用时全量创建缺失的 AGENTS 体系
- **WHEN** 用户手动调用 `/beacon-init` 且项目中不存在根 `AGENTS.md`
- **THEN** skill MUST 按当前项目内容创建根 `AGENTS.md`、必要的局部 AGENTS 文档，并创建以根 `AGENTS.md` 为准的 `CLAUDE.md` shim

#### Scenario: 手动调用时全量维护已有 AGENTS 体系
- **WHEN** 用户手动调用 `/beacon-init` 且项目中已存在 AGENTS 体系
- **THEN** skill MUST 按当前工作区现状对现有 AGENTS 树执行全量维护，而不是只处理某个单独目录

#### Scenario: 手动调用读取当前工作区状态
- **WHEN** 用户手动调用 `/beacon-init`
- **THEN** skill MUST 依据当前工作区现状进行判断，并 MAY 将未提交改动纳入本次维护依据

### Requirement: Beacon Init Supports Structural Refactoring
`/beacon-init` MUST 支持对已有 AGENTS 树进行结构优化，包括新增、更新、合并、迁移和删除冗余节点。

#### Scenario: 结构优化可被纳入手动维护建议
- **WHEN** skill 判断现有 AGENTS 树存在明显重复、层级不合理或职责边界失配
- **THEN** skill MUST 能提出结构优化建议，而不只局限于追加内容

#### Scenario: 旧节点可在确认后被删除
- **WHEN** skill 判断某个旧 `AGENTS.md` 或 `[职责].md` 已被新结构完整替代
- **THEN** skill MUST 将该文件列入建议删除集合，并在用户确认后删除该文件

### Requirement: Manual Beacon Init Uses Summary-First Confirmation
即便是手动调用，`/beacon-init` 在执行创建、更新、合并或删除前 MUST 先给出摘要级建议并等待用户确认。

#### Scenario: 手动维护先给摘要后执行
- **WHEN** skill 完成一次手动维护分析
- **THEN** 它 MUST 先输出受影响文档、拟执行动作与主要原因的摘要，而 MUST NOT 在未确认前直接落盘

#### Scenario: 删除动作包含在摘要建议中
- **WHEN** 本次维护建议包含删除旧 AGENTS 文档
- **THEN** 摘要中 MUST 明确列出待删除文件及其替代去向

