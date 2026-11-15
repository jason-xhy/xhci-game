# 第二十六轮 Ringworks 线上五维体验

基准 `fa867ae`，Chrome 1280 × 900、72°。用首页两条预演和默认起班进入，工位状态照片关闭 HUD。实走由按键和现有引导推进，相机替换只发生在取景帧。 [试玩脚本](work/round26-comparison/b-walk.cjs) · [试玩日志](/Volumes/mac-data/xhci-b26/online.log)

## 1. 美学与模型逼真度

EP0 的控制器侧短块、USB 侧深壳和三只青色插口在约三米外能分出主次。普通站位能一起看到主操作、两处状态和靠左的 IRQ 摘要。Shift Clock 沿用通用柜台轮廓，黄铜标件和站牌能识别位置，缺少一项一看就知道能够执行打卡的机械特征。 [EP0 正常站位](/Volumes/mac-data/xhci-round26.rovIYy/baseline/after/configure-after-h-ep0.png)

## 2. 光线与阴影

EP0 左侧金属状态盒上缘接近白色，USB 侧仍保持深色，发光的操作屏和读数底板有足够明暗差，状态文字没有被那处反光覆盖。近拍时可以看到状态窗、灯罩与柜面之间的阴影。打卡处可沿用柜顶灯，从本体移动与票口阴影看到动作结束。 [EP0 近景](/Volumes/mac-data/xhci-b26/online/after/ep0-near-idle.png)

## 3. 模型表面质感

左右状态件的亮金属与黑绝缘壳反差有效。近处可以分辨固定点、插槽边、亮金属触点和低位线缆。当前改善重点应是让 Shift Clock 票口、拉柄与护框有实际层次，沿用场内暗漆、金属接触边，再以浅色票面与工位屏区分。

## 4. 上手程度

约三米时大字 SET_CONFIGURATION 和 E QUEUE TRB 先进入视线，随后能读清 XHC SLOT / CONFIGURED 和 USB DEVICE / ADDRESSED。字小，需要短暂扫视，但当前有操作优先级。再增加一个状态面板会抢走这条视线。最后工位大字说明 E CLOCK OUT，操作后会直接出现复盘覆盖层。现场未提供一次短促的打卡视觉确认。

## 5. 可玩性

两次 H 和状态顺序已经是有效的教学操作。接下来将一次 E 转为有后果的短打卡动作，让机台先收下这班的真实成功记录，再自行打开原复盘。实际游戏不需要新增确认键。收尾装置只承载本班回执，完整的 WIP、环和上下文细节继续留在复盘。

## 末段复拍与回归

最终 USB H 后，从 EP0 回头可以看到一串金色地面箭头指向出口。沿途大牌先看到 EVENT RING 和 IRQ DESK，Shift Clock 在较远处，需要循箭头才能辨明目的地。末段以现有 G 引导到站，实到 `[1.0952, 1.7, 30, .35003, 0]`，关闭 HUD 观察，再用 E 打卡。对照机位另在 `[1, 1.7, 30, .32175, 0]` 及 `[.45, 1.65, 29.12, .22, -.13]`。到站屏能读到 E CLOCK OUT，屏幕以下大块柜面空着。 [离开 EP0](/Volumes/mac-data/xhci-b26/online/after/clock-depart-ep0.png) · [普通到站机位](/Volumes/mac-data/xhci-b26/online/after/clock-normal.png) · [固定近景](/Volumes/mac-data/xhci-round26.rovIYy/baseline/after/shift-clock-close.png)

基准实际完成 14 个工位步骤和四题复盘，随后打开 §4.3.6–§4.3.8。两次完成事件均可在 H 前后观察到物理配置读数变化。 [完整基准日志](/Volumes/mac-data/xhci-round26.rovIYy/baseline.log)
