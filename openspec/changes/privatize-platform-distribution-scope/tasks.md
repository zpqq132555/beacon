## 1. Platform Scope

- [ ] 1.1 收敛 `src/core/platforms.ts`，仅保留 Codex、Cursor、Claude Code、Trae 的首批私有版平台定义。
- [ ] 1.2 同步平台检测逻辑，确保自动检测和候选平台只围绕首批四个平台。
- [ ] 1.3 同步 OpenSpec tool id 和 Superpowers agent 映射，移除不再支持平台的首批私有版映射要求。

## 2. CLI Distribution Behavior

- [ ] 2.1 更新 `beacon init` 的平台选择、已安装组件检测和安装摘要，使其符合四平台范围。
- [ ] 2.2 更新 `beacon doctor` 的平台完整性诊断，使其只报告四平台范围。
- [ ] 2.3 更新 `beacon update` 的已安装目标检测和刷新逻辑，使其遵守四平台范围。
- [ ] 2.4 更新 `beacon uninstall` 的目标检测和卸载逻辑，使其遵守四平台范围。

## 3. Assets and Documentation

- [ ] 3.1 检查 Beacon skills、rules、hooks 分发逻辑，确保四平台范围下资产复制和移除行为一致。
- [ ] 3.2 更新 README 和相关文档中的支持平台说明。
- [ ] 3.3 更新 `docs/PRIVATE-FEATURE-MODULES.md` 中 M04、M05、M14、M18、M19 相关私有化状态。

## 4. Tests and Verification

- [ ] 4.1 更新平台数量、平台 id、目录映射、OpenSpec 映射和 Superpowers 映射相关测试。
- [ ] 4.2 更新 init、doctor、update、uninstall 中依赖平台范围的测试。
- [ ] 4.3 运行 targeted tests 覆盖平台分发路径。
- [ ] 4.4 运行全量测试，确认平台收敛没有破坏非平台工作流。
