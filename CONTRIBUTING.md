# Beacon 贡献指南

感谢你帮助改进 Beacon。本文档聚焦这套仓库当前采用的开发、发布与验证流程。

## 开发环境

```bash
git clone https://github.com/zpqq132555/beacon
cd beacon
pnpm install
pnpm build
```

Node.js 与 `pnpm` 版本以 `package.json`、lockfile 和 CI 为准。如果本地行为与 CI 不一致，请在提交说明中明确写出差异。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | TypeScript watch 模式 |
| `pnpm build` | 编译 TypeScript |
| `pnpm test` | 运行单元测试 |
| `pnpm test:coverage` | 运行测试并生成覆盖率 |
| `pnpm test:shell` | 运行 shell 脚本测试 |
| `pnpm lint` | 运行 ESLint |
| `pnpm format` | 运行 Prettier |
| `pnpm format:check` | 检查格式 |

如果改动 shell 脚本，最常用的定向检查是：

```bash
npx vitest run test/ts/beacon-scripts.test.ts
```

提交或更新 PR 前，建议运行：

```bash
pnpm build
pnpm lint
pnpm format:check
pnpm test
```

## 分支模型

- `master` 是发布分支，只接收准备发布的变更。
- `develop` 是长期开发分支，日常开发默认合并到这里。
- 功能分支从最新 `develop` 拉出。
- 普通功能 PR 目标分支是 `develop`。
- 需要发布时，提一个 `develop -> master` 的发布 PR。
- 合并策略统一使用 **Squash and merge**。

这套约定的目标很简单：`develop` 保持持续集成，`master` 保持可发布。

## 开始一个改动

```bash
git fetch origin
git switch develop
git pull --ff-only origin develop
git switch -c <type>/<short-topic>
```

分支名保持短小清晰，例如 `fix/update-docs`、`feat/github-packages-publish`。

开发过程中建议：

- 提交保持便于 review 的粒度。
- 优先在实现前或实现同时补测试。
- 只修改与当前任务直接相关的代码和文档。
- 最终提交前重新运行定向验证或完整验证。

## 跟进 develop

如果你的功能分支落后于 `develop`，优先 rebase 到最新 `origin/develop`：

```bash
git fetch origin
git switch <your-branch>
git rebase origin/develop
git push --force-with-lease
```

如果分支里混入了无关提交，可以从 `origin/develop` 新建干净分支，再 cherry-pick 需要的提交：

```bash
git fetch origin
git switch -c <topic>-take-2 origin/develop
git cherry-pick <commit-1> <commit-2>
git push --force-with-lease origin <topic>-take-2:<original-branch>
```

## 发布流程

1. 所有功能先合并到 `develop`。
2. 准备发布时，确认 `CHANGELOG.md` 和 `package.json` 版本已经同步提升。
3. 从 `develop` 向 `master` 发起发布 PR。
4. PR 合并到 `master` 后，GitHub Actions 会按仓库配置发布 `@zpqq132555/beacon` 到 GitHub Packages。
5. 如果 `master` 上出现紧急 hotfix，修复后记得把对应变更同步回 `develop`。

## GitHub Packages

仓库默认发布包名为 `@zpqq132555/beacon`，目标 registry 为 `https://npm.pkg.github.com`。

本地发布前建议先确认：

```bash
npm whoami --registry=https://npm.pkg.github.com
npm publish
```

如果未登录，可执行：

```bash
npm login --scope=@zpqq132555 --auth-type=legacy --registry=https://npm.pkg.github.com
```

## 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```text
<type>: <description>
```

常用类型：`feat`、`fix`、`refactor`、`docs`、`test`、`chore`、`perf`、`ci`

示例：

```text
docs: align release flow with develop branch
fix: preserve scoped package update behavior
ci: publish releases to github packages
```

## Skill 与脚本

新增或修改 Skill 时：

1. 先修改 `assets/skills-zh/` 中文版本。
2. 用户确认后，再同步 `assets/skills/` 英文版本。
3. 新增 Skill 记得同步更新 `assets/manifest.json`。

Shell 脚本位于 `assets/skills/beacon/scripts/`，必须兼容 macOS、Linux 与 Windows Git Bash。不要使用 `sed -i`，并保持 `sha256sum` / `shasum -a 256` 双兼容。

## Changelog

用户可见行为发生变化时，必须同步更新 `CHANGELOG.md`，并确保版本号与 `package.json` 一致。新版本条目放在最上方。
