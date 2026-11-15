# Ringworks 第二十五轮主机与 USB 设备配置状态

2026-11-16 定稿。基准为 `ec6bbf2`。已完成端点上下文与两次配置的真实提交和完成路径。本轮依据两份试玩梳理两次配置分别对主机控制器和 USB 设备做了什么，以及驱动何时通过 H 观察到结果。[第二十四轮整改](GAME-REMEDIATION-ROUND24.md)

## P0｜用两件实物表达两个状态来源

优先在 EP0 现有机台的边缘做小型成对硬件表示。主机侧用既有配色、控制器端点分配模块和稳态灯表示建立了端点上下文；设备侧用线缆连到有 USB 端接口的独立外壳和就绪灯。两件物理上区分，保留 HOST SLOT / USB DEVICE 短铭牌、接地固定件和材料边界。它们在正常机位可同时读，且不遮挡现有 B/H/R、托盘和操作屏。不增加新必做站位、按钮或命令。命令台已有回执可以继续显示成功结果，本地成对物件用于连接两次配置的不同对象。

若主机/设备本体分别落在 BAY 04 正面和根端口线缆处，远场模型可作为这两个域的代表。需在命令台、EP0 或离场正常流程的视野中有同源短读数，避免玩家为对比两侧状态返回根端口。以 BAY 04 `[0,1.7,-20,0,0]` 与根端口 `[-9,1.7,-19.93,0,0]` 复拍本体；局部读数注明对应域，不增加第二个 USB 设备。

B 线上实操观察到 EP0 正常站位的机柜、三孔接口和青轨可表达当前传输对象，工位屏能提示 E/B/H。Configure 已读后的 `SLOT CONFIGURED / DEVICE ADDRESSED` 仍主要在外围 ledger。现有作业灯表达是否等待 H，无法同时表明两个域各完成了什么。优先把这组不同步状态放到 EP0 正常操作面附近，作为原地继续 SET_CONFIGURATION 的因果解释。基准回放已完成 14 步、复盘及三个实验入口。[B 第二十五轮试玩](GAME-EXPERIENCE-B-ROUND25.md) · [Configure IRQ 待读](/Volumes/mac-data/xhci-b25/online/after/ep0-hardware-before-h.png) · [主机已确认](/Volumes/mac-data/xhci-b25/online/after/ep0-controller-configured.png) · [两端完成](/Volumes/mac-data/xhci-b25/online/after/ep0-both-configured.png) · [线上实跑](/Volumes/mac-data/xhci-b25/online-final.log)

| 实际时点 | 主机侧 | USB 设备侧与门槛 |
|---|---|---|
| Address Device 已观察成功、尚未 Configure | Slot 已 Addressed；主机端点就绪灯灭。 | USB 已 Addressed；设备配置灯灭。 |
| xHC 执行 Configure Endpoint 成功，Event 已写入或 IRQ 已就绪 | 此时 `configuredEndpoint` 已有真实快照，主机灯可亮，短读数可提示等待驱动读 CCE。 | 设备仍未收到 SET_CONFIGURATION。H 只消费事件并切换 `configureObserved`，不能表述为 H 配置了控制器。 |
| Configure CCE 被 H 读到 | 主机配置成功且驱动已确认。 | 只有该次真实成功观察后才允许 E 队列 SET_CONFIGURATION。仍显示设备未配置。 |
| xHC 成功执行 SET_CONFIGURATION 的传输 | 主机侧持续已配置。 | 若新增明确的 USB 设备硬件状态，在成功 Transfer Event 对应的实际传输结果时置位，显示等待驱动读回。现有 `usbConfigurationObserved` 仅表示 H 后驱动已确认；如果沿用此单字段，等待 IRQ 的局部读数使用“结果已写入／待确认”，不声称设备直到 H 才收到配置。 |
| 最后 H | 两侧硬件状态不再由 H 触发变化。 | 软件读取成功，两个域的结果均已观察，可以继续打卡。说明主机端点准备和 USB 设备配置分别由不同实际事务完成。 |
| Configure Parameter Error | 失败不得点亮已配置状态；关联失败 CCE 始终需要 H。 | 不创建或执行 SET_CONFIGURATION。回到上下文台修正，按原规则重提。 |

状态只取实际已应用快照、当前完成、观察记号及明确的设备结果，避免仅由步骤编号、job 名称或显示计时猜测成功。快速与手动路径分别测试，解除错误后也不能使用旧成功标志。开新局同时清空两件的灯、标签和持久结果。

## A 试玩对应点

Saltline 本轮尝试先绕 A 去 C。靠近 A 时出现长按 E 的局部提示，玩家选择不触发，实际结算 00:24、0/3。远处能看到设备格栅、地缆、锥桶和架体，靠近才出现可操作反馈。第 23 轮的已验证 1/3 另确认了真实操作后的回执。Ringworks 可把当前可做的动作提示与已经完成的实体状态清楚区分。此轮未验证 C 可先完成或第二次切断。[A 第二十五轮试玩](GAME-EXPERIENCE-A-ROUND25.md)

## 机位与验收

1280 × 900、72° 视场、相同原环境及照明。固定机位为命令台 `[-7.8824,1.7,-2,.35661,0]`、EP0 `[8,1.7,-2,-.32175,0]`，以及新增实物约 1.5–1.8 米近景。动作由正常站位的真实 E/B/H 触发，无外围 HUD。候选两件设备应能区分，背光依靠词和轮廓，状态灯不盖货件与主台面。

1. 分别拍 Configure 前、CCE posted、IRQ ready、H 后从命令台离站，及 SET_CONFIGURATION 前、真实 Transfer Event、最后 H 后。每帧同时记录事件内容与主/设备阶段，不因截图暂停改变作业顺序。
2. 额外测试 Configure 错误，确认不会出现成功灯、不会提前排队 SET_CONFIGURATION。完成重提并读取成功后才进入 USB 设备配置。对失败、成功和下一局的实际状态分开断言。
3. 默认与手动两条主线仍按两条预演、14 步、五次成功、Cycle 错选与恢复、四题复盘和实验入口通过。复盘引用玩家本局的两个完成结果，并解释硬件变化与 H 读取的区别。
4. 检查两件新结构约三米可读、在正常行走和三段到站位置可见。保持现有碰撞和提示层级，统计同机位绘制调用、资源和重复重开后的状态。
