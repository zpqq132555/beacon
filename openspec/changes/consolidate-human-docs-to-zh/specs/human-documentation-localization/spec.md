## ADDED Requirements

### Requirement: 普通文档必须以中文 canonical 维护

项目普通人读文档 SHALL 以简体中文作为唯一 canonical 维护语言，并 MUST 保留生态默认入口文件名作为阅读入口。

#### Scenario: README 使用标准入口

- **WHEN** 用户或包管理平台访问仓库 README
- **THEN** `README.md` MUST 存在，并且内容以简体中文为主

#### Scenario: 贡献指南使用标准入口

- **WHEN** 维护者查阅贡献流程
- **THEN** `CONTRIBUTING.md` MUST 存在，并且内容以简体中文为主

### Requirement: 普通文档语言副本必须移除

项目普通人读文档 SHALL 不再维护英文/中文并存的语言副本，并 MUST 清理指向已移除语言副本的普通文档链接。

#### Scenario: 删除中文副本后没有内部普通文档断链

- **WHEN** `README-zh.md` 或 `CONTRIBUTING-zh.md` 等普通文档语言副本被移除
- **THEN** 根目录、`docs/` 和 `.github/` 普通文档中 MUST 不再引用这些已移除文件

#### Scenario: 清理语言切换提示

- **WHEN** 普通文档已收敛为单中文 canonical
- **THEN** 普通文档中 MUST 不再展示 English/中文版本切换提示

### Requirement: 功能语言资产必须排除在普通文档清理之外

文档单中文维护变更 SHALL 只作用于普通人读文档，并 MUST 排除会影响工具行为、生成模板、规范历史或私有留存资料的路径。

#### Scenario: Skill 运行时内容不被修改

- **WHEN** 执行普通文档单中文维护变更
- **THEN** `assets/skills/**` 和 `assets/skills-zh/**` MUST 不因本变更被修改、删除或合并

#### Scenario: OpenSpec 制品不被修改

- **WHEN** 执行普通文档单中文维护变更
- **THEN** `openspec/schemas/**`、`openspec/specs/**` 和 `openspec/changes/archive/**` MUST 不因本变更被修改、删除或合并

#### Scenario: 私有留存资料不被读取或处理

- **WHEN** 执行普通文档单中文维护变更
- **THEN** `.beacon/private-notes/legacy-feature-inventories/**` MUST 不被主动读取、修改或作为实现依据

### Requirement: 同职责协作说明必须单源维护

项目协作说明 SHALL 以 `AGENTS.md` 作为 canonical 维护源，并 MUST 让 `CLAUDE.md` 仅作为直接引用 `AGENTS.md` 的兼容入口。

#### Scenario: Claude 入口引用 AGENTS

- **WHEN** Claude 相关工具或维护者打开 `CLAUDE.md`
- **THEN** `CLAUDE.md` MUST 指向 `AGENTS.md`，并且 MUST 不重复维护完整项目协作说明

#### Scenario: 协作说明只需维护 AGENTS

- **WHEN** 维护者需要更新项目协作规则
- **THEN** 维护者 MUST 只需要修改 `AGENTS.md` 中的 canonical 内容

### Requirement: 文档维护策略变更必须记录版本历史

普通文档单中文维护变更 SHALL 按项目 changelog 规范记录，并 MUST 确认 changelog 顶部版本与 `package.json` 版本一致。

#### Scenario: 完成普通文档清理后记录 changelog

- **WHEN** 普通文档单中文维护变更完成
- **THEN** `CHANGELOG.md` MUST 包含说明该维护策略变更的条目

#### Scenario: 版本号保持一致

- **WHEN** `CHANGELOG.md` 顶部版本被新增或复用
- **THEN** `package.json` 的 `version` MUST 与该版本一致
