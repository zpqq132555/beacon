# 私有化功能模块台账

本文用于按模块追踪当前 Beacon 项目的功能组成和私有化定制状态。它只记录“有哪些模块、每个模块有哪些功能、功能用途、是否已私有化定制”，不记录具体定制内容；具体改造方案、设计和实现细节应由对应 OpenSpec change 维护。

## 状态定义

| 状态 | 含义 |
| --- | --- |
| 已定制 | 当前项目中已能看到该功能具备 Beacon 私有化定制形态 |
| 部分定制 | 当前项目中已有该功能，但仍保留通用化、公开发行、多平台或历史兼容痕迹 |
| 未定制 | 当前项目中有该功能，但尚未看到私有化定制 |
| 待确认 | 当前源码能识别功能存在，但是否需要或已完成私有化边界不明确 |

## M01. 包与运行入口

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M01-F01 包名与版本 | 定义 npm 包身份、版本和发布元数据 | `package.json` | 已定制 |
| M01-F02 CLI bin 入口 | 暴露 `beacon` 可执行命令 | `bin/beacon.js`, `src/cli/index.ts` | 已定制 |
| M01-F03 CLI 描述信息 | 定义命令行 help 中的产品说明 | `src/cli/index.ts` | 部分定制 |
| M01-F04 构建入口 | 将 TypeScript 源码构建为可发布产物 | `build.js`, `tsconfig.json` | 未定制 |
| M01-F05 发布文件白名单 | 控制 npm 包发布时包含的文件 | `package.json` | 部分定制 |

## M02. CLI 命令层

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M02-F01 `beacon init` | 初始化项目或全局 Beacon 工作流 | `src/commands/init.ts` | 部分定制 |
| M02-F02 `beacon status` | 查看活跃 change、阶段和下一步命令 | `src/commands/status.ts` | 已定制 |
| M02-F03 `beacon doctor` | 诊断安装、依赖、目录、skills 和状态文件 | `src/commands/doctor.ts` | 部分定制 |
| M02-F04 `beacon update` | 更新 Beacon 包和已安装 skill 资产 | `src/commands/update.ts` | 部分定制 |
| M02-F05 `beacon uninstall` | 移除 Beacon 管理的 skills、rules、hooks 和工作目录 | `src/commands/uninstall.ts`, `src/core/uninstall.ts` | 部分定制 |
| M02-F06 `--json` 输出 | 为自动化集成提供结构化输出 | `src/commands/*.ts` | 部分定制 |
| M02-F07 命令错误展示 | 清理并输出外部命令失败详情 | `src/core/command-error.ts` | 未定制 |

## M03. 交互与国际化

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M03-F01 CLI 文案翻译 | 为 CLI 提示和结果提供中英文文本 | `src/commands/i18n.ts` | 部分定制 |
| M03-F02 初始化语言选择 | 选择安装英文或中文 Beacon skills | `src/commands/init.ts`, `assets/manifest.json` | 部分定制 |
| M03-F03 更新语言检测 | 根据已安装内容判断刷新哪个语言版本 | `src/commands/update.ts` | 部分定制 |
| M03-F04 Workflow 输出语言规则 | 让工作流产物跟随用户语言 | `assets/skills*/beacon*/SKILL.md` | 已定制 |
| M03-F05 中文术语规范 | 约束中文文档和 skill 的术语翻译 | `AGENTS.md`, `CLAUDE.md` | 已定制 |

## M04. 平台注册与分发

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M04-F01 平台注册表 | 定义支持的 AI 编码平台及目录 | `src/core/platforms.ts` | 未定制 |
| M04-F02 项目级安装路径 | 将 skills 安装到当前项目目录 | `src/core/platforms.ts`, `src/core/skills.ts` | 部分定制 |
| M04-F03 全局安装路径 | 将 skills 安装到用户全局目录 | `src/core/platforms.ts`, `src/core/skills.ts` | 部分定制 |
| M04-F04 平台自动检测 | 根据目录和配置推断已有平台 | `src/core/detect.ts` | 部分定制 |
| M04-F05 OpenSpec tool 映射 | 将 Beacon 平台映射到 OpenSpec tool id | `src/core/platforms.ts`, `src/core/openspec.ts` | 未定制 |
| M04-F06 特殊平台适配 | 处理 OpenCode、Pi、Lingma 等非通用安装逻辑 | `src/core/skills.ts`, `src/core/superpowers.ts` | 未定制 |

