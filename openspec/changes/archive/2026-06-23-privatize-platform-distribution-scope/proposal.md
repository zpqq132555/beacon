## Why

当前 Beacon 的平台分发层仍保留公开发行时期的 29 平台矩阵。私有化版本的首批使用场景只需要 Codex、Cursor、Claude Code 和 Trae。若不先收敛平台范围，后续初始化、诊断、更新、卸载、文档和测试都会继续围绕过大的平台面维护，增加私有化改造成本和误判风险。

## What Changes

**平台支持范围**
- From: 平台注册、安装、检测、文档和测试围绕 29 个平台展开。
- To: 私有版首批支持范围收敛为 Codex、Cursor、Claude Code、Trae。
- Reason: 明确私有化边界，降低维护面。
- Impact: Breaking for removed platforms; expected for private distribution.

**分发与检测输出**
- From: `init`、`doctor`、`update`、`uninstall` 可面向所有注册平台。
- To: 这些命令的用户可见平台范围只围绕首批四个平台。
- Reason: 避免私有版继续暴露未维护平台。
- Impact: Affects CLI output, platform selection, diagnostics, and tests.

**文档与测试**
- From: README 和测试中保留 29 平台描述和断言。
- To: 文档和平台相关测试同步反映首批四平台范围。
- Reason: 让项目说明和验收标准与私有版边界一致。
- Impact: Documentation and regression tests change together.

## Capabilities

### New Capabilities

- `platform-distribution-scope`: 定义私有版首批支持平台范围，以及平台分发、检测、文档和测试需要遵守的行为边界。

### Modified Capabilities

- 无。

## Impact

- Affected code: `src/core/platforms.ts`, `src/core/detect.ts`, `src/core/openspec.ts`, `src/core/superpowers.ts`, `src/core/skills.ts`, `src/core/uninstall.ts`, `src/commands/*.ts`
- Affected assets: `assets/manifest.json`, `assets/skills*/`, platform rules/hooks where applicable
- Affected docs: `README.md`, `README-zh.md`, `docs/PRIVATE-FEATURE-MODULES.md`
- Affected tests: platform, init, doctor, update, uninstall, OpenSpec, Superpowers, README and CI-related tests
- Dependencies: no new runtime dependency expected
