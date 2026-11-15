# 第十四轮 Ringworks 线上五维体验

测试线上 e3b508e，Chrome 1280 × 900。第 4 站操作上下文草稿，第 9 站用同一个 C 尝试打开台面，再按屏幕所示 E。两张固定机位使用同一台工作台同一姿态，便于比较内容。走站使用键盘、鼠标及已有回归导航。 [本轮回归脚本](work/round14-comparison/b-walk.cjs) · [本轮实跑日志](work/round14-comparison/online-b.log) · [第十三轮发布人工路径](work/round13-comparison/release-manual.log)

## 1. 美学与模型逼真度

上下文台是在同一壳体内带横向工作面的独立工位，施作空间与厂区其他操作点有可见区别。两次到站使用同实体合理，场景构图容易复认。两次任务需要的证据不同，因此屏上也应明显切换可编辑对象。 [第 4 站](work/round14-comparison/online-b/after/address-context.png) · [第 9 站](work/round14-comparison/online-b/after/configure-context.png)

## 2. 光线与阴影

上下文工作台黑色遮光边、金属机壳与白色文字分离，工位屏仍是约三米操作位最清楚的读数。交互区别来自文字和真实数据；没有新增光效也能说明从地址准备进入端点准备。两次同位能读到屏幕提示，但第 9 站没有第 4 站的 C 深入入口。 [第 9 站按 C 后](work/round14-comparison/online-b/after/configure-context-c-no-panel.png)

## 3. 模型表面质感

台沿、屏衬和拉手有相对粗糙度差异，底柜深色漆保留边角。当前灯具与装配结构能支持正常读屏。新增端点交互若增加一个台面薄面板，可用匹配传送环的窄青色标识已有配置的进度，不宜让它遮住字牌或原有操作面。

## 4. 上手程度

第 4 站 C 会打开 Address Device 工作台，说明真实 Slot ID 与 PORTSC High Speed，先允许快捷 E，再可理解改什么。错误 DCBAA 在软件侧指出不匹配，错误 MPS=8 可以看到命令返回 Parameter Error、H 消费并回台修正。第 9 站虽然仍能照屏按 E，用户刚从 GET_DESCRIPTOR 得到一次完成，却没有看见将哪些端点数据转换成怎样的 Input Context。

## 5. 可玩性

第 4 站把「读取上一步证据 → 编辑 → 下游命令结果」接了起来。第 9 站应保留快捷 E，通过 C 展示本局实际观察到的配置描述符。显示端点地址、IN/OUT、类型和包长，以一个真实判断为核心。玩家选择实际端点及其 DCI，程序复用 EndpointContextLab.build 生成上下文并展示环基址、DCS 与添加位。对于一个 USB2 High Speed Bulk IN EP1 的训练样例，0x81 映射 DCI 3，传输环和 Qword 字段由同一次草稿形成。方向或 DCI 选错时应清楚指出对应字节并停在工位；可执行但无效的上下文才进入 Configure CCE 错误链。后面仍要按 B 及 H，USB SET_CONFIGURATION 只能在 Configure Endpoint 被驱动观察成功后继续。

保留两条全局预演、14 步工位实验、四题复盘的整体节奏。复盘可用本回合的描述符、选择的 DCI 和成功 CCE 拼出控制器配置与 USB 设备配置的区别。验证快捷路线仍有五个成功业务事件，错误软件提交不制造 IRQ，对控制器提交的有效输入来源可追溯。

本轮线上完成两个预演、一次 Address Device 错误 IRQ 与修复重提、14 步主线与五个成功业务事件、Cycle 错选及恢复、四题复盘和 §4.3.6–§4.3.8 实验入口。第 9 站实按 C 未出现面板，再按 E 即刻推进到第 10 站。
