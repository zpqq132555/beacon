## 1. 主线 spec Purpose 回填

- [x] 1.1 从对应 archive proposal/design 提炼 4 份 canonical spec 的稳定 Purpose 表述
- [x] 1.2 更新 `agents-document-topology`、`agents-tree-maintenance`、`archive-agents-sedimentation`、`human-documentation-localization` 的 `## Purpose`
- [x] 1.3 复核回填后的 Purpose 与各自 Requirement 边界一致，避免引入新的语义漂移

## 2. 完整性 guard 落地

- [x] 2.1 找到最合适的现有 TypeScript 测试入口，补充主线 spec Purpose 占位扫描断言
- [x] 2.2 让失败信息能明确指出残留占位的 spec 文件，便于后续维护定位
- [x] 2.3 确认 guard 只约束 `openspec/specs/**/spec.md`，不误伤 archive change 工件

## 3. 验证与收口

- [x] 3.1 运行相关测试，验证 4 份 spec 的 Purpose 已通过 guard
- [x] 3.2 自检本次 change 工件与实现结果一致，并补齐必要的 Changelog/版本决策
