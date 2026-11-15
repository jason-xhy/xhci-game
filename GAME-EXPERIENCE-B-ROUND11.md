# 第十一轮 Ringworks 线上五维体验

基准为线上 ad52cb3，Chrome 1280 × 900，V 隐藏外围 HUD。用实际 W 和鼠标转向走根端口→命令台、命令台→上下文台、命令台→EP0。在转弯和到站截屏，到站再向两侧各转约 43°，随后恢复正常正面操作。脚本读取可见路线标记的朝向，检验横穿和构图，不是首次试玩寻路。 [运行脚本](work/round11-comparison/walk.cjs) · [日志](work/round11-comparison/online.log)

## 1. 美学与模型逼真度

黄轨、钢桶和防撞柱建立命令台的近处尺度；连续三座吊架和两侧堆箱提供中远景。命令台向右环视，地平线的 BAY 04 目前是一面深色齐顶竖筋墙，和其周围箱体形状近似，依赖铭牌才能确定用途。龙门梁能理解为运输设施，吊具的横条与绳索提供动作暗示，但画面中看不到这些吊具和玩家所操作托盘之间的装卸边界。 [命令台左环视](work/round11-comparison/online/after/port-to-command-look-left.png) · [右环视](work/round11-comparison/online/after/port-to-command-look-right.png)

## 2. 光线与阴影

大场景龙门投影跨越道路，晴面与遮挡面仍可用来理解体量。同一命令台环视时，右侧梁、幕墙和地面暗带层级连贯；带罩的灯成为控制面上的窄线，到了朝侧的视角仍知道灯具属于台面。开放横穿路上的湿亮面受天空方向影响，反射区偶尔和道路标线交叠，但主要地箭头足够鲜明。 [根端口转角](work/round11-comparison/online/after/port-to-command-junction-1.png) · [命令台右环视](work/round11-comparison/online/after/port-to-command-look-right.png)

## 3. 模型表面质感

离命令台约三米时，能区分蓝色桶、暗色防撞柱、喷漆机柜、银色裸金属和深色护罩。桶有接缝，旁边的柱则主要依靠两条黄色标记。BAY 04 竖筋和填板在正常距离亮度接近，大面要靠检修门、通风片和线槽的实体边界表达功能，微小做旧不会替代这些结构。 [命令台左环视](work/round11-comparison/online/after/port-to-command-look-left.png) · [命令台右环视](work/round11-comparison/online/after/port-to-command-look-right.png)

## 4. 上手程度

首段转角的 COMMAND QUEUE 低牌能直接指向下一步。横转时四周有多个箱堆、横梁和低灯，低牌和地箭头指出当前转向，现有设施的侧影视觉没有同样明确的方位信息。BAY 04 若在可重复认出的同一侧有不对称檐线和检修设施，可让偏离后先知道自己朝向哪里，再沿低牌找精确路线。 [根端口离站](work/round11-comparison/online/after/port-to-command-leave.png) · [上下文横穿](work/round11-comparison/online/after/command-to-context-junction-2.png)

## 5. 可玩性

工位 E/B/H/R 和 Cycle 停件提供了可观察的现场因果。走位上，三段路径区分进站、离开和横穿，走错后可用 G 恢复。大型设施如果对应可说明的维护或通行关系，会让环视承担辨向作用。应保留对横穿有用的空地和操作半径，优先改善已有控制器箱体。 [命令台到站](work/round11-comparison/online/after/port-to-command-arrive.png) · [EP0 到站](work/round11-comparison/online/after/command-to-ep0-arrive.png)

### 三段真实到站

| 路线 | 到站 x / z | 距工位正面的投影 | 观察 |
|---|---|---:|---|
| 根端口→命令台 | -8.122 / -1.757 | 3.24 m | 5 个行走段，首转角有 COMMAND QUEUE 低牌。左右环视分别可见暖色轨、钢桶与 BAY 04。 |
| 命令台→上下文台 | 8.938 / -20.096 | 2.90 m | 此次 9 个行走段，左侧环视最适合看 BAY 04 的正面和侧墙，右侧只见箱列和吊架，可断定是候选地标有效的单侧机位。 |
| 命令台→EP0 | 7.986 / -1.983 | 3.02 m | 4 个行走段，左侧能同时看到 BAY 04、根端口和上下文台，右侧为青色传送、桶和堆箱。 |

BAY 04 本体从上下文左侧近景仍靠竖筋和平顶轮廓，没有可读的检修入口。从 EP0 左侧中景，几座吊架下的根端口、BAY 04 与上下文台分布均可看见，适合检查设施轮廓能否组织三者关系。[上下文左环视](work/round11-comparison/online/after/command-to-context-look-left.png) · [上下文右环视](work/round11-comparison/online/after/command-to-context-look-right.png) · [EP0 左环视](work/round11-comparison/online/after/command-to-ep0-look-left.png) · [EP0 右环视](work/round11-comparison/online/after/command-to-ep0-look-right.png)

本轮线上还通过两条首页预演、14 步、Enable Slot 中断与 ERDP 推进、Cycle 错选不消费和正确修复只回写一个事件、四题复盘，以及 §4.3.6–§4.3.8 实验入口。
