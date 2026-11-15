const assert=require('node:assert/strict'),Lab=require('../endpoint-context.js');
const build=(profile,edit={})=>{const l=new Lab();l.profile(profile);return Lab.build({...l.input,...edit});};
assert.equal(Lab.dci(15,'IN','Bulk'),31);assert.equal(Lab.dci(2,'OUT','Control'),5);assert.equal(Lab.dci(0,'OUT','Control'),1);assert.throws(()=>Lab.dci(0,'IN','Bulk'));
const hs=build('HS bulk IN');assert.equal(hs.dci,3);assert.equal(hs.epType,6);assert.equal(hs.cErr,3);assert.deepEqual(hs.words,[0,0x02000036,0x9001,0,512,0,0,0]);
const control=build('Control EP2 OUT');assert.equal(control.dci,5);assert.equal(control.epType,4);assert.equal(control.averageTRBLength,8);
const fs=build('FS interrupt10ms');assert.equal(fs.interval,6);assert.equal(fs.maxESITPayload,64);assert.equal(fs.words[0],6<<16);
const iso=build('HS isoch3 packets');assert.equal(iso.maxPacketSize,1024);assert.equal(iso.maxBurstSize,2);assert.equal(iso.cErr,0);assert.equal(iso.maxESITPayload,3072);
const streams=build('SS bulk Streams');assert.equal(streams.maxPStreams,1);assert.equal(streams.dcs,0);assert.equal(streams.words[0],0x8400);assert.equal(streams.words[2],0x9000);
const ss=build('SS isoch burst');assert.equal(ss.mult,2);assert.equal(ss.maxESITPayload,10000);assert.equal(ss.words[4],0x27100400);assert.equal(build('SS EP0 exponent9').maxPacketSize,512);
assert.equal(build('FS interrupt10ms',{type:'Isoch',bInterval:16,wMaxPacketSize:1023}).interval,18);
for(const [profile,edit]of [['HS bulk IN',{reserved:1}],['HS bulk IN',{wMaxPacketSize:513}],['HS bulk IN',{speed:'Low'}],['HS isoch3 packets',{wMaxPacketSize:0x1c00}],['SS isoch burst',{bytesPerInterval:13000}],['SS isoch burst',{type:'Interrupt'}],['SS EP0 exponent9',{bMaxPacketSize0:8}],['SS bulk Streams',{descriptorMaxStreams:0}],['HS bulk IN',{dequeue:'0x10000000000000000'}]])assert.throws(()=>build(profile,edit),profile);
const wide=build('HS bulk IN',{dequeue:'0xfffffffffffffff0'});assert.equal(wide.words[2],0xfffffff1);assert.equal(wide.words[3],0xffffffff);
const l=new Lab();l.build();l.initialize();l.publish();assert.equal(l.commands.endpointData.get(1).has(3),false);l.context.maxPacketSize=123;l.context.words[1]=0;l.complete();let output=l.commands.endpointData.get(1).get(3).context;assert.equal(output.maxPacketSize,512);assert.equal(output.epState,1);assert.equal(output.words[0]&7,1);assert.equal(output.words[1],0x02000036);
l.commands.collect();l.commands.publish('Stop Endpoint',1,{dci:3});l.commands.execute();assert.equal(output.epState,3);assert.equal(output.words[0]&7,3);l.commands.publish('Set TR Dequeue Pointer',1,{dci:3,dequeue:'0xfffffffffffffff0',dcs:0});l.commands.execute();output=l.commands.endpointData.get(1).get(3).context;assert.equal(output.words[2],0xfffffff0);assert.equal(output.words[3],0xffffffff);assert.equal(output.dcs,0);
const streamLab=new Lab();streamLab.profile('SS bulk Streams');streamLab.build();streamLab.initialize();streamLab.publish();streamLab.complete();assert.equal(streamLab.commands.endpointData.get(1).get(3).streamLimit,4);assert.equal(streamLab.commands.endpointData.get(1).get(3).context.dcs,0);
console.log('Endpoint DCI/type/descriptor translation, raw reserved words, intervals/ESIT/Streams, FIFO snapshot and Output state/dequeue synchronization pass');

while(streamLab.commands.events.length)streamLab.commands.collect();streamLab.commands.ringStream(1,3,1);streamLab.commands.selectStream(1,3,4);assert.equal(streamLab.commands.endpointData.get(1).get(3).context.epState,2);assert.equal(streamLab.commands.endpointData.get(1).get(3).context.words[0]&7,2);

assert.equal(build("Control EP2 OUT",{number:0,bMaxPacketSize0:32,wMaxPacketSize:undefined}).maxPacketSize,32);assert.equal(build("SS EP0 exponent9",{wMaxPacketSize:undefined}).maxPacketSize,512);
