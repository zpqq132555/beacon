# Beacon Init Agents Maintenance Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增独立 `/beacon-init` skill，用于手动全量维护项目 AGENTS 树，并让 archive 仅在值得沉淀时以摘要建议方式转调它。

**Architecture:** 这次实现以 skill 合同、参考文档、manifest 和 README 为主，不把 AGENTS 维护重新塞回 CLI `init`。`beacon-init` 负责项目级 AGENTS 树的创建/更新/收缩策略，`beacon-archive` 只负责“是否值得沉淀”的判断与确认后转调，根 `beacon` skill 负责暴露入口与协作边界。

**Tech Stack:** Markdown skills, Beacon asset manifest, README, TypeScript/Vitest, OpenSpec CLI.

---

## Task 1: `/beacon-init` 入口与分发注册

**Files:**
- Create: `assets/skills-zh/beacon-init/SKILL.md`
- Create: `assets/skills/beacon-init/SKILL.md`
- Modify: `assets/manifest.json`
- Modify: `README.md`
- Test: `test/ts/skills.test.ts`

- [ ] **Step 1: 先写失败测试，锁定 `/beacon-init` 必须被分发并暴露为运行时入口**

在 `test/ts/skills.test.ts` 的 Beacon runtime/installation 相关断言附近新增：

```ts
it('ships the beacon-init skill and exposes it in runtime contracts', async () => {
  const manifest = await readManifest();
  expect(manifest.skills).toContain('beacon-init/SKILL.md');

  const zhRoot = await fs.readFile(
    path.resolve('assets', 'skills-zh', 'beacon', 'SKILL.md'),
    'utf-8',
  );
  const enRoot = await fs.readFile(
    path.resolve('assets', 'skills', 'beacon', 'SKILL.md'),
    'utf-8',
  );

  expect(zhRoot).toContain('/beacon-init');
  expect(enRoot).toContain('/beacon-init');
});
```

- [ ] **Step 2: 运行定向测试并确认当前确实失败**

Run: `cmd /c npx vitest run test/ts/skills.test.ts -t "ships the beacon-init skill and exposes it in runtime contracts"`

Expected: FAIL，原因应是 `manifest.skills` 里还没有 `beacon-init/SKILL.md`，且根 skill 文案尚未暴露 `/beacon-init`。

- [ ] **Step 3: 创建中文 `/beacon-init` skill，先把手动维护合同落稳**

新建 `assets/skills-zh/beacon-init/SKILL.md`，沿用现有 Beacon skill front matter 风格，最少包含下面这些合同片段：

```md
---
name: beacon-init
description: "Beacon 辅助技能：维护项目级 AGENTS 树。用于手动全量维护，或被 archive 在确认后转调。"
---

# Beacon Init

**立即执行：** 使用 Skill 工具加载 `brainstorming` 技能。禁止跳过此步骤。

技能加载后：
- 读取当前工作区现状，可纳入未提交改动
- 先输出 AGENTS 维护摘要建议，再等待用户确认
- 根 `AGENTS.md` 保持精简，只保留全局入口、关键命令、高价值注意事项和 AGENTS Map
- `CLAUDE.md` 只作为 shim，通过 `@AGENTS.md` 引用，不复制内容
```

- [ ] **Step 4: 镜像创建英文 `/beacon-init` skill，确保行为合同一致**

新建 `assets/skills/beacon-init/SKILL.md`，保持与中文版本同一结构；不要新增英文版特有行为，只做语义等价翻译，例如：

```md
---
name: beacon-init
description: "Beacon support skill: maintain the project AGENTS tree for manual full maintenance or archive-triggered follow-up."
---

# Beacon Init

**Immediately execute:** Use the Skill tool to load the `brainstorming` skill. Skipping this step is prohibited.
```

- [ ] **Step 5: 注册 manifest，并把 README 的技能清单补上 `/beacon-init`**

在 `assets/manifest.json` 的 `skills` 数组中插入：

```json
"beacon-init/SKILL.md"
```

在 `README.md` 的技能表和流程说明附近补一条辅助技能说明，明确 `/beacon-init` 不属于五阶段主流程，而是项目 AGENTS 树维护入口，例如：

```md
| `/beacon-init` | 辅助技能：项目 AGENTS 树维护（手动全量维护 / 归档确认后增量沉淀） |
```

- [ ] **Step 6: 回跑测试，确认入口合同已建立**

Run: `cmd /c npx vitest run test/ts/skills.test.ts -t "ships the beacon-init skill and exposes it in runtime contracts"`

Expected: PASS

- [ ] **Step 7: 提交这一批入口与分发改动**

