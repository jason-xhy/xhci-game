'use strict';
const $=id=>document.getElementById(id),scene=new THREE.Scene();scene.background=new THREE.Color(0x242c2c);scene.fog=new THREE.FogExp2(0x343b37,.018);const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,150),renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.prepend(renderer.domElement);scene.add(new THREE.HemisphereLight(0xb5cbdf,0x564a41,1.55));const sun=new THREE.DirectionalLight(0xffd59a,3);sun.position.set(-15,22,-8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35});scene.add(sun);
const solid=[],stations=[],parcels=[];
function surface(base){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);let seed=7;for(let i=0;i<9500;i++){seed=(seed*16807)%2147483647;const x=seed%256;seed=(seed*16807)%2147483647;const y=seed%256;g.fillStyle=i%3?'rgba(0,0,0,.08)':'rgba(230,210,170,.12)';g.fillRect(x,y,2,2)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,8);return t}
function mat(c,metal=.2){return new THREE.MeshStandardMaterial({color:c,roughness:.8,metalness:metal})}const steel=mat(0x414c48),rust=mat(0x725344),dark=mat(0x202a2c),concrete=mat(0x62645b);function box(x,y,z,w,h,d,m,collision=false){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);if(collision)solid.push({x,z,w:w/2+.32,d:d/2+.32});return o}function sign(text,x,y,z,color='#e4c38c',w=4){const c=document.createElement('canvas');c.width=1024;c.height=256;const a=c.getContext('2d');a.fillStyle='#172126';a.fillRect(0,0,1024,256);a.strokeStyle=color;a.lineWidth=8;a.strokeRect(10,10,1004,236);a.fillStyle=color;a.font='bold 65px monospace';a.textAlign='center';a.fillText(text,512,145);const o=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.FrontSide}));const back=new THREE.Mesh(o.geometry,o.material);back.rotation.y=Math.PI;back.position.z=-.002;o.add(back);o.position.set(x,y,z);scene.add(o);return o}
rust.map=surface('#785d48');
steel.map=surface('#4c5853');
buildFreightYard();
function belt(cx,cz,color,label){const m=mat(color);for(const z of [cz-2,cz+2]){box(cx,1,z,13,.45,1.5,dark,true);box(cx,1.35,z-.8,13,.15,.12,m);box(cx,1.35,z+.8,13,.15,.12,m);for(let x=cx-6;x<=cx+6;x+=.5){const r=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,1.45,8),steel);r.rotation.x=Math.PI/2;r.position.set(x,1.27,z);scene.add(r)}for(const x of [cx-5,cx+5])box(x,.5,z,.22,1,.3,rust)}for(const x of [cx-6.2,cx+6.2])box(x,1,cz,1,.4,4,dark,true);sign(label,cx,3.25,cz,'#'+color.toString(16),4.6);}belt(-17,-9,0xe6ad58,'01 / COMMAND RING');belt(17,-9,0x67ccd3,'02 / EP0 TRANSFER');belt(0,17,0x82c591,'03 / EVENT RING');
// Scrapes are concentrated along the service door’s edges and fasteners.
function servicePaint() {
 const canvas = document.createElement('canvas');
 canvas.width = canvas.height = 256;
 const ink = canvas.getContext('2d');
 const paint = ink.createLinearGradient(0,0,256,256);
 paint.addColorStop(0,'#7d918f');
 paint.addColorStop(.62,'#6c817f');
 paint.addColorStop(1,'#586863');
 ink.fillStyle = paint;
 ink.fillRect(0,0,256,256);
 ink.fillStyle = '#4a5a57';
 ink.fillRect(5,9,1,233);
 ink.fillRect(8,242,240,1);
 ink.fillStyle = '#a8b4a6';
 for (const [x,y,w] of [[9,22,12],[11,24,4],[225,39,13],[232,40,7],[13,220,11],[235,211,8],[193,239,18]]) {
  ink.fillRect(x,y,w,1);
 }
 const texture = new THREE.CanvasTexture(canvas);
 texture.colorSpace = THREE.SRGBColorSpace;
 return texture;
}
const enamel = new THREE.MeshStandardMaterial({
 color:0xaab8b5, map:servicePaint(), roughness:.57, metalness:.17
});
const brass = new THREE.MeshStandardMaterial({color:0xb89462, roughness:.42, metalness:.7});
const connectorMetal = new THREE.MeshStandardMaterial({color:0xaab4b4, roughness:.35, metalness:.72});
const insulation = new THREE.MeshStandardMaterial({color:0x18252b, roughness:.88});
const panelSeam = new THREE.MeshStandardMaterial({color:0x273431, roughness:.72});
const footRubber = new THREE.MeshStandardMaterial({color:0x181d1d,roughness:1});
const stripeMetal = new THREE.MeshStandardMaterial({color:0x76756f,roughness:.43,metalness:.6});
const conduitRubber = new THREE.MeshStandardMaterial({color:0x1a2121,roughness:.96});

function cable(points, radius, material) {
 const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
 const lead = new THREE.Mesh(new THREE.TubeGeometry(curve,20,radius,8,false),material);
 lead.castShadow = true;
 lead.receiveShadow = true;
 scene.add(lead);
}
function flangeBolt(x,y,z,radius=.035) {
 const bolt = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,.026,6),stripeMetal);
 bolt.rotation.x = Math.PI/2;
 bolt.position.set(x,y,z);
 bolt.castShadow = true;
 scene.add(bolt);
}
function boltedFeet(x,z) {
 for (const dx of [-.6,.6]){
  box(x+dx,.045,z,.32,.09,1.34,footRubber);
  box(x+dx,.105,z,.27,.05,1.28,stripeMetal);
  for (const dz of [-.53,.53]){
   const bolt = new THREE.Mesh(new THREE.CylinderGeometry(.038,.038,.037,6),stripeMetal);
   bolt.position.set(x+dx,.143,z+dz);
   bolt.castShadow = bolt.receiveShadow = true;
   scene.add(bolt);
  }
 }
}

