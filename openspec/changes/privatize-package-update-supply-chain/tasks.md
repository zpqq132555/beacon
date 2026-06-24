## 1. 供应链策略模型

- [x] 1.1 定义私有供应链配置结构，覆盖 Beacon 包来源、OpenSpec 包来源、Superpowers skill 来源和 CodeGraph 包来源。
- [x] 1.2 实现项目配置与环境变量读取，并明确环境变量优先级。
- [x] 1.3 为缺失私有来源提供统一的非致命状态和用户提示文本。
- [x] 1.4 添加配置解析和优先级单元测试。

## 2. Beacon 更新与版本检查

- [x] 2.1 将 `src/core/version.ts` 的 latest-version 查询改为使用供应链策略。
- [x] 2.2 将 `src/commands/update.ts` 的 npm update 参数改为使用供应链策略。
- [x] 2.3 更新版本检查和 update 命令测试，移除公开 npm registry 作为默认断言。

## 3. 外部能力包安装来源

- [x] 3.1 将 OpenSpec CLI 安装、升级和手动恢复提示接入供应链策略。
- [x] 3.2 将 Superpowers `skills add` 来源接入供应链策略，并保留四平台 agent 映射。
- [x] 3.3 将 CodeGraph CLI 安装和手动恢复提示接入供应链策略。
- [x] 3.4 更新 OpenSpec、Superpowers、CodeGraph、doctor 相关测试。

## 4. 用户说明与防回退护栏

- [x] 4.1 更新 CLI i18n 文案，避免把公开 npm/GitHub 作为唯一或默认私有来源。
- [x] 4.2 更新 README 和 NEWS 中与供应链、公开安装命令、旧平台矩阵冲突的当前说明。
- [x] 4.3 扩展 prepublish 检查或文档测试，阻止当前源码和文档重新引入公开源默认路径。
- [x] 4.4 更新私有化功能模块台账中相关功能项状态。

## 5. 验证

- [ ] 5.1 运行 `cmd /c openspec validate --change "privatize-package-update-supply-chain"`。
- [ ] 5.2 运行相关 targeted Vitest：`version`、`update`、`openspec`、`superpowers`、`codegraph`、`doctor`、`readme`。
- [ ] 5.3 运行 `pnpm format:check`、`pnpm lint`、`pnpm build`。
- [ ] 5.4 根据改动范围决定是否运行 `pnpm test`，并在验证报告中说明结果。
