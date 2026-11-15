/* Run with NODE_PATH pointing at a Playwright installation, or PLAYWRIGHT_MODULE. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-proxy-server']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:8731',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Chapter 4 laboratories',exact:true}).click();
  const drawer=page.getByRole('navigation',{name:'Chapter 4 laboratories'});
  const summaries=drawer.locator('summary');assert.ok(await summaries.count()>=20);
  for(let i=0;i<await summaries.count();i++){await summaries.nth(i).click();await page.waitForTimeout(30);assert.equal(await drawer.locator('details[open]').count(),1);}
  const panel=async title=>{const p=drawer.locator('details').filter({has:page.getByText(title,{exact:true})});if(!await p.evaluate(el=>el.open))await p.locator('summary').click();return p;};
  const click=async(p,name)=>p.getByRole('button',{name,exact:true}).click();
  const command=await panel('§4.6 Command interface laboratory');
  for(const name of ['Ring command doorbell 0','Publish Enable Slot','Execute next command','Collect command event','Publish Address BSR=0','Execute next command','Collect command event','Publish Configure DCI2','Execute next command','Collect command event','Publish Stop DCI2','Execute next command','Publish 64bit Dequeue DCI2','Execute next command'])await click(command,name);
  assert.match(await command.innerText(),/0xfffffffffffffff0/);
  const control=await panel('§4.11 Control transfer laboratory');
  for(const name of ['Prepare configuration','Ring control endpoint','Execute control stage','Device Status Busy','Advance control timeout 5s','Stop timed-out control','Complete timeout Stop','Collect timeout Stop event','Collect timeout Stop event','Discard timed-out stages','Prepare configuration','Ring control endpoint','Execute control stage','Execute control stage'])await click(control,name);
  assert.match(await control.innerText(),/USB configured=true/);
  const alt=await panel('§4.3.6 Alternate interface laboratory');
  for(const name of ['Stop affected endpoint','Collect Stop completion','Free old ring and clear context','Allocate new ring and context','Submit Configure Endpoint','Collect Configure completion','Inject SET_INTERFACE failure','Submit SET_INTERFACE(0,1)','Collect control completion','Reset alternate EP0','Complete alternate EP0 reset','Submit SET_INTERFACE(0,1)','Collect control completion','Try alternate transfer'])await click(alt,name);
  assert.match(await alt.innerText(),/Transfer permitted/);
  await page.setViewportSize({width:390,height:844});
  assert.equal(await drawer.locator('section').evaluate(el=>el.getBoundingClientRect().right<=innerWidth),true);
  for(let i=0;i<await summaries.count();i++){await summaries.nth(i).click();assert.equal(await drawer.locator('section').evaluate(el=>el.scrollWidth<=el.clientWidth),true,'narrow laboratory content overflow at '+i);}
  await page.getByRole('button',{name:'Chapter 4 laboratories',exact:true}).click();
  assert.equal(await drawer.locator('section').isVisible(),false);
  assert.deepEqual(errors,[]);console.log('PASS browser: all laboratory navigation, command64bit, control timeout, alternate STALL recovery, narrow drawer, no page errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