```bash
git add assets/skills-zh/beacon-init/SKILL.md assets/skills/beacon-init/SKILL.md assets/manifest.json README.md test/ts/skills.test.ts
git commit -m "feat: add beacon-init skill entrypoint"
```

## Task 2: AGENTS 拓扑与 archive 沉淀合同

**Files:**
- Create: `assets/skills-zh/beacon/reference/agents-topology.md`
- Create: `assets/skills-zh/beacon/reference/agents-sedimentation.md`
- Create: `assets/skills/beacon/reference/agents-topology.md`
- Create: `assets/skills/beacon/reference/agents-sedimentation.md`
- Modify: `assets/skills-zh/beacon-init/SKILL.md`
- Modify: `assets/skills/beacon-init/SKILL.md`
- Modify: `assets/skills-zh/beacon-archive/SKILL.md`
- Modify: `assets/skills/beacon-archive/SKILL.md`
- Modify: `assets/skills-zh/beacon/SKILL.md`
- Modify: `assets/skills/beacon/SKILL.md`
- Modify: `assets/manifest.json`
- Test: `test/ts/skills.test.ts`

- [ ] **Step 1: 先写失败测试，锁定 AGENTS 拓扑和 archive 协作合同**

在 `test/ts/skills.test.ts` 新增一组断言，最少覆盖这些点：

```ts
it('documents beacon-init topology and archive sedimentation contracts', async () => {
  const zhInit = await fs.readFile(
    path.resolve('assets', 'skills-zh', 'beacon-init', 'SKILL.md'),
    'utf-8',
  );
  const zhArchive = await fs.readFile(
    path.resolve('assets', 'skills-zh', 'beacon-archive', 'SKILL.md'),
    'utf-8',
  );
  const enInit = await fs.readFile(
    path.resolve('assets', 'skills', 'beacon-init', 'SKILL.md'),
    'utf-8',
  );

  expect(zhInit).toContain('根 `AGENTS.md` 保持精简');
  expect(zhInit).toContain('`CLAUDE.md` 只作为 shim');
  expect(zhInit).toContain('beacon/reference/agents-topology.md');
  expect(zhArchive).toContain('静默忽略');
  expect(zhArchive).toContain('/beacon-init');
  expect(enInit).toContain('beacon/reference/agents-topology.md');
});
```

- [ ] **Step 2: 运行测试并确认这些合同目前还不存在**

Run: `cmd /c npx vitest run test/ts/skills.test.ts -t "documents beacon-init topology and archive sedimentation contracts"`

Expected: FAIL，原因应是参考文档、archive 合同或 skill 引用尚未补齐。

- [ ] **Step 3: 先写中文参考文档和中文 skill 合同**

新增 `assets/skills-zh/beacon/reference/agents-topology.md`，内容至少覆盖：

```md
# AGENTS 拓扑

- 根 `AGENTS.md` 只保留全局入口、关键命令、高价值注意事项和 AGENTS Map
- 单一职责目录优先使用 `子目录/AGENTS.md`
- 混合目录使用 `本地 AGENTS.md + [职责].md`
- 只有职责继续细分且长期稳定时才继续下钻
```

新增 `assets/skills-zh/beacon/reference/agents-sedimentation.md`，内容至少覆盖：

```md
# AGENTS 沉淀判断

- 不适合长期复用的归档内容静默忽略
- 适合沉淀时先给摘要建议，再等待用户确认
- 无 AGENTS 体系时走全量维护 + 本次归档注入
- 已有 AGENTS 体系时只做本次归档相关增量维护
```

然后更新 `assets/skills-zh/beacon-init/SKILL.md`、`assets/skills-zh/beacon-archive/SKILL.md`、`assets/skills-zh/beacon/SKILL.md`，把上面两份参考文档接进去，并补上 `/beacon-init` 与 archive 的协作描述。

- [ ] **Step 4: 再镜像英文参考文档和英文 skill 合同**

同步创建英文版 `assets/skills/beacon/reference/agents-topology.md` 与 `assets/skills/beacon/reference/agents-sedimentation.md`，并更新 `assets/skills/beacon-init/SKILL.md`、`assets/skills/beacon-archive/SKILL.md`、`assets/skills/beacon/SKILL.md`，保持行为一致，不要在英文版单独扩 scope。

- [ ] **Step 5: 把新 reference 文档加入 manifest**

在 `assets/manifest.json` 中补入：

```json
"beacon/reference/agents-topology.md",
"beacon/reference/agents-sedimentation.md"
```

现有测试会自动验证所有 `beacon/reference/*.md` 引用都必须被 manifest 分发，因此这里必须同步注册。

- [ ] **Step 6: 回跑 skills 合同测试，确认中英文行为一致**

