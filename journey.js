'use strict';

(() => {
 const root = document.getElementById('journey');
 const chapters = ['端口复位', '启用 Slot', '准备设备上下文', '分配地址', '读取描述符', '配置设备'];
 const stages = [
  ['驱动', '发布 TRB', '驱动将 Enable Slot 写入 Command Ring。此时 xHC 尚未收到通知。'],
  ['驱动', '写 Doorbell 0', '驱动写门铃，通知 xHC 有新的命令。'],
  ['xHC', '执行命令', 'xHC 取走命令，分配 Slot ID，并将完成 TRB 写入 Event Ring。'],
  ['xHC', '发出 IRQ', 'Event Ring 里已有结果；IRQ 通知驱动来取。'],
  ['驱动', '处理 IRQ', '驱动读取 Command Completion，得到 Success 和 Slot ID，并推进 ERDP。实操中可在命令台按 H。']
 ];
 const transferStages = [
  ['驱动', '发布控制 TD', '驱动在 EP0 Transfer Ring 上发布 GET_DESCRIPTOR 的 Setup、Data、Status TRB。'],
  ['驱动', '写 EP0 门铃', '驱动写对应 Slot 的门铃，目标是 EP0。'],
  ['xHC', '执行 USB 传输', 'xHC 消费控制 TD，与设备交换数据，并将 Transfer Event 写入 Event Ring。'],
  ['xHC', '发出 IRQ', 'Transfer Event 已在环里，IRQ 通知驱动处理。'],
  ['驱动', '处理 IRQ', '驱动读取 Transfer Event、推进 ERDP，再使用缓冲区里的描述符选择配置。实操中可在 EP0 按 H。']
 ];
 const previewViews = {
  root: 'ROOT PORT / USB2',
  command: 'HOST COMMAND QUEUE',
  'command-ring': '01 / COMMAND RING',
  transfer: 'EP0 DISPATCH',
  'transfer-ring': '02 / EP0 TRANSFER',
  event: '03 / EVENT RING',
  'event-desk': 'DRIVER IRQ DESK'
 };
 const commandViews = ['command','command','command-ring','event','event-desk'];
 const transferViews = ['transfer','transfer','transfer-ring','event','event-desk'];
 const challenges = [
  ['Enable Slot 已在 Command Ring。xHC 尚未收到通知。', ['写 Doorbell 0', '直接读完成事件', '写 EP0 门铃'], 0, 'Doorbell 0 通知 xHC 取命令。EP0 门铃用于控制传输。'],
  ['IRQ 已到达，随后要准备设备上下文。你现在先做什么？', ['猜一个 Slot ID', '读 Command Completion，取得 Slot ID，并推进 ERDP', '提交 SET_CONFIGURATION'], 1, '驱动从完成事件取得 Slot ID，后续才能按该 ID 准备上下文。'],
  ['已分配地址。你要读取描述符来确定端点配置，走哪条路径？', ['Command Ring → Doorbell 0', '直接读取 Event Ring', 'EP0 Transfer Ring → slot/EP0 门铃 → Transfer Event'], 2, 'GET_DESCRIPTOR 是 EP0 控制传输；端点配置完成后，再经 EP0 发送 SET_CONFIGURATION。'],
  ['刚才 EP0 的消费指针不动，DEQ 处 C=0、CCS=1，Event Ring 也没出现新事件。哪一步能恢复？', ['推进 Event Ring 的 ERDP', '选中 Transfer Ring 的 DEQ 条目，发布 C=CCS 后重写 EP0 门铃', '把下一条 TRB 的 Cycle 翻转'], 1, 'xHC 在尚未交给它的 TRB 前停住。修复消费头后，它才能继续处理控制 TD 并产生 Transfer Event。']
 ];
 document.addEventListener('keydown', event => {
  if (!root.offsetParent || event.repeat || event.target.matches?.('input, textarea, select, [contenteditable]')) return;
  const index = Number(event.key) - 1;
  if (/^[1-3]$/.test(event.key)) root.querySelectorAll('[data-answer]')[index]?.click();
 });
 const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
 };
 function button(label, action) {
  const node = element('button', label);
  node.type = 'button';
  node.onclick = action;
  return node;
 }
 function track(items) {
  const list = element('ol', null, 'journey-track');
  items.forEach(([actor, label]) => {
   const li = element('li', label);
   li.prepend(element('small', actor));
   list.append(li);
  });
  return list;
 }
 function frame(label, title) {
  const badge = element('small', label);
  const heading = element('h2', title);
  const status = element('p');
  status.id = 'journey-status';
  status.setAttribute('aria-live', 'polite');
  const controls = element('div', null, 'journey-controls');
  return {badge, heading, status, controls};
 }
 function briefing() {
  const {badge, heading, status, controls} = frame('01 / 全局预演', '从端口上线，到设备可用');
  const route = track(chapters.map((label, i) => [String(i + 1).padStart(2, '0'), label]));
  const viewport = element('figure', null, 'journey-preview');
  const sceneView = element('canvas');
  sceneView.id = 'journey-scene';
  sceneView.width = 720;
  sceneView.height = 405;
  const location = element('figcaption');
  viewport.append(sceneView,location);
  root.classList.add('home-briefing');
  let path = stages;
  let step = -1;
  let diagram = track(path);
  function show() {
   const views = path === stages ? commandViews : transferViews;
   const view = step < 0 ? 'root' : views[step];
   sceneView.dataset.view = view;
   sceneView.setAttribute('aria-label',previewViews[view]);
   location.textContent = previewViews[view];
   [...diagram.children].forEach((node,i) => {
    node.toggleAttribute('data-current', i === step);
    node.toggleAttribute('data-done', i < step);
   });
   status.textContent = step < 0
    ? '入场先到画面中的 USB2 根端口。单步预演可以先看驱动和 xHC 如何用三条环交接。'
    : path[step][2];
   next.textContent = step < 0 ? (path === stages ? '单步预演 Enable Slot →' : '单步预演 GET_DESCRIPTOR →')
    : step === path.length - 1 ? '重播往返' : '下一次交接 →';
  }
  const next = button('', () => { step = step === path.length - 1 ? -1 : step + 1; show(); });
  const compare = button('切换到 EP0 传输', () => {
   path = path === stages ? transferStages : stages;
   const replacement = track(path);
   diagram.replaceWith(replacement);
   diagram = replacement;
   step = -1;
   compare.textContent = path === stages ? '切换到 EP0 传输' : '切换到命令';
   show();
  });
  controls.append(next, compare);
  root.replaceChildren(badge,heading,route,viewport,diagram,status,controls);
  show();
 }
 function debrief(event) {
  root.classList.remove('home-briefing');
  const {badge, heading, status, controls} = frame('03 / 全链路复盘', '换一个视角：下一步该由谁做？');
  const route = track(chapters.map((label,i) => [String(i + 1).padStart(2, '0'), label]));
  const prompt = element('p');
  const keys = element('small', '按 1–3 选择，或用 Tab / Enter。');
  let index = 0;
  const focusFirst = () => controls.querySelector('button')?.focus({preventScroll:true});
  function show() {
   const question = challenges[index];
   controls.replaceChildren();
   status.textContent = '';
   keys.hidden = !question;
   [...route.children].forEach((node,i) => {
    node.toggleAttribute('data-current', i === [1,2,4,4][index]);
    node.toggleAttribute('data-done', index === challenges.length);
   });
   if (!question) {
    prompt.textContent = '复盘完成：你已串起命令、IRQ 和 EP0 传输。';
    status.textContent = '接下来可打开章节实验，观察备用接口、TT 或带宽恢复会改变链路的哪一段。';
    return;
   }
   prompt.textContent = `${index+1}/${challenges.length} · ${question[0]}`;
   question[1].forEach((choice,i) => {
    const answer = button(choice, () => {
     if (i !== question[2]) {
      status.textContent = '再试一次。' + question[3];
      return;
     }
     status.textContent = '正确。' + question[3];
     keys.hidden = true;
    controls.replaceChildren(button('继续 →', () => { index++; show(); focusFirst(); }));
     focusFirst();
    });
    answer.dataset.answer = String(i+1);
    controls.append(answer);
   });
  }
  const context = event.detail?.addressContext;
  const contextSummary = element('p');
  if (context) {
   const retry = event.detail.addressFailure ? '修正一次 Parameter Error 后，' : '';
   contextSummary.textContent = `${retry}本次 Address Device 读取 DCBAA[${context.dcbaaSlot}] 对应的 Slot ${context.slot}，并使用 EP0 Control MPS=${context.mps}。`;
  }
  root.replaceChildren(badge,heading,route,prompt,keys,controls,status);
  if (context) root.append(contextSummary);
  const endpoint = event.detail?.configuredEndpoint;
  const descriptor = event.detail?.observedEndpointDescriptor;
  if (endpoint && descriptor) {
   const retry = event.detail.configureFailure ? '修正 Configure Endpoint 后，' : '';
   const bytes = descriptor.bytes.map(byte=>byte.toString(16).padStart(2,'0')).join(' ').toUpperCase();
   root.append(element('p',`${retry}本次描述符 #${descriptor.job}（${bytes}）生成 DCI ${endpoint.dci}。驱动读到 Configure Endpoint 成功后，才向 USB 设备发送 SET_CONFIGURATION。`));
  }
  const controllerConfig = event.detail?.controllerConfiguration;
  const usbConfig = event.detail?.usbConfiguration;
  if (controllerConfig && usbConfig) {
   root.append(element('p',`本次先由 xHC 应用端点配置，驱动在 IRQ 中读取完成事件 #${controllerConfig.jobId}（${controllerConfig.code}）。随后 USB 设备执行 SET_CONFIGURATION，驱动再读取传输事件 #${usbConfig.jobId}（${usbConfig.code}）。`));
  }
  show();
  focusFirst();
 }
 briefing();
 document.addEventListener('shift:complete', debrief);
 document.addEventListener('shift:reset', briefing);
})();
