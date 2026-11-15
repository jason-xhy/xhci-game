const a=require('node:assert/strict'),Lab=require('../detach.js'),l=new Lab();
for(const x of ['detect','disable','complete','release'])a.match(l.act(x),/^Rejected/);
l.act('detach');a.equal(l.ccs,0);a.equal(l.csc,1);a.equal(l.resources,true);
a.match(l.act('release'),/^Rejected/);l.act('detect');l.act('disable');
a.equal(l.transfers,2);a.match(l.act('release'),/^Rejected/);a.match(l.act('disable'),/^Rejected/);
l.act('complete');a.equal(l.transfers,0);a.equal(l.resources,true);l.act('release');a.equal(l.resources,false);
l.reset();a.equal(l.ccs,1);a.equal(l.transfers,2);console.log('detach ordering and DMA ownership pass');
