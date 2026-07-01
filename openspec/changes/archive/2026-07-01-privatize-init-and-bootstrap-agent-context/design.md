## Context

Beacon 私有版已经完成运行时命名私有化、支持平台范围收敛和私有供应链第一阶段落地，但 `beacon init` 仍保留两类与目标不一致的行为：一是用户可见入口仍有旧时期品牌残留，二是运行时分发仍围绕双语技能模型组织。现在团队又进一步确认，`AGENTS.md / CLAUDE.md` 的维护虽然有价值，但它属于 AI 介入后的 skill 能力，不应继续放在 CLI `init` 阶段。

## Goals / Non-Goals

**Goals:**
- 让 `beacon init` 的用户可见品牌输出完全对齐 Beacon 私有版身份。
- 将运行时技能分发从双语模式收敛为中文单轨，并移除语言选择合同。
- 保持 `beacon init --scope project` 只负责创建工作目录与平台资产，不负责项目文档初始化。

**Non-Goals:**
- 不在本次 change 中实现 `AGENTS.md / CLAUDE.md` 的生成、扫描、合并或维护。
- 不在本次 change 中继续扩展私有供应链项目级 rollout。
- 不改变 Beacon 五阶段工作流本身的阶段语义。

## Decisions

### D1：运行时技能分发改为中文单轨
- **选择**：`init` 与 `update` 的运行时分发统一只使用中文技能资产，不再向用户暴露语言选择。
- **理由**：私有版后续明确只维护中文运行时资产，继续保留双语分发会扩大 CLI 参数面、资产目录面和测试矩阵。
- **已考虑 alternative**：保留 `--language zh` 作为兼容参数。拒绝原因是会继续暗示未来存在多语言分发合同，不利于边界收口。

### D2：统一 Beacon 私有版入口品牌
- **选择**：`init` banner、CLI 帮助和用户可见说明统一收敛到 Beacon 品牌，不再保留旧时期名称残留。
- **理由**：首次接入的心智模型应当稳定，不应让安装入口继续暴露历史品牌。

### D3：将 Agent 上下文初始化从 CLI 中剥离
- **选择**：本次 change 不在 `beacon init` 中创建 `AGENTS.md` 或 `CLAUDE.md`，相关能力延期到后续独立 skill。
- **理由**：CLI init 阶段并没有 AI 参与，项目上下文维护更适合在 AI 能扫描项目、对话确认和持续维护时实现。
- **已考虑 alternative**：在 `scope=project` 下保留自动生成。拒绝原因是容易把 CLI 安装职责和 AI 协作职责混在一起，继续固化错误边界。

## Risks / Trade-offs

- [Risk] 去掉语言参数后，现有依赖双语分发的测试和文档可能出现回归。
  Mitigation: 将 `init`、`update`、`skills`、README/NEWS 回归测试一起收口，避免只改一半合同。
- [Trade-off] `init` 不再替目标项目初始化 AI 上下文，项目接入后仍需要后续 skill 补齐这部分能力。
  接受理由：这是职责边界更清晰的拆分，避免 CLI 阶段提前固化错误模板和错误交互模型。

## Migration Plan

1. 收紧 `init` 与 `update` 的 CLI 参数面和分发逻辑，去掉用户可见语言切换入口，改成中文单轨资产来源。
2. 修正 `init` 入口 banner、帮助文档和相关文档中的品牌残留，并同步断言测试。
3. 移除 CLI `init` 中已接入的 `AGENTS.md / CLAUDE.md` 初始化逻辑、JSON 输出与回归测试。

Rollback:
- 若品牌或语言收口行为不符合预期，可恢复 CLI 参数和双语分发逻辑。
- 本 change 不再引入目标项目文档写入，因此无需为 `AGENTS.md / CLAUDE.md` 设计额外回滚路径。

## Open Questions

- 后续独立 skill 的命名、触发方式和维护策略如何设计。
- `AGENTS.md` 的结构、模板粒度和增量维护方式是否需要单独 capability/change。
