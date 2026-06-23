## Why

当前仓库仍以 Comet 运行合同为核心，包名、CLI、skills、scripts、manifest、状态文件和测试夹具都在使用 `comet` 命名。Beacon 已明确定位为基于 Comet 的私有化二开项目，且不需要兼容旧 Comet 合同。现在必须先完成外部运行合同的 Beacon 化，否则后续功能裁剪、完善和新增都会持续背负双命名、遗漏和安装产物割裂风险。

## What Changes

**Package and CLI Identity**
- From: package name、bin、CLI help 和命令说明使用 Comet。
- To: package name 和唯一 bin 使用 `beacon`，CLI help、description、错误提示和操作建议使用 Beacon。
- Reason: Beacon 是私有化二开项目，需要以独立产品身份运行。
- Impact: breaking；不再提供 `comet` CLI 入口。

**Installed Skill and Script Contracts**
- From: 安装产物使用 `/comet-*` skills、`comet/scripts/comet-*.sh`、Comet rules/hooks。
- To: 安装产物使用 `/beacon-*` skills、`beacon/scripts/beacon-*.sh`、Beacon rules/hooks。
- Reason: 新项目不兼容旧 Comet，安装产物必须和 Beacon 运行身份一致。
- Impact: breaking；旧 `/comet-*` skill 和脚本路径不再作为有效入口。

**Workflow State Contract**
- From: workflow 状态读取 `.comet.yaml`，status/doctor/guard/archive 等逻辑输出 Comet 阶段命令。
- To: workflow 状态只读取和写入 `.beacon.yaml`，next command 使用 `/beacon-*`。
- Reason: 状态文件是运行合同的一部分，必须断开 Comet 兼容。
- Impact: breaking；旧 `.comet.yaml` 不迁移、不读取。

**Documentation and Test Contracts**
- From: README、NEWS、CHANGELOG、CLI i18n、tests 中存在 Comet 操作说明和断言。
- To: 操作说明、测试夹具和运行断言统一为 Beacon；Comet 只允许出现在来源说明或历史记录中。
- Reason: 文档和测试必须验证 Beacon 合同，而不是继续固化 Comet 行为。
- Impact: non-breaking for new Beacon users；历史文本可保留来源语境。

## Capabilities

### New Capabilities
- `beacon-runtime-contracts`: 定义 Beacon 对外运行合同，包括 CLI 身份、安装产物命名、workflow 状态文件、阶段命令、文档和测试中的 Beacon 行为。

### Modified Capabilities

无。当前 `openspec/specs/` 中没有既有 capability，本 change 新增 Beacon 运行合同规范。

## Impact

受影响范围包括 `package.json`、`package-lock.json`、`pnpm-lock.yaml`、`src/cli`、`src/commands`、`src/core`、`assets/manifest.json`、`assets/skills*`、shell scripts、rules/hooks、README/NEWS/CHANGELOG 和相关测试。该 change 不新增功能，不重设五阶段 workflow，不迁移旧 `.comet.yaml`，只完成 Beacon 私有化二开的外部合同切换。
