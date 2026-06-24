# Private Supply Chain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Beacon 私有版的包更新、版本检查和外部能力包安装来源由统一供应链策略控制，而不是硬编码公开 npm/GitHub 路径。

**Architecture:** 新增 `src/core/supply-chain.ts` 作为唯一策略入口，负责读取 `.beacon/config.yaml` 与环境变量、归一化默认值、构造 npm/skills 命令参数和用户提示。现有 `version`、`update`、`openspec`、`superpowers`、`codegraph`、`doctor` 只消费该模块，不再自行拼公开来源。

**Tech Stack:** TypeScript, Node.js `fs/path/process`, Vitest, Commander/Inquirer existing command layer, OpenSpec delta specs.

---

## File Structure

- Create: `src/core/supply-chain.ts` — 私有供应链策略类型、配置读取、环境变量覆盖、命令参数构造。
- Create: `test/ts/supply-chain.test.ts` — 策略默认值、项目配置、环境变量优先级和命令参数单元测试。
- Modify: `src/core/version.ts` — latest-version URL 从供应链策略读取。
- Modify: `src/commands/update.ts` — Beacon package update 参数和输出从供应链策略读取。
- Modify: `src/core/openspec.ts` — OpenSpec install package/registry/manual hint 从供应链策略读取。
- Modify: `src/core/superpowers.ts` — Superpowers skill source 从供应链策略读取。
- Modify: `src/core/codegraph.ts` — CodeGraph install package/registry/manual hint 从供应链策略读取。
- Modify: `src/commands/doctor.ts` — missing dependency remediation 使用供应链策略。
- Modify: `src/commands/i18n.ts` — optional dependency prompt 去掉公开源唯一默认暗示。
- Modify: `src/core/skills.ts` — `.beacon/config.yaml` 模板写入供应链注释和空配置样例。
- Modify: `scripts/prepublish-check.js` — 扫描当前源码/文档中的公开源默认路径和旧平台矩阵表述。
- Modify: `README.md`, `NEWS.md`, `docs/PRIVATE-FEATURE-MODULES.md` — 同步供应链相关私有化说明。
- Modify tests: `test/ts/version.test.ts`, `test/ts/update.test.ts`, `test/ts/openspec.test.ts`, `test/ts/superpowers.test.ts`, `test/ts/codegraph.test.ts`, `test/ts/doctor.test.ts`, `test/ts/readme.test.ts`.

---

### Task 1: Supply Chain Strategy Module

**Files:**
- Create: `src/core/supply-chain.ts`
- Create: `test/ts/supply-chain.test.ts`
- Modify: `src/core/skills.ts`

- [ ] **Step 1: Write failing tests for config parsing**

Add `test/ts/supply-chain.test.ts` with focused tests:

