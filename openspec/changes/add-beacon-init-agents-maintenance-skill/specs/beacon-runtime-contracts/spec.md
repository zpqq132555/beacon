## MODIFIED Requirements

### Requirement: Beacon Installed Assets
Beacon SHALL install skills, references, rules, hooks, and scripts using Beacon names and paths.

#### Scenario: Manifest references Beacon assets
- **WHEN** the installer reads `assets/manifest.json`
- **THEN** every skill, rule, hook, and script path in the manifest MUST point to Beacon-named assets

#### Scenario: Installed skill commands use Beacon prefix
- **WHEN** Beacon skills are copied into a target platform
- **THEN** the installed skill entry points MUST be `/beacon`, `/beacon-init`, `/beacon-open`, `/beacon-design`, `/beacon-build`, `/beacon-verify`, `/beacon-archive`, `/beacon-hotfix`, and `/beacon-tweak`

#### Scenario: Script paths use Beacon prefix
- **WHEN** installed workflow scripts are referenced by skills, rules, hooks, or other scripts
- **THEN** those references MUST use `beacon/scripts/beacon-*.sh` paths and MUST NOT depend on `comet/scripts/comet-*.sh`
