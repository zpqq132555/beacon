## Context

项目已经转为私有化定制，后续维护重心是中文场景。当前仓库存在普通文档、Skill 运行时提示词、OpenSpec schema/template、当前 spec 和历史 archive 等多类 Markdown。它们都能被人阅读，但维护属性不同：普通文档主要服务用户和维护者理解项目；Skill、schema、template 和 spec 则会影响工具行为、生成内容或历史记录。

用户目标是降低普通文档的多语言维护成本，并明确要求暂不处理项目中跟功能有关的语言资产。因此本设计将“普通人读文档”限定为根目录、`docs/` 和 `.github/` 中面向用户/维护者的说明文档；不把 `assets/skills*`、`openspec/**` 和私有留存资料纳入本次改动。

## Goals / Non-Goals

**Goals:**

- 将普通人读文档收敛为单一中文 canonical 版本。
- 保留生态默认入口文件名，例如 `README.md` 和 `CONTRIBUTING.md`。
- 删除或停止维护 `*-zh.md` 这类普通文档语言副本。
- 清理普通文档中的语言切换链接和指向已删除语言副本的链接。
- 将 `CLAUDE.md` 收敛为直接引用 `AGENTS.md` 的薄入口，避免两份相同职责的协作说明重复维护。
- 更新 changelog，并按项目规则判断版本号。

**Non-Goals:**

- 不删除、不中文化 `assets/skills/**` 和 `assets/skills-zh/**` 的运行时 Skill 内容。
- 不修改 OpenSpec schema、template、当前 spec 或 archive 历史制品。
- 不读取或处理 `.beacon/private-notes/legacy-feature-inventories/**`。
- 不改变 CLI、安装流程、Skill 分发逻辑或用户可见命令行为。

## Decisions

### D1：保留标准入口文件名，内容改为中文 canonical

- **选择**：保留 `README.md`、`CONTRIBUTING.md` 等标准入口文件名，并将其作为唯一中文维护版本。
- **理由**：GitHub、npm 和贡献流程默认识别这些文件名；保留它们能避免可发现性下降，同时消除多语言副本维护成本。
- **已考虑 alternative**：删除 `README.md` 只保留 `README-zh.md`。该方案虽然文件名直观，但会破坏默认入口习惯和潜在外部链接。

### D2：按文档职责划分范围，而不是按扩展名批量处理

- **选择**：只处理普通说明文档，排除运行时提示词、模板、spec 和历史 archive。
- **理由**：Markdown 在本仓库中承担多种职责。按 `.md` 批量删除英文内容会误伤功能资产，尤其是 Skill 和 OpenSpec 模板。
- **已考虑 alternative**：扫描所有英文 Markdown 并统一中文化。该方案范围过大，容易改变工具行为，不符合用户“先不要动功能语言相关”的约束。

### D3：删除语言副本前先清理链接

- **选择**：实现时先把普通文档引用从 `README-zh.md`、`CONTRIBUTING-zh.md` 等副本迁移到 canonical 文件，再删除副本。
- **理由**：这样可以避免删除后产生断链，也能让 review 更容易确认行为变化。
- **已考虑 alternative**：先删除副本再修复报错。该方案会让中间状态更混乱，不利于验证。

### D4：文档变更仍按项目 changelog 规范处理

- **选择**：普通文档去双语化完成后更新 `CHANGELOG.md`，并确保 `package.json` 版本号与 changelog 顶部版本一致。
- **理由**：项目规则要求每次代码产生变更后写 changelog 并判断版本号。虽然这是文档变更，但会改变仓库维护方式和用户阅读入口，应记录。
- **已考虑 alternative**：纯文档变更不记 changelog。该方案与项目规则冲突。

### D5：`CLAUDE.md` 只保留到 `AGENTS.md` 的引用

- **选择**：`AGENTS.md` 作为项目协作说明 canonical，`CLAUDE.md` 只保留简短说明并直接指向 `AGENTS.md`。
- **理由**：两者在本项目中的作用相同，维护两份完整内容会造成重复编辑和漂移风险；保留 `CLAUDE.md` 文件名则能兼容 Claude 生态默认入口。
- **已考虑 alternative**：继续同步维护 `AGENTS.md` 和 `CLAUDE.md` 两份完整说明。该方案与“只维护一套相关文档”的目标冲突。

## Risks / Trade-offs

- [Risk] 外部链接仍指向 `README-zh.md` 或 `CONTRIBUTING-zh.md` → Mitigation: 实现时用仓库内搜索清理内部引用；外部链接无法完全控制，但标准入口文件保留可降低影响。
- [Risk] 把 Skill 或 OpenSpec 模板误当普通文档处理 → Mitigation: 任务中明确排除 `assets/skills*` 和 `openspec/**`，验证时检查这些路径没有被改动。
- [Risk] 中文 canonical 文件中残留 “English version” 或语言切换提示 → Mitigation: 对普通文档执行文本搜索，确认语言切换提示被移除。
- [Trade-off] 保留 `README.md` 但内容为中文，英文读者体验下降 → 接受理由：项目定位已转为私有化中文维护，降低维护成本优先。

## Migration Plan

1. 将中文普通文档内容迁移到标准入口文件名，例如 `README-zh.md` → `README.md`、`CONTRIBUTING-zh.md` → `CONTRIBUTING.md`。
2. 清理普通文档中的语言切换链接、英文版提示和指向已删除副本的链接。
3. 将 `CLAUDE.md` 改为直接引用 `AGENTS.md` 的薄入口。
4. 删除普通文档语言副本。
5. 确认 `assets/skills*`、`openspec/**` 和 `.beacon/private-notes/legacy-feature-inventories/**` 未被修改。
6. 更新 `CHANGELOG.md`，并按 master 基线判断是否需要提升 `package.json` 版本。
7. 运行格式/链接/搜索类验证；若出现断链或误改，回滚对应文件变更并重新修正。

## Open Questions

无。当前范围已按用户约束收敛为普通文档，不包含功能语言资产。
