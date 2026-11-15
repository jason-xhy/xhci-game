# Ringworks 第十四轮描述符与端点配置

基准为 `e3b508e`。第十三轮的 Address Device 已有快捷路径与能试错重提的上下文台。第十四轮从本关 GET_DESCRIPTOR 实际返回的端点数据开始，完善第 9 步和下游配置。本轮两份试玩用于说明现场操作与后续结果之间的衔接。[第十三轮整改](GAME-REMEDIATION-ROUND13.md)

## P0｜把描述符、Input Context 和实际命令串起来

| 时点 | 数据与动作 | 验收 |
|---|---|---|
| GET_DESCRIPTOR | 本关设备的演示端点描述符为 `07 05 81 02 00 02 00`。在控制传输完成时写入模拟缓冲，关联本次 Transfer Event 的标识。描述符字节来自模拟数据缓冲，Transfer Event 提供完成结果及关联关系。 | 未完成、Cycle 停滞、IRQ 已到但未 H 时，驱动侧不显示已观察和解析的端点。只有成功 H 消费当前 Transfer Event 后，本关描述符才可供第 9 步使用。 |
| 第 9 步上下文台 | 从 `bEndpointAddress=0x81` 推导 EP1 IN，`bmAttributes=0x02` 为 Bulk，`wMaxPacketSize=0x0200` 为 512。使用既有 EndpointContextLab.dci / build，则 IN 的 DCI 为 `2×1+1=3`。本关仅新增 EP1 IN，Input Control Context 设置 A0 和 A3，Add mask 为 `0x9`，不重置已有的 EP0（A1 未置位）。 | 快捷 E 和手动入口均使用同一份实际已经观察到的描述符。可见当前原始字节、解码后的地址/方向/包长、生成的 DCI 与 Add mask。其它设备实例不套用本关固定地址和包长。 |
| 应用与发布 | 以数据构造实际的端点输入上下文，记录采用的环地址、初始 DCS 和已观察的来源事件。应用后冻结配置快照，送入同一 Configure Endpoint Command TRB。 | 在第 10 步的 Command TRB / job 中确认相同快照标识或引用；作业执行只读此前确认的字段。命令在 E、B、IRQ、H 路径推进。取消未应用草稿不会改已确认快照，重开局清理来源、草稿与配置行为。 |
| 错误与恢复 | 选错 IN/OUT 或选错端点时，对照实际描述符的检查属于驱动或本关教学模型。不要将设备描述符一致性判定冒称为通用 xHC 功能。输入结构或适用字段错误可复用既有控制器校验。 | 在软件检查拒绝时没有命令完成事件。进入控制器的错误按真实校验产生与该 TRB 关联的完成事件，H 读出后保留已有 Addressed 状态和 EP0，不提前设置 Slot/USB Configured。玩家能在同一局回到上下文台修正并重新提交。 |
| 配置次序 | xHC 执行 Configure Endpoint 成功后可更新 Slot 的硬件状态。驱动必须实际读到对应成功 Command Completion，才允许向 USB 设备发送 SET_CONFIGURATION。这个条件由提交逻辑检查，工位提示和按钮状态读取同一条件。 | 未 B、未 H 或错误结果三种情况下尝试提交 SET_CONFIGURATION 都不会创建对应 TD。成功 H 后界面可见“控制器已配置，USB 设备仍 Addressed”；USB 设备配置完成独立由 SET_CONFIGURATION 的成功传输结果确认。 |

