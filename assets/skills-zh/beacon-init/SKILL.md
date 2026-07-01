---
name: beacon-init
description: "Beacon 辅助技能：维护项目级 AGENTS 树。用于手动全量维护，或被 archive 在确认后转调。"
---

# Beacon Init

**立即执行：** 使用 Skill 工具加载 `brainstorming` 技能。禁止跳过此步骤。

技能加载后：
- 读取当前工作区现状，可将未提交改动纳入本次维护依据。
- 先输出 AGENTS 维护的摘要级建议，再等待用户确认后执行创建、更新、合并、迁移或删除。
- 将 `/beacon-init` 视为当前工作区的 AGENTS 树全量维护入口；若现有结构重复、职责失配或层级不合理，可一并提出结构优化建议。
- 根 `AGENTS.md` 保持精简，只保留全局入口、关键命令、高价值注意事项和 AGENTS Map；`CLAUDE.md` 只作为 `@AGENTS.md` 的 shim。
- 按 `beacon/reference/agents-topology.md` 处理分层规则，按 `beacon/reference/agents-sedimentation.md` 处理 archive 转调时的沉淀策略。
