## 背景

当前仓库已经完成 Beacon 私有化主体改造，但团队仍处于“Beacon 可用、供应链未完全收口”的阶段。用户关心两个实际问题：

1. 现在如果想直接在项目中使用 Beacon，应该怎么接入
2. 后续 Beacon 继续更新时，已经接入的项目应该怎么升级

现有 `private-supply-chain` capability 已覆盖“私有来源如何配置、update/version/install 如何避免把公共源当私有默认值”，但还没有把“项目级接入、项目手动升级、对称回滚”沉淀成正式能力合同。

## 已探索上下文

- `package.json` 当前版本为 `0.4.4`，CLI 入口为 `beacon`
- `README.md` 已说明私有版通过内部 npm registry 安装，并推荐使用 `beacon init`
- `src/core/supply-chain.ts` 已支持从 `.beacon/config.yaml` 和环境变量读取 Beacon / OpenSpec / Superpowers / CodeGraph 的来源配置
- `src/commands/update.ts` 已支持：
  - 根据项目级依赖或本地安装路径判断 project/global scope
  - 刷新已安装目标里的 Beacon skills / rules / hooks
  - 在未配置私有版本元数据源时跳过私有版本检查
- `openspec/specs/private-supply-chain/spec.md` 当前聚焦“私有来源与用户可见提示”，尚未定义项目 rollout 合同

## 决策记录

### Q1. 内部分发形态

- 选项 A：内部 npm 包 / 私有 registry
- 选项 B：离线压缩包
- 选项 C：直接引用源码仓库

**结论：选 A。**

原因：最符合当前仓库已有的 npm/update/init 行为，也最容易与现有 `supply_chain.*` 配置衔接。

### Q2. 下游项目接入方式

- 选项 A：项目级依赖
- 选项 B：开发者全局安装
- 选项 C：两种都支持

**结论：选 A。**

原因：项目级依赖更容易控版本、做回滚、做项目间隔离，也与 `detectBeaconPackageScope()` 当前实现一致。

### Q3. 首期私有化范围

- 选项 A：只先私有化 `beacon`
- 选项 B：`beacon` + OpenSpec
- 选项 C：`beacon` + OpenSpec + Superpowers + CodeGraph

**结论：选 A。**

原因：先解决 Beacon 自身分发与升级链路，避免首期把供应链目标做大；其他依赖先保持可选安装或管理员预装。

### Q4. 升级节奏

- 选项 A：每个项目手动决定何时升级
- 选项 B：平台团队统一推动
- 选项 C：核心项目统一、普通项目自定

**结论：选 A。**

原因：Beacon 涉及 skills / rules / hooks 等行为合同，项目手动升级更稳妥，适合逐项目验证。

### Q5. OpenSpec 建模方式

- 选项 A：仅创建基础 artifacts
- 选项 B：基础 artifacts + delta spec

**结论：选 B。**

原因：这样后续若进入实现和归档，可以直接沿用 OpenSpec 流程，不需要二次补 capability delta。

### Q6. capability 归属

- 选项 A：扩展现有 `private-supply-chain`
- 选项 B：新建独立 capability
- 选项 C：同一个 change 改多个 capability

**结论：选 A。**

原因：本次讨论的核心仍是 Beacon 私有供应链，只是把“项目级接入与升级”补成正式合同，不值得再拆新 capability。

### Q7. 最终 change 建模

- 选项 1：在 `private-supply-chain` 下新增一个 change，并补 delta spec
- 选项 2：只写 artifacts，不补 delta spec
- 选项 3：新开独立 capability

**结论：选 1。**

原因：语义连续、归档自然，也最符合用户明确选择。

## 收敛结果

本 change 聚焦一件事：

为 `private-supply-chain` capability 增补“内部 npm 包发布、项目级接入、项目手动升级与对称回滚”的正式合同，明确首期只私有化 `beacon` 时，下游项目如何安全使用 Beacon，以及后续如何升级与回滚。
