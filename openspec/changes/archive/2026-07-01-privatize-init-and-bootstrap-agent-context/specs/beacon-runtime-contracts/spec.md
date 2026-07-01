## MODIFIED Requirements

### Requirement: Beacon CLI Identity
Beacon SHALL expose `beacon` as the only command-line entry point for the private fork runtime contract.

#### Scenario: Help output uses Beacon identity
- **WHEN** a user runs the built CLI help command
- **THEN** the command name, description, command summaries, and actionable examples MUST use `beacon` terminology and MUST NOT instruct the user to run `comet`

#### Scenario: Package bin excludes Comet
- **WHEN** package metadata is inspected
- **THEN** the package MUST expose a `beacon` bin and MUST NOT expose a `comet` bin

#### Scenario: Init banner uses Beacon-only branding
- **WHEN** a user runs `beacon init`
- **THEN** the banner and other user-visible branding output MUST use Beacon private distribution identity and MUST NOT show old Comet-era branding remnants
