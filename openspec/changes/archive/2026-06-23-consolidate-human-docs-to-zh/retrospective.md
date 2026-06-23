# Retrospective: consolidate-human-docs-to-zh

> Written: 2026-06-23 (after verify passed)
> Commit range: `84d918e..a5f073e`
> Worktree: `D:/tools/AI/beacon/.worktrees/consolidate-human-docs-to-zh`

> Update: finishing 阶段再次运行 `pnpm.cmd test` 时，全量测试仍超时，但超时前暴露出仓库协作说明测试仍读取 `CLAUDE.md` 的完整规则。`b35275e test: align authoring guidance with AGENTS canonical docs` 已把 Skill 触发表述规范移入 `AGENTS.md` 并让 `CLAUDE.md` 继续作为薄入口。

---

## 0. Evidence

- **Commit range**: `84d918e..a5f073e` (2 commits)
- **Diff size**: +1547 / -1617 lines across 19 files
- **Tasks done**: 18/18 (`tasks.md`)
- **Active hours**: ~1.7h
- **Subagent dispatches**: 4 (`Gibbs` implementer, `Gauss` spec reviewer, `Nietzsche` quality reviewer, `Popper` re-reviewer)
- **New external dependencies**: none
- **Bugs encountered post-merge**: none; work not merged
- **OpenSpec validate state at archive**: pass at verify time (`openspec.cmd validate --all --json`: 4 passed, 0 failed)
- **Test coverage signal**: `test/ts/readme.test.ts` 2/2 passed; targeted Prettier passed; `pnpm.cmd format:check` passed; full `pnpm.cmd test` timed out locally before implementation and was not used as a completion gate

Commit chain:

```text
ca59124 docs: consolidate human documentation to Chinese
a5f073e docs: add documentation consolidation verification
b35275e test: align authoring guidance with AGENTS canonical docs
```

---

## 1. Wins

- The change kept the intended boundary: runtime Skill assets, OpenSpec schema/spec/archive paths, and private legacy notes were not modified. Evidence: `git diff --name-only -- assets/skills assets/skills-zh openspec/schemas openspec/specs openspec/changes/archive` returned no output.
- The single-source documentation goal landed cleanly: `README.md` and `CONTRIBUTING.md` are the only canonical entry files, while `README-zh.md` and `CONTRIBUTING-zh.md` were removed in `ca59124`.
- `CLAUDE.md` became a thin compatibility entry pointing to `AGENTS.md`, matching the user's explicit follow-up. Evidence: `CLAUDE.md` contains only the AGENTS reference and no duplicated project rules.
- Review loops caught real issues before archive: `Gauss` found a remaining `README-zh` reference in `CHANGELOG.md`, and `Nietzsche` found the old COMET ASCII art plus a Prettier issue in `docs/PRIVATE-FEATURE-MODULES.md`.
- The README test was updated to match the new single canonical file model. Evidence: `test/ts/readme.test.ts` now reads only `README.md`, and `npx.cmd vitest run test/ts/readme.test.ts --reporter verbose` passed 2/2.

## 2. Misses

- 🟡 [painful | evidence: worker report + main checkout `git status`] The implementer worker initially patched the main checkout as well as the worktree. The coordinator had to restore a precise file list in the main checkout and remove the duplicate untracked change directory.
- 🟡 [painful | evidence: `test/ts/readme.test.ts`] Deleting `README-zh.md` initially missed a test that still read the deleted file. This was caught by coordinator inspection, not the first implementation pass.
- 🟡 [painful | evidence: reviewer `Nietzsche`] README's ASCII art still spelled COMET after the first implementation pass. The migration copied canonical Chinese content but did not fully inspect first-viewport brand signals.
- 📌 [nit | evidence: verify.md §8] Full `pnpm.cmd test` hung in this Windows worktree even before implementation. The cycle proceeded with targeted tests and documented the limitation, but the full-suite signal remains unresolved.
- 📌 [nit | evidence: finishing-stage test output] The first archive pass missed that `test/ts/skills.test.ts` still expected full authoring guidance in `CLAUDE.md`. The follow-up fix moved that assertion to `AGENTS.md` and verified `CLAUDE.md` only references the canonical file.

