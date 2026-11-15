# 第十五轮 Ringworks 线上五维体验

线上 95016fb，Chrome 1280×900；在真正的待门铃、Cycle 停滞、修复后 IRQ 就绪与 Event 回程阶段分别截取无 HUD 照片。固定镜头只替换待截图的相机并暂停作业计时，状态仍由实际 E/B/F/H 产生。命令台与 EP0 各有正常机位和货件近景，EP0 停滞与修复后使用完全相同的机位。 [脚本](work/round15-comparison/b-walk.cjs) · [日志](work/round15-comparison/online-b.log)

## 1. 美学与模型逼真度

命令货件的黄色和旁边实际 Doorbell 0 的颜色同属一条视线。大小适合轨道，但近看仍像亮面均匀的整块外壳。EP0 的待件并排，停件红色，后两件均青色。缺少能从轮廓看出 SETUP、DATA、STATUS 的结构。Event 使用另一条轨道和绿色，箱形仍与命令货件相似。 [命令待运](work/round15-comparison/online-b/after/cmd-queued.png) · [EP0 停件](work/round15-comparison/online-b/after/ep0-stalled.png) · [Event 回程](work/round15-comparison/online-b/after/event-return-close.png)

## 2. 光线与阴影

传送轨和控制柜会形成明确的局部明暗。停件的红色和机台屏警示可相互确认，暗处尚能读车间标示。货件主体的局部明暗主要由单色面受光产生，无法指向轨道接触处或可辨认部件。若新增状态窗，保留橙、青、绿作为三环识别，在故障或回程就绪时改变小面积状态件，能少淹没实体细节。

## 3. 模型表面质感

从正常距离看，轨面的窄边、立柱和工位材料更容易辨认。货件近景里难区分托盘底、绝缘件、金属边或零件用途。可用低矮底架配有不同布局的面板、卡件与窄金属磨损边，主要接触色保留在角部或轨道交界。 [命令近景](work/round15-comparison/online-b/after/cmd-queue-close.png) · [EP0 近景](work/round15-comparison/online-b/after/ep0-feed-close.png)

## 4. 上手程度

无 HUD 时可读 E/B/H/R 与有标签的头部货件。在 EP0 停滞时，红色货件告诉玩家哪个对象出了问题，后续两件却没有独立短牌，难以直接编号。精确 C/CCS、环与槽位仍通过 R 检查。让轨上货件的短名称和轮廓独立可辨，可以保留按需环作为下一层。 [正常故障机位](work/round15-comparison/online-b/after/ep0-stalled.png)

## 5. 可玩性

入队后货件等待 B，故障时错 F 不会释放，正确 F 推进到一次新的完成事件。实操因果已经形成。修复后同机位当前直接见台面 IRQ READY 和传送带清空；这一张照片是到达完成状态的记录，没拍到修好同一件的半程。建议一段短时恢复色跟随同一停件，再由真实事件时间点触发返回货件的回执显示。 [修复后同位](work/round15-comparison/online-b/after/ep0-resumed.png) · [命令台 IRQ](work/round15-comparison/online-b/after/cmd-irq.png)

本次完成两条全局预演、14 步、五次成功完成、Enable Slot 中断、三段无 HUD 走位、错误环和错误条目两种 F 拒绝、正确 Cycle 恢复、描述符和 Configure 证据、四题复盘以及 §4.3.6–§4.3.8 实验入口。Event 近景取 Enable Slot 的成功回程到达 IRQ Ready 时。原回程上的小牌实际裁切了 SUCCESS 的末尾，而机柜近景中 EP0 大牌和 Setup 浮牌有重叠。 [回程近景](work/round15-comparison/online-b/after/event-return-close.png) · [完整回归](work/round15-comparison/online-b.log)
