## Context

Beacon 当前已经具备私有供应链的基础能力：可以从 `.beacon/config.yaml` 或环境变量读取 Beacon 包来源，可以按项目或全局范围更新 Beacon 包，并刷新已安装平台里的 skills / rules / hooks。README 也已经说明可以通过团队内部 npm registry 安装 Beacon，然后执行 `beacon init`。

问题不在“做不到”，而在“合同不完整”。团队还缺少一份正式定义，说明：

- 私有版 Beacon 首选如何在项目中接入
- 当只有 Beacon 自身完成私有化时，首期允许怎样的外部依赖策略
- `beacon update` 在项目升级中的职责边界是什么
- 项目回滚时应如何让 npm 依赖版本与已复制的安装资产重新一致

现有 `private-supply-chain` spec 主要描述“来源配置与提示行为”，本 change 要补的是“私有供应链在项目层面的落地流程合同”。

## Goals / Non-Goals

**Goals:**

- 定义 Beacon 私有版的首选项目级接入方式
- 定义项目最小 Beacon 私有供应链配置键
- 定义“依赖升级 + `beacon update` + `beacon doctor`”的项目升级流程
- 定义与升级对称的 Beacon 项目回滚流程
- 明确首期只私有化 `beacon` 时，其他外部依赖不构成接入阻塞

**Non-Goals:**

- 不在本 change 中要求同时私有化 OpenSpec、Superpowers、CodeGraph
- 不把全局安装作为首选团队模式
- 不实现统一强推或自动升级机制
- 不改动 Beacon 五阶段工作流、skills 结构或状态机
- 不把企业内 CI、审批和权限治理一并纳入本次能力边界

## Decisions

### D1：项目级依赖是正式支持的私有版接入路径

- **选择**：Beacon 私有版 MUST 支持以下主路径：项目将 Beacon 作为项目级依赖安装，然后通过 `beacon init --scope project` 初始化。
- **理由**：项目级依赖最适合企业内版本管理、回滚和多项目并行维护，也与当前 `detectBeaconPackageScope()` 的能力保持一致。
- **拒绝的替代方案**：以全局安装为主。原因是团队环境不一致时更难复现问题，也不利于逐项目控版本。

### D2：首期最小供应链合同只约束 Beacon 自身

- **选择**：首期项目接入只要求配置 Beacon 自身的三项来源键：`supply_chain.beacon.package`、`supply_chain.beacon.registry`、`supply_chain.beacon.latest_metadata_url`。
- **理由**：这三项已经足够支持 Beacon 包安装、版本检查和 update 命令构造；可以先保证主路径可落地，再单独扩展其他依赖的私有化。
- **拒绝的替代方案**：要求项目接入前一次性配齐 OpenSpec / Superpowers / CodeGraph 的私有来源。原因是会把首期门槛抬高，阻塞实际使用。

### D3：外部依赖在首期是可选能力，不是接入阻塞项

- **选择**：当项目还未私有化 OpenSpec、Superpowers、CodeGraph 时，Beacon 接入仍可完成；这些依赖可以跳过、复用已有安装或由管理员预装。
- **理由**：用户当前需求是“Beacon 已部分私有化，如何先在项目中使用”，因此合同必须允许渐进式落地。
- **拒绝的替代方案**：将外部依赖全部视为接入前置条件。原因是与用户已确认的首期范围冲突。

### D4：项目升级必须同时刷新 npm 依赖和平台安装资产

- **选择**：Beacon 项目升级 MUST 由两部分组成：
  1. 升级项目依赖里的 Beacon 版本
  2. 执行 `beacon update` 刷新已安装目标中的 Beacon skills / rules / hooks
  完成后再执行 `beacon doctor` 验证结果。
- **理由**：当前实现中，CLI 包与已复制到平台目录的安装资产是两个层面；只升级其一会导致行为漂移。
- **拒绝的替代方案**：仅升级 npm 依赖。原因是这不能保证项目内平台资产同步到同一版本语义。

### D5：`beacon update` 只负责“刷新已有安装”，不负责“新增安装”

- **选择**：合同必须明确 `beacon update` 的边界：它只更新已安装过 Beacon skills 的目标，不负责新增平台、不负责首次安装、也不负责切换 scope。
- **理由**：这是当前 `detectInstalledBeaconTargets()` 的真实行为，文档和 spec 需要反映它，而不是给用户错误预期。
- **拒绝的替代方案**：把 `update` 视为通用安装入口。原因是会模糊 `init` 与 `update` 的职责边界。

### D6：项目回滚与升级对称

- **选择**：Beacon 项目回滚 MUST 与升级流程对称：回退 Beacon 依赖版本后，再执行 `beacon update` 与 `beacon doctor`。
- **理由**：这样既回退 CLI 包，也回退已复制到平台目录的 Beacon 资产，便于恢复一致状态。
- **拒绝的替代方案**：仅修改 `package.json` 或 lockfile。原因是平台目录中的 skills / rules / hooks 仍会保留较新版本内容。

## Risks / Trade-offs

- [Risk] 如果项目没有显式配置 Beacon 私有 registry，当前实现可能退回到开发者本机的 npm 默认源。  
  Mitigation: 在接入合同中把最小 `.beacon/config.yaml` 视为正式前置条件，并要求接入后运行 `beacon doctor`。

- [Risk] 如果项目升级后没有执行 `beacon update`，CLI 与安装资产会脱节。  
  Mitigation: 将 `beacon update` 明确写入升级和回滚 SOP，并在文档中强调这是必须步骤。

- [Risk] 如果项目使用过宽的版本范围，例如 `^`，可能在非预期时机引入行为变化。  
  Mitigation: 首期推荐精确版本或 `~` 范围。

- [Trade-off] 首期不强制私有化 OpenSpec / Superpowers / CodeGraph，会保留部分外部依赖治理空白。  
  Mitigation: 将其视为第二阶段供应链私有化工作，而不是阻塞 Beacon 首期落地。

## Migration Plan

1. 在 `private-supply-chain` capability 中新增“项目级接入”“手动升级”“对称回滚” requirement
2. 更新 README、NEWS 或等价文档，明确首选项目级依赖路径和最小配置模板
3. 视需要补充 `doctor`、`update` 或 README 相关测试，固定项目 rollout 合同
4. 后续如要进一步严格私有化，再单独扩展 OpenSpec / Superpowers / CodeGraph 的二阶段能力

Rollback:

- 本次 change 仅定义能力合同；若未来实现不采纳该合同，可撤回相应 requirement 与文档更新，不涉及运行时数据迁移

## Open Questions

- 接入阶段是否需要额外提供一个“私有供应链配置完整性”检查命令或 doctor 子项，以比当前 doctor 更强地约束最小三键存在
- 是否要在后续实现中把“未配置 Beacon 私有 registry”从非致命提示提升为更明确的阻断或确认步骤
- 第二阶段是否继续沿用 `private-supply-chain` capability 扩展 OpenSpec / Superpowers / CodeGraph 私有化，还是届时拆出更细的 capability