function socket(x, y, z, color) {
 const flangeHeight = .19;
 // The face has a real lip, recessed insulating well, and visible contact tongue.
 for (const edge of [-1,1]) {
  box(x+edge*.136,y,z,.028,flangeHeight,.065,connectorMetal);
  box(x,y+edge*.081,z,.25,.028,.065,connectorMetal);
 }
 box(x,y,z-.014,.242,.132,.021,insulation);
 box(x,y-.026,z+.004,.172,.04,.025,mat(color));
 for (const offset of [-.044,0,.044]) {
  box(x+offset,y-.005,z+.011,.012,.004,.02,brass);
 }
}
function panelHardware(x,y,z){
 box(x,y,z,1.37,.7,.052,panelSeam);
 box(x,y+.01,z+.03,1.29,.63,.035,enamel);
 for (const end of [-1,1]){
  box(x+end*.55,y+.22,z+.06,.12,.065,.04,connectorMetal);
  box(x+end*.55,y-.2,z+.06,.12,.065,.04,connectorMetal);
  flangeBolt(x+end*.545,y+.22,z+.085,.023);
  flangeBolt(x+end*.545,y-.2,z+.085,.023);
 }
}
function stationDisplay(x, y, z) {
 const canvas = document.createElement('canvas');
 canvas.width = 384;
 canvas.height = 128;
 const context = canvas.getContext('2d');
 const texture = new THREE.CanvasTexture(canvas);
 texture.colorSpace = THREE.SRGBColorSpace;
 const display = new THREE.Mesh(new THREE.PlaneGeometry(.82, .255),
  new THREE.MeshBasicMaterial({map:texture}));
 display.position.set(x, y, z);
 scene.add(display);
 let previous;
 return function draw(label, color) {
  if (label === previous) return;
  previous = label;
  const ink = '#' + new THREE.Color(color).getHexString();
  context.fillStyle = '#101b20';
  context.fillRect(0, 0, 384, 128);
  context.fillStyle = ink;
  context.fillRect(0, 0, 8, 128);
  context.font = '18px monospace';
  context.fillText('HOST CONTROL / STATUS', 24, 30);
  context.font = 'bold 35px monospace';
  context.fillText(label, 24, 82, 340);
  context.globalAlpha = .14;
  for (let row = 0; row < 128; row += 4) context.fillRect(8, row, 376, 1);
  context.globalAlpha = 1;
  texture.needsUpdate = true;
 };
}

const displayStates = {
 queued:'WRITE DOORBELL',
 submitted:'XHC PROCESSING',
 returning:'EVENT POSTED',
 ready:'IRQ READY',
 stalled:'CYCLE MISMATCH'
};

function station(id,name,x,z,color){
 box(x,.96,z,1.6,1.68,1.2,dark,true);
 boltedFeet(x,z);
 box(x,.41,z+.606,1.43,.51,.03,panelSeam);
 box(x,.415,z+.625,1.33,.43,.022,enamel);
 if(id==='ctx'){
  box(x,1.02,z,2.58,.13,1.4,steel);
  for(const dx of [-1.12,1.12])box(x+dx,.47,z,.12,1,.22,enamel);
  box(x-.76,1.27,z+.16,.48,.34,.44,brass);
 } else if(id==='port'){
  box(x-.94,.62,z,.26,1.24,.47,enamel);
  box(x-.94,1.33,z,.38,.16,.51,brass);
  panelHardware(x,.95,z+.61);
  socket(x-.24,1,z+.715,0x84bad2);
  socket(x+.24,1,z+.715,0x657e86);
  box(x-.96,.90,z+.66,.17,.22,.16,connectorMetal);
  cable([[x-.94,.88,z+.69],[x-1.04,.68,z+.77],[x-1.18,.38,z+.74],[x-1.16,.10,z+.62],[x-.94,.055,z+.35]],.038,conduitRubber);
  sign('USB2',x,.79,z+.705,'#d6d3ab',.36);
 } else if(id==='event'){
  for(const dx of [-.58,.58])box(x+dx,1.67,z-.36,.34,.47,.68,enamel);
 } else if(id==='transfer'){
  panelHardware(x,.96,z+.61);
  for(let i=0;i<3;i++){
   socket(x-.38+i*.38,1.02,z+.715,0x77c9cb);
   const outlet = z+.50-i*.31;
   box(x+.847,.86,outlet,.10,.16,.14,connectorMetal);
   cable([[x+.89,.86,outlet],[x+1.02,.82,outlet],[x+1.24,.55,outlet],[x+1.42,.26,outlet-.4],[x+1.57,.19,z-1.45-i*.11]],.038,conduitRubber);
   sign(['SETUP','DATA','STATUS'][i],x-.38+i*.38,.85,z+.705,'#9fd8db',.33);
  }
 } else if(id==='cmd'){
  panelHardware(x,.96,z+.61);
  box(x+.24,1.025,z+.721,.37,.26,.12,connectorMetal);
  box(x+.24,1.025,z+.791,.31,.21,.043,insulation);
  box(x+.24,1.025,z+.83,.23,.135,.062,brass);
  sign('DB 0',x+.24,1.02,z+.862,'#f0ce9a',.215);
  flangeBolt(x+.08,1.103,z+.792,.027);
  flangeBolt(x+.40,.945,z+.792,.027);
  box(x+.54,.96,z+.72,.145,.31,.19,stripeMetal);
  box(x+.54,1.07,z+.77,.072,.17,.13,insulation);
  for(let i=0;i<3;i++)box(x-.44+i*.14,1.01,z+.68,.052,.12,.045,insulation);
 } else if(id==='exit'){
  box(x,2.15,z-.15,.16,.7,.17,steel);
  box(x,2.52,z-.15,.43,.15,.28,brass);
 }
 box(x,1.62,z,.96,.52,1.28,enamel);
 box(x,1.46,z+.66,1.28,.66,.08,steel);
 box(x,1.58,z+.72,.99,.38,.12,dark);
 const screen = new THREE.MeshStandardMaterial({
  color:new THREE.Color(color).multiplyScalar(.24), emissive:color,
  emissiveIntensity:.18, roughness:.56
 });
 box(x,1.59,z+.791,.84,.26,.02,screen);
 for(let i=0;i<6;i++)box(x-.51+i*.204,.45,z+.641,.11,.115,.021,panelSeam);
 box(x,.59,z+.652,.42,.045,.035,stripeMetal);
 for(const dx of [-.65,.65])for(const y of [.22,1.2]){
  const fastener=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.034,6),brass);
  fastener.rotation.x=Math.PI/2;fastener.position.set(x+dx,y,z+.625);scene.add(fastener);
 }
 const light = box(x, 1.95, z, .9, .12, .5,
  new THREE.MeshStandardMaterial({color, emissive:color, emissiveIntensity:.3}));
 const signWidth = id === 'port' ? 2.25 : 2.45;
 sign(name, x, 2.38, z+.61, '#' + color.toString(16), signWidth);
 const display = stationDisplay(x, 1.59, z+.804);
 const approach = new THREE.MeshStandardMaterial({
  color:0x333d3d, roughness:.72, emissive:color, emissiveIntensity:0
 });
 for (const offset of [-.96,.96]) {
  box(x+offset,.023,z+2.03,.055,.008,2.7,approach);
 }
 if (id === 'port') {
  // Continue the short landing rails all the way to the spawn line.
  for (const offset of [-.96,.96]) {
   box(x+offset,.023,z+6.18,.075,.008,5.6,approach);
  }
  for (const distance of [2.9,5.1,7.3]) {
   for (const side of [-1,1]) {
    const arrow = box(x+side*.17,.024,z+distance,.047,.008,.5,approach);
    arrow.rotation.y = side*.72;
   }
  }
 }
 stations.push({id, name, x, z, light, screen, display, approach});
}
station('port','ROOT PORT / USB2',-9,-23,0xc6bf91);
station('cmd','HOST COMMAND QUEUE',-9,-5,0xe6ad58);
station('ctx','CONTEXT WORKBENCH',9,-23,0xc6bf91);
station('transfer','EP0 DISPATCH',9,-5,0x67ccd3);
station('event','DRIVER IRQ DESK',0,12,0x82c591);
station('exit','SHIFT CLOCK',0,27,0xc6bf91);

