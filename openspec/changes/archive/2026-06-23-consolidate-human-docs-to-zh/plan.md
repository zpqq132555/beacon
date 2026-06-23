# 普通文档单中文维护 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将普通人读文档收敛为中文 canonical，删除普通文档语言副本，并保持功能语言资产不变。

**Architecture:** 本变更只调整文档资产，不改 CLI、脚本、Skill 行为或 OpenSpec 模板。实现按文件职责分层：根目录标准入口文件承载中文 canonical，`.github` 承载中文 PR 流程，`docs/` 保持中文专题说明，`assets/skills*` 与 `openspec/**` 只作为排除校验对象。

**Tech Stack:** Markdown、PowerShell、ripgrep、git、package.json、CHANGELOG.md、Prettier 文档检查。

---

## File Structure

- Modify: `D:/tools/AI/beacon/README.md` - 唯一 README 入口，迁移中文内容并移除语言切换说明。
- Delete: `D:/tools/AI/beacon/README-zh.md` - 删除中文语言副本。
- Modify: `D:/tools/AI/beacon/CONTRIBUTING.md` - 唯一贡献指南入口，迁移中文内容并移除语言切换说明。
- Delete: `D:/tools/AI/beacon/CONTRIBUTING-zh.md` - 删除中文语言副本。
- Modify: `D:/tools/AI/beacon/.github/PULL_REQUEST_TEMPLATE.md` - 中文 PR 模板。
- Modify: `D:/tools/AI/beacon/NEWS.md` - 清理普通文档维护策略中的双语残留，仅在搜索发现需要时修改。
- Modify: `D:/tools/AI/beacon/AGENTS.md` - 清理普通文档维护策略中的双语残留，仅在搜索发现需要时修改。
- Modify: `D:/tools/AI/beacon/CLAUDE.md` - 改为直接引用 `AGENTS.md` 的薄入口，不再重复维护完整协作说明。
- Modify: `D:/tools/AI/beacon/docs/AUTO-TRANSITION.md` - 清理指向普通文档语言副本的链接，仅在搜索发现需要时修改。
- Modify: `D:/tools/AI/beacon/docs/CONTEXT-COMPRESSION.md` - 清理指向普通文档语言副本的链接，仅在搜索发现需要时修改。
- Modify: `D:/tools/AI/beacon/docs/PRIVATE-FEATURE-MODULES.md` - 清理指向普通文档语言副本的链接，仅在搜索发现需要时修改。
- Modify: `D:/tools/AI/beacon/CHANGELOG.md` - 记录普通文档改为单中文维护。
- Modify: `D:/tools/AI/beacon/package.json` - 仅当 changelog 新版本需要提升时同步 `version`。
- Do not modify: `D:/tools/AI/beacon/assets/skills/**`
- Do not modify: `D:/tools/AI/beacon/assets/skills-zh/**`
- Do not modify: `D:/tools/AI/beacon/openspec/schemas/**`
- Do not modify: `D:/tools/AI/beacon/openspec/specs/**`
- Do not modify: `D:/tools/AI/beacon/openspec/changes/archive/**`
- Do not read or modify: `D:/tools/AI/beacon/.beacon/private-notes/legacy-feature-inventories/**`

### Task 1: 范围与基线扫描

**Files:**
- Read: `D:/tools/AI/beacon/README.md`
- Read: `D:/tools/AI/beacon/README-zh.md`
- Read: `D:/tools/AI/beacon/CONTRIBUTING.md`
- Read: `D:/tools/AI/beacon/CONTRIBUTING-zh.md`
- Read: `D:/tools/AI/beacon/.github/PULL_REQUEST_TEMPLATE.md`
- Read: `D:/tools/AI/beacon/docs/*.md`
- Read: `D:/tools/AI/beacon/NEWS.md`
- Read: `D:/tools/AI/beacon/AGENTS.md`
- Read: `D:/tools/AI/beacon/CLAUDE.md`

- [ ] **Step 1: 扫描普通文档文件清单**

Run:

```powershell
rg --files --hidden -g '*.md' -g '!node_modules/**' -g '!dist/**' -g '!coverage/**' -g '!.git/**' -g '!.beacon/private-notes/**' | Where-Object { $_ -match '^(README|README-zh|CONTRIBUTING|CONTRIBUTING-zh|NEWS|AGENTS|CLAUDE)\.md$|^docs\\|^\.github\\' }
```

Expected: 输出仅包含根目录普通文档、`docs/` 文档和 `.github/PULL_REQUEST_TEMPLATE.md`。

- [ ] **Step 2: 搜索普通文档语言副本引用**

Run:

