---
name: beacon-init
description: "Beacon 辅助技能：维护项目级 AGENTS 树。用于手动全量维护，或被 archive 在确认后转调。"
---

# Beacon Init

**立即执行：** 使用 Skill 工具加载 `brainstorming` 技能。禁止跳过此步骤。

技能加载后：
- 读取当前工作区现状，可将未提交改动纳入本次维护依据。
- 先输出 AGENTS 维护的摘要级建议，再等待用户确认后执行创建、更新、合并、迁移或删除。
- 根 `AGENTS.md` 保持精简，只保留全局入口、关键命令、高价值注意事项和 AGENTS Map。
- 手动调用时按当前工作区做 AGENTS 树的全量维护，而不是只处理单个目录。
- 若现有 AGENTS 树存在重复、职责失配或层级不合理，可以提出结构优化建议。
- 按 `beacon/reference/agents-topology.md` 决定根 `AGENTS.md`、目录级 `AGENTS.md`、`[职责].md` 和更深层节点的准入边界。
- 按 `beacon/reference/agents-sedimentation.md` 区分手动全量维护与 archive 转调时的增量沉淀策略。
- `CLAUDE.md` 只作为 shim，通过 `@AGENTS.md` 引用，不复制同一套规则内容。
