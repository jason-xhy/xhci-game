# 第十九轮 Ringworks 线上五维体验

测试基准 400a040，Chrome 1280×900。用 V 关外围 HUD，到命令台后用原生 B、H、R 验证提交、提前消费拒绝、环检查和 IRQ 处理。回程试图从同一局实际完成事件处补镜头，未修改命令状态或启停时序。 [脚本](work/round19-comparison/b-walk.cjs) · [实跑日志](work/round19-comparison/online-b-final.log)

## 1. 美学与模型逼真度

主机命令台的橙轨、Doorbell 0 和命令货件建立明确的提交方向。回执货件在另一条绿色 Event Ring 行进，造型和命令托盘已分开。站在命令台处理 H 时，实际事件回程处于另一个角度，既有现场画面缺少一个同时把「IRQ」「读取结果」与「驱动当前所在工位」串起来的设备回执。 [命令待门铃](work/round19-comparison/online-b/after/cmd-queued.png) · [事件回程](work/round19-comparison/online-b/after/event-return-close.png)

## 2. 光线与阴影

命令台灯从待门铃的暖色变为 IRQ READY 的绿光，在正常站位易辨。H 后光和牌转去下一站，画面没有单独展示这笔读取刚消耗哪个事件。若补状态回执，应保留窄色光作为快速识别，把差异保留在清楚的状态词。 [IRQ 机位](work/round19-comparison/online-b/after/cmd-irq.png) · [同机位 H 后](work/round19-comparison/online-b/after/cmd-after-h.png)

## 3. 模型表面质感

门铃、屏框、导轨和完成货件的金属亮边彼此分离。硬件路径可通过材质和颜色分段，事件字段则还需要软件视图。实物回执适合沿用原屏或尺寸接近原铭牌的低位屏，避免再增加挡住货件的大牌。

## 4. 上手程度

无 HUD 时，ENABLE SLOT / B DOORBELL 0 与 IRQ READY / H READ EVENT 直接给出按键。技术字段要在无 HUD 场景中额外用 R 打开环台。当前位置的设备屏未提示 R；只看现场，容易知道怎么推进，却很难知道 Slot ID 与 ERDP 是哪里看出来的。 [无 HUD 的按需环台](work/round19-comparison/online-b/after/cmd-irq-rings.png)

## 5. 可玩性

可以把「写 Doorbell → 事件返回 → IRQ → 读回执」做成不离开工位的因果动作。保留 H 实际推进 ERDP，增加简短的成功或错误读取结果。Event Ring 设备在同一时点显示已写入、IRQ 就绪或已读取，说明它是同一事件的另一处观察点。无需强制玩家跑去 Event Desk 处理 CPU 中断。适合把精确指针和作业号留给 R，同时从工位给予明确 R 入口。

本局实际用 B 提交和 H 消费，在 V 场景下两键均成功，提前按 H 没有改变读取位置。本局 R 面板能显示成功事件，关闭后仍维持无 HUD。实拍 IRQ Ready 时的 Event 近景，货件标签是 #1 CMD CCE · OK，背景 DRIVER IRQ DESK 却显示 STANDBY。实际 H 后，同一命令台只显示 NEXT: CONTEXT BENCH，确认缺少现场回执。这些照片由固定相机捕获，H 是在原命令台处按下。 [Event 近景](work/round19-comparison/online-b/after/event-return-close.png)

完整线上基线还通过两条预演、14 步、五次成功完成、三段无 HUD 走位、Cycle 错选与恢复、四题复盘和 §4.3.6–§4.3.8 实验入口。
