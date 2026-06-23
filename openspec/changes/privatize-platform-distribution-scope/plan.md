# Private Platform Distribution Scope Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 将 Beacon 私有版首批支持平台收敛为 Codex、Cursor、Claude Code、Trae，并同步 CLI、文档和测试。

**Architecture:** 平台注册表是本次改造的源头，CLI 命令、OpenSpec/Superpowers 能力包映射、skills/rules/hooks 分发和测试都从该边界向外同步。工作流阶段逻辑和 `.beacon.yaml` 状态机不参与本次改造。

**Tech Stack:** TypeScript, Commander, Vitest, OpenSpec superpowers-bridge, Bash contract scripts.

---

## Task 1: Platform Registry

- [ ] **Step 1:** 阅读 `src/core/platforms.ts`，确认 Codex、Cursor、Claude Code、Trae 的现有字段。
- [ ] **Step 2:** 将 `PLATFORMS` 收敛到四个平台，保留各自现有 `skillsDir`、`globalSkillsDir`、`openspecToolId`、rules 和 hooks 能力边界。
- [ ] **Step 3:** 搜索 `PLATFORMS` 调用点，确认无硬编码 29 平台假设遗漏。
- [ ] **Step 4:** 提交平台注册表变更。

## Task 2: Capability Pack Mappings

- [ ] **Step 1:** 更新 `src/core/superpowers.ts` 中平台到 skills CLI agent 的映射和数量断言相关代码。
- [ ] **Step 2:** 更新 `src/core/openspec.ts` 对平台 tool id 的使用，确认四平台仍可初始化。
- [ ] **Step 3:** 更新 `src/core/detect.ts` 中平台检测逻辑涉及的特殊平台路径。
- [ ] **Step 4:** 提交能力包映射变更。

## Task 3: CLI Commands

- [ ] **Step 1:** 检查 `src/commands/init.ts`，确保平台选择和摘要只暴露四平台。
- [ ] **Step 2:** 检查 `src/commands/doctor.ts`，确保技能完整性诊断只报告四平台。
- [ ] **Step 3:** 检查 `src/commands/update.ts`，确保已安装目标检测只支持四平台。
- [ ] **Step 4:** 检查 `src/commands/uninstall.ts` 和 `src/core/uninstall.ts`，确保卸载目标只围绕四平台。
- [ ] **Step 5:** 提交 CLI 行为变更。

## Task 4: Docs and Assets

- [ ] **Step 1:** 更新 `README.md` 和 `README-zh.md` 的支持平台列表。
- [ ] **Step 2:** 搜索 docs、NEWS、CHANGELOG 中平台数量和平台列表描述，只更新当前说明必要内容。
- [ ] **Step 3:** 更新 `docs/PRIVATE-FEATURE-MODULES.md` 的相关状态。
- [ ] **Step 4:** 提交文档与台账变更。

## Task 5: Tests

- [ ] **Step 1:** 更新 `test/ts/superpowers.test.ts` 中平台映射数量和平台 id 断言。
- [ ] **Step 2:** 更新 `test/ts/openspec.test.ts`、`test/ts/init-e2e.test.ts`、`test/ts/init.test.ts` 的平台相关断言。
- [ ] **Step 3:** 更新 `test/ts/doctor.test.ts`、`test/ts/update.test.ts`、`test/ts/uninstall.test.ts` 的平台相关断言。
- [ ] **Step 4:** 运行 targeted tests：`npx vitest run test/ts/superpowers.test.ts test/ts/openspec.test.ts test/ts/init.test.ts test/ts/doctor.test.ts test/ts/update.test.ts test/ts/uninstall.test.ts`。
- [ ] **Step 5:** 运行全量测试：`npx vitest run`。
- [ ] **Step 6:** 提交测试变更。