```ts
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import {
  loadSupplyChainConfig,
  buildRegistryNpmArgs,
  buildBeaconLatestMetadataUrl,
} from '../../src/core/supply-chain.js';

describe('supply chain config', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `beacon-supply-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('uses private-safe defaults without a public registry default', async () => {
    const config = await loadSupplyChainConfig(tmpDir, {});
    expect(config.beacon.packageName).toBe('beacon');
    expect(config.beacon.registry).toBeNull();
    expect(config.beacon.latestMetadataUrl).toBeNull();
    expect(config.openspec.packageSpec).toBe('@fission-ai/openspec@latest');
    expect(config.openspec.registry).toBeNull();
    expect(config.superpowers.source).toBe('obra/superpowers');
    expect(config.codegraph.packageSpec).toBe('@colbymchenry/codegraph');
  });

  it('reads project .beacon/config.yaml supply chain keys', async () => {
    await fs.mkdir(path.join(tmpDir, '.beacon'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, '.beacon', 'config.yaml'),
      [
        'supply_chain.beacon.registry: https://npm.internal.example',
        'supply_chain.beacon.latest_metadata_url: https://npm.internal.example/beacon/latest',
        'supply_chain.openspec.package: @internal/openspec@latest',
        'supply_chain.superpowers.source: internal/superpowers',
        'supply_chain.codegraph.package: @internal/codegraph',
        '',
      ].join('\n'),
    );

    const config = await loadSupplyChainConfig(tmpDir, {});
    expect(config.beacon.registry).toBe('https://npm.internal.example');
    expect(config.beacon.latestMetadataUrl).toBe('https://npm.internal.example/beacon/latest');
    expect(config.openspec.packageSpec).toBe('@internal/openspec@latest');
    expect(config.superpowers.source).toBe('internal/superpowers');
    expect(config.codegraph.packageSpec).toBe('@internal/codegraph');
  });

  it('lets environment variables override project config', async () => {
    await fs.mkdir(path.join(tmpDir, '.beacon'), { recursive: true });
    await fs.writeFile(path.join(tmpDir, '.beacon', 'config.yaml'), 'supply_chain.beacon.registry: https://file.example\n');

    const config = await loadSupplyChainConfig(tmpDir, {
      BEACON_NPM_REGISTRY: 'https://env.example',
      BEACON_SUPERPOWERS_SOURCE: 'env/superpowers',
    });

    expect(config.beacon.registry).toBe('https://env.example');
    expect(config.superpowers.source).toBe('env/superpowers');
  });

  it('builds npm args with registry only when configured', () => {
    expect(buildRegistryNpmArgs(['install', '-g', 'beacon@latest'], null)).toEqual([
      'install',
      '-g',
      'beacon@latest',
    ]);
    expect(buildRegistryNpmArgs(['install', '-g', 'beacon@latest'], 'https://npm.internal.example')).toEqual([
      'install',
      '-g',
      'beacon@latest',
      '--registry',
      'https://npm.internal.example',
    ]);
  });

  it('returns null latest metadata URL when no private metadata source is configured', async () => {
    const config = await loadSupplyChainConfig(tmpDir, {});
    expect(buildBeaconLatestMetadataUrl(config)).toBeNull();
  });
});
```

Run: `npx vitest run test/ts/supply-chain.test.ts`

Expected: FAIL because `src/core/supply-chain.ts` does not exist.

- [ ] **Step 2: Implement the strategy module**

Create `src/core/supply-chain.ts` with this API shape:

```ts
import { promises as fs } from 'fs';
import path from 'path';

export interface SupplyChainConfig {
  beacon: {
    packageName: string;
    registry: string | null;
    latestMetadataUrl: string | null;
  };
  openspec: {
    packageSpec: string;
    registry: string | null;
  };
  superpowers: {
    source: string;
  };
  codegraph: {
    packageSpec: string;
    registry: string | null;
  };
}

const DEFAULT_CONFIG: SupplyChainConfig = {
  beacon: { packageName: 'beacon', registry: null, latestMetadataUrl: null },
  openspec: { packageSpec: '@fission-ai/openspec@latest', registry: null },
  superpowers: { source: 'obra/superpowers' },
  codegraph: { packageSpec: '@colbymchenry/codegraph', registry: null },
};

