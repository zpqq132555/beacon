## Verification Summary

- Date: 2026-06-25
- Scope: project-level private Beacon rollout docs and regression coverage

## Commands

```bash
cmd /c npm exec -- vitest run test/ts/readme.test.ts
openspec validate define-private-supply-chain-project-rollout --type change
openspec status --change "define-private-supply-chain-project-rollout"
git diff -- README.md NEWS.md CHANGELOG.md test/ts/readme.test.ts openspec/changes/define-private-supply-chain-project-rollout
```

## Results

- `test/ts/readme.test.ts`: passed, 8 tests passed
- `openspec validate define-private-supply-chain-project-rollout --type change`: passed
- `git diff ...`: only README, NEWS, CHANGELOG, README regression tests, and this change directory are affected

## Verified Behaviors

- README now documents project-level Beacon dependency install, minimum `.beacon/config.yaml` keys, and the `init -> doctor` onboarding order
- NEWS now documents the first-phase rollout boundary and the manual `dependency upgrade -> beacon update -> beacon doctor` update/rollback path
- Regression tests lock the README and NEWS contract to prevent fallback to global-preinstall-first guidance
