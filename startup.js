class ControllerStartup {
 static actions=['Halt','Reset','Wait for HCRST clear','Wait for CNR clear','Set MaxSlotsEn and DCBAAP','Set CRCR and RCS','Set ERST and ERDP','Run'];
 static commandSegment(){return {cycle:1,empty:true,bytes:new Uint8Array(64)};}
 static defaults={DCBAAP:'0x1000',CRCR:'0x2000',ERSTBA:'0x3000',ERDP:'0x4000',MaxSlotsEn:'8',RCS:'1',PageSize:'4096',ScratchpadArray:'0x5000',Scratchpad0:'0x6000',Scratchpad1:'0x7000'};
 constructor(){this.reset()}
 reset(){this.needsRestore=false;this.corePowered=true;this.sre=0;this.failNextPower=false;this.commandRingNeedsInit=false;this.sss=0;this.rss=0;this.savedState=null;this.stage=0;this.ready=false;this.rejections=0;this.programmed=new Set();this.registers={};this.halted=false;this.hcrst=0;this.cnr=0;this.memory=new Map();this.inputs={...ControllerStartup.defaults}}
 power(action){
 const reject=reason=>`Rejected ${action}: ${reason}. Trainer preflight; no state changed.`;
 if(action==='Enable Core Well power'){
 if(this.corePowered)return reject('Core Well already powered');
 this.corePowered=true;return 'Core Well powered. Restore original register groups before CRS.';
 }
 if(!this.corePowered)return reject('enable Core Well power first');
 if(action==='Remove Core Well power'){
 if(!this.savedState||this.sss||this.rss||this.sre||!this.halted||this.needsRestore)return reject('complete successful CSS on halted controller first');
 this.registers={};this.programmed.clear();this.stage=4;this.corePowered=false;this.commandRingNeedsInit=true;this.needsRestore=true;
 return 'Core Well off: volatile registers lost; simulated system DMA memory preserved.';
 }
 if(!this.halted||this.hcrst||this.cnr||this.programmed.size!==3)return reject('requires halted, ready, fully provisioned controller');
 if(action==='Inject save/restore error'){
 if(this.sss||this.rss)return reject('select fault before starting CSS or CRS');
 this.failNextPower=true;return 'Trainer fault armed: next save/restore completion sets SRE=1.';
 }
 if(this.sre)return reject('SRE=1; reset and recommission controller using Reset commissioning');
 if(action==='Reinitialize Command Ring'){
 if(this.sss||this.rss)return reject('wait for pending save/restore completion');
 if(this.needsRestore||!this.commandRingNeedsInit)return reject('complete CRS first');
 this.memory.set(this.registers.CRCR,ControllerStartup.commandSegment());
 this.registers.RCS=1;this.commandRingNeedsInit=false;
 return 'Command Ring reinitialized empty with Cycle=1; CRCR rewritten with RCS=1. Run is available.';
 }
 if(action==='CSS'){
 if(this.sss||this.rss)return reject('wait for pending save/restore completion');
 if(this.needsRestore)return reject('complete CRS before saving again');
 this.sss=1;return 'CSS pulse accepted; SSS=1. Poll save completion.';
 }
 if(action==='Poll save completion'){
 if(!this.sss)return reject('no save pending');
 if(this.failNextPower){this.failNextPower=false;this.sss=0;this.sre=1;this.savedState=null;return 'SSS=0 SRE=1: save failed. Reset commissioning to reset and recommission.';}
 this.savedState={registers:{...this.registers},pages:[this.registers.Scratchpad0,this.registers.Scratchpad1].map(a=>new Uint8Array(this.memory.get(a)))};
 this.sss=0;return 'SSS=0. Simulated internal state saved; preserve DMA memory.';
 }
 if(action==='CRS'){
 if(this.sss||this.rss)return reject('wait for pending save/restore completion');
 if(!this.savedState)return reject('complete CSS first');
 if(JSON.stringify(this.registers)!==JSON.stringify(this.savedState.registers))return reject('restore original register addresses before CRS');
 const r=this.registers;
 if(this.savedState.pages.some((page,i)=>{const live=this.memory.get(r['Scratchpad'+i]);return !(live instanceof Uint8Array)||live.length!==page.length||page.some((v,j)=>v!==live[j])}))return reject('restore preserved scratchpad image before CRS');
 this.needsRestore=true;this.rss=1;return 'CRS pulse accepted; RSS=1. Poll restore completion.';
 }
 if(action==='Poll restore completion'){
 if(!this.rss)return reject('no restore pending');
 if(this.failNextPower){this.failNextPower=false;this.rss=0;this.sre=1;this.savedState=null;return 'RSS=0 SRE=1: restore failed. Reset commissioning to reset and recommission.';}
 this.rss=0;this.needsRestore=false;this.commandRingNeedsInit=true;return 'RSS=0. Simulated internal state restored. Reinitialize Command Ring before Run.';
 }
 return reject('unknown power action');
 }
 status(){return `Completed ${this.stage}/8. HCHalted=${+this.halted} HCRST=${this.hcrst} CNR=${this.cnr}. Next: ${this.stage>=4&&this.stage<=6?'program remaining register groups in any order':ControllerStartup.actions[this.stage]||'enumerate device'}. ${this.rejections} rejected writes. Poll steps advance simulated hardware, not software writes. Addresses are DMA base addresses; CRCR RCS is encoded separately. Event delivery uses polling. Fixed64-byte Command Ring memory contains four zeroed TRBs with unowned Cycle0 versus initial RCS1; full Cycle/Link command execution is the physical-ring lab. Fixed primary ERSTSZ1 points to a16-TRB (256-byte) segment; new segment bytes/Cycle bits start0 and hardware CCS starts1. Preserved DMA is not zeroed when register groups are rewritten.`}
 act(action,values=this.inputs,checkOnly=false){
 const provision=ControllerStartup.actions.slice(4,7);
 const expected=ControllerStartup.actions[this.stage];
 const reject=reason=>{if(!checkOnly)this.rejections++;return `Rejected ${action}: ${reason}. No controller state changed.`};
 if(!this.corePowered)return reject('enable Core Well power first');
 if(this.sre)return reject('SRE=1; reset and recommission controller using Reset commissioning');
 if(this.sss||this.rss)return reject('wait for SSS/RSS to clear');
 const legal=this.stage>=4&&this.stage<=7 ? provision.includes(action)||(action==='Run'&&this.programmed.size===3) : action===expected;
 if(!legal)return reject(this.hcrst?'HCRST=1; wait for reset completion':this.cnr?'CNR=1; wait for readiness':this.stage>=4?'complete all register groups before Run':expected||'controller already running');
 if(action==='Run'&&this.needsRestore)return reject('complete CRS after Core Well power loss before Run');
 if(action==='Run'&&this.commandRingNeedsInit)return reject('reinitialize Command Ring and rewrite CRCR after restore before Run');
 if(action==='Run'&&(!this.memory.has(this.registers.Scratchpad0)||!this.memory.has(this.registers.Scratchpad1)))return reject('allocate both scratchpad pages before Run');
 if(action==='Run'&&(this.sss||this.rss))return reject('wait for SSS/RSS to clear');
 if(action==='Run'){
 const command=this.memory.get(this.registers.CRCR);if(!(command?.bytes instanceof Uint8Array)||command.bytes.length!==64)return reject('allocate four-TRB Command Ring memory at CRCR before Run');
 const r=this.registers,dcbaa=this.memory.get(r.DCBAAP),array=this.memory.get(r.ScratchpadArray);
 if(!Array.isArray(dcbaa)||dcbaa.length<r.MaxSlotsEn+1||dcbaa[0]!==r.ScratchpadArray||!Array.isArray(array)||array.length!==2||array[0]!==r.Scratchpad0||array[1]!==r.Scratchpad1)return reject('repair DCBAA[0] and scratchpad array pointers before Run');
 const erst=this.memory.get(r.ERSTBA),segment=this.memory.get(r.ERDP);if(r.ERSTSZ!==1||!Array.isArray(erst)||erst.length!==1||erst[0].base!==r.ERDP||erst[0].size!==16||erst[0].reserved!==0||!(segment instanceof Uint8Array)||segment.length!==256)return reject('repair one-entry ERST and16-TRB Event Ring segment before Run');
 if([r.Scratchpad0,r.Scratchpad1].some(address=>!(this.memory.get(address) instanceof Uint8Array)||this.memory.get(address).length!==r.PageSize))return reject('scratchpad buffers must each span one selected page');
 }
 if(action==='Run'&&this.registers.RCS!==1)return reject('command producer starts at Cycle=1; reprogram RCS=1 to match before Run in this mission');
 const fields=action===provision[0]?['DCBAAP','ScratchpadArray','Scratchpad0','Scratchpad1']:action===provision[1]?['CRCR']:action===provision[2]?['ERSTBA','ERDP']:[];
 const parsed={};
 if(action===provision[0]){const raw=String(values.MaxSlotsEn??'');if(!/^[0-9]+$/.test(raw)||Number(raw)<1||Number(raw)>8)return reject('MaxSlotsEn must be 1..8 for this controller (HCSPARAMS1.MaxSlots=8)');parsed.MaxSlotsEn=Number(raw);if(String(values.PageSize)!=='4096')return reject('PAGESIZE capability bitmap=1 supports only 4096-byte pages');parsed.PageSize=4096}
 if(action===provision[1]){const raw=String(values.RCS??'');if(!/^[01]$/.test(raw))return reject('RCS must be 0 or 1');parsed.RCS=Number(raw)}
 for(const field of fields){const raw=String(values[field]??'');if(!/^(0x[0-9a-f]+|[0-9]+)$/i.test(raw))return reject(`${field} needs an unsigned DMA address`);const address=BigInt(raw),alignment=field.startsWith('Scratchpad')&&field!=='ScratchpadArray'?4096n:64n;if(address===0n||address>0xffffffffffffffffn||address%alignment)return reject(`${field} must be nonzero, 64-bit and ${alignment}-byte aligned; correct the address and retry`);parsed[field]='0x'+address.toString(16)}
 if(fields.length){const spans=Object.entries({...this.registers,...parsed}).filter(([k])=>['DCBAAP','CRCR','ERSTBA','ERDP','ScratchpadArray','Scratchpad0','Scratchpad1'].includes(k)).map(([k,v])=>[BigInt(v),k==='Scratchpad0'||k==='Scratchpad1'?4096n:k==='DCBAAP'?BigInt((parsed.MaxSlotsEn??this.registers.MaxSlotsEn)+1)*8n:k==='ERDP'?256n:64n]);if(spans.some(([base,size])=>base+size>0x10000000000000000n))return reject('DMA allocation extends beyond the 64-bit address space');if(action===provision[0]&&BigInt(parsed.DCBAAP)%BigInt(parsed.PageSize)+BigInt((parsed.MaxSlotsEn+1)*8)>BigInt(parsed.PageSize))return reject('DCBAA must be physically contiguous within one selected page');for(let i=0;i<spans.length;i++)for(let j=0;j<i;j++)if(spans[i][0]<spans[j][0]+spans[j][1]&&spans[j][0]<spans[i][0]+spans[i][1])return reject('DMA allocations overlap');}
 if(checkOnly)return null;
 if(action==='Halt')this.halted=true;
 if(action==='Reset'){this.hcrst=1;this.cnr=1;this.memory.clear();this.registers={};this.programmed.clear()}
 if(action==='Wait for HCRST clear')this.hcrst=0;
 if(action==='Wait for CNR clear')this.cnr=0;
 if(action===provision[0]){for(const address of [parsed.Scratchpad0,parsed.Scratchpad1]){const page=this.memory.get(address);if(!(page instanceof Uint8Array)||page.length!==parsed.PageSize)this.memory.set(address,new Uint8Array(parsed.PageSize));}this.memory.set(parsed.ScratchpadArray,[parsed.Scratchpad0,parsed.Scratchpad1]);const prior=this.memory.get(parsed.DCBAAP),dcbaa=Array.from({length:parsed.MaxSlotsEn+1},(_,slot)=>slot===0?parsed.ScratchpadArray:Array.isArray(prior)?prior[slot]??0:0);this.memory.set(parsed.DCBAAP,dcbaa);}
 if(action===provision[1]){const segment=this.memory.get(parsed.CRCR);if(!(segment?.bytes instanceof Uint8Array)||segment.bytes.length!==64)this.memory.set(parsed.CRCR,ControllerStartup.commandSegment());}
 if(action===provision[2]){parsed.ERSTSZ=1;const segment=this.memory.get(parsed.ERDP);if(!(segment instanceof Uint8Array)||segment.length!==256)this.memory.set(parsed.ERDP,new Uint8Array(256));this.memory.set(parsed.ERSTBA,[{base:parsed.ERDP,size:16,reserved:0}]);}
 if(fields.length){Object.assign(this.registers,parsed);if(!this.programmed.has(action)){this.programmed.add(action);this.stage++}}
 else this.stage++;
 this.ready=this.stage===8;if(this.ready)this.halted=false;
 return this.ready?'HCHalted=0: controller running.':'Accepted '+action;
 }
}
if(typeof module!=='undefined')module.exports=ControllerStartup;
