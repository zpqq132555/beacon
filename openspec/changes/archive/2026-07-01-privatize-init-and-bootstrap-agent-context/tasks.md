## 1. 收口 init 入口品牌与中文单轨分发
- [x] 1.1 更新 `init` banner、CLI 帮助文案和相关用户可见输出，清理旧时期品牌残留
- [x] 1.2 移除 `init` / `update` 的语言选择参数、提示和分发分支，改为中文单轨运行时技能来源
- [x] 1.3 同步调整 `assets/manifest.json`、技能复制逻辑、README/NEWS 与相关测试断言

## 2. 从 CLI 中撤回 Agent 上下文初始化
- [x] 2.1 移除 `beacon init --scope project` 中误接入的 `AGENTS.md / CLAUDE.md` 初始化逻辑
- [x] 2.2 删除对应的底层实现、JSON 输出扩展与自动化测试
- [x] 2.3 同步修正文档与 OpenSpec artifacts，明确该需求延期到后续独立 skill 设计

## 3. 补齐验证与回归护栏
- [x] 3.1 为 init/update 的中文单轨分发与项目级工作目录行为补充自动化测试
- [x] 3.2 更新 README/NEWS/协作文档中的 init 合同描述，并验证与新行为一致
- [x] 3.3 运行 OpenSpec 校验与相关测试命令，确认 change 已达到 apply-ready
