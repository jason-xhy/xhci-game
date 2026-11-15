/* §4.11 template and Table6-91. Words are unsigned little-endian Dwords. */
const TRBDMA=typeof module!=='undefined'?require('./dma-address.js'):DMAAddress;
class TRBCodec{
 static names={1:'Normal',2:'Setup Stage',3:'Data Stage',4:'Status Stage',5:'Isoch',6:'Link',7:'Event Data',8:'No-Op',9:'Enable Slot Command',10:'Disable Slot Command',11:'Address Device Command',12:'Configure Endpoint Command',13:'Evaluate Context Command',14:'Reset Endpoint Command',15:'Stop Endpoint Command',16:'Set TR Dequeue Pointer Command',17:'Reset Device Command',18:'Force Event Command',19:'Negotiate Bandwidth Command',20:'Set Latency Tolerance Value Command',21:'Get Port Bandwidth Command',22:'Force Header Command',23:'No Op Command',24:'Get Extended Property Command',25:'Set Extended Property Command',32:'Transfer Event',33:'Command Completion Event',34:'Port Status Change Event',35:'Bandwidth Request Event',36:'Doorbell Event',37:'Host Controller Event',38:'Device Notification Event',39:'MFINDEX Wrap Event'};
 static eventType(kind='Transfer'){const aliases={Transfer:32,'Ring Overrun':32,'Ring Underrun':32,Command:33,Port:34};const type=aliases[kind]??Object.keys(this.names).find(t=>this.names[t]===kind);if(type===undefined||!this.info(Number(type)).rings.includes('Event'))throw Error('recognized Event TRB kind required');return Number(type);}
 static integer(value,min,max,name){if(!Number.isInteger(value)||value<min||value>max)throw Error(name+' outside '+min+'..'+max);return value;}
 static info(type){this.integer(type,0,63,'TRB Type');return {type,name:this.names[type]||(type>=48?'Vendor Defined':'Reserved'),vendor:type>=48,rings:type>=48?['Command','Transfer','Event']:type===6?['Command','Transfer']:type>=1&&type<=8?['Transfer']:type>=9&&type<=25?['Command']:type>=32&&type<=39?['Event']:[]};}
 static words(parameter=0,status=0,control=0){const pointer=TRBDMA.parse(parameter);if(pointer===null)throw Error('Parameter must fit unsigned64 exactly.');this.integer(status,0,0xffffffff,'Status');this.integer(control,0,0xffffffff,'Control');return [Number(BigInt(pointer)&0xffffffffn),Number(BigInt(pointer)>>32n),status,control];}
 static normal({parameter=0x8000,length=512,tdSize=0,target=0,cycle=1,chain=false,ent=false,ioc=true,isp=true,ns=false,bei=false,idt=false,direction='IN',maxPacket=512}={}){
  this.integer(length,0,65536,'Transfer Length');this.integer(tdSize,0,31,'TD Size');this.integer(target,0,1023,'Interrupter Target');this.integer(cycle,0,1,'Cycle');
  if(ent&&!chain)throw Error('ENT requires CH1 within the same TD.');if(idt&&(direction!=='OUT'||maxPacket<8||length>8))throw Error('Normal IDT requires OUT, MPS>=8 and length<=8.');
  const p=TRBDMA.parse(parameter);if(p===null)throw Error('Parameter must fit unsigned64 exactly.');
  if(!idt&&length&&(BigInt(p)+BigInt(length)>0x10000000000000000n||BigInt(p)/65536n!==(BigInt(p)+BigInt(length)-1n)/65536n))throw Error('Buffer crosses64KiB or unsigned64 boundary; split into TRBs.');
  return this.words(p,(length|(tdSize<<17)|(target<<22))>>>0,((1<<10)|cycle|(Number(ent)<<1)|(Number(isp)<<2)|(Number(ns)<<3)|(Number(chain)<<4)|(Number(ioc)<<5)|(Number(idt)<<6)|(Number(bei)<<9))>>>0);
 }
 static generic(type,parameter=0,status=0,{cycle=1,chain=false}={}){this.info(type);this.integer(cycle,0,1,'Cycle');return this.words(parameter,status,((type<<10)|cycle|(Number(chain)<<4))>>>0);}
 static event({type=32,pointer=0,length=0,code=1,slot=0,endpoint=0,ed=false,cycle=1}={}){
  if(!this.info(type).rings.includes('Event'))throw Error('Type not valid on Event Ring.');this.integer(length,0,0xffffff,'Event length');this.integer(code,0,255,'Completion Code');this.integer(slot,0,255,'Slot');this.integer(endpoint,0,31,'Endpoint');this.integer(cycle,0,1,'Cycle');
  if(type===32&&!ed&&!TRBDMA.aligned(pointer))throw Error('ED0 Transfer Event pointer requires16-byte alignment.');
  if(type===33&&!TRBDMA.aligned(pointer))throw Error('Command Completion pointer requires16-byte alignment.');
  return this.words(pointer,((code<<24)|length)>>>0,((slot<<24)|(type===32?endpoint<<16:0)|(type<<10)|(type===32?Number(ed)<<2:0)|cycle)>>>0);
 }
 static decode(words){if(!Array.isArray(words)||words.length!==4)throw Error('TRB requires exactly4 Dwords.');for(const word of words)this.integer(word,0,0xffffffff,'Dword');const [lo,hi,status,control]=words,type=(control>>>10)&63,info=this.info(type),parameter=TRBDMA.parse((BigInt(hi)<<32n)|BigInt(lo));
  const out={...info,parameter,status,control,cycle:control&1};
  if(type===1)Object.assign(out,{length:status&0x1ffff,tdSize:(status>>>17)&31,target:status>>>22,ent:Boolean(control&2),isp:Boolean(control&4),ns:Boolean(control&8),chain:Boolean(control&16),ioc:Boolean(control&32),idt:Boolean(control&64),bei:Boolean(control&512)});
  if(info.vendor)out.chain=Boolean(control&16);
  if(info.rings.includes('Event'))out.code=status>>>24;
  if(type===32)Object.assign(out,{length:status&0xffffff,slot:control>>>24,endpoint:(control>>>16)&31,ed:Boolean(control&4)});
  if(type===35)Object.assign(out,{slot:control>>>24});
  if(type===38)Object.assign(out,{slot:control>>>24,notificationType:(lo>>>4)&15,notificationData:TRBDMA.parse(BigInt(parameter)>>8n)});
  if(type===33)Object.assign(out,{slot:control>>>24,commandCompletionParameter:status&0xffffff});return out;
 }
 static bytes(words){this.decode(words);const bytes=new Uint8Array(16),view=new DataView(bytes.buffer);words.forEach((word,index)=>view.setUint32(index*4,word,true));return [...bytes];}
 static tdSizes(lengths,maxPacket=512){
  this.integer(maxPacket,1,65535,'Max Packet Size');if(!Array.isArray(lengths)||!lengths.length)throw Error('TD requires Transfer TRB lengths.');for(const length of lengths)this.integer(length,0,65536,'Transfer Length');
  const total=lengths.reduce((sum,length)=>sum+length,0);if(!Number.isSafeInteger(total))throw Error('TD length exceeds exact arithmetic range.');
  const packets=Math.ceil(total/maxPacket);let cumulative=0;return lengths.map((length,index)=>{cumulative+=length;return index===lengths.length-1?0:Math.min(31,packets-Math.floor(cumulative/maxPacket));});
 }
}
if(typeof module!=='undefined')module.exports=TRBCodec;