```powershell
rg -n "README-zh\.md|CONTRIBUTING-zh\.md|English version|Language|语言：|\[English\]|\[中文\]" README.md README-zh.md CONTRIBUTING.md CONTRIBUTING-zh.md NEWS.md AGENTS.md CLAUDE.md docs .github
```

Expected: 输出需要清理的普通文档语言切换提示或副本链接；若没有输出，记录为无引用。

- [ ] **Step 3: 记录功能资产初始 diff 状态**

Run:

```powershell
git status --short -- assets/skills assets/skills-zh openspec/schemas openspec/specs openspec/changes/archive
```

Expected: 除用户已有无关改动外，本次任务尚未在这些排除路径产生变更。实现过程中如看到未知既有改动，只记录并避免触碰。

- [ ] **Step 4: Commit checkpoint**

No commit is required after read-only scanning. Proceed to Task 2 with the scan results.

### Task 2: 迁移标准入口文档为中文 canonical

**Files:**
- Modify: `D:/tools/AI/beacon/README.md`
- Delete later: `D:/tools/AI/beacon/README-zh.md`
- Modify: `D:/tools/AI/beacon/CONTRIBUTING.md`
- Delete later: `D:/tools/AI/beacon/CONTRIBUTING-zh.md`

- [ ] **Step 1: 用 `README-zh.md` 的中文内容替换 `README.md`**

Action: 读取 `README-zh.md` 和 `README.md`，将中文说明迁移到 `README.md`。保留 `README.md` 文件名，不保留 “English version: README.md” 这类语言切换提示。

Verification command:

```powershell
Test-Path README.md
```

Expected: 输出 `True`。

- [ ] **Step 2: 清理 README 中指向语言副本的链接**

Run:

```powershell
rg -n "README-zh\.md|English version|中文版本|English" README.md
```

Expected: 无输出，除非 `English` 出现在必须保留的产品名、命令参数或外部专有名词中；若有保留项，在验证记录中说明。

- [ ] **Step 3: 用 `CONTRIBUTING-zh.md` 的中文内容替换 `CONTRIBUTING.md`**

Action: 读取 `CONTRIBUTING-zh.md` 和 `CONTRIBUTING.md`，将中文贡献指南迁移到 `CONTRIBUTING.md`。同步修正旧命名残留，例如仍指向 Comet 的标题、路径或测试命令。

Verification command:

```powershell
Test-Path CONTRIBUTING.md
```

Expected: 输出 `True`。

- [ ] **Step 4: 清理 CONTRIBUTING 中指向语言副本的链接**

Run:

```powershell
rg -n "CONTRIBUTING-zh\.md|English version|语言：|\[English\]|\[中文\]" CONTRIBUTING.md
```

Expected: 无输出。

- [ ] **Step 5: Commit checkpoint**

Run after Task 2 verification passes:

```powershell
git add README.md CONTRIBUTING.md
git commit -m "docs: consolidate primary docs in Chinese"
```

Expected: commit succeeds. If the user has asked not to commit in the current session, skip the commit and record the reason in verification notes.

### Task 3: 清理 PR 模板与普通文档链接

**Files:**
- Modify: `D:/tools/AI/beacon/.github/PULL_REQUEST_TEMPLATE.md`
- Modify as needed: `D:/tools/AI/beacon/NEWS.md`
- Modify as needed: `D:/tools/AI/beacon/AGENTS.md`
- Modify: `D:/tools/AI/beacon/CLAUDE.md`
- Modify as needed: `D:/tools/AI/beacon/docs/AUTO-TRANSITION.md`
- Modify as needed: `D:/tools/AI/beacon/docs/CONTEXT-COMPRESSION.md`
- Modify as needed: `D:/tools/AI/beacon/docs/PRIVATE-FEATURE-MODULES.md`

- [ ] **Step 1: 将 PR 模板改为中文**

Action: 将 `.github/PULL_REQUEST_TEMPLATE.md` 中的面向维护者说明、勾选项和标题改为中文。保留 checklist 结构，避免添加新的流程要求。

Verification command:

```powershell
rg -n "Summary|Checklist|Test|Description|English version" .github/PULL_REQUEST_TEMPLATE.md
```

Expected: 无英文模板标题残留；命令名、路径或专有名词可保留。

- [ ] **Step 2: 将 CLAUDE.md 改为 AGENTS.md 薄入口**

Action: 用简短中文说明替换 `CLAUDE.md` 的完整重复内容，保留 Claude 生态入口，并明确 canonical 内容在 `AGENTS.md`。建议内容：