function readFlatYamlValue(content: string, key: string): string | undefined {
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    if (match[1].trim() !== key) continue;
    const raw = match[2].trim();
    if (!raw || raw === 'null') return undefined;
    return raw.replace(/^['"]|['"]$/g, '');
  }
  return undefined;
}

function applyValue(config: SupplyChainConfig, key: string, value: string | undefined): void {
  if (!value) return;
  if (key === 'supply_chain.beacon.package') config.beacon.packageName = value;
  if (key === 'supply_chain.beacon.registry') config.beacon.registry = value;
  if (key === 'supply_chain.beacon.latest_metadata_url') config.beacon.latestMetadataUrl = value;
  if (key === 'supply_chain.openspec.package') config.openspec.packageSpec = value;
  if (key === 'supply_chain.openspec.registry') config.openspec.registry = value;
  if (key === 'supply_chain.superpowers.source') config.superpowers.source = value;
  if (key === 'supply_chain.codegraph.package') config.codegraph.packageSpec = value;
  if (key === 'supply_chain.codegraph.registry') config.codegraph.registry = value;
}

export async function loadSupplyChainConfig(
  projectPath: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<SupplyChainConfig> {
  const config = structuredClone(DEFAULT_CONFIG);
  const configPath = path.join(projectPath, '.beacon', 'config.yaml');

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    for (const key of [
      'supply_chain.beacon.package',
      'supply_chain.beacon.registry',
      'supply_chain.beacon.latest_metadata_url',
      'supply_chain.openspec.package',
      'supply_chain.openspec.registry',
      'supply_chain.superpowers.source',
      'supply_chain.codegraph.package',
      'supply_chain.codegraph.registry',
    ]) {
      applyValue(config, key, readFlatYamlValue(content, key));
    }
  } catch {
    // Missing config is valid; private-safe defaults apply.
  }

  if (env.BEACON_PACKAGE_NAME) config.beacon.packageName = env.BEACON_PACKAGE_NAME;
  if (env.BEACON_NPM_REGISTRY) config.beacon.registry = env.BEACON_NPM_REGISTRY;
  if (env.BEACON_LATEST_METADATA_URL) config.beacon.latestMetadataUrl = env.BEACON_LATEST_METADATA_URL;
  if (env.BEACON_OPENSPEC_PACKAGE) config.openspec.packageSpec = env.BEACON_OPENSPEC_PACKAGE;
  if (env.BEACON_OPENSPEC_REGISTRY) config.openspec.registry = env.BEACON_OPENSPEC_REGISTRY;
  if (env.BEACON_SUPERPOWERS_SOURCE) config.superpowers.source = env.BEACON_SUPERPOWERS_SOURCE;
  if (env.BEACON_CODEGRAPH_PACKAGE) config.codegraph.packageSpec = env.BEACON_CODEGRAPH_PACKAGE;
  if (env.BEACON_CODEGRAPH_REGISTRY) config.codegraph.registry = env.BEACON_CODEGRAPH_REGISTRY;

  return config;
}

export function buildRegistryNpmArgs(args: string[], registry: string | null): string[] {
  return registry ? [...args, '--registry', registry] : args;
}

export function buildBeaconLatestMetadataUrl(config: SupplyChainConfig): string | null {
  return config.beacon.latestMetadataUrl;
}
```

- [ ] **Step 3: Add config template comments**

Modify `src/core/skills.ts` in `createWorkingDirs()` so generated `.beacon/config.yaml` includes commented supply-chain examples:

```ts
'# supply_chain.beacon.registry: https://npm.internal.example',
'# supply_chain.beacon.latest_metadata_url: https://npm.internal.example/beacon/latest',
'# supply_chain.openspec.package: @internal/openspec@latest',
'# supply_chain.openspec.registry: https://npm.internal.example',
'# supply_chain.superpowers.source: internal/superpowers',
'# supply_chain.codegraph.package: @internal/codegraph',
'# supply_chain.codegraph.registry: https://npm.internal.example',
```

- [ ] **Step 4: Verify Task 1**

Run: `npx vitest run test/ts/supply-chain.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add src/core/supply-chain.ts src/core/skills.ts test/ts/supply-chain.test.ts
git commit -m "feat: add private supply chain config"
```

---

### Task 2: Beacon Update And Version Check

**Files:**
- Modify: `src/core/version.ts`
- Modify: `src/commands/update.ts`
- Modify: `test/ts/version.test.ts`
- Modify: `test/ts/update.test.ts`

- [ ] **Step 1: Update version tests first**

Modify `test/ts/version.test.ts` so `checkForUpdate` accepts a metadata URL:

```ts
const result = await checkForUpdate('https://npm.internal.example/beacon/latest');
expect(result.checked).toBe(true);
```

Add a test:

```ts
it('skips latest-version lookup when no private metadata URL is configured', async () => {
  const result = await checkForUpdate(null);
  expect(result.checked).toBe(false);
  expect(result.latestVersion).toBeNull();
});
```

Run: `npx vitest run test/ts/version.test.ts`

Expected: FAIL until `version.ts` accepts a URL/null input.

- [ ] **Step 2: Refactor version lookup**

Modify `src/core/version.ts`:

```ts
export function getLatestVersion(metadataUrl: string | null): Promise<string | null> {
  if (!metadataUrl) return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = https.get(metadataUrl, { timeout: 5000 }, (res) => {
      // Keep existing response parsing.
    });
    // Keep existing error and timeout handling.
  });
}

export async function checkForUpdate(metadataUrl: string | null): Promise<VersionCheckResult> {
  const currentVersion = getCurrentVersion();
  const latestVersion = await getLatestVersion(metadataUrl);
  // Keep existing result shaping.
}

