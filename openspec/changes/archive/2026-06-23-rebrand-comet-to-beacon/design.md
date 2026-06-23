## Context

Beacon 是基于 Comet 的私有化二开项目。当前仓库仍保留大量 Comet 运行合同：`comet` bin、`/comet-*` skills、`comet-*.sh` scripts、`.comet.yaml` 状态文件、Comet manifest 路径、Comet CLI 输出和测试夹具。

用户已确认 Beacon 不需要兼容旧 Comet。第一轮改造的核心不是新增功能，而是把会被用户输入、安装到项目、写入磁盘、被脚本调用、被测试断言的外部合同统一切换为 Beacon。

本设计不依赖任何功能筛选台账。台账只可作为历史想法来源，不可作为当前私有化依据。

## Goals / Non-Goals

**Goals:**

- 将 package name 和唯一 CLI bin 改为 `beacon`。
- 将安装产物从 `/comet-*`、`comet/scripts/comet-*.sh` 切换为 `/beacon-*`、`beacon/scripts/beacon-*.sh`。
- 将状态合同从 `.comet.yaml` 切换为 `.beacon.yaml`。
- 将 `status`、`doctor`、guard、state、handoff、archive、hook、tests 中的外部合同统一为 Beacon。
- 确保 README、CLI i18n、测试断言验证 Beacon 行为。

**Non-Goals:**

- 不兼容 `comet` bin。
- 不兼容 `/comet-*` skill alias。
- 不读取、迁移或修复 `.comet.yaml`。
- 不新增 Beacon 新功能。
- 不重新设计五阶段 workflow。
- 不根据功能筛选台账决定功能取舍。

## Decisions

### D1：采用外部合同优先的 Beacon 化

- **选择**：优先改所有用户可见、安装产物、磁盘状态、脚本调用和测试断言中的合同；内部 TypeScript 函数名可低风险同步改，但不为命名洁癖扩大改动。
- **理由**：外部合同不统一会直接影响用户使用和后续二开；内部命名残留的风险低于脚本/manifest 路径不一致。
- **已考虑 alternative**：一次性机械全文替换。拒绝原因是 shell scripts、manifest、hooks 和测试存在路径依赖，机械替换容易破坏调用链。

### D2：断开旧 Comet 兼容

- **选择**：不提供 `comet` bin、`/comet-*` alias 或 `.comet.yaml` 读取兼容。
- **理由**：用户明确不需要兼容；断开兼容可以避免长期维护双合同。
- **已考虑 alternative**：保留兼容别名和状态读取。拒绝原因是会增加实现复杂度，并让后续新增功能继续面对 Comet/Beacon 双语义。

### D3：状态文件统一为 `.beacon.yaml`

- **选择**：所有状态读写只认 `.beacon.yaml`。
- **理由**：状态文件是 workflow 恢复、阶段转换和 guard 的核心合同，必须和 Beacon 身份一致。
- **已考虑 alternative**：继续读取 `.comet.yaml` 并输出迁移提示。拒绝原因是本 change 明确不做旧状态迁移。

### D4：安装资产路径统一 Beacon 命名

- **选择**：重命名 skill 目录、reference、rules、scripts，并同步更新 `assets/manifest.json`。
- **理由**：manifest 是安装文件权威列表，如果它继续指向 Comet 路径，新安装项目仍会携带 Comet 合同。
- **已考虑 alternative**：保留文件路径但改内容文案。拒绝原因是脚本路径和 skill 名称本身就是用户可见合同。

### D5：文档允许来源说明保留 Comet

- **选择**：运行说明不出现 Comet 命令；来源说明、历史 changelog 或致谢可以保留 Comet。
- **理由**：需要避免用户按文档执行旧命令，同时保留 fork 来源的历史事实。
- **已考虑 alternative**：所有文本完全删除 Comet。拒绝原因是历史记录和来源说明中保留 Comet 有助于追溯。

## Risks / Trade-offs

[Risk] shell scripts 之间存在相互调用，重命名后可能漏改内部路径。→ Mitigation: 按脚本依赖链修改，并运行脚本相关 Vitest 用例。

[Risk] `assets/manifest.json` 与实际 assets 路径不一致会导致安装缺文件。→ Mitigation: 先改资产路径和 manifest，再运行安装/复制相关测试。

[Risk] 测试夹具可能仍在验证 Comet 合同，造成假通过。→ Mitigation: 同步更新测试样例和断言，增加残留搜索验收。

[Risk] README/NEWS/CHANGELOG 中的历史 Comet 文本可能和运行说明混在一起。→ Mitigation: 搜索残留时区分历史来源允许项和运行合同禁止项。

[Trade-off] 第一轮不强制清理所有内部 TypeScript 命名。→ 接受理由：外部合同统一是当前成功标准，内部命名可在后续无行为变更清理中处理。

## Migration Plan

1. 修改 package/bin/CLI 文案，使 `beacon` 成为唯一入口。
2. 重命名 `assets/skills*` 下的 skill、reference、rules、scripts，并同步 `assets/manifest.json`。
3. 将状态合同从 `.comet.yaml` 改为 `.beacon.yaml`。
4. 修改 `init`、`status`、`doctor`、`update`、`uninstall` 中的 Beacon 输出和路径逻辑。
5. 同步 shell/TypeScript 测试夹具和断言。
6. 更新 README、NEWS、CHANGELOG，确保运行说明只使用 Beacon。
7. 运行 `pnpm build`、`pnpm test` 和脚本相关测试。
8. 搜索运行合同残留，确认新路径和输出不再使用 Comet。

Rollback 策略：如果验证失败，回退本 change 的改名提交，保留 OpenSpec artifacts 作为下一轮修正依据；不尝试在同一轮中引入兼容层。

验收条件：

- `node dist/cli/index.js --help` 显示 `beacon`。
- `node dist/cli/index.js status --json` 不输出 `/comet-*`。
- 新 manifest 不引用 `comet-*` 安装路径。
- 新状态读写只使用 `.beacon.yaml`。
- 新 hooks/rules/scripts 路径只使用 Beacon 命名。
- 自动化验证通过。

## Open Questions

无。当前 change 的兼容边界、包名和运行合同均已确认。
