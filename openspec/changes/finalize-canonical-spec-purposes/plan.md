# Canonical Spec Completeness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 回填主线 canonical spec 的占位式 `Purpose`，并增加自动化 guard，防止归档占位文案再次残留到 `openspec/specs/**/spec.md`。

**Architecture:** 本次实现只动两层：一层是 4 份主线 spec 的 `## Purpose` 文本，另一层是新增一个聚焦 `openspec/specs/**/spec.md` 的 TypeScript 测试文件。测试层负责扫描主线 spec 中的归档占位文案，避免扩大到 archive 脚本逻辑改造。

**Tech Stack:** Markdown、OpenSpec artifacts、Vitest、Node.js `fs/promises`、TypeScript

---

### Task 1: 回填 4 份 canonical spec 的 Purpose

**Files:**
- Modify: `openspec/specs/agents-document-topology/spec.md`
- Modify: `openspec/specs/agents-tree-maintenance/spec.md`
- Modify: `openspec/specs/archive-agents-sedimentation/spec.md`
- Modify: `openspec/specs/human-documentation-localization/spec.md`
- Reference: `openspec/changes/archive/2026-07-01-add-beacon-init-agents-maintenance-skill/proposal.md`
- Reference: `openspec/changes/archive/2026-07-01-add-beacon-init-agents-maintenance-skill/design.md`
- Reference: `openspec/changes/archive/2026-06-23-consolidate-human-docs-to-zh/proposal.md`

- [ ] **Step 1: 用归档工件确认 4 份 Purpose 的目标表述**

对照以下目标文案，确认都与各自 Requirement 一致：

```md
openspec/specs/agents-document-topology/spec.md
Define how Beacon organizes root AGENTS.md, directory-level AGENTS.md, and supplemental responsibility documents so the AGENTS tree follows stable responsibility boundaries instead of raw directory depth.

openspec/specs/agents-tree-maintenance/spec.md
Define `/beacon-init` as the project-level entrypoint for full AGENTS tree maintenance, including manual full-workspace upkeep, summary-first confirmation, and conservative structural refactoring.

openspec/specs/archive-agents-sedimentation/spec.md
Define when archive-phase learnings should be ignored, surfaced as summary-first suggestions, or routed through `/beacon-init` so only stable, high-value rules are sedimented into AGENTS.

openspec/specs/human-documentation-localization/spec.md
Define the contract that human-facing project documentation is maintained as Simplified Chinese canonical content, with AGENTS.md as the collaboration source of truth and runtime assets excluded from this cleanup scope.
```

- [ ] **Step 2: 逐个替换 4 份 spec 的 `## Purpose` 占位文案**

把每个文件中这一段：

```md
## Purpose
TBD - created by archiving change ...
```

替换成对应的完整 Purpose 文本，只改 `## Purpose`，不要顺手改 Requirement 正文。

- [ ] **Step 3: 自检 4 份 spec 的 Purpose 与 Requirement 边界一致**

重点检查两件事：

```text
1. Purpose 只总结职责、范围、边界，不重述实现细节
2. Purpose 不引入 Requirement 里没有的新约束
```

- [ ] **Step 4: 提交 Task 1**

```bash
git add openspec/specs/agents-document-topology/spec.md openspec/specs/agents-tree-maintenance/spec.md openspec/specs/archive-agents-sedimentation/spec.md openspec/specs/human-documentation-localization/spec.md
git commit -m "docs: finalize canonical spec purposes"
```

### Task 2: 新增主线 spec Purpose 占位 guard

**Files:**
- Create: `test/ts/openspec-specs.test.ts`
- Reference: `test/ts/openspec.test.ts`
- Reference: `test/ts/beacon-scripts.test.ts`

- [ ] **Step 1: 新建主线 spec 完整性测试文件**

创建 `test/ts/openspec-specs.test.ts`，先放入基础结构：

```ts
import { describe, expect, it } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

const specsRoot = path.resolve('openspec', 'specs');
```

- [ ] **Step 2: 写出递归收集 `spec.md` 的辅助函数**

在同一文件中加入：

```ts
async function collectSpecFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectSpecFiles(fullPath);
      if (entry.isFile() && entry.name === 'spec.md') return [fullPath];
      return [];
    }),
  );
  return nested.flat();
}
```

- [ ] **Step 3: 写出占位 Purpose 扫描断言**

把以下测试加入 `test/ts/openspec-specs.test.ts`：

```ts
describe('canonical OpenSpec specs', () => {
  it('do not keep archive placeholder Purpose text in main specs', async () => {
    const specFiles = await collectSpecFiles(specsRoot);
    const disallowedMarkers = [
      'TBD - created by archiving change',
      'Update Purpose after archive.',
      '## Purpose\nTBD',
      '## Purpose\r\nTBD',
    ];

    const offenders: string[] = [];
    for (const specFile of specFiles) {
      const content = await fs.readFile(specFile, 'utf-8');
      if (disallowedMarkers.some((marker) => content.includes(marker))) {
        offenders.push(path.relative(process.cwd(), specFile));
      }
    }

    expect(
      offenders,
      `Main specs still contain archive placeholder Purpose text:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
```

- [ ] **Step 4: 运行聚焦测试确认 guard 生效**

运行：

```bash
npx vitest run test/ts/openspec-specs.test.ts
```

预期输出：

```text
1 test file passed
1 test passed
```

- [ ] **Step 5: 如有必要，再跑相关现有测试确保没有误伤**

运行：

```bash
npx vitest run test/ts/beacon-scripts.test.ts
```

预期输出：

```text
beacon-scripts.test.ts passes
```

- [ ] **Step 6: 提交 Task 2**

```bash
git add test/ts/openspec-specs.test.ts
git commit -m "test: guard canonical spec placeholder purposes"
```

### Task 3: Changelog、版本与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `package.json`
- Reference: `AGENTS.md`

- [ ] **Step 1: 将版本从 `0.4.7` 提升到 `0.4.8`**

在 `package.json` 中把：

```json
"version": "0.4.7"
```

改成：

```json
"version": "0.4.8"
```

- [ ] **Step 2: 在 `CHANGELOG.md` 顶部新增 `0.4.8` 条目**

按仓库规范添加：

```md
## What's Changed [0.4.8] - 2026-07-01

### Changed

- **canonical spec Purpose 收口**: 回填 4 份主线 OpenSpec spec 的 Purpose，移除 archive 遗留占位，恢复 canonical 规范可读性与职责说明。

### Tests

- **canonical spec 完整性 guard**: 新增主线 `openspec/specs/**/spec.md` 占位扫描测试，阻止 `Purpose: TBD` 一类 archive 占位文案回流到主线规范。
```

- [ ] **Step 3: 运行最终验证**

运行：

```bash
npx vitest run test/ts/openspec-specs.test.ts
pnpm test
```

预期输出：

```text
聚焦 spec guard 测试通过
全量 Vitest 通过
```

- [ ] **Step 4: 提交 Task 3**

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release canonical spec completeness"
```
