## 1. `/beacon-init` 技能入口与分发注册

- [x] 1.1 新增 `assets/skills-zh/beacon-init/SKILL.md`，定义手动调用时基于当前工作区的 AGENTS 全量维护、摘要优先确认和 `CLAUDE.md` shim 合同。
- [x] 1.2 新增 `assets/skills/beacon-init/SKILL.md`，与中文版保持行为一致。
- [x] 1.3 更新 `assets/manifest.json`、`README.md` 与运行时入口说明，把 `/beacon-init` 纳入已安装 Beacon 技能集合。

## 2. AGENTS 拓扑与 archive 沉淀规则

- [x] 2.1 新增中英文 AGENTS 参考文档，明确根 `AGENTS.md`、目录级 `AGENTS.md`、`[职责].md` 和更深层节点的准入边界。
- [x] 2.2 更新 `assets/skills-zh/beacon-archive/SKILL.md` 与 `assets/skills/beacon-archive/SKILL.md`，加入“静默忽略 / 摘要建议 / 用户确认后转调 `/beacon-init`”合同。
- [x] 2.3 更新 `assets/skills-zh/beacon/SKILL.md` 与 `assets/skills/beacon/SKILL.md`，补充 `/beacon-init` 的入口定位、与 archive 的协作关系以及引用的新参考文档。

## 3. 测试、版本与验证

- [x] 3.1 更新 `test/ts/skills.test.ts`、`test/ts/readme.test.ts` 等断言，覆盖 manifest 分发、skill 内容、README 文档和 archive 协作行为。
- [x] 3.2 根据 `master` 当前版本决定 `package.json`、`package-lock.json` 与 `CHANGELOG.md` 的版本和条目，确保中英文 skill 同步后再写 Changelog。
- [x] 3.3 运行 `openspec validate`、`pnpm format:check`、`pnpm lint`、`pnpm build` 与相关 `vitest` 验证，并回填本 change 的执行状态。
