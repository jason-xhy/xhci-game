# 第二十一轮 Ringworks 线上五维体验

基准 54b1284，Chrome 1280×900、默认 72°。V 关闭外围提示，先从命令台按 W、用鼠标转向到上下文台，再往返步行观察东侧 Context→EP0 通道。东侧直线是额外场地观察，正式枚举仍先经 Address Device。脚本使用已知目标和部分引导行程，结果用于辨认现有视觉缺口。 [脚本](work/round21-comparison/b-walk.cjs) · [线上日志](work/round21-comparison/online-b.log)

## 1. 美学与模型逼真度

命令至上下文的横穿已经有具体设施变化。出命令台见 CONTEXT BENCH 低牌，横过时低牌、宽吊架和 BAY 04 会出现在不同高度。较严重的缺口在上下文台向东绕往 EP0 时。正常眼高前方主要是一台灰背壳、长青轨与远处箱列，空场没有一种设备或结构让人知道已经走到东侧通道的哪一段。 [命令台离站](work/round21-comparison/online-b/after/command-to-context-leave.png) · [上下文横穿](work/round21-comparison/online-b/after/command-to-context-junction-2.png) · [东侧中段](work/round21-comparison/online-b/after/context-to-ep0-mid-south.png)

## 2. 光线与阴影

东侧有吊架柱、箱列投下的大面积阴影，与天空湿面亮斑同框。近处朝着 EP0 背部时，开阔面在屏幕上被同一片暗地拉平，干湿能区分却缺少局部影缘。适合在东侧闲置带引入有真实顶罩的短设施，让投影来自看得见的构件，保留太阳、雾和现有台面灯。 [东向侧看](work/round21-comparison/online-b/after/forklift-east-apron-looking-east.png)

## 3. 模型表面质感

近处能分青轨漆面、深色托架、灰机壳与沥青拼缝。朝南一侧，机壳背板几乎整块同色，缺少立架、线槽或人能辨认尺度的用具。可以用哑光钢件、裸金属接缝、局部磨损和地脚说明一处真正的检修空间。

## 4. 上手程度

命令台→上下文台实走 8 段、2 个转角，约三米停在上下文台正面。东侧从上下文出发时，EP0 背面大牌说明目的地，进入中段却难从轮廓认出经过的是哪条通道。返程可用 BAY 04、Context 及地面线重新定位。货场边界和低牌都看得见，缺口主要在中场实体参照物。 [上下文到站](work/round21-comparison/online-b/after/command-to-context-arrive.png) · [东侧终点](work/round21-comparison/online-b/after/context-to-ep0-arrive.png)

## 5. 可玩性

较短的旁路能提高视线探索价值。建议把检修罩放在 x≈11.8、z≈-14.0 的东侧闲置带，朝南北展开，脚落在 x≈7–9 的行走带及 EAST AISLE 牌之外。面向进路的一侧开放，另一侧布置接入青轨的公用线槽。让建筑轮廓和投影解释通道，不加新的屏幕或必做操作。实际由上下文一路走到 EP0 x=7.27、z=-2.12，已进入可互动范围；返程继续正常任务。

补拍建议用 [8,1.7,-20,π,0] 由 Context 面向南、[7.25,1.7,-13,π,0] 走廊中段、[7.25,1.7,-13,-π/2,0] 同位东望、[8,1.7,-2,.27,.04] 从 EP0 面向北。路径中段是实际照片，坐标是用于下一轮复拍的近似固定机位。

该线上回放通过两条预演、14 步、Enable Slot IRQ、Cycle、端点配置、四题复盘及三个章节入口。脚本最后的旧资源数量断言仍期待 14 个，实际包含后来新增的叉车网格和颜色资源共 16 个，因此整条脚本退出码为 1，玩法流程此前已到达全部入口。
