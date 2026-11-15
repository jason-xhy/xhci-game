const assert=require('node:assert/strict');const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-proxy-server']});try{const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.TEST_URL||'http://127.0.0.1:8731');assert.match(await page.locator('#journey').innerText(),/全局预演/);await page.getByRole('button',{name:'单步预演 Enable Slot →',exact:true}).click();for(let i=0;i<4;i++)await page.getByRole('button',{name:'下一次交接 →',exact:true}).click();assert.match(await page.locator('#journey-status').innerText(),/Slot ID，并推进 ERDP/);await page.getByRole('button',{name:'手动启动控制器',exact:true}).click();for(const name of ['Halt','Reset','Wait for HCRST clear','Wait for CNR clear','Set MaxSlotsEn and DCBAAP','Set CRCR and RCS','Set ERST and ERDP','Run'])await page.locator('#commission').getByRole('button',{name,exact:true}).click();assert.equal(await page.locator('#commission').count(),0);console.log('PASS startup via visible buttons');
for(let stage=0;stage<14;stage++){
 if(stage===7){await page.waitForFunction(()=>document.getElementById('task').textContent.includes('Repair'));await page.keyboard.press('KeyF');assert.match(await page.locator('#message').textContent(),/不是卡住的消费头/);await page.keyboard.press('KeyO');await page.keyboard.press('KeyF');}
 if([2,5,7,10,12].includes(stage)){
  await page.waitForFunction(()=>document.getElementById('rings').textContent.includes('IRQ pending'),{},{timeout:15000});
  await page.keyboard.press('KeyH');
 } else {
  await page.keyboard.press('KeyG');
  await page.waitForFunction(()=>document.getElementById('message').textContent.includes('At the station.'),{},{timeout:45000});
  await page.keyboard.press('KeyE');
  if([1,4,6,9,11].includes(stage)){
   assert.match(await page.locator('#rings').textContent(),/: queued/);
   assert.match(await page.locator('#rings .trb-changed').allTextContents().then(v=>v.join(' ')),/ENQ/);
   await page.keyboard.press('KeyB');
  }
 }
 console.log('stage',stage+1,'operated');
}
assert.match(await page.locator('#overlay h3').innerText(),/SHIFT COMPLETE/);assert.match(await page.locator('#overlay p').first().innerText(),/5 completion events/);assert.match(await page.locator('#journey').innerText(),/全链路复盘/);
await page.getByRole('button',{name:'直接读完成事件',exact:true}).click();
assert.match(await page.locator('#journey-status').innerText(),/再试一次/);
for(const answer of ['写 Doorbell 0','读 Command Completion，取得 Slot ID，并推进 ERDP','EP0 Transfer Ring → slot/EP0 门铃 → Transfer Event','选中 Transfer Ring 的 DEQ 条目，发布 C=CCS 后重写 EP0 门铃']){
 await page.locator('#journey').getByRole('button',{name:answer,exact:true}).click();
 assert.match(await page.locator('#journey-status').innerText(),/正确/);
 await page.getByRole('button',{name:'继续 →',exact:true}).click();
}
assert.match(await page.locator('#journey').innerText(),/复盘完成/);
assert.deepEqual(errors,[]);await page.getByRole('button',{name:'START A NEW SHIFT',exact:true}).click();assert.equal(await page.locator('#commission').count(),1);console.log('PASS complete FirstShift14 interactions, Cycle repair,5 completions and replay');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
