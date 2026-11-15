/* Exact unsigned64 address parsing shared by command and endpoint models. */
const DMAAddress={
 parse(value){try{if(typeof value==='number'&&!Number.isSafeInteger(value))return null;if(!['number','bigint','string'].includes(typeof value)||typeof value==='string'&&!/^(?:0x[0-9a-f]+|[0-9]+)$/i.test(value))return null;const n=BigInt(value);if(n<0n||n>0xffffffffffffffffn)return null;return n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(n):n;}catch{return null;}},
 aligned(value){const n=this.parse(value);return n!==null&&BigInt(n)%16n===0n;},
 stringify(value){return JSON.stringify(value,(_,item)=>typeof item==='bigint'?'0x'+item.toString(16):item);}
};
if(typeof module!=='undefined')module.exports=DMAAddress;
