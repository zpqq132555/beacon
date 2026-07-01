## Why

当前 `private-supply-chain` capability 已经定义了 Beacon 私有版如何读取私有来源、构造更新命令、避免把公共 npm 或 GitHub 来源当作私有默认值，但它仍缺少团队真正落地时最需要的那层合同：

- Beacon 在项目里应该以什么方式接入
- 首期只私有化 `beacon` 时，OpenSpec / Superpowers / CodeGraph 应该如何处理
- 项目后续如何升级 Beacon 版本并刷新已安装资产
- 如果升级不合适，如何做对称回滚

没有这层合同，团队虽然“技术上能用”，却仍会在接入路径、升级节奏、回滚边界和项目模板上各自理解，导致私有版行为不稳定、文档与实际流程脱节。

## What Changes

**项目级接入合同**
- From: 仓库已有 `beacon init --scope project` 和供应链配置能力，但 `private-supply-chain` 没有正式要求项目级依赖、最小配置键和接入后验证步骤。
- To: 明确 Beacon 私有版首选通过项目级依赖接入，并定义最小 `.beacon/config.yaml` 合同、`beacon init --scope project` 初始化路径，以及 `beacon doctor` 作为接入验收步骤。
- Reason: 把“可以这样做”升级为“正式支持且可验证的企业内接入方式”。

**手动升级合同**
- From: `beacon update` 已能刷新已安装目标里的 Beacon 资产，但 capability 没有正式规定项目升级时必须同时升级 npm 依赖与刷新 skills / rules / hooks。
- To: 明确项目升级由“依赖版本升级 + `beacon update` + `beacon doctor`”组成，并说明 `update` 只刷新已有安装目标，不承担新增安装职责。
- Reason: 避免 CLI 版本与项目内已复制资产脱节。

**对称回滚合同**
- From: 现有行为支持回滚，但 capability 没有把回滚路径明确成正式流程。
- To: 明确项目回滚必须与升级对称，回退依赖版本后再次执行 `beacon update` 与 `beacon doctor`。
- Reason: 让 Beacon 在企业内接入中具备可预测的恢复路径。

**首期私有化边界**
- From: 团队可能把 OpenSpec / Superpowers / CodeGraph 是否完成私有化误解为 Beacon 接入前置条件。
- To: 明确首期只要求 `beacon` 私有化，外部依赖保留可选安装或管理员预装，不构成项目接入阻塞。
- Reason: 保持首期范围可落地，避免把供应链治理目标做大。

## Capabilities

### Modified Capabilities

- `private-supply-chain`: 增补 Beacon 私有版的项目级接入、手动升级和回滚合同，使私有供应链能力从“来源配置”扩展到“项目落地流程”。

## Impact

- Affected spec: `openspec/specs/private-supply-chain/spec.md`
- Affected future docs: `README.md`, `NEWS.md`, 可能还包括项目接入模板说明
- Affected future commands/messages: `beacon init`, `beacon update`, `beacon doctor`
- Affected future tests: `update`, `doctor`, `README` 或相关供应链行为测试
- Dependencies: 不要求首期新增运行时依赖；首期重点是正式化已有行为与文档边界
