## ADDED Requirements

### Requirement: Project-Level Beacon Rollout
Beacon private distribution MUST support project-level Beacon dependency rollout as the primary team onboarding path.

#### Scenario: Installing Beacon as a project dependency
- **WHEN** a team onboards Beacon into a project under private distribution
- **THEN** the supported default path MUST allow Beacon to be installed as a project-level dependency instead of assuming a developer-global install

#### Scenario: Providing minimum Beacon source configuration
- **WHEN** a project configures Beacon for first-phase private rollout
- **THEN** the documented minimum private configuration MUST include the Beacon package name, Beacon registry policy, and Beacon latest-version metadata source

#### Scenario: Initializing a project-scoped Beacon install
- **WHEN** the project uses the recommended onboarding flow
- **THEN** the flow MUST initialize Beacon through `beacon init --scope project` and define `beacon doctor` as the follow-up validation step

#### Scenario: External tools are not a first-phase blocker
- **WHEN** Beacon itself is privately distributed but OpenSpec, Superpowers, or CodeGraph have not yet been fully privatized for that project
- **THEN** the project-level Beacon rollout MUST remain valid as long as those external dependencies are treated as optional setup or administrator-preinstalled tooling

---

### Requirement: Manual Project Upgrade Workflow
Beacon private distribution MUST define a manual project upgrade workflow that keeps the npm package version and installed Beacon assets in sync.

#### Scenario: Upgrading Beacon in a project
- **WHEN** a project chooses to adopt a newer Beacon version
- **THEN** the documented workflow MUST require both updating the project dependency version and running `beacon update`, followed by `beacon doctor`

#### Scenario: Refreshing only existing installation targets
- **WHEN** `beacon update` runs inside a project
- **THEN** the contract MUST describe it as refreshing already installed Beacon targets rather than creating first-time platform installs

#### Scenario: New targets still use init
- **WHEN** a team wants to add a new platform target or change the installation scope for Beacon
- **THEN** the contract MUST direct the team to `beacon init` instead of treating `beacon update` as a general installation entry point

---

### Requirement: Symmetric Project Rollback Workflow
Beacon private distribution MUST define a rollback workflow that mirrors the project upgrade process.

#### Scenario: Rolling back a Beacon version
- **WHEN** a project needs to return to a previous Beacon version
- **THEN** the rollback workflow MUST require restoring the earlier project dependency version and rerunning `beacon update`, followed by `beacon doctor`

#### Scenario: Restoring copied Beacon assets
- **WHEN** a project rollback is performed
- **THEN** the rollback contract MUST treat Beacon skills, rules, and hooks copied into platform directories as versioned assets that need to be refreshed alongside the npm package
