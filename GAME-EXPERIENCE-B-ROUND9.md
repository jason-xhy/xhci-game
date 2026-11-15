# 第九轮 Ringworks 线上体验

线上版本 c0e7344，Chrome Playwright 1280×900、DPR 1。使用首页全局预演、工位实操与全链路复盘入口。按 V 切换纯场景，使用 W 和鼠标转向走三个连接段。固定机位截图在主线实际状态触发后采集，用于比较灯、字牌和货件。 [运行脚本](work/round9-comparison/verify.cjs) · [运行记录](work/round9-comparison/online.log)

## 1. 美学与模型逼真度

照片云层让货场有更连贯的户外尺度。进入根端口时，货柜轮廓、道路边线和工位是可辨的三个空间层次。近到货柜门边能分出四条竖向锁杆、中央门缝和门闩。命令台和 EP0 共用箱体、传送段和发光标题，辨认具体工位仍先读文字。 [开场](work/round9-comparison/online/after/spawn-world.png) · [货柜门端](work/round9-comparison/online/after/container-door.png)

## 2. 光线与阴影

亮天背后的货柜门仍在阴影里，门闩边缘和暗中缝能同时保留。钢桶附近两个低机位的湿亮带随视角变，近桶能见到局部轮廓。无 HUD 时，命令入队到 IRQ 就绪，工位最清楚的变化仍在局部显示和指示灯，远看发光件难承担状态解释。 [湿面 A](work/round9-comparison/online/after/barrel-wet-a.png) · [湿面 B](work/round9-comparison/online/after/barrel-wet-b.png) · [IRQ](work/round9-comparison/online/after/cmd-irq.png)

## 3. 模型表面质感

货柜门、锁杆和侧棱有明显的形体边界，湿面亮边和黑色轮迹也有层次。工位近看时，灯罩、面板边框和内侧支撑的表面变化更少，发光屏容易成为画面唯一的视觉重点。改进可从常驻入口机位可见的把手、冲压折边和灯罩半透明阴影着手。 [货柜侧棱](work/round9-comparison/online/after/container-corner.png) · [EP0 近看](work/round9-comparison/online/after/ep0-near-idle.png)

## 4. 游戏上手容易程度

首页预演能先交代提交、设备写事件和驱动响应三个角色。打开 HUD 时能按阶段找对应动作。纯场景能沿箭头经过分岔，抵达工位后仍要在操作面同时找标题、提示和实际目标。EP0 的故障货件、当前消费位置和可按的按键分散在不同视觉位置。 [EP0 故障](work/round9-comparison/online/after/ep0-stalled.png)

## 5. 可玩性

键盘移动、敲 Doorbell、等中断、确认 DEQ 并纠正 Cycle 形成了空间操作与协议因果相连的一段。其余步骤仍多为到达工位后按 E，连续操作时关注点容易回到 HUD。让实体设备承担「找到证据、动手处理、看见恢复」三步，能直接扩展现有 Cycle 场景的玩法。 [命令排队](work/round9-comparison/online/after/cmd-queued.png) · [EP0 恢复](work/round9-comparison/online/after/ep0-resumed.png)

## 工位实测

命令台手动到站 x=-8.075、z=-2.038，面向设备正面约 2.96 米。初始屏幕 OPERATE HERE 清晰，排队后 #1 Enable Slot 与 WRITE DOORBELL 同时可读。灯罩本体缺少常用距离可读的 B 或 Doorbell 0，初始提示也未标 E。蓝色磨损漆和棕色下门板有区分，黑色拨块、灰色护盖却容易融入正面框架。[真实到站](work/round9-comparison/online/after/port-to-command-arrive.png) · [排队](work/round9-comparison/online/after/cmd-queued.png)

同一固定命令台机位的 IRQ READY 读数与由黄转绿的灯光一致。显示屏没有 H 或读取事件的动作描述。EP0 实际到站 x=8.891、z=-2.001，正面投影约 3.00 米。常规状态下三个插口可区分，SETUP、DATA、STATUS 小字需要认真盯看。约 3 米斜角的故障画面 CYCLE MISMATCH 与红色 Setup 件醒目，货件浮牌开头被机柜占掉，但未见可直接辨认的 DEQ、C 值、CCS 或 F。这次回归在 E 前恢复 HUD，Cycle 故障修复则在隐藏时用已知按键执行。能够无 HUD 触发动作，能否仅凭现场发现动作是另一项体验。[IRQ 就绪](work/round9-comparison/online/after/cmd-irq.png) · [EP0 实际到站](work/round9-comparison/online/after/command-to-ep0-arrive.png) · [故障机位](work/round9-comparison/online/after/ep0-stalled.png)

本轮通过两条首页预演、14 步主线、5 个事件完成、4 道复盘及 §4.3.6–§4.3.8 实验入口。三段纯场景手动路线到达各自操作面。主线回归使用了已知按键和部分 G 导航，因此不能推断首次玩家走完需要几次主动打开 HUD。试跑重叠导致日志少量行交错，成功运行退出码为 0。固定机位帧间隔受重叠影响，本报告仅使用画面作状态和材质判断。
