const assert=require('node:assert/strict'),Lab=require('../stream-array.js');
const l=new Lab();l.configure();
for(const [sid,psid,ssid,pointer,reads]of [[1,1,0,0xa000,1],[4,0,1,0xb000,2],[6,2,1,0xc000,2],[34,2,8,0xd000,2]]){const r=l.resolve(sid);assert.equal(r.psid,psid);assert.equal(r.ssid,ssid);assert.equal(r.context.pointer,pointer);assert.equal(l.trace.length,reads);assert.equal(l.trace[0].address,0x10000+psid*16);}
for(const sid of [0,2,64,65534,65535]){assert.equal(l.resolve(sid).code,'Invalid Stream ID Error');assert.ok(l.trace.length<=1);}
assert.equal(l.resolve(5).code,'Invalid Stream ID Error');
assert.equal(l.resolve(8).context.pointer,0);assert.equal(l.trace[1].address,0x20020);
l.ring();l.select(8);assert.match(l.message,/NoStream/);assert.equal(l.trace.some(t=>t.read==='Transfer TRB'),false);assert.equal(l.state,'Running');
l.select(4);assert.equal(l.current,4);assert.equal(l.trace.at(-1).address,0xb000);l.select(6);assert.equal(l.state,'Halted');assert.equal(l.events.at(-1).code,'Invalid Stream Type Error');l.resetEndpoint();assert.equal(l.state,'Halted');l.complete();assert.equal(l.state,'Stopped');
l.setDequeue(4);assert.equal(l.resolve(4).context.pointer,0xb000);l.complete();assert.equal(l.resolve(4).context.pointer,0xe000);assert.equal(l.resolve(6).context.pointer,0xc000);
l.ring();l.setDequeue(4,0xf000);l.complete();assert.equal(l.events.at(-1).code,'Context State Error');assert.equal(l.resolve(4).context.pointer,0xe000);l.retire();l.setDequeue(4,0xf000);l.complete();assert.equal(l.events.at(-1).code,'Success');
l.setDequeue(6,'0xfffffffffffffff0',0);l.complete();assert.equal(l.resolve(6).context.pointer,0xfffffffffffffff0n);assert.equal(l.resolve(6).context.dcs,0);
l.setDequeue(64);l.complete();assert.equal(l.events.at(-1).code,'TRB Error');assert.equal(l.state,'Running');assert.equal(l.trace.length,1);l.select(64);assert.equal(l.state,'Halted');assert.equal(l.events.at(-1).code,'Invalid Stream ID Error');
for(const corrupt of ['primaryType','nullSSA','secondaryType']){const c=new Lab();c.configure();if(corrupt==='primaryType')c.primary.get(0).sct=0;if(corrupt==='nullSSA')c.primary.get(0).pointer=0;if(corrupt==='secondaryType')c.secondary.get(0x20000).get(1).sct=1;c.ring(1);c.select(4);assert.equal(c.state,'Halted');assert.equal(c.events.at(-1).code,'Invalid Stream Type Error');assert.equal(c.trace.some(t=>t.read==='Transfer TRB'),false);if(corrupt!=='secondaryType')assert.equal(c.trace.length,1);}
const linear=new Lab();linear.configure(true);assert.equal(linear.resolve(2).context.pointer,0xb000);assert.equal(linear.resolve(4).code,'Invalid Stream ID Error');linear.primary.get(2).sct=2;assert.equal(linear.resolve(2).code,'Invalid Stream Type Error');
const unsupported=new Lab();unsupported.nss=true;unsupported.configure();assert.equal(unsupported.configured,false);assert.match(unsupported.message,/Unsupported/);unsupported.configure(true);assert.equal(unsupported.configured,true);
console.log('Hierarchical Stream PSID/SSID, SCT bounds, no-DMA error paths, empty ring and deferred recovery pass');
