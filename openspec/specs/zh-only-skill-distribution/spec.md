# zh-only-skill-distribution Specification

## Purpose

Define Beacon's private runtime skill distribution contract after the team decided to maintain only the Chinese runtime asset set and remove user-facing language-selection surfaces from CLI install/update flows.

## Requirements

### Requirement: Zh-Only Runtime Skill Distribution
Beacon 私有版运行时技能分发 MUST 收敛为中文单轨，不再向用户暴露多语言运行时分发合同。

#### Scenario: 项目级 init 分发中文技能
- **WHEN** a user runs `beacon init`
- **THEN** Beacon MUST only distribute Chinese runtime skill assets to the selected target platforms

#### Scenario: 更新命令保持中文单轨
- **WHEN** a user runs `beacon update`
- **THEN** Beacon MUST only refresh Chinese runtime skill assets and MUST NOT detect or switch runtime skill language

### Requirement: No Language Selection Surface
Beacon 私有版 CLI MUST remove user-visible runtime skill language selection entry points.

#### Scenario: Init 不再提示语言选择
- **WHEN** a user runs `beacon init` interactively
- **THEN** the command MUST NOT display a runtime skill language selection prompt

#### Scenario: CLI 参数不再暴露语言选项
- **WHEN** a user reads the help output for `beacon init` or `beacon update`
- **THEN** the user-visible command surface MUST NOT expose runtime skill language parameters

### Requirement: Single Maintained Runtime Asset Source
Beacon 私有版运行时分发 MUST use the Chinese skill asset directory as the only maintained source of truth.

#### Scenario: 技能复制逻辑使用中文来源
- **WHEN** `beacon init` or `beacon update` copies Beacon runtime skills
- **THEN** the copy logic MUST use the Chinese runtime asset directory as the distribution source

#### Scenario: 测试与文档不再断言双语分发
- **WHEN** docs or automated tests check `init` / `update` language behavior
- **THEN** they MUST assert the Chinese-only runtime distribution contract and MUST NOT continue requiring an English/Chinese runtime choice
