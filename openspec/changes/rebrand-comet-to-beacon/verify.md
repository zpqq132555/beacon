# Verification

Date: 2026-06-22

## Automated Checks

- PASS: `pnpm build`
- PASS: `pnpm lint`
- PASS: `pnpm format:check`
- PASS: `npx.cmd vitest run test/ts/beacon-scripts.test.ts --reporter=dot`
  - 130 tests passed.
- PASS: non-shell TypeScript suite
  - Command: `npx.cmd vitest run <all test/ts/*.test.ts except beacon-scripts.test.ts> --reporter=dot`
  - 16 files passed, 225 tests passed.
- PASS: `npm.cmd run test:shell`
  - 29 Bats tests passed.
- PASS: `openspec.cmd validate rebrand-comet-to-beacon --strict`
  - Change structure and spec deltas are valid.

## Manual Checks

- PASS: `node dist/cli/index.js --help`
  - Usage is `beacon`.
  - Commands describe Beacon workflows.
- PASS: `node dist/cli/index.js status --json`
  - Returns valid JSON with no active changes in the implementation worktree.
- PASS: runtime residual search
  - Searched for old Comet runtime contracts outside this OpenSpec change.
  - No `comet` bin, `.comet.yaml`, `/comet-*`, `comet-*` scripts, or `COMET_*` runtime names remain.

## Notes

- `pnpm test` was not used as a single monolithic command because `test/ts/beacon-scripts.test.ts` takes about 33 minutes under the current Windows Git Bash sandbox. The full coverage was verified by running that slow suite explicitly and running the remaining TypeScript suites together.
- `npm install --package-lock-only --ignore-scripts` emitted an environment warning: `lint-staged@17.0.7` requires Node `>=22.22.1`; the local Node is `v22.17.0`.