export async function printVersionInfo(
  log: (message: string) => void,
  metadataUrl: string | null,
): Promise<VersionCheckResult> {
  const result = await checkForUpdate(metadataUrl);
  // Keep existing output shape; when unchecked, print only current version.
}
```

- [ ] **Step 3: Update init/update callers**

In `src/commands/init.ts` and `src/commands/update.ts`, load config before `printVersionInfo`:

```ts
const supplyChain = await loadSupplyChainConfig(projectPath);
await printVersionInfo(log, buildBeaconLatestMetadataUrl(supplyChain));
```

Use the same pattern for JSON and non-JSON paths; JSON mode should still avoid extra logs.

- [ ] **Step 4: Update update command tests**

Replace the current official-registry expectations in `test/ts/update.test.ts`:

```ts
expect(buildNpmUpdateArgs('global', { packageName: 'beacon', registry: null })).toEqual([
  'install',
  '-g',
  'beacon@latest',
]);
expect(buildNpmUpdateArgs('global', { packageName: 'beacon', registry: 'https://npm.internal.example' })).toEqual([
  'install',
  '-g',
  'beacon@latest',
  '--registry',
  'https://npm.internal.example',
]);
```

- [ ] **Step 5: Refactor update command args**

Change `buildNpmUpdateArgs` in `src/commands/update.ts` to accept Beacon supply chain config:

```ts
function buildNpmUpdateArgs(
  scope: InstallScope,
  beaconSource: Pick<SupplyChainConfig['beacon'], 'packageName' | 'registry'>,
): string[] {
  const packageSpec = `${beaconSource.packageName}@latest`;
  const args = scope === 'global' ? ['install', '-g', packageSpec] : ['install', packageSpec];
  return buildRegistryNpmArgs(args, beaconSource.registry);
}
```

Update `formatNpmUpdateCommand` and JSON output command strings to pass the loaded config.

- [ ] **Step 6: Verify Task 2**

Run:

```bash
npx vitest run test/ts/version.test.ts test/ts/update.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git add src/core/version.ts src/commands/init.ts src/commands/update.ts test/ts/version.test.ts test/ts/update.test.ts
git commit -m "feat: route beacon updates through private supply chain"
```

---

### Task 3: External Capability Package Sources

**Files:**
- Modify: `src/core/openspec.ts`
- Modify: `src/core/superpowers.ts`
- Modify: `src/core/codegraph.ts`
- Modify: `src/commands/init.ts`
- Modify: `src/commands/update.ts`
- Modify: `src/commands/doctor.ts`
- Modify: `test/ts/openspec.test.ts`
- Modify: `test/ts/superpowers.test.ts`
- Modify: `test/ts/codegraph.test.ts`
- Modify: `test/ts/doctor.test.ts`

- [ ] **Step 1: Add OpenSpec command tests**

In `test/ts/openspec.test.ts`, update install expectations to pass a supply-chain slice:

```ts
await installOpenSpec(projectDir, ['codex'], 'global', true, {
  packageSpec: '@internal/openspec@latest',
  registry: 'https://npm.internal.example',
});
```

Expected npm args:

```ts
['install', '-g', '@internal/openspec@latest', '--registry', 'https://npm.internal.example']
```

- [ ] **Step 2: Refactor OpenSpec install**

Modify `ensureOpenSpecCli` and `installOpenSpec` to accept `SupplyChainConfig['openspec']`:

```ts
const npmArgs =
  scope === 'global'
    ? ['install', '-g', source.packageSpec]
    : ['install', source.packageSpec];
execFileSync(getNpmExecutable(), buildRegistryNpmArgs(npmArgs, source.registry), options);
```

Update manual recovery hint to use `source.packageSpec` and append a concrete registry flag such as `--registry https://npm.internal.example` only when configured.

- [ ] **Step 3: Add Superpowers source tests**

In `test/ts/superpowers.test.ts`, update command construction:

```ts
expect(buildSuperpowersInstallCommand(projectDir, 'project', ['claude'], 'internal/superpowers')).toEqual({
  command: expect.stringContaining('npx'),
  args: ['skills', 'add', 'internal/superpowers', '-y', '--agent', 'claude-code'],
});
```

- [ ] **Step 4: Refactor Superpowers install**

Modify `buildSuperpowersInstallCommand` and `installSuperpowersForPlatforms` to accept `source = 'obra/superpowers'` from supply chain config:

```ts
const args = ['skills', 'add', source, '-y'];
```

Keep validation for retained platform ids unchanged.

- [ ] **Step 5: Add CodeGraph source tests**

