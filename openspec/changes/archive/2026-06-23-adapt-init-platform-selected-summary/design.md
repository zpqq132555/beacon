## Context

Beacon 当前主线已经完成第一批平台私有化，平台范围固定为 Claude Code、Cursor、Codex、Trae。上游 `upstream/master` 领先一个功能提交：`6b2e14a feat: add init platform selected summary (#125)`，该提交改善了 `init` 平台多选体验。

本 change 的约束是：同步该上游功能价值，但不直接合并 upstream，不引入 Comet 包名、版本号、bin 名称或更广的平台集合。实现必须保持 Beacon 当前安装、检测、OpenSpec/Superpowers 配置行为，只调整交互式平台选择的展示和校验。

## Goals / Non-Goals

**Goals:**

- 在 `beacon init` 非 `--yes` 模式下显示当前已选择平台摘要。
- 摘要使用平台干净名称，例如 `Codex`，不包含 `(detected)` 状态后缀。
- 必选校验错误使用 Beacon 中英文 i18n 文案。
- 新增纯函数测试和 init 集成测试，证明功能在 Beacon 四平台范围内工作。
- 更新依赖、锁文件、版本号和 Changelog。

**Non-Goals:**

- 不直接 merge 或 cherry-pick upstream 提交。
- 不扩大 Beacon 支持的平台范围。
- 不修改 `--yes` 自动选择逻辑。
- 不改变平台安装目录、规则目录、hooks 行为或 OpenSpec/Superpowers 安装流程。
- 不把 Comet 命名或版本带回 Beacon。

## Decisions

### D1：手工移植而不是直接合并 upstream

- **选择**：参考上游实现，按 Beacon 当前代码手工适配。
- **理由**：上游提交包含 Comet `package.json` 版本和依赖上下文，直接合并会增加品牌回退和范围污染风险。
- **已考虑 alternative**：直接 merge upstream，拒绝原因是会混入非目标变更；cherry-pick 后修冲突，拒绝原因是仍需逐项清理 Comet 上下文。

### D2：新增独立 `platform-select-prompt.ts`

- **选择**：新增专用 prompt 文件，封装选择状态、摘要渲染、键盘交互和 Inquirer prompt 创建。
- **理由**：`init.ts` 保持流程编排职责，选择 UI 的状态逻辑可单独测试。
- **已考虑 alternative**：把 prompt 逻辑直接写进 `init.ts`，拒绝原因是会让已有初始化流程更难读，也不利于测试纯函数。

### D3：摘要名称和选项名称分离

- **选择**：choice 结构增加 `summaryName`，选项行继续显示 `(detected)`，摘要使用干净平台名。
- **理由**：检测状态是选项上下文，最终摘要应该表达“会配置哪些平台”，避免把状态后缀误认为平台名称。
- **已考虑 alternative**：复用 `name` 渲染摘要，拒绝原因是摘要会出现 `Codex (detected)`。

### D4：保留 `--yes` 行为

- **选择**：`options.yes` 分支继续返回检测到的平台，未检测到时返回全部四个平台。
- **理由**：这次只改善交互显示，不改变非交互自动化行为。
- **已考虑 alternative**：让 `--yes` 也经过新 prompt 的状态函数，拒绝原因是没有用户价值，并且可能引入自动化行为风险。

### D5：版本升级到 `0.4.2`

- **选择**：由于新增用户可见交互行为，版本从 `0.4.1` 升级到 `0.4.2`。
- **理由**：项目 Changelog 规范要求代码变更后判断版本号；这是面向 CLI 用户的新增能力。
- **已考虑 alternative**：保留 `0.4.1`，拒绝原因是已有 `0.4.1` Changelog 对应前一批私有化改造。

## Risks / Trade-offs

- [Risk] 新增 `@inquirer/core` 等依赖可能造成锁文件变化较大 → Mitigation: 只加入 prompt 实际使用的上游依赖，并运行构建、lint、targeted tests。
- [Risk] 自定义 prompt 的交互细节与 Inquirer 默认 checkbox 有差异 → Mitigation: 保持常见键位：上下移动、空格选择、`a` 全选/清空、`i` 反选、回车提交。
- [Risk] PowerShell 输出中文可能出现编码显示问题 → Mitigation: 文件内容保持 UTF-8，验证以 TypeScript 编译和测试结果为准。
- [Trade-off] 新增文件比直接使用 `checkbox` 更复杂 → 接受理由：换来摘要显示和本地化校验，同时状态辅助函数可以单测。

## Migration Plan

1. 在隔离 worktree 中创建 OpenSpec change 和实现。
2. 先写 failing tests，验证当前代码没有平台选择摘要能力。
3. 实现 prompt、i18n、init 接入、依赖和版本/Changelog。
4. 运行 OpenSpec validate、format、lint、build、相关 vitest。
5. 提交 worktree 分支。
6. 验证无问题后合并回 `master`。
7. 再检查 `master...upstream/master`，确认上游功能是否仍显示为未处理；如果仍因提交历史不同显示 behind，需要记录这是“功能已适配但未直接合并”的状态。

Rollback 策略：回退本 change 的合并提交即可恢复旧 `checkbox` 行为。

## Open Questions

无。用户已确认采用 `superpowers-bridge` 单独 OpenSpec change 进行移植/适配。
