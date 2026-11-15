const assert=require('node:assert/strict'),Port=require('../root-port.js');
const cold=()=>{const p=new Port();p.usb3=true;p.setRunning(false);p.enterD3();return p;};
const p=cold();p.configureWake();p.attach();assert.equal(p.cas,true);assert.equal(p.ccs,false);assert.equal(p.ped,false);assert.equal(p.changes.has('CSC'),true);assert.equal(p.events.length,0);assert.equal(p.pmeStatus,true);assert.equal(p.pmeAssertions,0);p.setPMEEnabled();assert.equal(p.pmeAssertions,1);p.detectColdAttach();assert.equal(p.pmeAssertions,1);p.setRunning(true);assert.equal(p.running,false);p.requestReset(true);assert.equal(p.pr,false);
p.restoreD0();assert.equal(p.cas,true);p.setRunning(true);assert.equal(p.events.length,1);p.requestReset(true);assert.equal(p.cas,false);assert.equal(p.pr,true);assert.equal(p.wpr,true);p.completeReset();assert.equal(p.ccs,true);assert.equal(p.ped,true);assert.equal(p.pls,'U0');assert.equal(p.changes.has('WRC'),true);assert.equal(p.changes.has('PRC'),true);assert.equal(p.pmeStatus,true);p.acknowledgePME();assert.equal(p.pmeStatus,false);assert.equal(p.changes.has('CSC'),true);
const train=cold();train.attach();train.restoreD0(true);assert.equal(train.cas,false);assert.equal(train.ccs,true);assert.equal(train.ped,true);
const u2=new Port();u2.setRunning(false);u2.enterD3();u2.configureWake();u2.setPMEEnabled();u2.attach();assert.equal(u2.cas,false);assert.equal(u2.ccs,true);assert.equal(u2.pmeAssertions,1);assert.equal(u2.events.length,0);
for(const state of ['Error','SS.Inactive','Disabled','U3']){const excluded=cold();excluded.pls=state;excluded.detectColdAttach();assert.equal(excluded.cas,false,state);assert.equal(excluded.changes.size,0);}
const off=cold();off.ppc=true;off.power(false);off.detectColdAttach();assert.equal(off.cas,false);const powered=cold();powered.attach();powered.ppc=true;powered.power(false);assert.equal(powered.cas,false);
const clocks=cold();clocks.clocksRunning=true;clocks.attach();assert.equal(clocks.ccs,true);assert.equal(clocks.cas,false);
const disabled=cold();disabled.setPMEEnabled();disabled.attach();assert.equal(disabled.cas,true);assert.equal(disabled.pmeAssertions,0);assert.equal(disabled.pmeStatus,false);
const latched=cold();latched.attach();latched.detach();assert.equal(latched.cas,true);assert.equal(latched.terminations,false);
const connected=new Port();connected.usb3=true;connected.attach();connected.setRunning(false);connected.enterD3();assert.equal(connected.pciPower,'D0');connected.suspendForD3();connected.configureWake(false,true);connected.setPMEEnabled();connected.enterD3();assert.equal(connected.pciPower,'D3');connected.detach();assert.equal(connected.pmeAssertions,1);assert.equal(connected.ccs,false);assert.equal(connected.cas,false);
const over=cold();over.configureWake(false,false,true);over.setPMEEnabled();over.overcurrent();assert.equal(over.pmeAssertions,1);assert.equal(over.changes.has('OCC'),true);
const debug=cold();debug.debugOwned=true;debug.attach();assert.equal(debug.cas,false);assert.equal(debug.events.length,0);
console.log('Cold attach CAS/D3/CCS distinction, PME status vs enable, USB2 exclusion, WPR recovery and wake policies pass');

const present=new Port();present.usb3=true;present.terminations=true;present.setRunning(false);present.enterD3();assert.equal(present.cas,true);const switched=cold();switched.ppc=true;switched.power(false);switched.detectColdAttach();switched.power(true);assert.equal(switched.cas,true);

const ro=cold();ro.configureWake();ro.setPMEEnabled();ro.attach();ro.clear("CAS");assert.equal(ro.cas,true);ro.acknowledgePME();ro.detectColdAttach();assert.equal(ro.pmeStatus,false);assert.equal(ro.pmeAssertions,1);ro.clear("CSC");ro.detectColdAttach();assert.equal(ro.changes.has("CSC"),false);
