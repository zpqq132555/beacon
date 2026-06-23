# Beacon Runtime Contracts Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 将 Comet fork 的外部运行合同完整切换为 Beacon，且不保留旧 Comet 兼容入口。

**Architecture:** 先用测试锁定 Beacon 对外合同，再按 CLI、assets/manifest、workflow state、命令行为、文档的依赖顺序修改。外部合同必须一次切干净；内部 TypeScript 命名只在低风险时同步清理。

**Tech Stack:** Node.js 20+、TypeScript、Commander、Vitest、PowerShell、Bash/Git Bash、OpenSpec superpowers-bridge。

---

## File Map

- Modify: `package.json` — package name、description、keywords、bin、scripts 中的 Beacon 身份。
- Modify: `package-lock.json` — npm lock 元数据同步。
- Modify: `pnpm-lock.yaml` — pnpm lock 元数据同步。
- Modify: `src/cli/index.ts` — Commander name、description、命令说明。
- Modify: `src/commands/i18n.ts` — CLI 文案、修复建议、get started 命令。
- Modify: `src/commands/init.ts` — banner、语言配置、安装结果字段。
- Modify: `src/commands/status.ts` — `.beacon.yaml` 状态读取和 `/beacon-*` next command。
- Modify: `src/commands/doctor.ts` — Beacon 诊断名称、修复建议、状态文件校验。
- Modify: `src/commands/update.ts` — Beacon update 文案和安装产物定位。
- Modify: `src/commands/uninstall.ts`、`src/core/uninstall.ts` — Beacon uninstall 文案和产物删除。
- Modify: `src/core/skills.ts` — manifest 复制、rules/hooks/scripts 路径、OpenCode/Pi 生成内容。
- Rename/Modify: `assets/skills*/comet*` → `assets/skills*/beacon*` — skill entrypoints。
- Rename/Modify: `assets/skills/comet/scripts/comet-*.sh` → `assets/skills/beacon/scripts/beacon-*.sh` — workflow scripts。
- Modify: `assets/manifest.json` — Beacon assets 权威列表。
- Modify: `test/ts/*.test.ts`、`test/shell/*.bats` — Beacon 合同测试。
- Modify: `README.md`、`README-zh.md`、`NEWS.md`、`CHANGELOG.md` — 运行说明改为 Beacon，历史来源可保留 Comet。

---

## Task 1: Package 与 CLI 身份

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `pnpm-lock.yaml`
- Modify: `src/cli/index.ts`
- Modify: `test/ts/init-e2e.test.ts`
- Modify: `test/ts/readme.test.ts`

- [ ] **Step 1: 写失败测试，锁定 CLI help 使用 Beacon**

在 `test/ts/init-e2e.test.ts` 或现有 CLI e2e 测试文件中增加断言。若没有直接执行 help 的工具函数，使用 `execFileSync` 运行构建后的入口或源码约定入口。

```ts
import { execFileSync } from 'child_process';

it('prints Beacon as the CLI identity', () => {
  const output = execFileSync('node', ['dist/cli/index.js', '--help'], {
    encoding: 'utf-8',
  });

  expect(output).toContain('Usage: beacon');
  expect(output).toContain('beacon init');
  expect(output).not.toContain('Usage: comet');
});
```

- [ ] **Step 2: 运行失败测试确认当前仍是 Comet**

Run: `pnpm build && npx vitest run test/ts/init-e2e.test.ts`

Expected: 测试失败，输出中仍包含 `Usage: comet` 或 Comet 描述。

- [ ] **Step 3: 修改 package metadata**

将 `package.json` 关键字段改为：

```json
{
  "name": "beacon",
  "description": "Private Beacon workflow automation based on Comet",
  "keywords": ["beacon", "openspec", "superpowers", "skills", "workflow"],
  "bin": {
    "beacon": "./bin/comet.js"
  }
}
```

如果本轮同时重命名 `bin/comet.js`，则 bin path 改为 `./bin/beacon.js`，并同步 `build.js` 输出路径；否则保留内部文件名，确保外部 bin 只有 `beacon`。

- [ ] **Step 4: 修改 CLI program 身份**

在 `src/cli/index.ts` 中将：

