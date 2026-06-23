## ADDED Requirements

### Requirement: Private Platform Scope
Beacon private distribution MUST expose Codex, Cursor, Claude Code, and Trae as the first-batch supported AI coding platforms.

#### Scenario: Listing supported private platforms
- **WHEN** platform definitions are used by CLI installation, diagnostics, documentation, or tests
- **THEN** the user-visible supported platform set MUST be Codex, Cursor, Claude Code, and Trae

#### Scenario: Excluding unsupported public platforms
- **WHEN** a platform outside Codex, Cursor, Claude Code, and Trae is present in the former public platform matrix
- **THEN** Beacon private distribution MUST NOT present it as a first-batch supported platform

### Requirement: Platform Capability Preservation
Beacon private distribution MUST preserve each retained platform's existing skill directory, global directory, OpenSpec tool id, rules support, and hook support boundaries.

#### Scenario: Retained platform metadata remains available
- **WHEN** install, update, doctor, uninstall, OpenSpec setup, or Superpowers setup reads retained platform metadata
- **THEN** the required metadata for Codex, Cursor, Claude Code, and Trae MUST be available

#### Scenario: Trae does not gain hook support in this change
- **WHEN** Beacon determines hook installation support for Trae
- **THEN** Trae MUST remain rules-capable and hook-unsupported unless a later change explicitly adds hook support

### Requirement: Command Surface Alignment
Beacon private CLI commands MUST align their platform selection, detection, diagnostics, update, and uninstall behavior with the private platform scope.

#### Scenario: Initializing Beacon for private platforms
- **WHEN** `beacon init` selects or detects install targets
- **THEN** it MUST operate within Codex, Cursor, Claude Code, and Trae as the first-batch supported platform set

#### Scenario: Diagnosing Beacon installation
- **WHEN** `beacon doctor` reports platform skill completeness
- **THEN** it MUST report only the first-batch supported platform set unless future changes add another platform

### Requirement: Documentation and Test Alignment
Beacon private distribution MUST keep documentation and automated tests aligned with the private platform scope.

#### Scenario: Reading platform documentation
- **WHEN** a user reads README or related platform documentation
- **THEN** the documented first-batch supported platforms MUST match Codex, Cursor, Claude Code, and Trae

#### Scenario: Running platform regression tests
- **WHEN** platform-related tests run
- **THEN** assertions about platform count, platform ids, OpenSpec tool ids, Superpowers mappings, and installation targets MUST match the first-batch supported platform set