In `test/ts/codegraph.test.ts`, expect configured package and registry:

```ts
await installCodegraph(projectDir, 'global', true, {
  packageSpec: '@internal/codegraph',
  registry: 'https://npm.internal.example',
});
expect(execFileSync).toHaveBeenCalledWith(
  expect.any(String),
  ['install', '-g', '@internal/codegraph', '--registry', 'https://npm.internal.example'],
  expect.any(Object),
);
```

- [ ] **Step 6: Refactor CodeGraph install**

Modify `ensureCodegraphCli` and `installCodegraph` to accept `SupplyChainConfig['codegraph']`; use `buildRegistryNpmArgs()` for npm install args and source-aware manual hint.

- [ ] **Step 7: Wire init/update/doctor**

In `src/commands/init.ts`, load supply chain once and pass slices:

```ts
const supplyChain = await loadSupplyChainConfig(projectPath);
osGlobalStatus = await installOpenSpec(projectPath, osToolIds, scope, shouldInstallOpenSpecCli, supplyChain.openspec);
spGlobalStatus = await installSuperpowersForPlatforms(projectPath, scope, spPlatformIds, true, supplyChain.superpowers.source);
const cgGlobalStatus = await installCodegraph(projectPath, scope, true, supplyChain.codegraph);
```

In `src/commands/update.ts`, use the same `supplyChain.codegraph`.

In `src/commands/doctor.ts`, build remediation messages from `loadSupplyChainConfig(targetPath)`.

- [ ] **Step 8: Verify Task 3**

Run:

```bash
npx vitest run test/ts/openspec.test.ts test/ts/superpowers.test.ts test/ts/codegraph.test.ts test/ts/doctor.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit Task 3**

Run:

```bash
git add src/core/openspec.ts src/core/superpowers.ts src/core/codegraph.ts src/commands/init.ts src/commands/update.ts src/commands/doctor.ts test/ts/openspec.test.ts test/ts/superpowers.test.ts test/ts/codegraph.test.ts test/ts/doctor.test.ts
git commit -m "feat: configure external tool supply sources"
```

---

### Task 4: Messaging, Docs, And Guardrails

**Files:**
- Modify: `src/commands/i18n.ts`
- Modify: `scripts/prepublish-check.js`
- Modify: `README.md`
- Modify: `NEWS.md`
- Modify: `docs/PRIVATE-FEATURE-MODULES.md`
- Modify: `test/ts/readme.test.ts`
- Modify or create tests for `scripts/prepublish-check.js` if existing coverage is available.

- [ ] **Step 1: Update CLI text**

Change dependency labels in `src/commands/i18n.ts` from package/source-specific defaults to source-aware wording:

```ts
npmDepOpenSpec: 'OpenSpec CLI (source from Beacon supply chain config)',
npmDepSuperpowers: 'Superpowers skills (source from Beacon supply chain config)',
npmDepCodegraph: 'CodeGraph CLI (source from Beacon supply chain config)',
```

Chinese equivalents:

```ts
npmDepOpenSpec: 'OpenSpec CLI（来源取自 Beacon 供应链配置）',
npmDepSuperpowers: 'Superpowers 技能（来源取自 Beacon 供应链配置）',
npmDepCodegraph: 'CodeGraph CLI（来源取自 Beacon 供应链配置）',
```

- [ ] **Step 2: Add prepublish scan tests or manual fixture**

If no direct test exists, add a small helper export in `scripts/prepublish-check.js`:

```js
export const PRIVATE_SUPPLY_CHAIN_FORBIDDEN_PATTERNS = [
  { pattern: /https:\/\/registry\.npmjs\.org/, name: 'public npm registry' },
  { pattern: /npm install -g beacon(?:@latest)?/, name: 'public Beacon install command' },
  { pattern: /\b29 个支持平台\b|\b29 platforms\b/, name: 'former public platform matrix' },
];
```

Ensure the scanner skips `openspec/changes/archive/` and `CHANGELOG.md` historical content, but scans current `README.md`, `NEWS.md`, `src/`, `scripts/`, `assets/`, and `test/`.

- [ ] **Step 3: Update README supply chain sections**

Replace current public install/update/manual skill install snippets with private-source guidance:

```md
私有版安装来源由团队内部包分发策略决定。配置完成后使用：

