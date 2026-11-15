'use strict';

// Deterministic teaching model. Each operation changes modeled device state.
const driverPrograms = {
 port: {
  fault: 'prepare_reset();\nread_portsc();',
  repair: 'prepare_reset();\nwrite_portsc();\nread_portsc();',
  operations: ['prepare_reset', 'write_portsc', 'read_portsc'],
  explanation: '只有写 PORTSC 才会提交 PR 请求。模拟器在写入后完成重置，读回观察 PED。'
 },
 cmd: {
  fault: 'ring_doorbell();\nqueue_command();\npoll_event();',
  repair: 'queue_command();\nring_doorbell();\npoll_event();',
  operations: ['queue_command', 'ring_doorbell', 'poll_event'],
  explanation: '先排队，再敲 Doorbell 0 唤醒控制器。轮询事件本身不会执行命令。'
 },
 event: {
  fault: 'check_cycle();\nread_event();',
  repair: 'check_cycle();\nread_barrier();\nread_event();',
  operations: ['check_cycle', 'read_barrier', 'read_event'],
  explanation: 'Cycle 检查确认所有权；读屏障约束随后读取 Type。模拟器用旧 Type 表示一次允许的乱序读取。'
 },
 transfer: {
  fault: 'write_trbs();\npublish_cycle();\nring_endpoint();',
  repair: 'write_trbs();\nwrite_barrier();\npublish_cycle();\nring_endpoint();',
  operations: ['write_trbs', 'write_barrier', 'publish_cycle', 'ring_endpoint'],
  explanation: '写屏障约束 TRB 内容和 Cycle 位的发布顺序。敲门铃后，控制器才能消费匹配 CCS 的 TD。'
 }
};

function runDriverProgram(kind, source) {
 const program = driverPrograms[kind];
 if (!program || typeof source !== 'string' || source.length > 2048) {
  return {valid:false, success:false, trace:['程序无效或超过 2048 字符。']};
 }
 const trace = [];
 const operations = [];
 for (const [index, line] of source.split('\n').entries()) {
  const text = line.split('//')[0].trim();
  if (!text) continue;
  const match = /^([a-z_]+)\(\);$/.exec(text);
  if (!match || !program.operations.includes(match[1])) {
   return {valid:false, success:false, trace:[`第 ${index + 1} 行无法解析：使用本题列出的 operation();`]};
  }
  operations.push(match[1]);
 }

 const state = {
  resetPrepared:false, portEnabled:false, portObserved:false,
  queued:false, commandEvent:false, commandObserved:false,
  checked:false, readOrdered:false, eventType:null,
  trbsWritten:false, trbsVisible:false, cyclePublished:false, publishedPayload:false, transferEvent:false
 };
 const effects = {
  prepare_reset() { state.resetPrepared = true; return '软件寄存器镜像 PR=1'; },
  write_portsc() {
   state.portEnabled ||= state.resetPrepared;
   return state.portEnabled ? 'MMIO 写入 PR=1 → 重置完成，PED=1' : '未设置 PR，端口未重置';
  },
  read_portsc() {
   state.portObserved = state.portEnabled;
   return '读回 PORTSC：PED=' + Number(state.portEnabled);
  },
  queue_command() { state.queued = true; return 'Command Ring 已入队 Enable Slot'; },
  ring_doorbell() {
   state.commandEvent ||= state.queued;
   return state.commandEvent ? 'xHC 消费命令 → 产生 Command Completion' : '门铃唤醒时 Command Ring 为空';
  },
  poll_event() {
   state.commandObserved = state.commandEvent;
   return state.commandObserved ? '读到 Command Completion：Success' : 'Event Ring 没有命令完成事件';
  },
  check_cycle() { state.checked = true; return '事件 Cycle 与 CCS 匹配'; },
  read_barrier() { state.readOrdered = state.checked; return '约束 Cycle 检查后的字段读取'; },
  read_event() {
   state.eventType = state.checked && state.readOrdered ? 33 : 32;
   return '读到 Event Type=' + state.eventType + (state.eventType === 32 ? '（旧值，误作 Transfer Event）' : '（Command Completion）');
  },
  write_trbs() { state.trbsWritten = true; return '软件写入 Setup / Data / Status'; },
  write_barrier() { state.trbsVisible = state.trbsWritten; return '发布屏障：此前的 TRB 字段对设备可见'; },
  publish_cycle() { state.cyclePublished = true; state.publishedPayload = state.trbsVisible; return '首个 TRB 的 Cycle 等于 CCS'; },
  ring_endpoint() {
   state.transferEvent ||= state.publishedPayload && state.cyclePublished;
   if (state.transferEvent) return 'xHC 消费完整控制 TD → 产生 Transfer Event：Success';
   return state.cyclePublished ? '看到了 Cycle，但模型注入旧 TRB 字段 → 无成功完成' : 'Cycle 不匹配 → xHC 停在原位';
  }
 };
 for (const operation of operations) trace.push(operation + ' → ' + effects[operation]());
 const success = {
  port:state.portObserved, cmd:state.commandObserved, event:state.eventType === 33, transfer:state.transferEvent
 }[kind];
 return {valid:true, success, state, trace};
}

if (typeof module !== 'undefined') module.exports = {driverPrograms, runDriverProgram};