## 3. Plan deviations

| Plan task | What changed                                                                                       | Why                                                                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.1       | Added `test/ts/readme.test.ts` update, although the original task only named README migration.     | Removing `README-zh.md` would otherwise break an existing README test.                                                                           |
| 2.5 / 5.4 | Formatted `docs/PRIVATE-FEATURE-MODULES.md`, creating a larger diff than the content change alone. | Quality review found the touched table failed Prettier; formatting the touched file was necessary to keep validation green.                      |
| 4.1–4.3   | Bumped version to `0.4.3` instead of appending to `0.4.2`.                                         | `master` was `0.4.2`, so project rules required this change to be exactly one version greater than master.                                       |
| Verify    | Used `PASS WITH WARNINGS` instead of plain PASS.                                                   | Delta spec sync is expected to happen during archive, and full `pnpm.cmd test` timed out locally.                                                |
| Finishing | Added a post-archive test/docs commit.                                                             | Full-suite timeout surfaced a stale `CLAUDE.md` assumption in `test/ts/skills.test.ts`; the fix was scoped to AGENTS/CLAUDE canonical ownership. |

## 4. Skill / workflow compliance

| Skill                                            | Used                                |
| ------------------------------------------------ | ----------------------------------- |
| superpowers:brainstorming                        | ✓                                   |
| superpowers:writing-plans                        | ✓                                   |
| superpowers:using-git-worktrees                  | ✓                                   |
| superpowers:subagent-driven-development          | ✓                                   |
| (transitive) superpowers:test-driven-development | ✓ scope-appropriate                 |
| (transitive) superpowers:requesting-code-review  | ✓                                   |
| superpowers:finishing-a-development-branch       | pending after retrospective/archive |

> **Default expectation**: apply-phase implementation and review skills were used. `finishing-a-development-branch` is pending because schema ordering places it after retrospective and archive, so it is not skipped at this retrospective write-time.

### Deliberately Skipped Skills

None.

## 5. Surprises

- The worker managed to write to both the intended worktree and the main checkout despite explicit worktree instructions. The issue was recoverable because the touched file list was narrow and attributable.
- The most fragile part of deleting language duplicates was not markdown linking, but test coverage that assumed two README files existed.
- The visible README brand signal was not only the logo image and heading; the ASCII art also needed rebrand scrutiny.
- `openspec.cmd validate --all --json` validated unrelated active changes in the worktree (`privatize-platform-distribution-scope`, `rebrand-comet-to-beacon`) because those directories exist on this branch baseline.

## 6. Promote candidates → long-term learning

- [ ] 🟡 **Worker prompts for worktree tasks should require a first command proving `pwd` / `git rev-parse --show-toplevel` before edits** → **Promote to memory**

  > **Why**: This cycle's implementer wrote the intended worktree and also touched the main checkout, requiring recovery.
  > **How to apply**: Any delegated worker with a required worktree path must report the resolved repo root before making file edits.

- [ ] 🟡 **Deleting a documentation file requires searching tests and source for that filename before marking the task done** → **Promote to project AGENTS.md**

  > **Why**: `README-zh.md` deletion initially missed `test/ts/readme.test.ts`, which would have broken CI.
  > **How to apply**: When removing a doc file, run `rg` for its basename across `test`, `src`, scripts, and ordinary docs before completing the removal task.

- [ ] 📌 **README brand migrations should inspect first-viewport text artifacts, not only prose and links** → **Promote to one-off**

  > **Why**: The migrated README still displayed COMET in ASCII art after the first pass.
  > **How to apply**: For README rebrand or canonicalization work, inspect the first 40 lines and any fenced banners manually.

- [ ] 📌 **Full-suite timeout in this worktree should be investigated separately from documentation-only changes** → **Promote to one-off**
  > **Why**: `pnpm.cmd test` timed out before implementation, while targeted tests passed.
  > **How to apply**: If a future change needs full-suite confidence, isolate which Vitest file hangs under Windows worktree execution before treating the suite as a reliable gate.