## M05. Skill 资产分发

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M05-F01 Manifest 资产清单 | 统一声明分发的 skills、rules、hooks 和语言 | `assets/manifest.json` | 已定制 |
| M05-F02 英文 skills | 提供英文工作流说明和协议 | `assets/skills/` | 部分定制 |
| M05-F03 中文 skills | 提供中文工作流说明和协议 | `assets/skills-zh/` | 已定制 |
| M05-F04 Skill 复制 | 将 manifest 中的 skills 复制到目标平台 | `src/core/skills.ts` | 已定制 |
| M05-F05 OpenCode 命令生成 | 为 OpenCode 生成可调用命令文件 | `src/core/skills.ts` | 未定制 |
| M05-F06 Pi extension 生成 | 为 Pi 生成 slash command extension | `src/core/skills.ts` | 未定制 |
| M05-F07 工作目录创建 | 创建 `docs/superpowers/specs` 和 `plans` | `src/core/skills.ts` | 部分定制 |

## M06. 主工作流入口

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M06-F01 `/beacon` 主入口 | 自动检测阶段并分派到子工作流 | `assets/skills*/beacon/SKILL.md` | 已定制 |
| M06-F02 活跃 change 发现 | 发现当前 OpenSpec 活跃变更 | `assets/skills*/beacon/SKILL.md`, `src/commands/status.ts` | 已定制 |
| M06-F03 阶段自动判断 | 根据 `.beacon.yaml` 和文件状态判断当前阶段 | `assets/skills*/beacon/SKILL.md` | 已定制 |
| M06-F04 Preset 识别 | 将 hotfix/tweak 输入路由到快捷工作流 | `assets/skills*/beacon/SKILL.md` | 已定制 |
| M06-F05 恢复规则 | 会话中断后重新读取状态并恢复流程 | `assets/skills*/beacon/SKILL.md`, `assets/skills*/beacon/reference/context-recovery.md` | 已定制 |
| M06-F06 错误处理速查 | 定义缺少依赖、状态异常、构建失败时的处理方向 | `assets/skills*/beacon/SKILL.md` | 部分定制 |

## M07. Open 阶段

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M07-F01 需求探索 | 调用 OpenSpec explore 澄清目标和范围 | `assets/skills*/beacon-open/SKILL.md` | 已定制 |
| M07-F02 PRD 拆分预检 | 判断大需求是否应拆成多个 change | `assets/skills*/beacon-open/SKILL.md` | 已定制 |
| M07-F03 需求确认阻塞点 | 创建 artifacts 前要求用户确认澄清摘要 | `assets/skills*/beacon-open/SKILL.md` | 已定制 |
| M07-F04 Change 名确认 | 创建目录前确认 kebab-case change 名 | `assets/skills*/beacon-open/SKILL.md` | 已定制 |
| M07-F05 OpenSpec change 创建 | 调用 OpenSpec 新建 change 骨架 | `assets/skills*/beacon-open/SKILL.md` | 部分定制 |
| M07-F06 标准 artifacts 生成 | 生成 `proposal.md`、`design.md`、`tasks.md` | `assets/skills*/beacon-open/SKILL.md` | 已定制 |
| M07-F07 `.beacon.yaml` 初始化 | 初始化 change 状态文件 | `assets/skills*/beacon-open/SKILL.md`, `beacon-state.sh` | 已定制 |
| M07-F08 Open 内容确认 | 进入下一阶段前要求用户确认 artifacts | `assets/skills*/beacon-open/SKILL.md` | 已定制 |