```ts
program
  .name('comet')
  .description('Agent Skill Harness Phase-Guarded Automation From Idea To Archive')
```

改为：

```ts
program
  .name('beacon')
  .description('Private Beacon workflow automation based on Comet')
```

并将命令描述中的 `Comet` 改为 `Beacon`，例如：

```ts
.description('Initialize Beacon workflow in your project')
.description('Diagnose Beacon installation health')
.description('Update Beacon skill files to latest version')
.description('Remove Beacon skills, rules, and hooks from your project or global scope')
```

- [ ] **Step 5: 同步 lockfile**

Run: `pnpm install --lockfile-only`

Expected: `package-lock.json` 和 `pnpm-lock.yaml` 中根 package 元数据同步为 `beacon`。

- [ ] **Step 6: 验证并提交**

Run: `pnpm build && npx vitest run test/ts/init-e2e.test.ts`

Expected: PASS，help 输出包含 `beacon` 且不包含 `Usage: comet`。

Commit:

```bash
git add package.json package-lock.json pnpm-lock.yaml src/cli/index.ts test/ts/init-e2e.test.ts
git commit -m "feat: rename cli identity to beacon"
```

---

## Task 2: Assets、skills、scripts 与 manifest

**Files:**
- Modify: `assets/manifest.json`
- Rename/Modify: `assets/skills/comet*`
- Rename/Modify: `assets/skills-zh/comet*`
- Modify: `src/core/skills.ts`
- Modify: `test/ts/skills.test.ts`
- Modify: `test/ts/init.test.ts`
- Modify: `test/ts/init-e2e.test.ts`

- [ ] **Step 1: 写失败测试，manifest 只允许 Beacon 路径**

在 `test/ts/skills.test.ts` 增加：

```ts
import manifest from '../../assets/manifest.json' assert { type: 'json' };

it('manifest references Beacon assets only', () => {
  const serialized = JSON.stringify(manifest);

  expect(serialized).toContain('beacon');
  expect(serialized).not.toMatch(/comet(?:-|\/scripts\/|\/SKILL\.md)/);
  expect(manifest.skills).toContain('beacon/SKILL.md');
  expect(manifest.skills).toContain('beacon-open/SKILL.md');
});
```

如果 JSON import 与当前 tsconfig 不兼容，改用 `fs.readFile` 读取 `assets/manifest.json`。

- [ ] **Step 2: 运行失败测试**

Run: `npx vitest run test/ts/skills.test.ts`

Expected: FAIL，manifest 仍引用 `comet` 路径。

- [ ] **Step 3: 重命名 assets 目录**

使用 `git mv` 保留历史：

```bash
git mv assets/skills/comet assets/skills/beacon
git mv assets/skills/comet-open assets/skills/beacon-open
git mv assets/skills/comet-design assets/skills/beacon-design
git mv assets/skills/comet-build assets/skills/beacon-build
git mv assets/skills/comet-verify assets/skills/beacon-verify
git mv assets/skills/comet-archive assets/skills/beacon-archive
git mv assets/skills/comet-hotfix assets/skills/beacon-hotfix
git mv assets/skills/comet-tweak assets/skills/beacon-tweak
git mv assets/skills-zh/comet assets/skills-zh/beacon
git mv assets/skills-zh/comet-open assets/skills-zh/beacon-open
git mv assets/skills-zh/comet-design assets/skills-zh/beacon-design
git mv assets/skills-zh/comet-build assets/skills-zh/beacon-build
git mv assets/skills-zh/comet-verify assets/skills-zh/beacon-verify
git mv assets/skills-zh/comet-archive assets/skills-zh/beacon-archive
git mv assets/skills-zh/comet-hotfix assets/skills-zh/beacon-hotfix
git mv assets/skills-zh/comet-tweak assets/skills-zh/beacon-tweak
```

- [ ] **Step 4: 重命名 scripts 和 rules**

