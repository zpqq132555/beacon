## Why

Beacon 已完成首批平台范围私有化，但包更新、版本检查和外部能力包安装仍默认指向公开 npm registry、GitHub skill 源和公开安装命令。这会让私有版在初始化或更新时无意访问未受控外部来源，也让文档与实际私有边界不一致。现在需要先收口供应链路径，为后续默认中文和公开展示面清理建立稳定基线。

## What Changes

**Beacon 自身更新与版本检查**
- From: `beacon update` 和版本检查硬编码公开 npm registry，并默认更新 `beacon@latest`。
- To: 更新和版本检查从私有供应链策略读取来源；未配置私有来源时给出明确提示或确认，不静默把公开源作为私有版默认路径。
- Reason: 避免私有版默认访问公开 registry。
- Impact: 影响 `beacon init` / `beacon update` 启动时版本提示和包更新行为。

**外部能力包安装**
- From: OpenSpec、Superpowers、CodeGraph 的安装命令和手动提示硬编码公开包名或公开仓库来源。
- To: 外部依赖来源通过统一策略生成命令、提示和失败建议，并优先复用已有安装。
- Reason: 让私有 registry、内部镜像或禁用安装成为可验证行为。
- Impact: 影响 init、update、doctor、i18n 文案和相关测试。

**供应链文档与护栏**
- From: README/NEWS 和发布前检查仍允许公开安装命令、旧平台矩阵和公开 registry 作为默认叙事残留。
- To: 供应链相关文档与私有策略一致，并增加测试或 prepublish 检查防止回退。
- Reason: 防止实现已私有化但用户说明仍把用户带向公开源。
- Impact: 影响 README、NEWS、prepublish 检查和文档测试。

## Capabilities

### New Capabilities

- `private-supply-chain`: 定义 Beacon 私有版包更新、版本检查、外部能力包安装来源和相关文档/测试护栏的行为边界。

### Modified Capabilities

- 无。

## Impact

- Affected code: `src/commands/init.ts`, `src/commands/update.ts`, `src/commands/doctor.ts`, `src/commands/i18n.ts`, `src/core/version.ts`, `src/core/openspec.ts`, `src/core/superpowers.ts`, `src/core/codegraph.ts`
- Affected scripts: `scripts/prepublish-check.js`
- Affected docs: `README.md`, `NEWS.md`, `docs/PRIVATE-FEATURE-MODULES.md`
- Affected tests: `test/ts/update.test.ts`, `test/ts/version.test.ts`, `test/ts/openspec.test.ts`, `test/ts/superpowers.test.ts`, `test/ts/codegraph.test.ts`, `test/ts/doctor.test.ts`, `test/ts/readme.test.ts`
- Dependencies: no new runtime dependency expected