## M08. Design 阶段

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M08-F01 Design 入口校验 | 校验 change 和 open 阶段产物是否满足设计前置条件 | `assets/skills*/beacon-design/SKILL.md`, `beacon-state.sh` | 已定制 |
| M08-F02 Handoff 生成 | 将 OpenSpec artifacts 转为 Superpowers 设计上下文 | `assets/skills*/beacon-design/SKILL.md`, `beacon-handoff.sh` | 已定制 |
| M08-F03 Brainstorming 调用 | 调用 Superpowers brainstorming 产出技术方案 | `assets/skills*/beacon-design/SKILL.md` | 已定制 |
| M08-F04 设计方案确认 | 创建 Design Doc 前要求用户确认方案 | `assets/skills*/beacon-design/SKILL.md` | 已定制 |
| M08-F05 Brainstorm checkpoint | 保存设计讨论恢复点 | `assets/skills*/beacon-design/SKILL.md` | 已定制 |
| M08-F06 主动式上下文压缩 | 在 Design Doc 前进行上下文释放或提示 | `assets/skills*/beacon-design/SKILL.md` | 部分定制 |
| M08-F07 Design Doc 创建 | 生成 `docs/superpowers/specs/*-design.md` | `assets/skills*/beacon-design/SKILL.md` | 已定制 |
| M08-F08 Delta spec 补丁 | 在设计中补充或修正 OpenSpec delta spec | `assets/skills*/beacon-design/SKILL.md` | 部分定制 |

## M09. Build 阶段

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M09-F01 Build 入口校验 | 校验 Design Doc 和状态是否满足构建前置条件 | `assets/skills*/beacon-build/SKILL.md`, `beacon-state.sh` | 已定制 |
| M09-F02 Plan 生成 | 调用 Superpowers writing-plans 创建实现计划 | `assets/skills*/beacon-build/SKILL.md` | 已定制 |
| M09-F03 Plan-ready 暂停点 | 允许用户在计划完成后暂停或继续 | `assets/skills*/beacon-build/SKILL.md` | 已定制 |
| M09-F04 工作区隔离选择 | 在 branch 和 worktree 之间选择执行隔离方式 | `assets/skills*/beacon-build/SKILL.md` | 部分定制 |
| M09-F05 执行模式选择 | 在 executing-plans 和 subagent-driven-development 间选择 | `assets/skills*/beacon-build/SKILL.md` | 部分定制 |
| M09-F06 TDD 模式选择 | 选择 `tdd` 或 `direct` | `assets/skills*/beacon-build/SKILL.md`, `beacon-state.sh` | 部分定制 |
| M09-F07 Direct override | 允许 full workflow 显式绕过执行 skill | `assets/skills*/beacon-build/SKILL.md`, `beacon-state.sh` | 已定制 |
| M09-F08 构建期代码审查 | executing-plans 后调用 review skill | `assets/skills*/beacon-build/SKILL.md` | 部分定制 |
| M09-F09 异常调试协议 | 测试或构建异常时要求先定位根因 | `assets/skills*/beacon-build/SKILL.md`, `debug-gate.md` | 已定制 |
| M09-F10 Spec 增量更新 | 构建中发现需求缺口时更新 delta spec 或拆分 change | `assets/skills*/beacon-build/SKILL.md` | 部分定制 |
| M09-F11 任务完成检查 | 检查 tasks 和 plan 是否完成 | `beacon-guard.sh`, `beacon-state.sh` | 已定制 |

## M10. Verify 阶段

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M10-F01 Verify 入口校验 | 校验代码、tasks 和状态是否满足验证条件 | `assets/skills*/beacon-verify/SKILL.md`, `beacon-state.sh` | 已定制 |
| M10-F02 验证规模评估 | 自动判断 light 或 full 验证 | `assets/skills*/beacon-verify/SKILL.md`, `beacon-state.sh` | 已定制 |
| M10-F03 Dirty worktree 处理 | 验证前处理未提交改动归因 | `assets/skills*/beacon-verify/SKILL.md`, `dirty-worktree.md` | 已定制 |
| M10-F04 验证失败决策 | 失败时要求用户选择修复或接受偏差 | `assets/skills*/beacon-verify/SKILL.md` | 已定制 |
| M10-F05 Hash 按需读取 | 通过 handoff hash 判断是否需要重读 artifacts | `assets/skills*/beacon-verify/SKILL.md`, `beacon-handoff.sh` | 已定制 |
| M10-F06 轻量验证 | 检查任务、变更文件、构建、测试、安全和轻量 review | `assets/skills*/beacon-verify/SKILL.md` | 部分定制 |
| M10-F07 完整验证 | 校验实现、Design Doc、proposal 和 delta spec 一致性 | `assets/skills*/beacon-verify/SKILL.md` | 部分定制 |
| M10-F08 Spec drift 处理 | 处理设计文档与 delta spec 不一致 | `assets/skills*/beacon-verify/SKILL.md` | 已定制 |
| M10-F09 分支收尾 | 调用 Superpowers finishing branch 流程 | `assets/skills*/beacon-verify/SKILL.md` | 部分定制 |
| M10-F10 验证报告 | 保存验证结论并记录到 `.beacon.yaml` | `assets/skills*/beacon-verify/SKILL.md` | 已定制 |

