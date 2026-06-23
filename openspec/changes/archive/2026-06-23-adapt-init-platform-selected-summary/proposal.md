## Why

上游 Comet 已新增 `init` 平台选择摘要能力，用来在交互式选择时清楚展示当前已选平台。Beacon 当前需要保持与上游功能同步，但主线已经私有化为 Claude Code、Cursor、Codex、Trae 四个平台，不能直接合并 Comet 的包名、版本和平台上下文。因此需要以 Beacon 专属方式移植该交互能力，减少用户在多选平台时的确认成本。

## What Changes

**交互式平台选择摘要**
- From: `beacon init` 在非 `--yes` 模式下直接使用 `@inquirer/prompts` 的 `checkbox`，检测到的平台只体现在选项文字的 `(detected)` 后缀中。
- To: `beacon init` 使用 Beacon 适配的自定义平台选择 prompt，在选项列表外显示“已选择/Selected”摘要，并在摘要中使用平台干净名称。
- Reason: 用户可以在选择过程中直接看到最终会配置哪些平台，检测状态和选择结果不会混在同一段显示文本里。
- Impact: 非破坏性变更，仅影响交互式 `init` 的显示和必选校验文案。

**平台选择校验本地化**
- From: 必选校验依赖默认英文文案。
- To: 必选校验使用 Beacon 的中英文 i18n 文案。
- Reason: 中文初始化流程不应回退到英文错误提示。
- Impact: 非破坏性变更，影响交互式校验失败时的提示。

**Beacon 私有化约束**
- From: 上游提交基于 Comet 名称、版本和更广的平台上下文。
- To: 仅移植目标行为，保留 Beacon 包名、bin、版本线和四平台范围。
- Reason: 防止上游合并带来品牌回退或平台范围扩大。
- Impact: 需要新增依赖和测试，但不改变安装目标集合。

## Capabilities

### New Capabilities
- `init-platform-selection`: 覆盖 `beacon init` 交互式平台选择摘要、选择状态显示和本地化必选校验。

### Modified Capabilities

无。

## Impact

- Affected code: `src/commands/init.ts`, `src/commands/i18n.ts`, `src/commands/platform-select-prompt.ts`
- Affected tests: `test/ts/init-e2e.test.ts`, `test/ts/platform-select-prompt.test.ts`
- Dependencies: 新增自定义 prompt 需要的 `@inquirer/ansi`, `@inquirer/core`, `@inquirer/figures`, `@inquirer/type`
- Versioning/docs: `package.json` 版本升级到 `0.4.2`，`CHANGELOG.md` 新增条目
