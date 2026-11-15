# 第十六轮 Ringworks 线上五维体验

基准为线上 812c6ec，Chrome 1280×900。V 隐藏外围 HUD，实际按 W、用鼠标转向，拍了根端口到命令台的起点、转角与到站。上下文至 EP0 是额外观察走廊的实走，正常流程仍先回命令台走 Address Device，再进入 EP0。使用位置数据记录距离和控制停点，这次测试评估场景和路线通行。 [本轮脚本](work/round16-comparison/b-walk.cjs) · [线上日志](work/round16-comparison/online-b-final.log)

## 1. 美学与模型逼真度

出生画面有三层可认对象，左侧是桶、托盘和货柜，中间是根端口，右侧是 BAY 04。叉车适合放在左侧已有托盘作业区，形成用途关系，两米多的护顶不必盖住中央目标。上下文看向西边是较开阔的横穿区和一串低牌，新模型放在该区域中间会打断已有构图。 [出生](work/round16-comparison/online-b/after/spawn-world.png) · [上下文西向](work/round16-comparison/online-b/after/context-west-crossing.png)

## 2. 光线与阴影

龙门阴影斜过路面，潮湿亮带和桶的反射能说明主光方向。西侧叉车应由现有太阳产生接地影，先看轮胎与货叉；如落在两个湿桶的倒影范围之外，无需新增镜像或移动光源。东侧开阔地的长阴影也是横穿距离的判断线，不宜让车辆遮住低位牌旁的亮地。 [东侧参考](work/round16-comparison/online-b/after/ep0-toward-north.png) · [北侧参考](work/round16-comparison/online-b/after/aisle-toward-bay.png)

## 3. 模型表面质感

双钢桶、木托盘、箱体钢板和覆漆台面在同一户外光下有明确区分。模型候选包采用橡胶轮胎、裸钢货叉和车身喷漆等分组，不需要先扩大纹理。暖色漆应保留日光亮边，轮胎暗面需能辨出车身对地支撑，金属杆件只在小面积有高光。 [西侧托盘和湿面](work/round16-comparison/online-b/after/spawn-world.png)

## 4. 上手程度

根端口到命令台的低牌与黄轨通过不同层级说明当前方向。上下文至 EP0 侧的车间低牌和蓝色轨道在进入操作区前是参考。建议布车后用同一实际机位确认叉车不盖目标大牌、低牌及 EP0 故障货件，同时保留可绕行的外侧。 [根端口转角](work/round16-comparison/online-b/after/port-to-command-junction-1.png) · [东侧中段](work/round16-comparison/online-b/after/context-to-ep0-mid-south.png)

## 5. 可玩性

叉车可作为从低牌转回已知停放区的尺度物和场景地标。当前操作仍由工作台、环和 IRQ 驱动，叉车静置即可解释装卸环境，优先保证一次正常 14 步无需额外绕障。观察阶段不改变设备提交、Cycle 修复或总分总结构。

### 走位与候选坐标

- 根端口至命令台走了 6 段、拍到两个拐角，终点 x=-8.10、z=-1.97，面向操作屏。首个转角前景有 COMMAND QUEUE，BAY 04 在近左侧，东侧低牌和青色 EP0 轨都可作方向参照。候选叉车放在出生通道西侧，避免占这一条看向命令台的开阔带。 [离站](work/round16-comparison/online-b/after/port-to-command-leave.png) · [转角](work/round16-comparison/online-b/after/port-to-command-junction-1.png) · [到站](work/round16-comparison/online-b/after/port-to-command-arrive.png)
- 从 Context 正面 (7.97, -19.89) 出发，沿东侧开阔带向南，EP0 背面大牌在中段清楚可读。到达 EP0 正前偏西的视线点 (6.97, -1.65)，离主交互点偏远，本次停在观察范围。随后沿同一带回到 Context (8.20, -20.05) 并继续实际阶段。主线稍后由命令台到 EP0 正面 (8.10, -2.00)，正常交互成功。 [东段离站](work/round16-comparison/online-b/after/context-south-departure.png) · [中段](work/round16-comparison/online-b/after/context-to-ep0-mid-south.png) · [观察停点](work/round16-comparison/online-b/after/context-to-ep0-arrive.png)
- 叉车采用包体中心 x=-15.25、z=-22.40，朝向 +0.32 弧度，车叉朝 x=-13.86、z=-19.28 的西侧托盘。打包模型的宽／高／长约 1.22／2.31／3.35 米。按旋转包络加 0.18 米后，碰撞右缘 x≈-13.96，距 x≈-9 的根端口线约 5 米，前缘 z≈-20.44，距托盘碰撞北缘约 0.31 米。东侧候选区域没有同等清楚的装卸配对，保留作通道。 [东侧空场](work/round16-comparison/online-b/after/forklift-east-apron-looking-east.png) · [叉车来源](https://www.innerscene.com/tools/library/3d-parts/electric-counterbalance-forklift-7acc0547)

线上基线另外通过两条预演、14 步主线、Enable Slot 中断、五项成功完成、Cycle 错选与恢复、端点描述符和配置顺序、四题复盘及 §4.3.6–§4.3.8 实验入口。以上线上照片均为叉车加入前的基线。
