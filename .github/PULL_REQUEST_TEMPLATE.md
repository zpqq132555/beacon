## 变更摘要

<!-- 说明改了什么，以及为什么改；如有关联 issue，请一并链接。 -->

## 影响范围

<!-- 勾选本 PR 触及的区域。 -->

- [ ] CLI 命令（`init`、`status`、`doctor`、`update`）
- [ ] 核心安装器 / 平台检测
- [ ] Beacon skills（`assets/skills/`、`assets/skills-zh/`）
- [ ] Beacon shell 脚本（`assets/skills/beacon/scripts/`）
- [ ] 测试 / CI
- [ ] 文档 / changelog
- [ ] 其他：

## 验证

<!-- 列出已运行的命令，并简要说明结果。 -->

- [ ] `pnpm build`
- [ ] `pnpm lint`
- [ ] `pnpm format:check`
- [ ] `pnpm test`
- [ ] `pnpm test -- test/ts/beacon-scripts.test.ts`
- [ ] `pnpm test:shell`
- [ ] 未运行：

## 检查清单

- [ ] PR 标题符合 Conventional Commits，例如 `fix: handle project-scope init`
- [ ] 用户可见行为已在 `README.md` 或 `CONTRIBUTING.md` 中说明
- [ ] 行为变更已更新 `CHANGELOG.md`
- [ ] 如涉及 Skill 变更，已先修改中文版本，再同步英文版本
- [ ] 新脚本已加入 `assets/manifest.json` 和相关测试
- [ ] Shell 脚本仍兼容 macOS、Linux 和 Windows Git Bash
- [ ] 未包含无关生成文件或本地临时产物

## Review 备注

<!-- 有什么需要 reviewer 重点关注的内容？ -->