```markdown
# Claude 项目说明

本项目的协作、编码、测试、文档和 changelog 规则统一维护在 [AGENTS.md](AGENTS.md)。

Claude 相关工具读取本文件时，应直接遵循 `AGENTS.md`；不要在本文件重复维护同一套规则。
```

Verification command:

```powershell
rg -n "AGENTS\.md|不要在本文件重复维护" CLAUDE.md
```

Expected: 输出 `CLAUDE.md` 中指向 `AGENTS.md` 的说明，且文件不再包含完整的项目规则副本。

- [ ] **Step 3: 清理根目录普通文档中的副本链接**

Run:

```powershell
rg -n "README-zh\.md|CONTRIBUTING-zh\.md|English version|语言：|\[English\]|\[中文\]" NEWS.md AGENTS.md CLAUDE.md
```

Action: 对输出中的普通文档语言切换或副本链接做定点修改。不要改动与技术事实相关的英文命令、路径、API 名称或日志原文。

Expected: 修改后重新运行该命令无输出，或仅剩必须保留的技术内容并有验证说明。

- [ ] **Step 4: 清理 docs 目录中的副本链接**

Run:

```powershell
rg -n "README-zh\.md|CONTRIBUTING-zh\.md|English version|语言：|\[English\]|\[中文\]" docs
```

Action: 对输出中的普通文档语言切换或副本链接做定点修改。

Expected: 修改后重新运行该命令无输出，或仅剩必须保留的技术内容并有验证说明。

- [ ] **Step 5: Commit checkpoint**

Run after Task 3 verification passes:

```powershell
git add .github/PULL_REQUEST_TEMPLATE.md NEWS.md AGENTS.md CLAUDE.md docs
git commit -m "docs: localize human-facing doc workflow"
```

Expected: commit succeeds. If some listed files were not modified, `git add` still succeeds without staging unrelated changes.

### Task 4: 删除普通文档语言副本

**Files:**
- Delete: `D:/tools/AI/beacon/README-zh.md`
- Delete: `D:/tools/AI/beacon/CONTRIBUTING-zh.md`

- [ ] **Step 1: 删除 README 中文副本**

Run:

```powershell
Remove-Item -LiteralPath 'README-zh.md' -Force
```

Expected: `README-zh.md` 不存在。

- [ ] **Step 2: 删除 CONTRIBUTING 中文副本**

Run:

```powershell
Remove-Item -LiteralPath 'CONTRIBUTING-zh.md' -Force
```

Expected: `CONTRIBUTING-zh.md` 不存在。

- [ ] **Step 3: 验证副本文件已移除**

Run:

```powershell
Test-Path README-zh.md; Test-Path CONTRIBUTING-zh.md
```

Expected: 两行均输出 `False`。

- [ ] **Step 4: 验证仓库内普通文档没有引用已删除副本**

Run:

```powershell
rg -n "README-zh\.md|CONTRIBUTING-zh\.md" README.md CONTRIBUTING.md NEWS.md AGENTS.md CLAUDE.md docs .github
```

Expected: 无输出。

- [ ] **Step 5: Commit checkpoint**

Run:

```powershell
git add README-zh.md CONTRIBUTING-zh.md README.md CONTRIBUTING.md NEWS.md AGENTS.md CLAUDE.md docs .github/PULL_REQUEST_TEMPLATE.md
git commit -m "docs: remove duplicate localized doc copies"
```

Expected: commit succeeds.

### Task 5: 更新 changelog 与版本号

**Files:**
- Modify: `D:/tools/AI/beacon/CHANGELOG.md`
- Modify if required: `D:/tools/AI/beacon/package.json`

- [ ] **Step 1: 查询当前 package 版本**

Run:

```powershell
node -p "require('./package.json').version"
```

Expected: 输出当前工作树版本，例如 `0.4.2`。

- [ ] **Step 2: 查询 master 基线版本**

Run:

```powershell
git show master:package.json
```

Expected: 输出 master 中的 package.json。读取其中的 `version` 字段；如果本地没有 `master`，改用 `git show origin/master:package.json`。

- [ ] **Step 3: 决定 changelog 版本**

Action: 若当前工作树已经有一个比 master 大一个 patch/minor 的顶部 changelog 版本，并且 `package.json` 一致，则追加到该版本。若没有，则按项目规则只比 master 大一个版本，并同步 `package.json`。

Verification command:

```powershell
Select-String -Path CHANGELOG.md -Pattern '^## What''s Changed \\[' | Select-Object -First 3
```

Expected: 能看到顶部版本条目，且决策记录清楚。

- [ ] **Step 4: 写入 changelog 条目**

Action: 在 `CHANGELOG.md` 顶部对应版本下添加 `### Changed` 条目：