const workLamp = new THREE.PointLight(0xe6ad58, 10, 4.4, 2);
scene.add(workLamp);
function showStationSignal(target) {
 const signal = stationSignals[job?.phase];
 const stationId = job ? missions[job.source][0] : target.id;
 const active = stations.find(station => station.id === stationId);
 for (const station of stations) {
  const selected = active === station;
  const color = selected && signal ? signal.color : station.light.material.color;
  station.light.material.emissive.set(color);
  station.screen.emissive.set(color);
  station.light.material.emissiveIntensity = selected ? .68 : .12;
  station.screen.emissiveIntensity = selected ? .30 : .12;
  station.approach.emissive.set(color);
  station.approach.emissiveIntensity = selected ? .68 : 0;
  station.display(selected ? (displayStates[job?.phase] ?? 'OPERATE HERE') : 'STANDBY',
   selected ? color : 0x75888d);
 }
 workLamp.position.set(active.x-.22, 2.13, active.z+.96);
 workLamp.color.set(signal?.color ?? active.light.material.color);
 workLamp.intensity = signal?.power ?? 9;
}
const missions=[['port','Inspect the USB2 root port','Read CCS=1 and CSC=1. Reset the attached USB2 port.','§4.3.1 · xhci_hub_control()','Port reset completed: PED=1. Device: Default.'],['cmd','Submit Enable Slot','Host driver: queue Enable Slot (E), then write Doorbell 0 (B).','§4.3.2 · xhci_alloc_dev()','Enable Slot submitted. Completion waiting on Event Ring.'],['event','Collect the Slot ID','The xHC chose the Slot ID. Collect its Command Completion Event.','§4.3.2 · xhci_handle_command()','Success: Slot ID=1, slot Enabled.'],['ctx','Prepare the device contexts','Set A0/A1, Slot Context, EP0 ring and DCBAA[1].','§4.3.3 · xhci_setup_addressable_virt_dev()','A0=A1=1; route=0; port=1; entries=1; EP0 Control, MPS=64 (HS), DCS=1; DCBAA[1] ready.'],['cmd','Submit Address Device','Context ready. Submit Address Device with BSR=0.','§4.3.4 · xhci_address_device()','Address Device queued. xHC performs SET_ADDRESS.'],['event','Wait for address completion','Do not submit more slot commands until completion is received.','§4.3.4 · Command Completion Event','Address Device success. Device and slot: Addressed.'],['transfer','Request the descriptors','Queue GET_DESCRIPTOR on EP0: Setup, Data, Status stages. Ring the endpoint doorbell.','§4.3 overview · xhci_queue_ctrl_tx()','Control TD submitted on EP0. This is a transfer, not a command.'],['event','Collect the descriptor transfer','Consume a Transfer Event. The descriptors describe the device’s endpoints.','§4.3 · handle_tx_event()','Descriptor transfer complete. Configuration 1 selected by software.'],['ctx','Prepare endpoint configuration','Build matching endpoint contexts and transfer rings for the selected configuration.','§4.3.5 · xhci_add_endpoint()','Endpoint contexts prepared for configuration 1.'],['cmd','Reserve controller resources','Issue Configure Endpoint before sending SET_CONFIGURATION.','§4.3.5 · xhci_check_bandwidth()','Configure Endpoint queued. Waiting for controller acceptance.'],['event','Confirm endpoint configuration','Collect Configure Endpoint completion before configuring the USB device.','§4.3.5 · Command Completion Event','Configure Endpoint success. Slot Configured; USB device still Addressed.'],['transfer','Configure the USB device','Send SET_CONFIGURATION(1) through EP0. The device must match the controller.','§4.3.5 · xhci_queue_ctrl_tx()','SET_CONFIGURATION queued as a control transfer.'],['event','Synchronize the two states','Collect the transfer completion. Both sides must agree before using data endpoints.','§4.3.5 · Transfer Event','Success. USB device and xHC slot both Configured.'],['exit','Clock out of your first shift','The factory is running. Return to the shift clock.','§4.3.1–5 complete','SHIFT COMPLETE']];let step=0,running=false,paused=true,yaw=0,pitch=0,near=null,keys={},elapsed=0,job=null,serial=0,route=[],finished=false;
const startPosition = [-9, 1.7, -14];
const position = new THREE.Vector3(...startPosition), history = [];
const ringData={cmd:{cx:-17,cz:-9,dockX:-10.3,dockZ:-4.35,travelDirection:-1,color:0xe6ad58,enqueue:0,dequeue:0},transfer:{cx:17,cz:-9,dockX:10.3,dockZ:-4.35,travelDirection:1,color:0x67ccd3,enqueue:0,dequeue:0},event:{cx:0,cz:17,color:0x82c591,enqueue:0,dequeue:0}};
for(const r of Object.values(ringData))Object.assign(r,{size:4,enq:0,deq:0,pcs:1,ccs:1,entries:Array(4).fill(null)});
function pushTRB(r,type,id){if(r.enqueue-r.dequeue>=r.size-1)throw Error('Ring full');const t={type,id,cycle:r.pcs,index:r.enq,slot:1,endpoint:1,pointer:`0x${((r===ringData.cmd?0x1000:r===ringData.transfer?0x2000:0x3000)+r.enq*16).toString(16)}`};r.entries[r.enq]=t;r.enqueue++;if(++r.enq===r.size){r.enq=0;r.pcs^=1}return t}
function popTRB(r){const t=r.entries[r.deq];if(r.dequeue===r.enqueue||!t||t.cycle!==r.ccs)return null;r.dequeue++;if(++r.deq===r.size){r.deq=0;r.ccs^=1}return t}
const stationSignals = {
 queued: {label:'驱动已入队 · 等待门铃', color:0xe6ad58, power:12},
 submitted: {label:'xHC 正在消费 TRB', color:0x72d9e9, power:16},
 returning: {label:'结果已写入 Event Ring · 等待 IRQ', color:0x9fc9a4, power:15},
 ready: {label:'IRQ 已到达 · 原地按 H', color:0xa0f3a4, power:18},
 stalled: {label:'xHC 停止消费 · 检查 Cycle', color:0xff744e, power:21}
};

