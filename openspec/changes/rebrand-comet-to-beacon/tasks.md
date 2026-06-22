## 1. CLI 与包身份

- [ ] 1.1 将 `package.json` 的 package name、description、keywords、bin 从 Comet 合同切换为 Beacon 合同。
- [ ] 1.2 同步 lockfile 中的 package 元数据，确保安装后的唯一 bin 为 `beacon`。
- [ ] 1.3 更新 `src/cli/index.ts` 的 program name、description、命令说明和用户可见错误提示。
- [ ] 1.4 更新 CLI i18n 文案中所有运行指令和修复建议，确保输出使用 `beacon`。

## 2. 安装资产与 manifest

- [ ] 2.1 将 `assets/skills` 和 `assets/skills-zh` 中的 `comet*` skill 目录重命名为 `beacon*`。
- [ ] 2.2 将 reference、rules、scripts 文件名和内部路径从 Comet 合同切换为 Beacon 合同。
- [ ] 2.3 更新 `assets/manifest.json`，确保 skills、rules、hooks 只引用 Beacon 路径。
- [ ] 2.4 更新安装复制逻辑，使新安装产物只包含 `/beacon-*` skills 和 `beacon/scripts/beacon-*.sh`。

## 3. Workflow 状态合同

- [ ] 3.1 将状态文件合同从 `.comet.yaml` 切换为 `.beacon.yaml`。
- [ ] 3.2 更新 state、guard、handoff、archive、hook guard 脚本，使其只读写 `.beacon.yaml`。
- [ ] 3.3 更新脚本之间的相互调用路径，确保不再依赖 `comet-*.sh`。
- [ ] 3.4 更新状态字段校验和恢复输出中的 Beacon 命令提示。

## 4. 命令行为

- [ ] 4.1 更新 `status` 命令，使其只读取 `.beacon.yaml` 并输出 `/beacon-*` next command。
- [ ] 4.2 更新 `doctor` 命令，使检查项、缺失提示和修复建议使用 Beacon。
- [ ] 4.3 更新 `init` 命令，使 banner、语言选择、平台安装结果和依赖提示使用 Beacon。
- [ ] 4.4 更新 `update` 和 `uninstall` 命令，使其处理 Beacon assets、rules、hooks 和脚本。

## 5. 文档与测试

- [ ] 5.1 更新 README、README-zh、NEWS 和 CHANGELOG 中的运行说明，确保用户操作路径使用 Beacon。
- [ ] 5.2 保留必要来源说明中的 Comet 历史语境，但移除操作说明中的 Comet 命令。
- [ ] 5.3 更新 TypeScript 单元测试和 shell script 测试夹具，使断言验证 Beacon 合同。
- [ ] 5.4 增加或更新残留检查测试，区分允许的历史 Comet 文本和禁止的运行合同残留。

## 6. 验证

- [ ] 6.1 运行 `pnpm build` 并修复 TypeScript 构建问题。
- [ ] 6.2 运行 `pnpm test` 并修复失败用例。
- [ ] 6.3 运行脚本相关 Vitest 用例，确认 Beacon scripts 和状态合同可用。
- [ ] 6.4 手工验证 `node dist/cli/index.js --help`、`node dist/cli/index.js status --json` 和 manifest 路径不再输出 Comet 运行合同。
