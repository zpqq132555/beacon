## Context

当前仓库没有活动中的 OpenSpec change，且 `openspec/specs/` 已经承担 canonical 规范的长期维护职责。在这层主线规范里，`agents-document-topology`、`agents-tree-maintenance`、`archive-agents-sedimentation`、`human-documentation-localization` 四份 spec 仍保留归档时生成的 `Purpose: TBD` 占位文案，说明归档产物虽然已经进入主线，但没有完成最后一层语义收口。

这类问题的影响不在运行时代码，而在规范可信度。主线 spec 一旦保留占位文案，后续阅读者无法快速判断 capability 的长期职责，也意味着 archive 后缺少针对主线文本完整性的显式 guard。由于现有上下文已经足够来自对应 archive proposal/design，本次设计应优先选择低风险、局部、可验证的修复方式，而不是扩大成归档流程重做。

## Goals / Non-Goals

**Goals:**
- 回填 4 份 canonical spec 的 `## Purpose`，使其能独立表达对应 capability 的职责。
- 为主线 `openspec/specs/**/spec.md` 增加一层自动化约束，阻止归档占位文案再次残留。
- 将本次改动范围控制在 OpenSpec 规范文本与测试 guard 层，保持低风险、易验证。

**Non-Goals:**
- 不调整已有 capability 的 Requirement 语义内容，除非为补 Purpose 所必需。
- 不重写 `beacon-archive.sh` 或 OpenSpec schema 的归档机制。
- 不扩大为一次通用的“所有 spec 文风统一”或“批量文案润色”工作。

## Decisions

### D1：新增独立 capability `canonical-spec-completeness`
- **选择**：使用一个新的 capability 来承载“canonical spec 不得残留占位式 Purpose，并且必须有自动化 guard”的要求。
- **理由**：本次问题本质上是主线规范完整性约束，而不是四个既有 capability 的运行时行为变化。单独建一个 capability，能把修复目标表达得更清晰，也避免把“主线文档卫生”硬塞进原有能力语义里。
- **已考虑 alternative**：把需求拆散到 4 个既有 spec 中逐个补 Requirement。拒绝原因是这些 capability 本身并不负责“主线 spec 维护卫生”，这样会让约束分散且难以复用。

### D2：本次只回填受影响 canonical spec 的 Purpose，不扩写其他章节
- **选择**：仅修复 4 份受影响 spec 的 `## Purpose`，其余章节维持最小必要改动。
- **理由**：问题点明确集中在 Purpose 占位，最小改动能降低误改风险，也符合“精准修改”的仓库约束。
- **已考虑 alternative**：顺手统一这些 spec 的措辞、结构或 Requirement 表达。拒绝原因是会扩大变更范围，降低可审查性。

### D3：防回归 guard 优先落在自动化测试层
- **选择**：新增或扩展 TypeScript 测试，扫描 `openspec/specs/**/spec.md`，阻止 `Purpose: TBD` 或 `TBD - created by archiving change...` 一类占位文案进入主线。
- **理由**：测试层 guard 足够覆盖当前需求，改动轻、可验证、不会改变归档主流程；如果未来发现问题持续来自脚本生成逻辑，再考虑把校验前移到 archive 过程。
- **已考虑 alternative**：直接修改 `beacon-archive.sh`，在 archive 时强制失败。拒绝原因是当前证据不足以证明问题一定来自脚本路径，先在测试层兜底更保守。

### D4：Purpose 内容来源于既有 archive 工件，而不是重新发明表述
- **选择**：四份 spec 的 Purpose 从对应 archive change 的 proposal/design 中提炼，要求与现有 Requirement 保持一致。
- **理由**：这些 capability 已经完成归档，最可信的上下文就是当时冻结下来的工件。这样可以减少新的解释漂移。
- **已考虑 alternative**：仅根据当前 spec Requirement 逆向总结 Purpose。拒绝原因是容易丢失 change 当时明确的范围和动机。

## Risks / Trade-offs

- [Risk] 新增 guard 只在测试层，无法阻止开发者在本地手工留下占位文案后暂不跑测试。→ Mitigation: 将校验接入现有测试路径，确保 CI 能稳定拦截，并让失败信息直接指向具体 spec 文件。
- [Risk] 回填 Purpose 时可能引入与 Requirement 不一致的概括。→ Mitigation: Purpose 只写职责和边界，不重述实现细节，并以对应 archive proposal/design 为依据交叉核对。
- [Trade-off] 本次不修改归档脚本，意味着根因修复不是最前置的。→ 接受理由：当前更重要的是先恢复 canonical spec 的完整性，并用低风险 guard 防止复发；若后续再次出现，可再单独处理生成链路。

## Migration Plan

1. 新增 change 内的 `canonical-spec-completeness` spec，定义主线 spec Purpose 完整性与自动化 guard 要求。
2. 回填 4 份受影响 canonical spec 的 `## Purpose`。
3. 补充或更新测试，扫描 `openspec/specs/**/spec.md` 中的归档占位文案。
4. 运行相关测试，确认新的 guard 能覆盖当前 4 份 spec 且不会误伤其他主线 spec。

Rollback:
- 若 guard 造成误报，可先保留 Purpose 回填，仅回退新增的测试断言。
- 若某份 Purpose 表述与既有语义不一致，可单独修正文案，无需回退整套 change。

## Open Questions

无。当前范围、实现层级与验证方式已足够明确，可直接进入实现。
