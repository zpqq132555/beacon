## Why

当前项目已经转向私有化定制，后续主要维护中文版本。普通文档继续保留英文/中文双份会增加同步成本，浪费上下文和 token，也容易让两份说明出现偏差。现在将普通人读文档收敛为中文 canonical，可以保留 GitHub/npm 默认入口，同时降低后续文档维护负担。

## What Changes

**普通文档语言维护策略**
- From: `README.md` / `README-zh.md`、`CONTRIBUTING.md` / `CONTRIBUTING-zh.md` 等普通文档存在双语副本或语言切换提示。
- To: 保留 `README.md`、`CONTRIBUTING.md` 等标准入口文件名作为唯一中文 canonical，删除普通文档语言副本。
- Reason: 项目后续只维护中文普通文档，减少重复维护和 token 消耗。
- Impact: 用户和维护者阅读入口变为中文；不影响 CLI、Skill 分发和运行时行为。

**范围隔离**
- From: 仓库内所有 Markdown 文件容易被笼统视为“文档”。
- To: 本次只处理根目录、`docs/`、`.github/` 中面向人的普通说明文档；排除 `assets/skills*`、`openspec/**` 和私有留存资料。
- Reason: Skill、OpenSpec schema/template/spec/archive 可能影响功能或历史上下文，不应混入普通文档去英文化。
- Impact: 变更范围更小，避免误伤功能语言资产。

**协作说明单源维护**
- From: `AGENTS.md` 和 `CLAUDE.md` 都维护完整项目协作说明，内容职责相同。
- To: `AGENTS.md` 作为 canonical 协作说明；`CLAUDE.md` 只保留简短说明并直接引用 `AGENTS.md`。
- Reason: 两份同职责文档会增加同步成本，也容易产生漂移。
- Impact: Claude 入口仍存在，但维护者只需要更新 `AGENTS.md`。

## Capabilities

### New Capabilities

- `human-documentation-localization`: 约束普通人读文档的单中文维护策略、canonical 文件入口和排除范围。

### Modified Capabilities

无。

## Impact

- 影响普通文档：`README.md`、`CONTRIBUTING.md`、`.github/PULL_REQUEST_TEMPLATE.md`、`docs/*.md`、`NEWS.md`、`CHANGELOG.md`、`AGENTS.md`、`CLAUDE.md` 中相关语言维护说明和链接；其中 `CLAUDE.md` 将改为引用 `AGENTS.md` 的薄入口。
- 删除普通文档语言副本，例如 `README-zh.md`、`CONTRIBUTING-zh.md`。
- 不影响 TypeScript 源码、CLI API、npm 依赖、shell 脚本、Skill 运行时内容或 OpenSpec 模板。
