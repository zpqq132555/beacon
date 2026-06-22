# Beacon 私有化二开全量改名设计

日期：2026-06-22

## 背景

Beacon 是基于 Comet 的私有化二开项目。Comet 只作为来源项目和历史背景存在，不作为 Beacon 的运行合同存在。

本设计不依赖任何功能筛选台账、编号、批次或审查结论。第一轮改造只基于当前仓库真实代码、现有 Comet 能力，以及已确认的 Beacon 私有化边界。

## 已确认决策

- Beacon 使用 `beacon` 作为 package name 和唯一 CLI bin。
- Beacon 不兼容旧 Comet 运行合同。
- 不提供 `comet` bin、`/comet-*` skill alias 或 `.comet.yaml` 读取兼容。
- 新状态文件统一使用 `.beacon.yaml`。
- 新 skill、script、rule、hook、manifest 路径统一使用 Beacon 命名。
- 文档中只有来源说明或致谢可以提到 Comet，操作说明不使用 Comet 命名。

## 改造策略

采用“外部合同优先 Beacon 化”的策略。

第一轮必须改完所有会被用户输入、安装到项目、写入磁盘、被脚本调用、被测试断言的外部合同。内部 TypeScript 函数和变量可以同步改名，但不为了命名洁癖扩大风险。验收以外部行为一致为准。

不采用简单全文替换。脚本、manifest、hook、状态文件和测试之间存在路径依赖，必须按运行链路改。

## 改造分层

### CLI 层

`package.json` 和 `src/cli/index.ts` 成为 Beacon 的唯一入口。

- package name 改为 `beacon`。
- bin 只暴露 `beacon`。
- CLI name、description、help、命令说明和错误提示输出 Beacon。
- 不保留 `comet` bin。

### 安装资产层

`assets/skills*`、`assets/manifest.json`、rules、hooks、scripts 全部切换到 Beacon 命名。

目标安装产物只能包含：

- `/beacon`
- `/beacon-open`
- `/beacon-design`
- `/beacon-build`
- `/beacon-verify`
- `/beacon-archive`
- `/beacon-hotfix`
- `/beacon-tweak`
- `beacon/scripts/beacon-*.sh`
- Beacon rules/hooks

新安装产物不包含 `/comet-*` 或 `comet/scripts/comet-*.sh`。

### 状态合同层

所有状态读写只认 `.beacon.yaml`。

受影响位置包括：

- `beacon status`
- `beacon doctor`
- state script
- guard script
- handoff script
- archive script
- hook guard
- shell/TypeScript 测试样例

`status` 根据 `.beacon.yaml` 的 `phase` 输出 `/beacon-open`、`/beacon-design`、`/beacon-build`、`/beacon-verify` 或 `/beacon-archive`。

### 文案和文档层

README、NEWS、CHANGELOG、CLI i18n、skill 文案统一写 Beacon。Comet 只作为来源项目在必要位置出现。

README 第一轮目标是避免用户按文档执行出 Comet 命令；完整品牌叙事可以后续继续完善。

### 内部代码命名层

低风险内部命名可以同步改，例如 `copyCometSkillsForPlatform` 改为 `copyBeaconSkillsForPlatform`。如果某些内部重命名会造成大范围无行为收益的 churn，可以留到后续清理。

## 运行数据流

### `beacon init`

```text
package/bin beacon
  -> init 选择安装范围、平台、语言
  -> 读取 assets/manifest.json
  -> 复制 assets/skills-zh/beacon* 或 assets/skills/beacon*
  -> 写入平台 rules/hooks 中的 Beacon 路径
  -> 创建工作目录
```

第一轮保持现有 init 交互模型，不新增功能。

### `/beacon` workflow 与 `beacon status`

```text
/beacon 或 beacon status
  -> 查找 openspec/changes/*
  -> 只读取 .beacon.yaml
  -> 根据 phase 生成 /beacon-open|design|build|verify|archive
  -> guard/state/handoff/archive 脚本只读写 .beacon.yaml
```

旧 `.comet.yaml` 文件不会被读取或迁移。

### `beacon doctor`

```text
beacon doctor
  -> 检查 Beacon skills/rules/hooks 是否完整
  -> 检查 beacon scripts 是否存在
  -> 检查 .beacon.yaml 字段是否合法
  -> 输出修复建议 run: beacon init
```

## 测试与验收

自动化验证：

- `pnpm build`
- `pnpm test`
- 脚本相关 Vitest 用例同步改为 Beacon 语义并通过。

手工验收：

- `node dist/cli/index.js --help` 显示 `beacon`。
- `node dist/cli/index.js status --json` 不再输出 `/comet-*`。
- 新 manifest 中不再引用 `comet-*` 安装路径。
- 新状态读写只使用 `.beacon.yaml`。
- 新 hooks/rules/scripts 路径只使用 Beacon 命名。
- 历史 changelog 或来源说明中允许保留 `Comet`，运行说明不出现 Comet 命令。

## 风险与控制

最大风险是脚本和安装产物之间的路径合同不一致。

控制方式：

- 先改 manifest 和资产路径，再改复制逻辑。
- 按脚本依赖链同步改名和内部调用。
- 同步更新测试夹具，避免测试仍在验证 Comet 合同。
- 搜索残留时区分“历史说明允许出现”和“运行合同不得出现”。

## 非目标

- 不新增 Beacon 新功能。
- 不重新设计五阶段 workflow。
- 不做旧 Comet 状态迁移。
- 不兼容旧 `/comet-*` skill。
- 不根据任何功能筛选台账决定保留或删除功能。

## 后续实施建议

实施 change 可以命名为 `rebrand-comet-to-beacon` 或 `privatize-beacon-runtime-contracts`。

建议任务顺序：

1. 改 package/bin/CLI 文案。
2. 重命名 assets 目录、manifest、skills、rules、scripts。
3. 改状态文件合同为 `.beacon.yaml`。
4. 改 doctor/status/init/update/uninstall 输出和内部路径。
5. 同步测试夹具和断言。
6. 更新 README/NEWS/CHANGELOG。
7. 运行完整验证并检查运行合同残留。
