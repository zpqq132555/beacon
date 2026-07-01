# Private Supply Chain Project Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `define-private-supply-chain-project-rollout` change 落到可交付文档与回归测试中，明确 Beacon 私有版的项目级接入、最小三键配置、`init -> doctor` 使用顺序，以及“首期只私有化 beacon”边界。

**Architecture:** 这次实现不改 Beacon 运行时代码，优先复用已经存在的私有供应链行为。实现集中在三层：更新 README 的接入与升级说明，补充 NEWS 的用户可见边界说明，以及通过 `test/ts/readme.test.ts` 固定这些文档合同，避免后续回退到“全局安装优先”或“外部依赖是接入前置条件”的叙述。

**Tech Stack:** Markdown 文档、Vitest、OpenSpec `superpowers-bridge` artifacts、现有 `README.md` / `NEWS.md` / `test/ts/readme.test.ts`。

---

## File Structure

- Modify: `README.md` — 改为项目级依赖优先的接入说明，补最小 `.beacon/config.yaml` 配置段，明确 `npx beacon init --scope project --language zh` 与 `npx beacon doctor` 顺序，并说明首期只要求 Beacon 自身私有化。
- Modify: `NEWS.md` — 补一条面向用户的说明，强调项目级接入、手动升级和首期边界。
- Modify: `test/ts/readme.test.ts` — 为 README/NEWS 新增合同断言，固定项目级接入路径、最小三键配置和首期私有化范围。
- Modify: `openspec/changes/define-private-supply-chain-project-rollout/tasks.md` — 在实现过程中勾选 1.2、1.3、3.1 三项剩余 coarse tasks。

---

### Task 1: 更新 README 接入与升级合同

**Files:**
- Modify: `README.md`
- Modify: `openspec/changes/define-private-supply-chain-project-rollout/tasks.md`

- [ ] **Step 1: 先写 README 合同断言测试**

在 `test/ts/readme.test.ts` 的 `describe('README assets', ...)` 中新增一个失败用例：

```ts
  it('documents project-level private rollout and minimum beacon config', async () => {
    const readme = await fs.readFile('README.md', 'utf-8');

    expect(readme).toContain('npm install -D beacon --registry https://npm.internal.example');
    expect(readme).toContain('npx beacon init --scope project --language zh');
    expect(readme).toContain('npx beacon doctor');
    expect(readme).toContain('supply_chain.beacon.package: beacon');
    expect(readme).toContain('supply_chain.beacon.registry: https://npm.internal.example');
    expect(readme).toContain(
      'supply_chain.beacon.latest_metadata_url: https://npm.internal.example/beacon/latest',
    );
    expect(readme).toContain('首期只要求 Beacon 自身私有化');
  });
```

Run: `npx vitest run test/ts/readme.test.ts`

Expected: FAIL because README 还没有这些项目级接入内容。

- [ ] **Step 2: 把安装入口改为项目级依赖优先**

将 `README.md` 里现有“安装 / 快速开始”相关段落改成以下内容骨架，保持现有文档语气和中文说明：

```md
## 安装

前置要求：
- Node.js 20+
- npm/npx
- Git
- 可运行 `bash` 的 shell 环境（Windows 用户建议使用 Git Bash 或等价环境）

私有版安装来源由团队内部包分发策略决定。推荐先把 Beacon 作为项目级依赖安装到当前项目：

```bash
npm install -D beacon --registry https://npm.internal.example
```

如果团队使用的是内部作用域包，也可以把上面的 `beacon` 替换为团队分发的私有包名，并在 `.beacon/config.yaml` 中同步设置 `supply_chain.beacon.package`。
```

- [ ] **Step 3: 在 README 中加入最小 `.beacon/config.yaml` 配置**

紧接安装说明后加入这一段：

```md
项目级接入建议同时补充最小 Beacon 供应链配置：

```yaml
supply_chain.beacon.package: beacon
supply_chain.beacon.registry: https://npm.internal.example
supply_chain.beacon.latest_metadata_url: https://npm.internal.example/beacon/latest
```

首期只要求 Beacon 自身这三项来源配置。OpenSpec、Superpowers 和 CodeGraph 可以继续按团队现状保留为可选安装或管理员预装。
```

- [ ] **Step 4: 在 README 中明确 `init -> doctor` 顺序**

把“快速开始”示例改为：

```md
## 快速开始

```bash
cd your-project
npx beacon init --scope project --language zh
npx beacon doctor
```

`beacon init` 负责把 Beacon skills、rules、hooks 部署到所选平台；`beacon doctor` 用于在接入后确认安装目标、工作目录和状态文件都处于健康状态。
```

