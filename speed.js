/* Independent §4.3.7 Slot Context / split-token teaching snapshot. */
function checkSpeedContext(speed,root,c,hub){
 if(!['Low','Full','High'].includes(speed))return 'Rejected: choose a modeled USB2 speed.';
 if(root||speed==='High')return c.parent===0&&c.port===0&&c.mtt===0?'Success: direct transaction; TT fields cleared.':'Rejected: clear Parent Hub Slot ID, Parent Port and MTT for root/high-speed devices.';
 if(c.parent!==2||c.port!==3||c.mtt!==hub.mtt)return 'Rejected: topology requires parent slot 2, downstream port 3 and matching MTT.';
 if(!hub.isHub)return 'Parameter Error: offending TD targets a slot with Hub=0.';
 return 'Success: split token targets hub address 9, port 3; parent Slot ID resolved through hub context.';
}
if(typeof module!=='undefined')module.exports=checkSpeedContext;
if(typeof document!=='undefined'){
 const p=document.createElement('details');p.style='position:fixed;top:45px;right:16px;z-index:31;background:#15221f;color:white;padding:12px;max-width:440px;max-height:70vh;overflow:auto';
 p.innerHTML='<summary>§4.3.7 Speed / TT laboratory</summary><p>Independent snapshot: High-speed hub slot 2, address 9, downstream port 3. Edit the child Slot Context, then submit a teaching TD.</p>';
 const fields={};for(const [name,values] of Object.entries({Speed:['Full','Low','High'],Attachment:['Hub','Root'],Parent:['0','2'],Port:['0','3'],MTT:['0','1'],HubFlag:['1','0'],HubMTT:['0','1']})){const label=document.createElement('label');label.textContent=name+' ';const s=document.createElement('select');for(const v of values){const o=document.createElement('option');o.textContent=v;s.append(o)}label.append(s);p.append(label,document.createElement('br'));fields[name]=s;}
 const b=document.createElement('button');b.textContent='Submit speed test TD';const out=document.createElement('p');out.setAttribute('aria-live','polite');b.onclick=()=>out.textContent=checkSpeedContext(fields.Speed.value,fields.Attachment.value==='Root',{parent:+fields.Parent.value,port:+fields.Port.value,mtt:+fields.MTT.value},{isHub:fields.HubFlag.value==='1',mtt:+fields.HubMTT.value});p.append(b,out);p.addEventListener('pointerdown',e=>e.stopPropagation());document.body.append(p);
}
