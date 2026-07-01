## Why

当前 Beacon 已经明确把 AGENTS 维护从 CLI `init` 中剥离，但项目级 AGENTS 树仍缺少一个独立、可复用、可持续维护的入口。用户既需要在新项目或老项目中手动全量整理 AGENTS，也希望在 archive 阶段按需把高价值规则沉淀到 AGENTS，而不是继续依赖一次性模板或人工长期维护。

## What Changes

**新增独立 AGENTS 维护入口**
- From: Beacon 没有独立 skill 负责项目级 AGENTS 树维护。
- To: 新增独立 skill `/beacon-init`，负责根 `AGENTS.md`、目录级 `AGENTS.md`、职责文档 `[职责].md` 与根 `CLAUDE.md` shim 的创建和更新。
- Reason: 把项目上下文维护从 CLI 安装和主流程调度里解耦，形成可直接调用、也可被 archive 转调的独立能力。
- Impact: 新增 skill、参考文档与配套测试，属于非破坏性能力扩展。

**区分手动全量维护与 archive 增量沉淀**
- From: AGENTS 维护没有按场景区分的行为合同。
- To: `/beacon-init` 支持两种模式：手动调用时按当前工作区做全量维护；archive 阶段按本次归档内容做增量沉淀，并仅在值得沉淀时给出摘要级建议。
- Reason: 手动场景和 archive 场景的上下文来源、风险容忍度和交互成本都不同。
- Impact: 会修改 archive 阶段的协作行为合同，但只在判定“值得沉淀”时才打断用户。

**建立 AGENTS 树分层规则**
- From: 子级文档的组织方式没有统一准入规则，容易出现根文档臃肿或局部规则漂移。
- To: 明确定义根 `AGENTS.md` 只保留全局入口、关键命令、高价值注意事项和 AGENTS Map；目录边界清晰时优先用 `子目录/AGENTS.md`，混合目录时使用 `本地 AGENTS.md + [职责].md`，并允许按职责清晰度渐进下钻。
- Reason: 让 AGENTS 树按职责边界而不是目录深度生长，兼顾清晰度与维护成本。
- Impact: 新增文档拓扑规则，后续 AGENTS 维护和 archive 沉淀都以此为准。

**允许结构优化与删除过时节点**
- From: 已有 AGENTS 树缺少“合并 / 收缩 / 删除旧节点”的正式维护策略。
- To: `/beacon-init` 在手动模式允许建议并执行结构优化，在 archive 模式仅在用户确认后执行；旧 AGENTS 文档不做长期废弃保留，确认后可直接删除。
- Reason: 避免过时文档继续占用模型上下文，把历史追溯交给版本控制系统。
- Impact: 需要明确建议、确认和删除行为合同，并补充删除类验证。

## Capabilities

### New Capabilities
- `agents-tree-maintenance`: 定义 `/beacon-init` 如何创建、更新、合并和删除项目级 AGENTS 树。
- `agents-document-topology`: 定义根 `AGENTS.md`、目录级 `AGENTS.md`、职责文档 `[职责].md` 和更深层级规则的分层准入边界。
- `archive-agents-sedimentation`: 定义 archive 阶段如何判断是否沉淀到 AGENTS、何时静默忽略、何时给出摘要建议并转调 `/beacon-init`。

### Modified Capabilities
- `beacon-runtime-contracts`: 扩展 Beacon 已安装技能入口集合与 archive 阶段可见行为，使 `/beacon-init` 成为受支持的 Beacon 运行时技能之一。

## Impact

- Affected code: `assets/skills-zh/beacon*`, archive 相关技能与参考文档，可能涉及技能分发与测试入口
- Affected docs: `README.md`、`NEWS.md`、协作文档、技能参考文档
- Affected tests: skills、README、archive 行为与 AGENTS 维护相关回归测试
- Affected systems: 手动项目上下文维护流程、archive 阶段的规则沉淀流程、Beacon 技能入口集合
