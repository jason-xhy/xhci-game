const fs=require('fs'),vm=require('vm'),assert=require('assert');const code=fs.readFileSync('game.js','utf8');const els=new Map();const node=()=>({childNodes:[],append(...children){this.childNodes.push(...children)}});const el=id=>{if(!els.has(id))els.set(id,{textContent:'',style:{},onclick:null,close(){},replaceChildren(){},children:new Map(),querySelector(selector){if(!this.children.has(selector))this.children.set(selector,{textContent:''});return this.children.get(selector)}});return els.get(id)};const mesh=()=>({position:{set(...coordinates){this.coordinates=coordinates}},geometry:{dispose(){}},material:{dispose(){},map:{dispose(){}}}});const context={createTRBCargo(){const body=mesh();body.userData={};return {body,label:mesh(),setState(state){body.userData.state=state},dispose(){}};},CommandLab:require('../command'),EndpointContextLab:require('../endpoint-context'),RootPortLab:require('../root-port'),SlotContextDMALab:require('../slot-context-dma'),playYardCue(){},$:el,THREE:{Vector3:class{set(){}}},parcels:[],scene:{add(){},remove(){}},box:mesh,sign:mesh,mat:()=>({}),stations:[],solid:[],Event:class{},CustomEvent:class{},document:{dispatchEvent(){},exitPointerLock(){},createDocumentFragment:node,createElement:node},renderer:{domElement:{}},console,assert};vm.createContext(context);const missions=code.slice(code.indexOf('const missions='),code.indexOf('let step=0'));const logic=code.slice(code.indexOf('let step=0'),code.indexOf("document.addEventListener('keydown'"));vm.runInContext('const startup={ready:true,reset(){}};function showStartup(){};'+missions+logic+`
paused=false;
near={id:'port',name:'port'};
initializeShiftRootPort();
const attached=rootPortStatus();
if(attached.phase!=='connected'||!attached.ccs||!attached.csc||attached.ped)throw Error('attached root port');
interact();
if(step!==0||!rootPortStatus().pr||rootPortStatus().ped)throw Error('root port skips signaling');
tickRootPortReset(.51);
interact();
if(rootPortResetElapsed!==.51||ringData.event.enqueue!==0)throw Error('duplicate reset restarts signaling');
setPause(true);
tickRootPortReset(20);
if(!rootPortStatus().pr||step!==0)throw Error('paused reset advanced');
setPause(false);
tickRootPortReset(.50);
if(step!==1||!rootPortStatus().ped||!rootPortStatus().prc||rootPortStatus().pr)throw Error('completed root reset');
for(const index of [1,4,6,9,11]){
 if(index===4||index===9){
  step=index-1;near={id:'ctx',name:'Context'};interact();if(step!==index)throw Error('prepare command context');
 }
 step=index;near={id:submissions[index].ring,name:'dispatch'};interact();
 if(parcels.length!==submissions[index].types.length)throw Error('queued TRBs absent from feed tray');
 const staged=JSON.stringify(parcels.map(parcel=>parcel.o.position.coordinates));
 tickJob(50);
 if(job?.phase!=='queued'||step!==index||JSON.stringify(parcels.map(parcel=>parcel.o.position.coordinates))!==staged)throw Error('consumed or moved without doorbell');
 ringDoorbell();
 if(index===1){
  tickJob(.3);
  if(JSON.stringify(parcels.map(parcel=>parcel.o.position.coordinates))===staged)throw Error('doorbell did not move queued TRB');
 }if(!job||step!==index+1)throw Error('submission');
 near={id:'event',name:'events'};interact();if(step!==index+1)throw Error('premature collection');
 paused=false;
 if(index===6){
  tickJob(.1);
  const initial=cycleDiagnosticStatus();
  if(initial?.phase!=='stalled'||initial.deq!==0||initial.cycle!==0||initial.ccs!==1)throw Error('missing diagnostic');
  const before=ringData.event.enqueue;
  const held=JSON.stringify(parcels[0].o.position.coordinates);
  tickJob(20);
  if(ringData.event.enqueue!==before||JSON.stringify(parcels[0].o.position.coordinates)!==held)throw Error('premature event or movement during fault');
  repairCycle();
  if(job.phase!=='stalled'||cycleDiagnosticStatus().feedback!=='wrong-ring')throw Error('wrong ring repair accepted');
  nextRing();
  nextEntry();
  repairCycle();
  const wrongEntry=cycleDiagnosticStatus();
  if(wrongEntry.selectedRing!=='transfer'||wrongEntry.selectedIndex!==1||wrongEntry.feedback!=='wrong-entry')throw Error('wrong entry not reflected');
  for(let count=0;count<3;count++)nextEntry();
  if(cycleDiagnosticStatus().feedback)throw Error('previous diagnostic not cleared on selection');
  const original=parcels[0].o;
  repairCycle();
  const result=cycleDiagnosticStatus();
  if(result?.phase!=='repaired'||result.cycle!==0||result.ccs!==1||parcels[0].o!==original)throw Error('incorrect repair receipt');
  if(ringData.event.enqueue!==before||ringData.transfer.entries[0].cycle!==1)throw Error('repair skips real consumption');
 }
 for(let i=0;i<120;i++)tickJob(.1);if(job.phase!=='ready'||eventDeskStatus().phase!=='ready'||cycleDiagnosticStatus()!==null)throw Error('completion');
 const eventHead=ringData.event.deq;
 const origin=missions[job.source][0];
 interact();
 const receipt=lastRingReceipts.get(origin);
 if(eventDeskStatus().phase!=='read'||receipt!==lastRingReceipts.get('event')||
    receipt.erdpBefore!==eventHead||receipt.erdpAfter!==ringData.event.deq)throw Error('completion receipt');
 if(job!==null||step!==index+2||parcels.length)throw Error('consumption');
}
if(ringData.cmd.enqueue!==3||ringData.cmd.dequeue!==3||ringData.transfer.enqueue!==5||ringData.transfer.dequeue!==5||ringData.event.enqueue!==5||ringData.event.dequeue!==5)throw Error('counters');
if(ringData.transfer.enq!==1||ringData.transfer.pcs!==0||ringData.transfer.ccs!==0||ringData.event.enq!==1)throw Error('wrap');
console.log('PASS: 5 submissions, 8 source TRBs, 5 correlated completions; early event consumption rejected; meshes cleared after collection.');`,context);