```bash
npm install -g beacon --registry https://npm.internal.example
beacon init
```

`beacon update` 会读取 Beacon 供应链配置；未配置私有版本源时只刷新已安装技能资产，不会静默把公开 npm registry 当作默认私有来源。
```

Remove current supply-chain-conflicting snippets:

- `npm install -g beacon`
- `npm install -g beacon@latest`
- `npx skills add rpamis/beacon`

- [ ] **Step 4: Update NEWS current release notes**

Remove or reframe current non-archived claims that conflict with four-platform private scope:

- “新增 Kimi Code 为第 29 个支持平台”
- “覆盖 29 个平台”
- “自动检测 7 个支持平台”
- “强制走官方源”

Keep historical changelog entries in `CHANGELOG.md` untouched unless tests require current docs to avoid them.

- [ ] **Step 5: Update module inventory**

In `docs/PRIVATE-FEATURE-MODULES.md`, after implementation, update affected statuses:

- M02-F04 `beacon update` → 已定制
- M16-F01/M16-F02/M16-F04/M16-F06/M16-F07 → 已定制 or 部分定制 according to final scope
- M18-F03 NEWS → 已定制 if conflicting current notes are cleaned
- M20-F05 Prepublish 检查 → 已定制
- M22-F06 发布前敏感检查 → 已定制

- [ ] **Step 6: Verify Task 4**

Run:

```bash
npx vitest run test/ts/readme.test.ts
node scripts/prepublish-check.js
```

Expected: PASS. If prepublish intentionally flags archived OpenSpec history, narrow the scan skip rules to archive paths only.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add src/commands/i18n.ts scripts/prepublish-check.js README.md NEWS.md docs/PRIVATE-FEATURE-MODULES.md test/ts/readme.test.ts
git commit -m "docs: align supply chain messaging with private distribution"
```

---

### Task 5: Final Verification And Changelog

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `package.json` only if version bump is required by project changelog rules.

- [ ] **Step 1: Validate OpenSpec change**

Run:

```bash
cmd /c openspec validate --change "privatize-package-update-supply-chain"
```

Expected: validation passes.

- [ ] **Step 2: Run targeted tests**

Run:

```bash
npx vitest run test/ts/supply-chain.test.ts test/ts/version.test.ts test/ts/update.test.ts test/ts/openspec.test.ts test/ts/superpowers.test.ts test/ts/codegraph.test.ts test/ts/doctor.test.ts test/ts/readme.test.ts
```

Expected: all targeted suites pass.

- [ ] **Step 3: Run project quality checks**

Run:

```bash
pnpm format:check
pnpm lint
pnpm build
```

Expected: all checks pass.

- [ ] **Step 4: Decide full test run**

If targeted tests and build pass, run:

```bash
pnpm test
```

Expected: full test suite passes. If runtime constraints prevent full test completion, record the targeted suites and reason in `verify.md` during verify phase.

- [ ] **Step 5: Update changelog**

Check current master/package version before editing. If no newer unreleased section exists, bump from `0.4.3` to the next patch version and add top entry:

```md
## What's Changed [0.4.4] - 2026-06-23

### Changed

- **私有供应链策略**: 将 Beacon 更新、版本检查和外部能力包安装来源改为由私有供应链配置驱动，避免私有版默认访问公开 npm/GitHub 来源。

### Tests

- **供应链私有化覆盖**: 新增和更新版本检查、update、OpenSpec、Superpowers、CodeGraph、doctor、README 与发布前检查测试，固定私有来源命令构造和文档护栏。
```

- [ ] **Step 6: Commit final verification metadata**

Run:

```bash
git add CHANGELOG.md package.json package-lock.json pnpm-lock.yaml openspec/changes/privatize-package-update-supply-chain
git commit -m "chore: document private supply chain change"
```

Only include lockfiles if the implementation actually changes package metadata.

---

## Self-Review

- Spec coverage: Tasks 1-4 cover all `private-supply-chain` requirements: configuration, Beacon package updates, external capability packages, user messaging, and regression guardrails.
- Placeholder scan: The plan uses concrete file paths, command names, env/config keys, test names, and expected outcomes.
- Type consistency: `SupplyChainConfig`, `loadSupplyChainConfig`, `buildRegistryNpmArgs`, and `buildBeaconLatestMetadataUrl` are introduced in Task 1 and reused consistently in later tasks.