const ringFields=new Map();
let inspectRing='cmd',inspectIndex=0;
function nextRing() {
 const rings = Object.keys(ringData);
 inspectRing = rings[(rings.indexOf(inspectRing)+1)%rings.length];
 inspectTRB();
}
function nextEntry() {
 inspectIndex = (inspectIndex+1)%ringData[inspectRing].size;
 inspectTRB();
}
function inspectTRB(){updateRings();const r=ringData[inspectRing],t=r.entries[inspectIndex];message(`${inspectRing}[${inspectIndex}] ${t?`${t.type} | Cycle=${t.cycle} | job=${t.id} | Slot=${t.slot} EP=${t.endpoint} | ${t.pointer}`:'empty'} | consumer head CCS=${r.ccs}. [I] next entry [O] next ring [F] publish expected Cycle at stalled head.`)}
function repairCycle(){if(paused||!job||job.phase!=='stalled')return;const r=ringData[job.ring];if(inspectRing!==job.ring||inspectIndex!==r.deq){message('当前条目不是卡住的消费头。比对 Transfer Ring 的 DEQ 与 CCS，再选择该条目。');return}r.entries[r.deq].cycle=r.ccs;
 const repaired = parcels.find(parcel => parcel.index === job.consumed);
 repaired?.o.material.color?.set(r.color);
 job.repairedHead = job.consumed;
 job.phase='submitted';log('Cycle repaired and published; endpoint doorbell rung again.');updateRings();inspectTRB()}
const submissions={1:{ring:'cmd',name:'Enable Slot',types:['Enable Slot'],event:'Command Completion',slot:1},4:{ring:'cmd',name:'Address Device',types:['Address Device · BSR=0'],event:'Command Completion',slot:1},6:{ring:'transfer',name:'GET_DESCRIPTOR',types:['Setup · GET_DESCRIPTOR','Data · IN','Status · OUT · IOC'],event:'Transfer Event',slot:1},9:{ring:'cmd',name:'Configure Endpoint',types:['Configure Endpoint · DC=0'],event:'Command Completion',slot:1},11:{ring:'transfer',name:'SET_CONFIGURATION',types:['Setup · SET_CONFIGURATION(1)','Status · IN · IOC'],event:'Transfer Event',slot:1}};
function log(entry) {
 history.push(entry);
 const display = $('log');
 display.textContent = history.slice(-4).join('\n');
 display.scrollTop = display.scrollHeight;
}
function message(s){$('message').textContent=s}
const missionArc=[0,1,1,2,3,3,4,4,5,5,5,5,5,5];
const arcNames=['端口复位','启用 Slot','准备设备上下文','分配地址','读取描述符','配置设备'];
function update(){const m=missions[step];$('mission-arc').textContent=`02 / 工位实操 · ${missionArc[step]+1}/6 ${arcNames[missionArc[step]]}`;$('task').textContent=m[1];$('hint').textContent=m[2];$('progress').textContent=`${String(step+1).padStart(2,'0')} / ${missions.length} · ${m[3]}`;$('ledger').textContent=`PORT ${step>0?'ENABLED':'ATTACHED'}\nSLOT ${step>=11?'CONFIGURED':step>=6?'ADDRESSED':step>=3?'ENABLED':'NONE'}\nDEVICE ${step>=13?'CONFIGURED':step>=6?'ADDRESSED':step>0?'DEFAULT':'POWERED'}`;$('ledger').style.whiteSpace='pre-line';updateRings()}
function updateRings(){
 const phase = job?.phase;
 const status = $('controller-status');
 status.textContent = stationSignals[phase]?.label ?? '';
 status.className = phase ?? '';
 $('inspect-controls').hidden = phase !== 'stalled';
 if(job?.phase==='stalled'){
  $('task').textContent='Repair the descriptor Cycle mismatch';
  $('hint').textContent='找出 Transfer Ring 的消费头，比对该 TRB 的 C 和消费者 CCS。';
 }else if(job&&step===7){$('task').textContent=missions[step][1];$('hint').textContent=missions[step][2];}const rows=Object.entries(ringData).flatMap(([name,r])=>[
 [name,[name.toUpperCase(),`ENQ[${r.enq}]`,`PCS=${r.pcs}`,`DEQ[${r.deq}]`,`CCS=${r.ccs}`]],
 ...r.entries.map((t,i)=>[`${name}-${i}`,[
 `${inspectRing===name&&inspectIndex===i?'>':' '}[${i}]`,r.enq===i?'ENQ':'',r.deq===i?'DEQ':'',t?.type??'empty',t?`C=${t.cycle}`:'',t?`#${t.id}`:'',t?.pointer??'',t?.completionCode??''
 ]])
 ]);rows.push(['status',[job?`#${job.id} ${job.name}: ${job.phase}${job.irqPending?' · IRQ pending':''}`:'No outstanding TRBs']]);
 const fragment=document.createDocumentFragment();
 for(const [key,fields] of rows){
  const row=document.createElement('span');
  row.className = fields[0]?.startsWith('>') ? 'trb-row trb-selected' : 'trb-row';
  const old=ringFields.get(key);
  const changes=fields.map((value,i)=>old&&value!==old.fields[i]&&(i!==0||key==='status'));
  const changed=changes.some(Boolean);
  fields.forEach((value,i)=>{
   if(!value)return;
   if(row.childNodes.length)row.append(' ');
   const field=document.createElement('span');field.textContent=value;
   if(changes[i]||(!changed&&old?.changed[i]))field.className='trb-changed';
   row.append(field);
  });
  ringFields.set(key,{fields,changed:changed?changes:old?.changed??changes});
  fragment.append(row,'\n');
 }
 $('rings').replaceChildren(fragment);
}

function setParcelPosition(parcel, x, z, height = 1.56) {
 parcel.o.position.set(x,height,z);
 parcel.label.position.set(x,height+.43,z);
}

function stageParcel(parcel) {
 const ring = ringData[parcel.ring];
 setParcelPosition(parcel,ring.dockX,ring.dockZ+.42*parcel.index);
 parcel.o.visible = true;
 parcel.label.visible = parcel.index === 0;
}

function placeParcel(parcel, progress) {
 const ring = ringData[parcel.ring];
 if (parcel.ring !== 'event') {
  const direction = ring.travelDirection;
  const headX = ring.cx-6*direction;
  const frontZ = ring.cz+2;
  const dockZ = ring.dockZ+.42*parcel.index;
  // Join the feed tray to the drive side of the belt before crossing the rollers.
  if (progress < .24) {
   const travel = progress/.24;
   setParcelPosition(parcel,ring.dockX+(headX-ring.dockX)*travel,dockZ+(frontZ-dockZ)*travel);
  } else {
   const travel = (progress-.24)/.76;
   setParcelPosition(parcel,headX+direction*12*travel,frontZ);
  }
  return;
 }
 const travel = Math.min(progress,1);
 setParcelPosition(parcel,ring.cx-5+10*travel,ring.cz+2);
}

