# 第二十三轮 Ringworks 线上五维体验

基准 715aca7，Chrome 1280×900、默认 72° 视场。两条首页预演后进入根端口，从正常站位及靠近机位观察 E 前后。其余路径用于确认这一站如何接到 Enable Slot，而非重新评价已有 Cycle 和 IRQ 操作。 [脚本](work/round23-comparison/b-walk.cjs) · [线上记录](/Volumes/mac-data/xhci-b23/online.log)

## 1. 美学与模型逼真度

ROOT PORT 是开场中轴线上的独立接入口。双孔、暗色线缆、灯罩、接地脚和状态灯已经可以让玩家把它和命令、Event 工作站区分。两枚插口本身没有来回变化，复位的“硬件响应”需要从操作面看出来。最适合用这组既有设备表达一次状态变化。 [正常机位](/Volumes/mac-data/xhci-b23/online/after/port-reset-front.png)

## 2. 光线与阴影

插孔绝缘井和银色孔边处于不同明暗，可找到连接位置。面板左方回折线束自然落到地面。当前只在复位完成附近给灯反馈，看不到 PR 进行的中间状态。用同一灯的稳定颜色配短状态词，能区分已接入、复位中、端口已启用。 [根端口近景](/Volumes/mac-data/xhci-b23/online/after/port-reset-detail.png)

## 3. 模型表面质感

操作面在近处能读出暗蓝漆、金属孔框和线束橡胶的差异。应沿用现有状态屏和圆灯来表示控制器的工作状态，避免另加占据地面箭头或面板的设备。静态擦痕可支持接入口的用途，不能代替复位进程反馈。

## 4. 上手程度

直接按 E 容易推进，但屏上从 RESET USB2 跳到 NEXT: COMMAND QUEUE / USB2 PORT READY，中间没有可观察的 PR，也没有读 CCS/PED 的现场步骤。主线脚本实际把 attach、requestReset、completeReset 合在同一个 E；提示清楚，操作没有要求判断已经连接还是端口已启用。 [复位后](/Volumes/mac-data/xhci-b23/online/after/port-ready-front.png)

## 5. 可玩性

根端口适合加一次简短且有依据的现场操作。保留快捷 E，让愿意实操的玩家用独立入口读取实际 CCS/PED，再请求 PR、看见复位进行、等 PED=1 后确认。提前确认时应留在本台并说明等待的字段，复位完成才进入 Enable Slot。可信反馈来自 RootPortLab 实际状态，可继续沿用世界屏和灯。根端口通知和主线五条 Command/Transfer 完成分开。总分总仍是先看两条全局交接、现场读一个真实原因、最后复盘哪些条件让下一环节可开始。

完整线上基线通过两条预演、14 步、五次成功完成、Enable Slot IRQ、Cycle 错选与修复、描述符与端点配置、四题复盘及 §4.3.6–§4.3.8 实验入口。以上图为改动前，不包含复位中的新状态。
