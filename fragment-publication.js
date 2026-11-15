/* Atomic16-byte writes; each fragment head is published after its remaining TRBs. */
const FragmentTransfer=typeof module!=='undefined'?require('./transfer.js'):TransferLab;
const FragmentCodec=typeof module!=='undefined'?require('./trb-codec.js'):TRBCodec;
const FragmentDMA=typeof module!=='undefined'?require('./dma-address.js'):DMAAddress;
class FragmentPublicationLab{
 constructor(){this.reset();}
 reset(){this.transfer=null;this.plan=null;this.memory=[];this.written=[];this.nextFragment=0;this.bytes=0;this.writeLog=[];this.message='Prepare a TD fragment plan, write non-head TRBs, then publish each head last.';}
 prepare(profile='valid'){
  if(!['valid','bad boundary','two IOC','bad burst','one fragment'].includes(profile))return this.message='Unknown profile.';
  if(this.transfer?.events.length||this.plan&&this.transfer.td&&this.plan.fragments.some(f=>this.written[f.start]))return this.message='Trainer arena gate: finish or replay before replacing a published TD.';
  let maxPacket=512;let trbs=[{type:'Normal',buffer:0xa000,length:512,chain:true},{type:'Event Data',data:0xcafe,ioc:true,chain:true},{type:'Normal',buffer:0xb000,length:512,chain:true},{type:'Event Data',data:0xbeef,ioc:true,chain:false}],burst=0,ends=null;
  if(profile==='bad boundary')trbs=[{type:'Normal',length:256,chain:true,ioc:true},{type:'Normal',length:256,chain:false}];
  if(profile==='two IOC'){maxPacket=1024;burst=1;trbs=[{type:'Normal',length:1024,chain:true,ioc:true},{type:'Normal',length:1024,chain:false,ioc:true}];}
  if(profile==='bad burst'){maxPacket=1024;burst=1;trbs=[{type:'Normal',length:1024,chain:true},{type:'Normal',length:1024,chain:false}];ends=[0,1];}
  if(profile==='one fragment')ends=[3];
  const transfer=new FragmentTransfer();transfer.ep.dci=3;transfer.maxPacketSize=maxPacket;transfer.maxBurstSize=burst;transfer.publishChain(trbs,ends);this.transfer=transfer;this.plan=transfer.td?.fragments||null;this.entries=transfer.td?.entries||[];this.memory=this.entries.map(()=>[0,0,0,0]);this.written=this.entries.map(()=>false);this.nextFragment=0;this.bytes=0;this.writeLog=[];
  return this.message=this.plan?'Validated '+this.plan.fragments.length+' fragments, MBP='+this.plan.mbp+'; all Cycles0, no ownership published.':transfer.message;
 }
 words(index){const t=this.entries[index];if(t.type==='Normal')return FragmentCodec.normal({parameter:t.buffer??0,length:t.length,tdSize:t.tdSize,chain:t.chain,ioc:t.ioc,isp:t.isp});const words=FragmentCodec.generic(7,t.data,0,{chain:t.chain});if(t.ioc)words[3]|=32;return words;}
 writeOthers(fragment=0){const f=this.plan?.fragments[fragment];if(!f||fragment<this.nextFragment)return this.message='Rejected: valid unconsumed fragment required.';for(let i=f.start+1;i<=f.end;i++){this.memory[i]=this.words(i);this.written[i]=true;this.writeLog.push(i);}return this.message='Fragment'+fragment+' non-head records written atomically; head Cycle remains'+(this.memory[f.start][3]&1);}
 publish(fragment=0){const f=this.plan?.fragments[fragment];if(!f||fragment<this.nextFragment)return this.message='Rejected: valid unconsumed fragment required.';if(this.written[f.start])return this.message='Head already published.';if(this.written.slice(f.start+1,f.end+1).some(written=>!written))return this.message='Software publication preflight: write every other fragment TRB before its first TRB; no hardware error inferred.';this.memory[f.start]=this.words(f.start);this.written[f.start]=true;this.writeLog.push(f.start);return this.message='Fragment'+fragment+' first TRB written last; Cycle1 transfers ownership.';}
 execute(){const f=this.plan?.fragments[this.nextFragment];if(!f)return this.message='No pending fragment.';this.transfer.ring();if(this.transfer.ep.state!=='Running'||!this.transfer.bme||!this.transfer.controllerRunning)return this.message='DMA paused: ready endpoint, BME and controller Run required.';if(!this.written[f.start]||(this.memory[f.start][3]&1)!==1)return this.message='Head Cycle mismatch: no data or event progress.';if(this.written.slice(f.start,f.end+1).some(written=>!written))return this.message='Software preflight: incomplete fragment.';
  const end=f.end+1;while(this.transfer.td&&(this.transfer.td.cursor??0)<end)this.transfer.flowControl(end);
  for(const event of this.transfer.events)event.endpoint=3;
  this.bytes+=f.payload;this.nextFragment++;return this.message='Fragment completed: bytes='+this.bytes+'; next='+this.nextFragment+'; remaining TD '+(this.transfer.td?'retained at Cycle boundary.':'retired.');
 }
 collect(){if(!this.transfer)return this.message='Prepare first.';this.transfer.collect();return this.message=this.transfer.message;}
 view(){return {plan:this.plan,memory:this.memory,written:this.written,writeLog:this.writeLog,nextFragment:this.nextFragment,bytes:this.bytes,cursor:this.transfer?.td?.cursor,events:this.transfer?.events,completed:this.transfer?.completed};}
}
if(typeof module!=='undefined')module.exports=FragmentPublicationLab;
if(typeof document!=='undefined'){
 const l=new FragmentPublicationLab(),p=document.createElement('details'),out=document.createElement('p');p.innerHTML='<summary>§4.11.7 TD fragment publication</summary><p>Bulk-IN single-segment arena, default HS MPS512; rejected burst fixtures use SS MPS1024/MaxBurst1. Non-final fragment payload is an MBP multiple; IOC only at permitted packet boundaries, once per fragment. Same validator gates TransferLab chains. Each record write models one atomic16-byte store; fragment first TRB is written last. A published first fragment may complete while the next head still has Cycle0; its data/Event Data progress is retained. Whole-TD Isoch publication and physical Link/segment ownership are separate cases; this arena does not emulate them.</p>';
 const render=()=>out.textContent=l.message+' '+FragmentDMA.stringify(l.view());
 for(const [name,fn]of [['Prepare legal fragments',()=>l.prepare()],['Prepare IOC inside packet',()=>l.prepare('bad boundary')],['Prepare two IOC in burst fragment',()=>l.prepare('two IOC')],['Prepare undersized burst fragment',()=>l.prepare('bad burst')],['Prepare whole TD with two IOC',()=>l.prepare('one fragment')],['Write fragment0 non-head TRBs',()=>l.writeOthers()],['Publish fragment0 head last',()=>l.publish()],['Write fragment1 non-head TRBs',()=>l.writeOthers(1)],['Publish fragment1 head last',()=>l.publish(1)],['Execute one published fragment',()=>l.execute()],['Collect fragment event',()=>l.collect()],['Replay fragment arena',()=>l.reset()]]){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{fn();render();};p.append(b);}out.setAttribute('aria-live','polite');p.append(out);document.body.append(p);render();
}