## M11. Archive 阶段

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M11-F01 Archive 入口校验 | 校验 verify 通过和分支已处理 | `assets/skills*/beacon-archive/SKILL.md`, `beacon-state.sh` | 已定制 |
| M11-F02 归档前确认 | 执行归档前要求用户最终确认 | `assets/skills*/beacon-archive/SKILL.md` | 已定制 |
| M11-F03 Archive reopen | 用户要求调整时回退到 verify | `assets/skills*/beacon-archive/SKILL.md`, `beacon-state.sh` | 已定制 |
| M11-F04 OpenSpec archive 调用 | 按 OpenSpec 语义合并并移动 change | `assets/skills*/beacon-archive/SKILL.md`, `beacon-archive.sh` | 部分定制 |
| M11-F05 Design/Plan 标注 | 在设计和计划文档写入归档元数据 | `beacon-archive.sh` | 已定制 |
| M11-F06 Main spec 清洁检查 | 防止 delta-only 标题泄漏到主 spec | `beacon-archive.sh` | 已定制 |
| M11-F07 生命周期闭环 | 将 change 标记为 archived 并完成流程 | `assets/skills*/beacon-archive/SKILL.md`, `beacon-state.sh` | 已定制 |

## M12. Preset 快捷工作流

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M12-F01 Hotfix 适用条件 | 定义小范围 bug fix 的快捷路径边界 | `assets/skills*/beacon-hotfix/SKILL.md` | 部分定制 |
| M12-F02 Hotfix 快速 open | 创建简化 proposal/design/tasks 和状态 | `assets/skills*/beacon-hotfix/SKILL.md` | 部分定制 |
| M12-F03 Hotfix 直接 build | 跳过完整 plan，直接按 tasks 修复 | `assets/skills*/beacon-hotfix/SKILL.md` | 部分定制 |
| M12-F04 Hotfix 根因检查 | 验证 bug 根因被消除 | `assets/skills*/beacon-hotfix/SKILL.md` | 已定制 |
| M12-F05 Hotfix 升级 full | 超出边界时转入完整工作流 | `assets/skills*/beacon-hotfix/SKILL.md` | 已定制 |
| M12-F06 Tweak 适用条件 | 定义非 bug 小改动边界 | `assets/skills*/beacon-tweak/SKILL.md` | 部分定制 |
| M12-F07 Tweak 快速 open | 为小改动创建简化 artifacts 和状态 | `assets/skills*/beacon-tweak/SKILL.md` | 部分定制 |
| M12-F08 Tweak 轻量 build | 直接完成小改动任务 | `assets/skills*/beacon-tweak/SKILL.md` | 部分定制 |
| M12-F09 Tweak 升级 full | 超出边界时转入完整工作流 | `assets/skills*/beacon-tweak/SKILL.md` | 已定制 |

