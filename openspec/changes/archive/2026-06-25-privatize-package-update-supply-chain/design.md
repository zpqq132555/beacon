## Context

Beacon 已完成运行时命名重塑和首批私有平台范围收敛，当前支持 Codex、Cursor、Claude Code 和 Trae。剩余风险集中在供应链路径：Beacon 自身更新、版本检查、OpenSpec/Superpowers/CodeGraph 安装、README/NEWS 提示仍假设公开 npm registry、GitHub skill 源和公开发行页面可用。

这些公开来源对私有版有两个问题：第一，用户运行 `beacon init` / `beacon update` 时可能被带向未受控的公开网络；第二，文档和 CLI 输出会让私有版边界变得含糊。供应链策略需要先收口，再继续处理默认中文和展示面清理。

## Goals / Non-Goals

**Goals:**

- 让 Beacon 自身版本检查和更新来源不再硬编码公开 npm registry。
- 让 OpenSpec、Superpowers、CodeGraph 的安装/升级来源具备明确私有版策略。
- 让 CLI 提示、doctor 诊断和 README/NEWS 中的供应链相关说明与私有策略一致。
- 增加测试或发布前检查，防止重新引入公开 registry、旧平台矩阵和公开安装命令作为默认路径。
- 保持四平台私有范围、五阶段工作流和现有状态机行为不变。

**Non-Goals:**

- 不在本 change 中把默认 skill 语言改为中文。
- 不全量重写 README 品牌叙事、社区入口、图片资产或 roadmap。
- 不改变 OpenSpec/Superpowers/CodeGraph 的功能角色，只调整来源策略和用户可见提示。
- 不实现完全离线安装包仓库；如需离线包缓存，后续单独设计。
- 不新增或恢复任何 AI 编码平台。

## Decisions

### D1：引入私有供应链配置作为单一策略入口

- **选择**：为 Beacon 自身更新、版本检查和外部 CLI 安装建立统一的私有供应链配置读取路径，优先从项目级 `.beacon/config.yaml` 或环境变量读取。
- **理由**：当前公开 registry 和包名分散在 `update.ts`、`version.ts`、`openspec.ts`、`superpowers.ts`、`codegraph.ts`、`doctor.ts` 和文案表中。若只逐个替换字符串，后续仍容易回退。
- **已考虑 alternative**：直接删除所有自动安装/更新能力。拒绝原因是私有版仍需要可维护的升级路径，完全删除会降低可用性。

### D2：默认行为从“公开源优先”改为“已有安装优先，可配置安装”

- **选择**：`init` 和 `update` 应优先检测本地已有工具；需要安装/升级时使用配置中的来源。没有配置私有来源时，CLI 应明确提示来源未配置或要求用户确认，不应静默假设公开源是私有版默认路径。
- **理由**：私有环境中最稳妥的基线是复用已安装工具或内部镜像，避免自动访问公开 registry/GitHub。
- **已考虑 alternative**：继续默认公开源，只在 README 里说明可手动改 registry。拒绝原因是行为层仍不私有，且用户容易在无意识中触发外网访问。

### D3：保留外部工具可选安装，但把来源文案数据化

- **选择**：OpenSpec、Superpowers、CodeGraph 仍可由 `init`/`update` 引导安装，但包名、registry、skill 源、手动安装提示和失败建议应来自同一策略，而不是硬编码公开字符串。
- **理由**：这保留了当前交互式初始化体验，同时把私有源、内部镜像或禁用安装变成可测试的行为。
- **已考虑 alternative**：把三类外部能力包拆成三个独立 change。拒绝原因是它们共享同一个供应链边界，拆开会重复改配置、文案和测试。

### D4：文档只同步供应链相关说明

- **选择**：本 change 更新 README/NEWS 中与安装、更新、依赖来源和旧平台矩阵冲突的内容，但不全量重写社区、roadmap、展示图等传播内容。
- **理由**：供应链行为需要用户说明同步；品牌展示面清理可以后续单独做，避免扩大范围。
- **已考虑 alternative**：一次性清空所有公开传播链接。拒绝原因是会把文档治理和供应链行为混在一起，降低验证聚焦度。

### D5：用测试和 prepublish 检查固定私有边界

- **选择**：新增或调整测试覆盖配置解析、命令参数构造、版本检查 URL、doctor 提示和文档残留；必要时扩展 `prepublish-check.js` 扫描公开 registry、公开安装命令和旧平台矩阵表述。
- **理由**：私有化最容易在后续 upstream 移植或文档维护中回退，必须由自动化检查兜住。
- **已考虑 alternative**：只靠人工 review。拒绝原因是该项目已有大量文案和命令构造路径，人工检查容易漏。

## Risks / Trade-offs

- [Risk] 私有源配置字段设计过早泛化，导致实现复杂。→ Mitigation: 只覆盖当前四类来源：Beacon 包、OpenSpec npm 包、Superpowers skill 源、CodeGraph npm 包。
- [Risk] 默认不再公开源优先后，首次安装体验可能多一步配置或确认。→ Mitigation: CLI 输出应给出清晰的配置建议和已有安装复用路径。
- [Risk] 不做全量 README 清理会保留部分公开展示内容。→ Mitigation: 本 change 只承诺供应链相关文档一致，展示面清理作为后续 change。
- [Trade-off] 牺牲“开箱即从公网拉最新”的便利，换取私有版可控、可审计、可测试的依赖来源。

## Migration Plan

1. 增加私有供应链配置合同和读取逻辑。
2. 将 Beacon update/version check 接入配置策略。
3. 将 OpenSpec、Superpowers、CodeGraph 安装命令和手动提示接入配置策略。
4. 更新 init/update/doctor/i18n 输出和 README/NEWS 供应链说明。
5. 添加测试和 prepublish 检查，验证不再硬编码公开源作为默认路径。

Rollback: 恢复相关配置读取和命令构造到当前公开源硬编码即可；不涉及数据迁移。

## Open Questions

- 私有 registry 的默认值是否应由 `.beacon/config.yaml` 模板预留为空，还是允许环境变量单独驱动。
- Superpowers 私有来源是继续使用 `skills add internal/superpowers` 这类仓库标识，还是支持本地 skill 包路径。
- CodeGraph 在私有版中是否应默认只检测已有索引，不主动安装。
