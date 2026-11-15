/* Independent §4.4 snapshot; pending transfers represent retained DMA ownership. */
class DetachLab {
 constructor(){this.reset();}
 reset(){this.ccs=1;this.csc=0;this.event=false;this.detected=false;this.pending=false;this.disabled=false;this.resources=true;this.transfers=2;this.message='Slot 2 configured; two transfers outstanding.';}
 act(action){
 const reject=m=>this.message='Rejected: '+m;
 if(action==='detach'){if(!this.ccs)return reject('device already detached.');this.ccs=0;this.csc=1;this.event=true;return this.message='Port Status Change Event queued; DMA resources remain owned.';}
 if(action==='detect'){if(!this.event)return reject('no port event.');this.event=false;this.detected=true;return this.message='Port event consumed; CCS=0 confirms detach. Issue Disable Slot.';}
 if(action==='disable'){if(!this.detected||this.pending||this.disabled)return reject('detect detach before issuing one Disable Slot.');this.pending=true;return this.message='Disable Slot 2 submitted; resources still owned until completion.';}
 if(action==='complete'){if(!this.pending)return reject('submit Disable Slot first.');this.pending=false;this.disabled=true;this.transfers=0;return this.message='Disable Slot completed successfully; outstanding work retired in this teaching snapshot.';}
 if(action==='release'){if(!this.disabled)return reject('wait for successful Disable Slot completion before freeing DMA.');if(!this.resources)return reject('resources already released.');this.resources=false;return this.message='Device context and transfer rings released safely. Detach complete.';}
 return reject('unknown action.');
 }
}
if(typeof module!=='undefined')module.exports=DetachLab;
if(typeof document!=='undefined'){
 const lab=new DetachLab(),p=document.createElement('details');p.style='position:fixed;bottom:85px;right:16px;z-index:33;background:#15221f;color:white;padding:12px;max-width:420px';
 p.innerHTML='<summary>§4.4 Device detach laboratory</summary><p>Independent root-port snapshot with Slot 2 and two outstanding transfers. Port event generation assumes an enabled transition. Transfer retirement is abstracted; individual transfer events are not modeled.</p>';
 const out=document.createElement('p');out.setAttribute('aria-live','polite');const render=()=>out.textContent=lab.message+' CCS='+lab.ccs+' CSC='+lab.csc+' outstanding='+lab.transfers+' DMA retained='+lab.resources;
 for(const [label,action] of [['Unplug device','detach'],['Consume port event','detect'],['Submit Disable Slot','disable'],['Collect Disable Slot completion','complete'],['Free DMA resources','release'],['Reset detach laboratory','reset']]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{action==='reset'?lab.reset():lab.act(action);render();};p.append(b);}
 p.append(out);p.addEventListener('pointerdown',e=>e.stopPropagation());document.body.append(p);render();
}
