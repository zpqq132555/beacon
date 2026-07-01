# Implementation Plan

## Summary

**Change:** privatize-init-and-bootstrap-agent-context

**Goal:** 把 `beacon init` / `beacon update` 的运行时入口收口到 Beacon 私有版中文单轨，并确保 CLI `init` 只承担安装与工作目录初始化职责。

**Architecture:** 这次实现沿 `src/commands/init.ts`、`src/commands/update.ts` 和 `src/cli/index.ts` 三条主链收口入口参数与分发逻辑，不再在 `src/core/` 中保留 CLI 专用的 Agent 文档初始化实现。测试层同步覆盖 CLI 参数面、技能分发来源、JSON 输出和项目级工作目录行为。

## Execution Steps

- [x] **Step 1:** 收口 CLI 参数面与私有版品牌输出，统一 `init/update` 只走中文技能分发来源。
  - Verify: `test/ts/init.test.ts`, `test/ts/update.test.ts`, `test/ts/readme.test.ts`
- [x] **Step 2:** 移除 CLI `init` 中误接入的 `AGENTS.md / CLAUDE.md` 初始化逻辑、相关 JSON 输出与自动化测试。
  - Verify: `test/ts/init-e2e.test.ts`
- [x] **Step 3:** 回归 README/NEWS/CHANGELOG/OpenSpec artifacts，确保本次 change 只表达中文单轨 init/update 收口。
  - Verify: `test/ts/skills.test.ts`, `test/ts/readme.test.ts`, `openspec validate ...`