```bash
git mv assets/skills/beacon/scripts/comet-env.sh assets/skills/beacon/scripts/beacon-env.sh
git mv assets/skills/beacon/scripts/comet-archive.sh assets/skills/beacon/scripts/beacon-archive.sh
git mv assets/skills/beacon/scripts/comet-guard.sh assets/skills/beacon/scripts/beacon-guard.sh
git mv assets/skills/beacon/scripts/comet-handoff.sh assets/skills/beacon/scripts/beacon-handoff.sh
git mv assets/skills/beacon/scripts/comet-state.sh assets/skills/beacon/scripts/beacon-state.sh
git mv assets/skills/beacon/scripts/comet-yaml-validate.sh assets/skills/beacon/scripts/beacon-yaml-validate.sh
git mv assets/skills/beacon/scripts/comet-hook-guard.sh assets/skills/beacon/scripts/beacon-hook-guard.sh
git mv assets/skills/beacon/rules/comet-phase-guard.md assets/skills/beacon/rules/beacon-phase-guard.md
git mv assets/skills/beacon/rules/comet-phase-guard.en.md assets/skills/beacon/rules/beacon-phase-guard.en.md
```

- [ ] **Step 5: 更新 manifest**

将 `assets/manifest.json` 改成 Beacon 路径，例如：

```json
{
  "version": "0.3.9",
  "skills": [
    "beacon/SKILL.md",
    "beacon/reference/auto-transition.md",
    "beacon/reference/comet-yaml-fields.md",
    "beacon/reference/context-recovery.md",
    "beacon/reference/debug-gate.md",
    "beacon/reference/decision-point.md",
    "beacon/reference/dirty-worktree.md",
    "beacon/reference/file-structure.md",
    "beacon/reference/subagent-dispatch.md",
    "beacon/scripts/beacon-env.sh",
    "beacon/scripts/beacon-guard.sh",
    "beacon/scripts/beacon-state.sh",
    "beacon/scripts/beacon-handoff.sh",
    "beacon/scripts/beacon-archive.sh",
    "beacon/scripts/beacon-yaml-validate.sh",
    "beacon/scripts/beacon-hook-guard.sh",
    "beacon-open/SKILL.md",
    "beacon-design/SKILL.md",
    "beacon-build/SKILL.md",
    "beacon-verify/SKILL.md",
    "beacon-archive/SKILL.md",
    "beacon-hotfix/SKILL.md",
    "beacon-tweak/SKILL.md"
  ],
  "rules": ["beacon/rules/beacon-phase-guard.md"],
  "hooks": {
    "beacon/scripts/beacon-hook-guard.sh": {
      "matcher": "Write|Edit",
      "description": "Block code writes in wrong Beacon phase (open/design/archive)"
    }
  }
}
```

- [ ] **Step 6: 更新 `src/core/skills.ts` 中生成内容**

将用户可见文本从 Comet 改为 Beacon：

```ts
const OPENCODE_COMMAND_HEADER = `---
description: Run the {skillName} Beacon workflow
---
`;

const PI_COMMAND_EXTENSION_FILE = 'beacon-commands.ts';
```

将 `registerCometCommands` 改为 `registerBeaconCommands`：

```ts
export default function registerBeaconCommands(pi: ExtensionAPI) {
  for (const name of commands) {
    pi.registerCommand(name, {
      description: `Beacon: /${name}`,
      handler: async (args) => {
        pi.sendUserMessage(args ? `/skill:${name} ${args}` : `/skill:${name}`);
      },
    });
  }
}
```

- [ ] **Step 7: 验证并提交**

Run: `npx vitest run test/ts/skills.test.ts test/ts/init.test.ts test/ts/init-e2e.test.ts`

Expected: PASS，安装复制测试看到 Beacon paths。

Commit:

```bash
git add assets src/core/skills.ts test/ts/skills.test.ts test/ts/init.test.ts test/ts/init-e2e.test.ts
git commit -m "feat: rename installed assets to beacon"
```

---

## Task 3: Workflow 状态与 shell scripts

**Files:**
- Modify: `assets/skills/beacon/scripts/beacon-*.sh`
- Modify: `assets/skills/beacon/SKILL.md`
- Modify: `assets/skills-zh/beacon/SKILL.md`
- Modify: `test/ts/comet-scripts.test.ts`
- Rename/Modify: `test/shell/comet-state.bats`

- [ ] **Step 1: 写失败测试，状态文件必须是 `.beacon.yaml`**

