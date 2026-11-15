# 第十八轮 Ringworks 线上五维体验

线上版本 7522094，Chrome 1280×900、玩家眼高 1.7 米、默认 72° 视场。V 隐藏外围 HUD。从开场沿实际 W 和鼠标转向走西侧，再到西北侧停步北望和回望货场。南、东和北侧另取固定相机，区分可重现画面与真实走位。 [脚本](work/round18-comparison/b-walk.cjs) · [线上日志](work/round18-comparison/online-b-final.log)

## 1. 美学与模型逼真度

西北向外看时，铺面在近处整齐截断，远排橙色货柜与吊架深色柱座悬在灰天空之上。原路转身回看，叉车、机柜、蓝桶、托盘和柱脚又都自然地落在同一铺面。这种差异表明主要问题出在地面覆盖，不是远景箱体的尺寸。 [西北北望](work/round18-comparison/online-b/after/northwest-edge-out.png) · [同位置回望](work/round18-comparison/online-b/after/northwest-edge-look-back.png)

## 2. 光线与阴影

西北柱脚底没有任何材质延续，没办法从光影判断它在场地哪一层。反向回望时，地面上的吊架阴影有明确斜向，叉车在日光下有落地感。南、东固定机位中，可见整条水平断层，近景阴影直到边缘突然消失。需要让铺面先延续，再考虑远处轻微的接触暗部，避免整体改光。 [南向边缘](work/round18-comparison/online-b/after/south-edge-out.png) · [东向边缘](work/round18-comparison/online-b/after/east-edge-out.png)

## 3. 模型表面质感

箱体肋条及近景路面的拼缝、颗粒清晰，远处的天色没有同类表面，造成混凝土很干净地被「切断」。在新旧两层接壤处使用同尺度沥青，再让远铺面逐渐变暗、变雾，可维持近地纹理与近处湿斑的阅读。 [西侧箱间](work/round18-comparison/online-b/after/west-edge-out.png) · [北侧固定边缘](work/round18-comparison/online-b/after/north-border-out.png)

## 4. 上手程度

实际抵达西北 x=-22.34、z=-27.74，北向画面中没有任何靠前围界能说明哪里是厂区外。回望可看见橙叉车、青色轨道、黄轨和低牌，仍能回到操作区。建议补少量远围界作为场地说明，同时保留回望依赖的低牌、原地下路径和 x/z ±30 物理范围。 [西北回望](work/round18-comparison/online-b/after/northwest-edge-look-back.png) · [根端口转角](work/round18-comparison/online-b/after/port-to-command-junction-1.png)

## 5. 可玩性

靠近边界探索时，天色断层暂时中断了现场环境的连续感。回到主路后，由低牌和环色重新定位并解决 Cycle 停件。远景连续表面与围界能支持这种自由环视，协议操作仍保持既有三段结构和按键反馈。无需因此把外部区域加入可通行地图。

北向的固定复拍位为 [-24,1.7,-29,0,-.10]；西北真实回望用 [-22.344,1.7,-27.743,-2.2,0]。固定南向为 [1,1.7,29,π,-.13]，固定东向为 [29,1.7,-8,-π/2,-.13]。

同一线上回合随后走完两条预演、14 个工位、五次成功完成、三段无 HUD 实际到站、Enable Slot IRQ、Cycle 错选与正选恢复、描述符与 Configure 顺序、四题复盘及 §4.3.6–§4.3.8 实验入口。外围照片是整改前基线。
