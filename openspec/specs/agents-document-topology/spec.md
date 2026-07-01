# agents-document-topology Specification

## Purpose
TBD - created by archiving change add-beacon-init-agents-maintenance-skill. Update Purpose after archive.
## Requirements
### Requirement: Root AGENTS Stays Minimal
项目根 `AGENTS.md` MUST 保持精简，只承载全局入口、关键命令、高价值全局注意事项和 AGENTS Map。

#### Scenario: 根 AGENTS 只保留全局导航信息
- **WHEN** `/beacon-init` 创建或更新根 `AGENTS.md`
- **THEN** 根文档 MUST 以全局导航和约束为主，而 MUST NOT 膨胀为承载大量局部细则的长篇文档

#### Scenario: 根 AGENTS 记录局部地图
- **WHEN** 项目中存在局部 AGENTS 文档或职责文档
- **THEN** 根 `AGENTS.md` MUST 提供可追踪到这些局部文档的 AGENTS Map

### Requirement: Topology Follows Responsibility Boundaries
AGENTS 树 MUST 按职责边界分层，而不是机械按目录深度分层。

#### Scenario: 单一职责目录使用目录级 AGENTS
- **WHEN** 某目录的目录边界与职责边界一致
- **THEN** `/beacon-init` MUST 优先使用该目录下的 `AGENTS.md` 作为局部规则入口

#### Scenario: 混合目录使用入口型 AGENTS
- **WHEN** 某目录本身承载多种长期稳定职责
- **THEN** `/beacon-init` MUST 先在该目录创建入口型 `AGENTS.md`，用于说明作用域、共通约束和局部地图

### Requirement: Responsibility Documents Are Supplemental
职责文档 `[职责].md` MUST 作为混合目录中的补充细则，而 MUST NOT 替代局部入口型 `AGENTS.md`。

#### Scenario: 混合目录可使用职责文档
- **WHEN** 某混合目录需要按职责块进一步拆分细则
- **THEN** `/beacon-init` MAY 在该目录下创建多个 `[职责].md` 文档承载这些细则

#### Scenario: 职责文档不能取代目录入口
- **WHEN** 某目录已经被识别为混合区
- **THEN** skill MUST 保留该目录的入口型 `AGENTS.md`，而 MUST NOT 仅留下多个 `[职责].md`

### Requirement: Mixed and Nested Structures Can Coexist
当混合目录本身存在职责细则，同时其子目录又已形成单一职责边界时，局部职责文档与子目录 `AGENTS.md` MUST 允许并存。

#### Scenario: 混合层与子目录层同时存在
- **WHEN** 某混合目录自身有跨子目录职责，且其子目录又是单一职责目录
- **THEN** `/beacon-init` MUST 允许同时维护该目录的 `AGENTS.md`、必要的 `[职责].md`，以及子目录下各自的 `AGENTS.md`

### Requirement: Deeper Levels Need Clear Justification
更深层级的 AGENTS 节点 MUST 只在职责继续细分且长期稳定时才允许创建。

#### Scenario: 不为深层而深层
- **WHEN** 某下级目录并未形成清晰、长期稳定且明显不同的职责边界
- **THEN** `/beacon-init` MUST NOT 仅因目录更深而继续创建新的 AGENTS 节点

