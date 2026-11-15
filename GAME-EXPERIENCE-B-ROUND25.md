# 第二十五轮 Ringworks 线上五维体验

基准 ec6bbf2，Chrome 1280×900、默认 72°。以实际 E/B/H 跑主线，在 Configure Endpoint IRQ 尚未读取、已读但尚未发 SET_CONFIGURATION、USB 完成后核对同一处 EP0 画面。固定相机只用于画面对比，现场推进照常来自键盘。 [脚本](work/round25-comparison/b-walk.cjs) · [线上日志](/Volumes/mac-data/xhci-b25/online-final.log)

## 1. 美学与模型逼真度

EP0 机柜、三孔接口、青色传送与实际货件能说明这里是现场控制传输入口。控制器有 BAY 04 和橙轨，EP0 是下一项软件动作所在。中后期主要依靠外围 ledger 说明这是两个独立状态，设备形体没有把“控制器已预留”和“USB 设备已接受配置”区分开。 [EP0 参考机位](/Volumes/mac-data/xhci-b25/online/after/ep0-idle.png)

## 2. 光线与阴影

事件待处理和已读的状态灯能迅速区分待 H 还是进入下一站。灯的指向仍是当前作业，不能分清控制器端点资源与 USB 设备的状态。两个独立短读数和小面积状态灯可以沿用原照明，清楚保留“一个就绪、另一个未完成”的时点。

## 3. 模型表面质感

金属孔框与深色绝缘槽近景已有区别，旁边线缆支撑了电气设施的外形。若补状态物件，应让控制器窗口与 USB 一侧的读数在形体上不同，例如分开的嵌入式窗和有低位连线的设备块。它们属于示意，不改变真实数据经过 EP0 的方式。

## 4. 上手程度

可从当前机柜读到 E/B/H 的下一动作。Configure IRQ 尚未处理时，实际不能提早提交 SET_CONFIGURATION。H 后 LEDGER 成为 SLOT CONFIGURED / DEVICE ADDRESSED，这是进 EP0 的理由，但纯场景中不直接显示这两项。复盘有正确答案，操作现场缺少一幅能先看到这组不同步状态的画面。 [控制器已配置](/Volumes/mac-data/xhci-b25/online/after/ep0-controller-configured.png)

## 5. 可玩性

此段最有价值的操作是先让 xHC 配置端点，再把 USB 设备切到同一配置。可在 EP0 操作面附近做两个低矮状态件，分别绑定模型的端点配置、Configure 是否已被驱动读取以及 USB 配置的观察结果。xHC 执行已完成、驱动尚未读事件时注明待 H；收到第二次真实完成后才将两端同为已配置。保留错误返回与所有现有按键，不加新的必经动作，也不把物件的转色当成控制器完成。

## 同机位与主线记录

固定相机 `[8, 1.7, -2, -0.32175, 0]` 依次记录了 Configure 的 IRQ 等待、H 后的下一步和 SET_CONFIGURATION 的 H 后。IRQ 就绪时 Event Ring 已经有成功完成，提前提交仍被拒绝。第一次 H 后可提交，LEDGER 显示 SLOT CONFIGURED / DEVICE ADDRESSED。第二次 H 后实际主线确认 USB DEVICE CONFIGURED。工位面板侧重下一动作，事件小牌提示通用成功，现场缺少两条并排的主体读数。 [第一次 H 前](/Volumes/mac-data/xhci-b25/online/after/ep0-hardware-before-h.png) · [第一次 H 后](/Volumes/mac-data/xhci-b25/online/after/ep0-controller-configured.png) · [第二次 H 后](/Volumes/mac-data/xhci-b25/online/after/ep0-both-configured.png)

线上完成 14 个工位步骤、四题复盘和 §4.3.6–§4.3.8 入口。测试由 Playwright 发送实际按键，并使用环境读数断言协议状态，没有以镜头摆位替代推进。 [完整日志](/Volumes/mac-data/xhci-b25/online-final.log)
