## ADDED Requirements

### Requirement: Beacon CLI Identity
Beacon SHALL expose `beacon` as the only command-line entry point for the private fork runtime contract.

#### Scenario: Help output uses Beacon identity
- **WHEN** a user runs the built CLI help command
- **THEN** the command name, description, command summaries, and actionable examples MUST use `beacon` terminology and MUST NOT instruct the user to run `comet`

#### Scenario: Package bin excludes Comet
- **WHEN** package metadata is inspected
- **THEN** the package MUST expose a `beacon` bin and MUST NOT expose a `comet` bin

### Requirement: Beacon Installed Assets
Beacon SHALL install skills, references, rules, hooks, and scripts using Beacon names and paths.

#### Scenario: Manifest references Beacon assets
- **WHEN** the installer reads `assets/manifest.json`
- **THEN** every skill, rule, hook, and script path in the manifest MUST point to Beacon-named assets

#### Scenario: Installed skill commands use Beacon prefix
- **WHEN** Beacon skills are copied into a target platform
- **THEN** the installed skill entry points MUST be `/beacon`, `/beacon-open`, `/beacon-design`, `/beacon-build`, `/beacon-verify`, `/beacon-archive`, `/beacon-hotfix`, and `/beacon-tweak`

#### Scenario: Script paths use Beacon prefix
- **WHEN** installed workflow scripts are referenced by skills, rules, hooks, or other scripts
- **THEN** those references MUST use `beacon/scripts/beacon-*.sh` paths and MUST NOT depend on `comet/scripts/comet-*.sh`

### Requirement: Beacon Workflow State
Beacon SHALL use `.beacon.yaml` as the only workflow state file for active changes.

#### Scenario: Status reads Beacon state
- **WHEN** `beacon status` scans active OpenSpec changes
- **THEN** it MUST read `.beacon.yaml` files and MUST ignore `.comet.yaml` files

#### Scenario: Next command uses Beacon skills
- **WHEN** `beacon status` reports a next phase command
- **THEN** the command MUST use `/beacon-open`, `/beacon-design`, `/beacon-build`, `/beacon-verify`, or `/beacon-archive`

#### Scenario: State scripts write Beacon state
- **WHEN** workflow scripts initialize, mutate, validate, or archive workflow state
- **THEN** they MUST read and write `.beacon.yaml` only

### Requirement: No Comet Compatibility Contract
Beacon SHALL NOT provide runtime compatibility for old Comet command, skill, script, or state contracts.

#### Scenario: Comet CLI alias is absent
- **WHEN** the package is installed from this change
- **THEN** users MUST NOT receive a supported `comet` CLI alias

#### Scenario: Comet state is not migrated
- **WHEN** an existing change contains only `.comet.yaml`
- **THEN** Beacon commands MUST NOT treat it as an active Beacon workflow state file

#### Scenario: Comet skill aliases are absent
- **WHEN** Beacon skills are installed
- **THEN** `/comet-*` aliases MUST NOT be installed as supported Beacon entry points

### Requirement: Beacon Documentation and Tests
Beacon SHALL document and verify Beacon runtime behavior while allowing Comet only as source-history context.

#### Scenario: Operational documentation uses Beacon
- **WHEN** user-facing setup, usage, troubleshooting, or command examples are read
- **THEN** they MUST use Beacon commands and MUST NOT instruct users to run Comet commands

#### Scenario: Tests assert Beacon contracts
- **WHEN** automated tests validate CLI output, manifest paths, installed skills, scripts, hooks, or workflow state
- **THEN** they MUST assert Beacon contracts instead of Comet contracts

#### Scenario: Historical Comet mentions are allowed
- **WHEN** changelog, provenance, license, or source attribution text mentions Comet
- **THEN** the mention MAY remain only if it is not an operational instruction or supported runtime contract
