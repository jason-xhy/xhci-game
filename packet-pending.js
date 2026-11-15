/* xHCI §4.14; USB3.2 ACK TP and DP PP field is DWORD2 bit27. */
class PacketPending{
 static hostErrorAck(){return {...this.decide(),hostError:1,retryDataPacket:1,heRetryFieldDW1:0x8040};}
 static decide({direction='IN',ringExhausted=false,tdEnd=false,isoch=false,maxExitLatencyUS=0,override=null}={}){
  if(!['IN','OUT'].includes(direction)||typeof ringExhausted!=='boolean'||typeof tdEnd!=='boolean'||typeof isoch!=='boolean'||!Number.isInteger(maxExitLatencyUS)||maxExitLatencyUS<0||maxExitLatencyUS>65535||override!==null&&![0,1].includes(override))throw Error('Valid SS packet direction/boundary/MEL/PP fields required.');
  const recommendedClear=ringExhausted||isoch&&tdEnd&&maxExitLatencyUS>0;
  if(!recommendedClear&&override===0)throw Error('PP0 violates SHALL set1 outside recommended-clear boundaries.');
  const pp=override??Number(!recommendedClear);
  return {carrier:direction==='IN'?'Host ACK TP':'Host DP',pp,ppFieldDW2:(pp*0x08000000)>>>0,rule:recommendedClear?'SHOULD clear0':'SHALL set1',recommendationSatisfied:!recommendedClear||pp===0,reason:ringExhausted?'Transfer Ring exhausted':isoch&&tdEnd&&maxExitLatencyUS>0?'MEL-enabled Isoch TD end':'More packet work',ringExhausted,tdEnd};
 }
}
if(typeof module!=='undefined')module.exports=PacketPending;
