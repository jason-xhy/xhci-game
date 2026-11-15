const assert=require('node:assert/strict'),Lab=require('../scheduling.js');
for(const delay of [null,101]){const l=new Lab();l.configurePing(100,delay);l.publish();l.publish();l.ring();l.tick(8);assert.equal(l.events[0].code,'No Ping Response Error');assert.equal(l.events[0].pointer,0x4000);assert.equal(l.events[0].length,64);assert.equal(l.movedBytes,0);assert.equal(l.transfer.ep.state,'Running');assert.equal(l.pingTrace[0].pingUS,900);assert.equal(l.pingTrace[0].dueUS,1000);l.pingResponse(50);l.tick(8);assert.equal(l.events[1].code,'Success');assert.equal(l.events[1].time,16);assert.equal(l.pingTrace[1].responseUS,1950);assert.equal(l.movedBytes,64);}
for(const delay of [0,50,100]){const l=new Lab();l.configurePing(100,delay);l.publish();l.ring();l.tick(8);assert.equal(l.events[0].code,'Success');}
const zero=new Lab();zero.configurePing(0);zero.publish();zero.ring();zero.tick(8);assert.equal(zero.events[0].code,'Success');assert.equal(zero.pingTrace.length,0);
const reject=new Lab();reject.configurePing(1000);assert.equal(reject.ping,null);reject.configurePing(100);reject.publishLinkedFrame();assert.equal(reject.queue.length,0);assert.match(reject.message,/single-TRB/);
console.log('SS Isoch PING lead/response deadline, no-data NoPing response error, next-ESIT recovery, MEL0 and exact deadline/late/absent boundaries');

const priority=new Lab();priority.configurePing();priority.publish();priority.injectError();priority.ring();priority.tick(8);assert.equal(priority.events[0].code,'No Ping Response Error');
