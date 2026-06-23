## 1. 文档范围确认

- [x] 1.1 重新扫描根目录、`docs/` 和 `.github/` 中的普通 Markdown 文档，确认本次会处理的文件清单。
- [x] 1.2 确认 `assets/skills/**`、`assets/skills-zh/**`、`openspec/**` 和 `.beacon/private-notes/legacy-feature-inventories/**` 不在实现范围内。
- [x] 1.3 记录普通文档中所有指向语言副本的链接，例如 `README-zh.md`、`CONTRIBUTING-zh.md`。

## 2. 中文 canonical 迁移

- [x] 2.1 将 `README-zh.md` 的有效中文内容迁移到 `README.md`，保留 `README.md` 作为唯一 README 入口。
- [x] 2.2 将 `CONTRIBUTING-zh.md` 的有效中文内容迁移到 `CONTRIBUTING.md`，保留 `CONTRIBUTING.md` 作为唯一贡献指南入口。
- [x] 2.3 将 `.github/PULL_REQUEST_TEMPLATE.md` 调整为中文 PR 模板。
- [x] 2.4 将 `CLAUDE.md` 改为直接引用 `AGENTS.md` 的薄入口，避免重复维护同职责协作说明。
- [x] 2.5 检查 `NEWS.md`、`AGENTS.md` 和 `docs/*.md`，清理普通文档维护策略中的双语残留。

## 3. 语言副本与链接清理

- [x] 3.1 删除普通文档语言副本，例如 `README-zh.md` 和 `CONTRIBUTING-zh.md`。
- [x] 3.2 清理普通文档中的 English/中文版本切换提示。
- [x] 3.3 清理普通文档中指向已删除语言副本的链接。

## 4. 版本历史

- [x] 4.1 查询 master 分支的当前版本，判断本次文档维护策略变更应使用的版本号。
- [x] 4.2 更新 `CHANGELOG.md`，记录普通文档改为单中文维护的行为变化。
- [x] 4.3 确认 `package.json` 的 `version` 与 changelog 顶部版本一致。

## 5. 验证

- [x] 5.1 搜索普通文档，确认不存在 `README-zh.md`、`CONTRIBUTING-zh.md` 等已删除副本引用。
- [x] 5.2 搜索 `CLAUDE.md`，确认它引用 `AGENTS.md` 且不再重复维护完整协作说明。
- [x] 5.3 检查 git diff，确认 `assets/skills*`、`openspec/schemas/**`、`openspec/specs/**` 和 `openspec/changes/archive/**` 未被实现改动修改。
- [x] 5.4 运行适用于纯文档变更的格式或文本检查，并记录无法运行的检查及原因。
