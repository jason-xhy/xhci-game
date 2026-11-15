# 第十轮 Ringworks 线上体验

线上 32c74ba，Chrome 1280 × 900，进入主线后用 V 隐藏外围 HUD。Playwright 监听实际 Canvas 工位屏的文字绘制，再按屏上读到的动作键。故障处从环台读按键和字段。站间用 G，脚本知道要寻找的动作类型和协议任务，因此这次验证可发现的现场信息与实际响应，未模拟不熟悉 xHCI 的首次玩家。 [脚本](work/round10-comparison/discovery.cjs) · [日志](work/round10-comparison/discovery.log)

## 1. 美学与模型逼真度

约 3 米处，命令台控制面有橙色圆形门铃、右侧拨件和独立托盘，根端口的黑色回折线束、方形紧固座与双 USB 插孔组成较有用途的轮廓。EP0 靠近后，三槽里的触点、绝缘井和标牌能一一对应，机柜外围仍主要是规则折角和共用底柜。接口背后的钣金安装、线束的固定方式和盖板连接比器件正面的结构更简略。 [根端口](work/round10-comparison/root-port.png) · [命令台](work/round10-comparison/cmd-queued.png) · [EP0 同版近景](work/round9-comparison/candidate/after/ep0-near-idle.png)

## 2. 光线与阴影

亮天空保留了较暗的机柜侧面；同一命令台由待门铃转 IRQ 时，灯光与文字同时变。近看 EP0，顶杆局部和屏下银色窄边接近纯白，主体屏内容仍清晰。狭长的亮面在近景比可操作件更先吸引注意，故障色用于指向故障货件时价值更大。 [命令排队](work/round10-comparison/cmd-queued.png) · [IRQ](work/round10-comparison/cmd-irq.png) · [EP0 同版近景](work/round9-comparison/candidate/after/ep0-near-idle.png)

## 3. 模型表面质感

根端口蓝钢板能看到局部擦痕，黑线缆、哑光柜门与明亮孔框在正常操作距离可区分。EP0 的接触件靠近仍呈同样均匀的亮边，近白曝光也减弱了银边与台阶的细微差异。接口井深色、触点金属色与浅蓝绝缘舌因此比较容易辨认；下一步适合把差异集中到护盖、固定螺丝与反复接触处。 [根端口](work/round10-comparison/root-port.png) · [EP0 同版近景](work/round9-comparison/candidate/after/ep0-near-idle.png)

## 4. 上手程度

根端口操作面给出 E RESET USB2。命令台先给 E QUEUE TRB，等入队后变为 B DOORBELL 0，IRQ 到来再写 H READ EVENT。键位和台面动作已经能沿一条视线读完；故障才需要 R 进入精确环字段。用 G 靠站过程中，会先接触可互动范围后才抵达面板正面，若屏初见被机壳挡住，可稍等引导转到正面。 [根端口](work/round10-comparison/root-port.png) · [命令排队](work/round10-comparison/cmd-queued.png) · [精确环台](work/round10-comparison/ep0-rings.png)

## 5. 可玩性

预演先看到生产、消费、IRQ 三种交接，实操能看到按键作用在实体门铃与货件，故障要求参照消费头选择条目，最后复盘把它们连起来。上下文准备与部分提交仍是走到站按 E。给常规操作更多玩家可观察的物理因果，会比仅增加按键种类更有用。 [故障件](work/round10-comparison/ep0-fault.png)

线上读取故障屏的 R INSPECT RING 打开精确环，读到 O RING、I ENTRY、F REPAIR，选择 Transfer Ring 的 DEQ 处理后回到工位，待 H READ EVENT 出现再消费事件。全过程保持外围 HUD 隐藏。这个动作发现验证和旧版按预设键序的纯场景路线互补，没有测量新手自行解题需要的时间。

回归通过两条全局预演、14 个主线阶段、5 个完成事件与四题复盘。日志保留了每个由屏显发现的动作及其所在坐标。[完整记录](work/round10-comparison/discovery.log)
