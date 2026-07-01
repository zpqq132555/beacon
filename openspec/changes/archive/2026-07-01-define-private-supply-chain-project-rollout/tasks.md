## 1. 项目级接入合同

- [x] 1.1 补充 `private-supply-chain` delta spec，定义 Beacon 私有版的项目级依赖接入路径。
- [x] 1.2 在用户可见文档中明确最小 `.beacon/config.yaml` 配置键，只要求 Beacon 自身的三项来源配置。
- [x] 1.3 在接入说明中明确 `beacon init --scope project` 和 `beacon doctor` 的使用顺序。

## 2. 升级与回滚合同

- [x] 2.1 在 capability 中定义项目升级由“依赖版本升级 + `beacon update` + `beacon doctor`”组成。
- [x] 2.2 在 capability 中明确 `beacon update` 只刷新已有安装目标，不承担首次安装、新增平台或切换 scope 的职责。
- [x] 2.3 在 capability 中定义与升级对称的回滚流程。

## 3. 首期私有化边界

- [x] 3.1 在 capability 与文档中明确首期只私有化 `beacon` 本身。
- [x] 3.2 在能力说明中确认 OpenSpec、Superpowers、CodeGraph 在首期是可选能力，不构成 Beacon 项目接入阻塞。

## 4. 验证

- [x] 4.1 运行 `openspec validate define-private-supply-chain-project-rollout --type change`。
- [x] 4.2 自查 proposal、design、tasks 与 delta spec 是否前后一致且没有多 capability 漂移。
