# Retrospective: privatize-init-and-bootstrap-agent-context

> Written: 2026-07-01 (after verify passed)
> Commit range: `f59e12e..7905027`
> Worktree: `D:\tools\AI\beacon`

---

## 0. Evidence

> 量化前置数据。后续 Wins / Misses 优先引用本节，不重复铺陈同一批事实。

- **Commit range**: `f59e12e..7905027` (1 relevant implementation commit)
- **Diff size**: `+461 / -227 lines across 20 files`
- **Tasks done**: `9/9`
- **Active hours**: n/a（当前仓库未单独记录 cycle 工时）
- **Subagent dispatches**: 0
- **New external dependencies**: none
- **Bugs encountered post-merge**: none
- **OpenSpec validate state at archive**: pass（尚未 archive）
- **Test coverage signal**: `npx vitest run test/ts/init-e2e.test.ts test/ts/update.test.ts test/ts/readme.test.ts test/ts/skills.test.ts` → 4 files, 71 tests passed

Commit chain (时序):

```text
7905027 feat: privatize init and drop cli agent bootstrap
```

---

## 1. Wins

- [evidence: §0 diff size, `src/commands/init.ts`, `src/commands/update.ts`] 这次把 `init` / `update` 的语言分发、品牌输出和 CLI 参数面一次性收口，代码与用户可见合同同步推进，没有把“中文单轨”和“去 AGENTS bootstrap”拆成两套半状态。
- [evidence: `test/ts/init-e2e.test.ts`, `test/ts/update.test.ts`, `test/ts/readme.test.ts`, `test/ts/skills.test.ts`, §0 test coverage signal] 回归面覆盖得比较完整，既锁住了 JSON 输出和命令参数，也锁住了 README/NEWS/manifest 的用户可见合同。
- [evidence: `openspec/changes/privatize-init-and-bootstrap-agent-context/design.md`, `.../specs/zh-only-skill-distribution/spec.md`] 设计里关于“中文单轨”“统一 Beacon 品牌”“CLI 不负责 AGENTS 初始化”的三条边界，最终都能在实现或 delta spec 中找到对应落点，没有明显 scope 漂移。

## 2. Misses

- 🟡 [painful | evidence: `openspec/changes/add-beacon-init-agents-maintenance-skill/`, `git status --short`] verify 阶段仍然被无关未跟踪提案目录干扰，导致本 change 虽然自身实现已提交，工作区仍不是干净状态。
- 🟡 [painful | evidence: `openspec/changes/privatize-init-and-bootstrap-agent-context/verify.md` §3] delta spec 还没 sync，尤其 `zh-only-skill-distribution` 还是新 capability，意味着 archive 前还要再做一次规格落地主线操作。
- 📌 [nit | evidence: `docs/superpowers/specs/2026-06-22-beacon-private-fork-rebrand-design.md`] 仓库里仍有历史 front-door routing leak 文件，虽然不阻塞本 change，但持续增加 verify/archive 噪音。

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| Step 3 / docs 收口 | 实际额外改到了 `CHANGELOG.md`，不仅是 README/NEWS | 仓库规范要求代码变更后同步 Changelog 与版本号，这部分需要跟着实现一起落 |
| Implementation evidence | 原计划完成实现后即可 verify，实际先补了一笔无关 archive commit 再继续 | 工作区里混有上一个 change 的 archive 遗留，必须先剥离才能让本 change 的验证更干净 |

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

> **Default expectation**: 全部 ✓。本 cycle 的跳过主要集中在“没有启 worktree / subagent / 专门 review 收尾”的轻量执行路径。

### Deliberately Skipped Skills

- **`superpowers:using-git-worktrees`**
  - **What was skipped**: 跳过了为本 change 创建隔离 worktree
  - **Why this cycle**: 实际实现集中在 1 个提交 `7905027`，且主要是 CLI、文档、测试与 OpenSpec 工件联动，没有并行实施多个相互独立子任务
  - **How to prevent recurrence**: `scope-judgment rule` — 后续只要 change 同时包含功能实现与归档/规格迁移混改，就优先开 worktree，避免像本次一样被无关工作区内容影响 verify

- **`superpowers:subagent-driven-development`**
  - **What was skipped**: 没有按 task 派发独立 implementer subagent
  - **Why this cycle**: 关键实现面高度耦合在 `init/update + docs + tests` 一条链上，拆 subagent 会增加来回协调成本，而且没有真实并行收益
  - **How to prevent recurrence**: `scope-judgment rule` — 当 change 涉及 2 个以上可独立推进的模块时再强制启用；像本次这种入口收口型 change 可以允许 inline 实施

- **`superpowers:requesting-code-review`**
  - **What was skipped**: 没有单独发起代码审查收尾动作
  - **Why this cycle**: 本 cycle 的验证主要依赖 OpenSpec validate、Vitest、build、format/lint 这些自动化证据，没有形成独立 review artifact 或 reviewer 反馈记录
  - **How to prevent recurrence**: `skill description tightening` — 对 docs+CLI contract change 增加更显式的 review 触发条件，避免因为“不是大功能”就自然跳过

- **`superpowers:finishing-a-development-branch`**
  - **What was skipped**: 没有走专门的分支收尾技能
  - **Why this cycle**: 当前直接在现有 `master` 上完成实现与提交，`git status -sb` 显示仅为 `master...origin/master [ahead 2]`，没有独立 feature branch / PR 收尾过程
  - **How to prevent recurrence**: `one-off — schema boundary case, no prevention possible` — 这次是当前仓库连续清理与私有化收口，执行环境本身就不是标准分支开发闭环

## 5. Surprises

- 原本以为这个 change 的主要阻塞会在代码实现本身，结果真正拖慢 verify 的是工作区里混杂了别的 active proposal 和上一个 archive 的遗留痕迹。
- “从 CLI 移除 AGENTS 初始化”本来像是减法需求，但为了把边界说清楚，最终仍然需要 proposal/design/spec/test 全链路更新，文档成本并不低。

## 6. Promote candidates → long-term learning

- [ ] 🟡 **归档遗留必须在下一轮 verify 前先剥离干净** → **Promote to memory**
  > **Why**: 这次真正影响 verify 的不是实现失败，而是上一个 change 的 archive 遗留和无关 proposal 让工作区持续 dirty。
  > **How to apply**: 每次准备为某个 change 生成 `verify.md` 前，先确认工作区里没有上一轮 archive 迁移残留。

- [ ] 🟡 **入口收口型 change 适合用 docs/tests 一起锁合同** → **Promote to skill**
  > **Why**: 本次通过 README/NEWS/manifest/tests 同步收口，避免了“代码已改、文档还在暗示旧合同”的常见漂移。
  > **How to apply**: 后续凡是改 CLI 参数面、安装行为或用户可见合同，都默认同步补文档与回归断言。

- [ ] 📌 **front-door routing leak 需要单独治理，而不是每个 change 里反复容忍** → **Promote to schema**
  > **Why**: `docs/superpowers/specs/...` 的历史遗留每次 verify 都要重复记录 warning，长期会降低信号密度。
  > **How to apply**: 当仓库稳定下来后，单独起一个 housekeeping cycle 处理历史 design 泄漏文件，减少后续每个 change 的验证噪音。