在 `test/ts/comet-scripts.test.ts` 中将 `scriptsDir` 改为 Beacon，并新增或修改初始化测试：

```ts
const scriptsDir = path.resolve('assets', 'skills', 'beacon', 'scripts');

it('initializes a new change directory with .beacon.yaml', async () => {
  const result = runBash(tmpDir, stateScript, ['init', 'new-full-change', 'full']);
  const yamlPath = path.join(tmpDir, 'openspec', 'changes', 'new-full-change', '.beacon.yaml');
  const yaml = await fs.readFile(yamlPath, 'utf-8');

  expect(result.status).toBe(0);
  expect(yaml).toContain('workflow: full');
  expect(yaml).toContain('phase: open');
  await expect(
    fs.access(path.join(tmpDir, 'openspec', 'changes', 'new-full-change', '.comet.yaml')),
  ).rejects.toThrow();
});
```

- [ ] **Step 2: 运行失败测试**

Run: `npx vitest run test/ts/comet-scripts.test.ts`

Expected: FAIL，脚本仍写 `.comet.yaml` 或测试仍找 `comet` scripts。

- [ ] **Step 3: 修改脚本变量和内部调用**

在 `assets/skills/beacon/scripts/beacon-state.sh` 中将状态路径常量统一为：

```bash
STATE_FILE=".beacon.yaml"
```

在 `beacon-guard.sh`、`beacon-handoff.sh`、`beacon-archive.sh`、`beacon-hook-guard.sh` 中将内部调用改为同目录 Beacon 脚本：

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_SCRIPT="$SCRIPT_DIR/beacon-state.sh"
GUARD_SCRIPT="$SCRIPT_DIR/beacon-guard.sh"
YAML_VALIDATE_SCRIPT="$SCRIPT_DIR/beacon-yaml-validate.sh"
```

按实际脚本已有变量名替换，保持原逻辑不变。

- [ ] **Step 4: 更新 shell 测试复制列表**

在 `test/ts/comet-scripts.test.ts` 的 `beforeEach` 复制列表中使用：

```ts
for (const name of [
  'beacon-env.sh',
  'beacon-archive.sh',
  'beacon-guard.sh',
  'beacon-handoff.sh',
  'beacon-state.sh',
  'beacon-yaml-validate.sh',
  'beacon-hook-guard.sh',
]) {
  const content = await fs.readFile(path.join(scriptsDir, name), 'utf-8');
  const destination = path.join(tmpScriptsDir, name);
  await fs.writeFile(destination, content.replace(/\r\n/g, '\n'));
  await fs.chmod(destination, 0o755);
}
```

并将变量改为：

```ts
guardScript = path.join(tmpScriptsDir, 'beacon-guard.sh');
stateScript = path.join(tmpScriptsDir, 'beacon-state.sh');
hookGuardScript = path.join(tmpScriptsDir, 'beacon-hook-guard.sh');
```

- [ ] **Step 5: 更新 bats 测试文件名和内容**

```bash
git mv test/shell/comet-state.bats test/shell/beacon-state.bats
```

将其中脚本路径、临时目录名、状态文件名改为 Beacon。保留测试意图不变。

- [ ] **Step 6: 验证并提交**

Run: `npx vitest run test/ts/comet-scripts.test.ts`

Run: `pnpm test:shell`

Expected: PASS，所有脚本测试使用 Beacon paths 和 `.beacon.yaml`。

Commit:

```bash
git add assets/skills/beacon test/ts/comet-scripts.test.ts test/shell
git commit -m "feat: switch workflow state to beacon"
```

---

## Task 4: Commands 行为

**Files:**
- Modify: `src/commands/status.ts`
- Modify: `src/commands/doctor.ts`
- Modify: `src/commands/init.ts`
- Modify: `src/commands/update.ts`
- Modify: `src/commands/uninstall.ts`
- Modify: `src/core/uninstall.ts`
- Modify: `test/ts/status.test.ts`
- Modify: `test/ts/doctor.test.ts`
- Modify: `test/ts/update.test.ts`
- Modify: `test/ts/uninstall.test.ts`

- [ ] **Step 1: 写失败测试，status 忽略 `.comet.yaml`**

在 `test/ts/status.test.ts` 增加：

```ts
it('ignores .comet.yaml and reports only .beacon.yaml changes', async () => {
  await writeFile(
    path.join(tmpDir, 'openspec', 'changes', 'old-comet', '.comet.yaml'),
    'workflow: full\nphase: build\narchived: false\n',
  );
  await writeFile(
    path.join(tmpDir, 'openspec', 'changes', 'new-beacon', '.beacon.yaml'),
    'workflow: full\nphase: build\narchived: false\n',
  );
  await writeFile(path.join(tmpDir, 'openspec', 'changes', 'new-beacon', 'tasks.md'), '- [ ] task\n');

  const output = await captureStatus(tmpDir, { json: true });
  const parsed = JSON.parse(output);

  expect(parsed.changes).toHaveLength(1);
  expect(parsed.changes[0].name).toBe('new-beacon');
  expect(parsed.changes[0].nextCommand).toBe('/beacon-build');
});
```

如果测试文件已有不同 helper，使用已有 helper 名称，不新增并行捕获工具。

- [ ] **Step 2: 修改 `status.ts`**

将状态文件名和 next command 改为：

```ts
function getNextCommand(phase: string): string | null {
  switch (phase) {
    case 'open':
      return '/beacon-open';
    case 'design':
      return '/beacon-design';
    case 'build':
      return '/beacon-build';
    case 'verify':
      return '/beacon-verify';
    case 'archive':
      return '/beacon-archive';
    default:
      return null;
  }
}

