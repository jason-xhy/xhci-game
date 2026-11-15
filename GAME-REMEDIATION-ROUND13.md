# Ringworks 第十三轮主线操作深度

基准为 `76a007b`。第十二轮已改善地图上的方向提示，第十三轮重点是让玩家实际准备控制器会读取的数据，依据结果完成下一步。本轮证据覆盖 Saltline 的侧道试走和 Ringworks 的线上工位实操。[第十二轮整改](GAME-REMEDIATION-ROUND12.md)

## 现有落差

主线在根端口复位、准备设备上下文、准备端点配置时，E 当前会写预设结果文字并推进步骤。后面的 Address Device 与 Configure Endpoint 由声明生成命令，主线的命令回环目前在成功路径上统一生成 Success。相比之下，EP0 的 Cycle 故障必须先读实际消费头，再选对条目修复，行走、操作、控制器结果及复盘形成实际因果。建议先把上下文准备也接到后继命令的数据链，再考虑细化其他步骤。

现成独立实验已提供可复用的模型。SlotContextDMALab 以实际 Input Context 字段、Output Context、DCBAA 与 EP0 环关系验证 Address Device，并在完成事件被驱动观察前保留命令关系。EndpointContextLab 可从端点描述符计算 DCI 和构造 Endpoint Context。RootPortLab 区分请求复位及最终完成。主线可复用已验证的字段构造与验证逻辑，保持同一个命令、事件及 IRQ 流程。Linux 的初始化实现可对照 HS 的 MPS 64、EP0 的 Control 类型及环 DMA 与 Cycle 值。另在分配虚拟设备时把 Output Device Context 地址写到本 Slot 的 DCBAA。[Linux xHCI 内存初始化](https://raw.githubusercontent.com/torvalds/linux/master/drivers/usb/host/xhci-mem.c)

A 在 Saltline Mission 重试选择 Lane 1，贴箱后后退并横移，实际进入另一条侧道。A/B/C 从 29/33/50 米降至 19/21/38 米，仍为 0/3。菱形标记在箱体遮挡时仍显示，按 E 没有产生中继反馈。可借鉴的交互是让可选动作受真实条件约束，并让靠近、选错与成功产生可区分的场景结果。不能把该次侧道选择当作已完成中继。[A 第十三轮试玩](GAME-EXPERIENCE-A-ROUND13.md)

B 在线上使用正常到站和现场画布提示完成 14 步、5 次完成事件及复盘。两次上下文都只按 E。第一次到站后画面仅提供 E PREPARE CONTEXT，刚读到的 Slot ID 与台面没有可操作联系。EP0 的选择有可检验差别，错选 F 时不前进，选择实际 DEQ 后同一停件续行。该次验证使用已知流程和 G，未进行首次玩家测试。[B 第十三轮试玩](GAME-EXPERIENCE-B-ROUND13.md) · [线上回归](work/round13-comparison/online-b.log) · [第一次上下文台实拍](work/round13-comparison/context-arrive.png)

## P0｜可选的上下文动手台，验收看实际提交

保留 14 个阶段。到第 4 步的上下文机台依然有快捷 E，使用本次已观察到的数据填默认可用内容。增加可选的深入操作入口，在现有设备前打开上下文台。先为一个教学场景落地，例如可编辑 A0/A1 和 EP0 最大包长，显示来自上一阶段的 Slot ID、根端口编号和 USB2 High Speed 状态。备用的正常字段可按同一模板填入。第 9 步的进阶操作可从实际读回的端点描述符选择方向和端点编号，显示计算出的 DCI，再选择真实环配置。优先让第 4 步走通后继校验，再扩第 9 步。

| 环节 | 玩家动作与可观察结果 |
|---|---|
| 取得证据 | Handle IRQ 后实际读取 Enable Slot 的 Slot ID。机台展示控制器返回值和本次根口速度，供草稿选择依据。若显示端点描述符，数据应来自主线真正完成的 GET_DESCRIPTOR，仅用于当前教学关的设备实例。 |
| 写入草稿 | 允许选择合理但有差异的字段，例如本示范 USB2 HS 的 EP0 包长 8 或 64。允许返回修改。提交前显示实值、Control 类型、Slot Context 与 EP0 Context 的选择标志和 DCBAA 使用关系。 |
| 生效到命令 | 把快捷值和手动草稿都转换为同一种主线准备数据。应用操作冻结一份带阶段身份的快照，Address Device / Configure Endpoint 入队时，job 和相应 Command TRB 引用同一份已确认快照。执行从 Command TRB 所引用的值读取，不再根据预设结果文字推进。E 入队、B 门铃、xHC 执行、写入事件、IRQ 后 H 的链路继续使用现有流程。执行结果从字段验证得出。 |
| 失败和恢复 | 错选可留在软件校验，引出明确语义的失败，例如所选 Slot 没有有效 DCBAA 映射。适合硬件执行的错误，可按既有验证结果生成关联当前命令的错误完成事件。驱动读出后保持未 Addressed / 未 Configured，返回上下文机台修正，然后重新提交。同条配置已被执行占用时禁止修改其数据快照。 |
| 复盘 | 比较实际经保存的数据，关联 Slot ID、DCBAA、Context 与下一条命令。若发生过错误，回放本局的正确与错误完成。保持现有全局预演、现场实操和全链路复盘。 |

不要把当前主线的简化结果称为完整 DMA 仿真。若只选择单条验证，说明其教学假设并从现有辅助模型取判定。DCS 值应与示范环的首项 Cycle 配对，避免把 DCS=0 普遍说成非法。快速与手动路径共享实际校验。失败完成若被驱动读走，和五次成功提交分开计数，避免复盘误认为快速路径有额外成功。

## P1｜后续有意义的操作

有余力时让根端口从实际检查 CCS/CSC、请求 PR 到观察 PED。快捷 E 可完成同一请求和观察的正常链，深入模式允许先请求后读状态。第 9 步优先从返回描述符计算 IN/OUT 对应的 DCI，并观察错误布局和成功配置对后续 USB SET_CONFIGURATION 的影响。保持两个新增段的错误可逆，避免首轮同时引入大量寄存器必填字段。

## 通过条件

1. 快捷默认路径仍从首页跑完预演、14 步、5 次成功完成、Cycle 错选和正确恢复、4 道复盘、三个实验入口。保留 V、G、鼠标及键盘操作。
2. 深入路径从真实 Enable CCE 观察 Slot ID，尝试一组可逆无效草稿，检查错误从提交数据实际产生。选择进入命令的错误应能完整走 E/B/IRQ/H 硬件反馈，未改变 Addressed/Configured，能回机台改对，同一局继续完成。拦截到软件校验的错误应当不产生完成事件。
3. 两条路径用相同命令快照与验证。修改草稿不会回写已入队或已执行上下文。取消仅丢弃未应用草稿，保留本阶段最后确认值。重开局清空草稿、已应用快照和后继命令关联。Address Device 与 Configure Endpoint 分别使用独立快照，不跨阶段复用。用测试验证已确认快照与 Command TRB 消费一致、错误事件关联、无重复 IRQ、修复后成功及最后五个业务阶段完成。测试夹具 `tests/trb-lifecycle.cjs` 会抽取主线函数，若新增依赖需提供可注入的模型。
4. 正常机位实拍说明，工具台展示的是已知证据、可编辑字段与实际结果。关外围 HUD 时能从工位发现入口，并在状态反馈之后打开按需精确视图。如果回归脚本知道正确选项，只把结果当作功能验证。

## 第 4 阶段候选实测

上下文机台的同机位新增 `C EDIT CONTEXT`。打开后，实际 Enable Slot IRQ 收到的 Slot ID 和复位后的端口状态出现在工作台。错选 DCBAA 槽时保存被拒绝，取消重开清除未保存的选择。另保存 High Speed / MPS 8 的教学错误，确认同一已冻结数据附在 Address Device TRB；B 后控制器产出 Parameter Error，H 处理 IRQ 并推进 ERDP，Slot 保持 Enabled，设备保持 Default，流程返回上下文台。改为 MPS 64 后同一局重新提交，成功推进到读描述符。第 9 阶段沿用原快捷准备流程。

[工位同机位对照](work/round13-comparison/context-comparison.jpg) · [上下文面板](work/round13-comparison/candidate/after/context-panel.png) · [实测记录](work/round13-comparison/candidate.log)
