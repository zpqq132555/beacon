# Retrospective: define-private-supply-chain-project-rollout

> Written: 2026-06-30 (after verify passed)
> Commit range: `b35275e..f59e12e`
> Worktree: `D:\tools\AI\beacon`

---

## 0. Evidence

> 量化前置数据。后续分析尽量引用本节，不重复展开同一批事实。

- **Commit range**: `b35275e..f59e12e` (3 commits)
- **Diff size**: `+18 / -11` across 4 tracked files in the final working diff snapshot (`README.md`, `NEWS.md`, `CHANGELOG.md`, `test/ts/readme.test.ts`)
- **Tasks done**: 10/10
- **Active hours**: n/a（文档与回归测试型 change，未单独记录工时）
- **Subagent dispatches**: 0
- **New external dependencies**: none
- **Bugs encountered post-merge**: none
- **OpenSpec validate state at archive**: pass
- **Test coverage signal**: `test/ts/readme.test.ts` 8 tests passed

Commit chain (时序):

```text
4128b78 docs: align supply chain messaging with private distribution
70edce6 chore: document private supply chain verification
f59e12e docs: document project-level private rollout
```

---

## 1. Wins

- [evidence: §0 commit chain, `README.md`, `NEWS.md`] 这次 change 把“已有能力”正式收束成了可落地的项目级私有接入合同，没有去额外扩 Beacon 运行时代码，范围控制得比较稳。
- [evidence: §0 test coverage signal, `test/ts/readme.test.ts`] 文档不是只靠人工约定，而是补了 README/NEWS 回归断言，能防止后续又滑回“全局安装优先”或“外部依赖是前置阻塞”的旧叙事。
- [evidence: `openspec/changes/define-private-supply-chain-project-rollout/specs/private-supply-chain/spec.md`, `openspec validate ...` pass] delta spec 把项目接入、升级、回滚三条路径写成了 requirement/scenario，和 proposal/design 的边界保持一致，没有 capability 漂移。

## 2. Misses

- 🟡 [painful | evidence: `openspec status --change "define-private-supply-chain-project-rollout" --json`] `verify.md` 已经完成，但 `retrospective.md` 一直没落，导致 change 长时间停在“差最后一小步”的状态，影响归档节奏。
- 📌 [nit | evidence: §0 commit chain, `CHANGELOG.md`] 这次实现主轴是 README/NEWS/test/spec，但 `CHANGELOG.md` 也被一起带入最终 diff，说明文档型 change 的“哪些文件属于本次收口”边界还可以再收紧。
- 📌 [nit | evidence: `verify.md`] verify 记录了命令、结果和行为，但没有补成带显式 Overall Decision 勾选的更强模板，后续做归档前检查时可读性一般。

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| 1 / 2 | 实际实现集中在 README、NEWS 与 `test/ts/readme.test.ts`，没有扩展到 `doctor` / `update` 的运行时代码 | 现有运行时能力已满足 change 目标，这个 cycle 只需把合同正式化并补回归保护 |
| 3 | verify 完成后没有立刻补 retrospective，归档前才回填 | 当时先追求 apply-ready 和验证通过，遗漏了归档收尾工件 |

## 4. Skill / workflow compliance

| Skill                                            | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming                        | ✓ |
| superpowers:writing-plans                        | ✓ |
| superpowers:using-git-worktrees                  | ✗ |
| superpowers:subagent-driven-development          | ✗ |
| (transitive) superpowers:test-driven-development | ✓ |
| (transitive) superpowers:requesting-code-review  | ✗ |
| superpowers:finishing-a-development-branch       | ✗ |

> **Default expectation**: 全部 ✓。本 cycle 的 ✗ 主要来自“小范围文档/测试收口直接在当前工作区内完成”，不是能力缺失。

### Deliberately Skipped Skills

- **`superpowers:using-git-worktrees`**
  - **What was skipped**: 跳过了为本 change 单独创建隔离 worktree
  - **Why this cycle**: 证据只显示 3 个与文档/回归测试相关的提交（§0 commit chain），且最终 diff 只落在 4 个跟踪文件上，没有出现需要多任务并行隔离的实现面
  - **How to prevent recurrence**: `scope-judgment rule` — 后续如果 change 会同时改运行时代码与文档/测试，默认先开隔离 worktree；仅文档/回归小改动才允许继续走当前工作区

- **`superpowers:subagent-driven-development`**
  - **What was skipped**: 没有按 task 派发独立实现 subagent
  - **Why this cycle**: 本 cycle 的实现实际只涉及 README/NEWS/spec/test 的收束，没有出现需要独立子任务并行推进的代码面；`verify.md` 里也只有直接执行的 vitest/OpenSpec 命令
  - **How to prevent recurrence**: `scope-judgment rule` — 只有当 change 包含 2 个及以上彼此独立的实现面时，才强制切回 subagent 模式；纯文档合同收口可保留 inline

- **`superpowers:requesting-code-review`**
  - **What was skipped**: 没有单独走请求代码审查的收尾动作
  - **Why this cycle**: 当前证据只有文档和测试回归收口，没有独立 review artifact、review 反馈或 review commit 出现（§0 commit chain）
  - **How to prevent recurrence**: `skill description tightening` — 对文档/测试型 change 补一个更明确的 review 触发条件，避免“因为不是功能代码就自然跳过 review”

- **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: 没有在本 cycle 中走开发分支收尾 skill
  - **Why this cycle**: 当前工作发生在现有仓库上下文中，证据里没有独立分支收尾、合并或 PR 交付动作（§0 与 `git status` / verify 证据）
  - **How to prevent recurrence**: `one-off — schema boundary case, no prevention possible` — 这次是以 OpenSpec 归档为主的历史收口，不是一次标准的分支交付闭环

## 5. Surprises

- 原本以为这个 change 可能需要补 `doctor` 或 `update` 的运行时代码，实际发现核心缺口只是“合同没写清楚”，文档与测试就足以完成目标。
- `verify` 做完后并不代表 change 自然进入可归档状态；少一个 retrospective，OpenSpec 仍然会把它留在活动 change 队列里。

## 6. Promote candidates → long-term learning

- [ ] 🟡 **文档合同型 change 也要把 retrospective 一次性收口** → **Promote to memory**
  > **Why**: 这次 `verify.md` 已完成但 `retrospective.md` 缺失，导致 change 处于“看起来完成、实际上未归档”的拖尾状态。
  > **How to apply**: 当 change 只改文档、spec 和测试时，也要在 verify 通过的同一轮补完 retrospective，避免活动队列积压。

- [ ] 📌 **README/NEWS 回归测试适合承接私有化叙事约束** → **Promote to skill**
  > **Why**: 这次通过 `test/ts/readme.test.ts` 锁住了项目级接入、最小供应链配置和升级路径，效果比只写文档稳定。
  > **How to apply**: 以后凡是“用户可见安装/接入/升级叙事”变更，都优先同步补文档回归测试。

- [ ] 📌 **仅文档收口的 change 可以不强行并行化，但要在 retro 里明确说明** → **Promote to schema**
  > **Why**: 本 cycle 合理跳过了 worktree/subagent/review 分支收尾，但如果不在 retrospective 中写明，就会显得像流程漏走。
  > **How to apply**: 后续 schema 若允许 docs-only / tests-only 的轻量 apply 路径，应把允许条件和例外说明写得更显式。
