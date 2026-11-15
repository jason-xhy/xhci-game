/* USB3.2r1.1 §8.5.6.2; xHCI §6.4.3.13 BELT occupies Control27:16. */
const BELTTRB=typeof module!=='undefined'?require('./trb-codec.js'):TRBCodec;
class BELTCodec{
 static multipliers=[null,1024,32768,1048576];
 static decode(raw){if(!Number.isInteger(raw)||raw<0||raw>4095)throw Error('BELT must be12 bits.');const scale=raw>>>10,value=raw&1023;if(scale===0)throw Error('BELT LatencyScale00 is reserved.');const multiplier=this.multipliers[scale],nanoseconds=value*multiplier;return {raw,value,scale,multiplier,nanoseconds,deviceMinimumSatisfied:nanoseconds>=1000000};}
 static encode(value,scale){if(!Number.isInteger(value)||value<0||value>1023||!Number.isInteger(scale)||scale<1||scale>3)throw Error('BELT Value0..1023 and Scale1..3 required.');return (scale<<10)|value;}
 static compare(a,b){return Math.sign(this.decode(a).nanoseconds-this.decode(b).nanoseconds);}
 static notification(raw){this.decode(raw);return ((raw<<8)|0x26)>>>0;}
 static parseNotification(dword1){if(!Number.isInteger(dword1)||dword1<0||dword1>0xffffffff||(dword1&15)!==6||((dword1>>>4)&15)!==2||dword1>>>20)throw Error('Valid LTM DEV_NOTIFICATION Dword1 (subtype6/type2, reserved0) required.');return this.decode((dword1>>>8)&4095);}
 static notificationEvent(raw,slot=1,cycle=1){this.decode(raw);return BELTTRB.event({type:38,pointer:(BigInt(raw)<<8n)|32n,code:1,slot,cycle});}
 static command(raw,cycle=1){this.decode(raw);if(![0,1].includes(cycle))throw Error('Cycle0/1 required.');return BELTTRB.words(0,0,((raw<<16)|(20<<10)|cycle)>>>0);}
}
if(typeof module!=='undefined')module.exports=BELTCodec;
