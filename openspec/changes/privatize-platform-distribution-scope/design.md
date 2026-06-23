## Context

Beacon 当前已使用 `beacon` CLI、Beacon skills 和 `.beacon.yaml` 状态合同，但平台分发层仍保留公开发行时期的宽平台支持。平台注册表是后续安装、检测、OpenSpec 初始化、Superpowers 安装、rules/hooks 分发、卸载和文档生成的共同源头。本次私有化从这里切入，先确定首批平台边界，再让其他层跟随。

## Goals / Non-Goals

**Goals:**

- 将私有版首批支持平台限定为 Codex、Cursor、Claude Code、Trae。
- 让平台注册、检测、安装、更新、卸载、诊断、文档和测试一致反映四平台范围。
- 保持四个平台的现有目录、rules、hooks 能力边界可用。
- 保留 Beacon 五阶段工作流、状态机和 archive 行为不变。

**Non-Goals:**

- 不新增 Trae hook。
- 不重写 `/beacon` 工作流策略。
- 不改变 OpenSpec/Superpowers 核心使用方式。
- 不处理 npm 私有 registry 或包名二次改造。
- 不全量重写 README 叙事，只同步平台范围相关内容。

## Decisions

### D1: 以平台注册表作为收敛源头

- **选择**: 从 `src/core/platforms.ts` 收敛首批平台，再同步依赖该注册表的 CLI、安装和测试。
- **理由**: 平台注册表是安装路径、rules/hooks 能力和 OpenSpec tool id 的共同入口，先改这里可以减少后续返工。
- **已考虑 alternative**: 只在 README 或 init 命令中隐藏平台。拒绝原因是底层仍会保留不可见平台，doctor/update/uninstall/test 仍可能暴露旧范围。

### D2: 保留 Codex、Cursor、Claude Code、Trae

- **选择**: 首批私有版只支持这四个平台。
- **理由**: Codex、Cursor、Claude Code 覆盖核心 Agent 使用场景；Trae 作为用户确认的额外平台纳入首批范围。
- **已考虑 alternative**: 只保留 Codex。拒绝原因是团队使用面过窄，后续再加 Cursor/Claude/Trae 会重复调整平台链路。

### D3: Trae 按现有能力纳入

- **选择**: Trae 保留 skills 和 rules 能力，不新增 hook。
- **理由**: 当前 Trae 平台定义已有 `.trae` 路径、global `.trae` 和 rules 支持；强行增加 hook 会扩大本次变更范围。
- **已考虑 alternative**: 为 Trae 补齐 hook。拒绝原因是本次 change 目标是范围收敛，不是新增平台能力。

### D4: 测试断言跟随四平台范围

- **选择**: 所有平台数量、平台 id、映射和文档相关测试同步改为四平台范围。
- **理由**: 私有化边界必须由测试固定，避免后续误把 29 平台加回。
- **已考虑 alternative**: 只改实现，后续再修测试。拒绝原因是会让私有化状态无法可靠验证。

## Risks / Trade-offs

- [Risk] 部分平台特殊适配代码删除或失去覆盖后，未来若恢复平台需要重新评估。Mitigation: 本次只围绕首批平台形成私有版基线，未来新增平台走独立 OpenSpec change。
- [Risk] 文档或测试中残留 29 平台描述。Mitigation: 将 README、测试和台账更新纳入任务和验收。
- [Risk] OpenSpec/Superpowers 映射未同步导致 init 仍暴露旧平台。Mitigation: 平台注册表、能力包映射和测试一起修改。
- [Trade-off] 私有版放弃广泛平台兼容，换取清晰边界和更低维护成本。

## Migration Plan

1. 收敛平台注册表到四平台。
2. 同步平台检测、能力包映射、安装/更新/卸载/诊断输出。
3. 同步 README、平台列表和功能模块台账。
4. 更新测试断言并运行相关测试。
5. 若需要恢复某个平台，后续通过独立 change 增加。

Rollback: 恢复 `src/core/platforms.ts` 和相关映射/测试到改造前状态即可，不涉及数据迁移。

## Open Questions

- 是否需要在后续 change 中将默认安装语言改为中文。
- 是否需要在后续 change 中将依赖安装改为完全离线或内部 registry。