## M13. 状态机与配置

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M13-F01 `.beacon.yaml` 字段集合 | 记录单个 change 的运行状态 | `beacon-state.sh`, `beacon-yaml-validate.sh`, `beacon-yaml-fields.md` | 已定制 |
| M13-F02 状态初始化 | 为 full/hotfix/tweak 写入默认状态 | `beacon-state.sh` | 已定制 |
| M13-F03 状态读取 | 读取 change 的状态字段 | `beacon-state.sh`, `src/commands/status.ts` | 已定制 |
| M13-F04 状态写入 | 受白名单和 enum 约束写入字段 | `beacon-state.sh` | 已定制 |
| M13-F05 状态转换 | 通过事件推进或回退 phase | `beacon-state.sh` | 已定制 |
| M13-F06 阶段 check | 校验进入阶段的前置条件 | `beacon-state.sh` | 已定制 |
| M13-F07 恢复上下文输出 | 为中断恢复输出结构化提示 | `beacon-state.sh` | 已定制 |
| M13-F08 `next` 路由 | 根据 phase/workflow/auto_transition 输出下一步 | `beacon-state.sh` | 已定制 |
| M13-F09 项目级配置 | 为新 change 提供默认配置 | `.beacon/config.yaml`, `src/core/skills.ts`, `beacon-state.sh` | 部分定制 |
| M13-F10 环境变量覆盖 | 允许环境变量覆盖部分运行配置 | `beacon-state.sh` | 部分定制 |

## M14. Guard 与 Hook

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M14-F01 阶段退出 guard | 每个阶段完成前检查必需证据 | `beacon-guard.sh` | 已定制 |
| M14-F02 `--apply` 推进 | guard 通过后自动更新状态 | `beacon-guard.sh`, `beacon-state.sh` | 已定制 |
| M14-F03 构建命令检测 | 运行配置的或自动推断的 build 命令 | `beacon-guard.sh` | 部分定制 |
| M14-F04 验证命令检测 | archive 前运行配置的 verify 命令 | `beacon-guard.sh` | 部分定制 |
| M14-F05 阶段写入 hook | open/design/archive 阶段拦截源码写入 | `beacon-hook-guard.sh` | 已定制 |
| M14-F06 Hook 配置写入 | 安装平台对应的 hook 配置 | `src/core/skills.ts` | 部分定制 |
| M14-F07 Hook 配置移除 | 卸载时保留用户 hook，仅移除 Beacon 管理项 | `src/core/uninstall.ts` | 部分定制 |
| M14-F08 阶段感知 rule | 给平台注入防漂移规则 | `assets/skills/beacon/rules/` | 已定制 |

## M15. Handoff、压缩与恢复

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M15-F01 标准 handoff | 生成 `design-context.json/md` | `beacon-handoff.sh` | 已定制 |
| M15-F02 Full handoff | 在需要时输出更完整上下文 | `beacon-handoff.sh` | 已定制 |
| M15-F03 Beta spec projection | 生成 `spec-context.json/md` | `beacon-handoff.sh`, `docs/CONTEXT-COMPRESSION.md` | 部分定制 |
| M15-F04 Handoff hash | 生成并比较上下文 hash | `beacon-handoff.sh`, `beacon-state.sh` | 已定制 |
| M15-F05 Hash-only 模式 | 只计算 hash，不重写上下文 | `beacon-handoff.sh` | 已定制 |
| M15-F06 Context recovery | 定义不同阶段的恢复读取策略 | `context-recovery.md`, `beacon-state.sh` | 已定制 |
| M15-F07 Auto transition | 控制是否自动调用下一阶段 skill | `auto-transition.md`, `beacon-state.sh` | 部分定制 |

## M16. 外部能力包集成

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M16-F01 OpenSpec CLI 检测 | 判断 OpenSpec 是否可用 | `src/core/openspec.ts`, `src/commands/doctor.ts` | 未定制 |
| M16-F02 OpenSpec 安装/升级 | 可选安装或升级 OpenSpec CLI | `src/core/openspec.ts`, `src/commands/init.ts` | 部分定制 |
| M16-F03 OpenSpec 初始化 | 将 OpenSpec 配置到所选平台 | `src/core/openspec.ts` | 部分定制 |
| M16-F04 Superpowers 安装 | 可选安装 Superpowers skills | `src/core/superpowers.ts`, `src/commands/init.ts` | 部分定制 |
| M16-F05 Superpowers 检测 | 检测已有 Superpowers 安装来源 | `src/core/detect.ts` | 部分定制 |
| M16-F06 CodeGraph 检测 | 检测 CodeGraph CLI 或项目索引 | `src/core/codegraph.ts`, `src/commands/doctor.ts` | 未定制 |
| M16-F07 CodeGraph 安装 | 可选安装并初始化 CodeGraph | `src/core/codegraph.ts`, `src/commands/init.ts` | 部分定制 |