function spawn(ring,label,index=0) {
 const r = ringData[ring];
 const body = box(0,1.5,0,.54,.32,.36,mat(r.color,.33));
 const tag = sign(label,0,0,0,'#'+r.color.toString(16),1.9);
 // Moving TRBs rely on Local light; the static yard shadow map is baked at load.
 body.castShadow = false;
 const parcel = {o:body,label:tag,ring,index};
 parcels.push(parcel);
 if (ring === 'event') placeParcel(parcel,0);
 else stageParcel(parcel);
 return parcel;
}

function clearParcels() {
 for (const parcel of parcels) {
  scene.remove(parcel.o,parcel.label);
  parcel.o.geometry.dispose();
  parcel.o.material.dispose();
  parcel.label.geometry.dispose();
  parcel.label.material.map.dispose();
  parcel.label.material.dispose();
 }
 parcels.length = 0;
}

function moveSubmittedParcels() {
 for (const parcel of parcels) {
  if (parcel.index < job.consumed) {
   parcel.o.visible = parcel.label.visible = false;
   continue;
  }
  const offsetTime = job.time-parcel.index*.35;
  if (offsetTime <= 0) {
   stageParcel(parcel);
   continue;
  }
  parcel.o.visible = parcel.label.visible = true;
  const progress = offsetTime/2;
  const repairedProgress = job.repairedHead === parcel.index ? .24+progress*.76 : progress;
  placeParcel(parcel,Math.min(repairedProgress,1));
 }
}

function holdFaultParcel() {
 for (const parcel of parcels) {
  if (parcel.index < job.consumed) {
   parcel.o.visible = parcel.label.visible = false;
  } else if (parcel.index === job.consumed) {
   parcel.o.visible = parcel.label.visible = true;
   placeParcel(parcel,.24);
   parcel.o.material.color?.set(0xff744e);
  } else {
   stageParcel(parcel);
  }
 }
}

