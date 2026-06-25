# private-supply-chain Specification

## Purpose

Define Beacon's private supply chain contract so package updates, version checks, external dependency setup, user-facing messaging, and regression guardrails all avoid assuming public sources as the private default.
## Requirements
### Requirement: Private Supply Chain Configuration
Beacon 私有版 MUST 提供统一的供应链策略，用于描述 Beacon 包更新、版本检查、OpenSpec CLI、Superpowers skills 和 CodeGraph CLI 的来源。

#### Scenario: Reading project supply chain configuration
- **WHEN** Beacon 命令需要构造包更新、版本检查或外部能力包安装来源
- **THEN** it MUST read the applicable private supply chain settings before falling back to any built-in behavior

#### Scenario: Environment overrides project configuration
- **WHEN** project configuration and supported environment variables both define the same supply chain source
- **THEN** the environment variable value MUST take precedence for that command invocation

#### Scenario: Missing private source is visible
- **WHEN** a required package or tool source is not configured for private distribution
- **THEN** Beacon MUST report the missing source explicitly instead of silently treating the public registry as the private default

### Requirement: Beacon Package Update Source
Beacon package update and version check behavior MUST use the configured private Beacon package source.

#### Scenario: Checking the latest Beacon version
- **WHEN** `beacon init` or `beacon update` displays version information
- **THEN** the latest-version lookup MUST use the configured private package metadata source or skip the check with a clear non-fatal result

#### Scenario: Updating the Beacon package
- **WHEN** `beacon update` updates the Beacon npm package
- **THEN** the npm command MUST be built from the configured private package name and registry policy

#### Scenario: Public npm registry is not hardcoded
- **WHEN** tests inspect Beacon update and version-check command construction
- **THEN** they MUST NOT require `https://registry.npmjs.org` as the built-in default for private distribution

### Requirement: External Capability Package Sources
Beacon private distribution MUST build OpenSpec, Superpowers, and CodeGraph setup commands from the configured supply chain strategy.

#### Scenario: Installing OpenSpec CLI
- **WHEN** `beacon init` installs or upgrades OpenSpec CLI
- **THEN** the package name, version selector, registry policy, and manual recovery hint MUST come from the private supply chain strategy

#### Scenario: Installing Superpowers skills
- **WHEN** `beacon init` installs or refreshes Superpowers skills
- **THEN** the skill source and agent mapping command MUST come from the private supply chain strategy while preserving the retained platform mappings

#### Scenario: Installing CodeGraph CLI
- **WHEN** Beacon offers CodeGraph setup
- **THEN** the package source and manual recovery hint MUST come from the private supply chain strategy or the setup MUST be skipped with an explicit reason

#### Scenario: Existing installations are preferred
- **WHEN** the required external tool or skill is already installed for the selected private platforms
- **THEN** Beacon MUST allow setup to proceed without re-fetching that dependency from a network source

### Requirement: User-Facing Supply Chain Messaging
Beacon private distribution MUST keep CLI and documentation messaging aligned with the configured private supply chain behavior.

#### Scenario: Initializing Beacon
- **WHEN** `beacon init` prompts for optional dependency installation
- **THEN** the prompt labels MUST describe private-source behavior and MUST NOT imply that public npm or GitHub sources are the only supported route

#### Scenario: Diagnosing missing dependencies
- **WHEN** `beacon doctor` reports a missing OpenSpec or CodeGraph dependency
- **THEN** the remediation message MUST reference the configured private source or explain that no private source is configured

#### Scenario: Reading supply chain documentation
- **WHEN** a user reads README or release notes about installation, update, or optional dependency setup
- **THEN** the documented default behavior MUST match the private supply chain strategy

### Requirement: Supply Chain Regression Guardrails
Beacon private distribution MUST include automated guardrails that prevent public distribution assumptions from returning unnoticed.

#### Scenario: Testing command construction
- **WHEN** unit tests cover update, version check, OpenSpec, Superpowers, CodeGraph, doctor, and README behavior
- **THEN** they MUST assert private-source command construction and messaging for the supported supply chain modes

#### Scenario: Scanning publishable files
- **WHEN** the prepublish check scans publishable text files
- **THEN** it MUST fail on hardcoded public registry defaults, public Beacon install commands, or former public platform-matrix claims when those strings are not explicitly marked as historical archive content

#### Scenario: Preserving archived history
- **WHEN** archived OpenSpec change artifacts contain old public-source or old platform-matrix text as historical evidence
- **THEN** supply chain guardrails MUST allow those archived artifacts while still checking current source, docs, scripts, and tests that define private behavior
