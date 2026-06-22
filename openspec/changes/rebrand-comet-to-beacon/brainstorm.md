# Beacon 私有化二开改名：Brainstorm 捕捉

## 背景

当前项目是从 Comet fork 而来的 Beacon 私有化二开项目。仓库真实代码仍大量保留 Comet 命名，包括：

- `package.json` 中的 package name、bin、keywords 和 description。
- `src/cli/index.ts` 中的 CLI name、命令描述和输出。
- `assets/skills*` 下的 skill 目录、reference、rules、scripts。
- `assets/manifest.json` 中的安装产物路径。
- `status`、`doctor`、shell scripts、测试样例中的 `.comet.yaml`、`/comet-*`、`comet-*.sh` 合同。

用户明确说明：之前的功能筛选台账只是想法参考，不适用当前项目的任何功能私有化决策。因此本 change 不依赖任何台账结论、编号、批次或审查状态。

## 决策链

### Q1：Beacon 的核心定位是什么？

确认结果：Beacon 是基于 Comet 的私有化二开项目。

含义：

- Comet 是底座和来源项目。
- Beacon 不是重新设计的全新产品。
- Beacon 也不是仅做轻量安装器。
- 第一轮目标是让当前 Comet fork 在运行合同上完整切换为 Beacon，为后续功能裁剪、完善和新增打基础。

### Q2：最小化改动是否足够？

讨论结果：不建议只做最小品牌层改动。

原因：

- `comet` 不只是展示文案，而是 CLI、skill、script、状态文件、manifest、hook、测试中的运行合同。
- 只改 package/README 会导致“表面叫 Beacon，运行时仍输出 Comet”的割裂。
- 后续二开会持续背负两套命名和遗漏风险。

### Q3：是否需要兼容旧 Comet？

确认结果：不需要兼容，直接断开兼容。

具体含义：

- 不提供 `comet` bin。
- 不提供 `/comet-*` skill alias。
- 不读取或迁移 `.comet.yaml`。
- 新状态文件统一为 `.beacon.yaml`。
- 新安装产物不包含 `comet-*` 路径。

### Q4：package/bin 名称是什么？

确认结果：统一使用 `beacon`。

- package name：`beacon`
- bin：`beacon`
- CLI 命令示例：`beacon init`、`beacon status`、`beacon doctor`

## 方案比较

### 方案 A：全量一次性 Beacon 化

一次性改完包名、CLI、skills、scripts、状态文件、manifest、测试和文档。

优点：

- 命名最干净。
- 不留下兼容包袱。

缺点：

- 改动面大。
- 如果采用机械全文替换，容易破坏脚本依赖和测试夹具。

### 方案 B：外部合同优先 Beacon 化

先改所有用户可见和运行合同：CLI、skills、scripts、manifest、状态文件、doctor/status/init/update/uninstall 输出和测试。内部 TypeScript 函数名可以同步改，但不为了命名扩大风险。

优点：

- 外部行为一次断干净。
- 风险比盲目全文替换低。
- 允许后续继续清理内部命名。

缺点：

- 源码内部可能短期残留少量非合同性的 Comet 命名，需要后续清理。

### 方案 C：品牌层先改，行为层后改

先改 README、package、banner，后续再处理状态和 scripts。

结论：不推荐。

原因：

- 已确认不兼容旧 Comet，品牌层先改会制造运行割裂。
- 后续容易遗漏脚本、manifest、状态文件等深层合同。

## 推荐方案

采用方案 B：外部合同优先 Beacon 化。

第一轮必须改完所有会被用户输入、安装到项目、写入磁盘、被脚本调用、被测试断言的外部合同。内部 TypeScript 函数、变量和类型名可以低风险同步改，但不以命名洁癖扩大改动面。

## 已确认设计边界

- 唯一 CLI：`beacon`
- 唯一 package name：`beacon`
- 唯一状态文件：`.beacon.yaml`
- 唯一 skill 命名：`beacon`、`beacon-open`、`beacon-design`、`beacon-build`、`beacon-verify`、`beacon-archive`、`beacon-hotfix`、`beacon-tweak`
- 唯一脚本前缀：`beacon-*.sh`
- 不提供 `comet` bin、`/comet-*` alias 或 `.comet.yaml` 兼容读取
- 文档中只在来源说明或致谢中提 Comet，不在操作说明中使用 Comet 命令

## 设计确认

用户已确认以下设计段落：

1. 断兼容改名边界。
2. 改造分层：CLI 层、安装资产层、状态合同层、文案和文档层、内部代码命名层。
3. 运行数据流和验证标准。

## 风险

最大风险不是重命名本身，而是 shell scripts、manifest、hook 和测试之间的路径合同不一致。

控制策略：

- 不做简单全文替换。
- 按运行链路改：manifest/资产路径 → 复制逻辑 → 状态合同 → scripts 内部调用 → CLI 输出 → 测试夹具。
- 搜索残留时区分“历史来源允许提 Comet”和“运行合同不得出现 Comet”。
