# 第十二轮 Ringworks 线上五维体验

线上版本 748f3d6，Chrome 1280 × 900。偏航实验关闭外围 HUD，实际按 W、鼠标转向与停步截屏。每张照片出炉后，根据画面决定下一次转向和走路方向。位置数据只用于记录测试位移，偏航恢复不调用 G 或读取游戏路线。完整主线另用已有回归脚本导航，下面分别给出观察。 [偏航与回归脚本](work/round12-comparison/detour.cjs) · [线上日志](work/round12-comparison/online-b.log)

## 1. 美学与模型逼真度

BAY 04 的边缘爬梯、屋面凸起、通风格栅与检修门构成有用途的结构。此前平顶墙主要靠铭牌辨认，本版抬头能先从轮廓找控制站，再退回看近处低牌。维护结构占用既有设施边缘，周围开阔地仍能理解为作业通道。 [同版上下文侧面](work/round11-comparison/candidate/after/context-west-crossing.png)

## 2. 光线与阴影

远景光照仍由昼光和吊架阴影主导。控制站暗侧的房体和梯架能够互相勾出边缘；迎光一侧屋脊更突出。湿地的天空反射和远处控制站外轮廓可同时看到，遇到太阳方向时应先看抬高的轮廓，再找较低的路线牌。 [同版北向](work/round11-comparison/candidate/after/aisle-toward-north.png)

## 3. 模型表面质感

控制站喷漆大面的处理仍比近处机柜粗。远处最可辨的是检修门阴缝、屋檐投影和通风片之间的层次。近处相邻的箱体有规则竖筋，电控站外饰虽仍以直线为主，换角能见不同的构件厚度和阴影，梯护与屋檐也不易误认为集装箱立筋。 [同版控制站机位](work/round11-comparison/candidate/after/aisle-toward-bay.png)

## 4. 上手程度

工位屏继续给 E/B/H/R 的上下文动作。环境辨向要经过两个视觉层级，先在远景确定电控站，再在脚边识别哪条轨道与低牌对应本任务。站间测试区分了手动视觉纠偏、跟随游戏可见箭头的脚本读数和其余 G 导航，不能据此推算新手平均时间。

## 5. 可玩性

从预演到现场，操作员上下文能靠机台提示读出；Cycle 故障提供独立验证的中断测试。偏航恢复增加了场景观察的用途，但仍属于方向感，主线中另有许多抵达后按 E 的短步骤。下一轮可继续用实际走失测试定位低牌盲区。

### 实测偏航与回正

根端口复位后，起始位置 x=-9.00、z=-19.96，画面有 ROOT PORT 和 NEXT: COMMAND QUEUE。随后真实 W 横移到 x=-4.01，实际偏离 4.99 米，再背转约 180°。南向画面中 BAY 04 消失，远处命令台背牌仍可辨，低位牌不在视野内。动态地箭仍在画面，本段没有沿它行动。 [离站前](work/round12-comparison/recovery-b/after/recovery-root-start.png) · [背转](work/round12-comparison/recovery-b/after/recovery-root-backturned.png)

按照片先北转，凭梯架、橙色凸顶和检修门认出 BAY 04；再西转，凭 ROOT PORT 大牌、双蓝桶和吊架柱确认原侧通道。跨向原路线并做一次短距离纠偏，落在 x=-8.94、z=-19.96，距原线约 0.06 米。回正后面向南，固定的 COMMAND RING 大牌、黄轨和命令台位置可辨，未从这张静止画面读到低牌。低牌仍在启动常规首段后、靠近拐点时使用。由此证实本例能用静态设施和大牌恢复方位，未证明从任意角度都能靠低牌回到正确转角。 [BAY 04](work/round12-comparison/recovery-b/after/recovery-root-step-0.png) · [向西确认](work/round12-comparison/recovery-b/after/recovery-root-step-1.png) · [回正后](work/round12-comparison/recovery-b/after/recovery-root-step-5.png) · [常规低牌](work/round12-comparison/online-b/after/port-to-command-junction-1.png) · [偏航日志](work/round12-comparison/recovery-b.log)

独立回归通过两条全局预演、14 步、五个完成事件、Enable Slot 中断与 ERDP 推进、三段无 HUD 工位路线、R 开合、Cycle 错选与只产生一个恢复事件、四题复盘和 §4.3.6–§4.3.8 实验入口。完整回归启动时另一个已终止进程留下一段交错的错误文本，后续每步、最终断言与退出以本次成功进程为准。