vm.runInContext(`
const check=(v,m)=>{if(!v)throw Error(m)};
reset();check(step===0&&job===null&&serial===0&&inspectRing==='cmd'&&inspectIndex===0,'reset state');
for(const r of Object.values(ringData)){check(r.entries.every(t=>t===null)&&r.pcs===1&&r.ccs===1&&r.enqueue===0&&r.dequeue===0,'reset rings');
 for(let round=0;round<3;round++){for(let i=0;i<3;i++)pushTRB(r,'test',round*3+i);const snap=JSON.stringify(r);assert.throws(()=>pushTRB(r,'overflow',99),/Ring full/);check(JSON.stringify(r)===snap,'overflow mutated ring');for(let i=0;i<3;i++)check(popTRB(r).id===round*3+i,'FIFO');check(popTRB(r)===null,'empty duplicate');}check(r.enq===1&&r.deq===1&&r.pcs===1&&r.ccs===1,'multiwrap');}
reset();const ownership=pushTRB(ringData.cmd,'owned',1);ownership.cycle=0;const mismatch=JSON.stringify(ringData.cmd);check(popTRB(ringData.cmd)===null&&JSON.stringify(ringData.cmd)===mismatch,'ownership mismatch moved pointer');
reset();paused=false;step=1;submit(submissions[1]);setPause(true);const submitted=JSON.stringify(ringData);tickJob(50);check(job.time===0&&JSON.stringify(ringData)===submitted,'pause submitted');reset();check(!job&&!parcels.length,'reset outstanding');
paused=false;near={id:'port'};interact();tickRootPortReset(1);step=6;near={id:'transfer'};submit(submissions[6]);ringDoorbell();tickJob(.1);check(job.phase==='stalled','fault');check($('task').textContent==='Repair the descriptor Cycle mismatch','stalled objective');route=[[1,1]];navigate();check(route.length===0&&inspectIndex===0&&$('message').textContent.includes('检查 Cycle'),'stalled navigation');near={id:'event'};interact();check(job.phase==='stalled'&&$('message').textContent.includes('No completion:'),'stalled collection guidance');
nextRing();nextEntry();repairCycle();check(job.phase==='stalled','wrong repair');inspectIndex=0;
setPause(true);const frozen=JSON.stringify(ringData);tickJob(50);repairCycle();check(JSON.stringify(ringData)===frozen&&job.phase==='stalled','paused stall changed');setPause(false);repairCycle();
job.trbs[1].cycle^=1;tickJob(5);check(job.phase==='stalled'&&job.consumed===1&&ringData.transfer.dequeue===1&&ringData.event.enqueue===0&&inspectIndex===0,'later mismatch preserves selection');nextEntry();repairCycle();tickJob(1);check(job.phase==='returning'&&ringData.event.enqueue===1&&eventDeskStatus().phase==='posted','later repair');
setPause(true);const time=job.time;tickJob(50);check(job.time===time&&job.phase==='returning','pause returning');setPause(false);tickJob(5);tickJob(50);check(ringData.event.enqueue===1,'duplicate completion');near={id:'event'};interact();const count=ringData.event.dequeue;interact();check(ringData.event.dequeue===count,'double collection');
reset();check(parcels.length===0&&history.length===0&&job===null&&!lastRingReceipts.size&&eventDeskStatus().phase==='idle','restart cleanup');
paused=false;for(let i=0;i<14;i++){near={id:missions[step][0]};interact();if(i===0)tickRootPortReset(1);if(job?.phase==='queued'){ringDoorbell();tickJob(.1);if(job.phase==='stalled'){nextRing();repairCycle();}tickJob(10);tickJob(5);}}
check(finished&&paused&&ringData.event.dequeue===5,'full mission');$('start').onclick();check(!finished&&!paused&&step===0&&serial===0&&ringData.event.dequeue===0,'new shift button');check(!observedEndpointDescriptor&&!configuredEndpoint&&!configureObserved&&!usbConfigurationObserved&&successfulCompletions===0,'new shift clears descriptor and completion state');check($('overlay').querySelector('h3').textContent==='FIRST SHIFT','restart overlay heading');setPause(true);check($('overlay').querySelector('h3').textContent==='FIRST SHIFT','pause retained completion heading');
console.log('PASS: reserved capacity, overflow atomicity, FIFO, multiwrap, empty ownership, later-entry mismatch/repair, pause, reset, full mission and restart.');
`,context);
