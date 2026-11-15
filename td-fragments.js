/* §4.11.7.1: derive/validate software TD fragment boundaries. */
class TDFragmentPlan{
 static transfer(t){return ['Normal','Setup Stage','Data Stage','Status Stage','Isoch'].includes(t.type);}
 static analyze(entries,{maxPacket=512,maxBurst=0,ends=null}={}){
  if(!Array.isArray(entries)||!entries.length||!Number.isInteger(maxPacket)||maxPacket<1||maxPacket>65535||!Number.isInteger(maxBurst)||maxBurst<0||maxBurst>15)throw Error('Valid entries, MPS and base-profile MaxBurst0..15 required.');
  if(entries.length>1&&entries.some(t=>t.type==='No-Op'))throw Error('No-Op Transfer must be a standalone TD.');
  if(entries.length>1&&(entries[0].type==='Link'||entries.at(-1).type==='Link'||entries.some((t,i)=>t.type==='Link'&&entries[i-1]?.type==='Link')))throw Error('Link cannot begin/end a multi-TRB TD or follow another Link within it.');
  let total=0;const cumulative=entries.map(t=>{if(this.transfer(t)){if(!Number.isInteger(t.length)||t.length<0||t.length>65536)throw Error('Invalid Transfer TRB length.');total+=t.length;}return total;});
  if(!Number.isSafeInteger(total))throw Error('TD byte count exceeds exact arithmetic.');
  const mbp=maxPacket*(maxBurst+1);
  if(entries.length===1&&['Event Data','No-Op','Link'].includes(entries[0].type))return {maxPacket,maxBurst,mbp,total:0,fragments:[],warnings:[],standalone:entries[0].type+' TD'};
  if(!ends){ends=[];let boundaryBytes=0;for(let index=1;index<entries.length;index++)if(this.transfer(entries[index])&&cumulative[index-1]>boundaryBytes&&cumulative[index-1]%mbp===0){ends.push(index-1);boundaryBytes=cumulative[index-1];}ends.push(entries.length-1);}
  if(!Array.isArray(ends)||!ends.length||ends.at(-1)!==entries.length-1||ends.some((end,i)=>!Number.isInteger(end)||end<0||end>=entries.length||i>0&&end<=ends[i-1]))throw Error('Fragment end indices must partition the complete TD.');
  const fragments=[],warnings=[];let start=0,previousBytes=0;
  for(const end of ends){
   if(!this.transfer(entries[start]))throw Error('Each TD Fragment must start with a Transfer TRB.');
   const payload=cumulative[end]-previousBytes,last=end===entries.length-1;
   if(!last&&(payload===0||payload%mbp))throw Error('Non-final fragment payload must be a positive multiple of MBP.');
   if(start>0&&previousBytes%maxPacket)throw Error('Fragment must start at a TRB packet boundary.');
   let iocCount=0;
   for(let index=start;index<=end;index++){
    const t=entries[index];if(!t.ioc||!(this.transfer(t)||['Event Data','Link'].includes(t.type)))continue;
    iocCount++;const laterTransfer=entries.slice(index+1).some(next=>this.transfer(next));
    if(laterTransfer&&cumulative[index]%maxPacket)throw Error('IOC must be at a TRB packet boundary or follow the last Transfer TRB.');
   }
   if(iocCount>1)throw Error('Only one IOC is allowed per TD Fragment.');
   if(new Set(entries.slice(start,end+1).map(t=>t.segment??0)).size>1)warnings.push('Fragment'+fragments.length+' spans segments; specification recommends avoiding this.');
   fragments.push({start,end,payload,iocCount});start=end+1;previousBytes=cumulative[end];
  }
  return {maxPacket,maxBurst,mbp,total,fragments,warnings};
 }
}
if(typeof module!=='undefined')module.exports=TDFragmentPlan;
