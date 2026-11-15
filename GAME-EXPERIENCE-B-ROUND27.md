# 第二十七轮 Ringworks 预演与入场体验

GitHub Pages 基准 `91dbb46`，Chrome 1280 × 900。比较首页的两条交接预演、默认入场和首次工位转场。 [复现脚本](work/round27-comparison/b-overview.cjs) · [浏览器日志](/Volumes/mac-data/xhci-b27/online.log)

## 五个维度

- **美学与模型逼真度。** 进场后能凭实体站牌、轨道、机柜辨认货场。首页六节里程碑和当前交接提示已经表达清楚流程，初次看到它们时还没有机会把名称和实际场地连起来。让预演镜头展示同一套实体工位能减少这次转换。
- **光线与阴影。** 真实货场有自然视距、设备照明与结构阴影。固定角度应适度接近设备，以便轨道颜色和站牌在同一个画面可辨，并保留局部地面或固定结构作为进场后的参照。
- **模型表面质感。** 预演最值得借用的是场内真实的信号牌、不同色轨和插口轮廓。无须增加装饰零件。用实际场景近看写门铃、执行与 IRQ 交接，可以让这些现成纹理和结构第一次出现就有用途。
- **上手程度。** 默认出生位置 `[-9, 1.7, -14]` 面向根端口。Command、EP0 和 Event 都在视野后方，根端口在首屏照片中即使可辨，也无法同时作为三环方位教学。预演期间先建立工位参照，进入实操后仍以根端口为首个可做动作。
- **可玩性。** 两条可点的预演分别解释 Doorbell 0、Slot/EP0 门铃和 H。每一步呈现对应的工位构图，可以让玩家进入实操后按同一组线索找位置；保留一次起班，无需把预演变成另一条必经任务。

优先做一项改动。用同一场景中的实际机位串起现有交接预演，令 Command、EP0、Event 的状态、文字和颜色来自工位本身。结束预演或执行默认起班时恢复根端口出生构图。

## 实际走查

同一个线上会话用按钮跑完 Enable Slot 和 GET_DESCRIPTOR 各五次交接。两段预演的卡片能明确看到当前操作者，但中央遮罩和模糊背景令机台特征不可辨。入场后关闭 HUD，从 `[-9, 1.7, -14, 0, 0]` 能在叉车和 BAY 04 之间沿金色线找到 ROOT PORT / USB2。用 G 到站，按 E 等 PED=1，根端口屏更新 NEXT: COMMAND QUEUE。当前朝向仍看不到下一站，需转身沿导向走。用 G 抵达 `[-8, 1.7, -2, .32175, 0]`，琥珀色 Command Ring 牌、真实托架和 B / DB 0 同框。 [首页](/Volumes/mac-data/xhci-b27/online/overview.png) · [命令预演](/Volumes/mac-data/xhci-b27/online/command-preview.png) · [传输预演](/Volumes/mac-data/xhci-b27/online/transfer-preview.png) · [无 HUD 出生点](/Volumes/mac-data/xhci-b27/online/spawn.png) · [端口完成](/Volumes/mac-data/xhci-b27/online/root-ped.png) · [Command 到站](/Volumes/mac-data/xhci-b27/online/command.png)
