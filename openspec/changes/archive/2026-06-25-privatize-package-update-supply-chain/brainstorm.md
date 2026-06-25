## 背景

当前没有活动中的 OpenSpec change。上一轮已完成并归档 `privatize-platform-distribution-scope`，把首批私有版平台范围收敛为 Codex、Cursor、Claude Code 和 Trae。该归档设计留下两个后续开放问题：

- 是否需要将默认安装语言改为中文。
- 是否需要将依赖安装改为完全离线或内部 registry。

结合当前源码和正式台账，平台范围已基本私有化，但包发布、更新、版本检查、外部能力包安装和公开文档传播面仍保留公开发行假设。

## 调研发现

- `package.json` 仍声明 `publishConfig.access: public`。
- `src/commands/update.ts` 硬编码 `https://registry.npmjs.org`，并默认更新 `beacon@latest`。
- `src/core/version.ts` 版本检查直接请求公开 npm registry。
- `src/core/openspec.ts` 默认安装 `@fission-ai/openspec@latest`。
- `src/core/superpowers.ts` 默认执行 `npx skills add obra/superpowers`。
- `src/core/codegraph.ts` 默认安装 `@colbymchenry/codegraph`。
- README 仍包含 `npm install -g beacon`、`npx skills add rpamis/beacon`、npm badge、公开 roadmap、star history、社区传播链接等公开发行内容。
- NEWS 仍残留 Kimi Code 第 29 个平台、29 平台卸载、CodeGraph 自动检测 7 平台等旧公开版叙事。
- `docs/PRIVATE-FEATURE-MODULES.md` 将外部能力包集成、更新命令、发布文件白名单、NEWS/CHANGELOG、prepublish 检查等标为部分定制或未定制。

## 设计取舍

### 方案 A：先做文档清理

只清理 README/NEWS 中的公开传播内容，让项目看起来更像私有版。

优点：改动小，用户可见变化快。
缺点：底层仍会访问公开 npm/GitHub，私有化风险没有真正降低。文档可能与行为不一致。

### 方案 B：先做供应链私有化

把包更新、版本检查、外部 CLI 安装来源抽象为私有版可配置策略；默认不强制依赖公开 registry，同时更新文档和测试固定行为边界。

优点：解决真正的私有化风险面；后续默认中文和文档清理会更顺。
缺点：涉及 CLI、核心集成、文案和测试，范围比纯文档更大。

### 方案 C：一次性做完整私有化收尾

同时处理供应链、默认中文、README/NEWS、CI、benchmark、prepublish、Bridge schema 待确认项。

优点：一次性收口。
缺点：范围过大，容易把供应链风险、用户体验偏好和历史文档整理混在一起，验证成本高。

## 推荐方向

采用方案 B：先创建 `privatize-package-update-supply-chain`，聚焦包发布与外部依赖供应链私有化。

该 change 应只解决：

- Beacon 自身更新和版本检查不再硬编码公开 npm registry。
- OpenSpec、Superpowers、CodeGraph 的安装来源具备明确私有版策略。
- CLI 文案和 doctor/update/init 提示不再把公开源作为唯一或默认事实。
- README/NEWS 只同步供应链相关说明，不在本 change 中全量重写项目叙事。
- prepublish 或测试增加约束，防止重新引入公开 registry / 旧平台矩阵 / 公开安装命令泄漏。

暂不解决：

- 默认语言改为中文。
- 全量 README 品牌和社区传播清理。
- Bridge schema 是否私有化重写。
- CI、benchmark、postinstall 等非供应链主路径。

## 用户确认

用户对推荐方向回复“好”，确认按 `privatize-package-update-supply-chain` 开始生成 OpenSpec proposal 制品。