## M17. OpenSpec Bridge Schema

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M17-F01 Bridge schema | 描述 OpenSpec 与 Superpowers 桥接结构 | `openspec/schemas/superpowers-bridge/schema.yaml` | 待确认 |
| M17-F02 Proposal 模板 | 定义 proposal artifact 模板 | `openspec/schemas/superpowers-bridge/templates/proposal.md` | 待确认 |
| M17-F03 Design 模板 | 定义 design artifact 模板 | `openspec/schemas/superpowers-bridge/templates/design.md` | 待确认 |
| M17-F04 Tasks 模板 | 定义 tasks artifact 模板 | `openspec/schemas/superpowers-bridge/templates/tasks.md` | 待确认 |
| M17-F05 Spec 模板 | 定义 delta spec artifact 模板 | `openspec/schemas/superpowers-bridge/templates/spec.md` | 待确认 |
| M17-F06 Verify 模板 | 定义 verify artifact 模板 | `openspec/schemas/superpowers-bridge/templates/verify.md` | 待确认 |
| M17-F07 Adopter fragments | 提供接入方规则片段 | `openspec/schemas/superpowers-bridge/templates/adopters/` | 待确认 |
| M17-F08 当前 rebrand change | 记录当前 Beacon runtime contract 改造 | `openspec/changes/rebrand-comet-to-beacon/` | 已定制 |

## M18. 文档与用户说明

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M18-F01 英文 README | 说明安装、命令、平台和工作流 | `README.md` | 部分定制 |
| M18-F02 中文 README | 说明安装、命令、平台和工作流 | `README-zh.md` | 部分定制 |
| M18-F03 NEWS | 记录版本亮点 | `NEWS.md` | 部分定制 |
| M18-F04 CHANGELOG | 记录版本变更 | `CHANGELOG.md` | 部分定制 |
| M18-F05 Auto transition 文档 | 解释自动衔接机制 | `docs/AUTO-TRANSITION.md` | 部分定制 |
| M18-F06 Context compression 文档 | 解释上下文压缩和 benchmark | `docs/CONTEXT-COMPRESSION.md` | 部分定制 |
| M18-F07 贡献指南 | 说明贡献流程 | `CONTRIBUTING.md`, `CONTRIBUTING-zh.md` | 未定制 |
| M18-F08 项目 Agent 规则 | 给 Agent 提供项目内协作规范 | `AGENTS.md`, `CLAUDE.md` | 已定制 |
| M18-F09 图片资产 | 提供 README 和社区展示图片 | `img/` | 未定制 |

## M19. 测试体系

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M19-F01 Shell contract tests | 覆盖状态机、guard、handoff、archive、hook | `test/ts/beacon-scripts.test.ts`, `test/shell/` | 已定制 |
| M19-F02 CLI command tests | 覆盖 init/status/doctor/update/uninstall | `test/ts/*command*.test.ts`, `test/ts/status.test.ts` | 部分定制 |
| M19-F03 Skill prose tests | 检查 skill 文案合同和双语言一致性 | `test/ts/skills.test.ts` | 已定制 |
| M19-F04 Platform install tests | 覆盖平台安装和特殊适配 | `test/ts/init-e2e.test.ts`, `test/ts/init.test.ts` | 部分定制 |
| M19-F05 External pack tests | 覆盖 OpenSpec、Superpowers、CodeGraph 集成 | `test/ts/openspec.test.ts`, `test/ts/superpowers.test.ts`, `test/ts/codegraph.test.ts` | 部分定制 |
| M19-F06 Filesystem tests | 覆盖安全文件操作 | `test/ts/file-system.test.ts`, `test/ts/uninstall.test.ts` | 未定制 |
| M19-F07 Version tests | 覆盖版本比较和更新提示 | `test/ts/version.test.ts` | 未定制 |
| M19-F08 README/CI tests | 覆盖文档和 GitHub workflow 约束 | `test/ts/readme.test.ts`, `test/ts/ci-workflows.test.ts` | 部分定制 |

