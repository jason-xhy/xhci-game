'use strict';
// Linux xHCI excerpts from torvalds/linux (GPL-2.0).
const workbenchRevision = "23c62304dde29abe92013d85910d03a77dada35d";
const workbenchCases = {
  "port": {
    "step": 0,
    "file": "xhci-hub.c",
    "first": 1468,
    "last": 1472,
    "spec": "§4.3.1 / PORTSC.PR",
    "lines": [
      "\t\tcase USB_PORT_FEAT_RESET:",
      "\t\t\tportsc |= PORT_RESET;",
      "\t\t\txhci_portsc_writel(port, portsc);",
      "",
      "\t\t\tportsc = xhci_portsc_readl(port);"
    ]
  },
  "cmd": {
    "step": 1,
    "file": "xhci-ring.c",
    "first": 436,
    "last": 440,
    "spec": "§4.1 / Doorbell 0",
    "lines": [
      "\ttrace_xhci_ring_host_doorbell(0, DB_VALUE_HOST);",
      "",
      "\twritel(DB_VALUE_HOST, &xhci->dba->doorbell[0]);",
      "\t/* Flush PCI posted writes */",
      "\treadl(&xhci->dba->doorbell[0]);"
    ]
  },
  "event": {
    "step": 2,
    "file": "xhci-ring.c",
    "first": 3003,
    "last": 3008,
    "spec": "§4.9.4 / Event Cycle",
    "lines": [
      "\t/*",
      "\t * Barrier between reading the TRB_CYCLE (valid) flag before, and any",
      "\t * speculative reads of the event's flags/data below.",
      "\t */",
      "\trmb();",
      "\ttrb_type = TRB_FIELD_TO_TYPE(le32_to_cpu(event->event_cmd.flags));"
    ]
  },
  "transfer": {
    "step": 6,
    "file": "xhci-ring.c",
    "first": 3447,
    "last": 3452,
    "spec": "§4.9.2 / TRB 发布",
    "lines": [
      "\twmb();",
      "\tif (start_cycle)",
      "\t\tstart_trb->field[3] |= cpu_to_le32(start_cycle);",
      "\telse",
      "\t\tstart_trb->field[3] &= cpu_to_le32(~TRB_CYCLE);",
      "\txhci_ring_ep_doorbell(xhci, slot_id, ep_index, stream_id);"
    ]
  }
};

const workbenchButton = document.getElementById('code-workbench');
const workbench = document.createElement('dialog');
workbench.id = 'driver-workbench';
workbench.setAttribute('aria-labelledby', 'driver-workbench-title');
document.body.append(workbench);
const solvedCases = new Set();

function openWorkbench(key) {
 const task = workbenchCases[key];
 if (!task || workbench.open) return;
 workbench.replaceChildren();
 const program = driverPrograms[key];
 const title = document.createElement('h2');
 title.id = 'driver-workbench-title';
 title.textContent = '驱动代码台';
 const rule = document.createElement('p');
 rule.textContent = task.spec + ' · ' + program.explanation;
 const editor = document.createElement('textarea');
 editor.setAttribute('aria-label', '编辑模拟代码');
 editor.spellcheck = false;
 editor.value = program.fault;
 const allowed = document.createElement('p');
 allowed.className = 'driver-operations';
 allowed.textContent = '可用操作：' + program.operations.map(name => name + '();').join('  ');
 const controls = document.createElement('div');
 controls.className = 'driver-controls';
 const result = document.createElement('p');
 result.setAttribute('role', 'status');
 result.textContent = '运行当前代码，观察故障，再编辑并重跑。';
 const trace = document.createElement('pre');
 trace.className = 'driver-trace';
 const source = document.createElement('details');
 const summary = document.createElement('summary');
 summary.textContent = '对照 Linux 主线源代码';
 const code = document.createElement('pre');
 code.textContent = task.lines.map((line, i) => (task.first + i) + '  ' + line.trimStart()).join('\n');
 const link = document.createElement('a');
 link.href = 'https://github.com/torvalds/linux/blob/' + workbenchRevision +
  '/drivers/usb/host/' + task.file + '#L' + task.first + '-L' + task.last;
 link.textContent = task.file + ' · ' + workbenchRevision.slice(0, 12);
 link.target = '_blank';
 link.rel = 'noopener noreferrer';
 source.append(summary, code, link);

 function button(label, action) {
  const control = document.createElement('button');
  control.type = 'button';
  control.textContent = label;
  control.onclick = action;
  controls.append(control);
  return control;
 }
 const runButton = button('运行模拟（Ctrl/⌘+Enter）', () => {
  const run = runDriverProgram(key, editor.value);
  trace.textContent = run.trace.join('\n');
  result.textContent = run.success ? '运行成功 · ' + program.explanation
   : run.valid ? '故障仍在 · 根据执行记录修改代码' : '语法错误 · 程序未执行';
  if (run.success) {
   solvedCases.add(key);
   source.open = true;
  }
  apply.hidden = !(run.success && key === 'transfer' && job?.phase === 'stalled');
 });
 button('恢复故障代码', () => {
  editor.value = program.fault;
  editor.dispatchEvent(new Event('input'));
 });
 button('返回工位', () => workbench.close());
 const apply = button('应用到模拟器：发布 Cycle 并重响门铃', () => {
  workbench.close();
  if (job?.phase !== 'stalled') return;
  inspectRing = job.ring;
  inspectIndex = ringData[job.ring].deq;
  repairCycle();
 });
 apply.hidden = true;
 workbench.onkeydown = event => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
   event.preventDefault();
   runButton.click();
  }
 };
 editor.addEventListener('input', () => {
  apply.hidden = true;
  result.textContent = '代码已修改，运行后查看结果。';
  trace.textContent = '';
 });
 workbench.append(title, rule, allowed, editor, controls, result, trace, source);
 workbench.showModal();
}

workbenchButton.onclick = () => openWorkbench(job?.phase === 'stalled' ? 'transfer' : missions[step][0]);