function submit(def){
 job={...def,id:++serial,phase:'queued',time:0,consumed:0,source:step};
 job.trbs=def.types.map(type=>pushTRB(ringData[def.ring],type,serial));
 if(step===6)job.trbs[0].cycle^=1;
 job.types.forEach((type,i)=>spawn(job.ring,`#${job.id} ${type}`,i));
 log(`Host queued #${serial} ${def.name}; waiting for doorbell.`);
 message('TRBs are in memory. Press B to notify xHC.');
 updateRings();
}
function ringDoorbell(){
 if(paused||job?.phase!=='queued'||near?.id!==missions[step][0])return;
 playYardCue('doorbell');
 job.phase='submitted';
 log(`Host wrote doorbell ${job.ring==='cmd'?'0':'slot 1 / EP0'}; xHC can fetch #${job.id}.`);
 message('Doorbell delivered. Watch the ring pointers move, then press H when IRQ arrives.');
 advance();
}
function tickJob(dt){
 if(paused||!job||['queued','ready','stalled'].includes(job.phase))return;
 job.time+=dt;
 if(job.phase==='submitted'){
  moveSubmittedParcels();
  const r=ringData[job.ring];
  while(job.consumed<job.trbs.length){
   const t=r.entries[r.deq];
   if(!t||t.cycle!==r.ccs){job.phase='stalled';holdFaultParcel();playYardCue('fault');route=[];
   log(`xHC stopped at ${job.ring.toUpperCase()} DEQ[${r.deq}]: C=${t?.cycle ?? 'empty'}, CCS=${r.ccs}. No completion produced.`);
   message('控制器停在消费头。用 O / I 或面板按钮选择条目，再修复 Cycle。');
   updateRings();
   return;}
   if(job.time<2+job.consumed*.35)break;
   popTRB(r);job.consumed++;updateRings();
  }
  if(job.consumed===job.trbs.length){clearParcels();pushTRB(ringData.event,job.event,job.id).completionCode='Success';spawn('event',`#${job.id} ${job.event} · SUCCESS`);job.phase='returning';job.time=0;log(`xHC consumed #${job.id}; produced ${job.event}.`);updateRings();}
 }else if(job.phase==='returning'){placeParcel(parcels[0],Math.min(.82,job.time/1.2*.82));if(job.time>=1.2){job.phase='ready';job.irqPending=true;playYardCue('event');log(`#${job.id} xHC raised IRQ after writing the Event Ring.`);message('IRQ received. Press H to step through the driver handler and advance ERDP.');updateRings();}}
}
function handleCompletion(){
 if(paused||!job?.irqPending)return;
 const completion=popTRB(ringData.event);
 if(!completion||completion.id!==job.id)throw Error('Completion correlation');
 log(`Driver IRQ: read #${job.id} ${completion.type}: ${completion.completionCode}; advanced ERDP to entry ${ringData.event.deq}.`);
 clearParcels();job=null;route=[];message(missions[step][4]);advance();
}
function advance(){step++;update()}
function interact(){if(paused||!near||finished)return;if(!startup.ready){message('Complete controller startup at the commissioning panel first.');return}const m=missions[step];if(near.id!==m[0]){message(`${near.name}: ${m[1]} first. No work was submitted.`);return}if(submissions[step]){if(job){message('TRBs already queued. Press B to write the doorbell.');return}submit(submissions[step]);return}if(near.id==='event'){if(job?.phase==='stalled'){message('No completion: EP0 stopped on a Cycle mismatch. Inspect the Transfer Ring consumer head.');return}if(!job||job.phase!=='ready'){message('The matching completion has not arrived. Wait for xHC processing and the return conveyor.');return}handleCompletion();return}log(m[4]);message(m[4]);if(step===missions.length-1){finished=true;paused=true;$('quick-start').hidden=true;route=[];document.exitPointerLock?.();$('overlay').style.display='grid';$('overlay').querySelector('h3').textContent='SHIFT COMPLETE';$('overlay').querySelector('p').textContent=`All five submissions completed. Software consumed ${ringData.event.dequeue} completion events. USB device and controller are Configured.`;$('start').textContent='START A NEW SHIFT';$('journey').hidden=false;document.dispatchEvent(new Event('shift:complete'));return}advance()}
const blocked=(x,z)=>solid.some(o=>Math.abs(x-o.x)<o.w&&Math.abs(z-o.z)<o.d);
function move(dx,dz){const count=Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/.15);for(let i=0;i<count;i++){if(!blocked(position.x+dx/count,position.z))position.x+=dx/count;if(!blocked(position.x,position.z+dz/count))position.z+=dz/count}position.x=THREE.MathUtils.clamp(position.x,-30,30);position.z=THREE.MathUtils.clamp(position.z,-30,30)}
function navigate() {
 if (paused) return;
 if (job && job.phase !== 'queued') {
  route = [];
  message($('controller-status').textContent);
  return;
 }
 const target = stations.find(station => station.id === missions[step][0]);
 const start = [Math.round(position.x), Math.round(position.z)];
 const queue = [start];
 const previous = new Map([[start.join(','),null]]);
 const neighbors = [[0,-1],[1,0],[0,1],[-1,0]];
 for (let index = 0; index < queue.length; index++) {
  const point = queue[index];
  const [dx,dz] = [point[0]-target.x, point[1]-target.z];
  // Position the player in front of the faceplate, within the interaction radius.
  if (Math.abs(dx) <= 1 && dz === 3) {
   route = [];
   for (let waypoint = point; waypoint; waypoint = previous.get(waypoint.join(','))) {
    route.unshift(waypoint);
   }
   message(`Following the aisle to ${target.name}. WASD cancels guidance; E operates on arrival.`);
   return;
  }
  for (const [offsetX,offsetZ] of neighbors) {
   const next = [point[0]+offsetX, point[1]+offsetZ];
   const key = next.join(',');
   if (Math.abs(next[0])>30 || Math.abs(next[1])>30 || previous.has(key) || blocked(...next)) continue;
   previous.set(key, point);
   queue.push(next);
  }
 }
 message('No safe route found. Use WASD to reach a clear aisle.');
}
const missionActions = [
 '重置 USB2 根端口', '提交 Enable Slot', '领取 Slot ID',
 '准备设备上下文', '提交 Address Device', '领取地址分配完成事件',
 '提交 GET_DESCRIPTOR', '领取描述符传输完成事件', '准备端点配置',
 '提交 Configure Endpoint', '领取端点配置完成事件',
 '提交 SET_CONFIGURATION', '领取设备配置完成事件', '打卡下班'
];
let nextAction = null;
function updateNextAction(target) {
 const panel = $('next-action');
 panel.hidden = !running || paused || finished || !startup.ready;
 if (panel.hidden) return;
 const atTarget = near?.id === target.id;
 const codeButton = $('code-workbench');
 const lesson = typeof workbenchCases === 'undefined' ? null : workbenchCases[target.id];
 codeButton.hidden = job?.phase !== 'stalled' && (lesson?.step !== step || (!job?.irqPending && (!atTarget || Boolean(route.length))));
 if (!codeButton.hidden) {
  const caption = '驱动代码台（C） · ' + solvedCases.size + '/4';
  if (codeButton.textContent !== caption) codeButton.textContent = caption;
 }
 const actionName = missionActions[step];
 const sourceStation = job && stations.find(station => station.id === missions[job.source][0]);
 const stationLabel = job?.irqPending ? 'DRIVER IRQ · 当前工位' : (sourceStation ?? target).name;
 const stage = `2 · 工位任务 ${step + 1}/${missions.length} · ${stationLabel}`;
 if ($('next-stage').textContent !== stage) $('next-stage').textContent = stage;
 let instruction, label, action;
 if (job?.phase === 'stalled') {
  instruction = '对照右侧 Transfer Ring 的 DEQ 和 CCS，用 O / I 选中卡住的 TRB。';
  label = '修复 Cycle 位（F）';
  action = repairCycle;
 } else if (job?.irqPending) {
  instruction = 'xHC 已写入 Event Ring 并发出 IRQ。在当前位置按 H，单步执行驱动中断处理。';
  label = '处理 IRQ（H）';
  action = handleCompletion;
 } else if (atTarget && job?.phase === 'queued') {
  instruction = 'TRB 已入队；写门铃后 xHC 才能开始消费。';
  label = '写门铃（B）';
  action = ringDoorbell;
 } else if (job && target.id === 'event') {
  instruction = $('controller-status').textContent + '。留在当前工位等候 IRQ。';
  label = '等待 IRQ…';
 } else if (route.length) {
  instruction = '正在沿通道前往 ' + target.name + '，到达后可操作。';
  label = '正在前往工位…';
 } else if (!atTarget) {
  instruction = '到达后：' + actionName + '。';
  label = '前往 ' + target.name + '（G）';
  action = navigate;
 } else {
  instruction = '已到达 ' + target.name + '。按 E：' + actionName + '。';
  label = actionName + '（E）';
  action = interact;
 }
 nextAction = action;
 if ($('next-instruction').textContent !== instruction) $('next-instruction').textContent = instruction;
 const button = $('guide');
 if (button.textContent !== label) button.textContent = label;
 button.disabled = !action;
}
$('guide').onclick = () => nextAction?.();
$('next-ring').onclick = nextRing;
$('next-entry').onclick = nextEntry;
function reset(){$('journey').hidden=false;$('quick-start').hidden=false;document.dispatchEvent(new Event('shift:reset'));$('overlay').querySelector('h3').textContent='FIRST SHIFT';$('overlay').querySelector('p').textContent='让一台 USB2 设备从接入走到可用。跟随 Command、Transfer 和 Event 三条环完成第一次枚举。';$('start').textContent='手动启动控制器';startup.reset();startupFeedback='';step=0;serial=0;job=null;finished=false;inspectRing='cmd';inspectIndex=0;keys={};near=null;clearParcels();history.length=0;ringFields.clear();$('log').textContent='';for(const r of Object.values(ringData)){r.enqueue=r.dequeue=r.enq=r.deq=0;r.pcs=r.ccs=1;r.entries.fill(null)}position.set(...startPosition);yaw=pitch=0;route=[];message('New shift. Inspect the USB2 root port.');update()}
function beginShift() {
 running = true;
 paused = false;
 keys = {};
 $('overlay').style.display = 'none';
 const openLabs = $('toggle-labs');
 if (openLabs?.getAttribute?.('aria-expanded') === 'true') openLabs.click();
 showStartup();
 update();
 if (startup.ready) message('控制器已启动。根端口在前方，按 G 导航或用 WASD 移动。');
}

$('start').onclick = () => {
 if (finished) reset();
 beginShift();
};

