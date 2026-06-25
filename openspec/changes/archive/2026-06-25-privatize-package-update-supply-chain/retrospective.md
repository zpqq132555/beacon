# Retrospective: privatize-package-update-supply-chain

> Written: 2026-06-25 (after verify passed)
> Commit range: `9d5aa19..70edce6`
> Worktree: merged to `master`; feature worktree removed

---

## 0. Evidence

- **Commit range**: `9d5aa19..70edce6` (11 commits)
- **Diff size**: `+2368 / -129` across 33 files
- **Tasks done**: `19/19`
- **Active hours**: ~1 working day across two sessions
- **Subagent dispatches**: 5 tracked task/review workers in session
- **New external dependencies**: none
- **Bugs encountered post-merge**: none
- **OpenSpec validate state at archive**: pass (`5/5`)
- **Test coverage signal**: targeted Vitest `108/108` passed; `pnpm format:check`, `pnpm lint`, `pnpm build`, and `node scripts/prepublish-check.js` all passed; full `pnpm test` timed out locally earlier in the cycle

Commit chain:

```text
995b586 docs: add private supply chain change
84fab6c feat: add private supply chain config
dc10945 fix: track configured supply chain sources
c4f87a4 fix: make supply chain provenance explicit
b39ca85 feat: route beacon updates through private supply chain
2b997f1 fix: align beacon update scope with supply chain
ddf30f9 feat: configure external tool supply sources
e4878d7 fix: handle package-only external supply sources
4128b78 docs: align supply chain messaging with private distribution
10a4f07 fix: keep security scan on historical docs
70edce6 chore: document private supply chain verification
```

---

## 1. Wins

- Centralized the private supply-chain contract in `src/core/supply-chain.ts`, which gave Beacon update/version checks and external dependency setup one consistent source of truth.
- Converted user-facing recovery paths from implicit public-source assumptions to explicit private-source or "not configured" messaging in `doctor`, README, NEWS, and init/update prompts.
- Added regression guardrails where they matter most for this kind of change: command-construction tests, README coverage, and prepublish scanning for public-source defaults.
- Caught a real stability issue during close-out: `test/ts/doctor.test.ts` needed a broader timeout budget under grouped targeted runs, and fixing that kept the verification path honest.

## 2. Misses

- 🟠 [painful | evidence: verify.md §8] Full `pnpm test` still is not a reliable local gate for this Windows checkout. We had to rely on targeted suites and supporting checks for touched paths.
- 🟠 [painful | evidence: commit `70edce6`, verify.md §3] The cycle originally stopped after implementation and merge, leaving `verify.md`, `retrospective.md`, spec sync, and archive to a later pass.
- 🟡 [nit | evidence: `test/ts/doctor.test.ts`] The first grouped targeted verification exposed that the current 5-second timeout on the JSON-output doctor test was too tight for this environment.

## 3. Plan deviations

| Plan task | What changed | Why |
|-----------|--------------|-----|
| 5.4 | Recorded a full-suite timeout instead of a passing `pnpm test` run | The local Windows shell-heavy suite did not complete in a usable time window |
| Verify | Relaxed the first `doctor.test.ts` timeout to `15_000` | The implementation was correct, but grouped targeted runs exceeded the default 5-second Vitest budget |
| Finishing / archive order | Merged to `master` and removed the worktree before generating verify/archive artifacts | The user explicitly asked to merge back to mainline and clean the worktree first |

## 4. Skill / workflow compliance

| Skill | Used |
|--------------------------------------------------|------|
| superpowers:brainstorming | yes |
| superpowers:writing-plans | yes |
| superpowers:using-git-worktrees | yes |
| superpowers:subagent-driven-development | yes |
| (transitive) superpowers:test-driven-development | yes |
| (transitive) superpowers:requesting-code-review | yes |
| superpowers:finishing-a-development-branch | yes |

### Deliberately Skipped Skills

None.

## 5. Surprises

- The grouped targeted suite surfaced the `doctor` timeout issue, while isolated runs of the same file passed cleanly.
- The archive workflow in this repo is easier to finish with the OpenSpec CLI than by manually copying/moving spec files, because the CLI already knows how to sync delta specs and relocate the change folder together.
- The repository can look "clean" from Git's perspective while `.worktrees/` still contains plain leftover directories, so housekeeping sometimes needs one extra filesystem pass.

## 6. Promote candidates -> long-term learning

- [ ] 🟠 **If `pnpm test` is not a stable local gate, say so in the plan as soon as it is known** -> **Promote to memory**
  > **Why**: This cycle discovered the full-suite timeout during implementation, but the artifact close-out still had to come back and explain it later.
  > **How to apply**: As soon as a baseline or post-change full-suite run proves unreliable, record that constraint in the plan and verify artifacts, not just in chat.

- [ ] 🟡 **Close the OpenSpec artifact loop before cleanup unless the user reprioritizes integration first** -> **Promote to memory**
  > **Why**: Merging and deleting the worktree before `verify` / `retrospective` / archive added an extra pass to finish the change lifecycle.
  > **How to apply**: For schema-driven changes, treat verify, retrospective, spec sync, and archive as part of the same completion lane as code verification.

- [ ] 🟡 **Timeout-only test failures deserve root-cause triage before code changes** -> **Promote to one-off**
  > **Why**: The failing grouped run here was environmental timing pressure, not broken behavior.
  > **How to apply**: Re-run the failing test in isolation, compare grouped vs isolated timing, and only then decide between behavior fixes and test-budget adjustments.