Run: `cmd /c npx vitest run test/ts/skills.test.ts`

Expected: PASS，尤其是 skill 内容断言、manifest 分发断言和 reference shipping 断言全部通过。

- [ ] **Step 7: 提交 AGENTS 合同与 archive 协作改动**

```bash
git add assets/skills-zh/beacon-init/SKILL.md assets/skills/beacon-init/SKILL.md assets/skills-zh/beacon-archive/SKILL.md assets/skills/beacon-archive/SKILL.md assets/skills-zh/beacon/SKILL.md assets/skills/beacon/SKILL.md assets/skills-zh/beacon/reference/agents-topology.md assets/skills/beacon/reference/agents-topology.md assets/skills-zh/beacon/reference/agents-sedimentation.md assets/skills/beacon/reference/agents-sedimentation.md assets/manifest.json test/ts/skills.test.ts
git commit -m "feat: add beacon-init AGENTS maintenance contracts"
```

## Task 3: README、版本与完整验证

**Files:**
- Modify: `README.md`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `CHANGELOG.md`
- Test: `test/ts/readme.test.ts`
- Test: `test/ts/skills.test.ts`

- [ ] **Step 1: 先写失败测试，锁定 README 对 `/beacon-init` 的用户可见说明**

在 `test/ts/readme.test.ts` 新增断言：

```ts
it('documents beacon-init as the AGENTS tree maintenance entrypoint', async () => {
  const content = await fs.readFile('README.md', 'utf-8');
  expect(content).toContain('/beacon-init');
  expect(content).toContain('AGENTS 树维护');
  expect(content).toContain('归档确认后增量沉淀');
});
```

- [ ] **Step 2: 运行 README 定向测试并确认它先失败**

Run: `cmd /c npx vitest run test/ts/readme.test.ts -t "documents beacon-init as the AGENTS tree maintenance entrypoint"`

Expected: FAIL，README 还没有 `/beacon-init` 的说明或表述不完整。

- [ ] **Step 3: 更新 README 的技能清单、协作说明和 archive 触发描述**

在 `README.md` 中至少补齐三类信息：

```md
- `/beacon-init` 是项目 AGENTS 树维护入口，不属于五阶段主流程
- 手动调用时按当前工作区做全量维护
- archive 只有在内容值得沉淀时才会先给摘要建议，确认后转调 `/beacon-init`
```

- [ ] **Step 4: 确定版本号并写 Changelog**

先读 `master` 基线版本：

Run: `git show master:package.json`

然后按仓库规则处理：
- 如果当前分支的 `CHANGELOG.md` 已经存在一个高于 `master` 的版本条目，就把本次变更追加到同一版本下
- 否则把 `package.json` 和 `package-lock.json` 升到只比 `master` 大一个版本的新号

`CHANGELOG.md` 条目格式使用：

```md
## What's Changed [x.y.z] - 2026-06-30

### Added
- **beacon-init**: 新增独立 `/beacon-init` skill，用于项目级 AGENTS 树的创建、更新与结构优化建议。

### Changed
- **archive 沉淀协作**: 归档阶段仅在内容值得沉淀时给出摘要建议，并在用户确认后转调 `/beacon-init`。

### Tests
- **skills/readme 回归**: 补充 `/beacon-init` 分发、文档拓扑和 README 说明的自动化断言。
```

- [ ] **Step 5: 运行 OpenSpec、格式、构建和回归验证**

Run:
- `cmd /c openspec validate add-beacon-init-agents-maintenance-skill --type change`
- `cmd /c pnpm format:check`
- `cmd /c pnpm lint`
- `cmd /c pnpm build`
- `cmd /c npx vitest run test/ts/skills.test.ts test/ts/readme.test.ts`

Expected:
- OpenSpec validate PASS
- format/lint/build PASS
- skills/readme 测试 PASS

- [ ] **Step 6: 勾选 tasks 并准备后续 verify 工件输入**

把 `openspec/changes/add-beacon-init-agents-maintenance-skill/tasks.md` 中已完成项勾选掉，并整理下面这份验证摘要，供后续 `verify.md` 直接复用：

```md
- `openspec validate add-beacon-init-agents-maintenance-skill --type change`
- `pnpm format:check`
- `pnpm lint`
- `pnpm build`
- `npx vitest run test/ts/skills.test.ts test/ts/readme.test.ts`
```

- [ ] **Step 7: 提交 README、版本和验证收尾**

```bash
git add README.md package.json package-lock.json CHANGELOG.md test/ts/readme.test.ts test/ts/skills.test.ts openspec/changes/add-beacon-init-agents-maintenance-skill/tasks.md
git commit -m "docs: document beacon-init AGENTS maintenance workflow"
```
