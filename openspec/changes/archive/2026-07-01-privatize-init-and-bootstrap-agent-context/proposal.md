## Why

当前私有版 `beacon init` 的主要职责应该是把 Beacon skills/rules/hooks 和可选依赖正确接入目标平台，但命令入口里仍残留旧 banner 与多语言分发语义。对于已经明确只维护中文运行时资产的私有版来说，这会扩大 CLI 参数面、文档面和测试面，也会让接入边界变得不清晰。

同时，团队已经确认 `AGENTS.md / CLAUDE.md` 的维护需求本身是合理的，但它不应该放在 CLI `init` 阶段实现，而应该在 AI 已经介入的场景里，作为后续独立 skill 设计。

## What Changes

**Init 品牌与入口收口**
- From: `beacon init` 仍保留旧时期 banner 视觉残留，用户第一次接入时看到的入口身份不够统一。
- To: `beacon init` 及相关 CLI 入口文档统一使用 Beacon 私有版品牌，不再暴露旧时期残留。
- Reason: 首次接入是私有版体验的第一触点，入口身份必须一致。
- Impact: 主要影响 CLI 输出、文档和测试断言。

**运行时语言分发收口**
- From: init / update 仍暴露语言选择与双语技能分发语义。
- To: 私有版运行时技能分发收敛为中文单轨，`init` 不再提示语言选择，`update` 不再切换或检测运行时技能语言。
- Reason: 私有版后续只维护中文运行时资产，继续保留双语分发只会增加复杂度和回归面。
- Impact: 需同步更新 CLI、文档、manifest 与自动化测试。

**Agent 上下文初始化延期**
- From: 本 change 一度尝试把 `AGENTS.md / CLAUDE.md` 初始化放进 `beacon init --scope project`。
- To: 本 change 明确不在 CLI `init` 中实现该能力，相关需求留待后续独立 skill 设计。
- Reason: 该能力属于 AI 驱动的项目上下文维护，而不是纯 CLI 安装阶段的职责。
- Impact: 本次 change 不会改动目标项目中的 `AGENTS.md` 或 `CLAUDE.md`。

## Capabilities

### Modified Capabilities
- `beacon-runtime-contracts`: 收紧 Beacon 私有版 CLI 入口与用户可见运行时身份，确保 init 与相关文档不再暴露旧时期品牌残留。
- `zh-only-skill-distribution`: 定义 Beacon 私有版运行时技能如何收敛为中文单轨分发，并移除语言选择合同。

## Impact

- Affected code: `src/commands/init.ts`, `src/commands/update.ts`, `src/cli/index.ts`
- Affected assets: `assets/manifest.json` 与运行时技能分发逻辑
- Affected docs: `README.md`, `NEWS.md`, `CHANGELOG.md`
- Affected tests: `init`, `update`, `skills`, `README`
- Deferred work: `AGENTS.md / CLAUDE.md` 维护能力将在后续独立 skill 方案中讨论
