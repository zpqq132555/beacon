# archive-agents-sedimentation Specification

## Purpose
Define when archive-phase learnings should be ignored, surfaced as summary-first suggestions, or routed through `/beacon-init` so only stable, high-value rules are sedimented into AGENTS.
## Requirements
### Requirement: Archive Trigger Is Silent by Default
archive 阶段对于 AGENTS 沉淀 MUST 默认静默，仅在 AI 判断本次归档内容值得沉淀时才向用户暴露后续建议。

#### Scenario: 不适合沉淀时静默忽略
- **WHEN** archive 阶段判断当前归档内容不适合写入 AGENTS
- **THEN** Beacon MUST 直接忽略 AGENTS 维护步骤，而 MUST NOT 提示或打断用户

### Requirement: Archive Uses Summary-First Suggestions
当 archive 阶段判断本次归档内容适合沉淀到 AGENTS 时，Beacon MUST 先给出摘要级建议并等待用户确认。

#### Scenario: 适合沉淀时先给摘要
- **WHEN** archive 阶段判断本次归档内容适合写入 AGENTS
- **THEN** Beacon MUST 先说明受影响文档、拟执行动作和沉淀原因的摘要，而 MUST NOT 直接写入或删除 AGENTS 文档

#### Scenario: 用户确认后再执行
- **WHEN** 用户确认 archive 阶段的 AGENTS 摘要建议
- **THEN** Beacon MUST 再调用 `/beacon-init` 执行对应的创建、更新、合并或删除动作

### Requirement: Archive Chooses Between Full Bootstrap and Incremental Maintenance
archive 阶段在需要沉淀时 MUST 根据项目是否已经存在 AGENTS 体系，在“全量维护 + 当前归档注入”与“仅当前归档增量维护”之间做出区分。

#### Scenario: 项目还没有 AGENTS 体系时走全量维护
- **WHEN** archive 阶段判断内容适合沉淀，且项目中不存在 AGENTS 体系
- **THEN** Beacon MUST 以“全量维护 + 当前归档内容注入”的方式调用 `/beacon-init`

#### Scenario: 项目已有 AGENTS 体系时只做增量维护
- **WHEN** archive 阶段判断内容适合沉淀，且项目中已存在 AGENTS 体系
- **THEN** Beacon MUST 只让 `/beacon-init` 处理本次归档相关的增量维护

### Requirement: Archive Sedimentation Stays Conservative
archive 阶段写入 AGENTS 的内容 MUST 只限于长期有效、对 AI 高价值的规则。

#### Scenario: 长期稳定规则可以沉淀
- **WHEN** 某归档内容体现的是稳定的目录职责、关键命令、流程约束或高价值实现禁区
- **THEN** Beacon MAY 建议将其沉淀到 AGENTS

#### Scenario: 一次性背景不应沉淀
- **WHEN** 某归档内容仅是一次性需求背景、临时 workaround 或只服务单次 feature 的说明
- **THEN** Beacon MUST NOT 建议将其写入 AGENTS