Linux 的 xHCI 驱动按 endpoint index 加一生成端点标志，并直接用 `0x81` 举例说明 DCI3 和端点位 `0x8`。本关的 `0x9` 还包含 Slot Context 的 A0。[Linux xHCI 端点标志](https://github.com/torvalds/linux/blob/master/drivers/usb/host/xhci.c#L1377)

B 在 `e3b508e` 的线上走查分别用 MPS 8 和 64 提交 Address Device，均验证实际快照进入 Command TRB。MPS 8 产生 Parameter Error 的独立 IRQ，读后返回上下文台修正。第 9 步同姿态到站，C 未打开工作台，E 直接进入第 10 步，仍没有把 GET_DESCRIPTOR 数据接到可操作的上下文准备。第十四轮优先补齐这一缺口。[B 第十四轮试玩](GAME-EXPERIENCE-B-ROUND14.md) · [实跑日志](work/round14-comparison/online-b.log) · [第 9 步实拍](work/round14-comparison/online-b/after/configure-context.png)

A 在 Saltline 真实进入 Holdout / Hard。Q 同步切换手持模型、名称与弹量读数，输入后弹量从 15 降到 13。受击方向及生命降低有单独反馈，最终结算 00:16、0 波、0 击毁。可借鉴的是将选择、现场对象、数值和后续结果一起反馈。此轮未验证命中、跨波或难度差异。[A 第十四轮试玩](GAME-EXPERIENCE-A-ROUND14.md)

## P1｜操作面和复盘

第 9 步的工位屏同时显示已观察的数据来源及快捷／深入入口。约 3 米正面能识别下一动作，控制细节在独立工作台呈现。使用端点方向标志、环地址和掩码随实际选择更新的图示，让玩家看出读取、写入及提交的边界。按需环视图继续显示真实完成和错误。退出工作台，整套 HUD 不会自动打开。

复盘引用本局看到的端点字节、提交的 DCI 和实际完成状态。继续解释先配置控制器再配置 USB 设备的原因。只保持当前教学设备数据和 Address Device 路径分离，避免在复盘中把两种 Input Context 混为一份。

## 回归与通过条件

1. 快捷路径从首页走两条预演、14 步现场、五次成功完成、Cycle 错选与恢复、4 题复盘及三个实验入口。V 隐藏、R 查环、G、鼠标与键盘继续工作。
2. 手动在第 9 步先选一组不匹配的方向或结构，验证拒绝或错误完成与实际快照相符。若该错选属于软件拒绝，额外测试通过已发布上下文制造一个能够产生错误完成的结构，以覆盖 B 到 H 的关联和恢复。修正后 Configure 成功并允许发 SET_CONFIGURATION。
3. 用故障、尚未消费、取消、重开、连续操作及快/手两条路径覆盖生命周期。检查 Address Device / Configure Endpoint 的数据分别冻结，不能跨阶段复用或回写。默认成功路径仍是 5 次成功，附加错误事件单独统计。
4. 实拍 GET_DESCRIPTOR 尚未 H、成功 H 后、错选、正确应用、第 10 步入队和 IRQ、Configure 成功后 USB 仍 Addressed、SET_CONFIGURATION 后均 Configured。测试同时读取命令及状态变化，单看提示文字不视为通过。

## 候选实测

默认 Address Device 之后，GET_DESCRIPTOR 返回的 7 字节先留在模拟传输缓冲，直到 Transfer Event IRQ 被 H 处理后，第 9 步才读出 EP1 IN。工作台拒绝 OUT/DCI 2，未增加 Command Ring 入队计数。保留 IN/DCI 3 但去掉 A0 后，冻结的 `Add=0x8` 快照随 Configure Endpoint 提交，收到 Parameter Error，H 推进 ERDP 后回工作台。补 A0 得到 `Add=0x9` 并重试。xHC 成功执行后、驱动 H 之前尚不能提交 SET_CONFIGURATION。H 确认后 Slot 已 Configured，USB 设备仍 Addressed，直至 SET_CONFIGURATION 完成事件被处理。手动纠错路径继续到 14 步结束、四题复盘和三个实验入口。

[工位同机位对照](work/round14-comparison/configure-context-comparison.jpg) · [方向错选](work/round14-comparison/candidate/after/endpoint-invalid-direction.png) · [Configure 成功被驱动观察](work/round14-comparison/candidate/after/configure-observed.png) · [本地走查](work/round14-comparison/candidate.log)
