<!--
Raw capture of superpowers:brainstorming output.

本檔原樣捕捉 brainstorming skill 的產出，不強制結構。
Skill 的自然產出通常是 decision log 格式（背景 → 決議鏈 Q1-Qn → 設計取捨），
但依對話內容可能有不同組織方式。

design.md 從本檔萃取並重新整理為結構化設計文件。

不要將本檔的內容複製到 design.md — design.md 是獨立的重組產物，
兩者互補但不重疊。
-->

# Brainstorm：移植 init 平台选择摘要

## 背景

当前 Beacon 主线已经完成第一批私有化平台范围收敛，只支持 Claude Code、Cursor、Codex、Trae。刷新 upstream 后发现上游 Comet 仅领先一个提交：

- `6b2e14a feat: add init platform selected summary (#125)`

该提交新增了 `init` 交互式平台选择时的“已选择平台摘要”，让检测到的平台不再只能通过选项文本中的 `(detected)` 判断，同时补充中英文校验文案。

## 用户已确认的方向

用户明确要求：

- 检查旧 worktree 是否已删除。
- 采用 `superpowers-bridge` 单独开一个 OpenSpec change。
- 将上游功能“移植/适配”进 Beacon。
- 保持主线是最新状态。

因此本 change 不直接 merge `upstream/master`，而是按 Beacon 当前私有化状态移植功能。

## 方案对比

### 方案 A：直接 merge upstream/master

优点：最接近上游历史。

缺点：

- 上游仍是 Comet `0.3.10`，会带入 Comet 包名、版本和上下文。
- 当前 Beacon 已经是 `0.4.1`，并且平台范围已经私有化为四个平台。
- 直接合并容易引入非目标变更和品牌回退风险。

结论：不采用。

### 方案 B：cherry-pick 上游提交后手动修冲突

优点：保留上游提交结构，功能迁移速度快。

缺点：

- cherry-pick 仍可能带入 Comet 的依赖、锁文件、测试命名和平台上下文。
- 修冲突后仍需要重新审查是否违反 Beacon 私有化约束。

结论：可作为参考，不作为执行方式。

### 方案 C：手工移植功能并写 Beacon 专属测试

优点：

- 只引入目标行为：平台选择摘要、自定义校验文案、选择状态辅助函数。
- 保持 Beacon 包名、版本线、四平台范围和现有 `init` 结果结构。
- 可以用 TDD 明确证明适配行为。

缺点：需要手动维护新增文件和依赖。

结论：采用。

## 设计决策

1. 新增 Beacon 版本的 `platform-select-prompt.ts`，提供交互式多选 prompt 和可测试的纯函数辅助能力。
2. `init.ts` 在非 `--yes` 模式使用新的 prompt；`--yes` 仍保持原有自动选择逻辑。
3. 平台 choices 增加 `summaryName`，摘要中显示平台干净名称，不把 `(detected)` 带入摘要。
4. `i18n.ts` 新增 `selectedPlatforms`、`noneSelected`、`selectPlatformsRequired` 文案，保持中英文可本地化。
5. 只安装新增 prompt 实际需要的 `@inquirer/*` 依赖，不改 Beacon 包名和 bin。
6. 更新测试覆盖纯函数、英文 init 调用、中文 init 调用和四平台私有化上下文。
7. 更新 Changelog，版本从 `0.4.1` 升到 `0.4.2`，因为这是面向用户的交互行为新增。

## 风险与边界

- 新 prompt 依赖 `@inquirer/core` 等包，需要同步 `package-lock.json` 和 `pnpm-lock.yaml`。
- 不改变平台安装、检测、OpenSpec/Superpowers 安装行为。
- 不直接引入 upstream 的 Comet 命名、版本或多平台范围。
- 如果全量 shell 测试在 Windows 下耗时过长，可用相关 targeted tests 加构建/lint/OpenSpec 验证作为主要证据，并说明未完整跑完的范围。
