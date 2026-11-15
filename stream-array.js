/* §4.12.2 hierarchical Stream Context addressing; explicit teaching memory map. */
const StreamDMA=typeof module!=='undefined'?require('./dma-address.js'):DMAAddress;
class StreamArrayLab {
 constructor(){this.reset();}
 reset(){this.nss=false;this.state='Stopped';this.pending=null;this.events=[];this.trace=[];this.active=new Set();this.current=0;this.primary=new Map();this.secondary=new Map();this.configured=false;this.message='Configure a linear or hierarchical Stream Context Array while Stopped.';}
 toJSON(){return {lsa:this.lsa,maxPStreams:this.maxPStreams,size:this.size,base:this.base,primary:[...this.primary],secondary:[...this.secondary].map(([address,array])=>[address,[...array]]),trace:this.trace};}
 copy(){const copy=new StreamArrayLab();Object.assign(copy,structuredClone({...this}));return copy;}
 resized(maxPStreams=2){
  if(!this.configured||!Number.isInteger(maxPStreams)||maxPStreams<1||maxPStreams>(this.lsa?15:7)){this.message='Resize rejected: invalid MaxPStreams or hierarchical primary size >256.';return null;}
  if(!this.lsa&&!(this.primary.get(0)?.sct>=2)){this.message='Resize rejected: primary0 must reference a secondary array.';return null;}const entries=new Map();
  for(const [psid,primary]of this.primary){
   if(primary.sct===1){if(psid)entries.set(psid,{...primary});}
   else if(primary.sct>=2&&primary.sct<=7){if(!primary.pointer||!this.secondary.has(primary.pointer)){this.message='Resize rejected: missing secondary array.';return null;}for(const [ssid,context]of this.secondary.get(primary.pointer))if(ssid){if(context.sct!==0){this.message='Resize rejected: malformed secondary SCT.';return null;}entries.set(ssid*this.size+psid,{...context});}}
   else {this.message='Resize rejected: malformed source Stream Context type.';return null;}
  }
  for(const [sid,context]of entries)if(!context.pointer&&!this.active.has(sid))entries.delete(sid);const size=2**(maxPStreams+1);for(const sid of this.active)if(this.lsa?sid>=size:Math.floor(sid/size)>=256){this.message='Resize rejected: active SID would be out of range.';return null;}
  for(const [sid,context]of entries)if((this.lsa?sid>=size:Math.floor(sid/size)>=256)&&(context.pointer||this.active.has(sid))){this.message='Resize rejected: retained ring or active SID'+sid+' would be out of range.';return null;}
  const copy=this.copy();copy.maxPStreams=maxPStreams;copy.size=size;copy.base=this.base+0x200000;copy.primary=new Map();copy.secondary=new Map();copy.trace=[];
  if(this.lsa){for(const [sid,context]of entries)if(sid<size)copy.primary.set(sid,{...context,sct:1});}
  else {
   const groups=new Map();for(const [sid,context]of entries){const psid=sid%size,ssid=Math.floor(sid/size);if(ssid>=256)continue;if(!groups.has(psid))groups.set(psid,new Map());groups.get(psid).set(ssid,context);}
   for(let psid=0;psid<size;psid++){
    const group=groups.get(psid)||new Map();
    if(psid&&(!group.size||(group.size===1&&group.has(0))))copy.primary.set(psid,{...(group.get(0)||{pointer:0,dcs:0,edtla:0}),sct:1});
    else {
     if(group.has(0)&&group.get(0).pointer){this.message='Resize rejected: direct SID would require reserved SSID0 in a secondary array.';return null;}
     let sct=2;while(2**(sct+1)<=Math.max(1,...group.keys()))sct++;
     const pointer=copy.base+0x10000+psid*4096;copy.primary.set(psid,{sct,pointer});copy.secondary.set(pointer,new Map([...group].filter(([ssid])=>ssid>0).map(([ssid,context])=>[ssid,{...context,sct:0}])));
    }
   }
  }
  copy.message='Prepared resized array: MaxPStreams='+maxPStreams+'; Stream IDs and ring progress retained, PSID/SSID recomputed.';return copy;
 }
 configure(lsa=false){
  if(this.state!=='Stopped'||this.pending)return this.message='Software gate: stop before replacing Stream Context Arrays.';
  if(!lsa&&this.nss)return this.message='Unsupported: NSS=1 means no Secondary Stream Array support; use linear mode.';
  this.lsa=lsa;this.maxPStreams=1;this.size=4;this.base=0x10000;this.primary=new Map();this.secondary=new Map();this.active.clear();this.current=0;
  const ring=pointer=>({sct:1,pointer,dcs:1,edtla:0,cached:false});
  if(lsa){this.primary.set(1,ring(0xa000));this.primary.set(2,ring(0xb000));this.primary.set(3,ring(0));}
  else {this.primary.set(0,{sct:2,pointer:0x20000});this.primary.set(1,ring(0xa000));this.primary.set(2,{sct:3,pointer:0x30000});this.primary.set(3,ring(0));this.secondary.set(0x20000,new Map([[1,{...ring(0xb000),sct:0}],[2,{...ring(0),sct:0}]]));this.secondary.set(0x30000,new Map([[1,{...ring(0xc000),sct:0}],[8,{...ring(0xd000),sct:0}]]));}
  this.configured=true;return this.message='Configured MaxPStreams=1: four primary entries, LSA='+Number(lsa)+'. Hierarchical SID4→PSID0/SSID1; SID6→PSID2/SSID1; SID34→PSID2/SSID8. Arrays use 16-byte contexts.';
 }
 resolve(sid){
  this.trace=[];const fail=code=>({code});
  if(!this.configured||!Number.isInteger(sid)||sid<=0||sid>=65534)return fail('Invalid Stream ID Error');
  if(this.lsa&&sid>=this.size)return fail('Invalid Stream ID Error');
  const psid=this.lsa?sid:sid%this.size,ssid=this.lsa?0:Math.floor(sid/this.size);
  this.trace.push({read:'Primary Context',address:this.base+psid*16,psid,ssid});
  const primary=this.primary.get(psid)||{sct:1,pointer:0,dcs:0};
  if(this.lsa){if(primary.sct!==1)return fail('Invalid Stream Type Error');return {context:primary,psid,ssid};}
  if(!Number.isInteger(primary.sct)||primary.sct===0||primary.sct<0||primary.sct>7)return fail('Invalid Stream Type Error');
  if(primary.sct===1)return ssid?fail('Invalid Stream ID Error'):{context:primary,psid,ssid};
  if(!primary.pointer)return fail('Invalid Stream Type Error');
  const secondarySize=2**(primary.sct+1);
  if(ssid===0||ssid>=secondarySize)return fail('Invalid Stream ID Error');
  this.trace.push({read:'Secondary Context',address:primary.pointer+ssid*16,psid,ssid});
  const context=this.secondary.get(primary.pointer)?.get(ssid)||{sct:0,pointer:0,dcs:0};
  if(context.sct!==0)return fail('Invalid Stream Type Error');
  return {context,psid,ssid};
 }
 ring(sid=4){if(this.pending||!['Stopped','Running'].includes(this.state))return this.message='Rejected: finish command or recover Halted endpoint first.';const resolved=this.resolve(sid);if(resolved.code)return this.message='Software doorbell preflight: '+resolved.code;this.active.add(sid);this.state='Running';return this.message='Doorbell accepted for SID'+sid+'; device selects stream independently.';}
 select(sid=4){
  if(this.state!=='Running'||this.pending)return this.message='Rejected: Running endpoint required.';
  this.trace=[];const resolved=this.current&&this.current!==sid?{code:'Invalid Stream Type Error'}:this.resolve(sid);if(resolved.code){this.state='Halted';this.events.push({type:'Transfer',code:resolved.code,pointer:0,interrupter:0});return this.message=resolved.code+'; endpoint Halted; no payload DMA.';}
  if(!resolved.context.pointer)return this.message='NoStream: empty ring; no TRB DMA from address zero.';
  this.current=sid;this.trace.push({read:'Transfer TRB',address:resolved.context.pointer});return this.message='Move Data SID'+sid+' PSID='+resolved.psid+' SSID='+resolved.ssid+' dequeue='+StreamDMA.stringify(resolved.context.pointer);
 }
 setDequeue(sid=4,pointer=0xe000,dcs=1){if(this.pending)return this.message='Rejected: command pending.';if(!StreamDMA.aligned(pointer)||![0,1].includes(dcs))return this.message='Software preflight: aligned exact64-bit dequeue and DCS0/1 required.';this.pending={type:'Set Dequeue',sid,pointer:StreamDMA.parse(pointer),dcs};return this.message='Set TR Dequeue Pointer queued; selected Stream Context unchanged until completion.';}
 resetEndpoint(){if(this.pending)return this.message='Rejected: command pending.';this.pending={type:'Reset'};return this.message='Reset Endpoint queued; halt recovery deferred until completion.';}
 complete(){
  const command=this.pending;if(!command)return this.message='Rejected: no command pending.';this.pending=null;let code='Success';
  if(command.type==='Reset'){if(this.state!=='Halted')code='Context State Error';else {this.state='Stopped';this.current=0;}}
  else if(!['Stopped','Error'].includes(this.state)&&!(this.state==='Running'&&!this.active.has(command.sid)&&this.current!==command.sid))code='Context State Error';
  else {const resolved=this.resolve(command.sid);if(resolved.code)code='TRB Error';else {Object.assign(resolved.context,{pointer:command.pointer,dcs:command.dcs,edtla:0,cached:false});const secondary=this.lsa?null:this.secondary.get(this.primary.get(resolved.psid)?.pointer);(secondary||this.primary).set(secondary?resolved.ssid:resolved.psid,resolved.context);}}
  this.events.push({type:'Command',code,interrupter:0});return this.message=command.type+' completion: '+code+'; state='+this.state;
 }
 retire(sid=4){if(this.current===sid)this.current=0;this.active.delete(sid);return this.message='Class completion/abort observed for SID'+sid+'; now inactive (grouped class-driver action).';}
}
if(typeof module!=='undefined')module.exports=StreamArrayLab;
if(typeof document!=='undefined'){
 const l=new StreamArrayLab(),p=document.createElement('details'),out=document.createElement('p');p.innerHTML='<summary>§4.12.2 Hierarchical Stream arrays</summary><p>Four primary entries (MaxPStreams1): PSID=SID low2 bits, SSID=remaining bits. SCT2→8 and SCT3→16 secondary entries. SID0/Prime/NoStream reserved; primary direct rings require SSID0, secondary arrays require SSID>0. NSS1 rejects secondary mode. Device bounds/type errors halt the endpoint; Set Dequeue reports TRB Error without halting. A different SID during Move Data halts with Invalid Stream Type Error; end current data move before selecting another. Empty ring returns NoStream without DMA from zero. Runtime resize, real IOMMU and full USB packet protocol remain pending; memory/packet actions are explicit snapshots.</p>';
 const render=()=>out.textContent=l.message+' state='+l.state+' current='+l.current+' active='+StreamDMA.stringify([...l.active])+' events='+StreamDMA.stringify(l.events)+' DMA='+StreamDMA.stringify(l.trace)+' primary='+StreamDMA.stringify([...l.primary])+' secondary='+StreamDMA.stringify([...l.secondary].map(([address,array])=>[address,[...array]]));
 for(const [name,fn]of [['Configure hierarchical arrays',()=>l.configure()],['Configure linear arrays',()=>l.configure(true)],['Toggle NSS capability',()=>{if(l.configured)l.message='Replay before changing capability.';else {l.nss=!l.nss;l.message='NSS='+Number(l.nss);}}],['Inject primary SCT0',()=>{if(l.state!=='Stopped'||l.lsa||!l.configured)l.message='Fault fixture requires Stopped hierarchical endpoint.';else {l.primary.get(0).sct=0;l.message='Fault fixture: primary0 SCT0 is invalid in a Primary array.';}}],['Inject null secondary array',()=>{if(l.state!=='Stopped'||l.lsa||!l.configured)l.message='Fault fixture requires Stopped hierarchical endpoint.';else {l.primary.get(0).pointer=0;l.message='Fault fixture: primary0 SSA pointer0.';}}],['Ring SID1',()=>l.ring(1)],['Ring SID4',()=>l.ring()],['Device selects SID4',()=>l.select()],['End current data move',()=>{l.current=0;l.message='Current data move ended; device may select another Stream (grouped packet boundary).';}],['Device selects SID6',()=>l.select(6)],['Device selects SID34',()=>l.select(34)],['Device selects empty SID8',()=>l.select(8)],['Device selects invalid SID2',()=>l.select(2)],['Device selects invalid SID64',()=>l.select(64)],['Set SID4 dequeue',()=>l.setDequeue()],['Set SID6 64bit dequeue',()=>l.setDequeue(6,'0xfffffffffffffff0',0)],['Set invalid SID64',()=>l.setDequeue(64)],['Class completes SID4',()=>l.retire()],['Reset stream endpoint',()=>l.resetEndpoint()],['Complete stream command',()=>l.complete()],['Replay Stream arrays',()=>l.reset()]]){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{fn();render();};p.append(b);}out.setAttribute('aria-live','polite');p.append(out);document.body.append(p);render();
}
