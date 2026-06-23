# Init Platform Selection Summary Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 将上游 `init` 平台选择摘要能力按 Beacon 四平台私有化范围移植进主线。

**Architecture:** 新增 `src/commands/platform-select-prompt.ts` 承担选择 UI 和纯函数状态逻辑，`src/commands/init.ts` 只负责把 Beacon 平台数据、i18n 文案和 prompt 串起来。测试先覆盖 prompt 纯函数和 init 调用契约，再实现最小代码通过测试。

**Tech Stack:** TypeScript, Vitest, Inquirer core/prompt packages, OpenSpec, pnpm/npm lockfiles。

---

## Task 1: 测试先行

- [ ] **Step 1:** 创建 `test/ts/platform-select-prompt.test.ts`，导入计划新增的 `formatSelectedSummary`、`getSelectedChoiceNames`、`toggleChoice`、`selectAllChoices`、`invertChoices`、`renderSelectedSummaryLine`。
- [ ] **Step 2:** 在该测试中断言 `summaryName` 优先于 `name`，空选择显示 empty label，切换/全选/反选返回新的选择状态。
- [ ] **Step 3:** 修改 `test/ts/init-e2e.test.ts`，mock `../../src/commands/platform-select-prompt.js` 的 `platformSelectPrompt`。
- [ ] **Step 4:** 新增英文 init 测试：创建 `.codex`，以 `{ json: true, scope: 'project', language: 'en' }` 运行，断言 prompt 收到 `selectedLabel: 'Selected:'`、`emptyLabel: 'none'`、`requiredErrorLabel: 'Select at least one platform.'`，并且 Codex choice 的 `summaryName` 为 `Codex`。
- [ ] **Step 5:** 新增中文 init 测试：以 `{ json: true, scope: 'project', language: 'zh' }` 运行，断言 prompt 收到 `selectedLabel: '已选择：'`、`emptyLabel: '无'`、`requiredErrorLabel: '请至少选择一个平台。'`。
- [ ] **Step 6:** 运行 `cmd /c npx vitest run test/ts/platform-select-prompt.test.ts test/ts/init-e2e.test.ts`，确认失败原因是新增模块或新增 i18n/prompt 契约尚未实现。

## Task 2: 平台选择摘要实现

- [ ] **Step 1:** 新增 `src/commands/platform-select-prompt.ts`，定义 `PlatformSelectChoice<Value extends string>` 和 `PlatformSelectPromptConfig<Value extends string>`。
- [ ] **Step 2:** 实现并导出纯函数：`getSelectedChoiceNames`、`formatSelectedSummary`、`renderSelectedSummaryLine`、`toggleChoice`、`selectAllChoices`、`invertChoices`。
- [ ] **Step 3:** 使用 `@inquirer/core` 的 `createPrompt`、`useKeypress`、`usePagination`、`usePrefix`、`useState` 实现 `platformSelectPrompt`。
- [ ] **Step 4:** 支持键位：上下移动、空格切换、`a` 全选/清空、`i` 反选、回车提交；当 required 且空选择时显示 `requiredErrorLabel`。
- [ ] **Step 5:** 更新 `src/commands/i18n.ts` 的 `TranslationKey` 和 `TRANSLATIONS`，加入 `selectedPlatforms`、`noneSelected`、`selectPlatformsRequired`。
- [ ] **Step 6:** 更新 `src/commands/init.ts`：导入 `platformSelectPrompt`；choices 增加 `summaryName: p.name`；非 `--yes` 分支调用新 prompt 并传入本地化文案。
- [ ] **Step 7:** 运行 `cmd /c npm install --package-lock-only --ignore-scripts` 或等价依赖同步命令，再确保 `package.json`、`package-lock.json`、`pnpm-lock.yaml` 包含新增依赖且 Beacon 元信息未回退。
- [ ] **Step 8:** 运行 `cmd /c npx vitest run test/ts/platform-select-prompt.test.ts test/ts/init-e2e.test.ts`，确认新增测试通过。

## Task 3: 版本、文档与验证

- [ ] **Step 1:** 将 `package.json` 版本改为 `0.4.2`，同步 `package-lock.json`。
- [ ] **Step 2:** 在 `CHANGELOG.md` 顶部新增 `## What's Changed [0.4.2] - 2026-06-23`，记录 init 平台选择摘要和测试覆盖。
- [ ] **Step 3:** 运行 `cmd /c openspec validate --all --json`。
- [ ] **Step 4:** 运行 `cmd /c pnpm format:check`；若失败，只对本次触碰文件运行 Prettier。
- [ ] **Step 5:** 运行 `cmd /c pnpm lint` 和 `cmd /c pnpm build`。
- [ ] **Step 6:** 运行相关测试：`cmd /c npx vitest run test/ts/platform-select-prompt.test.ts test/ts/init-e2e.test.ts test/ts/init.test.ts test/ts/readme.test.ts`。
- [ ] **Step 7:** 全部通过后勾选 `tasks.md`，创建 `verify.md` 记录验证结果。
- [ ] **Step 8:** 提交分支，合并回 `master`，再检查 `git rev-list --left-right --count master...upstream/master` 和 `git log --oneline master..upstream/master`。