- [ ] **Step 5: 勾选 coarse tasks 1.2、1.3、3.1**

将 `openspec/changes/define-private-supply-chain-project-rollout/tasks.md` 中以下三项改为已完成：

```md
- [x] 1.2 在用户可见文档中明确最小 `.beacon/config.yaml` 配置键，只要求 Beacon 自身的三项来源配置。
- [x] 1.3 在接入说明中明确 `beacon init --scope project` 和 `beacon doctor` 的使用顺序。
- [x] 3.1 在 capability 与文档中明确首期只私有化 `beacon` 本身。
```

- [ ] **Step 6: 运行测试确认 README 合同成立**

Run: `npx vitest run test/ts/readme.test.ts`

Expected: PASS，新增 README 合同断言通过。

- [ ] **Step 7: 提交 Task 1**

```bash
git add README.md test/ts/readme.test.ts openspec/changes/define-private-supply-chain-project-rollout/tasks.md
git commit -m "docs: document project-level beacon rollout"
```

---

### Task 2: 更新 NEWS 与文档回归测试

**Files:**
- Modify: `NEWS.md`
- Modify: `test/ts/readme.test.ts`

- [ ] **Step 1: 先为 NEWS 增加回归断言**

在 `test/ts/readme.test.ts` 中补一个针对 `NEWS.md` 的断言：

```ts
  it('keeps release notes aligned with project-level private rollout guidance', async () => {
    const news = await fs.readFile('NEWS.md', 'utf-8');

    expect(news).toContain('项目级依赖');
    expect(news).toContain('首期只要求 Beacon 自身私有化');
    expect(news).toContain('beacon update');
    expect(news).toContain('beacon doctor');
  });
```

Run: `npx vitest run test/ts/readme.test.ts`

Expected: FAIL，因为 NEWS 还没有对应说明。

- [ ] **Step 2: 在 NEWS 顶部当前版本说明里补一段项目 rollout 提示**

在 `NEWS.md` 当前最新版本小节下增加一个简短小节，内容保持面向用户、非实现细节：

```md
### 项目级私有接入建议

私有版 Beacon 推荐以项目级依赖接入，再执行 `npx beacon init --scope project --language zh` 和 `npx beacon doctor` 完成初始化与验收。首期只要求 Beacon 自身私有化；OpenSpec、Superpowers 和 CodeGraph 可按团队现状保留为可选安装或管理员预装。后续升级时，先更新项目里的 Beacon 依赖版本，再执行 `beacon update` 刷新已安装的 Beacon 资产。
```

- [ ] **Step 3: 重新运行 README/NEWS 文档测试**

Run: `npx vitest run test/ts/readme.test.ts`

Expected: PASS，README 与 NEWS 的新增合同断言都通过。

- [ ] **Step 4: 提交 Task 2**

```bash
git add NEWS.md test/ts/readme.test.ts
git commit -m "test: lock project rollout documentation"
```

---

### Task 3: 最终验证与 OpenSpec 状态收口

**Files:**
- Modify: `openspec/changes/define-private-supply-chain-project-rollout/tasks.md`

- [ ] **Step 1: 运行 OpenSpec change 校验**

Run: `openspec validate define-private-supply-chain-project-rollout --type change`

Expected: `Change 'define-private-supply-chain-project-rollout' is valid`

- [ ] **Step 2: 运行 change 状态检查**

Run: `openspec status --change "define-private-supply-chain-project-rollout"`

Expected: `plan` 显示为完成，`tasks` 仍显示完成，剩余阻塞转移到 `verify` 而不是 `plan`。

- [ ] **Step 3: 运行最终 git 差异检查**

Run: `git diff -- README.md NEWS.md test/ts/readme.test.ts openspec/changes/define-private-supply-chain-project-rollout`

Expected: diff 只包含本 change 的 README / NEWS / 测试 / OpenSpec artifacts 变更，不包含无关文件。

- [ ] **Step 4: 记录本 session 的实现完成条件**

在结束本次 apply session 前，确认以下三项已经满足：

```text
1. README 明确项目级依赖、最小三键配置、init -> doctor 顺序
2. NEWS 明确首期只私有化 Beacon 自身和手动升级路径
3. readme.test.ts 对以上文档合同有回归保护
```

- [ ] **Step 5: 提交 Task 3**

```bash
git add openspec/changes/define-private-supply-chain-project-rollout/plan.md
git commit -m "spec: add project rollout implementation plan"
```
