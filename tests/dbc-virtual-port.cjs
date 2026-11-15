const assert=require('node:assert/strict'),Lab=require('../ss-polling');
const ready=()=>{const l=new Lab;l.enableDebug();l.connect('host');l.train();l.configure();return l;},send=l=>{l.sendDebug();assert.equal(l.debug.ring.count,1);l.collectDebug();};
let l=ready();assert.equal(l.port.state(),'DbC Disconnected');send(l);l.normalDisable();assert.equal(l.port.state(),'DbC Disabled');assert.equal(l.port.ccs,false);send(l);l.normalPower(false);assert.equal(l.port.state(),'DbC Powered-off');assert.equal(l.port.pls,'Disabled');send(l);l.normalPower(true);assert.equal(l.port.state(),'DbC Disconnected');assert.equal(l.port.ccs,false);send(l);assert.equal(l.port.events.length,0);l.normalDisable();l.normalRxDetect(false);assert.equal(l.port.state(),'DbC Disabled');l.normalRxDetect();assert.equal(l.port.state(),'DbC Disconnected');
for(const state of ['Disconnected','Disabled','Powered-off']){l=ready();if(state==='Disabled')l.normalDisable();if(state==='Powered-off')l.normalPower(false);l.releaseDebug();assert.equal(l.port.state(),state==='Disabled'?'Disabled':'Disconnected');assert.equal(l.port.ccs,false);assert.equal(l.debug.enabled,false);assert.equal(l.port.events.length,0);}
console.log('PASS DbC virtual disconnected/disabled/powered-off, private traffic independence, RxDetect/LWS, DCE0 normal-state mapping and no host attach');

l=ready();l.normalDisable();l.releaseDebug();l.normalRxDetect();assert.equal(l.stage,'Training');assert.equal(l.port.ccs,false);l.train();l.configure();assert.equal(l.stage,'Error');assert.equal(l.port.changes.has('CEC'),true);

l=ready();l.normalDisable();l.disconnect();l.normalRxDetect();assert.equal(l.port.state(),'Disconnected');assert.equal(l.port.terminations,false);assert.equal(l.stage,null);
