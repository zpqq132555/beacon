## ADDED Requirements

### Requirement: Zh-Only Runtime Skill Distribution
Beacon 私有版运行时技能分发 MUST 收敛为中文单轨，不再向用户暴露多语言运行时分发合同。

#### Scenario: 项目级 init 分发中文技能
- **WHEN** 用户运行 `beacon init`
- **THEN** Beacon MUST 只向目标平台分发中文运行时技能资产

#### Scenario: 更新命令保持中文单轨
- **WHEN** 用户运行 `beacon update`
- **THEN** Beacon MUST 只刷新中文运行时技能资产，而 MUST NOT 检测或切换运行时技能语言

### Requirement: No Language Selection Surface
Beacon 私有版 CLI MUST 移除用户可见的运行时技能语言选择入口。

#### Scenario: Init 不再提示语言选择
- **WHEN** 用户以交互模式运行 `beacon init`
- **THEN** 命令 MUST NOT 显示运行时技能语言选择提示

#### Scenario: CLI 参数不再暴露语言选项
- **WHEN** 用户查看 `beacon init` 或 `beacon update` 的帮助信息
- **THEN** 用户可见命令面 MUST NOT 继续暴露运行时技能语言参数

### Requirement: Single Maintained Runtime Asset Source
Beacon 私有版运行时分发 MUST 以中文技能资产目录作为唯一维护源。

#### Scenario: 技能复制逻辑使用中文来源
- **WHEN** init 或 update 复制 Beacon 运行时技能
- **THEN** 复制逻辑 MUST 使用中文技能资产目录作为分发来源

#### Scenario: 测试与文档不再断言双语分发
- **WHEN** 文档或自动化测试检查 init/update 的语言行为
- **THEN** 它们 MUST 断言中文单轨分发合同，而 MUST NOT 继续要求英文与中文并存的运行时选择
