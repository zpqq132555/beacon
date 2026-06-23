# Brainstorm: 私有化平台分发范围

## 背景

当前 Beacon 已完成基础命名私有化，但平台分发层仍保留面向公开发行的宽平台矩阵。平台注册、安装检测、OpenSpec tool 映射、Superpowers agent 映射、README 平台列表和相关测试都围绕 29 个平台展开。用户希望先从平台范围入口做私有化定制，避免后续 CLI、文档、测试和安装策略在过大的平台面上反复返工。

## 已确认决策

### Q1: 第一批私有化支持哪些平台？

采用四个平台作为首批私有化支持范围：

- Codex
- Cursor
- Claude Code
- Trae

### Q2: 本次 change 是否改动 `/beacon` 五阶段工作流？

不改动。工作流阶段逻辑、状态机字段、archive 行为、OpenSpec/Superpowers 核心流程保持原样。本次仅收敛平台分发边界及其直接关联的 CLI、文档和测试。

### Q3: Trae 如何处理？

Trae 纳入首批支持平台。当前项目已有 Trae 平台定义，使用 `.trae` / global `.trae`，支持 rules，不支持 hook。本次按现有能力纳入，不强行补 hook。

## 选定方案

从平台注册与分发层切入，将首批私有版目标平台收敛为 Codex、Cursor、Claude Code、Trae，并同步影响面：

- 平台注册表和检测逻辑
- `init` / `doctor` / `update` / `uninstall` 的平台选择和输出
- Beacon skills/rules/hooks 分发范围
- OpenSpec 和 Superpowers 平台映射
- README 和相关文档中的平台列表
- 平台相关测试断言
- 私有化功能模块台账中的对应状态

## 非目标

- 不改 `/beacon-open`、`/beacon-design`、`/beacon-build`、`/beacon-verify`、`/beacon-archive` 的阶段行为。
- 不改变 `.beacon.yaml` 状态机字段。
- 不改变 hotfix/tweak/full workflow 策略。
- 不新增 Trae hook。
- 不做包名、发布 registry、README 全量重写。

## 风险与取舍

- 取舍：收敛平台会减少通用发行能力，但能显著降低私有版维护面。
- 风险：测试中存在大量“29 平台”断言，改造需要同步更新。
- 风险：OpenSpec/Superpowers 映射若未同步，`init` 可能仍暴露被移除平台。
- 风险：README、NEWS 或 CI 仍可能残留 29 平台描述，需要纳入验收检查。
