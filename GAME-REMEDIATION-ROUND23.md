# Ringworks 第二十三轮根端口实操

2026-11-16 定稿。基准为 `715aca7`。本轮把首次操作中的 USB2 接入、端口复位请求和复位完成在实物上分开，使玩家能认识到“设备已接入”与“端口已就绪”是两种状态。[第二十二轮整改](GAME-REMEDIATION-ROUND22.md)

## 当前行为

现有根端口工位在第 1 步显示 E RESET USB2。按 E 时才创建 RootPortLab、attach、requestReset、completeReset，在同一轮函数内立即跳到下一站。台面的 USB2 PORT READY 和离站 NEXT 看得到，玩家无法看到实际已连接、PR 发送中或请求后的 PED。后续 Address Context 使用这个模型观察速度和端口编号，第一工位可以继续复用它。

B 在 `715aca7` 线上从正常角度及近处实拍。两个插孔、金属孔框、暗线缆和接地脚足以辨认位置，现有屏、灯及插口可直接承担状态反馈。实际按 E 后屏幕从 RESET USB2 切到 NEXT: COMMAND QUEUE / USB2 PORT READY，没有可观察的 PR 阶段。随后完成 Enable Slot 及 IRQ 消费，并跑通第 14 步、复盘和三个实验。优先让一次按键变成可观察的硬件过程，保留同一台机柜和原路线。[B 第二十三轮试玩](GAME-EXPERIENCE-B-ROUND23.md) · [操作前](/Volumes/mac-data/xhci-b23/online/after/port-reset-front.png) · [操作后](/Volumes/mac-data/xhci-b23/online/after/port-ready-front.png) · [线上回归](/Volumes/mac-data/xhci-b23/online.log)

## P0｜一次按键，两个可观察阶段

Saltline 第 23 轮再次切断 A，中继回执、机器通告及 HUD 1/3 同步更新。随后绕开遮挡至 C 约 6 米，可从码头门架旁辨认 C 的发光机柜、格栅和天线，但没有完成第二处，结算 01:30、1/3。第 20、21 轮在 A 处另记录了按住 E 后的进度环和实体灯条变化。根端口采用自身真实状态机表现请求及回执，保留单次 E 和原有可点击操作。[A 第二十三轮试玩](GAME-EXPERIENCE-A-ROUND23.md) · [既有中继证据](GAME-EXPERIENCE-A-ROUND21.md)

1. **本局控制器启动且准备就绪后，仅初始化本局一次。** 使用现有 RootPortLab 的 USB2 High Speed 场景，起步台面显示 CCS=1、CSC=1、PED=0 这一已连接状态。绿色后继就绪信号保持暗，插口的小型连接标识或表示插接的物件说明实际信号已存在。快捷启动和手动启动共用同一初始化。恢复、离开工位及重进不重新接一遍。
2. **E 和界面点击进入同一 PR 请求。** 复位请求受到真实模型条件约束，开始后可见 RESET SIGNALING、PR=1、PED=0，接头或机柜用一个短、局部且轮廓清楚的信号提示。按住 E 不负责计时。用现有可暂停的模拟步进运行一段短示范时长，表现请求和结束之间的先后，文案不把该时长当作真实 USB 总线参数。
3. **模型完成后确认就绪。** 由真实 completeReset 的 PR、PRC 和 PED 驱动状态。PED=1 才允许推进到 Enable Slot。机柜显示 RESET COMPLETE／USB2 PORT READY，离站仍保留 NEXT COMMAND QUEUE。若已有精确读数，可同时显示 PR=0、PED=1、PRC=1；避免把 PRC、CSC 说成已被驱动清除。根端口模型的状态日志和主线五次业务完成分开。
4. **保留输入可恢复。** PR 尚在进行时屏幕提示等待，重复 E 或按钮不重启计时、不多做一次附着。暂停、切后台和手册打开期间不完成。恢复继续同一请求，新一局清除挂起及旧的灯、读数、模型和下游上下文。模型未达到 PED 时不会自动进第二步。

状态变化优先用现有机柜屏、插口的可见信号和接地线附近灯体现。复位期间的颜色和文字都应可区分，不能仅依赖绿红差异。避免新增要求玩家来回移动、重复点击或打开整套 HUD。可增加简单的内嵌端口状态读数，保留线夹、插口和过去调整的照明层次。

工位需要把实际端口阶段纳入现有重绘判断。PR pending 时主线 `step` 仍是 0，`job` 也未创建，单靠这两项不足以触发重绘。把请求和完成纳入既有有界模拟步进，暂停与恢复沿用当前时钟规则。

本地候选已接入一次实际 attach、1 秒教学计时和对应的端口阶段重绘。琥珀色连接小灯依据 CCS，复位控制件在 PR 期间为青色，PED 就绪后为绿色。屏上可读初始、等待及完成寄存器位。Chrome 单次 E、重复 E、防重和暂停后同一 PR 继续运行已经通过，三个状态已在无 HUD 下同机位拍摄。点击入口及完整候选流程另行验证。[已连接](/Volumes/mac-data/xhci-round23.EKb5zU/candidate/after/port-attached-front.png) · [复位中](/Volumes/mac-data/xhci-round23.EKb5zU/candidate/after/port-resetting-front.png) · [已就绪](/Volumes/mac-data/xhci-round23.EKb5zU/candidate/after/port-ready-front.png) · [候选运行](/Volumes/mac-data/xhci-round23.EKb5zU/candidate.log)

## 机位与通过条件

在 1280 × 900、72° 视场、原光照下，拍出生 `[-9,1.7,-14,0,0]`、正常根端口正面 `[-9,1.7,-19.93,0,0]`、插口和动作件约 1.5–1.8 米的侧斜，以及复位后离站第一转角。固定相机只用于对照，动作来自现场实际 E 或按钮。

| 验收 | 状态与结果 |
|---|---|
| 出生与到站 | 快捷启动仍显示出生机位及首站引导。读到连接存在、端口未就绪与可用 E，外围 HUD 隐藏时也可读。 |
| E 与点击 | 两种操作均从已连接进入 PR pending。拍同机位的初始、复位中和完成三帧。重复键或点击不产生第二次请求。 |
| 暂停与复位 | PR pending 时实际暂停，等待超过示范时长仍保留 PR1/PED0 和第 1 步。恢复后才完成一次并显示 PED1。开启新一局应回到已连接等待首次 E。 |
| 后续命令与总分总 | 在 PED1 之前不能排队 Enable Slot。其余 13 步、五个成功完成事件、Cycle 故障恢复、Address / Configure 的手动与快捷路径、四题复盘和 §4.3.6–§4.3.8 入口保持通过。 |

自动化需验证真实 RootPortLab 的字段和计时，同时截工位读数，单独的灯色或提示文字不能替代模型状态断言。以旧测试依赖一步之内完成为回归点，更新他们等待第 1 步真实完成的条件。固定机位对比保住首站可读性，无 HUD 三段实走保留。