async function readBeaconState(changesDir: string, changeName: string): Promise<BeaconState | null> {
  const yamlPath = path.join(changesDir, changeName, '.beacon.yaml');
  if (!(await fileExists(yamlPath))) return null;
  // preserve existing parser
}
```

同步类型名可从 `CometState` 改为 `BeaconState`。

- [ ] **Step 3: 写失败测试，doctor 输出 Beacon 修复建议**

在 `test/ts/doctor.test.ts` 中断言：

```ts
expect(output).toContain('run: beacon init');
expect(output).not.toContain('run: comet init');
expect(output).toContain('.beacon.yaml');
```

- [ ] **Step 4: 修改 `doctor.ts`**

将检查项和提示文本改为 Beacon：

```ts
const VALID_YAML_FIELDS = new Set([
  'workflow',
  'phase',
  'build_mode',
  'isolation',
  'verify_mode',
  'verify_result',
  'design_doc',
  'plan',
  'verification_report',
  'branch_status',
  'archived',
  'verified_at',
]);
```

保持字段集合不变，检查文件名从 `.comet.yaml` 改为 `.beacon.yaml`，修复建议从 `comet init` 改为 `beacon init`。

- [ ] **Step 5: 更新 init/update/uninstall Beacon 文案和路径**

在 `src/commands/init.ts` 中改：

```ts
const LANGUAGES: LanguageConfig[] = [
  { id: 'en', name: 'English', skillsDir: 'skills' },
  { id: 'zh', name: '中文', skillsDir: 'skills-zh' },
];
```

将 `PlatformResult` 中 `comet` 字段改为 `beacon`，或在不改内部类型时确保 JSON 输出字段使用 `beacon`。优先改外部 JSON 字段。

在 update/uninstall 相关测试中将目标 skills 从 `comet` 改为 `beacon`，再修改实现。

- [ ] **Step 6: 验证并提交**

Run: `npx vitest run test/ts/status.test.ts test/ts/doctor.test.ts test/ts/init.test.ts test/ts/update.test.ts test/ts/uninstall.test.ts`

Expected: PASS，命令输出和 JSON 字段使用 Beacon 合同。

Commit:

```bash
git add src/commands src/core/uninstall.ts test/ts/status.test.ts test/ts/doctor.test.ts test/ts/init.test.ts test/ts/update.test.ts test/ts/uninstall.test.ts
git commit -m "feat: update commands for beacon contracts"
```

---

## Task 5: 文档、残留检查与全量验证

**Files:**
- Modify: `README.md`
- Modify: `README-zh.md`
- Modify: `NEWS.md`
- Modify: `CHANGELOG.md`
- Modify: `test/ts/readme.test.ts`
- Modify: `test/ts/ci-workflows.test.ts`
- Modify: `test/ts/skills.test.ts`

- [ ] **Step 1: 写失败测试，运行说明不得出现 Comet 命令**

在 `test/ts/readme.test.ts` 增加运行说明残留检查：

```ts
const operationalCometPatterns = [
  /npm install -g @rpamis\/comet/,
  /\bcomet init\b/,
  /\/comet(?:\s|["'`]|$)/,
  /\/comet-(open|design|build|verify|archive|hotfix|tweak)\b/,
];

it('README operational instructions use Beacon commands', async () => {
  const docs = [
    await fs.readFile('README.md', 'utf-8'),
    await fs.readFile('README-zh.md', 'utf-8'),
  ].join('\n');

  for (const pattern of operationalCometPatterns) {
    expect(docs).not.toMatch(pattern);
  }
  expect(docs).toMatch(/\bbeacon init\b/);
  expect(docs).toMatch(/\/beacon\b/);
});
```

- [ ] **Step 2: 更新 README 和 NEWS**

将安装和使用说明改为：

```md
npm install -g beacon
beacon init
/beacon "你的想法"
/beacon-hotfix
/beacon-tweak
```

保留来源说明时使用独立段落：

```md
Beacon forked from Comet and is maintained as a private second-development project.
```

- [ ] **Step 3: 更新 CHANGELOG**

按项目规则在 `CHANGELOG.md` 顶部追加版本条目。先确认当前 `package.json` version；如果仍为 `0.3.9` 且 master 没有更高版本，本 change 使用 `0.4.0` 或用户确认的下一版本。

条目格式：

```md
## What's Changed [0.4.0] - 2026-06-22

### Changed

- **Beacon runtime contracts**: 将 Comet fork 的 CLI、skills、scripts、状态文件和安装产物运行合同切换为 Beacon，断开旧 Comet 兼容。

### Tests

- **Beacon contract coverage**: 更新 CLI、manifest、status、doctor、shell scripts 和 README 测试，覆盖 Beacon 命名与 `.beacon.yaml` 状态合同。
```

- [ ] **Step 4: 运行残留搜索**

Run:

```bash
rg -n "comet|Comet|\\.comet\\.yaml|/comet|comet-.*\\.sh" package.json src assets test README.md README-zh.md NEWS.md CHANGELOG.md
```

Expected: 只剩历史来源、license、changelog 历史段落或明确允许的 provenance 文本。任何运行合同残留都要修复。

- [ ] **Step 5: 全量验证**

Run:

```bash
pnpm build
pnpm test
npx vitest run test/ts/comet-scripts.test.ts
```

Expected: 全部 PASS。

- [ ] **Step 6: 手工 CLI 验收**

Run:

```bash
node dist/cli/index.js --help
node dist/cli/index.js status --json
```

Expected:

- help 显示 `Usage: beacon`。
- status JSON 中 next command 使用 `/beacon-*`。
- 输出不包含 `/comet-*`。

- [ ] **Step 7: 提交最终文档与验证变更**

Commit:

```bash
git add README.md README-zh.md NEWS.md CHANGELOG.md test/ts/readme.test.ts test/ts/ci-workflows.test.ts test/ts/skills.test.ts
git commit -m "docs: update beacon runtime documentation"
```

---

## Self-Review

**Spec coverage:**

- Beacon CLI Identity → Task 1、Task 4。
- Beacon Installed Assets → Task 2、Task 3。
- Beacon Workflow State → Task 3、Task 4。
- No Comet Compatibility Contract → Task 1、Task 3、Task 4、Task 5。
- Beacon Documentation and Tests → Task 5。

**Placeholder scan:**

本计划不包含待补内容占位；执行者需要使用当前仓库真实 helper 名称时，必须先复用测试文件已有 helper，再按本计划的断言语义落地。

**Type consistency:**

外部合同统一使用 `Beacon`、`beacon`、`.beacon.yaml`、`/beacon-*`、`beacon-*.sh`。内部类型如 `CometState` 可同步改为 `BeaconState`，但验收不依赖内部类型名。