```markdown
- **普通文档维护语言**: 将面向用户和维护者的普通文档收敛为单一中文 canonical，删除重复语言副本，并让 `CLAUDE.md` 直接引用 `AGENTS.md` 以减少同职责文档同步成本。
```

Expected: 条目位于顶部版本的 `### Changed` 分组下；如果分组不存在，按项目顺序创建。

- [ ] **Step 5: 确认 package version 与 changelog 顶部一致**

Run:

```powershell
$pkg = node -p "require('./package.json').version"; $top = (Select-String -Path CHANGELOG.md -Pattern '^## What''s Changed \\[([^\\]]+)\\]' | Select-Object -First 1).Matches[0].Groups[1].Value; "$pkg $top"
```

Expected: 输出两个相同版本号。

- [ ] **Step 6: Commit checkpoint**

Run:

```powershell
git add CHANGELOG.md package.json package-lock.json pnpm-lock.yaml
git commit -m "docs: record Chinese documentation consolidation"
```

Expected: commit succeeds. If `package.json` 未修改且 lockfile 未变化，`git add` 对这些文件不会引入无关变更。

### Task 6: 最终验证

**Files:**
- Verify: entire working tree except excluded functional language assets

- [ ] **Step 1: 验证已删除副本没有残留引用**

Run:

```powershell
rg -n "README-zh\.md|CONTRIBUTING-zh\.md" README.md CONTRIBUTING.md NEWS.md AGENTS.md CLAUDE.md docs .github
```

Expected: 无输出。

- [ ] **Step 2: 验证普通文档语言切换提示已清理**

Run:

```powershell
rg -n "English version|中文版本|语言：|\[English\]|\[中文\]" README.md CONTRIBUTING.md NEWS.md AGENTS.md CLAUDE.md docs .github
```

Expected: 无输出，或只剩技术语境中必须保留的内容并在 `verify.md` 记录。

- [ ] **Step 3: 验证 CLAUDE.md 只作为 AGENTS.md 入口**

Run:

```powershell
rg -n "AGENTS\.md|不要在本文件重复维护" CLAUDE.md
```

Expected: 输出 `CLAUDE.md` 中的薄入口说明；人工查看确认没有重复维护 `AGENTS.md` 的完整规则内容。

- [ ] **Step 4: 验证排除路径没有实现改动**

Run:

```powershell
git diff --name-only -- assets/skills assets/skills-zh openspec/schemas openspec/specs openspec/changes/archive
```

Expected: 无输出。若输出仅包含本 OpenSpec change 自身以外的用户既有改动，不要修改它们，并在验证记录中说明。

- [ ] **Step 5: 运行格式检查**

Run:

```powershell
pnpm format:check
```

Expected: 通过；若 Windows CRLF 导致旧文件误报，记录具体文件和原因。

- [ ] **Step 6: 运行文档相关 Prettier 检查**

Run:

```powershell
npx prettier --check README.md CONTRIBUTING.md NEWS.md AGENTS.md CLAUDE.md ".github/PULL_REQUEST_TEMPLATE.md" "docs/*.md" CHANGELOG.md
```

Expected: 通过；若 glob 在 PowerShell 下未展开，改用逐文件路径。

- [ ] **Step 7: 查看最终 diff**

Run:

```powershell
git diff --stat
git diff -- README.md CONTRIBUTING.md .github/PULL_REQUEST_TEMPLATE.md NEWS.md AGENTS.md CLAUDE.md docs CHANGELOG.md package.json
```

Expected: diff 只包含普通文档单中文维护、语言副本删除、changelog/version 相关变更。

- [ ] **Step 8: Final commit checkpoint**

Run if previous commits were intentionally skipped:

```powershell
git add README.md CONTRIBUTING.md README-zh.md CONTRIBUTING-zh.md .github/PULL_REQUEST_TEMPLATE.md NEWS.md AGENTS.md CLAUDE.md docs CHANGELOG.md package.json package-lock.json pnpm-lock.yaml
git commit -m "docs: consolidate human-facing documentation to Chinese"
```

Expected: commit succeeds. If commits were already made per task, this step should report no remaining staged changes.

## Self-Review

- Spec coverage: 普通文档中文 canonical、`CLAUDE.md` 引用 `AGENTS.md`、语言副本移除、功能语言资产排除、changelog/version 记录分别由 Task 2、Task 3、Task 4、Task 6、Task 5 覆盖。
- Placeholder scan: 本计划不包含 `TBD`、未展开的实现说明或要求执行者自行补全的占位步骤。
- Type consistency: 本变更不涉及代码类型；路径、文件名和验证命令在各任务中保持一致。