## M20. CI、格式化与发布

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M20-F01 TypeScript 构建 | 编译源码 | `pnpm build`, `build.js` | 未定制 |
| M20-F02 ESLint | 检查源码质量 | `eslint.config.js`, `pnpm lint` | 未定制 |
| M20-F03 Prettier | 格式化源码 | `.prettierrc`, `pnpm format:check` | 未定制 |
| M20-F04 Husky pre-commit | 提交前格式化暂存源文件 | `.husky/`, `package.json` | 部分定制 |
| M20-F05 Prepublish 检查 | 发布前检查包状态和敏感内容 | `scripts/prepublish-check.js` | 部分定制 |
| M20-F06 Postinstall | 安装后处理 | `scripts/postinstall.js` | 待确认 |
| M20-F07 GitHub CI | 在 CI 中运行测试、构建和格式检查 | `.github/workflows/` | 部分定制 |
| M20-F08 PR title lint | 检查 PR 标题规范 | `.github/workflows/` | 部分定制 |
| M20-F09 Stale PR workflow | 自动处理长期未活跃 PR | `.github/workflows/` | 未定制 |

## M21. Benchmark 与性能评估

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M21-F01 Context benchmark | 对比上下文压缩模式的 token 和质量 | `scripts/context-compression-benchmark.mjs` | 未定制 |
| M21-F02 Execution benchmark | 模拟或执行完整工作流效率测试 | `scripts/context-execution-benchmark.mjs` | 未定制 |
| M21-F03 Benchmark 公共工具 | 复用 benchmark 执行和解析逻辑 | `scripts/benchmark-utils.mjs` | 未定制 |
| M21-F04 Dry-run 报告 | 无外部 API 时生成确定性报告 | `test/ts/context-*.test.ts` | 未定制 |
| M21-F05 Benchmark 文档 | 说明压缩收益和复现步骤 | `docs/CONTEXT-COMPRESSION.md` | 部分定制 |

## M22. 安全与文件系统边界

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M22-F01 Symlink-safe 写入 | 复制文件时处理符号链接路径 | `src/utils/file-system.ts` | 未定制 |
| M22-F02 Symlink-safe 删除 | 卸载时避免删除符号链接目标 | `src/utils/file-system.ts`, `src/core/uninstall.ts` | 未定制 |
| M22-F03 Path traversal 防护 | 防止状态字段或任务文件越界访问 | `beacon-state.sh`, `beacon-guard.sh` | 已定制 |
| M22-F04 命令注入防护 | 限制配置命令中的危险 shell 字符 | `beacon-guard.sh` | 已定制 |
| M22-F05 Secret 文件忽略 | 避免密钥和凭据进入版本控制 | `.gitignore` | 未定制 |
| M22-F06 发布前敏感检查 | 发布前扫描风险文件 | `scripts/prepublish-check.js` | 部分定制 |

## M23. 私有化管理与治理

| 功能项 | 具体作用 | 主要位置 | 私有化状态 |
| --- | --- | --- | --- |
| M23-F01 私有留存资料隔离 | 防止历史个人资料被当作项目事实来源 | `AGENTS.md`, `.beacon/private-notes/` | 已定制 |
| M23-F02 私有化功能台账 | 按模块追踪功能项和私有化状态 | `docs/PRIVATE-FEATURE-MODULES.md` | 已定制 |
| M23-F03 OpenSpec 改造记录 | 用 change 记录具体私有化改造方案和实现 | `openspec/changes/` | 已定制 |
| M23-F04 Changelog 维护 | 每次改造完成后记录版本行为变化 | `CHANGELOG.md` | 部分定制 |
| M23-F05 Agent 项目规则 | 约束后续 Agent 如何读取上下文和修改项目 | `AGENTS.md`, `CLAUDE.md` | 已定制 |

## 后续使用方式

1. 新建私有化 OpenSpec change 时，先在本文中找到对应模块和功能项。
2. change 完成后，只更新对应功能项的私有化状态。
3. 具体私有化内容、设计、任务和验证证据不要写入本文，应写入对应 OpenSpec change。
4. 新增功能模块时，按 `Mxx-Fxx` 编号追加，不复用旧编号。
5. 删除功能时，保留编号并将状态调整为适当值，避免历史对照失效。
