## 1. 测试先行

- [x] 1.1 新增 `test/ts/platform-select-prompt.test.ts`，覆盖选择摘要纯函数、全选、反选和切换行为
- [x] 1.2 更新 `test/ts/init-e2e.test.ts`，先验证英文/中文 init 会调用新的平台选择 prompt，并传入本地化摘要与必选校验文案
- [x] 1.3 运行新增和更新后的测试，确认在实现前按预期失败

## 2. 平台选择摘要实现

- [x] 2.1 新增 `src/commands/platform-select-prompt.ts`，实现可测试的选择状态辅助函数和自定义 Inquirer prompt
- [x] 2.2 更新 `src/commands/i18n.ts`，加入 `selectedPlatforms`、`noneSelected`、`selectPlatformsRequired` 中英文文案
- [x] 2.3 更新 `src/commands/init.ts`，在非 `--yes` 平台选择流程中接入新 prompt，并保留 `--yes` 行为
- [x] 2.4 更新 `package.json`、`package-lock.json`、`pnpm-lock.yaml`，加入新 prompt 依赖

## 3. 版本、文档与验证

- [x] 3.1 将版本升级到 `0.4.2`，并在 `CHANGELOG.md` 顶部记录用户可见行为变更
- [x] 3.2 运行 OpenSpec validate、format、lint、build 和相关 vitest 验证
- [x] 3.3 提交 worktree 分支，合并回 `master` 后复查 `master...upstream/master` 状态
