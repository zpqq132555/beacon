## ADDED Requirements

### Requirement: Interactive Platform Selection Summary
`beacon init` 在交互式平台选择阶段 SHALL 在平台选项列表外显示当前已选择平台摘要。

#### Scenario: 显示已选择平台摘要
- **WHEN** 用户以非 `--yes` 模式运行 `beacon init`
- **THEN** 平台选择 prompt SHALL 显示本地化的平台选择问题和当前已选择平台摘要

#### Scenario: 摘要使用干净平台名称
- **WHEN** 某个平台因检测到配置目录而在选项文本中显示检测状态
- **THEN** 已选择平台摘要 SHALL 使用该平台的干净名称，且 MUST NOT 包含检测状态后缀

#### Scenario: 没有已选平台时显示空状态
- **WHEN** 当前没有任何平台被选中
- **THEN** 已选择平台摘要 SHALL 显示本地化空状态文案

### Requirement: Localized Required Selection Validation
交互式平台选择 MUST 使用 Beacon 的中英文文案显示必选校验错误。

#### Scenario: 英文必选校验
- **WHEN** 英文初始化流程提交空平台选择
- **THEN** 校验错误 SHALL 显示英文 Beacon 文案

#### Scenario: 中文必选校验
- **WHEN** 中文初始化流程提交空平台选择
- **THEN** 校验错误 SHALL 显示中文 Beacon 文案

### Requirement: Non Interactive Init Compatibility
`beacon init --yes` SHALL 保持现有非交互平台选择行为。

#### Scenario: 检测到平台时自动选择检测平台
- **WHEN** 用户运行 `beacon init --yes` 且项目中检测到一个或多个 Beacon 私有化平台
- **THEN** 初始化 SHALL 自动选择检测到的平台

#### Scenario: 未检测到平台时自动选择全部私有化平台
- **WHEN** 用户运行 `beacon init --yes` 且项目中没有检测到 Beacon 私有化平台
- **THEN** 初始化 SHALL 自动选择 Claude Code、Cursor、Codex、Trae 四个平台
