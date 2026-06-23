# Brainstorm：普通人读文档改为仅维护中文

## 背景

当前项目已经转向私有化定制，后续预期主要由中文用户和中文维护者使用。继续同时维护英文/中文普通文档会带来额外同步成本，尤其在 README、CONTRIBUTING、NEWS、PR 模板等面向人的说明中，每次行为或流程变化都需要多语言更新，容易浪费 token，也容易产生两份文档不一致。

用户明确约束：先不要动项目中跟功能有关的语言相关内容。也就是说，这次探索只处理“给人看的普通文档”的方向，不把 Skill 运行时提示词、OpenSpec schema/template、历史归档 spec 等功能资产纳入删除或中文化范围。

## 项目现状盘点

只读盘点发现仓库内 Markdown 文档共 83 个，按区域大致分布如下：

- 根目录普通文档：8 个
- `.github` 文档：1 个
- `docs/` 普通文档：3 个
- `assets/skills*` Skill 运行时文档：34 个
- `openspec/specs` 当前规范：3 个
- `openspec/changes/archive` 历史归档：22 个
- `openspec/schemas` schema 与模板：12 个

这说明不能简单按 `.md` 统一处理。仓库里相当一部分 Markdown 是运行时提示词、生成模板或历史制品，虽然“人能读”，但它们也会影响工具行为或保留历史上下文。

## 方案比较

### 方案 A：只删除英文副本文档，保留中文副本文件名

示例：删除 `README.md`，保留 `README-zh.md`。

优点是改动直观，文件名能表达中文身份。缺点是 GitHub、npm、贡献入口等默认生态更识别 `README.md` 和 `CONTRIBUTING.md`，删除标准入口会降低可发现性，也可能破坏外部链接。

### 方案 B：标准入口文件名保留，内容改为中文 canonical

示例：保留 `README.md`、`CONTRIBUTING.md`，把它们作为唯一中文维护版本；删除 `README-zh.md`、`CONTRIBUTING-zh.md`，并清理互链中的 English/中文切换提示。

优点是兼容 GitHub/npm 默认入口，又能消除双语同步负担。缺点是实现时需要小心更新所有内部链接，避免残留指向已删除文件。

### 方案 C：暂不删除英文文件，只在文档中声明中文为准

优点是风险最低，几乎不破坏链接。缺点是仍然保留多份文档，后续维护者仍可能继续编辑英文副本，不能真正达成减少维护成本的目标。

## 推荐决策

采用方案 B：保留标准入口文件名，改为单一中文 canonical；删除语言副本文件。这样既符合“只维护中文文档”的目标，也不牺牲 GitHub/npm 等工具链对默认文档文件名的支持。

## 范围边界

本次变更应纳入：

- `README.md`：作为唯一中文 README
- `CONTRIBUTING.md`：作为唯一中文贡献指南
- `.github/PULL_REQUEST_TEMPLATE.md`：改为中文 PR 模板
- `NEWS.md`、`CHANGELOG.md`：继续保留中文优先的版本历史/新闻入口
- `docs/*.md`：普通说明文档保持中文
- `AGENTS.md`、`CLAUDE.md`：项目协作说明保持中文
- `CLAUDE.md` 不再维护完整副本，改为直接引用 `AGENTS.md`，因为两者在本项目中承担相同协作说明职责
- 删除或清理 `README-zh.md`、`CONTRIBUTING-zh.md` 等语言副本
- 清理普通文档中的语言切换链接、英文版提示和已删除文件链接

本次变更不纳入：

- `assets/skills/**`
- `assets/skills-zh/**`
- `openspec/schemas/**`
- `openspec/specs/**`
- `openspec/changes/archive/**`
- `.beacon/private-notes/legacy-feature-inventories/**`

这些路径要么是运行时功能资产，要么是生成模板/规范/历史归档，要么是用户个人留存资料，不应混入普通文档去英文化。

## 验收思路

- 普通文档只保留一个中文 canonical 版本。
- 标准入口文件名仍存在：`README.md`、`CONTRIBUTING.md`。
- `AGENTS.md` 作为协作说明 canonical，`CLAUDE.md` 仅作为指向 `AGENTS.md` 的兼容入口。
- 不再出现指向 `README-zh.md`、`CONTRIBUTING-zh.md` 的普通文档链接。
- 不修改 Skill 运行时语言资产和 OpenSpec schema/template。
- 文档变更完成后更新 `CHANGELOG.md`，并按项目规则判断是否需要提升 `package.json` 版本号。