$('quick-start').onclick = () => {
 startup.reset();
 for (const action of ControllerStartup.actions) {
  const reason = startup.act(action, startup.inputs, true);
  if (reason) {
   startupFeedback = reason;
   break;
  }
  startupFeedback = startup.act(action);
 }
 beginShift();
};
function setPause(value){paused=value;$('journey').hidden=value;$('quick-start').hidden=value;keys={};$('manual').hidden=true;$('overlay').style.display=value?'grid':'none';$('start').textContent='RESUME SHIFT';if(value)document.exitPointerLock?.()}
function manual() {
 const panel = $('manual');
 const open = panel.hidden;
 panel.hidden = !open;
 paused = open || !running || finished || $('overlay').style.display !== 'none';
 keys = {};
 if (open) {
  document.exitPointerLock?.();
  $('closemanual').focus({preventScroll:true});
 } else if (paused) {
  $('briefing-manual').focus({preventScroll:true});
 }
}
$('briefing-manual').onclick = manual;
$('closemanual').onclick = manual;
document.addEventListener('keydown',e=>{if($('commission') && e.code==='Enter' && !e.repeat && !e.target.matches?.('input, textarea, select, [contenteditable]')){e.preventDefault();$('commission').querySelector('.current-action:not(:disabled)')?.click();return}if($('commission') || $('driver-workbench')?.open || e.target.matches?.('input, textarea, select, [contenteditable]'))return;if(e.code==='Escape'&&!$('manual').hidden){manual();return;}if(paused&&e.code!=='Escape')return;if(['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)&&!paused)e.preventDefault();keys[e.code]=true;if(['KeyW','KeyA','KeyS','KeyD'].includes(e.code))route=[];if(e.repeat)return;if(e.code==='KeyI'&&!paused)nextEntry();if(e.code==='KeyO'&&!paused)nextRing();if(e.code==='KeyF')repairCycle();if(e.code==='KeyC'&&!paused&&!$('code-workbench').hidden)$('code-workbench').click();if(e.code==='KeyB')ringDoorbell();if(e.code==='KeyH')handleCompletion();if(e.code==='KeyE')interact();if(e.code==='KeyG')navigate();if(e.code==='Tab')manual();if(e.code==='Escape'&&running&&!finished){if(!$('manual').hidden){$('manual').hidden=true;setPause(true)}else setPause(!paused)}});
document.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>{if(running&&!finished&&!$('driver-workbench')?.open)setPause(true)});let drag=false;renderer.domElement.onmousedown=()=>drag=true;window.onmouseup=()=>drag=false;window.addEventListener('mousemove',e=>{if(paused)return;if(document.pointerLockElement||drag){yaw-=e.movementX*.0025;pitch=Math.max(-1.2,Math.min(1.2,pitch-e.movementY*.0025))}});
sun.shadow.autoUpdate = false;
sun.shadow.needsUpdate = true;
camera.rotation.order = 'YXZ';
const clock = new THREE.Clock();

function followRoute(dt, target) {
 const [x,z] = route[0];
 const dx = x-position.x;
 const dz = z-position.z;
 const distance = Math.hypot(dx,dz);
 if (distance < .15) {
  route.shift();
  if (!route.length) {
   yaw = Math.atan2(position.x-target.x, position.z-target.z);
   message(job?.phase === 'queued'
    ? 'At the station. Press B to write the doorbell.'
    : 'At the station. Press E to operate.');
  }
  return;
 }
 const finalLeg = route.length === 1;
 const desired = finalLeg
  ? Math.atan2(position.x-target.x, position.z-target.z)
  : Math.atan2(-dx,-dz);
 const delta = desired-yaw;
 yaw += Math.atan2(Math.sin(delta),Math.cos(delta))*(1-Math.exp(-8*dt));
 pitch *= Math.exp(-8*dt);
 const travel = Math.min(distance,dt*8);
 move(dx/distance*travel,dz/distance*travel);
}

function moveWithKeys(dt) {
 yaw += (Number(Boolean(keys.ArrowLeft))-Number(Boolean(keys.ArrowRight)))*dt*1.6;
 const tilt = (Number(Boolean(keys.ArrowUp))-Number(Boolean(keys.ArrowDown)))*dt;
 pitch = Math.max(-1.2,Math.min(1.2,pitch+tilt));
 const forward = Number(Boolean(keys.KeyW))-Number(Boolean(keys.KeyS));
 const right = Number(Boolean(keys.KeyD))-Number(Boolean(keys.KeyA));
 const speed = (keys.ShiftLeft ? 7 : 4)*dt/Math.max(1,Math.hypot(forward,right));
 move((-Math.sin(yaw)*forward+Math.cos(yaw)*right)*speed,
  (-Math.cos(yaw)*forward-Math.sin(yaw)*right)*speed);
}

function frame() {
 requestAnimationFrame(frame);
 const dt = Math.min(clock.getDelta(),.12);
 elapsed += dt;
 if (!paused) {
  updateFreightYard(elapsed);
  tickJob(dt);
  const target = stations.find(station => station.id === missions[step][0]);
  if (route.length) followRoute(dt, target);
  else moveWithKeys(dt);
 }
 camera.position.copy(position);
 camera.rotation.set(pitch,yaw,0);
 near = null;
 let nearest = 3.5;
 for (const station of stations) {
  const distance = Math.hypot(station.x-position.x,station.z-position.z);
  if (distance < nearest) {
   near = station;
   nearest = distance;
  }
 }
 const target = stations.find(station => station.id === missions[step][0]);
 showStationSignal(target);
 const signal = stationSignals[job?.phase];
 $('target').textContent = signal?.label ?? (near?.id === target.id
  ? `[E] ${target.name}`
  : `◇ ${target.name} · ${Math.round(Math.hypot(target.x-position.x,target.z-position.z))} m`);
 updateNextAction(target);
 $('location').textContent = `BAY 04 / ${Math.round(position.x)}, ${Math.round(position.z)}`;
 for (const parcel of parcels) parcel.label.quaternion.copy(camera.quaternion);
 renderer.render(scene,camera);
}
window.onresize = () => {
 camera.aspect = innerWidth/innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);
};
function buildParcelDocks() {
 for (const id of ['cmd','transfer']) {
  const ring = ringData[id];
  const headX = ring.cx-6*ring.travelDirection;
  const headZ = ring.cz+2;
  const dx = headX-ring.dockX;
  const dz = headZ-ring.dockZ;
  const length = Math.hypot(dx,dz);
  const heading = Math.atan2(dx,dz);
  const railMaterial = mat(ring.color,.4);
  box(ring.dockX,1.26,ring.dockZ+.36,.73,.15,1.30,panelSeam);
  for (const side of [-1,1]) {
   box(ring.dockX+side*.33,1.39,ring.dockZ+.36,.045,.08,1.30,railMaterial);
  }
  const bridge = box(ring.dockX+dx/2,1.30,ring.dockZ+dz/2,.66,.11,length,stripeMetal);
  bridge.rotation.y = heading;
  const runIn = box(ring.dockX+dx/2,1.37,ring.dockZ+dz/2,.48,.021,length,panelSeam);
  runIn.rotation.y = heading;
  box(ring.dockX,.62,ring.dockZ+.62,.17,1.23,.25,dark);
  box(ring.dockX,.047,ring.dockZ+.62,.28,.09,.33,stripeMetal);
  box(headX,.60,headZ,.21,1.18,.21,dark);
  box(headX,.044,headZ,.32,.09,.3,stripeMetal);
 }
}
buildParcelDocks();
update();
frame();

// Commissioning is a teaching abstraction: register writes are grouped into actions.
const startup = new ControllerStartup();
let startupFeedback = '';

function showStartup(){
 if (startup.ready) {
  const commissioning = $('commission');
  if (commissioning) {
   commissioning.remove();
   const labs = $('chapter-labs');
   if (labs?.querySelector('#toggle-labs')?.getAttribute('aria-expanded') === 'true') {
    labs.querySelector('#toggle-labs').click();
   }
   const target = stations.find(station => station.id === missions[step][0]);
   updateNextAction(target);
   $('guide').focus({preventScroll: true});
   message('控制器已启动。按 G 前往根端口，或用 WASD 自行移动。');
  }
  return;
 }
 document.exitPointerLock?.();
 let panel=document.getElementById('commission');
 if(!panel){panel=document.createElement('div');panel.id='commission';document.body.append(panel);}
 panel.replaceChildren();const heading=document.createElement('h2');heading.textContent='1 · 启动控制器 / Commission the xHC';panel.append(heading);
 const instruction = document.createElement('p');
 instruction.textContent = '使用默认地址，按 Enter 执行当前步骤，也可以点击金色按钮。完成配置后 Run 才可用。';
 const actions = document.createElement('div');
 actions.className = 'commission-actions';
 const status = document.createElement('p');
 status.setAttribute('role', 'status');
 const buttons = new Map();
 function updateControls() {
  const steps = ControllerStartup.actions;
  const runBlocked = startup.stage === 7 ? startup.act('Run', startup.inputs, true) : null;
  const repair = runBlocked && (
   /ERST|Event Ring/.test(runBlocked) ? steps[6] :
   /RCS=1|allocate four-TRB/.test(runBlocked) ? steps[5] :
   /DCBAA|scratchpad/.test(runBlocked) ? steps[4] : null
  );
  const next = repair || steps.slice(4, 7).find(action =>
   startup.stage >= 4 && startup.stage < 7 && !startup.programmed.has(action)
  ) || steps[startup.stage];
  const reason = startup.act(next, startup.inputs, true);
  status.textContent = `${startup.stage} / 8 · 下一步：${next}${runBlocked || reason ? ' · ' + (runBlocked || reason) : ''}`;
  for (const [action, button] of buttons) {
   button.disabled = action !== next || Boolean(reason);
   button.classList.toggle('current-action', !button.disabled);
  }
 }
 for (const action of ControllerStartup.actions) {
  const button = document.createElement('button');
  button.textContent = action;
  buttons.set(action, button);
  button.onclick = () => {
   startupFeedback = startup.act(action);
   showStartup();
   if (!startup.ready) message(startupFeedback);
  };
  actions.append(button);
 }
 updateControls();
 panel.append(instruction, status, actions);
 for(const field of Object.keys(ControllerStartup.defaults)){const label=document.createElement('label');const suffix=['MaxSlotsEn','RCS','PageSize'].includes(field)?' value':' DMA address';label.textContent=field+suffix;const input=document.createElement('input');input.setAttribute('aria-label',field+suffix);input.value=startup.inputs[field];input.oninput=()=>{startup.inputs[field]=input.value;updateControls()};label.append(input);panel.append(label,document.createElement('br'));}
 const note=document.createElement('p');note.textContent='DCBAAP / command ring / ERST table: 64-byte alignment. ERDP register supports16-byte alignment; this commissioning profile starts at its64-byte-aligned Event Ring segment base. Controller capability: MaxSlots=8, PAGESIZE bitmap=1 (4096 bytes), Max Scratchpad Buffers=2. Programming DCBAAP allocates and zeroes new page-aligned scratchpads, preserves existing valid pages, and installs their array and DCBAA[0]. A real MaxSlotsEn+1-entry DCBAA initializes unused slot pointers to0 and preserves existing slot entries on register rewrites. Configure MaxSlotsEn=1..8 and RCS=0/1. Teaching profile: ERSTSZ1, one16-TRB (256-byte) Event Ring segment, new bytes/Cycle bits0 and initial hardware CCS1; Commissioning validates memory with IRQs disabled; the subsequent enumeration mission models IRQ delivery separately. ERST entries reference the allocated segment, with size16 and reserved0. Set CRCR allocates four zero-initialized TRBs (64 bytes), with unowned Cycle0 versus initial consumer RCS1. Run checks both command memory and the Event table/buffer; rewriting preserves valid existing DMA bytes. RCS initializes the command ring consumer cycle; enumeration uses a fresh cycle-1 ring. Invalid addresses are rejected by this trainer before register encoding.';panel.append(note);
 const details=document.createElement('p');details.textContent=startup.status();panel.append(details);

 const powerNote=document.createElement('p');powerNote.textContent=`§4.23.2 halted-controller laboratory: SSS=${startup.sss} RSS=${startup.rss} SRE=${startup.sre}. Simulated Core Well power and CSS/CRS; no active endpoints. Preserve scratchpad bytes between save and restore.`;panel.append(powerNote);
 for(const action of ['Remove Core Well power','Enable Core Well power','CSS','Poll save completion','CRS','Poll restore completion','Reinitialize Command Ring','Inject save/restore error']){const b=document.createElement('button');b.textContent=action;b.onclick=()=>{const result=startup.power(action);showStartup();message(result)};panel.append(b);}
 const dma=document.createElement('p');dma.id='commission-event-dma';dma.textContent='Event DMA '+JSON.stringify({ERSTSZ:startup.registers.ERSTSZ??0,entries:startup.memory.get(startup.registers.ERSTBA)??[],segmentBytes:startup.memory.get(startup.registers.ERDP)?.length??0});panel.append(dma);
 const corrupt=document.createElement('button');corrupt.textContent='Corrupt commissioning ERST size';corrupt.onclick=()=>{const table=startup.memory.get(startup.registers.ERSTBA);if(!table)return message('Provision Event Ring first.');table[0].size=4;showStartup();message('Fault injected: ERST segment size4 is invalid; rebuild with Set ERST and ERDP.');};panel.append(corrupt);
 const contextDMA=document.createElement('p');contextDMA.id='commission-dcbaa-dma';contextDMA.textContent='Context array DMA '+JSON.stringify({entries:startup.memory.get(startup.registers.DCBAAP)??[]});panel.append(contextDMA);
 const commandDMA=document.createElement('p');commandDMA.id='commission-command-dma';const cmdSegment=startup.memory.get(startup.registers.CRCR);commandDMA.textContent='Command DMA '+JSON.stringify({base:startup.registers.CRCR??null,segmentBytes:cmdSegment?.bytes?.length??0,firstCycle:cmdSegment?.bytes?.length?cmdSegment.bytes[12]&1:null,RCS:startup.registers.RCS??null});panel.append(commandDMA);
 const corruptCommand=document.createElement('button');corruptCommand.textContent='Drop commissioning Command Ring memory';corruptCommand.onclick=()=>{startup.memory.delete(startup.registers.CRCR);showStartup();message('Fault injected: CRCR target memory removed; rebuild with Set CRCR and RCS.');};panel.append(corruptCommand);
 const replay=document.createElement('button');replay.textContent='Reset commissioning';replay.onclick=()=>{startup.reset();startupFeedback='';showStartup()};panel.append(replay);
 panel.scrollTop = 0;
 if(startup.ready){panel.remove();message('Controller running. Begin USB2 enumeration.');}
}
